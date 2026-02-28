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

const mainItems = [
  { image: '/images/publicity1.jpg', title: "L'Excellence Informatique", subtitle: 'Hardware de pointe pour professionnels' },
  { image: '/images/publicity3.jpg', title: 'Vous Satisfaire notre priorité', subtitle: 'Maintenance & Réseaux certifiés' },
  { image: '/images/publicity6.jpg', title: 'Smartphone et Tablette', subtitle: 'le point de vente' }
]

const brands = [
  { name: 'HP', img: '/images/logos/logo-hp.jpg' },
  { name: 'DELL', img: '/images/logos/logo-dell.jpg' },
  { name: 'LENOVO', img: '/images/logos/logo-lenovo.jpg' },
  { name: 'APPLE', img: '/images/logos/logo-iphone.jpg' },
  { name: 'SAMSUNG', img: '/images/logos/logo-samsung.jpg' },
  { name: 'CANON', img: '/images/logos/logo-canon.jpg' }
]

const categories = [
  {
    label: 'Ordinateurs Et Accessoires', sublabel: 'Ordinateurs', icon: 'i-heroicons-computer-desktop',
    sub: ['Laptops', 'Desktops', 'All-in-One', 'Ecran Ordinateurs', 'Accessoires Ordinateurs']
  },
  {
    label: 'Imprimantes / Scanners', sublabel: 'Imprimantes', icon: 'i-heroicons-cpu-chip',
    sub: ["Imprimantes", "Scanner", 'Consommables', 'Etiqueteuse']
  },
  {
    label: 'Smartphones et Tablettes', sublabel: 'Smartphones', icon: 'i-heroicons-device-phone-mobile',
    sub: ['iPhones', 'Android', 'Téléphones Mobiles', 'Tablettes']
  },
  {
    label: 'Matériel Réseau', sublabel: 'Réseau', icon: 'i-heroicons-signal',
    sub: ['Serveurs', 'Routeurs', "Switchs", 'Câbles Réseau', 'Fibre Optique']
  },
  {
    label: 'Sécurité & Biométrie', sublabel: 'Sécurité', icon: 'i-heroicons-shield-check',
    sub: ['Caméras/NVR/DVR', "Videophone", "Biometrie", 'Alarmes']
  },
  {
    label: 'Stockage Haute Densité', sublabel: 'Stockage', icon: 'i-heroicons-circle-stack',
    sub: ['SSD Interne', 'Disques Durs Externes', 'Clés USB']
  },
  {
    label: 'Maintenance Expert', sublabel: 'Maintenance', icon: 'i-heroicons-wrench-screwdriver',
    sub: ['Diagnostic', 'Réparation Écran', 'Remplacement Batterie', 'Nettoyage']
  },
  {
    label: 'SAV', sublabel: 'Maintenance', icon: 'i-heroicons-chat-bubble-left-right',
    sub: ['Diagnostic', 'Assistance Technique']
  },
]

const bestProducts = [
  { id: 1, name: 'MacBook Pro M2 - 16GB RAM', price: '850.000', oldPrice: '950.000', image: '/images/publicity0.jpg', imageHover: '/images/publicity1.jpg', discount: '-12%' },
  { id: 2, name: 'Meuble TV TAIPE - Structure MDP', price: '72.080', oldPrice: '90.100', image: '/images/publicity1.jpg', imageHover: '/images/publicity0.jpg', discount: '-20%' },
  { id: 3, name: 'Chaussure de Sécurité - INGCO', price: '16.500', oldPrice: '20.625', image: '/images/publicity2.jpg', imageHover: '/images/publicity0.jpg', discount: '-20%' },
  { id: 4, name: 'Meuble TV - HELO - TV 75 Pouces', price: '84.080', oldPrice: '100.896', image: '/images/publicity3.jpg', imageHover: '/images/publicity0.jpg', discount: '-17%' },
  { id: 5, name: 'Meuble TV - HELO - TV 75 Pouces', price: '84.080', oldPrice: '100.896', image: '/images/publicity3.jpg', imageHover: '/images/publicity0.jpg', discount: '-17%' },
]

