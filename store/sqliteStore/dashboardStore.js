import db from '../../database.js';
import { now } from '../../src/services/utils.js';
import { calculateBillSync } from './calculatBillService.js';
import { completeSessionWithSnapshot, endSession as legacyEndSession } from './sessionCompletionService.js';

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



export function checkPendingSession(rfid) {
    try {
        const checkQuery = db.prepare(`
            SELECT id, rfid, time_in, status
            FROM time_logs
            WHERE rfid = ? AND status = 'pending' AND deleted_at IS NULL
            LIMIT 1
        `);
        
        const existingSession = checkQuery.get(rfid);
        return existingSession || null;
    } catch (error) {
        console.error("Database error checking pending session:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}

export function createSession(data) {
    try {
        // Check if card already has a pending session
        const existingSession = checkPendingSession(data.rfid);
        if (existingSession) {
            throw new Error('This card is already in use for an active session.');
        }
        
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
        // Use the new session completion service that captures billing snapshots
        return completeSessionWithSnapshot(data);
    } catch (error) {
        console.error("Error ending session with snapshot:", error);
        
        // Fallback to legacy method if snapshot capture fails
        console.log("Falling back to legacy session completion method");
        return legacyEndSession(data);
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