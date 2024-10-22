<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar (simplified for this example) -->
    <div class="w-1/4 bg-gray-800 p-4">
      <h2 class="text-2xl font-bold text-white mb-4">Chats</h2>
      <!-- Add chat list here -->
    </div>

    <!-- Main chat area -->
    <div class="flex-1 flex flex-col">
      <!-- Chat header -->
      <div class="bg-white shadow-md p-4 flex items-center">
        <div class="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
        <div class="ml-4">
          <h3 class="font-semibold text-lg">John Doe</h3>
          <p class="text-sm text-gray-500">{{ isTyping ? 'Typing...' : 'Online' }}</p>
        </div>
      </div>

      <!-- Messages area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
        <transition-group name="fade">
          <div v-for="message in messages" :key="message.id" :class="[
            'max-w-xs rounded-lg p-3 mb-2',
            message.sent ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 text-gray-800'
          ]">
            {{ message.text }}
            <div class="text-xs mt-1 flex justify-between items-center">
              <span>{{ formatTime(message.timestamp) }}</span>
              <span v-if="message.sent && message.read">
                <CheckCheckIcon class="w-4 h-4" :class="message.read ? 'text-blue-300' : 'text-gray-400'" />
              </span>
            </div>
          </div>
        </transition-group>
        <div v-if="isTyping" class="text-gray-500 text-sm">John is typing...</div>
      </div>

      <!-- Message input -->
      <div class="bg-white p-4 border-t border-gray-200">
        <div class="flex items-center">
          <input
            v-model="newMessage"
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { SendIcon, CheckCheckIcon } from 'lucide-vue-next'

const messages = ref([
  { id: 1, text: "Hey there!", sent: false, read: true, timestamp: new Date(Date.now() - 3600000) },
  { id: 2, text: "Hi! How are you?", sent: true, read: true, timestamp: new Date(Date.now() - 3540000) },
  { id: 3, text: "I'm good, thanks! How about you?", sent: false, read: true, timestamp: new Date(Date.now() - 3480000) },
  { id: 4, text: "I'm doing great! Any plans for the weekend?", sent: true, read: true, timestamp: new Date(Date.now() - 3420000) },
])

const newMessage = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)

const sendMessage = () => {
  if (newMessage.value.trim()) {
    const message = {
      id: Date.now(),
      text: newMessage.value,
      sent: true,
      read: false,
      timestamp: new Date()
    }
    messages.value.push(message)
    newMessage.value = ''
    simulateReceipt(message)
    scrollToBottom()
  }
}

const simulateReceipt = (message) => {
  setTimeout(() => {
    message.read = true
  }, 2000)
}

const simulateTyping = () => {
  isTyping.value = true
  setTimeout(() => {
    isTyping.value = false
    const reply = {
      id: Date.now(),
      text: "That sounds great! I'm thinking of going hiking.",
      sent: false,
      read: true,
      timestamp: new Date()
    }
    messages.value.push(reply)
    scrollToBottom()
  }, 3000)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  scrollToBottom()
  // Simulate receiving a message after 5 seconds
  setTimeout(simulateTyping, 5000)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>