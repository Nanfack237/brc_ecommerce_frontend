<!-- components/AdminSidebar.vue -->
<script setup lang="ts">
import axios from 'axios'
import type { ToastProps } from '@nuxt/ui'

const route  = useRoute()
const router = useRouter()
const toast  = useToast()
const token  = useCookie('auth_token')

const user = useState<any>('auth_user', () => null)

// Shared with AdminHeader — burger button opens this
const mobileOpen = useState<boolean>('admin_sidebar_open', () => false)

// Auto-close on route change
watch(() => route.path, () => { mobileOpen.value = false })

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

const sections = [
  {
    label: 'Général',
    links: [
      { label: 'Dashboard',    icon: 'i-heroicons-squares-2x2',            to: '/admin' },
    ]
  },
  {
    label: 'Boutique',
    links: [
      { label: 'Commandes',    icon: 'i-heroicons-shopping-bag',           to: '/admin/commandes' },
      { label: 'Produits',     icon: 'i-heroicons-cube',                   to: '/admin/produits' },
      { label: 'Catégories',   icon: 'i-heroicons-tag',                    to: '/admin/categories' },
      { label: 'Avis',         icon: 'i-heroicons-star',                   to: '/admin/reviews' },
    ]
  },
  {
    label: 'Gestion',
    links: [
      { label: 'Utilisateurs', icon: 'i-heroicons-users',                  to: '/admin/users' },
      { label: 'Analytics',    icon: 'i-heroicons-presentation-chart-bar', to: '/admin/analytics' },
      { label: 'Informations', icon: 'i-heroicons-building-office',        to: '/admin/informations' },
      { label: 'Paramètres',   icon: 'i-heroicons-cog-6-tooth',            to: '/admin/parametres' },
    ]
  },
]

const isActive = (to: string) => {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
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
  toast.add({
    title: 'Déconnecté', description: 'À bientôt !',
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

    <!-- User block -->
    <div class="p-4 pb-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#274a82] flex items-center justify-center flex-shrink-0">
          <span class="text-white text-sm font-black">{{ initials }}</span>
        </div>
        <div class="min-w-0">
          <p class="text-sm font-black text-gray-900 truncate">{{ fullName }}</p>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e60012]/10 text-[#e60012]">
            <UIcon name="i-heroicons-shield-check" class="w-3 h-3" />
            {{ user?.role === 'super_admin' ? 'Super Admin' : 'Admin' }}
          </span>
        </div>
      </div>
    </div>

    <div class="mx-4 border-t border-gray-100" />

    <!-- Nav -->
    <nav class="flex-1 p-2 space-y-4 py-3 overflow-y-auto">
      <div v-for="section in sections" :key="section.label">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">
          {{ section.label }}
        </p>
        <div class="flex flex-col gap-0.5">
          <NuxtLink
            v-for="link in section.links"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="isActive(link.to)
              ? 'bg-[#274a82] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 hover:text-[#274a82]'"
          >
            <UIcon :name="link.icon" class="w-4 h-4 flex-shrink-0" />
            {{ link.label }}
            <span v-if="isActive(link.to)" class="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
          </NuxtLink>
        </div>
      </div>
    </nav>

    <div class="mx-4 border-t border-gray-100" />

    <!-- Footer -->
    <div class="p-2">
      <NuxtLink
        to="/"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-[#274a82] transition-all mb-1"
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
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e60012]/10 text-[#e60012]">
                <UIcon name="i-heroicons-shield-check" class="w-3 h-3" />
                {{ user?.role === 'super_admin' ? 'Super Admin' : 'Admin' }}
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

        <!-- User block -->
        <!-- <div class="p-4 pb-3 flex-shrink-0">
         
        </div> -->

        <div class="mx-4 border-t border-gray-100 flex-shrink-0" />

        <!-- Nav -->
        <nav class="flex-1 p-2 space-y-4 py-3 overflow-y-auto">
          <div v-for="section in sections" :key="section.label">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">
              {{ section.label }}
            </p>
            <div class="flex flex-col gap-0.5">
              <NuxtLink
                v-for="link in section.links"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all"
                :class="isActive(link.to)
                  ? 'bg-[#274a82] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-[#274a82]'"
              >
                <UIcon :name="link.icon" class="w-4 h-4 flex-shrink-0" />
                {{ link.label }}
                <span v-if="isActive(link.to)" class="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
              </NuxtLink>
            </div>
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