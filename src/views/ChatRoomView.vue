<template>
  <div v-if="currentUser" class="h-screen flex flex-col">
    <main class="flex-1 overflow-hidden">
      <ChatInterface />
    </main>
  </div>
</template>

<script>
import { auth } from '../firebase/firebase.js';
import ChatInterface from '../components/ChatInterface.vue';

export default {
  components: {
    ChatInterface
  },
  data() {
    return {
      currentUser: null
    };
  },
  computed: {
    userDisplayName() {
      return this.currentUser?.displayName || 'Guest';
    }
  },
  created() {
    // Listen for auth state changes
    auth.onAuthStateChanged(this.setCurrentUser);
  },
  methods: {
    setCurrentUser(user) {
      this.currentUser = user || null;
    }
  }
};
</script>
