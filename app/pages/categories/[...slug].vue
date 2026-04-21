<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import useCart from '@/composables/useCart'
import useWishlist from '~/composables/UseWishlist'

const route  = useRoute()
const config = useRuntimeConfig()
const API    = config.public.apiBase

// ── Slug params ───────────────────────────────────────────────────────────────
const slugParams = computed(() => {
  const s = route.params.slug
  return Array.isArray(s) ? s : [s]
})
const parentSlug = computed(() => slugParams.value[0] ?? '')
const childSlug  = computed(() => slugParams.value[1] ?? null)
const activeSlug = computed(() => childSlug.value ?? parentSlug.value)

// ── Format label ──────────────────────────────────────────────────────────────
const formatLabel = (text: string) => {
  if (!text) return ''
  return text.replace(/[_-]/g, ' ').split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const categoryName = computed(() => formatLabel(slugParams.value[slugParams.value.length - 1]))

// ── Breadcrumb ────────────────────────────────────────────────────────────────
const breadcrumbItems = computed(() => {
  const items: any[] = [{ label: 'Accueil', to: '/' }]
  let path = '/categories'
  slugParams.value.forEach((seg, i) => {
    path += `/${seg}`
    items.push({ label: formatLabel(seg), to: path, current: i === slugParams.value.length - 1 })
  })
  return items
})

// ── Info catégorie ────────────────────────────────────────────────────────────
interface CategoryInfo {
  id: number; name: string; slug: string; description: string | null; image: string | null
}
const categoryInfo    = ref<CategoryInfo | null>(null)
const loadingCatInfo  = ref(false)
const categoryDisplayName = computed(() => categoryInfo.value?.name ?? categoryName.value)
const categoryDesc        = computed(() => categoryInfo.value?.description ?? null)

const fetchCategoryInfo = async () => {
  loadingCatInfo.value = true
  try {
    const res = await $fetch<any>(`${API}/categories/${activeSlug.value}`)
    categoryInfo.value = res
    initFilterGroups()
  } catch {
    categoryInfo.value = null
  } finally {
    loadingCatInfo.value = false
  }
}

useHead({
  title: categoryName.value,
  titleTemplate: (t) => t ? `${t} - BRC Market` : 'BRC Market',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
})

// ── Filtres avancés ───────────────────────────────────────────────────────────
const ADVANCED_FILTER_SLUGS = ['ordinateurs', 'laptops', 'desktops', 'all-in-one', 'serveurs', 'workstations']

const showAdvancedFilters = computed(() => {
  const slugMatch =
    ADVANCED_FILTER_SLUGS.includes(activeSlug.value) ||
    ADVANCED_FILTER_SLUGS.includes(parentSlug.value)
  const catSlug       = categoryInfo.value?.slug ?? ''
  const parentCatSlug = (categoryInfo.value as any)?.parent?.slug ?? ''
  const apiMatch      = ADVANCED_FILTER_SLUGS.includes(catSlug) || ADVANCED_FILTER_SLUGS.includes(parentCatSlug)
  const result = slugMatch || apiMatch
  console.log('[filters] activeSlug:', activeSlug.value, '| parentSlug:', parentSlug.value, '| showAdvanced:', result)
  return result
})

// ── Types ─────────────────────────────────────────────────────────────────────
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
  specs?:           Record<string, string>
}
interface PaginationMeta {
  current_page: number; last_page: number; per_page: number; total: number
}

// ── État ──────────────────────────────────────────────────────────────────────
const products       = ref<Product[]>([])
const recentProducts = ref<Product[]>([])
const loadingRecent  = ref(false)
const meta           = ref<PaginationMeta>({ current_page: 1, last_page: 1, per_page: 24, total: 0 })
const loadingProds   = ref(false)
const currentPage    = ref(1)
const itemsPerPage   = 24
const viewMode       = ref<'grid' | 'grid-small' | 'list' | 'list-compact'>('grid')
const isMobileFilterOpen = ref(false)

// ── Filtres ───────────────────────────────────────────────────────────────────
const expandedGroups = ref<Record<string, boolean>>({})
const toggleExpand   = (k: string) => { expandedGroups.value[k] = !expandedGroups.value[k] }

// ── FIX prix max : 3 000 000 CFA ─────────────────────────────────────────────
const PRICE_MAX_DEFAULT = 3000000
const priceMax  = ref(PRICE_MAX_DEFAULT)
const priceRange = ref([0, PRICE_MAX_DEFAULT])

const filterGroups     = ref<Record<string, Record<string, number>>>({})
const baseFilterGroups = ref<Record<string, Record<string, number>>>({})
const appliedFilters   = ref<Record<string, string | null>>({})

const activeFilterCount = computed(() => Object.values(appliedFilters.value).filter(Boolean).length)

