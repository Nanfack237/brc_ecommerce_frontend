<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const { requireAuth, token } = useAuth()
requireAuth()

const { t } = useI18n()

useHead({
  title: () => t('avis_compte.seo_title'),
  titleTemplate: (title) => title ? `${title} - BRC Market` : 'BRC Market',
})

const config = useRuntimeConfig()
const API    = config.public.apiBase
const toast  = useToast()

const authHeaders = computed(() => ({
  Authorization: `Bearer ${token.value}`,
  Accept: 'application/json',
}))

/* ── Types ──────────────────────────────────────────────────────────────────── */
interface Review {
  id:          number
  rating:      number
  comment:     string | null
  is_approved: boolean
  created_at:  string
  product: {
    id:     number
    name:   string
    slug:   string
    images: string[]
  } | null
}

/* ── State ──────────────────────────────────────────────────────────────────── */
const reviews    = ref<Review[]>([])
const loading    = ref(true)
const deletingId = ref<number | null>(null)

/* ── Fetch ──────────────────────────────────────────────────────────────────── */
const fetchMyReviews = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API}/my-reviews`, { headers: authHeaders.value })
    reviews.value = data.data ?? data ?? []
  } catch {
    reviews.value = []
  } finally {
    loading.value = false
  }
}

/* ── Supprimer ──────────────────────────────────────────────────────────────── */
const deleteReview = async (review: Review) => {
  deletingId.value = review.id
  try {
    await axios.delete(`${API}/reviews/${review.id}`, { headers: authHeaders.value })
    reviews.value = reviews.value.filter(r => r.id !== review.id)
    toast.add({
      title: t('avis_compte.toast_deleted_title'),
      color: 'neutral',
      icon:  'i-heroicons-trash',
    })
  } catch {
    toast.add({
      title:       t('avis_compte.toast_error_title'),
      description: t('avis_compte.toast_error_desc'),
      color:       'error',
      icon:        'i-heroicons-x-circle',
    })
  } finally {
    deletingId.value = null
  }
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

const starLabel = (n: number) => {
  const key = `avis_compte.star_label_${n}` as const
  return t(key) ?? ''
}

const starColor = (rating: number) => {
  if (rating >= 4) return '#22c55e'
  if (rating === 3) return '#eab308'
  return '#ef4444'
}

const productImage = (r: Review) => r.product?.images?.[0] ?? '/images/placeholder.jpg'

/* ── Stats ──────────────────────────────────────────────────────────────────── */
const stats = computed(() => ({
  total:    reviews.value.length,
  approved: reviews.value.filter(r =>  r.is_approved).length,
  pending:  reviews.value.filter(r => !r.is_approved).length,
}))

onMounted(fetchMyReviews)
</script>

<template>
  <div class="space-y-6">

    <!-- ══ BREADCRUMB + TITRE ══════════════════════════════════════════════ -->
    <div>
      <div class="hidden sm:flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">
          {{ $t('avis_compte.breadcrumb_home') }}
        </NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <span class="text-gray-600 font-medium">{{ $t('avis_compte.page_title') }}</span>
      </div>
      <h1 class="text-2xl font-black text-gray-900">{{ $t('avis_compte.page_title') }}</h1>
      <p class="text-gray-500 text-sm mt-0.5">
        {{ $t('avis_compte.subtitle', { count: reviews.length }) }}
      </p>
    </div>

    <!-- ══ LOADING ══════════════════════════════════════════════════════════ -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
      <div class="w-8 h-8 border-4 border-[#274a82] border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm text-gray-400 font-medium">{{ $t('avis_compte.loading') }}</span>
    </div>

    <template v-else>

      <!-- ══ STATS ══════════════════════════════════════════════════════════ -->
      <div v-if="reviews.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
          <p class="text-xs font-black text-gray-400 tracking-wider mb-1">
            {{ $t('avis_compte.stats_total') }}
          </p>
          <p class="text-2xl font-black text-gray-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
          <p class="text-xs font-black text-green-500 tracking-wider mb-1">
            {{ $t('avis_compte.stats_published') }}
          </p>
          <p class="text-2xl font-black text-green-600">{{ stats.approved }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
          <p class="text-xs font-black text-yellow-500 tracking-wider mb-1">
            {{ $t('avis_compte.stats_pending') }}
          </p>
          <p class="text-2xl font-black text-yellow-600">{{ stats.pending }}</p>
        </div>
      </div>

      <!-- ══ AUCUN AVIS ══════════════════════════════════════════════════════ -->
      <div v-if="reviews.length === 0"
        class="flex flex-col items-center justify-center py-20 gap-5 text-center">
        <div class="w-20 h-20 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
          <UIcon name="i-heroicons-star" class="w-10 h-10 text-gray-300" />
        </div>
        <div>
          <p class="text-base font-bold text-gray-700 mb-1">{{ $t('avis_compte.empty_title') }}</p>
          <p class="text-sm text-gray-400">{{ $t('avis_compte.empty_sub') }}</p>
        </div>
        <NuxtLink to="/boutique"
          class="flex items-center gap-2 px-5 py-2.5 bg-[#274a82] hover:bg-[#e60012] text-white font-bold rounded-xl transition-colors text-sm">
          <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4" />
          {{ $t('avis_compte.empty_btn') }}
        </NuxtLink>
      </div>

      <!-- ══ LISTE DES AVIS ══════════════════════════════════════════════════ -->
      <div v-else class="space-y-3">
        <div
          v-for="review in reviews" :key="review.id"
          class="bg-white border rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md"
          :class="review.is_approved ? 'border-gray-100' : 'border-yellow-100'"
        >
          <div class="flex gap-0 sm:gap-4">

            <!-- Image produit -->
            <NuxtLink
              :to="review.product ? `/products/${review.product.slug}` : '#'"
              class="hidden sm:flex w-24 flex-shrink-0 bg-[#f8f8f8] items-center justify-center border-r border-gray-100 hover:bg-gray-100 transition-colors"
            >
              <img
                v-if="review.product?.images?.[0]"
                :src="productImage(review)"
                :alt="review.product?.name"
                class="w-full h-full object-contain p-2"
              />
              <UIcon v-else name="i-heroicons-photo" class="w-8 h-8 text-gray-300" />
            </NuxtLink>

            <!-- Contenu -->
            <div class="flex-1 p-4 min-w-0">

              <!-- Nom produit + badge statut -->
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="min-w-0">
                  <NuxtLink
                    :to="review.product ? `/products/${review.product.slug}` : '#'"
                    class="block text-sm font-black text-[#274a82] hover:text-[#e60012] transition-colors truncate leading-tight"
                  >
                    {{ review.product?.name ?? $t('avis_compte.product_unavailable') }}
                  </NuxtLink>
                  <p class="text-[11px] text-gray-400 mt-0.5">{{ formatDate(review.created_at) }}</p>
                </div>

                <!-- Badge statut -->
                <div class="flex-shrink-0">
                  <span v-if="review.is_approved"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {{ $t('avis_compte.status_published') }}
                  </span>
                  <span v-else
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-yellow-100 text-yellow-700 border border-yellow-200 whitespace-nowrap">
                    <span class="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                    {{ $t('avis_compte.status_pending') }}
                  </span>
                </div>
              </div>

              <!-- Étoiles + note -->
              <div class="flex items-center gap-2 mb-2.5">
                <div class="flex items-center gap-0.5">
                  <UIcon
                    v-for="n in 5" :key="n"
                    :name="n <= review.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                    class="w-4 h-4"
                    :style="n <= review.rating ? { color: starColor(review.rating) } : { color: '#e5e7eb' }"
                  />
                </div>
                <span class="text-xs font-black" :style="{ color: starColor(review.rating) }">
                  {{ review.rating }}/5
                </span>
                <span class="text-xs text-gray-400 font-medium">— {{ starLabel(review.rating) }}</span>
              </div>

              <!-- Commentaire -->
              <div v-if="review.comment"
                class="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 mb-3">
                <p class="text-sm text-gray-700 leading-relaxed italic">
                  "{{ review.comment }}"
                </p>
              </div>
              <p v-else class="text-xs text-gray-400 italic mb-3">
                {{ $t('avis_compte.no_comment') }}
              </p>

              <!-- Statut modération + bouton supprimer -->
              <div class="flex items-center justify-between gap-3">
                <p v-if="!review.is_approved"
                  class="text-[11px] text-yellow-600 font-medium flex items-center gap-1">
                  <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
                  {{ $t('avis_compte.moderation_pending') }}
                </p>
                <p v-else
                  class="text-[11px] text-green-600 font-medium flex items-center gap-1">
                  <UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" />
                  {{ $t('avis_compte.moderation_visible') }}
                </p>

                <button
                  @click="deleteReview(review)"
                  :disabled="deletingId === review.id"
                  class="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-[#e60012] transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  <UIcon
                    :name="deletingId === review.id ? 'i-heroicons-arrow-path' : 'i-heroicons-trash'"
                    class="w-3.5 h-3.5"
                    :class="deletingId === review.id ? 'animate-spin' : ''"
                  />
                  {{ $t('avis_compte.btn_delete') }}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>