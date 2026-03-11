export function createSessionProfilesTable(db) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS session_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rate_amount DECIMAL(8, 2) NOT NULL,
        rate_unit TEXT NOT NULL,
        rate_value INTEGER NOT NULL DEFAULT 1,
        surcharge_amount DECIMAL(8, 2) NOT NULL DEFAULT 0,
        surcharge_minutes INTEGER NOT NULL DEFAULT 0,
        charge_immediately INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME
      )
    `).run();

    // Only insert seed data if table is empty
    const count = db.prepare('SELECT COUNT(*) as count FROM session_profiles').get();
    if (count.count === 0) {
        db.prepare(`
          INSERT INTO session_profiles (
            name,
            rate_amount,
            rate_unit,
            rate_value,
            surcharge_amount,
            surcharge_minutes,
            charge_immediately
          ) 
          VALUES
            ('Student - Hourly', 35, 'hr', 1, 20, 20, 0),
            ('Student - 3 Hours', 100, 'hr', 3, 0, 0, 0),
            ('Regular - Hourly', 40, 'hr', 1, 20, 20, 0),
            ('Brownout - Hourly', 45, 'hr', 1, 0, 0, 0),
            ('Unlipass - Day', 240, 'day', 1, 0, 0, 0),
            ('Unlipass - Week', 750, 'week', 1, 0, 0, 1),
            ('Membership - Green', 2500, 'month', 1, 0, 0, 1),
            ('Membership - Gold', 10000, 'month', 6, 0, 0, 1),
            ('Private Room - Hourly', 100, 'hr', 1, 0, 0, 0),
            ('Private Room - Day', 650, 'day', 1, 0, 0, 0),
            ('Private Room - Week', 1500, 'week', 1, 0, 0, 0),
            ('Private Room - Month', 5000, 'month', 1, 0, 0, 0),
            ('Board Room - Hourly', 350, 'hr', 1, 0, 0, 0),
            ('Board Room - Day', 2500, 'day', 1, 0, 0, 0),
            ('Conference Room - Hourly', 500, 'hr', 1, 0, 0, 0),
            ('Conference Room - Day', 3500, 'day', 1, 0, 0, 0)
        `).run();
    }
}