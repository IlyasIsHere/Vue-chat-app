<template>
  <div class="h-screen flex flex-col">
    <header class="bg-gray-900 text-white p-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Chat App</h1>
      <span class="text-sm">Logged in as: {{ currentUser.displayName }}</span>
    </header>
    <main class="flex-1 overflow-hidden">
      <ChatInterface />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { auth } from '../firebase/firebase.js';
import ChatInterface from '../components/ChatInterface.vue';

const currentUser = ref(null);

onMounted(() => {
  // Assuming the user is already signed in
  currentUser.value = auth.currentUser;
});
</script>