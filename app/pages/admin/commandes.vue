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

const currentPage = ref(1)
const totalPages  = ref(1)
const totalOrders = ref(0)

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

const openDetail = (order: Order) => {
  selectedOrder.value    = { ...order, items: order.items ?? [] }
  newStatus.value        = order.status
  newPaymentStatus.value = order.payment_status
  selectedLivId.value    = order.delivery_driver_id ?? null
  newShippingCost.value  = (order.shipping_cost ?? 0) > 0 ? order.shipping_cost : null
  showAssign.value       = false
  showDetail.value       = true
}

// ── Normalisation téléphone internationale ──────────────────────────────────
const normalizePhone = (raw: string | null | undefined, defaultCountry = '237') => {
  if (!raw) return ''
  let n = raw.trim()

  // Cas 1 : le "+" est présent → on le respecte tel quel, PAS d'indicatif par défaut
  if (n.startsWith('+')) {
    return n.replace(/[\s\-().+]/g, '')
  }

  // Nettoyer espaces/tirets pour la suite
  n = n.replace(/[\s\-()]/g, '')

  // Cas 2 : format 00 + indicatif (ex: 00225692715744)
  if (n.startsWith('00')) {
    return n.slice(2)
  }

  // Cas 3 : numéro local commençant par 0 (ex: 0692715744)
  if (n.startsWith('0')) {
    return `${defaultCountry}${n.slice(1)}`
  }

  // Cas 4 : déjà sans 0 ni + (numéro brut supposé local)
  return `${defaultCountry}${n}`
}

// ── Frais de livraison ────────────────────────────────────────────────────────
const newShippingCost = ref<number | null>(null)
const savingShipping  = ref(false)

