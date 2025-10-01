import { ipcHandle } from "../../../ipc/ipcHandler.js";

/**
 * Captures a billing snapshot for a completed session
 * This ensures historical receipts remain accurate even if rates/discounts change
 */
export async function captureBillingSnapshot(sessionId, billingBreakdown, sessionData) {
    try {
        const snapshot = {
            timestamp: new Date().toISOString(),
            version: "1.0", // For future compatibility
            
            // Core billing data
            elapsedTime: billingBreakdown.elapsedTime,
            billableTime: billingBreakdown.billableTime,
            gracePeriod: billingBreakdown.gracePeriod,
            minimumSession: billingBreakdown.minimumSession,
            
            // Rate information at time of transaction
            rateInfo: {
                amount: billingBreakdown.rateInfo.amount,
                unit: billingBreakdown.rateInfo.unit,
                formatted: billingBreakdown.rateInfo.formatted
            },
            
            // Billing calculations
            baseAmount: billingBreakdown.baseAmount,
            memberDiscount: billingBreakdown.memberDiscount,
            promoDiscounts: billingBreakdown.promoDiscounts,
            totalDiscount: billingBreakdown.totalDiscount,
            finalAmount: billingBreakdown.finalAmount,
            
            // Session profile snapshot (what was used at time of transaction)
            sessionProfileSnapshot: {
                id: sessionData.session_profile_id,
                name: sessionData.session_profile_name,
                rate_amount: sessionData.rate_amount,
                rate_unit: sessionData.rate_unit
            },
            
            // Member role snapshot (what was used at time of transaction)
            memberRoleSnapshot: {
                id: sessionData.account_role_id,
                name: sessionData.role_name,
                benefits_type: sessionData.benefits_type,
                value: sessionData.value
            },
            
            // Applied promos snapshot
            promosSnapshot: billingBreakdown.promoDiscounts.map(promo => ({
                name: promo.name,
                type: promo.type,
                value: promo.value,
                amount: promo.amount
            })),
            
            // Session configuration at time of transaction
            configSnapshot: await captureSessionConfig(),
            
            // Complete breakdown for receipt display
            breakdown: billingBreakdown.breakdown
        };
        
        // Store the snapshot in the database
        await ipcHandle("saveBillingSnapshot", {
            sessionId: sessionId,
            billingSnapshot: JSON.stringify(snapshot),
            originalRateAmount: billingBreakdown.rateInfo.amount,
            originalRateUnit: billingBreakdown.rateInfo.unit,
            appliedDiscounts: JSON.stringify({
                memberDiscount: billingBreakdown.memberDiscount,
                promoDiscounts: billingBreakdown.promoDiscounts,
                totalDiscount: billingBreakdown.totalDiscount
            }),
            finalCalculatedAmount: billingBreakdown.finalAmount,
            snapshotCreatedAt: new Date().toISOString()
        });
        
        console.log(`Billing snapshot captured for session ${sessionId}`);
        return snapshot;
        
    } catch (error) {
        console.error("Error capturing billing snapshot:", error);
        throw error;
    }
}

/**
 * Retrieves a stored billing snapshot for a session
 */
export async function getBillingSnapshot(sessionId) {
    try {
        const snapshotData = await ipcHandle("getBillingSnapshot", sessionId);
        
        if (!snapshotData || !snapshotData.billing_snapshot) {
            return null;
        }
        
        return JSON.parse(snapshotData.billing_snapshot);
        
    } catch (error) {
        console.error("Error retrieving billing snapshot:", error);
        return null;
    }
}

/**
 * Captures the current session configuration for the snapshot
 */
async function captureSessionConfig() {
    try {
        const sessionConfig = await ipcHandle("getSessionConfig");
        const config = sessionConfig[0];
        
        return {
            grace_period: config.grace_period || 0,
            minimum_billable_session: config.minimum_billable_session || 0,
            time_rounding: config.time_rounding || 0,
            enable_promos: config.enable_promos || false
        };
        
    } catch (error) {
        console.error("Error capturing session config:", error);
        return {
            grace_period: 0,
            minimum_billable_session: 0,
            time_rounding: 0,
            enable_promos: false
        };
    }
}

/**
 * Checks if a session has a billing snapshot
 */
export async function hasBillingSnapshot(sessionId) {
    try {
        const snapshot = await getBillingSnapshot(sessionId);
        return snapshot !== null;
    } catch (error) {
        console.error("Error checking billing snapshot:", error);
        return false;
    }
}

/**
 * Creates a billing snapshot for legacy completed sessions that don't have one
 * This is for backward compatibility
 */
export async function createLegacySnapshot(sessionData, billingBreakdown) {
    try {
        const legacySnapshot = {
            timestamp: new Date().toISOString(),
            version: "1.0-legacy",
            isLegacy: true,
            
            // Use the calculated breakdown (may not be 100% accurate to original)
            elapsedTime: billingBreakdown.elapsedTime,
            billableTime: billingBreakdown.billableTime,
            gracePeriod: billingBreakdown.gracePeriod,
            minimumSession: billingBreakdown.minimumSession,
            rateInfo: billingBreakdown.rateInfo,
            baseAmount: billingBreakdown.baseAmount,
            memberDiscount: billingBreakdown.memberDiscount,
            promoDiscounts: billingBreakdown.promoDiscounts,
            totalDiscount: billingBreakdown.totalDiscount,
            finalAmount: billingBreakdown.finalAmount,
            breakdown: billingBreakdown.breakdown,
            
            // Mark as legacy calculation
            note: "This is a legacy snapshot created after the original transaction. Values may not reflect the exact original calculation."
        };
        
        return legacySnapshot;
        
    } catch (error) {
        console.error("Error creating legacy snapshot:", error);
        throw error;
    }
}
