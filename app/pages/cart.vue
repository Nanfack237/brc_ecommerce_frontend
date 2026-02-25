<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const cartItems = ref([
  {
    id: 1,
    name: 'Dell Latitude 5510',
    description: 'Core i5 10e Gen · 8GB RAM · SSD 512GB',
    price: 139000,
    quantity: 1,
    image: '/images/products/dell-5510.png'
  },
  {
    id: 2,
    name: 'Sacoche Laptop',
    description: 'Sacoche de protection pour laptop 15 pouces',
    price: 25000,
    quantity: 1,
    image: '/images/products/laptop-bag.png'
  }
])

// Sous-total
const subtotal = computed(() =>
  cartItems.value.reduce((t, i) => t + i.price * i.quantity, 0)
)

// Livraison (si >150k gratuite)
const shipping = computed(() => (subtotal.value >= 150000 ? 0 : 3000))

// Total
const total = computed(() => subtotal.value + shipping.value)

// Navigation checkout
const goToCheckout = () => router.push('/checkout')

// Supprimer un article
const removeItem = (id: number) => {
  cartItems.value = cartItems.value.filter(item => item.id !== id)
}

// Modifier la quantité
const updateQuantity = (item: any, value: number) => {
  if (value < 1) return
  item.quantity = value
}
</script>

<template>
  <UContainer class="py-10">
    <h1 class="text-2xl font-bold mb-6">Panier</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- ARTICLES -->
      <div class="lg:col-span-2 space-y-4">
        <UCard
          v-for="item in cartItems"
          :key="item.id"
          class="flex gap-4 items-center"
        >
          <img
            :src="item.image"
            class="w-24 h-24 object-contain border rounded-md"
          />

          <div class="flex-1">
            <h3 class="font-semibold">{{ item.name }}</h3>
            <p class="text-sm text-gray-500">{{ item.description }}</p>

            <div class="mt-3 flex items-center gap-4">
              <div class="flex items-center border rounded">
                <button
                  class="px-2 py-1"
                  @click="updateQuantity(item, item.quantity - 1)"
                >
                  -
                </button>
                <span class="px-2">{{ item.quantity }}</span>
                <button
                  class="px-2 py-1"
                  @click="updateQuantity(item, item.quantity + 1)"
                >
                  +
                </button>
              </div>

              <p class="font-semibold text-[#e60012]">
                {{ (item.price * item.quantity).toLocaleString() }} FCFA
              </p>
            </div>
          </div>

          <button
            @click="removeItem(item.id)"
            class="text-red-600 hover:text-red-800"
            title="Supprimer"
          >
            <UIcon name="i-heroicons-trash" class="w-6 h-6" />
          </button>
        </UCard>

        <!-- SI PANIER VIDE -->
        <div v-if="cartItems.length === 0" class="text-center text-gray-500 py-10">
          Votre panier est vide 😔
        </div>
      </div>

      <!-- RÉCAP + VALIDER LA COMMANDE -->
      <UCard class="h-fit sticky top-6">
        <h2 class="font-semibold mb-4">Récapitulatif</h2>

        <div class="text-sm space-y-2">
          <div class="flex justify-between">
            <span>Sous-total</span>
            <span>{{ subtotal.toLocaleString() }} FCFA</span>
          </div>
          <div class="flex justify-between">
            <span>Livraison</span>
            <span>{{ shipping === 0 ? 'Gratuite' : shipping + ' FCFA' }}</span>
          </div>
          <UDivider />
          <div class="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span class="text-[#e60012]">
              {{ total.toLocaleString() }} FCFA
            </span>
          </div>
            <UButton
          block
          size="lg"
          class="mt-6 bg-[#e60012] hover:bg-red-700"
          icon="i-heroicons-check-circle"
          
         
        >
          Valider la commande
        </UButton>
        </div>

      
      </UCard>
    </div>
  </UContainer>
</template>
