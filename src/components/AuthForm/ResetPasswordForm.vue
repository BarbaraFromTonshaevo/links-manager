<script setup>
import { ref } from 'vue'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { Button, InputText, Message } from 'primevue'
import { useToastNotifications } from '@/composables/useToastNotifications'
import { useAuth } from '@/composables/useAuth'

const { showToast } = useToastNotifications()
const { resetPassword, loading, errorMessage } = useAuth()

const email = ref('')

const rules = z.object({
  email: z.string().email({ message: 'Некорректный email' }),
})

const resolver = ref(zodResolver(rules))

const submitForm = async ({ valid }) => {
  if (!valid) return
  try {
    await resetPassword(email.value)
    showToast('success', 'Успешно', 'Ссылка на сброс пароля уже на вашей почте')
  } catch {
    showToast('error', 'Ошибка регистрации', errorMessage.value)
  }
}
</script>

<template>
  <Form
    v-slot="$form"
    :initial-values="{ email }"
    :resolver="resolver"
    :validate-on-blur="true"
    :validate-on-value-update="false"
    @submit="submitForm"
  >
    <div class="mb-3">
      <InputText
        name="email"
        placeholder="Введите email"
        type="text"
        v-model="email"
        class="w-full"
      />
      <Message v-if="$form.email?.invalid" severity="error" variant="simple" size="small">
        {{ $form.email.error.message }}
      </Message>
    </div>
    <div class="grid">
      <Button type="submit" class="w-full" label="Сброс пароля" :loading="loading"></Button>
    </div>
  </Form>
</template>
