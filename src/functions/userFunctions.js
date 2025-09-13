import { ref } from "vue";


export function useUserFunctions() {
    //sample data
    const users = ref([
        {
          id: 1,
          name: "Jabez Vestidas",
          rfid: "31200039",
          dateRegistered: "05/25/25",
          totalSessions: 23,
          totalTime: "29h 17m",
          totalPaid: "₱1,492.00",
        },
        {
          id: 2,
          name: "John Doe",
          rfid: "31200040",
          dateRegistered: "05/20/25",
          totalSessions: 15,
          totalTime: "18h 45m",
          totalPaid: "₱950.00",
        },
        {
          id: 3,
          name: "Jane Smith",
          rfid: "31200041",
          dateRegistered: "05/18/25",
          totalSessions: 8,
          totalTime: "12h 30m",
          totalPaid: "₱650.00",
        },
      ]);

      const handleViewButton = (user) => {
        console.log("View user:", user);
      };
      
      const handleEditButton = (user) => {
        console.log("Edit user:", user);
      };
      
      const handleDeleteButton = (user) => {
        console.log("Delete user:", user);
      };

      const addUser = () => {
        const functionName = "Add User"
        console.log("Add session clicked");

        return functionName
      };

    return { 
        users, 
        handleViewButton, 
        handleEditButton, 
        handleDeleteButton
    };
}

