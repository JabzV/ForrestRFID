import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import "vanilla-calendar-pro/styles/index.css";

// Import Preline
import("preline/dist/index.js").then(() => {
  // Initialize Preline after the app is mounted
  createApp(App).use(router).use(createPinia()).mount('#app')
  
  // Initialize Preline after DOM is ready
  setTimeout(() => {
    if (window.HSStaticMethods) {
      window.HSStaticMethods.autoInit();
    }
  }, 100);
});
