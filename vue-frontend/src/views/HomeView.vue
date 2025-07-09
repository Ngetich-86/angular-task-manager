<script setup lang="ts">
</script>

<template>
  <section class="relative flex flex-col items-center justify-center min-h-[70vh] text-center overflow-hidden bg-gray-100">
    <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-40 -z-10"></div>
    <div class="relative z-10 w-full flex flex-col items-center">
      <h1 class="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-4 drop-shadow-lg">Welcome to Task Manager</h1>
      <p class="text-lg md:text-xl text-gray-700 mb-8 max-w-xl bg-white/70 rounded px-4 py-2 shadow">
        Organize your work, boost your productivity, and never miss a deadline. Manage your tasks efficiently with our intuitive and powerful task management app.
      </p>
      <RouterLink to="/register" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition mb-2">
        Get Started
      </RouterLink>
      <RouterLink to="/login" class="block text-indigo-600 hover:underline mt-2">Already have an account? Login</RouterLink>
    </div>
  </section>
</template>
