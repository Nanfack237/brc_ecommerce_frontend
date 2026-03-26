<script setup lang="ts">
import axios from 'axios'
import type { ToastProps } from '@nuxt/ui'

const router = useRouter()
const toast  = useToast()
const token  = useCookie('auth_token')
const route  = useRoute()

const user = useState<any>('auth_user', () => null)
const mobileOpen = useState<boolean>('deliverer_sidebar_open', () => false)

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

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/livreur/livraisons': 'Mes livraisons',
    '/livreur/historique': 'Historique',
  }
  return map[route.path] ?? 'Espace Livreur'
})

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
    title: 'Déconnecté', description: 'À bientôt sur BRC Market !',
    color: 'success', icon: 'i-heroicons-check-circle',
  } as ToastProps)
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
    <div class="flex items-center justify-between px-6 h-16">

      <div class="flex items-center gap-3">
        <NuxtLink to="/livreur/livraisons" class="hidden lg:flex items-center gap-2 flex-shrink-0">
          <img src="/brclogo.png" class="h-10 w-14 object-contain" />
          <span class="font-bold text-base text-[#274a82]">BRC Market</span>
        </NuxtLink>

        <div class="hidden lg:block w-px h-5 bg-gray-200" />

        <div class="lg:hidden flex items-center gap-2">
          <button
            @click="mobileOpen = !mobileOpen"
            class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <UIcon name="i-heroicons-bars-3" class="w-5 h-5 text-gray-700" />
          </button>
          <NuxtLink to="/livreur/livraisons" class="flex items-center gap-2">
            <img src="/brclogo.png" class="h-10 w-14 object-contain" />
            <span class="font-bold text-base text-[#274a82]">BRC Market</span>
          </NuxtLink>
          <div class="w-px h-4 bg-gray-200 mx-1" />
        </div>

        <h1 class="text-base font-black text-gray-900">{{ pageTitle }}</h1>
      </div>

      <div class="flex items-center gap-2">
        <div class="relative">
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition"
          >
            <div class="w-7 h-7 rounded-lg bg-[#274a82] flex items-center justify-center">
              <span class="text-white text-xs font-black">{{ initials }}</span>
            </div>
            <UIcon name="i-heroicons-chevron-down" class="w-3.5 h-3.5 text-gray-400" />
          </button>

          <Transition
            enter-active-class="transition ease-out duration-150"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showUserMenu"
              v-click-outside="() => showUserMenu = false"
              class="absolute right-0 top-11 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden"
            >
              <div class="px-4 py-3 border-b border-gray-50">
                <p class="text-sm font-black text-gray-900 truncate">{{ fullName }}</p>
                <p class="text-xs text-gray-400 truncate">{{ user?.email }}</p>
                <span class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#274a82]/10 text-[#274a82]">
                  <UIcon name="i-heroicons-truck" class="w-3 h-3" />
                  Livreur
                </span>
              </div>

              <div class="p-1.5">
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