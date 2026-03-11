export function addAccountRolesExpiryMonthsColumn(db) {
    try {
        const tableInfo = db.prepare("PRAGMA table_info(account_roles)").all();
        const existingColumns = tableInfo.map(col => col.name);
        
        if (!existingColumns.includes('expiry_months')) {
            db.prepare(`
                ALTER TABLE account_roles
                ADD COLUMN expiry_months INTEGER NOT NULL DEFAULT 0
            `).run();
            console.log("Added expiry_months column to account_roles table");
        }
    } catch (error) {
        console.error("Error adding expiry_months column:", error);
        throw error;
    }
}
