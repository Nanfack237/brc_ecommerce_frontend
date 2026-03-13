<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const { requireAdmin, token } = useAuth()
requireAdmin()

useHead({ title: 'Avis clients — Admin BRC Market' })

const toast  = useToast()
const config = useRuntimeConfig()
const API    = config.public.apiBase

const authHeaders = computed(() => ({
  Authorization: `Bearer ${token.value}`,
  Accept: 'application/json',
}))

// ── Types ──────────────────────────────────────────────────────────────────────
interface Review {
  id:            number
  rating:        number
  comment:       string | null
  is_approved:   boolean
  created_at:    string
  helpful_count: number
  order_id:      number | null
  user:          { id: number; first_name: string; last_name: string } | null
  product:       { id: number; name: string; slug: string } | null
}

interface Meta {
  current_page: number
  last_page:    number
  per_page:     number
  total:        number
  from:         number | null
  to:           number | null
}

// ── State ──────────────────────────────────────────────────────────────────────
const reviews      = ref<Review[]>([])
const meta         = ref<Meta>({ current_page: 1, last_page: 1, per_page: 15, total: 0, from: null, to: null })
const loading      = ref(true)
const activeFilter = ref('all')
const searchQuery  = ref('')
const perPage      = 15

const filters = [
  { key: 'all',      label: 'Tous'        },
  { key: 'pending',  label: 'En attente'  },
  { key: 'approved', label: 'Approuvés'   },
]

// ── Stats (sur la page courante) ───────────────────────────────────────────────
const stats = computed(() => ({
  approved: reviews.value.filter(r =>  r.is_approved).length,
  pending:  reviews.value.filter(r => !r.is_approved).length,
}))

// ── Fetch ──────────────────────────────────────────────────────────────────────
const fetchReviews = async (page = 1) => {
  loading.value = true
  try {
    const params: Record<string, any> = { page, per_page: perPage }
    if (activeFilter.value === 'approved') params.approved = 1
    if (activeFilter.value === 'pending')  params.approved = 0
    if (searchQuery.value.trim())          params.search   = searchQuery.value.trim()

    const { data } = await axios.get(`${API}/admin/reviews`, {
      headers: authHeaders.value,
      params,
    })

    reviews.value = data.data ?? data
    meta.value = {
      current_page: data.current_page ?? data.meta?.current_page ?? 1,
      last_page:    data.last_page    ?? data.meta?.last_page    ?? 1,
      per_page:     data.per_page     ?? data.meta?.per_page     ?? perPage,
      total:        data.total        ?? data.meta?.total        ?? 0,
      from:         data.from         ?? data.meta?.from         ?? null,
      to:           data.to           ?? data.meta?.to           ?? null,
    }
  } catch (e: any) {
    toast.add({ title: "Erreur de chargement", description: e?.response?.data?.message, color: "error", icon: "i-heroicons-exclamation-circle" })
  } finally {
    loading.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout>
const onSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchReviews(1), 400)
}

const onFilterChange = (key: string) => {
  activeFilter.value = key
  fetchReviews(1)
}

