<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Menubar from 'primevue/menubar'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAuth } from '@/composables/useAuth'
import Toast from 'primevue/toast'
import { useToastNotifications } from '@/composables/useToastNotifications'

const router = useRouter()
const authStore = useUserStore()
const { signOut, errorMessage } = useAuth()
const { showToast } = useToastNotifications()

const emailFirstLetter = computed(() => {
  return authStore.user?.email ? authStore.user.email[0].toUpperCase() : ''
})

const signOutUser = async () => {
  try {
    await signOut()
    authStore.resetUser()
    await router.replace({ name: 'auth' })
  } catch {
    showToast('error', 'Ошибка выхода', errorMessage.value)
  }
}
</script>

<template>
  <Toast />
  <div class="mb-5">
    <Menubar>
      <template #start>
        <div class="flex items-center gap-2">
          <span class="font-bold">Link manager</span>
          <div class="flex item-center gap-2">
            <Button icon="pi pi-link" rounded />
            <Button icon="pi pi-folder" rounded />
          </div>
        </div>
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <Avatar :label="emailFirstLetter" size="large" shape="circle" />
          <Button icon="pi pi-sign-out" rounded severity="secondary" @click="signOutUser" />
        </div>
      </template>
    </Menubar>
  </div>
</template>
