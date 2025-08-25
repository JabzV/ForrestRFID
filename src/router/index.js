import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '../components/pages/Dashboard.vue'
import Users from '../components/pages/Users.vue'
import Settings from '../components/pages/Settings.vue'
import History from '../components/pages/History.vue'

const routes = [
    { path: '/', name: 'Dashboard', component: Dashboard },
    { path: '/users', name: 'Users', component: Users },
    { path: '/settings', name: 'Settings', component: Settings },
    { path: '/history', name: 'History', component: History },
  ]

  const router = createRouter({
    history: createWebHistory(), // use history mode
    routes,
  })
  
  export default router