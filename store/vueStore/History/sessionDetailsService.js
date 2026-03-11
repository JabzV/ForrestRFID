import { ipcHandle } from "../../../ipc/ipcHandler.js";
import { getBillingSnapshot, createLegacySnapshot } from "./billingSnapshotService.js";

const RATE_UNIT_SECONDS = {
    hr: 3600,
    day: 86400,
    week: 7 * 86400,
    month: 30 * 86400
};

function getRateUnitSeconds(rateUnit) {
    return RATE_UNIT_SECONDS[rateUnit] || 0;
}

function calculateBaseAmount(billableSeconds, rateAmount, rateUnit, rateValue) {
    const amount = Number(rateAmount) || 0;
    if (amount <= 0) {
        return 0;
    }

    const unitSeconds = getRateUnitSeconds(rateUnit);
    const value = Math.max(1, Number(rateValue) || 1);
    if (unitSeconds <= 0) {
        return 0;
    }

    if (rateUnit === 'hr' && value === 1) {
        return (billableSeconds / 3600) * amount;
    }

    return Math.ceil(billableSeconds / (unitSeconds * value)) * amount;
}

function calculateSurcharge(billableSeconds, session) {
    const surchargeAmount = Number(session.surcharge_amount) || 0;
    const surchargeMinutes = Number(session.surcharge_minutes) || 0;

    if (surchargeAmount <= 0 || surchargeMinutes <= 0) {
        return 0;
    }

    const unitSeconds = getRateUnitSeconds(session.rate_unit);
    const value = Math.max(1, Number(session.rate_value) || 1);
    if (unitSeconds <= 0) {
        return 0;
    }

    const baseUnitSeconds = unitSeconds * value;
    if (billableSeconds <= baseUnitSeconds) {
        return 0;
    }

    const extraSeconds = billableSeconds - baseUnitSeconds;
    const intervalSeconds = surchargeMinutes * 60;
    const surchargeCount = Math.ceil(extraSeconds / intervalSeconds);
    return surchargeCount * surchargeAmount;
}

export async function getSessionDetails(sessionId) {
    try {
        // Get the complete session data with all related information
        const sessionData = await ipcHandle("getSessionDetails", sessionId);
        
        if (!sessionData) {
            throw new Error("Session not found");
        }

        // For completed sessions, try to use stored billing snapshot first
        if (sessionData.status === 'completed') {
            const storedSnapshot = await getBillingSnapshot(sessionId);
            
            if (storedSnapshot) {
                console.log(`Using stored billing snapshot for completed session ${sessionId}`);
                return {
                    ...sessionData,
                    billingBreakdown: storedSnapshot
                };
            } else {
                // No snapshot exists - this is a legacy completed session
                console.log(`No snapshot found for completed session ${sessionId}, creating legacy snapshot`);
                const calculatedBreakdown = await calculateDetailedBilling(sessionData);
                const legacySnapshot = await createLegacySnapshot(sessionData, calculatedBreakdown);
                
                return {
                    ...sessionData,
                    billingBreakdown: legacySnapshot
                };
            }
        }

        // For pending/cancelled sessions, calculate in real-time
        const billingBreakdown = await calculateDetailedBilling(sessionData);
        
        return {
            ...sessionData,
            billingBreakdown
        };
    } catch (error) {
        console.error("Error getting session details:", error);
        throw error;
    }
}

