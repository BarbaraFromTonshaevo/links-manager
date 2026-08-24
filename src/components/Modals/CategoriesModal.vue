<script setup>
import { ref, watch } from 'vue'
import { supabase } from '@/supabase'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { Form } from '@primevue/forms'
import Skeleton from 'primevue/skeleton'
import { Toast } from 'primevue'
import { useToastNotifications } from '@/composables/useToastNotifications'

const modelValue = defineModel()
const { showToast } = useToastNotifications()

const isLoadingModal = ref(true)
const isLoading = ref(false)
const categoryName = ref('')
const listCategories = ref([])

const saveCategory = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: categoryName.value })
      .select()
    if (error) throw error
    listCategories.value.push(data[0])
    categoryName.value = ''
    showToast('success', 'Успех', 'Категория добавлена')
  } catch {
    showToast('error', 'Ошибка', 'Не удалось добавить категорию')
  } finally {
    isLoading.value = false
  }
}

const getCategories = async () => {
  isLoadingModal.value = true
  try {
    const { data, error } = await supabase.from('categories').select()
    if (error) throw error
    listCategories.value = data
    isLoadingModal.value = false
  } catch {
    showToast('error', 'Ошибка', 'Не удалось получить категории')
  }
}

const deleteCategory = async (id) => {
  isLoadingModal.value = true
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    listCategories.value = listCategories.value.filter((category) => category.id !== id)
    showToast('success', 'Успех', 'Категория удалена')
  } catch {
    showToast('error', 'Ошибка', 'Не удалось получить категории')
  } finally {
    isLoadingModal.value = false
  }
}

watch(modelValue, async (newVal) => {
  if (newVal) await getCategories()
})
</script>

<template>
  <Toast />
  <Dialog header="Категории" v-model:visible="modelValue" :style="{ width: '25rem' }">
    <template v-if="isLoadingModal">
      <div class="grid mt-3 grid-cols-[1fr_32px] mb-1 items-center gap-5">
        <Skeleton width="100%" />
        <Skeleton shape="circle" size="2rem" />
      </div>
    </template>
    <template v-else>
      <Form @submit="saveCategory">
        <div class="gap-2 mb-2">
          <InputText
            v-model="categoryName"
            class="flex-auto w-full"
            autocomplete="off"
            placeholder="Название новой категории"
          />
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <Button type="button" label="Добавить" :loading="isLoading" @click="saveCategory" />
        </div>
        <div
          class="grid mt-3 grid-cols-[1fr_32px] mb-1 gap-5"
          v-for="category in listCategories"
          :key="category.id"
        >
          {{ category.name }}
          <Button
            type="button"
            rounded
            size="small"
            variant="text"
            icon="pi pi-times"
            @click="deleteCategory(category.id)"
          />
        </div>
      </Form>
    </template>
  </Dialog>
</template>