const goToPage = (page: number) => {
  if (page < 1 || page > meta.value.last_page) return
  fetchReviews(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Approuver / Rejeter ────────────────────────────────────────────────────────
const togglingId = ref<number | null>(null)

const toggleApproval = async (review: Review) => {
  togglingId.value = review.id
  const endpoint   = review.is_approved ? 'reject' : 'approve'
  const wasApproved = review.is_approved
  try {
    await axios.patch(`${API}/admin/reviews/${review.id}/${endpoint}`, {}, { headers: authHeaders.value })
    review.is_approved = !wasApproved
    toast.add({
      title:       wasApproved ? "Avis rejeté" : "Avis approuvé",
      description: wasApproved ? "L'avis ne sera plus visible." : "L'avis est maintenant visible sur la fiche produit.",
      color:       wasApproved ? "warning" : "success",
      icon:        wasApproved ? "i-heroicons-eye-slash" : "i-heroicons-check-circle",
    })
  } catch (e: any) {
    toast.add({ title: "Erreur", description: e?.response?.data?.message ?? "Impossible.", color: "error", icon: "i-heroicons-x-circle" })
  } finally {
    togglingId.value = null
  }
}

// ── Supprimer ──────────────────────────────────────────────────────────────────
const deletingId = ref<number | null>(null)

const deleteReview = async (review: Review) => {
  deletingId.value = review.id
  try {
    await axios.delete(`${API}/admin/reviews/${review.id}`, { headers: authHeaders.value })
    reviews.value     = reviews.value.filter(r => r.id !== review.id)
    meta.value.total  = Math.max(0, meta.value.total - 1)
    toast.add({ title: "Avis supprimé", color: "neutral", icon: "i-heroicons-trash" })
  } catch (e: any) {
    toast.add({ title: "Erreur", description: e?.response?.data?.message ?? "Impossible.", color: "error", icon: "i-heroicons-x-circle" })
  } finally {
    deletingId.value = null
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const reviewerName    = (r: Review) => r.user ? `${r.user.first_name} ${r.user.last_name}` : "Anonyme"
const reviewerInitial = (r: Review) => r.user?.first_name?.[0]?.toUpperCase() ?? "?"
const formatDate      = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
const starColor = (rating: number) => {
  if (rating >= 4) return "text-green-500"
  if (rating === 3) return "text-yellow-500"
  return "text-red-500"
}

const pageNumbers = computed(() => {
  const total = meta.value.last_page
  const cur   = meta.value.current_page
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "...")[] = [1]
  if (cur > 3) pages.push("...")
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
  if (cur < total - 2) pages.push("...")
  pages.push(total)
  return pages
})

onMounted(() => fetchReviews())
</script>

<template>
  <div class="space-y-5">

    <!-- Header -->
    <div>
      <h1 class="text-2xl font-black text-gray-900">Avis clients</h1>
      <p class="text-gray-400 text-sm mt-0.5">{{ meta.total }} avis au total</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5">
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
        <p class="text-2xl font-black text-gray-900 mt-1">{{ meta.total }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5">
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Approuvés</p>
        <p class="text-2xl font-black text-green-600 mt-1">{{ stats.approved }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5">
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">En attente</p>
        <p class="text-2xl font-black text-yellow-500 mt-1">{{ stats.pending }}</p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex gap-2">
        <button v-for="f in filters" :key="f.key" @click="onFilterChange(f.key)"
          class="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          :class="activeFilter === f.key
            ? 'bg-[#274a82] text-white shadow-sm'
            : 'bg-white border border-gray-200 text-gray-600 hover:border-[#274a82] hover:text-[#274a82]'">
          {{ f.label }}
        </button>
      </div>
      <UInput v-model="searchQuery" @input="onSearch"
        icon="i-heroicons-magnifying-glass" placeholder="Auteur, produit..." size="sm" class="w-56" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="w-8 h-8 border-4 border-[#274a82] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Liste -->
    <div v-else-if="reviews.length" class="space-y-3">
      <div v-for="review in reviews" :key="review.id"
        class="bg-white rounded-2xl border shadow-sm p-5 transition-all"
        :class="!review.is_approved ? 'border-yellow-100 bg-yellow-50/20' : 'border-gray-100'">

        <div class="flex items-start justify-between gap-4">

          <div class="flex items-start gap-3 flex-1 min-w-0">
            <!-- Avatar initiale -->
            <div class="w-9 h-9 rounded-xl bg-[#274a82]/10 flex items-center justify-center flex-shrink-0">
              <span class="text-[#274a82] text-xs font-black">{{ reviewerInitial(review) }}</span>
            </div>

            <div class="flex-1 min-w-0">
              <!-- Auteur · Produit · Date -->
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <p class="font-bold text-gray-900 text-sm">{{ reviewerName(review) }}</p>
                <span class="text-gray-300">·</span>
                <p class="text-xs text-[#274a82] font-semibold truncate max-w-[180px]">
                  {{ review.product?.name ?? 'Produit supprimé' }}
                </p>
                <span class="text-gray-300">·</span>
                <p class="text-xs text-gray-400">{{ formatDate(review.created_at) }}</p>
                <span v-if="review.order_id"
                  class="text-[10px] font-black px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                  Achat vérifié
                </span>
              </div>

              <!-- Étoiles -->
              <div class="flex items-center gap-0.5 mb-2">
                <UIcon v-for="n in 5" :key="n" name="i-heroicons-star-solid" class="w-3.5 h-3.5"
                  :class="n <= review.rating ? starColor(review.rating) : 'text-gray-200'" />
                <span class="text-xs font-bold ml-1.5" :class="starColor(review.rating)">
                  {{ review.rating }}/5
                </span>
              </div>

              <!-- Commentaire -->
              <p class="text-sm text-gray-600 leading-relaxed">{{ review.comment ?? '—' }}</p>

              <!-- Badges -->
              <div class="flex items-center gap-2 mt-2.5 flex-wrap">
                <span v-if="review.is_approved"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-700">
                  <UIcon name="i-heroicons-check-circle" class="w-3 h-3" />
                  Approuvé · Visible
                </span>
                <span v-else
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-100 text-yellow-700">
                  <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                  En attente de validation
                </span>
                <span v-if="review.helpful_count > 0"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                  <UIcon name="i-heroicons-hand-thumb-up" class="w-3 h-3" />
                  {{ review.helpful_count }} utile(s)
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <button @click="toggleApproval(review)" :disabled="togglingId === review.id"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all disabled:opacity-50 border"
              :class="review.is_approved
                ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'">
              <UIcon
                :name="togglingId === review.id ? 'i-heroicons-arrow-path' : review.is_approved ? 'i-heroicons-eye-slash' : 'i-heroicons-check-circle'"
                class="w-3.5 h-3.5" :class="togglingId === review.id ? 'animate-spin' : ''" />
              {{ review.is_approved ? 'Rejeter' : 'Approuver' }}
            </button>

            <button @click="deleteReview(review)" :disabled="deletingId === review.id"
              class="w-7 h-7 rounded-lg bg-red-50 hover:bg-[#e60012] text-red-400 hover:text-white flex items-center justify-center transition-all disabled:opacity-40">
              <UIcon :name="deletingId === review.id ? 'i-heroicons-arrow-path' : 'i-heroicons-trash'"
                class="w-3.5 h-3.5" :class="deletingId === review.id ? 'animate-spin' : ''" />
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- Vide -->
    <div v-else class="text-center py-16 bg-white rounded-2xl border border-gray-100">
      <UIcon name="i-heroicons-star" class="w-12 h-12 text-gray-200 mx-auto mb-3" />
      <p class="text-gray-400 font-medium">Aucun avis trouvé</p>
      <button v-if="activeFilter !== 'all' || searchQuery" @click="onFilterChange('all'); searchQuery = ''"
        class="mt-3 text-xs text-[#274a82] hover:underline font-bold">
        Réinitialiser les filtres
      </button>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && meta.last_page > 1" class="flex items-center justify-between pt-2">
      <p class="text-xs text-gray-400">
        <span class="font-bold text-gray-600">{{ meta.from }}–{{ meta.to }}</span>
        sur {{ meta.total }} avis
      </p>

      <div class="flex items-center gap-1">
        <button @click="goToPage(meta.current_page - 1)" :disabled="meta.current_page === 1"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
        </button>

        <template v-for="(page, i) in pageNumbers" :key="i">
          <span v-if="page === '...'" class="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
          <button v-else @click="goToPage(page as number)"
            class="w-8 h-8 rounded-lg text-xs font-bold transition-all"
            :class="page === meta.current_page ? 'bg-[#274a82] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'">
            {{ page }}
          </button>
        </template>

        <button @click="goToPage(meta.current_page + 1)" :disabled="meta.current_page === meta.last_page"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
        </button>
      </div>
    </div>

  </div>
</template>