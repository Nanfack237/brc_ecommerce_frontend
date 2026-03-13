<script setup lang="ts">
const { requireAdmin } = useAuth()
requireAdmin()
useHead({ title: 'BRC Market - Admin Dashboard' })

const stats = [
  { label: 'Commandes totales', value: '1,284',  change: '+12%', icon: 'i-heroicons-shopping-bag',   color: 'bg-blue-50 text-[#274a82]' },
  { label: 'Revenus du mois',   value: '4,820,000 XAF', change: '+8%',  icon: 'i-heroicons-banknotes',       color: 'bg-green-50 text-green-600' },
  { label: 'Utilisateurs',      value: '342',    change: '+5%',  icon: 'i-heroicons-users',           color: 'bg-purple-50 text-purple-600' },
  { label: 'Produits actifs',   value: '87',     change: '+3%',  icon: 'i-heroicons-cube',            color: 'bg-orange-50 text-orange-500' },
]

const recentOrders = [
  { id: 'CM000010', client: 'Jean Mbala',    total: 185000, status: 'pending',   date: '2025-12-20' },
  { id: 'CM000009', client: 'Marie Nguema',  total: 45000,  status: 'shipped',   date: '2025-12-19' },
  { id: 'CM000008', client: 'Paul Biya Jr',  total: 320000, status: 'delivered', date: '2025-12-18' },
  { id: 'CM000007', client: 'Alice Nkomo',   total: 75000,  status: 'cancelled', date: '2025-12-17' },
  { id: 'CM000006', client: 'David Tchamba', total: 22500,  status: 'delivered', date: '2025-12-16' },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:   { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  shipped:   { label: 'Expédiée',   color: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Livrée',     color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulée',    color: 'bg-red-100 text-red-700' },
}

const formatPrice = (p: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(p)

const topProducts = [
  { name: 'iPhone 14 Pro',        sales: 34, stock: 12 },
  { name: 'Laptop HP 15s',        sales: 28, stock: 5 },
  { name: 'Samsung Galaxy S23',   sales: 21, stock: 18 },
  { name: 'Écran Dell 24"',       sales: 15, stock: 3 },
  { name: 'Souris Logitech MX',   sales: 12, stock: 24 },
]
</script>

<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-gray-900">Dashboard</h1>
        <p class="text-gray-400 text-sm mt-0.5">Bienvenue sur le panneau d'administration</p>
      </div>
      <NuxtLink to="/admin/produits">
        <UButton color="error" icon="i-heroicons-plus">Nouveau produit</UButton>
      </NuxtLink>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div
        v-for="stat in stats" :key="stat.label"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
      >
        <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" :class="stat.color">
          <UIcon :name="stat.icon" class="w-6 h-6" />
        </div>
        <div>
          <p class="text-xs text-gray-400 font-medium">{{ stat.label }}</p>
          <p class="text-lg font-black text-gray-900">{{ stat.value }}</p>
          <p class="text-xs text-green-500 font-semibold">{{ stat.change }} ce mois</p>
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
        <div class="divide-y divide-gray-50">
          <div v-for="order in recentOrders" :key="order.id" class="flex items-center justify-between px-5 py-3">
            <div>
              <p class="text-sm font-bold text-gray-900"># {{ order.id }}</p>
              <p class="text-xs text-gray-400">{{ order.client }} · {{ order.date }}</p>
            </div>
            <div class="flex items-center gap-3">
              <p class="text-sm font-bold text-[#274a82]">{{ formatPrice(order.total) }}</p>
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="statusConfig[order.status].color">
                {{ statusConfig[order.status].label }}
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
        <div class="divide-y divide-gray-50">
          <div v-for="(p, i) in topProducts" :key="p.name" class="flex items-center gap-3 px-5 py-3">
            <span class="text-xs font-black text-gray-300 w-4">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800 truncate">{{ p.name }}</p>
              <p class="text-xs text-gray-400">{{ p.sales }} ventes · stock: {{ p.stock }}</p>
            </div>
            <div class="w-16 bg-gray-100 rounded-full h-1.5">
              <div class="bg-[#274a82] h-1.5 rounded-full" :style="`width: ${(p.sales / 34) * 100}%`" />
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>

</template>