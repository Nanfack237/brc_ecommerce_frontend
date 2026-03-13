<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { en, fr } from '@nuxt/ui/locale'
import axios from 'axios'
import CartDrawer from '@/components/CartDrawer.vue'
import useCart from '@/composables/useCart'

const { cartItems } = useCart()
const locale        = ref('fr')
const route         = useRoute()
const router        = useRouter()
const searchQuery   = ref('')
const isMenuOpen    = ref(false)
const activeSection = ref<string | null>(null)
const toast         = useToast()

// ── Auth state ───────────────────────────────────────────────────────────────
const { token, authUser, isLoggedIn, logout } = useAuth()

// ── Charger le user si connecté mais authUser vide ───────────────────────────
const config = useRuntimeConfig()
const API    = config.public.apiBase

const fetchMe = async () => {
  if (!token.value || authUser.value) return
  try {
    const { data } = await axios.get(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    authUser.value = data
  } catch {}
}

onMounted(fetchMe)

// ── Initiales de l'utilisateur ───────────────────────────────────────────────
const userInitials = computed(() => {
  if (!authUser.value) return '?'
  const first = authUser.value.first_name?.[0] ?? ''
  const last  = authUser.value.last_name?.[0]  ?? ''
  return (first + last).toUpperCase() || authUser.value.email?.[0]?.toUpperCase() || '?'
})

// Couleur de fond basée sur les initiales (toujours la même pour un user donné)
const avatarColor = computed(() => {
  const colors = [
    '#274a82', '#e60012', '#0369a1', '#166534',
    '#854d0e', '#6b21a8', '#0f766e', '#b45309',
  ]
  const str = authUser.value?.email ?? 'user'
  let hash  = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
})

// ── Logout ───────────────────────────────────────────────────────────────────
const handleLogout = async () => {
  await logout()
  isMenuOpen.value = false
  toast.add({
    title:       'Déconnecté',
    description: 'À bientôt sur BRC Market !',
    color:       'success',
    icon:        'i-heroicons-check-circle',
    duration:    3000,
  })
}

// ── Search ───────────────────────────────────────────────────────────────────
const handleSearch = () => {
  if (searchQuery.value.trim() !== '') {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
    isMenuOpen.value = false
  }
}

const toggleSection = (section: string) => {
  activeSection.value = activeSection.value === section ? null : section
}

// ── User account links ───────────────────────────────────────────────────────
const accountLinks = [
  { label: 'Mes commandes',    icon: 'i-heroicons-shopping-bag', to: '/compte/commandes'    },
  { label: 'Mes favoris',      icon: 'i-heroicons-heart',         to: '/compte/favoris'      },
  { label: 'Mes informations', icon: 'i-heroicons-user-circle',   to: '/compte/informations' },
  { label: 'Paramètres',       icon: 'i-heroicons-cog-6-tooth',   to: '/compte/parametres'   },
]

// ── Categories & Services data ───────────────────────────────────────────────
const categoriesData = [
  { label: 'Ordinateurs Et Accessoires', links: [
    { label: 'Laptops',                 to: '/categories/ordinateurs/laptop' },
    { label: 'Desktops',                to: '/categories/ordinateurs/Desktops' },
    { label: 'All in One',              to: '/categories/ordinateurs/all-in-one' },
    { label: 'Ecran Ordinateurs',       to: '/categories/accessoires-ordinateurs/ecran-ordinateurs' },
    { label: 'Accessoires Ordinateurs', to: '/categories/accessoires-ordinateurs' },
  ]},
  { label: 'Imprimantes / Scanners', links: [
    { label: 'Imprimantes',  to: '/categories/imprimantes' },
    { label: 'Scanners',     to: '/categories/scanners' },
    { label: 'Consommables', to: '/categories/accessoire-imprimante' },
    { label: 'Etiqueteuse',  to: '/categories/etiqueteuse' },
  ]},
  { label: 'Smartphones et Tablettes', links: [
    { label: 'Iphones',            to: '/categories/smartphones/iphones' },
    { label: 'Androide',           to: '/categories/smartphones/androides' },
    { label: 'Téléphones Mobiles', to: '/categories/smartphones' },
    { label: 'Tablettes',          to: '/categories/Tablettes' },
  ]},
  { label: 'Matériel Reseaux', links: [
    { label: 'Serveurs',      to: '/categories/reseau-telecom/serveurs' },
    { label: 'Routeurs',      to: '/categories/reseau-telecom/routeurs' },
    { label: 'Switchs',       to: '/categories/reseau-telecom/Switchs' },
    { label: 'Fibre Optique', to: '/categories/reseau-telecom/fibre-optique' },
  ]},
  { label: 'Sécurité/Biometrie', links: [
    { label: 'Caméra/NVR/DVR', to: '/categories/securite/camera' },
    { label: 'Videophone',     to: '/categories/securite/videophones' },
    { label: 'Biometrie',      to: '/categories/securite/biometrie' },
  ]},
  { label: 'Stockage', links: [
    { label: 'Disque Dur Interne', to: '/categories/accessoires-ordinateurs/disque-dur-interne' },
    { label: 'Disque Dur Externe', to: '/categories/accessoires-ordinateurs/disque-dur-externe' },
    { label: 'Clé USB',            to: '/categories/accessoires-ordinateurs/cle-usb' },
  ]},
]

const servicesData = [
  { label: 'Maintenance Et Réparation', links: [
    { label: 'Laptops',  to: '/services/laptops'  },
    { label: 'Desktops', to: '/services/desktops' },
  ]},
  { label: 'Sécurité & Réseau', links: [
    { label: 'Vidéo Surveillance', to: '/services/cameras'  },
    { label: 'Audit & Câblage',    to: '/services/audit'    },
    { label: 'Sécurité IT',        to: '/services/securite' },
  ]},
]
</script>

<template>

  <UHeader v-model:open="isMenuOpen" class="py-6 h-24">

    <template #title>
      <div class="flex items-center gap-2">
        <img src="/brclogo.png" class="h-10 w-14 md:h-13 md:w-18 object-contain" />
        <NuxtLink to="/" class="flex mb-1 md:mb-3 items-center gap-1 font-bold text-base md:text-lg text-[#274a82]">
          BRC Market
        </NuxtLink>
      </div>
    </template>

    <!-- ── NAV DESKTOP ── -->
    <div class="hidden md:flex items-center space-x-2">
      <UButton variant="ghost" :class="route.path === '/' ? 'text-red-600 font-bold' : 'text-gray-700'" to="/">Accueil</UButton>
      <UButton variant="ghost" :class="route.path.startsWith('/boutique') ? 'text-red-600 font-bold' : 'text-gray-700'" to="/boutique">Boutique</UButton>

      <UPopover mode="hover">
        <UButton variant="ghost" :class="route.path.startsWith('/categories') ? 'text-red-600 font-bold' : 'text-gray-700'" trailing-icon="i-lucide-chevron-down">Catégorie</UButton>
        <template #content>
          <div class="p-6 grid grid-cols-3 gap-6 bg-white shadow-xl rounded-lg w-[700px]">
            <div v-for="cat in categoriesData" :key="cat.label">
              <h4 class="font-bold mb-2 border-b-2 border-red-500 text-[14px] text-gray-900">{{ cat.label }}</h4>
              <ul class="space-y-1">
                <li v-for="link in cat.links" :key="link.label">
                  <NuxtLink :to="link.to" class="text-sm text-gray-600 hover:text-red-600 transition-colors">{{ link.label }}</NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </template>
      </UPopover>

      <UPopover mode="hover">
        <UButton variant="ghost" :class="route.path.startsWith('/services') ? 'text-red-600 font-bold' : 'text-gray-700'" trailing-icon="i-lucide-chevron-down">Nos Services</UButton>
        <template #content>
          <div class="p-6 grid grid-cols-2 gap-6 bg-white shadow-xl rounded-lg w-[450px]">
            <div v-for="service in servicesData" :key="service.label">
              <h4 class="font-bold mb-2 border-b-2 border-red-500 text-[14px] text-gray-900">{{ service.label }}</h4>
              <ul class="space-y-1">
                <li v-for="link in service.links" :key="link.label">
                  <NuxtLink :to="link.to" class="text-sm text-gray-600 hover:text-red-600 transition-colors">{{ link.label }}</NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </template>
      </UPopover>

      <UButton variant="ghost" :class="route.path.startsWith('/contact') ? 'text-red-600 font-bold' : 'text-gray-700'" to="/contact">Contact</UButton>
    </div>

    <!-- ── RIGHT DESKTOP ── -->
    <template #right>
      <!-- Search -->
      <div class="relative mr-3 hidden md:flex items-center">
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="Que cherchez vous?"
          class="border rounded-md px-3 py-1 focus:ring-2 focus:ring-red-500 text-sm"
        />
        <button @click="handleSearch" class="absolute right-2 pt-2 text-red-600">
          <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5" />
        </button>
      </div>

      <CartDrawer />

      <div class="hidden md:flex items-center ml-2 gap-3">

        <!-- ── NOT LOGGED IN ── -->
        <UPopover v-if="!isLoggedIn" mode="hover" placement="bottom-end">
          <button class="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <UIcon name="i-heroicons-user-circle" class="w-6 h-6 text-gray-500" />
          </button>
          <template #content>
            <div class="bg-white shadow-xl rounded-xl w-56 py-2 border border-gray-100">
              <NuxtLink to="/login" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                <UIcon name="i-heroicons-arrow-right-on-rectangle" />
                Se connecter
              </NuxtLink>
              <NuxtLink to="/register" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                <UIcon name="i-heroicons-user-plus" />
                Créer un compte
              </NuxtLink>
            </div>
          </template>
        </UPopover>

        <!-- ── LOGGED IN → avatar initiales ── -->
        <UPopover v-else mode="hover" placement="bottom-end">
          <!-- Avatar avec initiales -->
          <button
            class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black shadow-sm ring-2 ring-white hover:ring-offset-1 transition-all flex-shrink-0"
            :style="{ backgroundColor: avatarColor }"
            :title="authUser?.first_name + ' ' + authUser?.last_name"
          >
            {{ userInitials }}
          </button>
          <template #content>
            <div class="bg-white shadow-xl rounded-xl w-60 py-2 border border-gray-100">

              <!-- User info header -->
              <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 mb-1">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                  :style="{ backgroundColor: avatarColor }"
                >
                  {{ userInitials }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-black text-gray-900 truncate">
                    {{ authUser?.first_name }} {{ authUser?.last_name }}
                  </p>
                  <p class="text-[11px] text-gray-400 truncate">{{ authUser?.email }}</p>
                </div>
              </div>

              <!-- Account links -->
              <NuxtLink
                v-for="link in accountLinks"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 hover:text-[#274a82] text-sm font-medium text-gray-700 transition-colors"
              >
                <UIcon :name="link.icon" class="w-4 h-4 text-[#274a82]" />
                {{ link.label }}
              </NuxtLink>

              <div class="border-t border-gray-100 my-1" />

              <button
                class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm font-medium text-red-600 transition-colors"
                @click="handleLogout"
              >
                <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          </template>
        </UPopover>

        <ULocaleSelect v-model="locale" :locales="[en, fr]" />
      </div>
    </template>

    <!-- ── DRAWER MOBILE ── -->
    <template #content>
      <div class="flex flex-col h-full bg-white overflow-hidden">

        <!-- Header drawer -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div class="flex items-center gap-2">
            <img src="/brclogo.png" class="h-8 w-auto object-contain" />
            <span class="font-bold text-[#274a82]">BRC Market</span>
          </div>
          <button
            @click="isMenuOpen = false"
            class="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Search -->
        <div class="px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Rechercher un produit..."
            @keyup.enter="handleSearch"
            class="w-full"
          />
        </div>

        <!-- Nav bar -->
        <div class="flex-shrink-0 border-b border-gray-100 bg-gray-50 w-full">
          <div class="flex items-stretch w-full">
            <NuxtLink to="/" @click="isMenuOpen = false; activeSection = null"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all"
              :class="route.path === '/' ? 'bg-[#274a82] text-white' : 'text-gray-500 hover:bg-white hover:text-[#274a82]'">
              <UIcon name="i-heroicons-home" class="w-4 h-4" />
              Accueil
            </NuxtLink>
            <NuxtLink to="/boutique" @click="isMenuOpen = false; activeSection = null"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all"
              :class="route.path.startsWith('/boutique') ? 'bg-[#274a82] text-white' : 'text-gray-500 hover:bg-white hover:text-[#274a82]'">
              <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4" />
              Boutique
            </NuxtLink>
            <button @click="toggleSection('categories')"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all"
              :class="activeSection === 'categories' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-white hover:text-red-600'">
              <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4" />
              Catégories
            </button>
            <button @click="toggleSection('services')"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all"
              :class="activeSection === 'services' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-white hover:text-red-600'">
              <UIcon name="i-heroicons-wrench-screwdriver" class="w-4 h-4" />
              Services
            </button>
            <NuxtLink to="/contact" @click="isMenuOpen = false; activeSection = null"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all"
              :class="route.path.startsWith('/contact') ? 'bg-[#274a82] text-white' : 'text-gray-500 hover:bg-white hover:text-[#274a82]'">
              <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
              Contact
            </NuxtLink>
          </div>
        </div>

        <!-- Dynamic content panels -->
        <div v-if="activeSection === 'categories'" class="flex-1 overflow-y-auto px-4 py-4">
          <div v-for="cat in categoriesData" :key="cat.label" class="mb-5">
            <h4 class="text-[12px] font-bold text-gray-400 tracking-widest mb-2 flex items-center gap-2">
              <span class="flex-1 h-px bg-gray-100" />
              {{ cat.label }}
              <span class="flex-1 h-px bg-gray-100" />
            </h4>
            <div class="grid grid-cols-2 gap-1.5">
              <NuxtLink v-for="link in cat.links" :key="link.label" :to="link.to" @click="isMenuOpen = false"
                class="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-xs text-gray-700 font-medium transition-all text-center">
                {{ link.label }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <div v-else-if="activeSection === 'services'" class="flex-1 overflow-y-auto px-4 py-4">
          <div v-for="service in servicesData" :key="service.label" class="mb-5">
            <h4 class="text-[12px] font-bold text-gray-400 tracking-widest mb-2 flex items-center gap-2">
              <span class="flex-1 h-px bg-gray-100" />
              {{ service.label }}
              <span class="flex-1 h-px bg-gray-100" />
            </h4>
            <div class="grid grid-cols-2 gap-1.5">
              <NuxtLink v-for="link in service.links" :key="link.label" :to="link.to" @click="isMenuOpen = false"
                class="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-xs text-gray-700 font-medium transition-all text-center">
                {{ link.label }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <div v-else class="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
            <UIcon name="i-heroicons-squares-2x2" class="w-8 h-8 text-gray-200" />
          </div>
          <p class="text-sm text-gray-400 font-medium">Explorez nos catégories<br />ou services ci-dessus</p>
        </div>

        <!-- ── Bottom drawer ── -->
        <div class="flex-shrink-0 px-4 py-4 border-t border-gray-100 bg-white">

          <!-- NOT LOGGED IN -->
          <div v-if="!isLoggedIn" class="flex gap-2 mb-3">
            <UButton to="/login"    class="flex-1" variant="outline" @click="isMenuOpen = false">Connexion</UButton>
            <UButton to="/register" class="flex-1"                   @click="isMenuOpen = false">S'inscrire</UButton>
          </div>

          <!-- LOGGED IN → avatar + infos + links -->
          <div v-else class="mb-3 space-y-1">
            <!-- User info card -->
            <div class="flex items-center gap-3 px-3 py-3 rounded-xl mb-2"
              :style="{ backgroundColor: avatarColor + '15' }">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-sm"
                :style="{ backgroundColor: avatarColor }"
              >
                {{ userInitials }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-black text-gray-900 truncate">
                  {{ authUser?.first_name }} {{ authUser?.last_name }}
                </p>
                <p class="text-[11px] text-gray-500 truncate">{{ authUser?.email }}</p>
              </div>
            </div>

            <!-- Account links -->
            <NuxtLink
              v-for="link in accountLinks"
              :key="link.to"
              :to="link.to"
              @click="isMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-[#274a82] text-sm text-gray-700 font-medium transition-all"
            >
              <UIcon :name="link.icon" class="w-4 h-4 text-[#274a82]" />
              {{ link.label }}
            </NuxtLink>

            <div class="border-t border-gray-100 my-1" />

            <button
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-sm font-medium text-red-600 transition-all"
              @click="handleLogout"
            >
              <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-4 h-4" />
              Se déconnecter
            </button>
          </div>

          <ULocaleSelect v-model="locale" :locales="[en, fr]" class="w-full" />
        </div>

      </div>
    </template>

  </UHeader>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>