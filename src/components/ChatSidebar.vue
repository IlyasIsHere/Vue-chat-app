<template>
  <div class="w-1/4 bg-gray-800 p-4 overflow-y-auto">
    <h2 class="text-2xl font-bold text-white mb-4">Chats</h2>
    <ul class="space-y-2">
      <li 
        v-for="user in users" 
        :key="user.id" 
        @click="$emit('select-user', user)"
        class="flex items-center p-2 rounded cursor-pointer hover:bg-gray-700 transition-colors"
        :class="{ 'bg-gray-700': user.id === activeUser?.id }"
      >
        <div class="w-10 h-10 rounded-full bg-gray-500 flex-shrink-0 mr-3">
          <img v-if="user.photoURL" :src="user.photoURL" alt="User avatar" class="w-full h-full rounded-full object-cover">
        </div>
        <div class="flex-1">
          <h3 class="text-white font-medium">{{ user.username }}</h3>
          <p class="text-gray-400 text-sm">
            {{ user.online ? 'Online' : formatLastSeen(user.lastSeen) }}
          </p>
        </div>
        <div 
          class="w-3 h-3 rounded-full" 
          :class="user.online ? 'bg-green-500' : 'bg-gray-500'"
        ></div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  users: {
    type: Array,
    required: true
  },
  activeUser: {
    type: Object,
    default: null
  }
});

defineEmits(['select-user']);

const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'Never online';
  
  const lastSeen = timestamp.toDate();
  const now = new Date();
  const diffInSeconds = Math.floor((now - lastSeen) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return lastSeen.toLocaleDateString();
};
</script>
