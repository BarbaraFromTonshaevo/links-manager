<script setup>
import { computed, ref } from 'vue'
import { Button, Avatar, Menubar } from 'primevue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAuth } from '@/composables/useAuth'
import { useToastNotifications } from '@/composables/useToastNotifications'
import CategoriesModal from './Modals/CategoriesModal.vue'
import CreateLinkModal from './Modals/CreateLinkModal.vue'

const router = useRouter()
const authStore = useUserStore()
const { signOut, errorMessage } = useAuth()
const { showToast } = useToastNotifications()
const categoriesDialogVisible = ref(false)
const createLinkDialogVisible = ref(false)

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
  <CategoriesModal v-model="categoriesDialogVisible" />
  <CreateLinkModal v-model="createLinkDialogVisible" />
  <div class="mb-5">
    <Menubar>
      <template #start>
        <div class="flex items-center gap-2">
          <span class="font-bold">Link manager</span>
          <div class="flex item-center gap-2">
            <Button icon="pi pi-link" rounded @click="createLinkDialogVisible = true" />
            <Button icon="pi pi-folder" rounded @click="categoriesDialogVisible = true" />
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