const recentProducts = [
  { id: 5, name: 'Dell XPS 13 Plus 9320 dcvcvvvvvvvvv ', price: '650.000', oldPrice: '750.000', image: '/images/publicity0.jpg', imageHover: '/images/publicity1.jpg', discount: '-15%' },
  { id: 6, name: 'Samsung S24 Ultra 512GB', price: '820.000', oldPrice: '890.000', image: '/images/publicity1.jpg', imageHover: '/images/publicity2.jpg', discount: '-8%' },
  { id: 7, name: 'Écran LG UltraFine 27" 4K', price: '145.000', oldPrice: '180.000', image: '/images/publicity2.jpg', imageHover: '/images/publicity3.jpg', discount: '-20%' },
  { id: 8, name: 'Clavier Mécanique Stealth RGB', price: '45.000', oldPrice: '60.000', image: '/images/publicity3.jpg', imageHover: '/images/publicity0.jpg', discount: '-25%' },
  { id: 9, name: 'Meuble TV - HELO - TV 75 Pouces', price: '84.080', oldPrice: '100.896', image: '/images/publicity3.jpg', imageHover: '/images/publicity0.jpg', discount: '-17%' },
]

const accessories = [
  { id: 20, name: 'Logitech MX Master 3S Wireless', price: '65.000', oldPrice: '75.000', image: '/images/publicity1.jpg', imageHover: '/images/publicity2.jpg', discount: '-13%' },
  { id: 21, name: 'Casque Bose QuietComfort Ultra', price: '185.000', oldPrice: '210.000', image: '/images/publicity2.jpg', imageHover: '/images/publicity3.jpg', discount: '-12%' },
  { id: 22, name: 'Hub USB-C 11-en-1 HyperDrive', price: '35.000', oldPrice: '45.000', image: '/images/publicity3.jpg', imageHover: '/images/publicity0.jpg', discount: '-22%' },
  { id: 23, name: 'Sacoche Cuir Premium 16"', price: '55.000', oldPrice: '70.000', image: '/images/publicity0.jpg', imageHover: '/images/publicity1.jpg', discount: '-21%' },
  { id: 24, name: 'Sacoche Cuir Premium 16"', price: '55.000', oldPrice: '70.000', image: '/images/publicity0.jpg', imageHover: '/images/publicity1.jpg', discount: '-21%' }
]

const loading = ref(false)
const router = useRouter()
router.beforeEach(() => { loading.value = true })
router.afterEach(() => { setTimeout(() => { loading.value = false }, 400) })

const benefits = [
  { icon: 'i-heroicons-truck', title: 'Livraison rapide', subtitle: 'Entre 1 à 3 jours' },
  { icon: 'i-heroicons-star', title: 'Produits authentiques', subtitle: '100% garantis' },
  { icon: 'i-heroicons-arrow-path', title: 'Retour rapide et facile', subtitle: 'Sur 10 jours' },
  { icon: 'i-heroicons-wrench-screwdriver', title: 'Service après vente', subtitle: 'SAV agréé' },
]

const isExpanded = ref(false)
const isFlyerOpen = ref(false)
const hoveredCategory = ref<number | null>(null)
let inactivityTimer: any = null

const resetInactivityTimer = () => {
  if (isFlyerOpen.value) return
  if (inactivityTimer) clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(() => { isFlyerOpen.value = true }, 300000)
}

