<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
    <div class="bg-white p-8 rounded-xl shadow-2xl w-96 transform transition-all hover:scale-105">
      <h2 class="text-3xl font-extrabold text-gray-900 text-center mb-6">Login</h2>
      <form @submit.prevent="login">
        <div class="mb-4">
          <label for="emailOrUsername" class="block text-sm font-medium text-gray-700">Email or Username</label>
          <input v-model="emailOrUsername" type="text" id="emailOrUsername" required
                 class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input v-model="password" type="password" id="password" required
                 class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <button type="submit"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300">
          Sign In
        </button>
      </form>
      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <a href="#" @click="$emit('switch-to-register')" class="font-medium text-indigo-600 hover:text-indigo-500">Register</a>
        </p>
      </div>
      <span v-if="firebaseError" class="text-red-500 text-center block mt-4 text-sm">{{ firebaseError }}</span>
    </div>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'

export default {
  data() {
    return {
      emailOrUsername: '',
      password: '',
      firebaseError: ''
    }
  },
  methods: {
    async login() {
      try {
        const auth = getAuth();
        let email = this.emailOrUsername;

        // Check if input is username instead of email
        if (!this.emailOrUsername.includes('@')) {
          const db = getFirestore();
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('username', '==', this.emailOrUsername));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            this.firebaseError = 'User not found';
            return;
          }
          
          email = querySnapshot.docs[0].data().email;
        }

        await signInWithEmailAndPassword(auth, email, this.password);
        this.$router.push('/');
      } catch (error) {
        this.firebaseError = this.getFirebaseError(error.code)
      }
    },
    getFirebaseError(errorCode) {
      switch (errorCode) {
        case 'auth/invalid-email':
          return 'Invalid email address.'
        case 'auth/user-disabled':
          return 'This account has been disabled.'
        case 'auth/user-not-found':
          return 'User not found. Please check your email/username or register.'
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.'
        case 'auth/invalid-credential':
          return 'Incorrect email/username or password. Please try again.'
        default:
          return 'Login failed. Please try again.'
      }
    }
  }
}
</script>

<style scoped>
</style>
