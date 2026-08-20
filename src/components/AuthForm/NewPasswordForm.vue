<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import { useToastNotifications } from '@/composables/useToastNotifications'
import { useAuth } from '@/composables/useAuth'

const { showToast } = useToastNotifications()
const { updatePassword, loading, errorMessage } = useAuth()
const router = useRouter()

const password = ref('')
const rules = z.object({
  password: z.string().min(6, { message: 'Должно быть минимум 6 символов' }),
})
const resolver = ref(zodResolver(rules))

const submitForm = async ({ valid }) => {
  if (!valid) return
  try {
    await updatePassword(password.value)
    router.replace('/auth')
  } catch {
    showToast('error', 'Ошибка при создании нового пароля', errorMessage.value)
  }
}
</script>

<template>
  <Toast />
  <Form
    v-slot="$form"
    :initial-values="{ password }"
    :resolver="resolver"
    :validate-on-blur="true"
    :validate-on-value-update="false"
    @submit="submitForm"
  >
    <div class="mb-3">
      <InputText
        name="password"
        placeholder="Введите пароль"
        type="password"
        v-model="password"
        class="w-full"
      />
      <Message v-if="$form.password?.invalid" severity="error" variant="simple" size="small">
        {{ $form.password.error.message }}
      </Message>
    </div>
    <Button type="submit" class="w-full" label="Задать новый пароль" :loading="loading"></Button>
  </Form>
</template>
