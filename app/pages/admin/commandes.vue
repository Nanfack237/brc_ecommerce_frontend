<script setup lang="ts">
import { ref, computed, onMounted, h, resolveComponent } from 'vue'
import axios from 'axios'
import type { TableColumn } from '@nuxt/ui'

const { requireUserOrAdmin, token } = useAuth()
requireUserOrAdmin()

useHead({ title: 'Commandes — Admin BRC Market' })

const toast  = useToast()
const config = useRuntimeConfig()
const API    = config.public.apiBase

const UIcon = resolveComponent('UIcon')

const authHeaders = computed(() => ({
  Authorization: `Bearer ${token.value}`,
  Accept: 'application/json',
}))

// ── Types ──────────────────────────────────────────────────────────────────────
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
  shipping_first_name: string
  shipping_last_name:  string
  shipping_phone:      string | null
  shipping_city:       string | null
  shipping_street:     string | null
  delivery_driver_id:  number | null
  notes?:              string | null
  livreur:             { id: number; first_name: string; last_name: string; phone?: string } | null
  delivery_driver:     { id: number; first_name: string; last_name: string; phone?: string } | null
  user:                { id: number; first_name: string; last_name: string; email: string; phone?: string } | null
  items: {
    id:            number
    quantity:      number
    unit_price:    number
    subtotal:      number
    product_name?: string
    product_image?:string
    product?:      { name: string; images?: string[] } | null
  }[]
  shipped_at:       string | null
  cancelled_at:     string | null
  cancelled_reason: string | null
}

interface Livreur {
  id: number; first_name: string; last_name: string; phone?: string | null
}

// ── State ──────────────────────────────────────────────────────────────────────
const orders       = ref<Order[]>([])
const livreurs     = ref<Livreur[]>([])
const loading      = ref(true)
const activeFilter = ref('all')
const searchQuery  = ref('')

const selectedOrder  = ref<Order | null>(null)
const showDetail     = ref(false)
const newStatus      = ref('')
const updatingStatus = ref(false)

const newPaymentStatus = ref('')
const updatingPayment  = ref(false)

const showAssign    = ref(false)
const selectedLivId = ref<number | null>(null)
const assigning     = ref(false)

const showCancelModal = ref(false)
const cancelReason    = ref('')
const cancellingOrder = ref(false)

// ── Sélection + impression ─────────────────────────────────────────────────────
const selectedIds = ref<Set<number>>(new Set())

const allSelected = computed(() =>
  filteredOrders.value.length > 0 &&
  filteredOrders.value.every(o => selectedIds.value.has(o.id))
)
const someSelected = computed(() => selectedIds.value.size > 0)
const selectedCount = computed(() => selectedIds.value.size)

const toggleAll = () => {
  if (allSelected.value) {
    filteredOrders.value.forEach(o => selectedIds.value.delete(o.id))
  } else {
    filteredOrders.value.forEach(o => selectedIds.value.add(o.id))
  }
  selectedIds.value = new Set(selectedIds.value)
}

const toggleOne = (id: number) => {
  if (selectedIds.value.has(id)) selectedIds.value.delete(id)
  else selectedIds.value.add(id)
  selectedIds.value = new Set(selectedIds.value)
}

const clearSelection = () => {
  selectedIds.value = new Set()
}

const selectedOrders = computed(() =>
  orders.value.filter(o => selectedIds.value.has(o.id))
)

