<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'

const route  = useRoute()
const config = useRuntimeConfig()
const API    = config.public.apiBase
const toast  = useToast()
const { t }  = useI18n()

// ─── Types ────────────────────────────────────────────────────────────────────
interface Spec    { key: string; value: string }
interface Product {
  id:              number
  name:            string
  slug:            string
  description:     string | null
  brand:           string | null
  sku:             string | null
  price:           number
  old_price:       number | null
  stock:           number
  status:          string
  is_featured:     boolean
  is_best_seller:  boolean
  is_new:          boolean
  images:          string[]
  specs:           Spec[]
  discount_percent?: number
  category:        { id: number; name: string; slug: string } | null
  reviews_count:   number
}

interface Review {
  id:         number
  rating:     number
  comment:    string | null
  created_at: string
  user:       { first_name: string; last_name: string } | null
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
const { token, isLoggedIn } = useAuth()
const authHeaders = computed(() => ({ Authorization: `Bearer ${token.value}` }))

// ─── État produit ─────────────────────────────────────────────────────────────
const slug = computed(() => route.params.slug as string)

const {
  data:    productData,
  error:   productError,
  pending: loading,
  refresh: refreshProduct,
} = await useAsyncData(
  `product-${slug.value}`,
  () => $fetch<Product>(`${API}/products/${slug.value}`),
  {
    server: true,
    lazy:   false,
  }
)

const product  = computed(() => productData.value ?? null)
const notFound = computed(() => !!productError.value && !loading.value)

// ─── Produits similaires ───────────────────────────────────────────────────────
const relatedProducts = ref<Product[]>([])

// ─── Avis ─────────────────────────────────────────────────────────────────────
const reviews   = ref<Review[]>([])
const avgRating = computed(() => {
  if (!reviews.value.length) return 0
  return Math.round(reviews.value.reduce((s, r) => s + r.rating, 0) / reviews.value.length * 10) / 10
})

// ─── Galerie ──────────────────────────────────────────────────────────────────
const mainImage   = ref(productData.value?.images?.[0] ?? '')
const thumbnails  = computed(() => product.value?.images ?? [])
const selectImage = (img: string) => { mainImage.value = img }

// ─── Produits similaires : chargement ─────────────────────────────────────────
const loadRelatedProducts = async (categorySlug: string, currentId: number) => {
  try {
    const r = await $fetch<any>(`${API}/categories/${categorySlug}/products`, {
      params: { limit: 6 },
    })
    relatedProducts.value = (r.data ?? r)
      .filter((p: Product) => p.id !== currentId)
      .slice(0, 6)
  } catch {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice = (p: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 })
    .format(p).replace('XAF', 'FCFA')

// ─── SEO ──────────────────────────────────────────────────────────────────────

/**
 * ✅ NOUVEAU — Transforme une URL Cloudinary brute en URL optimisée SEO.
 * og:image / twitter:image  → 1200×630 (format bannière réseaux sociaux + Google)
 * JSON-LD image             → 800×800  (format carré Google Images / rich results)
 */
const toOgImage = (url: string): string => {
  if (!url) return 'https://brcmarket.cm/images/og-image.jpg'
  if (url.includes('/upload/w_')) return url
  return url.replace('/upload/', '/upload/w_1200,h_630,c_pad,f_jpg,q_85/')
}

const toJsonLdImage = (url: string): string => {
  if (!url) return ''
  if (url.includes('/upload/w_')) return url
  return url.replace('/upload/', '/upload/w_800,h_800,c_pad,bg_white,f_jpg,q_85/')
}

/**
 * Construit le JSON-LD Schema.org Product.
 */
const buildJsonLd = (p: Product, currentReviews: Review[] = [], currentAvg = 0) => {
  const url              = `https://brcmarket.cm/products/${p.slug}`
  const availability     = p.stock > 0
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock'
  const priceValidUntil  = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]

  return {
    '@context': 'https://schema.org',
    '@type':    'Product',
    name:        p.name,
    description: p.description ?? `${p.name} disponible sur BRC Market`,
    // ✅ MODIFIÉ — images transformées 800×800 pour Google Images
    image:       p.images?.map(toJsonLdImage) ?? [],
    url,
    ...(p.sku   ? { sku: p.sku }                                  : {}),
    ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } }  : {}),
    ...(p.specs?.length ? {
      additionalProperty: p.specs.map(s => ({
        '@type': 'PropertyValue',
        name:    s.key,
        value:   s.value,
      })),
    } : {}),
    offers: {
      '@type':         'Offer',
      priceCurrency:   'XAF',
      price:            p.price,
      priceValidUntil,
      availability,
      itemCondition:   'https://schema.org/NewCondition',
      url,
      seller:          { '@type': 'Organization', name: 'BRC Market' },
      shippingDetails: {
        '@type':              'OfferShippingDetails',
        shippingRate: {
          '@type':   'MonetaryAmount',
          value:     0,
          currency:  'XAF',
        },
        shippingDestination: {
          '@type':           'DefinedRegion',
          addressCountry:    'CM',
        },
        deliveryTime: {
          '@type':         'ShippingDeliveryTime',
          handlingTime: {
            '@type':    'QuantitativeValue',
            minValue:   0,
            maxValue:   1,
            unitCode:   'DAY',
          },
          transitTime: {
            '@type':    'QuantitativeValue',
            minValue:   1,
            maxValue:   3,
            unitCode:   'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type':               'MerchantReturnPolicy',
        applicableCountry:     'CM',
        returnPolicyCategory:  'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays:    7,
        returnMethod:          'https://schema.org/ReturnInStore',
        returnFees:            'https://schema.org/FreeReturn',
      },
      ...(p.old_price && p.old_price > p.price ? {
        priceSpecification: [
          {
            '@type':        'PriceSpecification',
            price:           p.price,
            priceCurrency:  'XAF',
            priceType:      'https://schema.org/SalePrice',
          },
          {
            '@type':        'PriceSpecification',
            price:           p.old_price,
            priceCurrency:  'XAF',
            priceType:      'https://schema.org/ListPrice',
          },
        ],
      } : {}),
    },
    ...((currentReviews.length > 0 || p.reviews_count > 0) ? {
      aggregateRating: {
        '@type':      'AggregateRating',
        ratingValue:   currentAvg || 5,
        reviewCount:   p.reviews_count || currentReviews.length,
        bestRating:    5,
        worstRating:   1,
      },
    } : {}),
    ...(currentReviews.length > 0 ? {
      review: currentReviews.slice(0, 5).map(r => ({
        '@type':      'Review',
        reviewRating: {
          '@type':      'Rating',
          ratingValue:  r.rating,
          bestRating:   5,
          worstRating:  1,
        },
        author: {
          '@type': 'Person',
          name:    r.user ? `${r.user.first_name} ${r.user.last_name[0]}.` : 'Anonyme',
        },
        datePublished: r.created_at.split('T')[0],
        ...(r.comment ? { reviewBody: r.comment } : {}),
      })),
    } : {}),
  }
}

