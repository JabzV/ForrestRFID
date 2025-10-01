// src/main/database.js
import path from "path";
import Database from "better-sqlite3";

//migrations
import { createUsersTable } from "./database/migrations/users.js";
import { createTimeLogsTable } from "./database/migrations/time_logs.js";
import { createAccountRolesTable } from "./database/migrations/account_roles.js";
import { createSessionProfilesTable } from "./database/migrations/session_profiles.js";
import { createSessionConfigTable } from "./database/migrations/session_config.js";
import { createPromosTable } from "./database/migrations/promos.js";
import { createPivotPromosToUserTable } from "./database/migrations/pivot_promos_to_user.js";
import { createAuditTrailsTable } from "./database/migrations/audit_trails.js";
import { addBillingSnapshotColumns } from "./database/migrations/add_billing_snapshot.js";

// Store DB in app’s userData directory
const dbPath = path.join(process.cwd(), "database/app.db");
const db = new Database(dbPath);

//migrations
createAuditTrailsTable(db);
createSessionConfigTable(db);
createSessionProfilesTable(db);
createAccountRolesTable(db);
createPromosTable(db);
createUsersTable(db);
createPivotPromosToUserTable(db);
createTimeLogsTable(db);

// Run migration to add billing snapshot columns
addBillingSnapshotColumns(db);


export default db;
