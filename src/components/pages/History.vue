<template>
  <div class="p-8 bg-background w-full overflow-x-hidden">
    <div class="flex flex-col gap-4 w-full">
      <UserCard
        v-for="user in users"
        :key="user.id"
        :user="user"
        :statusClass="getStatusClass(user.status)"
      />
    </div>
  </div>
</template>

<script setup>
import UserCard from "../composables/Cards/UserCard.vue";
import { useUserHistory } from "../../functions/userHistory";

const { users } = useUserHistory();

// Status styling function
const getStatusClass = (status) => {
  const classes = {
    pending: "bg-warning-light text-warning",
    completed: "bg-success-light text-success",
    cancelled: "bg-danger-light text-danger"
  };
  return classes[status.toLowerCase()] || "bg-gray-100 text-gray-600";
};
</script>
