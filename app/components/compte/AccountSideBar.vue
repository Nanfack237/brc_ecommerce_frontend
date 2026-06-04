<script setup lang="ts">
import axios from 'axios'
import type { ToastProps } from '@nuxt/ui'

const route  = useRoute()
const router = useRouter()
const toast  = useToast()
const token  = useCookie('auth_token')

// Configuration dynamique de l'API
const config = useRuntimeConfig()
const API    = config.public.apiBase

const user = useState<any>('auth_user', () => null)

onMounted(async () => {
  if (!user.value && token.value) {
    try {
      // Utilisation de la variable API
      const res = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      user.value = res.data
    } catch {
      token.value = null
      user.value = null
    }
  }
})

const fullName = computed(() =>
  user.value ? `${user.value.first_name} ${user.value.last_name}` : 'Chargement...'
)

const initials = computed(() => {
  if (!user.value) return '?'
  return `${user.value.first_name?.[0] ?? ''}${user.value.last_name?.[0] ?? ''}`.toUpperCase()
})

// Vérification du rôle admin
const isAdmin = computed(() => {
  if (!user.value) return false
  return ['admin'].includes(user.value.role)
})

// Liste des liens mise à jour dynamiquement
const links = computed(() => [
  { label: 'Mes commandes',     icon: 'i-heroicons-shopping-bag',   to: '/compte/commandes' },
  { label: 'Mes favoris',       icon: 'i-heroicons-heart',          to: '/compte/favoris' },
  { label: 'Mes Avis',          icon: 'i-heroicons-star',           to: '/compte/avis' },
  { label: 'Mes informations',  icon: 'i-heroicons-user-circle',    to: '/compte/informations' },
  { label: 'Paramètres',        icon: 'i-heroicons-cog-6-tooth',    to: '/compte/parametres' },
  ...(isAdmin.value
          ? [
              { label: 'Back Office', icon: 'i-heroicons-clipboard', to: '/admin' },
            ]
          : []),
])

const handleLogout = async () => {
  try {
    // Utilisation de la variable API pour la déconnexion
    await axios.post(`${API}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
  } catch {}
  
  token.value = null
  user.value  = null
  
  toast.add({
    title: 'Déconnecté', 
    description: 'À bientôt sur BRC Market !',
    color: 'success', 
    icon: 'i-heroicons-check-circle',
  } as ToastProps)
  
  router.push('/login')
}
</script>

<template>
  <!-- hidden on mobile/tablet, visible on laptop/desktop (lg = 1024px+) -->
  <aside class="hidden lg:block w-56 flex-shrink-0 sticky top-30 self-start">

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      <!-- ── User block ── -->
      <div class="p-4 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#274a82] flex items-center justify-center flex-shrink-0">
            <span class="text-white text-sm font-black">{{ initials }}</span>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-black text-gray-900 truncate">{{ fullName }}</p>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#274a82]/10 text-[#274a82]">
              <UIcon name="i-heroicons-check-badge" class="w-3 h-3" />
              {{ user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Client' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Divider -->
       <div class="mx-4 border-t border-gray-100" />

      <nav class="flex flex-col gap-0.5 p-2">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="route.path === link.to
            ? 'bg-[#274a82] text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-[#274a82]'"
        >
          <UIcon :name="link.icon" class="w-4 h-4 flex-shrink-0" />
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="mx-4 border-t border-gray-100" />

      <div class="p-2">
        <button
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          @click="handleLogout"
        >
          <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-4 h-4 flex-shrink-0" />
          Se déconnecter
        </button>
      </div>
    </div>
  </aside>
</template>