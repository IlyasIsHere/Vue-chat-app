<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
    <div class="bg-white p-8 rounded-xl shadow-2xl w-96 transform transition-all hover:scale-105">
      <h2 class="text-3xl font-extrabold text-gray-900 text-center mb-6">Register</h2>
      <form @submit.prevent="register">
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input v-model="username" type="text" id="username" required
                 class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="email" type="email" id="email" required
                 class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input v-model="password" type="password" id="password" required
                 class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div class="mb-4">
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input v-model="confirmPassword" type="password" id="confirmPassword" required
                 class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
          <div class="flex items-center space-x-4">
            <div class="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
              <img v-if="imagePreview" :src="imagePreview" alt="Profile preview" class="w-full h-full object-cover">
            </div>
            <label class="cursor-pointer bg-indigo-50 px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors">
              <span class="text-indigo-600 text-sm">Choose file</span>
              <input type="file" class="hidden" accept="image/*" @change="handleImageUpload">
            </label>
          </div>
        </div>
        <button type="submit"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300">
          Register
        </button>
      </form>
      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">
          Already have an account?
          <a href="#" @click="$emit('switch-to-login')" class="font-medium text-indigo-600 hover:text-indigo-500">Login</a>
        </p>
      </div>
      <span v-if="firebaseError" class="text-red-500 text-center block mt-4 text-sm">{{ firebaseError }}</span>
    </div>
  </div>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
export default {
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      selectedImage: null,
      imagePreview: null,
      firebaseError: ''
    }
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        this.selectedImage = file
        this.imagePreview = URL.createObjectURL(file)
      }
    },
    async checkUsernameAvailability(username) {
      const db = getFirestore()
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('username', '==', username))
      const querySnapshot = await getDocs(q)
      return querySnapshot.empty
    },
    async uploadProfilePicture(uid) {
      if (!this.selectedImage) return null
      
      const storage = getStorage()
      const imageRef = storageRef(storage, `profilePictures/${uid}`)
      await uploadBytes(imageRef, this.selectedImage)
      return await getDownloadURL(imageRef)
    },
    async register() {
      if (this.password !== this.confirmPassword) {
        this.firebaseError = 'Passwords do not match'
        return
      }

      // Check if username is available
      const isUsernameAvailable = await this.checkUsernameAvailability(this.username)
      if (!isUsernameAvailable) {
        this.firebaseError = 'Username is already taken'
        return
      }

      try {
        const auth = getAuth()
        const { user } = await createUserWithEmailAndPassword(auth, this.email, this.password)
        
        // Upload profile picture if selected
        const photoURL = await this.uploadProfilePicture(user.uid)
        
        // Create user document in Firestore
        const db = getFirestore()
        await setDoc(doc(db, 'users', user.uid), {
          username: this.username,
          email: this.email,
          photoURL: photoURL,
          lastSeen: new Date()
        })

        this.$router.push('/')
      } catch (error) {
        this.firebaseError = this.getFirebaseError(error.code)
      }
    },
    getFirebaseError(errorCode) {
      switch (errorCode) {
        case 'auth/email-already-in-use':
          return 'This email is already registered. Please try logging in or use a different email.'
        case 'auth/invalid-email':
          return 'Invalid email address.'
        case 'auth/weak-password':
          return 'Password is too weak. Please use a stronger password.'
        default:
          return 'Registration failed. Please try again.'
      }
    }
  }
}
</script>

<style scoped>
/* The styling is already provided in the template using Tailwind classes */
</style>
