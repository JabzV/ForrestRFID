import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// Import Preline
import("preline/dist/index.js");

createApp(App).use(router).mount('#app')
