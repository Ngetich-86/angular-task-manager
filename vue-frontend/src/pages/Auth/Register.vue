<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import type { RegisterData } from '@/types/user'

const authStore = useAuthStore()
const errorMessage = ref<string | null>(null)

const handleRegister = async (userData: RegisterData) => {
  try {
    errorMessage.value = null
    await authStore.register(userData)
  } catch (error) {
    errorMessage.value = 'Registration failed. Please try again.'
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-2xl font-bold text-center mb-6">Register</h1>
    <RegisterForm @submit="handleRegister" />
    <p v-if="errorMessage" class="mt-4 text-red-500 text-sm">{{ errorMessage }}</p>
    <p class="mt-4 text-center text-sm">
      Already have an account?
      <RouterLink to="/login" class="text-indigo-600 hover:underline">Login here</RouterLink>
    </p>
  </div>
</template>
