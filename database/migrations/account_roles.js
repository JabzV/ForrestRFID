export function createAccountRolesTable(db) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS account_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        benefits INTEGER NOT NULL,
        benefits_type TEXT NOT NULL CHECK (benefits_type IN ('fixed', 'percentage')),
        value INTEGER NOT NULL
      )
    `).run();

    // Only insert seed data if table is empty
    const count = db.prepare('SELECT COUNT(*) as count FROM account_roles').get();
    if (count.count === 0) {
        db.prepare(`
          INSERT INTO account_roles (name, benefits, benefits_type, value) VALUES ('Member', 100, 'percentage', 10), ('Vip', 100, 'percentage', 20)
        `).run();
    }
}