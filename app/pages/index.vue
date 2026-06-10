<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const SEO_TITLE = 'Informatique & High-Tech au Cameroun'
const SEO_DESC  = 'Achetez vos équipements informatiques, réseaux, sécurité électronique, électricité et accessoires au meilleur prix au Cameroun. Livraison rapide à Douala, Yaoundé et partout ailleurs.'
const SEO_IMAGE = 'https://brcmarket.cm/images/og-image.png'
const SEO_URL   = 'https://brcmarket.cm'

useSeoMeta({
  title:              SEO_TITLE,
  ogTitle:            SEO_TITLE,
  description:        SEO_DESC,
  ogDescription:      SEO_DESC,
  ogImage:            SEO_IMAGE,
  ogUrl:              SEO_URL,
  twitterTitle:       SEO_TITLE,
  twitterDescription: SEO_DESC,
  twitterImage:       SEO_IMAGE,
})

useHead({
  link: [
    { rel: 'canonical', href: SEO_URL },
  ],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context':  'https://schema.org',
      '@type':     'WebSite',
      name:        'BRC Market',
      url:         SEO_URL,
      description: SEO_DESC,
      potentialAction: {
        '@type':       'SearchAction',
        target:        `${SEO_URL}/boutique?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }),
  }],
})

// ─── i18n ─────────────────────────────────────────────────────────────────────
const { t } = useI18n()

// ─── Auth ─────────────────────────────────────────────────────────────────────
const token      = useCookie('auth_token')
const isLoggedIn = computed(() => !!token.value)

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Config ───────────────────────────────────────────────────────────────────
const config = useRuntimeConfig()
const API    = config.public.apiBase

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice   = (p: number) => new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(p)
const getImage      = (p: Product) => p.images?.[0] ?? '/images/placeholder.jpg'
const getImageHover = (p: Product) => p.images?.[1] ?? p.images?.[0] ?? '/images/placeholder.jpg'
const isOutOfStock  = (p: Product) => p.status === 'out_of_stock' || p.stock === 0
const goToProduit   = (p: Product) => p.slug ? `/products/${p.slug}` : `/products/${p.id}`

const discountPercent = (p: Product): string | null => {
  if (p.discount_percent) return `-${p.discount_percent}%`
  if (p.old_price && p.old_price > p.price)
    return `-${Math.round((1 - p.price / p.old_price) * 100)}%`
  return null
}

// ─── Hover image ──────────────────────────────────────────────────────────────
const hoveredKeys = ref<Set<string>>(new Set())
const setHover    = (key: string, on: boolean) => {
  const s = new Set(hoveredKeys.value)
  on ? s.add(key) : s.delete(key)
  hoveredKeys.value = s
}

// ─── Panier & Wishlist ────────────────────────────────────────────────────────
const { addToCart: addToCartStore }           = useCart()
const { isFav, toggleWishlist, initWishlist } = useWishlist()

const addToCart     = (p: Product) => {
  if (isOutOfStock(p)) return
  addToCartStore({ id: p.id, slug: p.slug, name: p.name, price: p.price, image: getImage(p) })
}
const addToWishlist = (p: Product) => toggleWishlist(p.id, p.name)

// ─── Fetch générique ──────────────────────────────────────────────────────────
const fetchProductsBy = async (params: Record<string, any>): Promise<Product[]> => {
  try {
    const data = await $fetch<any>(`${API}/products`, { params })
    return data.data ?? []
  } catch (e) {
    console.error('Erreur fetch produits:', e)
    return []
  }
}

// ─── Banners ──────────────────────────────────────────────────────────────────
const leftImages = [
  { src: '/images/annonce/acceuil-imprimante-et-scanner.png', link: '/categories/imprimantes-et-scanners', label: 'Imprimantes et Scanners' },
  { src: '/images/annonce/acceuil-camera.png',                link: '/categories/securite-electronique/camera', label: 'Caméras de sécurité' },
]
const rightImages = [
  { src: '/images/annonce/acceuil-reseau.png',  link: '/categories/materiels-reseaux', label: 'Matériels réseaux' },
  { src: '/images/annonce/acceuil-desktop.png', link: '/categories/ordinateurs/desktops', label: 'Ordinateurs de bureau' },
]
const leftIndex  = ref(0)
const rightIndex = ref(0)

const trioCards = [
  { images: ['/images/annonce/acceuil-imprimante-hp-2320.png'],  link: '/products/imprimante-hp-deskjet-2320-en-vente',                       label: 'Imprimante HP DeskJet 2320' },
  { images: ['/images/annonce/acceuil-souris-sans-fil.png'],     link: '/products/souris-sans-fil-bluetooth-rechargeable',                    label: 'Souris sans fil Bluetooth rechargeable' },
  { images: ['/images/annonce/acceuil-switch-dlink.png'],        link: '/products/switch-d-link-dgs-105-5-ports-gigabit-metal',               label: 'Switch D-Link DGS-105 5 ports Gigabit' },
  { images: ['/images/annonce/acceuil-powerbank-oraimo.png'],    link: '/products/power-bank-oraimo-opb-p300q-30000mah-en-vente',             label: 'Power Bank Oraimo 30000mAh' },
]

const quartetCards = [
  { image: '/images/annonce/acceuil-hp-victus.png',        link: '/products/laptop-hp-gaming-victus-16-r0104nia-core-i7-13th-gen-32gb-ram-1tb-ssd-8gb-nvidia-rtx-4060-en-vente', label: 'Laptop HP Gaming Victus 16 – Core i7 13e gén, 32Go RAM, 1To SSD, RTX 4060' },
  { image: '/images/annonce/acceuil-lenovo-v15-G2.png',    link: '/products/laptop-lenovo-v15-g2-igl-celeron-n4020-4gb-ram-256gb-ssd-en-vente',                                 label: 'Laptop Lenovo V15 G2 – Celeron N4020, 4Go RAM, 256Go SSD' },
  { image: '/images/annonce/acceuil-macbook-pro-2019.png', link: '/products/apple-macbook-pro-2019-1tb-ssd-16gb-ram-core-i9-2-3ghz-intel-uhd-graphics-1-5gb-en-vente',          label: 'Apple MacBook Pro 2019 – Core i9, 16Go RAM, 1To SSD' },
  { image: '/images/annonce/acceuil-tv.png',               link: '/categories/electromenager/televisions',                                                                      label: 'Télévisions et électroménager' },
  { image: '/images/annonce/acceuil-routeur-tplink.png',   link: '/products/routeur-tp-link-tl-mr6400-en-vente',                                                                label: 'Routeur TP-Link TL-MR6400' },
]

const duo2Left = [
  { src: '/images/annonce/acceuil-electrique.png', link: '/categories/electricite-et-energie',    label: 'Électricité et énergie' },
  { src: '/images/annonce/acceuil-onduleur.png',   link: '/categories/onduleurs-et-regulateurs',  label: 'Onduleurs et régulateurs' },
]
const duo2Right = [
  { src: '/images/annonce/acceuil-stockage.png',                link: '/categories/stockage',                  label: 'Stockage' },
  { src: '/images/annonce/acceuil-smartphones-et-tablettes.png', link: '/categories/smartphones-et-tablettes', label: 'Smartphones et tablettes' },
]
const duo2LeftIndex  = ref(0)
const duo2RightIndex = ref(0)

// ─── Sections produits ────────────────────────────────────────────────────────
const bestProducts        = ref<Product[]>([])
const loadingBest         = ref(true)
const recentProducts      = ref<Product[]>([])
const loadingRecent       = ref(true)
const networkProducts     = ref<Product[]>([])
const loadingNetwork      = ref(true)
const printingProducts    = ref<Product[]>([])
const loadingPrinters     = ref(true)
const accessoriesProducts = ref<Product[]>([])
const loadingAccessories  = ref(true)
const securityProducts    = ref<Product[]>([])
const loadingSecurity     = ref(true)
const stockageProducts    = ref<Product[]>([])
const loadingStockage     = ref(true)
const gadgetsProducts     = ref<Product[]>([])
const loadingGadgets      = ref(true)
const smartphoneProducts  = ref<Product[]>([])
const loadingSmartphones  = ref(true)
const screensProducts     = ref<Product[]>([])
const loadingScreens      = ref(true)
const promosProducts      = ref<Product[]>([])
const loadingPromos       = ref(true)
const featuredProducts    = ref<Product[]>([])
const loadingFeatured     = ref(true)

// ✅ FIX PERFORMANCE : tous les appels API en parallèle via Promise.all
const fetchAllSections = async () => {
  const [
    best, recent, promos, network, printers,
    accessories, security, stockage, gadgets,
    smartphones, screens, featured,
  ] = await Promise.all([
    fetchProductsBy({ best_seller: 1,  per_page: 8, sort: 'latest' }),
    fetchProductsBy({ is_new: 1,        per_page: 8, sort: 'latest' }),
    fetchProductsBy({ is_promoted: 1,   per_page: 8, sort: 'latest' }),
    fetchProductsBy({ category: 'materiels-reseaux',        per_page: 8, sort: 'latest' }),
    fetchProductsBy({ category: 'imprimantes-et-scanners',  per_page: 8, sort: 'latest' }),
    fetchProductsBy({ category: 'accessoires-ordinateurs',  per_page: 8, sort: 'latest' }),
    fetchProductsBy({ category: 'securite-electronique',    per_page: 8, sort: 'latest' }),
    fetchProductsBy({ category: 'stockage-et-nas',          per_page: 8, sort: 'latest' }),
    fetchProductsBy({ category: 'gadgets',                  per_page: 8, sort: 'latest' }),
    fetchProductsBy({ category: 'smartphones-et-tablettes', per_page: 8, sort: 'latest' }),
    fetchProductsBy({ 'category[]': ['ecran-ordinateur', 'ecran-occasion'], per_page: 8, sort: 'latest' }),
    fetchProductsBy({ featured: 1,      per_page: 8, sort: 'latest' }),
  ])

  bestProducts.value        = best
  recentProducts.value      = recent
  promosProducts.value      = promos
  networkProducts.value     = network
  printingProducts.value    = printers
  accessoriesProducts.value = accessories
  securityProducts.value    = security
  stockageProducts.value    = stockage
  gadgetsProducts.value     = gadgets
  smartphoneProducts.value  = smartphones
  screensProducts.value     = screens
  featuredProducts.value    = featured

  // Désactiver tous les loaders en une fois
  loadingBest.value = loadingRecent.value = loadingPromos.value =
  loadingNetwork.value = loadingPrinters.value = loadingAccessories.value =
  loadingSecurity.value = loadingStockage.value = loadingGadgets.value =
  loadingSmartphones.value = loadingScreens.value = loadingFeatured.value = false
}

// ─── Carousel UI config ───────────────────────────────────────────────────────
const carouselUI = {
  item:      'basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 px-0.5',
  container: 'py-1',
}

// ─── Static data ──────────────────────────────────────────────────────────────
const mainItems = [
  { image: '/images/annonce/acceuil-onduleur-et-bank.png',  link: '/categories/onduleurs-et-regulateurs', label: 'Onduleurs et batteries de secours' },
  { image: '/images/annonce/acceuil-dell-5510.png',         link: '/products/dell-latitude-5510-core-i5-10th-gen-8gb-ram-512gb-ssd-en-vente-au-cameroun', label: 'Dell Latitude 5510 – Core i5 10e gén, 8Go RAM, 512Go SSD' },
  { image: '/images/annonce/acceuil-projecteur.png',        link: '/products/projecteur-epson-co-w01-en-vente-au-cameroun', label: 'Projecteur Epson CO-W01' },
  { image: '/images/annonce/acceuil-ordinateur.png',        link: '/categories/ordinateurs', label: 'Ordinateurs portables et desktops' },
  { image: '/images/annonce/acceuil-redmi.png',             link: '/products/telephones-redmi-13c-8g-ram-256go-395-en-vente', label: 'Redmi 13C – 8Go RAM, 256Go' },
  { image: '/images/annonce/acceuil-livraison.png',         link: '/boutique', label: 'Livraison rapide partout au Cameroun' },
]

const brands = [
  { name: 'HP',      img: '/images/logos/logo-hp.jpg' },
  { name: 'DELL',    img: '/images/logos/logo-dell.jpg' },
  { name: 'LENOVO',  img: '/images/logos/logo-lenovo.jpg' },
  { name: 'APPLE',   img: '/images/logos/logo-apple.jpg' },
  { name: 'SAMSUNG', img: '/images/logos/logo-samsung.jpg' },
  { name: 'CANON',   img: '/images/logos/logo-canon.jpg' },
]

// ─── Category icons ───────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, string> = {
  'ordinateurs':                'i-heroicons-computer-desktop',
  'ordinateurs-et-accessoires': 'i-heroicons-computer-desktop',
  'laptops':                    'i-heroicons-computer-desktop',
  'desktops':                   'i-heroicons-computer-desktop',
  'imprimantes':                'i-heroicons-printer',
  'imprimantes-scanners':       'i-heroicons-printer',
  'imprimantes-et-scanners':    'i-heroicons-printer',
  'smartphones':                'i-heroicons-device-phone-mobile',
  'smartphones-et-tablettes':   'i-heroicons-device-phone-mobile',
  'smartphone-et-tablettes':    'i-heroicons-device-phone-mobile',
  'materiels-reseaux':          'i-heroicons-wifi',
  'materiels-reseau':           'i-heroicons-wifi',
  'reseau':                     'i-heroicons-wifi',
  'securite':                   'i-heroicons-shield-check',
  'securite-electronique':      'i-heroicons-shield-check',
  'securite-biometrie':         'i-heroicons-finger-print',
  'stockage':                   'i-heroicons-circle-stack',
  'stockage-et-nas':            'i-heroicons-circle-stack',
  'maintenance':                'i-heroicons-wrench-screwdriver',
  'maintenance-expert':         'i-heroicons-wrench-screwdriver',
  'sav':                        'i-heroicons-chat-bubble-left-ellipsis',
  'accessoires':                'i-heroicons-puzzle-piece',
  'ecrans':                     'i-heroicons-tv',
  'ecran':                      'i-heroicons-tv',
  'gadgets':                    'i-heroicons-bolt',
  'serveurs':                   'i-heroicons-server-stack',
  'electricite-et-energie':     'i-heroicons-bolt',
  'onduleurs-et-regulateurs':   'i-heroicons-battery-100',
  'electromenager':             'i-heroicons-home',
}

const getIcon = (slug: string): string => {
  if (CATEGORY_ICONS[slug]) return CATEGORY_ICONS[slug]
  const match = Object.keys(CATEGORY_ICONS).find(
    key => slug.includes(key) || key.includes(slug)
  )
  return match ? CATEGORY_ICONS[match] : 'i-heroicons-squares-2x2'
}

// ─── Categories ───────────────────────────────────────────────────────────────
const {
  navGroups: categoriesData,
  loadingCats,
  errorCats,
  fetchCategories,
} = useCategories()

const hoveredCategory = ref<number | null>(null)

// ─── Benefits (i18n) ──────────────────────────────────────────────────────────
const benefits = computed(() => [
  { icon: 'i-heroicons-truck',              title: t('home.benefits_delivery_title'), subtitle: t('home.benefits_delivery_sub') },
  { icon: 'i-heroicons-star',               title: t('home.benefits_authentic_title'), subtitle: t('home.benefits_authentic_sub') },
  { icon: 'i-heroicons-arrow-path',         title: t('home.benefits_return_title'),   subtitle: t('home.benefits_return_sub') },
  { icon: 'i-heroicons-wrench-screwdriver', title: t('home.benefits_sav_title'),      subtitle: t('home.benefits_sav_sub') },
])

// ─── Flyer ────────────────────────────────────────────────────────────────────
const isExpanded  = ref(false)
const isFlyerOpen = ref(false)

let inactivityTimer: ReturnType<typeof setTimeout> | null = null

const resetInactivityTimer = () => {
  if (isFlyerOpen.value) return
  if (inactivityTimer) clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(() => { isFlyerOpen.value = true }, 300000)
}

// ─── Router loading ───────────────────────────────────────────────────────────
const loading = ref(false)
const router  = useRouter()
router.beforeEach(() => { loading.value = true })
router.afterEach(() => { setTimeout(() => { loading.value = false }, 400) })

// ─── Intervals (✅ FIX : nettoyés dans onUnmounted) ───────────────────────────
let leftTimer:       ReturnType<typeof setInterval>
let rightTimer:      ReturnType<typeof setInterval>
let duo2LeftTimer:   ReturnType<typeof setInterval>
let duo2RightTimer:  ReturnType<typeof setInterval>

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  leftTimer  = setInterval(() => { leftIndex.value  = (leftIndex.value  + 1) % leftImages.length  }, 4000)
  setTimeout(() => {
    rightTimer = setInterval(() => { rightIndex.value = (rightIndex.value + 1) % rightImages.length }, 4000)
  }, 2000)

  duo2LeftTimer = setInterval(() => { duo2LeftIndex.value  = (duo2LeftIndex.value  + 1) % duo2Left.length  }, 4500)
  setTimeout(() => {
    duo2RightTimer = setInterval(() => { duo2RightIndex.value = (duo2RightIndex.value + 1) % duo2Right.length }, 4500)
  }, 2500)

  fetchCategories()
  fetchAllSections()
  initWishlist()

  const hasSeenInitial = sessionStorage.getItem('flyer_seen_initial')
  if (!hasSeenInitial) {
    setTimeout(() => {
      isFlyerOpen.value = true
      sessionStorage.setItem('flyer_seen_initial', 'true')
    }, 5000)
  }

  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
  activityEvents.forEach(e => window.addEventListener(e, resetInactivityTimer))
  resetInactivityTimer()
})

onUnmounted(() => {
  // ✅ FIX : nettoyage de tous les timers
  clearInterval(leftTimer)
  clearInterval(rightTimer)
  clearInterval(duo2LeftTimer)
  clearInterval(duo2RightTimer)
  if (inactivityTimer) clearTimeout(inactivityTimer)

  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
  activityEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer))
})
</script>

<template>
  <div class="bg-[#f4f4f4] min-h-screen pb-3">

    <!-- ═══════════════ HERO ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">

      <!-- ✅ FIX ACCESSIBILITÉ : h1 visible uniquement pour les lecteurs d'écran -->
      <h1 class="sr-only">BRC Market – Informatique &amp; High-Tech au Cameroun</h1>

      <div class="flex flex-col md:flex-row gap-3 md:gap-4 md:h-[420px]">

        <!-- Sidebar catégories desktop -->
        <aside
          aria-label="Catégories de produits"
          class="hidden md:flex flex-col w-full md:w-1/4 bg-white rounded-sm shadow-sm border border-gray-100 overflow-visible relative z-40">
          <div class="bg-[#274a82] p-4 text-white uppercase tracking-wider font-bold text-sm rounded-t-sm">
            <UIcon name="i-heroicons-bars-3" class="inline-block mr-2" aria-hidden="true" /> {{ $t('home.categories_label') }}
          </div>
          <div v-if="loadingCats" class="flex-1 py-1" aria-busy="true" aria-label="Chargement des catégories">
            <div v-for="n in 7" :key="n" class="flex items-center gap-3 px-5 py-2.5 border-b border-gray-50">
              <div class="w-4 h-4 bg-gray-100 rounded animate-pulse flex-shrink-0" />
              <div class="h-3 bg-gray-100 rounded animate-pulse flex-1" />
            </div>
          </div>
          <div v-else-if="errorCats" class="flex-1 flex flex-col items-center justify-center gap-2 py-6 text-center px-4" role="alert">
            <UIcon name="i-heroicons-exclamation-circle" class="w-7 h-7 text-red-300" aria-hidden="true" />
            <p class="text-xs text-red-400 font-medium">{{ $t('home.error_categories') }}</p>
            <button class="text-xs text-[#274a82] font-bold hover:underline" @click="fetchCategories">{{ $t('home.retry') }}</button>
          </div>
          <nav v-else aria-label="Navigation par catégories" class="flex-1 flex flex-col py-1 bg-white rounded-b-sm">
            <div
              v-for="(cat, index) in categoriesData"
              :key="cat.slug"
              class="relative"
              @mouseenter="hoveredCategory = index"
              @mouseleave="hoveredCategory = null">
              <NuxtLink
                :to="`/categories/${cat.slug}`"
                class="flex items-center justify-between px-5 py-2.5 text-[13px] border-b border-gray-50 last:border-0 cursor-pointer select-none transition-colors"
                :class="hoveredCategory === index ? 'bg-[#f0f4ff]' : 'hover:bg-gray-50'">
                <div class="flex items-center gap-3">
                  <span
                    class="font-medium transition-colors truncate"
                    :class="hoveredCategory === index ? 'text-[#274a82]' : 'text-gray-700'">
                    {{ cat.label }}
                  </span>
                </div>
                <UIcon
                  name="i-heroicons-chevron-right"
                  class="w-3 h-3 transition-colors flex-shrink-0"
                  :class="hoveredCategory === index ? 'text-[#274a82]' : 'text-gray-300'"
                  aria-hidden="true" />
              </NuxtLink>
              <Transition
                enter-active-class="transition-all duration-180 ease-out"
                enter-from-class="opacity-0 translate-x-2"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="transition-all duration-120 ease-in"
                leave-from-class="opacity-100 translate-x-0"
                leave-to-class="opacity-0 translate-x-1">
                <div
                  v-if="hoveredCategory === index && cat.links.length > 1"
                  class="absolute left-full top-0 z-50 bg-white border border-gray-200 shadow-2xl rounded-sm min-w-[220px] py-2"
                  style="margin-left: 2px;"
                  role="region"
                  :aria-label="`Sous-catégories de ${cat.label}`">
                  <div class="absolute -left-[5px] top-4 w-2.5 h-2.5 bg-white border-l border-b border-gray-200 rotate-45" aria-hidden="true" />
                  <div class="px-4 py-2 mb-1 bg-[#274a82] flex items-center gap-2">
                    <UIcon :name="getIcon(cat.slug)" class="w-4 h-4 text-white flex-shrink-0" aria-hidden="true" />
                    <span class="text-[11px] font-black text-white tracking-widest truncate">{{ cat.label }}</span>
                  </div>
                  <NuxtLink
                    v-for="link in cat.links.slice(1)"
                    :key="link.to"
                    :to="link.to"
                    class="flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-600 hover:text-[#e60012] hover:bg-red-50 transition-colors">
                    {{ link.label }}
                  </NuxtLink>
                  <div class="border-t border-gray-100 mt-1 pt-1">
                    <NuxtLink
                      :to="`/categories/${cat.slug}`"
                      class="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-[#274a82] hover:text-[#e60012] hover:bg-red-50 transition-colors">
                      <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" aria-hidden="true" />
                      {{ $t('home.see_all') }} {{ cat.label }}
                    </NuxtLink>
                  </div>
                </div>
              </Transition>
            </div>
            <div v-if="!loadingCats && categoriesData.length === 0" class="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <UIcon name="i-heroicons-folder" class="w-8 h-8 text-gray-200" aria-hidden="true" />
              <p class="text-xs text-gray-500">{{ $t('home.no_categories') }}</p>
            </div>
          </nav>
        </aside>

        <!-- Carousel principal -->
        <main class="w-full md:w-3/4 h-full md:h-full">
          <UCarousel
            v-slot="{ item }"
            :items="mainItems"
            arrows
            dots
            :autoplay="{ delay: 3000 }"
            class="relative h-full rounded-sm overflow-hidden shadow-sm"
            :prev="{ variant: 'solid' }"
            :next="{ variant: 'solid' }"
            :ui="{ prev: 'sm:start-6', next: 'sm:end-6' }"
            aria-label="Carousel des promotions principales">
            <div class="relative w-full h-full">
              <NuxtLink :to="item.link ?? '#'" class="block w-full h-full">
                <img
                  :src="item.image"
                  :alt="item.label"
                  class="w-full h-full object-fill"
                  :fetchpriority="mainItems.indexOf(item) === 0 ? 'high' : 'auto'"
                  :loading="mainItems.indexOf(item) === 0 ? 'eager' : 'lazy'"
                  decoding="async"
                  width="1200"
                  height="420" />
              </NuxtLink>
            </div>
          </UCarousel>
        </main>

      </div>
    </section>

    <!-- ═══════════════ MOBILE CATEGORIES ═══════════════ -->
    <section
      :aria-label="$t('home.categories_label')"
      class="md:hidden w-full overflow-x-auto no-scrollbar py-3 px-3 bg-white mt-3 border-b border-gray-200">
      <div class="flex gap-3 w-max" role="list">
        <NuxtLink
          v-for="cat in categoriesData"
          :key="cat.slug"
          :to="`/categories/${cat.slug}`"
          role="listitem"
          class="flex flex-col items-center min-w-[68px] text-center gap-1 active:scale-95 transition-transform">
          <div class="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-[#274a82]" aria-hidden="true">
            <UIcon :name="getIcon(cat.slug)" class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold text-gray-600 whitespace-nowrap">{{ cat.label }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ═══════════════ MEILLEURES VENTES ═══════════════ -->
    <section aria-label="Meilleures ventes" class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          {{ $t('home.best_sellers_title') }}
        </h2>
        <NuxtLink
          to="/boutique?sort=best_seller"
          class="hidden sm:flex text-[13px] font-black text-[#274a82] hover:text-[#e60012] items-center gap-1 transition-colors group whitespace-nowrap">
          {{ $t('home.see_more') }} <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div v-if="loadingBest" class="flex gap-2 overflow-x-auto no-scrollbar" aria-busy="true" aria-label="Chargement des meilleures ventes">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm" />
          <div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full" /><div class="h-4 bg-gray-100 rounded w-2/3" /></div>
        </div>
      </div>
      <div v-else-if="bestProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
        <UIcon name="i-heroicons-shopping-bag" class="w-10 h-10 text-gray-200" aria-hidden="true" />
        <p class="text-sm font-medium">{{ $t('home.best_sellers_empty') }}</p>
      </div>
      <UCarousel
        v-else
        v-slot="{ item: p }"
        :items="bestProducts"
        arrows
        :ui="carouselUI"
        :autoplay="{ delay: 3000 }"
        aria-label="Carousel meilleures ventes">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div
            class="relative h-52 w-full overflow-hidden"
            @mouseenter="setHover(`best:${p.id}`, true)"
            @mouseleave="setHover(`best:${p.id}`, false)">
            <!-- ✅ FIX : bouton wishlist avec aria-label descriptif -->
            <div class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
              <button
                class="w-8 h-8 shadow-md rounded-full flex items-center justify-center transition-colors"
                :class="isFav(p.id) ? 'bg-white text-[#e60012]' : 'bg-white text-gray-400 hover:text-white hover:bg-[#e60012]'"
                @click.prevent.stop="addToWishlist(p)"
                :aria-label="isFav(p.id) ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`">
                <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm" aria-label="`Réduction de ${discountPercent(p)}`">
              {{ discountPercent(p) }}
            </div>
            <img
              :src="hoveredKeys.has(`best:${p.id}`) ? getImageHover(p) : getImage(p)"
              :alt="p.name"
              loading="lazy"
              decoding="async"
              width="200"
              height="200"
              class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" />
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-[13px] sm:text-[14px] text-[#274a82] font-bold line-clamp-2 leading-snug mt-0.5 mb-2 h-8 sm:h-10 overflow-hidden group-hover:text-[#e60012] transition-colors">
              {{ p.name }}
            </h3>
            <div class="mt-2">
              <div class="text-lg sm:text-2xl font-black text-gray-900 mb-0.5 leading-tight">
                {{ formatPrice(p.price) }} <span class="text-[9px] sm:text-[11px] font-semibold">{{ $t('home.currency') }}</span>
              </div>
              <span v-if="p.old_price" class="text-[10px] sm:text-[12px] text-[#e60012] line-through" :aria-label="`Ancien prix : ${formatPrice(p.old_price)} ${$t('home.currency')}`">
                {{ formatPrice(p.old_price) }} {{ $t('home.currency') }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ NOUVEAUTÉS ═══════════════ -->
    <section aria-label="Nouveautés" class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          {{ $t('home.new_title') }}
        </h2>
        <NuxtLink
          to="/boutique?sort=new"
          class="hidden sm:flex text-[13px] font-black text-[#274a82] hover:text-[#e60012] items-center gap-1 transition-colors group whitespace-nowrap">
          {{ $t('home.see_more') }} <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div v-if="loadingRecent" class="flex gap-2 overflow-x-auto no-scrollbar" aria-busy="true" aria-label="Chargement des nouveautés">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm" /><div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full" /><div class="h-4 bg-gray-100 rounded w-2/3" /></div>
        </div>
      </div>
      <div v-else-if="recentProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
        <UIcon name="i-heroicons-sparkles" class="w-10 h-10 text-gray-200" aria-hidden="true" />
        <p class="text-sm font-medium">{{ $t('home.new_empty') }}</p>
      </div>
      <UCarousel
        v-else
        v-slot="{ item: p }"
        :items="recentProducts"
        arrows
        :ui="carouselUI"
        :autoplay="{ delay: 3000 }"
        aria-label="Carousel nouveautés">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div
            class="relative h-52 w-full overflow-hidden"
            @mouseenter="setHover(`new:${p.id}`, true)"
            @mouseleave="setHover(`new:${p.id}`, false)">
            <div class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
              <button
                class="w-8 h-8 shadow-md rounded-full flex items-center justify-center transition-colors"
                :class="isFav(p.id) ? 'bg-white text-[#e60012]' : 'bg-white text-gray-400 hover:text-white hover:bg-[#e60012]'"
                @click.prevent.stop="addToWishlist(p)"
                :aria-label="isFav(p.id) ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`">
                <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">
              {{ discountPercent(p) }}
            </div>
            <img
              :src="hoveredKeys.has(`new:${p.id}`) ? getImageHover(p) : getImage(p)"
              :alt="p.name"
              loading="lazy"
              decoding="async"
              width="200"
              height="200"
              class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" />
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-[13px] sm:text-[14px] text-[#274a82] font-bold line-clamp-2 leading-snug mt-0.5 mb-2 h-8 sm:h-10 overflow-hidden group-hover:text-[#e60012] transition-colors">
              {{ p.name }}
            </h3>
            <div class="mt-2">
              <div class="text-lg sm:text-2xl font-black text-gray-900 mb-0.5 leading-tight">
                {{ formatPrice(p.price) }} <span class="text-[9px] sm:text-[11px] font-semibold">{{ $t('home.currency') }}</span>
              </div>
              <span v-if="p.old_price" class="text-[10px] sm:text-[12px] text-[#e60012] line-through" :aria-label="`Ancien prix : ${formatPrice(p.old_price)} ${$t('home.currency')}`">
                {{ formatPrice(p.old_price) }} {{ $t('home.currency') }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ QUARTET BANNER ═══════════════ -->
    <!-- ✅ FIX : suppression de aria-hidden sur section avec des liens navigables -->
    <section aria-label="Sélection produits en vedette" class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <UCarousel
        v-slot="{ item: card }"
        :items="quartetCards"
        arrows
        :autoplay="{ delay: 3000 }"
        :ui="{ item: 'basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 px-1.5', container: 'py-1' }"
        aria-label="Carousel sélection produits">
        <NuxtLink :to="card.link" class="quartet-card relative h-[180px] sm:h-[220px] md:h-[280px] overflow-hidden shadow-lg rounded-sm block w-full">
          <!-- ✅ FIX : alt descriptif au lieu de générique -->
          <img
            :src="card.image"
            :alt="card.label"
            loading="lazy"
            decoding="async"
            width="400"
            height="280"
            class="quartet-img w-full h-full object-fill" />
          <div class="quartet-overlay absolute inset-0 bg-black/0 transition-all duration-500" aria-hidden="true" />
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ SPECIAL PROMO ═══════════════ -->
    <section aria-label="Promotions spéciales" class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          {{ $t('home.promo_title') }}
        </h2>
        <NuxtLink
          to="/boutique?promo=1"
          class="hidden sm:flex text-[13px] font-black text-[#274a82] hover:text-[#e60012] items-center gap-1 transition-colors group whitespace-nowrap">
          {{ $t('home.see_more') }} <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div v-if="loadingPromos" class="flex gap-2 overflow-x-auto no-scrollbar" aria-busy="true" aria-label="Chargement des promotions">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm" /><div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full" /><div class="h-4 bg-gray-100 rounded w-2/3" /></div>
        </div>
      </div>
      <div v-else-if="promosProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
        <UIcon name="i-heroicons-sparkles" class="w-10 h-10 text-gray-200" aria-hidden="true" />
        <p class="text-sm font-medium">{{ $t('home.promo_empty') }}</p>
      </div>
      <UCarousel
        v-else
        v-slot="{ item: p }"
        :items="promosProducts"
        arrows
        :ui="carouselUI"
        :autoplay="{ delay: 3000 }"
        aria-label="Carousel promotions">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div
            class="relative h-52 w-full overflow-hidden"
            @mouseenter="setHover(`promo:${p.id}`, true)"
            @mouseleave="setHover(`promo:${p.id}`, false)">
            <div class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
              <button
                class="w-8 h-8 shadow-md rounded-full flex items-center justify-center transition-colors"
                :class="isFav(p.id) ? 'bg-white text-[#e60012]' : 'bg-white text-gray-400 hover:text-white hover:bg-[#e60012]'"
                @click.prevent.stop="addToWishlist(p)"
                :aria-label="isFav(p.id) ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`">
                <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">
              {{ discountPercent(p) }}
            </div>
            <img
              :src="hoveredKeys.has(`promo:${p.id}`) ? getImageHover(p) : getImage(p)"
              :alt="p.name"
              loading="lazy"
              decoding="async"
              width="200"
              height="200"
              class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" />
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-[13px] sm:text-[14px] text-[#274a82] font-bold line-clamp-2 leading-snug mt-0.5 mb-2 h-8 sm:h-10 overflow-hidden group-hover:text-[#e60012] transition-colors">
              {{ p.name }}
            </h3>
            <div class="mt-2">
              <div class="text-lg sm:text-2xl font-black text-gray-900 mb-0.5 leading-tight">
                {{ formatPrice(p.price) }} <span class="text-[9px] sm:text-[11px] font-semibold">{{ $t('home.currency') }}</span>
              </div>
              <span v-if="p.old_price" class="text-[10px] sm:text-[12px] text-[#e60012] line-through" :aria-label="`Ancien prix : ${formatPrice(p.old_price)} ${$t('home.currency')}`">
                {{ formatPrice(p.old_price) }} {{ $t('home.currency') }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ BANNER DUO 1 ═══════════════ -->
    <!-- ✅ FIX : section avec liens navigables, pas aria-hidden -->
    <section aria-label="Sélection imprimantes, caméras, réseaux et ordinateurs" class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="relative h-[200px] sm:h-[200px] md:h-[350px] overflow-hidden shadow-lg rounded-sm">
          <TransitionGroup name="fade">
            <NuxtLink
              v-for="(img, i) in leftImages"
              :key="img.src"
              v-show="leftIndex === i"
              :to="img.link"
              class="absolute inset-0 w-full h-full block group">
              <img
                :src="img.src"
                :alt="img.label"
                loading="lazy"
                decoding="async"
                width="600"
                height="350"
                class="w-full h-full object-fill group-hover:scale-110 transition-transform duration-1000" />
            </NuxtLink>
          </TransitionGroup>
        </div>
        <div class="relative h-[200px] sm:h-[200px] md:h-[350px] overflow-hidden shadow-lg rounded-sm">
          <TransitionGroup name="fade">
            <NuxtLink
              v-for="(img, i) in rightImages"
              :key="img.src"
              v-show="rightIndex === i"
              :to="img.link"
              class="absolute inset-0 w-full h-full block group">
              <img
                :src="img.src"
                :alt="img.label"
                loading="lazy"
                decoding="async"
                width="600"
                height="350"
                class="w-full h-full object-fill group-hover:scale-110 transition-transform duration-1000" />
            </NuxtLink>
          </TransitionGroup>
        </div>
      </div>
    </section>

    <!-- ═══════════════ RÉSEAUX PRO ═══════════════ -->
    <section aria-label="Matériels réseaux" class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          {{ $t('home.network_title') }}
        </h2>
        <NuxtLink
          to="/categories/materiels-reseaux"
          class="hidden sm:flex text-[13px] font-black text-[#274a82] hover:text-[#e60012] items-center gap-1 transition-colors group whitespace-nowrap">
          {{ $t('home.see_more') }} <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div v-if="loadingNetwork" class="flex gap-2 overflow-x-auto no-scrollbar" aria-busy="true" aria-label="Chargement matériels réseaux">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm" /><div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full" /><div class="h-4 bg-gray-100 rounded w-2/3" /></div>
        </div>
      </div>
      <div v-else-if="networkProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
        <UIcon name="i-heroicons-wifi" class="w-10 h-10 text-gray-200" aria-hidden="true" />
        <p class="text-sm font-medium">{{ $t('home.network_empty') }}</p>
      </div>
      <UCarousel
        v-else
        v-slot="{ item: p }"
        :items="networkProducts"
        arrows
        :ui="carouselUI"
        :autoplay="{ delay: 3000 }"
        aria-label="Carousel matériels réseaux">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div
            class="relative h-52 w-full overflow-hidden"
            @mouseenter="setHover(`net:${p.id}`, true)"
            @mouseleave="setHover(`net:${p.id}`, false)">
            <div class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
              <button
                class="w-8 h-8 shadow-md rounded-full flex items-center justify-center transition-colors"
                :class="isFav(p.id) ? 'bg-white text-[#e60012]' : 'bg-white text-gray-400 hover:text-white hover:bg-[#e60012]'"
                @click.prevent.stop="addToWishlist(p)"
                :aria-label="isFav(p.id) ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`">
                <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">
              {{ discountPercent(p) }}
            </div>
            <img
              :src="hoveredKeys.has(`net:${p.id}`) ? getImageHover(p) : getImage(p)"
              :alt="p.name"
              loading="lazy"
              decoding="async"
              width="200"
              height="200"
              class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" />
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-[13px] sm:text-[14px] text-[#274a82] font-bold line-clamp-2 leading-snug mt-0.5 mb-2 h-8 sm:h-10 overflow-hidden group-hover:text-[#e60012] transition-colors">
              {{ p.name }}
            </h3>
            <div class="mt-2">
              <div class="text-lg sm:text-2xl font-black text-gray-900 mb-0.5 leading-tight">
                {{ formatPrice(p.price) }} <span class="text-[9px] sm:text-[11px] font-semibold">{{ $t('home.currency') }}</span>
              </div>
              <span v-if="p.old_price" class="text-[10px] sm:text-[12px] text-[#e60012] line-through" :aria-label="`Ancien prix : ${formatPrice(p.old_price)} ${$t('home.currency')}`">
                {{ formatPrice(p.old_price) }} {{ $t('home.currency') }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ IMPRIMANTES & SCANNERS ═══════════════ -->
    <section aria-label="Imprimantes et scanners" class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          {{ $t('home.printers_title') }}
        </h2>
        <NuxtLink
          to="/categories/imprimantes-et-scanners"
          class="hidden sm:flex text-[13px] font-black text-[#274a82] hover:text-[#e60012] items-center gap-1 transition-colors group whitespace-nowrap">
          {{ $t('home.see_more') }} <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div v-if="loadingPrinters" class="flex gap-2 overflow-x-auto no-scrollbar" aria-busy="true" aria-label="Chargement imprimantes">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm" /><div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full" /><div class="h-4 bg-gray-100 rounded w-2/3" /></div>
        </div>
      </div>
      <div v-else-if="printingProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
        <UIcon name="i-heroicons-printer" class="w-10 h-10 text-gray-200" aria-hidden="true" />
        <p class="text-sm font-medium">{{ $t('home.printers_empty') }}</p>
      </div>
      <UCarousel
        v-else
        v-slot="{ item: p }"
        :items="printingProducts"
        arrows
        :ui="carouselUI"
        :autoplay="{ delay: 3000 }"
        aria-label="Carousel imprimantes et scanners">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div
            class="relative h-52 w-full overflow-hidden"
            @mouseenter="setHover(`prin:${p.id}`, true)"
            @mouseleave="setHover(`prin:${p.id}`, false)">
            <div class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
              <button
                class="w-8 h-8 shadow-md rounded-full flex items-center justify-center transition-colors"
                :class="isFav(p.id) ? 'bg-white text-[#e60012]' : 'bg-white text-gray-400 hover:text-white hover:bg-[#e60012]'"
                @click.prevent.stop="addToWishlist(p)"
                :aria-label="isFav(p.id) ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`">
                <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">
              {{ discountPercent(p) }}
            </div>
            <img
              :src="hoveredKeys.has(`prin:${p.id}`) ? getImageHover(p) : getImage(p)"
              :alt="p.name"
              loading="lazy"
              decoding="async"
              width="200"
              height="200"
              class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" />
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-[13px] sm:text-[14px] text-[#274a82] font-bold line-clamp-2 leading-snug mt-0.5 mb-2 h-8 sm:h-10 overflow-hidden group-hover:text-[#e60012] transition-colors">
              {{ p.name }}
            </h3>
            <div class="mt-2">
              <div class="text-lg sm:text-2xl font-black text-gray-900 mb-0.5 leading-tight">
                {{ formatPrice(p.price) }} <span class="text-[9px] sm:text-[11px] font-semibold">{{ $t('home.currency') }}</span>
              </div>
              <span v-if="p.old_price" class="text-[10px] sm:text-[12px] text-[#e60012] line-through" :aria-label="`Ancien prix : ${formatPrice(p.old_price)} ${$t('home.currency')}`">
                {{ formatPrice(p.old_price) }} {{ $t('home.currency') }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ TRIO BANNER ═══════════════ -->
    <section aria-label="Produits à la une" class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <NuxtLink
          v-for="(card, i) in trioCards"
          :key="i"
          :to="card.link"
          class="quartet-card relative h-[240px] sm:h-[240px] md:h-[300px] overflow-hidden shadow-lg rounded-sm block">
          <img
            :src="card.images[0]"
            :alt="card.label"
            loading="lazy"
            decoding="async"
            width="400"
            height="300"
            class="quartet-img w-full h-full object-fill" />
          <div class="quartet-overlay absolute inset-0 bg-black/0 transition-all duration-500" aria-hidden="true" />
        </NuxtLink>
      </div>
    </section>

    <!-- ═══════════════ ACCESSOIRES ═══════════════ -->
    <section aria-label="Accessoires ordinateurs" class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          {{ $t('home.accessories_title') }}
        </h2>
        <NuxtLink
          to="/categories/ordinateurs/accessoires-ordinateurs"
          class="hidden sm:flex text-[13px] font-black text-[#274a82] hover:text-[#e60012] items-center gap-1 transition-colors group whitespace-nowrap">
          {{ $t('home.see_more') }} <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div v-if="loadingAccessories" class="flex gap-2 overflow-x-auto no-scrollbar" aria-busy="true" aria-label="Chargement accessoires">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm" /><div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full" /><div class="h-4 bg-gray-100 rounded w-2/3" /></div>
        </div>
      </div>
      <div v-else-if="accessoriesProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
        <UIcon name="i-heroicons-puzzle-piece" class="w-10 h-10 text-gray-200" aria-hidden="true" />
        <p class="text-sm font-medium">{{ $t('home.accessories_empty') }}</p>
      </div>
      <UCarousel
        v-else
        v-slot="{ item: p }"
        :items="accessoriesProducts"
        arrows
        :ui="carouselUI"
        :autoplay="{ delay: 3000 }"
        aria-label="Carousel accessoires ordinateurs">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div
            class="relative h-52 w-full overflow-hidden"
            @mouseenter="setHover(`acc:${p.id}`, true)"
            @mouseleave="setHover(`acc:${p.id}`, false)">
            <div class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
              <button
                class="w-8 h-8 shadow-md rounded-full flex items-center justify-center transition-colors"
                :class="isFav(p.id) ? 'bg-white text-[#e60012]' : 'bg-white text-gray-400 hover:text-white hover:bg-[#e60012]'"
                @click.prevent.stop="addToWishlist(p)"
                :aria-label="isFav(p.id) ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`">
                <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">
              {{ discountPercent(p) }}
            </div>
            <img
              :src="hoveredKeys.has(`acc:${p.id}`) ? getImageHover(p) : getImage(p)"
              :alt="p.name"
              loading="lazy"
              decoding="async"
              width="200"
              height="200"
              class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" />
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-[13px] sm:text-[14px] text-[#274a82] font-bold line-clamp-2 leading-snug mt-0.5 mb-2 h-8 sm:h-10 overflow-hidden group-hover:text-[#e60012] transition-colors">
              {{ p.name }}
            </h3>
            <div class="mt-2 flex items-center justify-between gap-1">
              <div>
                <div class="text-lg sm:text-2xl font-black text-gray-900 mb-0.5 leading-tight">
                  {{ formatPrice(p.price) }} <span class="text-[9px] sm:text-[11px] font-semibold">{{ $t('home.currency') }}</span>
                </div>
                <span v-if="p.old_price" class="text-[10px] sm:text-[12px] text-[#e60012] line-through" :aria-label="`Ancien prix : ${formatPrice(p.old_price)} ${$t('home.currency')}`">
                  {{ formatPrice(p.old_price) }} {{ $t('home.currency') }}
                </span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ SÉCURITÉ ═══════════════ -->
    <section aria-label="Sécurité électronique" class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          {{ $t('home.security_title') }}
        </h2>
        <NuxtLink
          to="/categories/securite-electronique"
          class="hidden sm:flex text-[13px] font-black text-[#274a82] hover:text-[#e60012] items-center gap-1 transition-colors group whitespace-nowrap">
          {{ $t('home.see_more') }} <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div v-if="loadingSecurity" class="flex gap-2 overflow-x-auto no-scrollbar" aria-busy="true" aria-label="Chargement sécurité">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm" /><div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full" /><div class="h-4 bg-gray-100 rounded w-2/3" /></div>
        </div>
      </div>
      <div v-else-if="securityProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
        <UIcon name="i-heroicons-lock-closed" class="w-10 h-10 text-gray-200" aria-hidden="true" />
        <p class="text-sm font-medium">{{ $t('home.security_empty') }}</p>
      </div>
      <UCarousel
        v-else
        v-slot="{ item: p }"
        :items="securityProducts"
        arrows
        :ui="carouselUI"
        :autoplay="{ delay: 3000 }"
        aria-label="Carousel sécurité électronique">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div
            class="relative h-52 w-full overflow-hidden"
            @mouseenter="setHover(`sec:${p.id}`, true)"
            @mouseleave="setHover(`sec:${p.id}`, false)">
            <div class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
              <button
                class="w-8 h-8 shadow-md rounded-full flex items-center justify-center transition-colors"
                :class="isFav(p.id) ? 'bg-white text-[#e60012]' : 'bg-white text-gray-400 hover:text-white hover:bg-[#e60012]'"
                @click.prevent.stop="addToWishlist(p)"
                :aria-label="isFav(p.id) ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`">
                <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">
              {{ discountPercent(p) }}
            </div>
            <img
              :src="hoveredKeys.has(`sec:${p.id}`) ? getImageHover(p) : getImage(p)"
              :alt="p.name"
              loading="lazy"
              decoding="async"
              width="200"
              height="200"
              class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" />
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-[13px] sm:text-[14px] text-[#274a82] font-bold line-clamp-2 leading-snug mt-0.5 mb-2 h-8 sm:h-10 overflow-hidden group-hover:text-[#e60012] transition-colors">
              {{ p.name }}
            </h3>
            <div class="mt-2">
              <div class="text-lg sm:text-2xl font-black text-gray-900 mb-0.5 leading-tight">
                {{ formatPrice(p.price) }} <span class="text-[9px] sm:text-[11px] font-semibold">{{ $t('home.currency') }}</span>
              </div>
              <span v-if="p.old_price" class="text-[10px] sm:text-[12px] text-[#e60012] line-through" :aria-label="`Ancien prix : ${formatPrice(p.old_price)} ${$t('home.currency')}`">
                {{ formatPrice(p.old_price) }} {{ $t('home.currency') }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ BANNER DUO 2 ═══════════════ -->
    <section aria-label="Sélection stockage, électricité et smartphones" class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="relative h-[240px] sm:h-[300px] md:h-[420px] overflow-hidden shadow-lg rounded-sm">
          <TransitionGroup name="zoom">
            <NuxtLink
              v-for="(img, i) in duo2Left"
              :key="img.src"
              v-show="duo2LeftIndex === i"
              :to="img.link"
              class="absolute inset-0 w-full h-full block group">
              <img
                :src="img.src"
                :alt="img.label"
                loading="lazy"
                decoding="async"
                width="600"
                height="420"
                class="w-full h-full object-fill group-hover:scale-110 transition-transform duration-1000" />
            </NuxtLink>
          </TransitionGroup>
        </div>
        <div class="relative h-[240px] sm:h-[300px] md:h-[420px] overflow-hidden shadow-lg rounded-sm">
          <TransitionGroup name="slide">
            <NuxtLink
              v-for="(img, i) in duo2Right"
              :key="img.src"
              v-show="duo2RightIndex === i"
              :to="img.link"
              class="absolute inset-0 w-full h-full block group">
              <img
                :src="img.src"
                :alt="img.label"
                loading="lazy"
                decoding="async"
                width="600"
                height="420"
                class="w-full h-full object-fill group-hover:scale-110 transition-transform duration-1000" />
            </NuxtLink>
          </TransitionGroup>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SMARTPHONES ═══════════════ -->
    <section aria-label="Smartphones et tablettes" class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          {{ $t('home.smartphones_title') }}
        </h2>
        <NuxtLink
          to="/categories/smartphones-et-tablettes"
          class="hidden sm:flex text-[13px] font-black text-[#274a82] hover:text-[#e60012] items-center gap-1 transition-colors group whitespace-nowrap">
          {{ $t('home.see_more') }} <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div v-if="loadingSmartphones" class="flex gap-2 overflow-x-auto no-scrollbar" aria-busy="true" aria-label="Chargement smartphones">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm" /><div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full" /><div class="h-4 bg-gray-100 rounded w-2/3" /></div>
        </div>
      </div>
      <div v-else-if="smartphoneProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
        <UIcon name="i-heroicons-device-phone-mobile" class="w-10 h-10 text-gray-200" aria-hidden="true" />
        <p class="text-sm font-medium">{{ $t('home.smartphones_empty') }}</p>
      </div>
      <UCarousel
        v-else
        v-slot="{ item: p }"
        :items="smartphoneProducts"
        arrows
        :ui="carouselUI"
        :autoplay="{ delay: 3000 }"
        aria-label="Carousel smartphones et tablettes">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div
            class="relative h-52 w-full overflow-hidden"
            @mouseenter="setHover(`smt:${p.id}`, true)"
            @mouseleave="setHover(`smt:${p.id}`, false)">
            <div class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
              <button
                class="w-8 h-8 shadow-md rounded-full flex items-center justify-center transition-colors"
                :class="isFav(p.id) ? 'bg-white text-[#e60012]' : 'bg-white text-gray-400 hover:text-white hover:bg-[#e60012]'"
                @click.prevent.stop="addToWishlist(p)"
                :aria-label="isFav(p.id) ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`">
                <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">
              {{ discountPercent(p) }}
            </div>
            <img
              :src="hoveredKeys.has(`smt:${p.id}`) ? getImageHover(p) : getImage(p)"
              :alt="p.name"
              loading="lazy"
              decoding="async"
              width="200"
              height="200"
              class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" />
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-[13px] sm:text-[14px] text-[#274a82] font-bold line-clamp-2 leading-snug mt-0.5 mb-2 h-8 sm:h-10 overflow-hidden group-hover:text-[#e60012] transition-colors">
              {{ p.name }}
            </h3>
            <div class="mt-2">
              <div class="text-lg sm:text-2xl font-black text-gray-900 mb-0.5 leading-tight">
                {{ formatPrice(p.price) }} <span class="text-[9px] sm:text-[11px] font-semibold">{{ $t('home.currency') }}</span>
              </div>
              <span v-if="p.old_price" class="text-[10px] sm:text-[12px] text-[#e60012] line-through" :aria-label="`Ancien prix : ${formatPrice(p.old_price)} ${$t('home.currency')}`">
                {{ formatPrice(p.old_price) }} {{ $t('home.currency') }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ ÉCRANS ═══════════════ -->
    <section aria-label="Écrans ordinateurs" class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          {{ $t('home.screens_title') }}
        </h2>
        <NuxtLink
          to="/categories/ordinateurs/ecran-ordinateur"
          class="hidden sm:flex text-[13px] font-black text-[#274a82] hover:text-[#e60012] items-center gap-1 transition-colors group whitespace-nowrap">
          {{ $t('home.see_more') }} <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div v-if="loadingScreens" class="flex gap-2 overflow-x-auto no-scrollbar" aria-busy="true" aria-label="Chargement écrans">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm" /><div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full" /><div class="h-4 bg-gray-100 rounded w-2/3" /></div>
        </div>
      </div>
      <div v-else-if="screensProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
        <UIcon name="i-heroicons-tv" class="w-10 h-10 text-gray-200" aria-hidden="true" />
        <p class="text-sm font-medium">{{ $t('home.screens_empty') }}</p>
      </div>
      <UCarousel
        v-else
        v-slot="{ item: p }"
        :items="screensProducts"
        arrows
        :ui="carouselUI"
        :autoplay="{ delay: 3000 }"
        aria-label="Carousel écrans ordinateurs">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div
            class="relative h-52 w-full overflow-hidden"
            @mouseenter="setHover(`scr:${p.id}`, true)"
            @mouseleave="setHover(`scr:${p.id}`, false)">
            <div class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
              <button
                class="w-8 h-8 shadow-md rounded-full flex items-center justify-center transition-colors"
                :class="isFav(p.id) ? 'bg-white text-[#e60012]' : 'bg-white text-gray-400 hover:text-white hover:bg-[#e60012]'"
                @click.prevent.stop="addToWishlist(p)"
                :aria-label="isFav(p.id) ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`">
                <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">
              {{ discountPercent(p) }}
            </div>
            <img
              :src="hoveredKeys.has(`scr:${p.id}`) ? getImageHover(p) : getImage(p)"
              :alt="p.name"
              loading="lazy"
              decoding="async"
              width="200"
              height="200"
              class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" />
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-[13px] sm:text-[14px] text-[#274a82] font-bold line-clamp-2 leading-snug mt-0.5 mb-2 h-8 sm:h-10 overflow-hidden group-hover:text-[#e60012] transition-colors">
              {{ p.name }}
            </h3>
            <div class="mt-2">
              <div class="text-lg sm:text-2xl font-black text-gray-900 mb-0.5 leading-tight">
                {{ formatPrice(p.price) }} <span class="text-[9px] sm:text-[11px] font-semibold">{{ $t('home.currency') }}</span>
              </div>
              <span v-if="p.old_price" class="text-[10px] sm:text-[12px] text-[#e60012] line-through" :aria-label="`Ancien prix : ${formatPrice(p.old_price)} ${$t('home.currency')}`">
                {{ formatPrice(p.old_price) }} {{ $t('home.currency') }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ MARQUES ═══════════════ -->
    <section aria-label="Nos marques partenaires" class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          {{ $t('home.brands_title') }}
        </h2>
        <NuxtLink
          to="#"
          class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">
          {{ $t('home.see_all_short') }} <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </NuxtLink>
      </div>
      <UCarousel
        v-slot="{ item }"
        :items="brands"
        :autoplay="{ delay: 2000 }"
        :ui="{ item: 'basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 px-2', container: 'py-4' }"
        indicators
        arrows
        class="rounded-lg"
        aria-label="Carousel marques partenaires">
        <div class="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 text-center">
          <div class="h-16 sm:h-24 flex items-center justify-center mb-2 sm:mb-4">
            <img
              :src="item.img"
              :alt="`Logo ${item.name}`"
              loading="lazy"
              decoding="async"
              width="120"
              height="60"
              class="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
              draggable="false" />
          </div>
          <span class="text-xs sm:text-sm font-bold text-gray-600 group-hover:text-[#e60012] transition-colors">
            {{ item.name }}
          </span>
        </div>
      </UCarousel>
    </section>

    <!-- ═══════════════ VOUS N'AVEZ PAS TROUVÉ ═══════════════ -->
    <section aria-label="Produits mis en avant" class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          <span class="hidden sm:inline">{{ $t('home.featured_title_desktop') }}</span>
          <span class="sm:hidden">{{ $t('home.featured_title_mobile') }}</span>
        </h2>
        <NuxtLink
          to="/boutique"
          class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">
          {{ $t('home.see_more') }} <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div v-if="loadingFeatured" class="flex gap-2 overflow-x-auto no-scrollbar" aria-busy="true" aria-label="Chargement produits mis en avant">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm" /><div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full" /><div class="h-4 bg-gray-100 rounded w-2/3" /></div>
        </div>
      </div>
      <div v-else-if="featuredProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
        <UIcon name="i-heroicons-magnifying-glass" class="w-10 h-10 text-gray-200" aria-hidden="true" />
        <p class="text-sm font-medium">{{ $t('home.featured_empty') }}</p>
      </div>
      <UCarousel
        v-else
        v-slot="{ item: p }"
        :items="featuredProducts"
        arrows
        :ui="carouselUI"
        :autoplay="{ delay: 3000 }"
        aria-label="Carousel produits mis en avant">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div
            class="relative h-52 w-full overflow-hidden"
            @mouseenter="setHover(`fea:${p.id}`, true)"
            @mouseleave="setHover(`fea:${p.id}`, false)">
            <div class="hidden sm:flex absolute right-[-50px] group-hover:right-3 top-3 flex-col gap-2 z-30 transition-all duration-300">
              <button
                class="w-8 h-8 shadow-md rounded-full flex items-center justify-center transition-colors"
                :class="isFav(p.id) ? 'bg-white text-[#e60012]' : 'bg-white text-gray-400 hover:text-white hover:bg-[#e60012]'"
                @click.prevent.stop="addToWishlist(p)"
                :aria-label="isFav(p.id) ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`">
                <UIcon :name="isFav(p.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">
              {{ discountPercent(p) }}
            </div>
            <img
              :src="hoveredKeys.has(`fea:${p.id}`) ? getImageHover(p) : getImage(p)"
              :alt="p.name"
              loading="lazy"
              decoding="async"
              width="200"
              height="200"
              class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-110 pointer-events-none"
              style="backface-visibility: hidden; transform: translateZ(0);" />
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-[13px] sm:text-[14px] text-[#274a82] font-bold line-clamp-2 leading-snug mt-0.5 mb-2 h-8 sm:h-10 overflow-hidden group-hover:text-[#e60012] transition-colors">
              {{ p.name }}
            </h3>
            <div class="mt-2">
              <div class="text-lg sm:text-2xl font-black text-gray-900 mb-0.5 leading-tight">
                {{ formatPrice(p.price) }} <span class="text-[9px] sm:text-[11px] font-semibold">{{ $t('home.currency') }}</span>
              </div>
              <span v-if="p.old_price" class="text-[10px] sm:text-[12px] text-[#e60012] line-through" :aria-label="`Ancien prix : ${formatPrice(p.old_price)} ${$t('home.currency')}`">
                {{ formatPrice(p.old_price) }} {{ $t('home.currency') }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ À PROPOS ═══════════════ -->
    <section aria-label="À propos de BRC Market" class="max-w-7xl mx-auto px-3 sm:px-4 my-4 sm:my-4">
      <div class="border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-sm sm:text-lg font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] inline-block mb-[-1px] tracking-tight">
          {{ $t('home.about_title') }}
        </h2>
      </div>
      <div class="space-y-3 sm:space-y-4">
        <p class="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
          {{ $t('home.about_intro', { brand: 'BRC Market' }) }}
        </p>
        <div v-if="isExpanded" class="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-3">
          <p>{{ $t('home.about_brands', { brands: 'HP, DELL, APPLE, LENOVO, MICROSOFT, SAMSUNG, CANON, EPSON, LOGITECH, ASUS, ACER, TP-LINK, CISCO' }) }}</p>
          <p>{{ $t('home.about_support', { brand: 'BRC Market' }) }}</p>
        </div>
        <UButton
          variant="ghost"
          color="gray"
          class="p-0 hover:text-[#274a82] text-gray-900 font-bold flex items-center gap-1 text-xs sm:text-sm"
          :aria-expanded="isExpanded"
          @click="isExpanded = !isExpanded">
          {{ isExpanded ? $t('home.see_less') : $t('home.see_more_btn') }}
          <UIcon
            name="i-heroicons-chevron-down"
            class="transition-transform duration-300"
            :class="[isExpanded ? 'rotate-180' : '']"
            aria-hidden="true" />
        </UButton>
      </div>
    </section>

  </div>

  <!-- ═══════════════ BENEFITS ═══════════════ -->
  <section aria-label="Nos engagements" class="py-6 sm:py-8 border-t border-gray-200 bg-white">
    <UContainer>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div v-for="benefit in benefits" :key="benefit.title" class="flex items-center gap-3 sm:gap-4">
          <div class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#e60012] flex items-center justify-center" aria-hidden="true">
            <UIcon :name="benefit.icon" class="w-5 h-5 sm:w-6 sm:h-6 text-[#e60012]" />
          </div>
          <div>
            <h3 class="font-bold text-xs sm:text-sm leading-tight">{{ benefit.title }}</h3>
            <p class="text-[10px] sm:text-xs text-gray-600">{{ benefit.subtitle }}</p>
          </div>
        </div>
      </div>
    </UContainer>
  </section>

  <!-- ═══════════════ CTA ═══════════════ -->
  <div v-if="!isLoggedIn">
    <section aria-label="Connexion et inscription" class="bg-[#e60012] py-8 sm:py-10">
      <UContainer>
        <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div class="text-white space-y-1 sm:space-y-2 text-center lg:text-left">
            <h2 class="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
              {{ $t('home.cta_title') }}
            </h2>
            <p class="text-gray-300 text-xs sm:text-sm md:text-base font-medium">
              {{ $t('home.cta_sub') }}
            </p>
          </div>
          <div class="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
            <NuxtLink to="/login" class="w-full sm:w-auto">
              <UButton
                block
                size="lg"
                icon="i-heroicons-arrow-right-on-rectangle"
                :label="$t('home.cta_login')"
                class="bg-white hover:bg-gray-100 border-2 border-[#274a82] text-[#274a82] font-bold px-6 sm:px-10 rounded-sm" />
            </NuxtLink>
            <NuxtLink to="/register" class="w-full sm:w-auto">
              <UButton
                block
                size="lg"
                icon="i-heroicons-user-plus"
                :label="$t('home.cta_register')"
                class="bg-[#274a82] hover:bg-[#274a75] border-2 border-white text-white font-bold px-6 sm:px-10 rounded-sm" />
            </NuxtLink>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.8s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

.quartet-img { transition: transform 0.6s ease-in-out; }
.quartet-card:hover .quartet-img { transform: scale(1.1); }
.quartet-card:hover .quartet-overlay { background-color: rgba(0, 0, 0, 0.15); }

.zoom-enter-active  { animation: zoomIn 0.8s ease-out; }
.zoom-leave-active  { animation: zoomOut 0.5s ease-in; }
@keyframes zoomIn   { 0% { opacity: 0; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
@keyframes zoomOut  { 0% { opacity: 1; transform: scale(1);   } 100% { opacity: 0; transform: scale(0.95); } }

.slide-enter-active { animation: slideIn 0.7s ease-out; }
.slide-leave-active { animation: slideOut 0.4s ease-in; }
@keyframes slideIn  { 0% { opacity: 0; transform: translateX(40px); } 100% { opacity: 1; transform: translateX(0); } }
@keyframes slideOut { 0% { opacity: 1; transform: translateX(0);     } 100% { opacity: 0; transform: translateX(-40px); } }
</style>