/**
 * Description stable pour éviter que Google la remplace par son propre extrait.
 */
const buildDescription = (p: Product): string => {
  const brand    = p.brand ? ` ${p.brand}` : ''
  const category = p.category ? ` – ${p.category.name}` : ''

  // Construit "RAM : 16 Go DDR4 | Stockage : 256 Go SSD | ..." proprement
  const specsText = p.specs?.length
    ? p.specs
        .map(s => `${s.key.trim()} : ${s.value.trim()}`)
        .join(' | ')
    : ''

  const base = p.description
    ? p.description.slice(0, 100)
    : `${p.name} au meilleur prix au Cameroun`

  const parts = [`${p.name}${brand}${category}`, specsText, base].filter(Boolean)

  return parts.join('. ').slice(0, 155)
}

const setSeo = (p: Product) => {
  const title       = `${p.name}${p.brand ? ' – ' + p.brand : ''} | BRC Market Cameroun`
  const description = buildDescription(p)
  const url         = `https://brcmarket.cm/products/${p.slug}`

  // ✅ MODIFIÉ — og:image transformée 1200×630 pour Google / réseaux sociaux
  const image = toOgImage(p.images?.[0] ?? '')

  useSeoMeta({
    title,
    ogTitle:            title,
    description,
    ogDescription:      description,
    ogImage:            image,
    ogUrl:              url,
    ogType:             'product',
    twitterCard:        'summary_large_image',
    twitterTitle:       title,
    twitterDescription: description,
    twitterImage:       image,
    ogPriceAmount:      String(p.price),
    ogPriceCurrency:    'XAF',
    robots:             'index, follow',
  })

  const jsonLd = buildJsonLd(p, reviews.value, avgRating.value)

  useHead({
    link: [
      { rel: 'canonical', href: url },
      // ✅ MODIFIÉ — preload LCP avec l'image transformée
      ...(p.images?.[0] ? [{
        rel:           'preload',
        as:            'image',
        href:          toOgImage(p.images[0]),
        // @ts-ignore
        fetchpriority: 'high',
      }] : []),
    ],
    script: [{
      key:       'product-jsonld',
      type:      'application/ld+json',
      innerHTML: JSON.stringify(jsonLd),
    }],
  })
}

// ─── Injection SEO côté SERVEUR ───────────────────────────────────────────────
if (import.meta.server && productData.value) {
  setSeo(productData.value)
}

// ─── Erreur produit ────────────────────────────────────────────────────────────
if (productError.value) {
  useSeoMeta({ robots: 'noindex, nofollow' })
  throw createError({ statusCode: 404, statusMessage: 'Produit introuvable', fatal: true })
}

// ─── Watchers ─────────────────────────────────────────────────────────────────
watch(productData, (p) => {
  if (!p) return
  setSeo(p)
  mainImage.value = p.images?.[0] ?? ''
  if (p.category?.slug) {
    loadRelatedProducts(p.category.slug, p.id)
  }
}, { immediate: false })

watch(productError, (e) => {
  if (e) useSeoMeta({ robots: 'noindex, nofollow' })
}, { immediate: false })

// Chargement initial produits similaires
if (productData.value?.category?.slug) {
  await loadRelatedProducts(productData.value.category.slug, productData.value.id)
}

// Rechargement sur changement de slug (navigation client)
watch(slug, async () => {
  reviews.value         = []
  reviewsLoaded.value   = false
  relatedProducts.value = []
  mainImage.value       = ''
  await refreshProduct()
})

onMounted(() => {
  initWishlist()
  if (productData.value) setSeo(productData.value)
})

