<script setup lang="ts">
import { computed } from 'vue'
import useCart from '@/composables/useCart'

useHead({
  title: 'Mon Panier',
  titleTemplate: (t) => t ? `${t} - BRC Market` : 'BRC Market',
})

const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart()

const formatPrice = (p: number) =>
  new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(p)

const subtotal  = computed(() => cartItems.value.reduce((t, i) => t + i.price * i.quantity, 0))
const total     = computed(() => subtotal.value)
const itemCount = computed(() => cartItems.value.reduce((t, i) => t + i.quantity, 0))

const breadcrumbItems = [
  { label: 'Accueil',    to: '/' },
  { label: 'Mon Panier', to: '/cart', current: true },
]

// ── Supprimer un article ──────────────────────────────────────────────────
// Fonctionne quelle que soit la signature de removeFromCart dans useCart
const handleRemove = (item: any) => {
  // Essaie removeFromCart(id) — le plus courant
  try {
    removeFromCart(item.id)
  } catch {
    // Fallback : mutation directe du tableau si removeFromCart n'existe pas / échoue
    cartItems.value = cartItems.value.filter((i: any) => i.id !== item.id)
  }
}

// ── Modifier la quantité ─────────────────────────────────────────────────
const handleDecrease = (item: any) => {
  if (item.quantity <= 1) {
    handleRemove(item)
    return
  }
  item.quantity--
  try { updateQuantity(item.id, item.quantity) } catch { /* mutation directe suffit */ }
}

const handleIncrease = (item: any) => {
  item.quantity++
  try { updateQuantity(item.id, item.quantity) } catch { /* mutation directe suffit */ }
}

// ── Vider le panier ──────────────────────────────────────────────────────
const handleClear = () => {
  try {
    clearCart()
  } catch {
    cartItems.value = []
  }
}
</script>

