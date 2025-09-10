<template>
  <div class="flex flex-col gap-4 w-full">
    <div
      v-for="session in filteredSessions"
      :key="session.id"
      class="bg-[#fdfeff] border border-gray-300 rounded-2xl p-5 transition-all duration-300 w-full h-full"
    >
      <!-- Simple flex layout with fixed widths for perfect alignment -->
      <div
        class="flex items-center gap-2 justify-between h-full w-full overflow-hidden"
      >
        <!-- User info section -->
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <AvatarInitials
            :name="session.name"
            size="w-12 h-12"
            textSize="text-sm"
            :backgroundColor="
              session.isMember ? 'bg-primary1/80' : 'bg-orange-500'
            "
          />
          <HeaderAndSubtext
            :header="session.name"
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
              :header="session.currentBill"
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
              :header="session.duration"
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
</template>

<script setup>
import { computed } from "vue";
import IconButton from "@/components/shared/Clickables/IconButton.vue";
import AvatarInitials from "@/components/shared/DisplayText/AvatarInitials.vue";
import HeaderAndSubtext from "@/components/shared/DisplayText/HeaderAndSubtext.vue";

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

const emit = defineEmits(["delete-session"]);

// Filter sessions based on search term
const filteredSessions = computed(() => {
  if (!props.searchTerm) {
    return props.sessions;
  }

  return props.sessions.filter(
    (session) =>
      session.name.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
      session.rfid.includes(props.searchTerm)
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