const saveShippingCost = async () => {
  if (!selectedOrder.value || newShippingCost.value === null) return
  savingShipping.value = true
  try {
  const { data } = await axios.patch(
    `${API}/admin/orders/${selectedOrder.value.id}/shipping-cost`,
    { shipping_cost: newShippingCost.value },
    { headers: authHeaders.value }
  )

  // Mettre à jour le state local
  const idx = orders.value.findIndex(o => o.id === selectedOrder.value!.id)
  if (idx !== -1) {
    orders.value[idx].shipping_cost = newShippingCost.value
    orders.value[idx].total         = data.order.total
  }
  selectedOrder.value.shipping_cost = newShippingCost.value
  selectedOrder.value.total         = data.order.total

  // ⚠️ Capturer AVANT le reset (important)
  const frozenOrder = { ...selectedOrder.value, items: [...selectedOrder.value.items] } as Order
  const frozenCost  = newShippingCost.value!
  newShippingCost.value = null

  // Toast
  toast.add({
    title:       'Frais définis',
    description: data.email_sent
      ? `Email + WhatsApp envoyés — ${frozenCost} FCFA`
      : `WhatsApp ouvert — ${frozenCost} FCFA (pas d'email, adresse manquante)`,
    color:    'success',
    icon:     'i-heroicons-check-circle',
    duration: 6000,
  })

  // ✅ WhatsApp automatique
  sendWhatsAppShipping(frozenOrder, frozenCost)

} catch (e: any) {
  toast.add({
    title:       'Erreur',
    description: e?.response?.data?.message ?? 'Impossible de définir les frais.',
    color: 'error',
    icon:  'i-heroicons-x-circle',
  })
}
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

    const liv = getLivreur(o)
    const livreurLabel = liv ? `${liv.first_name} ${liv.last_name}` : '—'

    return `
      <tr>
        <td>${o.order_number}</td>
        <td>${o.user ? o.user.first_name + ' ' + o.user.last_name : o.shipping_first_name + ' ' + o.shipping_last_name}</td>
        <td>${o.user?.email ?? o.shipping_phone ?? '—'}</td>
        <td>${o.shipping_city ?? '—'}</td>
        <td>${statusLabel}</td>
        <td><span class="badge ${o.payment_status}">${paymentStatusLabel}</span></td>
        <td>${paymentMethodLabel}</td>
        <td>${livreurLabel}</td>
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
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .logo { height: 50px; object-fit: contain; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #274a82; color: white; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; }
    td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
    tr:nth-child(even) td { background: #f9fafb; }
    .footer { margin-top: 20px; font-size: 10px; color: #9ca3af; text-align: right; }
    .badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
    .paid { background: #dcfce7; color: #166534; }
    .unpaid { background: #fee2e2; color: #991b1b; }
    .refunded { background: #e0e7ff; color: #3730a3; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <img src="/brclogo.png" alt="BRC Market" class="logo" />
    <div>
      <h1>BRC Market — Liste des commandes</h1>
      <p class="meta">Imprimé le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} · ${selectedOrders.value.length} commande(s)</p>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>N° Commande</th><th>Client</th><th>Contact</th><th>Ville</th>
        <th>Statut</th><th>Paiement</th><th>Méthode</th><th>Livreur</th><th>Total</th><th>Date</th>
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

// ── Bordereau de livraison ────────────────────────────────────────────────────
const printBordereau = (order: Order) => {
  const liv = getLivreur(order)
  const livreurName = liv ? `${liv.first_name} ${liv.last_name}` : 'Non assigné'
  const livreurPhone = liv?.phone ?? '—'
  const clientName_ = order.user
    ? `${order.user.first_name} ${order.user.last_name}`
    : `${order.shipping_first_name} ${order.shipping_last_name}`
  const clientPhone = order.user?.phone ?? order.shipping_phone ?? '—'
  const notes = order.notes || '—'
  const adresse = [order.shipping_street, order.shipping_city].filter(Boolean).join(', ') || '—'

  const itemsRows = (order.items ?? []).map(item => `
    <tr>
      <td>${item.product?.name ?? item.product_name ?? 'Produit'}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(item.unit_price).replace('XAF', 'FCFA')}</td>
      <td style="text-align:right">${new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(item.unit_price * item.quantity).replace('XAF', 'FCFA')}</td>
    </tr>
  `).join('')

  const paymentMethodLabel =
    order.payment_method === 'mobile_money' ? 'Mobile Money' :
    order.payment_method === 'cash_on_delivery' ? 'Paiement à la livraison' :
    order.payment_method

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bordereau #${order.order_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 28px; max-width: 700px; margin: auto; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #274a82; }
    .logo { height: 55px; object-fit: contain; }
    .title-block h1 { font-size: 20px; font-weight: 900; color: #274a82; }
    .title-block p { font-size: 11px; color: #6b7280; margin-top: 2px; }
    .badge-number { background: #274a82; color: white; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 900; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; }
    .card-title { font-size: 9px; font-weight: 900; color: #9ca3af; letter-spacing: .08em; margin-bottom: 8px; }
    .card p { font-size: 12px; color: #374151; margin-bottom: 3px; }
    .card .name { font-size: 12px; font-weight: 900; color: #111827; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #274a82; color: white; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; }
    td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; font-size: 11px; }
    tr:nth-child(even) td { background: #f9fafb; }
    .totals { margin-left: auto; width: 260px; }
    .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #374151; }
    .totals-row.total { border-top: 2px solid #274a82; margin-top: 6px; padding-top: 8px; font-size: 15px; font-weight: 900; color: #274a82; }
    .signature-block { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 32px; }
    .sig { border-top: 1px dashed #d1d5db; padding-top: 8px; }
    .sig p { font-size: 10px; color: #6b7280; }
    .note-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; padding: 10px 14px; margin-bottom: 20px; }
    .note-box p { font-size: 11px; color: #92400e; }
    .footer { margin-top: 24px; font-size: 9px; color: #d1d5db; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 12px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>

  <div class="header">
    <div style="display:flex;align-items:center;gap:14px">
      <img src="/images/logos/brclogo.png" alt="BRC Market" class="logo" />
      <div class="title-block">
        <h1>Bordereau de livraison</h1>
        <p>Imprimé le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>
    </div>
    <span class="badge-number">#${order.order_number}</span>
  </div>

  <div class="grid2">
    <div class="card">
      <p class="card-title">Destinataire</p>
      Nom: <p class="name">${clientName_}</p>
      Tel: <p>${clientPhone}</p>
      Adresse: <p>${adresse}</p>
    </div>
    <div class="card">
      <p class="card-title">Livreur assigné</p>
      Nom: <p class="name">${livreurName}</p>
      Tel: <p>${livreurPhone}</p>
      <p style="margin-top:6px;font-size:10px;color:#6b7280">Mode paiement : <strong>${paymentMethodLabel}</strong></p>
      <p style="font-size:10px;color:${order.payment_status === 'paid' ? '#166534' : '#854d0e'}">
        Statut paiement : <strong>${order.payment_status === 'paid' ? 'Payé' : 'À encaisser'}</strong>
      </p>
    </div>
  </div>

  ${order.notes ? `
  <div class="note-box">
    <p>💬 <strong>Instructions client :</strong> ${order.notes}</p>
  </div>` : ''}

  <table>
    <thead>
      <tr><th>Article</th><th style="text-align:center">Qté</th><th style="text-align:right">Prix unit.</th><th style="text-align:right">Sous-total</th></tr>
    </thead>
    <tbody>${itemsRows}</tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Sous-total</span><span>${new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(order.subtotal).replace('XAF', 'FCFA')}</span></div>
    <div class="totals-row"><span>Frais de livraison</span><span>${(order.shipping_cost ?? 0) === 0 ? 'Gratuit' : new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(order.shipping_cost).replace('XAF', 'FCFA')}</span></div>
    ${(order.discount_amount ?? 0) > 0 ? `<div class="totals-row" style="color:#16a34a"><span>Réduction</span><span>- ${new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(order.discount_amount).replace('XAF', 'FCFA')}</span></div>` : ''}
    <div class="totals-row total"><span>TOTAL</span><span>${new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(order.total).replace('XAF', 'FCFA')}</span></div>
  </div>

  <div class="signature-block">
    <div class="sig"><p>Signature du livreur</p></div>
    <div class="sig"><p>Signature du client (reception)</p></div>
  </div>

  <p class="footer">BRC Market · Bordereau généré automatiquement · ${new Date().toLocaleString('fr-FR')}</p>
</body>
</html>`

  const win = window.open('', '_blank', 'width=800,height=900')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 400)
}

