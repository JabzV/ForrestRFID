<template>
  <div v-if="!isLoading" class="flex flex-col gap-4 w-full">
    <div
      v-for="(session, index) in filteredSessions"
      :key="index"
      class="bg-[#fdfeff] border border-gray-300 rounded-2xl p-5 transition-all duration-300 w-full h-full"
    >
      <!-- Simple flex layout with fixed widths for perfect alignment -->
      <div
        class="flex items-center gap-2 justify-between h-full w-full overflow-hidden"
      >
        <!-- User info section -->
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <AvatarInitials
            :name="session.full_name"
            size="w-12 h-12"
            textSize="text-sm"
            :backgroundColor="
              session.member_type === 'Member'
                ? 'bg-primary1/80'
                : 'bg-warning-dark'
            "
          />
          <HeaderAndSubtext
            :header="session.full_name"
            :subtext="`RFID: ${session.rfid}`"
            textSize="text-2xl"
            :setUniformwidth="false"
            textAlign="text-left"
          />
        </div>

        <!-- Data fields with fixed widths -->
        <div class="flex items-center gap-6 flex-shrink-0">
          <!-- Current Bill -->
          <div class="w-24">
            <HeaderAndSubtext
              :header="currentBill"
              subtext="Current Bill"
              :semibold="false"
              textSize="text-2xl"
              textAlign="text-center"
              headerColor="text-success"
            />
          </div>

          <!-- Duration -->
          <div class="w-24">
            <HeaderAndSubtext
              :header="formatTime(session.elapsed)"
              subtext="Duration"
              :semibold="false"
              textSize="text-2xl"
              textAlign="text-center"
              headerColor="text-gray-900"
            />
          </div>
          <div class="flex items-center px-4 flex-shrink-0 ml-2">
            <IconButton
              icon="pi pi-ban"
              iconSize="1"
              iconColor="text-danger"
              buttonColor="bg-danger-light"
              containerSize="w-9 h-9"
              @click="deleteSession(session.id)"
            />
          </div>
        </div>

        <!-- Right section: Action button -->
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="filteredSessions.length === 0"
      class="text-center py-8 text-gray-500"
    >
      <i class="pi pi-users text-4xl mb-2"></i>
      <p>No active sessions found</p>
    </div>
  </div>
  <div v-else class="flex items-center justify-center h-full">
    <div
      class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary1/85"
    ></div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import IconButton from "@/components/shared/Clickables/IconButton.vue";
import AvatarInitials from "@/components/shared/DisplayText/AvatarInitials.vue";
import HeaderAndSubtext from "@/components/shared/DisplayText/HeaderAndSubtext.vue";
import { ipcHandle } from "../../../../ipc/ipcHandler.js";

const props = defineProps({
  sessions: {
    type: Array,
    default: () => [],
  },
  searchTerm: {
    type: String,
    default: "",
  },
});

const isLoading = ref(false);
const currentBill = ref("₱0.00");

onMounted(async () => {
  await updateAllTimers();
  setInterval(updateAllTimers, 1000);
});

const updateAllTimers = async () => {
  props.sessions.forEach(async (session) => {
    session.elapsed = calculateDuration(session.time_in);
    let cleanedSession = JSON.parse(JSON.stringify(session));
    const billResult = (await ipcHandle("calculateBill", cleanedSession))[0]
      .currentBill;
    currentBill.value = `₱${parseFloat(billResult).toFixed(2)}`;
  });
};

const calculateDuration = (time_in) => {
  const now = new Date();
  const timeIn = new Date(time_in);
  const elapsed = Math.round((now - timeIn) / 1000);

  return elapsed;
};

function formatTime(seconds) {
  if (seconds !== "00:00:00") {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return [
      String(hrs).padStart(2, "0"),
      String(mins).padStart(2, "0"),
      String(secs).padStart(2, "0"),
    ].join(":");
  }
  return "00:00:00";
}

const emit = defineEmits(["delete-session"]);

// Filter sessions based on search term
const filteredSessions = computed(() => {
  if (!props.searchTerm) {
    return props.sessions;
  }

  const searchLower = props.searchTerm.toLowerCase();
  return props.sessions.filter(
    (session) =>
      session.full_name.toLowerCase().includes(searchLower) ||
      session.rfid.toLowerCase().includes(searchLower)
  );
});

// Handle session deletion
const deleteSession = (sessionId) => {
  emit("delete-session", sessionId);
};
</script>

<style scoped>
/* Custom styles if needed */
</style>
