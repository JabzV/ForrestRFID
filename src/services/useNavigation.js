import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { routes } from '../router'

// Transform router routes to navigation format
export const navigationRoutes = routes.map(route => ({
  icon: route.icon,
  label: route.name,
  href: route.path
}))

export function useNavigation() {
  const route = useRoute()
  
  const currentTitle = computed(() => {
    const currentRoute = navigationRoutes.find(navRoute => navRoute.href === route.path)
    return currentRoute?.label || 'Dashboard'
  })

  return {
    navigationRoutes,
    currentTitle
  }
}
