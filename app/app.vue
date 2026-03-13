<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from '#app'
import AdminSideBar from './components/admin/AdminSideBar.vue'

useHead({
  title: 'BRC Market',
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Accueil` : 'BRC Market'
  },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

const loading = ref(false)
const router  = useRouter()
const route   = useRoute()

router.beforeEach(() => { loading.value = true })
router.afterEach(() => { setTimeout(() => { loading.value = false }, 400) })

// ── Layout conditions ────────────────────────────────────────────────────
const isAdminPage  = computed(() => route.path.startsWith('/admin'))
const isComptePage = computed(() => route.path.startsWith('/compte'))
</script>

<template>
  <div>
    <UToaster position="top-right" />
    <AppLoader v-if="loading" />

    <!-- ── ADMIN pages — admin header + admin sidebar ── -->
    <template v-if="isAdminPage">
      <div class="min-h-screen bg-gray-50">
        <AdminHeader />
        <div class="flex">
          <AdminSideBar />
          <main class="flex-1 min-w-0 p-6 min-h-[calc(100vh-4rem)]">
            <NuxtPage />
          </main>
        </div>
      </div>
    </template>

    <!-- ── COMPTE pages — public header + account sidebar ── -->
    <template v-else-if="isComptePage">
      <AppHeader />
      <div class="min-h-screen bg-gray-50">
        <UContainer class="py-8">
          <div class="flex gap-6 items-start">
            <CompteAccountSideBar />
            <main class="flex-1 min-w-0">
              <NuxtPage />
            </main>
          </div>
        </UContainer>
      </div>
      <AppFooter />
    </template>

    <!-- ── ALL OTHER pages (login, register, forgot-password, public) ── -->
    <template v-else>
      <HeroBanner />
      <AppHeader />
      <main>
        <NuxtPage />
      </main>
      <Popup />
      <AppFooter />
      <ChatBot />
    </template>

  </div>
</template>