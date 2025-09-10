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