<template>
  <div class="app flex h-screen">
    <Sidebar />
    <main
      class="flex-1 ml-64 hs-overlay-minified:ml-13 transition-all duration-300"
    >
      <Topbar />
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import Sidebar from "./components/layout/Sidebar.vue";
import Topbar from "./components/layout/Topbar.vue";
</script>

<style></style>
