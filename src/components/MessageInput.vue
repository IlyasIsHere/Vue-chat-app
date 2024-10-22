<template>
  <div class="bg-white p-4 border-t border-gray-200">
    <div class="flex items-center">
      <input
        v-model="inputMessage"
        @keyup.enter="sendMessage"
        type="text"
        placeholder="Type a message..."
        class="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        @click="sendMessage"
        class="ml-2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <SendIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { SendIcon } from 'lucide-vue-next'

const inputMessage = ref('')
const emit = defineEmits(['send-message'])

const sendMessage = () => {
  if (inputMessage.value.trim()) {
    emit('send-message', inputMessage.value)
    inputMessage.value = ''
  }
}
</script>