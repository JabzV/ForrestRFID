import { ref, onMounted } from "vue";

/**
 * Dashboard Functions Composable
 * Fetches and manages real-time dashboard statistics from the database
 */
export function useDashboardFunctions() {
    // Initialize with default values to prevent undefined errors
    const statistics = ref({
        totalMembers: {
            value: "0",
            change: "0%",
            changeType: "positive",
            description: "Loading...",
            chartData: []
        },
        avgSession: {
            value: "0h 0m",
            change: "0%",
            changeType: "positive",
            description: "Loading...",
            chartData: []
        },
        currentRevenue: {
            month: {
                value: "₱0.00",
                change: "0%",
                changeType: "positive",
                description: "Loading...",
                chartData: []
            },
            year: {
                value: "₱0.00",
                change: "0%",
                changeType: "positive",
                description: "Loading...",
                chartData: []
            }
        },
        todaySessions: {
            value: "0h 0m",
            change: "0%",
            changeType: "positive",
            description: "Loading...",
            chartData: []
        },
        todayRevenue: {
            value: "₱0.00",
            change: "0%",
            changeType: "positive",
            description: "Loading...",
            chartData: []
        }
    });
    const recentActivity = ref([]);
    const isLoading = ref(false);

    // Load dashboard data from database
    const loadDashboardData = async () => {
        try {
            isLoading.value = true;
            
            // Fetch statistics from backend via IPC
            const stats = await window.electron.ipcRenderer.invoke('getDashboardStats');
            
            console.log('📊 Dashboard stats loaded:', stats);
            
            if (stats) {
                statistics.value = {
                    totalMembers: {
                        value: stats.totalMembers.value,
                        change: stats.totalMembers.change,
                        changeType: stats.totalMembers.changeType,
                        description: stats.totalMembers.description,
                        chartData: stats.totalMembers.chartData || []
                    },
                    avgSession: {
                        value: stats.avgSession.value,
                        change: stats.avgSession.change,
                        changeType: stats.avgSession.changeType,
                        description: stats.avgSession.description,
                        chartData: stats.avgSession.chartData || []
                    },
                    currentRevenue: stats.currentRevenue,
                    todaySessions: {
                        value: stats.todaySessions.value,
                        change: stats.todaySessions.change,
                        changeType: stats.todaySessions.changeType,
                        description: stats.todaySessions.description,
                        chartData: stats.todaySessions.chartData || []
                    },
                    todayRevenue: {
                        value: stats.todayRevenue.value,
                        change: stats.todayRevenue.change,
                        changeType: stats.todayRevenue.changeType,
                        description: stats.todayRevenue.description,
                        chartData: stats.todayRevenue.chartData || []
                    }
                };
                
                console.log('📈 Chart data for Total Members:', statistics.value.totalMembers.chartData);
                console.log('📉 Chart data for Avg Session:', statistics.value.avgSession.chartData);
                
                // Update recent activity if provided
                if (stats.recentActivity) {
                    recentActivity.value = stats.recentActivity;
                }
            }
        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            // Keep default values on error
        } finally {
            isLoading.value = false;
        }
    };

    // Load data on mount
    onMounted(() => {
        loadDashboardData();
    });

    return {
        statistics,
        recentActivity,
        loadDashboardData,
        isLoading
    };
}