const FIXED_FILTER_DEFS: Record<string, string[]> = {
  'Ram':        ['4 Go', '8 Go', '16 Go', '24 Go', '32 Go'],
  'Stockage':   ['128 Go SSD', '256 Go SSD', '512 Go SSD', '1 TB SSD', '500 Go HDD', '1 TB HDD'],
  'Processeur': ['Dual Core', 'Core i3', 'Core i5', 'Core i7', 'Core i9'],
  'Generation': ['4ieme Gen', '5ieme Gen', '6ieme Gen', '7ieme Gen', '8ieme Gen',
                 '9ieme Gen', '10ieme Gen', '11ieme Gen', '12ieme Gen', '13ieme Gen', '14ieme Gen'],
  'Etat':       ['Neuf', 'Occasion'],
}

const initFilterGroups = () => {
  if (!showAdvancedFilters.value) return
  const groups: Record<string, Record<string, number>> = {}
  groups['Marques'] = {}
  Object.entries(FIXED_FILTER_DEFS).forEach(([label, opts]) => {
    groups[label] = {}
    opts.forEach(opt => { groups[label][opt] = 0 })
  })
  filterGroups.value     = groups
  baseFilterGroups.value = {}
  Object.keys(groups).forEach(k => { if (!(k in appliedFilters.value)) appliedFilters.value[k] = null })
}

// ── FIX matching : comparaison EXACTE uniquement ──────────────────────────────
// L'ancien code utilisait .includes() ce qui faisait matcher '128gossd' dans '256gossd'
// car les deux contiennent 'ssd'. On passe en égalité stricte normalisée.
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

const buildFiltersFromProducts = (prods: Product[], isFilteredFetch = false) => {
  if (!showAdvancedFilters.value) {
    filterGroups.value = {}
    return
  }

  const extractVal = (rawVal: any): string => {
    if (rawVal === null || rawVal === undefined) return ''
    if (typeof rawVal === 'object')
      return String(rawVal.value ?? rawVal.name ?? rawVal.label ?? rawVal.val ?? '')
    return String(rawVal)
  }

  const groups: Record<string, Record<string, number>> = {}
  groups['Marques'] = {}
  Object.entries(FIXED_FILTER_DEFS).forEach(([label, opts]) => {
    groups[label] = {}
    opts.forEach(opt => { groups[label][opt] = 0 })
  })

  if (!prods.length) {
    if (!isFilteredFetch) {
      filterGroups.value     = groups
      baseFilterGroups.value = groups
    } else {
      filterGroups.value = JSON.parse(JSON.stringify(baseFilterGroups.value || groups))
    }
    Object.keys(filterGroups.value).forEach(k => { if (!(k in appliedFilters.value)) appliedFilters.value[k] = null })
    return
  }

  const productSpecsList: Array<{ brand: string | null; specPairs: Array<[string, string]> }> = []

  prods.forEach(p => {
    const seen = new Set<string>()
    const specPairs: Array<[string, string]> = []

    const add = (key: string, rawVal: any) => {
      const val = extractVal(rawVal)
      if (!val || val === '[object Object]') return
      const label = key.charAt(0).toUpperCase() + key.slice(1)
      const pairKey = label + '::' + val
      if (seen.has(pairKey)) return
      seen.add(pairKey)
      specPairs.push([label, val])
    }

    const specs = (p as any).specs ?? (p as any).attributes ?? (p as any).specifications
    if (specs) {
      if (Array.isArray(specs)) {
        specs.forEach((item: any) => {
          if (!item || typeof item !== 'object') return
          const key = item.name ?? item.key ?? item.attribute ?? item.label
          const val = item.value ?? item.val
          if (key) add(String(key), val)
        })
      } else if (typeof specs === 'object') {
        Object.entries(specs).forEach(([k, v]) => add(k, v))
      }
    }
    productSpecsList.push({ brand: p.brand ?? null, specPairs })
  })

  // Marques
  productSpecsList.forEach(({ brand }) => {
    if (brand) groups['Marques'][brand] = (groups['Marques'][brand] ?? 0) + 1
  })

  // ── FIX : matching EXACT normalisé (plus de .includes()) ─────────────────
  Object.entries(FIXED_FILTER_DEFS).forEach(([filterLabel, options]) => {
    options.forEach(opt => {
      const normOpt = normalize(opt)
      let count = 0
      productSpecsList.forEach(({ specPairs }) => {
        // On cherche une spec dont la clé correspond au filterLabel
        // ET dont la valeur normalisée est EXACTEMENT égale à normOpt
        const matches = specPairs.some(([specKey, specVal]) => {
          const normKey = normalize(specKey)
          const normVal = normalize(specVal)
          const normLabel = normalize(filterLabel)
          return normKey === normLabel && normVal === normOpt
        })
        if (matches) count++
      })
      groups[filterLabel][opt] = count
    })
  })

  if (!isFilteredFetch) {
    filterGroups.value     = groups
    baseFilterGroups.value = JSON.parse(JSON.stringify(groups))
  } else {
    filterGroups.value = JSON.parse(JSON.stringify(baseFilterGroups.value || groups))
  }

  Object.keys(filterGroups.value).forEach(k => { if (!(k in appliedFilters.value)) appliedFilters.value[k] = null })
}

