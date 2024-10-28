<template>
  <div class="h-full flex bg-gray-100"> <!-- Changed to h-full -->
    <ChatSidebar :users="users" :active-user="activeUser" @select-user="selectUser" />
    <div class="flex-1 flex flex-col">
      <ChatHeader
        :name="activeUser?.username"
        :status="isTyping ? 'Typing...' : activeUser?.online ? 'Online' : 'Offline'"
        :photo-url="activeUser?.photoURL"
      />
      <MessageList :messages="messages" :is-typing="isTyping" :current-user="currentUser" />
      <MessageInput @send-message="sendMessage" @typing="sendTypingNotification" />
    </div>
  </div>
</template>

<script>
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { db, auth } from '../firebase/firebase.js';
import ChatSidebar from './ChatSidebar.vue';
import ChatHeader from './ChatHeader.vue';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';

export default {
  name: 'ChatApp',
  components: { ChatSidebar, ChatHeader, MessageList, MessageInput },
  data() {
    return {
      users: [],
      activeUser: null,
      messages: [],
      isTyping: false,
      currentUser: null,
      typingTimeout: null,
      fcmToken: null,
    };
  },
  methods: {
    async initializeFCM() {
      try {
        const messaging = getMessaging();
        this.fcmToken = await getToken(messaging, {
          vapidKey: process.env.VUE_APP_FIREBASE_VAPID_KEY
        });

        onMessage(messaging, (payload) => {
          if (payload.data.type === 'typing' && payload.data.senderId === this.activeUser?.id) {
            this.handleTypingIndicator();
          }
        });
      } catch (error) {
        console.error('Error initializing FCM:', error);
      }
    },
    handleTypingIndicator() {
      this.isTyping = true;
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        this.isTyping = false;
      }, 3000);
    },
    async sendTypingNotification() {
      if (!this.activeUser || !this.currentUser) return;

      const messagesCollection = collection(db, 'notifications');
      await addDoc(messagesCollection, {
        type: 'typing',
        senderId: this.currentUser.uid,
        receiverId: this.activeUser.id,
        receiverToken: this.activeUser.fcmToken,
        timestamp: serverTimestamp(),
      });
    },
    fetchUsers() {
      const usersCollection = collection(db, 'users');
      onSnapshot(usersCollection, (snapshot) => {
        this.users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (!this.activeUser && this.users.length > 0) {
          this.selectUser(this.users[0]);
        }
      });
    },
    watchMessages() {
      if (this.activeUser) {
        const messagesCollection = collection(db, 'messages');
        const q = query(
          messagesCollection,
          where('chatId', '==', this.getChatId()),
          orderBy('timestamp', 'asc')
        );
        onSnapshot(q, (snapshot) => {
          this.messages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        });
      }
    },
    selectUser(user) {
      this.activeUser = user;
      this.watchMessages();
    },
    async sendMessage(text) {
      if (!this.activeUser || !this.currentUser) return;

      const messagesCollection = collection(db, 'messages');
      await addDoc(messagesCollection, {
        text: text,
        senderId: this.currentUser.uid,
        receiverId: this.activeUser.id,
        chatId: this.getChatId(),
        timestamp: serverTimestamp(),
        read: false
      });
    },
    getChatId() {
      const ids = [this.currentUser.uid, this.activeUser.id].sort();
      return `${ids[0]}_${ids[1]}`;
    },
  },
  watch: {
    activeUser() {
      if (this.activeUser) {
        this.watchMessages();
      }
    }
  },
  async mounted() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUser = user;
        await this.initializeFCM();
        this.fetchUsers();
      }
    });
  },
};
</script>
