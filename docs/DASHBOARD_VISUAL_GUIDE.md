# Dashboard Visual Guide

## Overview

This guide provides a visual representation of the enhanced dashboard with functional statistics and charts.

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FORREST RFID DASHBOARD                          │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┬──────────────────────────────────┐
│                                      │                                  │
│  📊 KPI CARDS WITH CHARTS            │  💰 CURRENT REVENUE              │
│                                      │                                  │
│  ┌────────────────────────────────┐  │  ┌────────────────────────────┐ │
│  │ Total Members  │ Avg. Session  │  │  │      ₱28,530.00            │ │
│  │     114        │   2h 31m      │  │  │                            │ │
│  │  ↑ 22%        │  ↓ 12%        │  │  │  Current active sessions   │ │
│  │  Compared to last month       │  │  │  revenue                   │ │
│  │                                │  │  └────────────────────────────┘ │
│  │  [LINE CHART] │ [LINE CHART]  │  │                                  │
│  │   Growth      │  Duration     │  │  📈 TODAY'S METRICS              │
│  │   Trend       │  Trend        │  │                                  │
│  └────────────────────────────────┘  │  ┌────────────────────────────┐ │
│                                      │  │ Today's    │ Today's        │ │
│  🟢 ACTIVE SESSIONS                  │  │ Sessions   │ Revenue        │ │
│                                      │  │  1h 17m    │  ₱430.00       │ │
│  ┌────────────────────────────────┐  │  │  ↑ 2%     │  ↓ 17%         │ │
│  │ 🔍 Search sessions...          │  │  └────────────────────────────┘ │
│  │                                │  │                                  │
│  │ 👤 Jabez Vestidas              │  │  🕐 RECENT ACTIVITY              │
│  │    01:32:31 | ₱92.00      [×] │  │                                  │
│  │                                │  │  ┌────────────────────────────┐ │
│  │ 👤 Javen Cutaran               │  │  │ Jabez Vestidas             │ │
│  │    00:52:31 | ₱66.00      [×] │  │  │ 03:12 PM • 10/01/25        │ │
│  │                                │  │  │ Time In                    │ │
│  │ 👤 Non-Member                  │  │  └────────────────────────────┘ │
│  │    02:42:31 | ₱137.00     [×] │  │                                  │
│  │                                │  │                                  │
│  │ ... more sessions ...          │  │                                  │
│  └────────────────────────────────┘  │                                  │
│                                      │                                  │
└──────────────────────────────────────┴──────────────────────────────────┘
```

## Component Breakdown

### 1. KPI Card with Charts

```
┌──────────────────────────────────────────────────────────────────┐
│  Total Members                    │  Avg. Session Duration       │
│  ────────────────                 │  ─────────────────          │
│                                   │                              │
│  🔢 114                           │  ⏱️  2h 31m                  │
│                                   │                              │
│  ↑ 22%  Compared to last month   │  ↓ 12%  Compared to last month │
│                                   │                              │
│  ┌─────────────────────┐          │  ┌─────────────────────┐    │
│  │      📈 Chart       │          │  │      📈 Chart       │    │
│  │   ╱╲    ╱╲╱╲       │          │  │   ╲  ╱╲  ╱╲        │    │
│  │  ╱  ╲  ╱    ╲      │          │  │    ╲╱  ╲╱  ╲╱      │    │
│  │ ╱    ╲╱      ╲     │          │  │                     │    │
│  └─────────────────────┘          │  └─────────────────────┘    │
│  Member growth trend this month   │  Avg duration trend         │
└──────────────────────────────────────────────────────────────────┘
```

**Features:**

- Real-time member count
- Month-over-month percentage change
- Green (↑) for positive, Orange (↓) for negative
- Smooth line chart showing daily trends
- Interactive tooltips on hover

### 2. Current Revenue Card

```
┌────────────────────────────────┐
│  Current Revenue               │
│  ───────────────              │
│                                │
│       💰 ₱28,530.00           │
│                                │
│  Current active sessions       │
│  revenue                       │
│                                │
└────────────────────────────────┘
```

**Features:**

- Shows total from all pending sessions
- Updates in real-time
- Philippine Peso format

### 3. Today's Metrics Cards

```
┌────────────────────────────────────────────────────────┐
│  Today's Sessions     │  Today's Revenue               │
│  ────────────────     │  ───────────────              │
│                       │                                │
│  ⏱️  1h 17m           │  💵 ₱430.00                    │
│  ↑ 2%                │  ↓ 17%                         │
│  Compared to yesterday│  Compared to yesterday         │
└────────────────────────────────────────────────────────┘
```

**Features:**

- Average session duration today
- Total revenue today
- Day-over-day comparison
- Real-time updates

### 4. Chart Components

#### Line Chart (Trend Visualization)

```
    Value
      ↑
      │        ╱╲
      │   ╱╲  ╱  ╲    ╱╲
      │  ╱  ╲╱    ╲  ╱  ╲
      │ ╱          ╲╱    ╲
      └─────────────────────→ Time
       Oct 1    Oct 15   Oct 31
