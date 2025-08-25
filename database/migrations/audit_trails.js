export function createAuditTrailsTable(db) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS audit_trails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        value INTEGER NOT NULL,
        user_id INTEGER NOT NULL
      )
    `).run();
}