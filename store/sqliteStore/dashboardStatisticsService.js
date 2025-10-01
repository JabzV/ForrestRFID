import db from '../../database.js';

/**
 * Dashboard Statistics Service
 * Provides real-time statistics with month-over-month comparisons
 */

/**
 * Get date ranges for current and last month
 * Returns dates in YYYY-MM-DD HH:MM:SS format for SQLite compatibility
 */
function getDateRanges() {
    const now = new Date();
    
    // Format date to SQLite-compatible string
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    
    // Current month - start and end
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Last month - start and end
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    // Today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    // Yesterday
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
    
    return {
        currentMonthStart: formatDate(currentMonthStart),
        currentMonthEnd: formatDate(currentMonthEnd),
        lastMonthStart: formatDate(lastMonthStart),
        lastMonthEnd: formatDate(lastMonthEnd),
        todayStart: formatDate(todayStart),
        todayEnd: formatDate(todayEnd),
        yesterdayStart: formatDate(yesterdayStart),
        yesterdayEnd: formatDate(yesterdayEnd)
    };
}

/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(current, previous) {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
}

/**
 * Format duration from minutes to readable format
 */
function formatDuration(minutes) {
    if (!minutes || minutes === 0) return '0h 0m';
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    return `${hours}h ${mins}m`;
}

/**
 * Get total members count with month-over-month comparison
 */
export function getTotalMembersStats() {
    try {
        const dates = getDateRanges();
        const now = new Date();
        const currentYear = now.getFullYear();
        
        // Get current month members
        const currentMonthQuery = db.prepare(`
            SELECT COUNT(*) as count
            FROM users
            WHERE deleted_at IS NULL
              AND created_at <= ?
        `);
        const currentCount = currentMonthQuery.get(dates.currentMonthEnd).count;
        
        // Get last month members
        const lastMonthQuery = db.prepare(`
            SELECT COUNT(*) as count
            FROM users
            WHERE deleted_at IS NULL
              AND created_at <= ?
        `);
        const lastMonthCount = lastMonthQuery.get(dates.lastMonthEnd).count;
        
        // Calculate change
        const change = calculatePercentageChange(currentCount, lastMonthCount);
        const changeType = change >= 0 ? 'positive' : 'negative';
        
        // Get monthly member counts for the current year up to current month
        const monthlyCountsQuery = db.prepare(`
            SELECT 
                strftime('%m', created_at) as month_num,
                COUNT(*) as count
            FROM users
            WHERE deleted_at IS NULL
              AND created_at >= ?
              AND created_at <= ?
            GROUP BY strftime('%Y-%m', created_at)
            ORDER BY month_num ASC
        `);
        
        const yearStart = `${currentYear}-01-01 00:00:00`;
        const yearEnd = dates.currentMonthEnd; // Only up to current month
        const dbMonthlyCounts = monthlyCountsQuery.all(yearStart, yearEnd);
        
        // Create map of cumulative counts per month
        const countMap = {};
        dbMonthlyCounts.forEach(item => {
            countMap[parseInt(item.month_num)] = item.count || 0;
        });
        
        // Return months from Jan to current month
        const currentMonth = now.getMonth() + 1;
        const monthlyCounts = [];
        let cumulativeCount = 0;
        for (let month = 1; month <= currentMonth; month++) {
            cumulativeCount += (countMap[month] || 0);
            monthlyCounts.push({
                date: `${currentYear}-${month.toString().padStart(2, '0')}-01`,
                count: cumulativeCount
            });
        }
        
        return {
            current: currentCount,
            previous: lastMonthCount,
            change: Math.abs(change),
            changeType,
            monthlyCounts
        };
    } catch (error) {
        console.error('Error getting total members stats:', error);
        return {
            current: 0,
            previous: 0,
            change: 0,
            changeType: 'positive',
            monthlyCounts: []
        };
    }
}

/**
 * Get average session duration with month-over-month comparison
 */
