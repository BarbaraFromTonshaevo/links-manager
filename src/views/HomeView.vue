<script setup>
import { onMounted, watch } from 'vue'
import { Button, Message } from 'primevue'
import { useLinksStore } from '@/stores/linksStore'
import TheLoader from '@/components/TheLoader.vue'
import TheFilters from '@/components/TheFilters.vue'
import CardLink from '@/components/CardLink.vue'
import { useToastNotifications } from '@/composables/useToastNotifications'

const { showToast } = useToastNotifications()
const linksStore = useLinksStore()

onMounted(async () => {
  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')

    if (accessToken) {
      window.history.replaceState(null, null, window.location.pathname)
    }
  }
  await linksStore.fetchLinks()
})

watch(
  () => linksStore.errorMessage,
  (newValue) => {
    if (newValue !== '' && linksStore.links.length) {
      showToast('error', 'Ошибка загрузки', newValue)
    }
  },
)
</script>

<template>
  <TheLoader v-if="linksStore.isLoading && linksStore.offset === 0" />
  <Message
    v-else-if="linksStore.errorMessage !== '' && !linksStore.links.length"
    severity="error"
    >{{ linksStore.errorMessage }}</Message
  >
  <h2 v-else-if="!linksStore.links.length" class="font-bold text-center">
    Вы пока еще не добавили ссылок
  </h2>
  <div v-else>
    <TheFilters />
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <CardLink v-for="link in linksStore.links" :key="link.id" :link="link" />
    </div>
    <div class="flex justify-center mt-3">
      <Button
        v-if="linksStore.hasMore"
        :loading="linksStore.isLoading"
        label="Показать еще"
        @click="linksStore.fetchLinks()"
      />
    </div>
  </div>
</template>
