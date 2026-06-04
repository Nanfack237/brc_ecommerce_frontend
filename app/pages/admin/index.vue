<script setup lang="ts">
import axios from 'axios'

const { requireUserOrAdmin } = useAuth()
requireUserOrAdmin()

useHead({ title: 'BRC Market - Admin Dashboard' })

const config = useRuntimeConfig()
const API    = config.public.apiBase
const token  = useCookie('auth_token')
const authHeaders = computed(() => ({ Authorization: `Bearer ${token.value}` }))

// ── État ──────────────────────────────────────────────────────────────────
const loading = ref(true)

const stats = ref({
  orders:   { total: 0, change: 0 },
  revenue:  { total: 0, change: 0 },
  users:    { total: 0, change: 0 },
  products: { total: 0, change: 0 },
})

const recentOrders = ref<any[]>([])
const topProducts  = ref<any[]>([])

// ── Fetch ─────────────────────────────────────────────────────────────────
const fetchDashboard = async () => {
  try {
    const [ordersRes, usersRes, productsRes] = await Promise.all([
      axios.get(`${API}/admin/orders/dashboard-stats`,   { headers: authHeaders.value }),
      axios.get(`${API}/admin/users/dashboard-stats`,    { headers: authHeaders.value }),
      axios.get(`${API}/admin/products/dashboard-stats`, { headers: authHeaders.value }),
    ])

    const o = ordersRes.data
    const u = usersRes.data
    const p = productsRes.data

    stats.value = {
      orders:   { total: o.total   ?? 0, change: o.change   ?? 0 },
      revenue:  { total: o.revenue ?? 0, change: o.revenue_change ?? 0 },
      users:    { total: u.total   ?? 0, change: u.change   ?? 0 },
      products: { total: p.total   ?? 0, change: p.change   ?? 0 },
    }

    recentOrders.value = o.recent       ?? []
    topProducts.value  = p.top_products ?? []
  } catch (e) {
    console.error('[DASHBOARD] fetch failed', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchDashboard)

// ── Helpers ───────────────────────────────────────────────────────────────
const formatPrice = (p: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(p)

const formatChange = (change: number) =>
  change >= 0 ? `+${change}%` : `${change}%`

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:    { label: 'En attente',  color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'En cours',    color: 'bg-blue-100 text-blue-700'    },
  shipped:    { label: 'Expédiée',    color: 'bg-indigo-100 text-indigo-700' },
  delivered:  { label: 'Livrée',     color: 'bg-green-100 text-green-700'  },
  cancelled:  { label: 'Annulée',    color: 'bg-red-100 text-red-700'      },
}

const maxSales = computed(() =>
  topProducts.value.length ? Math.max(...topProducts.value.map((p: any) => p.sales_count ?? 1)) : 1
)
</script>

<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-gray-900">Dashboard</h1>
      </div>
    
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-24 animate-pulse" />
    </div>

    <!-- Stats -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 text-[#274a82]">
          <UIcon name="i-heroicons-shopping-bag" class="w-6 h-6" />
        </div>
        <div>
          <p class="text-xs text-gray-400 font-medium">Commandes totales</p>
          <p class="text-lg font-black text-gray-900">{{ stats.orders.total.toLocaleString('fr') }}</p>
          <p class="text-xs font-semibold" :class="stats.orders.change >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ formatChange(stats.orders.change) }} ce mois
          </p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50 text-green-600">
          <UIcon name="i-heroicons-banknotes" class="w-6 h-6" />
        </div>
        <div>
          <p class="text-xs text-gray-400 font-medium">Revenus du mois</p>
          <p class="text-lg font-black text-gray-900">{{ formatPrice(stats.revenue.total) }}</p>
          <p class="text-xs font-semibold" :class="stats.revenue.change >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ formatChange(stats.revenue.change) }} ce mois
          </p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-50 text-purple-600">
          <UIcon name="i-heroicons-users" class="w-6 h-6" />
        </div>
        <div>
          <p class="text-xs text-gray-400 font-medium">Utilisateurs</p>
          <p class="text-lg font-black text-gray-900">{{ stats.users.total.toLocaleString('fr') }}</p>
          <p class="text-xs font-semibold" :class="stats.users.change >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ formatChange(stats.users.change) }} ce mois
          </p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-orange-50 text-orange-500">
          <UIcon name="i-heroicons-cube" class="w-6 h-6" />
        </div>
        <div>
          <p class="text-xs text-gray-400 font-medium">Produits actifs</p>
          <p class="text-lg font-black text-gray-900">{{ stats.products.total.toLocaleString('fr') }}</p>
          <p class="text-xs font-semibold" :class="stats.products.change >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ formatChange(stats.products.change) }} ce mois
          </p>
        </div>
      </div>
    </div>

    <!-- Orders + Top products -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- Recent orders -->
      <div class="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 class="font-black text-gray-800">Commandes récentes</h2>
          <NuxtLink to="/admin/commandes" class="text-xs text-[#274a82] font-semibold hover:underline">Voir tout</NuxtLink>
        </div>

        <!-- Skeleton -->
        <div v-if="loading" class="divide-y divide-gray-50">
          <div v-for="i in 5" :key="i" class="flex items-center justify-between px-5 py-3">
            <div class="space-y-1.5">
              <div class="h-3 w-24 bg-gray-100 rounded animate-pulse" />
              <div class="h-2.5 w-36 bg-gray-100 rounded animate-pulse" />
            </div>
            <div class="flex items-center gap-3">
              <div class="h-3 w-20 bg-gray-100 rounded animate-pulse" />
              <div class="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        <div v-else-if="recentOrders.length === 0" class="px-5 py-10 text-center text-gray-400 text-sm">
          Aucune commande pour le moment.
        </div>

        <div v-else class="divide-y divide-gray-50">
          <div v-for="order in recentOrders" :key="order.id" class="flex items-center justify-between px-5 py-3">
            <div>
              <p class="text-sm font-bold text-gray-900"># {{ order.order_number ?? order.id }}</p>
              <p class="text-xs text-gray-400">
                {{ order.user?.first_name }} {{ order.user?.last_name }} · {{ new Date(order.created_at).toLocaleDateString('fr-FR') }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <p class="text-sm font-bold text-[#274a82]">{{ formatPrice(order.total) }}</p>
              <span
                class="px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="statusConfig[order.status]?.color ?? 'bg-gray-100 text-gray-600'"
              >
                {{ statusConfig[order.status]?.label ?? order.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top products -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-50">
          <h2 class="font-black text-gray-800">Top produits</h2>
        </div>

        <!-- Skeleton -->
        <div v-if="loading" class="divide-y divide-gray-50">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3 px-5 py-3">
            <div class="h-3 w-4 bg-gray-100 rounded animate-pulse" />
            <div class="flex-1 space-y-1.5">
              <div class="h-3 w-32 bg-gray-100 rounded animate-pulse" />
              <div class="h-2.5 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
            <div class="h-1.5 w-16 bg-gray-100 rounded-full animate-pulse" />
          </div>
        </div>

        <div v-else-if="topProducts.length === 0" class="px-5 py-10 text-center text-gray-400 text-sm">
          Aucun produit vendu pour le moment.
        </div>

        <div v-else class="divide-y divide-gray-50">
          <div v-for="(p, i) in topProducts" :key="p.id ?? p.name" class="flex items-center gap-3 px-5 py-3">
            <span class="text-xs font-black text-gray-300 w-4">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800 truncate">{{ p.name }}</p>
              <p class="text-xs text-gray-400">{{ p.sales_count }} ventes · stock: {{ p.stock ?? p.quantity ?? 0 }}</p>
            </div>
            <div class="w-16 bg-gray-100 rounded-full h-1.5">
              <div
                class="bg-[#274a82] h-1.5 rounded-full"
                :style="`width: ${(p.sales_count / maxSales) * 100}%`"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>