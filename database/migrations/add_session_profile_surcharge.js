export function addSessionProfileSurchargeColumns(db) {
    try {
        const tableInfo = db.prepare("PRAGMA table_info(session_profiles)").all();
        const existingColumns = tableInfo.map(col => col.name);
        
        if (!existingColumns.includes('surcharge_amount')) {
            db.prepare(`
                ALTER TABLE session_profiles
                ADD COLUMN surcharge_amount DECIMAL(8, 2) NOT NULL DEFAULT 0
            `).run();
            console.log("Added surcharge_amount column to session_profiles table");
        }
        
        if (!existingColumns.includes('surcharge_min_minutes')) {
            db.prepare(`
                ALTER TABLE session_profiles
                ADD COLUMN surcharge_min_minutes INTEGER NOT NULL DEFAULT 0
            `).run();
            console.log("Added surcharge_min_minutes column to session_profiles table");
        }
        
        if (!existingColumns.includes('surcharge_max_minutes')) {
            db.prepare(`
                ALTER TABLE session_profiles
                ADD COLUMN surcharge_max_minutes INTEGER NOT NULL DEFAULT 0
            `).run();
            console.log("Added surcharge_max_minutes column to session_profiles table");
        }
    } catch (error) {
        console.error("Error adding session profile surcharge columns:", error);
        throw error;
    }
}
