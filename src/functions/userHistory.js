import { ref, onMounted } from "vue";

export function useUserHistory() {
    const timeLogs = ref([]);

    // Load sample time logs data
    const loadTimeLogs = () => {
        timeLogs.value = [
            {
                id: 1,
                name: "Jabez Vestidas",
                rfid: "31200039",
                timeIn: "09:00 AM",
                timeOut: "11:30 AM",
                duration: "2h 30m",
                totalPaid: "₱150.00",
                sessionDate: "9/5/2025",
                status: "Completed"
            },
            {
                id: 2,
                name: "John Doe",
                rfid: "31200040",
                timeIn: "02:15 PM",
                timeOut: "04:45 PM",
                duration: "2h 30m",
                totalPaid: "₱150.00",
                sessionDate: "9/5/2025",
                status: "Completed"
            },
            {
                id: 3,
                name: "Jane Smith",
                rfid: "31200041",
                timeIn: "10:30 AM",
                timeOut: "12:00 PM",
                duration: "1h 30m",
                totalPaid: "₱90.00",
                sessionDate: "9/4/2025",
                status: "Completed"
            },
            {
                id: 4,
                name: "Diana Mae Batigulao",
                rfid: "31200220",
                timeIn: "8:39 PM",
                timeOut: "11:00 PM",
                duration: "2h 21m",
                totalPaid: "₱141.00",
                sessionDate: "9/4/2025",
                status: "Pending"
            },
            {
                id: 5,
                name: "Moge Moge",
                rfid: "31202504",
                timeIn: "8:39 PM",
                timeOut: "-",
                duration: "-",
                totalPaid: "-",
                sessionDate: "9/4/2025",
                status: "Cancelled"
            }
        ];
    };



    // Load data on mount
    onMounted(() => {
        loadTimeLogs();
    });

    return { 
        users: timeLogs,
        loadTimeLogs
    };
}

