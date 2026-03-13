<!-- components/AdminHeader.vue -->
<script setup lang="ts">
import axios from 'axios'
import type { ToastProps } from '@nuxt/ui'

const router = useRouter()
const toast  = useToast()
const token  = useCookie('auth_token')
const route  = useRoute()

const user = useState<any>('auth_user', () => null)
const mobileOpen = useState<boolean>('admin_sidebar_open', () => false)

onMounted(async () => {
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
})

const fullName = computed(() =>
  user.value ? `${user.value.first_name} ${user.value.last_name}` : '...'
)

const initials = computed(() => {
  if (!user.value) return '?'
  return `${user.value.first_name?.[0] ?? ''}${user.value.last_name?.[0] ?? ''}`.toUpperCase()
})

// ── Page title from route ─────────────────────────────────────────────────
const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/admin':               'Dashboard',
    '/admin/commandes':     'Commandes',
    '/admin/produits':      'Produits',
    '/admin/categories':    'Catégories',
    '/admin/reviews':       'Avis clients',
    '/admin/users':         'Utilisateurs',
    '/admin/informations':  'Informations',
    '/admin/parametres':    'Paramètres',
  }
  return map[route.path] ?? 'Admin'
})

// ── Notifications (mock) ─────────────────────────────────────────────────
const notifications = ref([
  { id: 1, text: 'Nouvelle commande #CM000011', time: 'il y a 5 min',  read: false, icon: 'i-heroicons-shopping-bag',  color: 'text-[#274a82]' },
  { id: 2, text: 'Avis 1 étoile de Alice N.',  time: 'il y a 12 min', read: false, icon: 'i-heroicons-star',           color: 'text-red-500' },
  { id: 3, text: 'Stock faible : Dell 24"',     time: 'il y a 1h',    read: true,  icon: 'i-heroicons-exclamation-triangle', color: 'text-yellow-500' },
  { id: 4, text: 'Nouvel utilisateur inscrit',  time: 'il y a 2h',    read: true,  icon: 'i-heroicons-user-plus',      color: 'text-green-500' },
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
const showNotifs  = ref(false)

const markAllRead = () => {
  notifications.value.forEach(n => n.read = true)
}

// ── User menu ────────────────────────────────────────────────────────────
const showUserMenu = ref(false)

const handleLogout = async () => {
  try {
    await axios.post('http://127.0.0.1:8000/api/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
  } catch {}
  token.value = null
  user.value  = null
  toast.add({
    title: 'Déconnecté', description: 'À bientôt !',
    color: 'success', icon: 'i-heroicons-check-circle',
  } as ToastProps)
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
    <div class="flex items-center justify-between px-6 h-16">

      <!-- ── Left : logo + page title ── -->
      <div class="flex items-center gap-3">

        <!-- Desktop: logo -->
        <NuxtLink to="/admin" class="hidden lg:flex items-center gap-2 flex-shrink-0">
          <img src="/brclogo.png" class="h-10 w-14 object-contain" />
          <span class="font-bold text-base text-[#274a82]">BRC Market</span>
        </NuxtLink>

        <!-- Desktop divider -->
        <div class="hidden lg:block w-px h-5 bg-gray-200" />

        <!-- Mobile: burger + logo -->
        <div class="lg:hidden flex items-center gap-2">
          <button
            @click="mobileOpen = !mobileOpen"
            class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <UIcon name="i-heroicons-bars-3" class="w-5 h-5 text-gray-700" />
          </button>
          <NuxtLink to="/admin" class="flex items-center gap-2">
            <img src="/brclogo.png" class="h-10 w-14 object-contain" />
            <span class="font-bold text-sm text-[#274a82]">BRC Market</span>
          </NuxtLink>
          <div class="w-px h-4 bg-gray-200 mx-1" />
        </div>

        <h1 class="text-base font-black text-gray-900">{{ pageTitle }}</h1>
      </div>

      <!-- ── Right : actions ── -->
      <div class="flex items-center gap-2">

        <!-- View site -->
        <NuxtLink
          to="/"
          class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-[#274a82] transition"
        >
          <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3.5 h-3.5" />
          Voir le site
        </NuxtLink>

        <!-- Notifications -->
        <div class="relative">
          <button
            @click="showNotifs = !showNotifs; showUserMenu = false"
            class="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#274a82] transition"
          >
            <UIcon name="i-heroicons-bell" class="w-5 h-5" />
            <span
              v-if="unreadCount > 0"
              class="absolute top-1.5 right-1.5 w-4 h-4 bg-[#e60012] text-white text-[9px] font-black rounded-full flex items-center justify-center"
            >
              {{ unreadCount }}
            </span>
          </button>

          <!-- Notif dropdown -->
          <Transition enter-active-class="transition ease-out duration-150" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div
              v-if="showNotifs"
              v-click-outside="() => showNotifs = false"
              class="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden"
            >
              <div class="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <p class="text-sm font-black text-gray-900">Notifications</p>
                <button @click="markAllRead" class="text-xs text-[#274a82] font-semibold hover:underline">
                  Tout marquer lu
                </button>
              </div>

              <div class="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                <div
                  v-for="notif in notifications" :key="notif.id"
                  class="flex items-start gap-3 px-4 py-3 transition"
                  :class="notif.read ? 'bg-white' : 'bg-blue-50/40'"
                >
                  <div class="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UIcon :name="notif.icon" class="w-4 h-4" :class="notif.color" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-800 font-medium leading-snug">{{ notif.text }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ notif.time }}</p>
                  </div>
                  <div v-if="!notif.read" class="w-2 h-2 rounded-full bg-[#274a82] flex-shrink-0 mt-1.5" />
                </div>
              </div>

            </div>
          </Transition>
        </div>

        <!-- User menu -->
        <div class="relative">
          <button
            @click="showUserMenu = !showUserMenu; showNotifs = false"
            class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition"
          >
            <div class="w-7 h-7 rounded-lg bg-[#274a82] flex items-center justify-center">
              <span class="text-white text-xs font-black">{{ initials }}</span>
            </div>
            <span class="hidden sm:block text-sm font-semibold text-gray-700 max-w-28 truncate">{{ fullName }}</span>
            <UIcon name="i-heroicons-chevron-down" class="w-3.5 h-3.5 text-gray-400" />
          </button>

          <!-- User dropdown -->
          <Transition enter-active-class="transition ease-out duration-150" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div
              v-if="showUserMenu"
              v-click-outside="() => showUserMenu = false"
              class="absolute right-0 top-11 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden"
            >
              <!-- User info -->
              <div class="px-4 py-3 border-b border-gray-50">
                <p class="text-sm font-black text-gray-900 truncate">{{ fullName }}</p>
                <p class="text-xs text-gray-400 truncate">{{ user?.email }}</p>
                <span class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#274a82]/10 text-[#274a82]">
                  <UIcon name="i-heroicons-shield-check" class="w-3 h-3" />
                  {{ user?.role === 'super_admin' ? 'Super Admin' : 'Admin' }}
                </span>
              </div>

              <!-- Links -->
              <div class="p-1.5">
                <NuxtLink
                  to="/admin/informations"
                  @click="showUserMenu = false"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 hover:text-[#274a82] transition font-medium"
                >
                  <UIcon name="i-heroicons-user-circle" class="w-4 h-4" />
                  Mon profil
                </NuxtLink>
                <NuxtLink
                  to="/admin/parametres"
                  @click="showUserMenu = false"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 hover:text-[#274a82] transition font-medium"
                >
                  <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4" />
                  Paramètres
                </NuxtLink>
              </div>

              <div class="p-1.5 border-t border-gray-50">
                <button
                  @click="handleLogout"
                  class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition font-medium"
                >
                  <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>

            </div>
          </Transition>
        </div>

      </div>
    </div>
  </header>
</template>