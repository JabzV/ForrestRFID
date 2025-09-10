<template>
  <div class="p-8 bg-background w-full overflow-x-hidden">
    <div class="flex flex-col gap-4 w-full">
      <UserCard
        v-for="user in historyList"
        :key="user.id"
        :user="user"
        :statusClass="getStatusClass(user.status)"
        :withActions="false"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import UserCard from "../composables/Cards/UserCard.vue";
import { useUserHistory } from "../../functions/userHistory";
import { useTopbarButtonState } from "../../../store/vueStore/topbarButtonState";
import { getHistoryList } from "../../../store/vueStore/History/historyList";
import {
  formatDateToTime,
  formatDate,
  formatDuration,
  sentenceCase,
  formatToMMDDYY,
} from "../../services/utils";
const historyList = ref([]);
const { users } = useUserHistory();

onMounted(async () => {
  useTopbarButtonState().setButtonState("Export Data");
  await loadData();
  console.log(historyList.value);
});

const loadData = async () => {
  historyList.value = await getHistoryList();
  historyList.value.forEach((user) => {
    user.sessionDate = formatToMMDDYY(formatDate(user.created_at));
    if (user.time_in) {
      user.time_in = formatDateToTime(user.time_in);
    }
    if (user.time_out) {
      user.time_out = formatDateToTime(user.time_out);
    }
    if (user.duration) {
      user.duration = formatDuration(user.duration);
    }
    if (user.amount_paid) {
      user.amount_paid = `₱${user.amount_paid}`;
    }
    if (user.status) {
      user.status = sentenceCase(user.status);
    }
  });
};

// Status styling function
const getStatusClass = (status) => {
  const classes = {
    pending: "bg-warning-light text-warning",
    completed: "bg-success-light text-success",
    cancelled: "bg-danger-light text-danger",
  };
  return classes[status.toLowerCase()] || "bg-gray-100 text-gray-600";
};
</script>
