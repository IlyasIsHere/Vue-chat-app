<template>
  <div :class="[
    'max-w-xs rounded-lg p-3 mb-2',
    isSent ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 text-gray-800'
  ]">
    <div class="break-words">{{ message.text }}</div>
    <div class="text-xs mt-1 flex justify-between items-center">
      <span>{{ formatTime(message.timestamp) }}</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  isSent: {
    type: Boolean,
    required: true
  }
});

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>