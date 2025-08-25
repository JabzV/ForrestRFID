export function createPivotPromosToUserTable(db) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS pivot_promos_to_user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        promo_id INTEGER,
        user_id INTEGER,
        FOREIGN KEY (promo_id) REFERENCES promos(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `).run();
}