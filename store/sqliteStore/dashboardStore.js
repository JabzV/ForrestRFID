import db from '../../database.js';

export function createSession(data) {
    try {
        const insertQuery = db.prepare(`
            INSERT INTO time_logs (
                rfid, 
                member_type,
                session_profile_id, 
                time_in, 
                status
            ) VALUES (?, ?, ?, ?, ?)
        `);
        
        const currentTime = new Date().toISOString();
        
        const result = insertQuery.run(
            data.rfid,                    // user_id (null for non-members)
            data.member_type,
            data.session_profile_id,   // session_profile_id from form
            currentTime,               // time_in (current time)                       // amount_paid (placeholder, will be calculated later)
            'pending'                  // status
        );
        
        console.log("Session created successfully:", result);
        return result;
        
    } catch (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}

export function endSession(data) {
    try {
        console.log("Ending session with RFID:", data.rfid);
        
        // First, get the active session to calculate time difference
        const getSessionQuery = db.prepare(`
            SELECT tl.*, sp.rate_amount, sp.rate_unit 
            FROM time_logs tl
            JOIN session_profiles sp ON tl.session_profile_id = sp.id
            WHERE tl.rfid = ? AND tl.status = 'pending'
            ORDER BY tl.time_in DESC 
            LIMIT 1
        `);
        
        const activeSession = getSessionQuery.get(data.rfid);
        
        if (!activeSession) {
            throw new Error("No active session found for this RFID");
        }
        
        const currentTime = new Date().toISOString();
        const timeIn = new Date(activeSession.time_in);
        const timeOut = new Date(currentTime);
        
        // Calculate time difference in hours
        const timeDifferenceMs = timeOut - timeIn;
        const timeDifferenceHours = timeDifferenceMs / (1000 * 60 * 60); // Convert to hours
        
        // Calculate amount based on rate and time
        let amountPaid = 0;
        if (activeSession.rate_unit === 'hr') {
            // Hourly rate
            amountPaid = timeDifferenceHours * activeSession.rate_amount;
        } else if (activeSession.rate_unit === 'day') {
            // Daily rate - calculate fraction of day
            const dayFraction = timeDifferenceHours / 24;
            amountPaid = dayFraction * activeSession.rate_amount;
        }
        let duration = 0;
        
        // Round to 2 decimal places
        amountPaid = Math.round(amountPaid * 100) / 100;
        duration = timeDifferenceHours.toFixed(2);
        
        console.log(`Session duration: ${timeDifferenceHours.toFixed(2)} hours`);
        console.log(`Rate: ₱${activeSession.rate_amount}/${activeSession.rate_unit}`);
        console.log(`Calculated amount: ₱${amountPaid}`);
        
        // Update the session with calculated amount
        const updateQuery = db.prepare(`
            UPDATE time_logs SET time_out = ?, status = ?, amount_paid = ?, duration = ? WHERE id = ?
        `);
        
        const result = updateQuery.run(currentTime, 'completed', amountPaid, duration, activeSession.id);
        
        if (result.changes === 0) {
            throw new Error("Failed to update session");
        }
        
        console.log("Session ended successfully:", result);
        return {
            ...result,
            duration: duration,
            amountPaid: amountPaid,
            rate: `₱${activeSession.rate_amount}/${activeSession.rate_unit}`
        };
        
    } catch (error) {
        console.error("Database error:", error);
        throw new Error(`Database error: ${error.message}`);
    }
}