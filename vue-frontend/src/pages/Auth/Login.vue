<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import LoginForm from '@/components/auth/LoginForm.vue'
import type { LoginCredentials } from '@/types/user'

const authStore = useAuthStore()
const errorMessage = ref<string | null>(null)

const handleLogin = async (credentials: LoginCredentials) => {
  try {
    errorMessage.value = null
    await authStore.login(credentials)
  } catch (error) {
    errorMessage.value = 'Invalid email or password'
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold text-center mb-6">Login</h1>
    <LoginForm @submit="handleLogin" />
    <p v-if="errorMessage" class="mt-4 text-red-500 text-sm">{{ errorMessage }}</p>
    <p class="mt-4 text-center text-sm">
      Don't have an account? 
      <RouterLink to="/register" class="text-indigo-600 hover:underline">Register here</RouterLink>
    </p>
  </div>
</template>