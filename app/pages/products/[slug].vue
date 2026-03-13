<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'

const route  = useRoute()
const config = useRuntimeConfig()
const API    = config.public.apiBase
const toast  = useToast()

// ─── Types ────────────────────────────────────────────────────────────────────
interface Spec    { key: string; value: string }
interface Product {
  id:             number
  name:           string
  slug:           string
  description:    string | null
  brand:          string | null
  sku:            string | null
  price:          number
  old_price:      number | null
  stock:          number
  status:         string
  is_featured:    boolean
  is_best_seller: boolean
  is_new:         boolean
  images:         string[]
  specs:          Spec[]
  discount_percent?: number
  category:       { id: number; name: string; slug: string } | null
  reviews_count:  number
}

interface Review {
  id:          number
  rating:      number
  comment:     string | null
  created_at:  string
  user:        { first_name: string; last_name: string } | null
}

useHead({
  title: 'BRC Market',
  titleTemplate: (t) => t ? `${t} - BRC Market` : 'BRC Market',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
})

// ─── Auth ─────────────────────────────────────────────────────────────────────
const { token, isLoggedIn } = useAuth()
const authHeaders = computed(() => ({ Authorization: `Bearer ${token.value}` }))

// ─── État produit ─────────────────────────────────────────────────────────────
const product         = ref<Product | null>(null)
const relatedProducts = ref<Product[]>([])
const loading         = ref(true)
const notFound        = ref(false)

