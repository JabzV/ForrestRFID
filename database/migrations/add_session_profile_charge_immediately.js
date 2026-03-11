export function addSessionProfileChargeImmediatelyColumn(db) {
    try {
        const tableInfo = db.prepare("PRAGMA table_info(session_profiles)").all();
        const existingColumns = tableInfo.map(col => col.name);
        
        if (!existingColumns.includes('charge_immediately')) {
            db.prepare(`
                ALTER TABLE session_profiles
                ADD COLUMN charge_immediately INTEGER NOT NULL DEFAULT 0
            `).run();
            console.log("Added charge_immediately column to session_profiles table");
        }
    } catch (error) {
        console.error("Error adding charge_immediately column:", error);
        throw error;
    }
}
