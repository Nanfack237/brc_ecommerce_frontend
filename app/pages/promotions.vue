<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import useCart from '@/composables/useCart'
import useWishlist from '~/composables/UseWishlist'

useHead({
  title: 'Promotions',
  titleTemplate: (t) => t ? `${t} - BRC Market` : 'BRC Market',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
})

const config = useRuntimeConfig()
const API    = config.public.apiBase

/* ================= TYPES ================= */
interface Product {
  id:               number
  name:             string
  slug:             string
  brand:            string | null
  price:            number
  old_price:        number | null
  stock:            number
  status:           string
  images:           string[]
  is_promoted:      boolean
  category:         { id: number; name: string; slug: string } | null
  discount_percent?: number
  specs?:           Record<string, any>
}
interface PaginationMeta {
  total: number; per_page: number; current_page: number; last_page: number
}

/* ================= BREADCRUMB ================= */
const breadcrumbItems = [
  { label: 'Accueil', to: '/' },
  { label: 'Boutique', to: '/boutique' },
  { label: 'Promotions', to: '/promotions', current: true },
]

/* ================= AFFICHAGE ================= */
const viewMode           = ref<'grid' | 'grid-small' | 'list' | 'list-compact'>('grid')
const isMobileFilterOpen = ref(false)

/* ================= TRI ================= */
const sortBy = ref('Le plus récent')
const sortParam = computed(() => {
  switch (sortBy.value) {
    case 'Par tarif croissant':   return 'price_asc'
    case 'Par tarif decroissant': return 'price_desc'
    case 'Par popularité':        return 'popular'
    case 'Meilleure remise':      return 'discount'
    default:                      return 'latest'
  }
})

/* ================= FILTRES PRIX ================= */
const PRICE_MAX_DEFAULT = 11800000
const priceMax   = ref(PRICE_MAX_DEFAULT)
const priceRange = ref([0, PRICE_MAX_DEFAULT])

/* ================= FILTRE CATÉGORIE ================= */
const selectedCategory = ref<string | null>(null)
const categories       = ref<{ id: number; name: string; slug: string }[]>([])

const fetchCategories = async () => {
  try {
    const data = await $fetch<any>(`${API}/categories`)
    // Aplatir parent + enfants
    const list: { id: number; name: string; slug: string }[] = []
    for (const cat of data) {
      list.push({ id: cat.id, name: cat.name, slug: cat.slug })
      for (const sub of cat.children ?? []) list.push({ id: sub.id, name: `↳ ${sub.name}`, slug: sub.slug })
    }
    categories.value = list
  } catch {}
}

/* ================= RECHERCHE ================= */
const searchQuery = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

/* ================= PRODUITS & PAGINATION ================= */
const products    = ref<Product[]>([])
const meta        = ref<PaginationMeta>({ total: 0, per_page: 24, current_page: 1, last_page: 1 })
const currentPage = ref(1)
const isLoading   = ref(false)
const itemsPerPage = 24

const fetchProducts = async (resetPage = false) => {
  if (resetPage) currentPage.value = 1
  isLoading.value = true

  try {
    const params: Record<string, any> = {
      page:     currentPage.value,
      per_page: itemsPerPage,
      sort:     sortParam.value,
    }

    if (selectedCategory.value) params.category = selectedCategory.value
    if (searchQuery.value.trim().length >= 2) params.q = searchQuery.value.trim()
    if (priceRange.value[0] > 0)              params.min_price = priceRange.value[0]
    if (priceRange.value[1] < priceMax.value) params.max_price = priceRange.value[1]

    const data = await $fetch<any>(`${API}/promotions`, { params })
    products.value = data.data ?? []
    meta.value = {
      total:        data.total        ?? 0,
      per_page:     data.per_page     ?? itemsPerPage,
      current_page: data.current_page ?? 1,
      last_page:    data.last_page    ?? 1,
    }

    // Recalcul priceMax au premier chargement sans filtre
    if (currentPage.value === 1 && !selectedCategory.value && !searchQuery.value && priceRange.value[0] === 0) {
      if (products.value.length) {
        const maxP = Math.max(...products.value.map(p => p.price))
        priceMax.value = Math.min(Math.ceil(maxP / 100000) * 100000 + 100000, PRICE_MAX_DEFAULT)
        if (priceRange.value[1] === PRICE_MAX_DEFAULT) priceRange.value[1] = priceMax.value
      }
    }
  } catch (e) {
    console.error('Erreur promotions:', e)
    products.value = []
  } finally {
    isLoading.value = false
  }
}

