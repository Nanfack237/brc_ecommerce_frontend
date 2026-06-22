<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import useCart from '@/composables/useCart'
import useWishlist from '~/composables/UseWishlist'

const { t } = useI18n()
const route  = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const API    = config.public.apiBase

// ══════════════════════════════════════════════════════════════════════════
// NORMALISATION SLUG
// ══════════════════════════════════════════════════════════════════════════

const normalizeSlugSegment = (seg: string) =>
  seg.trim().toLowerCase().replace(/\/+$/, '').replace(/\/+/g, '')

// ══════════════════════════════════════════════════════════════════════════
// SLUG PARAMS
// ══════════════════════════════════════════════════════════════════════════

const slugParams = computed(() => {
  const s = route.params.slug
  const arr = Array.isArray(s) ? s : [s]
  return arr.map(normalizeSlugSegment).filter(Boolean)
})

const parentSlug = computed(() => slugParams.value[0] ?? '')
const childSlug  = computed(() => slugParams.value[1] ?? null)

const activeSlug = computed(() => {
  const slug = childSlug.value ?? parentSlug.value
  return normalizeSlugSegment(slug ?? '')
})

const formatLabel = (text: string) => {
  if (!text) return ''
  return text.replace(/[_-]/g, ' ').split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const categoryName = computed(() => formatLabel(slugParams.value[slugParams.value.length - 1] ?? ''))

// ══════════════════════════════════════════════════════════════════════════
// BREADCRUMB
// ══════════════════════════════════════════════════════════════════════════

const breadcrumbItems = computed(() => {
  const items: any[] = [{ label: t('category.breadcrumb_home', 'Accueil'), to: '/' }]
  let path = '/categories'
  slugParams.value.forEach((seg, i) => {
    path += `/${seg}`
    items.push({ label: formatLabel(seg), to: path, current: i === slugParams.value.length - 1 })
  })
  return items
})

// ══════════════════════════════════════════════════════════════════════════
// INFO CATÉGORIE — SSR via useAsyncData
// ══════════════════════════════════════════════════════════════════════════

interface CategoryInfo {
  id: number; name: string; slug: string; description: string | null; image: string | null
}

const categoryInfo        = ref<CategoryInfo | null>(null)
const loadingCatInfo      = ref(false)
const categoryDisplayName = computed(() => categoryInfo.value?.name ?? categoryName.value)
const categoryDesc        = computed(() => categoryInfo.value?.description ?? null)

// ✅ SSR bloquant : Google reçoit le nom + description dès le premier rendu
const { data: categoryData, refresh: refreshCategoryInfo } = await useAsyncData(
  () => `category-${activeSlug.value}`,
  () => $fetch<CategoryInfo>(`${API}/categories/${activeSlug.value}`),
)

// Initialisation immédiate depuis le fetch SSR
categoryInfo.value = categoryData.value ?? null

// ══════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════

interface Product {
  id:               number
  name:             string
  slug:             string
  brand:            string | null
  description:      string | null
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

// ══════════════════════════════════════════════════════════════════════════
// ÉTAT
// ══════════════════════════════════════════════════════════════════════════

const products           = ref<Product[]>([])
const recentProducts     = ref<Product[]>([])
const promoProducts      = ref<Product[]>([])
const loadingRecent      = ref(false)
const loadingPromos      = ref(false)
const meta               = ref<PaginationMeta>({ current_page: 1, last_page: 1, per_page: 24, total: 0 })
const loadingProds       = ref(false)
const currentPage        = ref(1)
const itemsPerPage       = 24
const viewMode           = ref<'grid' | 'grid-small' | 'list' | 'list-compact'>('grid')
const isMobileFilterOpen = ref(false)

// ══════════════════════════════════════════════════════════════════════════
// SEO DYNAMIQUE
// ══════════════════════════════════════════════════════════════════════════

const setSeo = () => {
  const name  = categoryInfo.value?.name ?? categoryName.value
  const desc  = categoryInfo.value?.description
    ?? `Découvrez tous nos produits ${name} au meilleur prix au Cameroun. Livraison rapide à Douala et Yaoundé.`
  const image = categoryInfo.value?.image ?? 'https://brcmarket.cm/images/og-image.jpg'
  const url   = `https://brcmarket.cm/categories/${activeSlug.value}`
  const title = `${name} - BRC Market`

  useSeoMeta({
    title,
    ogTitle:            title,
    description:        desc.slice(0, 155),
    ogDescription:      desc.slice(0, 155),
    ogImage:            image,
    ogUrl:              url,
    twitterTitle:       title,
    twitterDescription: desc.slice(0, 155),
    twitterImage:       image,
  })

  useHead({
    link: [{ rel: 'canonical', href: url }],
    script: [{
      type:      'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type':    'CollectionPage',
        name,
        description: desc.slice(0, 155),
        url,
        image,
        breadcrumb: {
          '@type':         'BreadcrumbList',
          itemListElement: breadcrumbItems.value.map((item, i) => ({
            '@type':  'ListItem',
            position: i + 1,
            name:     item.label,
            item:     `https://brcmarket.cm${item.to}`,
          })),
        },
        ...(products.value.length > 0 ? {
          mainEntity: {
            '@type':         'ItemList',
            numberOfItems:   meta.value.total,
            itemListElement: products.value.slice(0, 10).map((p, i) => ({
              '@type':    'ListItem',
              position:   i + 1,
              url:        `https://brcmarket.cm/products/${p.slug}`,
              name:       p.name,
              item: {
                '@type': 'Product',
                name:    p.name,
                url:     `https://brcmarket.cm/products/${p.slug}`,
                image:   p.images?.[0] ?? undefined,
                description: p.description ?? `${p.name}${p.brand ? ' - ' + p.brand : ''} disponible au Cameroun.`,
                brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
                // Si votre API a un champ référence/modèle, ajoutez-le ici :
                // mpn: p.model_reference,
                offers: {
                  '@type':         'Offer',
                  priceCurrency:   'XAF',
                  price:           p.price,
                  priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  availability:    p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                  itemCondition:   'https://schema.org/NewCondition',
                },
              },
            })),
          },
        } : {}),
      }),
    }],
  })
}

