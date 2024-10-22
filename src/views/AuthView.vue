<template>
  <div>
    <LoginComponent v-if="showLogin" @switch-to-register="showLogin = false" />
    <RegisterComponent v-else @switch-to-login="showLogin = true" />
  </div>
</template>

<script>
import LoginComponent from '@/components/LoginComponent.vue'
import RegisterComponent from '@/components/RegisterComponent.vue'

export default {
  components: {
    LoginComponent,
    RegisterComponent
  },
  data() {
    return {
      showLogin: true
    }
  }
}
</script>
