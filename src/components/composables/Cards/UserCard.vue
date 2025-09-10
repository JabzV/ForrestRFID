<template>
  <div
    class="bg-[#fdfeff] border border-gray-300 rounded-[20px] p-6 lg:px-8 lg:py-6 min-h-26 transition-all duration-300 w-full"
  >
    <!-- Simple flex layout with fixed widths for perfect alignment -->
    <!-- Left section: User info and data fields -->
    <div class="flex items-center gap-4 justify-between">
      <!-- User info section -->
      <div class="flex items-center gap-4 w-72 flex-shrink-0">
        <AvatarInitials
          v-if="user.full_name"
          :name="user.full_name"
          size="w-15 h-15"
          textSize="text-xl"
          :backgroundColor="
            user.full_name === 'Non Member'
              ? 'bg-warning-dark'
              : 'bg-primary1/80'
          "
        />

        <HeaderAndSubtext
          v-if="user.full_name"
          :header="user.full_name"
          :subtext="`RFID: ${user.rfid}`"
          textSize="text-2xl"
          :setUniformwidth="false"
          textAlign="text-left"
        />
      </div>

      <!-- Data fields with fixed widths -->
      <!-- Time In / Date Registered -->
      <div class="flex items-center gap-4">
        <HeaderAndSubtext
          v-if="user.dateRegistered"
          :header="user.dateRegistered"
          :subtext="'Date Registered'"
          :semibold="false"
          textSize="text-2xl"
          textAlign="text-center"
        />

        <HeaderAndSubtext
          v-if="user.time_in"
          :header="user.time_in"
          :subtext="'Time In'"
          :semibold="false"
          textSize="text-2xl"
          textAlign="text-center"
        />

        <!-- Time Out / Total Sessions -->

        <HeaderAndSubtext
          v-if="user.time_out || user.status"
          :header="
            user.status.toLowerCase() !== 'completed' ? '-' : user.time_out
          "
          :subtext="'Time Out'"
          :semibold="false"
          textSize="text-2xl"
          textAlign="text-center"
        />

        <!-- Duration / Total Time -->

        <HeaderAndSubtext
          v-if="user.duration || user.status"
          :header="
            user.status.toLowerCase() !== 'completed'
              ? '-'
              : user.duration || user.totalTime || '-'
          "
          :subtext="user.duration ? 'Duration' : 'Total Time'"
          :semibold="false"
          textSize="text-2xl"
          textAlign="text-center"
        />

        <!-- Total Paid -->

        <HeaderAndSubtext
          v-if="user.amount_paid || user.status"
          :header="
            user.status.toLowerCase() !== 'completed'
              ? '-'
              : user.amount_paid || '-'
          "
          subtext="Amount Paid"
          :semibold="false"
          textSize="text-2xl"
          textAlign="text-center"
          headerColor="text-success"
        />

        <!-- Session Date - only for History page -->
        <HeaderAndSubtext
          v-if="user.sessionDate"
          :header="user.sessionDate"
          subtext="Session Date"
          :semibold="false"
          textSize="text-2xl"
          textAlign="text-center"
        />

        <!-- Status - only for History page -->
        <div
          v-if="user.status"
          class="w-28 ml-2 flex justify-center items-center rounded-lg"
          :class="statusClass"
        >
          <span class="px-3 py-2 text-lg font-medium text-center">
            {{ user.status }}
          </span>
        </div>

        <!-- Right section: Action buttons - only show for user data, not time log data -->
        <div
          v-if="withActions"
          class="flex items-center gap-3 flex-shrink-0 ml-6"
        >
          <IconButton
            icon="pi pi-id-card"
            iconSize="1.2"
            iconColor="text-success"
            buttonColor="bg-success-light"
            containerSize="w-11 h-11"
            @click="$emit('view', user)"
          />

          <IconButton
            icon="pi pi-pen-to-square"
            iconSize="1"
            iconColor="text-warning"
            buttonColor="bg-warning-light"
            containerSize="w-11 h-11"
            @click="$emit('edit', user)"
          />

          <IconButton
            icon="pi pi-trash"
            iconSize="1"
            iconColor="text-danger"
            buttonColor="bg-danger-light"
            containerSize="w-11 h-11"
            @click="$emit('delete', user)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import IconButton from "@/components/shared/Clickables/IconButton.vue";
import AvatarInitials from "@/components/shared/DisplayText/AvatarInitials.vue";
import HeaderAndSubtext from "@/components/shared/DisplayText/HeaderAndSubtext.vue";

defineProps({
  user: {
    type: Object,
    required: true,
  },
  statusClass: {
    type: String,
    default: "bg-gray-100 text-gray-600",
  },
  withActions: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["view", "edit", "delete"]);
</script>
