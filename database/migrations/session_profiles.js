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

    // Only insert seed data if table is empty
    const count = db.prepare('SELECT COUNT(*) as count FROM session_profiles').get();
    if (count.count === 0) {
        db.prepare(`
          INSERT INTO session_profiles (name, rate_amount, rate_unit) 
          VALUES ('Standard Room', 50, 'hr'),
          ('Conference Room', 80, 'hr'),
          ('Conference (Team)', 650, 'day')
        `).run();
    }
}