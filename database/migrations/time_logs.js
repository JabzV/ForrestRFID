export function createTimeLogsTable(db) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS time_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rfid TEXT NOT NULL,
        member_type TEXT NOT NULL CHECK (member_type IN ('Member', 'Non-Member')),
        session_profile_id INTEGER NOT NULL,
        time_in DATETIME NOT NULL,
        time_out DATETIME,
        amount_paid DECIMAL(8, 2),
        duration DECIMAL(8, 2),
        status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        FOREIGN KEY (session_profile_id) REFERENCES session_profiles(id)
      )
    `).run();
}