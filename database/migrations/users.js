export function createUsersTable(db) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rfid INTEGER NOT NULL,
        account_role_id INTEGER,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        FOREIGN KEY (account_role_id) REFERENCES account_roles(id)
      )
    `).run();
  }
  