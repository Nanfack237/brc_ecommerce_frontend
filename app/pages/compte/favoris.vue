<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'

const { requireAuth, token } = useAuth()
requireAuth()

const { t } = useI18n()

useHead({
  title: () => t('favoris_compte.seo_title'),
  titleTemplate: (title) => title ? `${title} - BRC Market` : 'BRC Market',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
})

const toast  = useToast()
const config = useRuntimeConfig()
const API    = config.public.apiBase

const authHeaders = computed(() => ({ Authorization: `Bearer ${token.value}` }))

// ── Types ─────────────────────────────────────────────────────────────────────
interface Product {
  id:        number
  name:      string
  slug:      string
  price:     number
  old_price: number | null
  stock:     number
  category:  string | null
  image:     string | null
}

// ── State ─────────────────────────────────────────────────────────────────────
const products = ref<Product[]>([])
const loading  = ref(true)
const removing = ref<number | null>(null)

// ── Helpers ───────────────────────────────────────────────────────────────────
const discount = (price: number, old: number) =>
  Math.round(((old - price) / old) * 100)

const formatPrice = (p: number) =>
  new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(p)

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = computed(() => ({
  total:      products.value.length,
  disponible: products.value.filter(p => p.stock > 0).length,
  rupture:    products.value.filter(p => p.stock === 0).length,
  promos:     products.value.filter(p => p.old_price).length,
}))

