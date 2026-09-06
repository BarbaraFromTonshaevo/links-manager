import HomeView from '@/views/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPassword.vue'),
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  await useUserStore().authReady
  if (to.meta.requiresAuth && !useUserStore().user) {
    return next({ name: 'auth' })
  }

  if (!to.meta.requiresAuth && useUserStore().user) {
    return next({ name: 'home' })
  }

  next()
})

export default router
