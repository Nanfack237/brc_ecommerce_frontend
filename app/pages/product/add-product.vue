<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <!-- Header Bar -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-30 py-4 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 class="text-[15px] font-black text-gray-900 tracking-tight">Ajouter un produit</h1>
            <p class="text-[11px] text-gray-400 font-medium">Remplissez les informations du nouveau produit</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UButton variant="ghost" size="sm" class="text-gray-500 font-semibold text-xs">
            Annuler
          </UButton>
          <UButton size="sm" class="bg-[#e60012] hover:bg-[#c4000f] font-black text-xs px-5 rounded-sm shadow-md">
            <UIcon name="i-heroicons-check" class="w-3.5 h-3.5 mr-1" />
            Publier
          </UButton>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- LEFT COLUMN -->
        <div class="lg:col-span-2 flex flex-col gap-5">

          <!-- Informations générales -->
          <div class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-sm bg-[#274a82]/10 flex items-center justify-center">
                <UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5 text-[#274a82]" />
              </div>
              <h2 class="text-sm font-black text-gray-800 tracking-tight">Informations générales</h2>
            </div>
            <div class="p-5 flex flex-col gap-4">
              <!-- Nom du produit -->
              <div>
                <label class="block text-sm font-black text-gray-700 mb-1.5 tracking-wide">Nom du produit <span class="text-[#e60012]">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Ex: Samsung Galaxy S24 Ultra 256Go"
                  class="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-1 focus:ring-[#274a82]/20 transition-all"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-black text-gray-700 mb-1.5 tracking-wide">Description</label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  placeholder="Décrivez le produit : caractéristiques, avantages, utilisation..."
                  class="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-1 focus:ring-[#274a82]/20 transition-all resize-none"
                />
              </div>

              <!-- Marque + Référence -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-black text-gray-700 mb-1.5 tracking-wide">Marque</label>
                  <input
                    v-model="form.brand"
                    type="text"
                    placeholder="Ex: Samsung, Apple..."
                    class="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-1 focus:ring-[#274a82]/20 transition-all"
                  />
                </div>
                <div>
                  <label class="block text-sm font-black text-gray-700 mb-1.5 tracking-wide">Référence / SKU</label>
                  <input
                    v-model="form.sku"
                    type="text"
                    placeholder="Ex: SAM-S24U-256"
                    class="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-1 focus:ring-[#274a82]/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Prix & Stock -->
          <div class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-sm bg-[#e60012]/10 flex items-center justify-center">
                <UIcon name="i-heroicons-currency-dollar" class="w-3.5 h-3.5 text-[#e60012]" />
              </div>
              <h2 class="text-sm font-black text-gray-800 tracking-tight">Prix & Stock</h2>
            </div>
            <div class="p-5 flex flex-col gap-4">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <!-- Prix normal -->
                <div>
                  <label class="block text-sm font-black text-gray-700 mb-1.5 tracking-wide">Prix (FCFA)<span class="text-[#e60012]">*</span></label>
                  <div class="relative">
                    <input
                      v-model="form.price"
                      type="number"
                      placeholder=" Entrez le prix"
                      class="w-full border px-3 border-gray-200 rounded-sm pl-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-1 focus:ring-[#274a82]/20 transition-all"
                    />
                    <!-- <span class="absolute top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-400">FCFA</span> -->
                  </div>
                </div>
                <!-- Ancien prix -->
                <div>
                  <label class="block text-sm font-black text-gray-700 mb-1.5 tracking-wide">Ancien Prix (FCFA)</label>
                  <div class="relative">
                    <input
                      v-model="form.oldPrice"
                      type="number"
                      placeholder="Entrez l'ancien prix"
                      class="w-full border px-3 border-gray-200 rounded-sm pl-3  py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-1 focus:ring-[#274a82]/20 transition-all"
                    />
                    <!-- <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-400">FCFA</span> -->
                  </div>
                </div>
                <!-- Stock -->
                <div>
                  <label class="block text-sm font-black text-gray-700 mb-1.5 tracking-wide">Stock <span class="text-[#e60012]">*</span></label>
                  <input
                    v-model="form.stock"
                    type="number"
                    placeholder="0"
                    class="w-full border px-3 border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-1 focus:ring-[#274a82]/20 transition-all"
                  />
                </div>
              </div>

              <!-- Remise calculée -->
              <div v-if="discountPercent > 0" class="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-sm">
                <UIcon name="i-heroicons-tag" class="w-4 h-4 text-green-600" />
                <span class="text-xs font-black text-green-700">Remise calculée : <span class="text-[#e60012]">-{{ discountPercent }}%</span></span>
              </div>
            </div>
          </div>

          <!-- Spécifications -->
          <div class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-sm bg-purple-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-list-bullet" class="w-3.5 h-3.5" />
                </div>
                <h2 class="text-sm font-black text-gray-800 tracking-tight">Spécifications techniques</h2>
              </div>
              <button @click="addSpec" class="text-[11px] font-black text-[#274a82] hover:text-[#e60012] transition-colors flex items-center gap-1">
                <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5" />
                Ajouter
              </button>
            </div>
            <div class="p-5 flex flex-col gap-2.5">
              <div
                v-for="(spec, i) in form.specs"
                :key="i"
                class="flex gap-2 items-center"
              >
                <input
                  v-model="spec.key"
                  type="text"
                  placeholder="Ex: Couleur, Poids, RAM..."
                  class="w-2/5 border border-gray-200 rounded-sm px-3 py-2 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-1 focus:ring-[#274a82]/20 transition-all"
                />
                <input
                  v-model="spec.value"
                  type="text"
                  placeholder="Valeur"
                  class="flex-1 border border-gray-200 rounded-sm px-3 py-2 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-1 focus:ring-[#274a82]/20 transition-all"
                />
                <button @click="removeSpec(i)" class="w-7 h-7 rounded-sm bg-gray-100 hover:bg-red-100 hover:text-[#e60012] flex items-center justify-center text-gray-400 transition-colors flex-shrink-0">
                  <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                v-if="form.specs.length === 0"
                @click="addSpec"
                class="w-full border-2 border-dashed border-gray-200 rounded-sm py-4 text-xs font-semibold text-gray-400 hover:border-[#274a82] hover:text-[#274a82] transition-all flex items-center justify-center gap-2"
              >
                <UIcon name="i-heroicons-plus-circle" class="w-4 h-4" />
                Ajouter une spécification
              </button>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN -->
        <div class="flex flex-col gap-5">

          <!-- Images -->
          <div class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-sm bg-orange-100 flex items-center justify-center">
                <UIcon name="i-heroicons-photo" class="w-3.5 h-3.5 text-orange-500" />
              </div>
              <h2 class="text-sm font-black text-gray-800 tracking-tight">Images du produit</h2>
            </div>
            <div class="p-5 flex flex-col gap-3">
              <!-- Zone upload principale -->
              <div
                @dragover.prevent="dragOver = true"
                @dragleave="dragOver = false"
                @drop.prevent="handleDrop"
                :class="[
                  'border-2 border-dashed rounded-sm p-6 text-center transition-all cursor-pointer',
                  dragOver ? 'border-[#274a82] bg-[#274a82]/5' : 'border-gray-200 hover:border-[#274a82] hover:bg-gray-50'
                ]"
                @click="$refs.fileInput.click()"
              >
                <input ref="fileInput" type="file" multiple accept="image/*" class="hidden" @change="handleFileChange" />
                <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <UIcon name="i-heroicons-arrow-up-tray" class="w-5 h-5 text-gray-400" />
                </div>
                <p class="text-xs font-black text-gray-600 mb-1">Glissez vos images ici</p>
                <p class="text-[10px] text-gray-400">PNG, JPG, WEBP — max 5 Mo</p>
              </div>

              <!-- Aperçu images -->
              <div v-if="previewImages.length > 0" class="grid grid-cols-3 gap-2">
                <div
                  v-for="(img, i) in previewImages"
                  :key="i"
                  class="relative group aspect-square rounded-sm overflow-hidden border border-gray-100"
                >
                  <img :src="img" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button @click.stop="removeImage(i)" class="w-6 h-6 bg-[#e60012] rounded-full flex items-center justify-center text-white">
                      <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                    </button>
                  </div>
                  <div v-if="i === 0" class="absolute top-1 left-1 bg-[#274a82] text-white text-[9px] font-black px-1 py-0.5 rounded-sm">
                    Principale
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Catégorie & Organisation -->
          <div class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-sm bg-teal-100 flex items-center justify-center">
                <UIcon name="i-heroicons-squares-2x2" class="w-3.5 h-3.5 text-teal-600" />
              </div>
              <h2 class="text-sm font-black text-gray-800 tracking-tight">Catégorie</h2>
            </div>
            <div class="p-5 flex flex-col gap-4">
              <div>
                <label class="block text-sm font-black text-gray-700 mb-1.5 tracking-wide">Catégorie <span class="text-[#e60012]">*</span></label>
                <select
                  v-model="form.category"
                  class="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#274a82] focus:ring-1 focus:ring-[#274a82]/20 transition-all bg-white"
                >
                  <option value="" disabled>Sélectionner une catégorie</option>
                  <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-black text-gray-700 mb-1.5 tracking-wide">Sous-catégorie</label>
                <select
                  v-model="form.subcategory"
                  class="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#274a82] focus:ring-1 focus:ring-[#274a82]/20 transition-all bg-white"
                >
                  <option value="" disabled>Sélectionner</option>
                  <option v-for="sub in subcategories" :key="sub.value" :value="sub.value">{{ sub.label }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Statut & Visibilité -->
          <div class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-sm bg-yellow-100 flex items-center justify-center">
                <UIcon name="i-heroicons-eye" class="w-3.5 h-3.5 text-yellow-600" />
              </div>
              <h2 class="text-sm font-black text-gray-800 tracking-tight">Statut & Visibilité</h2>
            </div>
            <div class="p-5 flex flex-col gap-4">
              <!-- Statut -->
              <div>
                <label class="block text-sm font-black text-gray-700 mb-2 tracking-wide">Statut</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="s in statuses"
                    :key="s.value"
                    @click="form.status = s.value"
                    :class="[
                      'px-3 py-2 rounded-sm border text-xs font-black transition-all',
                      form.status === s.value
                        ? 'border-[#274a82] bg-[#274a82] text-white'
                        : 'border-gray-200 text-gray-500 hover:border-[#274a82] hover:text-[#274a82]'
                    ]"
                  >
                    {{ s.label }}
                  </button>
                </div>
              </div>

              <!-- Options toggles -->
              <div class="flex flex-col gap-3">
                <label class="flex items-center justify-between cursor-pointer">
                  <div>
                    <p class="text-xs font-black text-gray-700">Produit en vedette</p>
                    <p class="text-[10px] text-gray-400">Afficher sur la page d'accueil</p>
                  </div>
                  <div
                    @click="form.featured = !form.featured"
                    :class="[
                      'w-10 h-5 rounded-full relative transition-colors cursor-pointer',
                      form.featured ? 'bg-[#274a82]' : 'bg-gray-200'
                    ]"
                  >
                    <span :class="['absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', form.featured ? 'translate-x-5' : 'translate-x-0.5']" />
                  </div>
                </label>

                <label class="flex items-center justify-between cursor-pointer">
                  <div>
                    <p class="text-xs font-black text-gray-700">Meilleure vente</p>
                    <p class="text-[10px] text-gray-400">Badge "Best seller"</p>
                  </div>
                  <div
                    @click="form.bestSeller = !form.bestSeller"
                    :class="[
                      'w-10 h-5 rounded-full relative transition-colors cursor-pointer',
                      form.bestSeller ? 'bg-[#e60012]' : 'bg-gray-200'
                    ]"
                  >
                    <span :class="['absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', form.bestSeller ? 'translate-x-5' : 'translate-x-0.5']" />
                  </div>
                </label>

                <label class="flex items-center justify-between cursor-pointer">
                  <div>
                    <p class="text-xs font-black text-gray-700">Nouveau produit</p>
                    <p class="text-[10px] text-gray-400">Badge "Nouveau"</p>
                  </div>
                  <div
                    @click="form.isNew = !form.isNew"
                    :class="[
                      'w-10 h-5 rounded-full relative transition-colors cursor-pointer',
                      form.isNew ? 'bg-green-500' : 'bg-gray-200'
                    ]"
                  >
                    <span :class="['absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', form.isNew ? 'translate-x-5' : 'translate-x-0.5']" />
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Résumé -->
          <div class="bg-[#274a82] rounded-sm overflow-hidden shadow-md">
            <div class="px-5 py-4">
              <h2 class="text-sm font-black text-white mb-3 tracking-tight">Résumé</h2>
              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-white font-medium">Nom</span>
                  <span class="text-xs text-white font-black truncate max-w-[140px]">{{ form.name || '—' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-white font-medium">Prix</span>
                  <span class="text-xs text-white font-black">{{ form.price ? `${Number(form.price).toLocaleString()} FCFA` : '—' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-white font-medium">Stock</span>
                  <span class="text-xs text-white font-black">{{ form.stock || '—' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-white font-medium">Catégorie</span>
                  <span class="text-xs text-white font-black">{{ form.category || '—' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-white font-medium">Images</span>
                  <span class="text-xs text-white font-black">{{ previewImages.length }} photo(s)</span>
                </div>
                <div v-if="discountPercent > 0" class="flex justify-between items-center">
                  <span class="text-xs text-white font-medium">Remise</span>
                  <span class="text-xs text-[#e60012] font-black bg-white/10 px-1.5 py-0.5 rounded-sm">-{{ discountPercent }}%</span>
                </div>
              </div>
            </div>
            <div class="px-5 pb-5">
              <UButton block class="bg-[#e60012] hover:bg-[#ffffff] hover:text-[#274a82] font-black text-sm py-3 rounded-sm shadow-lg mt-3">
                <UIcon name="i-heroicons-check-circle" class="w-4 h-4 mr-1.5" />
                Publier le produit
              </UButton>
              <UButton block class="bg-white hover:bg-[#c4000f] text-[#274a82] hover:text-[#ffffff] font-black text-sm py-3 rounded-sm shadow-lg mt-3">
                Sauvegarder le brouillon
              </UButton>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const dragOver = ref(false)
const previewImages = ref([])
const fileInput = ref(null)

const form = ref({
  name: '',
  description: '',
  brand: '',
  sku: '',
  price: '',
  oldPrice: '',
  stock: '',
  category: '',
  subcategory: '',
  status: 'published',
  featured: false,
  bestSeller: false,
  isNew: true,
  specs: [
    { key: '', value: '' }
  ]
})

const categories = [
  { value: 'smartphones', label: 'Smartphones & Téléphones' },
  { value: 'informatique', label: 'Informatique' },
  { value: 'tv-audio', label: 'TV & Audio' },
  { value: 'electromenager', label: 'Électroménager' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'accessoires', label: 'Accessoires' },
]

const subcategories = [
  { value: 'android', label: 'Android' },
  { value: 'iphone', label: 'iPhone' },
  { value: 'tablette', label: 'Tablettes' },
  { value: 'laptop', label: 'Laptops' },
  { value: 'desktop', label: 'Ordinateurs de bureau' },
]

const statuses = [
  { value: 'published', label: 'Publié' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'archived', label: 'Archivé' },
  { value: 'out_of_stock', label: 'Rupture' },
]

const discountPercent = computed(() => {
  const p = Number(form.value.price)
  const op = Number(form.value.oldPrice)
  if (p > 0 && op > p) {
    return Math.round(((op - p) / op) * 100)
  }
  return 0
})

function addSpec() {
  form.value.specs.push({ key: '', value: '' })
}

function removeSpec(i) {
  form.value.specs.splice(i, 1)
}

function handleFileChange(e) {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (ev) => previewImages.value.push(ev.target.result)
    reader.readAsDataURL(file)
  })
}

function handleDrop(e) {
  dragOver.value = false
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (ev) => previewImages.value.push(ev.target.result)
    reader.readAsDataURL(file)
  })
}

function removeImage(i) {
  previewImages.value.splice(i, 1)
}
</script>