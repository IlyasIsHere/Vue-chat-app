<template>
  <div class="bg-white shadow-md p-4 flex items-center">
    <div class="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0">
      <img v-if="photoUrl" :src="photoUrl" alt="User avatar" class="w-full h-full rounded-full object-cover">
    </div>
    <div class="ml-4">
      <h3 class="font-semibold text-lg">{{ name }}</h3>
      <p class="text-sm text-gray-500">
        {{ isTyping ? 'Typing...' : status }}
      </p>
      <p v-if="!online && lastSeen" class="text-xs text-gray-400">
        Last seen {{ formatLastSeen(lastSeen) }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  photoUrl: {
    type: String,
    default: null
  },
  online: {
    type: Boolean,
    default: false
  },
  isTyping: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Object,
    default: null
  }
});

const formatLastSeen = (timestamp) => {
  if (!timestamp) return '';
  
  const lastSeen = timestamp.toDate();
  const now = new Date();
  const diffInSeconds = Math.floor((now - lastSeen) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return lastSeen.toLocaleDateString();
};
</script>
