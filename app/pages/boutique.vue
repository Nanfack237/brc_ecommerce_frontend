<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BreadcrumbItem } from '@nuxt/ui'

/* ================= BREADCRUMB ================= */
const items = ref<BreadcrumbItem[]>([
  { label: 'Accueil', to: '/' },
  { label: 'Boutique', to: '/boutique' }
])

/* ================= FILTERS ================= */
const brands = ['HP', 'Dell', 'Lenovo', 'Asus', 'Acer']
const processors = ['Intel i3', 'Intel i5', 'Intel i7', 'Ryzen 5', 'Ryzen 7']
const generations = ['8ᵉ', '9ᵉ', '10ᵉ', '11ᵉ', '12ᵉ']
const storages = ['256GB SSD', '512GB SSD','500GB HDD','1TB HDD']
const rams = ['4Go', '8Go', '16Go', '32Go']
const categories = ['Ordinateurs portables', 'Accessoires', 'Imprimantes', 'Réseau', 'Logiciels']

// Selection unique par filtre
const selectedBrand = ref<string | null>(null)
const selectedProcessor = ref<string | null>(null)
const selectedGeneration = ref<string | null>(null)
const selectedStorage = ref<string | null>(null)
const selectedRam = ref<string | null>(null)
const selectedCategory = ref<string | null>(null)

const minPrice = 50000
const maxPrice = 1000000
const priceRange = ref(maxPrice)

const sortBy = ref('Plus récents')
const sortOptions = ['Populaire', 'Plus récents', 'Promotions', 'Prix croissant', 'Prix décroissant']

/* ================= PRODUCTS (40) ================= */
const products = ref(
  Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    name: `Ordinateur Portable Pro ${i + 1}`,
    brand: brands[i % brands.length],
    processor: processors[i % processors.length],
    generation: generations[i % generations.length],
    storage: storages[i % storages.length],
    ram: rams[i % rams.length],
    price: 50000 + i * 18000,
    oldPrice: 60000 + i * 20000,
    discount: Math.floor(Math.random() * 20) + 5,
    sales: Math.floor(Math.random() * 100),
    createdAt: new Date(2024, 0, i + 1),
    image: '/images/publicity1.jpg',
    category: i % 5 === 0 ? 'Accessoires' : 'Ordinateurs portables'
  }))
)

/* ================= FILTER & SORT LOGIC ================= */
const filteredProducts = computed(() => {
  let result = products.value.filter(p => {
    if (selectedBrand.value && p.brand !== selectedBrand.value) return false
    if (selectedProcessor.value && p.processor !== selectedProcessor.value) return false
    if (selectedGeneration.value && p.generation !== selectedGeneration.value) return false
    if (selectedStorage.value && p.storage !== selectedStorage.value) return false
    if (selectedRam.value && p.ram !== selectedRam.value) return false
    if (selectedCategory.value && p.category !== selectedCategory.value) return false
    if (p.price > priceRange.value) return false
    return true
  })

  if (sortBy.value === 'Prix croissant') result.sort((a, b) => a.price - b.price)
  else if (sortBy.value === 'Prix décroissant') result.sort((a, b) => b.price - a.price)
  else if (sortBy.value === 'Promotions') result.sort((a, b) => b.discount - a.discount)
  else if (sortBy.value === 'Populaire') result.sort((a, b) => b.sales - a.sales)
  else if (sortBy.value === 'Plus récents') result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return result
})

/* ================= PAGINATION ================= */
const currentPage = ref(1)
const perPage = 24
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / perPage))
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredProducts.value.slice(start, start + perPage)
})
function goToPage(page: number) { currentPage.value = page }

/* ================= SECTIONS ================= */
const recentProducts = computed(() =>
  products.value
    .filter(p => p.category === 'Ordinateurs portables')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8)
)
const accessories = computed(() =>
  products.value.filter(p => p.category === 'Accessoires')
)
</script>

