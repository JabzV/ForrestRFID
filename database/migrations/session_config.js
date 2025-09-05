export function createSessionConfigTable(db) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS session_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        enable_promos BOOLEAN NOT NULL DEFAULT 1,
        time_rounding INTEGER NOT NULL,
        grace_period INTEGER NOT NULL,
        minimum_billable_session INTEGER NOT NULL
      )
    `).run();

    // Only insert seed data if table is empty
    const count = db.prepare('SELECT COUNT(*) as count FROM session_config').get();
    if (count.count === 0) {
        db.prepare(`
          INSERT INTO session_config (enable_promos, time_rounding, grace_period, minimum_billable_session) VALUES (1, 5, 3, 10)
        `).run();
    }
}