const printSelected = () => {
  const rows = selectedOrders.value.map(o => {
  const statusLabel =
    o.status === 'pending' ? 'En attente' :
    o.status === 'processing' ? 'En cours' :
    o.status === 'shipped' ? 'Expédiée' :
    o.status === 'delivered' ? 'Livrée' :
    o.status === 'cancelled' ? 'Annulée' :
    o.status

  const paymentStatusLabel =
    o.payment_status === 'unpaid' ? 'Non payé' :
    o.payment_status === 'paid' ? 'Payé' :
    o.payment_status === 'refunded' ? 'Remboursé' :
    '—'

  const paymentMethodLabel =
    o.payment_method === 'mobile_money' ? 'Mobile Money' :
    o.payment_method === 'cash_on_delivery' ? 'Paiement à la livraison' :
    '—'

  return `
    <tr>
      <td>${o.order_number}</td>
      <td>${o.user ? o.user.first_name + ' ' + o.user.last_name : o.shipping_first_name + ' ' + o.shipping_last_name}</td>
      <td>${o.user?.email ?? o.shipping_phone ?? '—'}</td>
      <td>${o.shipping_city ?? '—'}</td>
      <td>${statusLabel}</td>
      <td>
          <span class="badge ${o.payment_status}">
            ${paymentStatusLabel}
          </span>
      </td>
      <td>${paymentMethodLabel}</td>
      <td>${new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(o.total).replace('XAF', 'FCFA')}</td>
      <td>${new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
    </tr>
  `
}).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Commandes BRC Market</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 24px; }
    h1 { font-size: 18px; font-weight: 900; color: #274a82; margin-bottom: 2px; }
    .meta { font-size: 11px; color: #6b7280; margin-bottom: 20px; }
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .logo {
      height: 50px;
      object-fit: contain;
    }
    table { width: 100%; border-collapse: collapse; }
    th { background: #274a82; color: white; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; }
    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
    tr:nth-child(even) td { background: #f9fafb; }
    .footer { margin-top: 20px; font-size: 10px; color: #9ca3af; text-align: right; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <img src="/brclogo.png" alt="BRC Market" class="logo" />
    <div>
      <h1>BRC Market — Liste des commandes</h1>
      <p class="meta">
        Imprimé le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} · ${selectedOrders.value.length} commande(s)
      </p>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>N° Commande</th>
        <th>Client</th>
        <th>Contact</th>
        <th>Ville</th>
        <th>Statut</th>
        <th>Paiement</th>
        <th>Méthode</th>
        <th>Total</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="footer">BRC Market · Rapport généré automatiquement</p>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 300)
}

// ── Config ─────────────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  pending:    { label: 'En attente', bg: '#fef9c3', text: '#854d0e', icon: 'i-heroicons-clock'            },
  processing: { label: 'En cours',   bg: '#dbeafe', text: '#1d4ed8', icon: 'i-heroicons-arrow-path'       },
  shipped:    { label: 'Expédiée',   bg: '#e0f2fe', text: '#0369a1', icon: 'i-heroicons-truck'            },
  delivered:  { label: 'Livrée',     bg: '#dcfce7', text: '#166534', icon: 'i-heroicons-check-circle'     },
  cancelled:  { label: 'Annulée',    bg: '#fee2e2', text: '#991b1b', icon: 'i-heroicons-x-circle'         },
  refunded:   { label: 'Remboursée', bg: '#f3e8ff', text: '#6b21a8', icon: 'i-heroicons-arrow-uturn-left' },
}

const paymentConfig: Record<string, { label: string; icon: string }> = {
  cash_on_delivery: { label: 'Paiement à la livraison', icon: 'i-heroicons-banknotes'           },
  mobile_money:     { label: 'Mobile Money',             icon: 'i-heroicons-device-phone-mobile' },
  card:             { label: 'Carte bancaire',           icon: 'i-heroicons-credit-card'         },
  bank_transfer:    { label: 'Virement bancaire',        icon: 'i-heroicons-building-library'    },
}

const statusOptions = [
  { value: 'pending',    label: 'En attente' },
  { value: 'processing', label: 'En cours'   },
  { value: 'shipped',    label: 'Expédiée'   },
  { value: 'delivered',  label: 'Livrée'     },
  { value: 'cancelled',  label: 'Annulée'    },
  { value: 'refunded',   label: 'Remboursée' },
]

const filters = [
  { key: 'all',        label: 'Toutes'     },
  { key: 'pending',    label: 'En attente' },
  { key: 'processing', label: 'En cours'   },
  { key: 'shipped',    label: 'Expédiées'  },
  { key: 'delivered',  label: 'Livrées'    },
  { key: 'cancelled',  label: 'Annulées'   },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatPrice = (p: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(p ?? 0)

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

const clientName  = (o: Order) => o.user
  ? `${o.user.first_name} ${o.user.last_name}`
  : `${o.shipping_first_name} ${o.shipping_last_name}`

const clientEmail = (o: Order) => o.user?.email ?? null

const livInitials = (l: { first_name: string; last_name: string }) =>
  `${l.first_name[0]}${l.last_name[0]}`.toUpperCase()

const getLivreur = (o: Order) => o.delivery_driver ?? o.livreur ?? null

const avatarColors = ['#274a82','#e60012','#0369a1','#166534','#854d0e','#6b21a8']
const livColor     = (id: number) => avatarColors[id % avatarColors.length]

const itemName  = (item: Order['items'][0]) => item.product?.name ?? item.product_name ?? 'Produit'
const itemImage = (item: Order['items'][0]) => item.product?.images?.[0] ?? item.product_image ?? null

// ── Stats ──────────────────────────────────────────────────────────────────────
const stats = computed(() => ({
  total:      orders.value.length,
  pending:    orders.value.filter(o => o.status === 'pending').length,
  processing: orders.value.filter(o => o.status === 'processing').length,
  shipped:    orders.value.filter(o => o.status === 'shipped').length,
  delivered:  orders.value.filter(o => o.status === 'delivered').length,
}))

// ── Liste filtrée ──────────────────────────────────────────────────────────────
const filteredOrders = computed(() => {
  let list = orders.value
  if (activeFilter.value !== 'all') list = list.filter(o => o.status === activeFilter.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(o =>
      o.order_number.toLowerCase().includes(q) ||
      clientName(o).toLowerCase().includes(q) ||
      (clientEmail(o) ?? '').toLowerCase().includes(q)
    )
  }
  return list
})

// ── API ────────────────────────────────────────────────────────────────────────
const fetchOrders = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API}/admin/orders`, {
      headers: authHeaders.value,
      params:  { per_page: 200 },
    })
    orders.value = data.data ?? data
  } catch (e: any) {
    const msg    = e?.response?.data?.message ?? e?.response?.statusText ?? e?.message ?? 'Erreur inconnue'
    const status = e?.response?.status ? ` (${e.response.status})` : ''
    console.error('[fetchOrders]', e?.response?.data ?? e?.message)
    toast.add({ title: `Erreur de chargement${status}`, description: msg, color: 'error', icon: 'i-heroicons-exclamation-circle' })
  } finally {
    loading.value = false
  }
}

const fetchLivreurs = async () => {
  try {
    const { data } = await axios.get(`${API}/admin/users`, {
      headers: authHeaders.value,
      params:  { role: 'livreur', per_page: 100 },
    })
    livreurs.value = (data.data ?? data).filter((u: any) => u.role === 'livreur')
  } catch {}
}

onMounted(() => { fetchOrders(); fetchLivreurs() })

// ── Ouvrir détail ──────────────────────────────────────────────────────────────
const openDetail = (order: Order) => {
  selectedOrder.value = { ...order, items: order.items ?? [] }

  newStatus.value        = order.status
  newPaymentStatus.value = order.payment_status // ✅ AJOUT

  selectedLivId.value = order.delivery_driver_id ?? null
  showAssign.value    = false
  showDetail.value    = true
}

// ── Changer statut ─────────────────────────────────────────────────────────────
const requestStatusChange = () => {
  if (newStatus.value === 'cancelled') {
    cancelReason.value    = ''
    showCancelModal.value = true
  } else {
    updateStatus()
  }
}

const updateStatus = async (reason?: string) => {
  if (!selectedOrder.value) return
  updatingStatus.value  = true
  showCancelModal.value = false
  try {
    const payload: Record<string, any> = { status: newStatus.value }
    if (newStatus.value === 'cancelled' && reason) payload.cancelled_reason = reason

    await axios.patch(
      `${API}/admin/orders/${selectedOrder.value.id}/status`,
      payload,
      { headers: authHeaders.value }
    )
    const idx = orders.value.findIndex(o => o.id === selectedOrder.value!.id)
    if (idx !== -1) {
      orders.value[idx].status = newStatus.value
      if (newStatus.value === 'cancelled') orders.value[idx].cancelled_reason = reason ?? null
    }
    selectedOrder.value.status = newStatus.value
    if (newStatus.value === 'cancelled') selectedOrder.value.cancelled_reason = reason ?? null
    toast.add({
      title:       'Statut mis à jour',
      description: `#${selectedOrder.value.order_number} → ${statusConfig[newStatus.value].label}`,
      color: 'success', icon: 'i-heroicons-check-circle',
    })
  } catch (e: any) {
    toast.add({ title: 'Erreur', description: e?.response?.data?.message ?? 'Impossible.', color: 'error', icon: 'i-heroicons-x-circle' })
  } finally {
    updatingStatus.value  = false
    cancellingOrder.value = false
  }
}