<template>
  <UContainer class="py-5">
    <!-- Breadcrumb -->
    <UBreadcrumb icon="i-heroicons-chevron-right" :items="items" class="mb-6 custom-breadcrumb" />

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar filtres -->
      <aside class="space-y-8">
        <h2 class="text-lg font-semibold border-b pb-2">Filtres</h2>

        <!-- Catégories -->
        <div>
          <h3 class="font-medium mb-2">Catégories</h3>
          <div class="grid grid-cols-2 gap-1 text-sm">
            <UCheckbox
              v-for="c in categories"
              :key="c"
              :label="c"
              :value="c"
              :checked="selectedCategory === c"
              @update:checked="selectedCategory.value = $event ? c : null"
            />
          </div>
        </div>

        <!-- Marque -->
        <div>
          <h3 class="font-medium mb-2">Marques</h3>
          <div class="grid grid-cols-3 gap-2 text-sm">
            <UCheckbox
              v-for="b in brands"
              :key="b"
              :label="b"
              :value="b"
              :checked="selectedBrand === b"
              @update:checked="selectedBrand.value = $event ? b : null"
            />
          </div>
        </div>

        <!-- Processeur -->
        <div>
          <h3 class="font-medium mb-2">Processeur</h3>
          <div class="grid grid-cols-3 gap-2 text-sm">
            <UCheckbox
              v-for="p in processors"
              :key="p"
              :label="p"
              :value="p"
              :checked="selectedProcessor === p"
              @update:checked="selectedProcessor.value = $event ? p : null"
            />
          </div>
        </div>

        <!-- Génération -->
        <div>
          <h3 class="font-medium mb-2">Génération</h3>
          <div class="grid grid-cols-3 gap-2 text-sm">
            <UCheckbox
              v-for="g in generations"
              :key="g"
              :label="g"
              :value="g"
              :checked="selectedGeneration === g"
              @update:checked="selectedGeneration.value = $event ? g : null"
            />
          </div>
        </div>

        <!-- Stockage -->
        <div>
          <h3 class="font-medium mb-2">Stockage</h3>
          <div class="grid grid-cols-3 gap-2 text-sm">
            <UCheckbox
              v-for="s in storages"
              :key="s"
              :label="s"
              :value="s"
              :checked="selectedStorage === s"
              @update:checked="selectedStorage.value = $event ? s : null"
            />
          </div>
        </div>

        <!-- RAM -->
        <div>
          <h3 class="font-medium mb-2">RAM</h3>
          <div class="grid grid-cols-3 gap-2 text-sm">
            <UCheckbox
              v-for="r in rams"
              :key="r"
              :label="r"
              :value="r"
              :checked="selectedRam === r"
              @update:checked="selectedRam.value = $event ? r : null"
            />
          </div>
        </div>

        <!-- Prix -->
        <div>
          <h3 class="font-medium mb-2">Prix Max: <span class="text-red-600">{{ priceRange.toLocaleString() }} CFA</span></h3>
          <USlider
            v-model="priceRange"
            :min="minPrice"
            :max="maxPrice"
            :step="5000"
            color="secondary"
          />
          <div class="flex justify-between text-xs text-gray-400">
            <span>{{ minPrice.toLocaleString() }}</span>
            <span>{{ maxPrice.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Bouton Appliquer -->
        <UButton block style="background-color:#e60012; color:white;">Appliquer</UButton>
      </aside>

      <!-- Main -->
      <main class="lg:col-span-3">
        <!-- Header tri -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 class="text-2xl font-bold">Boutique</h1>
            <span class="text-sm text-gray-500">{{ filteredProducts.length }} produits trouvés</span>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-500 whitespace-nowrap">Trier par :</span>
            <USelectMenu v-model="sortBy" :options="sortOptions" class="w-48"/>
          </div>
        </div>

        <!-- Produits -->
        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="p in paginatedProducts" :key="p.id" class="border rounded-lg p-4 flex flex-col bg-white">
            <div class="h-40 w-full flex items-center justify-center overflow-hidden mb-3">
              <img :src="p.image" class="max-h-full max-w-full object-contain"/>
            </div>
            <p class="text-[10px] text-gray-400 uppercase font-bold mb-1">{{ p.brand }} • {{ p.processor }}</p>
            <h3 class="text-sm font-semibold mb-2 line-clamp-2">{{ p.name }}</h3>
            <div class="mt-auto flex items-center gap-2 mb-3">
              <span class="text-red-600 font-black text-base">{{ p.price.toLocaleString() }} CFA</span>
              <span class="line-through text-gray-400 text-xs">{{ p.oldPrice.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex justify-center gap-2 mt-6">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="{'bg-red-600 text-white': page === currentPage, 'bg-gray-200': page !== currentPage}"
            class="px-3 py-1 rounded"
          >{{ page }}</button>
        </div>

        <!-- Produits récents -->
        <div class="mt-12">
          <h2 class="text-xl font-bold mb-4">Produits récents</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div v-for="p in recentProducts" :key="p.id" class="border rounded p-3 flex flex-col items-center">
              <img :src="p.image" class="h-24 object-contain mb-2"/>
              <p class="text-sm font-semibold">{{ p.name }}</p>
            </div>
          </div>
        </div>

        <!-- Accessoires -->
        <div class="mt-12">
          <h2 class="text-xl font-bold mb-4">Accessoires</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div v-for="p in accessories" :key="p.id" class="border rounded p-3 flex flex-col items-center">
              <img :src="p.image" class="h-24 object-contain mb-2"/>
              <p class="text-sm font-semibold">{{ p.name }}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </UContainer>
</template>

<style scoped>
/* Breadcrumb actif en rouge */
.custom-breadcrumb li:last-child {
  color: #e60012;
  font-weight: bold;
}

/* Slider couleur #e60012 */
.USlider .uslider-track {
  background-color: #e60012;
}
.USlider .uslider-thumb {
  background-color: #e60012;
}
</style>
