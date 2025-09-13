import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import "vanilla-calendar-pro/styles/index.css";

// Configure dayjs for Singapore timezone
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

dayjs.extend(utc)
dayjs.extend(timezone)
// Set Singapore as default timezone
dayjs.tz.setDefault('Asia/Singapore')

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