const updatePaymentStatus = async () => {
  if (!selectedOrder.value) return

  updatingPayment.value = true

  try {
    await axios.patch(
      `${API}/admin/orders/${selectedOrder.value.id}/payment-status`,
      {
        payment_status: newPaymentStatus.value
      },
      { headers: authHeaders.value }
    )

    // update local
    const idx = orders.value.findIndex(o => o.id === selectedOrder.value!.id)

    if (idx !== -1) {
      orders.value[idx].payment_status = newPaymentStatus.value
    }

    selectedOrder.value.payment_status = newPaymentStatus.value

    toast.add({
      title: 'Paiement mis à jour',
      description: `#${selectedOrder.value.order_number}`,
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })

  } catch (e: any) {
    toast.add({
      title: 'Erreur',
      description: e?.response?.data?.message ?? 'Impossible',
      color: 'error'
    })
  } finally {
    updatingPayment.value = false
  }
}

// ── Assigner livreur ───────────────────────────────────────────────────────────
const assignLivreur = async () => {
  if (!selectedOrder.value || !selectedLivId.value) return
  assigning.value = true
  try {
    await axios.patch(
      `${API}/admin/orders/${selectedOrder.value.id}/assign`,
      { delivery_driver_id: selectedLivId.value },
      { headers: authHeaders.value }
    )
    const liv = livreurs.value.find(l => l.id === selectedLivId.value)!
    const idx = orders.value.findIndex(o => o.id === selectedOrder.value!.id)
    if (idx !== -1) {
      orders.value[idx].delivery_driver_id = liv.id
      orders.value[idx].livreur            = { id: liv.id, first_name: liv.first_name, last_name: liv.last_name }
      orders.value[idx].delivery_driver    = { id: liv.id, first_name: liv.first_name, last_name: liv.last_name }
      orders.value[idx].status             = 'processing'
    }
    selectedOrder.value.delivery_driver_id = liv.id
    selectedOrder.value.livreur            = { id: liv.id, first_name: liv.first_name, last_name: liv.last_name }
    selectedOrder.value.delivery_driver    = { id: liv.id, first_name: liv.first_name, last_name: liv.last_name }
    selectedOrder.value.status             = 'processing'
    selectedOrder.value.shipped_at         = new Date().toISOString()
    newStatus.value                        = 'processing'
    showAssign.value                       = false
    toast.add({
      title:       'Livreur assigné',
      description: `#${selectedOrder.value.order_number} → ${liv.first_name} ${liv.last_name} · En cours`,
      color: 'success', icon: 'i-heroicons-truck',
    })
  } catch (e: any) {
    toast.add({ title: 'Erreur', description: e?.response?.data?.message ?? 'Impossible.', color: 'error', icon: 'i-heroicons-x-circle' })
  } finally {
    assigning.value = false
  }
}

