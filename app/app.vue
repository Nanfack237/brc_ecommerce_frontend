<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from '#app'
import axios from 'axios'
import AdminSideBar from './components/admin/AdminSideBar.vue'

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk}` : 'BRC Market'
  },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
  ],
  script: [
    {
      innerHTML: `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1002096469393062');
        fbq('track', 'PageView');
      `,
      type: 'text/javascript',
    },
  ],
  noscript: [
    {
      innerHTML: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1002096469393062&ev=PageView&noscript=1" />`,
    },
  ],
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
const isHomePage    = computed(() => route.path === '/')

// ── Auth ─────────────────────────────────────────────────────────────────
const { token, isAdmin, user } = useAuth()
const isLivreur = computed(() => user.value?.role === 'livreur')

// ── Son nouvelle commande ────────────────────────────────────────────────
const config      = useRuntimeConfig()
const API         = config.public.apiBase
const lastOrderId = ref<number | null>(null)
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
    const orders   = data.data ?? data
    const latestId = orders?.[0]?.id ?? null
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
  pollingTimer = setInterval(checkNewOrders, 5_000)
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
    },
  )
})

// ── PWA Install Banner ───────────────────────────────────────────────────
const isStandaloneMode = () => {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  )
}

let deferredPrompt: any = null

const showBanner       = ref(false)
const dismissed        = ref(false)
const alreadyInstalled = ref(false)

let autoTimer:  ReturnType<typeof setTimeout> | null = null
let closeTimer: ReturnType<typeof setTimeout> | null = null

const clearTimers = () => {
  if (autoTimer)  { clearTimeout(autoTimer);  autoTimer  = null }
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
}

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
const isIOS    = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

const checkAlreadyInstalled = async (): Promise<boolean> => {
  if (localStorage.getItem('pwa_installed') === 'true') return true
  if ('getInstalledRelatedApps' in navigator) {
    try {
      const apps = await (navigator as any).getInstalledRelatedApps()
      if (apps.length > 0) return true
    } catch {}
  }
  return false
}

const openBanner = () => {
  if (dismissed.value || isStandaloneMode() || alreadyInstalled.value) return
  showBanner.value = true
  closeTimer = setTimeout(() => { showBanner.value = false }, 10_000)
}

const closeBanner = (ignore = false) => {
  showBanner.value = false
  if (ignore) dismissed.value = true
  clearTimers()
}

const handleInstall = async () => {
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      deferredPrompt = null
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_installed', 'true')
        alreadyInstalled.value = true
      }
      closeBanner()
      return
    } catch {
      deferredPrompt = null
    }
  }

  if (!isMobile()) {
    closeBanner()
    alert(
      'Installation non disponible.\n\n' +
      "Assurez-vous d'utiliser Chrome ou Edge sur votre ordinateur.\n" +
      "Si c'est déjà le cas, l'application est peut-être déjà installée.",
    )
    return
  }

  if (isIOS()) {
    closeBanner()
    alert(
      'Sur iPhone / iPad :\n\n' +
      "1. Appuyez sur le bouton Partager ↑ en bas de Safari\n" +
      "2. Choisissez « Sur l'écran d'accueil »\n" +
      "3. Appuyez sur « Ajouter »",
    )
    return
  }

  closeBanner()
  alert(
    'Sur Android :\n\n' +
    '1. Appuyez sur le menu ⋮ en haut à droite de Chrome\n' +
    "2. Choisissez « Installer l'application »\n" +
    "3. Confirmez en appuyant sur « Installer »",
  )
}

onMounted(async () => {
  if (isStandaloneMode()) return

  alreadyInstalled.value = await checkAlreadyInstalled()
  if (alreadyInstalled.value) return

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    deferredPrompt = e
    alreadyInstalled.value = false
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    localStorage.setItem('pwa_installed', 'true')
    alreadyInstalled.value = true
    closeBanner()
  })

  if (isHomePage.value) {
    autoTimer = setTimeout(() => openBanner(), 3_000)
  }

  // ✅ Ferme la bannière dès que l'utilisateur quitte la page d'accueil
  watch(isHomePage, (val) => {
    if (!val) {
      clearTimers()
      showBanner.value = false
    }
  })
})

onUnmounted(() => {
  clearTimers()
  stopPolling()
})
</script>

