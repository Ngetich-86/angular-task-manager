<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
</script>

<template>
  <nav class="bg-white shadow-sm">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <RouterLink to="/" class="text-xl font-bold text-indigo-600">Task Manager</RouterLink>
      
      <div class="flex items-center space-x-4">
        <RouterLink 
          v-if="authStore.isAuthenticated"
          to="/tasks" 
          class="px-3 py-2 text-sm font-medium hover:text-indigo-600"
        >
          Tasks
        </RouterLink>
        
        <button
          v-if="authStore.isAuthenticated"
          @click="authStore.logout"
          class="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800"
        >
          Logout
        </button>
        
        <RouterLink 
          v-if="!authStore.isAuthenticated"
          to="/login" 
          class="px-3 py-2 text-sm font-medium hover:text-indigo-600"
        >
          Login
        </RouterLink>
      </div>
    </div>
  </nav>
</template>