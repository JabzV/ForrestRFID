<template>
  <div class="app flex h-screen">
    <Sidebar />
    <main
      class="flex-1 ml-64 hs-overlay-minified:ml-13 transition-all duration-300"
    >
      <Topbar :title="currentTitle" />
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import Sidebar from "./components/layout/Sidebar.vue";
import Topbar from "./components/layout/Topbar.vue";
import { useNavigation } from "./services/useNavigation.js";

const { currentTitle } = useNavigation();
</script>

<style></style>
