<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import useWishlist from '~/composables/UseWishlist'

// ══════════════════════════════════════════════════════════════════════════
// SEO DYNAMIQUE — aligné sur categories/[...slug].vue
// ══════════════════════════════════════════════════════════════════════════

const route = useRoute()

// Titre provisoire avant que les paramètres URL soient résolus
// Titre provisoire avant que setSeo() soit appelé (chargement initial)
useHead({ title: 'Boutique' })

const setSeo = () => {
  const isPromo = route.query.promo === '1'
  const searchQ = (route.query.q as string) || ''

  const title = isPromo
    ? 'Promotions & Bons Plans'
    : searchQ
      ? `Résultats pour "${searchQ}"`
      : 'Boutique Informatique & High-Tech'

  const description = isPromo
    ? 'Découvrez toutes nos promotions et bons plans sur les équipements informatiques au Cameroun. Stock limité, prix cassés !'
    : searchQ
      ? `Résultats de recherche pour "${searchQ}" chez BRC Market. Livraison rapide à Douala, Yaoundé et dans tout le Cameroun.`
      : 'Achetez vos équipements informatiques, réseaux, sécurité électronique et accessoires au meilleur prix au Cameroun. Livraison rapide à Douala, Yaoundé et dans tout le Cameroun.'

  const url = isPromo
    ? 'https://brcmarket.cm/boutique?promo=1'
    : searchQ
      ? `https://brcmarket.cm/boutique?q=${encodeURIComponent(searchQ)}`
      : 'https://brcmarket.cm/boutique'

  useSeoMeta({
    title,
    ogTitle:            title,
    description,
    ogDescription:      description,
    ogImage:            'https://brcmarket.cm/images/og-image.png',
    ogUrl:              url,
    twitterTitle:       title,
    twitterDescription: description,
    twitterImage:       'https://brcmarket.cm/images/og-image.png',
  })

  useHead({
    link: [{ rel: 'canonical', href: 'https://brcmarket.cm/boutique' }],
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type':    'CollectionPage',
        name:       title,
        description,
        url,
        breadcrumb: {
          '@type':         'BreadcrumbList',
          itemListElement: breadcrumbItems.value.map((item, i) => ({
            '@type':   'ListItem',
            position:  i + 1,
            name:      item.label,
            item:      `https://brcmarket.cm${item.to}`,
          })),
        },
      }),
    }],
  })
}

const config = useRuntimeConfig()
const API    = config.public.apiBase

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */
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
  category:         { id: number; name: string; slug: string } | null
  discount_percent?: number
  specs?:           Record<string, any>
}
interface PaginationMeta {
  total: number; per_page: number; current_page: number; last_page: number
}

/* ════════════════════════════════════════════════════════════════
   AFFICHAGE
════════════════════════════════════════════════════════════════ */
const viewMode           = ref<'grid' | 'grid-small' | 'list' | 'list-compact'>('grid')
const isMobileFilterOpen = ref(false)

/* ════════════════════════════════════════════════════════════════
   FILTRES
════════════════════════════════════════════════════════════════ */
const expandedGroups = ref<Record<string, boolean>>({})
const toggleExpand   = (k: string) => { expandedGroups.value[k] = !expandedGroups.value[k] }

const PRICE_MAX_DEFAULT = 11800000
const priceMax   = ref(PRICE_MAX_DEFAULT)
const priceRange = ref([0, PRICE_MAX_DEFAULT])

const filterGroups   = ref<Record<string, Record<string, number>>>({})
const appliedFilters = ref<Record<string, string | null>>({})

if (route.query.promo === '1') {
  appliedFilters.value['__promo'] = 'Promotions'
}

const FIXED_FILTER_DEFS: Record<string, string[]> = {
  'Ram':        ['4 Go', '8 Go', '16 Go', '24 Go', '32 Go'],
  'Stockage':   ['128 Go SSD', '256 Go SSD', '512 Go SSD', '1 TB SSD', '500 Go HDD', '1 TB HDD'],
  'Processeur': ['Dual Core', 'Core i3', 'Core i5', 'Core i7', 'Core i9'],
  'Generation': ['4ieme Gen', '5ieme Gen', '6ieme Gen', '7ieme Gen', '8ieme Gen',
                 '9ieme Gen', '10ieme Gen', '11ieme Gen', '12ieme Gen', '13ieme Gen', '14ieme Gen'],
  'Etat':       ['Neuf', 'Occasion'],
}

/* ════════════════════════════════════════════════════════════════
   TRI
════════════════════════════════════════════════════════════════ */
const SORT_OPTIONS = ['Le plus récent', 'Par popularité', 'Par tarif croissant', 'Par tarif decroissant']

const resolveSortLabel = (urlSort: string | undefined): string => {
  switch (urlSort) {
    case 'best_seller':  return 'Par popularité'
    case 'popular':      return 'Par popularité'
    case 'price_asc':    return 'Par tarif croissant'
    case 'price_desc':   return 'Par tarif decroissant'
    default:             return 'Le plus récent'
  }
}

