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

// Carousel Principal
const mainItems = [
  { image: '/images/publicity1.jpg', title: 'L\'Excellence Informatique', subtitle: 'Hardware de pointe pour professionnels', cta: 'Commander maintenant' },
  { image: '/images/publicity3.jpg', title: 'Vous Satisfaire notre priorité', subtitle: 'Maintenance & Réseaux certifiés', cta: 'Découvrir' },
  { image: '/images/publicity4.jpg', title: 'Solutions sur Mesure, Maintenance', subtitle: 'Maintenance & Réseaux certifiés', cta: 'Découvrir' }

]

const brands = [
  { name: 'HP', img: '/images/logos/logo-hp.jpg' },
  { name: 'DELL', img: '/images/logos/logo-dell.jpg' },
  { name: 'LENOVO', img: '/images/logos/logo-lenovo.jpg' },
  { name: 'APPLE', img: '/images/logos/logo-iphone.jpg' },
  { name: 'SAMSUNG', img: '/images/logos/logo-samsung.jpg' },
  { name: 'CANON', img: '/images/logos/logo-canon.jpg' }
]

// Catégories
const categories = [
  { label: 'Ordinateurs Et Accessoires',sublabel: 'Ordinateurs', icon: 'i-heroicons-computer-desktop' },
  { label: 'Smartphones et Tablettes', sublabel: 'Smartphones', icon: 'i-heroicons-device-phone-mobile' },
  { label: 'Maintenance Expert',sublabel: 'Maintenance', icon: 'i-heroicons-wrench-screwdriver' },
  { label: 'Imprimantes / Scanners', sublabel: 'Imprimantes', icon: 'i-heroicons-cpu-chip' },
  { label: 'Tablettes & Tactile',sublabel: 'Tablettes', icon: 'i-heroicons-device-tablet' },
  { label: 'Matériel Réseau Pro', sublabel: 'Réseau', icon: 'i-heroicons-signal' },
  { label: 'Sécurité & Biométrie', sublabel: 'Sécurité ',  icon: 'i-heroicons-shield-check' },
  { label: 'Stockage Haute Densité', sublabel: 'Stockage', icon: 'i-heroicons-circle-stack' }
]

// Données des produits
const bestProducts = [
  { id: 1, name: 'MacBook Pro M2 - 16GB RAM', price: '850.000', oldPrice: '950.000', image: '/images/publicity0.jpg', imageHover: '/images/publicity1.jpg', discount: '-12%' },
  { id: 2, name: 'Meuble TV TAIPE - Structure MDP', price: '72.080', oldPrice: '90.100', image: '/images/publicity1.jpg', imageHover: '/images/publicity0.jpg', discount: '-20%' },
  { id: 3, name: 'Chaussure de Sécurité - INGCO', price: '16.500', oldPrice: '20.625', image: '/images/publicity2.jpg', imageHover: '/images/publicity0.jpg', discount: '-20%' },
  { id: 4, name: 'Meuble TV - HELO - TV 75 Pouces', price: '84.080', oldPrice: '100.896', image: '/images/publicity3.jpg', imageHover: '/images/publicity0.jpg', discount: '-17%' },
  { id: 5, name: 'Meuble TV - HELO - TV 75 Pouces', price: '84.080', oldPrice: '100.896', image: '/images/publicity3.jpg', imageHover: '/images/publicity0.jpg', discount: '-17%' },
  
]

const recentProducts = [
  { id: 5, name: 'Dell XPS 13 Plus 9320', price: '650.000', oldPrice: '750.000', image: '/images/publicity0.jpg', imageHover: '/images/publicity1.jpg', discount: '-15%' },
  { id: 6, name: 'Samsung S24 Ultra 512GB', price: '820.000', oldPrice: '890.000', image: '/images/publicity1.jpg', imageHover: '/images/publicity2.jpg', discount: '-8%' },
  { id: 7, name: 'Écran LG UltraFine 27" 4K', price: '145.000', oldPrice: '180.000', image: '/images/publicity2.jpg', imageHover: '/images/publicity3.jpg', discount: '-20%' },
  { id: 8, name: 'Clavier Mécanique Stealth RGB', price: '45.000', oldPrice: '60.000', image: '/images/publicity3.jpg', imageHover: '/images/publicity0.jpg', discount: '-25%' },
  { id: 5, name: 'Meuble TV - HELO - TV 75 Pouces', price: '84.080', oldPrice: '100.896', image: '/images/publicity3.jpg', imageHover: '/images/publicity0.jpg', discount: '-17%' },
  
]

