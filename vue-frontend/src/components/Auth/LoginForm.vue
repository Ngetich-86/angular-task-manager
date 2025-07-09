<script setup lang="ts">
import { ref } from 'vue'
import type { LoginCredentials } from '@/types/user'
import { defineEmits } from 'vue'

const emit = defineEmits(['submit'])

const credentials = ref<LoginCredentials>({
  email: '',
  password: ''
})

const handleSubmit = () => {
  if (!credentials.value.email || !credentials.value.password) return
  emit('submit', { ...credentials.value })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1">Email</label>
      <input v-model="credentials.email" type="email" required class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">Password</label>
      <input v-model="credentials.password" type="password" required class="w-full border rounded px-3 py-2" />
    </div>
    <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Login</button>
  </form>
</template> 