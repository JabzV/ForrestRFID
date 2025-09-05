import db from '../../database.js';

export function getSessionConfig() {
    const action = db.prepare('SELECT * FROM session_config');
    return action.all();
}

export function getSessionProfiles() {
    const action = db.prepare('SELECT * FROM session_profiles');
    return action.all();
}

export function getAccountRoles() {
    const action = db.prepare('SELECT * FROM account_roles');
    return action.all();
}