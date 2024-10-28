import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '@/views/AuthView.vue'
import ChatRoom from '@/views/ChatRoomView.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/chatroom',
      name: 'chatroom',
      component: ChatRoom,
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      name: 'home',
      component: ChatRoom,
      meta: { requiresAuth: true }
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
      meta: { requiresNonAuth: true }
    },
  ]
})

// Global navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const auth = getAuth()

  // If the route requires authentication
  if (to.meta.requiresAuth) {
    // Check if the user is authenticated
    onAuthStateChanged(auth, (user) => {
      if (user) {
        next() // User is authenticated, proceed to the route
      } else {
        next({ name: 'auth' }) // Redirect to auth if not authenticated
      }
    })
  } else if (to.meta.requiresNonAuth) {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        next()
      } else {
        next({ name: 'chatroom' })
      }
    })
  }
  else {
    next() // Proceed to the route if no authentication is required
  }
})

export default router
