export function createSessionConfigTable(db) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS session_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        billing_interval_type TEXT NOT NULL,
        time_rounding INTEGER NOT NULL,
        grace_period INTEGER NOT NULL,
        minimum_billable_session INTEGER NOT NULL
      )
    `).run();
}