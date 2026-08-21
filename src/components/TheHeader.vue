<script setup>
import { computed } from 'vue';
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Menubar from 'primevue/menubar'
import { useUserStore } from '@/stores/userStore';

const authStore = useUserStore()

const emailFirstLetter = computed(() => {
    return authStore.user?.email ? authStore.user.email[0].toUpperCase() : ''
})
</script>

<template>
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
          <Button icon="pi pi-sign-out" rounded severity="secondary" />
        </div>
      </template>
    </Menubar>
  </div>
</template>