// ── Tri ───────────────────────────────────────────────────────────────────────
const sortBy = ref('Le plus récent')
const sortParam = computed(() => {
  switch (sortBy.value) {
    case 'Par tarif croissant':   return 'price_asc'
    case 'Par tarif decroissant': return 'price_desc'
    case 'Par popularité':        return 'popular'
    default:                      return 'latest'
  }
})

// ── Fetch produits ────────────────────────────────────────────────────────────
const fetchProducts = async (resetPage = false) => {
  if (resetPage) currentPage.value = 1
  loadingProds.value = true

  const hasActiveFilters = Object.values(appliedFilters.value).some(Boolean)
    || priceRange.value[0] > 0
    || priceRange.value[1] < priceMax.value

  try {
    const params: Record<string, any> = {
      page:     currentPage.value,
      per_page: itemsPerPage,
      sort:     sortParam.value,
    }
    if (priceRange.value[0] > 0)              params.min_price = priceRange.value[0]
    if (priceRange.value[1] < priceMax.value) params.max_price = priceRange.value[1]
    if (appliedFilters.value['Marques'])       params.brand     = appliedFilters.value['Marques']

    Object.entries(appliedFilters.value).forEach(([k, v]) => {
      if (!v || k === 'Marques') return
      const paramKey = `spec_${k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_')}`
      params[paramKey] = v
    })

    const res = await $fetch<any>(`${API}/categories/${activeSlug.value}/products`, { params })
    const list: Product[] = res.data ?? res
    products.value = list
    meta.value = {
      current_page: res.meta?.current_page ?? currentPage.value,
      last_page:    res.meta?.last_page    ?? Math.ceil((res.total ?? list.length) / itemsPerPage),
      per_page:     res.meta?.per_page     ?? itemsPerPage,
      total:        res.meta?.total        ?? res.total ?? list.length,
    }
    if (currentPage.value === 1) {
      buildFiltersFromProducts(list, hasActiveFilters)
      if (!hasActiveFilters && list.length) {
        const maxP = Math.max(...list.map(p => p.price))
        // Prix max dynamique plafonné à PRICE_MAX_DEFAULT
        priceMax.value = Math.min(
          Math.ceil(maxP / 100000) * 100000 + 100000,
          PRICE_MAX_DEFAULT
        )
        if (priceRange.value[1] === PRICE_MAX_DEFAULT) priceRange.value[1] = priceMax.value
      }
    }
  } catch (err: any) {
    console.error('[category] fetch error:', err?.message ?? err)
    products.value = []
  } finally {
    loadingProds.value = false
  }
}

const fetchRecentProducts = async () => {
  loadingRecent.value = true
  try {
    const data = await $fetch<any>(`${API}/products`, { params: { per_page: 5, sort: 'latest' } })
    recentProducts.value = data.data ?? []
  } catch (err: any) {
    console.error('[recentProducts] fetch error:', err?.message)
    recentProducts.value = []
  } finally {
    loadingRecent.value = false
  }
}