onMounted(() => {
  const hasSeenInitial = sessionStorage.getItem('flyer_seen_initial')
  if (!hasSeenInitial) {
    setTimeout(() => {
      isFlyerOpen.value = true
      sessionStorage.setItem('flyer_seen_initial', 'true')
    }, 5000)
  }
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
  activityEvents.forEach(event => { window.addEventListener(event, resetInactivityTimer) })
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
      <div class="flex flex-col md:flex-row gap-3 md:gap-4 md:h-[380px]">

        <!-- Sidebar — desktop only, overflow-visible for flyout -->
        <aside class="hidden md:flex flex-col w-full md:w-1/4 bg-white rounded-sm shadow-sm border border-gray-100 overflow-visible relative z-40">
          <div class="bg-[#274a82] p-4 text-white uppercase tracking-wider font-bold text-sm rounded-t-sm">
            <UIcon name="i-heroicons-bars-3" class="inline-block mr-2" /> Catégories
          </div>
          <nav class="flex-1 flex flex-col py-1 bg-white rounded-b-sm">
            <div
              v-for="(cat, index) in categories"
              :key="cat.label"
              class="relative"
              @mouseenter="hoveredCategory = index"
              @mouseleave="hoveredCategory = null"
            >
              <div
                class="flex items-center justify-between px-5 py-2.5 text-[13px] border-b border-gray-50 last:border-0 cursor-pointer select-none transition-colors"
                :class="hoveredCategory === index ? 'bg-[#f0f4ff]' : 'hover:bg-gray-50'"
              >
                <div class="flex items-center gap-3">
                  <UIcon :name="cat.icon" class="w-4 h-4 transition-colors" :class="hoveredCategory === index ? 'text-[#274a82]' : 'text-gray-400'" />
                  <span class="font-medium transition-colors" :class="hoveredCategory === index ? 'text-[#274a82]' : 'text-gray-700'">{{ cat.label }}</span>
                </div>
                <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 transition-colors" :class="hoveredCategory === index ? 'text-[#274a82]' : 'text-gray-300'" />
              </div>

              <!-- Flyout -->
              <Transition
                enter-active-class="transition-all duration-180 ease-out"
                enter-from-class="opacity-0 translate-x-2"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="transition-all duration-120 ease-in"
                leave-from-class="opacity-100 translate-x-0"
                leave-to-class="opacity-0 translate-x-1"
              >
                <div
                  v-if="hoveredCategory === index"
                  class="absolute left-full top-0 z-50 bg-white border border-gray-200 shadow-2xl rounded-sm min-w-[250px] py-2"
                  style="margin-left: 2px;"
                >
                  <!-- Arrow -->
                  <div class="absolute -left-[5px] top-4 w-2.5 h-2.5 bg-white border-l border-b border-gray-200 rotate-45"></div>
                  <!-- Header -->
                  <div class="px-4 py-2 mb-1 bg-[#274a82] flex items-center gap-2">
                    <UIcon :name="cat.icon" class="w-4 h-4 text-white" />
                    <span class="text-[11px] font-black text-white  tracking-widest">{{ cat.label }}</span>
                  </div>
                  <!-- Sub items -->
                  <NuxtLink
                    v-for="sub in cat.sub"
                    :key="sub"
                    to="#"
                    class="flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-600 hover:text-[#e60012] hover:bg-red-50 transition-colors"
                  >
                    
                    {{ sub }}
                  </NuxtLink>
                </div>
              </Transition>
            </div>
          </nav>
        </aside>

        <!-- Carousel -->
        <main class="w-full md:w-3/4 h-[220px] sm:h-[300px] md:h-full">
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
              <img :src="item.image" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent"></div>
              <!-- Left-aligned, vertically centered -->
              <div class="absolute inset-0 flex flex-col items-start justify-center p-6 sm:p-10 md:p-14">
                <h2 class="text-white text-xl sm:text-3xl md:text-[2.2rem] font-black mb-2 sm:mb-3 tracking-tighter drop-shadow-lg leading-tight max-w-xs sm:max-w-sm md:max-w-md">
                  {{ item.title }}
                </h2>
                <p class="text-white/75 text-xs sm:text-sm mb-4 sm:mb-5 max-w-[200px] sm:max-w-xs font-medium">
                  {{ item.subtitle }}
                </p>
                <UButton class="bg-[#e60012] hover:bg-white hover:text-[#e60012] font-black px-5 sm:px-8 py-2 sm:py-3 rounded transition-all shadow-xl text-xs sm:text-sm">
                  Voir les offres
                </UButton>
              </div>
            </div>
          </UCarousel>
        </main>

      </div>
    </section>

    <!-- ═══════════════ MOBILE CATEGORIES ═══════════════ -->
    <section class="md:hidden w-full overflow-x-auto no-scrollbar py-3 px-3 bg-white mt-3 border-b border-gray-200">
      <div class="flex gap-3 w-max">
        <NuxtLink v-for="cat in categories" :key="cat.label" class="flex flex-col items-center min-w-[68px] text-center gap-1 active:scale-95 transition-transform">
          <div class="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-[#274a82]">
            <UIcon :name="cat.icon" class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold text-gray-600 whitespace-nowrap">{{ cat.sublabel }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ═══════════════ MEILLEURES VENTES ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Les Meilleures Ventes du Moment</h2>
        <NuxtLink to="#" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>
      <div class="flex gap-2 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-visible">
        <div v-for="p in bestProducts" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl min-w-[150px] sm:min-w-0 flex-shrink-0 sm:flex-shrink">
          <div class="relative h-40 sm:h-48 md:h-52 w-full overflow-hidden">
            <div class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
            <div class="absolute right-2 top-2 flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors"><UIcon name="i-heroicons-heart" class="w-3.5 h-3.5" /></button>
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors"><UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" /></button>
            </div>
            <!-- Desktop: object-contain with hover swap | Mobile: object-cover -->
            <img :src="p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-0" />
            <img :src="p.imageHover || p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-110" />
            <!-- Desktop: slide-up cart button -->
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-medium mb-2 line-clamp-2 leading-snug min-h-[32px] w-[190px]">{{ p.name }}</h3>
            <!-- Desktop: simple price display -->
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ p.price }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <div class="flex items-center justify-between">
                <span class="text-[12px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
            </div>
            <!-- Mobile: price + round cart icon -->
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div>
                <div class="text-xl font-black text-gray-900 leading-tight">{{ p.price }} <span class="text-[9px] font-semibold">FCFA</span></div>
                <span class="text-[10px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
              <button class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ NOUVEAUTÉS ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Nouveautés : Le Futur est ici</h2>
        <NuxtLink to="#" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>
      <div class="flex gap-2 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-visible">
        <div v-for="p in recentProducts" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl min-w-[150px] sm:min-w-0 flex-shrink-0 sm:flex-shrink">
          <div class="relative h-40 sm:h-48 md:h-52 w-full overflow-hidden">
            <div class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
            <div class="absolute right-2 top-2 flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors"><UIcon name="i-heroicons-heart" class="w-3.5 h-3.5" /></button>
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors"><UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" /></button>
            </div>
            <!-- Desktop: object-contain with hover swap | Mobile: object-cover -->
            <img :src="p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-0" />
            <img :src="p.imageHover || p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-110" />
            <!-- Desktop: slide-up cart button -->
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-medium mb-2 line-clamp-2 leading-snug min-h-[32px] w-[190px]">{{ p.name }}</h3>
            <!-- Desktop: simple price display -->
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ p.price }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <div class="flex items-center justify-between">
                <span class="text-[12px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
            </div>
            <!-- Mobile: price + round cart icon -->
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div>
                <div class="text-xl font-black text-gray-900 leading-tight">{{ p.price }} <span class="text-[9px] font-semibold">FCFA</span></div>
                <span class="text-[10px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
              <button class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ BANNER DUO 1 ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="relative h-[240px] sm:h-[300px] md:h-[420px] overflow-hidden group shadow-lg">
          <img src="/images/publicity0.jpg" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div class="relative h-full flex flex-col justify-end p-6 sm:p-10 text-white">
            <h3 class="text-2xl sm:text-4xl font-black mb-2 tracking-tighter">Offres Flash BRC</h3>
            <p class="mb-4 sm:mb-6 text-sm sm:text-base opacity-90 max-w-sm italic">Commandez dès maintenant et profitez de remises exclusives.</p>
            <UButton size="md" class="w-fit bg-white text-[#274a82] font-black rounded hover:bg-[#e60012] hover:text-white px-6 sm:px-10 transition-all">Commander maintenant</UButton>
          </div>
        </div>
        <div class="relative h-[240px] sm:h-[300px] md:h-[420px] overflow-hidden group shadow-lg">
          <img src="/images/publicity1.jpg" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div class="relative h-full flex flex-col justify-end items-end text-right p-6 sm:p-10 text-white">
            <h3 class="text-2xl sm:text-4xl font-black mb-2 tracking-tighter">S.A.V & Maintenance</h3>
            <p class="mb-4 sm:mb-6 text-sm sm:text-base opacity-90 max-w-sm italic">Expertise technique certifiée pour la longévité de votre parc.</p>
            <UButton size="md" class="w-fit bg-[#e60012] text-white font-black rounded hover:bg-white hover:text-[#e60012] px-6 sm:px-10 transition-all">Nous contacter</UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ RÉSEAUX PRO ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Infrastructure & Réseaux Pro</h2>
        <NuxtLink to="#" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>
      <div class="flex gap-2 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-visible">
        <div v-for="p in accessories" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl min-w-[150px] sm:min-w-0 flex-shrink-0 sm:flex-shrink">
          <div class="relative h-40 sm:h-48 md:h-52 w-full overflow-hidden">
            <div class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
            <div class="absolute right-2 top-2 flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors"><UIcon name="i-heroicons-heart" class="w-3.5 h-3.5" /></button>
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors"><UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" /></button>
            </div>
            <!-- Desktop: object-contain with hover swap | Mobile: object-cover -->
            <img :src="p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-0" />
              <img :src="p.imageHover || p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-110" />
            <!-- Desktop: slide-up cart button -->
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-medium mb-2 line-clamp-2 leading-snug min-h-[32px] w-[190px]">{{ p.name }}</h3>
            <!-- Desktop: simple price display -->
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ p.price }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <div class="flex items-center justify-between">
                <span class="text-[12px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
            </div>
            <!-- Mobile: price + round cart icon -->
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div>
                <div class="text-xl font-black text-gray-900 leading-tight">{{ p.price }} <span class="text-[9px] font-semibold">FCFA</span></div>
                <span class="text-[10px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
              <button class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ ACCESSOIRES ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">L'Arsenal des Accessoires</h2>
        <NuxtLink to="#" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>
      <div class="flex gap-2 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-visible">
        <div v-for="p in accessories" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl min-w-[150px] sm:min-w-0 flex-shrink-0 sm:flex-shrink">
          <div class="relative h-40 sm:h-48 md:h-52 w-full overflow-hidden">
            <div class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
            <div class="absolute right-2 top-2 flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors"><UIcon name="i-heroicons-heart" class="w-3.5 h-3.5" /></button>
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors"><UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" /></button>
            </div>
            <!-- Desktop: object-contain with hover swap | Mobile: object-cover -->
            <img :src="p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-0" />
              <img :src="p.imageHover || p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-110" />
            <!-- Desktop: slide-up cart button -->
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-medium mb-2 line-clamp-2 leading-snug min-h-[32px] w-[190px]">{{ p.name }}</h3>
            <!-- Desktop: simple price display -->
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ p.price }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <div class="flex items-center justify-between">
                <span class="text-[12px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
            </div>
            <!-- Mobile: price + round cart icon -->
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div>
                <div class="text-xl font-black text-gray-900 leading-tight">{{ p.price }} <span class="text-[9px] font-semibold">FCFA</span></div>
                <span class="text-[10px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
              <button class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ TRIO BANNER ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div class="relative h-[220px] sm:h-[320px] md:h-[450px] overflow-hidden group shadow-lg">
          <img src="/images/publicity1.jpg" class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-all duration-1000" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          <div class="relative h-full flex flex-col justify-end p-6 sm:p-8 text-white">
            <div class="mb-2 bg-[#e60012] w-fit px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Nouveauté</div>
            <h3 class="text-xl sm:text-3xl font-black mb-2 tracking-tighter uppercase leading-none">Stations <br> de Travail</h3>
            <p class="mb-4 text-xs sm:text-sm opacity-80 max-w-[240px]">Performance extrême avec les derniers HP ZBook G9.</p>
            <UButton size="md" class="w-fit bg-white text-[#274a82] font-black rounded hover:bg-[#e60012] hover:text-white px-6 sm:px-8 transition-all">Découvrir</UButton>
          </div>
        </div>
        <div class="relative h-[220px] sm:h-[320px] md:h-[450px] overflow-hidden group shadow-lg">
          <img src="/images/publicity2.jpg" class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-all duration-1000" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          <div class="relative h-full flex flex-col justify-end p-6 sm:p-8 text-white">
            <div class="mb-2 bg-white text-[#274a82] w-fit px-2 py-0.5 text-[10px] font-black tracking-widest">Expertise</div>
            <h3 class="text-xl sm:text-3xl font-black mb-2 tracking-tighter  leading-none">Solutions <br> Réseaux IT</h3>
            <p class="mb-4 text-xs sm:text-sm opacity-80 max-w-[240px]">Infrastructures Cisco & Ubiquiti pour une connectivité sans faille.</p>
            <UButton size="md" class="w-fit bg-[#e60012] text-white font-black rounded hover:bg-white hover:text-[#e60012] px-6 sm:px-8 transition-all">Voir l'offre</UButton>
          </div>
        </div>
        <div class="relative h-[220px] sm:h-[320px] md:h-[450px] sm:col-span-2 lg:col-span-1 overflow-hidden group shadow-lg">
          <img src="/images/publicity3.jpg" class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-all duration-1000" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          <div class="relative h-full flex flex-col justify-end p-6 sm:p-8 text-white">
            <div class="mb-2 bg-yellow-500 text-black w-fit px-2 py-0.5 text-[10px] font-black tracking-widest">Service Pro</div>
            <h3 class="text-xl sm:text-3xl font-black mb-2 tracking-tighter leading-none">Audit & <br> Maintenance</h3>
            <p class="mb-4 text-xs sm:text-sm opacity-80 max-w-[240px]">Prolongez la durée de vie de votre parc informatique.</p>
            <UButton size="md" variant="outline" class="w-fit text-white border-white font-black rounded hover:bg-white hover:text-black px-6 sm:px-8 transition-all">Prendre RDV</UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ GADGETS ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Les Meilleurs Gadgets du Market</h2>
        <NuxtLink to="#" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>
      <div class="flex gap-2 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-visible">
        <div v-for="p in accessories" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl min-w-[150px] sm:min-w-0 flex-shrink-0 sm:flex-shrink">
          <div class="relative h-40 sm:h-48 md:h-52 w-full overflow-hidden">
            <div class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
            <div class="absolute right-2 top-2 flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors"><UIcon name="i-heroicons-heart" class="w-3.5 h-3.5" /></button>
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors"><UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" /></button>
            </div>
            <!-- Desktop: object-contain with hover swap | Mobile: object-cover -->
            <img :src="p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-0" />
              <img :src="p.imageHover || p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-110" />
            <!-- Desktop: slide-up cart button -->
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-medium mb-2 line-clamp-2 leading-snug min-h-[32px] w-[190px]">{{ p.name }}</h3>
            <!-- Desktop: simple price display -->
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ p.price }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <div class="flex items-center justify-between">
                <span class="text-[12px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
            </div>
            <!-- Mobile: price + round cart icon -->
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div>
                <div class="text-xl font-black text-gray-900 leading-tight">{{ p.price }} <span class="text-[9px] font-semibold">FCFA</span></div>
                <span class="text-[10px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
              <button class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ BANNER DUO 2 ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="relative h-[240px] sm:h-[300px] md:h-[420px] overflow-hidden group shadow-lg">
          <img src="/images/publicity4.jpg" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div class="relative h-full flex flex-col justify-end p-6 sm:p-10 text-white">
            <h3 class="text-2xl sm:text-4xl font-black mb-2 tracking-tighter">En Promotion</h3>
            <p class="mb-4 sm:mb-6 text-sm sm:text-lg opacity-90 italic">Remises exclusives sur tout le catalogue.</p>
            <UButton size="md" class="w-fit bg-white text-[#274a82] font-black rounded hover:bg-[#e60012] hover:text-white px-6 sm:px-10 transition-all">Commander maintenant</UButton>
          </div>
        </div>
        <div class="relative h-[240px] sm:h-[300px] md:h-[420px] overflow-hidden group shadow-lg">
          <img src="/images/publicity5.jpg" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div class="relative h-full flex flex-col justify-end items-end text-right p-6 sm:p-10 text-white">
            <h3 class="text-2xl sm:text-4xl font-black mb-2 tracking-tighter">Gadget & Accessoires</h3>
            <p class="mb-4 sm:mb-6 text-sm sm:text-lg opacity-90 italic">Expertise technique pour votre parc informatique.</p>
            <UButton size="md" class="w-fit bg-[#e60012] text-white font-black rounded hover:bg-white hover:text-[#e60012] px-6 sm:px-10 transition-all">Nous contacter</UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ SMARTPHONES ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Mobilité : Smartphones & Tablettes</h2>
        <NuxtLink to="#" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>
      <div class="flex gap-2 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-visible">
        <div v-for="p in accessories" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl min-w-[150px] sm:min-w-0 flex-shrink-0 sm:flex-shrink">
          <div class="relative h-40 sm:h-48 md:h-52 w-full overflow-hidden">
            <div class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
            <div class="absolute right-2 top-2 flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors"><UIcon name="i-heroicons-heart" class="w-3.5 h-3.5" /></button>
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors"><UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" /></button>
            </div>
            <!-- Desktop: object-contain with hover swap | Mobile: object-cover -->
           <img :src="p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-0" />
            <img :src="p.imageHover || p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-110" />
            <!-- Desktop: slide-up cart button -->
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-medium mb-2 line-clamp-2 leading-snug min-h-[32px] w-[190px]">{{ p.name }}</h3>
            <!-- Desktop: simple price display -->
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ p.price }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <div class="flex items-center justify-between">
                <span class="text-[12px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
            </div>
            <!-- Mobile: price + round cart icon -->
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div>
                <div class="text-xl font-black text-gray-900 leading-tight">{{ p.price }} <span class="text-[9px] font-semibold">FCFA</span></div>
                <span class="text-[10px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
              <button class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ ÉCRANS INCURVÉS ═══════════════ -->
    <section class="max-w-7xl mx-auto px-3 sm:px-4 my-6 sm:my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-4 sm:mb-6">
        <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Le Stock des Écrans Incurvés</h2>
        <NuxtLink to="#" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>
      <div class="flex gap-2 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-visible">
        <div v-for="p in accessories" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl min-w-[150px] sm:min-w-0 flex-shrink-0 sm:flex-shrink">
          <div class="relative h-40 sm:h-48 md:h-52 w-full overflow-hidden">
            <div class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
            <div class="absolute right-2 top-2 flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors"><UIcon name="i-heroicons-heart" class="w-3.5 h-3.5" /></button>
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors"><UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" /></button>
            </div>
            <!-- Desktop: object-contain with hover swap | Mobile: object-cover -->
            <img :src="p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-0" />
            <img :src="p.imageHover || p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-110" />
            <!-- Desktop: slide-up cart button -->
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-medium mb-2 line-clamp-2 leading-snug min-h-[32px] w-[190px]">{{ p.name }}</h3>
            <!-- Desktop: simple price display -->
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ p.price }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <div class="flex items-center justify-between">
                <span class="text-[12px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
            </div>
            <!-- Mobile: price + round cart icon -->
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div>
                <div class="text-xl font-black text-gray-900 leading-tight">{{ p.price }} <span class="text-[9px] font-semibold">FCFA</span></div>
                <span class="text-[10px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
              <button class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
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
        <NuxtLink to="#" class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group whitespace-nowrap">Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" /></NuxtLink>
      </div>
      <div class="flex gap-2 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:overflow-visible">
        <div v-for="p in accessories" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl min-w-[150px] sm:min-w-0 flex-shrink-0 sm:flex-shrink">
          <div class="relative h-40 sm:h-48 md:h-52 w-full overflow-hidden">
            <div class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
            <div class="absolute right-2 top-2 flex flex-col gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors"><UIcon name="i-heroicons-heart" class="w-3.5 h-3.5" /></button>
              <button class="w-7 h-7 bg-white/90 shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors"><UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" /></button>
            </div>
            <!-- Desktop: object-contain with hover swap | Mobile: object-cover -->
            <img :src="p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-0" />
            <img :src="p.imageHover || p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-110" />
            <!-- Desktop: slide-up cart button -->
            <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full z-20 transition-all duration-300">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-sm sm:text-[15px] text-gray-600 font-medium mb-2 line-clamp-2 leading-snug min-h-[32px] w-[190px]">{{ p.name }}</h3>
            <!-- Desktop: simple price display -->
            <div class="hidden sm:block mt-auto">
              <div class="text-2xl font-black text-gray-900 mb-0.5">{{ p.price }} <span class="text-[11px] font-semibold">FCFA</span></div>
              <div class="flex items-center justify-between">
                <span class="text-[12px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
            </div>
            <!-- Mobile: price + round cart icon -->
            <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
              <div>
                <div class="text-xl font-black text-gray-900 leading-tight">{{ p.price }} <span class="text-[9px] font-semibold">FCFA</span></div>
                <span class="text-[10px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
              </div>
              <button class="flex-shrink-0 w-8 h-8 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm">
                <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
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
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>