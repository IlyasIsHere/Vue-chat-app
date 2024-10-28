<template>
  <div v-if="currentUser" class="h-[calc(100vh-64px)]"> <!-- Subtract navbar height (64px) -->
    <main class="h-full">
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

