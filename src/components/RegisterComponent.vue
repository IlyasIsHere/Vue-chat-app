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
          <label for="profilePicture" class="block text-sm font-medium text-gray-700">Profile Picture</label>
          <input type="file" id="profilePicture" @change="handleImageUpload" accept="image/*"
                 class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          <img v-if="imagePreview" :src="imagePreview" class="mt-2 w-20 h-20 object-cover rounded-full mx-auto">
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
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, query, collection, where, getDocs, getFirestore, updateDoc } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

export default {
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firebaseError: '',
      selectedImage: null,
      imagePreview: null
    }
  },
  created() {
    const auth = getAuth();
    // Set up auth state listener
    onAuthStateChanged(auth, async (user) => {
      const db = getFirestore();
      if (user) {
        // User is signed in
        await updateDoc(doc(db, 'users', user.uid), {
          online: true,
          lastSeen: new Date()
        });
      } else {
        // User is signed out - update last user's status if we have their ID
        const currentUser = auth.currentUser;
        if (currentUser) {
          await updateDoc(doc(db, 'users', currentUser.uid), {
            online: false,
            lastSeen: new Date()
          });
        }
      }
    });
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
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password)
        
        // Upload profile picture if selected
        const photoURL = await this.uploadProfilePicture(userCredential.user.uid)

        // Add user to Firestore
        const db = getFirestore()
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          username: this.username,
          email: this.email,
          createdAt: new Date(),
          online: true,
          lastSeen: new Date(),
          photoURL: photoURL
        })

        this.$router.push('/');
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
