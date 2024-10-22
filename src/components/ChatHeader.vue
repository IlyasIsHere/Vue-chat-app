<template>
  <div class="bg-white shadow-md p-4 flex items-center">
    <div class="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
    <div class="ml-4">
      <h3 class="font-semibold text-lg">{{ name }}</h3>
      <p class="text-sm text-gray-500">{{ status }}</p>
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
  }
})
</script>