<template>
  <div class="p-3 md:p-4 lg:p-6 xl:p-8 bg-background w-full overflow-x-hidden">
    <div class="flex flex-col 2xl:flex-row gap-3 md:gap-4 lg:gap-6">
      <!-- Left Column: blabla and Active Sessions -->
      <div class="w-full 2xl:w-7/12 flex flex-col gap-3 md:gap-4 lg:gap-6">
        <!-- Session Profiles -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
          <!-- Total Members Card -->
          <div
            class="bg-[#fdfeff] border border-gray-300 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            @click="navigateToUsers"
          >
            <div class="flex flex-col h-full">
              <h3
                class="text-gray-600 text-sm md:text-base font-semibold mb-2 tracking-wider uppercase"
              >
                {{ totalMembersKpi.title }}
              </h3>
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <div class="text-2xl md:text-3xl font-bold text-gray-900">
                  {{ totalMembersKpi.value }}
                </div>
                <div class="flex items-center gap-1">
                  <div
                    class="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center"
                    :class="
                      totalMembersKpi.changeType === 'positive'
                        ? 'bg-green-100'
                        : 'bg-orange-100'
                    "
                  >
                    <i
                      class="text-xs md:text-sm"
                      :class="
                        totalMembersKpi.changeType === 'positive'
                          ? 'pi pi-arrow-up text-green-600'
                          : 'pi pi-arrow-down text-orange-600'
                      "
                    ></i>
                  </div>
                  <span
                    class="text-xs font-bold"
                    :class="
                      totalMembersKpi.changeType === 'positive'
                        ? 'text-green-600'
                        : 'text-orange-600'
                    "
                    >{{ totalMembersKpi.change }}</span
                  >
                </div>
              </div>
              <p class="text-gray-500 text-xs mb-3">
                {{ totalMembersKpi.description }}
              </p>

              <!-- Chart -->
              <div class="flex-1 min-h-[120px] mt-2">
                <MiniLineChart
                  v-if="statistics.totalMembers.chartData.length > 0"
                  :data="statistics.totalMembers.chartData"
                  label="Members"
                  :change-type="statistics.totalMembers.changeType"
                />
              </div>
            </div>
          </div>

          <!-- Avg Session Card -->
          <div
            class="bg-[#fdfeff] border border-gray-300 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            @click="navigateToUsers"
          >
            <div class="flex flex-col h-full">
              <h3
                class="text-gray-600 text-sm md:text-base font-semibold mb-2 tracking-wider uppercase"
              >
                {{ avgSessionKpi.title }}
              </h3>
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <div class="text-2xl md:text-3xl font-bold text-gray-900">
                  {{ avgSessionKpi.value }}
                </div>
                <div class="flex items-center gap-1">
                  <div
                    class="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center"
                    :class="
                      avgSessionKpi.changeType === 'positive'
                        ? 'bg-green-100'
                        : 'bg-orange-100'
                    "
                  >
                    <i
                      class="text-xs md:text-sm"
                      :class="
                        avgSessionKpi.changeType === 'positive'
                          ? 'pi pi-arrow-up text-green-600'
                          : 'pi pi-arrow-down text-orange-600'
                      "
                    ></i>
                  </div>
                  <span
                    class="text-xs font-bold"
                    :class="
                      avgSessionKpi.changeType === 'positive'
                        ? 'text-green-600'
                        : 'text-orange-600'
                    "
                    >{{ avgSessionKpi.change }}</span
                  >
                </div>
              </div>
              <p class="text-gray-500 text-xs mb-3">
                {{ avgSessionKpi.description }}
              </p>

              <!-- Chart -->
              <div class="flex-1 min-h-[120px] mt-2">
                <MiniLineChart
                  v-if="statistics.avgSession.chartData.length > 0"
                  :data="statistics.avgSession.chartData"
                  label="Avg Session"
                  :change-type="statistics.avgSession.changeType"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- Active Sessions -->
        <div>
          <ConfigCard
            title="Active Sessions"
            bg-color="bg-danger"
            show-add-button="true"
            add-button-text="End a Session"
            @add="handleEndSession"
            max-height="max-h-80"
            icon-class="pi pi-users"
            :show-input-field="activeSessions.length > 0"
            input-placeholder="Enter Name or RFID..."
            @input-change="handleSessionSearch"
          >
            <ActiveSessionsList
              :sessions="activeSessions"
              :search-term="searchTerm"
              @delete-session="handleCancelSession"
            />
          </ConfigCard>
        </div>
      </div>

      <!-- Right Column: Current Revenue and moemoe -->
      <div class="w-full 2xl:w-5/12 flex flex-col gap-3 md:gap-4 lg:gap-6">
        <!-- Current Revenue -->
        <div>
          <CurrentRevenueCard title="Total Revenue" :revenue="currentRevenue" />
        </div>

        <!-- Today's Metrics -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
          <!-- Today's Sessions Card -->
          <div
            class="bg-[#fdfeff] border border-gray-300 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            @click="navigateToHistory"
          >
            <h3
              class="text-gray-600 text-sm md:text-base font-semibold mb-2 tracking-wider uppercase"
            >
              {{ todaySessionsKpi.title }}
            </h3>
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <div class="text-2xl md:text-3xl font-bold text-gray-900">
                {{ todaySessionsKpi.value }}
              </div>
              <div class="flex items-center gap-1">
                <div
                  class="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center"
                  :class="
                    todaySessionsKpi.changeType === 'positive'
                      ? 'bg-green-100'
                      : 'bg-orange-100'
                  "
                >
                  <i
                    class="text-xs md:text-sm"
                    :class="
                      todaySessionsKpi.changeType === 'positive'
                        ? 'pi pi-arrow-up text-green-600'
                        : 'pi pi-arrow-down text-orange-600'
                    "
                  ></i>
                </div>
                <span
                  class="text-xs font-bold"
                  :class="
                    todaySessionsKpi.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-orange-600'
                  "
                  >{{ todaySessionsKpi.change }}</span
                >
              </div>
            </div>
            <p class="text-gray-500 text-xs">
              {{ todaySessionsKpi.description }}
            </p>
          </div>

          <!-- Today's Revenue Card -->
          <div
            class="bg-[#fdfeff] border border-gray-300 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            @click="navigateToHistory"
          >
            <h3
              class="text-gray-600 text-sm md:text-base font-semibold mb-2 tracking-wider uppercase"
            >
              {{ todayRevenueKpi.title }}
            </h3>
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <div class="text-2xl md:text-3xl font-bold text-gray-900">
                {{ todayRevenueKpi.value }}
              </div>
              <div class="flex items-center gap-1">
                <div
                  class="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center"
                  :class="
                    todayRevenueKpi.changeType === 'positive'
                      ? 'bg-green-100'
                      : 'bg-orange-100'
                  "
                >
                  <i
                    class="text-xs md:text-sm"
                    :class="
                      todayRevenueKpi.changeType === 'positive'
                        ? 'pi pi-arrow-up text-green-600'
                        : 'pi pi-arrow-down text-orange-600'
                    "
                  ></i>
                </div>
                <span
                  class="text-xs font-bold"
                  :class="
                    todayRevenueKpi.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-orange-600'
                  "
                  >{{ todayRevenueKpi.change }}</span
                >
              </div>
            </div>
            <p class="text-gray-500 text-xs">
              {{ todayRevenueKpi.description }}
            </p>
          </div>
        </div>

        <!-- Recent Activity -->
        <div>
          <ConfigCard
            title="Recent Activity"
            icon-class="pi pi-clock"
            :clickable="true"
            @card-click="navigateToHistory"
          >
            <RecentActivityList :activities="recentActivity" />
          </ConfigCard>
        </div>
      </div>
    </div>

    <CustomDialog :title="dynamicTitle" :closable="true" ref="customDialog">
      <CustomInput
        v-if="submitMode !== 'cancelSession' && !isScanning"
        :dialogFields="dynamicFields"
        :initialData="payload"
        @submit:data="handleSubmit"
      />
      <DeleteDialog
        v-if="submitMode === 'cancelSession' && !isScanning"
        title="Cancel Session"
        message="Are you sure you want to cancel this session?"
        @cancel="customDialog.closeModal()"
        @proceed="proceedCancelSession"
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
import { useRouter } from "vue-router";
import ConfigCard from "../composables/Cards/ConfigCard.vue";
import CurrentRevenueCard from "../composables/Cards/CurrentRevenueCard.vue";
import ActiveSessionsList from "../composables/Display/ActiveSessionsList.vue";
import RecentActivityList from "../composables/Display/RecentActivityList.vue";
import MiniLineChart from "../composables/Charts/MiniLineChart.vue";
import { useDashboardFunctions } from "../../functions/dashboardFunctions.js";
import { useTopbarButtonState } from "../../../store/vueStore/topbarButtonState";
import {
  sessionDialogFields,
  getSessionDialogFields,
  createSession,
  endSession,
  loadActiveSessions,
  cancelSession,
} from "../../../store/vueStore/Dashboard/sessionList";
import CustomDialog from "../composables/Dialogs/CustomDialog.vue";
import CustomInput from "../shared/Forms/CustomInput.vue";
import DeleteDialog from "../composables/Dialogs/DeleteDialog.vue";
import { useToast } from "../../services/useToast";
import ScanningDisplay from "../composables/Display/ScanningDIsplay.vue";
import { rfidScanner } from "../../services/utils";

