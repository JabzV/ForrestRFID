import db from '../../database.js';
import { now } from '../../src/services/utils.js';
import { calculateBillSync } from './calculatBillService.js';

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
            WHERE time_logs.status = 'pending'
        `;

export function loadActiveSessions() {
    try {
        const action = db.prepare(getQuery + 'ORDER BY time_logs.time_in DESC');
        return action.all();
    } catch (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}



export function createSession(data) {
    try {
        const insertQuery = db.prepare(`
            INSERT INTO time_logs (
                rfid, 
                member_type,
                session_profile_id, 
                time_in, 
                status
            ) VALUES (?, ?, ?, ?, ?)
        `);
        
        const currentTime = now();
        
        const result = insertQuery.run(
            data.rfid,                    // user_id (null for non-members)
            data.member_type,
            data.session_profile_id,   // session_profile_id from form
            currentTime,               // time_in (current time)                       // amount_paid (placeholder, will be calculated later)
            'pending'                  // status
        );
        
        console.log("Session created successfully:", result);
        return result;
        
    } catch (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}

export function endSession(data) {
    try {
        
        // First, get the active session to calculate time difference
        const getSessionQuery = db.prepare(getQuery + 'AND time_logs.rfid = ? ORDER BY time_logs.time_in DESC');
        
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

export function cancelSession(data) {
    try {
        const action = db.prepare('UPDATE time_logs SET status = ? WHERE id = ?');
        return action.run('cancelled', data.id);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}