export function getAvgSessionStats() {
    try {
        const dates = getDateRanges();
        const now = new Date();
        const currentYear = now.getFullYear();
        
        // Get current month average session
        // NOTE: duration column stores HOURS, not minutes
        // Formula: SUM(duration) / COUNT(*) = AVG(duration) in hours
        const currentMonthQuery = db.prepare(`
            SELECT 
                AVG(duration) as avg_duration_hours,
                SUM(duration) as total_duration_hours,
                COUNT(*) as session_count
            FROM time_logs
            WHERE status = 'completed'
              AND deleted_at IS NULL
              AND time_out >= ?
              AND time_out <= ?
        `);
        const currentData = currentMonthQuery.get(dates.currentMonthStart, dates.currentMonthEnd);
        // Convert hours to minutes
        const currentAvg = (currentData.avg_duration_hours || 0) * 60;
        
        // Get last month average session
        const lastMonthQuery = db.prepare(`
            SELECT 
                AVG(duration) as avg_duration_hours,
                COUNT(*) as session_count
            FROM time_logs
            WHERE status = 'completed'
              AND deleted_at IS NULL
              AND time_out >= ?
              AND time_out <= ?
        `);
        const lastMonthData = lastMonthQuery.get(dates.lastMonthStart, dates.lastMonthEnd);
        // Convert hours to minutes
        const lastMonthAvg = (lastMonthData.avg_duration_hours || 0) * 60;
        
        // Calculate change
        const change = calculatePercentageChange(currentAvg, lastMonthAvg);
        const changeType = change >= 0 ? 'positive' : 'negative';
        
        // Get monthly average sessions for the current year up to current month
        const monthlyAvgQuery = db.prepare(`
            SELECT 
                strftime('%m', time_out) as month_num,
                AVG(duration) as avg_duration_hours
            FROM time_logs
            WHERE status = 'completed'
              AND deleted_at IS NULL
              AND time_out >= ?
              AND time_out <= ?
            GROUP BY strftime('%Y-%m', time_out)
            ORDER BY month_num ASC
        `);
        
        const yearStart = `${currentYear}-01-01 00:00:00`;
        const yearEnd = dates.currentMonthEnd; // Only up to current month
        const dbMonthlyAvg = monthlyAvgQuery.all(yearStart, yearEnd);
        
        // Create map of month -> avg duration (convert hours to minutes)
        const avgMap = {};
        dbMonthlyAvg.forEach(item => {
            avgMap[parseInt(item.month_num)] = (item.avg_duration_hours || 0) * 60;
        });
        
        // Return months from Jan to current month
        const currentMonth = now.getMonth() + 1;
        const monthlyAverages = [];
        for (let month = 1; month <= currentMonth; month++) {
            monthlyAverages.push({
                date: `${currentYear}-${month.toString().padStart(2, '0')}-01`,
                avg_duration: avgMap[month] || 0
            });
        }
        
        return {
            current: currentAvg,
            previous: lastMonthAvg,
            change: Math.abs(change),
            changeType,
            monthlyAverages
        };
    } catch (error) {
        console.error('Error getting avg session stats:', error);
        return {
            current: 0,
            previous: 0,
            change: 0,
            changeType: 'positive',
            monthlyAverages: []
        };
    }
}

/**
 * Get revenue statistics for this month vs last month
 */
