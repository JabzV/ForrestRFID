<template>
  <div class="p-8 bg-background w-full overflow-x-hidden">
    <div class="flex gap-6">
      <!-- Session Profiles -->
      <div class="flex-1">
        <ConfigCard
          title="Session Profiles"
          icon-class="pi pi-clock"
          :show-add-button="true"
          add-button-text="Add Profile"
          @add="addProfile"
          max-height="max-h-96"
        >
          <!-- Table Header -->
          <CustomDataTable
            :headers="['Name', 'Rate', 'Unit', 'Date Created', 'Actions']"
            gap-class="gap-4"
          >
            <DataTableContentCard
              v-for="profile in sessionProfiles"
              :key="profile.id"
              :profile="profile"
              :columnNumber="5"
              gap-class="gap-4"
              @edit="editProfile"
              @delete="deleteProfile"
            />
          </CustomDataTable>

          <div v-if="sessionProfiles.length === 0" class="text-center py-12">
            <i class="pi pi-clock text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500">No session profiles created yet</p>
            <p class="text-sm text-gray-400">
              Click "Add Profile" to create your first session profile
            </p>
          </div>
        </ConfigCard>

        <CustomDialog title="Add Profile" :closable="true" ref="customDialog">
          <h1>Sample</h1>
        </CustomDialog>
      </div>

      <!-- Session Configuration -->
      <div class="w-2/5">
        <ConfigCard
          title="Session Configuration"
          icon-class="pi pi-cog"
          :show-add-button="true"
          add-button-text="Edit"
          @add="editConfiguration"
        >
          <SessionConfigForm :config="sessionConfig" />
        </ConfigCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ConfigCard from "../composables/Cards/ConfigCard.vue";
import SessionConfigForm from "../composables/Forms/SessionConfigForm.vue";
import { useTopbarButtonState } from "../../../store/vueStore/topbarButtonState";
import CustomDataTable from "../composables/DataTables/CustomDataTable.vue";
import DataTableContentCard from "../composables/Cards/DataTableContentCard.vue";
import CustomDialog from "../composables/Dialogs/CustomDialog.vue";

//Store Imports
import { loadSessionProfiles } from "../../../store/vueStore/Settings/sessionProfile";
import { loadSessionConfiguration } from "../../../store/vueStore/Settings/sessionConfiguration";
import { loadAccountRoles } from "../../../store/vueStore/Settings/accountRoles";

const sessionConfig = ref([]);
const sessionProfiles = ref([]);
const accountRoles = ref([]);
const customDialog = ref(null);

onMounted(async () => {
  useTopbarButtonState().setButtonState();
  await loadData();
});

const loadData = async () => {
  sessionProfiles.value = await loadSessionProfiles();
  sessionConfig.value = await loadSessionConfiguration();
  accountRoles.value = await loadAccountRoles();
};

const addProfile = () => {
  customDialog.value.openModal();
  // TODO: Implement add profile functionality
};

const editProfile = (profile) => {
  console.log("Edit profile:", profile);
  // TODO: Implement edit profile functionality
};

const deleteProfile = (profile) => {
  console.log("Delete profile:", profile);
  // TODO: Implement delete profile functionality
};

const editConfiguration = () => {
  console.log("Edit configuration clicked");
  // TODO: Implement edit configuration functionality
};
</script>

<style scoped></style>
