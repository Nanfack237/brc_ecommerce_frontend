<!-- components/LivreurSidebar.vue -->
<script setup lang="ts">
import axios from 'axios'
import type { ToastProps } from '@nuxt/ui'

const route  = useRoute()
const router = useRouter()
const toast  = useToast()
const token  = useCookie('auth_token')

const user = useState<any>('auth_user', () => null)

// Shared with DelivererHeader — burger button opens this
const mobileOpen = useState<boolean>('deliverer_sidebar_open', () => false)

// Auto-close on route change
watch(() => route.path, () => { mobileOpen.value = false })

// ── Nouvelles commandes assignées ─────────────────────────────────────────
const newOrdersCount = useState<number>('livreur_new_orders', () => 0)

// localStorage n'existe que côté client — initialisé dans onMounted
const lastSeenCount = ref<number>(0)

const fetchNewOrders = async () => {
  if (!token.value) return
  try {
    const { data } = await axios.get('http://127.0.0.1:8000/api/livreur/stats', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    const active = (data.processing ?? 0) + (data.shipped ?? 0)
    newOrdersCount.value = Math.max(0, active - lastSeenCount.value)
  } catch {}
}

// Efface le badge quand on clique sur "Mes livraisons"
const clearBadge = () => {
  const current = lastSeenCount.value + newOrdersCount.value
  if (process.client) {
    localStorage.setItem('livreur_last_seen', String(current))
  }
  lastSeenCount.value  = current
  newOrdersCount.value = 0
}

let pollingTimer: ReturnType<typeof setInterval>

onMounted(async () => {
  // Lire localStorage uniquement côté client dans onMounted
  lastSeenCount.value = parseInt(localStorage.getItem('livreur_last_seen') ?? '0')

  if (!user.value && token.value) {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      user.value = res.data
    } catch {
      token.value = null
    }
  }

  await fetchNewOrders()
  pollingTimer = setInterval(fetchNewOrders, 30_000)
})

onUnmounted(() => clearInterval(pollingTimer))

const fullName = computed(() =>
  user.value ? `${user.value.first_name} ${user.value.last_name}` : '...'
)

const initials = computed(() => {
  if (!user.value) return '?'
  return `${user.value.first_name?.[0] ?? ''}${user.value.last_name?.[0] ?? ''}`.toUpperCase()
})

const links = [
  { label: 'Mes livraisons', icon: 'i-heroicons-truck', to: '/livreur/livraisons', badge: true  },
  { label: 'Historique',     icon: 'i-heroicons-clock', to: '/livreur/historique', badge: false },
]

const isActive = (to: string) => route.path === to

const handleLinkClick = (link: typeof links[number]) => {
  if (link.badge) clearBadge()
}

const handleLogout = async () => {
  try {
    await axios.post('http://127.0.0.1:8000/api/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
  } catch {}
  token.value      = null
  user.value       = null
  mobileOpen.value = false
  if (process.client) localStorage.removeItem('livreur_last_seen')
  toast.add({
    title: 'Déconnecté', description: 'À bientôt sur BRC Market !',
    color: 'success', icon: 'i-heroicons-check-circle',
  } as ToastProps)
  router.push('/login')
}
</script>

<template>

  <!-- ══════════════════════════════════════════
       DESKTOP — lg+ only
  ══════════════════════════════════════════ -->
  <aside class="hidden lg:flex flex-col w-60 flex-shrink-0 sticky top-16 self-start h-[calc(100vh-4rem)] bg-white border-r border-gray-100 overflow-y-auto">

    <div class="mx-4 border-t border-gray-100" />

    <!-- Nav -->
    <nav class="flex-1 p-2 py-3 overflow-y-auto">
      <p class="text-xs font-bold text-gray-400 tracking-widest px-3 mb-1">Livraisons</p>
      <div class="flex flex-col gap-0.5">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          @click="handleLinkClick(link)"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="isActive(link.to)
            ? 'bg-[#274a82] text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-[#274a82]'"
        >
          <UIcon :name="link.icon" class="w-4 h-4 flex-shrink-0" />
          {{ link.label }}
          <!-- Badge nouvelles commandes -->
          <span
            v-if="link.badge && newOrdersCount > 0"
            class="ml-auto min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center transition-all"
            :class="isActive(link.to) ? 'bg-white text-[#274a82]' : 'bg-[#274a82] text-white'"
          >
            {{ newOrdersCount > 99 ? '99+' : newOrdersCount }}
          </span>
          <span v-else-if="isActive(link.to)" class="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
        </NuxtLink>
      </div>
    </nav>

    <div class="mx-4 border-t border-gray-100" />

    <!-- Footer -->
    <div class="p-2">
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

  <!-- ══════════════════════════════════════════
       MOBILE drawer — below lg
  ══════════════════════════════════════════ -->
  <Teleport to="body">

    <!-- Backdrop -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileOpen"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        @click="mobileOpen = false"
      />
    </Transition>

    <!-- Drawer -->
    <Transition
      enter-active-class="transition duration-250 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="mobileOpen"
        class="fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl lg:hidden"
      >

        <!-- Drawer header -->
        <div class="flex items-center justify-between px-4 h-16 border-b border-gray-100 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#274a82] flex items-center justify-center flex-shrink-0">
              <span class="text-white text-sm font-black">{{ initials }}</span>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-black text-gray-900 truncate">{{ fullName }}</p>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#274a82]/10 text-[#274a82]">
                <UIcon name="i-heroicons-truck" class="w-3 h-3" />
                Livreur
              </span>
            </div>
          </div>
          <button
            @click="mobileOpen = false"
            class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div class="mx-4 border-t border-gray-100 flex-shrink-0" />

        <!-- Nav -->
        <nav class="flex-1 p-2 py-3 overflow-y-auto">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">Livraisons</p>
          <div class="flex flex-col gap-0.5">
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              @click="handleLinkClick(link)"
              class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all"
              :class="isActive(link.to)
                ? 'bg-[#274a82] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-[#274a82]'"
            >
              <UIcon :name="link.icon" class="w-4 h-4 flex-shrink-0" />
              {{ link.label }}
              <!-- Badge nouvelles commandes -->
              <span
                v-if="link.badge && newOrdersCount > 0"
                class="ml-auto min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center"
                :class="isActive(link.to) ? 'bg-white text-[#274a82]' : 'bg-[#274a82] text-white'"
              >
                {{ newOrdersCount > 99 ? '99+' : newOrdersCount }}
              </span>
              <span v-else-if="isActive(link.to)" class="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
            </NuxtLink>
          </div>
        </nav>

        <div class="mx-4 border-t border-gray-100 flex-shrink-0" />

        <!-- Footer -->
        <div class="p-2 flex-shrink-0">
          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-[#274a82] transition-all mb-1"
          >
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4 flex-shrink-0" />
            Voir le site
          </NuxtLink>
          <button
            class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
            @click="handleLogout"
          >
            <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-4 h-4 flex-shrink-0" />
            Se déconnecter
          </button>
        </div>

      </aside>
    </Transition>

  </Teleport>

</template>