```

**Properties:**

- Smooth curves (tension: 0.4)
- Semi-transparent fill
- Color-coded by change type
- Responsive sizing

#### Bar Chart (Comparison)

```
    Value
      ↑
      │     ████
      │     ████
      │ ██  ████
      │ ██  ████
      └──────────→
        Last This
        Month Month
```

**Properties:**

- Side-by-side comparison
- Color-coded bars
- Compact design

## Color Coding

### Positive Changes (Green)

- Color: `#10b981` (green-500)
- Icon: ↑ (arrow up)
- Background: Light green with transparency
- Used for: Growth, increases, improvements

### Negative Changes (Orange)

- Color: `#f59e0b` (amber-500)
- Icon: ↓ (arrow down)
- Background: Light orange with transparency
- Used for: Decline, decreases, reductions

### Neutral Elements

- Color: `#e5e7eb` (gray-200)
- Used for: Previous period data, placeholders

## Interactive Elements

### Hover States

#### KPI Cards

```
Normal:     [Card with normal shadow]
Hover:      [Card with elevated shadow]
```

#### Charts

```
Normal:     [Chart with standard view]
Hover:      [Tooltip showing exact values]
            ┌─────────────┐
            │ Oct 15      │
            │ 125 members │
            └─────────────┘
```

### Chart Tooltips

```
┌─────────────────────┐
│ October 15, 2025    │
│ Members: 125        │
│ ────────────────── │
│ (Hover over point)  │
└─────────────────────┘

┌─────────────────────┐
│ October 15, 2025    │
│ Avg Session: 2h 45m │
│ ────────────────── │
│ (Hover over point)  │
└─────────────────────┘
```

## Responsive Behavior

### Desktop (> 1024px)

```
┌─────────────────────────────────────────┐
│  [KPI Cards]      │  [Revenue]          │
│  [Active Sessions]│  [Today's Metrics]  │
│                   │  [Recent Activity]  │
└─────────────────────────────────────────┘
```

### Tablet (768px - 1024px)

```
┌─────────────────────────────┐
│  [KPI Cards]                │
│  [Revenue]                  │
│  [Today's Metrics]          │
│  [Active Sessions]          │
│  [Recent Activity]          │
└─────────────────────────────┘
```

### Mobile (< 768px)

```
┌───────────────────┐
│  [KPI Card 1]     │
│  [KPI Card 2]     │
│  [Revenue]        │
│  [Metric 1]       │
│  [Metric 2]       │
│  [Sessions]       │
│  [Activity]       │
└───────────────────┘
```

## Data Update Flow

```
┌─────────────┐
│  Database   │
│  (SQLite)   │
└──────┬──────┘
       │
       │ Query
       ↓
┌──────────────────────────┐
│ dashboardStatistics      │
│ Service.js               │
│ - Calculate stats        │
│ - Format data            │
│ - Generate chart data    │
└───────────┬──────────────┘
            │
            │ IPC Call
            ↓
┌──────────────────────────┐
│ dashboardFunctions.js    │
│ - Fetch data             │
│ - Update reactive state  │
└───────────┬──────────────┘
            │
            │ Render
            ↓
┌──────────────────────────┐
│ Dashboard.vue            │
│ - Display KPI cards      │
│ - Render charts          │
│ - Show recent activity   │
└──────────────────────────┘
```

## Loading States

### Initial Load

```
┌────────────────────────────┐
│  Total Members             │
│  ────────────────          │
│                            │
│  Loading...                │
│  0%                        │
│  Loading...                │
│                            │
│  [No chart yet]            │
└────────────────────────────┘
```

### Data Loaded

```
┌────────────────────────────┐
│  Total Members             │
│  ────────────────          │
│                            │
│  114                       │
│  ↑ 22%                     │
│  Compared to last month    │
│                            │
│  [Chart renders]           │
└────────────────────────────┘
```

## Accessibility Features

1. **Keyboard Navigation**: All interactive elements are keyboard accessible
2. **Screen Readers**: Proper ARIA labels on charts and cards
3. **Color Contrast**: Meets WCAG AA standards
4. **Focus Indicators**: Visible focus states on all interactive elements
5. **Semantic HTML**: Proper heading hierarchy and structure

## Print View

```
╔═══════════════════════════════════════╗
║  FORREST RFID DASHBOARD REPORT        ║
║  Generated: October 1, 2025           ║
╠═══════════════════════════════════════╣
║                                       ║
║  Total Members: 114 (↑22%)            ║
║  Avg Session: 2h 31m (↓12%)           ║
║  Current Revenue: ₱28,530.00          ║
║                                       ║
║  Today's Statistics:                  ║
║  - Sessions: 1h 17m (↑2%)             ║
║  - Revenue: ₱430.00 (↓17%)            ║
║                                       ║
║  [Charts as images]                   ║
║                                       ║
╚═══════════════════════════════════════╝
```

---

**Note**: This visual guide represents the logical structure and design. Actual rendering may vary based on screen size, theme, and data availability.
