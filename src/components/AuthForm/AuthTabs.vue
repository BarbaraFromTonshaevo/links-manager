<script setup>
import { ref } from 'vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import LoginForm from './LoginForm.vue';

const activeTab = ref('signin') // signin | signup | reset

</script>

<template>
    <Tabs v-model:value="activeTab">
        <TabList>
            <Tab value="signin">Вход</Tab>
            <Tab value="signup">Регистрация</Tab>
        </TabList>
        <TabPanels>
            <TabPanel value="signin"><LoginForm/></TabPanel>
            <TabPanel value="signup">Регистрация (контент)</TabPanel>
        </TabPanels>
    </Tabs>
</template>