import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/Auth/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/Auth/Register.vue'),
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('../pages/Task/Tasks.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notfound',
      component: () => import('../pages/NotFound.vue'),
    },
  ],
})

export default router