<template>
  <div>
    <UToaster position="top-right" />
    <AppLoader v-if="loading" />

    <!-- ── Livreur layout ───────────────────────────────────────────────── -->
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

    <!-- ── Admin layout ─────────────────────────────────────────────────── -->
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

    <!-- ── Compte layout ────────────────────────────────────────────────── -->
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

    <!-- ── Layout public ────────────────────────────────────────────────── -->
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

    <!-- ── PWA Install Banner — visible uniquement sur la page d'accueil ── -->
    <Transition name="pwa-slide">
      <div v-if="showBanner && isHomePage" class="pwa-banner">

        <div class="pwa-progress">
          <div class="pwa-progress-bar" />
        </div>

        <div class="pwa-inner">
          <div class="pwa-icon-wrap">
            <img src="/icons/pwa-192x192.png" class="pwa-icon" alt="BRC Market" />
            <div class="pwa-icon-badge">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1.5V6M5 6L3 4M5 6L7 4" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M1.5 7.5V8.5H8.5V7.5" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
            </div>
          </div>

          <div class="pwa-text">
            <p class="pwa-title">BRC Market</p>
            <p class="pwa-subtitle">Accédez à l'app depuis votre écran d'accueil, sans navigateur.</p>
          </div>
        </div>

        <div class="pwa-actions">
          <button class="pwa-btn-ignore" @click="closeBanner(true)">
            Ignorer
          </button>
          <button class="pwa-btn-install" @click="handleInstall">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="flex-shrink:0">
              <path d="M6.5 1v6.5M6.5 7.5L4 5M6.5 7.5L9 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M1 9.5v1.5a1 1 0 001 1h9a1 1 0 001-1V9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            Installer l'app
          </button>
        </div>

      </div>
    </Transition>

    <VitePwaManifest />
  </div>
</template>

<style scoped>
.pwa-slide-enter-active {
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
}
.pwa-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.55, 0, 1, 0.45), opacity 0.3s ease;
}
.pwa-slide-enter-from {
  transform: translateX(calc(-100% - 1.5rem));
  opacity: 0;
}
.pwa-slide-leave-to {
  transform: translateX(calc(-100% - 1.5rem));
  opacity: 0;
}

.pwa-banner {
  position: fixed;
  bottom: 1.5rem;
  left: 1rem;
  z-index: 9999;
  width: 316px;
  max-width: calc(100vw - 2rem);
  background: #ffffff;
  border-radius: 22px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(39, 74, 130, 0.09),
    0 8px 20px -4px rgba(39, 74, 130, 0.14),
    0 24px 48px -8px rgba(39, 74, 130, 0.16);
}

.pwa-progress {
  height: 3px;
  background: rgba(39, 74, 130, 0.07);
}
.pwa-progress-bar {
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, #274a82 0%, #5b8be8 100%);
  transform-origin: left center;
  animation: progress-shrink 10s linear forwards;
}
@keyframes progress-shrink {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}

.pwa-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 10px;
}

.pwa-icon-wrap { position: relative; flex-shrink: 0; }
.pwa-icon {
  width: 50px;
  height: 50px;
  border-radius: 13px;
  display: block;
  box-shadow: 0 2px 10px rgba(39, 74, 130, 0.22);
}
.pwa-icon-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  background: #274a82;
  border-radius: 50%;
  border: 2.5px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pwa-text { flex: 1; min-width: 0; }
.pwa-title {
  margin: 0 0 3px;
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.pwa-subtitle {
  margin: 0;
  font-size: 11px;
  color: #6b7280;
  line-height: 1.5;
}

.pwa-actions {
  display: flex;
  gap: 8px;
  padding: 8px 16px 16px;
}

.pwa-btn-ignore {
  flex: 0 0 auto;
  padding: 10px 15px;
  background: #f8fafc;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 13px;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.pwa-btn-ignore:hover  { background: #f1f5f9; color: #64748b; }
.pwa-btn-ignore:active { background: #e2e8f0; }

.pwa-btn-install {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 16px;
  background: #274a82;
  border: none;
  border-radius: 13px;
  font-size: 12px;
  font-weight: 800;
  color: #ffffff;
  cursor: pointer;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 14px rgba(39,74,130,0.38);
  transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
}
.pwa-btn-install:hover  { background: #1d3d70; box-shadow: 0 6px 20px rgba(39,74,130,0.48); transform: translateY(-1px); }
.pwa-btn-install:active { transform: scale(0.97); box-shadow: 0 2px 8px rgba(39,74,130,0.3); }
</style>