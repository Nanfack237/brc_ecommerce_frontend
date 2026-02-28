<template>
  <div class="relative inline-flex">
    <UDrawer direction="right">
      <!-- Cart Button -->
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-heroicons-shopping-cart-solid"
        aria-label="Cart"
      />

      <!-- Badge rouge -->
      <span
        v-if="cartItems.length > 0"
        class="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 bg-[#e60012] text-white text-[12px] font-black rounded-full flex items-center justify-center pointer-events-none z-10 shadow-md"
      >
        {{ cartItems.length > 99 ? '99+' : cartItems.length }}
      </span>

      <!-- Drawer Content -->
      <template #content>
        <div class="w-96 p-4 flex flex-col h-full">
          <h2 class="text-xl font-bold mb-4">Votre Panier</h2>

          <!-- Products List -->
          <div class="flex-1 overflow-y-auto space-y-4">
            <div v-for="(item, index) in cartItems" :key="index" class="flex items-center gap-4">
              <img :src="item.image" alt="product" class="w-16 h-16 object-cover rounded" />
              <div class="flex-1">
                <h3 class="font-semibold text-base">{{ item.name }}</h3>
                <p class="text-sm text-gray-500">{{ item.options || '' }}</p>
                <p class="text-sm font-semibold">{{ item.price }} FCFA</p>
              </div>
              <div class="flex items-center gap-2">
                <button @click="decreaseQty(index)" class="px-2 py-1 bg-gray-200 rounded">-</button>
                <span>{{ item.quantity }}</span>
                <button @click="increaseQty(index)" class="px-2 py-1 bg-gray-200 rounded">+</button>
              </div>
            </div>
          </div>

          <!-- Total & Actions -->
          <div class="mt-4 border-t pt-4">
            <div class="flex justify-between font-bold mb-4">
              <span>Total :</span>
              <span>{{ totalPrice }} FCFA</span>
            </div>
            <NuxtLink to="checkout">
              <UButton
                class="w-full bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center gap-2 py-2 font-semibold mb-2 transition"
                trailing-icon="i-heroicons-credit-card-solid"
              >
                Passer à la caisse
              </UButton>
            </NuxtLink>
            <UButton
              class="w-full bg-gray-400 hover:bg-[#e60012] flex items-center justify-center gap-2 py-2 font-semibold mb-2 transition"
              trailing-icon="i-heroicons-shopping-bag-solid"
            >
              Voir le Panier
            </UButton>
          </div>
        </div>
      </template>
    </UDrawer>
  </div>
</template>

<script setup lang="ts">
import useCart from '@/composables/useCart'

const { cartItems, totalPrice, increaseQty, decreaseQty } = useCart()
</script>