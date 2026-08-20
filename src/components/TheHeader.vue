<script setup>
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Menubar from 'primevue/menubar'
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
          <Avatar label="A" size="large" shape="circle" />
          <Button icon="pi pi-sign-out" rounded severity="secondary" />
        </div>
      </template>
    </Menubar>
  </div>
</template>
