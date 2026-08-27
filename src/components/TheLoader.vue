<script setup>
import { ProgressSpinner } from 'primevue'
</script>

<template>
  <div class="flex justify-center">
    <ProgressSpinner
      style="width: 50px; height: 50px"
      stroke-width="8"
      fill="transparent"
      animation-duration=".5s"
    />
  </div>
</template>