export function getMonthRevenue() {
    try {
        const dates = getDateRanges();
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        // Get current month revenue
        const currentMonthQuery = db.prepare(`
            SELECT SUM(amount_paid) as total
            FROM time_logs
            WHERE status = 'completed'
              AND deleted_at IS NULL
              AND time_out >= ?
              AND time_out <= ?
        `);
        const currentTotal = currentMonthQuery.get(dates.currentMonthStart, dates.currentMonthEnd).total || 0;
        
        // Get last month revenue
        const lastMonthQuery = db.prepare(`
            SELECT SUM(amount_paid) as total
            FROM time_logs
            WHERE status = 'completed'
              AND deleted_at IS NULL
              AND time_out >= ?
              AND time_out <= ?
        `);
        const lastMonthTotal = lastMonthQuery.get(dates.lastMonthStart, dates.lastMonthEnd).total || 0;
        
        // Calculate change
        const change = calculatePercentageChange(currentTotal, lastMonthTotal);
        const changeType = change >= 0 ? 'positive' : 'negative';
        
        // Get daily revenue for current month up to today
        // Using DATE() function and BETWEEN for reliable date matching
        const dailyRevenueQuery = db.prepare(`
            SELECT 
                DATE(time_out) as date,
                SUM(amount_paid) as revenue
            FROM time_logs
            WHERE status = 'completed'
              AND deleted_at IS NULL
              AND strftime('%Y-%m', time_out) = ?
            GROUP BY DATE(time_out)
            ORDER BY DATE(time_out) ASC
        `);
        
        const today = now.getDate();
        const currentMonthStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`;
        const dbDailyRevenue = dailyRevenueQuery.all(currentMonthStr);
        
        // Create map of day -> revenue
        const revenueByDay = {};
        dbDailyRevenue.forEach(item => {
            // Parse date string directly to avoid timezone issues
            // item.date format: "2025-10-01"
            const dateParts = item.date.split('-');
            const day = parseInt(dateParts[2], 10);
            revenueByDay[day] = item.revenue || 0;
        });
        
        // Return all days from 1 to today
        const dailyRevenue = [];
        for (let day = 1; day <= today; day++) {
            dailyRevenue.push({
                date: `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
                value: revenueByDay[day] || 0
            });
        }
        
        return {
            current: currentTotal,
            previous: lastMonthTotal,
            change: Math.abs(change),
            changeType,
            dailyRevenue
        };
    } catch (error) {
        console.error('Error getting month revenue:', error);
        return {
            current: 0,
            previous: 0,
            change: 0,
            changeType: 'positive',
            dailyRevenue: []
        };
    }
}

/**
 * Get revenue statistics for this year vs last year
 */
export function getYearRevenue() {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        
        // Current year - start and end
        const currentYearStart = `${currentYear}-01-01 00:00:00`;
        const currentYearEnd = `${currentYear}-12-31 23:59:59`;
        
        // Last year - start and end
        const lastYearStart = `${currentYear - 1}-01-01 00:00:00`;
        const lastYearEnd = `${currentYear - 1}-12-31 23:59:59`;
        
        // Get current year revenue
        const currentYearQuery = db.prepare(`
            SELECT SUM(amount_paid) as total
            FROM time_logs
            WHERE status = 'completed'
              AND deleted_at IS NULL
              AND time_out >= ?
              AND time_out <= ?
        `);
        const currentTotal = currentYearQuery.get(currentYearStart, currentYearEnd).total || 0;
        
        // Get last year revenue
        const lastYearQuery = db.prepare(`
            SELECT SUM(amount_paid) as total
            FROM time_logs
            WHERE status = 'completed'
              AND deleted_at IS NULL
              AND time_out >= ?
              AND time_out <= ?
        `);
        const lastYearTotal = lastYearQuery.get(lastYearStart, lastYearEnd).total || 0;
        
        // Calculate change
        const change = calculatePercentageChange(currentTotal, lastYearTotal);
        const changeType = change >= 0 ? 'positive' : 'negative';
        
        // Get monthly revenue for current year
        const monthlyRevenueQuery = db.prepare(`
            SELECT 
                strftime('%m', time_out) as month_num,
                SUM(amount_paid) as revenue
            FROM time_logs
            WHERE status = 'completed'
              AND deleted_at IS NULL
              AND time_out >= ?
              AND time_out <= ?
            GROUP BY strftime('%Y-%m', time_out)
            ORDER BY month_num ASC
        `);
        const dbMonthlyRevenue = monthlyRevenueQuery.all(currentYearStart, currentYearEnd);
        
        // Create a map of month -> revenue
        const revenueMap = {};
        dbMonthlyRevenue.forEach(item => {
            revenueMap[parseInt(item.month_num)] = item.revenue || 0;
        });

        // Return months from Jan to current month
        const currentMonth = now.getMonth() + 1;
        const monthlyRevenue = [];
        for (let month = 1; month <= currentMonth; month++) {
            monthlyRevenue.push({
                month: `${currentYear}-${month.toString().padStart(2, '0')}-01`,
                revenue: revenueMap[month] || 0
            });
        }
        
        return {
            current: currentTotal,
            previous: lastYearTotal,
            change: Math.abs(change),
            changeType,
            monthlyRevenue
        };
    } catch (error) {
        console.error('Error getting year revenue:', error);
        return {
            current: 0,
            previous: 0,
            change: 0,
            changeType: 'positive',
            monthlyRevenue: []
        };
    }
}