// ── Fetch ─────────────────────────────────────────────────────────────────────
const fetchFavorites = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API}/wishlist`, { headers: authHeaders.value })
    products.value = data.data ?? data
  } catch {
    toast.add({ title: t('favoris_compte.toast_load_error'), color: 'error', icon: 'i-heroicons-exclamation-circle' })
    products.value = []
  } finally {
    loading.value = false
  }
}

// ── Retirer des favoris ───────────────────────────────────────────────────────
const removeFavorite = async (product: Product) => {
  removing.value = product.id
  try {
    await axios.delete(`${API}/wishlist/${product.id}`, { headers: authHeaders.value })
    products.value = products.value.filter(p => p.id !== product.id)
    toast.add({
      title:       t('favoris_compte.toast_removed_title'),
      description: t('favoris_compte.toast_removed_desc', { name: product.name }),
      color:       'neutral',
      icon:        'i-heroicons-heart',
    })
  } catch {
    toast.add({
      title:       t('favoris_compte.toast_error'),
      description: t('favoris_compte.toast_remove_error'),
      color:       'error',
      icon:        'i-heroicons-x-circle',
    })
  } finally {
    removing.value = null
  }
}

await fetchFavorites()
</script>

<template>
  <div class="space-y-6">

    <!-- ══ BREADCRUMB + TITRE ══════════════════════════════════════════════ -->
    <div>
      <div class="hidden sm:flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">
          {{ $t('favoris_compte.breadcrumb_home') }}
        </NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <span class="text-gray-600 font-medium">{{ $t('favoris_compte.page_title') }}</span>
      </div>
      <h1 class="text-2xl font-black text-gray-900">{{ $t('favoris_compte.page_title') }}</h1>
      <p class="text-gray-500 text-sm mt-0.5">
        {{ $t('favoris_compte.subtitle', { count: stats.total }) }}
      </p>
    </div>

    <!-- ══ STATS ════════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider">{{ $t('favoris_compte.stats_total') }}</p>
        <p class="text-2xl font-black text-gray-900 mt-1">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider">{{ $t('favoris_compte.stats_available') }}</p>
        <p class="text-2xl font-black text-green-600 mt-1">{{ stats.disponible }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider">{{ $t('favoris_compte.stats_out_of_stock') }}</p>
        <p class="text-2xl font-black text-[#e60012] mt-1">{{ stats.rupture }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider">{{ $t('favoris_compte.stats_on_sale') }}</p>
        <p class="text-2xl font-black text-orange-500 mt-1">{{ stats.promos }}</p>
      </div>
    </div>

    <!-- ══ LOADING SKELETON ════════════════════════════════════════════════ -->
    <div v-if="loading"
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
      <div v-for="i in 4" :key="i" class="bg-gray-50 rounded-sm animate-pulse">
        <div class="h-40 sm:h-48 bg-gray-100 rounded-sm"></div>
        <div class="p-2 space-y-2">
          <div class="h-3 bg-gray-100 rounded w-full"></div>
          <div class="h-4 bg-gray-100 rounded w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- ══ EMPTY ════════════════════════════════════════════════════════════ -->
    <div v-else-if="products.length === 0"
      class="text-center py-20 bg-white rounded-2xl border border-gray-100">
      <UIcon name="i-heroicons-heart" class="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <p class="text-gray-400 font-medium">{{ $t('favoris_compte.empty_title') }}</p>
      <NuxtLink to="/boutique">
        <button class="mt-4 px-5 py-2.5 bg-[#e60012] hover:bg-red-700 text-white text-sm font-black rounded-xl transition-colors">
          {{ $t('favoris_compte.empty_btn') }}
        </button>
      </NuxtLink>
    </div>

    <!-- ══ GRILLE 4 COLONNES ═══════════════════════════════════════════════ -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
      <NuxtLink
        v-for="product in products"
        :key="product.id"
        :to="`/products/${product.slug}`"
        class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl"
      >
        <!-- ── Zone image ─────────────────────────────────────────────── -->
        <div class="relative h-40 sm:h-48 w-full overflow-hidden flex items-center justify-center bg-[#fcfcfc]">

          <img
            v-if="product.image"
            :src="product.image"
            :alt="product.name"
            loading="lazy"
            decoding="async"
            width="200"
            height="200"
            class="w-full h-full object-contain p-2 transition-opacity duration-300"
          />
          <UIcon v-else name="i-heroicons-cube" class="w-12 h-12 text-gray-200" />

          <!-- Badge promo -->
          <div v-if="product.old_price"
            class="absolute top-2 left-2 bg-[#e60012] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-10"
            aria-hidden="true">
            -{{ discount(product.price, product.old_price) }}%
          </div>

          <!-- Overlay rupture -->
          <div v-if="!product.stock"
            class="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <span class="bg-gray-800 text-white text-[11px] font-bold px-3 py-1 rounded-sm">
              {{ $t('favoris_compte.badge_out_of_stock') }}
            </span>
          </div>

          <!-- Bouton retirer favoris — desktop : slide depuis droite -->
          <div class="hidden sm:flex absolute right-[-50px] group-hover:right-2 top-2 flex-col gap-2 z-30 transition-all duration-300">
            <button
              @click.prevent.stop="removeFavorite(product)"
              :disabled="removing === product.id"
              :aria-label="$t('favoris_compte.btn_remove')"
              class="w-8 h-8 shadow-md rounded-full flex items-center justify-center bg-white text-[#e60012] hover:bg-[#e60012] hover:text-white transition-colors disabled:opacity-50"
            >
              <UIcon
                :name="removing === product.id ? 'i-heroicons-arrow-path' : 'i-heroicons-heart-solid'"
                class="w-4 h-4"
                :class="removing === product.id ? 'animate-spin' : ''"
                aria-hidden="true"
              />
            </button>
          </div>

          <!-- Bouton retirer favoris — mobile : toujours visible -->
          <button
            @click.prevent.stop="removeFavorite(product)"
            :disabled="removing === product.id"
            :aria-label="$t('favoris_compte.btn_remove')"
            class="absolute top-2 right-2 sm:hidden w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-[#e60012] z-20 disabled:opacity-50"
          >
            <UIcon
              :name="removing === product.id ? 'i-heroicons-arrow-path' : 'i-heroicons-heart-solid'"
              class="w-4 h-4"
              :class="removing === product.id ? 'animate-spin' : ''"
              aria-hidden="true"
            />
          </button>
        </div>

        <!-- ── Zone info ──────────────────────────────────────────────── -->
        <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
          <h3 class="text-[12px] sm:text-[13px] text-gray-700 font-semibold mb-2 line-clamp-2 leading-snug group-hover:text-[#e60012]">
            {{ product.name }}
          </h3>
          <div class="mt-auto flex items-end justify-between gap-2">
            <div>
              <div class="text-sm sm:text-base font-black text-gray-900 leading-tight">
                {{ formatPrice(product.price) }}
                <span class="text-[9px]">{{ $t('favoris_compte.currency') }}</span>
              </div>
              <span v-if="product.old_price" class="text-[10px] text-gray-400 line-through">
                {{ formatPrice(product.old_price) }} {{ $t('favoris_compte.currency') }}
              </span>
            </div>
            
          </div>
        </div>

      </NuxtLink>
    </div>

    <!-- ══ BANNIÈRE RUPTURE ════════════════════════════════════════════════ -->
    <div v-if="!loading && stats.rupture > 0"
      class="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div>
        <p class="text-sm font-bold text-amber-800">
          {{ stats.rupture }}
          {{ stats.rupture > 1
            ? $t('favoris_compte.banner_out_of_stock_plural')
            : $t('favoris_compte.banner_out_of_stock_single') }}
        </p>
        <p class="text-xs text-amber-600 mt-0.5">
          {{ $t('favoris_compte.banner_out_of_stock_sub') }}
        </p>
      </div>
    </div>

  </div>
</template>