// ✅ SEO SSR immédiat dès le premier rendu (Google reçoit titre + description)
if (import.meta.server && categoryData.value) {
  setSeo()
} else if (import.meta.server && !categoryData.value) {
  // Fallback SSR si l'API échoue
  useHead({ title: `${categoryName.value} - BRC Market` })
  useSeoMeta({
    description: `Découvrez tous nos produits ${categoryName.value} au meilleur prix au Cameroun.`,
  })
}

// ══════════════════════════════════════════════════════════════════════════
// OPTIMISATION IMAGES CLOUDINARY
// ══════════════════════════════════════════════════════════════════════════

const optimizeCloudinary = (url: string, width = 400) => {
  if (!url || !url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`)
}

// ══════════════════════════════════════════════════════════════════════════
// FILTRES AVANCÉS
// ══════════════════════════════════════════════════════════════════════════

const ADVANCED_FILTER_SLUGS = ['ordinateurs', 'laptops', 'desktops', 'all-in-one', 'serveurs', 'workstations']

const showAdvancedFilters = computed(() => {
  const slugMatch =
    ADVANCED_FILTER_SLUGS.includes(activeSlug.value) ||
    ADVANCED_FILTER_SLUGS.includes(parentSlug.value)
  const catSlug       = categoryInfo.value?.slug ?? ''
  const parentCatSlug = (categoryInfo.value as any)?.parent?.slug ?? ''
  const apiMatch      = ADVANCED_FILTER_SLUGS.includes(catSlug) || ADVANCED_FILTER_SLUGS.includes(parentCatSlug)
  return slugMatch || apiMatch
})

// ══════════════════════════════════════════════════════════════════════════
// FILTRES
// ══════════════════════════════════════════════════════════════════════════

const expandedGroups = ref<Record<string, boolean>>({})
const toggleExpand   = (k: string) => { expandedGroups.value[k] = !expandedGroups.value[k] }

const PRICE_MAX_DEFAULT = 3000000
const priceMax   = ref(PRICE_MAX_DEFAULT)
const priceRange = ref([0, PRICE_MAX_DEFAULT])

const filterGroups   = ref<Record<string, Record<string, number>>>({})
const appliedFilters = ref<Record<string, string | null>>({})
const loadingCounts  = ref(false)

const activeFilterCount = computed(() => Object.values(appliedFilters.value).filter(Boolean).length)

const FIXED_FILTER_DEFS: Record<string, string[]> = {
  'Ram':        ['4 Go', '8 Go', '16 Go', '24 Go', '32 Go'],
  'Stockage':   ['128 Go SSD', '256 Go SSD', '512 Go SSD', '1 TB SSD', '500 Go HDD', '1 TB HDD'],
  'Processeur': ['Dual Core', 'Core i3', 'Core i5', 'Core i7', 'Core i9'],
  'Generation': ['4ieme Gen', '5ieme Gen', '6ieme Gen', '7ieme Gen', '8ieme Gen',
                 '9ieme Gen', '10ieme Gen', '11ieme Gen', '12ieme Gen', '13ieme Gen', '14ieme Gen'],
  'Etat':       ['Neuf', 'Occasion'],
}

const buildCountParams = (): Record<string, any> => {
  const p: Record<string, any> = {}
  if (appliedFilters.value['Marques'])      p.brand     = appliedFilters.value['Marques']
  if (priceRange.value[0] > 0)              p.min_price = priceRange.value[0]
  if (priceRange.value[1] < priceMax.value) p.max_price = priceRange.value[1]
  return p
}

const fetchFilterCounts = async () => {
  if (!activeSlug.value || !showAdvancedFilters.value) return
  loadingCounts.value = true
  try {
    const data = await $fetch<Record<string, Record<string, number>>>(
      `${API}/categories/${activeSlug.value}/filter-counts`,
      { params: buildCountParams() }
    )
    const groups: Record<string, Record<string, number>> = {}
    if (data['Marques'] && Object.keys(data['Marques']).length > 0) {
      groups['Marques'] = data['Marques']
    }
    Object.entries(FIXED_FILTER_DEFS).forEach(([label, opts]) => {
      groups[label] = {}
      opts.forEach(opt => { groups[label][opt] = data[label]?.[opt] ?? 0 })
    })
    filterGroups.value = groups
    Object.keys(groups).forEach(k => {
      if (!(k in appliedFilters.value)) appliedFilters.value[k] = null
    })
  } catch (e) {
    console.error('Erreur filter-counts catégorie:', e)
  } finally {
    loadingCounts.value = false
  }
}

// ══════════════════════════════════════════════════════════════════════════
// TRI
// ══════════════════════════════════════════════════════════════════════════

const SORT_OPTIONS = computed(() => [
  t('category.sort_recent'),
  t('category.sort_popular'),
  t('category.sort_price_asc'),
  t('category.sort_price_desc'),
])

const sortBy = ref(t('category.sort_recent'))
const sortParam = computed(() => {
  if (sortBy.value === t('category.sort_price_asc'))  return 'price_asc'
  if (sortBy.value === t('category.sort_price_desc')) return 'price_desc'
  if (sortBy.value === t('category.sort_popular'))    return 'popular'
  return 'latest'
})

// ══════════════════════════════════════════════════════════════════════════
// FETCH PRODUITS
// ══════════════════════════════════════════════════════════════════════════

const fetchProducts = async (resetPage = false) => {
  if (!activeSlug.value) return
  if (resetPage) currentPage.value = 1
  loadingProds.value = true
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

    const res  = await $fetch<any>(`${API}/categories/${activeSlug.value}/products`, { params })
    const list: Product[] = res.data ?? res

    products.value = list
    setSeo()
    meta.value = {
      current_page: res.meta?.current_page ?? res.current_page ?? currentPage.value,
      last_page:    res.meta?.last_page    ?? res.last_page    ?? Math.ceil((res.total ?? list.length) / itemsPerPage),
      per_page:     res.meta?.per_page     ?? res.per_page     ?? itemsPerPage,
      total:        res.meta?.total        ?? res.total        ?? list.length,
    }

    if (currentPage.value === 1 && !activeFilterCount.value && list.length) {
      const maxP = Math.max(...list.map(p => p.price))
      priceMax.value = Math.min(Math.ceil(maxP / 100000) * 100000 + 100000, PRICE_MAX_DEFAULT)
      if (priceRange.value[1] === PRICE_MAX_DEFAULT) priceRange.value[1] = priceMax.value
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
  } catch {
    recentProducts.value = []
  } finally {
    loadingRecent.value = false
  }
}

const fetchSidebarPromos = async () => {
  loadingPromos.value = true
  try {
    const data = await $fetch<any>(`${API}/products`, { params: { per_page: 6, is_promoted: 1, sort: 'latest' } })
    promoProducts.value = data.data ?? []
  } catch {
    promoProducts.value = []
  } finally {
    loadingPromos.value = false
  }
}

// ══════════════════════════════════════════════════════════════════════════
// ACTIONS FILTRES
// ══════════════════════════════════════════════════════════════════════════

const selectFilter = (groupKey: string, opt: string) => {
  appliedFilters.value[groupKey] = appliedFilters.value[groupKey] === opt ? null : opt
  fetchProducts(true)
  isMobileFilterOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetFilters = () => {
  Object.keys(appliedFilters.value).forEach(k => (appliedFilters.value[k] = null))
  priceRange.value  = [0, priceMax.value]
  currentPage.value = 1
  fetchProducts(true)
  fetchFilterCounts()
}

const setPage = (page: number) => {
  currentPage.value = page
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ══════════════════════════════════════════════════════════════════════════
// INIT & WATCHERS
// ══════════════════════════════════════════════════════════════════════════

const loadPage = async () => {
  products.value        = []
  appliedFilters.value  = {}
  priceRange.value      = [0, PRICE_MAX_DEFAULT]
  priceMax.value        = PRICE_MAX_DEFAULT
  currentPage.value     = 1
  filterGroups.value    = {}
  // ✅ On refresh le fetch SSR pour mettre à jour categoryInfo lors d'une navigation
  await refreshCategoryInfo()
  fetchProducts()
  fetchFilterCounts()
  fetchRecentProducts()
}

// ✅ Réaction au changement de slug (navigation entre catégories)
watch(activeSlug, (slug) => { if (!slug) return; loadPage() })

// ✅ Mise à jour de categoryInfo + SEO quand categoryData change côté client
watch(categoryData, (data) => {
  if (!data) return
  categoryInfo.value = data
  setSeo()
})

watch(sortBy, () => fetchProducts(true))

let priceTimer: ReturnType<typeof setTimeout> | null = null
watch(priceRange, () => {
  if (priceTimer) clearTimeout(priceTimer)
  priceTimer = setTimeout(() => { fetchProducts(true); fetchFilterCounts() }, 400)
}, { deep: true })

// ✅ Chargement initial côté client (premier montage)
onMounted(() => {
  initWishlist()
  fetchSidebarPromos()
  // Lancer les fetches client qui ne sont pas bloquants SSR
  fetchProducts()
  fetchFilterCounts()
  fetchRecentProducts()
})

// ══════════════════════════════════════════════════════════════════════════
// HELPERS UI
// ══════════════════════════════════════════════════════════════════════════

const formatPrice  = (p: number) => new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(p)
const isOutOfStock = (p: Product) => p.status === 'out_of_stock' || p.stock === 0
const goToProduit  = (p: Product) => p.slug ? `/products/${p.slug}` : `/products/${p.id}`

const discountPercent = (p: Product) => {
  if (p.discount_percent) return `-${p.discount_percent}%`
  if (p.old_price && p.old_price > p.price)
    return `-${Math.round((1 - p.price / p.old_price) * 100)}%`
  return null
}

const hoveredKeys = ref<Set<string>>(new Set())
const setHover    = (key: string, on: boolean) => {
  const s = new Set(hoveredKeys.value)
  on ? s.add(key) : s.delete(key)
  hoveredKeys.value = s
}

const getImage      = (p: Product, width = 300) => optimizeCloudinary(p.images?.[0] ?? '/images/placeholder.jpg', width)
const getImageHover = (p: Product, width = 300) => optimizeCloudinary(p.images?.[1] ?? p.images?.[0] ?? '/images/placeholder.jpg', width)
const imgSrc        = (p: Product, section: string, width = 300) =>
  hoveredKeys.value.has(`${section}:${p.id}`) ? getImageHover(p, width) : getImage(p, width)

// ══════════════════════════════════════════════════════════════════════════
// PANIER & WISHLIST
// ══════════════════════════════════════════════════════════════════════════

const { addToCart: addToCartStore }           = useCart()
const { isFav, toggleWishlist, initWishlist } = useWishlist()

const addToCart     = (p: Product) => {
  if (isOutOfStock(p)) return
  addToCartStore({ id: p.id, slug: p.slug, name: p.name, price: p.price, image: getImage(p) })
}
const addToWishlist = (p: Product) => toggleWishlist(p.id, p.name)
</script>

<template>
  <UContainer class="py-8 bg-white">

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
        <UIcon
          v-if="index < breadcrumbItems.length - 1"
          name="i-heroicons-chevron-right"
          class="w-3 h-3 text-gray-300 flex-shrink-0"
          aria-hidden="true" />
      </template>
    </nav>

    <!-- BOUTON FILTRE MOBILE + TRI -->
    <div class="flex lg:hidden items-center justify-between mb-4 gap-3">
      <button
        @click="isMobileFilterOpen = true"
        :aria-label="t('category.open_filters')"
        class="flex items-center gap-2 px-4 py-2.5 bg-[#274a82] text-white rounded-sm text-sm font-bold shadow-sm">
        <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4" aria-hidden="true" />
        {{ t('category.filters') }}
        <span
          v-if="activeFilterCount > 0"
          class="bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full"
          :aria-label="`${activeFilterCount} ${t('category.active_filters_count')}`">
          {{ activeFilterCount }}
        </span>
      </button>
      <USelectMenu v-model="sortBy" :items="SORT_OPTIONS" class="flex-1" />
    </div>

    <!-- DRAWER FILTRE MOBILE -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="isMobileFilterOpen"
          class="fixed inset-0 bg-black/50 z-40 lg:hidden"
          @click="isMobileFilterOpen = false"
          aria-hidden="true" />
      </Transition>
      <Transition name="slide-up">
        <div
          v-if="isMobileFilterOpen"
          class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl lg:hidden flex flex-col"
          style="max-height: 90dvh;"
          role="dialog"
          aria-modal="true"
          :aria-label="t('category.filters_dialog_label')">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-adjustments-horizontal" class="w-5 h-5 text-[#274a82]" aria-hidden="true" />
              <!-- FIX A11Y: h2 pour respecter la hiérarchie dans la dialog -->
              <h2 class="font-bold text-gray-900 text-base">{{ t('category.filters') }}</h2>
              <span v-if="activeFilterCount > 0" class="text-xs text-[#274a82] font-bold">
                ({{ activeFilterCount }}
                {{ activeFilterCount > 1 ? t('category.actifs') : t('category.active') }})
              </span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetFilters" class="text-xs text-[#e60012] font-bold hover:underline">
                {{ t('category.clear_all') }}
              </button>
              <!-- FIX A11Y: aria-label explicite pour le bouton de fermeture -->
              <button
                @click="isMobileFilterOpen = false"
                :aria-label="t('category.close_filters')"
                class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="overflow-y-auto flex-1 px-4 py-3 space-y-1">
            <!-- Skeleton mobile -->
            <template v-if="showAdvancedFilters && loadingCounts && Object.keys(filterGroups).length === 0">
              <div v-for="n in 4" :key="n" class="border-b border-gray-50 pb-3" aria-hidden="true">
                <div class="h-3 bg-gray-100 rounded animate-pulse w-1/3 my-3"></div>
                <div class="grid grid-cols-2 gap-1.5">
                  <div v-for="m in 4" :key="m" class="h-9 bg-gray-50 rounded-sm animate-pulse"></div>
                </div>
              </div>
            </template>

            <template v-else-if="showAdvancedFilters">
              <div v-for="(options, key) in filterGroups" :key="key" class="border-b border-gray-50 pb-3">
                <button
                  @click="toggleExpand(key as string)"
                  class="w-full flex items-center justify-between py-2"
                  :aria-expanded="expandedGroups[key as string]"
                  :aria-controls="`filter-mobile-${key}`">
                  <span class="text-sm font-bold text-gray-800">{{ key }}</span>
                  <div class="flex items-center gap-2">
                    <span
                      v-if="appliedFilters[key as string]"
                      class="text-[10px] bg-[#274a82]/10 text-[#274a82] font-bold px-2 py-0.5 rounded-full">
                      {{ appliedFilters[key as string] }}
                    </span>
                    <UIcon
                      name="i-heroicons-chevron-down"
                      class="w-4 h-4 text-gray-400 transition-transform"
                      :class="{ 'rotate-180': expandedGroups[key as string] }"
                      aria-hidden="true" />
                  </div>
                </button>
                <div
                  v-if="expandedGroups[key as string]"
                  :id="`filter-mobile-${key}`"
                  class="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    v-for="(count, opt) in options" :key="opt"
                    @click="count > 0 || appliedFilters[key as string] === opt
                      ? selectFilter(key as string, opt as string) : null"
                    :disabled="count === 0 && appliedFilters[key as string] !== opt"
                    :aria-pressed="appliedFilters[key as string] === opt"
                    class="flex items-center gap-2 px-3 py-2 rounded-sm border transition-all text-xs font-medium text-left"
                    :class="appliedFilters[key as string] === opt
                      ? 'border-[#274a82] bg-[#274a82]/5 text-[#274a82] cursor-pointer'
                      : count === 0
                        ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300 cursor-pointer'">
                    <span class="flex-1">{{ opt }}</span>
                    <!-- FIX A11Y: text-gray-300 → text-gray-400 pour meilleur contraste -->
                    <span class="text-[10px]" :class="count === 0 ? 'text-gray-400' : 'text-gray-400'">
                      ({{ count }})
                    </span>
                    <UIcon
                      v-if="appliedFilters[key as string] === opt"
                      name="i-heroicons-check"
                      class="w-3.5 h-3.5 text-[#274a82] flex-shrink-0"
                      aria-hidden="true" />
                  </button>
                </div>
              </div>
            </template>

            <!-- Prix mobile -->
            <div class="pb-3">
              <p class="text-sm font-bold text-gray-800 py-2" id="price-range-mobile-label">
                {{ t('category.price') }}
              </p>
              <USlider
                v-model="priceRange"
                :min="0"
                :max="priceMax"
                :step="10000"
                size="md"
                aria-labelledby="price-range-mobile-label" />
              <div class="mt-3 text-xs text-gray-500 font-medium text-center">
                {{ t('category.price_range_mobile', {
                  min: formatPrice(priceRange[0]),
                  max: formatPrice(priceRange[1])
                }) }}
              </div>
            </div>
          </div>

          <div class="flex-shrink-0 px-4 py-4 border-t border-gray-100 bg-white">
            <UButton
              @click="isMobileFilterOpen = false"
              color="error" block size="lg"
              class="rounded-sm font-bold">
              {{ meta.total > 0
                ? t('category.see_results_count', { count: meta.total })
                : t('category.see_results') }}
            </UButton>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- LAYOUT PRINCIPAL -->
    <div class="grid grid-cols-12 gap-8">

      <!-- SIDEBAR DESKTOP -->
      <aside class="hidden lg:block col-span-3 space-y-8 flex-shrink-0" :aria-label="t('category.filters_sidebar_label')">
        <!-- FIX A11Y: h2 pour la sidebar (hiérarchie h1 → h2 → h3) -->
        <div class="flex items-center justify-between">
          <h2 class="text-2xl text-gray-800 my-1">{{ t('category.filters') }}</h2>
          <button
            v-if="activeFilterCount > 0"
            @click="resetFilters"
            class="text-xs text-[#e60012] font-bold hover:underline">
            {{ t('category.clear_all') }}
          </button>
        </div>
        <hr class="border-[#e60012] -mt-6" />

        <template v-if="showAdvancedFilters">
          <!-- Skeleton desktop -->
          <template v-if="loadingCounts && Object.keys(filterGroups).length === 0">
            <div v-for="n in 5" :key="n" class="border-b border-gray-100 pb-4 space-y-2" aria-hidden="true">
              <div class="h-3 bg-gray-100 rounded animate-pulse w-1/3"></div>
              <div class="flex flex-wrap gap-1.5">
                <div v-for="m in 4" :key="m" class="h-7 bg-gray-50 rounded-full animate-pulse w-20"></div>
              </div>
            </div>
          </template>

          <template v-else>
            <div v-for="(options, key) in filterGroups" :key="key" class="border-b border-gray-100 pb-4">
              <!-- FIX A11Y: h3 sous le h2 "Filtres" — hiérarchie correcte -->
              <h3 class="text-[14px] font-extrabold text-gray-500 tracking-widest mb-2.5">{{ key }}</h3>
              <div class="flex flex-wrap gap-1.5" role="group" :aria-label="`Filtres ${key}`">
                <template v-for="(count, opt, index) in options" :key="opt">
                  <button
                    v-if="index < 6 || expandedGroups[key as string]"
                    @click="count > 0 || appliedFilters[key as string] === opt
                      ? selectFilter(key as string, opt as string) : null"
                    :disabled="count === 0 && appliedFilters[key as string] !== opt"
                    :aria-pressed="appliedFilters[key as string] === opt"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all select-none"
                    :class="appliedFilters[key as string] === opt
                      ? 'bg-[#274a82] border-[#274a82] text-white shadow-sm cursor-pointer'
                      : count === 0
                        ? 'bg-white border-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-[#274a82] hover:text-[#274a82] cursor-pointer'">
                    {{ opt }}
                    <!-- FIX A11Y: text-gray-200 → text-gray-400 (contraste insuffisant sur blanc) -->
                    <span
                      class="text-[10px]"
                      :class="appliedFilters[key as string] === opt
                        ? 'opacity-70'
                        : count === 0 ? 'text-gray-400' : 'opacity-60'">
                      ({{ count }})
                    </span>
                  </button>
                </template>
              </div>
              <button
                v-if="Object.keys(options).length > 6"
                @click="toggleExpand(key as string)"
                :aria-expanded="expandedGroups[key as string]"
                class="text-[11px] text-[#274a82] font-bold mt-2 hover:text-[#e60012] transition-colors">
                {{ expandedGroups[key as string] ? t('category.filter_see_less') : t('category.filter_see_more') }}
              </button>
            </div>
          </template>
        </template>

        <!-- Prix desktop -->
        <div class="pb-6 border-b border-gray-100">
          <h3 class="text-sm font-bold text-gray-900 mb-6 tracking-wider" id="price-range-desktop-label">
            {{ t('category.price') }}
          </h3>
          <div class="px-2">
            <USlider
              v-model="priceRange"
              :min="0"
              :max="priceMax"
              :step="10000"
              size="md"
              aria-labelledby="price-range-desktop-label" />
            <div class="mt-4 text-[14px] text-gray-500 font-medium">
              {{ t('category.price_range', {
                min: formatPrice(priceRange[0]),
                max: formatPrice(priceRange[1])
              }) }}
            </div>
          </div>
        </div>

        <div v-if="activeFilterCount > 0">
          <UButton @click="resetFilters" variant="outline" color="gray" block class="font-bold">
            {{ t('category.reset_filters') }}
          </UButton>
        </div>

        <!-- Sidebar promos carousel -->
        <div>
          <div class="flex items-center justify-between border-b border-[#e60012] mb-4">
            <h3 class="text-sm font-bold text-gray-900 tracking-wider pb-1">{{ t('category.on_sale') }}</h3>
            <NuxtLink
              to="/boutique?promo=1"
              class="text-[11px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-0.5 transition-colors group pb-1">
              {{ t('category.see_more') }}
              <UIcon name="i-heroicons-arrow-right" class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </NuxtLink>
          </div>

          <div v-if="loadingPromos" class="space-y-2" aria-hidden="true">
            <div v-for="n in 3" :key="n" class="flex gap-2 animate-pulse">
              <div class="w-16 h-16 bg-gray-100 rounded-sm flex-shrink-0"></div>
              <div class="flex-1 space-y-1.5 py-1">
                <div class="h-2.5 bg-gray-100 rounded w-full"></div>
                <div class="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          <div
            v-else-if="promoProducts.length === 0"
            class="flex flex-col items-center justify-center py-6 text-gray-300">
            <UIcon name="i-heroicons-sparkles" class="w-8 h-8 mb-1" aria-hidden="true" />
            <p class="text-xs font-medium text-gray-400">{{ t('category.no_promo') }}</p>
          </div>

          <UCarousel
            v-else v-slot="{ item: p }"
            :items="promoProducts"
            arrows dots
            :autoplay="{ delay: 3000 }"
            class="relative rounded-sm overflow-hidden"
            :prev="{ variant: 'solid', size: 'xs' }"
            :next="{ variant: 'solid', size: 'xs' }">
            <NuxtLink
              :to="goToProduit(p)"
              class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-lg w-full">
              <div
                class="relative h-44 w-full overflow-hidden flex items-center justify-center"
                @mouseenter="setHover(`sidebar-promo:${p.id}`, true)"
                @mouseleave="setHover(`sidebar-promo:${p.id}`, false)">
                <div
                  v-if="discountPercent(p)"
                  class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm"
                  aria-hidden="true">
                  {{ discountPercent(p) }}
                </div>
                <div
                  v-if="isOutOfStock(p)"
                  class="absolute top-2 right-2 z-10 bg-gray-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                  {{ t('category.out_of_stock') }}
                </div>
                <!-- FIX PERF: Cloudinary optimisé 200px pour sidebar -->
                <img
                  :src="imgSrc(p, 'sidebar-promo', 200)"
                  :alt="p.name"
                  loading="lazy"
                  decoding="async"
                  width="180"
                  height="180"
                  class="absolute inset-0 w-full h-full object-contain p-3 transition-all duration-500 group-hover:scale-105" />
              </div>
              <div class="p-2 flex flex-col gap-1 border-t border-gray-100">
                <span class="text-[10px] text-gray-500 font-bold tracking-widest truncate">
                  {{ p.category?.name ?? '' }}
                </span>
                <h4 class="text-[12px] text-[#274a82] font-bold line-clamp-2 leading-snug group-hover:text-[#e60012] transition-colors min-h-[32px]">
                  {{ p.name }}
                </h4>
                <div class="flex items-end gap-2 mt-1">
                  <span class="text-sm font-black text-gray-900 leading-tight">
                    {{ formatPrice(p.price) }} <span class="text-[9px] font-medium">{{ t('category.currency') }}</span>
                  </span>
                  <span v-if="p.old_price" class="text-[10px] text-[#e60012] line-through leading-tight">
                    {{ formatPrice(p.old_price) }} {{ t('category.currency') }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </UCarousel>
        </div>
      </aside>

      <!-- MAIN -->
      <main class="col-span-12 lg:col-span-9">
        <!-- FIX A11Y: h1 unique pour le nom de catégorie -->
        <h1 class="text-2xl font-medium text-gray-700 tracking-tighter pb-2">{{ categoryDisplayName }}</h1>
        <p v-if="categoryDesc" class="text-sm text-gray-500 mb-4 leading-relaxed">{{ categoryDesc }}</p>

        <!-- Barre tri / affichage -->
        <div class="flex flex-wrap items-center justify-between mb-6 bg-[#f8f8f8] p-2 rounded-xl border border-gray-200 gap-4">
          <div class="flex items-center gap-3 ml-2" role="group" :aria-label="t('category.view_mode_label')">
            <button
              @click="viewMode = 'grid'"
              :aria-pressed="viewMode === 'grid'"
              :aria-label="t('boutique.view_grid')"
              :class="viewMode === 'grid' ? 'text-black' : 'text-gray-300'">
              <UIcon name="i-heroicons-squares-2x2-solid" class="w-6 h-6" aria-hidden="true" />
            </button>
            <button
              @click="viewMode = 'grid-small'"
              :aria-pressed="viewMode === 'grid-small'"
              :aria-label="t('boutique.view_grid_small')"
              :class="viewMode === 'grid-small' ? 'text-black' : 'text-gray-300'">
              <UIcon name="i-heroicons-squares-plus-solid" class="w-6 h-6" aria-hidden="true" />
            </button>
            <button
              @click="viewMode = 'list'"
              :aria-pressed="viewMode === 'list'"
              :aria-label="t('boutique.view_list')"
              :class="viewMode === 'list' ? 'text-black' : 'text-gray-300'">
              <UIcon name="i-heroicons-bars-3-bottom-left-solid" class="w-6 h-6" aria-hidden="true" />
            </button>
            <button
              @click="viewMode = 'list-compact'"
              :aria-pressed="viewMode === 'list-compact'"
              :aria-label="t('boutique.view_list_compact')"
              :class="viewMode === 'list-compact' ? 'text-black' : 'text-gray-300'">
              <UIcon name="i-heroicons-list-bullet-solid" class="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
          <div class="flex items-center gap-4">
            <span class="hidden sm:block text-[13px] text-gray-500 font-medium" aria-live="polite" aria-atomic="true">
              <span v-if="loadingProds">{{ t('category.display_loading') }}</span>
              <template v-else>
                {{ t('category.display_count', {
                  from: ((meta.current_page - 1) * meta.per_page) + 1,
                  to:   Math.min(meta.current_page * meta.per_page, meta.total),
                  total: meta.total
                }) }}
              </template>
            </span>
            <div class="hidden lg:block">
              <USelectMenu v-model="sortBy" :items="SORT_OPTIONS" class="min-w-48" />
            </div>
          </div>
        </div>

        <!-- Filtres actifs (chips) -->
        <div v-if="activeFilterCount > 0" class="flex flex-wrap gap-2 mb-4" role="list" :aria-label="t('category.active_filters_label')">
          <template v-for="(val, key) in appliedFilters" :key="key">
            <span
              v-if="val"
              role="listitem"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#274a82]/10 text-[#274a82] text-xs font-bold">
              {{ key }} : {{ val }}
              <button
                @click="selectFilter(key as string, val as string)"
                :aria-label="`${t('category.remove_filter')} ${key} : ${val}`"
                class="hover:text-[#e60012] transition-colors">
                <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </span>
          </template>
          <button @click="resetFilters" class="text-xs text-[#e60012] font-bold hover:underline">
            {{ t('category.clear_all') }}
          </button>
        </div>

        <!-- Loader -->
        <div v-if="loadingProds" class="flex justify-center items-center py-24" aria-live="polite" aria-label="t('category.loading')">
          <div class="flex flex-col items-center gap-3">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-[#274a82]" aria-hidden="true" />
            <span class="text-sm font-medium text-gray-400">{{ t('category.loading') }}</span>
          </div>
        </div>

        <!-- Aucun résultat -->
        <div
          v-else-if="products.length === 0"
          class="flex flex-col items-center justify-center py-24 text-gray-400">
          <UIcon name="i-heroicons-face-frown" class="w-12 h-12 mb-3 text-gray-300" aria-hidden="true" />
          <p class="text-base font-semibold text-gray-500">{{ t('category.no_products') }}</p>
          <UButton
            @click="resetFilters"
            variant="outline"
            color="gray"
            class="mt-4 font-bold"
            size="sm">
            {{ t('category.reset_filters') }}
          </UButton>
        </div>

        <!-- GRILLE PRODUITS -->
        <!--
          FIX PERF LCP:
          - v-for expose (p, index) pour cibler la 1ère image
          - loading="eager" + fetchpriority="high" sur index === 0
          - Cloudinary optimisé selon viewMode (taille adaptée)
        -->
        <div
          v-else
          :class="{
            'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3': viewMode === 'grid',
            'grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2': viewMode === 'grid-small',
            'flex flex-col gap-3': viewMode === 'list',
            'flex flex-col gap-1': viewMode === 'list-compact',
          }">
          <NuxtLink
            v-for="(p, index) in products" :key="p.id"
            :to="goToProduit(p)"
            :class="viewMode.startsWith('grid')
              ? 'group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl'
              : 'group relative rounded-sm bg-white border border-gray-100 flex flex-row items-center gap-3 p-3 transition-all hover:shadow-md'">
            <div
              :class="{
                'relative w-full h-44 sm:h-52': viewMode === 'grid',
                'relative w-full h-32 sm:h-40': viewMode === 'grid-small',
                'relative h-28 w-28 sm:h-36 sm:w-36 flex-shrink-0': viewMode === 'list',
                'relative h-16 w-16 flex-shrink-0': viewMode === 'list-compact',
              }"
              class="overflow-hidden flex items-center justify-center bg-[#fcfcfc] rounded-sm"
              @mouseenter="setHover(`grid:${p.id}`, true)"
              @mouseleave="setHover(`grid:${p.id}`, false)">
              <div
                v-if="discountPercent(p)"
                class="absolute bottom-2 left-2 bg-[#e60012] text-white text-[9px] font-black px-2 py-0.5 rounded-sm z-10"
                aria-hidden="true">
                {{ discountPercent(p) }}
              </div>
              <div
                v-if="isOutOfStock(p)"
                class="absolute top-2 left-2 bg-gray-500 text-white text-[9px] font-black px-2 py-0.5 rounded-sm z-10">
                {{ t('category.out_of_stock') }}
              </div>
              <div
                v-else-if="p.stock > 0 && p.stock <= 5"
                class="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-sm z-10">
                {{ t('category.low_stock', { count: p.stock }) }}
              </div>

              <div
                v-if="viewMode.startsWith('grid')"
                class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
                <button
                  @click.prevent.stop="addToWishlist(p)"
                  :aria-label="isFav(p.id) ? t('category.fav_remove') : t('category.fav_add')"
                  class="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
                  :class="isFav(p.id)
                    ? 'bg-[#e60012] text-[#e60012]'
                    : 'text-gray-400 hover:bg-[#e60012] hover:text-white'">
                  <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <!-- FIX PERF LCP: première image = eager + fetchpriority high, reste = lazy -->
              <img
                :src="imgSrc(p, 'grid', viewMode === 'grid-small' ? 200 : 300)"
                :alt="p.name"
                :loading="index === 0 ? 'eager' : 'lazy'"
                :fetchpriority="index === 0 ? 'high' : 'auto'"
                decoding="async"
                width="200"
                height="200"
                class="absolute inset-0 w-full h-full object-contain p-2 transition-opacity duration-300" />
            </div>

            <div
              class="flex flex-col flex-1 min-w-0 border-t border-gray-100"
              :class="viewMode.startsWith('grid') ? 'p-2 sm:p-3' : ''">
              <span class="text-[10px] sm:text-[11px] text-gray-500 font-bold tracking-widest truncate">
                {{ p.category?.name ?? '' }}
              </span>
              <h3
                class="font-bold leading-snug group-hover:text-[#e60012] transition-colors overflow-hidden"
                :class="{
                  'text-[13px] sm:text-[14px] text-[#274a82] line-clamp-2 mt-0.5 mb-2': viewMode === 'grid',
                  'text-[11px] text-[#274a82] line-clamp-1 mt-0.5 mb-1': viewMode === 'grid-small',
                  'text-[13px] sm:text-sm text-gray-800 line-clamp-2 mt-0.5 mb-2': viewMode === 'list',
                  'text-[12px] text-gray-800 line-clamp-1': viewMode === 'list-compact',
                }">
                {{ p.name }}
              </h3>

              <div class="mt-auto flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div
                    v-if="p.old_price && viewMode !== 'list-compact'"
                    class="text-[10px] sm:text-[11px] text-[#e60012] line-through leading-tight">
                    {{ formatPrice(p.old_price) }} {{ t('category.currency') }}
                  </div>
                  <div
                    class="font-black text-gray-900 leading-tight whitespace-nowrap"
                    :class="viewMode === 'list-compact'
                      ? 'text-xs'
                      : viewMode === 'grid-small' ? 'text-sm' : 'text-base sm:text-lg'">
                    {{ formatPrice(p.price) }}
                    <span class="text-[9px] font-medium">{{ t('category.currency') }}</span>
                  </div>
                </div>

                <div
                  v-if="viewMode.startsWith('list')"
                  class="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                  <button
                    @click.prevent.stop="addToWishlist(p)"
                    :aria-label="isFav(p.id) ? t('category.fav_remove') : t('category.fav_add')"
                    class="w-8 h-8 rounded-full border flex items-center justify-center transition-colors"
                    :class="isFav(p.id)
                      ? 'border-[#e60012] text-[#e60012] bg-red-50'
                      : 'border-gray-200 text-gray-400 hover:text-[#e60012] hover:border-[#e60012]'">
                    <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    @click.prevent.stop="addToCart(p)"
                    :disabled="isOutOfStock(p)"
                    class="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#274a82] hover:bg-[#e60012] text-white text-[11px] font-bold transition-colors disabled:opacity-40">
                    <UIcon name="i-heroicons-shopping-cart" class="w-3.5 h-3.5" aria-hidden="true" />
                    <span class="hidden md:inline">{{ t('category.add_to_cart') }}</span>
                  </button>
                </div>
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
            @update:page="setPage" />
        </div>

        <!-- PROMOS MOBILE -->
        <section class="lg:hidden py-8" :aria-label="t('category.on_sale')">
          <div class="flex items-center justify-between border-b border-[#e60012] mb-4">
            <!-- FIX A11Y: h2 dans <main>, pas h1 (h1 est le nom de catégorie) -->
            <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
              {{ t('category.on_sale') }}
            </h2>
            <NuxtLink
              to="/boutique?promo=1"
              class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group pb-2">
              {{ t('category.see_more') }}
              <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </NuxtLink>
          </div>

          <div v-if="loadingPromos" class="space-y-2" aria-hidden="true">
            <div v-for="n in 3" :key="n" class="flex gap-2 animate-pulse">
              <div class="w-16 h-16 bg-gray-100 rounded-sm flex-shrink-0"></div>
              <div class="flex-1 space-y-1.5 py-1">
                <div class="h-2.5 bg-gray-100 rounded w-full"></div>
                <div class="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          <div
            v-else-if="promoProducts.length === 0"
            class="flex flex-col items-center justify-center py-6 text-gray-300">
            <UIcon name="i-heroicons-sparkles" class="w-8 h-8 mb-1" aria-hidden="true" />
            <p class="text-xs font-medium text-gray-400">{{ t('category.no_promo') }}</p>
          </div>

          <UCarousel
            v-else v-slot="{ item: p }"
            :items="promoProducts"
            arrows dots
            :autoplay="{ delay: 3000 }"
            class="relative rounded-sm overflow-hidden"
            :prev="{ variant: 'solid', size: 'xs' }"
            :next="{ variant: 'solid', size: 'xs' }">
            <NuxtLink
              :to="goToProduit(p)"
              class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-lg w-full">
              <div
                class="relative h-56 w-full overflow-hidden flex items-center justify-center"
                @mouseenter="setHover(`mobile-promo:${p.id}`, true)"
                @mouseleave="setHover(`mobile-promo:${p.id}`, false)">
                <div
                  v-if="discountPercent(p)"
                  class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm"
                  aria-hidden="true">
                  {{ discountPercent(p) }}
                </div>
                <div
                  v-if="isOutOfStock(p)"
                  class="absolute top-2 right-2 z-10 bg-gray-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                  {{ t('category.out_of_stock') }}
                </div>
                <!-- FIX PERF: Cloudinary 400px pour mobile carousel -->
                <img
                  :src="imgSrc(p, 'mobile-promo', 400)"
                  :alt="p.name"
                  loading="lazy"
                  decoding="async"
                  width="300"
                  height="300"
                  class="absolute inset-0 w-full h-full object-contain p-3 transition-all duration-500 group-hover:scale-105" />
              </div>
              <div class="p-3 flex flex-col gap-1 border-t border-gray-100">
                <span class="text-[10px] text-gray-500 font-bold tracking-widest truncate">
                  {{ p.category?.name ?? '' }}
                </span>
                <h3 class="text-[13px] text-[#274a82] font-bold line-clamp-2 leading-snug group-hover:text-[#e60012] transition-colors min-h-[36px]">
                  {{ p.name }}
                </h3>
                <div class="flex items-end gap-2 mt-1">
                  <span class="text-base font-black text-gray-900 leading-tight">
                    {{ formatPrice(p.price) }}
                    <span class="text-[9px] font-medium">{{ t('category.currency') }}</span>
                  </span>
                  <span v-if="p.old_price" class="text-[11px] text-[#e60012] line-through leading-tight">
                    {{ formatPrice(p.old_price) }} {{ t('category.currency') }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </UCarousel>
        </section>

        <!-- PRODUITS RÉCENTS desktop -->
        <section
          v-if="recentProducts.length > 0"
          class="hidden lg:block py-8"
          :aria-label="t('category.recent_products')">
          <div class="flex items-center justify-between border-b border-gray-200 mb-6">
            <!-- FIX A11Y: h2 (sous le h1 catégorie) -->
            <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
              {{ t('category.recent_products') }}
            </h2>
            <NuxtLink
              to="/boutique"
              class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group">
              {{ t('category.see_more') }}
              <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </NuxtLink>
          </div>

          <div
            v-if="loadingRecent"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3"
            aria-hidden="true">
            <div v-for="n in 5" :key="n" class="bg-gray-50 rounded-sm animate-pulse">
              <div class="h-40 sm:h-48 bg-gray-100 rounded-sm"></div>
              <div class="p-2 space-y-2">
                <div class="h-3 bg-gray-100 rounded w-full"></div>
                <div class="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            <NuxtLink
              v-for="p in recentProducts" :key="'recent-' + p.id"
              :to="goToProduit(p)"
              class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl">
              <div
                class="relative h-40 sm:h-48 w-full overflow-hidden flex items-center justify-center bg-[#fcfcfc]"
                @mouseenter="setHover(`recent:${p.id}`, true)"
                @mouseleave="setHover(`recent:${p.id}`, false)">
                <div class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
                  <button
                    @click.prevent.stop="addToWishlist(p)"
                    :aria-label="isFav(p.id) ? t('category.fav_remove') : t('category.fav_add')"
                    class="w-8 h-8 shadow-md rounded-full flex items-center justify-center transition-colors"
                    :class="isFav(p.id)
                      ? 'bg-white text-[#e60012]'
                      : 'bg-white text-gray-400 hover:text-white hover:bg-[#e60012]'">
                    <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <!-- FIX PERF: Cloudinary 250px pour section recent -->
                <img
                  :src="imgSrc(p, 'recent', 250)"
                  :alt="p.name"
                  loading="lazy"
                  decoding="async"
                  width="200"
                  height="200"
                  class="w-full h-full object-contain p-2 transition-opacity duration-300" />
              </div>
              <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
                <h3 class="text-[12px] sm:text-[13px] text-gray-700 font-semibold mb-2 line-clamp-2 leading-snug group-hover:text-[#e60012]">
                  {{ p.name }}
                </h3>
                <div class="mt-auto flex items-end justify-between gap-2">
                  <div>
                    <div class="text-sm sm:text-base font-black text-gray-900 leading-tight">
                      {{ formatPrice(p.price) }}
                      <span class="text-[9px]">{{ t('category.currency') }}</span>
                    </div>
                    <span v-if="p.old_price" class="text-[10px] text-gray-400 line-through">
                      {{ formatPrice(p.old_price) }} {{ t('category.currency') }}
                    </span>
                  </div>
                  <div
                    v-if="discountPercent(p)"
                    class="hidden sm:block bg-[#e60012] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex-shrink-0"
                    aria-hidden="true">
                    {{ discountPercent(p) }}
                  </div>
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