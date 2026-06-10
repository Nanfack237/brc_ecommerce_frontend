<script setup lang="ts">
import { ref, computed, h, resolveComponent, onMounted } from 'vue'
import axios from 'axios'
import type { TableColumn } from '@nuxt/ui'

const { requireAuth, token } = useAuth()
requireAuth()

const { t } = useI18n()

useHead({
  title: t('histo_livreur.seo_title'),
  titleTemplate: (ti) => ti ? `${ti} - BRC Market` : 'BRC Market',
})

const config = useRuntimeConfig()
const API    = config.public.apiBase
const UIcon  = resolveComponent('UIcon')

interface Order {
  id: number
  order_number: string
  status: string
  total: number
  created_at: string
  delivered_at: string | null
  shipping_first_name: string
  shipping_last_name: string
  items: any[]
}

const orders  = ref<Order[]>([])
const loading = ref(true)
const authHeaders = computed(() => ({ Authorization: `Bearer ${token.value}` }))

const fetchHistory = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API}/livreur/livraisons`, { 
      headers: authHeaders.value,
      params: { status: 'delivered' }
    })
    const allOrders = data.data ?? data
    orders.value = allOrders.filter((o: Order) => o.status === 'delivered')
  } catch {
    console.error("Erreur historique")
  } finally {
    loading.value = false
  }
}

const formatPrice = (p: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 })
    .format(p).replace('XAF', 'FCFA')

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const columns: TableColumn<Order>[] = [
  {
    id: 'info', header: t('histo_livreur.col_order'),
    cell: ({ row }) => h('div', {}, [
      h('p', { class: 'font-bold text-gray-900' }, t('histo_livreur.order_number', { number: row.original.order_number })),
      h('p', { class: 'text-[10px] text-gray-400' },
        row.original.delivered_at
          ? t('histo_livreur.delivered_at', { date: formatDate(row.original.delivered_at) })
          : t('histo_livreur.delivered_at_empty')
      ),
    ])
  },
  {
    id: 'client', header: t('histo_livreur.col_client'),
    cell: ({ row }) => h('p', { class: 'text-sm' }, `${row.original.shipping_first_name} ${row.original.shipping_last_name}`)
  },
  {
    id: 'total', header: t('histo_livreur.col_amount'),
    cell: ({ row }) => h('p', { class: 'font-bold text-[#274a82]' }, formatPrice(row.original.total))
  },
  {
    id: 'status', header: t('histo_livreur.col_status'),
    cell: () => h('span', { class: 'px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase' }, t('histo_livreur.status_success'))
  }
]

onMounted(fetchHistory)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-gray-900">{{ $t('histo_livreur.page_title') }}</h1>
        <p class="text-sm text-gray-500">{{ $t('histo_livreur.subtitle') }}</p>
      </div>
      <div class="bg-green-50 px-4 py-2 rounded-xl border border-green-100">
        <p class="text-[13px] font-bold text-green-600">{{ $t('histo_livreur.total_label') }}</p>
        <p class="text-xl font-black text-green-700">{{ orders.length }}</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <UTable 
        :data="orders" 
        :columns="columns" 
        :loading="loading"
        :ui="{ tr: { base: 'hover:bg-gray-50/50 transition-colors' } }"
      >
        <template #empty>
          <div class="py-12 text-center">
            <UIcon name="i-heroicons-clock" class="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p class="text-gray-400 text-sm">{{ $t('histo_livreur.empty') }}</p>
          </div>
        </template>
      </UTable>
    </div>
  </div>
</template>