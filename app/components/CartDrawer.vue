<script setup lang="ts">
import useCart from '@/composables/useCart'

const { cartItems, totalPrice, totalItems, isCartOpen, increaseQty, decreaseQty, removeItem, clearCart } = useCart()
</script>

<template>
  <div class="relative inline-flex">

    <!-- Bouton panier -->
    <UButton
      color="neutral"
      variant="ghost"
      icon="i-heroicons-shopping-cart-solid"
      aria-label="Panier"
      @click="isCartOpen = true"
    />

    <!-- Badge nombre d'articles -->
    <span
      v-if="totalItems > 0"
      class="absolute -top-2 -right-2 min-w-[20px] h-[20px] px-1 bg-[#e60012] text-white text-[10px] font-black rounded-full flex items-center justify-center pointer-events-none z-10 shadow"
    >
      {{ totalItems > 99 ? '99+' : totalItems }}
    </span>

    <!-- Drawer panier -->
    <UDrawer v-model:open="isCartOpen" direction="right">
      <template #content>
        <div class="w-[380px] flex flex-col h-full bg-white">

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-shopping-cart-solid" class="w-5 h-5 text-[#274a82]" />
              <h2 class="text-lg font-bold text-gray-900">Mon Panier</h2>
              <span v-if="totalItems > 0" class="text-xs bg-[#274a82]/10 text-[#274a82] font-bold px-2 py-0.5 rounded-full">
                {{ totalItems }} article{{ totalItems > 1 ? 's' : '' }}
              </span>
            </div>
            <button @click="isCartOpen = false" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>

          <!-- Liste produits -->
          <div class="flex-1 overflow-y-auto px-4 py-4">

            <!-- Panier vide -->
            <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center h-full gap-4 py-16">
              <div class="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                <UIcon name="i-heroicons-shopping-cart" class="w-10 h-10 text-gray-200" />
              </div>
              <p class="font-semibold text-gray-500">Votre panier est vide</p>
              <UButton @click="isCartOpen = false" color="error" variant="outline" size="sm" class="font-bold">
                Continuer mes achats
              </UButton>
            </div>

            <!-- Articles -->
            <div v-else class="space-y-3">
              <div
                v-for="(item, index) in cartItems"
                :key="item.id"
                class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">{{ item.name }}</h3>
                  <p v-if="item.options" class="text-xs text-gray-400 mt-0.5">{{ item.options }}</p>
                  <p class="text-sm font-black text-[#274a82] mt-1">{{ (item.price * item.quantity).toLocaleString() }} FCFA</p>
                </div>

                <div class="flex flex-col items-end gap-2">
                  <button @click="removeItem(index)" class="text-gray-300 hover:text-[#e60012] transition-colors">
                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                  </button>
                  <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button @click="decreaseQty(index)" class="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 font-bold text-sm">−</button>
                    <span class="w-7 text-center text-sm font-bold text-gray-800">{{ item.quantity }}</span>
                    <button @click="increaseQty(index)" class="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 font-bold text-sm">+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div v-if="cartItems.length > 0" class="flex-shrink-0 border-t border-gray-100 px-5 py-4 space-y-3">
            <div class="flex items-center justify-between py-1">
              <span class="text-sm text-gray-500 font-medium">Sous-total</span>
              <span class="text-xl font-black text-gray-900">{{ totalPrice.toLocaleString() }} <span class="text-xs font-medium">FCFA</span></span>
            </div>
            <NuxtLink to="/checkout" @click="isCartOpen = false">
              <UButton block color="error" class="font-bold " trailing-icon="i-heroicons-credit-card-solid">
                Passer à la caisse
              </UButton>
            </NuxtLink>
            <NuxtLink to="/panier" @click="isCartOpen = false">
              <UButton block variant="outline" color="neutral" class="font-bold my-2" trailing-icon="i-heroicons-shopping-bag-solid">
                Voir le panier
              </UButton>
            </NuxtLink>
            <button @click="clearCart" class="w-full text-center text-xs text-gray-400 hover:text-[#e60012] transition-colors font-medium pt-1">
              Vider le panier
            </button>
          </div>

        </div>
      </template>
    </UDrawer>

  </div>
</template>