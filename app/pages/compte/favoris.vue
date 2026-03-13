<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import useCart from '@/composables/useCart'

const { requireAuth, token } = useAuth()
requireAuth()

useHead({
  title: 'Mes favoris',
  titleTemplate: (t) => t ? `${t} - BRC Market` : 'BRC Market',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
})

const toast  = useToast()
const config = useRuntimeConfig()
const API    = config.public.apiBase
const { addToCart } = useCart()

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

// ── Stats ─────────────────────────────────────────────────────────────────────
const stats = computed(() => ({
  total:      products.value.length,
  disponible: products.value.filter(p => p.stock > 0).length,
  rupture:    products.value.filter(p => p.stock === 0).length,
  promos:     products.value.filter(p => p.old_price).length,
}))

// ── Fetch depuis /api/wishlist ────────────────────────────────────────────────
const fetchFavorites = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API}/wishlist`, { headers: authHeaders.value })
    products.value = data.data ?? data
  } catch {
    toast.add({ title: 'Erreur de chargement', color: 'error', icon: 'i-heroicons-exclamation-circle' })
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
      title: 'Retiré des favoris',
      description: `${product.name} supprimé de vos favoris.`,
      color: 'neutral',
      icon: 'i-heroicons-heart',
    })
  } catch {
    toast.add({ title: 'Erreur', description: 'Impossible de retirer ce favori.', color: 'error', icon: 'i-heroicons-x-circle' })
  } finally {
    removing.value = null
  }
}

// ── Ajouter au panier ─────────────────────────────────────────────────────────
const handleAddToCart = (product: Product) => {
  if (!product.stock) return
  addToCart({
    id:    product.id,
    slug:  product.slug,
    name:  product.name,
    price: product.price,
    image: product.image ?? '',
  })
  toast.add({
    title: 'Ajouté au panier !',
    description: `${product.name} a été ajouté au panier.`,
    color: 'success',
    icon: 'i-heroicons-shopping-cart',
  })
}

// ── Init ──────────────────────────────────────────────────────────────────────
await fetchFavorites()
</script>

<template>
  <div class="space-y-6">

    <!-- ══ BREADCRUMB + TITRE ══════════════════════════════════════════════ -->
    <div>
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">Accueil</NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <NuxtLink to="/compte/informations" class="hover:text-[#274a82] transition-colors">Mon compte</NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <span class="text-gray-600 font-medium">Mes favoris</span>
      </div>
      <h1 class="text-2xl font-black text-gray-900">Mes favoris</h1>
      <p class="text-gray-500 text-sm mt-0.5">{{ stats.total }} produit(s) sauvegardé(s)</p>
    </div>

    <!-- ══ STATS ════════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider ">Total</p>
        <p class="text-2xl font-black text-gray-900 mt-1">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider ">Disponibles</p>
        <p class="text-2xl font-black text-green-600 mt-1">{{ stats.disponible }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider ">Rupture</p>
        <p class="text-2xl font-black text-[#e60012] mt-1">{{ stats.rupture }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider ">En promo</p>
        <p class="text-2xl font-black text-orange-500 mt-1">{{ stats.promos }}</p>
      </div>
    </div>

    <!-- ══ LOADING SKELETON ════════════════════════════════════════════════ -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      <div v-for="i in 4" :key="i" class="rounded-sm bg-white border border-gray-100 animate-pulse">
        <div class="h-48 sm:h-52 bg-gray-100"></div>
        <div class="p-2 space-y-2">
          <div class="h-3 bg-gray-100 rounded w-1/2"></div>
          <div class="h-4 bg-gray-100 rounded w-3/4"></div>
          <div class="h-5 bg-gray-100 rounded w-1/3"></div>
        </div>
      </div>
    </div>

    <!-- ══ EMPTY ════════════════════════════════════════════════════════════ -->
    <div v-else-if="products.length === 0"
      class="text-center py-20 bg-white rounded-2xl border border-gray-100">
      <UIcon name="i-heroicons-heart" class="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <p class="text-gray-400 font-medium">Vous n'avez pas encore de favoris</p>
      <NuxtLink to="/boutique">
        <button class="mt-4 px-5 py-2.5 bg-[#e60012] hover:bg-red-700 text-white text-sm font-black rounded-xl transition-colors">
          Découvrir la boutique
        </button>
      </NuxtLink>
    </div>

    <!-- ══ GRILLE PRODUITS ══════════════════════════════════════════════════ -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      <NuxtLink
        v-for="product in products" :key="product.id"
        :to="`/products/${product.slug}`"
        class="group relative rounded-sm bg-white border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-xl"
      >
        <!-- ── Zone image ─────────────────────────────────────────────── -->
        <div class="relative h-48 sm:h-52 w-full overflow-hidden flex items-center justify-center bg-[#fcfcfc]">

          <img v-if="product.image" :src="product.image" :alt="product.name"
            class="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
          <UIcon v-else name="i-heroicons-cube" class="w-16 h-16 text-gray-200" />

          <!-- Badge promo -->
          <div v-if="product.old_price"
            class="absolute top-2 left-2 bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm z-10">
            -{{ discount(product.price, product.old_price) }}%
          </div>

          <!-- Overlay rupture -->
          <div v-if="!product.stock"
            class="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <span class="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-sm">Rupture de stock</span>
          </div>

          <!-- Desktop : actions hover slide depuis droite -->
          <div class="absolute right-[-50px] group-hover:right-2 top-2 hidden sm:flex flex-col gap-2 z-20 transition-all duration-300">
            <button
              @click.prevent.stop="removeFavorite(product)"
              :disabled="removing === product.id"
              class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-red-400 hover:bg-[#e60012] hover:text-white transition-colors disabled:opacity-50"
              title="Retirer des favoris"
            >
              <UIcon
                :name="removing === product.id ? 'i-heroicons-arrow-path' : 'i-heroicons-heart-solid'"
                class="w-5 h-5"
                :class="removing === product.id ? 'animate-spin' : ''"
              />
            </button>
            <NuxtLink :to="`/products/${product.slug}`" @click.stop
              class="w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-gray-400 hover:bg-[#274a82] hover:text-white transition-colors"
            >
              <UIcon name="i-heroicons-eye" class="w-5 h-5" />
            </NuxtLink>
          </div>

          <!-- Mobile : bouton favoris toujours visible -->
          <button
            @click.prevent.stop="removeFavorite(product)"
            :disabled="removing === product.id"
            class="absolute top-2 right-2 sm:hidden w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-red-400 z-20 disabled:opacity-50"
          >
            <UIcon
              :name="removing === product.id ? 'i-heroicons-arrow-path' : 'i-heroicons-heart-solid'"
              class="w-4 h-4"
              :class="removing === product.id ? 'animate-spin' : ''"
            />
          </button>

          <!-- Desktop : bouton panier slide depuis le bas -->
          <div class="hidden sm:block absolute bottom-[-100%] group-hover:bottom-0 left-0 w-full transition-all duration-300 z-20">
            <button
              @click.prevent.stop="handleAddToCart(product)"
              :disabled="!product.stock"
              class="w-full flex items-center justify-center gap-2 font-bold text-[12px] py-2.5 text-white transition-colors"
              :class="product.stock ? 'bg-[#274a82] hover:bg-[#e60012]' : 'bg-gray-400 cursor-not-allowed'"
            >
              <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
              Ajouter au Panier
            </button>
          </div>
        </div>

        <!-- ── Zone info ──────────────────────────────────────────────── -->
        <div class="p-2 flex flex-col flex-1 border-t border-gray-50">
          <span class="text-[11px] text-gray-400 font-bold tracking-widest">{{ product.category ?? '' }}</span>
          <h3 class="text-[13px] text-gray-600 font-medium mb-2 line-clamp-2 h-10 leading-snug">{{ product.name }}</h3>

          <!-- Desktop : prix -->
          <div class="hidden sm:block mt-auto">
            <div class="text-[18px] font-black text-gray-900 mb-0.5">
              {{ product.price.toLocaleString() }} <span class="text-[11px] font-semibold">FCFA</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[12px] text-gray-400 line-through">
                {{ product.old_price ? product.old_price.toLocaleString() + ' FCFA' : '' }}
              </span>
              <div v-if="product.old_price"
                class="bg-[#e60012] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">
                -{{ discount(product.price, product.old_price) }}%
              </div>
            </div>
          </div>

          <!-- Mobile : prix + bouton panier rond -->
          <div class="sm:hidden mt-auto flex items-center justify-between gap-1">
            <div>
              <div class="text-xl font-black text-gray-900 leading-tight">
                {{ product.price.toLocaleString() }} <span class="text-[9px] font-semibold">FCFA</span>
              </div>
              <span class="text-[10px] text-gray-400 line-through">
                {{ product.old_price ? product.old_price.toLocaleString() + ' FCFA' : '' }}
              </span>
            </div>
            <button
              @click.prevent.stop="handleAddToCart(product)"
              :disabled="!product.stock"
              class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors shadow-sm"
              :class="product.stock ? 'bg-[#274a82] hover:bg-[#e60012]' : 'bg-gray-300 cursor-not-allowed'"
            >
              <UIcon name="i-heroicons-shopping-cart" class="w-4 h-4" />
            </button>
          </div>
        </div>

      </NuxtLink>
    </div>

    <!-- ══ BANNIÈRE rupture ════════════════════════════════════════════════ -->
    <div v-if="!loading && stats.rupture > 0"
      class="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div>
        <p class="text-sm font-bold text-amber-800">
          {{ stats.rupture }} produit{{ stats.rupture > 1 ? 's' : '' }} en rupture de stock
        </p>
        <p class="text-xs text-amber-600 mt-0.5">
          Ces produits ne peuvent pas être ajoutés au panier pour l'instant.
        </p>
      </div>
    </div>

  </div>
</template>