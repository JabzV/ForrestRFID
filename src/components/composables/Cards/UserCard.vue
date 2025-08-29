<template>
  <div
    class="flex flex-col lg:flex-row items-start lg:items-center bg-[#fdfeff] border border-[#dedede] rounded-[20px] p-6 lg:p-8 gap-6 lg:gap-8 min-h-[126px] shadow-sm hover:shadow-md transition-shadow duration-200 w-full"
  >
    <!-- User icon and name section -->
    <div class="flex items-center gap-5 w-full lg:w-auto lg:flex-shrink-0">
      <AvatarInitials
        :name="user.name"
        size="w-15 h-15"
        textSize="text-xl"
        backgroundColor="bg-primary1/80"
      />

      <HeaderAndSubtext
        :header="user.name"
        :subtext="`RFID: ${user.rfid}`"
        :semibold="true"
      />
    </div>

    <!-- User statistics section -->
    <div
      class="flex flex-wrap lg:flex-row items-center gap-4 lg:gap-10 flex-1 w-full lg:w-auto justify-between lg:justify-end"
    >
      <HeaderAndSubtext
        v-if="user.dateRegistered"
        :header="user.dateRegistered"
        subtext="Date Registered"
        :semibold="false"
        textSize="text-xl"
        textAlign="text-center"
      />

      <HeaderAndSubtext
        v-if="user.totalSessions"
        :header="user.totalSessions"
        subtext="Total Sessions"
        :semibold="false"
        textSize="text-xl"
        textAlign="text-center"
      />

      <HeaderAndSubtext
        v-if="user.totalTime"
        :header="user.totalTime"
        subtext="Total Time"
        :semibold="false"
        textSize="text-xl"
        textAlign="text-center"
      />

      <HeaderAndSubtext
        v-if="user.totalPaid"
        :header="user.totalPaid"
        subtext="Total Paid"
        :semibold="false"
        textSize="text-xl"
        textAlign="text-center"
        headerColor="text-success"
        setUniformwidth="w-26"
      />
    </div>

    <!-- Action buttons -->
    <div
      class="flex items-center gap-3 lg:gap-4 self-end lg:self-auto flex-shrink-0"
    >
      <IconButton
        icon="pi pi-id-card"
        iconSize="1.1"
        iconColor="text-success"
        buttonColor="bg-success-light"
        hoverColor="bg-success-dark"
        containerSize="w-11 h-11"
        @click="$emit('view', user)"
      />

      <IconButton
        icon="pi pi-pen-to-square"
        iconSize="1"
        iconColor="text-warning"
        buttonColor="bg-warning-light"
        hoverColor="bg-warning-dark"
        containerSize="w-11 h-11"
        @click="$emit('edit', user)"
      />

      <IconButton
        icon="pi pi-trash"
        iconSize="1"
        iconColor="text-danger"
        buttonColor="bg-danger-light"
        hoverColor="bg-danger-dark"
        containerSize="w-11 h-11"
        @click="$emit('delete', user)"
      />
    </div>
  </div>
</template>

<script setup>
import IconButton from "@/components/shared/IconButton.vue";
import AvatarInitials from "@/components/shared/AvatarInitials.vue";
import HeaderAndSubtext from "@/components/shared/HeaderAndSubtext.vue";

defineProps({
  user: {
    type: Object,
    required: true,
  },
});

defineEmits(["view", "edit", "delete"]);
</script>
