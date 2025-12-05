<script setup>
import { ref } from 'vue';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';

const formData = ref({
    email: '',
    password: ''
})

const emits = defineEmits(['resetPassword'])

const rules = z.object({
    email: z.string().email({ message: 'Некорректный email' }),
    password: z.string().min(6, { message: 'Должно быть минимум 6 символов' }),
})

const resolver = ref(zodResolver(rules))

const submitForm = async ({ valid }) => {
    console.log(valid)
}
</script>

<template>
    <Form v-slot="$form" :initial-values="formData" :resolver="resolver" :validate-on-blur="true"
        :validate-on-value-update="false" @submit="submitForm">
        <div class="mb-3">
            <InputText name="email" placeholder="Введите email" type="text" v-model="formData.email" class="w-full" />
            <Message v-if="$form.email?.invalid" severity="error" variant="simple" size="small">
                {{$form.email.error.message }}
            </Message>
        </div>
        <div class="mb-3">
            <InputText name="password" placeholder="Введите пароль" type="password" v-model="formData.password"
                class="w-full" />
            <Message v-if="$form.password?.invalid" severity="error" variant="simple" size="small">
                {{$form.password.error.message }}
            </Message>
        </div>
        <span class="cursor-pointer mb-3 block" @click="emits('resetPassword')">
            Забыли пароль?
        </span>
        <div class="grid grid-cols-2 gap-3">
            <Button type="submit" class="w-full" label="Вход"></Button>
            <Button type="submit" icon="pi pi-github" class="w-full" label="GitHub" severity="contrast"></Button>
        </div>
    </Form>
</template>