const printFacture = (order: Order) => {
  const clientName_ = order.user
    ? `${order.user.first_name} ${order.user.last_name}`
    : `${order.shipping_first_name} ${order.shipping_last_name}`
  const clientEmail_ = order.user?.email ?? '—'
  const clientPhone = order.user?.phone ?? order.shipping_phone ?? '—'
  const adresse = [order.shipping_street, order.shipping_city].filter(Boolean).join(', ') || '—'

  const itemsRows = (order.items ?? []).map((item, i) => `
    <tr>
      <td style="color:#6b7280;text-align:center">${i + 1}</td>
      <td>${item.product?.name ?? item.product_name ?? 'Produit'}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(item.unit_price).replace('XAF', 'FCFA')}</td>
      <td style="text-align:right;font-weight:700">${new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(item.unit_price * item.quantity).replace('XAF', 'FCFA')}</td>
    </tr>
  `).join('')

  const paymentMethodLabel =
    order.payment_method === 'mobile_money'     ? 'Mobile Money' :
    order.payment_method === 'cash_on_delivery' ? 'Paiement à la livraison' :
    order.payment_method

  const statusLabel =
    order.status === 'pending'    ? 'En attente' :
    order.status === 'processing' ? 'En cours'   :
    order.status === 'shipped'    ? 'Expédiée'   :
    order.status === 'delivered'  ? 'Livrée'     :
    order.status === 'cancelled'  ? 'Annulée'    : order.status

  const isPaid     = order.payment_status === 'paid'
  const isUnpaid   = order.payment_status === 'unpaid'
  const isRefunded = order.payment_status === 'refunded'

  const fmt = (n: number) =>
    new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(n).replace('XAF', 'FCFA')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Facture #${order.order_number} — BRC Market</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1f2937; background: white; padding: 40px 48px; max-width: 794px; margin: auto; }

    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }
    .logo { height: 60px; object-fit: contain; }
    .company-info { text-align: left; }
    .company-info h2 { font-size: 16px; font-weight: 900; color: #274a82; }
    .company-info p { font-size: 10px; color: #6b7280; margin-top: 2px; line-height: 1.6; }

    .title-bar { background: #274a82; color: white; border-radius: 8px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .title-bar h1 { font-size: 18px; font-weight: 900; letter-spacing: .02em; }
    .title-bar .meta { text-align: right; }
    .title-bar .meta p { font-size: 11px; opacity: .8; }
    .title-bar .meta strong { font-size: 13px; opacity: 1; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
    .info-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 18px; }
    .info-card .label { font-size: 9px; font-weight: 900; color: #9ca3af; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 8px; }
    .info-card .name { font-size: 14px; font-weight: 900; color: #111827; margin-bottom: 4px; }
    .info-card p { font-size: 11px; color: #6b7280; margin-bottom: 2px; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead th { background: #f9fafb; border-top: 2px solid #274a82; border-bottom: 1px solid #e5e7eb; padding: 9px 12px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .06em; color: #374151; }
    tbody td { padding: 9px 12px; border-bottom: 1px solid #f3f4f6; font-size: 11px; color: #374151; }
    tbody tr:last-child td { border-bottom: none; }

    .bottom { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-top: 8px; }
    .left-bottom { flex: 1; display: flex; flex-direction: column; gap: 12px; }

    /* ── Garantie ── */
    .garantie-box { border: 2px solid #274a82; border-radius: 8px; padding: 12px 16px; background: #f0f4ff; }
    .garantie-box .label { font-size: 9px; font-weight: 900; color: #274a82; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 6px; }
    .garantie-box p { font-size: 10px; color: #374151; line-height: 1.6; }
    .garantie-box .duration { font-size: 13px; font-weight: 900; color: #274a82; margin-bottom: 4px; }

    .totals-box { min-width: 240px; }
    .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #6b7280; }
    .totals-row span:last-child { color: #374151; }
    .totals-row.discount span { color: #16a34a; }
    .totals-row.grand-total { border-top: 2px solid #274a82; margin-top: 8px; padding-top: 10px; font-size: 16px; font-weight: 900; color: #274a82; }

    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 900; }
    .status-delivered { background: #dcfce7; color: #166534; }
    .status-pending   { background: #fef9c3; color: #854d0e; }
    .status-other     { background: #dbeafe; color: #1d4ed8; }

    .footer { margin-top: 28px; border-top: 1px solid #f3f4f6; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; }
    .footer p { font-size: 9px; color: #d1d5db; }
    .footer .thanks { font-size: 12px; font-weight: 900; color: #274a82; }

    .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
    .sig { border-top: 1px dashed #d1d5db; padding-top: 8px; }
    .sig p { font-size: 10px; color: #6b7280; }

    @media print { body { padding: 0; } }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <img src="/images/logos/brclogo.png" alt="BRC Market" class="logo" />
    <div class="company-info">
      <h2>BRC Market</h2>
      <p>Douala, Yaoundé, Cameroun<br>businessrevcompany@gmail.com<br>+237 689205751</p>
      <p class="niu">NIU : M032416656798Y</p>
    </div>
  </div>

  <!-- Title bar -->
  <div class="title-bar">
    <div>
      <h1>FACTURE</h1>
      <p style="font-size:11px;opacity:.75;margin-top:2px">Commande #${order.order_number}</p>
    </div>
    <div class="meta">
      <p>Date d'émission</p>
      <strong>${new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
     
    </div>
  </div>

  <!-- Info grid -->
  <div class="info-grid">
    <div class="info-card">
      <p class="label">Facturé à</p>
      <p class="name">${clientName_}</p>
      <p>${clientEmail_}</p>
      <p>${clientPhone}</p>
      <p>${adresse}</p>
    </div>
    <div class="info-card">
      <p class="label">Détails de la commande</p>
      <p><strong>N° :</strong> #${order.order_number}</p>
      <p><strong>Date :</strong> ${new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
      <p><strong>Mode de paiement :</strong> ${paymentMethodLabel}</p>
      <p style="margin-top:10px;font-size:9px;font-weight:900;color:#9ca3af;text-transform:uppercase;letter-spacing:.1em;">Statut du paiement:</p>
    </div>
  </div>

  <!-- Articles -->
  <table>
    <thead>
      <tr>
        <th style="width:32px;text-align:center">#</th>
        <th>Désignation</th>
        <th style="text-align:center;width:60px">Qté</th>
        <th style="text-align:right;width:120px">Prix unit.</th>
        <th style="text-align:right;width:130px">Total</th>
      </tr>
    </thead>
    <tbody>${itemsRows}</tbody>
  </table>

  <!-- Bottom -->
  <div class="bottom">
    <div class="left-bottom">


      <!-- Garantie -->
      <div class="garantie-box">
        <p class="label">Garantie </p>
        <p class="duration">3 mois de garantie</p>
        <p>Ce produit bénéficie d'une garantie de <strong>3 mois</strong> à compter de la date d'achat.
        Tout défaut de fabrication constaté dans ce délai sera pris en charge gratuitement.
        La garantie ne couvre pas les dommages liés à une mauvaise utilisation.</p>
        <p style="margin-top:6px;font-size:9px;color:#6b7280">
          Conservez cette facture comme preuve d'achat · BRC Market · +237 689205751
        </p>
      </div>

    </div>

    <!-- Totaux -->
    <div class="totals-box">
      <div class="totals-row"><span>Sous-total</span><span>${fmt(order.subtotal)}</span></div>
      <div class="totals-row"><span>Frais de livraison</span><span>${(order.shipping_cost ?? 0) === 0 ? 'Gratuit' : fmt(order.shipping_cost)}</span></div>
      ${(order.discount_amount ?? 0) > 0 ? `<div class="totals-row discount"><span>Réduction</span><span>- ${fmt(order.discount_amount)}</span></div>` : ''}
      <div class="totals-row grand-total"><span>TOTAL TTC</span><span>${fmt(order.total)}</span></div>
    </div>
  </div>

  <!-- Signatures -->
  <div class="signature-section">
    <div class="sig"><p>Signature du client</p></div>
    <div class="sig"><p>Cachet & Signature BRC Market</p></div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div>
      <p class="thanks">Merci pour votre achat chez BRC Market !</p>
      <p style="margin-top:3px">Ce document tient lieu de facture · TVA non applicable · Garantie 3 mois</p>
    </div>
    <p>Généré le ${new Date().toLocaleString('fr-FR')}</p>
  </div>

</body>
</html>`

  const win = window.open('', '_blank', 'width=850,height=1100')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 400)
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


// ── WhatsApp ───────────────────────────────────────────────────────────────────
const sendWhatsAppShipping = (order: Order, shippingCost: number) => {
  const raw = order.user?.phone ?? order.shipping_phone ?? ''
  if (!raw) return // numéro absent → silencieux

  // Normalisation vers 237XXXXXXXXX
  const intlPhone = normalizePhone(raw)

  const clientName_ = order.user
    ? `${order.user.first_name} ${order.user.last_name}`
    : `${order.shipping_first_name} ${order.shipping_last_name}`

  const adresse = [order.shipping_street, order.shipping_city]
    .filter(Boolean).join(', ') || 'Non précisée'

  const notes = order.notes

  const fmt = (n: number) =>
    new Intl.NumberFormat('fr-CM', {
      style: 'currency', currency: 'XAF', maximumFractionDigits: 0,
    }).format(n).replace('XAF', 'FCFA')

  const itemsList = (order.items ?? [])
    .map(i => {
      const name = i.product?.name ?? i.product_name ?? 'Produit'
      return `  • ${name} ×${i.quantity} — ${fmt(i.unit_price * i.quantity)}`
    })
    .join('\n')

  const totalFinal = (order.subtotal ?? 0) + shippingCost - (order.discount_amount ?? 0)

  const paymentLabel =
    order.payment_method === 'mobile_money'     ? 'Mobile Money'            :
    order.payment_method === 'cash_on_delivery' ? 'Paiement à la livraison' :
    order.payment_method

  const message = `
    Cher(e) ${clientName_}

    Votre commande *#${order.order_number}* est confirmée et en cours de traitement.

    ━━━━━━━━━━━━━━━━
    *VOS ARTICLES*
    
    ${itemsList}

    ━━━━━━━━━━━━━━━━
    *RÉCAPITULATIF*
    
      • Sous-total  : ${fmt(order.subtotal ?? 0)}
      • Livraison   : ${fmt(shippingCost)}${(order.discount_amount ?? 0) > 0 ? `\n  • Réduction   : -${fmt(order.discount_amount)}` : ''}
      *TOTAL      : ${fmt(totalFinal)}*

    ━━━━━━━━━━━━━━━━
    *LIVRAISON*
    
      • Adresse  : ${adresse}
      • Notes  : ${notes}
      • Paiement : ${paymentLabel}

    Notre équipe vous contactera pour organiser la livraison.
    Merci pour votre confiance ! 
    *— BRC Market*`.trim()

  window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`, '_blank')
}

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
const fetchOrders = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API}/admin/orders`, {
      headers: authHeaders.value,
      params:  { per_page: 15, page },
    })
    orders.value  = data.data
    currentPage.value = data.current_page
    totalPages.value  = data.last_page
    totalOrders.value = data.total
  } catch (e: any) {
    toast.add({ title: `Erreur`, description: e?.response?.data?.message ?? 'Erreur', color: 'error' })
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

onMounted(() => { fetchOrders(1); fetchLivreurs() })

// ── Ouvrir détail ──────────────────────────────────────────────────────────────

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
      { payment_status: newPaymentStatus.value },
      { headers: authHeaders.value }
    )
    const idx = orders.value.findIndex(o => o.id === selectedOrder.value!.id)
    if (idx !== -1) orders.value[idx].payment_status = newPaymentStatus.value
    selectedOrder.value.payment_status = newPaymentStatus.value
    toast.add({ title: 'Paiement mis à jour', description: `#${selectedOrder.value.order_number}`, color: 'success', icon: 'i-heroicons-check-circle' })
  } catch (e: any) {
    toast.add({ title: 'Erreur', description: e?.response?.data?.message ?? 'Impossible', color: 'error' })
  } finally {
    updatingPayment.value = false
  }
}

// ── WhatsApp → Livreur ────────────────────────────────────────────────────────
const sendWhatsAppLivreur = (order: Order, liv: Livreur) => {
  const raw = liv.phone ?? ''
  if (!raw) return

  const cleaned   = raw.replace(/[\s\-().+]/g, '')
  const intlPhone =
    cleaned.startsWith('237') ? cleaned :
    cleaned.startsWith('0')   ? `237${cleaned.slice(1)}` :
                                `237${cleaned}`

  const clientName_ = order.user
    ? `${order.user.first_name} ${order.user.last_name}`
    : `${order.shipping_first_name} ${order.shipping_last_name}`

  const clientPhone = order.user?.phone ?? order.shipping_phone ?? '—'
  const adresse = [order.shipping_street, order.shipping_city].filter(Boolean).join(', ') || 'Non précisée'
  const notes   = order.notes || 'Aucune'

  const fmt = (n: number) =>
    new Intl.NumberFormat('fr-CM', {
      style: 'currency', currency: 'XAF', maximumFractionDigits: 0,
    }).format(n).replace('XAF', 'FCFA')

  const itemsList = (order.items ?? [])
    .map(i => `  • ${i.product?.name ?? i.product_name ?? 'Produit'} ×${i.quantity}`)
    .join('\n')

  const paymentLabel =
    order.payment_method === 'mobile_money'     ? 'Mobile Money (déjà payé)'       :
    order.payment_method === 'cash_on_delivery' ? 'À encaisser à la livraison' :
    order.payment_method

  const paymentStatus = order.payment_status === 'paid' ? 'Payé' : 'Non payé — à encaisser'

  const message = `
Salut ${liv.first_name} 

Vous avez une nouvelle livraison à effectuer.

━━━━━━━━━━━━━━━━
*COMMANDE #${order.order_number}*

${itemsList}

━━━━━━━━━━━━━━━━
*CLIENT*

  • Nom     : ${clientName_}
  • Tél     : ${clientPhone}
  • Adresse : ${adresse}
  • Notes   : ${notes}

━━━━━━━━━━━━━━━━
*PAIEMENT*

  • Mode    : ${paymentLabel}
  • Statut  : ${paymentStatus}
  
  • *TOTAL  : ${fmt(order.total)}*

━━━━━━━━━━━━━━━━
Merci et bonne livraison !
*— BRC Market*`.trim()

  window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`, '_blank')
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

    // ✅ WhatsApp automatique au livreur
    sendWhatsAppLivreur({ ...selectedOrder.value, items: selectedOrder.value.items }, liv)

    toast.add({
      title:       'Livreur assigné',
      description: `#${selectedOrder.value.order_number} → ${liv.first_name} ${liv.last_name} · WhatsApp ouvert`,
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
        style: { width: '15px', height: '15px', cursor: 'pointer', accentColor: '#274a82', borderRadius: '4px' },
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
      return h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '6px' } }, [
        // Bordereau
        h('button', {
          onClick: (e: MouseEvent) => { e.stopPropagation(); printBordereau(o) },
          title: 'Bordereau de livraison',
          style: {
            width: '30px', height: '30px', borderRadius: '10px',
            backgroundColor: 'rgba(2,132,199,0.08)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0284c7', transition: 'all .15s',
          },
          onMouseenter: (e: MouseEvent) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#0284c7'; (e.currentTarget as HTMLElement).style.color = 'white' },
          onMouseleave: (e: MouseEvent) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(2,132,199,0.08)'; (e.currentTarget as HTMLElement).style.color = '#0284c7' },
        }, [h(UIcon, { name: 'i-heroicons-truck', style: { width: '13px', height: '13px' } })]),
        // Facture
        h('button', {
          onClick: (e: MouseEvent) => { e.stopPropagation(); printFacture(o) },
          title: 'Facture A4',
          style: {
            width: '30px', height: '30px', borderRadius: '10px',
            backgroundColor: 'rgba(22,163,74,0.08)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#16a34a', transition: 'all .15s',
          },
          onMouseenter: (e: MouseEvent) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#16a34a'; (e.currentTarget as HTMLElement).style.color = 'white' },
          onMouseleave: (e: MouseEvent) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(22,163,74,0.08)'; (e.currentTarget as HTMLElement).style.color = '#16a34a' },
        }, [h(UIcon, { name: 'i-heroicons-document-text', style: { width: '13px', height: '13px' } })]),
        // Détail
        h('button', {
          onClick: () => openDetail(o),
          title: 'Voir le détail',
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

      <!-- Mobile : select -->
      <div class="sm:hidden w-full">
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

      <!-- Desktop : boutons pills -->
      <div class="hidden sm:flex gap-2 flex-wrap">
        <button v-for="f in filters" :key="f.key" @click="activeFilter = f.key"
          class="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          :class="activeFilter === f.key
            ? 'bg-[#274a82] text-white shadow-sm'
            : 'bg-white border border-gray-200 text-gray-500 hover:border-[#274a82] hover:text-[#274a82]'">
          {{ f.label }}
          <span v-if="f.key !== 'all'" class="ml-1 opacity-70">
            ({{ orders.filter(o => o.status === f.key).length }})
          </span>
        </button>
      </div>

      <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="N° commande, client...." class="w-64" />
    </div>

    <!-- ── Légende boutons actions ─────────────────────────────────────────── -->
    <div class="hidden sm:flex items-center gap-4 text-xs text-gray-400">
      <span class="flex items-center gap-1.5">
        <span class="w-5 h-5 rounded-lg bg-sky-50 flex items-center justify-center">
          <UIcon name="i-heroicons-truck" class="w-3 h-3 text-sky-600" />
        </span>
        Bordereau de livraison
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-5 h-5 rounded-lg bg-green-50 flex items-center justify-center">
          <UIcon name="i-heroicons-document-text" class="w-3 h-3 text-green-600" />
        </span>
        Facture A4
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-5 h-5 rounded-lg bg-[#274a82]/10 flex items-center justify-center">
          <UIcon name="i-heroicons-chevron-right" class="w-3 h-3 text-[#274a82]" />
        </span>
        Détail / gestion
      </span>
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
            Imprimer liste
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
      
       <!-- ── Pagination ──────────────────────────────────────────────────── -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-white rounded-b-2xl">
        <p class="text-xs text-gray-400 font-medium">
          Page {{ currentPage }} / {{ totalPages }} · {{ totalOrders }} commande{{ totalOrders > 1 ? 's' : '' }}
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="fetchOrders(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
          </button>
          <button
            v-for="p in totalPages" :key="p"
            @click="fetchOrders(p)"
            class="w-8 h-8 rounded-lg text-xs font-black transition-all"
            :class="p === currentPage
              ? 'bg-[#274a82] text-white'
              : 'border border-gray-200 text-gray-500 hover:bg-gray-50'">
            {{ p }}
          </button>
          <button
            @click="fetchOrders(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
          </button>
        </div>
      </div>
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
          <div class="flex items-center gap-2 flex-wrap justify-end">
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

        <!-- Boutons impression dans le modal -->
        <div class="px-6 pt-4 flex gap-2">
          <button @click="printBordereau(selectedOrder)"
            class="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-sky-50 hover:bg-sky-600 text-sky-600 hover:text-white border border-sky-100 hover:border-sky-600 font-black text-xs transition-all">
            <UIcon name="i-heroicons-truck" class="w-3.5 h-3.5" />
            Bordereau livraison
          </button>
          <button @click="printFacture(selectedOrder)"
            class="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-50 hover:bg-green-600 text-green-600 hover:text-white border border-green-100 hover:border-green-600 font-black text-xs transition-all">
            <UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5" />
            Facture A4
          </button>
        </div>

        <!-- Contenu scrollable -->
        <div class="max-h-[65vh] overflow-y-auto divide-y divide-gray-100 mt-4">

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
                <span class="font-bold" :class="(selectedOrder.shipping_cost ?? 0) === 0 ? 'text-yellow-600' : 'text-gray-700'">
                  {{ (selectedOrder.shipping_cost ?? 0) === 0 ? 'En cours' : formatPrice(selectedOrder.shipping_cost) }}
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
            <div class="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
              <UIcon :name="paymentConfig[selectedOrder.payment_method]?.icon ?? 'i-heroicons-banknotes'" class="w-4 h-4 text-gray-400 flex-shrink-0" />
              <p class="text-sm font-bold text-gray-700 flex-1">{{ paymentConfig[selectedOrder.payment_method]?.label ?? selectedOrder.payment_method }}</p>
              <span class="text-[10px] font-black px-2 py-0.5 rounded-full"
                :class="selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-700' : selectedOrder.payment_status === 'refunded' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'">
                {{ selectedOrder.payment_status === 'paid' ? 'Payé' : selectedOrder.payment_status === 'refunded' ? 'Remboursé' : 'Non payé' }}
              </span>
            </div>
            <div class="mt-4">
              <p class="text-xs font-black text-gray-400 tracking-widest mb-2">Modifier le statut de paiement</p>
              <div class="grid grid-cols-3 gap-2">
                <button v-for="p in [{ value: 'unpaid', label: 'Non payé' }, { value: 'paid', label: 'Payé' }, { value: 'refunded', label: 'Remboursé' }]"
                  :key="p.value" @click="newPaymentStatus = p.value"
                  class="py-2 rounded-xl border-2 text-xs font-bold transition-all"
                  :class="newPaymentStatus === p.value ? 'border-[#274a82] bg-[#274a82]/5 text-[#274a82]' : 'border-gray-100 text-gray-400 hover:border-gray-300'">
                  {{ p.label }}
                </button>
              </div>
              <button @click="updatePaymentStatus" :disabled="updatingPayment || newPaymentStatus === selectedOrder.payment_status"
                class="w-full flex items-center justify-center gap-2 py-2.5 mt-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-sm transition-all disabled:opacity-40">
                <UIcon :name="updatingPayment ? 'i-heroicons-arrow-path' : 'i-heroicons-check-circle'" class="w-4 h-4" :class="updatingPayment ? 'animate-spin' : ''" />
                {{ updatingPayment ? 'Mise à jour...' : 'Valider paiement' }}
              </button>
            </div>
          </div>

          <!-- ── Frais de livraison ── -->
          <div class="px-6 py-4">
            <p class="text-xs font-black text-gray-400 tracking-widest mb-3">Frais de livraison</p>

            <!-- Statut actuel -->
            <div class="flex items-center gap-3 px-4 py-3 rounded-xl mb-3"
              :class="(selectedOrder.shipping_cost ?? 0) > 0
                ? 'bg-green-50 border border-green-100'
                : 'bg-amber-50 border border-amber-100'">
              <UIcon
                :name="(selectedOrder.shipping_cost ?? 0) > 0
                  ? 'i-heroicons-check-circle'
                  : 'i-heroicons-clock'"
                class="w-4 h-4 flex-shrink-0"
                :class="(selectedOrder.shipping_cost ?? 0) > 0 ? 'text-green-500' : 'text-amber-500'"
              />
              <div class="flex-1">
                <p class="text-sm font-black"
                  :class="(selectedOrder.shipping_cost ?? 0) > 0 ? 'text-green-700' : 'text-amber-700'">
                  {{ (selectedOrder.shipping_cost ?? 0) > 0
                    ? `Frais définis : ${formatPrice(selectedOrder.shipping_cost)}`
                    : 'Frais non encore définis' }}
                </p>
                <p class="text-[11px] text-gray-400 mt-0.5">
                  {{ (selectedOrder.shipping_cost ?? 0) > 0
                    ? 'Le client a reçu un email de confirmation avec les frais.'
                    : 'Définissez les frais pour envoyer le mail final au client.' }}
                </p>
              </div>
            </div>

            <!-- Total recalculé si frais définis -->
            <div v-if="(selectedOrder.shipping_cost ?? 0) > 0"
              class="flex justify-between items-center px-4 py-2.5 bg-[#274a82]/5 rounded-xl border border-[#274a82]/10 mb-3">
              <span class="text-xs font-black text-gray-500">Total final (articles + livraison)</span>
              <span class="text-base font-black text-[#274a82]">
                {{ formatPrice((selectedOrder.subtotal ?? 0) + (selectedOrder.shipping_cost ?? 0) - (selectedOrder.discount_amount ?? 0)) }}
              </span>
            </div>

            <!-- Input + bouton -->
            <div class="flex gap-2 items-center">
              <div class="relative flex-1">
                <input
                  v-model.number="newShippingCost"
                  type="number"
                  min="0"
                  step="100"
                  :placeholder="(selectedOrder.shipping_cost ?? 0) > 0
                    ? `Modifier (actuel : ${selectedOrder.shipping_cost} FCFA)`
                    : 'Ex : 2000'"
                  class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#274a82] focus:ring-2 focus:ring-[#274a82]/10 transition-all pr-16"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300">FCFA</span>
              </div>
              <button
                @click="saveShippingCost"
                :disabled="newShippingCost === null || savingShipping"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#274a82] hover:bg-[#1a3460] text-white font-black text-xs transition-all disabled:opacity-40 whitespace-nowrap">
                <UIcon
                  :name="savingShipping ? 'i-heroicons-arrow-path' : 'i-heroicons-paper-airplane'"
                  class="w-3.5 h-3.5"
                  :class="savingShipping ? 'animate-spin' : ''"
                />
                {{ savingShipping ? 'Envoi...' : 'Définir & Envoyer mail' }}
              </button>
            </div>

            <p class="text-[11px] text-gray-400 mt-2 flex items-center gap-1.5">
              <UIcon name="i-heroicons-envelope" class="w-3 h-3 flex-shrink-0" />
              Un email avec les frais confirmés + la mention de la clé USB sera envoyé au client.
            </p>
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
            <div v-else-if="!getLivreur(selectedOrder) && !showAssign"
              class="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
              <div class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-truck" class="w-4 h-4 text-gray-400" />
              </div>
              <p class="text-xs text-gray-400 italic">Aucun livreur assigné</p>
            </div>
            <div v-if="showAssign" class="space-y-2">
              <div v-if="livreurs.length === 0" class="text-center py-6">
                <p class="text-xs text-gray-400">Aucun livreur disponible</p>
              </div>
              <button v-for="liv in livreurs" :key="liv.id" @click="selectedLivId = liv.id"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left"
                :class="selectedLivId === liv.id ? 'border-[#274a82] bg-[#274a82]/5' : 'border-gray-100 hover:border-gray-300 bg-gray-50'">
                <div class="w-2 h-2 rounded-full flex-shrink-0 transition-colors" :class="selectedLivId === liv.id ? 'bg-[#274a82]' : 'bg-gray-300'"></div>
                <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0" :style="{ backgroundColor: livColor(liv.id) }">
                  {{ livInitials(liv) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-gray-800">{{ liv.first_name }} {{ liv.last_name }}</p>
                  <p v-if="liv.phone" class="text-[11px] text-gray-400">{{ liv.phone }}</p>
                </div>
                <span v-if="selectedOrder.delivery_driver_id === liv.id" class="text-[10px] font-black px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full flex-shrink-0">Actuel</span>
              </button>
              <button @click="assignLivreur" :disabled="!selectedLivId || assigning"
                class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#274a82] hover:bg-[#1a3460] text-white font-black text-sm transition-all disabled:opacity-40 mt-1">
                <UIcon :name="assigning ? 'i-heroicons-arrow-path' : 'i-heroicons-truck'" class="w-4 h-4" :class="assigning ? 'animate-spin' : ''" />
                {{ assigning ? 'Assignation...' : "Confirmer l'assignation" }}
              </button>
              <p class="text-[10px] text-center text-gray-400">Passera automatiquement en <span class="font-black text-blue-600">En cours</span></p>
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
            <p class="text-xs font-black text-gray-400 tracking-widest mb-3">Changer le statut</p>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="opt in statusOptions" :key="opt.value" @click="newStatus = opt.value"
                class="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all"
                :class="newStatus === opt.value ? 'border-[#274a82] bg-[#274a82]/5 text-[#274a82]' : 'border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600'">
                <UIcon :name="statusConfig[opt.value].icon" class="w-4 h-4" />
                {{ opt.label }}
              </button>
            </div>
            <button @click="requestStatusChange" :disabled="updatingStatus || newStatus === selectedOrder.status"
              class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#e60012] hover:bg-[#c4000f] text-white font-black text-sm transition-all disabled:opacity-40 mt-3">
              <UIcon :name="updatingStatus ? 'i-heroicons-arrow-path' : 'i-heroicons-check'" class="w-4 h-4" :class="updatingStatus ? 'animate-spin' : ''" />
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
        <div class="px-6 py-5 bg-[#e60012] flex items-center justify-between">
          <div>
            <p class="text-xs text-white/60 font-bold tracking-widest">Annulation</p>
            <h2 class="text-base font-black text-white mt-0.5">#{{ selectedOrder?.order_number }}</h2>
          </div>
          <button @click="showCancelModal = false" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4 text-white" />
          </button>
        </div>
        <div class="px-6 py-5 space-y-4">
          <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-[#e60012] flex-shrink-0" />
            <p class="text-sm text-red-700">Cette action est <strong>irréversible</strong>. La commande passera en statut <strong>Annulée</strong>.</p>
          </div>
          <div>
            <p class="text-xs font-black text-gray-400 tracking-widest mb-2">Raison de l'annulation <span class="text-[#e60012]">*</span></p>
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
          <div class="flex gap-3 pt-1">
            <button @click="showCancelModal = false" class="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">Retour</button>
            <button @click="updateStatus(cancelReason)" :disabled="!cancelReason.trim() || updatingStatus"
              class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#e60012] hover:bg-red-700 text-white font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <UIcon :name="updatingStatus ? 'i-heroicons-arrow-path' : 'i-heroicons-x-circle'" class="w-4 h-4" :class="updatingStatus ? 'animate-spin' : ''" />
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
.slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from,
.slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

.badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
.paid { background: #dcfce7; color: #166534; }
.unpaid { background: #fee2e2; color: #991b1b; }
.refunded { background: #e0e7ff; color: #3730a3; }
</style>