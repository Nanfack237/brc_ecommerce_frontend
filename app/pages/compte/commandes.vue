<script setup lang="ts">
import { ref, computed, h, resolveComponent, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import type { TableColumn } from '@nuxt/ui'

const { requireAuth, token } = useAuth()
requireAuth()

const { t } = useI18n()

useHead({
  title: () => t('orders.seo_title'),
  titleTemplate: (title) => title ? `${title} - BRC Market` : 'BRC Market',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
})

const toast  = useToast()
const config = useRuntimeConfig()
const API    = config.public.apiBase

const UIcon   = resolveComponent('UIcon')
const UButton = resolveComponent('UButton')

// ── Types ─────────────────────────────────────────────────────────────────
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
  items:               OrderItem[]
}

// ── State ─────────────────────────────────────────────────────────────────
const orders            = ref<Order[]>([])
const loading           = ref(true)
const cancelling        = ref<number | null>(null)
const activeFilter      = ref('all')
const selectedOrder     = ref<Order | null>(null)
const showDetail        = ref(false)
const orderToCancel     = ref<Order | null>(null)
const showCancelConfirm = ref(false)

// ── Pagination ────────────────────────────────────────────────────────────
const currentPage  = ref(1)
const itemsPerPage = 10

// ── Annulation ────────────────────────────────────────────────────────────
const cancelReason      = ref('')
const cancelReasonError = ref('')

const cancelReasons = computed(() => [
  t('orders.cancel_reason_1'),
  t('orders.cancel_reason_2'),
  t('orders.cancel_reason_3'),
  t('orders.cancel_reason_4'),
  t('orders.cancel_reason_5'),
  t('orders.cancel_reason_6'),
])

const authHeaders = computed(() => ({ Authorization: `Bearer ${token.value}` }))

// ── Statut config ─────────────────────────────────────────────────────────
const statusConfig = computed<Record<string, { label: string; bg: string; text: string; icon: string }>>(() => ({
  pending:    { label: t('orders.status_pending'),    bg: '#fef9c3', text: '#854d0e', icon: 'i-heroicons-clock'            },
  processing: { label: t('orders.status_processing'), bg: '#dbeafe', text: '#1e40af', icon: 'i-heroicons-cog-6-tooth'      },
  shipped:    { label: t('orders.status_shipped'),    bg: '#e0f2fe', text: '#0369a1', icon: 'i-heroicons-truck'             },
  delivered:  { label: t('orders.status_delivered'),  bg: '#dcfce7', text: '#166534', icon: 'i-heroicons-check-circle'     },
  cancelled:  { label: t('orders.status_cancelled'),  bg: '#fee2e2', text: '#991b1b', icon: 'i-heroicons-x-circle'         },
  refunded:   { label: t('orders.status_refunded'),   bg: '#f3e8ff', text: '#6b21a8', icon: 'i-heroicons-arrow-uturn-left' },
}))

const paymentConfig = computed<Record<string, { label: string; icon: string }>>(() => ({
  mobile_money:     { label: t('orders.payment_mobile_money'),     icon: 'i-heroicons-device-phone-mobile' },
  cash_on_delivery: { label: t('orders.payment_cash_on_delivery'), icon: 'i-heroicons-banknotes'           },
  card:             { label: t('orders.payment_card'),             icon: 'i-heroicons-credit-card'         },
  bank_transfer:    { label: t('orders.payment_bank_transfer'),    icon: 'i-heroicons-building-library'    },
}))

// ── Filters ───────────────────────────────────────────────────────────────
const filters = computed(() => [
  { key: 'all',        label: t('orders.filter_all')        },
  { key: 'pending',    label: t('orders.filter_pending')    },
  { key: 'processing', label: t('orders.filter_processing') },
  { key: 'shipped',    label: t('orders.filter_shipped')    },
  { key: 'delivered',  label: t('orders.filter_delivered')  },
  { key: 'cancelled',  label: t('orders.filter_cancelled')  },
])

const filteredOrders = computed(() =>
  activeFilter.value === 'all'
    ? orders.value
    : orders.value.filter(o => o.status === activeFilter.value)
)

// ── Pagination computed ───────────────────────────────────────────────────
const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage))
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredOrders.value.slice(start, start + itemsPerPage)
})

watch(activeFilter, () => { currentPage.value = 1 })