<template>
  <UContainer class="py-6 bg-white min-h-screen">

    <!-- BREADCRUMB -->
    <nav class="hidden sm:flex items-center gap-2 text-[14px] mb-6 text-gray-500 font-medium border-b border-gray-50 pb-3 overflow-x-auto">
      <template v-for="(item, index) in breadcrumbItems" :key="index">
        <NuxtLink :to="item.to"
          class="flex items-center gap-1 transition-colors hover:text-[#e60012] whitespace-nowrap"
          :class="item.current ? 'text-[#274a82] font-bold pointer-events-none' : ''">
          {{ item.label }}
        </NuxtLink>
        <UIcon v-if="index < breadcrumbItems.length - 1" name="i-heroicons-chevron-right" class="w-3 h-3 text-gray-300 flex-shrink-0" />
      </template>
    </nav>

    <!-- TITRE -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Mon Panier</h1>
        <span v-if="itemCount > 0" class="bg-[#274a82] text-white text-xs font-black px-2.5 py-1 rounded-full">
          {{ itemCount }} article{{ itemCount > 1 ? 's' : '' }}
        </span>
      </div>
      <button v-if="cartItems.length > 0" @click="handleClear"
        class="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#e60012] font-bold transition-colors">
        <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />
        Vider le panier
      </button>
    </div>

    <!-- PANIER VIDE -->
    <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <div class="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
        <UIcon name="i-heroicons-shopping-cart" class="w-12 h-12 text-gray-300" />
      </div>
      <div>
        <p class="text-xl font-bold text-gray-700 mb-1">Votre panier est vide</p>
        <p class="text-sm text-gray-400">Découvrez nos produits et ajoutez-les à votre panier</p>
      </div>
      <NuxtLink to="/boutique"
        class="flex items-center gap-2 px-6 py-3 bg-[#274a82] hover:bg-[#e60012] text-white font-bold rounded-xl transition-colors text-sm">
        <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4" />
        Continuer mes achats
      </NuxtLink>
    </div>

    <!-- CONTENU PANIER -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- ═══ LISTE ARTICLES ═══ -->
      <div class="lg:col-span-2 space-y-3">

        <div v-for="item in cartItems" :key="item.id"
          class="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow group">

          <!-- Image -->
          <NuxtLink :to="item.slug ? `/products/${item.slug}` : `/products/${item.id}`"
            class="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-[#f8f8f8] rounded-xl overflow-hidden flex items-center justify-center border border-gray-100">
            <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-contain p-1.5" />
            <UIcon v-else name="i-heroicons-photo" class="w-10 h-10 text-gray-300" />
          </NuxtLink>

          <!-- Infos -->
          <div class="flex-1 min-w-0">
            <NuxtLink :to="item.slug ? `/products/${item.slug}` : `/products/${item.id}`"
              class="block font-bold text-[#274a82] text-sm sm:text-base leading-snug hover:text-[#e60012] transition-colors line-clamp-2 mb-1">
              {{ item.name }}
            </NuxtLink>
            <p v-if="item.description" class="text-[11px] text-gray-400 truncate mb-2">{{ item.description }}</p>
            <p class="text-xs text-gray-400 font-medium">
              Prix unitaire : <span class="text-gray-600 font-bold">{{ formatPrice(item.price) }} FCFA</span>
            </p>
          </div>

          <!-- Quantité + Prix + Supprimer -->
          <div class="flex flex-col items-end gap-3 flex-shrink-0">

            <!-- Prix ligne -->
            <p class="font-black text-[#e60012] text-base sm:text-lg whitespace-nowrap">
              {{ formatPrice(item.price * item.quantity) }}
              <span class="text-[10px] font-medium text-gray-400"> FCFA</span>
            </p>

            <!-- Quantité -->
            <div class="flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <button
                @click="handleDecrease(item)"
                :disabled="item.quantity <= 1"
                class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-[#274a82] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg leading-none">
                −
              </button>
              <span class="w-8 text-center text-sm font-black text-gray-800">{{ item.quantity }}</span>
              <button
                @click="handleIncrease(item)"
                class="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-[#274a82] hover:text-white transition-colors font-bold text-lg leading-none">
                +
              </button>
            </div>

            <!-- Supprimer -->
            <button
              @click="handleRemove(item)"
              class="flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#e60012] transition-colors font-bold">
              <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />
              Retirer
            </button>
          </div>
        </div>

        <!-- Continuer les achats -->
        <div class="pt-2">
          <NuxtLink to="/boutique"
            class="flex items-center gap-2 text-sm text-[#274a82] hover:text-[#e60012] font-bold transition-colors">
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
            Continuer mes achats
          </NuxtLink>
        </div>
      </div>

      <!-- ═══ RÉCAPITULATIF ═══ -->
      <div class="lg:col-span-1">
        <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden sticky top-6">

          <div class="bg-[#274a82] px-5 py-4">
            <h2 class="font-black text-white text-base tracking-wide">Récapitulatif</h2>
            <p class="text-white/60 text-[11px] mt-0.5">{{ itemCount }} article{{ itemCount > 1 ? 's' : '' }}</p>
          </div>

          <div class="px-5 py-4 space-y-3">

            <!-- Articles résumés -->
            <div class="space-y-2 pb-3 border-b border-gray-100">
              <div v-for="item in cartItems" :key="'recap-' + item.id"
                class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="bg-[#274a82]/10 text-[#274a82] text-[10px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0">
                    ×{{ item.quantity }}
                  </span>
                  <span class="text-xs text-gray-600 truncate">{{ item.name }}</span>
                </div>
                <span class="text-xs font-bold text-gray-800 flex-shrink-0 whitespace-nowrap">
                  {{ formatPrice(item.price * item.quantity) }}
                </span>
              </div>
            </div>

            <!-- Total -->
            <div class="pt-1">
              <div class="flex justify-between items-center">
                <span class="font-black text-gray-900 text-base">Total</span>
                <div class="text-right">
                  <p class="font-black text-[#e60012] text-xl leading-tight">{{ formatPrice(total) }}</p>
                  <p class="text-[10px] text-gray-400 font-medium">FCFA TTC</p>
                </div>
              </div>
            </div>

            <!-- Valider -->
            <NuxtLink to="/checkout"
              class="flex items-center justify-center gap-2 w-full py-3.5 bg-[#e60012] hover:bg-[#c4000f] text-white font-black text-sm rounded-xl transition-colors shadow-sm hover:shadow-md mt-1">
              <UIcon name="i-heroicons-lock-closed" class="w-4 h-4" />
              Valider la commande
            </NuxtLink>

            <!-- <div class="flex items-center justify-center gap-2 pt-1">
              <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5 text-gray-400" />
              <span class="text-[10px] text-gray-400 font-medium">Paiement 100% sécurisé</span>
            </div> -->
          </div>
        </div>
      </div>
    </div>

  </UContainer>
</template>