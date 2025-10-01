import db from '../../database.js';
import { now } from '../../src/services/utils.js';
import { calculateBillSync } from './calculatBillService.js';
import { calculateDetailedBillingSync } from './billingCalculationService.js';
import { saveBillingSnapshot } from './historyStore.js';
import { getSessionConfig } from './settingsStore.js';

/**
 * Enhanced session completion service that captures billing snapshots
 * This ensures historical receipts remain accurate even if rates/discounts change
 */
export function completeSessionWithSnapshot(data) {
    try {
        // First, get the active session to calculate time difference
        const getQuery = `
            SELECT 
                time_logs.id,
                time_logs.rfid,
                time_logs.member_type,
                time_logs.time_in,
                time_logs.status,
                time_logs.session_profile_id,
                session_profiles.rate_amount,
                session_profiles.rate_unit,
                session_profiles.name as session_profile_name,
                COALESCE(substr(users.first_name, 1, instr(users.first_name || ' ', ' ') - 1),'Non') || ' ' || COALESCE(users.last_name, 'Member') AS full_name,
                users.account_role_id,
                account_roles.benefits_type,
                account_roles.value,
                account_roles.name as role_name
            FROM time_logs
            LEFT JOIN users ON time_logs.rfid = users.rfid
            LEFT JOIN session_profiles ON time_logs.session_profile_id = session_profiles.id
            LEFT JOIN account_roles ON users.account_role_id = account_roles.id
            WHERE time_logs.status = 'pending' AND time_logs.rfid = ? 
            ORDER BY time_logs.time_in DESC
        `;
        
        const getSessionQuery = db.prepare(getQuery);
        const activeSession = getSessionQuery.get(data.rfid);
        
        if (!activeSession) {
            throw new Error("No active session found for this RFID");
        }
        
        const currentTime = now();
        const timeOut = new Date(currentTime);
        const timeIn = new Date(activeSession.time_in);
        
        // Calculate elapsed time in seconds using the service
        const elapsed = Number((timeOut - timeIn) / 1000);
        const duration = Number((elapsed / 3600).toFixed(2)); // Convert to hours
        
        // Prepare session object for bill calculation (using existing service for consistency)
        const sessionForBilling = {
            elapsed: elapsed,
            rate_unit: activeSession.rate_unit,
            rate_amount: activeSession.rate_amount,
            time_in: activeSession.time_in,
            benefits_type: activeSession.benefits_type,
            value: activeSession.value
        };
        
        const billingData = calculateBillSync(sessionForBilling);
        const amountPaid = billingData[0].currentBill;
        const billableSession = billingData[0].billableSession;

        // Update the session with calculated amount
        const updateQuery = db.prepare(`
            UPDATE time_logs SET time_out = ?, status = ?, amount_paid = ?, duration = ?, billable_session = ? WHERE id = ?
        `);
            
        console.log("Completing session:", activeSession.id);
        console.log("Time Out:", timeOut);
        console.log("Duration:", duration);
        console.log("Amount Paid:", amountPaid);
        console.log("Billable Session:", billableSession);
        
        const result = updateQuery.run(
            currentTime, 
            'completed', 
            parseFloat(amountPaid), 
            parseFloat(duration), 
            parseFloat(billableSession), 
            activeSession.id
        );
        
        if (result.changes === 0) {
            throw new Error("Failed to update session");
        }
        
        // Now capture the billing snapshot for this completed session
        try {
            captureSessionBillingSnapshot(activeSession.id, activeSession, {
                elapsed: elapsed,
                duration: duration,
                amountPaid: amountPaid,
                billableSession: billableSession,
                timeOut: currentTime
            });
        } catch (snapshotError) {
            console.error("Failed to capture billing snapshot:", snapshotError);
            // Don't fail the session completion if snapshot capture fails
            // The session is still completed, just without the snapshot
        }
        
        console.log("Session completed successfully with snapshot:", result);
        return {
            ...result,
            sessionId: activeSession.id,
            duration: duration,
            amountPaid: amountPaid,
            rate: `₱${activeSession.rate_amount}/${activeSession.rate_unit}`
        };
        
    } catch (error) {
        console.error("Database error completing session:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}

/**
 * Captures billing snapshot for a completed session
 */
function captureSessionBillingSnapshot(sessionId, sessionData, calculationResults) {
    try {
        // Prepare session data for billing calculation
        const tempSessionData = {
            ...sessionData,
            status: 'completed',
            time_out: calculationResults.timeOut,
            amount_paid: calculationResults.amountPaid,
            duration: calculationResults.duration,
            billable_session: calculationResults.billableSession
        };
        
        // Calculate detailed billing breakdown (sync, no IPC needed)
        const billingBreakdown = calculateDetailedBillingSync(tempSessionData);
        
        // Capture session config snapshot
        const sessionConfig = getSessionConfig();
        const config = sessionConfig[0];
        
        // Create the complete snapshot
        const snapshot = {
            timestamp: new Date().toISOString(),
            version: "1.0",
            
            // Core billing data
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
            
            // Session profile snapshot
            sessionProfileSnapshot: {
                id: sessionData.session_profile_id,
                name: sessionData.session_profile_name,
                rate_amount: sessionData.rate_amount,
                rate_unit: sessionData.rate_unit
            },
            
            // Member role snapshot
            memberRoleSnapshot: {
                id: sessionData.account_role_id,
                name: sessionData.role_name,
                benefits_type: sessionData.benefits_type,
                value: sessionData.value
            },
            
            // Promos snapshot
            promosSnapshot: billingBreakdown.promoDiscounts.map(promo => ({
                name: promo.name,
                type: promo.type,
                value: promo.value,
                amount: promo.amount
            })),
            
            // Config snapshot
            configSnapshot: {
                grace_period: config.grace_period || 0,
                minimum_billable_session: config.minimum_billable_session || 0,
                time_rounding: config.time_rounding || 0,
                enable_promos: config.enable_promos || false
            },
            
            // Complete breakdown
            breakdown: billingBreakdown.breakdown
        };
        
        // Save the snapshot to database
        saveBillingSnapshot({
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
        
        console.log(`Billing snapshot captured for completed session ${sessionId}`);
        
    } catch (error) {
        console.error("Error capturing billing snapshot:", error);
        throw error;
    }
}

/**
 * Legacy function for backward compatibility
 * This will be gradually replaced by completeSessionWithSnapshot
 */
export function endSession(data) {
    try {
        const getQuery = `
            SELECT 
                time_logs.id,
                time_logs.rfid,
                time_logs.member_type,
                time_logs.time_in,
                time_logs.status,
                time_logs.session_profile_id,
                session_profiles.rate_amount,
                session_profiles.rate_unit,
                COALESCE(substr(users.first_name, 1, instr(users.first_name || ' ', ' ') - 1),'Non') || ' ' || COALESCE(users.last_name, 'Member') AS full_name,
                users.account_role_id,
                account_roles.benefits_type,
                account_roles.value
            FROM time_logs
            LEFT JOIN users ON time_logs.rfid = users.rfid
            LEFT JOIN session_profiles ON time_logs.session_profile_id = session_profiles.id
            LEFT JOIN account_roles ON users.account_role_id = account_roles.id
            WHERE time_logs.status = 'pending' AND time_logs.rfid = ? 
            ORDER BY time_logs.time_in DESC
        `;
        
        // First, get the active session to calculate time difference
        const getSessionQuery = db.prepare(getQuery);
        
        const activeSession = getSessionQuery.get(data.rfid);
        
        if (!activeSession) {
            throw new Error("No active session found for this RFID");
        }
        
        const currentTime = now();
        const timeOut = new Date(currentTime);
        const timeIn = new Date(activeSession.time_in);
        
        // Calculate elapsed time in seconds using the service
        const elapsed = Number((timeOut - timeIn) / 1000);
        const duration = Number((elapsed / 3600).toFixed(2)); // Convert to hours
        
        // Prepare session object for bill calculation
        const sessionForBilling = {
            elapsed: elapsed,
            rate_unit: activeSession.rate_unit,
            rate_amount: activeSession.rate_amount,
            time_in: activeSession.time_in,
            benefits_type: activeSession.benefits_type,
            value: activeSession.value
        };
        
        const billingData = calculateBillSync(sessionForBilling);
        const amountPaid = billingData[0].currentBill;
        const billableSession = billingData[0].billableSession;

        // Update the session with calculated amount
        const updateQuery = db.prepare(`
            UPDATE time_logs SET time_out = ?, status = ?, amount_paid = ?, duration = ?, billable_session = ? WHERE id = ?
        `);
            
        console.log("Active Session: " + activeSession);
        console.log("Time Out: " + timeOut);
        console.log("Duration: " + duration);
        console.log("Amount Paid: " + amountPaid);
        console.log("Billable Session: " + billableSession);
        
        const result = updateQuery.run(currentTime, 'completed', parseFloat(amountPaid), parseFloat(duration), parseFloat(billableSession), activeSession.id);
        
        if (result.changes === 0) {
            throw new Error("Failed to update session");
        }
        
        console.log("Session ended successfully:", result);
        return {
            ...result,
            duration: duration,
            amountPaid: amountPaid,
            rate: `₱${activeSession.rate_amount}/${activeSession.rate_unit}`
        };
        
    } catch (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}