const accessories = [
  { id: 20, name: 'Logitech MX Master 3S Wireless', price: '65.000', oldPrice: '75.000', image: '/images/publicity1.jpg', imageHover: '/images/publicity2.jpg', discount: '-13%' },
  { id: 21, name: 'Casque Bose QuietComfort Ultra', price: '185.000', oldPrice: '210.000', image: '/images/publicity2.jpg', imageHover: '/images/publicity3.jpg', discount: '-12%' },
  { id: 22, name: 'Hub USB-C 11-en-1 HyperDrive', price: '35.000', oldPrice: '45.000', image: '/images/publicity3.jpg', imageHover: '/images/publicity0.jpg', discount: '-22%' },
  { id: 23, name: 'Sacoche Cuir Premium 16"', price: '55.000', oldPrice: '70.000', image: '/images/publicity0.jpg', imageHover: '/images/publicity1.jpg', discount: '-21%' },
  { id: 23, name: 'Sacoche Cuir Premium 16"', price: '55.000', oldPrice: '70.000', image: '/images/publicity0.jpg', imageHover: '/images/publicity1.jpg', discount: '-21%' }

]

const loading = ref(false)
const router = useRouter()

router.beforeEach(() => { loading.value = true })
router.afterEach(() => {
  setTimeout(() => { loading.value = false }, 400)
})

const benefits = [
  { 
    icon: 'i-heroicons-truck', 
    title: 'Livraison rapide', 
    subtitle: 'Entre 1 à 3 jours' 
  },
  { 
    icon: 'i-heroicons-star', 
    title: 'Produits authentiques', 
    subtitle: '100% garantis' 
  },
  { 
    icon: 'i-heroicons-arrow-path', 
    title: 'Retour rapide et facile', 
    subtitle: 'Sur 10 jours' 
  },
   { 
    icon: 'i-heroicons-wrench-screwdriver', 
    title: 'Service après vente', 
    subtitle: 'SAV agréé' 
  },
]

const isExpanded = ref(false)

const isFlyerOpen = ref(false)
let inactivityTimer: any = null

const resetInactivityTimer = () => {
  if (isFlyerOpen.value) return
  if (inactivityTimer) clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(() => {
    isFlyerOpen.value = true
  }, 300000) 
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
  activityEvents.forEach(event => {
    window.addEventListener(event, resetInactivityTimer)
  })
  resetInactivityTimer()
})

onUnmounted(() => {
  if (inactivityTimer) clearTimeout(inactivityTimer)
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
  activityEvents.forEach(event => {
    window.removeEventListener(event, resetInactivityTimer)
  })
})

</script>

