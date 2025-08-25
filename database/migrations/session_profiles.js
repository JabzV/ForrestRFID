export function createSessionProfilesTable(db) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS session_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rate_amount DECIMAL(8, 2) NOT NULL,
        rate_unit TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
      )
    `).run();
}