// ─── Zoom desktop ─────────────────────────────────────────────────────────────
const isZoomed = ref(false)
const zoomPos  = ref({ x: 0, y: 0 })
const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.innerWidth < 640
  window.addEventListener('resize', () => { isMobile.value = window.innerWidth < 640 })
})

const handleMouseMove = (e: MouseEvent) => {
  if (isMobile.value) return
  const { left, top, width, height } = (e.currentTarget as HTMLElement).getBoundingClientRect()
  zoomPos.value = {
    x: ((e.clientX - left) / width) * 100,
    y: ((e.clientY - top) / height) * 100,
  }
}

// ─── Specs visibles ───────────────────────────────────────────────────────────
const hasHiddenSpecs   = computed(() => !isMobile.value && (product.value?.specs?.length ?? 0) > 12)
const hiddenSpecsCount = computed(() => isMobile.value ? 0 : Math.max(0, (product.value?.specs?.length ?? 0) - 12))

// ─── Quantité / Onglets ───────────────────────────────────────────────────────
const quantity  = ref(1)
const activeTab = ref('description')

// ─── Panier / Favoris ─────────────────────────────────────────────────────────
const { addToCart: addToCartStore } = useCart()
const { isFav, toggleWishlist, initWishlist } = useWishlist()

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
const loadingReviews = ref(false)
const reviewsLoaded  = ref(false)

const fetchReviews = async () => {
  if (!product.value || reviewsLoaded.value) return
  loadingReviews.value = true
  try {
    const data = await $fetch<any>(`${API}/products/${product.value.id}/reviews`)
    reviews.value       = data.data ?? data
    reviewsLoaded.value = true
    if (import.meta.client && product.value) setSeo(product.value)
  } catch {} finally {
    loadingReviews.value = false
  }
}

watch(activeTab, (tab) => { if (tab === 'reviews') fetchReviews() })

const reviewCount    = computed(() => product.value?.reviews_count ?? reviews.value.length)
const marqueeReviews = computed(() => reviews.value.slice(0, 5))

const reviewerName = (r: Review) =>
  r.user ? `${r.user.first_name} ${r.user.last_name[0]}.` : 'Anonyme'
const reviewDate   = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

// ─── Modal avis ───────────────────────────────────────────────────────────────
const showReviewModal  = ref(false)
const hoverRating      = ref(0)
const reviewForm       = ref({ rating: 5, comment: '' })
const submittingReview = ref(false)

const ratingLabel = computed(() =>
  t(`product.rating_label_${hoverRating.value || reviewForm.value.rating}`)
)

const openReviewModal = () => {
  if (!isLoggedIn.value) {
    navigateTo('/login?redirect=' + route.fullPath)
    return
  }
  reviewForm.value      = { rating: 5, comment: '' }
  hoverRating.value     = 0
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
    toast.add({
      title:       t('product.toast_review_success_title'),
      description: t('product.toast_review_success_desc'),
      color:       'success',
      icon:        'i-heroicons-check-circle',
    })
    showReviewModal.value = false
    reviewsLoaded.value   = false
    fetchReviews()
  } catch (e: any) {
    toast.add({
      title:       t('product.toast_review_error_title'),
      description: e?.response?.data?.message ?? t('product.toast_review_error_desc'),
      color:       'error',
      icon:        'i-heroicons-x-circle',
    })
  } finally {
    submittingReview.value = false
  }
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────
const stockLabel = computed(() => {
  if (!product.value) return ''
  if (product.value.stock > 5)  return t('product.stock_available')
  if (product.value.stock > 0)  return t('product.stock_low', { count: product.value.stock })
  return t('product.stock_out')
})

const discountPercent = (item: Product) => {
  if (item.discount_percent) return `-${item.discount_percent}%`
  if (item.old_price && item.old_price > item.price)
    return `-${Math.round((1 - item.price / item.old_price) * 100)}%`
  return null
}
</script>

