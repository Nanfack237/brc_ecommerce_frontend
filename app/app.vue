<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '#app'
import AdminDashboard from './pages/admin/AdminDashboard.vue';

// Configuration du titre et du favicon
useHead({
  title: 'BRC Market',
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Accueil` : 'BRC Market';
  },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

const loading = ref(false)
const router = useRouter()

router.beforeEach(() => {
  loading.value = true
})

router.afterEach(() => {
  setTimeout(() => {
    loading.value = false
  }, 400)
})
</script>

<template>
  <div>
    <AppLoader v-if="loading" />
    <HeroBanner />
    <AppHeader />
        <main>
      <NuxtPage />
    </main>
    <Popup />
    <AppFooter />
    <ChatBot />
  </div>
</template>