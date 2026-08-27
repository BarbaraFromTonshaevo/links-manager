<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import TheHeader from './components/TheHeader.vue'
import { useUserStore } from './stores/userStore.js'
import { Toast } from 'primevue'

const authStore = useUserStore()

onMounted(async () => {
  await authStore.getUser()
})
</script>

<template>
  <Toast />
  <TheHeader v-if="authStore.user" />
  <RouterView></RouterView>
</template>

<style scoped></style>
