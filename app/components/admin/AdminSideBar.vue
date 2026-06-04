<script setup lang="ts">
import axios from 'axios'

const route  = useRoute()
const router = useRouter()
const token  = useCookie('auth_token')

const config = useRuntimeConfig()
const API    = config.public.apiBase

const user       = useState<any>('auth_user', () => null)
const mobileOpen = useState<boolean>('admin_sidebar_open', () => false)

const authHeaders = computed(() => ({ Authorization: `Bearer ${token.value}` }))

// ── Gestion des nouvelles commandes ──────────────────────────────────────
const newOrdersCount  = useState<number>('admin_new_orders_badge', () => 0)
const totalOrdersInDb = ref<number>(0)

const fetchNewOrders = async () => {
  if (!token.value) return
  try {
    const { data } = await axios.get(`${API}/admin/orders/stats`, {
      headers: authHeaders.value
    })
    const currentTotal = data.total ?? (data.pending + data.processing + data.completed + data.cancelled)
    totalOrdersInDb.value = currentTotal

    if (!process.client) return
    const stored = localStorage.getItem('admin_orders_known_count')

    if (stored === null) {
      localStorage.setItem('admin_orders_known_count', String(currentTotal))
      newOrdersCount.value = 0
    } else {
      const lastKnownCount = parseInt(stored)
      newOrdersCount.value = currentTotal > lastKnownCount ? currentTotal - lastKnownCount : 0
    }
  } catch (e) {}
}

// ── Gestion des nouveaux avis ─────────────────────────────────────────────
const newReviewsCount = useState<number>('admin_new_reviews_badge', () => 0)

const fetchNewReviews = async () => {
  if (!token.value) return
  try {
    const { data } = await axios.get(`${API}/admin/reviews/stats`, {
      headers: authHeaders.value
    })
    const pending = data.pending ?? 0

    if (!process.client) return
    const seen = parseInt(localStorage.getItem('admin_reviews_seen_count') ?? '0')

    // Badge = pending actuel minus ce qu'on avait déjà vu
    // Si on est sur la page reviews, on remet seen à jour automatiquement
    newReviewsCount.value = pending > seen ? pending - seen : 0
  } catch (e) {}
}

// ── Gestion des nouveaux utilisateurs ────────────────────────────────────
const newUsersBadgeCount = useState<number>('admin_new_users_badge', () => 0)
const totalUsersInDb     = ref<number>(0)

const fetchNewUsersCount = async () => {
  if (!token.value) return
  try {
    const { data } = await axios.get(`${API}/admin/users/stats`, {
      headers: authHeaders.value
    })
    totalUsersInDb.value = data.total ?? 0
    const newCount = data.new ?? 0

    if (!process.client) return
    const seen = parseInt(localStorage.getItem('admin_users_seen_count') ?? '0')

    newUsersBadgeCount.value = newCount > seen ? newCount - seen : 0
  } catch (e) {
    console.error('[USERS BADGE] fetch failed', e)
  }
}

// ── Vider les badges ──────────────────────────────────────────────────────
const clearBadge = (type: 'orders' | 'reviews' | 'users') => {
  if (!process.client) return

  if (type === 'orders') {
    localStorage.setItem('admin_orders_known_count', String(totalOrdersInDb.value))
    newOrdersCount.value = 0
  } else if (type === 'reviews') {
    // On mémorise qu'on a "vu" les avis pending actuels
    localStorage.setItem('admin_reviews_seen_count', String(newReviewsCount.value))
    newReviewsCount.value = 0
  } else if (type === 'users') {
    // On mémorise qu'on a "vu" les nouveaux users actuels
    localStorage.setItem('admin_users_seen_count', String(newUsersBadgeCount.value))
    newUsersBadgeCount.value = 0
  }
}

// ── Mapping route → badge — efface automatiquement quand on arrive sur la page
const routeBadgeMap: Record<string, 'orders' | 'reviews' | 'users'> = {
  '/admin/commandes': 'orders',
  '/admin/reviews':   'reviews',
  '/admin/users':     'users',
}

watch(() => route.path, (newPath) => {
  mobileOpen.value = false

  const badgeType = Object.entries(routeBadgeMap).find(([routePrefix]) =>
    newPath === routePrefix || newPath.startsWith(routePrefix + '/')
  )?.[1]

  if (badgeType) clearBadge(badgeType)
}, { immediate: true }) // immediate: true = efface aussi au montage si déjà sur la page

// ── Polling ───────────────────────────────────────────────────────────────
let pollingTimer: ReturnType<typeof setInterval>

onMounted(async () => {
  if (!user.value && token.value) {
    try {
      const res = await axios.get(`${API}/auth/me`, { headers: authHeaders.value })
      user.value = res.data
    } catch { token.value = null }
  }

  await fetchNewOrders()
  await fetchNewReviews()
  await fetchNewUsersCount()

  pollingTimer = setInterval(() => {
    fetchNewOrders()
    fetchNewReviews()
    fetchNewUsersCount()
  }, 30_000)
})

onUnmounted(() => clearInterval(pollingTimer))

// ── UI Computeds ──────────────────────────────────────────────────────────
const fullName = computed(() =>
  user.value ? `${user.value.first_name} ${user.value.last_name}` : '...'
)
const initials = computed(() => {
  if (!user.value) return '?'
  return `${user.value.first_name?.[0] ?? ''}${user.value.last_name?.[0] ?? ''}`.toUpperCase()
})

