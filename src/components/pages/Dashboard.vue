<template>
  <div class="p-8 bg-background w-full overflow-x-hidden">
    <div class="flex gap-6">
      <!-- Left Column: blabla and Active Sessions -->
      <div class="w-160 flex flex-col gap-6">
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
          <ConfigCard
            title="Recent Activity"
            icon-class="pi pi-clock"
          >
            <RecentActivityList :activities="recentActivity" />
          </ConfigCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ConfigCard from "../composables/Cards/ConfigCard.vue";
import KpiCard from "../composables/Cards/KpiCard.vue";
import CurrentRevenueCard from "../composables/Cards/CurrentRevenueCard.vue";
import ActiveSessionsList from "../composables/Display/ActiveSessionsList.vue";
import RecentActivityList from "../composables/Display/RecentActivityList.vue";
import { useDashboardFunctions } from "../../functions/dashboardFunctions.js";
import { useTopbarButtonState } from "../../../store/vueStore/topbarButtonState";

// Get dashboard data
const { statistics, activeSessions, recentActivity } = useDashboardFunctions();

// KPI data for BlablaCard - using data from dashboard functions
const totalMembersKpi = computed(() => ({
  title: "Total Members",
  value: statistics.value.totalMembers.value,
  change: statistics.value.totalMembers.change,
  changeType: statistics.value.totalMembers.changeType,
  description: statistics.value.totalMembers.description
}));

const avgSessionKpi = computed(() => ({
  title: "Avg. Session",
  value: statistics.value.avgSession.value,
  change: statistics.value.avgSession.change,
  changeType: statistics.value.avgSession.changeType,
  description: statistics.value.avgSession.description
}));

const todaySessionsKpi = computed(() => ({
  title: "Today's Sessions",
  value: statistics.value.todaySessions.value,
  change: statistics.value.todaySessions.change,
  changeType: statistics.value.todaySessions.changeType,
  description: statistics.value.todaySessions.description
}));

const todayRevenueKpi = computed(() => ({
  title: "Today's Revenue",
  value: statistics.value.todayRevenue.value,
  change: statistics.value.todayRevenue.change,
  changeType: statistics.value.todayRevenue.changeType,
  description: statistics.value.todayRevenue.description
}));

const currentRevenue = computed(() => ({
  value: statistics.value.currentRevenue.value,
  description: statistics.value.currentRevenue.description
}));

// Search functionality
const searchTerm = ref('');

const handleSessionSearch = (value) => {
  searchTerm.value = value;
};

const handleDeleteSession = (sessionId) => {
  // Remove session from the list
  const index = activeSessions.value.findIndex(session => session.id === sessionId);
  if (index > -1) {
    activeSessions.value.splice(index, 1);
  }
};

onMounted(() => {
  useTopbarButtonState().setButtonState("Add Session");
});
</script>

<style scoped></style>