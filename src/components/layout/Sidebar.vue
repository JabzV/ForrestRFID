<template>
  <div
    id="hs-sidebar-content-push-to-mini-sidebar"
    class="hs-overlay hs-overlay-minified:w-13 w-64 transition-all duration-300 transform h-full block overflow-x-hidden fixed top-0 start-0 bottom-0 z-60 bg-white border-e border-gray-200"
    role="dialog"
    tabindex="-1"
    aria-label="Sidebar"
  >
    <div
      class="relative flex flex-col h-full max-h-full border-e border-gray-200"
    >
      <!-- Header -->
      <header
        class="py-4 px-2 flex justify-between items-center gap-x-2 bg-primary1"
      >
        <img
          src="/assets/ForrestLogo.png"
          alt="logo"
          width="180rem"
          class="hs-overlay-minified:hidden"
        />

        <div class="block">
          <!-- Toggle Button -->
          <button
            type="button"
            class="flex justify-center items-center flex-none gap-x-3 size-9 text-sm text-gray-600 hover:bg-gray-700 rounded-full disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden"
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="hs-sidebar-content-push-to-mini-sidebar"
            aria-label="Minify navigation"
            data-hs-overlay-minifier="#hs-sidebar-content-push-to-mini-sidebar"
          >
            <svg
              class="hidden hs-overlay-minified:block shrink-0 size-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M15 3v18" />
              <path d="m8 9 3 3-3 3" />
            </svg>
            <svg
              class="hs-overlay-minified:hidden shrink-0 size-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M15 3v18" />
              <path d="m10 15-3-3 3-3" />
            </svg>
            <span class="sr-only">Navigation Toggle</span>
          </button>
          <!-- End Toggle Button -->
        </div>
      </header>
      <!-- End Header -->

      <!-- Body -->
      <nav
        class="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300"
      >
        <div
          class="pb-0 px-2 w-full flex flex-col flex-wrap hs-overlay-minified:pt-4"
        >
          <span
            class="text-sm text-gray-500 pt-4 pb-2 pl-2 hs-overlay-minified:hidden"
            >Navigation</span
          >
          <ul class="flex flex-col gap-1 hs-overlay-minified:gap-2">
            <SidebarContent
              v-for="route in navigationRoutes"
              :key="route.href"
              :icon="route.icon"
              :label="route.label"
              :href="route.href"
            />
          </ul>
        </div>
      </nav>
      <!-- End Body -->
    </div>
  </div>
  <!-- End Sidebar -->
</template>

<script setup>
import { onMounted } from "vue";
import SidebarContent from "../composables/Sidebar/SidebarContent.vue";
import { useNavigation } from "../../services/useNavigation.js";

const { navigationRoutes } = useNavigation();

onMounted(() => {
  setTimeout(() => window.HSStaticMethods.autoInit(), 100);
});
</script>

<style scoped></style>
