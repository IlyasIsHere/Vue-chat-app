<template>
  <div class="h-full flex bg-gray-100">
    <ChatSidebar :users="users" :active-user="activeUser" @select-user="selectUser" />
    <div class="flex-1 flex flex-col">
      <ChatHeader
        :name="activeUser?.username"
        :status="activeUser?.online ? 'Online' : 'Offline'"
        :photo-url="activeUser?.photoURL"
        :online="activeUser?.online"
        :is-typing="isTyping"
        :last-seen="activeUser?.lastSeen"
      />
      <MessageList :messages="messages" :is-typing="isTyping" :current-user="currentUser" />
      <MessageInput @send-message="sendMessage" @typing="sendTypingNotification" />
    </div>
  </div>
</template>

<script>
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, doc, updateDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase/firebase.js';
import ChatSidebar from './ChatSidebar.vue';
import ChatHeader from './ChatHeader.vue';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';
import { useOnlineStatus } from '../composables/useOnlineStatus';

export default {
  name: 'ChatApp',
  components: { ChatSidebar, ChatHeader, MessageList, MessageInput },
  setup() {
    useOnlineStatus();
  },
  data() {
    return {
      users: [],
      activeUser: null,
      messages: [],
      isTyping: false,
      currentUser: null,
      typingTimeout: null,
    };
  },
  methods: {
    handleTypingIndicator() {
      this.isTyping = true;
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        this.isTyping = false;
      }, 3000);
    },
    async sendTypingNotification() {
      if (!this.activeUser || !this.currentUser) return;

      const chatId = this.getChatId();
      const typingQuery = query(collection(db, 'typing'), where('chatId', '==', chatId));
      const snapshot = await getDocs(typingQuery);
      
      if (!snapshot.empty) {
        const typingDoc = snapshot.docs[0];
        await updateDoc(typingDoc.ref, {
          [`${this.currentUser.uid}_typing`]: true,
          timestamp: serverTimestamp()
        });

        // Reset typing status after 3 seconds
        setTimeout(async () => {
          await updateDoc(typingDoc.ref, {
            [`${this.currentUser.uid}_typing`]: false
          });
        }, 3000);
      }
    },
    watchTypingStatus() {
      if (!this.activeUser || !this.currentUser) return;

      const chatId = this.getChatId();
      const typingQuery = query(collection(db, 'typing'), where('chatId', '==', chatId));
      
      onSnapshot(typingQuery, (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          this.isTyping = data[`${this.activeUser.id}_typing`] === true;
        }
      });
    },
    fetchUsers() {
      const usersCollection = collection(db, 'users');
      onSnapshot(usersCollection, (snapshot) => {
        this.users = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            online: data.online || false
          };
        });
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
      this.activeUser = this.users.find(u => u.id === user.id) || user;
      this.watchMessages();
      this.watchActiveUser();
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
    watchActiveUser() {
      if (!this.activeUser) return;
      
      const userRef = doc(db, 'users', this.activeUser.id);
      onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          this.activeUser = {
            id: doc.id,
            ...doc.data()
          };
        }
      });
    },
  },
  watch: {
    activeUser: {
      handler(newUser) {
        if (newUser) {
          this.watchMessages();
          this.watchTypingStatus();
          
          // Create typing document for this chat if it doesn't exist
          const chatId = this.getChatId();
          const typingQuery = query(collection(db, 'typing'), where('chatId', '==', chatId));
          
          onSnapshot(typingQuery, (snapshot) => {
            if (snapshot.empty) {
              // If document doesn't exist, create it
              addDoc(collection(db, 'typing'), {
                chatId: chatId,
                [`${this.currentUser.uid}_typing`]: false,
                [`${newUser.id}_typing`]: false
              });
            }
          });
        }
      },
      immediate: true
    }
  },
  async mounted() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUser = user;
        this.fetchUsers();
      }
    });
  },
};
</script>