<template>
  <div class="bg-[#f4f4f4] min-h-screen pb-20">
    
    <section class="max-w-7xl mx-auto px-4 pt-6">
      <div class="flex flex-col md:flex-row gap-4 h-auto md:h-[380px]">
        <aside class="hidden md:flex flex-col w-full md:w-1/4 bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <div class="bg-[#274a82] p-4 text-white uppercase tracking-wider font-bold text-sm">
             <UIcon name="i-heroicons-bars-3" class="inline-block mr-2" /> Catégories
          </div>
          <nav class="flex-1 flex flex-col justify-between py-1 bg-white">
            <UPopover mode="hover" :content="{
              align: 'center',
              side: 'right',
              sideOffset: 8
            }">
              <NuxtLink v-for="cat in categories" :key="cat.label" class="flex items-center justify-between px-5 py-2 hover:bg-gray-50 text-[13px] border-b border-gray-50 last:border-0 group transition-all">
                
                <div class="flex items-center gap-3">
                  <UIcon :name="cat.icon" class="text-gray-400 group-hover:text-[#274a82]" />
                  <span class="text-gray-700 font-medium group-hover:text-[#274a82]">{{ cat.label }}</span>
                </div>
                <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 text-gray-300" />
              </NuxtLink>
              <template #content >
                <Placeholder class=" w-150 h-60 m-4 inline-flex" />
              </template>
            </UPopover>
              
          </nav>
        </aside>

        <main class="w-full md:w-3/4  md:h-full sm:h-full">
          <UCarousel
            v-slot="{ item }"
            :items="mainItems"
            arrows
            dots
            :autoplay="{ delay: 2000 }"
            class="relative h-full rounded-sm overflow-hidden shadow-sm group/carousel"
            :prev="{ variant: 'solid' }"
            :next="{ variant: 'solid' }"
            :ui="{
              prev: 'sm:start-6',
              next: 'sm:end-6',
            }"
          >
            <div class="relative w-full h-full">
              <img :src="item.image" class="w-full h-full object-cover transition-all duration-700 group-hover/carousel:blur-sm" />
              
              <div class="absolute inset-0 bg-black/20"></div>

              <div class="absolute inset-0 flex flex-col justify-center items-start px-12 md:px-20 text-left">
                <h2 class="text-white text-2xl md:text-4xl font-black  mb-8 tracking-tighter drop-shadow-lg">
                  {{ item.title }}
                </h2>
                <UButton 
                  size="l" 
                  class="bg-[#e60012] hover:bg-white hover:text-[#e60012] font-black px-8 py-4 rounded-none transition-all shadow-xl"
                >
                  Voir les offres
                </UButton>
              </div>
            </div>
          </UCarousel>
        </main>

      </div>
    </section>

    <section class="md:hidden w-full overflow-x-auto no-scrollbar py-4 px-2 bg-white mt-4 flex gap-4 border-b border-gray-200">
      <NuxtLink v-for="cat in categories" :key="cat.label" class="flex flex-col items-center min-w-[80px] text-center gap-1">
        <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[#274a82]">
          <UIcon :name="cat.icon" class="w-6 h-6" />
        </div>
        <span class="text-[10px] font-bold text-gray-600 whitespace-nowrap">{{ cat.sublabel }}</span>
      </NuxtLink>
    </section>

    <section class="max-w-7xl mx-auto px-4 my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-6">
        <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight ">
          Les Meilleures Ventes du Moment
        </h2>
        <NuxtLink to="#" class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1  transition-colors group">
          Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        <div v-for="p in bestProducts" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl">
          <div class="relative h-64 w-full overflow-hidden p-2 flex items-center justify-center">
            <div class="absolute right-[-50px] group-hover:right-3 top-3 flex flex-col gap-2 z-30 transition-all duration-300">
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors">
                <UIcon name="i-heroicons-heart" class="w-5 h-5" />
              </button>
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors">
                <UIcon name="i-heroicons-eye" class="w-5 h-5" />
              </button>
            </div>
            <img :src="p.image" class="w-full h-full object-contain p-1 transition-all duration-500 group-hover:scale-110 group-hover:opacity-0" />
            <img :src="p.imageHover || p.image" class="absolute inset-0 w-full h-full object-contain p-1 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105" />
            <div class="absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full p-0 transition-all duration-300 z-20">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3 ">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-[13px] text-gray-600 font-medium mb-2 line-clamp-2 h-10 leading-snug ">{{ p.name }}</h3>
            <div class="mt-auto">
              <div class="text-[20px] font-black text-gray-900 mb-0.5">{{ p.price }} FCFA</div>
              <div class="flex items-center justify-between">
                <span class="text-[13px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
                <div class="bg-[#e60012] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


    <section class="max-w-7xl mx-auto px-4 my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-6">
        <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          Nouveautés : Le Futur est ici
        </h2>
        <NuxtLink to="#" class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group">
          Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 ">
        <div v-for="p in recentProducts" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl">
          <div class="relative h-64 w-full overflow-hidden p-2 flex items-center justify-center">
            <div class="absolute right-[-50px] group-hover:right-3 top-3 flex flex-col gap-2 z-30 transition-all duration-300">
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors">
                <UIcon name="i-heroicons-heart" class="w-5 h-5" />
              </button>
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors">
                <UIcon name="i-heroicons-eye" class="w-5 h-5" />
              </button>
            </div>
            <img :src="p.image" class="w-full h-full object-contain p-1 transition-all duration-500 group-hover:scale-110 group-hover:opacity-0" />
            <img :src="p.imageHover || p.image" class="absolute inset-0 w-full h-full object-contain p-1 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105" />
            <div class="absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full p-0 transition-all duration-300 z-20">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3 ">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-[13px] text-gray-600 font-medium mb-2 line-clamp-2 h-10 leading-snug">{{ p.name }}</h3>
            <div class="mt-auto">
              <div class="text-[20px] font-black text-gray-900 mb-0.5">{{ p.price }} FCFA</div>
              <div class="flex items-center justify-between">
                <span class="text-[13px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
                <div class="bg-[#e60012] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 my-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div class="relative h-[420px] bg-[#274a82] overflow-hidden group shadow-lg">
          <img src="/images/publicity0.jpg" class="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-all duration-1000" />
          <div class="relative h-full flex flex-col justify-end p-10 text-white bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            <h3 class="text-4xl font-black mb-2 tracking-tighter">Offres Flash BRC</h3>
            <p class="mb-6 text-lg opacity-90 max-w-sm italic">Commandez dès maintenant et profitez de remises exclusives sur tout le catalogue informatique.</p>
            <UButton size="xl" class="w-fit bg-white text-[#274a82] font-black rounded-none hover:bg-[#e60012] hover:text-white px-10 transition-all">Commander maintenant</UButton>
          </div>
        </div>
        <div class="relative h-[420px] bg-slate-900 overflow-hidden group shadow-lg text-right items-end">
          <img src="/images/publicity1.jpg" class="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-all duration-1000" />
          <div class="relative h-full flex flex-col justify-end items-end p-10 text-white bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            <h3 class="text-4xl font-black  mb-2 tracking-tighter">S.A.V & Maintenance</h3>
            <p class="mb-6 text-lg opacity-90 max-w-sm italic">Expertise technique certifiée pour la longévité de votre parc informatique.</p>
            <UButton size="xl" class="w-fit bg-[#e60012] text-white font-black rounded-none hover:bg-white hover:text-[#e60012] px-10 transition-all">Nous contacter</UButton>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-6">
        <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          Infrastructure & Réseaux Pro
        </h2>
        <NuxtLink to="#" class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group">
          Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        <div v-for="p in accessories" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl">
          <div class="relative h-64 w-full overflow-hidden p-2 flex items-center justify-center">
            <div class="absolute right-[-50px] group-hover:right-3 top-3 flex flex-col gap-2 z-30 transition-all duration-300">
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors">
                <UIcon name="i-heroicons-heart" class="w-5 h-5" />
              </button>
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors">
                <UIcon name="i-heroicons-eye" class="w-5 h-5" />
              </button>
            </div>
            <img :src="p.image" class="w-full h-full object-contain p-1 transition-all duration-500 group-hover:scale-110 group-hover:opacity-0" />
            <img :src="p.imageHover || p.image" class="absolute inset-0 w-full h-full object-contain p-1 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105" />
            <div class="absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full p-0 transition-all duration-300 z-20">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3 ">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-[13px] text-gray-600 font-medium mb-2 line-clamp-2 h-10 leading-snug uppercase">{{ p.name }}</h3>
            <div class="mt-auto">
              <div class="text-[20px] font-black text-gray-900 mb-0.5">{{ p.price }} FCFA</div>
              <div class="flex items-center justify-between">
                <span class="text-[13px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
                <div class="bg-[#e60012] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-6">
        <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          L'Arsenal des Accessoires
        </h2>

        <NuxtLink to="#" class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group">
          Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        <div v-for="p in accessories" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl">
          <div class="relative h-64 w-full overflow-hidden p-2 flex items-center justify-center">
            <div class="absolute right-[-50px] group-hover:right-3 top-3 flex flex-col gap-2 z-30 transition-all duration-300">
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors">
                <UIcon name="i-heroicons-heart" class="w-5 h-5" />
              </button>
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors">
                <UIcon name="i-heroicons-eye" class="w-5 h-5" />
              </button>
            </div>
            <img :src="p.image" class="w-full h-full object-contain p-1 transition-all duration-500 group-hover:scale-110 group-hover:opacity-0" />
            <img :src="p.imageHover || p.image" class="absolute inset-0 w-full h-full object-contain p-1 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105" />
            <div class="absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full p-0 transition-all duration-300 z-20">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3 ">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-[13px] text-gray-600 font-medium mb-2 line-clamp-2 h-10 leading-snug uppercase">{{ p.name }}</h3>
            <div class="mt-auto">
              <div class="text-[20px] font-black text-gray-900 mb-0.5">{{ p.price }} FCFA</div>
              <div class="flex items-center justify-between">
                <span class="text-[13px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
                <div class="bg-[#e60012] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 my-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      
      <div class="relative h-[450px] bg-[#0A162F] overflow-hidden group shadow-lg border border-gray-800">
        <img src="/images/publicity1.jpg" class="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-all duration-1000" />
        <div class="relative h-full flex flex-col justify-end p-8 text-white bg-gradient-to-t from-black/90 via-black/30 to-transparent">
          <div class="mb-2 bg-[#e60012] w-fit px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Nouveauté</div>
          <h3 class="text-3xl font-black mb-2 tracking-tighter uppercase leading-none">Stations <br> de Travail</h3>
          <p class="mb-6 text-sm opacity-80 max-w-[240px] font-medium">Performance extrême avec les derniers HP ZBook G9 certifiés Intel.</p>
          <UButton size="xl" class="w-fit bg-white text-[#274a82] font-black rounded-none hover:bg-[#e60012] hover:text-white px-8 transition-all">Découvrir</UButton>
        </div>
      </div>

      <div class="relative h-[450px] bg-[#274a82] overflow-hidden group shadow-lg border border-gray-800">
        <img src="/images/publicity2.jpg" class="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-all duration-1000" />
        <div class="relative h-full flex flex-col justify-end p-8 text-white bg-gradient-to-t from-black/90 via-black/30 to-transparent">
          <div class="mb-2 bg-white text-[#274a82] w-fit px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Expertise</div>
          <h3 class="text-3xl font-black mb-2 tracking-tighter uppercase leading-none">Solutions <br> Réseaux IT</h3>
          <p class="mb-6 text-sm opacity-80 max-w-[240px] font-medium">Infrastructures Cisco & Ubiquiti pour une connectivité sans faille.</p>
          <UButton size="xl" class="w-fit bg-[#e60012] text-white font-black rounded-none hover:bg-white hover:text-[#e60012] px-8 transition-all">Voir l'offre</UButton>
        </div>
      </div>

      <div class="relative h-[450px] bg-slate-800 overflow-hidden group shadow-lg border border-gray-800">
        <img src="/images/publicity3.jpg" class="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-all duration-1000" />
        <div class="relative h-full flex flex-col justify-end p-8 text-white bg-gradient-to-t from-black/90 via-black/30 to-transparent">
          <div class="mb-2 bg-yellow-500 text-black w-fit px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Service Pro</div>
          <h3 class="text-3xl font-black mb-2 tracking-tighter uppercase leading-none">Audit & <br> Maintenance</h3>
          <p class="mb-6 text-sm opacity-80 max-w-[240px] font-medium">Prolongez la durée de vie de votre parc informatique avec nos experts.</p>
          <UButton size="xl" variant="outline" class="w-fit text-white border-white font-black rounded-none hover:bg-white hover:text-black px-8 transition-all">Prendre RDV</UButton>
        </div>
      </div>

    </div>
  </section>

    <section class="max-w-7xl mx-auto px-4 my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-6">
        <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          Les Meilleur Gadget du Market
        </h2>

        <NuxtLink to="#" class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group">
          Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        <div v-for="p in accessories" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl">
          <div class="relative h-64 w-full overflow-hidden p-2 flex items-center justify-center">
            <div class="absolute right-[-50px] group-hover:right-3 top-3 flex flex-col gap-2 z-30 transition-all duration-300">
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors">
                <UIcon name="i-heroicons-heart" class="w-5 h-5" />
              </button>
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors">
                <UIcon name="i-heroicons-eye" class="w-5 h-5" />
              </button>
            </div>
            <img :src="p.image" class="w-full h-full object-contain p-1 transition-all duration-500 group-hover:scale-110 group-hover:opacity-0" />
            <img :src="p.imageHover || p.image" class="absolute inset-0 w-full h-full object-contain p-1 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105" />
            <div class="absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full p-0 transition-all duration-300 z-20">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3 ">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-[13px] text-gray-600 font-medium mb-2 line-clamp-2 h-10 leading-snug uppercase">{{ p.name }}</h3>
            <div class="mt-auto">
              <div class="text-[20px] font-black text-gray-900 mb-0.5">{{ p.price }} FCFA</div>
              <div class="flex items-center justify-between">
                <span class="text-[13px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
                <div class="bg-[#e60012] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 my-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div class="relative h-[420px] bg-[#274a82] overflow-hidden group shadow-lg">
          <img src="/images/publicity4.jpg" class="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-all duration-1000" />
          <div class="relative h-full flex flex-col justify-end p-10 text-white bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            <h3 class="text-4xl font-black mb-2 tracking-tighter">En Promotion</h3>
            <p class="mb-6 text-lg opacity-90 max-w-sm italic">Commandez dès maintenant et profitez de remises exclusives sur tout le catalogue informatique.</p>
            <UButton size="xl" class="w-fit bg-white text-[#274a82] font-black rounded-none hover:bg-[#e60012] hover:text-white px-10 transition-all">Commander maintenant</UButton>
          </div>
        </div>
        <div class="relative h-[420px] bg-slate-900 overflow-hidden group shadow-lg text-right items-end">
          <img src="/images/publicity5.jpg" class="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-all duration-1000" />
          <div class="relative h-full flex flex-col justify-end items-end p-10 text-white bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            <h3 class="text-4xl font-black  mb-2 tracking-tighter">GADGET ET ACCESSOIRES</h3>
            <p class="mb-6 text-lg opacity-90 max-w-sm italic">Expertise technique certifiée pour la longévité de votre parc informatique.</p>
            <UButton size="xl" class="w-fit bg-[#e60012] text-white font-black rounded-none hover:bg-white hover:text-[#e60012] px-10 transition-all">Nous contacter</UButton>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-6">
        <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          Mobilité : Smartphones & Tablettes
        </h2>
        <NuxtLink to="#" class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group">
          Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        <div v-for="p in accessories" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl">
          <div class="relative h-64 w-full overflow-hidden p-2 flex items-center justify-center">
            <div class="absolute right-[-50px] group-hover:right-3 top-3 flex flex-col gap-2 z-30 transition-all duration-300">
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors">
                <UIcon name="i-heroicons-heart" class="w-5 h-5" />
              </button>
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors">
                <UIcon name="i-heroicons-eye" class="w-5 h-5" />
              </button>
            </div>
            <img :src="p.image" class="w-full h-full object-contain p-1 transition-all duration-500 group-hover:scale-110 group-hover:opacity-0" />
            <img :src="p.imageHover || p.image" class="absolute inset-0 w-full h-full object-contain p-1 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105" />
            <div class="absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full p-0 transition-all duration-300 z-20">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3 ">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-[13px] text-gray-600 font-medium mb-2 line-clamp-2 h-10 leading-snug uppercase">{{ p.name }}</h3>
            <div class="mt-auto">
              <div class="text-[20px] font-black text-gray-900 mb-0.5">{{ p.price }} FCFA</div>
              <div class="flex items-center justify-between">
                <span class="text-[13px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
                <div class="bg-[#e60012] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


    <section class="max-w-7xl mx-auto px-4 my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-6">
        <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          Le Stock des Ecrans Incurve 
        </h2>
        <NuxtLink to="#" class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group">
          Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        <div v-for="p in accessories" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl">
          <div class="relative h-64 w-full overflow-hidden p-2 flex items-center justify-center">
            <div class="absolute right-[-50px] group-hover:right-3 top-3 flex flex-col gap-2 z-30 transition-all duration-300">
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors">
                <UIcon name="i-heroicons-heart" class="w-5 h-5" />
              </button>
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors">
                <UIcon name="i-heroicons-eye" class="w-5 h-5" />
              </button>
            </div>
            <img :src="p.image" class="w-full h-full object-contain p-1 transition-all duration-500 group-hover:scale-110 group-hover:opacity-0" />
            <img :src="p.imageHover || p.image" class="absolute inset-0 w-full h-full object-contain p-1 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105" />
            <div class="absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full p-0 transition-all duration-300 z-20">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3 ">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-[13px] text-gray-600 font-medium mb-2 line-clamp-2 h-10 leading-snug uppercase">{{ p.name }}</h3>
            <div class="mt-auto">
              <div class="text-[20px] font-black text-gray-900 mb-0.5">{{ p.price }} FCFA</div>
              <div class="flex items-center justify-between">
                <span class="text-[13px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
                <div class="bg-[#e60012] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 my-8">
    <div class="flex items-center justify-between border-b border-gray-200 mb-6">
      <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight ">
        Nos Meilleures Marques
      </h2>
      <NuxtLink to="#" class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group">
        Voir tout <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
      </NuxtLink>
    </div>

    <UCarousel
      v-slot="{ item }"
      :items="brands"
      :autoplay="{ delay: 2000 }"
      :ui="{ 
        item: 'basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/5 px-2',
        container: 'py-4' 
      }"
      indicators
      arrows
      class="rounded-lg"
    >
      <div class="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 text-center">
        <div class="h-24 flex items-center justify-center mb-4">
          <img 
            :src="item.img" 
            :alt="item.name" 
            class="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
            draggable="false"
          />
        </div>
        
        <span class="text-sm font-bold text-gray-600 group-hover:text-[#e60012] transition-colors">
          {{ item.name }}
        </span>
      </div>
    </UCarousel>
  </section>

  <section class="max-w-7xl mx-auto px-4 my-8">
      <div class="flex items-center justify-between border-b border-gray-200 mb-6">
        <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          Vous n’avez pas trouvé ce que vous cherchez ? 
        </h2>
        <NuxtLink to="#" class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group">
          Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        <div v-for="p in accessories" :key="p.id" class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl">
          <div class="relative h-64 w-full overflow-hidden p-2 flex items-center justify-center">
            <div class="absolute right-[-50px] group-hover:right-3 top-3 flex flex-col gap-2 z-30 transition-all duration-300">
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors">
                <UIcon name="i-heroicons-heart" class="w-5 h-5" />
              </button>
              <button class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#003366] hover:text-white transition-colors">
                <UIcon name="i-heroicons-eye" class="w-5 h-5" />
              </button>
            </div>
            <img :src="p.image" class="w-full h-full object-contain p-1 transition-all duration-500 group-hover:scale-110 group-hover:opacity-0" />
            <img :src="p.imageHover || p.image" class="absolute inset-0 w-full h-full object-contain p-1 transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105" />
            <div class="absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full p-0 transition-all duration-300 z-20">
              <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3 ">Ajouter au panier</UButton>
            </div>
          </div>
          <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-[13px] text-gray-600 font-medium mb-2 line-clamp-2 h-10 leading-snug uppercase">{{ p.name }}</h3>
            <div class="mt-auto">
              <div class="text-[20px] font-black text-gray-900 mb-0.5">{{ p.price }} FCFA</div>
              <div class="flex items-center justify-between">
                <span class="text-[13px] text-gray-400 line-through">{{ p.oldPrice }} FCFA</span>
                <div class="bg-[#e60012] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 ">
    
    <div class="border-b border-gray-200 mb-6">
      <h2 class="text-lg font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] inline-block mb-[-1px] tracking-tight">
        Bienvenue sur BRC Market, Meilleur Site de vente en ligne au Cameroun!
      </h2>
    </div>

    <div class="space-y-4">
      <p class="text-sm text-gray-700 leading-relaxed font-medium">
        La meilleure boutique en ligne ou on trouve de la Technologie. <br>
       Bienvenue chez <span class="font-bold text-[#274a82]">BRC Market</span>, votre destination privilégiée pour l'informatique de pointe et les solutions technologiques professionnelles. 
          Nous nous spécialisons dans la fourniture de matériel haut de gamme, allant des stations de travail ultra-performantes aux accessoires essentiels pour votre productivité quotidienne.
      </p>

      <div v-if="isExpanded" class="text-sm text-gray-700 leading-relaxed space-y-4 animate-fade-in">
        <p>
         Parce que votre travail mérite le meilleur, nous sélectionnons rigoureusement des équipements issus des plus grands constructeurs mondiaux tels que 
          <span class="font-bold text-[#274a82]">HP, DELL, APPLE, LENOVO, MICROSOFT, SAMSUNG, CANON, EPSON, LOGITECH, ASUS, ACER, TP-LINK & D-LINK, CISCO et autres </span>. 
          Que vous soyez un créateur de contenu, un ingénieur ou un passionné de tech, notre mission est de rendre l'excellence accessible partout au Cameroun.
        </p>
        <p>
         
          Au-delà de la vente, <span class="font-bold text-[#274a82]">BRC Market</span> s'engage à vous accompagner avec un support technique réactif et des conseils personnalisés pour optimiser votre environnement numérique.
      
        </p>
      </div>

      <UButton
        variant="ghost"
        color="gray"
        class="p-0 hover:text-[#274a82] text-gray-900 font-bold flex items-center gap-1 group"
        @click="isExpanded = !isExpanded"
        
      >
        {{ isExpanded ? 'Voir Moins' : 'Voir Plus' }}
        <UIcon 
          name="i-heroicons-chevron-down" 
          class="transition-transform duration-300"
          :class="[isExpanded ? 'rotate-180' : '']"
        />
      </UButton>
    </div>
  </section>
  
  </div>

  <section class=" py-8 border-t border-gray-200">
      <UContainer>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="benefit in benefits" :key="benefit.title" class="flex items-center gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-full bg border-2 border-[#e60012] flex items-center justify-center">
              <UIcon :name="benefit.icon" class="w-6 h-6 text-[#e60012]" />
            </div>
            <div>
              <h4 class="font-bold text-sm leading-tight">{{ benefit.title }}</h4>
              <p class="text-xs text-gray-600">{{ benefit.subtitle }}</p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    

    <section class="bg-[#e60012] py-8">
      <UContainer>
        <div class="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div class="text-white space-y-2 text-center lg:text-left">
            <h2 class="text-2xl md:text-3xl font-black tracking-tight">
              Connectez-vous chez BRC Market
            </h2>
            <p class="text-gray-300 text-sm md:text-base font-medium">
              Connectez-vous, faites des achats et recevez des reductions.
            </p>
          </div>
          <div class="flex flex-col gap-3 w-full sm:w-auto">
            
            <NuxtLink to="/login">
              <UButton
                block
                size="xl"
                icon="i-heroicons-arrow-right-on-rectangle"
                label="Se connecter maintenant"
                class="bg-white hover:bg-gray-100 border-2 border-[#274a82] text-[#274a82]   font-bold px-10 py-4 rounded-sm "
              />
            </NuxtLink>

            <NuxtLink to="/register">
              <UButton
                block
                size="xl"
                icon="i-heroicons-user-plus"
                label="Créer un compte"
                class="bg-[#274a82]  hover:bg-[#274a75] border-2 border-white text-white font-bold px-10 py-4 rounded-sm "
              />
            </NuxtLink>
            
          </div>
        </div>
      </UContainer>
    </section>

    

</template>

<style scoped>
:deep(.relative.overflow-hidden) {
  height: 100%;
}

/* Cache la scrollbar pour le bandeau catégories mobile tout en permettant le scroll */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>