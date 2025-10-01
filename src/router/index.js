import { createRouter, createWebHashHistory } from 'vue-router'

import Dashboard from '../components/pages/Dashboard.vue'
import Users from '../components/pages/Users.vue'
import Settings from '../components/pages/Settings.vue'
import History from '../components/pages/History.vue'

export const routes = [
    { path: '/', name: 'Dashboard', component: Dashboard, icon: 'pi pi-home' },
    { path: '/users', name: 'Users', component: Users, icon: 'pi pi-users' },
    { path: '/history', name: 'History', component: History, icon: 'pi pi-history' },
    { path: '/settings', name: 'Settings', component: Settings, icon: 'pi pi-cog' },
  ]

  const router = createRouter({
    history: createWebHashHistory(), // Use hash mode for Electron (works with file:// protocol)
    routes,
  })
  
  export default router