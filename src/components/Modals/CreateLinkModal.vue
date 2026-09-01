<script setup>
import { ref, watch, computed } from 'vue'
import { supabase } from '@/supabase'
import { Dialog, InputText, Button, Textarea, Select, Checkbox, Message } from 'primevue'
import { useToastNotifications } from '@/composables/useToastNotifications'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import TheLoader from '@/components/TheLoader.vue'
import { useUserStore } from '@/stores/userStore'
import { useLinksStore } from '@/stores/linksStore'

const userStore = useUserStore()
const linksStore = useLinksStore()

const modelValue = defineModel()
const isLoading = ref(false)
const isLoadingButton = ref(false)
const { showToast } = useToastNotifications()

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false,
  },
  id: {
    type: Number,
    required: false,
  },
})

const rules = z.object({
  name: z.string().min(1, { message: 'Название обязательно для заполнения' }),
  url: z.string().url({ message: 'Неккоректная ссылка' }),
})
const resolver = ref(zodResolver(rules))

const formInputs = ref({
  name: '',
  url: '',
  description: '',
  category: null,
  isFavorite: false,
})

const listCategories = ref([])
const getCategories = async () => {
  try {
    const { data, error } = await supabase.from('categories').select()
    if (error) throw error
    listCategories.value = data
    formInputs.value.category = listCategories.value[0] ?? ''
  } catch {
    showToast('error', 'Ошибка', 'Не удалось получить категории')
  }
}

const getLink = async () => {
  try {
    const { data, error } = await supabase.from('links').select().eq('id', props.id)

    if (error) throw error
    formInputs.value.name = data[0].name
    formInputs.value.url = data[0].url
    formInputs.value.description = data[0].description
    formInputs.value.isFavorite = data[0].is_favorite
    formInputs.value.category = listCategories.value.find((item) => item.id == data[0].category)
  } catch {
    showToast('error', 'Ошибка', 'Ошибка при получении данных')
  }
}

const clear = () => {
  formInputs.value = {
    name: '',
    url: '',
    description: '',
    category: null,
    isFavorite: false,
  }
}

const loadModal = async () => {
  isLoading.value = true
  await getCategories()
  if (props.isEdit) {
    await getLink()
  }
  isLoading.value = false
}

const getDomain = (url) => {
  const { hostname } = new URL(url)
  const parts = hostname.split('.')
  if (parts.length > 2) {
    return parts.slice(-2).join('.')
  }
  return hostname
}

const addNewLink = async () => {
  isLoadingButton.value = true
  const hostname = getDomain(formInputs.value.url)
  const payload = {
    name: formInputs.value.name,
    url: formInputs.value.url,
    description: formInputs.value.description,
    category: formInputs.value.category.id,
    click_count: 0,
    is_favorite: formInputs.value.isFavorite,
    preview_image: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=32`,
    user_id: userStore.user.id,
  }
  try {
    const { error } = await supabase.from('links').insert(payload).select()
    if (error) throw error
    modelValue.value = false
    clear()
    showToast('success', 'Успех', 'Ссылка добавлена')
  } catch (error) {
    showToast('error', 'Ошибка', error)
    console.log(error)
  } finally {
    isLoadingButton.value = false
  }
}

const updateLink = async () => {
  isLoadingButton.value = true
  try {
    const payload = {
      name: formInputs.value.name,
      url: formInputs.value.url,
      description: formInputs.value.description,
      category: formInputs.value.category.id,
      is_favorite: formInputs.value.isFavorite,
    }
    const { error } = await supabase.from('links').update(payload).eq('id', props.id)
    if (error) throw error
    showToast('success', 'Успех', 'Ссылка изменена')
  } catch (error) {
    showToast('error', 'Ошибка', error)
  } finally {
    isLoadingButton.value = false
  }
}

const submitForm = async () => {
  if (props.isEdit) {
    await updateLink()
  } else {
    await addNewLink()
  }
  await linksStore.fetchLinks(true, true)
}

const textButton = computed(() => {
  return props.isEdit ? 'Сохранить' : 'Добавить'
})

const textHeader = computed(() => {
  return props.isEdit ? 'Редактирование ссылки' : 'Создание ссылки'
})

watch(modelValue, async (newVal) => {
  if (newVal) {
    loadModal()
  }
})
</script>

<template>
  <Dialog modal :header="textHeader" v-model:visible="modelValue" :style="{ width: '25rem' }">
    <Form
      v-slot="$form"
      :initial-values="formInputs"
      :resolver="resolver"
      :validate-on-blur="true"
      :validate-on-value-update="false"
      @submit="submitForm"
    >
      <TheLoader v-if="isLoading" />
      <template v-else>
        <div class="mb-3">
          <InputText
            name="name"
            v-model="formInputs.name"
            class="w-full"
            autocomplete="off"
            placeholder="Название ссылки"
          />
          <Message v-if="$form.name?.invalid" severity="error" variant="simple" size="small">
            {{ $form.name.error.message }}
          </Message>
        </div>
        <div class="mb-3">
          <InputText
            name="url"
            v-model="formInputs.url"
            class="w-full"
            autocomplete="off"
            placeholder="Адрес ссылки"
          />
          <Message v-if="$form.url?.invalid" severity="error" variant="simple" size="small">
            {{ $form.url.error.message }}
          </Message>
        </div>
        <div class="mb-3">
          <Select
            v-model="formInputs.category"
            :options="listCategories"
            optionLabel="name"
            placeholder="Выберите категорию"
            class="w-full"
          />
        </div>
        <div class="mb-3">
          <Textarea
            v-model="formInputs.description"
            class="w-full"
            autocomplete="off"
            placeholder="Описание"
            style="resize: none"
          />
        </div>
        <div class="mb-3 flex items-center gap-2">
          <Checkbox v-model="formInputs.isFavorite" inputId="isFavorite" binary />
          <label for="isFavorite">Добавить в избранное</label>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <Button :label="textButton" type="submit" :loading="isLoadingButton" />
        </div>
      </template>
    </Form>
  </Dialog>
</template>
