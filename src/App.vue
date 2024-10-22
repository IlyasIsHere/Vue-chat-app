<script setup>
import { RouterLink, RouterView } from 'vue-router'
import NavbarComponent from "@/components/NavbarComponent.vue";
</script>

<template>
  <header>
    <navbar-component></navbar-component>
  </header>

  <RouterView />
</template>

