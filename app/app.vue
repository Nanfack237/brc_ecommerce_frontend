<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '#app'

const loading = ref(false)
const router = useRouter()

// Quand la navigation commence
router.beforeEach(() => {
  loading.value = true
})

// Quand la navigation est terminée
router.afterEach(() => {
  setTimeout(() => {
    loading.value = false
  }, 400) // petit délai = UX plus fluide
})
</script>

<template>
  <div>
    <AppLoader v-if="loading" />

    <!-- Header -->
    <HeroBanner />
    <AppHeader />

    <!-- Page Content -->
    <main>
      <NuxtPage />
    </main>
    <Popup />

    <!-- Footer -->
    <AppFooter />

    <!-- Chat -->
    <ChatBot />
  </div>
</template>