// ── Stats ─────────────────────────────────────────────────────────────────
const stats = computed(() => ({
  total:     orders.value.length,
  pending:   orders.value.filter(o => o.status === 'pending').length,
  delivered: orders.value.filter(o => o.status === 'delivered').length,
  cancelled: orders.value.filter(o => o.status === 'cancelled').length,
}))

// ── Helpers ───────────────────────────────────────────────────────────────
const formatPrice = (p: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 })
    .format(p).replace('XAF', 'FCFA')

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

// ── Fetch ─────────────────────────────────────────────────────────────────
const fetchOrders = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API}/orders`, { headers: authHeaders.value })
    orders.value = data.data ?? data
  } catch {
    toast.add({ title: t('orders.toast_load_error'), color: 'error', icon: 'i-heroicons-exclamation-circle' })
  } finally {
    loading.value = false
  }
}

// ── Détail ────────────────────────────────────────────────────────────────
const openDetail = async (order: Order) => {
  try {
    const { data } = await axios.get(`${API}/orders/${order.id}`, { headers: authHeaders.value })
    selectedOrder.value = data
  } catch {
    selectedOrder.value = order
  }
  showDetail.value = true
}

// ── Annuler ───────────────────────────────────────────────────────────────
const askCancel = (order: Order) => {
  orderToCancel.value     = order
  cancelReason.value      = ''
  cancelReasonError.value = ''
  showCancelConfirm.value = true
}

const confirmCancel = async () => {
  if (!cancelReason.value) {
    cancelReasonError.value = t('orders.cancel_reason_required')
    return
  }
  const order = orderToCancel.value
  if (!order) return

  cancelling.value        = order.id
  showCancelConfirm.value = false

  try {
    await axios.post(
      `${API}/orders/${order.id}/cancel`,
      { reason: cancelReason.value },
      { headers: authHeaders.value }
    )
    await fetchOrders()
    if (selectedOrder.value?.id === order.id) showDetail.value = false
    toast.add({ title: t('orders.toast_cancelled'), color: 'success', icon: 'i-heroicons-check-circle' })
  } catch (e: any) {
    toast.add({
      title:       t('orders.toast_cancel_failed'),
      description: e?.response?.data?.message ?? t('orders.toast_cancel_retry'),
      color:       'error',
      icon:        'i-heroicons-x-circle',
    })
  } finally {
    cancelling.value    = null
    orderToCancel.value = null
  }
}

// ── Colonnes UTable ───────────────────────────────────────────────────────
const columns = computed<TableColumn<Order>[]>(() => [
  {
    id: 'order', header: t('orders.col_order'),
    cell: ({ row }) => {
      const o = row.original
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', { class: 'w-9 h-9 rounded-xl bg-[#274a82]/10 flex items-center justify-center flex-shrink-0' }, [
          h(UIcon, { name: 'i-heroicons-shopping-bag', class: 'w-4 h-4 text-[#274a82]' }),
        ]),
        h('div', {}, [
          h('p', { class: 'font-bold text-gray-900 text-sm' }, `#${o.order_number}`),
          h('p', { class: 'text-[11px] text-gray-400 mt-0.5' }, formatDate(o.created_at)),
        ]),
      ])
    },
  },
  {
    id: 'items', header: t('orders.col_items'),
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
          h('p', { class: 'text-xs font-semibold text-gray-800 truncate max-w-[160px]', title: first.product_name }, first.product_name),
          items.length > 1
            ? h('p', { class: 'text-[11px] text-gray-400' }, t('orders.items_more', { count: items.length - 1 }))
            : h('p', { class: 'text-[11px] text-gray-400' }, t('orders.items_qty', { count: first.quantity })),
        ]),
      ])
    },
  },
  {
    id: 'payment', header: t('orders.col_payment'),
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
        }, isPaid ? t('orders.payment_paid') : t('orders.payment_pending')),
      ])
    },
  },
  {
    id: 'total', header: t('orders.col_total'),
    cell: ({ row }) => {
      const o = row.original
      return h('div', {}, [
        h('p', { class: 'font-black text-[#274a82] text-sm' }, formatPrice(o.total)),
        o.shipping_cost > 0
          ? h('p', { class: 'text-[11px] text-gray-400' }, t('orders.shipping_cost_label', { price: formatPrice(o.shipping_cost) }))
          : null,
      ])
    },
  },
  {
    id: 'status', header: t('orders.col_status'),
    cell: ({ row }) => {
      const o   = row.original
      const cfg = statusConfig.value[o.status] ?? statusConfig.value.pending
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
    id: 'actions', header: '',
    cell: ({ row }) => {
      const o            = row.original
      const canCancel    = ['pending', 'processing'].includes(o.status)
      const isCancelling = cancelling.value === o.id
      return h('div', { class: 'flex items-center justify-end gap-1.5' }, [
        h('button', {
          onClick: () => openDetail(o),
          class: 'w-7 h-7 rounded-lg bg-[#274a82]/10 hover:bg-[#274a82] text-[#274a82] hover:text-white flex items-center justify-center transition-all',
          title: t('orders.action_view'),
        }, [h(UIcon, { name: 'i-heroicons-eye', class: 'w-3.5 h-3.5' })]),
        canCancel
          ? h('button', {
              onClick: () => askCancel(o),
              disabled: isCancelling,
              class: 'w-7 h-7 rounded-lg bg-red-50 hover:bg-[#e60012] text-red-400 hover:text-white flex items-center justify-center transition-all disabled:opacity-40',
              title: t('orders.action_cancel'),
            }, [h(UIcon, {
              name: isCancelling ? 'i-heroicons-arrow-path' : 'i-heroicons-x-mark',
              class: `w-3.5 h-3.5 ${isCancelling ? 'animate-spin' : ''}`,
            })])
          : null,
      ])
    },
  },
])