/**
 * Get today's sessions with comparison to yesterday
 */
export function getTodaySessionsStats() {
    try {
        const dates = getDateRanges();
        
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Get today's session count - including all session types (pending, cancelled, completed)
        // Using DATE() for reliable comparison
        const todayQuery = db.prepare(`
            SELECT COUNT(*) as count
            FROM time_logs
            WHERE deleted_at IS NULL
              AND (
                (status = 'completed' AND DATE(time_out) = ?)
                OR (status IN ('pending', 'cancelled') AND DATE(time_in) = ?)
              )
        `);
        const todayData = todayQuery.get(today, today);
        const todayCount = todayData.count || 0;
        
        // Get yesterday's session count
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const yesterdayQuery = db.prepare(`
            SELECT COUNT(*) as count
            FROM time_logs
            WHERE deleted_at IS NULL
              AND (
                (status = 'completed' AND DATE(time_out) = ?)
                OR (status IN ('pending', 'cancelled') AND DATE(time_in) = ?)
              )
        `);
        const yesterdayData = yesterdayQuery.get(yesterdayStr, yesterdayStr);
        const yesterdayCount = yesterdayData.count || 0;
        
        // Calculate change
        const change = calculatePercentageChange(todayCount, yesterdayCount);
        const changeType = change >= 0 ? 'positive' : 'negative';
        
        // Get hourly session counts for today for charting (all statuses)
        const hourlyQuery = db.prepare(`
            SELECT 
                strftime('%Y-%m-%d %H:00:00', 
                  CASE 
                    WHEN status = 'completed' THEN time_out
                    ELSE time_in
                  END
                ) as hour,
                COUNT(*) as count
            FROM time_logs
            WHERE deleted_at IS NULL
              AND (
                (status = 'completed' AND DATE(time_out) = ?)
                OR (status IN ('pending', 'cancelled') AND DATE(time_in) = ?)
              )
            GROUP BY hour
            ORDER BY hour ASC
        `);
        const hourlyData = hourlyQuery.all(today, today);
        
        return {
            current: todayCount,
            previous: yesterdayCount,
            change: Math.abs(change),
            changeType,
            hourlyData
        };
    } catch (error) {
        console.error('Error getting today sessions stats:', error);
        return {
            current: 0,
            previous: 0,
            count: 0,
            change: 0,
            changeType: 'positive',
            hourlyData: []
        };
    }
}

/**
 * Get today's revenue with comparison to yesterday
 */
export function getTodayRevenueStats() {
    try {
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Get today's revenue - using DATE() for reliable comparison
        const todayQuery = db.prepare(`
            SELECT SUM(amount_paid) as total
            FROM time_logs
            WHERE status = 'completed'
              AND deleted_at IS NULL
              AND DATE(time_out) = ?
        `);
        const todayTotal = todayQuery.get(today).total || 0;
        
        // Get yesterday's revenue
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const yesterdayQuery = db.prepare(`
            SELECT SUM(amount_paid) as total
            FROM time_logs
            WHERE status = 'completed'
              AND deleted_at IS NULL
              AND DATE(time_out) = ?
        `);
        const yesterdayTotal = yesterdayQuery.get(yesterdayStr).total || 0;
        
        // Calculate change
        const change = calculatePercentageChange(todayTotal, yesterdayTotal);
        const changeType = change >= 0 ? 'positive' : 'negative';
        
        // Get hourly revenue for today for charting
        const hourlyQuery = db.prepare(`
            SELECT 
                strftime('%Y-%m-%d %H:00:00', time_out) as hour,
                SUM(amount_paid) as revenue
            FROM time_logs
            WHERE status = 'completed'
              AND deleted_at IS NULL
              AND DATE(time_out) = ?
            GROUP BY strftime('%H', time_out)
            ORDER BY hour ASC
        `);
        const hourlyRevenue = hourlyQuery.all(today);
        
        return {
            current: todayTotal,
            previous: yesterdayTotal,
            change: Math.abs(change),
            changeType,
            hourlyRevenue
        };
    } catch (error) {
        console.error('Error getting today revenue stats:', error);
        return {
            current: 0,
            previous: 0,
            change: 0,
            changeType: 'positive',
            hourlyRevenue: []
        };
    }
}

