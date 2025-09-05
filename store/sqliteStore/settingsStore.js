import db from '../../database.js';

//Session Profiles
export function getSessionProfiles() {
    const action = db.prepare('SELECT * FROM session_profiles');
    return action.all();
}

export function getSessionProfile(id) {
    const action = db.prepare('SELECT * FROM session_profiles WHERE id = ?');
    return action.get(id);
}

export function createSessionProfile(data) {
    try {
        const action = db.prepare('INSERT INTO session_profiles (name, rate_amount, rate_unit) VALUES (?, ?, ?)');
        return action.run(data.name, data.rate_amount, data.rate_unit);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}

export function updateSessionProfile(data) {
    try {
        const action = db.prepare('UPDATE session_profiles SET name = ?, rate_amount = ?, rate_unit = ? WHERE id = ?');
        return action.run(data.name, data.rate_amount, data.rate_unit, data.id);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}

export function deleteSessionProfile(id) {
    try {
        const action = db.prepare('DELETE FROM session_profiles WHERE id = ?');
        return action.run(id);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}


//Session Config
export function getSessionConfig() {
    const action = db.prepare('SELECT * FROM session_config');
    return action.all();
}

export function updateSessionConfig(data) {
    try {
        const action = db.prepare('UPDATE session_config SET enable_promos = ?, time_rounding = ?, grace_period = ?, minimum_billable_session = ? WHERE id = 1');
        return action.run(data.enable_promos, data.time_rounding, data.grace_period, data.minimum_billable_session);
    } catch (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}

export function getAccountRoles() {
    const action = db.prepare('SELECT * FROM account_roles');
    return action.all();
}