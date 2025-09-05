import { ref, onMounted } from "vue";

export function useDashboardFunctions() {
    // Initialize with default values to prevent undefined errors
    const statistics = ref({
        totalMembers: {
            value: "0",
            change: "0%",
            changeType: "positive",
            description: "Loading..."
        },
        avgSession: {
            value: "0h 0m",
            change: "0%",
            changeType: "positive",
            description: "Loading..."
        },
        currentRevenue: {
            value: "₱0.00",
            description: "Loading..."
        },
        todaySessions: {
            value: "0h 0m",
            change: "0%",
            changeType: "positive",
            description: "Loading..."
        },
        todayRevenue: {
            value: "₱0.00",
            change: "0%",
            changeType: "positive",
            description: "Loading..."
        }
    });
    const activeSessions = ref([]);
    const recentActivity = ref([]);

    // Load dashboard data
    const loadDashboardData = () => {
        // Statistics data
        statistics.value = {
            totalMembers: {
                value: "114",
                change: "+22%",
                changeType: "positive",
                description: "Compared to last month"
            },
            avgSession: {
                value: "2h 31min",
                change: "-12%",
                changeType: "negative",
                description: "Compared to last month"
            },
            currentRevenue: {
                value: "₱28,530.00",
                description: "Current Revenue for the year"
            },
            todaySessions: {
                value: "1hr 17m",
                change: "+2%",
                changeType: "positive",
                description: "Compared to yesterday"
            },
            todayRevenue: {
                value: "₱430.00",
                change: "-17%",
                changeType: "negative",
                description: "Compared to yesterday"
            }
        };

        // Active sessions data
        activeSessions.value = [
            {
                id: 1,
                name: "Jabez Vestidas",
                rfid: "31200039",
                isMember: true,
                currentBill: "₱92.00",
                duration: "01:32:31",
                status: "active"
            },
            {
                id: 2,
                name: "Javen Cutaran",
                rfid: "31200230",
                isMember: true,
                currentBill: "₱66.00",
                duration: "00:52:31",
                status: "paused"
            },
            {
                id: 3,
                name: "Non-Member",
                rfid: "31231245",
                isMember: false,
                currentBill: "₱137.00",
                duration: "02:42:31",
                status: "active"
            },
            {
                id: 4,
                name: "Non-Member",
                rfid: "31123456",
                isMember: false,
                currentBill: "₱17.00",
                duration: "00:12:31",
                status: "active"
            },
            {
                id: 5,
                name: "Non-Member",
                rfid: "35523124",
                isMember: false,
                currentBill: "₱76.00",
                duration: "01:12:01",
                status: "active"
            },
            {
                id: 6,
                name: "Diana Batigulao",
                rfid: "33491741",
                isMember: true,
                currentBill: "₱112.00",
                duration: "01:52:31",
                status: "paused"
            }
        ];

        // Recent activity data
        recentActivity.value = [
            {
                id: 1,
                name: "Jabez Vestidas",
                rfid: "31200039",
                time: "03:12 PM",
                date: "08/08/25",
                action: "Time In"
            }
        ];
    };

    // Load data on mount
    onMounted(() => {
        loadDashboardData();
    });

    return {
        statistics,
        activeSessions,
        recentActivity,
        loadDashboardData
    };
}
