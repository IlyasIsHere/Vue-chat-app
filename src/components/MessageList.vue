<template>
  <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
    <transition-group name="fade">
      <MessageItem
        v-for="message in messages"
        :key="message.id"
        :message="message"
        :is-sent="message.senderId === currentUserId"
      />
    </transition-group>
    <div v-if="isTyping" class="text-gray-500 text-sm">User is typing...</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import MessageItem from './MessageItem.vue';
import { auth } from '../firebase/firebase.js';

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  isTyping: {
    type: Boolean,
    required: true
  }
});

const messagesContainer = ref(null);
const currentUserId = ref(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

onMounted(() => {
  scrollToBottom();
  currentUserId.value = auth.currentUser?.uid;
});

watch(() => props.messages.length, scrollToBottom);

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