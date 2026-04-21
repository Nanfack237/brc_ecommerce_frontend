<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import CartDrawer from '@/components/CartDrawer.vue'
import useCart from '@/composables/useCart'

const { cartItems } = useCart()
const locale             = ref('fr')
const showLocaleDropdown = ref(false)

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
]

const currentLang = computed(() => languages.find(l => l.code === locale.value) ?? languages[0])

const selectLocale = (code: string) => {
  locale.value             = code
  showLocaleDropdown.value = false
}

const route  = useRoute()
const router = useRouter()
const toast  = useToast()

const isMenuOpen         = ref(false)
const activeSection      = ref<string | null>(null)
const showMobileUserMenu = ref(false)

/* ── Auth ─────────────────────────────────────────────────────────────────── */
const { token, authUser, isLoggedIn, logout } = useAuth()
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

/* ── Rôle helpers ─────────────────────────────────────────────────────────── */
const isAdmin    = computed(() => ['admin', 'user'].includes(authUser.value?.role))
const isLivreur  = computed(() => authUser.value?.role === 'livreur')
const hasBackOffice = computed(() => isAdmin.value || isLivreur.value)

const backOfficeLink = computed(() => {
  if (isAdmin.value)   return { label: 'Back Office',       icon: 'i-heroicons-clipboard-document-list', to: '/admin' }
  if (isLivreur.value) return { label: 'Espace Livreur',    icon: 'i-heroicons-truck',                   to: '/livreur/livraisons' }
  return null
})

/* ── Catégories ───────────────────────────────────────────────────────────── */
const { navGroups: categoriesData, loadingCats, errorCats, fetchCategories } = useCategories()

const subLinks = (cat: { links: { label: string; to: string }[] }) =>
  cat.links.filter(l => l.label !== 'Voir tout')

/* ══════════════════════════════════════════════════════════════════════════
   SEARCH — autocomplete pro
══════════════════════════════════════════════════════════════════════════ */
interface SearchProduct {
  id:          number
  name:        string
  slug:        string
  price:       number
  images:      string[]
  category_id: number
  category?:   { name: string; slug: string } | null
}

const searchQuery            = ref('')
const searchResults          = ref<SearchProduct[]>([])
const searchLoading          = ref(false)
const searchFocused          = ref(false)
const mobileFocused          = ref(false)
const desktopFocused         = searchFocused
const searchInputRef         = ref<HTMLInputElement | null>(null)
const mobileSearchInputRef   = ref<HTMLInputElement | null>(null)
const searchWrapperRef       = ref<HTMLElement | null>(null)
const mobileSearchWrapperRef = ref<HTMLElement | null>(null)
const selectedIndex          = ref(-1)

const showDropdown = computed(() =>
  searchFocused.value && searchQuery.value.trim().length >= 2
)
const showMobileDropdown = computed(() =>
  searchQuery.value.trim().length >= 2
)

const formatPrice = (p: number) =>
  new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(p)

const getProductImage = (p: SearchProduct) => p.images?.[0] ?? '/images/placeholder.jpg'

let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (val) => {
  selectedIndex.value = -1
  if (val.trim().length < 2) { searchResults.value = []; return }
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    searchLoading.value = true
    try {
      const data = await $fetch<SearchProduct[]>(`${API}/products/search`, {
        params: { q: val.trim() },
      })
      searchResults.value = data ?? []
    } catch {
      searchResults.value = []
    } finally {
      searchLoading.value = false
    }
  }, 280)
})

const goToProduct = (p: SearchProduct) => {
  router.push(p.slug ? `/products/${p.slug}` : `/products/${p.id}`)
  searchQuery.value    = ''
  desktopFocused.value = false
  mobileFocused.value  = false
  isMenuOpen.value     = false
}

const handleSearch = () => {
  const q = searchQuery.value.trim()
  if (!q) return
  if (selectedIndex.value >= 0 && searchResults.value[selectedIndex.value]) {
    goToProduct(searchResults.value[selectedIndex.value])
    return
  }
  router.push(`/boutique?q=${encodeURIComponent(q)}`)
  searchQuery.value    = ''
  searchResults.value  = []
  desktopFocused.value = false
  mobileFocused.value  = false
}