const fetchProduct = async () => {
  loading.value  = true
  notFound.value = false
  try {
    const data = await $fetch<any>(`${API}/products/${route.params.slug}`)
    product.value = data
    useHead({ title: data.name })
    if (data.category?.slug) {
      try {
        const r = await $fetch<any>(`${API}/categories/${data.category.slug}/products`, { params: { limit: 6 } })
        relatedProducts.value = (r.data ?? r).filter((p: Product) => p.id !== data.id).slice(0, 6)
      } catch {}
    }
  } catch (err: any) {
    if (err.statusCode === 404 || err.response?.status === 404) notFound.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => { fetchProduct(); initWishlist() })
watch(() => route.params.slug, fetchProduct)

// ─── Galerie ──────────────────────────────────────────────────────────────────
const mainImage  = ref('')
const thumbnails = computed(() => product.value?.images ?? [])
watch(product, (p) => { if (p?.images?.[0]) mainImage.value = p.images[0] })
const selectImage = (img: string) => { mainImage.value = img }

// ─── Zoom ─────────────────────────────────────────────────────────────────────
const isZoomed = ref(false)
const zoomPos  = ref({ x: 0, y: 0 })
const handleMouseMove = (e: MouseEvent) => {
  const { left, top, width, height } = (e.currentTarget as HTMLElement).getBoundingClientRect()
  zoomPos.value = { x: ((e.clientX - left) / width) * 100, y: ((e.clientY - top) / height) * 100 }
}

// ─── Quantité ─────────────────────────────────────────────────────────────────
const quantity  = ref(1)
const activeTab = ref('description')

// ─── Panier / Favoris ─────────────────────────────────────────────────────────
const { addToCart: addToCartStore } = useCart()
const { isFav, toggleWishlist, initWishlist } = useWishlist()

// FIX : on passe quantity.value à addToCartStore
const addToCart = () => {
  if (!product.value) return
  addToCartStore({
    id:    product.value.id,
    slug:  product.value.slug,
    name:  product.value.name,
    price: product.value.price,
    image: product.value.images?.[0] ?? '/images/placeholder.jpg',
  }, quantity.value)
}

const addToCartItem = (item: Product) => {
  addToCartStore({
    id:    item.id,
    slug:  item.slug,
    name:  item.name,
    price: item.price,
    image: item.images?.[0] ?? '/images/placeholder.jpg',
  })
}

const addToWishlist = (id: number, name?: string) => toggleWishlist(id, name)

// ─── Avis ─────────────────────────────────────────────────────────────────────
const reviews        = ref<Review[]>([])
const loadingReviews = ref(false)
const reviewsLoaded  = ref(false)

const fetchReviews = async () => {
  if (!product.value || reviewsLoaded.value) return
  loadingReviews.value = true
  try {
    const data = await $fetch<any>(`${API}/products/${product.value.id}/reviews`)
    reviews.value       = data.data ?? data
    reviewsLoaded.value = true
  } catch {} finally {
    loadingReviews.value = false
  }
}

watch(activeTab, (tab) => { if (tab === 'reviews') fetchReviews() })

const avgRating   = computed(() => {
  if (!reviews.value.length) return 0
  return Math.round(reviews.value.reduce((s, r) => s + r.rating, 0) / reviews.value.length * 10) / 10
})
const reviewCount    = computed(() => product.value?.reviews_count ?? reviews.value.length)
// Seulement les approuvés, max 5 pour le marquee
const marqueeReviews = computed(() => reviews.value.slice(0, 5))

const reviewerName = (r: Review) => r.user ? `${r.user.first_name} ${r.user.last_name[0]}.` : 'Anonyme'
const reviewDate   = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

// ─── Modal avis ───────────────────────────────────────────────────────────────
const showReviewModal  = ref(false)
const hoverRating      = ref(0)
const reviewForm       = ref({ rating: 5, comment: '' })
const submittingReview = ref(false)
const ratingLabels     = ['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent']

const openReviewModal = () => {
  if (!isLoggedIn.value) {
    navigateTo('/login?redirect=' + route.fullPath)
    return
  }
  reviewForm.value  = { rating: 5, comment: '' }
  hoverRating.value = 0
  showReviewModal.value = true
}

const submitReview = async () => {
  if (!product.value || !reviewForm.value.comment.trim()) return
  submittingReview.value = true
  try {
    await axios.post(
      `${API}/products/${product.value.id}/reviews`,
      { rating: reviewForm.value.rating, comment: reviewForm.value.comment },
      { headers: authHeaders.value }
    )
    toast.add({ title: 'Avis envoyé !', description: 'Merci ! Votre avis est en attente de validation.', color: 'success', icon: 'i-heroicons-check-circle' })
    showReviewModal.value = false
    reviewsLoaded.value   = false
    fetchReviews()
  } catch (e: any) {
    toast.add({ title: 'Erreur', description: e?.response?.data?.message ?? "Impossible d'envoyer votre avis.", color: 'error', icon: 'i-heroicons-x-circle' })
  } finally {
    submittingReview.value = false
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice = (p: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 })
    .format(p).replace('XAF', 'FCFA')
</script>

<template>
  <UContainer class="py-4 sm:py-8 bg-white">

    <!-- LOADING -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-12 h-12 border-4 border-[#274a82] border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm text-gray-400 font-semibold">Chargement du produit...</p>
    </div>

    <!-- NOT FOUND -->
    <div v-else-if="notFound" class="flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <UIcon name="i-heroicons-face-frown" class="w-8 h-8 text-gray-300" />
      </div>
      <h2 class="text-xl font-black text-gray-800">Produit introuvable</h2>
      <p class="text-sm text-gray-400">Ce produit n'existe pas ou a été supprimé.</p>
      <NuxtLink to="/" class="mt-2 px-6 py-2.5 bg-[#274a82] text-white text-sm font-black rounded-lg hover:bg-[#e60012] transition">
        Retour à la boutique
      </NuxtLink>
    </div>

    <!-- PRODUIT -->
    <template v-else-if="product">

      <!-- BREADCRUMB -->
      <nav class="flex items-center gap-2 text-[11px] sm:text-[12px] font-bold tracking-wider text-gray-400 mb-4 sm:mb-6 border-b border-gray-50 pb-3 overflow-x-auto whitespace-nowrap">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors flex-shrink-0">Boutique</NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 flex-shrink-0" />
        <NuxtLink v-if="product.category" :to="`/categorie/${product.category.slug}`"
          class="text-[#274a82] hover:text-[#e60012] transition-colors flex-shrink-0">
          {{ product.category.name }}
        </NuxtLink>
        <span v-else class="text-[#274a82] flex-shrink-0">Produit</span>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 flex-shrink-0" />
        <span class="text-gray-900 truncate max-w-[140px] sm:max-w-[200px]">{{ product.name }}</span>
      </nav>

      <!-- TITRE + BADGES -->
      <div class="mb-5 sm:mb-8 flex items-start gap-3 flex-wrap">
        <h1 class="text-lg sm:text-2xl font-black text-gray-900 leading-tight uppercase tracking-tight flex-1">
          {{ product.name }}
        </h1>
        <div class="flex gap-2 flex-wrap mt-1">
          <span v-if="product.is_new" class="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">Nouveau</span>
          <span v-if="product.is_best_seller" class="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#e60012]/10 text-[#e60012] border border-[#e60012]/20">Best Seller</span>
          <span v-if="product.is_featured" class="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#274a82]/10 text-[#274a82] border border-[#274a82]/20">En vedette</span>
        </div>
      </div>

      <!-- ZONE PRODUIT -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-8 sm:mb-12">

        <!-- GALERIE -->
        <div class="lg:col-span-6 flex gap-2 sm:gap-4">
          <div v-if="thumbnails.length > 1"
            class="hidden sm:flex flex-col gap-2 py-1 overflow-y-auto max-h-[420px] custom-scrollbar flex-shrink-0">
            <button v-for="(img, i) in thumbnails" :key="i" @click="selectImage(img)"
              class="w-14 h-14 border-2 rounded-sm p-0.5 transition-all flex-shrink-0"
              :class="mainImage === img ? 'border-[#274a82] ring-1 ring-[#274a82]' : 'border-gray-200 hover:border-gray-300'">
              <img :src="img" class="w-full h-full object-cover rounded-sm" :alt="`Image ${i+1}`" />
            </button>
          </div>
          <div class="flex-1 flex flex-col gap-2">
            <div class="relative border border-gray-100 rounded-sm overflow-hidden bg-white h-[280px] sm:h-[420px]"
              @mouseenter="isZoomed = true" @mouseleave="isZoomed = false" @mousemove="handleMouseMove"
              :class="isZoomed ? 'cursor-none' : 'cursor-zoom-in'">
              <div v-if="product.discount_percent && product.discount_percent > 0"
                class="absolute top-3 right-3 bg-[#e60012] text-white text-[10px] sm:text-[11px] font-black px-2 sm:px-3 py-1 rounded-sm shadow-lg z-30">
                -{{ product.discount_percent }}% BRC MARKET
              </div>
              <div v-if="!mainImage" class="w-full h-full flex items-center justify-center bg-gray-50">
                <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-200" />
              </div>
              <img v-else :src="mainImage" :alt="product.name"
                class="w-full h-full object-contain p-4 sm:p-10 transition-transform duration-200"
                :style="isZoomed ? { transform: 'scale(2.5)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}" />
              <div v-if="isZoomed && mainImage"
                class="absolute pointer-events-none border-2 border-[#274a82] rounded-full w-20 h-20 sm:w-24 sm:h-24 shadow-2xl z-40 bg-white/10"
                :style="{ left: `calc(${zoomPos.x}% - 40px)`, top: `calc(${zoomPos.y}% - 40px)` }" />
            </div>
            <div v-if="thumbnails.length > 1" class="flex sm:hidden gap-2 overflow-x-auto pb-1">
              <button v-for="(img, i) in thumbnails" :key="i" @click="selectImage(img)"
                class="w-14 h-14 border-2 rounded-sm p-0.5 transition-all flex-shrink-0"
                :class="mainImage === img ? 'border-[#274a82]' : 'border-gray-200'">
                <img :src="img" class="w-full h-full object-cover rounded-sm" :alt="`Image ${i+1}`" />
              </button>
            </div>
          </div>
        </div>

        <!-- INFOS -->
        <div class="lg:col-span-6 space-y-4 sm:space-y-6">

          <!-- Prix -->
          <div class="flex items-center gap-3 flex-wrap">
            <span class="text-2xl sm:text-3xl font-black text-[#e60012]">{{ formatPrice(product.price) }}</span>
            <span v-if="product.old_price" class="text-sm text-gray-400 line-through">{{ formatPrice(product.old_price) }}</span>
            <span v-if="product.discount_percent && product.discount_percent > 0"
              class="bg-[#e60012]/10 text-[#e60012] text-[11px] font-black px-2 py-0.5 rounded-sm">
              -{{ product.discount_percent }}%
            </span>
          </div>

          <!-- Note rapide (cliquable vers onglet avis) -->
          <button v-if="reviewCount > 0" @click="activeTab = 'reviews'"
            class="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div class="flex gap-0.5">
              <UIcon v-for="j in 5" :key="j"
                :name="j <= Math.round(avgRating) ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                class="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <span class="text-xs text-gray-500 font-bold underline underline-offset-2">{{ reviewCount }} avis</span>
          </button>

          <!-- Disponibilité -->
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="product.stock > 0 ? 'bg-green-500' : 'bg-red-400'"></span>
            <span class="text-[12px] font-bold" :class="product.stock > 0 ? 'text-green-600' : 'text-red-500'">
              {{ product.stock > 5 ? 'En stock' : product.stock > 0 ? `Plus que ${product.stock} en stock` : 'Rupture de stock' }}
            </span>
            <span v-if="product.sku" class="ml-auto text-[11px] text-gray-400 font-mono">SKU: {{ product.sku }}</span>
          </div>

          <!-- Specs -->
          <div v-if="product.specs?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 py-4 border-y border-gray-100">
            <div v-for="spec in product.specs" :key="spec.key" class="flex justify-between items-center border-b border-gray-50 pb-1.5">
              <span class="text-[11px] sm:text-[12px] text-gray-400 font-bold">{{ spec.key }}</span>
              <span class="text-[12px] sm:text-[13px] text-gray-900 font-black text-right ml-2">{{ spec.value }}</span>
            </div>
          </div>
          <div v-else-if="product.brand" class="py-3 border-y border-gray-100">
            <div class="flex justify-between items-center">
              <span class="text-[12px] text-gray-400 font-bold">Marque</span>
              <span class="text-[13px] text-gray-900 font-black">{{ product.brand }}</span>
            </div>
          </div>

          <!-- ── QUANTITÉ + PANIER ── -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center border border-gray-200 rounded-sm bg-gray-50 overflow-hidden flex-shrink-0">
              <button
                @click="quantity > 1 ? quantity-- : null"
                :disabled="quantity <= 1"
                class="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-200 font-bold transition-colors text-lg select-none disabled:opacity-30">
                −
              </button>
              <span class="px-3 sm:px-4 py-2.5 sm:py-3 font-black text-[#274a82] bg-white min-w-[44px] text-center border-x border-gray-200 text-base">
                {{ quantity }}
              </span>
              <button
                @click="product.stock > 0 && quantity < product.stock ? quantity++ : null"
                :disabled="product.stock === 0 || quantity >= product.stock"
                class="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-200 font-bold transition-colors text-lg select-none disabled:opacity-30">
                +
              </button>
            </div>

            <UButton :disabled="product.stock === 0" @click="addToCart()" block
              class="flex-1 bg-[#274a82] hover:bg-[#e60012] text-white font-black py-3 tracking-widest shadow-md transition-all rounded-sm text-sm sm:text-base min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed">
              <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4 mr-2" />
              {{ product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier' }}
            </UButton>

            <button @click="addToWishlist(product.id, product.name)"
              class="w-11 h-11 border rounded-sm flex items-center justify-center transition-colors flex-shrink-0"
              :class="isFav(product.id) ? 'border-[#e60012] bg-red-50 text-[#e60012]' : 'border-gray-200 text-gray-400 hover:border-[#e60012] hover:text-[#e60012]'">
              <UIcon :name="isFav(product.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-5 h-5" />
            </button>
          </div>

          <!-- Livraison -->
          <div class="flex flex-col gap-2 p-3 bg-gray-50 rounded-sm border border-gray-100">
            <div class="flex items-center gap-2.5">
              <UIcon name="i-heroicons-truck" class="w-4 h-4 text-[#274a82] flex-shrink-0" />
              <span class="text-[12px] font-semibold text-gray-700">Livraison disponible à Yaoundé & Douala</span>
            </div>
            <div class="flex items-center gap-2.5">
              <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-green-500 flex-shrink-0" />
              <span class="text-[12px] font-semibold text-gray-700">Garantie 12 mois — SAV BRC Market</span>
            </div>
            <div class="flex items-center gap-2.5">
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span class="text-[12px] font-semibold text-gray-700">Retour sous 7 jours</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ONGLETS -->
      <div class="mb-8 sm:mb-10">
        <div class="flex gap-6 sm:gap-10 border-b border-gray-100 mb-5 sm:mb-6">
          <button @click="activeTab = 'description'"
            class="pb-2.5 text-[13px] sm:text-[15px] font-black transition-all border-b-2"
            :class="activeTab === 'description' ? 'border-[#e60012] text-black' : 'border-transparent text-gray-400 hover:text-gray-600'">
            Description
          </button>
          <button v-if="product.specs?.length" @click="activeTab = 'specs'"
            class="pb-2.5 text-[13px] sm:text-[15px] font-black transition-all border-b-2"
            :class="activeTab === 'specs' ? 'border-[#e60012] text-black' : 'border-transparent text-gray-400 hover:text-gray-600'">
            Fiche technique
          </button>
          <button @click="activeTab = 'reviews'"
            class="pb-2.5 text-[13px] sm:text-[15px] font-black transition-all border-b-2 flex items-center gap-2"
            :class="activeTab === 'reviews' ? 'border-[#e60012] text-black' : 'border-transparent text-gray-400 hover:text-gray-600'">
            Avis
            <span class="bg-gray-100 text-gray-500 text-[10px] font-black px-1.5 py-0.5 rounded-full">{{ reviewCount }}</span>
          </button>
        </div>

        <!-- Description -->
        <div v-if="activeTab === 'description'">
          <p v-if="product.description" class="text-[13px] sm:text-[14px] leading-[1.8] text-gray-700">
            {{ product.description }}
          </p>
          <p v-else class="text-sm text-gray-400 italic">Aucune description disponible pour ce produit.</p>
        </div>

        <!-- Fiche technique -->
        <div v-else-if="activeTab === 'specs'" class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <tbody>
              <tr v-for="spec in product.specs" :key="spec.key"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="py-3 px-4 font-bold text-gray-500 text-[12px] w-1/3 bg-gray-50/50">{{ spec.key }}</td>
                <td class="py-3 px-4 font-semibold text-gray-800 text-[13px]">{{ spec.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ── AVIS ── -->
        <div v-else>
          <!-- Header note + bouton -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <template v-if="reviews.length">
                <span class="text-3xl font-black text-gray-900">{{ avgRating }}</span>
                <div>
                  <div class="flex gap-0.5 mb-0.5">
                    <UIcon v-for="j in 5" :key="j"
                      :name="j <= Math.round(avgRating) ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                      class="w-4 h-4 text-yellow-400" />
                  </div>
                  <span class="text-xs text-gray-400">{{ reviews.length }} avis clients</span>
                </div>
              </template>
              <span v-else-if="!loadingReviews" class="text-sm text-gray-400">Aucun avis pour l'instant</span>
            </div>
            <button @click="openReviewModal"
              class="flex items-center gap-2 px-4 py-2.5 bg-[#274a82] hover:bg-[#e60012] text-white text-xs font-black rounded-xl transition-all shadow-sm">
              <UIcon name="i-heroicons-pencil-square" class="w-3.5 h-3.5" />
              Donner mon avis
            </button>
          </div>

          <!-- Chargement -->
          <div v-if="loadingReviews" class="flex justify-center py-10">
            <div class="w-8 h-8 border-4 border-[#274a82] border-t-transparent rounded-full animate-spin"></div>
          </div>

          <!-- Vide -->
          <div v-else-if="!reviews.length" class="flex flex-col items-center py-12 gap-3 text-center">
            <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-7 h-7 text-gray-300" />
            </div>
            <p class="text-sm text-gray-400 font-medium">Soyez le premier à donner votre avis !</p>
            <button @click="openReviewModal"
              class="mt-1 px-5 py-2.5 bg-[#274a82] text-white text-xs font-black rounded-xl hover:bg-[#e60012] transition-all">
              Écrire un avis
            </button>
          </div>

          <!-- Desktop : marquee animé (max 5 avis) -->
          <div v-else class="space-y-0">
            <div class="hidden sm:block relative overflow-hidden py-2">
              <div class="flex gap-5 marquee-container">
                <div class="flex gap-5 animate-marquee-scroll">
                  <div
                    v-for="(review, i) in [...marqueeReviews, ...marqueeReviews]"
                    :key="`m-${i}`"
                    class="min-w-[300px] max-w-[300px] p-4 bg-slate-50 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 flex-shrink-0"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex gap-0.5">
                        <UIcon v-for="j in 5" :key="j"
                          :name="j <= review.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                          class="w-3.5 h-3.5 text-yellow-400" />
                      </div>
                      <span class="text-[10px] text-gray-400">{{ reviewDate(review.created_at) }}</span>
                    </div>
                    <p v-if="review.comment" class="text-[13px] text-gray-600 leading-relaxed italic flex-1 line-clamp-3">
                      "{{ review.comment }}"
                    </p>
                    <div class="flex items-center gap-2 pt-2 border-t border-gray-100 mt-auto">
                      <div class="w-7 h-7 rounded-full bg-[#274a82] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                        {{ review.user?.first_name?.[0] ?? "?" }}{{ review.user?.last_name?.[0] ?? "" }}
                      </div>
                      <span class="text-xs font-bold text-gray-700">{{ reviewerName(review) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mobile : liste simple -->
            <div class="sm:hidden flex flex-col gap-3">
              <div v-for="review in marqueeReviews" :key="review.id"
                class="p-4 bg-slate-50 rounded-xl border border-gray-100 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <div class="flex gap-0.5">
                    <UIcon v-for="j in 5" :key="j"
                      :name="j <= review.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                      class="w-3.5 h-3.5 text-yellow-400" />
                  </div>
                  <span class="text-[10px] text-gray-400">{{ reviewDate(review.created_at) }}</span>
                </div>
                <p v-if="review.comment" class="text-[13px] text-gray-600 leading-relaxed italic">
                  "{{ review.comment }}"
                </p>
                <div class="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <div class="w-7 h-7 rounded-full bg-[#274a82] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                    {{ review.user?.first_name?.[0] ?? "?" }}{{ review.user?.last_name?.[0] ?? "" }}
                  </div>
                  <span class="text-xs font-bold text-gray-700">{{ reviewerName(review) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PRODUITS SIMILAIRES -->
      <section v-if="relatedProducts.length">
        <div class="flex items-center justify-between border-b border-gray-200 mb-5 sm:mb-6">
          <h2 class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
            Produits Similaires
          </h2>
          <NuxtLink v-if="product.category" :to="`/categorie/${product.category.slug}`"
            class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group">
            Voir plus <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
          </NuxtLink>
        </div>

        <div class="hidden sm:block">
          <UCarousel v-slot="{ item }" :items="relatedProducts" :autoplay="{ delay: 2500 }"
            :ui="{ item: 'basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/5 px-2', container: 'py-4' }"
            indicators arrows class="rounded-sm">
            <NuxtLink :to="`/produit/${item.slug}`"
              class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
              <div class="relative h-48 w-full overflow-hidden flex items-center justify-center bg-[#fcfcfc]">
                <div class="absolute right-[-50px] group-hover:right-3 top-3 flex flex-col gap-2 z-30 transition-all duration-300">
                  <button @click.prevent.stop="addToWishlist(item.id, item.name)"
                    class="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
                    :class="isFav(item.id) ? 'bg-[#e60012] text-white' : 'text-gray-400 hover:bg-[#e60012] hover:text-white'">
                    <UIcon :name="isFav(item.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" class="w-4 h-4" />
                  </button>
                </div>
                <img v-if="item.images?.[0]" :src="item.images[0]" :alt="item.name" class="w-full h-full object-contain p-4" />
                <UIcon v-else name="i-heroicons-sparkles" class="w-12 h-12 opacity-10" />
                <div class="absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full transition-all duration-300 z-20">
                  <UButton @click.prevent.stop="addToCartItem(item)" icon="i-heroicons-shopping-cart" block
                    class="bg-[#274a82] hover:bg-[#e60012] rounded-none font-bold text-[12px] py-2.5">
                    Ajouter au Panier
                  </UButton>
                </div>
              </div>
              <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
                <h3 class="text-[13px] text-gray-600 font-medium mb-2 line-clamp-2 h-10 leading-snug">{{ item.name }}</h3>
                <div class="mt-auto">
                  <div class="text-[18px] font-black text-gray-900 mb-0.5">{{ item.price.toLocaleString() }} FCFA</div>
                  <div class="flex items-center justify-between">
                    <span v-if="item.old_price" class="text-[12px] text-gray-400 line-through">{{ item.old_price.toLocaleString() }} FCFA</span>
                    <div v-if="item.discount_percent && item.discount_percent > 0"
                      class="bg-[#e60012] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm ml-auto">
                      -{{ item.discount_percent }}%
                    </div>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </UCarousel>
        </div>

        <div class="sm:hidden grid grid-cols-2 gap-3">
          <NuxtLink v-for="item in relatedProducts" :key="item.id" :to="`/produit/${item.slug}`"
            class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl">
            <div class="relative h-36 w-full overflow-hidden bg-[#fcfcfc]">
              <div v-if="item.discount_percent && item.discount_percent > 0"
                class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                -{{ item.discount_percent }}%
              </div>
              <img v-if="item.images?.[0]" :src="item.images[0]" :alt="item.name" class="w-full h-full object-contain p-2" />
              <UIcon v-else name="i-heroicons-sparkles" class="absolute inset-0 m-auto w-10 h-10 opacity-10" />
            </div>
            <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
              <h3 class="text-[11px] text-gray-600 font-medium line-clamp-2 h-[34px] leading-snug mb-2">{{ item.name }}</h3>
              <div class="mt-auto flex items-center justify-between gap-1">
                <div>
                  <div class="text-sm font-black text-gray-900 leading-tight">{{ item.price.toLocaleString() }} <span class="text-[8px]">FCFA</span></div>
                  <span v-if="item.old_price" class="text-[9px] text-gray-400 line-through">{{ item.old_price.toLocaleString() }} FCFA</span>
                </div>
                <button @click.prevent.stop="addToCartItem(item)"
                  class="flex-shrink-0 w-7 h-7 rounded-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm">
                  <UIcon name="i-heroicons-shopping-cart" class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>

    </template>
  </UContainer>

  <!-- ══ MODAL AVIS ══════════════════════════════════════════════════════════ -->
  <UModal v-model:open="showReviewModal">
    <template #content>
      <div class="overflow-hidden rounded-2xl bg-white">

        <!-- Header -->
        <div class="px-6 py-5 bg-[#274a82] flex items-center justify-between">
          <div>
            <p class="text-xs text-white/50 font-bold uppercase tracking-widest">Votre avis</p>
            <h2 class="text-base font-black text-white mt-0.5 line-clamp-1 max-w-[220px]">{{ product?.name }}</h2>
          </div>
          <button @click="showReviewModal = false"
            class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all flex-shrink-0">
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4 text-white" />
          </button>
        </div>

        <div class="px-6 py-5 space-y-5">

          <!-- Étoiles -->
          <div>
            <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Votre note</p>
            <div class="flex items-center gap-1">
              <button v-for="star in 5" :key="star"
                @click="reviewForm.rating = star"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
                class="p-0.5 transition-transform hover:scale-110 focus:outline-none">
                <UIcon
                  :name="star <= (hoverRating || reviewForm.rating) ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                  class="w-9 h-9 transition-colors"
                  :class="star <= (hoverRating || reviewForm.rating) ? 'text-yellow-400' : 'text-gray-200'" />
              </button>
              <span class="ml-3 text-sm font-black text-gray-700 min-w-[80px]">
                {{ ratingLabels[hoverRating || reviewForm.rating] }}
              </span>
            </div>
          </div>

          <!-- Commentaire -->
          <div>
            <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Commentaire</p>
            <textarea v-model="reviewForm.comment" :maxlength="500" rows="4"
              placeholder="Partagez votre expérience avec ce produit..."
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-2 focus:ring-[#274a82]/10 transition-all resize-none">
            </textarea>
            <div class="flex justify-between mt-1">
              <span class="text-[10px]" :class="reviewForm.comment.trim() ? 'text-green-500' : 'text-red-400'">
                {{ reviewForm.comment.trim() ? '✓ Prêt à publier' : 'Le commentaire est requis' }}
              </span>
              <span class="text-[10px] text-gray-400">{{ reviewForm.comment.length }} / 500</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-1">
            <button @click="showReviewModal = false"
              class="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">
              Annuler
            </button>
            <button @click="submitReview"
              :disabled="!reviewForm.comment.trim() || submittingReview"
              class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#274a82] hover:bg-[#e60012] text-white font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <UIcon :name="submittingReview ? 'i-heroicons-arrow-path' : 'i-heroicons-paper-airplane'"
                class="w-4 h-4" :class="submittingReview ? 'animate-spin' : ''" />
              {{ submittingReview ? 'Envoi...' : "Publier l'avis" }}
            </button>
          </div>

        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #274a82; border-radius: 10px; }
.cursor-zoom-in { cursor: crosshair; }

.animate-marquee-scroll {
  display: flex;
  animation: scroll-marquee 30s linear infinite;
}
.marquee-container:hover .animate-marquee-scroll {
  animation-play-state: paused;
}
@keyframes scroll-marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>