/* ================= ACTIONS ================= */
const resetFilters = () => {
  selectedCategory.value = null
  searchQuery.value      = ''
  priceRange.value       = [0, priceMax.value]
  fetchProducts(true)
}

const setPage = (page: number) => {
  currentPage.value = page
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const activeFilterCount = computed(() => {
  let count = 0
  if (selectedCategory.value) count++
  if (searchQuery.value.trim().length >= 2) count++
  if (priceRange.value[0] > 0 || priceRange.value[1] < priceMax.value) count++
  return count
})

watch(sortBy, () => fetchProducts(true))

watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchProducts(true), 400)
})

let priceTimer: ReturnType<typeof setTimeout> | null = null
watch(priceRange, () => {
  if (priceTimer) clearTimeout(priceTimer)
  priceTimer = setTimeout(() => fetchProducts(true), 400)
})

/* ================= HELPERS ================= */
const formatPrice   = (p: number) => new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(p)
const getImage      = (p: Product) => p.images?.[0] ?? '/images/placeholder.jpg'
const getImageHover = (p: Product) => p.images?.[1] ?? p.images?.[0] ?? '/images/placeholder.jpg'
const isOutOfStock  = (p: Product) => p.status === 'out_of_stock' || p.stock === 0
const goToProduit   = (p: Product) => p.slug ? `/products/${p.slug}` : `/products/${p.id}`

const discountPercent = (p: Product) => {
  if (p.discount_percent) return `-${p.discount_percent}%`
  if (p.old_price && p.old_price > p.price)
    return `-${Math.round((1 - p.price / p.old_price) * 100)}%`
  return null
}

const hoveredKeys = ref<Set<string>>(new Set())
const setHover = (key: string, on: boolean) => {
  const s = new Set(hoveredKeys.value)
  on ? s.add(key) : s.delete(key)
  hoveredKeys.value = s
}
const imgSrc = (p: Product, section: string) =>
  hoveredKeys.value.has(`${section}:${p.id}`) ? getImageHover(p) : getImage(p)

/* ================= PANIER & WISHLIST ================= */
const { addToCart: addToCartStore }           = useCart()
const { isFav, toggleWishlist, initWishlist } = useWishlist()

const addToCart     = (p: Product) => {
  if (isOutOfStock(p)) return
  addToCartStore({ id: p.id, slug: p.slug, name: p.name, price: p.price, image: getImage(p) })
}
const addToWishlist = (p: Product) => toggleWishlist(p.id, p.name)

onMounted(() => { fetchProducts(); fetchCategories(); initWishlist() })
</script>

