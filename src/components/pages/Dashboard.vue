<template>
  <div class="p-8 bg-background w-full overflow-x-hidden">
    <div class="flex gap-6">
      <!-- Left Column: blabla and Active Sessions -->
      <div class="w-7/13 flex flex-col gap-6">
        <!-- Session Profiles -->
        <div>
          <KpiCard
            :left-kpi="totalMembersKpi"
            :right-kpi="avgSessionKpi"
            height="auto"
          />
        </div>

        <!-- Active Sessions -->
        <div>
          <ConfigCard
            title="Active Sessions"
            bg-color="bg-danger"
            show-add-button="true"
            add-button-text="End a Session"
            @add="handleEndSession"
            max-height="max-h-full"
            icon-class="pi pi-users"
            :show-input-field="true"
            input-placeholder="Search sessions..."
            @input-change="handleSessionSearch"
          >
            <ActiveSessionsList
              :sessions="activeSessions"
              :search-term="searchTerm"
              @delete-session="handleDeleteSession"
            />
          </ConfigCard>
        </div>
      </div>

      <!-- Right Column: Current Revenue and moemoe -->
      <div class="flex-1 flex flex-col gap-6">
        <!-- Current Revenue -->
        <div>
          <CurrentRevenueCard
            title="Current Revenue"
            :revenue="currentRevenue"
          />
        </div>

        <!-- moemoe -->
        <div>
          <KpiCard
            :left-kpi="todaySessionsKpi"
            :right-kpi="todayRevenueKpi"
            :show-graphs="false"
            height="auto"
          />
        </div>

        <!-- Recent Activity -->
        <div>
          <ConfigCard title="Recent Activity" icon-class="pi pi-clock">
            <RecentActivityList :activities="recentActivity" />
          </ConfigCard>
        </div>
      </div>
    </div>

    <CustomDialog :title="dynamicTitle" :closable="true" ref="customDialog">
      <CustomInput
        v-if="submitMode !== 'deleteSession' && !isScanning"
        :dialogFields="dynamicFields"
        :initialData="payload"
        @submit:data="handleSubmit"
      />
      <DeleteDialog
        v-if="submitMode === 'deleteSession' && !isScanning"
        title="Cancel Session"
        message="Are you sure you want to cancel this session?"
        @cancel="customDialog.closeModal()"
        @proceed="handleCancelSession"
      />
      <div v-if="isScanning">
        <input id="rfidInput" maxlength="10" class="opacity-0 h-1" />
        <ScanningDisplay :timeout="scanTimer" @timeout="handleScanTimeout" />
      </div>
    </CustomDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import ConfigCard from "../composables/Cards/ConfigCard.vue";
import KpiCard from "../composables/Cards/KpiCard.vue";
import CurrentRevenueCard from "../composables/Cards/CurrentRevenueCard.vue";
import ActiveSessionsList from "../composables/Display/ActiveSessionsList.vue";
import RecentActivityList from "../composables/Display/RecentActivityList.vue";
import { useDashboardFunctions } from "../../functions/dashboardFunctions.js";
import { useTopbarButtonState } from "../../../store/vueStore/topbarButtonState";
import {
  sessionDialogFields,
  getSessionDialogFields,
  createSession,
  endSession,
} from "../../../store/vueStore/Dashboard/sessionList";
import CustomDialog from "../composables/Dialogs/CustomDialog.vue";
import CustomInput from "../shared/Forms/CustomInput.vue";
import DeleteDialog from "../composables/Dialogs/DeleteDialog.vue";
import { useToast } from "../../services/useToast";
import ScanningDisplay from "../composables/Display/ScanningDIsplay.vue";
import { rfidScanner } from "../../services/utils";

// Get dashboard data
const { statistics, activeSessions, recentActivity } = useDashboardFunctions();

const customDialog = ref(null);
const dynamicFields = ref([...sessionDialogFields]);
const dynamicTitle = ref("Add Session");
const submitMode = ref(null);
const { toast } = useToast();
const isScanning = ref(false);
const payload = ref({});
let timerValue = 15000;
let rfidScannerPromise = null;
const scanTimer = ref(timerValue); // 30 seconds timeout

onMounted(async () => {
  useTopbarButtonState().setButtonState("Add Session", openModal);
});

