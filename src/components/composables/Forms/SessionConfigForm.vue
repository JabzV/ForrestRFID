<template>
  <div class="">
    <CustomInput
      :dialogFields="sampleDialog"
      :initialData="configData"
      customClass="gap-6 p-1"
      :showSubmitButton="false"
      @watch:payload="handleWatchInitialData"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import CustomInput from "../../shared/Forms/CustomInput.vue";

const props = defineProps({
  config: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["watch:payload"]);

const configData = computed(() => {
  // Convert array to object if we have data
  if (props.config.length > 0) {
    return props.config[0]; // Assuming first record
  }
  return {};
});

const sampleDialog = [
  {
    field: "enable_promos",
    type: "dropdown",
    label: "Enable Promos",
    options: [
      { name: "Enabled", id: 1 },
      { name: "Disabled", id: 2 },
    ],
    isRequired: true,
    subtext: "This is the promo enabled status",
  },
  {
    field: "time_rounding",
    placeholder: "Time Rounding",
    type: "text",
    label: "Time Rounding",
    isRequired: true,
    subtext: "This is the time rounding per session",
  },
  {
    field: "grace_period",
    placeholder: "Grace Period",
    type: "text",
    label: "Grace Period",
    subtext: "Free time before billing starts",
    isRequired: true,
  },
  {
    field: "minimum_billable_session",
    placeholder: "Minimum Billable Session",
    type: "text",
    label: "Minimum Billable Session",
    isRequired: true,
    subtext: "Session below this will not be billed",
  },
];

const handleWatchInitialData = (data) => {
  emit("watch:payload", data);
};
</script>