<template>
  <UContainer class="py-4 sm:py-8 bg-white">

    <!-- LOADING -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-12 h-12 border-4 border-[#274a82] border-t-transparent rounded-full animate-spin"></div>
      <p class="text-sm text-gray-400 font-semibold">{{ $t('product.loading') }}</p>
    </div>

    <!-- NOT FOUND -->
    <div v-else-if="notFound" class="flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <UIcon name="i-heroicons-face-frown" class="w-8 h-8 text-gray-300" />
      </div>
      <h2 class="text-xl font-black text-gray-800">{{ $t('product.not_found_title') }}</h2>
      <p class="text-sm text-gray-400">{{ $t('product.not_found_desc') }}</p>
      <NuxtLink
        to="/"
        class="mt-2 px-6 py-2.5 bg-[#274a82] text-white text-sm font-black rounded-lg hover:bg-[#e60012] transition">
        {{ $t('product.not_found_btn') }}
      </NuxtLink>
    </div>

    <!-- PRODUIT -->
    <template v-else-if="product">

      <!-- BREADCRUMB -->
      <nav
        aria-label="Fil d'Ariane"
        class="flex items-center gap-2 text-[14px] mb-5 text-gray-500 font-medium border-b border-gray-50 pb-2">
        <NuxtLink to="/boutique" class="hover:text-[#274a82] transition-colors flex-shrink-0">
          {{ $t('product.breadcrumb_shop') }}
        </NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 flex-shrink-0" />
        <NuxtLink
          v-if="product.category"
          :to="`/categories/${product.category.slug}`"
          class="text-[#274a82] hover:text-[#e60012] transition-colors flex-shrink-0">
          {{ product.category.name }}
        </NuxtLink>
        <span v-else class="text-[#274a82] flex-shrink-0">{{ $t('product.breadcrumb_product') }}</span>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 flex-shrink-0" />
        <span
          class="truncate max-w-[150px] sm:max-w-[200px] text-[#274a82] font-bold pointer-events-none"
          aria-current="page">
          {{ product.name }}
        </span>
      </nav>

      <!-- TITRE -->
      <div class="mb-5 sm:mb-8 flex items-start gap-3 flex-wrap">
        <h1 class="text-lg sm:text-2xl font-black text-gray-900 leading-tight tracking-tight flex-1">
          {{ product.name }}
        </h1>
      </div>

      <!-- ZONE PRODUIT -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-8 sm:mb-12">

        <!-- GALERIE -->
        <div class="lg:col-span-6 flex gap-2 sm:gap-4">

          <!-- Thumbnails desktop -->
          <div
            v-if="thumbnails.length > 1"
            class="hidden sm:flex flex-col gap-2 py-1 overflow-y-auto max-h-[420px] custom-scrollbar flex-shrink-0">
            <button
              v-for="(img, i) in thumbnails" :key="i"
              @click="selectImage(img)"
              :aria-label="$t('product.image_aria_thumb', { index: i + 1 })"
              class="w-14 h-14 border-2 rounded-sm p-0.5 transition-all flex-shrink-0"
              :class="mainImage === img
                ? 'border-[#274a82] ring-1 ring-[#274a82]'
                : 'border-gray-200 hover:border-gray-300'">
              <img
                :src="img"
                :loading="i < 3 ? 'eager' : 'lazy'"
                decoding="async"
                width="56"
                height="56"
                class="w-full h-full object-cover rounded-sm"
                :alt="$t('product.image_alt_thumb', { name: product.name, index: i + 1 })" />
            </button>
          </div>

          <!-- Image principale -->
          <div class="flex-1 flex flex-col gap-2">
            <div
              class="relative border border-gray-100 rounded-sm overflow-hidden bg-white h-[280px] sm:h-[420px]"
              @mouseenter="!isMobile && (isZoomed = true)"
              @mouseleave="isZoomed = false"
              @mousemove="handleMouseMove"
              :class="isMobile ? 'cursor-default' : isZoomed ? 'cursor-none' : 'cursor-zoom-in'">

              <!-- Badge promo -->
              <div
                v-if="product.discount_percent && product.discount_percent > 0"
                class="absolute top-3 right-3 bg-[#e60012] text-white text-[10px] sm:text-[11px] font-black px-2 sm:px-3 py-1 rounded-sm shadow-lg z-30">
                -{{ product.discount_percent }}%
              </div>

              <!-- Placeholder -->
              <div
                v-if="!mainImage"
                class="w-full h-full flex items-center justify-center bg-gray-50">
                <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-200" />
              </div>

              <img
                v-else
                :src="mainImage"
                :alt="product.name"
                fetchpriority="high"
                loading="eager"
                decoding="async"
                width="600"
                height="600"
                style="aspect-ratio: 1/1"
                class="w-full h-full object-contain p-4 sm:p-10 transition-transform duration-200"
                :style="isZoomed && !isMobile
                  ? { transform: 'scale(2.5)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                  : {}" />

              <!-- Loupe desktop -->
              <div
                v-if="isZoomed && mainImage && !isMobile"
                class="absolute pointer-events-none border-2 border-[#274a82] rounded-full w-20 h-20 sm:w-24 sm:h-24 shadow-2xl z-40 bg-white/10"
                :style="{ left: `calc(${zoomPos.x}% - 40px)`, top: `calc(${zoomPos.y}% - 40px)` }" />
            </div>

            <!-- Thumbnails mobile -->
            <div v-if="thumbnails.length > 1" class="flex sm:hidden gap-2 overflow-x-auto pb-1">
              <button
                v-for="(img, i) in thumbnails" :key="i"
                @click="selectImage(img)"
                class="w-14 h-14 border-2 rounded-sm p-0.5 transition-all flex-shrink-0"
                :class="mainImage === img ? 'border-[#274a82]' : 'border-gray-200'">
                <img
                  :src="img"
                  :loading="i === 0 ? 'eager' : 'lazy'"
                  decoding="async"
                  width="56"
                  height="56"
                  class="w-full h-full object-cover rounded-sm"
                  :alt="$t('product.image_alt_thumb', { name: product.name, index: i + 1 })" />
              </button>
            </div>
          </div>
        </div>

        <!-- INFOS -->
        <div class="lg:col-span-6 space-y-3 sm:space-y-5">

          <!-- Prix -->
          <div class="flex items-center gap-3 flex-wrap">
            <span class="text-2xl sm:text-3xl font-black text-[#e60012]">
              {{ formatPrice(product.price) }}
            </span>
            <span v-if="product.old_price" class="text-sm text-gray-400 line-through">
              {{ formatPrice(product.old_price) }}
            </span>
            <span
              v-if="product.discount_percent && product.discount_percent > 0"
              class="bg-[#e60012]/10 text-[#e60012] text-[11px] font-black px-2 py-0.5 rounded-sm">
              -{{ product.discount_percent }}%
            </span>
          </div>

          <!-- Note rapide -->
          <button
            v-if="reviewCount > 0"
            @click="activeTab = 'reviews'"
            class="flex items-center gap-2 hover:opacity-80 transition-opacity"
            :aria-label="$t('product.reviews_count', { count: reviewCount })">
            <div class="flex gap-0.5">
              <UIcon
                v-for="j in 5" :key="j"
                :name="j <= Math.round(avgRating) ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                class="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <span class="text-xs text-gray-500 font-bold underline underline-offset-2">
              {{ $t('product.reviews_count', { count: reviewCount }) }}
            </span>
          </button>

          <!-- Disponibilité -->
          <div class="flex items-center gap-2">
            <span
              class="w-2 h-2 rounded-full"
              :class="product.stock > 0 ? 'bg-green-500' : 'bg-red-400'">
            </span>
            <span
              class="text-[12px] font-bold"
              :class="product.stock > 0 ? 'text-green-600' : 'text-red-500'">
              {{ stockLabel }}
            </span>
            <span v-if="product.sku" class="ml-auto text-[11px] text-gray-400 font-mono">
              {{ $t('product.sku_label') }} {{ product.sku }}
            </span>
          </div>

          <!-- ─── Specs rapides ─────────────────────────────────────────────────── -->
          <template v-if="product.specs?.length">
            <div class="py-3 border-y border-gray-100">

              <!-- Mobile : toutes les specs, pas de limite -->
              <div class="sm:hidden grid grid-cols-1 gap-y-1.5">
                <div
                  v-for="spec in product.specs" :key="spec.key"
                  class="flex justify-between items-center border-b border-gray-50 pb-1.5">
                  <span class="text-[11px] text-gray-400 font-bold truncate max-w-[45%]">{{ spec.key }}</span>
                  <span class="text-[12px] text-gray-900 font-black text-right ml-2 truncate max-w-[50%]">
                    {{ spec.value }}
                  </span>
                </div>
              </div>

              <!-- Desktop : limité à 10 specs -->
              <div class="hidden sm:grid grid-cols-2 gap-x-6 gap-y-1.5">
                <div
                  v-for="spec in product.specs.slice(0, 12)" :key="spec.key"
                  class="flex justify-between items-center border-b border-gray-50 pb-1.5">
                  <span class="text-[12px] text-gray-400 font-bold truncate max-w-[45%]">{{ spec.key }}</span>
                  <span class="text-[13px] text-gray-900 font-black text-right ml-2 truncate max-w-[50%]">
                    {{ spec.value }}
                  </span>
                </div>
              </div>

              <!-- Bouton "voir plus" desktop uniquement -->
              <button
                v-if="hasHiddenSpecs"
                @click="activeTab = 'specs'"
                class="hidden sm:inline-block mt-2 text-[11px] text-[#274a82] underline underline-offset-2 hover:text-[#e60012] transition-colors font-bold">
                + {{ hiddenSpecsCount }} {{ $t('product.specs_more') }}
              </button>

            </div>
          </template>

          <!-- Marque seule si pas de specs -->
          <div v-else-if="product.brand" class="py-3 border-y border-gray-100">
            <div class="flex justify-between items-center">
              <span class="text-[12px] text-gray-400 font-bold">{{ $t('product.brand_label') }}</span>
              <span class="text-[13px] text-gray-900 font-black">{{ product.brand }}</span>
            </div>
          </div>

          <!-- ─── Quantité + Panier + Favoris ──────────────────────────────── -->
          <div class="flex items-center gap-2 sm:gap-3">

            <!-- Compteur quantité -->
            <div class="flex items-center border border-gray-200 rounded-sm bg-gray-50 overflow-hidden flex-shrink-0">
              <button
                @click="quantity > 1 ? quantity-- : null"
                :disabled="quantity <= 1"
                :aria-label="$t('product.qty_decrease')"
                class="px-2.5 sm:px-4 py-2 sm:py-3 hover:bg-gray-200 font-bold transition-colors text-base sm:text-lg select-none disabled:opacity-30">
                −
              </button>
              <span
                class="px-2.5 sm:px-4 py-2 sm:py-3 font-black text-[#274a82] bg-white min-w-[36px] sm:min-w-[44px] text-center border-x border-gray-200 text-sm sm:text-base"
                aria-live="polite">
                {{ quantity }}
              </span>
              <button
                @click="product.stock > 0 && quantity < product.stock ? quantity++ : null"
                :disabled="product.stock === 0 || quantity >= product.stock"
                :aria-label="$t('product.qty_increase')"
                class="px-2.5 sm:px-4 py-2 sm:py-3 hover:bg-gray-200 font-bold transition-colors text-base sm:text-lg select-none disabled:opacity-30">
                +
              </button>
            </div>

            <!-- Bouton panier -->
            <UButton
              :disabled="product.stock === 0"
              @click="addToCart()"
              block
              class="flex-1 bg-[#274a82] hover:bg-[#e60012] text-white font-black py-2 sm:py-3 tracking-wide sm:tracking-widest shadow-md transition-all rounded-sm text-[11px] sm:text-[12px] min-w-0 disabled:opacity-50 disabled:cursor-not-allowed">
              <UIcon name="i-heroicons-shopping-cart" class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <!-- Texte court sur mobile, complet sur sm+ -->
              <span class="sm:hidden truncate">
                {{ product.stock === 0 ? $t('product.btn_out_of_stock_short') : $t('product.btn_add_short') }}
              </span>
              <span class="hidden sm:inline truncate">
                {{ product.stock === 0 ? $t('product.btn_out_of_stock') : $t('product.btn_add_to_cart') }}
              </span>
            </UButton>

            <!-- Bouton favoris -->
            <button
              @click="addToWishlist(product.id, product.name)"
              :aria-label="isFav(product.id) ? $t('product.btn_fav_remove') : $t('product.btn_fav_add')"
              class="w-9 h-9 sm:w-11 sm:h-11 border rounded-sm flex items-center justify-center transition-colors flex-shrink-0"
              :class="isFav(product.id)
                ? 'border-[#e60012] bg-red-50 text-[#e60012]'
                : 'border-gray-200 text-gray-400 hover:border-[#e60012] hover:text-[#e60012]'">
              <UIcon
                :name="isFav(product.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
                class="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

          </div>

        </div>
      </div>

      <!-- ONGLETS -->
      <div class="mb-8 sm:mb-10">
        <div
          class="flex gap-6 sm:gap-10 border-b border-gray-100 mb-5 sm:mb-6"
          role="tablist">
          <button
            @click="activeTab = 'description'"
            role="tab"
            :aria-selected="activeTab === 'description'"
            class="pb-2.5 text-[13px] sm:text-[15px] font-black transition-all border-b-2"
            :class="activeTab === 'description'
              ? 'border-[#e60012] text-black'
              : 'border-transparent text-gray-400 hover:text-gray-600'">
            {{ $t('product.tab_description') }}
          </button>
          <button
            v-if="product.specs?.length"
            @click="activeTab = 'specs'"
            role="tab"
            :aria-selected="activeTab === 'specs'"
            class="pb-2.5 text-[13px] sm:text-[15px] font-black transition-all border-b-2"
            :class="activeTab === 'specs'
              ? 'border-[#e60012] text-black'
              : 'border-transparent text-gray-400 hover:text-gray-600'">
            {{ $t('product.tab_specs') }}
          </button>
          <button
            @click="activeTab = 'reviews'"
            role="tab"
            :aria-selected="activeTab === 'reviews'"
            class="pb-2.5 text-[13px] sm:text-[15px] font-black transition-all border-b-2 flex items-center gap-2"
            :class="activeTab === 'reviews'
              ? 'border-[#e60012] text-black'
              : 'border-transparent text-gray-400 hover:text-gray-600'">
            {{ $t('product.tab_reviews') }}
            <span class="bg-gray-100 text-gray-500 text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {{ reviewCount }}
            </span>
          </button>
        </div>

        <!-- Description -->
        <div v-if="activeTab === 'description'" role="tabpanel">
          <p
            v-if="product.description"
            class="text-[13px] sm:text-[14px] leading-[1.8] text-gray-700">
            {{ product.description }}
          </p>
          <p v-else class="text-sm text-gray-400 italic">{{ $t('product.no_description') }}</p>
        </div>

        <!-- Fiche technique -->
        <div v-else-if="activeTab === 'specs'" role="tabpanel" class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <caption class="sr-only">{{ $t('product.specs_caption', { name: product.name }) }}</caption>
            <tbody>
              <tr
                v-for="spec in product.specs" :key="spec.key"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="py-3 px-4 font-bold text-gray-500 text-[12px] w-1/3 bg-gray-50/50">
                  {{ spec.key }}
                </td>
                <td class="py-3 px-4 font-semibold text-gray-800 text-[13px]">{{ spec.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Avis -->
        <div v-else role="tabpanel">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <template v-if="reviews.length">
                <span class="text-3xl font-black text-gray-900">{{ avgRating }}</span>
                <div>
                  <div class="flex gap-0.5 mb-0.5">
                    <UIcon
                      v-for="j in 5" :key="j"
                      :name="j <= Math.round(avgRating) ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                      class="w-4 h-4 text-yellow-400" />
                  </div>
                  <span class="text-xs text-gray-400">
                    {{ $t('product.reviews_avg_label', { count: reviews.length }) }}
                  </span>
                </div>
              </template>
              <span v-else-if="!loadingReviews" class="text-sm text-gray-400">
                {{ $t('product.reviews_none') }}
              </span>
            </div>
            <button
              @click="openReviewModal"
              class="flex items-center gap-2 px-4 py-2.5 bg-[#274a82] hover:bg-[#e60012] text-white text-xs font-black rounded-xl transition-all shadow-sm">
              <UIcon name="i-heroicons-pencil-square" class="w-3.5 h-3.5" />
              {{ $t('product.reviews_give_btn') }}
            </button>
          </div>

          <!-- Chargement avis -->
          <div v-if="loadingReviews" class="flex justify-center py-10">
            <div class="w-8 h-8 border-4 border-[#274a82] border-t-transparent rounded-full animate-spin"></div>
          </div>

          <!-- Aucun avis -->
          <div
            v-else-if="!reviews.length"
            class="flex flex-col items-center py-12 gap-3 text-center">
            <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-7 h-7 text-gray-300" />
            </div>
            <p class="text-sm text-gray-400 font-medium">{{ $t('product.reviews_be_first') }}</p>
            <button
              @click="openReviewModal"
              class="mt-1 px-5 py-2.5 bg-[#274a82] text-white text-xs font-black rounded-xl hover:bg-[#e60012] transition-all">
              {{ $t('product.reviews_write_btn') }}
            </button>
          </div>

          <!-- Marquee desktop -->
          <div v-else>
            <div class="hidden sm:block relative overflow-hidden py-2">
              <div class="flex gap-5 marquee-container">
                <div class="flex gap-5 animate-marquee-scroll">
                  <div
                    v-for="(review, i) in [...marqueeReviews, ...marqueeReviews]"
                    :key="`m-${i}`"
                    class="min-w-[300px] max-w-[300px] p-4 bg-slate-50 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 flex-shrink-0">
                    <div class="flex items-center justify-between">
                      <div class="flex gap-0.5">
                        <UIcon
                          v-for="j in 5" :key="j"
                          :name="j <= review.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                          class="w-3.5 h-3.5 text-yellow-400" />
                      </div>
                      <span class="text-[10px] text-gray-400">{{ reviewDate(review.created_at) }}</span>
                    </div>
                    <p
                      v-if="review.comment"
                      class="text-[13px] text-gray-600 leading-relaxed italic flex-1 line-clamp-3">
                      "{{ review.comment }}"
                    </p>
                    <div class="flex items-center gap-2 pt-2 border-t border-gray-100 mt-auto">
                      <div
                        class="w-7 h-7 rounded-full bg-[#274a82] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                        {{ review.user?.first_name?.[0] ?? '?' }}{{ review.user?.last_name?.[0] ?? '' }}
                      </div>
                      <span class="text-xs font-bold text-gray-700">{{ reviewerName(review) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Liste mobile -->
            <div class="sm:hidden flex flex-col gap-3">
              <div
                v-for="review in marqueeReviews" :key="review.id"
                class="p-4 bg-slate-50 rounded-xl border border-gray-100 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <div class="flex gap-0.5">
                    <UIcon
                      v-for="j in 5" :key="j"
                      :name="j <= review.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                      class="w-3.5 h-3.5 text-yellow-400" />
                  </div>
                  <span class="text-[10px] text-gray-400">{{ reviewDate(review.created_at) }}</span>
                </div>
                <p v-if="review.comment" class="text-[13px] text-gray-600 leading-relaxed italic">
                  "{{ review.comment }}"
                </p>
                <div class="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <div
                    class="w-7 h-7 rounded-full bg-[#274a82] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                    {{ review.user?.first_name?.[0] ?? '?' }}{{ review.user?.last_name?.[0] ?? '' }}
                  </div>
                  <span class="text-xs font-bold text-gray-700">{{ reviewerName(review) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PRODUITS SIMILAIRES -->
      <section v-if="relatedProducts.length" aria-label="Produits similaires">
        <div class="flex items-center justify-between border-b border-gray-200 mb-5 sm:mb-6">
          <h2
            class="text-base sm:text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#e60012] mb-[-1px] tracking-tight">
            {{ $t('product.related_title') }}
          </h2>
          <NuxtLink
            v-if="product.category"
            :to="`/categories/${product.category.slug}`"
            class="text-[12px] sm:text-[13px] font-black text-[#274a82] hover:text-[#e60012] flex items-center gap-1 transition-colors group">
            {{ $t('product.related_see_more') }}
            <UIcon name="i-heroicons-arrow-right" class="group-hover:translate-x-1 transition-transform" />
          </NuxtLink>
        </div>

        <!-- Carousel desktop -->
        <div class="hidden sm:block">
          <UCarousel
            v-slot="{ item }"
            :items="relatedProducts"
            :autoplay="{ delay: 2500 }"
            :ui="{ item: 'basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/5 px-2', container: 'py-4' }"
            indicators arrows
            class="rounded-sm">
            <NuxtLink
              :to="`/products/${item.slug}`"
              class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl w-full">
              <div
                class="relative h-48 w-full overflow-hidden flex items-center justify-center bg-[#fcfcfc]">
                <div
                  class="absolute right-[-50px] group-hover:right-3 top-3 flex flex-col gap-2 z-30 transition-all duration-300">
                  <button
                    @click.prevent.stop="addToWishlist(item.id, item.name)"
                    :aria-label="isFav(item.id) ? $t('product.related_fav_remove') : $t('product.related_fav_add')"
                    class="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
                    :class="isFav(item.id)
                      ? 'bg-[#e60012] text-white'
                      : 'text-gray-400 hover:bg-[#e60012] hover:text-white'">
                    <UIcon
                      :name="isFav(item.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
                      class="w-4 h-4" />
                  </button>
                </div>
                <img
                  v-if="item.images?.[0]"
                  :src="item.images[0]"
                  :alt="item.name"
                  loading="lazy"
                  decoding="async"
                  width="200"
                  height="200"
                  class="w-full h-full object-contain p-4" />
                <UIcon v-else name="i-heroicons-sparkles" class="w-12 h-12 opacity-10" />
                <div
                  v-if="discountPercent(item)"
                  class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">
                  {{ discountPercent(item) }}
                </div>
              </div>
              <div class="p-2 sm:p-3 flex flex-col flex-1 border-t border-gray-100">
                <h3 class="text-[13px] sm:text-[14px] text-[#274a82] font-bold line-clamp-2 leading-snug mt-0.5 mb-2 h-8 sm:h-10 overflow-hidden group-hover:text-[#e60012] transition-colors">
                  {{ item.name }}
                </h3>
                <div class="mt-2">
                  <div class="text-xs sm:text-xl font-black text-gray-900 mb-0.5 leading-tight">
                    {{ item.price.toLocaleString() }} <span class="text-[12px]">FCFA</span>
                  </div>
                  <span v-if="item.old_price" class="text-[10px] sm:text-[12px] text-[#e60012] line-through">
                    {{ item.old_price.toLocaleString() }} FCFA
                  </span>
                </div>
              </div>
            </NuxtLink>
          </UCarousel>
        </div>

        <!-- Grille mobile -->
        <div class="sm:hidden grid grid-cols-2 gap-3">
          <NuxtLink
            v-for="item in relatedProducts" :key="item.id"
            :to="`/products/${item.slug}`"
            class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl">
            <div class="relative h-36 w-full overflow-hidden bg-[#fcfcfc]">
              <div
                v-if="discountPercent(item)"
                class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">
                {{ discountPercent(item) }}
              </div>
              <img
                v-if="item.images?.[0]"
                :src="item.images[0]"
                :alt="item.name"
                loading="lazy"
                decoding="async"
                width="150"
                height="150"
                class="w-full h-full object-contain p-2" />
              <UIcon
                v-else
                name="i-heroicons-sparkles"
                class="absolute inset-0 m-auto w-10 h-10 opacity-10" />
            </div>
            <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
              <h3 class="text-[11px] text-gray-600 font-medium line-clamp-2 leading-tight mb-2">
                {{ item.name }}
              </h3>
              <div class="mt-auto">
                <div class="text-sm font-black text-gray-900 leading-tight">
                  {{ item.price.toLocaleString() }} <span class="text-[8px]">FCFA</span>
                </div>
                <span v-if="item.old_price" class="text-[9px] text-[#e60012] line-through">
                  {{ item.old_price.toLocaleString() }} FCFA
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>

    </template>
  </UContainer>

  <!-- MODAL AVIS -->
  <UModal v-model:open="showReviewModal">
    <template #content>
      <div class="overflow-hidden rounded-2xl bg-white">

        <!-- Header -->
        <div class="px-6 py-5 bg-[#274a82] flex items-center justify-between">
          <div>
            <p class="text-xs text-white/50 font-bold tracking-widest">
              {{ $t('product.modal_review_subtitle') }}
            </p>
            <h2 class="text-base font-black text-white mt-0.5 line-clamp-1 max-w-[220px]">
              {{ product?.name }}
            </h2>
          </div>
          <button
            @click="showReviewModal = false"
            :aria-label="$t('product.modal_review_close')"
            class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all flex-shrink-0">
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4 text-white" />
          </button>
        </div>

        <div class="px-6 py-5 space-y-5">

          <!-- Étoiles -->
          <div>
            <p class="text-xs font-black text-gray-400 tracking-widest mb-3">
              {{ $t('product.modal_rating_label') }}
            </p>
            <div class="flex items-center gap-1" role="radiogroup" :aria-label="$t('product.modal_rating_label')">
              <button
                v-for="star in 5" :key="star"
                @click="reviewForm.rating = star"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
                :aria-label="$t(star > 1 ? 'product.rating_stars_aria' : 'product.rating_star_aria', { count: star })"
                :aria-pressed="reviewForm.rating === star"
                class="p-0.5 transition-transform hover:scale-110 focus:outline-none">
                <UIcon
                  :name="star <= (hoverRating || reviewForm.rating)
                    ? 'i-heroicons-star-solid'
                    : 'i-heroicons-star'"
                  class="w-9 h-9 transition-colors"
                  :class="star <= (hoverRating || reviewForm.rating)
                    ? 'text-yellow-400'
                    : 'text-gray-200'" />
              </button>
              <span class="ml-3 text-sm font-black text-gray-700 min-w-[80px]">
                {{ ratingLabel }}
              </span>
            </div>
          </div>

          <!-- Commentaire -->
          <div>
            <p class="text-xs font-black text-gray-400 tracking-widest mb-2">
              {{ $t('product.modal_comment_label') }}
            </p>
            <textarea
              v-model="reviewForm.comment"
              :maxlength="500"
              rows="4"
              :placeholder="$t('product.modal_comment_placeholder')"
              :aria-label="$t('product.modal_comment_label')"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-2 focus:ring-[#274a82]/10 transition-all resize-none">
            </textarea>
            <div class="flex justify-between mt-1">
              <span
                class="text-[10px]"
                :class="reviewForm.comment.trim() ? 'text-green-500' : 'text-red-400'">
                {{ reviewForm.comment.trim()
                  ? $t('product.modal_comment_ready')
                  : $t('product.modal_comment_required') }}
              </span>
              <span class="text-[10px] text-gray-400">
                {{ $t('product.modal_comment_limit', { count: reviewForm.comment.length }) }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-1">
            <button
              @click="showReviewModal = false"
              class="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">
              {{ $t('product.modal_btn_cancel') }}
            </button>
            <button
              @click="submitReview"
              :disabled="!reviewForm.comment.trim() || submittingReview"
              class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#274a82] hover:bg-[#e60012] text-white font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <UIcon
                :name="submittingReview ? 'i-heroicons-arrow-path' : 'i-heroicons-paper-airplane'"
                class="w-4 h-4"
                :class="submittingReview ? 'animate-spin' : ''" />
              {{ submittingReview
                ? $t('product.modal_btn_submitting')
                : $t('product.modal_btn_submit') }}
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