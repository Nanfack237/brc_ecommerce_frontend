<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ToastProps } from '@nuxt/ui'

useHead({ title: 'BRC Market - Admin Avis' })

const toast = useToast()

const reviews = ref([
  { id: 1, author: 'Jean Mbala',    product: 'Laptop HP 15s',        rating: 5, comment: 'Excellent produit, livraison rapide !',              date: '2025-12-01', blocked: false },
  { id: 2, author: 'Marie Nguema',  product: 'iPhone 14 Pro',        rating: 4, comment: 'Très bon téléphone, emballage parfait.',              date: '2025-12-05', blocked: false },
  { id: 3, author: 'Paul Biya Jr',  product: 'Souris Logitech MX',   rating: 2, comment: 'Produit correct mais livraison trop longue.',         date: '2025-12-08', blocked: false },
  { id: 4, author: 'Alice Nkomo',   product: 'Écran Dell 24"',       rating: 1, comment: 'Produit endommagé à la réception, très déçue.',       date: '2025-12-10', blocked: true  },
  { id: 5, author: 'David Tchamba', product: 'Samsung Galaxy S23',   rating: 5, comment: 'Parfait ! Je recommande BRC Market à tout le monde.', date: '2025-12-12', blocked: false },
])

const activeFilter = ref('all')
const filters = [
  { key: 'all',      label: 'Tous' },
  { key: 'active',   label: 'Actifs' },
  { key: 'blocked',  label: 'Bloqués' },
]

const searchQuery = ref('')

const filtered = computed(() => {
  let list = reviews.value
  if (activeFilter.value === 'active')  list = list.filter(r => !r.blocked)
  if (activeFilter.value === 'blocked') list = list.filter(r => r.blocked)
  if (searchQuery.value) list = list.filter(r =>
    r.author.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    r.product.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  return list
})

const toggleBlock = (review: any) => {
  review.blocked = !review.blocked
  toast.add({
    title: review.blocked ? 'Avis bloqué' : 'Avis débloqué',
    description: `L'avis de "${review.author}" a été ${review.blocked ? 'bloqué' : 'publié'}.`,
    color: review.blocked ? 'error' : 'success',
    icon: review.blocked ? 'i-heroicons-no-symbol' : 'i-heroicons-check-circle',
  } as ToastProps)
}

const deleteReview = (id: number) => {
  reviews.value = reviews.value.filter(r => r.id !== id)
  toast.add({ title: 'Avis supprimé', color: 'neutral', icon: 'i-heroicons-trash' } as ToastProps)
}

const starColor = (rating: number) => {
  if (rating >= 4) return 'text-green-500'
  if (rating === 3) return 'text-yellow-500'
  return 'text-red-500'
}
</script>

<template>
  <div class="flex-1 min-w-0 space-y-5">

        <!-- Header -->
        <div>
          <h1 class="text-2xl font-black text-gray-900">Avis clients</h1>
          <p class="text-gray-400 text-sm mt-0.5">{{ reviews.length }} avis au total</p>
        </div>

        <!-- Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex gap-2">
            <button
              v-for="f in filters" :key="f.key"
              @click="activeFilter = f.key"
              class="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              :class="activeFilter === f.key ? 'bg-[#274a82] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#274a82] hover:text-[#274a82]'"
            >{{ f.label }}</button>
          </div>
          <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="Rechercher..." size="sm" class="w-56" />
        </div>

        <!-- Reviews list -->
        <div class="space-y-3">
          <div
            v-for="review in filtered" :key="review.id"
            class="bg-white rounded-2xl border shadow-sm p-5 transition"
            :class="review.blocked ? 'border-red-100 opacity-60' : 'border-gray-100'"
          >
            <div class="flex items-start justify-between gap-4">

              <div class="flex items-start gap-3 flex-1 min-w-0">
                <!-- Avatar -->
                <div class="w-9 h-9 rounded-xl bg-[#274a82]/10 flex items-center justify-center flex-shrink-0">
                  <span class="text-[#274a82] text-xs font-black">{{ review.author[0] }}</span>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <p class="font-bold text-gray-900 text-sm">{{ review.author }}</p>
                    <span class="text-gray-300">·</span>
                    <p class="text-xs text-gray-400">{{ review.product }}</p>
                    <span class="text-gray-300">·</span>
                    <p class="text-xs text-gray-400">{{ review.date }}</p>
                  </div>

                  <!-- Stars -->
                  <div class="flex items-center gap-0.5 mb-2">
                    <UIcon
                      v-for="n in 5" :key="n"
                      name="i-heroicons-star-solid"
                      class="w-3.5 h-3.5"
                      :class="n <= review.rating ? starColor(review.rating) : 'text-gray-200'"
                    />
                    <span class="text-xs font-bold ml-1" :class="starColor(review.rating)">{{ review.rating }}/5</span>
                  </div>

                  <p class="text-sm text-gray-600 leading-relaxed">{{ review.comment }}</p>

                  <!-- Blocked badge -->
                  <span v-if="review.blocked" class="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
                    <UIcon name="i-heroicons-no-symbol" class="w-3 h-3" />
                    Bloqué
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <UButton
                  size="xs"
                  :color="review.blocked ? 'success' : 'error'"
                  :variant="review.blocked ? 'soft' : 'soft'"
                  :icon="review.blocked ? 'i-heroicons-check-circle' : 'i-heroicons-no-symbol'"
                  @click="toggleBlock(review)"
                >
                  {{ review.blocked ? 'Débloquer' : 'Bloquer' }}
                </UButton>
                <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" @click="deleteReview(review.id)" />
              </div>

            </div>
          </div>
        </div>

        <div v-if="filtered.length === 0" class="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <UIcon name="i-heroicons-star" class="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p class="text-gray-400">Aucun avis trouvé</p>
        </div>

      </div>
 
</template>