/**
 * Get recent activity (latest time logs)
 */
export function getRecentActivity() {
    try {
        const query = db.prepare(`
            SELECT 
                time_logs.id,
                time_logs.rfid,
                time_logs.time_in,
                time_logs.time_out,
                time_logs.status,
                COALESCE(users.first_name || ' ' || users.last_name, 'Non Member') AS full_name
            FROM time_logs
            LEFT JOIN users ON time_logs.rfid = users.rfid
            WHERE time_logs.deleted_at IS NULL
            ORDER BY time_logs.created_at DESC
            LIMIT 10
        `);
        
        const activities = query.all();
        
        // Format the activities
        return activities.map(activity => {
            const timeIn = new Date(activity.time_in);
            const action = activity.time_out ? 'Time Out' : 'Time In';
            const time = timeIn.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
            const date = timeIn.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit'
            });
            
            return {
                id: activity.id,
                name: activity.full_name,
                rfid: activity.rfid,
                time: time,
                date: date,
                action: action
            };
        });
    } catch (error) {
        console.error('Error getting recent activity:', error);
        return [];
    }
}

/**
 * Get all dashboard statistics
 */
export function getAllDashboardStats() {
    const totalMembers = getTotalMembersStats();
    const avgSession = getAvgSessionStats();
    const monthRevenue = getMonthRevenue();
    const yearRevenue = getYearRevenue();
    const todaySessions = getTodaySessionsStats();
    const todayRevenue = getTodayRevenueStats();
    const recentActivity = getRecentActivity();
    
    return {
        totalMembers: {
            value: totalMembers.current.toString(),
            change: `${totalMembers.change}%`,
            changeType: totalMembers.changeType,
            description: 'Compared to last month',
            chartData: totalMembers.monthlyCounts
        },
        avgSession: {
            value: formatDuration(avgSession.current),
            change: `${avgSession.change}%`,
            changeType: avgSession.changeType,
            description: 'Compared to last month',
            chartData: avgSession.monthlyAverages
        },
        currentRevenue: {
            month: {
                value: `₱${monthRevenue.current.toFixed(2)}`,
                change: `${monthRevenue.change}%`,
                changeType: monthRevenue.changeType,
                description: 'Compared to last month',
                chartData: monthRevenue.dailyRevenue.map(item => ({
                    date: item.date,
                    value: item.value || 0
                }))
            },
            year: {
                value: `₱${yearRevenue.current.toFixed(2)}`,
                change: `${yearRevenue.change}%`,
                changeType: yearRevenue.changeType,
                description: 'Compared to last year',
                chartData: yearRevenue.monthlyRevenue.map(item => ({
                    date: item.month,
                    value: item.revenue || 0
                }))
            }
        },
        todaySessions: {
            value: todaySessions.current.toString(),
            change: `${todaySessions.change}%`,
            changeType: todaySessions.changeType,
            description: 'Compared to yesterday',
            chartData: todaySessions.hourlyData.map(item => ({
                date: item.hour,
                count: item.count || 0
            }))
        },
        todayRevenue: {
            value: `₱${todayRevenue.current.toFixed(2)}`,
            change: `${todayRevenue.change}%`,
            changeType: todayRevenue.changeType,
            description: 'Compared to yesterday',
            chartData: todayRevenue.hourlyRevenue.map(item => ({
                date: item.hour,
                value: item.revenue || 0
            }))
        },
        recentActivity: recentActivity
    };
}

