import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '@/views/AuthView.vue'
import ChatRoom from '@/views/ChatRoomView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/chatRoom',
      name: 'chatRoom',
      component: () => ChatRoom
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
    },

  ]
})

export default router
