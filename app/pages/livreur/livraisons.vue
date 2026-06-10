<script setup lang="ts">
import { ref, computed, h, resolveComponent, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import type { TableColumn } from '@nuxt/ui'

const { requireAuth, token } = useAuth()
requireAuth()

const { t } = useI18n()

useHead({
  title: () => t('livreur_livraison.seo_title'),
  titleTemplate: (title) => title ? `${title} - BRC Market` : 'BRC Market',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
})

const toast  = useToast()
const config = useRuntimeConfig()
const API    = config.public.apiBase

const UIcon = resolveComponent('UIcon')

// ── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  id:            number
  product_name:  string
  product_image: string | null
  product_sku:   string | null
  unit_price:    number
  quantity:      number
  subtotal:      number
}

interface Order {
  id:                  number
  order_number:        string
  status:              string
  payment_method:      string
  payment_status:      string
  subtotal:            number
  shipping_cost:       number
  discount_amount:     number
  total:               number
  created_at:          string
  shipped_at:          string | null
  delivered_at:        string | null
  shipping_first_name: string
  shipping_last_name:  string
  shipping_city:       string | null
  shipping_street:     string | null
  shipping_country:    string | null
  shipping_phone:      string
  notes?:              string | null
  items:               OrderItem[]
}

// ── State ────────────────────────────────────────────────────────────────────
const orders             = ref<Order[]>([])
const loading            = ref(true)
const delivering         = ref<number | null>(null)
const activeFilter       = ref('all')
const selectedOrder      = ref<Order | null>(null)
const showDetail         = ref(false)
const orderToDeliver     = ref<Order | null>(null)
const showDeliverConfirm = ref(false)

const authHeaders = computed(() => ({ Authorization: `Bearer ${token.value}` }))

// ── Configs réactives ────────────────────────────────────────────────────────
const statusConfig = computed<Record<string, { label: string; bg: string; text: string; icon: string }>>(() => ({
  processing: { label: t('livreur_livraison.status_processing'), bg: '#dbeafe', text: '#1e40af', icon: 'i-heroicons-cog-6-tooth'  },
  shipped:    { label: t('livreur_livraison.status_shipped'),    bg: '#e0f2fe', text: '#0369a1', icon: 'i-heroicons-truck'         },
  delivered:  { label: t('livreur_livraison.status_delivered'),  bg: '#dcfce7', text: '#166534', icon: 'i-heroicons-check-circle'  },
  cancelled:  { label: t('livreur_livraison.status_cancelled'),  bg: '#fee2e2', text: '#991b1b', icon: 'i-heroicons-x-circle'      },
}))

const paymentConfig = computed<Record<string, { label: string; icon: string }>>(() => ({
  mobile_money:     { label: t('livreur_livraison.payment_mobile_money'),     icon: 'i-heroicons-device-phone-mobile' },
  cash_on_delivery: { label: t('livreur_livraison.payment_cash_on_delivery'), icon: 'i-heroicons-banknotes'           },
  card:             { label: t('livreur_livraison.payment_card'),             icon: 'i-heroicons-credit-card'         },
  bank_transfer:    { label: t('livreur_livraison.payment_bank_transfer'),    icon: 'i-heroicons-building-library'    },
}))

const filters = computed(() => [
  { key: 'all',        label: t('livreur_livraison.filter_all')        },
  { key: 'processing', label: t('livreur_livraison.filter_processing') },
  { key: 'shipped',    label: t('livreur_livraison.filter_shipped')    },
  { key: 'delivered',  label: t('livreur_livraison.filter_delivered')  },
])

// ── Filtered + stats ─────────────────────────────────────────────────────────
const filteredOrders = computed(() =>
  activeFilter.value === 'all'
    ? orders.value
    : orders.value.filter(o => o.status === activeFilter.value)
)

const stats = computed(() => ({
  total:      orders.value.length,
  processing: orders.value.filter(o => o.status === 'processing').length,
  shipped:    orders.value.filter(o => o.status === 'shipped').length,
  delivered:  orders.value.filter(o => o.status === 'delivered').length,
}))

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice = (p: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 })
    .format(p).replace('XAF', 'FCFA')

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