const sections = computed(() => {
  if (!user.value) return []
  const isAdmin = user.value.role !== 'user'

  return [
    {
      label: 'Général',
      links: [
        { label: 'Dashboard', icon: 'i-heroicons-squares-2x2', to: '/admin', badgeType: null },
      ]
    },
    {
      label: 'Boutique',
      links: [
        { label: 'Commandes',  icon: 'i-heroicons-shopping-bag',      to: '/admin/commandes',  badgeType: 'orders'  },
        { label: 'Produits',   icon: 'i-heroicons-cube',              to: '/admin/produits',   badgeType: null      },
        { label: 'Catégories', icon: 'i-heroicons-tag',               to: '/admin/categories', badgeType: null      },
        { label: 'Avis',       icon: 'i-heroicons-star',              to: '/admin/reviews',    badgeType: 'reviews' },
      ]
    },
    {
      label: 'Gestion',
      links: [
        ...(isAdmin ? [
          { label: 'Utilisateurs', icon: 'i-heroicons-users',                  to: '/admin/users',     badgeType: 'users' },
          { label: 'Analytics',    icon: 'i-heroicons-presentation-chart-bar', to: '/admin/analytics', badgeType: null    },
        ] : []),
        { label: 'Informations', icon: 'i-heroicons-building-office', to: '/admin/informations', badgeType: null },
        { label: 'Paramètres',   icon: 'i-heroicons-cog-6-tooth',     to: '/admin/parametres',   badgeType: null },
      ]
    },
  ]
})

const isActive = (to: string) => {
  if (!route?.path) return false
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}
// handleLinkClick ne fait plus rien pour les badges — le watch s'en occupe
const handleLinkClick = (_link: any) => {}

const handleLogout = async () => {
  try {
    await axios.post(`${API}/auth/logout`, {}, { headers: authHeaders.value })
  } catch {}
  token.value      = null
  user.value       = null
  mobileOpen.value = false
  if (process.client) {
    localStorage.removeItem('admin_orders_known_count')
    localStorage.removeItem('admin_reviews_seen_count') // ← ajouter
    localStorage.removeItem('admin_users_seen_count')   // ← ajouter
  }
  router.push('/login')
}

const getBadgeCount = (type: string | null): number => {
  if (type === 'orders')  return newOrdersCount.value
  if (type === 'reviews') return newReviewsCount.value
  if (type === 'users')   return newUsersBadgeCount.value
  return 0
}

watch(() => route.path, () => {
  mobileOpen.value = false
})
</script>

<template>
  <!-- SIDEBAR DESKTOP -->
  <aside class="hidden lg:flex flex-col w-60 flex-shrink-0 sticky top-16 self-start h-[calc(100vh-4rem)] bg-white border-r border-gray-100 overflow-y-auto">
    <nav class="flex-1 p-2 space-y-4 py-3">
      <div v-for="section in sections" :key="section.label">
        <p class="text-[14px] font-bold text-gray-400 tracking-widest px-3 mb-1">{{ section.label }}</p>
        <div class="flex flex-col gap-0.5">
          <NuxtLink
            v-for="link in section.links"
            :key="link.to"
            :to="link.to"
            @click="handleLinkClick(link)"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="isActive(link.to) ? 'bg-[#274a82] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-[#274a82]'"
          >
            <UIcon :name="link.icon" class="w-4 h-4 flex-shrink-0" />
            <span class="truncate">{{ link.label }}</span>

            <span
              v-if="link.badgeType && getBadgeCount(link.badgeType) > 0"
              class="ml-auto min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center animate-pulse"
              :class="isActive(link.to) ? 'bg-white text-[#274a82]' : 'bg-[#e60012] text-white'"
            >
              {{ getBadgeCount(link.badgeType) > 99 ? '99+' : getBadgeCount(link.badgeType) }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <div class="p-2 border-t border-gray-50">
      <NuxtLink
        to="/"
        class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-[#274a82] transition-all mb-1"
      >
        <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4 flex-shrink-0" />
        Voir le site
      </NuxtLink>
      <button
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        @click="handleLogout"
      >
        <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-4 h-4 flex-shrink-0" />
        Se déconnecter
      </button>
    </div>
  </aside>

  <!-- MOBILE DRAWER -->
  <Teleport to="body">
  <Transition
    enter-active-class="transition duration-250 ease-out"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <div v-if="mobileOpen" class="fixed inset-0 z-50 flex lg:hidden">

      <!-- OVERLAY (click = close) -->
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        @click="mobileOpen = false"
      />

      <!-- SIDEBAR -->
      <aside class="relative w-72 bg-white h-full flex flex-col shadow-2xl">

        <!-- HEADER + CLOSE BUTTON -->
        <div class="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <h2 class="font-black text-gray-900 text-sm">Menu</h2>

          <button
            @click="mobileOpen = false"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <!-- NAV -->
        <nav class="flex-1 p-2 overflow-y-auto">
          <div v-for="section in sections" :key="section.label">
            <p class="text-[14px] font-bold text-gray-400 tracking-widest px-3 mb-1">
              {{ section.label }}
            </p>

            <div class="flex flex-col gap-0.5">
              <NuxtLink
                v-for="link in section.links"
                :key="link.to"
                :to="link.to"
                @click="handleLinkClick(link)"
                class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium"
                :class="isActive(link.to)
                  ? 'bg-[#274a82] text-white'
                  : 'text-gray-600 hover:bg-gray-100'"
              >
                <UIcon :name="link.icon" class="w-4 h-4" />
                {{ link.label }}

                <span
                  v-if="link.badgeType && getBadgeCount(link.badgeType) > 0"
                  class="ml-auto bg-[#e60012] text-white min-w-[18px] h-[18px] rounded-full text-[10px] flex items-center justify-center animate-pulse"
                >
                  {{ getBadgeCount(link.badgeType) > 99 ? '99+' : getBadgeCount(link.badgeType) }}
                </span>
              </NuxtLink>
            </div>
          </div>
        </nav>

      </aside>
    </div>
  </Transition>
</Teleport>
</template>