const sortBy = ref(resolveSortLabel(route.query.sort as string | undefined))

const sortParam = computed(() => {
  switch (sortBy.value) {
    case 'Par tarif croissant':   return 'price_asc'
    case 'Par tarif decroissant': return 'price_desc'
    case 'Par popularité':        return 'popular'
    default:                      return 'latest'
  }
})

const urlSearchQuery = computed(() => (route.query.q as string) || '')

const breadcrumbItems = computed(() => {
  const items: { label: string; to: string; current?: boolean }[] = [
    { label: 'Accueil',  to: '/' },
    { label: 'Boutique', to: '/boutique' },
  ]
  if (appliedFilters.value['__promo']) {
    items.push({ label: 'Promotions', to: '/boutique?promo=1', current: true })
  } else if (urlSearchQuery.value) {
    items.push({ label: `Résultats pour "${urlSearchQuery.value}"`, to: `/boutique?q=${urlSearchQuery.value}`, current: true })
  } else {
    items[1].current = true
  }
  return items
})

const activeFilterCount = computed(() => Object.values(appliedFilters.value).filter(Boolean).length)

/* ════════════════════════════════════════════════════════════════
   FETCH FILTER COUNTS
════════════════════════════════════════════════════════════════ */
const loadingCounts = ref(false)

const buildCountParams = (): Record<string, any> => {
  const p: Record<string, any> = {}
  if (urlSearchQuery.value)              p.q           = urlSearchQuery.value
  if (appliedFilters.value['Marques'])   p.brand       = appliedFilters.value['Marques']
  if (priceRange.value[0] > 0)           p.min_price   = priceRange.value[0]
  if (priceRange.value[1] < priceMax.value) p.max_price = priceRange.value[1]
  if (appliedFilters.value['__promo'])   p.is_promoted = 1
  return p
}

const fetchFilterCounts = async () => {
  loadingCounts.value = true
  try {
    const data = await $fetch<Record<string, Record<string, number>>>(
      `${API}/products/filter-counts`,
      { params: buildCountParams() }
    )

    const groups: Record<string, Record<string, number>> = {}

    if (data['Marques'] && Object.keys(data['Marques']).length > 0) {
      groups['Marques'] = data['Marques']
    }

    Object.entries(FIXED_FILTER_DEFS).forEach(([label, opts]) => {
      groups[label] = {}
      opts.forEach(opt => {
        groups[label][opt] = data[label]?.[opt] ?? 0
      })
    })

    filterGroups.value = groups

    Object.keys(groups).forEach(k => {
      if (!(k in appliedFilters.value)) appliedFilters.value[k] = null
    })
  } catch (e) {
    console.error('Erreur filter-counts:', e)
  } finally {
    loadingCounts.value = false
  }
}

/* ════════════════════════════════════════════════════════════════
   PRODUITS & PAGINATION
════════════════════════════════════════════════════════════════ */
const products       = ref<Product[]>([])
const recentProducts = ref<Product[]>([])
const promoProducts  = ref<Product[]>([])
const loadingRecent  = ref(false)
const loadingPromos  = ref(false)
const meta           = ref<PaginationMeta>({ total: 0, per_page: 24, current_page: 1, last_page: 1 })
const currentPage    = ref(1)
const isLoading      = ref(false)
const itemsPerPage   = 24

const fetchProducts = async (resetPage = false) => {
  if (resetPage) currentPage.value = 1
  isLoading.value = true
  try {
    const params: Record<string, any> = {
      page:     currentPage.value,
      per_page: itemsPerPage,
      sort:     sortParam.value,
    }

    if (urlSearchQuery.value)             params.q           = urlSearchQuery.value
    if (appliedFilters.value['Marques'])  params.brand       = appliedFilters.value['Marques']
    if (priceRange.value[0] > 0)          params.min_price   = priceRange.value[0]
    if (priceRange.value[1] < priceMax.value) params.max_price = priceRange.value[1]
    if (appliedFilters.value['__promo'])  params.is_promoted = 1

    Object.entries(appliedFilters.value).forEach(([k, v]) => {
      if (!v || k === 'Marques' || k === '__promo') return
      const paramKey = `spec_${k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_')}`
      params[paramKey] = v
    })

    const data = await $fetch<any>(`${API}/products`, { params })
    products.value = data.data ?? []
    meta.value = {
      total:        data.total        ?? 0,
      per_page:     data.per_page     ?? itemsPerPage,
      current_page: data.current_page ?? 1,
      last_page:    data.last_page    ?? 1,
    }

    if (currentPage.value === 1 && !activeFilterCount.value && products.value.length) {
      const maxP = Math.max(...products.value.map(p => p.price))
      priceMax.value = Math.min(Math.ceil(maxP / 100000) * 100000 + 100000, PRICE_MAX_DEFAULT)
      if (priceRange.value[1] === PRICE_MAX_DEFAULT) priceRange.value[1] = priceMax.value
    }
  } catch (e) {
    console.error('Erreur produits boutique:', e)
    products.value = []
  } finally {
    isLoading.value = false
  }
}

