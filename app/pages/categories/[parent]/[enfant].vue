<script setup lang="ts">
import { ref, computed } from 'vue'

useHead({
  title: 'BRC Market',
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Boutique` : 'BRC Market';
  },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

/* ================= BREADCRUMB DATA ================= */
const breadcrumbItems = [
  { label: 'Accueil', to: '/', icon: 'i-heroicons-home' },
  { label: 'Ordinateur', to: '/boutique' },
  { label: 'Laptops', to: '/boutique' , current: true}
]

/* ================= ÉTAT DE L'AFFICHAGE ================= */
const viewMode = ref<'grid' | 'grid-small' | 'list' | 'list-compact'>('grid')

/* ================= ÉTATS DES FILTRES & COLLAPSE ================= */
const expandedGroups = ref<Record<string, boolean>>({})
const toggleExpand = (key: string) => {
  expandedGroups.value[key] = !expandedGroups.value[key]
}

// Nouvelle Ref pour le prix
const priceRange = ref([0, 11800000])

const selectedFilters = ref({
  marque: null as string | null,
  stockage: null as string | null,
  ram: null as string | null,
  processeur: null as string | null,
  generation: null as string | null,
  etat: null as string | null,
  ecran: null as string | null
})

const filterGroups = {
  Marques: { 'HP': 48, 'Dell': 15, 'Lenovo': 22, 'Asus': 10, 'Apple': 5, 'Acer': 8, 'Toshiba': 3, 'Microsoft': 4 },
  Stockage: { '128 Go SSD': 5, '256 Go SSD': 12, '512 Go SSD': 18, '1 To HDD': 6, '2 To SSD': 2, '600 Go SAS': 4 },
  Ram: { '4 Go': 10, '8 Go': 25, '16 Go': 15, '32 Go': 5, '64 Go': 2 },
  Processeur: { 'Core i3': 8, 'Core i5': 20, 'Core i7': 15, 'Core i9': 3, 'Xeon': 5, 'Ryzen 5': 7, 'Ryzen 7': 4 },
  Generation: { '5th': 8, '6th': 20, '7th': 15, '8th': 3, '9th': 5, '10th': 7, '11th': 4 },
  Etat: { 'Neuf': 40, 'Remis à neuf': 15, 'Occasion': 10 },
  Ecran: { '13 pouces': 5, '14 pouces': 12, '15.6 pouces': 20, '17 pouces': 4 }
}

const sortBy = ref('Le plus récent')

/* ================= LOGIQUE PRODUITS & PAGINATION ================= */
const products = ref(
  Array.from({ length: 60 }, (_, i) => ({
    id: i + 1,
    category: i % 2 === 0 ? 'Ordinateurs' : 'Composants',
    name: i % 2 === 0 ? `Laptop BRC ProBook X${i + 1} Intel i7` : `Disque Dur SSD Performance ${i + 1}`,
    brand: 'HP',
    price: 450000 + (i * 500),
    oldPrice: 550000,
    discount: '-18%',
    image: '/placeholder.webp',
    imageHover: '/placeholder-hover.webp'
  }))
)

const currentPage = ref(1)
const itemsPerPage = 24 

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    // Filtre par marque
    if (selectedFilters.value.marque && p.brand !== selectedFilters.value.marque) return false
    
    // Filtre par plage de prix
    if (p.price < priceRange.value[0] || p.price > priceRange.value[1]) return false
    
    return true
  })
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

const applyFilter = () => {
  currentPage.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Fonctions utilitaires pour les actions
const addToCart = (id: number) => console.log('Ajout au panier:', id)
const addToWishlist = (id: number) => console.log('Ajout favoris:', id)


const promoFlyers = [
  { image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=500' },
  { image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=500' },
  { image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=500' }
]

/* ================= ÉTAT DES SERVICES (ACCORDÉON) ================= */
const expandedServices = ref<Record<string, boolean>>({
  maintenance: false,
  imprimantes: false,
  integration: false,
  securite: false,
  support: false
})

const toggleService = (key: string) => {
  expandedServices.value[key] = !expandedServices.value[key]
}
</script>

<template>
  <UContainer class="py-8 bg-white">

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

    <div class="grid grid-cols-12 gap-8">
      
      <aside class="col-span-12 lg:col-span-3 space-y-8 flex-shrink-0">
        <div>
          <h2 class="text-2xl text-gray-800 my-1">Filtres</h2>
          <hr class="text-[#e60012]"/>
        </div>

        

        <div v-for="(options, key) in filterGroups" :key="key" class="border-b border-gray-100 pb-6">
          <h3 class="text-sm font-bold text-gray-900 mb-4 tracking-wider ">{{ key }}</h3>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2">
            <template v-for="(count, opt, index) in options" :key="opt">
              <div v-if="index < 4 || expandedGroups[key]">
                <UCheckbox :label="`${opt} (${count})`" />
              </div>
            </template>
          </div>
          <button 
              v-if="Object.keys(options).length > 4" 
              @click="toggleExpand(key)" 
              class="text-[12px] text-[#274a82] font-black mt-4  tracking-tighter hover:text-[#e60012] transition-colors flex items-center gap-1"
            >
              <span>{{ expandedGroups[key] ? '- Voir moins' : '+ Voir plus' }}</span>
          </button>        
        </div>

        <div class="pb-6 border-b border-gray-100">
          <h3 class="text-sm font-bold text-gray-900 mb-6 tracking-wider">Price</h3>
          <div class="px-2">
            <USlider 
              v-model="priceRange" 
              :min="0" 
              :max="20000000" 
              :step="10000"
              size="md"
            />
            <div class="mt-4 text-[14px] text-gray-400 font-medium">
              Prix : {{ priceRange[0].toLocaleString() }} CFA — {{ priceRange[1].toLocaleString() }} CFA
            </div>
            <UButton @click="applyFilter" class="mt-4" color="primary">Appliquer le Filtre</UButton>
          </div>
        </div>
        
        
        <div class="">
          <div class="flex items-center gap-2 mb-4">
            
            <h3 class="text-sm font-bold text-gray-900 tracking-wider border-b border-[#e60012]">Nos Promos</h3>
            
          </div>

          <UCarousel
            v-slot="{ item }"
            :items="promoFlyers"
            arrows
            dots
            :autoplay="{ delay: 2000 }"
            class="relative h-full rounded-sm overflow-hidden shadow-sm group/carousel"
                    :prev="{ variant: 'solid' }"
                    :next="{ variant: 'solid' }"
                    :ui="{
                      prev: 'sm:start-2',
                      next: 'sm:end-2',
                    }"
          >
            <div class="relative overflow-hidden aspect-[4/5]">
              <img 
                :src="item.image" 
                class="w-full h-full object-cover" 
                draggable="false"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </UCarousel>
        </div>

        <div class="">
          <div class="flex items-center gap-2 mb-4">
            
            <h3 class="text-sm font-bold text-gray-900 tracking-wider border-b border-[#e60012]">Nos Meilleur Produits</h3>
            
          </div>

          <UCarousel
            v-slot="{ item }"
            :items="promoFlyers"
            arrows
            dots
            :autoplay="{ delay: 2000 }"
            class="relative h-full rounded-sm overflow-hidden shadow-sm group/carousel"
                    :prev="{ variant: 'solid' }"
                    :next="{ variant: 'solid' }"
                    :ui="{
                      prev: 'sm:start-2',
                      next: 'sm:end-2',
                    }"
          >
            <div class="relative overflow-hidden aspect-[4/5]">
              <img 
                :src="item.image" 
                class="w-full h-full object-cover" 
                draggable="false"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </UCarousel>
        </div>

        <div class="">
          <div class="flex items-center gap-2 mb-4">
            <h3 class="text-sm font-bold text-gray-900 tracking-wider border-b border-[#e60012]">Nos Expertises</h3>
          </div>

          <div class="space-y-2">
            
            <div class="border border-gray-100 rounded-sm bg-white overflow-hidden">
              <button @click="toggleService('maintenance')" class="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group">
                <div class="flex items-center gap-3">
                  <UIcon name="i-heroicons-wrench-screwdriver" class="w-4 h-4 text-[#274a82]" />
                  <span class="text-[13px] font-bold text-gray-800 tracking-tight text-left">Maintenance & Réparation</span>
                </div>
                <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 transition-transform duration-300" :class="expandedServices.maintenance ? 'rotate-180' : ''" />
              </button>
              
              <div v-show="expandedServices.maintenance" class="bg-gray-50/50 border-t border-gray-50 px-10 py-2 space-y-2">
                <NuxtLink to="/services/maintenance/laptops" class="block text-[12px] text-gray-600 hover:text-[#e60012] transition-colors">Laptops</NuxtLink>
                <NuxtLink to="/services/maintenance/desktops" class="block text-[12px] text-gray-600 hover:text-[#e60012] transition-colors">Desktops</NuxtLink>
                <NuxtLink to="/services/maintenance/serveurs" class="block text-[12px] text-gray-600 hover:text-[#e60012] transition-colors">Serveurs</NuxtLink>
              </div>
            </div>

            <div class="border border-gray-100 rounded-sm bg-white overflow-hidden">
              <button @click="toggleService('imprimantes')" class="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group">
                <div class="flex items-center gap-3">
                  <UIcon name="i-heroicons-printer" class="w-4 h-4 text-[#274a82]" />
                  <span class="text-[13px] font-bold text-gray-800 tracking-tight text-left">Imprimantes & Accessoires</span>
                </div>
                <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 transition-transform duration-300" :class="expandedServices.imprimantes ? 'rotate-180' : ''" />
              </button>
              
              <div v-show="expandedServices.imprimantes" class="bg-gray-50/50 border-t border-gray-50 px-10 py-2 space-y-2">
                <NuxtLink to="/services/accessoires/toners" class="block text-[12px] text-gray-600 hover:text-[#e60012]">Toners & Encres</NuxtLink>
                <NuxtLink to="/services/accessoires/reseau" class="block text-[12px] text-gray-600 hover:text-[#e60012]">Câblage & Réseau</NuxtLink>
                <NuxtLink to="/services/accessoires/peripheriques" class="block text-[12px] text-gray-600 hover:text-[#e60012]">Périphériques</NuxtLink>
              </div>
            </div>

            <div class="border border-gray-100 rounded-sm bg-white overflow-hidden">
              <button @click="toggleService('integration')" class="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group">
                <div class="flex items-center gap-3">
                  <UIcon name="i-heroicons-server-stack" class="w-4 h-4 text-[#274a82]" />
                  <span class="text-[13px] font-bold text-gray-800 tracking-tight text-left">Intégration & Déploiement</span>
                </div>
                <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 transition-transform duration-300" :class="expandedServices.integration ? 'rotate-180' : ''" />
              </button>
              
              <div v-show="expandedServices.integration" class="bg-gray-50/50 border-t border-gray-50 px-10 py-2 space-y-2">
                <NuxtLink to="/services/integration/reseau" class="block text-[12px] text-gray-600 hover:text-[#e60012]">Mise en réseau</NuxtLink>
                <NuxtLink to="/services/integration/parcs" class="block text-[12px] text-gray-600 hover:text-[#e60012]">Déploiement de parcs</NuxtLink>
                <NuxtLink to="/services/integration/cloud" class="block text-[12px] text-gray-600 hover:text-[#e60012]">Cloud & Serveurs</NuxtLink>
              </div>
            </div>

            <div class="border border-gray-100 rounded-sm bg-white overflow-hidden">
              <button @click="toggleService('securite')" class="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group">
                <div class="flex items-center gap-3">
                  <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-[#274a82]" />
                  <span class="text-[13px] font-bold text-gray-800  tracking-tight text-left">Sécurité Informatique</span>
                </div>
                <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 transition-transform duration-300" :class="expandedServices.securite ? 'rotate-180' : ''" />
              </button>
              
              <div v-show="expandedServices.securite" class="bg-gray-50/50 border-t border-gray-50 px-10 py-2 space-y-2">
                <NuxtLink to="/services/securite/cameras" class="block text-[12px] text-gray-600 hover:text-[#e60012]">Vidéosurveillance</NuxtLink>
                <NuxtLink to="/services/securite/antivirus" class="block text-[12px] text-gray-600 hover:text-[#e60012]">Solutions Antivirus</NuxtLink>
                <NuxtLink to="/services/securite/controle-acces" class="block text-[12px] text-gray-600 hover:text-[#e60012]">Contrôle d'accès</NuxtLink>
              </div>
            </div>

            <div class="border border-gray-100 rounded-sm bg-white overflow-hidden">
              <button @click="toggleService('support')" class="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group">
                <div class="flex items-center gap-3">
                  <UIcon name="i-heroicons-chat-bubble-left-right" class="w-4 h-4 text-[#274a82]" />
                  <span class="text-[13px] font-bold text-gray-800 tracking-tight text-left">Support Technique</span>
                </div>
                <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 transition-transform duration-300" :class="expandedServices.support ? 'rotate-180' : ''" />
              </button>
              
              <div v-show="expandedServices.support" class="bg-gray-50/50 border-t border-gray-50 px-10 py-2 space-y-2">
                <NuxtLink to="/contact" class="block text-[12px] text-gray-600 hover:text-[#e60012]">Assistance Hotline</NuxtLink>
                <NuxtLink to="/contact" class="block text-[12px] text-gray-600 hover:text-[#e60012]">Maintenance à distance</NuxtLink>
              </div>
            </div>

          </div>
        </div>
      </aside>

      <main class="col-span-12 lg:col-span-9">
        <h1 class="text-2xl font-medium text-gray-700 pb-2">Laptops</h1>
        
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
            <USelectMenu 
              v-model="sortBy" 
              :items="['Le plus récent','Par popularité','Par tarif croissant', 'Par tarif decroissant' ]" 
              class="min-w-48" 
              :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            />
          </div>
        </div>

        <div :class="{
          'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4': viewMode === 'grid',
          'grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2': viewMode === 'grid-small',
          'flex flex-col gap-4': viewMode === 'list',
          'flex flex-col gap-1': viewMode === 'list-compact'
        }">
          <NuxtLink 
            v-for="p in paginatedProducts" 
            :key="p.id" 
            to="product/product-details"
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
              
              <div class="flex flex-col items-center justify-center opacity-10 group-hover:opacity-30 transition-opacity">
                <UIcon name="i-heroicons-shopping-bag" :class="viewMode === 'list-compact' ? 'w-6 h-6' : 'w-12 h-12'" />
                <span class="font-black text-[10px]">BRC MARKET</span>
              </div>

              <div class="absolute bottom-2 left-2 bg-[#e60012] text-white text-[9px] font-black px-2 py-0.5 rounded-sm z-10">
                {{ p.discount }}
              </div>

              <div v-if="viewMode.startsWith('grid')" class="absolute right-[-50px] group-hover:right-3 top-3 flex flex-col gap-2 z-30 transition-all duration-300">
                <button @click.prevent.stop="addToWishlist(p.id)" class="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white"><UIcon name="i-heroicons-heart" class="w-4 h-4" /></button>
                <button @click.prevent.stop="" class="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#274a82] hover:text-white"><UIcon name="i-heroicons-eye" class="w-4 h-4" /></button>
              </div>

              <div v-if="viewMode.startsWith('grid')" class="absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full transition-all duration-300 z-20">
                <UButton @click.prevent.stop="addToCart(p.id)" icon="i-heroicons-shopping-cart" block class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-2.5">Ajouter au Panier</UButton>
              </div>
            </div>
            
            <div class="p-3 flex flex-col flex-1" :class="viewMode === 'list-compact' ? 'p-1' : ''">
              <span class="text-[12px] text-gray-400 font-bold tracking-widest">{{ p.category }}</span>
              <h3 class="text-[#274a82] font-bold mb-2 line-clamp-2 leading-snug group-hover:underline"
                  :class="viewMode === 'list-compact' ? 'text-[12px] h-4 mb-0' : 'text-[15px] h-9'">
                {{ p.name }}
              </h3>
              
              <div class="mt-auto flex items-end justify-between">
                <div>
                  <div v-if="viewMode !== 'list-compact'" class="text-[12px] text-[#e60012] line-through mb-[-4px]">
                    {{ p.oldPrice.toLocaleString() }} FCFA
                  </div>
                  <div :class="viewMode === 'list-compact' ? 'text-xs' : 'text-xl'" class="font-black text-gray-900 whitespace-nowrap">
                    {{ p.price.toLocaleString() }} <span class="text-[10px]">FCFA</span>
                  </div>
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

        <div v-if="totalPages > 1" class="flex justify-center pt-6 mb-12">
          <UPagination v-model="currentPage" :page-count="itemsPerPage" :total="filteredProducts.length" />
        </div>

        <section>
          <div class="flex items-center justify-between border-b border-gray-200 mb-6">
            <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
              Produits Récents 
            </h2>
            <NuxtLink to="/nouveautes" class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group">
              Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
            </NuxtLink>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            <NuxtLink 
              v-for="p in recentProducts" 
              :key="'recent-' + p.id" 
              :to="`/produit/${p.id}`"
              class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl"
            >
              <div class="relative h-64 w-full overflow-hidden p-2 flex items-center justify-center">
                <div class="absolute right-[-50px] group-hover:right-3 top-3 flex flex-col gap-2 z-30 transition-all duration-300">
                  <button @click.prevent.stop="addToWishlist(p.id)" class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors">
                    <UIcon name="i-heroicons-heart" class="w-5 h-5" />
                  </button>
                  <button @click.prevent.stop="" class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#274a82] hover:text-white transition-colors">
                    <UIcon name="i-heroicons-eye" class="w-5 h-5" />
                  </button>
                </div>
                <div class="flex flex-col items-center justify-center opacity-10 group-hover:opacity-30 transition-opacity">
                  <UIcon name="i-heroicons-sparkles" class="w-12 h-12" />
                </div>
                <div class="absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full transition-all duration-300 z-20">
                  <UButton @click.prevent.stop="addToCart(p.id)" icon="i-heroicons-shopping-cart" block class="bg-[#274a82] rounded-none font-bold text-[12px] py-2.5">Ajouter au Panier</UButton>
                </div>
              </div>
              <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
                <h3 class="text-[13px] text-gray-600 font-medium mb-2 line-clamp-2 h-10 leading-snug ">{{ p.name }}</h3>
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

      </main>
    </div>
  </UContainer>
</template>

<style scoped>
:deep(.u-checkbox-label) { font-size: 11px; color: #666; font-weight: 500; cursor: pointer; }
</style>