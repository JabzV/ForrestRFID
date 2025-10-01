export function addBillingSnapshotColumns(db) {
    try {
        // Check if columns already exist to avoid errors
        const tableInfo = db.prepare("PRAGMA table_info(time_logs)").all();
        const existingColumns = tableInfo.map(col => col.name);
        
        if (!existingColumns.includes('billing_snapshot')) {
            db.prepare(`
                ALTER TABLE time_logs 
                ADD COLUMN billing_snapshot TEXT
            `).run();
            console.log("Added billing_snapshot column to time_logs table");
        }
        
        if (!existingColumns.includes('original_rate_amount')) {
            db.prepare(`
                ALTER TABLE time_logs 
                ADD COLUMN original_rate_amount DECIMAL(10,2)
            `).run();
            console.log("Added original_rate_amount column to time_logs table");
        }
        
        if (!existingColumns.includes('original_rate_unit')) {
            db.prepare(`
                ALTER TABLE time_logs 
                ADD COLUMN original_rate_unit TEXT
            `).run();
            console.log("Added original_rate_unit column to time_logs table");
        }
        
        if (!existingColumns.includes('applied_discounts')) {
            db.prepare(`
                ALTER TABLE time_logs 
                ADD COLUMN applied_discounts TEXT
            `).run();
            console.log("Added applied_discounts column to time_logs table");
        }
        
        if (!existingColumns.includes('final_calculated_amount')) {
            db.prepare(`
                ALTER TABLE time_logs 
                ADD COLUMN final_calculated_amount DECIMAL(10,2)
            `).run();
            console.log("Added final_calculated_amount column to time_logs table");
        }
        
        if (!existingColumns.includes('snapshot_created_at')) {
            db.prepare(`
                ALTER TABLE time_logs 
                ADD COLUMN snapshot_created_at DATETIME
            `).run();
            console.log("Added snapshot_created_at column to time_logs table");
        }
        
    } catch (error) {
        console.error("Error adding billing snapshot columns:", error);
        throw error;
    }
}
