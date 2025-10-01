import db from '../../database.js';
import { getSessionConfig, getPromos } from './settingsStore.js';

/**
 * Main process billing calculation service
 * This calculates detailed billing WITHOUT using IPC (for use during session completion)
 */
export function calculateDetailedBillingSync(session) {
    try {
        // Get session configuration directly from database
        const sessionConfig = getSessionConfig();
        const promos = getPromos();
        
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
            timeOut = timeIn;
            elapsedSeconds = 0;
            elapsedHours = 0;
        } else if (session.status?.toLowerCase() === 'pending') {
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
        
        if (session.status?.toLowerCase() === 'cancelled') {
            billableSeconds = 0;
            billableHours = 0;
            isBelowMinimum = false;
        } else {
            billableSeconds = Math.max(elapsedSeconds - (gracePeriod * 60), 0);
            billableHours = (billableSeconds / 3600).toFixed(2);
            isBelowMinimum = billableSeconds < (minimumBillableSession * 60);
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

        // Apply time rounding (fixed blocks)
        if (timeRounding > 0) {
            const billableMinutes = Math.ceil((billableSeconds / 60) / timeRounding) * timeRounding;
            billableSeconds = billableMinutes * 60;
        }

        // Calculate base amount
        let baseAmount = 0;
        if (session.rate_unit === 'hr') {
            baseAmount = (billableSeconds / 3600) * (session.rate_amount || 0);
        } else if (session.rate_unit === 'day') {
            baseAmount = Math.ceil(billableSeconds / 86400) * (session.rate_amount || 0);
        }

        // Calculate discounts using the SAME logic as calculateBillSync for consistency
        // This ensures the snapshot matches what was actually charged
        
        let totalDiscountPercentage = 0;
        let memberDiscount = {
            type: session.benefits_type,
            value: session.value || 0,
            amount: 0
        };
        
        // Handle fixed discount separately
        let fixedDiscountAmount = 0;
        if (session.benefits_type === 'fixed' && session.value > 0) {
            fixedDiscountAmount = session.value;
            memberDiscount.amount = session.value;
        } else if (session.benefits_type === 'percentage' && session.value > 0) {
            totalDiscountPercentage = session.value;
        }

        // Calculate promo discounts - ADD percentages together (matching original logic)
        let promoDiscounts = [];
        
        if (enablePromos && promos && promos.length > 0) {
            const applicablePromos = filterApplicablePromos(session.time_in, promos);
            promoDiscounts = applicablePromos.map(promo => {
                totalDiscountPercentage += promo.value;
                return {
                    name: promo.name,
                    type: promo.promo_type,
                    value: promo.value,
                    amount: 0 // Will be calculated below
                };
            });
        }

        // Apply combined percentage discount (matching calculateBillSync logic)
        let amountAfterFixed = baseAmount - fixedDiscountAmount;
        let percentageDiscountAmount = 0;
        
        if (totalDiscountPercentage > 0) {
            percentageDiscountAmount = amountAfterFixed * (totalDiscountPercentage / 100);
        }
        
        // Calculate individual discount amounts for display
        if (session.benefits_type === 'percentage' && session.value > 0) {
            memberDiscount.amount = baseAmount * (session.value / 100);
        }
        
        // Calculate promo amounts proportionally
        let totalPromoDiscount = 0;
        if (promoDiscounts.length > 0 && totalDiscountPercentage > 0) {
            const promoPercentageTotal = promoDiscounts.reduce((sum, p) => sum + p.value, 0);
            promoDiscounts = promoDiscounts.map(promo => {
                // Calculate proportional amount based on base amount
                const promoAmount = baseAmount * (promo.value / 100);
                totalPromoDiscount += promoAmount;
                return {
                    ...promo,
                    amount: promoAmount
                };
            });
        }

        let finalAmount = amountAfterFixed - percentageDiscountAmount;
        const totalDiscount = fixedDiscountAmount + percentageDiscountAmount;
        
        // Override final amount for cancelled sessions
        if (session.status?.toLowerCase() === 'cancelled') {
            finalAmount = 0;
        }

        // Create detailed breakdown
        const breakdown = [
            { label: "Elapsed Time", value: formatDuration(elapsedSeconds), type: "info" },
            { label: "Grace Period", value: `${gracePeriod} minutes`, type: "info" },
            { label: "Billable Time", value: formatDuration(billableSeconds), type: "info" },
            { label: "Rate", value: `₱${session.rate_amount || 0}/${session.rate_unit || 'hr'}`, type: "info" },
            { label: "Base Amount", value: `₱${baseAmount.toFixed(2)}`, type: "base" }
        ];

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
                formatted: `₱${session.rate_amount || 0}/${session.rate_unit || 'hr'}`
            },
            baseAmount: baseAmount,
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
