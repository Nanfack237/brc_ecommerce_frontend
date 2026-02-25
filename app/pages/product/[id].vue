<script setup lang="ts">
// --- GESTION DES IMAGES ---


useHead({
  title: 'BRC Market',
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Produit` : 'BRC Market';
  },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
const mainImage = ref('/images/publicity0.jpg')
const thumbnails = [
  '/images/publicity0.jpg',
  '/images/publicity1.jpg',
  '/images/publicity2.jpg',
  '/images/publicity0.jpg',
  '/images/publicity0.jpg',
]

// --- LOGIQUE ZOOM ---
const isZoomed = ref(false)
const zoomPos = ref({ x: 0, y: 0 })
const handleMouseMove = (e: MouseEvent) => {
  const { left, top, width, height } = (e.currentTarget as HTMLElement).getBoundingClientRect()
  zoomPos.value = { 
    x: ((e.clientX - left) / width) * 100, 
    y: ((e.clientY - top) / height) * 100 
  }
}

// --- DONNÉES DU PRODUIT ---
const quantity = ref(1)
const activeTab = ref('description') // Changé pour correspondre à l'image

const specs = {
  "Categorie": "Laptop",
  "Marque": "ROCH",
  "Modèle": "RH-LE55DSA-B",
  "Couleur Disponible": "Rouge, Noir et Blanc",
  "Taille": "55 pouces",
  "Connectivité": "HDMI, USB, WIFI",
  "Divers": "S2",
  "Caracteristique": "SSD",
}

const reviews = [
  { user: "Jean M.", date: "12/02/2026", rating: 5, comment: "Superbe qualité d'image, livraison rapide par BRC !" },
  { user: "Aline T.", date: "10/02/2026", rating: 4, comment: "Très bon rapport qualité/prix. Le support mural est un vrai plus." },
  { user: "Kevin O.", date: "08/02/2026", rating: 5, comment: "L'interface Smart TV est vraiment fluide, je recommande vivement." },
  { user: "Harlan W.", date: "05/02/2026", rating: 5, comment: "Une immersion totale, les noirs sont profonds pour cette gamme." }
]

// --- PRODUITS RÉCENTS (SIMILAIRES) ---
const recentProducts = ref([
  { id: 1, name: "Smart TV ROCH 43 pouces Full HD", price: 145000, oldPrice: 165000, discount: "-12%" },
  { id: 2, name: "Support Mural TV 32-55 pouces", price: 15000, oldPrice: 20000, discount: "-25%" },
  { id: 3, name: "Home Cinema Roch 2.1 Bluetooth", price: 45000, oldPrice: 55000, discount: "-18%" },
  { id: 5, name: "Câble HDMI 2.1 Haute Vitesse 3m", price: 5000, oldPrice: 8000, discount: "-37%" },
  { id: 4, name: "Android TV Box 4K Ultra", price: 25000, oldPrice: 35000, discount: "-28%" },
  { id: 5, name: "Câble HDMI 2.1 Haute Vitesse 3m", price: 5000, oldPrice: 8000, discount: "-37%" },
  { id: 6, name: "Câble HDMI 2.1 Haute Vitesse 3m", price: 5000, oldPrice: 8000, discount: "-37%" },

])

const addToCart = (id: number) => console.log('Ajout au panier:', id)
const addToWishlist = (id: number) => console.log('Ajout favoris:', id)
</script>

<template>
  <UContainer class="py-8 bg-white">
    <div class="flex items-center gap-2 text-[12px] font-bold tracking-wider text-gray-400 mb-6 border-b border-gray-50 pb-4">
      <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">Boutique</NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
      <span class="text-[#274a82]">Télévision</span>
      <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
      <span class="text-gray-900 truncate max-w-[200px]">Smart TV ROCH 55"</span>
    </div>

    <div class="mb-8 pb-2">
      <h1 class="text-2xl font-black text-gray-900 leading-tight uppercase tracking-tight">
        Smart TV - ROCH - 55 pouces + Support Mural intégré Noir
      </h1>
    </div>

    <div class="grid grid-cols-12 gap-8 items-start mb-12">
      <div class="col-span-12 lg:col-span-6 flex gap-4">
        <div class="flex flex-col gap-2 py-3 overflow-y-auto max-h-[450px] custom-scrollbar">
          <button 
            v-for="img in thumbnails" :key="img" @click="mainImage = img"
            class="w-16 h-16 border rounded p-1 transition-all flex-shrink-0"
            :class="mainImage === img ? 'border-[#274a82] ring-1 ring-[#274a82]' : 'border-gray-200'"
          >
            <img :src="img" class="w-full h-full object-cover rounded-sm" />
          </button>
        </div>

        <div 
          class="flex-1 relative border border-gray-100 rounded-lg overflow-hidden bg-white h-[450px]"
          @mouseenter="isZoomed = true" @mouseleave="isZoomed = false" @mousemove="handleMouseMove"
          :class="isZoomed ? 'cursor-none' : 'cursor-zoom-in'"
        >
          <div class="absolute top-4 right-4 bg-[#e60012] text-white text-[11px] font-black px-3 py-1 rounded shadow-lg z-30">
            -15% BRC MARKET
          </div>

          <img 
            :src="mainImage" 
            class="w-full h-full object-contain p-10 transition-transform duration-200"
            :style="isZoomed ? { transform: 'scale(2.5)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}"
          />

          <!-- <div v-if="!isZoomed" class="absolute bottom-4 left-0 w-full flex justify-center gap-3 px-4 z-10">
            <div v-for="icon in ['HDMI', 'FULL HD', 'SMART TV', 'USB', 'WIFI']" :key="icon" 
                 class="flex flex-col items-center bg-white/90 border border-gray-100 p-1 rounded shadow-sm">
              
            </div>
          </div> -->
          
          <div v-if="isZoomed" class="absolute pointer-events-none border-2 border-[#274a82] rounded-full w-24 h-24 shadow-2xl z-40 bg-white/10" 
               :style="{ left: `calc(${zoomPos.x}% - 48px)`, top: `calc(${zoomPos.y}% - 48px)` }">
          </div>
        </div>
        </div>

      <div class="col-span-12 lg:col-span-6 space-y-6">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-3">
            <span class="text-3xl font-black text-[#e60012]">254 000 FCFA</span>
            <span class="text-sm text-gray-400 line-through">300 000 FCFA</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-x-8 gap-y-3 py-6 border-y border-gray-50">
          <div v-for="(val, label) in specs" :key="label" class="flex justify-between items-center border-b border-gray-50 pb-1">
            <span class="text-[12px] text-gray-400 font-bold ">{{ label }}</span>
            <span class="text-[13px] text-gray-900 font-black text-right">{{ val }}</span>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
            <button @click="quantity > 1 ? quantity-- : null" class="px-4 py-3 hover:bg-gray-200 font-bold transition-colors">-</button>
            <span class="px-4 py-3 font-black text-[#274a82] bg-white min-w-[50px] text-center border-x border-gray-200">{{ quantity }}</span>
            <button @click="quantity++" class="px-4 py-3 hover:bg-gray-200 font-bold transition-colors">+</button>
          </div>
          
          <UButton 
            block size="xl" 
            class="flex-1 bg-[#274a82] hover:bg-[#e60012] text-white font-black py-3 tracking-widest shadow-md transition-all"
          >
            Ajouter au panier
          </UButton>
        </div>
      </div>
    </div>

   <div class="mb-10">
      <div class="flex gap-10 border-b border-gray-100 mb-6">
        <button @click="activeTab = 'description'" class="pb-2 text-[15px] font-black transition-all border-b-2"
          :class="activeTab === 'description' ? 'border-[#e60012] text-black' : 'border-transparent text-gray-400'">
          Description
        </button>
        <button @click="activeTab = 'reviews'" class="pb-2 text-[15px] font-black transition-all border-b-2"
          :class="activeTab === 'reviews' ? 'border-[#e60012] text-black' : 'border-transparent text-gray-400'">
          Reviews
        </button>
      </div>

      <div v-if="activeTab === 'description'" class="text-[14px] leading-[1.8] text-gray-700">
        La Smart TV ROCH modèle RH-LE55DA-B vous donnera une toute autre façon de vivre et de visionner dans votre maison. 
        Son écran exceptionnel de 55 pouces vous fera voir les choses en grand. Ses images Full HD vous donneront une impression 
        d'immersion sans précédant tellement les images y sont claires et réalistes. Son son puissant et net vous mettra 
        dans le confort le plus total.
      </div>

      <div v-else class="relative overflow-hidden py-4">
        <div class="flex gap-6 marquee-container">
          <div class="flex gap-6 animate-marquee-scroll">
            <div v-for="review in [...reviews, ...reviews]" :key="review.user" 
                 class="min-w-[320px] p-5 bg-slate-50 rounded-sm border border-gray-100 shadow-sm flex flex-col gap-4">
              <p class="text-gray-600 text-[14px] leading-relaxed italic">“{{ review.comment }}”</p>
              <div class="flex items-center gap-3 mt-auto">
                <UAvatar :src="`https://ui-avatars.com/api/?name=${review.user}&background=random`" size="md" />
                <div class="flex flex-col">
                  <span class="font-bold text-gray-900 text-sm">{{ review.user }}</span>
                  <div class="flex gap-0.5"><UIcon v-for="i in 5" :key="i" name="i-heroicons-star-solid" class="w-3 h-3 text-yellow-400" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <section>
      <div class="flex items-center justify-between border-b border-gray-200 mb-6">
        <h2 class="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
          Produits Similaires 
        </h2>
        <NuxtLink to="/nouveautes" class="text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group">
          Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      </div>

      <UCarousel
        v-slot="{ item }"
        :items="recentProducts"
        :autoplay="{ delay: 2000 }"
        :ui="{ 
          item: 'basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/5 px-2',
          container: 'py-4' 
        }"
        indicators
        arrows
        class="rounded-lg"
      >
        <NuxtLink 
          :to="`/produit/${item.id}`"
          class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full"
        >
          <div class="relative h-64 w-full overflow-hidden p-2 flex items-center justify-center">
            <div class="absolute right-[-50px] group-hover:right-3 top-3 flex flex-col gap-2 z-30 transition-all duration-300">
              <button @click.prevent.stop="addToWishlist(item.id)" class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#e60012] hover:text-white transition-colors">
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
              <UButton @click.prevent.stop="addToCart(item.id)" icon="i-heroicons-shopping-cart" block class="bg-[#274a82] rounded-none font-bold text-[12px] py-2.5">Ajouter au Panier</UButton>
            </div>
          </div>

          <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
            <h3 class="text-[13px] text-gray-600 font-medium mb-2 line-clamp-2 h-10 leading-snug ">{{ item.name }}</h3>
            <div class="mt-auto">
              <div class="text-[18px] font-black text-gray-900 mb-0.5">{{ item.price.toLocaleString() }} FCFA</div>
              <div class="flex items-center justify-between">
                <span class="text-[12px] text-gray-400 line-through">{{ item.oldPrice.toLocaleString() }} FCFA</span>
                <div class="bg-[#e60012] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">{{ item.discount }}</div>
              </div>
            </div>
          </div>
        </NuxtLink>
      </UCarousel>
    </section>
  </UContainer>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #274a82; border-radius: 10px; }
.cursor-zoom-in { cursor: crosshair; }

/* ANIMATION MARQUEE */
.animate-marquee-scroll {
  display: flex;
  animation: scroll-marquee 40s linear infinite;
}
.marquee-container:hover .animate-marquee-scroll {
  animation-play-state: paused;
}
@keyframes scroll-marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>