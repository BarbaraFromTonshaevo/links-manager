<script setup>
import { ref, computed } from 'vue'
import { Card, SpeedDial } from 'primevue'
import { useLinksStore } from '@/stores/linksStore'
import { useToastNotifications } from '@/composables/useToastNotifications'

const linksStore = useLinksStore()
const { showToast } = useToastNotifications()

const itemsMenuButton = ref([
  {
    label: 'Избранное',
    icon: 'pi pi-star',
    command: async () => {
      try {
        await linksStore.changeIsFavorite(props.link.id)
        showToast('success', 'Успешно', `Изменения сохранены`)
      } catch {
        showToast('error', 'Ошибка', `Ошибка`)
      }
    },
  },
  {
    label: 'Скопировать',
    icon: 'pi pi-link',
    command: () => {
      copyToClipboard()
    },
  },
  {
    label: 'Редактировать',
    icon: 'pi pi-pencil',
    command: () => {
      console.log('edit link')
    },
  },
  {
    label: 'Удалить',
    icon: 'pi pi-trash',
    command: async () => {
      try {
        await linksStore.removeLink(props.link.id)
        showToast('success', 'Успешно', `Cсылка удалена`)
      } catch {
        showToast('error', 'Ошибка', `Ошибка удаления`)
      }
    },
  },
])

const props = defineProps({
  link: {
    type: Object,
    required: true,
  },
})

const isFavoriteBgCard = computed(() => {
  return props.link.is_favorite ? 'var(--p-button-outlined-warn-hover-background' : ''
})

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.link.url)
    showToast('success', 'Успешно', `Скопировано ${props.link.name}`)
  } catch {
    showToast('error', 'Ошибка', `Ошибка при копировании`)
  }
}

const openLink = () => {
    linksStore.addClickCount(props.link.id)
}
</script>

<template>
  <Card class="relative" :style="{ 'background-color': isFavoriteBgCard }">
    <template #title>
      <div class="flex items-center gap-2">
        <img :src="link.preview_image" :alt="link.name" />
        <a :href="link.url" target="_blank" @click="openLink">{{ link.name }}</a>
        <SpeedDial
          :model="itemsMenuButton"
          :tooltip-options="{ position: 'left' }"
          direction="down"
          style="position: absolute; right: 20px; top: 20px"
        />
      </div>
    </template>
    <template #content>
      <div class="flex gap-2 flex-col">
        <div class="font-bold">{{ link.categories.name }}</div>
        <div class="h-full" v-if="link.description">{{ link.description }}</div>
      </div>
    </template>
  </Card>
</template>