// ── Sélectionner / désélectionner un filtre → fetch immédiat ─────────────────
const selectFilter = (groupKey: string, opt: string) => {
  appliedFilters.value[groupKey] = appliedFilters.value[groupKey] === opt ? null : opt
  currentPage.value = 1
  fetchProducts(true)
  isMobileFilterOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Watchers ──────────────────────────────────────────────────────────────────
const loadPage = async () => {
  products.value         = []
  appliedFilters.value   = {}
  priceRange.value       = [0, PRICE_MAX_DEFAULT]
  priceMax.value         = PRICE_MAX_DEFAULT
  currentPage.value      = 1
  baseFilterGroups.value = {}
  initFilterGroups()
  fetchCategoryInfo()
  await fetchProducts()
  fetchRecentProducts()
}

watch(() => route.params.slug, () => { loadPage() })
watch(sortBy, () => fetchProducts(true))
watch(currentPage, () => { fetchProducts(); window.scrollTo({ top: 0, behavior: 'smooth' }) })

let priceTimer: ReturnType<typeof setTimeout> | null = null
watch(priceRange, () => {
  if (priceTimer) clearTimeout(priceTimer)
  priceTimer = setTimeout(() => { fetchProducts(true) }, 400)
})

// ── Reset ─────────────────────────────────────────────────────────────────────
const resetFilters = () => {
  Object.keys(appliedFilters.value).forEach(k => appliedFilters.value[k] = null)
  priceRange.value = [0, priceMax.value]
  currentPage.value = 1
  fetchProducts(true)
}

const setPage = (page: number) => { currentPage.value = page; window.scrollTo({ top: 0, behavior: 'smooth' }) }

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatPrice     = (p: number) => new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(p)
const isOutOfStock    = (p: Product) => p.status === 'out_of_stock' || p.stock === 0
const goToProduit     = (p: Product) => p.slug ? `/products/${p.slug}` : `/products/${p.id}`

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
const getImage      = (p: Product) => p.images?.[0] ?? '/images/placeholder.jpg'
const getImageHover = (p: Product) => p.images?.[1] ?? p.images?.[0] ?? '/images/placeholder.jpg'
const imgSrc        = (p: Product, section: string) =>
  hoveredKeys.value.has(`${section}:${p.id}`) ? getImageHover(p) : getImage(p)

// ── Panier & Wishlist ─────────────────────────────────────────────────────────
const { addToCart: addToCartStore }            = useCart()
const { isFav, toggleWishlist, initWishlist }  = useWishlist()

const addToCart = (p: Product) => {
  if (isOutOfStock(p)) return
  addToCartStore({ id: p.id, slug: p.slug, name: p.name, price: p.price, image: getImage(p) })
}
const addToWishlist = (p: Product) => toggleWishlist(p.id, p.name)

onMounted(() => {
  initWishlist()
  loadPage()
})

// ── Promos & Services ─────────────────────────────────────────────────────────
const promoFlyers = [
  { image: '/images/offres/offre_special_dell_5510.png' },
  { image: '/images/offres/offre_flash_all_in_one.png',},
 
]

// const expandedServices = ref<Record<string, boolean>>({
//   maintenance: false, imprimantes: false, integration: false, securite: false, support: false,
// })
// const toggleService = (k: string) => { expandedServices.value[k] = !expandedServices.value[k] }

// const servicesList = [
//   { key: 'maintenance', icon: 'i-heroicons-wrench-screwdriver', label: 'Maintenance & Réparation',
//     links: [{ label: 'Laptops', to: '/services/maintenance/laptops' }, { label: 'Desktops', to: '/services/maintenance/desktops' }, { label: 'Serveurs', to: '/services/maintenance/serveurs' }] },
//   { key: 'imprimantes', icon: 'i-heroicons-printer',            label: 'Imprimantes & Accessoires',
//     links: [{ label: 'Toners & Encres', to: '/services/accessoires/toners' }, { label: 'Câblage & Réseau', to: '/services/accessoires/reseau' }, { label: 'Périphériques', to: '/services/accessoires/peripheriques' }] },
//   { key: 'integration', icon: 'i-heroicons-server-stack',       label: 'Intégration IT',
//     links: [{ label: 'Mise en réseau', to: '/services/integration/reseau' }, { label: 'Déploiement de parcs', to: '/services/integration/parcs' }, { label: 'Cloud & Serveurs', to: '/services/integration/cloud' }] },
//   { key: 'securite',   icon: 'i-heroicons-shield-check',        label: 'Sécurité Informatique',
//     links: [{ label: 'Vidéosurveillance', to: '/services/securite/cameras' }, { label: 'Solutions Antivirus', to: '/services/securite/antivirus' }, { label: "Contrôle d'accès", to: '/services/securite/controle-acces' }] },
//   { key: 'support',    icon: 'i-heroicons-chat-bubble-left-right', label: 'Support Technique',
//     links: [{ label: 'Assistance Hotline', to: '/contact' }, { label: 'Maintenance à distance', to: '/contact' }] },
// ]
</script>

<template>
  <UContainer class="py-8 bg-white">

    <!-- BREADCRUMB -->
    <nav class="hidden sm:flex items-center gap-2 text-[14px] mb-5 text-gray-500 font-medium border-b border-gray-50 pb-2 overflow-x-auto">
      <template v-for="(item, index) in breadcrumbItems" :key="index">
        <NuxtLink :to="item.to" class="flex items-center gap-1 transition-colors hover:text-[#e60012] whitespace-nowrap"
          :class="item.current ? 'text-[#274a82] font-bold pointer-events-none' : ''">
         
          {{ item.label }}
        </NuxtLink>
        <UIcon v-if="index < breadcrumbItems.length - 1" name="i-heroicons-chevron-right" class="w-3 h-3 text-gray-300 flex-shrink-0" />
      </template>
    </nav>

    <!-- BOUTON FILTRE MOBILE + TRI -->
    <div class="flex lg:hidden items-center justify-between mb-4 gap-3">
      <button @click="isMobileFilterOpen = true"
        class="flex items-center gap-2 px-4 py-2.5 bg-[#274a82] text-white rounded-sm text-sm font-bold shadow-sm">
        <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4" />
        Filtres
        <span v-if="activeFilterCount > 0" class="bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{{ activeFilterCount }}</span>
      </button>
      <USelectMenu v-model="sortBy" :items="['Le plus récent','Par popularité','Par tarif croissant','Par tarif decroissant']" class="flex-1" />
    </div>

    <!-- ===== DRAWER FILTRE MOBILE ===== -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="isMobileFilterOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="isMobileFilterOpen = false" />
      </Transition>
      <Transition name="slide-up">
        <div v-if="isMobileFilterOpen" class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl lg:hidden flex flex-col" style="max-height: 90dvh;">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-adjustments-horizontal" class="w-5 h-5 text-[#274a82]" />
              <span class="font-bold text-gray-900">Filtres</span>
              <span v-if="activeFilterCount > 0" class="text-xs text-[#274a82] font-bold">({{ activeFilterCount }} actif{{ activeFilterCount > 1 ? 's' : '' }})</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetFilters" class="text-xs text-[#e60012] font-bold hover:underline">Tout effacer</button>
              <button @click="isMobileFilterOpen = false" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div class="overflow-y-auto flex-1 px-4 py-3 space-y-1">
            <template v-if="showAdvancedFilters">
              <div v-for="(options, key) in filterGroups" :key="key" class="border-b border-gray-50 pb-3">
                <button @click="toggleExpand(key as string)" class="w-full flex items-center justify-between py-2">
                  <span class="text-sm font-bold text-gray-800">{{ key }}</span>
                  <div class="flex items-center gap-2">
                    <span v-if="appliedFilters[key as string]" class="text-[10px] bg-[#274a82]/10 text-[#274a82] font-bold px-2 py-0.5 rounded-full">{{ appliedFilters[key as string] }}</span>
                    <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': expandedGroups[key as string] }" />
                  </div>
                </button>
                <div v-if="expandedGroups[key as string]" class="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    v-for="(count, opt) in options" :key="opt"
                    @click="selectFilter(key as string, opt as string)"
                    class="flex items-center gap-2 px-3 py-2 rounded-sm border cursor-pointer transition-all text-xs font-medium text-left"
                    :class="appliedFilters[key as string] === opt
                      ? 'border-[#274a82] bg-[#274a82]/5 text-[#274a82]'
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300'"
                  >
                    <span class="flex-1">{{ opt }}</span>
                    <span class="text-[10px] text-gray-400">({{ count }})</span>
                    <UIcon v-if="appliedFilters[key as string] === opt" name="i-heroicons-check" class="w-3.5 h-3.5 text-[#274a82] flex-shrink-0" />
                  </button>
                </div>
              </div>
            </template>
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

    <!-- ===== LAYOUT PRINCIPAL ===== -->
    <div class="grid grid-cols-12 gap-8">

      <!-- SIDEBAR DESKTOP -->
      <aside class="hidden lg:block col-span-3 space-y-8 flex-shrink-0">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl text-gray-800 my-1">Filtres</h2>
          <button v-if="activeFilterCount > 0" @click="resetFilters"
            class="text-xs text-[#e60012] font-bold hover:underline">
            Tout effacer
          </button>
        </div>
        <hr class="border-[#e60012] -mt-6" />

        <template v-if="showAdvancedFilters">
          <div v-for="(options, key) in filterGroups" :key="key" class="border-b border-gray-100 pb-4">
            <h3 class="text-[14px] font-extrabold text-gray-500 tracking-widest mb-2.5">{{ key }}</h3>
            <div class="flex flex-wrap gap-1.5">
              <template v-for="(count, opt, index) in options" :key="opt">
                <button
                  v-if="index < 6 || expandedGroups[key as string]"
                  @click="selectFilter(key as string, opt as string)"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all select-none cursor-pointer"
                  :class="appliedFilters[key as string] === opt
                    ? 'bg-[#274a82] border-[#274a82] text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#274a82] hover:text-[#274a82]'"
                >
                  {{ opt }} <span class="opacity-60 text-[10px]">({{ count }})</span>
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

        <!-- Nos Promos -->
        <div>
          <h3 class="text-sm font-bold text-gray-900 tracking-wider border-b border-[#e60012] mb-4">Nos Promos</h3>
          <UCarousel v-slot="{ item }" :items="promoFlyers" arrows dots :autoplay="{ delay: 2000 }"
            class="relative h-full rounded-sm overflow-hidden shadow-sm" :prev="{ variant: 'solid' }" :next="{ variant: 'solid' }" :ui="{ prev: 'sm:start-2', next: 'sm:end-2' }">
            <div class="relative overflow-hidden aspect-[4/5]">
              <img :src="item.image" class="w-full h-full object-cover" draggable="false" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </UCarousel>
        </div>

        <!-- Nos Meilleur Produits -->
        <div>
          <h3 class="text-sm font-bold text-gray-900 tracking-wider border-b border-[#e60012] mb-4">Nos Meilleur Produits</h3>
          <UCarousel v-slot="{ item }" :items="promoFlyers" arrows dots :autoplay="{ delay: 3000 }"
            class="relative h-full rounded-sm overflow-hidden shadow-sm" :prev="{ variant: 'solid' }" :next="{ variant: 'solid' }" :ui="{ prev: 'sm:start-2', next: 'sm:end-2' }">
            <div class="relative overflow-hidden aspect-[4/5]">
              <img :src="item.image" class="w-full h-full object-cover" draggable="false" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </UCarousel>
        </div>

        <!-- Nos Expertises -->
        <!-- <div>
          <h3 class="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-3">Nos Expertises</h3>
          <div class="rounded-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
            <div v-for="service in servicesList" :key="service.key">
              <button @click="toggleService(service.key)"
                class="w-full flex items-center justify-between px-3 py-2.5 bg-white hover:bg-gray-50 transition-colors group">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-sm bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <UIcon :name="service.icon" class="w-3.5 h-3.5" :class="service.color" />
                  </div>
                  <span class="text-[12px] font-bold text-gray-800 text-left leading-tight">{{ service.label }}</span>
                </div>
                <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5 text-gray-300 transition-transform duration-200 flex-shrink-0" :class="expandedServices[service.key] ? 'rotate-90' : ''" />
              </button>
              <div v-show="expandedServices[service.key]" class="bg-gray-50/50 border-t border-gray-50 px-10 py-2 space-y-2">
                <NuxtLink v-for="link in service.links" :key="link.label" :to="link.to" class="block text-[12px] text-gray-600 hover:text-[#e60012] transition-colors">{{ link.label }}</NuxtLink>
              </div>
            </div>
          </div>
        </div> -->
      </aside>

      <!-- MAIN -->
      <main class="col-span-12 lg:col-span-9">
        <h1 class="text-2xl font-medium text-gray-700 tracking-tighter pb-2">{{ categoryDisplayName }}</h1>
        <p v-if="categoryDesc" class="text-sm text-gray-500 mb-4 leading-relaxed">{{ categoryDesc }}</p>

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
              <span v-if="loadingProds">Chargement...</span>
              <template v-else>
                Affichage de <span class="text-gray-900 font-bold">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span>–<span class="text-gray-900 font-bold">{{ Math.min(currentPage * itemsPerPage, meta.total) }}</span> sur <span class="text-gray-900 font-bold">{{ meta.total }}</span> résultats
              </template>
            </span>
            <div class="hidden lg:block">
              <USelectMenu v-model="sortBy" :items="['Le plus récent','Par popularité','Par tarif croissant','Par tarif decroissant']"
                class="min-w-48" :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }" />
            </div>
          </div>
        </div>

        <!-- Filtres actifs (chips) -->
        <div v-if="activeFilterCount > 0" class="flex flex-wrap gap-2 mb-4">
          <template v-for="(val, key) in appliedFilters" :key="key">
            <span v-if="val"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#274a82]/10 text-[#274a82] text-xs font-bold">
              {{ key }} : {{ val }}
              <button @click="selectFilter(key as string, val as string)" class="hover:text-[#e60012] transition-colors">
                <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
              </button>
            </span>
          </template>
          <button @click="resetFilters" class="text-xs text-[#e60012] font-bold hover:underline">
            Tout effacer
          </button>
        </div>

        <!-- Loader -->
        <div v-if="loadingProds" class="flex justify-center items-center py-24">
          <div class="flex flex-col items-center gap-3">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-[#274a82]" />
            <span class="text-sm font-medium text-gray-400">Chargement des produits...</span>
          </div>
        </div>

        <!-- Aucun résultat -->
        <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center py-24 text-gray-400">
          <UIcon name="i-heroicons-face-frown" class="w-12 h-12 mb-3 text-gray-300" />
          <p class="text-base font-semibold text-gray-500">Aucun produit trouvé</p>
          <UButton @click="resetFilters" variant="outline" color="gray" class="mt-4 font-bold" size="sm">Réinitialiser les filtres</UButton>
        </div>

        <!-- ═══ GRILLE PRODUITS ═══ -->
        <div v-else :class="{
          'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3': viewMode === 'grid',
          'grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2': viewMode === 'grid-small',
          'flex flex-col gap-3': viewMode === 'list',
          'flex flex-col gap-1': viewMode === 'list-compact',
        }">
          <NuxtLink
            v-for="p in products" :key="p.id"
            :to="goToProduit(p)"
            :class="viewMode.startsWith('grid')
              ? 'group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl'
              : 'group relative rounded-sm bg-white border border-gray-100 flex flex-row items-center gap-3 p-3 transition-all hover:shadow-md'"
          >
            <div :class="{
              'relative w-full h-44 sm:h-52': viewMode === 'grid',
              'relative w-full h-32 sm:h-40': viewMode === 'grid-small',
              'relative h-28 w-28 sm:h-36 sm:w-36 flex-shrink-0': viewMode === 'list',
              'relative h-16 w-16 flex-shrink-0': viewMode === 'list-compact',
            }" class="overflow-hidden flex items-center justify-center bg-[#fcfcfc] rounded-sm"
              @mouseenter="setHover(`grid:${p.id}`, true)"
              @mouseleave="setHover(`grid:${p.id}`, false)">

              <div v-if="discountPercent(p)" class="absolute bottom-2 left-2 bg-[#e60012] text-white text-[9px] font-black px-2 py-0.5 rounded-sm z-10">{{ discountPercent(p) }}</div>
              <div v-if="isOutOfStock(p)" class="absolute top-2 left-2 bg-gray-500 text-white text-[9px] font-black px-2 py-0.5 rounded-sm z-10">Rupture</div>
              <div v-else-if="(p as any).stock > 0 && (p as any).stock <= 5" class="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-sm z-10">Plus que {{ (p as any).stock }}</div>

              <div v-if="viewMode.startsWith('grid')" class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
                <button @click.prevent.stop="addToWishlist(p)"
                  class="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
                  :class="isFav(p.id) ? 'bg-[#e60012] text-[#e60012]' : 'text-gray-400 hover:bg-[#e60012] hover:text-white'">
                  <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" />
                </button>
                
              </div>

              <img :src="imgSrc(p, 'grid')" class="absolute inset-0 w-full h-full object-contain p-2 transition-opacity duration-300" :alt="p.name" />

              <div v-if="viewMode.startsWith('grid')" class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full transition-all duration-300 z-20">
                <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)"
                  class="w-full flex items-center justify-center gap-2 bg-[#274a82] hover:bg-[#e60012] text-white font-bold text-[12px] py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
                  {{ isOutOfStock(p) ? 'Rupture de stock' : 'Ajouter au Panier' }}
                </button>
              </div>
            </div>

            <div class="flex flex-col flex-1 min-w-0" :class="viewMode.startsWith('grid') ? 'p-2 sm:p-3' : ''">
              <span class="text-[10px] sm:text-[11px] text-gray-400 font-bold tracking-widest truncate">{{ (p as any).category?.name ?? '' }}</span>
              <h3 class="font-bold leading-snug group-hover:text-[#e60012] transition-colors truncate sm:whitespace-normal"
                :class="{
                  'text-[13px] sm:text-[14px] text-[#274a82] line-clamp-2 mt-0.5 mb-2 h-8 sm:h-10': viewMode === 'grid',
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
                  <button @click.prevent.stop="addToWishlist(p)"
                    class="w-8 h-8 rounded-full border flex items-center justify-center transition-colors"
                    :class="isFav(p.id) ? 'border-[#e60012] text-[#e60012] bg-red-50' : 'border-gray-200 text-gray-400 hover:text-[#e60012] hover:border-[#e60012]'">
                    <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" />
                  </button>
                  
                  <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)"
                    class="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#274a82] hover:bg-[#e60012] text-white text-[11px] font-bold transition-colors disabled:opacity-40">
                    <UIcon name="i-heroicons-shopping-cart" class="w-3.5 h-3.5" />
                    <span class="hidden md:inline">Ajouter</span>
                  </button>
                </div>

                <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)"
                  class="sm:hidden flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-all disabled:opacity-40"
                  :class="isOutOfStock(p) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#274a82] hover:bg-[#e60012]'">
                  <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Pagination -->
        <div v-if="meta.last_page > 1" class="flex justify-center pt-6 mb-12">
          <UPagination v-model:page="currentPage" :items-per-page="meta.per_page" :total="meta.total" show-edges @update:page="setPage" />
        </div>

        <!-- ═══ PRODUITS RÉCENTS ═══ -->
        <section v-if="recentProducts.length > 0" class="py-8">
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
            <NuxtLink
              v-for="p in recentProducts" :key="'recent-' + p.id"
              :to="goToProduit(p)"
              class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl"
            >
              <div class="relative h-40 sm:h-48 w-full overflow-hidden flex items-center justify-center bg-[#fcfcfc]"
                @mouseenter="setHover(`recent:${p.id}`, true)"
                @mouseleave="setHover(`recent:${p.id}`, false)">
                <div class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
                 <button
                    @click.prevent.stop="addToWishlist(p)"
                    class="w-8 h-8 shadow-md rounded-full flex items-center justify-center transition-colors"
                    :class="isFav(p.id)
                      ? 'bg-white text-[#e60012]'
                      : 'bg-white text-gray-400 hover:text-white hover:bg-[#e60012]'"
                  >
                    <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" />
                  </button>
                </div>
                <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full transition-all duration-300 z-20">
                  <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)"
                    class="w-full flex items-center justify-center gap-2 bg-[#274a82] hover:bg-[#e60012] text-white font-bold text-[12px] py-2.5 transition-colors disabled:opacity-50">
                    <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
                    Ajouter au Panier
                  </button>
                </div>
                <img :src="imgSrc(p, 'recent')" class="w-full h-full object-contain p-2 transition-opacity duration-300" :alt="p.name" />
              </div>

              <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
                <h3 class="text-[12px] sm:text-[13px] text-gray-700 font-semibold mb-2 line-clamp-2 h-9 leading-snug group-hover:text-[#e60012]">{{ p.name }}</h3>
                <div class="mt-auto flex items-end justify-between gap-2">
                  <div>
                    <div class="text-sm sm:text-base font-black text-gray-900 leading-tight">{{ formatPrice(p.price) }} <span class="text-[9px]">FCFA</span></div>
                    <span v-if="p.old_price" class="text-[10px] text-gray-400 line-through">{{ formatPrice(p.old_price) }} FCFA</span>
                  </div>
                  <div v-if="discountPercent(p)" class="hidden sm:block bg-[#e60012] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex-shrink-0">{{ discountPercent(p) }}</div>
                  <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)"
                    class="sm:hidden flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-all disabled:opacity-40"
                    :class="isOutOfStock(p) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#274a82] hover:bg-[#e60012]'">
                    <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- MOBILE ONLY -->
        <div class="lg:hidden mt-10 space-y-8">
          <div>
            <h3 class="text-base font-bold text-gray-900 border-b-2 border-[#e60012] pb-1 mb-4 inline-block">Nos Promos</h3>
            <UCarousel v-slot="{ item }" :items="promoFlyers" arrows dots :autoplay="{ delay: 2000 }" class="relative rounded-sm overflow-hidden shadow-sm" :prev="{ variant: 'solid' }" :next="{ variant: 'solid' }">
              <div class="relative overflow-hidden aspect-[16/7]"><img :src="item.image" class="w-full h-full object-cover" draggable="false" /><div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div></div>
            </UCarousel>
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900 border-b-2 border-[#e60012] pb-1 mb-4 inline-block">Nos Meilleur Produits</h3>
            <UCarousel v-slot="{ item }" :items="promoFlyers" arrows dots :autoplay="{ delay: 3000 }" class="relative rounded-sm overflow-hidden shadow-sm" :prev="{ variant: 'solid' }" :next="{ variant: 'solid' }">
              <div class="relative overflow-hidden aspect-[16/7]"><img :src="item.image" class="w-full h-full object-cover" draggable="false" /><div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div></div>
            </UCarousel>
          </div>
          <!-- <div>
            <h3 class="text-base font-bold text-gray-900 border-b-2 border-[#e60012] pb-1 mb-4 inline-block">Nos Expertises</h3>
            <div class="space-y-2">
              <div v-for="service in servicesList" :key="service.key" class="border border-gray-100 rounded-sm bg-white overflow-hidden">
                <button @click="toggleService(service.key)" class="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                  <div class="flex items-center gap-3">
                    <UIcon :name="service.icon" class="w-4 h-4 text-[#274a82]" />
                    <span class="text-[13px] font-bold text-gray-800 tracking-tight text-left">{{ service.label }}</span>
                  </div>
                  <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 transition-transform duration-300" :class="expandedServices[service.key] ? 'rotate-180' : ''" />
                </button>
                <div v-show="expandedServices[service.key]" class="bg-gray-50/50 border-t border-gray-50 px-10 py-2 space-y-2">
                  <NuxtLink v-for="link in service.links" :key="link.label" :to="link.to" class="block text-[12px] text-gray-600 hover:text-[#e60012] transition-colors">{{ link.label }}</NuxtLink>
                </div>
              </div>
            </div>
          </div> -->
        </div>

      </main>
    </div>
  </UContainer>
</template>

<style scoped>
:deep(.u-checkbox-label) { font-size: 11px; color: #666; font-weight: 500; cursor: pointer; }
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.25s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1); }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
</style>