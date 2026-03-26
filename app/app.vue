<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from '#app'
import axios from 'axios'
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
const isAdminPage   = computed(() => route.path.startsWith('/admin'))
const isComptePage  = computed(() => route.path.startsWith('/compte'))
const isLivreurPage = computed(() => route.path.startsWith('/livreur'))

// ── Auth ─────────────────────────────────────────────────────────────────
// Ensure your useAuth returns 'user' or 'role'
const { token, isAdmin, user } = useAuth()
const isLivreur = computed(() => user.value?.role === 'livreur')

// ── Son nouvelle commande ────────────────────────────────────────────────
const config          = useRuntimeConfig()
const API             = config.public.apiBase
const lastOrderId     = ref<number | null>(null)
let   pollingTimer: ReturnType<typeof setInterval> | null = null

const playOrderSound = () => {
  try {
    const audio = new Audio('/sounds/order.mp3')
    audio.volume = 0.8
    audio.play().catch(() => {}) 
  } catch {}
}

const checkNewOrders = async () => {
  if (!token.value || !isAdmin.value) return
  try {
    const { data } = await axios.get(`${API}/admin/orders`, {
      headers: { Authorization: `Bearer ${token.value}`, Accept: 'application/json' },
      params:  { per_page: 1, page: 1 },
    })

    const orders    = data.data ?? data
    const latestId  = orders?.[0]?.id ?? null

    if (latestId === null) return

    if (lastOrderId.value === null) {
      lastOrderId.value = latestId
    } else if (latestId > lastOrderId.value) {
      lastOrderId.value = latestId
      playOrderSound()
    }
  } catch {}
}

const startPolling = () => {
  if (pollingTimer) return
  checkNewOrders()
  pollingTimer = setInterval(checkNewOrders, 30_000)
}

const stopPolling = () => {
  if (pollingTimer) { clearInterval(pollingTimer); pollingTimer = null }
}

onMounted(() => {
  if (isAdmin.value && token.value) startPolling()
  watch(
    [isAdmin, () => token.value],
    ([adminVal, tok]) => {
      if (adminVal && tok) startPolling()
      else                 stopPolling()
    }
  )
})

onUnmounted(() => stopPolling())
</script>

<template>
  <div>
    <UToaster position="top-right" />
    <AppLoader v-if="loading" />

    <template v-if="isLivreurPage">
      <div class="min-h-screen bg-gray-50">
        <LivreurHeader />
        <div class="flex">
          <LivreurSideBar />
          <main class="flex-1 min-w-0 p-6 min-h-[calc(100vh-4rem)]">
            <NuxtPage />
          </main>
        </div>
      </div>
    </template>

    <template v-else-if="isAdminPage">
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