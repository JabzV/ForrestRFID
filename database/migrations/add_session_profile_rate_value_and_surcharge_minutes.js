export function addSessionProfileRateValueAndSurchargeMinutes(db) {
    try {
        const tableInfo = db.prepare("PRAGMA table_info(session_profiles)").all();
        const existingColumns = tableInfo.map(col => col.name);
        
        if (!existingColumns.includes('rate_value')) {
            db.prepare(`
                ALTER TABLE session_profiles
                ADD COLUMN rate_value INTEGER NOT NULL DEFAULT 1
            `).run();
            console.log("Added rate_value column to session_profiles table");
        }
        
        if (!existingColumns.includes('surcharge_minutes')) {
            db.prepare(`
                ALTER TABLE session_profiles
                ADD COLUMN surcharge_minutes INTEGER NOT NULL DEFAULT 0
            `).run();
            console.log("Added surcharge_minutes column to session_profiles table");
        }
    } catch (error) {
        console.error("Error adding rate_value/surcharge_minutes columns:", error);
        throw error;
    }
}