const fetchRecentProducts = async () => {
  loadingRecent.value = true
  try {
    const data = await $fetch<any>(`${API}/products`, { params: { per_page: 5, sort: 'latest' } })
    recentProducts.value = data.data ?? []
  } catch { recentProducts.value = [] }
  finally { loadingRecent.value = false }
}

const fetchSidebarPromos = async () => {
  loadingPromos.value = true
  try {
    const data = await $fetch<any>(`${API}/products`, { params: { per_page: 6, is_promoted: 1, sort: 'latest' } })
    promoProducts.value = data.data ?? []
  } catch { promoProducts.value = [] }
  finally { loadingPromos.value = false }
}

/* ════════════════════════════════════════════════════════════════
   ACTIONS FILTRES
════════════════════════════════════════════════════════════════ */
const selectFilter = (groupKey: string, opt: string) => {
  appliedFilters.value[groupKey] = appliedFilters.value[groupKey] === opt ? null : opt
  fetchProducts(true)
  isMobileFilterOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetFilters = () => {
  Object.keys(appliedFilters.value).forEach(k => appliedFilters.value[k] = null)
  delete appliedFilters.value['__promo']
  priceRange.value = [0, priceMax.value]
  sortBy.value = 'Le plus récent'
  if (route.query.promo === '1' || route.query.q || route.query.sort) {
    navigateTo('/boutique', { replace: true })
  } else {
    fetchProducts(true)
    fetchFilterCounts()
  }
}

const setPage = (page: number) => {
  currentPage.value = page
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/* ════════════════════════════════════════════════════════════════
   WATCHERS
════════════════════════════════════════════════════════════════ */
watch(sortBy, () => fetchProducts(true))

let priceTimer: ReturnType<typeof setTimeout> | null = null
watch(priceRange, () => {
  if (priceTimer) clearTimeout(priceTimer)
  priceTimer = setTimeout(() => {
    fetchProducts(true)
    fetchFilterCounts()
  }, 400)
}, { deep: true })

watch(() => route.query.promo, (newVal, oldVal) => {
  if (newVal === oldVal) return
  if (newVal === '1') appliedFilters.value['__promo'] = 'Promotions'
  else delete appliedFilters.value['__promo']
  fetchProducts(true)
  fetchFilterCounts()
  setSeo() // ✅ SEO mis à jour quand la promo change via URL
})

watch(() => route.query.q, (newVal, oldVal) => {
  if (newVal === oldVal) return
  fetchProducts(true)
  fetchFilterCounts()
  setSeo() // ✅ SEO mis à jour quand la recherche change via URL
})

watch(() => route.query.sort, (newVal, oldVal) => {
  if (newVal === oldVal) return
  sortBy.value = resolveSortLabel(newVal as string | undefined)
})

/* ════════════════════════════════════════════════════════════════
   HELPERS UI
════════════════════════════════════════════════════════════════ */
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

/* ════════════════════════════════════════════════════════════════
   WISHLIST
════════════════════════════════════════════════════════════════ */
const { isFav, toggleWishlist, initWishlist } = useWishlist()
const addToWishlist = (p: Product) => toggleWishlist(p.id, p.name)

/* ════════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════════ */
onMounted(() => {
  setSeo() // ✅ SEO complet au montage
  fetchProducts()
  fetchFilterCounts()
  fetchRecentProducts()
  fetchSidebarPromos()
  initWishlist()
})
</script>

<template>
  <UContainer class="py-6 bg-white">

    <!-- BREADCRUMB -->
    <nav
      aria-label="Fil d'Ariane"
      class="hidden sm:flex items-center gap-2 text-[14px] mb-5 text-gray-500 font-medium border-b border-gray-50 pb-2 overflow-x-auto">
      <template v-for="(item, index) in breadcrumbItems" :key="index">
        <NuxtLink
          :to="item.to"
          class="flex items-center gap-1 transition-colors hover:text-[#e60012] whitespace-nowrap"
          :class="item.current ? 'text-[#274a82] font-bold pointer-events-none' : ''"
          :aria-current="item.current ? 'page' : undefined">
          {{ item.label }}
        </NuxtLink>
        <UIcon v-if="index < breadcrumbItems.length - 1" name="i-heroicons-chevron-right" class="w-3 h-3 text-gray-300 flex-shrink-0" />
      </template>
    </nav>

    <!-- BANNIÈRE RECHERCHE ACTIVE -->
    <div v-if="urlSearchQuery" class="flex items-center justify-between mb-4 px-4 py-3 bg-[#274a82]/5 border border-[#274a82]/20 rounded-xl">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-[#274a82]" />
        <span class="text-sm text-gray-700">
          Résultats pour <span class="font-black text-[#274a82]">"{{ urlSearchQuery }}"</span>
          <span v-if="!isLoading" class="text-gray-400 font-normal ml-1">({{ meta.total }} produit{{ meta.total > 1 ? 's' : '' }})</span>
        </span>
      </div>
      <button @click="resetFilters" class="flex items-center gap-1 text-xs text-[#e60012] font-bold hover:underline">
        <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" /> Effacer
      </button>
    </div>

    <!-- BOUTON FILTRE MOBILE + TRI -->
    <div class="flex lg:hidden items-center justify-between mb-4 gap-3">
      <button
        @click="isMobileFilterOpen = true"
        aria-label="Ouvrir les filtres"
        class="flex items-center gap-2 px-4 py-2.5 bg-[#274a82] text-white rounded-sm text-sm font-bold shadow-sm">
        <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4" />
        Filtres
        <span v-if="activeFilterCount > 0" class="bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
          {{ activeFilterCount }}
        </span>
      </button>
      <USelectMenu v-model="sortBy" :items="SORT_OPTIONS" class="flex-1" />
    </div>

    <!-- ═══ DRAWER FILTRE MOBILE ═══ -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="isMobileFilterOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="isMobileFilterOpen = false" />
      </Transition>
      <Transition name="slide-up">
        <div
          v-if="isMobileFilterOpen"
          class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl lg:hidden flex flex-col"
          style="max-height: 90dvh;"
          role="dialog"
          aria-modal="true"
          aria-label="Filtres">

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
              <button
                @click="isMobileFilterOpen = false"
                aria-label="Fermer les filtres"
                class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="overflow-y-auto flex-1 px-4 py-3 space-y-1">
            <!-- Skeleton mobile -->
            <template v-if="loadingCounts && Object.keys(filterGroups).length === 0">
              <div v-for="n in 4" :key="n" class="border-b border-gray-50 pb-3">
                <div class="h-3 bg-gray-100 rounded animate-pulse w-1/3 my-3"></div>
                <div class="grid grid-cols-2 gap-1.5">
                  <div v-for="m in 4" :key="m" class="h-9 bg-gray-50 rounded-sm animate-pulse"></div>
                </div>
              </div>
            </template>

            <div v-for="(options, key) in filterGroups" :key="key" class="border-b border-gray-50 pb-3">
              <button
                @click="toggleExpand(key as string)"
                class="w-full flex items-center justify-between py-2"
                :aria-expanded="expandedGroups[key as string]">
                <span class="text-sm font-bold text-gray-800">{{ key }}</span>
                <div class="flex items-center gap-2">
                  <span v-if="appliedFilters[key as string]"
                    class="text-[10px] bg-[#274a82]/10 text-[#274a82] font-bold px-2 py-0.5 rounded-full">
                    {{ appliedFilters[key as string] }}
                  </span>
                  <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-gray-400 transition-transform"
                    :class="{ 'rotate-180': expandedGroups[key as string] }" />
                </div>
              </button>
              <div v-if="expandedGroups[key as string]" class="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  v-for="(count, opt) in options" :key="opt"
                  :disabled="count === 0 && appliedFilters[key as string] !== opt"
                  @click="count > 0 || appliedFilters[key as string] === opt ? selectFilter(key as string, opt as string) : null"
                  class="flex items-center gap-2 px-3 py-2 rounded-sm border transition-all text-xs font-medium text-left"
                  :class="appliedFilters[key as string] === opt
                    ? 'border-[#274a82] bg-[#274a82]/5 text-[#274a82] cursor-pointer'
                    : count === 0
                      ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300 cursor-pointer'">
                  <span class="flex-1">{{ opt }}</span>
                  <span class="text-[10px]" :class="count === 0 ? 'text-gray-300' : 'text-gray-400'">({{ count }})</span>
                  <UIcon v-if="appliedFilters[key as string] === opt" name="i-heroicons-check" class="w-3.5 h-3.5 text-[#274a82] flex-shrink-0" />
                </button>
              </div>
            </div>

            <!-- Prix mobile -->
            <div class="pb-3">
              <p class="text-sm font-bold text-gray-800 py-2">Prix</p>
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

    <!-- ═══ LAYOUT PRINCIPAL ═══ -->
    <div class="grid grid-cols-12 gap-8">

      <!-- SIDEBAR DESKTOP -->
      <aside class="hidden lg:block col-span-3 space-y-8 flex-shrink-0" aria-label="Filtres">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl text-gray-800 my-1">Filtres</h2>
          <button v-if="activeFilterCount > 0" @click="resetFilters"
            class="text-xs text-[#e60012] font-bold hover:underline">Tout effacer</button>
        </div>
        <hr class="border-[#e60012] -mt-6" />

        <!-- Skeleton desktop -->
        <template v-if="loadingCounts && Object.keys(filterGroups).length === 0">
          <div v-for="n in 5" :key="n" class="border-b border-gray-100 pb-4 space-y-2">
            <div class="h-3 bg-gray-100 rounded animate-pulse w-1/3"></div>
            <div class="flex flex-wrap gap-1.5">
              <div v-for="m in 4" :key="m" class="h-7 bg-gray-50 rounded-full animate-pulse w-20"></div>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-for="(options, key) in filterGroups" :key="key" class="border-b border-gray-100 pb-4">
            <h3 class="text-[14px] font-extrabold text-gray-500 tracking-widest mb-2.5">{{ key }}</h3>
            <div class="flex flex-wrap gap-1.5">
              <template v-for="(count, opt, index) in options" :key="opt">
                <button
                  v-if="index < 6 || expandedGroups[key as string]"
                  :disabled="count === 0 && appliedFilters[key as string] !== opt"
                  @click="count > 0 || appliedFilters[key as string] === opt ? selectFilter(key as string, opt as string) : null"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all select-none"
                  :class="appliedFilters[key as string] === opt
                    ? 'bg-[#274a82] border-[#274a82] text-white shadow-sm cursor-pointer'
                    : count === 0
                      ? 'bg-white border-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-[#274a82] hover:text-[#274a82] cursor-pointer'">
                  {{ opt }}
                  <span class="text-[10px]"
                    :class="appliedFilters[key as string] === opt ? 'opacity-70' : count === 0 ? 'text-gray-200' : 'opacity-60'">
                    ({{ count }})
                  </span>
                </button>
              </template>
            </div>
            <button v-if="Object.keys(options).length > 6" @click="toggleExpand(key as string)"
              class="text-[11px] text-[#274a82] font-bold mt-2 hover:text-[#e60012] transition-colors">
              {{ expandedGroups[key as string] ? '− Voir moins' : '+ Voir plus' }}
            </button>
          </div>
        </template>

        <!-- Prix desktop -->
        <div class="pb-6 border-b border-gray-100">
          <h3 class="text-sm font-bold text-gray-900 mb-6 tracking-wider">Prix</h3>
          <div class="px-2">
            <USlider v-model="priceRange" :min="0" :max="priceMax" :step="10000" size="md" />
            <div class="mt-4 text-[14px] text-gray-400 font-medium">
              Prix : {{ formatPrice(priceRange[0]) }} CFA — {{ formatPrice(priceRange[1]) }} CFA
            </div>
          </div>
        </div>

        <div v-if="activeFilterCount > 0">
          <UButton @click="resetFilters" variant="outline" color="gray" block class="font-bold">
            Réinitialiser les filtres
          </UButton>
        </div>

        <!-- Sidebar promos carousel -->
        <div>
          <div class="flex items-center justify-between border-b border-[#e60012] mb-4">
            <h3 class="text-sm font-bold text-gray-900 tracking-wider pb-1">En promotion</h3>
            <NuxtLink to="/boutique?promo=1"
              class="text-[11px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-0.5 transition-colors group pb-1">
              Voir plus <UIcon name="i-heroicons-arrow-right" class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </NuxtLink>
          </div>

          <div v-if="loadingPromos" class="space-y-2">
            <div v-for="n in 3" :key="n" class="flex gap-2 animate-pulse">
              <div class="w-16 h-16 bg-gray-100 rounded-sm flex-shrink-0"></div>
              <div class="flex-1 space-y-1.5 py-1">
                <div class="h-2.5 bg-gray-100 rounded w-full"></div>
                <div class="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          <div v-else-if="promoProducts.length === 0" class="flex flex-col items-center justify-center py-6 text-gray-300">
            <UIcon name="i-heroicons-sparkles" class="w-8 h-8 mb-1" />
            <p class="text-xs font-medium text-gray-400">Aucune promo disponible</p>
          </div>

          <UCarousel v-else v-slot="{ item: p }" :items="promoProducts" arrows dots
            :autoplay="{ delay: 3000 }" class="relative rounded-sm overflow-hidden"
            :prev="{ variant: 'solid', size: 'xs' }" :next="{ variant: 'solid', size: 'xs' }">
            <NuxtLink :to="goToProduit(p)"
              class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-lg w-full">
              <div class="relative h-44 w-full overflow-hidden flex items-center justify-center"
                @mouseenter="setHover(`sidebar-promo:${p.id}`, true)"
                @mouseleave="setHover(`sidebar-promo:${p.id}`, false)">
                <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">{{ discountPercent(p) }}</div>
                <div v-if="isOutOfStock(p)" class="absolute top-2 right-2 z-10 bg-gray-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">Rupture</div>
                <!-- ✅ lazy + decoding + dimensions -->
                <img
                  :src="imgSrc(p, 'sidebar-promo')"
                  :alt="p.name"
                  loading="lazy"
                  decoding="async"
                  width="180"
                  height="180"
                  class="absolute inset-0 w-full h-full object-contain p-3 transition-all duration-500 group-hover:scale-105" />
              </div>
              <div class="p-2 flex flex-col gap-1 border-t border-gray-100">
                <span class="text-[10px] text-gray-400 font-bold tracking-widest truncate">{{ p.category?.name ?? '' }}</span>
                <h4 class="text-[12px] text-[#274a82] font-bold line-clamp-2 leading-snug group-hover:text-[#e60012] transition-colors min-h-[32px]">{{ p.name }}</h4>
                <div class="flex items-end gap-2 mt-1">
                  <span class="text-sm font-black text-gray-900 leading-tight">{{ formatPrice(p.price) }} <span class="text-[9px] font-medium">FCFA</span></span>
                  <span v-if="p.old_price" class="text-[10px] text-[#e60012] line-through leading-tight">{{ formatPrice(p.old_price) }} FCFA</span>
                </div>
              </div>
            </NuxtLink>
          </UCarousel>
        </div>
      </aside>

      <!-- ═══ MAIN ═══ -->
      <main class="col-span-12 lg:col-span-9">
        <h1 class="text-2xl font-medium text-gray-700 tracking-tighter pb-2">
          {{ urlSearchQuery ? `"${urlSearchQuery}"` : 'Boutique' }}
        </h1>

        <!-- Barre tri / affichage -->
        <div class="flex flex-wrap items-center justify-between mb-6 bg-[#f8f8f8] p-2 rounded-xl border border-gray-200 gap-4">
          <div class="flex items-center gap-3 ml-2" role="group" aria-label="Mode d'affichage">
            <button @click="viewMode = 'grid'"         :aria-pressed="viewMode === 'grid'"         aria-label="Grille normale"   :class="viewMode === 'grid'         ? 'text-black' : 'text-gray-300'"><UIcon name="i-heroicons-squares-2x2-solid"       class="w-6 h-6" /></button>
            <button @click="viewMode = 'grid-small'"   :aria-pressed="viewMode === 'grid-small'"   aria-label="Petite grille"    :class="viewMode === 'grid-small'   ? 'text-black' : 'text-gray-300'"><UIcon name="i-heroicons-squares-plus-solid"       class="w-6 h-6" /></button>
            <button @click="viewMode = 'list'"         :aria-pressed="viewMode === 'list'"         aria-label="Liste"            :class="viewMode === 'list'         ? 'text-black' : 'text-gray-300'"><UIcon name="i-heroicons-bars-3-bottom-left-solid" class="w-6 h-6" /></button>
            <button @click="viewMode = 'list-compact'" :aria-pressed="viewMode === 'list-compact'" aria-label="Liste compacte"   :class="viewMode === 'list-compact' ? 'text-black' : 'text-gray-300'"><UIcon name="i-heroicons-list-bullet-solid"        class="w-6 h-6" /></button>
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
              <USelectMenu v-model="sortBy" :items="SORT_OPTIONS" class="min-w-48" />
            </div>
          </div>
        </div>

        <!-- Filtres actifs (chips) -->
        <div v-if="activeFilterCount > 0" class="flex flex-wrap gap-2 mb-4">
          <template v-for="(val, key) in appliedFilters" :key="key">
            <span v-if="val" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#274a82]/10 text-[#274a82] text-xs font-bold">
              {{ key }} : {{ val }}
              <button
                @click="selectFilter(key as string, val as string)"
                :aria-label="`Supprimer le filtre ${key}`"
                class="hover:text-[#e60012] transition-colors">
                <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
              </button>
            </span>
          </template>
          <button @click="resetFilters" class="text-xs text-[#e60012] font-bold hover:underline">Tout effacer</button>
        </div>

        <!-- Loader -->
        <div v-if="isLoading" class="flex justify-center items-center py-24">
          <div class="flex flex-col items-center gap-3">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-[#274a82]" />
            <span class="text-sm font-medium text-gray-400">Chargement des produits...</span>
          </div>
        </div>

        <!-- Aucun résultat -->
        <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center py-24 text-gray-400">
          <UIcon name="i-heroicons-face-frown" class="w-12 h-12 mb-3 text-gray-300" />
          <p class="text-base font-semibold text-gray-500">
            {{ urlSearchQuery ? `Aucun résultat pour "${urlSearchQuery}"` : 'Aucun produit trouvé' }}
          </p>
          <UButton @click="resetFilters" variant="outline" color="gray" class="mt-4 font-bold" size="sm">
            {{ urlSearchQuery ? 'Voir tous les produits' : 'Réinitialiser les filtres' }}
          </UButton>
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
              : 'group relative rounded-sm bg-white border border-gray-100 flex flex-row items-center gap-3 p-3 transition-all hover:shadow-md'">
            <div :class="{
              'relative w-full h-44 sm:h-52': viewMode === 'grid',
              'relative w-full h-32 sm:h-40': viewMode === 'grid-small',
              'relative h-28 w-28 sm:h-36 sm:w-36 flex-shrink-0': viewMode === 'list',
              'relative h-16 w-16 flex-shrink-0': viewMode === 'list-compact'
            }" class="overflow-hidden flex items-center justify-center bg-[#fcfcfc] rounded-sm"
              @mouseenter="setHover(`grid:${p.id}`, true)"
              @mouseleave="setHover(`grid:${p.id}`, false)">

              <div v-if="discountPercent(p)" class="absolute bottom-2 left-2 bg-[#e60012] text-white text-[9px] font-black px-2 py-0.5 rounded-sm z-10">{{ discountPercent(p) }}</div>
              <div v-if="isOutOfStock(p)" class="absolute top-2 left-2 bg-gray-500 text-white text-[9px] font-black px-2 py-0.5 rounded-sm z-10">Rupture</div>
              <div v-else-if="p.stock > 0 && p.stock <= 5" class="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-sm z-10">Plus que {{ p.stock }}</div>

              <div v-if="viewMode.startsWith('grid')" class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
                <button
                  @click.prevent.stop="addToWishlist(p)"
                  :aria-label="isFav(p.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                  class="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
                  :class="isFav(p.id) ? 'bg-[#e60012] text-[#e60012]' : 'text-gray-400 hover:bg-[#e60012] hover:text-white'">
                  <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" />
                </button>
              </div>

              <!-- ✅ lazy + decoding + dimensions -->
              <img
                :src="imgSrc(p, 'grid')"
                :alt="p.name"
                loading="lazy"
                decoding="async"
                width="200"
                height="200"
                class="absolute inset-0 w-full h-full object-contain p-2 transition-opacity duration-300" />
            </div>

            <div class="flex flex-col flex-1 min-w-0 border-t border-gray-100" :class="viewMode.startsWith('grid') ? 'p-2 sm:p-3' : ''">
              <span class="text-[10px] sm:text-[11px] text-gray-400 font-bold tracking-widest truncate">{{ p.category?.name ?? '' }}</span>
              <h3 class="font-bold leading-snug group-hover:text-[#e60012] transition-colors overflow-hidden"
                :class="{
                  'text-[13px] sm:text-[14px] text-[#274a82] line-clamp-2 mt-0.5 mb-2': viewMode === 'grid',
                  'text-[11px] text-[#274a82] line-clamp-1 mt-0.5 mb-1': viewMode === 'grid-small',
                  'text-[13px] sm:text-sm text-gray-800 line-clamp-2 mt-0.5 mb-2': viewMode === 'list',
                  'text-[12px] text-gray-800 line-clamp-1': viewMode === 'list-compact',
                }">{{ p.name }}</h3>

              <div class="mt-auto flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div v-if="p.old_price && viewMode !== 'list-compact'" class="text-[10px] sm:text-[11px] text-[#e60012] line-through leading-tight">{{ formatPrice(p.old_price) }} FCFA</div>
                  <div class="font-black text-gray-900 leading-tight whitespace-nowrap"
                    :class="viewMode === 'list-compact' ? 'text-xs' : viewMode === 'grid-small' ? 'text-sm' : 'text-base sm:text-lg'">
                    {{ formatPrice(p.price) }} <span class="text-[9px] font-medium">FCFA</span>
                  </div>
                </div>
                <div v-if="viewMode.startsWith('list')" class="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                  <button
                    @click.prevent.stop="addToWishlist(p)"
                    :aria-label="isFav(p.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                    class="w-8 h-8 rounded-full border flex items-center justify-center transition-colors"
                    :class="isFav(p.id) ? 'border-[#e60012] text-[#e60012] bg-red-50' : 'border-gray-200 text-gray-400 hover:text-[#e60012] hover:border-[#e60012]'">
                    <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Pagination -->
        <div v-if="meta.last_page > 1" class="flex justify-center pt-6 mb-7">
          <UPagination v-model:page="currentPage" :items-per-page="meta.per_page" :total="meta.total" show-edges @update:page="setPage" />
        </div>

        <!-- ═══ PROMOS MOBILE ═══ -->
        <section class="lg:hidden py-8" aria-label="Promotions">
          <div class="flex items-center justify-between border-b border-[#e60012] mb-4">
            <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">En promotion</h2>
            <NuxtLink to="/boutique?promo=1" class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group pb-2">
              Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
            </NuxtLink>
          </div>

          <div v-if="loadingPromos" class="space-y-2">
            <div v-for="n in 3" :key="n" class="flex gap-2 animate-pulse">
              <div class="w-16 h-16 bg-gray-100 rounded-sm flex-shrink-0"></div>
              <div class="flex-1 space-y-1.5 py-1">
                <div class="h-2.5 bg-gray-100 rounded w-full"></div>
                <div class="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          <div v-else-if="promoProducts.length === 0" class="flex flex-col items-center justify-center py-6 text-gray-300">
            <UIcon name="i-heroicons-sparkles" class="w-8 h-8 mb-1" />
            <p class="text-xs font-medium text-gray-400">Aucune promo disponible</p>
          </div>

          <UCarousel v-else v-slot="{ item: p }" :items="promoProducts" arrows dots
            :autoplay="{ delay: 3000 }" class="relative rounded-sm overflow-hidden"
            :prev="{ variant: 'solid', size: 'xs' }" :next="{ variant: 'solid', size: 'xs' }">
            <NuxtLink :to="goToProduit(p)"
              class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-lg w-full">
              <div class="relative h-56 w-full overflow-hidden flex items-center justify-center"
                @mouseenter="setHover(`mobile-promo:${p.id}`, true)"
                @mouseleave="setHover(`mobile-promo:${p.id}`, false)">
                <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">{{ discountPercent(p) }}</div>
                <div v-if="isOutOfStock(p)" class="absolute top-2 right-2 z-10 bg-gray-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">Rupture</div>
                <!-- ✅ lazy + decoding + dimensions -->
                <img
                  :src="imgSrc(p, 'mobile-promo')"
                  :alt="p.name"
                  loading="lazy"
                  decoding="async"
                  width="300"
                  height="300"
                  class="absolute inset-0 w-full h-full object-contain p-3 transition-all duration-500 group-hover:scale-105" />
              </div>
              <div class="p-3 flex flex-col gap-1 border-t border-gray-100">
                <span class="text-[10px] text-gray-400 font-bold tracking-widest truncate">{{ p.category?.name ?? '' }}</span>
                <h4 class="text-[13px] text-[#274a82] font-bold line-clamp-2 leading-snug group-hover:text-[#e60012] transition-colors min-h-[36px]">{{ p.name }}</h4>
                <div class="flex items-end gap-2 mt-1">
                  <span class="text-base font-black text-gray-900 leading-tight">{{ formatPrice(p.price) }} <span class="text-[9px] font-medium">FCFA</span></span>
                  <span v-if="p.old_price" class="text-[11px] text-[#e60012] line-through leading-tight">{{ formatPrice(p.old_price) }} FCFA</span>
                </div>
              </div>
            </NuxtLink>
          </UCarousel>
        </section>

        <!-- ═══ PRODUITS RÉCENTS ═══ -->
        <section v-if="recentProducts.length > 0 && !urlSearchQuery" class="hidden lg:block py-8" aria-label="Produits récents">
          <div class="flex items-center justify-between border-b border-gray-200 mb-6">
            <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Produits Récents</h2>
            <NuxtLink to="/nouveautes" class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group">
              Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
            </NuxtLink>
          </div>

          <div v-if="loadingRecent" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            <div v-for="n in 5" :key="n" class="bg-gray-50 rounded-sm animate-pulse">
              <div class="h-40 sm:h-48 bg-gray-100 rounded-sm"></div>
              <div class="p-2 space-y-2">
                <div class="h-3 bg-gray-100 rounded w-full"></div>
                <div class="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            <NuxtLink v-for="p in recentProducts" :key="'recent-' + p.id" :to="goToProduit(p)"
              class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl">
              <div class="relative h-40 sm:h-48 w-full overflow-hidden flex items-center justify-center bg-[#fcfcfc]"
                @mouseenter="setHover(`recent:${p.id}`, true)"
                @mouseleave="setHover(`recent:${p.id}`, false)">
                <div class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
                  <button
                    @click.prevent.stop="addToWishlist(p)"
                    :aria-label="isFav(p.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                    class="w-8 h-8 shadow-md rounded-full flex items-center justify-center transition-colors"
                    :class="isFav(p.id) ? 'bg-white text-[#e60012]' : 'bg-white text-gray-400 hover:text-white hover:bg-[#e60012]'">
                    <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" />
                  </button>
                </div>
                <!-- ✅ lazy + decoding + dimensions -->
                <img
                  :src="imgSrc(p, 'recent')"
                  :alt="p.name"
                  loading="lazy"
                  decoding="async"
                  width="200"
                  height="200"
                  class="w-full h-full object-contain p-2 transition-opacity duration-300" />
              </div>
              <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
                <h3 class="text-[12px] sm:text-[13px] text-gray-700 font-semibold mb-2 line-clamp-2 leading-snug group-hover:text-[#e60012]">{{ p.name }}</h3>
                <div class="mt-auto flex items-end justify-between gap-2">
                  <div>
                    <div class="text-sm sm:text-base font-black text-gray-900 leading-tight">{{ formatPrice(p.price) }} <span class="text-[9px]">FCFA</span></div>
                    <span v-if="p.old_price" class="text-[10px] text-gray-400 line-through">{{ formatPrice(p.old_price) }} FCFA</span>
                  </div>
                  <div v-if="discountPercent(p)" class="hidden sm:block bg-[#e60012] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex-shrink-0">{{ discountPercent(p) }}</div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </section>

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