const onKeydown = (e: KeyboardEvent) => {
  if (!showDropdown.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, searchResults.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
  } else if (e.key === 'Escape') {
    searchFocused.value = false
    searchInputRef.value?.blur()
  }
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.locale-dropdown-wrapper')) showLocaleDropdown.value = false
  if (searchWrapperRef.value && !searchWrapperRef.value.contains(target)) {
    searchFocused.value = false
  }
}

/* ── User helpers ─────────────────────────────────────────────────────────── */
const userInitials = computed(() => {
  if (!authUser.value) return '?'
  const first = authUser.value.first_name?.[0] ?? ''
  const last  = authUser.value.last_name?.[0]  ?? ''
  return (first + last).toUpperCase() || authUser.value.email?.[0]?.toUpperCase() || '?'
})

const avatarColor = computed(() => {
  const colors = ['#274a82','#e60012','#0369a1','#166534','#854d0e','#6b21a8','#0f766e','#b45309']
  const str = authUser.value?.email ?? 'user'
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
})

const handleLogout = async () => {
  await logout()
  isMenuOpen.value = false; showMobileUserMenu.value = false
  toast.add({ title: 'Déconnecté', description: 'À bientôt sur BRC Market !', color: 'success', icon: 'i-heroicons-check-circle', duration: 3000 })
}

const toggleSection = (section: string) => {
  activeSection.value = activeSection.value === section ? null : section
}

const accountLinks = [
  { label: 'Mes commandes',    icon: 'i-heroicons-shopping-bag',  to: '/compte/commandes'    },
  { label: 'Mes favoris',      icon: 'i-heroicons-heart',          to: '/compte/favoris'      },
  { label: 'Mes Avis',         icon: 'i-heroicons-star',           to: '/compte/avis'         },
  { label: 'Mes informations', icon: 'i-heroicons-user-circle',    to: '/compte/informations' },
  { label: 'Paramètres',       icon: 'i-heroicons-cog-6-tooth',    to: '/compte/parametres'   },
]

const servicesData = [
  { label: 'Maintenance Et Réparation', links: [
    { label: 'Ordinateur et Assistance',        to: '/services/Maintenance-support'          },
  ]},
  { label: 'Sécurité & Réseau', links: [
    { label: 'Vidéo Surveillance', to: '/services/videosurveillance' },
    { label: 'Audit & Câblage',    to: '/services/audit-cablage'     },
    { label: 'Sécurité IT',        to: '/services/securite-it'       },
  ]},
]