async function calculateDetailedBilling(session) {
    try {
        // Get session configuration
        const sessionConfig = await ipcHandle("getSessionConfig");
        const promos = await ipcHandle("getPromos");
        
        const config = sessionConfig[0];
        const gracePeriod = config.grace_period || 0;
        const minimumBillableSession = config.minimum_billable_session || 0;
        const timeRounding = config.time_rounding || 0;
        const enablePromos = config.enable_promos || false;

        // Calculate elapsed time
        const timeIn = new Date(session.time_in);
        let timeOut, elapsedSeconds, elapsedHours;
        
        // Handle different session states
        if (session.status?.toLowerCase() === 'cancelled') {
            // For cancelled sessions, use time_in as both start and end
            timeOut = timeIn;
            elapsedSeconds = 0;
            elapsedHours = 0;
        } else if (session.status?.toLowerCase() === 'pending') {
            // For pending sessions, calculate current elapsed time
            timeOut = new Date();
            elapsedSeconds = Math.round((timeOut - timeIn) / 1000);
            elapsedHours = (elapsedSeconds / 3600).toFixed(2);
        } else {
            // For completed sessions, use actual time_out
            timeOut = session.time_out ? new Date(session.time_out) : new Date();
            elapsedSeconds = Math.round((timeOut - timeIn) / 1000);
            elapsedHours = (elapsedSeconds / 3600).toFixed(2);
        }

        // Calculate billable session
        let billableSeconds, billableHours, isBelowMinimum;
        const chargeImmediately = Number(session.charge_immediately) === 1;
        
        if (session.status?.toLowerCase() === 'cancelled') {
            // Cancelled sessions have no billable time
            billableSeconds = 0;
            billableHours = 0;
            isBelowMinimum = false; // Don't apply minimum for cancelled sessions
        } else {
            billableSeconds = Math.max(elapsedSeconds - (gracePeriod * 60), 0);
            billableHours = (billableSeconds / 3600).toFixed(2);
            isBelowMinimum = !chargeImmediately && billableSeconds < (minimumBillableSession * 60);
        }
        
        if (isBelowMinimum) {
            return {
                elapsedTime: {
                    seconds: elapsedSeconds,
                    hours: elapsedHours,
                    formatted: formatDuration(elapsedSeconds)
                },
                billableTime: {
                    seconds: 0,
                    hours: 0,
                    formatted: "0m"
                },
                gracePeriod: {
                    minutes: gracePeriod,
                    applied: gracePeriod > 0
                },
                minimumSession: {
                    minutes: minimumBillableSession,
                    belowMinimum: true
                },
                rateInfo: {
                    amount: session.rate_amount || 0,
                    unit: session.rate_unit || 'hr',
                    formatted: `₱${session.rate_amount || 0}/${session.rate_unit || 'hr'}`
                },
                baseAmount: 0,
                memberDiscount: {
                    type: null,
                    value: 0,
                    amount: 0
                },
                promoDiscounts: [],
                totalDiscount: 0,
                finalAmount: 0,
                breakdown: [
                    { label: "Base Amount", value: "₱0.00", type: "base" },
                    { label: "Below Minimum Session", value: "No Charge", type: "info" }
                ]
            };
        }

        // Apply time rounding
        if (!chargeImmediately && timeRounding > 0) {
            const billableMinutes = Math.round((billableSeconds / 60) / timeRounding) * timeRounding;
            billableSeconds = billableMinutes * 60;
        }

        // Calculate base amount
        let baseAmount = 0;
        let surchargeAmount = 0;
        if (chargeImmediately) {
            baseAmount = Number(session.rate_amount) || 0;
        } else {
            baseAmount = calculateBaseAmount(
                billableSeconds,
                session.rate_amount,
                session.rate_unit,
                session.rate_value
            );
            surchargeAmount = calculateSurcharge(billableSeconds, session);
        }
        const subtotalAmount = baseAmount + surchargeAmount;

        // Calculate member discount
        let memberDiscount = {
            type: session.benefits_type,
            value: session.value || 0,
            amount: 0
        };

        let discountedAmount = subtotalAmount;
        if (session.benefits_type === 'percentage' && session.value > 0) {
            memberDiscount.amount = (subtotalAmount * (session.value / 100));
            discountedAmount = subtotalAmount - memberDiscount.amount;
        } else if (session.benefits_type === 'fixed' && session.value > 0) {
            memberDiscount.amount = session.value;
            discountedAmount = Math.max(subtotalAmount - session.value, 0);
        }

        // Calculate promo discounts
        let promoDiscounts = [];
        let totalPromoDiscount = 0;
        
        if (enablePromos && promos && promos.length > 0) {
            const applicablePromos = filterApplicablePromos(session.time_in, promos);
            promoDiscounts = applicablePromos.map(promo => {
                const promoAmount = (discountedAmount * (promo.value / 100));
                totalPromoDiscount += promoAmount;
                return {
                    name: promo.name,
                    type: promo.promo_type,
                    value: promo.value,
                    amount: promoAmount
                };
            });
        }

        let finalAmount = Math.max(discountedAmount - totalPromoDiscount, 0);
        const totalDiscount = memberDiscount.amount + totalPromoDiscount;
        
        // Override final amount for cancelled sessions
        if (session.status?.toLowerCase() === 'cancelled') {
            finalAmount = 0;
        }

        // Create detailed breakdown
        const breakdown = [
            { label: "Elapsed Time", value: formatDuration(elapsedSeconds), type: "info" },
            { label: "Grace Period", value: `${gracePeriod} minutes`, type: "info" },
            { label: "Billable Time", value: formatDuration(billableSeconds), type: "info" },
            { label: "Rate", value: `₱${session.rate_amount || 0}/${session.rate_value || 1} ${session.rate_unit || 'hr'}`, type: "info" },
            { label: "Base Amount", value: `₱${baseAmount.toFixed(2)}`, type: "base" }
        ];

        if (chargeImmediately) {
            breakdown.push({
                label: "Charge Immediately",
                value: "Yes",
                type: "info"
            });
        }

        if (surchargeAmount > 0) {
            breakdown.push({
                label: "Surcharge",
                value: `+₱${surchargeAmount.toFixed(2)}`,
                type: "base"
            });
        }

        if (memberDiscount.amount > 0) {
            breakdown.push({
                label: `Member Discount (${memberDiscount.type === 'percentage' ? memberDiscount.value + '%' : '₱' + memberDiscount.value})`,
                value: `-₱${memberDiscount.amount.toFixed(2)}`,
                type: "discount"
            });
        }

        promoDiscounts.forEach(promo => {
            breakdown.push({
                label: `${promo.name} (${promo.value}%)`,
                value: `-₱${promo.amount.toFixed(2)}`,
                type: "promo"
            });
        });

        if (totalDiscount > 0) {
            breakdown.push({
                label: "Total Discount",
                value: `-₱${totalDiscount.toFixed(2)}`,
                type: "total-discount"
            });
        }

        breakdown.push({
            label: "Final Amount",
            value: `₱${finalAmount.toFixed(2)}`,
            type: "final"
        });

        return {
            elapsedTime: {
                seconds: elapsedSeconds,
                hours: elapsedHours,
                formatted: formatDuration(elapsedSeconds)
            },
            billableTime: {
                seconds: billableSeconds,
                hours: (billableSeconds / 3600).toFixed(2),
                formatted: formatDuration(billableSeconds)
            },
            gracePeriod: {
                minutes: gracePeriod,
                applied: gracePeriod > 0
            },
            minimumSession: {
                minutes: minimumBillableSession,
                belowMinimum: false
            },
            rateInfo: {
                amount: session.rate_amount || 0,
                unit: session.rate_unit || 'hr',
                value: session.rate_value || 1,
                formatted: `₱${session.rate_amount || 0}/${session.rate_value || 1} ${session.rate_unit || 'hr'}`
            },
            baseAmount: subtotalAmount,
            memberDiscount: memberDiscount,
            promoDiscounts: promoDiscounts,
            totalDiscount: totalDiscount,
            finalAmount: finalAmount,
            breakdown: breakdown
        };

    } catch (error) {
        console.error("Error calculating detailed billing:", error);
        throw error;
    }
}

function filterApplicablePromos(timeInDate, promos) {
    const timeIn = new Date(timeInDate);
    return promos.filter(promo => {
        const promoDateFrom = new Date(promo.date_from);
        const promoDateTo = new Date(promo.date_to);
        return timeIn >= promoDateFrom && timeIn <= promoDateTo;
    });
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return "0m";
    }
}
