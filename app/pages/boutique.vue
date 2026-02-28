<script setup lang="ts">
import { ref, computed, watch } from 'vue'

useHead({
  title: 'BRC Market',
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Boutique` : 'BRC Market';
  },
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
})

/* ================= BREADCRUMB ================= */
const breadcrumbItems = [
  { label: 'Accueil', to: '/', icon: 'i-heroicons-home' },
  { label: 'Boutique', to: '/boutique', current: true }
]

/* ================= AFFICHAGE ================= */
const viewMode = ref<'grid' | 'grid-small' | 'list' | 'list-compact'>('grid')

/* ================= FILTRES MOBILE DRAWER ================= */
const isMobileFilterOpen = ref(false)

/* ================= FILTRES — radio (un seul choix par groupe) ================= */
const expandedGroups = ref<Record<string, boolean>>({})
const toggleExpand = (key: string) => {
  expandedGroups.value[key] = !expandedGroups.value[key]
}

const priceRange = ref([0, 11800000])

// Sélection en cours (brouillon avant "Appliquer")
const draftFilters = ref<Record<string, string | null>>({
  Marques: null,
  Stockage: null,
  Ram: null,
  Processeur: null,
  Generation: null,
  Etat: null,
  Ecran: null,
})

// Filtres appliqués
const appliedFilters = ref<Record<string, string | null>>({ ...draftFilters.value })

const filterGroups: Record<string, Record<string, number>> = {
  Marques: { 'HP': 48, 'Dell': 15, 'Lenovo': 22, 'Asus': 10, 'Apple': 5, 'Acer': 8, 'Toshiba': 3, 'Microsoft': 4 },
  Stockage: { '128 Go SSD': 5, '256 Go SSD': 12, '512 Go SSD': 18, '1 To HDD': 6, '2 To SSD': 2, '600 Go SAS': 4 },
  Ram: { '4 Go': 10, '8 Go': 25, '16 Go': 15, '32 Go': 5, '64 Go': 2 },
  Processeur: { 'Core i3': 8, 'Core i5': 20, 'Core i7': 15, 'Core i9': 3, 'Xeon': 5, 'Ryzen 5': 7, 'Ryzen 7': 4 },
  Generation: { '5th': 8, '6th': 20, '7th': 15, '8th': 3, '9th': 5, '10th': 7, '11th': 4 },
  Etat: { 'Neuf': 40, 'Remis à neuf': 15, 'Occasion': 10 },
  Ecran: { '13 pouces': 5, '14 pouces': 12, '15.6 pouces': 20, '17 pouces': 4 }
}

const activeFilterCount = computed(() =>
  Object.values(appliedFilters.value).filter(Boolean).length
)

const applyFilter = () => {
  appliedFilters.value = { ...draftFilters.value }
  currentPage.value = 1
  isMobileFilterOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetFilters = () => {
  Object.keys(draftFilters.value).forEach(k => draftFilters.value[k] = null)
  appliedFilters.value = { ...draftFilters.value }
  priceRange.value = [0, 11800000]
  currentPage.value = 1
}

const sortBy = ref('Le plus récent')

/* ================= PRODUITS & PAGINATION ================= */
const products = ref(
  Array.from({ length: 60 }, (_, i) => ({
    id: i + 1,
    category: i % 2 === 0 ? 'Ordinateurs' : 'Composants',
    name: i % 2 === 0 ? `Laptop BRC ProBook X${i + 1} Intel i7` : `Disque Dur SSD Performance ${i + 1}`,
    brand: ['HP', 'Dell', 'Lenovo', 'Asus'][i % 4],
    price: 450000 + (i * 500),
    oldPrice: 550000,
    discount: '-18%',
    popularity: Math.floor(Math.random() * 100),
    image: '/images/publicity0.jpg',
    imageHover: '/images/publicity2.jpg'
  }))
)

const currentPage = ref(1)
const itemsPerPage = 24

// Reset page quand le tri change
watch(sortBy, () => { currentPage.value = 1 })

const filteredProducts = computed(() => {
  const filtered = products.value.filter(p => {
    if (appliedFilters.value.Marques && p.brand !== appliedFilters.value.Marques) return false
    if (p.price < priceRange.value[0] || p.price > priceRange.value[1]) return false
    return true
  })
  const sorted = [...filtered]
  switch (sortBy.value) {
    case 'Par tarif croissant':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'Par tarif decroissant':
      sorted.sort((a, b) => b.price - a.price)
      break
    case 'Par popularité':
      sorted.sort((a, b) => b.popularity - a.popularity)
      break
    default: // Le plus récent
      sorted.sort((a, b) => b.id - a.id)
      break
  }
  return sorted
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
})

const recentProducts = computed(() => products.value.slice(0, 5))

const setPage = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const addToCart = (id: number) => console.log('Ajout au panier:', id)
const addToWishlist = (id: number) => console.log('Ajout favoris:', id)

const promoFlyers = [
  { image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=500' },
  { image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=500' },
  { image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=500' }
]

const expandedServices = ref<Record<string, boolean>>({
  maintenance: false, imprimantes: false, integration: false, securite: false, support: false
})
const toggleService = (key: string) => {
  expandedServices.value[key] = !expandedServices.value[key]
}
</script>

<template>
  <UContainer class="py-6 bg-white">

    <!-- BREADCRUMB -->
    <nav class="flex items-center gap-2 text-[14px] mb-5 text-gray-500 font-medium border-b border-gray-50 pb-2">
      <template v-for="(item, index) in breadcrumbItems" :key="index">
        <NuxtLink :to="item.to" class="flex items-center gap-1 transition-colors hover:text-[#e60012]"
          :class="item.current ? 'text-[#274a82] font-bold pointer-events-none' : ''">
          <UIcon v-if="item.icon" :name="item.icon" class="w-4 h-4" />
          {{ item.label }}
        </NuxtLink>
        <UIcon v-if="index < breadcrumbItems.length - 1" name="i-heroicons-chevron-right" class="w-3 h-3 text-gray-300" />
      </template>
    </nav>

    <!-- BOUTON FILTRE MOBILE -->
    <div class="flex lg:hidden items-center justify-between mb-4 gap-3">
      <button
        @click="isMobileFilterOpen = true"
        class="flex items-center gap-2 px-4 py-2.5 bg-[#274a82] text-white rounded-xl text-sm font-bold shadow-sm"
      >
        <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4" />
        Filtres
        <span v-if="activeFilterCount > 0" class="bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
          {{ activeFilterCount }}
        </span>
      </button>
      <USelectMenu
        v-model="sortBy"
        :items="['Le plus récent','Par popularité','Par tarif croissant', 'Par tarif decroissant']"
        class="flex-1 min-h-10"
      />
    </div>

    <!-- ===== DRAWER FILTRE MOBILE ===== -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="isMobileFilterOpen"
          class="fixed inset-0 bg-black/50 z-40 lg:hidden"
          @click="isMobileFilterOpen = false"
        />
      </Transition>
      <Transition name="slide-up">
        <div
          v-if="isMobileFilterOpen"
          class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl lg:hidden flex flex-col"
          style="max-height: 90dvh;"
        >
          <!-- Header drawer -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-adjustments-horizontal" class="w-5 h-5 text-[#274a82]" />
              <span class="font-bold text-gray-900">Filtres</span>
              <span v-if="activeFilterCount > 0" class="text-xs text-[#274a82] font-bold">({{ activeFilterCount }} actif{{ activeFilterCount > 1 ? 's' : '' }})</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="resetFilters" class="text-xs text-[#e60012] font-bold hover:underline">Tout effacer</button>
              <button
                @click="isMobileFilterOpen = false"
                class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Contenu scrollable -->
          <div class="overflow-y-auto flex-1 px-4 py-3 space-y-1">

            <!-- Groupes de filtres radio -->
            <div v-for="(options, key) in filterGroups" :key="key" class="border-b border-gray-50 pb-3">
              <button
                @click="toggleExpand(key as string)"
                class="w-full flex items-center justify-between py-2"
              >
                <span class="text-sm font-bold text-gray-800">{{ key }}</span>
                <div class="flex items-center gap-2">
                  <span v-if="draftFilters[key as string]" class="text-[10px] bg-[#274a82]/10 text-[#274a82] font-bold px-2 py-0.5 rounded-full">
                    {{ draftFilters[key as string] }}
                  </span>
                  <UIcon
                    name="i-heroicons-chevron-down"
                    class="w-4 h-4 text-gray-400 transition-transform"
                    :class="{ 'rotate-180': expandedGroups[key as string] }"
                  />
                </div>
              </button>

              <div v-if="expandedGroups[key as string]" class="grid grid-cols-2 gap-1.5 pt-1">
                <label
                  v-for="(count, opt) in options"
                  :key="opt"
                  class="flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-xs font-medium"
                  :class="draftFilters[key as string] === opt
                    ? 'border-[#274a82] bg-[#274a82]/5 text-[#274a82]'
                    : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300'"
                >
                  <input
                    type="radio"
                    :name="`filter-${key}`"
                    :value="opt"
                    v-model="draftFilters[key as string]"
                    class="hidden"
                  />
                  <span class="flex-1">{{ opt }}</span>
                  <span class="text-[10px] text-gray-400">({{ count }})</span>
                  <UIcon v-if="draftFilters[key as string] === opt" name="i-heroicons-check" class="w-3.5 h-3.5 text-[#274a82] flex-shrink-0" />
                </label>
              </div>
            </div>

            <!-- Prix -->
            <div class="pb-3">
              <p class="text-sm font-bold text-gray-800 py-2">Prix</p>
              <USlider v-model="priceRange" :min="0" :max="20000000" :step="10000" size="md" />
              <div class="mt-3 text-xs text-gray-500 font-medium text-center">
                {{ priceRange[0].toLocaleString() }} CFA — {{ priceRange[1].toLocaleString() }} CFA
              </div>
            </div>

          </div>

          <!-- Bouton Appliquer sticky -->
          <div class="flex-shrink-0 px-4 py-4 border-t border-gray-100 bg-white">
            <UButton @click="applyFilter" color="error" block size="lg" class="rounded-xl font-bold">
              Appliquer les filtres
              <span v-if="activeFilterCount > 0"> ({{ activeFilterCount }})</span>
            </UButton>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== LAYOUT PRINCIPAL ===== -->
    <div class="grid grid-cols-12 gap-8">

      <!-- SIDEBAR DESKTOP -->
      <aside class="hidden lg:block col-span-3 space-y-8 flex-shrink-0">
        <div>
          <h2 class="text-2xl text-gray-800 my-1">Filtres</h2>
          <hr class="border-[#e60012]"/>
        </div>

        <!-- Groupes de filtres radio desktop — pills en flex-wrap -->
        <div v-for="(options, key) in filterGroups" :key="key" class="border-b border-gray-100 pb-4">
          <h3 class="text-[14px] font-extrabold text-gray-500 tracking-widest mb-2.5">{{ key }}</h3>
          <div class="flex flex-wrap gap-1.5">
            <template v-for="(count, opt, index) in options" :key="opt">
              <label v-if="index < 6 || expandedGroups[key as string]" class="cursor-pointer">
                <input type="radio" :name="`desktop-filter-${key}`" :value="opt" v-model="draftFilters[key as string]" class="hidden" />
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all select-none"
                  :class="draftFilters[key as string] === opt
                    ? 'bg-[#274a82] border-[#274a82] text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#274a82] hover:text-[#274a82]'"
                >
                  {{ opt }} <span class="opacity-60 text-[10px]">({{ count }})</span>
                </span>
              </label>
            </template>
          </div>
          <button
            v-if="Object.keys(options).length > 6"
            @click="toggleExpand(key as string)"
            class="text-[11px] text-[#274a82] font-bold mt-2 hover:text-[#e60012] transition-colors"
          >
            {{ expandedGroups[key as string] ? '− Voir moins' : '+ Voir plus' }}
          </button>
        </div>

        <!-- Prix desktop -->
        <div class="pb-6 border-b border-gray-100">
          <h3 class="text-sm font-bold text-gray-900 mb-6 tracking-wider">Prix</h3>
          <div class="px-2">
            <USlider v-model="priceRange" :min="0" :max="20000000" :step="10000" size="md" />
            <div class="mt-4 text-[14px] text-gray-400 font-medium">
              Prix : {{ priceRange[0].toLocaleString() }} CFA — {{ priceRange[1].toLocaleString() }} CFA
            </div>
          </div>
        </div>

        <!-- Bouton Appliquer desktop -->
        <div class="flex gap-2">
          <UButton @click="applyFilter" color="error" class="flex-1 font-bold">Appliquer</UButton>
          <UButton @click="resetFilters" variant="outline" color="gray" class="font-bold">Reset</UButton>
        </div>

        <!-- Promos -->
        <div>
          <h3 class="text-sm font-bold text-gray-900 tracking-wider border-b border-[#e60012] mb-4">Nos Promos</h3>
          <UCarousel v-slot="{ item }" :items="promoFlyers" arrows dots :autoplay="{ delay: 2000 }"
            class="relative h-full rounded-sm overflow-hidden shadow-sm"
            :prev="{ variant: 'solid' }" :next="{ variant: 'solid' }">
            <div class="relative overflow-hidden aspect-[4/5]">
              <img :src="item.image" class="w-full h-full object-cover" draggable="false">
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </UCarousel>
        </div>

        <!-- Meilleur Produits -->
        <div>
          <h3 class="text-sm font-bold text-gray-900 tracking-wider border-b border-[#e60012] mb-4">Nos Meilleur Produits</h3>
          <UCarousel v-slot="{ item }" :items="promoFlyers" arrows dots :autoplay="{ delay: 3000 }"
            class="relative h-full rounded-sm overflow-hidden shadow-sm"
            :prev="{ variant: 'solid' }" :next="{ variant: 'solid' }">
            <div class="relative overflow-hidden aspect-[4/5]">
              <img :src="item.image" class="w-full h-full object-cover" draggable="false">
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </UCarousel>
        </div>

        <!-- Nos Expertises -->
        <div>
          <h3 class="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-3">Nos Expertises</h3>
          <div class="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
            <div v-for="service in [
              { key: 'maintenance', icon: 'i-heroicons-wrench-screwdriver', label: 'Maintenance & Réparation', color: 'text-blue-600', links: [{label:'Laptops',to:'/services/maintenance/laptops'},{label:'Desktops',to:'/services/maintenance/desktops'},{label:'Serveurs',to:'/services/maintenance/serveurs'}] },
              { key: 'imprimantes', icon: 'i-heroicons-printer', label: 'Imprimantes & Accessoires', color: 'text-purple-600', links: [{label:'Toners & Encres',to:'/services/accessoires/toners'},{label:'Câblage & Réseau',to:'/services/accessoires/reseau'},{label:'Périphériques',to:'/services/accessoires/peripheriques'}] },
              { key: 'integration', icon: 'i-heroicons-server-stack', label: 'Intégration IT', color: 'text-green-600', links: [{label:'Mise en réseau',to:'/services/integration/reseau'},{label:'Déploiement de parcs',to:'/services/integration/parcs'},{label:'Cloud & Serveurs',to:'/services/integration/cloud'}] },
              { key: 'securite', icon: 'i-heroicons-shield-check', label: 'Sécurité Informatique', color: 'text-red-600', links: [{label:'Vidéosurveillance',to:'/services/securite/cameras'},{label:'Solutions Antivirus',to:'/services/securite/antivirus'},{label:'Contrôle d\'accès',to:'/services/securite/controle-acces'}] },
              { key: 'support', icon: 'i-heroicons-chat-bubble-left-right', label: 'Support Technique', color: 'text-orange-500', links: [{label:'Assistance Hotline',to:'/contact'},{label:'Maintenance à distance',to:'/contact'}] },
            ]" :key="service.key">
              <button @click="toggleService(service.key)" class="w-full flex items-center justify-between px-3 py-2.5 bg-white hover:bg-gray-50 transition-colors group">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <UIcon :name="service.icon" class="w-3.5 h-3.5" :class="service.color" />
                  </div>
                  <span class="text-[12px] font-bold text-gray-800 text-left leading-tight">{{ service.label }}</span>
                </div>
                <UIcon
                  name="i-heroicons-chevron-right"
                  class="w-3.5 h-3.5 text-gray-300 transition-transform duration-200 flex-shrink-0"
                  :class="expandedServices[service.key] ? 'rotate-90' : ''"
                />
              </button>
              <div
                v-show="expandedServices[service.key]"
                class="bg-gray-50/50 border-t border-gray-50 px-10 py-2 space-y-2"
              >
                <NuxtLink
                  v-for="link in service.links"
                  :key="link.label"
                  :to="link.to"
                  class="block text-[12px] text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {{ link.label }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- MAIN -->
      <main class="col-span-12 lg:col-span-9">
        <h1 class="text-2xl font-medium text-gray-700 pb-2">Boutique</h1>

        <!-- Barre tri/affichage desktop -->
        <div class="flex flex-wrap items-center justify-between mb-6 bg-[#f8f8f8] p-2 rounded-xl border border-gray-200 gap-4">
          <div class="flex items-center gap-3 ml-2">
            <button @click="viewMode = 'grid'" :class="viewMode === 'grid' ? 'text-black' : 'text-gray-300'"><UIcon name="i-heroicons-squares-2x2-solid" class="w-6 h-6" /></button>
            <button @click="viewMode = 'grid-small'" :class="viewMode === 'grid-small' ? 'text-black' : 'text-gray-300'"><UIcon name="i-heroicons-squares-plus-solid" class="w-6 h-6" /></button>
            <button @click="viewMode = 'list'" :class="viewMode === 'list' ? 'text-black' : 'text-gray-300'"><UIcon name="i-heroicons-bars-3-bottom-left-solid" class="w-6 h-6" /></button>
            <button @click="viewMode = 'list-compact'" :class="viewMode === 'list-compact' ? 'text-black' : 'text-gray-300'"><UIcon name="i-heroicons-list-bullet-solid" class="w-6 h-6" /></button>
          </div>
          <div class="flex items-center gap-4">
            <span class="hidden sm:block text-[13px] text-gray-500 font-medium">
              Affichage de <span class="text-gray-900 font-bold">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span>–<span class="text-gray-900 font-bold">{{ Math.min(currentPage * itemsPerPage, filteredProducts.length) }}</span> sur <span class="text-gray-900 font-bold">{{ filteredProducts.length }}</span> résultats
            </span>
            <div class="hidden lg:block">
              <USelectMenu v-model="sortBy" :items="['Le plus récent','Par popularité','Par tarif croissant', 'Par tarif decroissant']" class="min-w-48 " />
            </div>
          </div>
        </div>

        <!-- Grille produits -->
        <div :class="{
          'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4': viewMode === 'grid',
          'grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2': viewMode === 'grid-small',
          'flex flex-col gap-4': viewMode === 'list',
          'flex flex-col gap-1': viewMode === 'list-compact'
        }">
          <NuxtLink
            v-for="p in paginatedProducts"
            :key="p.id"
            :to="`/product/${p.id}`"
            :class="viewMode.startsWith('grid')
              ? 'group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl'
              : 'group relative rounded-sm bg-white border border-gray-100 flex flex-row items-center gap-4 p-3 hover:shadow-xl'"
          >
            <div :class="{
              'relative h-56 w-full': viewMode === 'grid',
              'relative h-40 w-full': viewMode === 'grid-small',
              'relative h-40 w-40': viewMode === 'list',
              'relative h-20 w-20': viewMode === 'list-compact'
            }" class="overflow-hidden flex items-center justify-center bg-[#fcfcfc] flex-shrink-0">
              <div class="absolute bottom-2 left-2 bg-[#e60012] text-white text-[9px] font-black px-2 py-0.5 rounded-sm z-10">{{ p.discount }}</div>
              <div v-if="viewMode.startsWith('grid')" class="absolute right-[-50px] group-hover:right-3 top-3 flex flex-col gap-2 z-30 transition-all duration-300">
                <button @click.prevent.stop="addToWishlist(p.id)" class="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white"><UIcon name="i-heroicons-heart" class="w-4 h-4" /></button>
                <button @click.prevent.stop="" class="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#274a82] hover:text-white"><UIcon name="i-heroicons-eye" class="w-4 h-4" /></button>
              </div>
              <img :src="p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-0" />
              <img :src="p.imageHover || p.image" class="absolute inset-0 w-full p-1 h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-110" />
              <div v-if="!viewMode.startsWith('list')" class="absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full p-0 transition-all duration-300 z-20">
                <UButton icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-3">Ajouter au panier</UButton>
              </div>
            </div>
            <div class="p-3 flex flex-col flex-1" :class="viewMode === 'list-compact' ? 'p-1' : ''">
              <span class="text-[12px] text-gray-400 font-bold tracking-widest">{{ p.category }}</span>
              <h3 class="text-[#274a82] font-bold mb-2 line-clamp-2 leading-snug group-hover:underline"
                :class="viewMode === 'list-compact' ? 'text-[12px] h-4 mb-0' : 'text-[15px] h-9'">{{ p.name }}</h3>
              <div class="mt-auto flex items-end justify-between">
                <div>
                  <div v-if="viewMode !== 'list-compact'" class="text-[12px] text-[#e60012] line-through mb-[-4px]">{{ p.oldPrice.toLocaleString() }} FCFA</div>
                  <div :class="viewMode === 'list-compact' ? 'text-xs' : 'text-xl'" class="font-black text-gray-900 whitespace-nowrap">{{ p.price.toLocaleString() }} <span class="text-[10px]">FCFA</span></div>
                </div>
                <div v-if="viewMode.startsWith('list')" class="flex items-center gap-2">
                  <UButton @click.prevent.stop="addToWishlist(p.id)" variant="ghost" color="gray" icon="i-heroicons-heart" size="xs" class="hover:text-[#e60012]" />
                  <UButton variant="ghost" color="gray" icon="i-heroicons-eye" size="xs" class="hover:text-[#274a82]" />
                  <UButton @click.prevent.stop="addToCart(p.id)" color="primary" class="bg-[#274a82]" icon="i-heroicons-shopping-cart" size="xs" />
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center pt-6 mb-12">
          <UPagination
            v-model:page="currentPage"
            :items-per-page="itemsPerPage"
            :total="filteredProducts.length"
            show-edges
            @update:page="setPage"
          />
        </div>

        <!-- Produits récents -->
        <section>
          <div class="flex items-center justify-between border-b border-gray-200 mb-6">
            <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">Produits Récents</h2>
            <NuxtLink to="/nouveautes" class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group">
              Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
            </NuxtLink>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            <NuxtLink v-for="p in recentProducts" :key="'recent-' + p.id" :to="`/produit/${p.id}`"
              class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl">
              <div class="relative h-64 w-full overflow-hidden p-2 flex items-center justify-center">
                <div class="absolute right-[-50px] group-hover:right-3 top-3 flex flex-col gap-2 z-30 transition-all duration-300">
                  <button @click.prevent.stop="addToWishlist(p.id)" class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors"><UIcon name="i-heroicons-heart" class="w-5 h-5" /></button>
                  <button @click.prevent.stop="" class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#274a82] hover:text-white transition-colors"><UIcon name="i-heroicons-eye" class="w-5 h-5" /></button>
                </div>
                <div class="absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full transition-all duration-300 z-20">
                  <UButton @click.prevent.stop="addToCart(p.id)" icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-2.5">Ajouter au Panier</UButton>
                </div>
              </div>
              <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
                <h3 class="text-[13px] text-gray-600 font-medium mb-2 line-clamp-2 h-10 leading-snug">{{ p.name }}</h3>
                <div class="mt-auto">
                  <div class="text-[18px] font-black text-gray-900 mb-0.5">{{ p.price.toLocaleString() }} FCFA</div>
                  <div class="flex items-center justify-between">
                    <span class="text-[12px] text-gray-400 line-through">{{ p.oldPrice.toLocaleString() }} FCFA</span>
                    <div class="bg-[#e60012] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">{{ p.discount }}</div>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- ===== MOBILE ONLY : Nos Promos + Nos Meilleur Produits + Nos Expertises ===== -->
        <div class="lg:hidden mt-10 space-y-8">

          <!-- Nos Promos -->
          <div>
            <h3 class="text-base font-bold text-gray-900 border-b-2 border-[#e60012] pb-1 mb-4 inline-block">Nos Promos</h3>
            <UCarousel v-slot="{ item }" :items="promoFlyers" arrows dots :autoplay="{ delay: 2000 }"
              class="relative rounded-sm overflow-hidden shadow-sm"
              :prev="{ variant: 'solid' }" :next="{ variant: 'solid' }">
              <div class="relative overflow-hidden aspect-[16/7]">
                <img :src="item.image" class="w-full h-full object-cover" draggable="false">
                <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
              </div>
            </UCarousel>
          </div>

          <!-- Nos Meilleur Produits -->
          <div>
            <h3 class="text-base font-bold text-gray-900 border-b-2 border-[#e60012] pb-1 mb-4 inline-block">Nos Meilleur Produits</h3>
            <UCarousel v-slot="{ item }" :items="promoFlyers" arrows dots :autoplay="{ delay: 3000 }"
              class="relative rounded-sm overflow-hidden shadow-sm"
              :prev="{ variant: 'solid' }" :next="{ variant: 'solid' }">
              <div class="relative overflow-hidden aspect-[16/7]">
                <img :src="item.image" class="w-full h-full object-cover" draggable="false">
                <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
              </div>
            </UCarousel>
          </div>

          <!-- Nos Expertises -->
          <div>
            <h3 class="text-base font-bold text-gray-900 border-b-2 border-[#e60012] pb-1 mb-4 inline-block">Nos Expertises</h3>
            <div class="space-y-2">
              <div v-for="service in [
                { key: 'maintenance', icon: 'i-heroicons-wrench-screwdriver', label: 'Maintenance & Réparation', links: [{label:'Laptops',to:'/services/maintenance/laptops'},{label:'Desktops',to:'/services/maintenance/desktops'},{label:'Serveurs',to:'/services/maintenance/serveurs'}] },
                { key: 'integration', icon: 'i-heroicons-server-stack', label: 'Intégration & Déploiement', links: [{label:'Mise en réseau',to:'/services/integration/reseau'},{label:'Déploiement de parcs',to:'/services/integration/parcs'},{label:'Cloud & Serveurs',to:'/services/integration/cloud'}] },
                { key: 'securite', icon: 'i-heroicons-shield-check', label: 'Sécurité Informatique', links: [{label:'Vidéosurveillance',to:'/services/securite/cameras'},{label:'Solutions Antivirus',to:'/services/securite/antivirus'}] },
                { key: 'support', icon: 'i-heroicons-chat-bubble-left-right', label: 'Support Technique', links: [{label:'Assistance Hotline',to:'/contact'},{label:'Maintenance à distance',to:'/contact'}] },
              ]" :key="service.key" class="border border-gray-100 rounded-sm bg-white overflow-hidden">
                <button @click="toggleService(service.key)" class="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                  <div class="flex items-center gap-3">
                    <UIcon :name="service.icon" class="w-4 h-4 text-[#274a82]" />
                    <span class="text-[13px] font-bold text-gray-800 tracking-tight text-left">{{ service.label }}</span>
                  </div>
                  <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 transition-transform duration-300" :class="expandedServices[service.key] ? 'rotate-180' : ''" />
                </button>
                <div v-show="expandedServices[service.key]" class="bg-gray-50/50 border-t border-gray-50 px-10 py-2 space-y-2">
                  <NuxtLink v-for="link in service.links" :key="link.label" :to="link.to"
                    class="block text-[12px] text-gray-600 hover:text-gray-900 transition-colors">
                    {{ link.label }}
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  </UContainer>
</template>

<style scoped>
/* Overlay fade */
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.25s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

/* Drawer slide up depuis le bas */
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1); }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
</style>