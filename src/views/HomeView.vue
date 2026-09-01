<script setup>
import { onMounted } from 'vue'
import { Button } from 'primevue'
import { useLinksStore } from '@/stores/linksStore'
import TheLoader from '@/components/TheLoader.vue'
import TheFilters from '@/components/TheFilters.vue'
import CardLink from '@/components/CardLink.vue'

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
</script>

<template>
  <TheLoader v-if="linksStore.isLoading && linksStore.offset === 0" />
  <div v-else>
    <h2 v-if="!linksStore.links.length" class="font-bold text-center">
      Вы пока еще не добавили ссылок
    </h2>
    <template v-else>
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
    </template>
  </div>
</template>
