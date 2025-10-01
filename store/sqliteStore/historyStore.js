import db from '../../database.js';

export function getHistory() {
    const action = db.prepare(`
        SELECT 
            time_logs.*, 
            COALESCE(users.first_name || ' ' || users.last_name, 'Non Member') AS full_name
        FROM time_logs
        LEFT JOIN users ON time_logs.rfid = users.rfid
        ORDER BY time_logs.created_at DESC
    `);
    return action.all();
}

export function getSessionDetailsById(sessionId) {
    const action = db.prepare(`
        SELECT 
            time_logs.*,
            COALESCE(users.first_name || ' ' || users.last_name, 'Non Member') AS full_name,
            users.account_role_id,
            session_profiles.name as session_profile_name,
            session_profiles.rate_amount,
            session_profiles.rate_unit,
            account_roles.benefits_type,
            account_roles.value,
            account_roles.name as role_name
        FROM time_logs
        LEFT JOIN users ON time_logs.rfid = users.rfid
        LEFT JOIN session_profiles ON time_logs.session_profile_id = session_profiles.id
        LEFT JOIN account_roles ON users.account_role_id = account_roles.id
        WHERE time_logs.id = ?
    `);
    return action.get(sessionId);
}

export function saveBillingSnapshot(data) {
    try {
        const updateQuery = db.prepare(`
            UPDATE time_logs 
            SET 
                billing_snapshot = ?,
                original_rate_amount = ?,
                original_rate_unit = ?,
                applied_discounts = ?,
                final_calculated_amount = ?,
                snapshot_created_at = ?
            WHERE id = ?
        `);
        
        const result = updateQuery.run(
            data.billingSnapshot,
            data.originalRateAmount,
            data.originalRateUnit,
            data.appliedDiscounts,
            data.finalCalculatedAmount,
            data.snapshotCreatedAt,
            data.sessionId
        );
        
        if (result.changes === 0) {
            throw new Error("Failed to save billing snapshot - session not found");
        }
        
        console.log(`Billing snapshot saved for session ${data.sessionId}`);
        return result;
        
    } catch (error) {
        console.error("Database error saving billing snapshot:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}

export function getBillingSnapshot(sessionId) {
    try {
        const action = db.prepare(`
            SELECT 
                billing_snapshot,
                original_rate_amount,
                original_rate_unit,
                applied_discounts,
                final_calculated_amount,
                snapshot_created_at
            FROM time_logs
            WHERE id = ?
        `);
        
        return action.get(sessionId);
        
    } catch (error) {
        console.error("Database error getting billing snapshot:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}