// ── Colonnes UTable ────────────────────────────────────────────────────────────
const columns: TableColumn<Order>[] = [
  {
    id: 'select', header: '',
    cell: ({ row }) => {
      const o = row.original
      return h('input', {
        type: 'checkbox',
        checked: selectedIds.value.has(o.id),
        onChange: () => toggleOne(o.id),
        style: {
          width: '15px', height: '15px', cursor: 'pointer',
          accentColor: '#274a82', borderRadius: '4px',
        },
        onClick: (e: MouseEvent) => e.stopPropagation(),
      })
    },
  },
  {
    id: 'order', header: 'Commande',
    cell: ({ row }) => {
      const o = row.original
      return h('div', {}, [
        h('p', { style: { fontWeight: '800', fontSize: '13px', color: '#111827' } }, `#${o.order_number}`),
        h('p', { style: { fontSize: '11px', color: '#9ca3af', marginTop: '2px' } }, formatDate(o.created_at)),
      ])
    },
  },
  {
    id: 'client', header: 'Client',
    cell: ({ row }) => {
      const o = row.original
      return h('div', { style: { minWidth: '0' } }, [
        h('p', { style: { fontWeight: '700', fontSize: '13px', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' } }, clientName(o)),
        clientEmail(o)
          ? h('p', { style: { fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' } }, clientEmail(o)!)
          : h('p', { style: { fontSize: '11px', color: '#d1d5db', fontStyle: 'italic' } }, 'Invité'),
      ])
    },
  },
  {
    id: 'total', header: 'Total',
    cell: ({ row }) => {
      const o  = row.original
      const pm = paymentConfig[o.payment_method]
      return h('div', {}, [
        h('p', { style: { fontWeight: '800', fontSize: '13px', color: '#274a82' } }, formatPrice(o.total)),
        h('p', { style: { fontSize: '11px', color: '#9ca3af', marginTop: '2px' } }, pm?.label ?? o.payment_method),
      ])
    },
  },
  {
    id: 'status', header: 'Statut',
    cell: ({ row }) => {
      const o   = row.original
      const cfg = statusConfig[o.status] ?? statusConfig.pending
      return h('span', {
        style: {
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '3px 8px', borderRadius: '999px',
          fontSize: '10px', fontWeight: '800',
          backgroundColor: cfg.bg, color: cfg.text,
          whiteSpace: 'nowrap',
        },
      }, [
        h(UIcon, { name: cfg.icon, style: { width: '10px', height: '10px' } }),
        cfg.label,
      ])
    },
  },
  {
    id: 'livreur', header: 'Livreur',
    cell: ({ row }) => {
      const o   = row.original
      const liv = getLivreur(o)
      if (!liv) return h('span', { style: { fontSize: '11px', color: '#d1d5db', fontStyle: 'italic' } }, 'Non assigné')
      const driverId = o.delivery_driver_id ?? liv.id
      return h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, [
        h('div', {
          style: {
            width: '22px', height: '22px', borderRadius: '50%', flexShrink: '0',
            backgroundColor: livColor(driverId),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '9px', fontWeight: '800',
          },
        }, livInitials(liv)),
        h('span', { style: { fontSize: '12px', fontWeight: '700', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' } },
          `${liv.first_name} ${liv.last_name}`),
      ])
    },
  },
  {
    id: 'actions', header: '',
    cell: ({ row }) => {
      const o = row.original
      return h('div', { style: { display: 'flex', justifyContent: 'flex-end' } }, [
        h('button', {
          onClick: () => openDetail(o),
          style: {
            width: '30px', height: '30px', borderRadius: '10px',
            backgroundColor: 'rgba(39,74,130,0.08)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#274a82', transition: 'all .15s',
          },
          onMouseenter: (e: MouseEvent) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#274a82'; (e.currentTarget as HTMLElement).style.color = 'white' },
          onMouseleave: (e: MouseEvent) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(39,74,130,0.08)'; (e.currentTarget as HTMLElement).style.color = '#274a82' },
        }, [h(UIcon, { name: 'i-heroicons-chevron-right', style: { width: '14px', height: '14px' } })]),
      ])
    },
  },
]
</script>

<template>
  <div class="space-y-6">

    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <div>
      <h1 class="text-2xl font-black text-gray-900">Commandes</h1>
      <p class="text-sm text-gray-400 mt-0.5">
        {{ stats.total }} commande{{ stats.total !== 1 ? 's' : '' }} ·
        {{ stats.pending }} en attente · {{ stats.processing }} en cours
      </p>
    </div>

    <!-- ── Stats ──────────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div v-for="(s, i) in [
        { label: 'Total',      value: stats.total,      cls: 'text-gray-900'   },
        { label: 'En attente', value: stats.pending,    cls: 'text-yellow-600' },
        { label: 'En cours',   value: stats.processing, cls: 'text-blue-600'   },
        { label: 'Expédiées',  value: stats.shipped,    cls: 'text-sky-600'    },
        { label: 'Livrées',    value: stats.delivered,  cls: 'text-green-600'  },
      ]" :key="i" class="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5">
        <p class="text-xs font-bold text-gray-400 tracking-wider">{{ s.label }}</p>
        <p class="text-2xl font-black mt-1" :class="s.cls">{{ s.value }}</p>
      </div>
    </div>

    <!-- ── Toolbar ────────────────────────────────────────────────────────── -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex gap-2 flex-wrap">
        <button v-for="f in filters" :key="f.key" @click="activeFilter = f.key"
          class="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          :class="activeFilter === f.key
            ? 'bg-[#274a82] text-white shadow-sm'
            : 'bg-white border border-gray-200 text-gray-500 hover:border-[#274a82] hover:text-[#274a82]'">
          {{ f.label }}
        </button>
      </div>
      <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass"
        placeholder="N° commande, client..." size="sm" class="w-60" />
    </div>

    <!-- ── Barre de sélection ─────────────────────────────────────────────── -->
    <Transition name="slide-down">
      <div v-if="someSelected"
        class="flex items-center justify-between gap-3 px-4 py-3 bg-[#274a82] rounded-xl text-white shadow-lg">
        <div class="flex items-center gap-3">
          <input type="checkbox" :checked="allSelected" @change="toggleAll"
            class="w-4 h-4 cursor-pointer accent-white" />
          <span class="text-sm font-black">
            {{ selectedCount }} commande{{ selectedCount > 1 ? 's' : '' }} sélectionnée{{ selectedCount > 1 ? 's' : '' }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button @click="printSelected"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#274a82] rounded-lg text-xs font-black hover:bg-gray-100 transition-all">
            <UIcon name="i-heroicons-printer" class="w-3.5 h-3.5" />
            Imprimer
          </button>
          <button @click="clearSelection"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-black transition-all">
            <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
            Désélectionner
          </button>
        </div>
      </div>
    </Transition>

    <!-- ── UTable ─────────────────────────────────────────────────────────── -->
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
              <UIcon name="i-heroicons-shopping-bag" class="w-7 h-7 text-gray-300" />
            </div>
            <p class="text-gray-400 text-sm font-medium">Aucune commande trouvée</p>
          </div>
        </template>
      </UTable>
    </div>

  </div>

  <!-- ══ MODAL DÉTAIL ════════════════════════════════════════════════════════ -->
  <UModal v-model:open="showDetail">
    <template #content>
      <div v-if="selectedOrder" class="overflow-hidden rounded-2xl bg-white">

        <!-- Header modal -->
        <div class="px-6 py-5 bg-[#274a82] flex items-start justify-between">
          <div>
            <p class="text-xs text-white/50 font-bold tracking-widest">Commande</p>
            <h2 class="text-xl font-black text-white mt-0.5">#{{ selectedOrder.order_number }}</h2>
            <p class="text-xs text-white/50 mt-1">{{ formatDate(selectedOrder.created_at) }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
              :style="{ backgroundColor: statusConfig[selectedOrder.status]?.bg, color: statusConfig[selectedOrder.status]?.text }">
              <UIcon :name="statusConfig[selectedOrder.status]?.icon" class="w-3 h-3" />
              {{ statusConfig[selectedOrder.status]?.label }}
            </span>
            <button @click="showDetail = false"
              class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all flex-shrink-0">
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <!-- Contenu scrollable -->
        <div class="max-h-[70vh] overflow-y-auto divide-y divide-gray-100">

          <!-- Client -->
          <div class="px-6 py-4">
            <p class="text-xs font-black text-gray-400 tracking-widest mb-3">Client</p>
            <div class="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5">
              <p class="font-black text-gray-900 text-sm">{{ clientName(selectedOrder) }}</p>
              <p v-if="clientEmail(selectedOrder)" class="text-xs text-gray-500 flex items-center gap-1.5">
                <UIcon name="i-heroicons-envelope" class="w-3.5 h-3.5 flex-shrink-0" />
                {{ clientEmail(selectedOrder) }}
              </p>
              <p class="text-xs text-gray-500 flex items-center gap-1.5">
                <UIcon name="i-heroicons-device-phone-mobile" class="w-3.5 h-3.5 flex-shrink-0" />
                {{ selectedOrder.user?.phone ?? selectedOrder.shipping_phone ?? '—' }}
              </p>
              <p v-if="selectedOrder.shipping_city" class="text-xs text-gray-500 flex items-center gap-1.5">
                <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 flex-shrink-0" />
                {{ [selectedOrder.shipping_street, selectedOrder.shipping_city].filter(Boolean).join(', ') }}
              </p>
            </div>
          </div>

          <!-- Articles + récapitulatif -->
          <div class="px-6 py-4">
            <p class="text-xs font-black text-gray-400 tracking-widest mb-3">Articles</p>
            <div class="space-y-2">
              <div v-for="item in selectedOrder.items" :key="item.id"
                class="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl">
                <div class="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img v-if="itemImage(item)" :src="itemImage(item)!" class="w-full h-full object-cover" />
                  <UIcon v-else name="i-heroicons-cube" class="w-5 h-5 text-gray-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-gray-800 truncate">{{ itemName(item) }}</p>
                  <p class="text-xs text-gray-400">× {{ item.quantity }} · {{ formatPrice(item.unit_price) }} / unité</p>
                </div>
                <p class="font-black text-gray-800 text-sm flex-shrink-0">{{ formatPrice(item.unit_price * item.quantity) }}</p>
              </div>
            </div>

            <!-- Sous-total / frais / total -->
            <div class="mt-3 rounded-xl border border-gray-100 overflow-hidden text-sm">
              <div class="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                <span class="text-gray-500">Sous-total</span>
                <span class="font-bold text-gray-700">{{ formatPrice(selectedOrder.subtotal) }}</span>
              </div>
              <div class="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                <span class="text-gray-500 flex items-center gap-1.5">
                  <UIcon name="i-heroicons-truck" class="w-3.5 h-3.5 text-gray-400" />
                  Frais de livraison
                </span>
                <span class="font-bold" :class="(selectedOrder.shipping_cost ?? 0) === 0 ? 'text-green-600' : 'text-gray-700'">
                  {{ (selectedOrder.shipping_cost ?? 0) === 0 ? 'Gratuit' : formatPrice(selectedOrder.shipping_cost) }}
                </span>
              </div>
              <div v-if="(selectedOrder.discount_amount ?? 0) > 0"
                class="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                <span class="text-green-600 flex items-center gap-1.5">
                  <UIcon name="i-heroicons-tag" class="w-3.5 h-3.5" />
                  Réduction
                </span>
                <span class="font-bold text-green-600">- {{ formatPrice(selectedOrder.discount_amount) }}</span>
              </div>
              <div class="flex items-center justify-between px-4 py-3.5 bg-[#274a82]/5 border-t border-[#274a82]/10">
                <span class="font-black text-gray-900">Total</span>
                <span class="font-black text-[#274a82] text-lg">{{ formatPrice(selectedOrder.total) }}</span>
              </div>
            </div>
          </div>

          <!-- Paiement -->
          <div class="px-6 py-4">
            <p class="text-xs font-black text-gray-400 tracking-widest mb-3">Paiement</p>

            <!-- Affichage actuel -->
            <div class="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
              <UIcon
                :name="paymentConfig[selectedOrder.payment_method]?.icon ?? 'i-heroicons-banknotes'"
                class="w-4 h-4 text-gray-400 flex-shrink-0"
              />
              <p class="text-sm font-bold text-gray-700 flex-1">
                {{ paymentConfig[selectedOrder.payment_method]?.label ?? selectedOrder.payment_method }}
              </p>

              <span
                class="text-[10px] font-black px-2 py-0.5 rounded-full"
                :class="selectedOrder.payment_status === 'paid'
                  ? 'bg-green-100 text-green-700'
                  : selectedOrder.payment_status === 'refunded'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-yellow-100 text-yellow-700'"
              >
                {{
                  selectedOrder.payment_status === 'paid'
                    ? 'Payé'
                    : selectedOrder.payment_status === 'refunded'
                    ? 'Remboursé'
                    : 'Non payé'
                }}
              </span>
            </div>

            <!-- MODIFICATION -->
            <div class="mt-4">
              <p class="text-xs font-black text-gray-400 tracking-widest mb-2">
                Modifier le statut de paiement
              </p>

              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="p in [
                    { value: 'unpaid', label: 'Non payé' },
                    { value: 'paid', label: 'Payé' },
                    { value: 'refunded', label: 'Remboursé' }
                  ]"
                  :key="p.value"
                  @click="newPaymentStatus = p.value"
                  class="py-2 rounded-xl border-2 text-xs font-bold transition-all"
                  :class="newPaymentStatus === p.value
                    ? 'border-[#274a82] bg-[#274a82]/5 text-[#274a82]'
                    : 'border-gray-100 text-gray-400 hover:border-gray-300'"
                >
                  {{ p.label }}
                </button>
              </div>

              <button
                @click="updatePaymentStatus"
                :disabled="updatingPayment || newPaymentStatus === selectedOrder.payment_status"
                class="w-full flex items-center justify-center gap-2 py-2.5 mt-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-sm transition-all disabled:opacity-40"
              >
                <UIcon
                  :name="updatingPayment ? 'i-heroicons-arrow-path' : 'i-heroicons-check-circle'"
                  class="w-4 h-4"
                  :class="updatingPayment ? 'animate-spin' : ''"
                />
                {{ updatingPayment ? 'Mise à jour...' : 'Valider paiement' }}
              </button>
            </div>
          </div>

          <!-- Assigner livreur -->
          <div class="px-6 py-4">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-black text-gray-400 tracking-widest">Livreur</p>
              <button @click="showAssign = !showAssign"
                class="text-[11px] font-black text-[#274a82] hover:text-[#e60012] transition flex items-center gap-1">
                <UIcon :name="showAssign ? 'i-heroicons-chevron-up' : 'i-heroicons-pencil-square'" class="w-3.5 h-3.5" />
                {{ showAssign ? 'Fermer' : (getLivreur(selectedOrder) ? 'Changer' : 'Assigner') }}
              </button>
            </div>

            <!-- Livreur actuel -->
            <div v-if="getLivreur(selectedOrder) && !showAssign"
              class="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                :style="{ backgroundColor: livColor(selectedOrder.delivery_driver_id!) }">
                {{ livInitials(getLivreur(selectedOrder)!) }}
              </div>
              <div class="flex-1">
                <p class="text-sm font-black text-gray-800">{{ getLivreur(selectedOrder)!.first_name }} {{ getLivreur(selectedOrder)!.last_name }}</p>
                <p class="text-[11px] text-blue-600 font-bold">Assigné · En cours</p>
              </div>
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-blue-500 flex-shrink-0" />
            </div>

            <!-- Non assigné -->
            <div v-else-if="!getLivreur(selectedOrder) && !showAssign"
              class="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
              <div class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-truck" class="w-4 h-4 text-gray-400" />
              </div>
              <p class="text-xs text-gray-400 italic">Aucun livreur assigné</p>
            </div>

            <!-- Sélection livreur -->
            <div v-if="showAssign" class="space-y-2">
              <div v-if="livreurs.length === 0" class="text-center py-6">
                <p class="text-xs text-gray-400">Aucun livreur disponible</p>
              </div>
              <button v-for="liv in livreurs" :key="liv.id" @click="selectedLivId = liv.id"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left"
                :class="selectedLivId === liv.id ? 'border-[#274a82] bg-[#274a82]/5' : 'border-gray-100 hover:border-gray-300 bg-gray-50'">
                <div class="w-2 h-2 rounded-full flex-shrink-0 transition-colors"
                  :class="selectedLivId === liv.id ? 'bg-[#274a82]' : 'bg-gray-300'"></div>
                <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                  :style="{ backgroundColor: livColor(liv.id) }">
                  {{ livInitials(liv) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-gray-800">{{ liv.first_name }} {{ liv.last_name }}</p>
                  <p v-if="liv.phone" class="text-[11px] text-gray-400">{{ liv.phone }}</p>
                </div>
                <span v-if="selectedOrder.delivery_driver_id === liv.id"
                  class="text-[10px] font-black px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full flex-shrink-0">Actuel</span>
              </button>

              <button @click="assignLivreur" :disabled="!selectedLivId || assigning"
                class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#274a82] hover:bg-[#1a3460] text-white font-black text-sm transition-all disabled:opacity-40 mt-1">
                <UIcon :name="assigning ? 'i-heroicons-arrow-path' : 'i-heroicons-truck'"
                  class="w-4 h-4" :class="assigning ? 'animate-spin' : ''" />
                {{ assigning ? 'Assignation...' : "Confirmer l'assignation" }}
              </button>
              <p class="text-[10px] text-center text-gray-400">
                Passera automatiquement en <span class="font-black text-blue-600">En cours</span>
              </p>
            </div>
          </div>

          <!-- Notes client -->
          <div v-if="selectedOrder.notes" class="px-6 py-4">
            <p class="text-xs font-black text-gray-400 tracking-widest mb-3">Instructions client</p>
            <div class="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
              <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p class="text-sm text-amber-800 leading-relaxed">{{ selectedOrder.notes }}</p>
            </div>
          </div>

          <!-- Changer statut -->
          <div class="px-6 py-4">
            <p class="text-xs font-black text-gray-400  tracking-widest mb-3">Changer le statut</p>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="opt in statusOptions" :key="opt.value" @click="newStatus = opt.value"
                class="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all"
                :class="newStatus === opt.value
                  ? 'border-[#274a82] bg-[#274a82]/5 text-[#274a82]'
                  : 'border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600'">
                <UIcon :name="statusConfig[opt.value].icon" class="w-4 h-4" />
                {{ opt.label }}
              </button>
            </div>
            <button @click="requestStatusChange" :disabled="updatingStatus || newStatus === selectedOrder.status"
              class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#e60012] hover:bg-[#c4000f] text-white font-black text-sm transition-all disabled:opacity-40 mt-3">
              <UIcon :name="updatingStatus ? 'i-heroicons-arrow-path' : 'i-heroicons-check'"
                class="w-4 h-4" :class="updatingStatus ? 'animate-spin' : ''" />
              {{ updatingStatus ? 'Mise à jour...' : 'Appliquer le statut' }}
            </button>
          </div>

        </div>
      </div>
    </template>
  </UModal>

  <!-- ══ MODAL ANNULATION ═══════════════════════════════════════════════════ -->
  <UModal v-model:open="showCancelModal">
    <template #content>
      <div class="overflow-hidden rounded-2xl bg-white">

        <!-- Header rouge -->
        <div class="px-6 py-5 bg-[#e60012] flex items-center justify-between">
          <div>
            <p class="text-xs text-white/60 font-bold tracking-widest">Annulation</p>
            <h2 class="text-base font-black text-white mt-0.5">
              #{{ selectedOrder?.order_number }}
            </h2>
          </div>
          <button @click="showCancelModal = false"
            class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4 text-white" />
          </button>
        </div>

        <div class="px-6 py-5 space-y-4">
          <!-- Icône alerte -->
          <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-[#e60012] flex-shrink-0" />
            <p class="text-sm text-red-700">Cette action est <strong>irréversible</strong>. La commande passera en statut <strong>Annulée</strong>.</p>
          </div>

          <!-- Raison -->
          <div>
            <p class="text-xs font-black text-gray-400 tracking-widest mb-2">
              Raison de l'annulation <span class="text-[#e60012]">*</span>
            </p>
            <textarea v-model="cancelReason" rows="3" maxlength="500"
              placeholder="Ex : Rupture de stock, client injoignable, doublon de commande..."
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#e60012] focus:ring-2 focus:ring-[#e60012]/10 transition-all resize-none">
            </textarea>
            <div class="flex justify-between mt-1">
              <span class="text-[10px]" :class="cancelReason.trim() ? 'text-green-500' : 'text-red-400'">
                {{ cancelReason.trim() ? '✓' : 'La raison est requise' }}
              </span>
              <span class="text-[10px] text-gray-400">{{ cancelReason.length }} / 500</span>
            </div>
          </div>

          <!-- Boutons -->
          <div class="flex gap-3 pt-1">
            <button @click="showCancelModal = false"
              class="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">
              Retour
            </button>
            <button @click="updateStatus(cancelReason)"
              :disabled="!cancelReason.trim() || updatingStatus"
              class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#e60012] hover:bg-red-700 text-white font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <UIcon :name="updatingStatus ? 'i-heroicons-arrow-path' : 'i-heroicons-x-circle'"
                class="w-4 h-4" :class="updatingStatus ? 'animate-spin' : ''" />
              {{ updatingStatus ? 'Annulation...' : "Confirmer l'annulation" }}
            </button>
          </div>
        </div>

      </div>
    </template>
  </UModal>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
}

.paid { background: #dcfce7; color: #166534; }
.unpaid { background: #fee2e2; color: #991b1b; }
.refunded { background: #e0e7ff; color: #3730a3; }
</style>