// ── Fetch ────────────────────────────────────────────────────────────────────
const fetchOrders = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API}/livreur/livraisons`, { headers: authHeaders.value })
    orders.value = data.data ?? data
  } catch {
    toast.add({ title: t('livreur_livraison.toast_load_error'), color: 'error', icon: 'i-heroicons-exclamation-circle' })
  } finally {
    loading.value = false
  }
}

// ── Détail ───────────────────────────────────────────────────────────────────
const openDetail = async (order: Order) => {
  try {
    const { data } = await axios.get(`${API}/livreur/livraisons/${order.id}`, { headers: authHeaders.value })
    selectedOrder.value = data
  } catch {
    selectedOrder.value = order
  }
  showDetail.value = true
}

// ── Confirmer livraison ───────────────────────────────────────────────────────
const askDeliver = (order: Order) => {
  orderToDeliver.value     = order
  showDeliverConfirm.value = true
}

const confirmDeliver = async () => {
  const order = orderToDeliver.value
  if (!order) return
  delivering.value         = order.id
  showDeliverConfirm.value = false
  try {
    await axios.patch(
      `${API}/livreur/livraisons/${order.id}/deliver`,
      {},
      { headers: authHeaders.value }
    )
    await fetchOrders()
    if (selectedOrder.value?.id === order.id) {
      const { data } = await axios.get(`${API}/livreur/livraisons/${order.id}`, { headers: authHeaders.value })
      selectedOrder.value = data
    }
    toast.add({ title: t('livreur_livraison.toast_delivered_title'), color: 'success', icon: 'i-heroicons-check-circle' })
  } catch (e: any) {
    toast.add({
      title:       t('livreur_livraison.toast_deliver_failed'),
      description: e?.response?.data?.message ?? t('livreur_livraison.toast_deliver_retry'),
      color:       'error',
      icon:        'i-heroicons-x-circle',
    })
  } finally {
    delivering.value     = null
    orderToDeliver.value = null
  }
}

// ── Colonnes ─────────────────────────────────────────────────────────────────
const columns = computed<TableColumn<Order>[]>(() => [
  {
    id: 'order', header: t('livreur_livraison.col_order'),
    cell: ({ row }) => {
      const o = row.original
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', { class: 'w-9 h-9 rounded-xl bg-[#274a82]/10 flex items-center justify-center flex-shrink-0' }, [
          h(UIcon, { name: 'i-heroicons-truck', class: 'w-4 h-4 text-[#274a82]' }),
        ]),
        h('div', {}, [
          h('p', { class: 'font-bold text-gray-900 text-sm' }, `#${o.order_number}`),
          h('p', { class: 'text-[11px] text-gray-400 mt-0.5' }, formatDate(o.created_at)),
        ]),
      ])
    },
  },
  {
    id: 'client', header: t('livreur_livraison.col_client'),
    cell: ({ row }) => {
      const o = row.original
      return h('div', {}, [
        h('p', { class: 'text-sm font-semibold text-gray-800' }, `${o.shipping_first_name} ${o.shipping_last_name}`),
        h('p', { class: 'text-[11px] text-gray-400 mt-0.5 flex items-center gap-1' }, [
          h(UIcon, { name: 'i-heroicons-phone', class: 'w-3 h-3' }),
          o.shipping_phone,
        ]),
      ])
    },
  },
  {
    id: 'adresse', header: t('livreur_livraison.col_address'),
    cell: ({ row }) => {
      const o    = row.original
      const addr = [o.shipping_street, o.shipping_city].filter(Boolean).join(', ')
      return h('div', { class: 'flex items-start gap-1.5' }, [
        h(UIcon, { name: 'i-heroicons-map-pin', class: 'w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0' }),
        h('p', { class: 'text-xs text-gray-600 max-w-[160px]' }, addr || '—'),
      ])
    },
  },
  {
    id: 'notes', header: t('livreur_livraison.col_notes'),
    cell: ({ row }) => {
      const note = row.original.notes
      return h('p', { class: 'text-xs text-gray-600 max-w-[160px]' }, note || '—')
    },
  },
  {
    id: 'items', header: t('livreur_livraison.col_items'),
    cell: ({ row }) => {
      const items = row.original.items ?? []
      if (!items.length) return h('span', { class: 'text-xs text-gray-300 italic' }, '—')
      const first = items[0]
      return h('div', { class: 'flex items-center gap-2' }, [
        h('div', { class: 'w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center' }, [
          first.product_image
            ? h('img', { src: first.product_image, class: 'w-full h-full object-cover' })
            : h(UIcon, { name: 'i-heroicons-cube', class: 'w-4 h-4 text-gray-300' }),
        ]),
        h('div', { class: 'min-w-0' }, [
          h('p', { class: 'text-xs font-semibold text-gray-800 truncate max-w-[140px]', title: first.product_name }, first.product_name),
          items.length > 1
            ? h('p', { class: 'text-[11px] text-gray-400' }, t('livreur_livraison.items_more', { count: items.length - 1 }))
            : h('p', { class: 'text-[11px] text-gray-400' }, t('livreur_livraison.items_qty', { count: first.quantity })),
        ]),
      ])
    },
  },
  {
    id: 'payment', header: t('livreur_livraison.col_payment'),
    cell: ({ row }) => {
      const o   = row.original
      const cfg = paymentConfig.value[o.payment_method] ?? { label: o.payment_method, icon: 'i-heroicons-banknotes' }
      const isPaid = o.payment_status === 'paid'
      return h('div', { class: 'space-y-1' }, [
        h('div', { class: 'flex items-center gap-1.5' }, [
          h(UIcon, { name: cfg.icon, class: 'w-3.5 h-3.5 text-gray-400 flex-shrink-0' }),
          h('span', { class: 'text-xs text-gray-600 font-medium' }, cfg.label),
        ]),
        h('span', {
          class: 'text-[10px] font-black px-2 py-0.5 rounded-full',
          style: { backgroundColor: isPaid ? '#dcfce7' : '#fef9c3', color: isPaid ? '#166534' : '#854d0e' },
        }, isPaid ? t('livreur_livraison.payment_paid') : t('livreur_livraison.payment_collect')),
      ])
    },
  },
  {
    id: 'status', header: t('livreur_livraison.col_status'),
    cell: ({ row }) => {
      const o   = row.original
      const cfg = statusConfig.value[o.status] ?? statusConfig.value.processing
      return h('span', {
        class: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black whitespace-nowrap',
        style: { backgroundColor: cfg.bg, color: cfg.text },
      }, [
        h(UIcon, { name: cfg.icon, class: 'w-3.5 h-3.5 flex-shrink-0' }),
        cfg.label,
      ])
    },
  },
  {
    id: 'actions', header: t('livreur_livraison.col_action'),
    cell: ({ row }) => {
      const o            = row.original
      const canDeliver   = ['processing', 'shipped'].includes(o.status)
      const isDelivering = delivering.value === o.id
      return h('div', { class: 'flex items-center justify-end gap-1.5' }, [
        h('button', {
          onClick: () => openDetail(o),
          class: 'w-7 h-7 rounded-lg bg-[#274a82]/10 hover:bg-[#274a82] text-[#274a82] hover:text-white flex items-center justify-center transition-all',
          title: t('livreur_livraison.action_view'),
        }, [h(UIcon, { name: 'i-heroicons-eye', class: 'w-3.5 h-3.5' })]),
        canDeliver
          ? h('button', {
              onClick: () => askDeliver(o),
              disabled: isDelivering,
              class: 'w-7 h-7 rounded-lg bg-green-50 hover:bg-green-600 text-green-500 hover:text-white flex items-center justify-center transition-all disabled:opacity-40',
              title: t('livreur_livraison.action_deliver'),
            }, [h(UIcon, {
              name: isDelivering ? 'i-heroicons-arrow-path' : 'i-heroicons-check-circle',
              class: `w-3.5 h-3.5 ${isDelivering ? 'animate-spin' : ''}`,
            })])
          : null,
      ])
    },
  },
])

