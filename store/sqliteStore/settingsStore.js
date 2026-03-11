import db from '../../database.js';
import { createSessionProfilesTable } from "../../database/migrations/session_profiles.js";
import { createAccountRolesTable } from "../../database/migrations/account_roles.js";
import { createSessionConfigTable } from "../../database/migrations/session_config.js";
import { createPromosTable } from "../../database/migrations/promos.js";
import { createUsersTable } from "../../database/migrations/users.js";
import { createTimeLogsTable } from "../../database/migrations/time_logs.js";
import { createPivotPromosToUserTable } from "../../database/migrations/pivot_promos_to_user.js";
import { createAuditTrailsTable } from "../../database/migrations/audit_trails.js";
import { addSessionProfileChargeImmediatelyColumn } from "../../database/migrations/add_session_profile_charge_immediately.js";
import { addSessionProfileRateValueAndSurchargeMinutes } from "../../database/migrations/add_session_profile_rate_value_and_surcharge_minutes.js";
import { addBillingSnapshotColumns } from "../../database/migrations/add_billing_snapshot.js";

//Session Profiles
export function getSessionProfiles() {
    const action = db.prepare(`
        SELECT
            id,
            name,
            rate_amount,
            rate_unit,
            COALESCE(rate_value, 1) AS rate_value,
            surcharge_amount,
            COALESCE(surcharge_minutes, 0) AS surcharge_minutes,
            COALESCE(charge_immediately, 0) AS charge_immediately,
            created_at,
            updated_at,
            deleted_at
        FROM session_profiles
    `);
    return action.all();
}

export function getSessionProfile(id) {
    const action = db.prepare(`
        SELECT
            id,
            name,
            rate_amount,
            rate_unit,
            COALESCE(rate_value, 1) AS rate_value,
            surcharge_amount,
            COALESCE(surcharge_minutes, 0) AS surcharge_minutes,
            COALESCE(charge_immediately, 0) AS charge_immediately,
            created_at,
            updated_at,
            deleted_at
        FROM session_profiles
        WHERE id = ?
    `);
    return action.get(id);
}

export function createSessionProfile(data) {
    try {
        const action = db.prepare(`
            INSERT INTO session_profiles (
                name,
                rate_amount,
                rate_unit,
                rate_value,
                surcharge_amount,
                surcharge_minutes,
                charge_immediately
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const rateValue = Number(data.rate_value) || 1;
        const surchargeAmount = Number(data.surcharge_amount) || 0;
        const surchargeMinutes = Number(data.surcharge_minutes) || 0;
        const chargeImmediately = Number(data.charge_immediately) || 0;
        return action.run(
            data.name,
            data.rate_amount,
            data.rate_unit,
            rateValue,
            surchargeAmount,
            surchargeMinutes,
            chargeImmediately
        );
    } catch (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}

export function updateSessionProfile(data) {
    try {
        const action = db.prepare(`
            UPDATE session_profiles
            SET name = ?, rate_amount = ?, rate_unit = ?, rate_value = ?, surcharge_amount = ?, surcharge_minutes = ?, charge_immediately = ?
            WHERE id = ?
        `);
        const rateValue = Number(data.rate_value) || 1;
        const surchargeAmount = Number(data.surcharge_amount) || 0;
        const surchargeMinutes = Number(data.surcharge_minutes) || 0;
        const chargeImmediately = Number(data.charge_immediately) || 0;
        return action.run(
            data.name,
            data.rate_amount,
            data.rate_unit,
            rateValue,
            surchargeAmount,
            surchargeMinutes,
            chargeImmediately,
            data.id
        );
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

//Account Roles
export function getAccountRoles() {
    const action = db.prepare('SELECT * FROM account_roles');
    return action.all();
}

export function createAccountRole(data) {
    const action = db.prepare('INSERT INTO account_roles (name, benefits_type, value) VALUES (?, ?, ?)');
    return action.run(data.name, data.benefits_type, data.value);
}

export function updateAccountRole(data) {
    const action = db.prepare('UPDATE account_roles SET name = ?, benefits_type = ?, value = ? WHERE id = ?');
    return action.run(data.name, data.benefits_type, data.value, data.id);
}

export function deleteAccountRole(id) {
    const action = db.prepare('DELETE FROM account_roles WHERE id = ?');
    return action.run(id);
}

//Promo Management
export function getPromos() {
    const action = db.prepare('SELECT * FROM promos');
    return action.all();
}

export function createPromo(data) {
    const action = db.prepare('INSERT INTO promos (name, date_from, date_to, promo_type, value) VALUES (?, ?, ?, ?, ?)');
    return action.run(data.name, data.date_from, data.date_to, data.promo_type, data.value);
}

export function updatePromo(data) {
    const action = db.prepare('UPDATE promos SET name = ?, date_from = ?, date_to = ?, promo_type = ?, value = ? WHERE id = ?');
    return action.run(data.name, data.date_from, data.date_to, data.promo_type, data.value, data.id);
}

export function deletePromo(id) {
    const action = db.prepare('DELETE FROM promos WHERE id = ?');
    return action.run(id);
}

export function resetDatabase() {
    try {
        const resetTransaction = db.transaction(() => {
            // Remigrate: drop and recreate tables, then re-seed
            db.exec("PRAGMA foreign_keys = OFF");
            db.exec(`
                DROP TABLE IF EXISTS pivot_promos_to_user;
                DROP TABLE IF EXISTS time_logs;
                DROP TABLE IF EXISTS audit_trails;
                DROP TABLE IF EXISTS users;
                DROP TABLE IF EXISTS promos;
                DROP TABLE IF EXISTS session_profiles;
                DROP TABLE IF EXISTS account_roles;
                DROP TABLE IF EXISTS session_config;
            `);

            // Recreate tables (seeders run on empty tables)
            createAuditTrailsTable(db);
            createSessionConfigTable(db);
            createSessionProfilesTable(db);
            createAccountRolesTable(db);
            createPromosTable(db);
            createUsersTable(db);
            createPivotPromosToUserTable(db);
            createTimeLogsTable(db);

            // Re-apply migrations that add/alter columns
            addBillingSnapshotColumns(db);
            addSessionProfileChargeImmediatelyColumn(db);
            addSessionProfileRateValueAndSurchargeMinutes(db);

            db.exec("PRAGMA foreign_keys = ON");
        });

        resetTransaction();
        return { success: true };
    } catch (error) {
        console.error("Database reset error:", error);
        throw new Error(`Database reset error: ${error.message}`);
    }
}