// Router
const router = useRouter();

// Get dashboard data
const {
  statistics,
  recentActivity,
  loadDashboardData: loadStatistics,
} = useDashboardFunctions();

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
const activeSessions = ref([]);

onMounted(async () => {
  useTopbarButtonState().setButtonState("Add Session", openModal);
  loadDashboardData();
});

const loadDashboardData = async () => {
  // Load both active sessions and statistics
  await Promise.all([
    loadActiveSessions().then((data) => {
      data.forEach((session) => {
        session.elapsed = "00:00:00";
        session.currentBill = "...";
      });
      activeSessions.value = data;
    }),
    loadStatistics(),
  ]);
};

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

const currentRevenue = computed(() => statistics.value.currentRevenue);

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

      // Validate if the scanned RFID matches the selected member type
      const isMemberCard = await window.electron.ipcRenderer.invoke(
        "checkIfMember",
        rfid
      );
      const selectedMemberType = data.member_type;

      if (selectedMemberType === "Member" && !isMemberCard) {
        isScanning.value = false;
        document.getElementById("rfidInput").value = "";
        scanTimer.value = timerValue;
        closeModal();
        toast(
          "Error: You selected 'Member' but scanned a Non-Member card. Please scan a registered member card or select 'Non-Member'.",
          "danger"
        );
        return;
      }

      if (selectedMemberType === "Non-Member" && isMemberCard) {
        isScanning.value = false;
        document.getElementById("rfidInput").value = "";
        scanTimer.value = timerValue;
        closeModal();
        toast(
          "Error: You selected 'Non-Member' but scanned a Member card. Please scan a non-member card or select 'Member'.",
          "danger"
        );
        return;
      }

      const cleanData = JSON.parse(JSON.stringify(data));
      try {
        const result = await createSession(cleanData);
        closeModal();
        toast("Session created successfully", "success");
        isScanning.value = false;
        document.getElementById("rfidInput").value = "";
        scanTimer.value = timerValue;
        loadDashboardData();
      } catch (error) {
        closeModal();
        isScanning.value = false;
        document.getElementById("rfidInput").value = "";
        scanTimer.value = timerValue;
        toast(error.message || error, "danger");
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
            loadDashboardData();
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

const handleCancelSession = (sessionId) => {
  submitMode.value = "cancelSession";
  payload.value = { id: sessionId };
  customDialog.value.openModal();
};

const proceedCancelSession = async () => {
  try {
    const result = await cancelSession(payload.value);
    toast("Session cancelled successfully", "success");

    //variable setting
    isScanning.value = false;
    closeModal();
    loadDashboardData();

    //cleanup
    submitMode.value = null;
    payload.value = {};
  } catch (error) {
    toast("An error occurred while cancelling the session", "danger");
    console.error(error);
  }
};

// Navigation functions
const navigateToUsers = () => {
  router.push("/users");
};

const navigateToHistory = () => {
  router.push("/history");
};
</script>

<style scoped></style>
