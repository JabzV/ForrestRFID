export function createRoleBenefitsTable(db) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS role_benefits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id INTEGER,
        benefits_type TEXT NOT NULL CHECK (benefits_type IN ('fixed', 'percentage')),
        value INTEGER NOT NULL,
        FOREIGN KEY (role_id) REFERENCES account_roles(id)
      )
    `).run();
}