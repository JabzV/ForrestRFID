export function addUsersMembershipExpiryDateColumn(db) {
    try {
        const tableInfo = db.prepare("PRAGMA table_info(users)").all();
        const existingColumns = tableInfo.map(col => col.name);
        
        if (!existingColumns.includes('membership_expiry_date')) {
            db.prepare(`
                ALTER TABLE users
                ADD COLUMN membership_expiry_date DATETIME NULLABLE
            `).run();
            console.log("Added membership_expiry_date column to users table");
        }
    } catch (error) {
        console.error("Error adding membership_expiry_date column:", error);
        throw error;
    }
}