<template>
  <UContainer class="py-6 bg-white">

    <!-- BREADCRUMB -->
    <nav class="flex items-center gap-2 text-[14px] mb-5 text-gray-500 font-medium border-b border-gray-50 pb-2 overflow-x-auto">
      <template v-for="(item, index) in breadcrumbItems" :key="index">
        <NuxtLink
          :to="item.to"
          class="flex items-center gap-1 transition-colors hover:text-[#e60012] whitespace-nowrap"
          :class="item.current ? 'text-[#274a82] font-bold pointer-events-none' : ''"
        >
          {{ item.label }}
        </NuxtLink>
        <UIcon v-if="index < breadcrumbItems.length - 1" name="i-heroicons-chevron-right" class="w-3 h-3 text-gray-300 flex-shrink-0" />
      </template>
    </nav>

    <!-- HERO BANNER PROMOS -->
    <div class="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-[#e60012] to-[#274a82] p-6 sm:p-10">
      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-2">
          <span class="bg-white/20 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Offres limitées</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-black text-white leading-tight mb-2">
          Nos Promotions
        </h1>
        <p class="text-white/80 text-sm sm:text-base font-medium max-w-md">
          Découvrez toutes nos offres spéciales et profitez des meilleures remises sur nos produits sélectionnés.
        </p>
        <div v-if="!isLoading && meta.total > 0" class="mt-4 flex items-center gap-2">
          <span class="bg-white text-[#e60012] text-sm font-black px-4 py-1.5 rounded-full">
            {{ meta.total }} produit{{ meta.total > 1 ? 's' : '' }} en promotion
          </span>
        </div>
      </div>
      <!-- Décoration -->
      <div class="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 hidden sm:block">
        <UIcon name="i-heroicons-tag" class="w-40 h-40 text-white" />
      </div>
    </div>

    <!-- BARRE MOBILE : filtre + tri -->
    <div class="flex lg:hidden items-center justify-between mb-4 gap-3">
      <button
        @click="isMobileFilterOpen = true"
        class="flex items-center gap-2 px-4 py-2.5 bg-[#274a82] text-white rounded-sm text-sm font-bold shadow-sm"
      >
        <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4" />
        Filtres
        <span v-if="activeFilterCount > 0" class="bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
          {{ activeFilterCount }}
        </span>
      </button>
      <USelectMenu
        v-model="sortBy"
        :items="['Le plus récent','Meilleure remise','Par popularité','Par tarif croissant','Par tarif decroissant']"
        class="flex-1"
      />
    </div>

    <!-- DRAWER FILTRE MOBILE -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="isMobileFilterOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="isMobileFilterOpen = false" />
      </Transition>
      <Transition name="slide-up">
        <div
          v-if="isMobileFilterOpen"
          class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl lg:hidden flex flex-col"
          style="max-height: 90dvh;"
        >
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-adjustments-horizontal" class="w-5 h-5 text-[#274a82]" />
              <span class="font-bold text-gray-900">Filtres</span>
              <span v-if="activeFilterCount > 0" class="text-xs text-[#274a82] font-bold">
                ({{ activeFilterCount }} actif{{ activeFilterCount > 1 ? 's' : '' }})
              </span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetFilters" class="text-xs text-[#e60012] font-bold hover:underline">Tout effacer</button>
              <button @click="isMobileFilterOpen = false" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="overflow-y-auto flex-1 px-4 py-3 space-y-4">

            <!-- Recherche -->
            <div>
              <p class="text-sm font-bold text-gray-800 mb-2">Recherche</p>
              <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="Nom, marque..." class="w-full" />
            </div>

            <!-- Catégorie -->
            <div class="border-b border-gray-50 pb-3">
              <p class="text-sm font-bold text-gray-800 mb-2">Catégorie</p>
              <div class="flex flex-wrap gap-1.5">
                <button
                  @click="selectedCategory = null; fetchProducts(true)"
                  class="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all"
                  :class="!selectedCategory ? 'bg-[#274a82] border-[#274a82] text-white' : 'bg-white border-gray-200 text-gray-600'"
                >Toutes</button>
                <button
                  v-for="cat in categories" :key="cat.slug"
                  @click="selectedCategory = cat.slug; fetchProducts(true); isMobileFilterOpen = false"
                  class="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all"
                  :class="selectedCategory === cat.slug ? 'bg-[#274a82] border-[#274a82] text-white' : 'bg-white border-gray-200 text-gray-600'"
                >{{ cat.name }}</button>
              </div>
            </div>

            <!-- Prix -->
            <div class="pb-3">
              <p class="text-sm font-bold text-gray-800 mb-4">Prix</p>
              <USlider v-model="priceRange" :min="0" :max="priceMax" :step="10000" size="md" />
              <div class="mt-3 text-xs text-gray-500 font-medium text-center">
                {{ formatPrice(priceRange[0]) }} CFA — {{ formatPrice(priceRange[1]) }} CFA
              </div>
            </div>
          </div>

          <div class="flex-shrink-0 px-4 py-4 border-t border-gray-100 bg-white">
            <UButton @click="isMobileFilterOpen = false" color="error" block size="lg" class="rounded-sm font-bold">
              Voir les résultats<span v-if="meta.total > 0"> ({{ meta.total }})</span>
            </UButton>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- LAYOUT PRINCIPAL -->
    <div class="grid grid-cols-12 gap-8">

      <!-- SIDEBAR DESKTOP -->
      <aside class="hidden lg:block col-span-3 space-y-6 flex-shrink-0">

        <div class="flex items-center justify-between">
          <h2 class="text-xl text-gray-800 font-semibold">Filtres</h2>
          <button v-if="activeFilterCount > 0" @click="resetFilters" class="text-xs text-[#e60012] font-bold hover:underline">
            Tout effacer
          </button>
        </div>
        <hr class="border-[#e60012] -mt-4" />

        <!-- Recherche -->
        <div class="pb-4 border-b border-gray-100">
          <h3 class="text-[13px] font-extrabold text-gray-500 tracking-widest mb-2.5">RECHERCHE</h3>
          <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="Nom, marque..." class="w-full" />
        </div>

        <!-- Catégories -->
        <div class="pb-4 border-b border-gray-100">
          <h3 class="text-[13px] font-extrabold text-gray-500 tracking-widest mb-2.5">CATÉGORIE</h3>
          <div class="flex flex-wrap gap-1.5">
            <button
              @click="selectedCategory = null; fetchProducts(true)"
              class="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all"
              :class="!selectedCategory ? 'bg-[#274a82] border-[#274a82] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-[#274a82] hover:text-[#274a82]'"
            >Toutes</button>
            <button
              v-for="cat in categories" :key="cat.slug"
              @click="selectedCategory = cat.slug; fetchProducts(true)"
              class="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all"
              :class="selectedCategory === cat.slug ? 'bg-[#274a82] border-[#274a82] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-[#274a82] hover:text-[#274a82]'"
            >{{ cat.name }}</button>
          </div>
        </div>

        <!-- Prix -->
        <div class="pb-6 border-b border-gray-100">
          <h3 class="text-[13px] font-extrabold text-gray-500 tracking-widest mb-5">PRIX</h3>
          <div class="px-2">
            <USlider v-model="priceRange" :min="0" :max="priceMax" :step="10000" size="md" />
            <div class="mt-4 text-[13px] text-gray-400 font-medium">
              {{ formatPrice(priceRange[0]) }} CFA — {{ formatPrice(priceRange[1]) }} CFA
            </div>
          </div>
        </div>

        <!-- Reset -->
        <div v-if="activeFilterCount > 0">
          <UButton @click="resetFilters" variant="outline" color="gray" block class="font-bold">
            Réinitialiser les filtres
          </UButton>
        </div>

        <!-- Retour boutique -->
        <NuxtLink
          to="/boutique"
          class="flex items-center gap-2 text-sm font-bold text-[#274a82] hover:text-[#e60012] transition-colors"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
          Retour à la boutique
        </NuxtLink>

      </aside>

      <!-- MAIN -->
      <main class="col-span-12 lg:col-span-9">

        <!-- Barre tri/affichage -->
        <div class="flex flex-wrap items-center justify-between mb-6 bg-[#f8f8f8] p-2 rounded-xl border border-gray-200 gap-4">
          <div class="flex items-center gap-3 ml-2">
            <button @click="viewMode = 'grid'"         :class="viewMode === 'grid'         ? 'text-black' : 'text-gray-300'"><UIcon name="i-heroicons-squares-2x2-solid"       class="w-6 h-6" /></button>
            <button @click="viewMode = 'grid-small'"   :class="viewMode === 'grid-small'   ? 'text-black' : 'text-gray-300'"><UIcon name="i-heroicons-squares-plus-solid"       class="w-6 h-6" /></button>
            <button @click="viewMode = 'list'"         :class="viewMode === 'list'         ? 'text-black' : 'text-gray-300'"><UIcon name="i-heroicons-bars-3-bottom-left-solid" class="w-6 h-6" /></button>
            <button @click="viewMode = 'list-compact'" :class="viewMode === 'list-compact' ? 'text-black' : 'text-gray-300'"><UIcon name="i-heroicons-list-bullet-solid"        class="w-6 h-6" /></button>
          </div>
          <div class="flex items-center gap-4">
            <span class="hidden sm:block text-[13px] text-gray-500 font-medium">
              <span v-if="isLoading">Chargement...</span>
              <template v-else>
                Affichage de
                <span class="text-gray-900 font-bold">{{ ((meta.current_page - 1) * meta.per_page) + 1 }}</span>–<span class="text-gray-900 font-bold">{{ Math.min(meta.current_page * meta.per_page, meta.total) }}</span>
                sur <span class="text-gray-900 font-bold">{{ meta.total }}</span> résultats
              </template>
            </span>
            <div class="hidden lg:block">
              <USelectMenu
                v-model="sortBy"
                :items="['Le plus récent','Meilleure remise','Par popularité','Par tarif croissant','Par tarif decroissant']"
                class="min-w-48"
              />
            </div>
          </div>
        </div>

        <!-- Filtres actifs (chips) -->
        <div v-if="activeFilterCount > 0" class="flex flex-wrap gap-2 mb-4">
          <span v-if="selectedCategory"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#274a82]/10 text-[#274a82] text-xs font-bold">
            Catégorie : {{ categories.find(c => c.slug === selectedCategory)?.name ?? selectedCategory }}
            <button @click="selectedCategory = null; fetchProducts(true)" class="hover:text-[#e60012] transition-colors">
              <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
            </button>
          </span>
          <span v-if="searchQuery.trim().length >= 2"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#274a82]/10 text-[#274a82] text-xs font-bold">
            Recherche : {{ searchQuery }}
            <button @click="searchQuery = ''" class="hover:text-[#e60012] transition-colors">
              <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
            </button>
          </span>
          <span v-if="priceRange[0] > 0 || priceRange[1] < priceMax"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#274a82]/10 text-[#274a82] text-xs font-bold">
            Prix : {{ formatPrice(priceRange[0]) }} — {{ formatPrice(priceRange[1]) }} CFA
            <button @click="priceRange = [0, priceMax]; fetchProducts(true)" class="hover:text-[#e60012] transition-colors">
              <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
            </button>
          </span>
          <button @click="resetFilters" class="text-xs text-[#e60012] font-bold hover:underline">Tout effacer</button>
        </div>

        <!-- Loader -->
        <div v-if="isLoading" class="flex justify-center items-center py-24">
          <div class="flex flex-col items-center gap-3">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-[#274a82]" />
            <span class="text-sm font-medium text-gray-400">Chargement des promotions...</span>
          </div>
        </div>

        <!-- Aucun résultat -->
        <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center py-24 text-gray-400">
          <UIcon name="i-heroicons-tag" class="w-12 h-12 mb-3 text-gray-200" />
          <p class="text-base font-semibold text-gray-500">Aucune promotion trouvée</p>
          <p class="text-sm text-gray-400 mt-1">Revenez bientôt, de nouvelles offres arrivent régulièrement !</p>
          <div class="flex gap-3 mt-4">
            <UButton v-if="activeFilterCount > 0" @click="resetFilters" variant="outline" color="gray" class="font-bold" size="sm">
              Réinitialiser les filtres
            </UButton>
            <NuxtLink to="/boutique">
              <UButton color="primary" class="font-bold" size="sm">Voir toute la boutique</UButton>
            </NuxtLink>
          </div>
        </div>

        <!-- ═══ GRILLE PRODUITS ═══ -->
        <div v-else :class="{
          'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3': viewMode === 'grid',
          'grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2': viewMode === 'grid-small',
          'flex flex-col gap-3': viewMode === 'list',
          'flex flex-col gap-1': viewMode === 'list-compact'
        }">
          <NuxtLink
            v-for="p in products" :key="p.id"
            :to="goToProduit(p)"
            :class="viewMode.startsWith('grid')
              ? 'group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl'
              : 'group relative rounded-sm bg-white border border-gray-100 flex flex-row items-center gap-3 p-3 transition-all hover:shadow-md'"
          >
            <div
              :class="{
                'relative w-full h-44 sm:h-52': viewMode === 'grid',
                'relative w-full h-32 sm:h-40': viewMode === 'grid-small',
                'relative h-28 w-28 sm:h-36 sm:w-36 flex-shrink-0': viewMode === 'list',
                'relative h-16 w-16 flex-shrink-0': viewMode === 'list-compact'
              }"
              class="overflow-hidden flex items-center justify-center bg-[#fcfcfc] rounded-sm"
              @mouseenter="setHover(`grid:${p.id}`, true)"
              @mouseleave="setHover(`grid:${p.id}`, false)"
            >
              <!-- Badge remise -->
              <div v-if="discountPercent(p)" class="absolute bottom-2 left-2 bg-[#e60012] text-white text-[9px] font-black px-2 py-0.5 rounded-sm z-10">
                {{ discountPercent(p) }}
              </div>
              <!-- Badge rupture -->
              <div v-if="isOutOfStock(p)" class="absolute top-2 left-2 bg-gray-500 text-white text-[9px] font-black px-2 py-0.5 rounded-sm z-10">Rupture</div>
              <div v-else-if="p.stock > 0 && p.stock <= 5" class="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-sm z-10">
                Plus que {{ p.stock }}
              </div>

              <!-- Badge promo (coin supérieur droit) -->
              <div class="absolute top-2 right-2 bg-[#e60012]/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm z-10 flex items-center gap-0.5">
                <UIcon name="i-heroicons-fire" class="w-2.5 h-2.5" />
                Promo
              </div>

              <!-- Actions grille -->
              <div v-if="viewMode.startsWith('grid')" class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-10 flex-col gap-2 z-30 transition-all duration-300">
                <button
                  @click.prevent.stop="addToWishlist(p)"
                  class="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
                  :class="isFav(p.id) ? 'bg-white text-[#e60012]' : 'text-gray-400 hover:bg-[#e60012] hover:text-white'"
                >
                  <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" />
                </button>
              </div>

              <img :src="imgSrc(p, 'grid')" class="absolute inset-0 w-full h-full object-contain p-2 transition-opacity duration-300" :alt="p.name" />

              <!-- CTA au survol -->
              <div v-if="viewMode.startsWith('grid')" class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full transition-all duration-300 z-20">
                <button
                  @click.prevent.stop="addToCart(p)"
                  :disabled="isOutOfStock(p)"
                  class="w-full flex items-center justify-center gap-2 bg-[#274a82] hover:bg-[#e60012] text-white font-bold text-[12px] py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
                  {{ isOutOfStock(p) ? 'Rupture de stock' : 'Ajouter au Panier' }}
                </button>
              </div>
            </div>

            <!-- Infos produit -->
            <div class="flex flex-col flex-1 min-w-0" :class="viewMode.startsWith('grid') ? 'p-2 sm:p-3' : ''">
              <span class="text-[10px] sm:text-[11px] text-gray-400 font-bold tracking-widest truncate">{{ p.category?.name ?? '' }}</span>
              <h3
                class="font-bold leading-snug group-hover:text-[#e60012] transition-colors truncate sm:whitespace-normal"
                :class="{
                  'text-[13px] sm:text-[14px] text-[#274a82] line-clamp-2 mt-0.5 mb-2 h-8 sm:h-10': viewMode === 'grid',
                  'text-[11px] text-[#274a82] line-clamp-1 mt-0.5 mb-1': viewMode === 'grid-small',
                  'text-[13px] sm:text-sm text-gray-800 line-clamp-2 mt-0.5 mb-2': viewMode === 'list',
                  'text-[12px] text-gray-800 line-clamp-1': viewMode === 'list-compact',
                }"
              >{{ p.name }}</h3>

              <div class="mt-auto flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div v-if="p.old_price && viewMode !== 'list-compact'" class="text-[10px] sm:text-[11px] text-[#e60012] line-through leading-tight">
                    {{ formatPrice(p.old_price) }} FCFA
                  </div>
                  <div
                    class="font-black text-gray-900 leading-tight whitespace-nowrap"
                    :class="viewMode === 'list-compact' ? 'text-xs' : viewMode === 'grid-small' ? 'text-sm' : 'text-base sm:text-lg'"
                  >
                    {{ formatPrice(p.price) }} <span class="text-[9px] font-medium">FCFA</span>
                  </div>
                </div>

                <!-- Actions vue liste -->
                <div v-if="viewMode.startsWith('list')" class="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                  <button
                    @click.prevent.stop="addToWishlist(p)"
                    class="w-8 h-8 rounded-full border flex items-center justify-center transition-colors"
                    :class="isFav(p.id) ? 'border-[#e60012] text-[#e60012] bg-red-50' : 'border-gray-200 text-gray-400 hover:text-[#e60012] hover:border-[#e60012]'"
                  >
                    <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" />
                  </button>
                  <button
                    @click.prevent.stop="addToCart(p)"
                    :disabled="isOutOfStock(p)"
                    class="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#274a82] hover:bg-[#e60012] text-white text-[11px] font-bold transition-colors disabled:opacity-40"
                  >
                    <UIcon name="i-heroicons-shopping-cart" class="w-3.5 h-3.5" />
                    <span class="hidden md:inline">Ajouter</span>
                  </button>
                </div>

                <!-- Bouton mobile -->
                <button
                  @click.prevent.stop="addToCart(p)"
                  :disabled="isOutOfStock(p)"
                  class="sm:hidden flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-all disabled:opacity-40"
                  :class="isOutOfStock(p) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#274a82] hover:bg-[#e60012]'"
                >
                  <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Pagination -->
        <div v-if="meta.last_page > 1" class="flex justify-center pt-6 mb-12">
          <UPagination
            v-model:page="currentPage"
            :items-per-page="meta.per_page"
            :total="meta.total"
            show-edges
            @update:page="setPage"
          />
        </div>

      </main>
    </div>

  </UContainer>
</template>

<style scoped>
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.25s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1); }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
</style>