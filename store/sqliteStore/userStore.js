import db from '../../database.js';

export function getUsers() {
    const action = db.prepare(`
        SELECT 
        users.*,
        COALESCE(users.first_name || ' ' || users.last_name,NULL) AS full_name,
        SUM(time_logs.amount_paid) AS total_paid,
        COUNT(time_logs.rfid) as total_sessions,
        SUM(time_logs.duration) AS total_time
        FROM users
        LEFT JOIN time_logs ON time_logs.rfid = users.rfid
        WHERE users.first_name IS NOT NULL
        GROUP BY users.rfid
        `);
    return action.all();
}

export function getUser(id) {
    const action = db.prepare('SELECT * FROM users WHERE id = ?');
    return action.get(id);
}
    
export function createUser(data) {
    const action = db.prepare('INSERT INTO users (rfid, first_name, last_name, email, contact_number, birthday, gender, account_role_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    return action.run(data.rfid, data.first_name, data.last_name, data.email, data.contact_number, data.birthday, data.gender, data.account_role_id).lastInsertRowid;
}

