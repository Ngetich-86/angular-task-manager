<script setup lang="ts">
import { ref } from 'vue'
import type { RegisterData } from '@/types/user'
import { defineEmits } from 'vue'

const emit = defineEmits(['submit'])

const userData = ref<RegisterData>({
  name: '',
  email: '',
  password: ''
})

const handleSubmit = () => {
  if (!userData.value.name || !userData.value.email || !userData.value.password) return
  emit('submit', { ...userData.value })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1">Name</label>
      <input v-model="userData.name" type="text" required class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">Email</label>
      <input v-model="userData.email" type="email" required class="w-full border rounded px-3 py-2" />
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">Password</label>
      <input v-model="userData.password" type="password" required class="w-full border rounded px-3 py-2" />
    </div>
    <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Register</button>
  </form>
</template> 