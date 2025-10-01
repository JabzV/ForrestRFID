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