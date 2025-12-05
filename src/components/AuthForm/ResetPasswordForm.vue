<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';


const formData = ref({
    email: '',
})
</script>

<template>
    <form>
        <div class="mb-3">
            <InputText name="email" placeholder="Введите email" type="text" v-model="formData.email" class="w-full" />
        </div>
        <div class="grid">
            <Button type="submit" class="w-full" label="Сброс пароля"></Button>
        </div>

    </form>
</template>