// ── Init + polling ────────────────────────────────────────────────────────
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

    <!-- ══ BREADCRUMB ══════════════════════════════════════════════════════ -->
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="hidden sm:flex items-center gap-2 text-sm text-gray-400 mb-2">
          <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">
            {{ $t('orders.breadcrumb_home') }}
          </NuxtLink>
          <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
          <span class="text-gray-600 font-medium">{{ $t('orders.page_title') }}</span>
        </div>
        <h1 class="text-2xl font-black text-gray-900">{{ $t('orders.page_title') }}</h1>
        <p class="text-gray-500 text-sm mt-0.5">
          {{ stats.total }} {{ $t('orders.order_s') }} ·
          <span class="text-gray-400 text-xs">{{ $t('orders.auto_refresh') }}</span>
        </p>
      </div>
      <button @click="fetchOrders" :disabled="loading"
        class="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:border-[#274a82] hover:text-[#274a82] transition-all flex-shrink-0 mt-1 disabled:opacity-50">
        <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" :class="loading ? 'animate-spin' : ''" />
        {{ $t('orders.refresh_btn') }}
      </button>
    </div>

    <!-- ══ STATS ═══════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider">{{ $t('orders.stats_total') }}</p>
        <p class="text-2xl font-black text-gray-900 mt-1">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider">{{ $t('orders.stats_pending') }}</p>
        <p class="text-2xl font-black text-yellow-500 mt-1">{{ stats.pending }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider">{{ $t('orders.stats_delivered') }}</p>
        <p class="text-2xl font-black text-green-600 mt-1">{{ stats.delivered }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-gray-400 tracking-wider">{{ $t('orders.stats_cancelled') }}</p>
        <p class="text-2xl font-black text-[#e60012] mt-1">{{ stats.cancelled }}</p>
      </div>
    </div>

    <!-- ══ FILTRES ═════════════════════════════════════════════════════════ -->
    <!-- Select mobile -->
    <div class="block sm:hidden">
      <select
        v-model="activeFilter"
        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#274a82]"
      >
        <option v-for="f in filters" :key="f.key" :value="f.key">
          {{ f.label }}
          {{ f.key !== 'all' ? `(${orders.filter(o => o.status === f.key).length})` : '' }}
        </option>
      </select>
    </div>

    <!-- Pills desktop -->
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
        :data="paginatedOrders"
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
              <UIcon name="i-heroicons-shopping-bag" class="w-7 h-7 text-gray-300" />
            </div>
            <p class="text-gray-400 text-sm font-medium">
              {{ activeFilter === 'all' ? $t('orders.empty_all') : $t('orders.empty_filtered') }}
            </p>
            <button v-if="activeFilter !== 'all'" @click="activeFilter = 'all'"
              class="text-xs text-[#274a82] hover:underline font-bold">
              {{ $t('orders.empty_show_all') }}
            </button>
            <NuxtLink v-else to="/boutique">
              <button class="mt-1 px-4 py-2 bg-[#e60012] hover:bg-red-700 text-white text-xs font-black rounded-lg transition-colors">
                {{ $t('orders.empty_shop_btn') }}
              </button>
            </NuxtLink>
          </div>
        </template>
      </UTable>
    </div>

    <!-- ══ PAGINATION ═══════════════════════════════════════════════════════ -->
    <div v-if="totalPages > 1" class="flex items-center justify-between gap-3">
      <p class="text-xs text-gray-400 font-medium">
        {{ $t('orders.pagination_info', { current: currentPage, total: totalPages, count: filteredOrders.length }) }}
      </p>
      <div class="flex items-center gap-1.5">
        <button @click="currentPage--" :disabled="currentPage === 1"
          class="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-[#274a82] hover:text-[#274a82] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
        </button>
        <button v-for="p in totalPages" :key="p" @click="currentPage = p"
          class="w-8 h-8 rounded-lg border text-sm font-bold transition-all"
          :class="currentPage === p
            ? 'bg-[#274a82] border-[#274a82] text-white'
            : 'border-gray-200 bg-white text-gray-600 hover:border-[#274a82] hover:text-[#274a82]'">
          {{ p }}
        </button>
        <button @click="currentPage++" :disabled="currentPage === totalPages"
          class="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-[#274a82] hover:text-[#274a82] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- ══ MODAL DÉTAIL ══════════════════════════════════════════════════════ -->
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
              <UIcon :name="statusConfig[selectedOrder.status]?.icon ?? 'i-heroicons-clock'" class="w-3.5 h-3.5" />
              {{ statusConfig[selectedOrder.status]?.label ?? selectedOrder.status }}
            </span>
          </div>

          <!-- Articles -->
          <div class="space-y-2 mb-5">
            <p class="text-xs font-black text-gray-400 tracking-wider mb-3">{{ $t('orders.detail_title') }}</p>
            <div v-for="item in selectedOrder.items" :key="item.id"
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div class="w-11 h-11 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img v-if="item.product_image" :src="item.product_image" class="w-full h-full object-cover" />
                <UIcon v-else name="i-heroicons-cube" class="w-5 h-5 text-gray-400" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate">{{ item.product_name }}</p>
                <p class="text-[11px] text-gray-400 mt-0.5">
                  {{ item.quantity }} × {{ formatPrice(item.unit_price) }}
                  <span v-if="item.product_sku" class="ml-2 text-gray-300 font-mono">{{ item.product_sku }}</span>
                </p>
              </div>
              <p class="font-black text-[#274a82] text-sm flex-shrink-0">{{ formatPrice(item.subtotal) }}</p>
            </div>
          </div>

          <!-- Livraison -->
          <div class="p-4 bg-blue-50/50 border border-blue-100 rounded-xl mb-4">
            <p class="text-[11px] font-black text-gray-400 tracking-wider mb-2">
              {{ $t('orders.detail_shipping_title') }}
            </p>
            <p class="text-sm font-bold text-gray-800">
              {{ selectedOrder.shipping_first_name }} {{ selectedOrder.shipping_last_name }}
            </p>
            <p class="text-xs text-gray-500 mt-0.5">{{ selectedOrder.shipping_phone }}</p>
            <p class="text-xs text-gray-500">
              {{ [selectedOrder.shipping_street, selectedOrder.shipping_city, selectedOrder.shipping_country].filter(Boolean).join(', ') }}
            </p>
          </div>

          <!-- Récap financier -->
          <div class="border-t border-gray-100 pt-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('orders.detail_subtotal') }}</span>
              <span class="font-semibold text-gray-800">{{ formatPrice(selectedOrder.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('orders.detail_shipping') }}</span>
              <span class="font-semibold text-gray-800">{{ formatPrice(selectedOrder.shipping_cost) }}</span>
            </div>
            <div v-if="selectedOrder.discount_amount > 0" class="flex justify-between text-sm">
              <span class="text-green-600">{{ $t('orders.detail_discount') }}</span>
              <span class="font-semibold text-green-600">- {{ formatPrice(selectedOrder.discount_amount) }}</span>
            </div>
            <div class="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span class="text-gray-500">{{ $t('orders.detail_payment_method') }}</span>
              <span class="font-semibold text-gray-800">
                {{ paymentConfig[selectedOrder.payment_method]?.label ?? selectedOrder.payment_method }}
              </span>
            </div>
            <div v-if="selectedOrder.shipped_at" class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('orders.detail_shipped_at') }}</span>
              <span class="font-semibold text-gray-800">{{ formatDate(selectedOrder.shipped_at) }}</span>
            </div>
            <div v-if="selectedOrder.delivered_at" class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('orders.detail_delivered_at') }}</span>
              <span class="font-semibold text-green-600">{{ formatDate(selectedOrder.delivered_at) }}</span>
            </div>
            <div class="flex justify-between font-black text-base pt-2 border-t border-gray-100">
              <span class="text-gray-900">{{ $t('orders.detail_total') }}</span>
              <span class="text-[#274a82]">{{ formatPrice(selectedOrder.total) }}</span>
            </div>
          </div>

          <!-- Actions modal -->
          <div class="flex gap-2 mt-5">
            <button
              v-if="['pending', 'processing'].includes(selectedOrder.status)"
              @click="askCancel(selectedOrder)"
              :disabled="cancelling === selectedOrder.id"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-red-200 text-[#e60012] font-black text-sm hover:bg-red-50 transition-colors disabled:opacity-40"
            >
              <UIcon
                :name="cancelling === selectedOrder.id ? 'i-heroicons-arrow-path' : 'i-heroicons-x-circle'"
                class="w-4 h-4"
                :class="cancelling === selectedOrder.id ? 'animate-spin' : ''"
              />
              {{ cancelling === selectedOrder.id ? $t('orders.detail_btn_cancelling') : $t('orders.detail_btn_cancel') }}
            </button>
            <button @click="showDetail = false"
              class="flex-1 py-2.5 rounded-xl bg-[#274a82] hover:bg-[#1a3460] text-white font-black text-sm transition-colors">
              {{ $t('orders.detail_btn_close') }}
            </button>
          </div>
        </div>
      </template>
    </UModal>

    <!-- ══ MODAL CONFIRMATION ANNULATION ═══════════════════════════════════ -->
    <UModal v-model:open="showCancelConfirm">
      <template #content>
        <div v-if="orderToCancel" class="p-6">

          <!-- Icône -->
          <div class="flex flex-col items-center text-center mb-6">
            <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-[#e60012]" />
            </div>
            <h2 class="text-lg font-black text-gray-900">{{ $t('orders.cancel_title') }}</h2>
            <p class="text-sm text-gray-500 mt-1">
              {{ $t('orders.cancel_irreversible') }}
            </p>
          </div>

          <!-- Détail commande -->
          <div class="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('orders.cancel_label_order') }}</span>
              <span class="font-black text-gray-900">#{{ orderToCancel.order_number }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">{{ $t('orders.cancel_label_items') }}</span>
              <span class="font-semibold text-gray-700">
                {{ $t('orders.cancel_item_count', { count: orderToCancel.items?.length ?? 0 }) }}
              </span>
            </div>
            <div class="flex justify-between text-sm border-t border-gray-100 pt-2">
              <span class="text-gray-500">{{ $t('orders.cancel_label_amount') }}</span>
              <span class="font-black text-[#274a82]">{{ formatPrice(orderToCancel.total) }}</span>
            </div>
          </div>

          <!-- Raison -->
          <div class="mb-5">
            <label class="block text-sm font-bold text-gray-700 mb-2">
              {{ $t('orders.cancel_reason_label') }} <span class="text-[#e60012]">*</span>
            </label>
            <select
              v-model="cancelReason"
              class="w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-700 bg-white focus:outline-none transition-colors"
              :class="cancelReasonError ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#274a82]'"
            >
              <option value="" disabled>{{ $t('orders.cancel_reason_placeholder') }}</option>
              <option v-for="r in cancelReasons" :key="r" :value="r">{{ r }}</option>
            </select>
            <p v-if="cancelReasonError" class="text-xs text-[#e60012] font-semibold mt-1.5">
              {{ cancelReasonError }}
            </p>
          </div>

          <!-- Boutons -->
          <div class="flex gap-3">
            <button
              @click="showCancelConfirm = false; orderToCancel = null"
              class="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-black text-sm hover:bg-gray-50 transition-colors"
            >
              {{ $t('orders.cancel_btn_keep') }}
            </button>
            <button
              @click="confirmCancel"
              :disabled="cancelling === orderToCancel.id"
              class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#e60012] hover:bg-red-700 text-white font-black text-sm transition-colors disabled:opacity-50"
            >
              <UIcon
                :name="cancelling === orderToCancel.id ? 'i-heroicons-arrow-path' : 'i-heroicons-x-circle'"
                class="w-4 h-4"
                :class="cancelling === orderToCancel.id ? 'animate-spin' : ''"
              />
              {{ cancelling === orderToCancel.id ? $t('orders.cancel_btn_confirming') : $t('orders.cancel_btn_confirm') }}
            </button>
          </div>

        </div>
      </template>
    </UModal>

  </div>
</template>