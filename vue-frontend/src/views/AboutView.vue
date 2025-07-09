<template>
  <section class="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
    <h1 class="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-4">About Task Manager</h1>
    <p class="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl">
      Task Manager is designed to help you stay organized and productive. Effortlessly create, track, and manage your daily tasks, set priorities, and achieve your goals with ease. Whether you’re working solo or collaborating with a team, our app adapts to your workflow and keeps you on top of your to-dos.
    </p>
    <ul class="text-left text-gray-700 mb-8 max-w-xl space-y-2">
      <li><span class="font-semibold text-indigo-600">•</span> Create, edit, and delete tasks</li>
      <li><span class="font-semibold text-indigo-600">•</span> Organize tasks by priority and due date</li>
      <li><span class="font-semibold text-indigo-600">•</span> Track your progress and mark tasks as complete</li>
      <li><span class="font-semibold text-indigo-600">•</span> Collaborate with others and share your task lists</li>
      <li><span class="font-semibold text-indigo-600">•</span> Enjoy a clean, distraction-free interface</li>
    </ul>
    <RouterLink to="/register" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition">
      Start Managing Tasks
    </RouterLink>
  </section>
</template>