onMounted(() => {
  fetchMe()
  fetchCategories()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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
          <div class="p-6 bg-white shadow-xl rounded-lg w-[700px]">
            <div v-if="loadingCats" class="grid grid-cols-3 gap-6">
              <div v-for="n in 6" :key="n" class="space-y-2">
                <div class="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
                <div class="h-3 bg-gray-50 rounded animate-pulse w-full"></div>
                <div class="h-3 bg-gray-50 rounded animate-pulse w-5/6"></div>
              </div>
            </div>
            <div v-else-if="errorCats" class="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <UIcon name="i-heroicons-exclamation-circle" class="w-8 h-8 text-red-300" />
              <p class="text-sm text-red-500 font-medium">Impossible de charger les catégories</p>
              <button @click="fetchCategories" class="text-xs text-[#274a82] font-bold hover:underline mt-1">Réessayer</button>
            </div>
            <div v-else class="grid grid-cols-3 gap-4">
              <div v-for="cat in categoriesData" :key="cat.slug">
                <NuxtLink :to="`/categories/${cat.slug}`"
                  class="block font-bold mb-2 border-b-2 border-red-500 text-[14px] text-gray-900 hover:text-red-600 transition-colors pb-1">
                  {{ cat.label }}
                </NuxtLink>
                <ul class="space-y-1">
                  <li v-for="link in subLinks(cat)" :key="link.to">
                    <NuxtLink :to="link.to" class="text-sm text-gray-600 hover:text-red-600 transition-colors">
                      {{ link.label }}
                    </NuxtLink>
                  </li>
                  
                </ul>
                
              </div>
              <div>
              <NuxtLink
                to="/boutique?promo=1"
                class="block font-bold mb-2 border-b-2 border-red-500 text-[14px] text-gray-900 hover:text-red-600 transition-colors pb-1"
              >
                Nos promos
              </NuxtLink>

              <ul class="space-y-1">
                <li>
                  <NuxtLink to="/boutique?promo=1" class="text-sm text-gray-600 hover:text-red-600 transition-colors">
                    Tous les produits en promo
                  </NuxtLink>
                </li>
                
              </ul>
            </div>
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

      <!-- ══ SEARCH DESKTOP ══ -->
      <div ref="searchWrapperRef" class="relative mr-3 hidden md:block">
        <div
          class="flex items-center gap-2 border rounded-xl px-3 py-1.5 transition-all duration-300 bg-white"
          :class="searchFocused
            ? 'border-[#274a82] ring-2 ring-[#274a82]/15 w-72 shadow-md'
            : 'border-gray-200 w-52 hover:border-gray-300'"
        >
          <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 flex-shrink-0 transition-colors"
            :class="searchFocused ? 'text-[#274a82]' : 'text-gray-400'" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un produit..."
            class="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400 min-w-0"
            @focus="searchFocused = true"
            @keydown="onKeydown"
            @keyup.enter="handleSearch"
          />
          <button v-if="searchQuery.length > 0"
            @mousedown.prevent
            @click="searchQuery = ''; searchResults = []; searchInputRef?.focus()"
            class="flex-shrink-0 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
            <UIcon name="i-heroicons-x-mark" class="w-2.5 h-2.5 text-gray-600" />
          </button>
          <UIcon v-else-if="searchLoading" name="i-heroicons-arrow-path" class="w-4 h-4 text-[#274a82] animate-spin flex-shrink-0" />
        </div>

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-1 scale-[0.98]"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-1 scale-[0.98]"
        >
          <div v-if="showDropdown"
            class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
            style="min-width: 340px;">
            <div v-if="searchLoading" class="p-3 space-y-2">
              <div v-for="n in 4" :key="n" class="flex items-center gap-3 p-2 rounded-xl">
                <div class="w-10 h-10 bg-gray-100 rounded-lg animate-pulse flex-shrink-0"></div>
                <div class="flex-1 space-y-1.5">
                  <div class="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
                  <div class="h-2.5 bg-gray-50 rounded animate-pulse w-1/2"></div>
                </div>
                <div class="h-3.5 bg-gray-100 rounded animate-pulse w-16"></div>
              </div>
            </div>
            <template v-else-if="searchResults.length > 0">
              <div class="px-4 pt-3 pb-1 flex items-center justify-between">
                <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {{ searchResults.length }} résultat{{ searchResults.length > 1 ? 's' : '' }}
                </span>
                <button @click="handleSearch" class="text-[10px] font-black text-[#274a82] hover:text-[#e60012] transition-colors flex items-center gap-1">
                  Voir tout <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
                </button>
              </div>
              <div class="px-2 pb-2 space-y-0.5 max-h-[360px] overflow-y-auto">
                <button v-for="(product, i) in searchResults" :key="product.id"
                  @click="goToProduct(product)"
                  @mouseenter="selectedIndex = i"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group"
                  :class="selectedIndex === i ? 'bg-[#274a82]/5' : 'hover:bg-gray-50'">
                  <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                    <img v-if="product.images?.[0]" :src="getProductImage(product)" :alt="product.name" class="w-full h-full object-contain p-0.5" />
                    <UIcon v-else name="i-heroicons-photo" class="w-5 h-5 text-gray-300" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-800 truncate group-hover:text-[#274a82] transition-colors"
                      :class="selectedIndex === i ? 'text-[#274a82]' : ''"
                      v-html="highlightMatch(product.name, searchQuery)"></p>
                    <p v-if="product.category?.name" class="text-[11px] text-gray-400 truncate mt-0.5">{{ product.category.name }}</p>
                  </div>
                  <div class="flex-shrink-0 text-right">
                    <span class="text-sm font-black text-gray-900">{{ formatPrice(product.price) }}</span>
                    <span class="text-[9px] text-gray-400 block">FCFA</span>
                  </div>
                  <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5 text-gray-300 flex-shrink-0 group-hover:text-[#274a82] transition-colors" />
                </button>
              </div>
              <div class="border-t border-gray-100 px-4 py-2 flex items-center gap-3 bg-gray-50/50">
                <div class="flex items-center gap-1">
                  <kbd class="px-1.5 py-0.5 text-[10px] bg-white border border-gray-200 rounded text-gray-500 font-mono">↑↓</kbd>
                  <span class="text-[10px] text-gray-400">naviguer</span>
                </div>
                <div class="flex items-center gap-1">
                  <kbd class="px-1.5 py-0.5 text-[10px] bg-white border border-gray-200 rounded text-gray-500 font-mono">↵</kbd>
                  <span class="text-[10px] text-gray-400">sélectionner</span>
                </div>
                <div class="flex items-center gap-1">
                  <kbd class="px-1.5 py-0.5 text-[10px] bg-white border border-gray-200 rounded text-gray-500 font-mono">Esc</kbd>
                  <span class="text-[10px] text-gray-400">fermer</span>
                </div>
              </div>
            </template>
            <div v-else class="flex flex-col items-center justify-center py-10 gap-3 text-center px-6">
              <div class="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                <UIcon name="i-heroicons-magnifying-glass" class="w-6 h-6 text-gray-300" />
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-600">Aucun résultat pour</p>
                <p class="text-sm text-[#274a82] font-black mt-0.5">"{{ searchQuery }}"</p>
              </div>
              <button @click="handleSearch" class="text-xs text-[#e60012] font-bold hover:underline">
                Rechercher quand même →
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <CartDrawer />

      <!-- Toggle langue -->
      <div class="relative mx-1 locale-dropdown-wrapper">
        <button @click="showLocaleDropdown = !showLocaleDropdown"
          class="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-gray-200 hover:border-[#274a82] hover:bg-[#274a82]/5 transition-all text-xs font-black text-gray-600 hover:text-[#274a82]">
          <span>{{ currentLang.flag }}</span>
          <span>{{ locale.toUpperCase() }}</span>
          <UIcon name="i-heroicons-chevron-down" class="w-3 h-3 transition-transform duration-200" :class="showLocaleDropdown ? 'rotate-180' : ''" />
        </button>
        <Transition name="locale-drop">
          <div v-if="showLocaleDropdown" class="absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50 min-w-[130px]">
            <button v-for="lang in languages" :key="lang.code" @click="selectLocale(lang.code)"
              class="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold transition-colors text-left"
              :class="locale === lang.code ? 'bg-[#274a82]/8 text-[#274a82]' : 'text-gray-600 hover:bg-gray-50'">
              <span class="text-base leading-none">{{ lang.flag }}</span>
              <span>{{ lang.label }}</span>
              <UIcon v-if="locale === lang.code" name="i-heroicons-check" class="w-3 h-3 ml-auto text-[#274a82]" />
            </button>
          </div>
        </Transition>
      </div>

      <!-- ── User menu DESKTOP ── -->
      <div class="hidden md:flex items-center ml-1 gap-3">
        <UPopover v-if="!isLoggedIn" mode="hover" placement="bottom-end">
          <button class="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <UIcon name="i-heroicons-user-circle" class="w-6 h-6 text-gray-500" />
          </button>
          <template #content>
            <div class="bg-white shadow-xl rounded-xl w-56 py-2 border border-gray-100">
              <NuxtLink to="/login" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                <UIcon name="i-heroicons-arrow-right-on-rectangle" /> Se connecter
              </NuxtLink>
              <NuxtLink to="/register" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                <UIcon name="i-heroicons-user-plus" /> Créer un compte
              </NuxtLink>
            </div>
          </template>
        </UPopover>

        <UPopover v-else mode="hover" placement="bottom-end">
          <button class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black shadow-sm ring-2 ring-white hover:ring-offset-1 transition-all flex-shrink-0"
            :style="{ backgroundColor: avatarColor }" :title="authUser?.first_name + ' ' + authUser?.last_name">
            {{ userInitials }}
          </button>
          <template #content>
            <div class="bg-white shadow-xl rounded-xl w-60 py-2 border border-gray-100">
              <!-- User info -->
              <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 mb-1">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0" :style="{ backgroundColor: avatarColor }">{{ userInitials }}</div>
                <div class="min-w-0">
                  <p class="text-sm font-black text-gray-900 truncate">{{ authUser?.first_name }} {{ authUser?.last_name }}</p>
                  <p class="text-[11px] text-gray-400 truncate">{{ authUser?.email }}</p>
                  <!-- Badge rôle -->
                  <span class="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="isAdmin ? 'bg-[#274a82]/10 text-[#274a82]' : isLivreur ? 'bg-[#e07b39]/10 text-[#e07b39]' : 'bg-gray-100 text-gray-500'">
                    <UIcon :name="isAdmin ? 'i-heroicons-shield-check' : isLivreur ? 'i-heroicons-truck' : 'i-heroicons-user'" class="w-3 h-3" />
                    {{ isAdmin ? (authUser?.role === 'super_admin' ? 'Super Admin' : 'Admin') : isLivreur ? 'Livreur' : 'Client' }}
                  </span>
                </div>
              </div>

              <!-- Liens compte (uniquement si pas livreur) -->
              <template v-if="!isLivreur">
                <NuxtLink v-for="link in accountLinks" :key="link.to" :to="link.to"
                  class="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 hover:text-[#274a82] text-sm font-medium text-gray-700 transition-colors">
                  <UIcon :name="link.icon" class="w-4 h-4 text-[#274a82]" /> {{ link.label }}
                </NuxtLink>
              </template>

              <!-- ── Back Office / Espace Livreur ── -->
              <template v-if="hasBackOffice && backOfficeLink">
                <div class="border-t border-gray-100 my-1" />
                <NuxtLink :to="backOfficeLink.to"
                  class="flex items-center gap-3 px-4 py-2.5 hover:bg-[#274a82]/5 text-sm font-black transition-colors"
                  :class="isAdmin ? 'text-[#274a82]' : 'text-[#274a82]'">
                  <UIcon :name="backOfficeLink.icon" class="w-4 h-4" />
                  {{ backOfficeLink.label }}
                  <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3 h-3 ml-auto opacity-50" />
                </NuxtLink>
              </template>

              <div class="border-t border-gray-100 my-1" />
              <button class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm font-medium text-red-600 transition-colors" @click="handleLogout">
                <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-4 h-4" /> Se déconnecter
              </button>
            </div>
          </template>
        </UPopover>
      </div>
    </template>

    <!-- ── DRAWER MOBILE ── -->
    <template #content>
      <div class="flex flex-col h-full bg-white overflow-hidden">

        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div class="flex items-center gap-2">
            <img src="/brclogo.png" class="h-8 w-auto object-contain" />
            <span class="font-bold text-[#274a82]">BRC Market</span>
          </div>
          <button @click="isMenuOpen = false" class="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 transition-colors">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- ══ SEARCH MOBILE ══ -->
        <div class="px-4 pt-3 pb-2 border-b border-gray-100 flex-shrink-0">
          <div class="flex items-center gap-2 border rounded-xl px-3 py-2.5 bg-white transition-all"
            :class="mobileFocused ? 'border-[#274a82] ring-2 ring-[#274a82]/15' : 'border-gray-200'">
            <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 flex-shrink-0 transition-colors"
              :class="mobileFocused ? 'text-[#274a82]' : 'text-gray-400'" />
            <input
              ref="mobileSearchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un produit..."
              class="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
              @focus="mobileFocused = true"
              @keyup.enter="handleSearch"
            />
            <button v-if="searchQuery.length > 0"
              @click="searchQuery = ''; searchResults = []"
              class="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center flex-shrink-0 transition-colors">
              <UIcon name="i-heroicons-x-mark" class="w-3 h-3 text-gray-600" />
            </button>
            <UIcon v-else-if="searchLoading" name="i-heroicons-arrow-path" class="w-4 h-4 text-[#274a82] animate-spin flex-shrink-0" />
          </div>
        </div>

        <!-- ══ RÉSULTATS SEARCH inline ══ -->
        <div v-if="showMobileDropdown" class="flex-1 overflow-y-auto flex flex-col">
          <div v-if="searchLoading" class="p-3 space-y-1">
            <div v-for="n in 5" :key="n" class="flex items-center gap-3 px-3 py-3 rounded-xl">
              <div class="w-11 h-11 bg-gray-100 rounded-xl animate-pulse flex-shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3.5 bg-gray-100 rounded-lg animate-pulse w-4/5"></div>
                <div class="h-2.5 bg-gray-50 rounded-lg animate-pulse w-2/5"></div>
              </div>
              <div class="h-4 bg-gray-100 rounded animate-pulse w-16 flex-shrink-0"></div>
            </div>
          </div>
          <template v-else-if="searchResults.length > 0">
            <div class="px-5 py-2.5 flex items-center justify-between border-b border-gray-100 flex-shrink-0 bg-gray-50/50">
              <span class="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                {{ searchResults.length }} résultat{{ searchResults.length > 1 ? 's' : '' }}
              </span>
              <button @click="handleSearch" class="text-[11px] font-black text-[#274a82] flex items-center gap-1 hover:text-[#e60012] transition-colors">
                Voir tout <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              <button v-for="product in searchResults" :key="product.id"
                @click="goToProduct(product)"
                class="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left hover:bg-gray-50 active:bg-[#274a82]/5 border border-transparent hover:border-gray-100">
                <div class="w-11 h-11 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                  <img v-if="product.images?.[0]" :src="getProductImage(product)" :alt="product.name" class="w-full h-full object-contain p-0.5" />
                  <UIcon v-else name="i-heroicons-photo" class="w-5 h-5 text-gray-300" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800 truncate leading-tight" v-html="highlightMatch(product.name, searchQuery)"></p>
                  <p v-if="product.category?.name" class="text-[11px] text-gray-400 mt-0.5">{{ product.category.name }}</p>
                </div>
                <div class="flex-shrink-0 text-right">
                  <p class="text-sm font-black text-gray-900 whitespace-nowrap">{{ formatPrice(product.price) }}</p>
                  <p class="text-[9px] text-gray-400">FCFA</p>
                </div>
              </button>
            </div>
            <div class="flex-shrink-0 border-t border-gray-100">
              <button @click="handleSearch" class="w-full flex items-center justify-center gap-2 py-4 text-[13px] font-bold text-[#274a82] hover:bg-blue-50 transition-colors">
                <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
                Voir tous les résultats pour "{{ searchQuery }}"
              </button>
            </div>
          </template>
          <div v-else class="flex flex-col items-center justify-center flex-1 gap-4 text-center px-8 py-12">
            <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <UIcon name="i-heroicons-magnifying-glass" class="w-8 h-8 text-gray-300" />
            </div>
            <div>
              <p class="text-base font-bold text-gray-700">Aucun résultat</p>
              <p class="text-sm text-gray-400 mt-1">pour <span class="font-bold text-[#274a82]">"{{ searchQuery }}"</span></p>
            </div>
            <button @click="handleSearch" class="px-5 py-2.5 bg-[#274a82] text-white text-sm font-bold rounded-xl hover:bg-[#e60012] transition-colors">
              Rechercher quand même
            </button>
          </div>
        </div>

        <!-- Nav bar -->
        <div v-if="!showMobileDropdown" class="flex-shrink-0 border-b border-gray-100 bg-gray-50 w-full">
          <div class="flex items-stretch w-full">
            <NuxtLink to="/" @click="isMenuOpen = false; activeSection = null"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all"
              :class="route.path === '/' ? 'bg-[#274a82] text-white' : 'text-gray-500 hover:bg-white hover:text-[#274a82]'">
              <UIcon name="i-heroicons-home" class="w-4 h-4" />Accueil
            </NuxtLink>
            <NuxtLink to="/boutique" @click="isMenuOpen = false; activeSection = null"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all"
              :class="route.path.startsWith('/boutique') ? 'bg-[#274a82] text-white' : 'text-gray-500 hover:bg-white hover:text-[#274a82]'">
              <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4" />Boutique
            </NuxtLink>
            <button @click="toggleSection('categories')"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all"
              :class="activeSection === 'categories' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-white hover:text-red-600'">
              <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4" />Catégories
            </button>
            <button @click="toggleSection('services')"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all"
              :class="activeSection === 'services' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-white hover:text-red-600'">
              <UIcon name="i-heroicons-wrench-screwdriver" class="w-4 h-4" />Services
            </button>
            <NuxtLink to="/contact" @click="isMenuOpen = false; activeSection = null"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all"
              :class="route.path.startsWith('/contact') ? 'bg-[#274a82] text-white' : 'text-gray-500 hover:bg-white hover:text-[#274a82]'">
              <UIcon name="i-heroicons-envelope" class="w-4 h-4" />Contact
            </NuxtLink>
          </div>
        </div>

        <!-- Catégories mobile -->
        <div v-if="!showMobileDropdown && activeSection === 'categories'" class="flex-1 overflow-y-auto px-4 py-4">
          <div v-if="loadingCats" class="space-y-5">
            <div v-for="n in 4" :key="n">
              <div class="h-3 bg-gray-100 rounded animate-pulse w-1/2 mx-auto mb-3"></div>
              <div class="grid grid-cols-2 gap-1.5">
                <div v-for="m in 4" :key="m" class="h-10 bg-gray-50 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
          <div v-else-if="errorCats" class="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <UIcon name="i-heroicons-exclamation-circle" class="w-10 h-10 text-red-200" />
            <p class="text-sm text-red-400 font-medium">Impossible de charger les catégories</p>
            <button @click="fetchCategories" class="text-xs text-[#274a82] font-bold border border-[#274a82]/20 px-4 py-2 rounded-lg">Réessayer</button>
          </div>
          <div v-else>
            <div v-for="cat in categoriesData" :key="cat.slug" class="mb-5">
              <NuxtLink :to="`/categories/${cat.slug}`" @click="isMenuOpen = false"
                class="text-[12px] font-bold text-gray-400 tracking-widest mb-2 flex items-center gap-2 hover:text-red-600 transition-colors">
                <span class="flex-1 h-px bg-gray-100"></span>{{ cat.label }}<span class="flex-1 h-px bg-gray-100"></span>
              </NuxtLink>
              <div class="grid grid-cols-2 gap-1.5">
                <NuxtLink v-for="link in subLinks(cat)" :key="link.to" :to="link.to" @click="isMenuOpen = false"
                  class="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-xs text-gray-700 font-medium transition-all text-center">
                  {{ link.label }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!showMobileDropdown && activeSection === 'services'" class="flex-1 overflow-y-auto px-4 py-4">
          <div v-for="service in servicesData" :key="service.label" class="mb-5">
            <h4 class="text-[12px] font-bold text-gray-400 tracking-widest mb-2 flex items-center gap-2">
              <span class="flex-1 h-px bg-gray-100" />{{ service.label }}<span class="flex-1 h-px bg-gray-100" />
            </h4>
            <div class="grid grid-cols-2 gap-1.5">
              <NuxtLink v-for="link in service.links" :key="link.label" :to="link.to" @click="isMenuOpen = false"
                class="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-xs text-gray-700 font-medium transition-all text-center">
                {{ link.label }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <div v-else-if="!showMobileDropdown" class="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
            <UIcon name="i-heroicons-squares-2x2" class="w-8 h-8 text-gray-200" />
          </div>
          <p class="text-sm text-gray-400 font-medium">Explorez nos catégories<br />ou services ci-dessus</p>
        </div>

        <!-- BOTTOM DRAWER -->
        <div v-if="!showMobileDropdown" class="flex-shrink-0 border-t border-gray-100 bg-white">
          <div v-if="!isLoggedIn" class="px-4 py-4 flex gap-2">
            <UButton to="/login" class="flex-1" variant="outline" @click="isMenuOpen = false">Connexion</UButton>
            <UButton to="/register" class="flex-1" @click="isMenuOpen = false">S&apos;inscrire</UButton>
          </div>
          <div v-else class="px-4 pt-3 pb-4">
            <button @click="showMobileUserMenu = !showMobileUserMenu"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              :style="{ backgroundColor: avatarColor + '18' }">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-sm" :style="{ backgroundColor: avatarColor }">{{ userInitials }}</div>
              <div class="flex-1 min-w-0 text-left">
                <p class="text-sm font-black text-gray-900 truncate">{{ authUser?.first_name }} {{ authUser?.last_name }}</p>
                <p class="text-[11px] text-gray-500 truncate">{{ authUser?.email }}</p>
              </div>
              <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200" :class="showMobileUserMenu ? 'rotate-180' : ''" />
            </button>

            <Transition name="dropdown">
              <div v-if="showMobileUserMenu" class="mt-2 rounded-xl border border-gray-100 overflow-hidden shadow-sm">

                <!-- Liens compte (masqués pour le livreur) -->
                <template v-if="!isLivreur">
                  <NuxtLink v-for="link in accountLinks" :key="link.to" :to="link.to"
                    @click="isMenuOpen = false; showMobileUserMenu = false"
                    class="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 hover:text-[#274a82] text-sm font-medium text-gray-700 transition-colors border-b border-gray-50 last:border-b-0">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ backgroundColor: avatarColor + '15' }">
                      <UIcon :name="link.icon" class="w-3.5 h-3.5" :style="{ color: avatarColor }" />
                    </div>
                    {{ link.label }}
                  </NuxtLink>
                </template>

                <!-- ── Back Office / Espace Livreur ── -->
                <template v-if="hasBackOffice && backOfficeLink">
                  <div class="h-px bg-gray-100" />
                  <NuxtLink :to="backOfficeLink.to"
                    @click="isMenuOpen = false; showMobileUserMenu = false"
                    class="flex items-center gap-3 px-4 py-3 text-sm font-black transition-colors"
                    :class="isAdmin ? 'text-[#274a82] hover:bg-[#274a82]/5' : 'text-[#274a82] hover:bg-[#e07b39]/5'">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      :class="isAdmin ? 'bg-[#274a82]/10' : 'bg-[#e07b39]/10'">
                      <UIcon :name="backOfficeLink.icon" class="w-3.5 h-3.5"
                        :class="isAdmin ? 'text-[#274a82]' : 'text-[#274a82]'" />
                    </div>
                    {{ backOfficeLink.label }}
                    <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3.5 h-3.5 ml-auto opacity-40" />
                  </NuxtLink>
                </template>

                <div class="h-px bg-gray-100"></div>
                <button class="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm font-medium text-red-600 transition-colors" @click="handleLogout">
                  <div class="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-3.5 h-3.5 text-red-500" />
                  </div>
                  Se déconnecter
                </button>
              </div>
            </Transition>

            <div class="mt-3 flex gap-2">
              <button v-for="lang in languages" :key="lang.code" @click="selectLocale(lang.code)"
                class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 text-xs font-black transition-all"
                :class="locale === lang.code ? 'border-[#274a82] bg-[#274a82]/5 text-[#274a82]' : 'border-gray-100 text-gray-500 hover:border-gray-300'">
                <span class="text-sm">{{ lang.flag }}</span><span>{{ lang.label }}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </template>
  </UHeader>
</template>

<script lang="ts">
function highlightMatch(text: string, query: string): string {
  if (!query || query.length < 2) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(
    new RegExp(`(${escaped})`, 'gi'),
    '<mark class="bg-yellow-100 text-yellow-800 rounded px-0.5 not-italic font-bold">$1</mark>'
  )
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.locale-drop-enter-active, .locale-drop-leave-active  { transition: all 0.18s ease; }
.locale-drop-enter-from,   .locale-drop-leave-to      { opacity: 0; transform: translateY(-6px) scale(0.97); }
.locale-drop-enter-to,     .locale-drop-leave-from    { opacity: 1; transform: translateY(0) scale(1); }
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.25s ease; overflow: hidden; }
.dropdown-enter-from,   .dropdown-leave-to     { opacity: 0; max-height: 0; transform: translateY(-6px); }
.dropdown-enter-to,     .dropdown-leave-from   { opacity: 1; max-height: 400px; transform: translateY(0); }
</style>