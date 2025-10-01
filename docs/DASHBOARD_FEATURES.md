# Dashboard Features Documentation

## Overview

The dashboard now includes fully functional KPI cards with real-time statistics, month-over-month comparisons, and interactive charts using Chart.js.

## Features Implemented

### 1. **Total Members KPI**

- **Real-time count** of all registered members
- **Month-over-month comparison** showing percentage change
- **Line chart visualization** displaying member growth trend throughout the current month
- Automatically updates when new members are added

### 2. **Average Session Duration KPI**

- **Calculates average session duration** from completed sessions
- **Month-over-month comparison** showing percentage change in average session time
- **Line chart visualization** showing daily average session trends
- Format: Hours and minutes (e.g., "2h 31m")

### 3. **Current Revenue**

- Displays total revenue from **all active (pending) sessions**
- Real-time updates as sessions are created or completed
- Format: Philippine Peso (₱)

### 4. **Today's Sessions**

- Shows **average session duration** for today
- **Day-over-day comparison** (compared to yesterday)
- Updates in real-time as sessions are completed

### 5. **Today's Revenue**

- Displays total revenue generated today
- **Day-over-day comparison** (compared to yesterday)
- Updates in real-time as sessions are completed

### 6. **Recent Activity**

- Shows the **10 most recent activities** (time in/out events)
- Displays member name, RFID, timestamp, and action
- Automatically updates when sessions are created or completed

## Architecture

### Component Structure

```
src/
├── components/
│   ├── pages/
│   │   └── Dashboard.vue              # Main dashboard page
│   ├── composables/
│   │   ├── Cards/
│   │   │   └── KpiCard.vue           # Reusable KPI card component
│   │   └── Charts/
│   │       ├── MiniLineChart.vue     # Line chart for trends
│   │       └── MiniBarChart.vue      # Bar chart for comparisons
│   └── functions/
│       └── dashboardFunctions.js     # Dashboard data composable
├── store/
│   └── sqliteStore/
│       └── dashboardStatisticsService.js  # Database queries for statistics
└── ipc/
    └── userIpc.js                     # IPC handlers for Electron
```

### Data Flow

1. **Frontend (Dashboard.vue)**

   - Uses `useDashboardFunctions()` composable
   - Renders KPI cards with chart components
   - Passes data to chart components via slots

2. **Composable (dashboardFunctions.js)**

   - Invokes IPC call to backend: `getDashboardStats`
   - Manages reactive state for statistics
   - Provides `loadDashboardData()` function for manual refresh

3. **IPC Handler (userIpc.js)**

   - Registers `getDashboardStats` handler
   - Calls `getAllDashboardStats()` from service layer

4. **Service Layer (dashboardStatisticsService.js)**
   - Queries SQLite database
   - Calculates statistics and comparisons
   - Formats data for frontend consumption
   - Returns structured data with chart information

### Database Queries

The service layer performs the following queries:

#### Total Members

```sql
SELECT COUNT(*) as count
FROM users
WHERE deleted_at IS NULL
  AND created_at <= [date]
```

#### Average Session Duration

```sql
SELECT AVG(duration) as avg_duration
FROM time_logs
WHERE status = 'completed'
  AND deleted_at IS NULL
  AND time_out BETWEEN [start_date] AND [end_date]
```

#### Current Revenue

```sql
SELECT SUM(amount_paid) as total
FROM time_logs
WHERE status = 'pending'
  AND deleted_at IS NULL
```

## Chart Components

### MiniLineChart

- **Purpose**: Display trend data over time
- **Used for**: Total Members, Average Session Duration
- **Props**:
  - `data`: Array of data points with date and value
  - `label`: Chart label
  - `changeType`: 'positive' or 'negative' for color coding

### MiniBarChart

- **Purpose**: Compare two values (current vs previous)
- **Props**:
  - `currentValue`: Current period value
  - `previousValue`: Previous period value
  - `currentLabel`: Label for current period
  - `previousLabel`: Label for previous period
  - `changeType`: 'positive' or 'negative' for color coding
  - `formatAsDuration`: Boolean to format as time duration

## How to Use

### Viewing Statistics

1. Navigate to the Dashboard page
2. Statistics load automatically on mount
3. View KPI cards with real-time data and trends

### Refreshing Data

Data refreshes automatically when:

- A new session is created
- A session is ended
- A session is cancelled
- The dashboard is reloaded

### Manual Refresh

```javascript
const { loadDashboardData } = useDashboardFunctions();
await loadDashboardData();
```

## Month-over-Month Comparison Logic

### Current Month

- Start: First day of current month at 00:00:00
- End: Last day of current month at 23:59:59

### Last Month

- Start: First day of previous month at 00:00:00
- End: Last day of previous month at 23:59:59

### Percentage Change Calculation

```javascript
change = ((current - previous) / previous) * 100;
```

### Change Type

- **Positive**: Green indicator (↑) when value increases
- **Negative**: Orange indicator (↓) when value decreases

## Styling and UI

### Color Scheme

- **Positive changes**: Green (#10b981)
- **Negative changes**: Orange (#f59e0b)
- **Neutral elements**: Gray (#e5e7eb)

### Charts

- Smooth line curves (tension: 0.4)
- Transparent fills for better readability
- Interactive tooltips on hover
- Responsive and maintain aspect ratio

## Performance Considerations

1. **Database Indexing**: Ensure `created_at`, `time_out`, and `status` columns are indexed
2. **Query Optimization**: Queries use proper WHERE clauses and date ranges
3. **Data Caching**: Statistics are cached in reactive state
4. **Lazy Loading**: Charts only render when data is available

## Future Enhancements

Potential improvements:

1. Add date range selector for custom periods
2. Export statistics to PDF/CSV
3. Add more chart types (pie charts for session types, etc.)
4. Real-time updates using WebSockets
5. Predictive analytics for revenue forecasting
6. User-specific statistics filtering

## Troubleshooting

### Charts Not Displaying

- Check if `chartData` array has items
- Verify Chart.js and vue-chartjs are installed
- Check browser console for errors

### Incorrect Statistics

- Verify database has completed sessions
- Check date ranges in queries
- Ensure `deleted_at` field is properly set/null

### Performance Issues

- Check database size and indexing
- Consider adding pagination for large datasets
- Optimize SQL queries with EXPLAIN QUERY PLAN

## Dependencies

- **chart.js**: ^4.x - Core charting library
- **vue-chartjs**: ^5.x - Vue 3 wrapper for Chart.js
- **better-sqlite3**: ^12.x - SQLite database driver
- **dayjs**: ^1.x - Date manipulation (if needed for future features)

## Testing

To test the dashboard:

1. Add test users to the database
2. Create multiple sessions with different durations
3. Complete some sessions to generate statistics
4. Verify calculations match expected results
5. Check month-over-month comparisons manually

## Contributing

When adding new statistics:

1. Add function to `dashboardStatisticsService.js`
2. Update `getAllDashboardStats()` to include new stat
3. Add to `statistics` ref in `dashboardFunctions.js`
4. Create computed property in `Dashboard.vue`
5. Update KPI card or create new card component
6. Document the new statistic here

---

**Last Updated**: October 2025
**Version**: 1.0.0
