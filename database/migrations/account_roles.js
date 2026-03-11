export function createAccountRolesTable(db) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS account_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        value INTEGER NOT NULL,
        benefits_type TEXT NOT NULL CHECK (benefits_type IN ('fixed', 'percentage')),
        expiry_months INTEGER NOT NULL DEFAULT 0
        
      )
    `).run();

    // Only insert seed data if table is empty
    const count = db.prepare('SELECT COUNT(*) as count FROM account_roles').get();
    if (count.count === 0) {
        db.prepare(`
          INSERT INTO account_roles (name, value, benefits_type, expiry_months)
          VALUES
            ('Member', 10, 'percentage', 0),
            ('Vip', 20, 'percentage', 0),
            ('Green Membership', 100, 'percentage', 1),
            ('Gold Membership', 100, 'percentage', 6)
        `).run();
    }
}

