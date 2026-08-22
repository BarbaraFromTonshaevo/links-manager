import HomeView from '@/views/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/supabase.js'

let user = null

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

const getUser = async (next) => {
  user = await supabase.auth.getSession()
  if (user.data.session === null || user === null) {
    next({ name: 'auth' })
  } else {
    next()
  }
}

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    await getUser(next)
  } else {
    next()
  }
})

export default router
