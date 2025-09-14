export function createPromosTable(db) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS promos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date_from DATE NOT NULL,
        date_to DATE NOT NULL,
        value INTEGER NOT NULL,
        promo_type TEXT NOT NULL
      )
    `).run();
}