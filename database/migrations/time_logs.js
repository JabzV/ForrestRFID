export function createTimeLogsTable(db) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS time_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        session_profile_id INTEGER,
        time_in DATETIME NOT NULL,
        time_out DATETIME NOT NULL,
        amount_paid DECIMAL(8, 2) NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (session_profile_id) REFERENCES session_profiles(id)
      )
    `).run();
}