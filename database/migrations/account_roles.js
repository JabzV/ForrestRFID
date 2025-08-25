export function createAccountRolesTable(db) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS account_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        benefits INTEGER NOT NULL
      )
    `).run();
}