<script setup lang="ts">

useHead({
  title: 'BRC Market',
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Accueil` : 'BRC Market';
  },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

const token  = useCookie('auth_token')
const isLoggedIn = computed(() => !!token.value)

/* ═══════════════ TYPES ═══════════════ */
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

/* ═══════════════ CONFIG ═══════════════ */
const config = useRuntimeConfig()
const API    = config.public.apiBase

/* ═══════════════ HELPERS ═══════════════ */
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

/* ═══════════════ HOVER IMAGE ═══════════════ */
const hoveredKeys = ref<Set<string>>(new Set())

const setHover = (key: string, on: boolean) => {
  const s = new Set(hoveredKeys.value)
  on ? s.add(key) : s.delete(key)
  hoveredKeys.value = s
}

const handleLeave = (key: string, e: MouseEvent) => {
  const to = e.relatedTarget as HTMLElement | null
  // Si relatedTarget est null → la souris va vers le drawer/overlay (hors DOM normal)
  // On ne reset PAS le hover dans ce cas
  if (!to) return
  setHover(key, false)
}

/* ═══════════════ PANIER & WISHLIST ═══════════════ */
const { addToCart: addToCartStore }           = useCart()
const { isFav, toggleWishlist, initWishlist } = useWishlist()

const addToCart     = (p: Product) => {
  if (isOutOfStock(p)) return
  addToCartStore({ id: p.id, slug: p.slug, name: p.name, price: p.price, image: getImage(p) })
}
const addToWishlist = (p: Product) => toggleWishlist(p.id, p.name)

/* ═══════════════ FETCH GÉNÉRIQUE ═══════════════ */
const fetchProductsBy = async (params: Record<string, any>): Promise<Product[]> => {
  try {
    const data = await $fetch<any>(`${API}/products`, { params })
    return data.data ?? []
  } catch (e) {
    console.error('Erreur fetch produits:', e)
    return []
  }
}

const leftImages = [
  { src: '/images/offres/imprimante_et_scanner.png',  link: '/categories/securite-electronique/camera' },
  { src: '/images/offres/desktops.png',  link: '/categories/ordinateurs/desktops' },
]

const rightImages = [
  { src: '/images/offres/camera.png', link: '/categories/securite-electronique/camera' },
  { src: '/images/offres/routeur_access_point.png',    link: '/categories/securite-electronique/camera' },
]

const leftIndex  = ref(0)
const rightIndex = ref(0)

// ── TRIO BANNER ────────────────────────────────────────────────────────────────
const trioCards = [
  {
    images: ['/images/offres/tv_trio.png', '/images/offres/tv2_trio.png'],
    btn: { text: 'Découvrir', class: 'bg-white text-[#274a82] hover:bg-[#e60012] hover:text-white' },
    link: '/categories/stations-de-travail',
    span: '',
  },
  {
    images: ['/images/offres/serveur_et_licence_trio.png', '/images/offres/serveur_et_licence2_trio.png'],
    btn: { text: "Voir l'offre", class: 'bg-[#e60012] text-white hover:bg-white hover:text-[#e60012]' },
    link: '/categories/materiels-reseaux',
  },
  {
    images: ['/images/publicity3.jpg', '/images/publicity6.jpg'],
    btn: { text: 'Prendre RDV', class: 'border border-white text-white hover:bg-white hover:text-black' },
    link: '/services/maintenance',
  },
]
const trioIndexes = ref([0, 0, 0])

// ── BANNER DUO 2 ───────────────────────────────────────────────────────────────
const duo2Left = [
  { src: '/images/offres/accessoires_ordinateurs.png', link: '/boutique?promo=1' },
  { src: '/images/publicity6.jpg', link: '/boutique?promo=1' },
]
const duo2Right = [
  { src: '/images/publicity5.jpg', link: '/categories/gadgets' },
  { src: '/images/publicity7.jpg', link: '/categories/accessoires' },
]
const duo2LeftIndex  = ref(0)
const duo2RightIndex = ref(0)

/* ═══════════════ SECTIONS PRODUITS ═══════════════ */
const bestProducts        = ref<Product[]>([])
const loadingBest         = ref(false)

const recentProducts      = ref<Product[]>([])
const loadingRecent       = ref(false)

const networkProducts     = ref<Product[]>([])
const loadingNetwork      = ref(false)

const printingProducts    = ref<Product[]>([])
const loadingPrinters     = ref(false)

const accessoriesProducts = ref<Product[]>([])
const loadingAccessories  = ref(false)

const securityProducts    = ref<Product[]>([])
const loadingSecurity     = ref(false)

const stockageProducts    = ref<Product[]>([])
const loadingStockage     = ref(false)

const gadgetsProducts     = ref<Product[]>([])
const loadingGadgets      = ref(false)

const smartphoneProducts  = ref<Product[]>([])
const loadingSmartphones  = ref(false)

const screensProducts     = ref<Product[]>([])
const loadingScreens      = ref(false)

const promosProducts      = ref<Product[]>([])
const loadingPromos       = ref(false)

const featuredProducts    = ref<Product[]>([])
const loadingFeatured     = ref(false)

const fetchAllSections = async () => {
  loadingBest.value = true
  bestProducts.value = await fetchProductsBy({ best_seller: 1, per_page: 8, sort: 'latest' })
  loadingBest.value = false

  loadingRecent.value = true
  recentProducts.value = await fetchProductsBy({ is_new: 1, per_page: 8, sort: 'latest' })
  loadingRecent.value = false

  loadingPromos.value = true
  promosProducts.value = await fetchProductsBy({ is_promoted: 1, per_page: 8, sort: 'latest' })
  loadingPromos.value = false

  loadingNetwork.value = true
  networkProducts.value = await fetchProductsBy({ category: 'materiels-reseaux', per_page: 8, sort: 'latest' })
  loadingNetwork.value = false

  loadingPrinters.value = true
  printingProducts.value = await fetchProductsBy({ category: 'imprimantes-et-scanners', per_page: 8, sort: 'latest' })
  loadingPrinters.value = false

  loadingAccessories.value = true
  accessoriesProducts.value = await fetchProductsBy({ category: 'accessoires', per_page: 8, sort: 'latest' })
  loadingAccessories.value = false

  loadingSecurity.value = true
  securityProducts.value = await fetchProductsBy({ category: 'securite-electronique', per_page: 8, sort: 'latest' })
  loadingSecurity.value = false

  loadingStockage.value = true
  stockageProducts.value = await fetchProductsBy({ category: 'stockage-et-nas', per_page: 8, sort: 'latest' })
  loadingStockage.value = false

  loadingGadgets.value = true
  gadgetsProducts.value = await fetchProductsBy({ category: 'gadgets', per_page: 8, sort: 'latest' })
  loadingGadgets.value = false

  loadingSmartphones.value = true
  smartphoneProducts.value = await fetchProductsBy({ category: 'smartphones-et-tablettes', per_page: 8, sort: 'latest' })
  loadingSmartphones.value = false

  loadingScreens.value = true
  screensProducts.value = await fetchProductsBy({ 
    'category[]': ['ecran', 'ecran-occasion'], 
    per_page: 8, 
    sort: 'latest' 
  })
  loadingScreens.value = false

  loadingFeatured.value = true
  featuredProducts.value = await fetchProductsBy({ featured: 1, per_page: 8, sort: 'latest' })
  loadingFeatured.value = false
}

/* ═══════════════ CAROUSEL UI CONFIG ═══════════════ */
const carouselUI = {
  item: 'basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 px-0.1',
  container: 'py-1 gap-0',
}

/* ═══════════════ STATIC DATA ═══════════════ */
const mainItems = [
  { image: '/images/offres/offre_special_dell_5510.png', link: '/products/dell-latitude-5510-corei5-10thgen' },
  { image: '/images/offres/materiel_reseau.png',  link: '/produits/reseaux' },
  { image: '/images/offres/offre_flash_all_in_one.png',  link: '/produits/all-in-one' },
  { image: '/images/offres/smartphones_et_tablettes.png', link: '/produits/all-in-one' },
]

const brands = [
  { name: 'HP', img: '/images/logos/logo-hp.jpg' },
  { name: 'DELL', img: '/images/logos/logo-dell.jpg' },
  { name: 'LENOVO', img: '/images/logos/logo-lenovo.jpg' },
  { name: 'APPLE', img: '/images/logos/logo-iphone.jpg' },
  { name: 'SAMSUNG', img: '/images/logos/logo-samsung.jpg' },
  { name: 'CANON', img: '/images/logos/logo-canon.jpg' }
]

const CATEGORY_ICONS: Record<string, string> = {
  'ordinateurs':                  'i-heroicons-computer-desktop',
  'ordinateurs-et-accessoires':   'i-heroicons-computer-desktop',
  'laptops':                      'i-heroicons-computer-desktop',
  'desktops':                     'i-heroicons-computer-desktop',
  'imprimantes':                  'i-heroicons-star',
  'imprimantes-scanners':         'i-heroicons-printer',
  'smartphones':                  'i-heroicons-device-phone-mobile',
  'smartphones-et-tablettes':     'i-heroicons-device-phone-mobile',
  'materiels-reseau':             'i-heroicons-signal',
  'reseau':                       'i-heroicons-signal',
  'securite':                     'i-heroicons-shield-check',
  'securite-biometrie':           'i-heroicons-shield-check',
  'stockage':                     'i-heroicons-circle-stack',
  'stockage-haute-densite':       'i-heroicons-circle-stack',
  'maintenance':                  'i-heroicons-wrench-screwdriver',
  'maintenance-expert':           'i-heroicons-wrench-screwdriver',
  'sav':                          'i-heroicons-chat-bubble-left-right',
  'accessoires':                  'i-heroicons-puzzle-piece',
  'ecrans':                       'i-heroicons-tv',
  'gadgets':                      'i-heroicons-bolt',
  'serveurs':                     'i-heroicons-server-stack',
}
const DEFAULT_ICON = 'i-heroicons-tag'
const getIcon = (slug: string) => CATEGORY_ICONS[slug] ?? DEFAULT_ICON

const {
  navGroups: categoriesData,
  loadingCats,
  errorCats,
  fetchCategories,
} = useCategories()

const hoveredCategory = ref<number | null>(null)

const benefits = [
  { icon: 'i-heroicons-truck', title: 'Livraison rapide', subtitle: 'Entre 1 à 3 jours' },
  { icon: 'i-heroicons-star', title: 'Produits authentiques', subtitle: '100% garantis' },
  { icon: 'i-heroicons-arrow-path', title: 'Retour rapide et facile', subtitle: 'Sur 10 jours' },
  { icon: 'i-heroicons-wrench-screwdriver', title: 'Service après vente', subtitle: 'SAV agréé' },
]

const isExpanded  = ref(false)
const isFlyerOpen = ref(false)

let inactivityTimer: any = null
const resetInactivityTimer = () => {
  if (isFlyerOpen.value) return
  if (inactivityTimer) clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(() => { isFlyerOpen.value = true }, 300000)
}

const loading = ref(false)
const router  = useRouter()
router.beforeEach(() => { loading.value = true })
router.afterEach(() => { setTimeout(() => { loading.value = false }, 400) })

onMounted(() => {
  // ── Banner Duo 1 ──
  setInterval(() => {
    leftIndex.value = (leftIndex.value + 1) % leftImages.length
  }, 4000)
  setTimeout(() => {
    setInterval(() => {
      rightIndex.value = (rightIndex.value + 1) % rightImages.length
    }, 4000)
  }, 2000)

  // ── Trio Banner — chaque carte décalée ──
  trioCards.forEach((card, i) => {
    setTimeout(() => {
      setInterval(() => {
        trioIndexes.value[i] = (trioIndexes.value[i] + 1) % card.images.length
        trioIndexes.value = [...trioIndexes.value]
      }, 5000)
    }, i * 1500)
  })

  // ── Banner Duo 2 ──
  setInterval(() => {
    duo2LeftIndex.value = (duo2LeftIndex.value + 1) % duo2Left.length
  }, 4500)
  setTimeout(() => {
    setInterval(() => {
      duo2RightIndex.value = (duo2RightIndex.value + 1) % duo2Right.length
    }, 4500)
  }, 2500)

  // ── Data ──
  fetchCategories()
  fetchAllSections()
  initWishlist()

  // ── Flyer ──
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
  if (inactivityTimer) clearTimeout(inactivityTimer)
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
  activityEvents.forEach(event => { window.removeEventListener(event, resetInactivityTimer) })
})
</script>

<template>
  <div class="bg-[#f4f4f4] min-h-screen pb-20">

    <!-- ═══════════════ HERO ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
      <div class="flex flex-col md:flex-row gap-3 md:gap-4 md:h-[420px]">

        <!-- Sidebar — desktop only -->
        <aside class="hidden md:flex flex-col w-full md:w-1/4 bg-white rounded-sm shadow-sm border border-gray-100 overflow-visible relative z-40">
          <div class="bg-[#274a82] p-4 text-white uppercase tracking-wider font-bold text-sm rounded-t-sm">
            <UIcon name="i-heroicons-bars-3" class="inline-block mr-2" /> Catégories
          </div>

          <div v-if="loadingCats" class="flex-1 py-1">
            <div v-for="n in 7" :key="n" class="flex items-center gap-3 px-5 py-2.5 border-b border-gray-50">
              <div class="w-4 h-4 bg-gray-100 rounded animate-pulse flex-shrink-0"></div>
              <div class="h-3 bg-gray-100 rounded animate-pulse flex-1"></div>
            </div>
          </div>

          <div v-else-if="errorCats" class="flex-1 flex flex-col items-center justify-center gap-2 py-6 text-center px-4">
            <UIcon name="i-heroicons-exclamation-circle" class="w-7 h-7 text-red-300" />
            <p class="text-xs text-red-400 font-medium">Impossible de charger les catégories</p>
            <button @click="fetchCategories" class="text-xs text-[#274a82] font-bold hover:underline">Réessayer</button>
          </div>

          <nav v-else class="flex-1 flex flex-col py-1 bg-white rounded-b-sm">
            <div
              v-for="(cat, index) in categoriesData"
              :key="cat.slug"
              class="relative"
              @mouseenter="hoveredCategory = index"
              @mouseleave="hoveredCategory = null"
            >
              <NuxtLink
                :to="`/categories/${cat.slug}`"
                class="flex items-center justify-between px-5 py-2.5 text-[13px] border-b border-gray-50 last:border-0 cursor-pointer select-none transition-colors"
                :class="hoveredCategory === index ? 'bg-[#f0f4ff]' : 'hover:bg-gray-50'"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="font-medium transition-colors truncate"
                    :class="hoveredCategory === index ? 'text-[#274a82]' : 'text-gray-700'"
                  >
                    {{ cat.label }}
                  </span>
                </div>
                <UIcon
                  name="i-heroicons-chevron-right"
                  class="w-3 h-3 transition-colors flex-shrink-0"
                  :class="hoveredCategory === index ? 'text-[#274a82]' : 'text-gray-300'"
                />
              </NuxtLink>

              <Transition
                enter-active-class="transition-all duration-180 ease-out"
                enter-from-class="opacity-0 translate-x-2"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="transition-all duration-120 ease-in"
                leave-from-class="opacity-100 translate-x-0"
                leave-to-class="opacity-0 translate-x-1"
              >
                <div
                  v-if="hoveredCategory === index && cat.links.length > 1"
                  class="absolute left-full top-0 z-50 bg-white border border-gray-200 shadow-2xl rounded-sm min-w-[220px] py-2"
                  style="margin-left: 2px;"
                >
                  <div class="absolute -left-[5px] top-4 w-2.5 h-2.5 bg-white border-l border-b border-gray-200 rotate-45"></div>
                  <div class="px-4 py-2 mb-1 bg-[#274a82] flex items-center gap-2">
                    <UIcon :name="getIcon(cat.slug)" class="w-4 h-4 text-white flex-shrink-0" />
                    <span class="text-[11px] font-black text-white tracking-widest truncate">{{ cat.label }}</span>
                  </div>
                  <NuxtLink
                    v-for="link in cat.links.slice(1)"
                    :key="link.to"
                    :to="link.to"
                    class="flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-600 hover:text-[#e60012] hover:bg-red-50 transition-colors"
                  >
                    {{ link.label }}
                  </NuxtLink>
                  <div class="border-t border-gray-100 mt-1 pt-1">
                    <NuxtLink
                      :to="`/categories/${cat.slug}`"
                      class="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-[#274a82] hover:text-[#e60012] hover:bg-red-50 transition-colors"
                    >
                      <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
                      Voir tout {{ cat.label }}
                    </NuxtLink>
                  </div>
                </div>
              </Transition>
            </div>

            <div v-if="!loadingCats && categoriesData.length === 0" class="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <UIcon name="i-heroicons-folder" class="w-8 h-8 text-gray-200" />
              <p class="text-xs text-gray-400">Aucune catégorie</p>
            </div>
          </nav>
        </aside>

        <!-- Carousel -->
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
        >
          <div class="relative w-full h-full">

            <NuxtLink :to="item.link ?? '#'" class="block w-full h-full">  <!-- ← ici -->
              <img :src="item.image" class="w-full h-full object-contain" />
              <div class="absolute inset-0 bg-transparent"></div>
              <div class="absolute inset-0 flex flex-col items-start justify-center p-6 sm:p-10 md:p-14">
                <h2 class="text-white text-xl sm:text-3xl md:text-[2.2rem] font-black mb-2 sm:mb-3 tracking-tighter drop-shadow-lg leading-tight max-w-xs sm:max-w-sm md:max-w-md">
                  {{ item.title }}
                </h2>
                <p class="text-white/75 text-xs sm:text-sm mb-4 sm:mb-5 max-w-[200px] sm:max-w-xs font-medium">
                  {{ item.subtitle }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </UCarousel>
      </main>

      </div>
    </section>

    <!-- ═══════════════ MOBILE CATEGORIES ═══════════════ -->
    <section class="md:hidden w-full overflow-x-auto no-scrollbar py-3 px-3 bg-white mt-3 border-b border-gray-200">
      <div class="flex gap-3 w-max">
        <NuxtLink v-for="cat in categoriesData" :key="cat.slug" :to="`/categories/${cat.slug}`" class="flex flex-col items-center min-w-[68px] text-center gap-1 active:scale-95 transition-transform">
          <div class="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-[#274a82]">
            <UIcon :name="getIcon(cat.slug)" class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold text-gray-600 whitespace-nowrap">{{ cat.label }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ═══════════════ PRODUCT CARD TEMPLATE (slot) ═══════════════ -->
    <!-- Used inline in each carousel below via v-slot -->

    <!-- ═══════════════ MEILLEURES VENTES ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Les Meilleures Ventes du Moment</h2>
        <NuxtLink to="/boutique?sort=best_seller" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>

      <div v-if="loadingBest" class="flex gap-2 overflow-x-auto no-scrollbar">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm"></div>
          <div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full"></div><div class="h-4 bg-gray-100 rounded w-2/3"></div></div>
        </div>
      </div>

      <div v-else-if="bestProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <UIcon name="i-heroicons-shopping-bag" class="w-10 h-10 text-gray-200" />
        <p class="text-sm font-medium">Aucun produit best seller pour l'instant</p>
      </div>

      <UCarousel
  v-else
  v-slot="{ item: p }"
  :items="bestProducts"
  arrows
  :ui="carouselUI"
  :autoplay="{ delay: 2500 }"
>
  <NuxtLink
    :to="goToProduit(p)"
    class="relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 w-full"
    :class="{ 'shadow-xl': hoveredKeys.has(`best:${p.id}`) }"
  >
    <div
      class="relative h-52 w-full overflow-hidden bg-gray-40"
      @mouseenter="setHover(`best:${p.id}`, true)"
      @mouseleave="handleLeave(`best:${p.id}`, $event)"
    >
      <!-- Bouton Wishlist -->
      <div
        class="hidden sm:flex absolute top-3 flex-col gap-2 z-30 transition-all duration-300"
        :class="hoveredKeys.has(`best:${p.id}`) ? 'right-3' : 'right-[-50px]'"
      >
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

      <!-- Badge réduction -->
      <div
        v-if="discountPercent(p)"
        class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm"
      >
        {{ discountPercent(p) }}
      </div>

      <!-- Image produit -->
      <img
        :src="hoveredKeys.has(`best:${p.id}`) ? getImageHover(p) : getImage(p)"
        class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700"
        :class="{ 'scale-105': hoveredKeys.has(`best:${p.id}`) }"
        :alt="p.name"
      />

      <!-- Bouton Ajouter au panier (desktop) -->
      <div
        class="hidden sm:block absolute left-0 w-full z-20 transition-all duration-300"
        :class="hoveredKeys.has(`best:${p.id}`) ? 'bottom-0' : 'bottom-[-100%]'"
      >
        <button
          @click.prevent.stop="addToCart(p)"
          :disabled="isOutOfStock(p)"
          class="w-full flex items-center justify-center gap-2 bg-[#274a82] hover:bg-[#e60012] text-white font-bold text-[12px] py-3 transition-colors disabled:opacity-50"
        >
          <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
          {{ isOutOfStock(p) ? 'Rupture' : 'Ajouter au panier' }}
        </button>
      </div>
    </div>

    <!-- Infos produit -->
    <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
      <h3
        class="text-sm sm:text-[15px] text-gray-600 font-semibold line-clamp-2 leading-tight overflow-hidden w-full min-h-[40px] h-[40px] transition-colors"
        :class="{ 'text-[#e60012]': hoveredKeys.has(`best:${p.id}`) }"
      >
        {{ p.name }}
      </h3>

      <!-- Prix desktop -->
      <div class="hidden sm:block mt-auto">
        <div class="text-2xl font-black text-gray-900 mb-0.5">
          {{ formatPrice(p.price) }} <span class="text-[11px] font-semibold">FCFA</span>
        </div>
        <span v-if="p.old_price" class="text-[12px] text-[#e60012] line-through">
          {{ formatPrice(p.old_price) }} FCFA
        </span>
      </div>

      <!-- Prix mobile -->
      <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
        <div class="min-w-0 flex-1">
          <div class="text-lg font-black text-gray-900 leading-tight truncate">
            {{ formatPrice(p.price) }} <span class="text-[9px] font-semibold">FCFA</span>
          </div>
          <span v-if="p.old_price" class="text-[10px] text-[#e60012] line-through">
            {{ formatPrice(p.old_price) }} FCFA
          </span>
        </div>
        <button
          @click.prevent.stop="addToCart(p)"
          :disabled="isOutOfStock(p)"
          class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm disabled:opacity-40"
        >
          <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </NuxtLink>
</UCarousel>
    </section>

    <!-- ═══════════════ NOUVEAUTÉS ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Nouveautés : Le Futur est ici</h2>
        <NuxtLink to="/boutique?sort=new" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>

      <div v-if="loadingRecent" class="flex gap-2 overflow-x-auto no-scrollbar">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm"></div>
          <div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full"></div><div class="h-4 bg-gray-100 rounded w-2/3"></div></div>
        </div>
      </div>

      <div v-else-if="recentProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <UIcon name="i-heroicons-sparkles" class="w-10 h-10 text-gray-200" />
        <p class="text-sm font-medium">Aucune nouveauté pour l'instant</p>
      </div>

      <UCarousel
        v-else
        v-slot="{ item: p }"
        :items="recentProducts"
        arrows
        :ui="carouselUI"
        :autoplay="{ delay: 2500 }"
      >
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div class="relative h-52 w-full overflow-hidden bg-gray-40"
           @mouseenter="setHover(`new:${p.id}`, true)" 
           @mouseleave="setHover(`new:${p.id}`, false)">
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
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ discountPercent(p) }}</div>
            <img :src="hoveredKeys.has(`new:${p.id}`) ? getImageHover(p) : getImage(p)" class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" :alt="p.name" />
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="w-full flex items-center justify-center gap-2 bg-[#274a82] hover:bg-[#e60012] text-white font-bold text-[12px] py-3 transition-colors disabled:opacity-50">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />{{ isOutOfStock(p) ? 'Rupture' : 'Ajouter au panier' }}
              </button>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-semibold line-clamp-2 leading-tight w-full min-h-[40px] h-[40px] group-hover:text-[#e60012]">{{ p.name }}</h3>
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ formatPrice(p.price) }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <span v-if="p.old_price" class="text-[12px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span>
            </div>
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div><div class="text-xl font-black text-gray-900 leading-tight">{{ formatPrice(p.price) }} <span class="text-[9px] font-semibold">FCFA</span></div><span v-if="p.old_price" class="text-[10px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span></div>
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm disabled:opacity-40"><UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" /></button>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ SPECIAL PROMO ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Special promo : Stock limité</h2>
        <NuxtLink to="/boutique?promo=1" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>

      <div v-if="loadingPromos" class="flex gap-2 overflow-x-auto no-scrollbar">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm"></div>
          <div class="p-3 space-y-2"><div class="h-3 bg-gray-400 rounded w-full"></div><div class="h-4 bg-gray-400 rounded w-2/3"></div></div>
        </div>
      </div>

      <div v-else-if="promosProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <UIcon name="i-heroicons-sparkles" class="w-10 h-10 text-gray-200" />
        <p class="text-sm font-medium">Aucune promo pour l'instant</p>
      </div>

      <UCarousel v-else v-slot="{ item: p }" :items="promosProducts" arrows :ui="carouselUI">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div class="relative h-52 w-full overflow-hidden bg-gray-40" 
            @mouseenter="setHover(`promo:${p.id}`, true)" 
            @mouseleave="setHover(`promo:${p.id}`, false)">
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
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ discountPercent(p) }}</div>
            <img :src="hoveredKeys.has(`promo:${p.id}`) ? getImageHover(p) : getImage(p)" class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" :alt="p.name" />
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="w-full flex items-center justify-center gap-2 bg-[#274a82] hover:bg-[#e60012] text-white font-bold text-[12px] py-3 transition-colors disabled:opacity-50">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />{{ isOutOfStock(p) ? 'Rupture' : 'Ajouter au panier' }}
              </button>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-semibold line-clamp-2 leading-tight w-full min-h-[40px] h-[40px] group-hover:text-[#e60012]">{{ p.name }}</h3>
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ formatPrice(p.price) }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <span v-if="p.old_price" class="text-[12px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span>
            </div>
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div><div class="text-xl font-black text-gray-900 leading-tight">{{ formatPrice(p.price) }} <span class="text-[9px] font-semibold">FCFA</span></div><span v-if="p.old_price" class="text-[10px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span></div>
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm disabled:opacity-40"><UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" /></button>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ BANNER DUO 1 ═══════════════ -->
     <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

      <!-- Colonne gauche -->
      <div class="relative h-[200px] sm:h-[200px] md:h-[350px] overflow-hidden shadow-lg rounded-sm">
        <TransitionGroup name="fade">
          <NuxtLink
            v-for="(img, i) in leftImages"
            :key="img.src"
            :to="img.link"
            v-show="leftIndex === i"
            class="absolute inset-0 w-full h-full block group"
          >
            <img
              :src="img.src"
              class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-1000"
              style="animation: shake-loop 5s ease-in-out infinite;"
            />
          </NuxtLink>
        </TransitionGroup>
      </div>

      <!-- Colonne droite -->
      <div class="relative h-[200px] sm:h-[200px] md:h-[350px] overflow-hidden shadow-lg rounded-sm">
        <TransitionGroup name="fade">
          <NuxtLink
            v-for="(img, i) in rightImages"
            :key="img.src"
            :to="img.link"
            v-show="rightIndex === i"
            class="absolute inset-0 w-full h-full block group"
          >
            <img
              :src="img.src"
              class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-1000"
              style="animation: shake-loop 5s ease-in-out infinite 0.5s;"
            />
          </NuxtLink>
        </TransitionGroup>
      </div>

    </div>
  </section>

    <!-- ═══════════════ RÉSEAUX PRO ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Infrastructure & Réseaux Pro</h2>
        <NuxtLink to="/categories/materiels-reseau" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>

      <div v-if="loadingNetwork" class="flex gap-2 overflow-x-auto no-scrollbar">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm"></div>
          <div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full"></div><div class="h-4 bg-gray-100 rounded w-2/3"></div></div>
        </div>
      </div>

      <div v-else-if="networkProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <UIcon name="i-heroicons-signal" class="w-10 h-10 text-gray-200" />
        <p class="text-sm font-medium">Aucun produit réseau pour l'instant</p>
      </div>

      <UCarousel v-else v-slot="{ item: p }" :items="networkProducts" arrows :ui="carouselUI">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div class="relative h-52 w-full overflow-hidden bg-gray-40" 
            @mouseenter="setHover(`net:${p.id}`, true)" 
            @mouseleave="setHover(`net:${p.id}`, false)">
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
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ discountPercent(p) }}</div>
            <img :src="hoveredKeys.has(`net:${p.id}`) ? getImageHover(p) : getImage(p)" class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" :alt="p.name" />
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="w-full flex items-center justify-center gap-2 bg-[#274a82] hover:bg-[#e60012] text-white font-bold text-[12px] py-3 transition-colors disabled:opacity-50">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />{{ isOutOfStock(p) ? 'Rupture' : 'Ajouter au panier' }}
              </button>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-semibold line-clamp-2 leading-tight w-full min-h-[40px] h-[40px] group-hover:text-[#e60012]">{{ p.name }}</h3>
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ formatPrice(p.price) }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <span v-if="p.old_price" class="text-[12px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span>
            </div>
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div><div class="text-xl font-black text-gray-900 leading-tight">{{ formatPrice(p.price) }} <span class="text-[9px] font-semibold">FCFA</span></div><span v-if="p.old_price" class="text-[10px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span></div>
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm disabled:opacity-40"><UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" /></button>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ IMPRIMANTES & SCANNERS ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Imprimez la perfection, numérisez l'avenir.</h2>
        <NuxtLink to="/categories/imprimantes-et-scanners" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>

      <div v-if="loadingPrinters" class="flex gap-2 overflow-x-auto no-scrollbar">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm"></div>
          <div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full"></div><div class="h-4 bg-gray-100 rounded w-2/3"></div></div>
        </div>
      </div>

      <div v-else-if="printingProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <UIcon name="i-heroicons-printer" class="w-10 h-10 text-gray-200" />
        <p class="text-sm font-medium">Aucune imprimante pour l'instant</p>
      </div>

      <UCarousel v-else v-slot="{ item: p }" :items="printingProducts" arrows :ui="carouselUI">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div class="relative h-52 w-full overflow-hidden bg-gray-40" 
            @mouseenter="setHover(`prin:${p.id}`, true)" 
            @mouseleave="setHover(`prin:${p.id}`, false)">
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
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ discountPercent(p) }}</div>
            <img :src="hoveredKeys.has(`prin:${p.id}`) ? getImageHover(p) : getImage(p)" class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" :alt="p.name" />
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="w-full flex items-center justify-center gap-2 bg-[#274a82] hover:bg-[#e60012] text-white font-bold text-[12px] py-3 transition-colors disabled:opacity-50">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />{{ isOutOfStock(p) ? 'Rupture' : 'Ajouter au panier' }}
              </button>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-semibold line-clamp-2 leading-tight w-full min-h-[40px] h-[40px] group-hover:text-[#e60012]">{{ p.name }}</h3>
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ formatPrice(p.price) }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <span v-if="p.old_price" class="text-[12px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span>
            </div>
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div><div class="text-xl font-black text-gray-900 leading-tight">{{ formatPrice(p.price) }} <span class="text-[9px] font-semibold">FCFA</span></div><span v-if="p.old_price" class="text-[10px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span></div>
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm disabled:opacity-40"><UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" /></button>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ ACCESSOIRES ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">L'Arsenal des Accessoires</h2>
        <NuxtLink to="/categories/accessoires" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>

      <div v-if="loadingAccessories" class="flex gap-2 overflow-x-auto no-scrollbar">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm"></div>
          <div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full"></div><div class="h-4 bg-gray-100 rounded w-2/3"></div></div>
        </div>
      </div>

      <div v-else-if="accessoriesProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <UIcon name="i-heroicons-puzzle-piece" class="w-10 h-10 text-gray-200" />
        <p class="text-sm font-medium">Aucun accessoire pour l'instant</p>
      </div>

      <UCarousel v-else v-slot="{ item: p }" :items="accessoriesProducts" arrows :ui="carouselUI">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div class="relative h-52 w-full overflow-hidden bg-gray-40" 
            @mouseenter="setHover(`acc:${p.id}`, true)" 
            @mouseleave="setHover(`acc:${p.id}`, false)">
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
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ discountPercent(p) }}</div>
            <img :src="hoveredKeys.has(`acc:${p.id}`) ? getImageHover(p) : getImage(p)" class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" :alt="p.name" />
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="w-full flex items-center justify-center gap-2 bg-[#274a82] hover:bg-[#e60012] text-white font-bold text-[12px] py-3 transition-colors disabled:opacity-50">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />{{ isOutOfStock(p) ? 'Rupture' : 'Ajouter au panier' }}
              </button>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-semibold line-clamp-2 leading-tight w-full min-h-[40px] h-[40px] group-hover:text-[#e60012]">{{ p.name }}</h3>
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ formatPrice(p.price) }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <span v-if="p.old_price" class="text-[12px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span>
            </div>
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div><div class="text-xl font-black text-gray-900 leading-tight">{{ formatPrice(p.price) }} <span class="text-[9px] font-semibold">FCFA</span></div><span v-if="p.old_price" class="text-[10px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span></div>
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm disabled:opacity-40"><UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" /></button>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ TRIO BANNER ═══════════════ -->
    <!-- ═══════════════ TRIO BANNER ═══════════════ -->
<section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
    <div
      v-for="(card, i) in trioCards"
      :key="i"
      class="relative h-[200px] sm:h-[200px] md:h-[350px] overflow-hidden shadow-lg rounded-sm"
    >
      <!-- Images avec fade -->
      <TransitionGroup name="fade">
        <img
          v-for="(src, j) in card.images"
          :key="src"
          v-show="trioIndexes[i] === j"
          :src="src"
          class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-1000"
        />
      </TransitionGroup>

     
      <div class="relative h-full flex flex-col justify-end p-6 sm:p-8 text-white">
        <NuxtLink
          :to="card.link"
          :class="['w-fit font-black rounded px-6 sm:px-8 py-2 text-sm transition-all', card.btn.class]"
        >
          {{ card.btn.text }}
        </NuxtLink>
      </div>
    </div>
  </div>
</section>

    <!-- ═══════════════ STOCKAGE ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Performance & Puissance</h2>
        <NuxtLink to="/categories/stockage-et-nas" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>

      <div v-if="loadingStockage" class="flex gap-2 overflow-x-auto no-scrollbar">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm"></div>
          <div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full"></div><div class="h-4 bg-gray-100 rounded w-2/3"></div></div>
        </div>
      </div>

      <div v-else-if="stockageProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <UIcon name="i-heroicons-circle-stack" class="w-10 h-10 text-gray-200" />
        <p class="text-sm font-medium">Aucun produit stockage pour l'instant</p>
      </div>

      <UCarousel v-else v-slot="{ item: p }" :items="stockageProducts" arrows :ui="carouselUI">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div class="relative h-52 w-full overflow-hidden bg-gray-40" 
            @mouseenter="setHover(`sto:${p.id}`, true)" 
            @mouseleave="setHover(`sto:${p.id}`, false)">
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
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ discountPercent(p) }}</div>
            <img :src="hoveredKeys.has(`sto:${p.id}`) ? getImageHover(p) : getImage(p)" class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" :alt="p.name" />
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="w-full flex items-center justify-center gap-2 bg-[#274a82] hover:bg-[#e60012] text-white font-bold text-[12px] py-3 transition-colors disabled:opacity-50">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />{{ isOutOfStock(p) ? 'Rupture' : 'Ajouter au panier' }}
              </button>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-semibold line-clamp-2 leading-tight w-full min-h-[40px] h-[40px] group-hover:text-[#e60012]">{{ p.name }}</h3>
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ formatPrice(p.price) }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <span v-if="p.old_price" class="text-[12px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span>
            </div>
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div><div class="text-xl font-black text-gray-900 leading-tight">{{ formatPrice(p.price) }} <span class="text-[9px] font-semibold">FCFA</span></div><span v-if="p.old_price" class="text-[10px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span></div>
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm disabled:opacity-40"><UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" /></button>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ SÉCURITÉ ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Sécurisez l'essentiel, maintenant</h2>
        <NuxtLink to="/categories/securite-electronique" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>

      <div v-if="loadingSecurity" class="flex gap-2 overflow-x-auto no-scrollbar">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm"></div>
          <div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full"></div><div class="h-4 bg-gray-100 rounded w-2/3"></div></div>
        </div>
      </div>

      <div v-else-if="securityProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <UIcon name="i-heroicons-lock-closed" class="w-10 h-10 text-gray-200" />
        <p class="text-sm font-medium">Aucun produit sécurité pour l'instant</p>
      </div>

      <UCarousel v-else v-slot="{ item: p }" :items="securityProducts" arrows :ui="carouselUI">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div class="relative h-52 w-full overflow-hidden bg-gray-40" 
            @mouseenter="setHover(`sec:${p.id}`, true)" 
            @mouseleave="setHover(`sec:${p.id}`, false)">
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
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ discountPercent(p) }}</div>
            <img :src="hoveredKeys.has(`sec:${p.id}`) ? getImageHover(p) : getImage(p)" class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" :alt="p.name" />
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="w-full flex items-center justify-center gap-2 bg-[#274a82] hover:bg-[#e60012] text-white font-bold text-[12px] py-3 transition-colors disabled:opacity-50">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />{{ isOutOfStock(p) ? 'Rupture' : 'Ajouter au panier' }}
              </button>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-semibold line-clamp-2 leading-tight w-full min-h-[40px] h-[40px] group-hover:text-[#e60012]">{{ p.name }}</h3>
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ formatPrice(p.price) }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <span v-if="p.old_price" class="text-[12px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span>
            </div>
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div><div class="text-xl font-black text-gray-900 leading-tight">{{ formatPrice(p.price) }} <span class="text-[9px] font-semibold">FCFA</span></div><span v-if="p.old_price" class="text-[10px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span></div>
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm disabled:opacity-40"><UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" /></button>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ GADGETS ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Les Meilleurs Gadgets du Market</h2>
        <NuxtLink to="/categories/gadgets" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>

      <div v-if="loadingGadgets" class="flex gap-2 overflow-x-auto no-scrollbar">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm"></div>
          <div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full"></div><div class="h-4 bg-gray-100 rounded w-2/3"></div></div>
        </div>
      </div>

      <div v-else-if="gadgetsProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <UIcon name="i-heroicons-bolt" class="w-10 h-10 text-gray-200" />
        <p class="text-sm font-medium">Aucun gadget pour l'instant</p>
      </div>

      <UCarousel v-else v-slot="{ item: p }" :items="gadgetsProducts" arrows :ui="carouselUI">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div class="relative h-52 w-full overflow-hidden bg-gray-40" 
            @mouseenter="setHover(`gad:${p.id}`, true)" 
            @mouseleave="setHover(`gad:${p.id}`, false)">
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
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ discountPercent(p) }}</div>
            <img :src="hoveredKeys.has(`gad:${p.id}`) ? getImageHover(p) : getImage(p)" class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" :alt="p.name" />
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="w-full flex items-center justify-center gap-2 bg-[#274a82] hover:bg-[#e60012] text-white font-bold text-[12px] py-3 transition-colors disabled:opacity-50">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />{{ isOutOfStock(p) ? 'Rupture' : 'Ajouter au panier' }}
              </button>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-semibold line-clamp-2 leading-tight w-full min-h-[40px] h-[40px] group-hover:text-[#e60012]">{{ p.name }}</h3>
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ formatPrice(p.price) }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <span v-if="p.old_price" class="text-[12px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span>
            </div>
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div><div class="text-xl font-black text-gray-900 leading-tight">{{ formatPrice(p.price) }} <span class="text-[9px] font-semibold">FCFA</span></div><span v-if="p.old_price" class="text-[10px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span></div>
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm disabled:opacity-40"><UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" /></button>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ BANNER DUO 2 ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

        <!-- Gauche : zoom -->
        <div class="relative h-[240px] sm:h-[300px] md:h-[420px] overflow-hidden shadow-lg rounded-sm">
          <TransitionGroup name="zoom">
            <NuxtLink
              v-for="(img, i) in duo2Left"
              :key="img.src"
              :to="img.link"
              v-show="duo2LeftIndex === i"
              class="absolute inset-0 w-full h-full block group"
            >
              <img :src="img.src" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-1000" />
              
            </NuxtLink>
          </TransitionGroup>
        </div>

        <!-- Droite : slide -->
        <div class="relative h-[240px] sm:h-[300px] md:h-[420px] overflow-hidden shadow-lg rounded-sm">
          <TransitionGroup name="slide">
            <NuxtLink
              v-for="(img, i) in duo2Right"
              :key="img.src"
              :to="img.link"
              v-show="duo2RightIndex === i"
              class="absolute inset-0 w-full h-full block group"
            >
              <img :src="img.src" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-1000" />
             
            </NuxtLink>
          </TransitionGroup>
        </div>

      </div>
    </section>

    <!-- ═══════════════ SMARTPHONES ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Mobilité : Smartphones & Tablettes</h2>
        <NuxtLink to="/categories/smartphones-et-tablettes" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>

      <div v-if="loadingSmartphones" class="flex gap-2 overflow-x-auto no-scrollbar">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm"></div>
          <div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full"></div><div class="h-4 bg-gray-100 rounded w-2/3"></div></div>
        </div>
      </div>

      <div v-else-if="smartphoneProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <UIcon name="i-heroicons-device-phone-mobile" class="w-10 h-10 text-gray-200" />
        <p class="text-sm font-medium">Aucun smartphone pour l'instant</p>
      </div>

      <UCarousel v-else v-slot="{ item: p }" :items="smartphoneProducts" arrows :ui="carouselUI">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div class="relative h-52 w-full overflow-hidden bg-gray-40" 
            @mouseenter="setHover(`smt:${p.id}`, true)" 
            @mouseleave="setHover(`smt:${p.id}`, false)">
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
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ discountPercent(p) }}</div>
            <img :src="hoveredKeys.has(`smt:${p.id}`) ? getImageHover(p) : getImage(p)" class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" :alt="p.name" />
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="w-full flex items-center justify-center gap-2 bg-[#274a82] hover:bg-[#e60012] text-white font-bold text-[12px] py-3 transition-colors disabled:opacity-50">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />{{ isOutOfStock(p) ? 'Rupture' : 'Ajouter au panier' }}
              </button>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-semibold line-clamp-2 leading-tight w-full min-h-[40px] h-[40px] group-hover:text-[#e60012]">{{ p.name }}</h3>
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ formatPrice(p.price) }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <span v-if="p.old_price" class="text-[12px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span>
            </div>
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div><div class="text-xl font-black text-gray-900 leading-tight">{{ formatPrice(p.price) }} <span class="text-[9px] font-semibold">FCFA</span></div><span v-if="p.old_price" class="text-[10px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span></div>
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm disabled:opacity-40"><UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" /></button>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ ÉCRANS INCURVÉS ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Le Stock des Écrans Incurvés</h2>
        <NuxtLink to="/categories/ecrans" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>

      <div v-if="loadingScreens" class="flex gap-2 overflow-x-auto no-scrollbar">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm"></div>
          <div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full"></div><div class="h-4 bg-gray-100 rounded w-2/3"></div></div>
        </div>
      </div>

      <div v-else-if="screensProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <UIcon name="i-heroicons-tv" class="w-10 h-10 text-gray-200" />
        <p class="text-sm font-medium">Aucun écran pour l'instant</p>
      </div>

      <UCarousel v-else v-slot="{ item: p }" :items="screensProducts" arrows :ui="carouselUI">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div class="relative h-52 w-full overflow-hidden bg-gray-40" 
            @mouseenter="setHover(`scr:${p.id}`, true)" 
            @mouseleave="setHover(`scr:${p.id}`, false)">
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
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ discountPercent(p) }}</div>
            <img :src="hoveredKeys.has(`scr:${p.id}`) ? getImageHover(p) : getImage(p)" class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-105" :alt="p.name" />
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="w-full flex items-center justify-center gap-2 bg-[#274a82] hover:bg-[#e60012] text-white font-bold text-[12px] py-3 transition-colors disabled:opacity-50">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />{{ isOutOfStock(p) ? 'Rupture' : 'Ajouter au panier' }}
              </button>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-semibold line-clamp-2 leading-tight w-full min-h-[40px] h-[40px] group-hover:text-[#e60012]">{{ p.name }}</h3>
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ formatPrice(p.price) }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <span v-if="p.old_price" class="text-[12px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span>
            </div>
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div><div class="text-xl font-black text-gray-900 leading-tight">{{ formatPrice(p.price) }} <span class="text-[9px] font-semibold">FCFA</span></div><span v-if="p.old_price" class="text-[10px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span></div>
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm disabled:opacity-40"><UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" /></button>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ BRANDS ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Nos Meilleures Marques</h2>
        <NuxtLink to="#" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir tout <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>
      <UCarousel
        v-slot="{ item }"
        :items="brands"
        :autoplay="{ delay: 2000 }"
        :ui="{ item: 'basis-1/3 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 px-2', container: 'py-4' }"
        indicators
        arrows
        class="rounded-lg"
      >
        <div class="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 text-center">
          <div class="h-16 sm:h-24 flex items-center justify-center mb-2 sm:mb-4">
            <img :src="item.img" :alt="item.name" class="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" draggable="false" />
          </div>
          <span class="text-xs sm:text-sm font-bold text-gray-600 group-hover:text-[#e60012] transition-colors">{{ item.name }}</span>
        </div>
      </UCarousel>
    </section>

    <!-- ═══════════════ VOUS N'AVEZ PAS TROUVÉ ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          <span class="hidden sm:inline">Vous n'avez pas trouvé ce que vous cherchez ?</span>
          <span class="sm:hidden">Vous cherchez autre chose ?</span>
        </h2>
        <NuxtLink to="/boutique" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>

      <div v-if="loadingFeatured" class="flex gap-2 overflow-x-auto no-scrollbar">
        <div v-for="n in 5" :key="n" class="rounded-sm bg-white border border-gray-100 min-w-[170px] flex-shrink-0 animate-pulse">
          <div class="h-52 bg-gray-100 rounded-t-sm"></div>
          <div class="p-3 space-y-2"><div class="h-3 bg-gray-100 rounded w-full"></div><div class="h-4 bg-gray-100 rounded w-2/3"></div></div>
        </div>
      </div>

      <div v-else-if="featuredProducts.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
        <UIcon name="i-heroicons-magnifying-glass" class="w-10 h-10 text-gray-200" />
        <p class="text-sm font-medium">Aucun produit mis en avant pour l'instant</p>
      </div>

      <UCarousel v-else v-slot="{ item: p }" :items="featuredProducts" arrows :ui="carouselUI">
        <NuxtLink :to="goToProduit(p)" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
          <div class="relative h-52 w-full overflow-hidden bg-gray-40" 
            @mouseenter="setHover(`fea:${p.id}`, true)" 
            @mouseleave="setHover(`fea:${p.id}`, false)">
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
            <div v-if="discountPercent(p)" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ discountPercent(p) }}</div>
            <img 
        :src="hoveredKeys.has(`fea:${p.id}`) ? getImageHover(p) : getImage(p)" 
        class="absolute inset-0 w-full h-full p-4 object-contain transition-all duration-700 group-hover:scale-110 pointer-events-none" 
        style="backface-visibility: hidden; transform: translateZ(0);"
        :alt="p.name" 
      />
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="w-full flex items-center justify-center gap-2 bg-[#274a82] hover:bg-[#e60012] text-white font-bold text-[12px] py-3 transition-colors disabled:opacity-50">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />{{ isOutOfStock(p) ? 'Rupture' : 'Ajouter au panier' }}
              </button>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-semibold line-clamp-2 leading-tight w-full min-h-[40px] h-[40px] group-hover:text-[#e60012]">{{ p.name }}</h3>
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ formatPrice(p.price) }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <span v-if="p.old_price" class="text-[12px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span>
            </div>
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div><div class="text-xl font-black text-gray-900 leading-tight">{{ formatPrice(p.price) }} <span class="text-[9px] font-semibold">FCFA</span></div><span v-if="p.old_price" class="text-[10px] text-[#e60012] line-through">{{ formatPrice(p.old_price) }} FCFA</span></div>
              <button @click.prevent.stop="addToCart(p)" :disabled="isOutOfStock(p)" class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm disabled:opacity-40"><UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" /></button>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>

    <!-- ═══════════════ À PROPOS ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-4 sm:my-4">
      <div class="border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-sm sm:text-lg font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] inline-block mb-[-1px] tracking-tight">
          Bienvenue sur BRC Market, Meilleur Site de vente en ligne au Cameroun!
        </h2>
      </div>
      <div class="space-y-3 sm:space-y-4">
        <p class="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
          Bienvenue chez <span class="font-bold text-[#274a82]">BRC Market</span>, votre destination privilégiée pour l'informatique de pointe et les solutions technologiques professionnelles au Cameroun.
        </p>
        <div v-if="isExpanded" class="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-3">
          <p>
            Nous sélectionnons rigoureusement des équipements issus des plus grands constructeurs :
            <span class="font-bold text-[#274a82]">HP, DELL, APPLE, LENOVO, MICROSOFT, SAMSUNG, CANON, EPSON, LOGITECH, ASUS, ACER, TP-LINK, CISCO et autres</span>.
          </p>
          <p>
            Au-delà de la vente, <span class="font-bold text-[#274a82]">BRC Market</span> s'engage à vous accompagner avec un support technique réactif et des conseils personnalisés.
          </p>
        </div>
        <UButton variant="ghost" color="gray" class="p-0 hover:text-[#274a82] text-gray-900 font-bold flex items-center gap-1 text-xs sm:text-sm" @click="isExpanded = !isExpanded">
          {{ isExpanded ? 'Voir Moins' : 'Voir Plus' }}
          <UIcon name="i-heroicons-chevron-down" class="transition-transform duration-300" :class="[isExpanded ? 'rotate-180' : '']" />
        </UButton>
      </div>
    </section>

  </div>

  <!-- ═══════════════ BENEFITS ═══════════════ -->
  <section class="py-6 sm:py-8 border-t border-gray-200 bg-white">
    <UContainer>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div v-for="benefit in benefits" :key="benefit.title" class="flex items-center gap-3 sm:gap-4">
          <div class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#e60012] flex items-center justify-center">
            <UIcon :name="benefit.icon" class="w-5 h-5 sm:w-6 sm:h-6 text-[#e60012]" />
          </div>
          <div>
            <h4 class="font-bold text-xs sm:text-sm leading-tight">{{ benefit.title }}</h4>
            <p class="text-[10px] sm:text-xs text-gray-600">{{ benefit.subtitle }}</p>
          </div>
        </div>
      </div>
    </UContainer>
  </section>

  <!-- ═══════════════ CTA ═══════════════ -->
  <div v-if="!isLoggedIn">
    <section class="bg-[#e60012] py-8 sm:py-10">
      <UContainer>
        <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div class="text-white space-y-1 sm:space-y-2 text-center lg:text-left">
            <h2 class="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">Connectez-vous chez BRC Market</h2>
            <p class="text-gray-300 text-xs sm:text-sm md:text-base font-medium">Connectez-vous, faites des achats et recevez des réductions.</p>
          </div>
          <div class="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
            <NuxtLink to="/login" class="w-full sm:w-auto">
              <UButton block size="lg" icon="i-heroicons-arrow-right-on-rectangle" label="Se connecter maintenant" class="bg-white hover:bg-gray-100 border-2 border-[#274a82] text-[#274a82] font-bold px-6 sm:px-10 rounded-sm" />
            </NuxtLink>
            <NuxtLink to="/register" class="w-full sm:w-auto">
              <UButton block size="lg" icon="i-heroicons-user-plus" label="Créer un compte" class="bg-[#274a82] hover:bg-[#274a75] border-2 border-white text-white font-bold px-6 sm:px-10 rounded-sm" />
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

/* ── Fade ── */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.8s ease; }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }

/* ── Shake loop ── */
@keyframes shake-loop {
  0%,  100% { transform: translateX(0);    }
  5%         { transform: translateX(-8px); }
  10%        { transform: translateX(8px);  }
  15%        { transform: translateX(-6px); }
  20%        { transform: translateX(6px);  }
  25%        { transform: translateX(0);    }
}

/* ── Zoom (Duo 2 gauche) ── */
.zoom-enter-active { animation: zoomIn 0.8s ease-out; }
.zoom-leave-active { animation: zoomOut 0.5s ease-in; }
@keyframes zoomIn  { 0% { opacity: 0; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
@keyframes zoomOut { 0% { opacity: 1; transform: scale(1);   } 100% { opacity: 0; transform: scale(0.95); } }

/* ── Slide (Duo 2 droite) ── */
.slide-enter-active { animation: slideIn 0.7s ease-out; }
.slide-leave-active { animation: slideOut 0.4s ease-in; }
@keyframes slideIn  { 0% { opacity: 0; transform: translateX(40px); } 100% { opacity: 1; transform: translateX(0); } }
@keyframes slideOut { 0% { opacity: 1; transform: translateX(0);     } 100% { opacity: 0; transform: translateX(-40px); } }
</style>