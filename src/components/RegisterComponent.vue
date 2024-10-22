<script>
// export default {
//   name: "RegisterView"
// }

</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
    <div class="bg-white p-8 rounded-xl shadow-2xl w-96 transform transition-all hover:scale-105">
      <h2 class="text-3xl font-extrabold text-gray-900 text-center mb-6">Register</h2>
      <form @submit.prevent="register">
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
        <div class="mb-6">
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input v-model="confirmPassword" type="password" id="confirmPassword" required
                 class="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
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
    </div>
  </div>
</template>

<style scoped>

</style>