// ── Polling ───────────────────────────────────────────────────────────────────
let pollingTimer: ReturnType<typeof setInterval>
const onVisibilityChange = () => { if (!document.hidden) fetchOrders() }

onMounted(() => {
  fetchOrders()
  pollingTimer = setInterval(fetchOrders, 30_000)
  document.addEventListener('visibilitychange', onVisibilityChange)
})
onUnmounted(() => {
  clearInterval(pollingTimer)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <div class="space-y-6">

    <!-- ══ BREADCRUMB + TITRE ══════════════════════════════════════════════ -->
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="hidden sm:flex items-center gap-2 text-sm text-gray-400 mb-2">
          <NuxtLink to="/livreur/livraisons" class="hover:text-[#274a82] transition-colors">
            {{ $t('livreur_livraison.breadcrumb_home') }}
          </NuxtLink>
          <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
          <span class="text-gray-600 font-medium">{{ $t('livreur_livraison.page_title') }}</span>
        </div>
        <h1 class="text-2xl font-black text-gray-900">{{ $t('livreur_livraison.page_title') }}</h1>
        <p class="text-gray-500 text-sm mt-0.5">
          {{ $t('livreur_livraison.subtitle', { count: stats.total }) }} ·
          <span class="text-gray-400 text-xs">{{ $t('livreur_livraison.auto_refresh') }}</span>
        </p>
      </div>
      <button
        @click="fetchOrders" :disabled="loading"
        class="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:border-[#274a82] hover:text-[#274a82] transition-all flex-shrink-0 disabled:opacity-50 mt-1"
      >
        <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" :class="loading ? 'animate-spin' : ''" />
        {{ $t('livreur_livraison.refresh_btn') }}
      </button>
    </div>

    <!-- ══ STATS ═══════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider">{{ $t('livreur_livraison.stats_total') }}</p>
        <p class="text-2xl font-black text-gray-900 mt-1">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider">{{ $t('livreur_livraison.stats_processing') }}</p>
        <p class="text-2xl font-black text-blue-500 mt-1">{{ stats.processing }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider">{{ $t('livreur_livraison.stats_shipped') }}</p>
        <p class="text-2xl font-black text-sky-500 mt-1">{{ stats.shipped }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider">{{ $t('livreur_livraison.stats_delivered') }}</p>
        <p class="text-2xl font-black text-green-600 mt-1">{{ stats.delivered }}</p>
      </div>
    </div>

    <!-- ══ FILTRES ══════════════════════════════════════════════════════════ -->
    <!-- Mobile -->
    <div class="sm:hidden">
      <div class="relative">
        <select
          v-model="activeFilter"
          class="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 pr-10 focus:outline-none focus:ring-2 focus:ring-[#274a82]/30 focus:border-[#274a82] transition-all"
        >
          <option v-for="f in filters" :key="f.key" :value="f.key">
            {{ f.label }}{{ f.key !== 'all' ? ` (${orders.filter(o => o.status === f.key).length})` : '' }}
          </option>
        </select>
        <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>

    <!-- Desktop -->
    <div class="hidden sm:flex gap-2 flex-wrap">
      <button
        v-for="f in filters" :key="f.key"
        @click="activeFilter = f.key"
        class="px-4 py-2 rounded-full text-sm font-semibold transition-all"
        :class="activeFilter === f.key
          ? 'bg-[#274a82] text-white shadow-sm'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-[#274a82] hover:text-[#274a82]'"
      >
        {{ f.label }}
        <span v-if="f.key !== 'all'" class="ml-1.5 text-[11px] opacity-70">
          {{ orders.filter(o => o.status === f.key).length }}
        </span>
      </button>
    </div>

    <!-- ══ TABLE ════════════════════════════════════════════════════════════ -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <UTable
        :loading="loading"
        loading-color="primary"
        loading-animation="carousel"
        :data="filteredOrders"
        :columns="columns"
        :ui="{
          thead: 'bg-gray-50/60',
          th: { base: 'text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3.5 text-left border-b border-gray-100' },
          td: { base: 'px-5 py-3.5 border-b border-gray-50' },
          tr: { base: 'transition-colors hover:bg-gray-50/40' },
        }"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center py-16 gap-3">
            <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <UIcon name="i-heroicons-truck" class="w-7 h-7 text-gray-300" />
            </div>
            <p class="text-gray-400 text-sm font-medium">
              {{ activeFilter === 'all'
                ? $t('livreur_livraison.empty_all')
                : $t('livreur_livraison.empty_filtered') }}
            </p>
            <button v-if="activeFilter !== 'all'" @click="activeFilter = 'all'"
              class="text-xs text-[#274a82] hover:underline font-bold">
              {{ $t('livreur_livraison.empty_show_all') }}
            </button>
          </div>
        </template>
      </UTable>
    </div>

    <!-- ══ MODAL DÉTAIL ═════════════════════════════════════════════════════ -->
    <UModal v-model:open="showDetail">
      <template #content>
        <div v-if="selectedOrder" class="p-6 max-h-[90vh] overflow-y-auto">

          <div class="flex items-start justify-between mb-5">
            <div>
              <h2 class="text-lg font-black text-gray-900">#{{ selectedOrder.order_number }}</h2>
              <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(selectedOrder.created_at) }}</p>
            </div>
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
              :style="{
                backgroundColor: statusConfig[selectedOrder.status]?.bg ?? '#f3f4f6',
                color: statusConfig[selectedOrder.status]?.text ?? '#6b7280',
              }"
            >
              <UIcon :name="statusConfig[selectedOrder.status]?.icon ?? 'i-heroicons-truck'" class="w-3.5 h-3.5" />
              {{ statusConfig[selectedOrder.status]?.label ?? selectedOrder.status }}
            </span>
          </div>

          <!-- Infos client -->
          <div class="p-4 bg-orange-50/50 border border-orange-100 rounded-xl mb-4">
            <p class="text-[13px] font-black text-gray-400 tracking-wider mb-2">
              {{ $t('livreur_livraison.detail_delivery_info') }}
            </p>
            <p class="text-sm font-bold text-gray-800">
              {{ selectedOrder.shipping_first_name }} {{ selectedOrder.shipping_last_name }}
            </p>
            <div class="flex items-center gap-1.5 mt-1">
              <UIcon name="i-heroicons-phone" class="w-3.5 h-3.5 text-[#274a82]" />
              <a :href="`tel:${selectedOrder.shipping_phone}`"
                class="text-sm text-[#274a82] font-semibold hover:underline">
                {{ selectedOrder.shipping_phone }}
              </a>
            </div>
            <div class="flex items-start gap-1.5 mt-1">
              <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-gray-400 mt-0.5" />
              <p class="text-xs text-gray-500">
                {{ [selectedOrder.shipping_street, selectedOrder.shipping_city, selectedOrder.shipping_country].filter(Boolean).join(', ') || '—' }}
              </p>
            </div>
          </div>

          <!-- Articles -->
          <div class="space-y-2 mb-5">
            <p class="text-[13px] font-black text-gray-400 tracking-wider mb-3">
              {{ $t('livreur_livraison.detail_items_title') }}
            </p>
            <div v-for="item in selectedOrder.items" :key="item.id"
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div class="w-11 h-11 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img v-if="item.product_image" :src="item.product_image" class="w-full h-full object-cover" />
                <UIcon v-else name="i-heroicons-cube" class="w-5 h-5 text-gray-400" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate">{{ item.product_name }}</p>
                <p class="text-[11px] text-gray-400 mt-0.5">
                  {{ $t('livreur_livraison.detail_items_qty', { count: item.quantity }) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Paiement -->
          <div class="p-4 rounded-xl border border-gray-100 mb-4">
            <p class="text-[14px] font-black text-gray-400 tracking-wider mb-2">
              {{ $t('livreur_livraison.detail_payment_title') }}
            </p>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('livreur_livraison.detail_payment_mode') }}</span>
              <span class="font-semibold text-gray-800">
                {{ paymentConfig[selectedOrder.payment_method]?.label ?? selectedOrder.payment_method }}
              </span>
            </div>
            <div class="flex justify-between text-sm mt-1">
              <span class="text-gray-500">{{ $t('livreur_livraison.detail_payment_status') }}</span>
              <span
                class="text-[11px] font-black px-2 py-0.5 rounded-full"
                :style="{
                  backgroundColor: selectedOrder.payment_status === 'paid' ? '#dcfce7' : '#fef9c3',
                  color: selectedOrder.payment_status === 'paid' ? '#166534' : '#854d0e',
                }"
              >
                {{ selectedOrder.payment_status === 'paid'
                  ? $t('livreur_livraison.payment_paid')
                  : $t('livreur_livraison.payment_collect') }}
              </span>
            </div>
            <div class="flex justify-between font-black text-base pt-2 mt-2 border-t border-gray-100">
              <span class="text-gray-900">{{ $t('livreur_livraison.detail_payment_total') }}</span>
              <span class="text-[#274a82]">{{ formatPrice(selectedOrder.total) }}</span>
            </div>
          </div>

          <!-- Dates -->
          <div class="space-y-1 mb-5 text-sm">
            <div v-if="selectedOrder.shipped_at" class="flex justify-between">
              <span class="text-gray-500">{{ $t('livreur_livraison.detail_shipped_at') }}</span>
              <span class="font-semibold text-gray-700">{{ formatDate(selectedOrder.shipped_at) }}</span>
            </div>
            <div v-if="selectedOrder.delivered_at" class="flex justify-between">
              <span class="text-gray-500">{{ $t('livreur_livraison.detail_delivered_at') }}</span>
              <span class="font-semibold text-green-600">{{ formatDate(selectedOrder.delivered_at) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 mt-5">
            <button
              v-if="['processing', 'shipped'].includes(selectedOrder.status)"
              @click="askDeliver(selectedOrder)"
              :disabled="delivering === selectedOrder.id"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black text-sm transition-colors disabled:opacity-40"
            >
              <UIcon
                :name="delivering === selectedOrder.id ? 'i-heroicons-arrow-path' : 'i-heroicons-check-circle'"
                class="w-4 h-4"
                :class="delivering === selectedOrder.id ? 'animate-spin' : ''"
              />
              {{ delivering === selectedOrder.id
                ? $t('livreur_livraison.detail_btn_delivering')
                : $t('livreur_livraison.detail_btn_deliver') }}
            </button>
            <button @click="showDetail = false"
              class="flex-1 py-2.5 rounded-xl bg-[#274a82] hover:bg-[#e60012] text-white font-black text-sm transition-colors">
              {{ $t('livreur_livraison.detail_btn_close') }}
            </button>
          </div>

        </div>
      </template>
    </UModal>

    <!-- ══ MODAL CONFIRMATION ═══════════════════════════════════════════════ -->
    <UModal v-model:open="showDeliverConfirm">
      <template #content>
        <div v-if="orderToDeliver" class="p-6">

          <div class="flex flex-col items-center text-center mb-6">
            <div class="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-500" />
            </div>
            <h2 class="text-lg font-black text-gray-900">{{ $t('livreur_livraison.confirm_title') }}</h2>
            <p class="text-sm text-gray-500 mt-1">{{ $t('livreur_livraison.confirm_subtitle') }}</p>
          </div>

          <div class="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('livreur_livraison.confirm_label_order') }}</span>
              <span class="font-black text-gray-900">#{{ orderToDeliver.order_number }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('livreur_livraison.confirm_label_client') }}</span>
              <span class="font-semibold text-gray-700">
                {{ orderToDeliver.shipping_first_name }} {{ orderToDeliver.shipping_last_name }}
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('livreur_livraison.confirm_label_items') }}</span>
              <span class="font-semibold text-gray-700">
                {{ $t('livreur_livraison.confirm_item_count', { count: orderToDeliver.items?.length ?? 0 }) }}
              </span>
            </div>
            <div class="flex justify-between text-sm border-t border-gray-100 pt-2">
              <span class="text-gray-500">{{ $t('livreur_livraison.confirm_label_total') }}</span>
              <span class="font-black text-[#274a82]">{{ formatPrice(orderToDeliver.total) }}</span>
            </div>
            <div v-if="orderToDeliver.payment_status !== 'paid'"
              class="flex items-center gap-2 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <p class="text-xs font-bold text-yellow-700">
                {{ $t('livreur_livraison.confirm_collect_warning') }}
              </p>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="showDeliverConfirm = false; orderToDeliver = null"
              class="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-black text-sm hover:bg-gray-50 transition-colors"
            >
              {{ $t('livreur_livraison.confirm_btn_cancel') }}
            </button>
            <button
              @click="confirmDeliver"
              :disabled="delivering === orderToDeliver.id"
              class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black text-sm transition-colors disabled:opacity-50"
            >
              <UIcon
                :name="delivering === orderToDeliver.id ? 'i-heroicons-arrow-path' : 'i-heroicons-check-circle'"
                class="w-4 h-4"
                :class="delivering === orderToDeliver.id ? 'animate-spin' : ''"
              />
              {{ delivering === orderToDeliver.id
                ? $t('livreur_livraison.confirm_btn_confirming')
                : $t('livreur_livraison.confirm_btn_confirm') }}
            </button>
          </div>

        </div>
      </template>
    </UModal>

  </div>
</template>