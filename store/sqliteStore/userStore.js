import db from '../../database.js';

export function getUsers() {
    const action = db.prepare('SELECT * FROM users');
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

