<template>
  <div class="p-8 bg-background min-h-screen w-full overflow-x-hidden">
    <div class="flex flex-col gap-4 w-full">
      <UserCard
        v-for="user in users"
        :key="user.id"
        :user="user"
        @view="handleViewButton"
        @edit="handleEditButton"
        @delete="handleDeleteButton"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import UserCard from "../composables/Cards/UserCard.vue";

// Sample user data - replace with actual data from your database
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

//Button Functions
const handleViewButton = (user) => {
  console.log("View user:", user);
  // Implement view user functionality
};

const handleEditButton = (user) => {
  console.log("Edit user:", user);
  // Implement edit user functionality
};

const handleDeleteButton = (user) => {
  console.log("Delete user:", user);
  // Implement delete user functionality
};
</script>

<style scoped>
/* No additional styles needed - using Tailwind classes */
</style>
