<script setup>
// import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import TheHeader from './components/TheHeader.vue'
import { useUserStore } from './stores/userStore.js'
import { Toast } from 'primevue'
import TheLoader from './components/TheLoader.vue'

const authStore = useUserStore()
</script>

<template>
  <Toast />
  <TheHeader v-if="authStore.user" />
  <TheLoader v-if="!authStore.isReady" />
  <RouterView v-else></RouterView>
</template>

<style scoped></style>
