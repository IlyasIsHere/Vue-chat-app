<template>
  <div class="flex h-full bg-gray-100">
    <ChatSidebar :users="users" :active-user="activeUser" @select-user="selectUser" />
    <div class="flex-1 flex flex-col">
      <ChatHeader 
        :name="activeUser?.displayName" 
        :status="isTyping ? 'Typing...' : activeUser?.online ? 'Online' : 'Offline'" 
      />
      <MessageList :messages="messages" :is-typing="isTyping" />
      <MessageInput @send-message="sendMessage" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase/firebase.js';
import ChatSidebar from './ChatSidebar.vue';
import ChatHeader from './ChatHeader.vue';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';

const users = ref([]);
const activeUser = ref(null);
const messages = ref([]);
const isTyping = ref(false);
const currentUser = ref(null);

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser.value = user;
      fetchUsers();
      watchMessages();
    } else {
      // Handle user not logged in
    }
  });
});

const fetchUsers = async () => {
  const usersCollection = collection(db, 'users');
  onSnapshot(usersCollection, (snapshot) => {
    users.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    if (!activeUser.value && users.value.length > 0) {
      selectUser(users.value[0]);
    }
  });
};

const watchMessages = () => {
  watch(activeUser, () => {
    if (activeUser.value) {
      const messagesCollection = collection(db, 'messages');
      const q = query(
        messagesCollection,
        where('chatId', '==', getChatId()),
        orderBy('timestamp', 'asc')
      );
      onSnapshot(q, (snapshot) => {
        messages.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      });
    }
  }, { immediate: true });
};

const selectUser = (user) => {
  activeUser.value = user;
};

const sendMessage = async (text) => {
  if (!activeUser.value || !currentUser.value) return;

  const messagesCollection = collection(db, 'messages');
  await addDoc(messagesCollection, {
    text: text,
    senderId: currentUser.value.uid,
    receiverId: activeUser.value.id,
    chatId: getChatId(),
    timestamp: serverTimestamp(),
  });
};

const getChatId = () => {
  const ids = [currentUser.value.uid, activeUser.value.id].sort();
  return `${ids[0]}_${ids[1]}`;
};

// Simulating typing indicator (in a real app, you'd implement this with real-time updates)
let typingTimeout;
const simulateTyping = () => {
  isTyping.value = true;
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping.value = false;
  }, 3000);
};

watch(activeUser, simulateTyping);
</script>