const openModal = async () => {
  await loadModalData();
  if (customDialog.value) {
    submitMode.value = "addSession";
    payload.value = {};
    console.log("Opening modal");
    customDialog.value.openModal();
  }
};

const closeModal = () => {
  if (customDialog.value) {
    console.log("Closing modal");
    customDialog.value.closeModal();
  }
};

const loadModalData = async () => {
  try {
    dynamicFields.value = await getSessionDialogFields();
    console.log("Dashboard loaded with populated fields:", dynamicFields.value);
  } catch (error) {
    console.error("Error loading session dialog fields:", error);
  }
};

// KPI data for BlablaCard - using data from dashboard functions
const totalMembersKpi = computed(() => ({
  title: "Total Members",
  value: statistics.value.totalMembers.value,
  change: statistics.value.totalMembers.change,
  changeType: statistics.value.totalMembers.changeType,
  description: statistics.value.totalMembers.description,
}));

const avgSessionKpi = computed(() => ({
  title: "Avg. Session",
  value: statistics.value.avgSession.value,
  change: statistics.value.avgSession.change,
  changeType: statistics.value.avgSession.changeType,
  description: statistics.value.avgSession.description,
}));

const todaySessionsKpi = computed(() => ({
  title: "Today's Sessions",
  value: statistics.value.todaySessions.value,
  change: statistics.value.todaySessions.change,
  changeType: statistics.value.todaySessions.changeType,
  description: statistics.value.todaySessions.description,
}));

const todayRevenueKpi = computed(() => ({
  title: "Today's Revenue",
  value: statistics.value.todayRevenue.value,
  change: statistics.value.todayRevenue.change,
  changeType: statistics.value.todayRevenue.changeType,
  description: statistics.value.todayRevenue.description,
}));

const currentRevenue = computed(() => ({
  value: statistics.value.currentRevenue.value,
  description: statistics.value.currentRevenue.description,
}));

// Search functionality
const searchTerm = ref("");

const handleSessionSearch = (value) => {
  searchTerm.value = value;
};

const handleSubmit = (data) => {
  isScanning.value = true;
  rfidScannerPromise = rfidScanner("rfidInput");

  rfidScannerPromise
    .then(async (rfid) => {
      if (!isScanning.value) return;
      data.rfid = rfid;
      const cleanData = JSON.parse(JSON.stringify(data));
      try {
        const result = await createSession(cleanData);
        closeModal();
        toast("Session created successfully", "success");
        isScanning.value = false;
        document.getElementById("rfidInput").value = "";
        scanTimer.value = timerValue;
      } catch (error) {
        closeModal();
        isScanning.value = false;
        toast(error, "danger");
      }
      closeModal();
    })
    .catch((error) => {
      isScanning.value = false;
      toast("RFID scanning failed: " + error, "danger");
    });
};

const handleEndSession = async () => {
  if (customDialog.value) {
    dynamicTitle.value = "End Session";
    submitMode.value = "endSession";
    payload.value = {};
    customDialog.value.openModal();
    isScanning.value = true;

    // Wait for DOM to update and input to be rendered
    await nextTick();
    setTimeout(() => {
      rfidScannerPromise = rfidScanner("rfidInput");

      rfidScannerPromise
        .then(async (rfid) => {
          console.log("RFID scanned:", rfid);
          if (!isScanning.value) return;

          let data = { rfid: rfid };
          const cleanData = JSON.parse(JSON.stringify(data));

          try {
            const result = await endSession(cleanData);
            toast("Session ended successfully", "success");
            isScanning.value = false;
            document.getElementById("rfidInput").value = "";
            scanTimer.value = timerValue;
            closeModal();
          } catch (error) {
            isScanning.value = false;
            toast(error.message || error, "danger");
            closeModal();
          }
        })
        .catch((error) => {
          isScanning.value = false;
          toast("RFID scanning failed: " + error, "danger");
          closeModal();
        });
    }, 100);
  }
};

const handleDeleteSession = (sessionId) => {
  // Remove session from the list
  const index = activeSessions.value.findIndex(
    (session) => session.id === sessionId
  );
  if (index > -1) {
    activeSessions.value.splice(index, 1);
  }
};
</script>

<style scoped></style>
