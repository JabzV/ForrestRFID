import db from '../../database.js';
import dayjs from 'dayjs';

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

export function getUserByRfid(rfid) {
    const action = db.prepare('SELECT * FROM users WHERE rfid = ?');
    return action.get(rfid);
}

export function checkIfMember(rfid) {
    try {
        const user = getUserByRfid(rfid);
        // A user is a member if they exist in the users table and have a first_name
        return user && user.first_name !== null && user.first_name !== undefined && user.first_name !== '';
    } catch (error) {
        console.error('Error checking if RFID is member:', error);
        return false;
    }
}
    
export function createUser(data) {
    const expiryDate = resolveMembershipExpiryDate(data, true);
    const action = db.prepare(`
        INSERT INTO users (
            rfid,
            first_name,
            last_name,
            email,
            contact_number,
            birthday,
            gender,
            account_role_id,
            membership_expiry_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return action.run(
        data.rfid,
        data.first_name,
        data.last_name,
        data.email,
        data.contact_number,
        data.birthday,
        data.gender,
        data.account_role_id,
        expiryDate
    ).lastInsertRowid;
}

export function updateUser(data) {
    const expiryDate = resolveMembershipExpiryDate(data, false);
    const action = db.prepare(`
        UPDATE users
        SET first_name = ?, last_name = ?, email = ?, contact_number = ?, birthday = ?, gender = ?, account_role_id = ?, membership_expiry_date = ?
        WHERE id = ?
    `);
    return action.run(
        data.first_name,
        data.last_name,
        data.email,
        data.contact_number,
        data.birthday,
        data.gender,
        data.account_role_id,
        expiryDate,
        data.id
    );
}

export function deleteUser(id) {
    // First, update time_logs to set rfid to NULL for this user's rfid
    const user = db.prepare('SELECT rfid FROM users WHERE id = ?').get(id);
    if (user && user.rfid) {
        db.prepare('UPDATE time_logs SET rfid = ? WHERE rfid = ?').run('Deleted User', user.rfid);
    }
    // Then, delete the user
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

function resolveMembershipExpiryDate(data, isCreate) {
    if (!data || !data.account_role_id) {
        return null;
    }

    const role = db
        .prepare('SELECT expiry_months FROM account_roles WHERE id = ?')
        .get(data.account_role_id);
    const expiryMonths = Number(role?.expiry_months) || 0;

    if (expiryMonths <= 0) {
        return null;
    }

    if (data.membership_expiry_date) {
        return data.membership_expiry_date;
    }

    const baseDate = isCreate ? dayjs() : dayjs();
    return baseDate.add(expiryMonths, 'month').format('YYYY-MM-DD');
}

