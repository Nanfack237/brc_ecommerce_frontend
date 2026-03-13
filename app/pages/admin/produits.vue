<script setup lang="ts">
import { ref, computed, watch, h, resolveComponent } from 'vue'
import axios from 'axios'
import type { TableColumn } from '@nuxt/ui'
import type { ToastProps } from '@nuxt/ui'

const { requireAdmin, token } = useAuth()
requireAdmin()

useHead({ title: 'BRC Market — Admin Produits' })

const toast  = useToast()
const config = useRuntimeConfig()
const API    = config.public.apiBase
const { uploadImages } = useCloudinary()

const UIcon   = resolveComponent('UIcon')
const UButton = resolveComponent('UButton')

// ── Types ──────────────────────────────────────────────────────────────────
interface Category { id: number; name: string; slug: string; children?: Category[] }

interface Product {
  id:             number
  name:           string
  slug:           string
  description:    string
  brand:          string
  sku:            string
  price:          number
  old_price:      number | null
  stock:          number
  category_id:    number | null
  category:       { id: number; name: string; slug: string } | null
  status:         'published' | 'draft' | 'archived' | 'out_of_stock'
  is_featured:    boolean
  is_best_seller: boolean
  is_new:         boolean
  images:         string[]
  specs:          { key: string; value: string }[]
  reviews_count:  number
  discount_percent?: number
}

// ── View ───────────────────────────────────────────────────────────────────
const view = ref<'list' | 'form'>('list')

// ── State ──────────────────────────────────────────────────────────────────
const products    = ref<Product[]>([])
const categories  = ref<Category[]>([])
const loading     = ref(true)
const saving      = ref(false)
const uploading   = ref(false)
const toggling    = ref<number | null>(null)
const deleting    = ref<number | null>(null)
const searchQuery = ref('')
const filterStatus= ref('')

const authHeaders = computed(() => ({ Authorization: `Bearer ${token.value}` }))

const formatPrice = (p: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(p)

// ── Fetch ──────────────────────────────────────────────────────────────────
const fetchProducts = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (searchQuery.value)  params.q      = searchQuery.value
    if (filterStatus.value) params.status = filterStatus.value
    const { data } = await axios.get(`${API}/admin/products`, { headers: authHeaders.value, params })
    products.value = data.data ?? data
  } catch {
    toast.add({ title: 'Erreur de chargement', color: 'error', icon: 'i-heroicons-exclamation-circle' } as ToastProps)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const { data } = await axios.get(`${API}/admin/categories`, { headers: authHeaders.value })
    categories.value = data
  } catch {}
}

onMounted(() => { fetchProducts(); fetchCategories() })
watch([searchQuery, filterStatus], () => fetchProducts())

// ── Stats ──────────────────────────────────────────────────────────────────
const stats = computed(() => ({
  total:     products.value.length,
  published: products.value.filter(p => p.status === 'published').length,
  draft:     products.value.filter(p => p.status === 'draft').length,
  lowStock:  products.value.filter(p => p.stock <= 5).length,
}))

// ── Status helpers ─────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  published:    { label: 'Publié',    bg: '#dcfce7', text: '#16a34a' },
  draft:        { label: 'Brouillon', bg: '#f3f4f6', text: '#6b7280' },
  archived:     { label: 'Archivé',   bg: '#fef3c7', text: '#d97706' },
  out_of_stock: { label: 'Rupture',   bg: '#fee2e2', text: '#dc2626' },
}

// ── Toggle status ──────────────────────────────────────────────────────────
const toggleStatus = async (product: Product) => {
  toggling.value = product.id
  try {
    const { data } = await axios.patch(
      `${API}/admin/products/${product.id}/toggle`,
      {},
      { headers: authHeaders.value }
    )
    const p = products.value.find(x => x.id === product.id)
    if (p) p.status = data.status
    toast.add({
      title:       data.status === 'published' ? 'Publié' : 'Masqué',
      description: product.name,
      color:       data.status === 'published' ? 'success' : 'neutral',
      icon:        data.status === 'published' ? 'i-heroicons-eye' : 'i-heroicons-eye-slash',
    } as ToastProps)
  } catch {
    toast.add({ title: 'Erreur', color: 'error', icon: 'i-heroicons-exclamation-circle' } as ToastProps)
  } finally {
    toggling.value = null
  }
}

// ── Confirm delete ─────────────────────────────────────────────────────────
const showConfirm  = ref(false)
const prodToDelete = ref<Product | null>(null)
const askDelete    = (p: Product) => { prodToDelete.value = p; showConfirm.value = true }

const confirmDelete = async () => {
  const p = prodToDelete.value
  if (!p) return
  deleting.value = p.id
  showConfirm.value = false
  try {
    await axios.delete(`${API}/admin/products/${p.id}`, { headers: authHeaders.value })
    products.value = products.value.filter(x => x.id !== p.id)
    toast.add({ title: 'Produit supprimé', description: p.name, color: 'neutral', icon: 'i-heroicons-trash' } as ToastProps)
  } catch (err: any) {
    toast.add({ title: 'Erreur', description: err.response?.data?.message ?? 'Erreur.', color: 'error', icon: 'i-heroicons-exclamation-circle' } as ToastProps)
  } finally {
    deleting.value = null
    prodToDelete.value = null
  }
}

// ── Form ───────────────────────────────────────────────────────────────────
const isEditing = ref(false)
const dragOver  = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Images : deux listes séparées
// • pendingFiles  → fichiers locaux pas encore uploadés (preview base64 temporaire)
// • previewImages → URLs Cloudinary définitives déjà uploadées
interface PendingFile { file: File; preview: string }

const previewImages = ref<string[]>([])
const pendingFiles  = ref<PendingFile[]>([])

// Vue unifiée pour la grille
const allImages = computed(() => [
  ...pendingFiles.value.map(p => ({ src: p.preview, isPending: true  })),
  ...previewImages.value.map(src => ({ src, isPending: false })),
])

const emptyForm = () => ({
  id:            0,
  name:          '',
  slug:          '',
  description:   '',
  brand:         '',
  sku:           '',
  price:         '' as string | number,
  old_price:     '' as string | number,
  stock:         '' as string | number,
  category_id:   null as number | null,
  status:        'published' as string,
  is_featured:   false,
  is_best_seller:false,
  is_new:        true,
  specs:         [{ key: '', value: '' }] as { key: string; value: string }[],
})

const form = ref(emptyForm())

const toSlug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

watch(() => form.value.name, val => { if (!isEditing.value) form.value.slug = toSlug(val) })

const discountPercent = computed(() => {
  const p  = Number(form.value.price)
  const op = Number(form.value.old_price)
  return p > 0 && op > p ? Math.round(((op - p) / op) * 100) : 0
})

const openAdd = () => {
  form.value = emptyForm(); previewImages.value = []; pendingFiles.value = []
  isEditing.value = false; view.value = 'form'
}

const openEdit = (p: Product) => {
  form.value = {
    id: p.id, name: p.name, slug: p.slug, description: p.description ?? '',
    brand: p.brand ?? '', sku: p.sku ?? '', price: p.price, old_price: p.old_price ?? '',
    stock: p.stock, category_id: p.category_id, status: p.status,
    is_featured: p.is_featured, is_best_seller: p.is_best_seller, is_new: p.is_new,
    specs: p.specs?.length ? p.specs : [{ key: '', value: '' }],
  }
  previewImages.value = p.images ?? []
  pendingFiles.value  = []
  isEditing.value = true
  view.value = 'form'
}

const addSpec    = () => form.value.specs.push({ key: '', value: '' })
const removeSpec = (i: number) => form.value.specs.splice(i, 1)

// ── Ajout de fichiers ─────────────────────────────────────────────────────
const addFilesToPending = (files: File[]) => {
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = ev => pendingFiles.value.push({ file, preview: ev.target?.result as string })
    reader.readAsDataURL(file)
  })
}

const handleFileChange = (e: Event) => {
  addFilesToPending(Array.from((e.target as HTMLInputElement).files ?? []))
  ;(e.target as HTMLInputElement).value = ''
}

const handleDrop = (e: DragEvent) => {
  dragOver.value = false
  addFilesToPending(Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/')))
}

// ── Supprimer une image ───────────────────────────────────────────────────
const removeImage = (idx: number) => {
  if (idx < pendingFiles.value.length) pendingFiles.value.splice(idx, 1)
  else previewImages.value.splice(idx - pendingFiles.value.length, 1)
}

// ── Définir comme principale ──────────────────────────────────────────────
const setMainImage = (idx: number) => {
  const all = [
    ...pendingFiles.value.map((d, i) => ({ type: 'pending' as const, data: d })),
    ...previewImages.value.map((src) => ({ type: 'uploaded' as const, data: src })),
  ]
  const [item] = all.splice(idx, 1)
  all.unshift(item)
  pendingFiles.value  = all.filter(x => x.type === 'pending').map(x => x.data as PendingFile)
  previewImages.value = all.filter(x => x.type === 'uploaded').map(x => x.data as string)
}

// ── Sauvegarder (upload Cloudinary + POST/PUT Laravel) ────────────────────
const saveProduct = async (asDraft = false) => {
  if (!form.value.name || !form.value.category_id || !form.value.price) {
    toast.add({ title: 'Champs requis', description: 'Nom, catégorie et prix sont obligatoires.', color: 'error', icon: 'i-heroicons-exclamation-triangle' } as ToastProps)
    return
  }

  // Étape 1 — Upload les fichiers en attente vers Cloudinary
  if (pendingFiles.value.length > 0) {
    uploading.value = true
    try {
      toast.add({ title: `Upload de ${pendingFiles.value.length} image(s)...`, color: 'neutral', icon: 'i-heroicons-arrow-up-tray' } as ToastProps)
      const urls = await uploadImages(pendingFiles.value.map(p => p.file))
      previewImages.value.push(...urls)
      pendingFiles.value = []
      toast.add({ title: 'Images uploadées ✓', color: 'success', icon: 'i-heroicons-check-circle' } as ToastProps)
    } catch {
      toast.add({ title: 'Erreur upload', description: 'Impossible d\'uploader vers Cloudinary.', color: 'error', icon: 'i-heroicons-exclamation-triangle' } as ToastProps)
      uploading.value = false
      return
    } finally {
      uploading.value = false
    }
  }

  // Étape 2 — Envoyer au backend Laravel (URLs Cloudinary uniquement)
  saving.value = true
  const payload = {
    name:          form.value.name,
    slug:          form.value.slug,
    description:   form.value.description || null,
    brand:         form.value.brand || null,
    sku:           form.value.sku || null,
    price:         Number(form.value.price),
    old_price:     form.value.old_price ? Number(form.value.old_price) : null,
    stock:         Number(form.value.stock) || 0,
    category_id:   form.value.category_id,
    status:        asDraft ? 'draft' : form.value.status,
    is_featured:   form.value.is_featured,
    is_best_seller:form.value.is_best_seller,
    is_new:        form.value.is_new,
    images:        previewImages.value,   // ← URLs Cloudinary, légères en DB
    specs:         form.value.specs.filter(s => s.key && s.value),
  }

  try {
    if (isEditing.value) {
      const { data } = await axios.put(`${API}/admin/products/${form.value.id}`, payload, { headers: authHeaders.value })
      const idx = products.value.findIndex(p => p.id === form.value.id)
      if (idx !== -1) products.value[idx] = data
      toast.add({ title: 'Produit mis à jour', description: data.name, color: 'success', icon: 'i-heroicons-check-circle' } as ToastProps)
    } else {
      const { data } = await axios.post(`${API}/admin/products`, payload, { headers: authHeaders.value })
      products.value.unshift(data)
      toast.add({ title: asDraft ? 'Brouillon sauvegardé' : 'Produit publié !', description: data.name, color: 'success', icon: 'i-heroicons-check-circle' } as ToastProps)
    }
    view.value = 'list'
  } catch (err: any) {
    const errors = err.response?.data?.errors
    const msg = errors ? Object.values(errors).flat().join(' ') : err.response?.data?.message ?? 'Une erreur est survenue.'
    toast.add({ title: 'Erreur', description: msg, color: 'error', icon: 'i-heroicons-exclamation-triangle' } as ToastProps)
  } finally {
    saving.value = false
  }
}

// ── Flat categories ────────────────────────────────────────────────────────
const flatCategories = computed(() => {
  const result: { id: number; label: string }[] = []
  for (const cat of categories.value) {
    result.push({ id: cat.id, label: cat.name })
    for (const sub of cat.children ?? []) result.push({ id: sub.id, label: `↳ ${sub.name}` })
  }
  return result
})

const statuses = [
  { value: 'published',    label: 'Publié' },
  { value: 'draft',        label: 'Brouillon' },
  { value: 'archived',     label: 'Archivé' },
  { value: 'out_of_stock', label: 'Rupture' },
]

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 bg-white focus:outline-none focus:border-[#274a82] focus:ring-2 focus:ring-[#274a82]/10 transition-all'

// ── Colonnes UTable ────────────────────────────────────────────────────────
const columns: TableColumn<Product>[] = [
  {
    id: 'name', header: 'Produit',
    cell: ({ row }) => {
      const p = row.original
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', { class: 'w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden' }, [
          p.images?.[0]
            ? h('img', { src: p.images[0], class: 'w-full h-full object-cover' })
            : h(UIcon, { name: 'i-heroicons-cube', class: 'w-5 h-5 text-gray-300' }),
        ]),
        h('div', { class: 'min-w-0' }, [
          h('p', { class: 'font-bold text-gray-800 text-sm truncate max-w-[180px]' }, p.name),
          h('p', { class: 'text-[11px] text-gray-400 font-mono' }, p.sku ? `SKU: ${p.sku}` : (p.brand ?? '')),
        ]),
      ])
    },
  },
  {
    id: 'category', header: 'Catégorie',
    cell: ({ row }) => {
      const cat = row.original.category
      return cat
        ? h('span', { class: 'text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full' }, cat.name)
        : h('span', { class: 'text-xs text-gray-300 italic' }, '—')
    },
  },
  {
    id: 'description', header: 'Description',
    cell: ({ row }) => {
      const desc = row.original.description
      if (!desc) return h('span', { class: 'text-xs text-gray-300 italic' }, '—')
      return h('p', {
        class: 'text-xs text-gray-500 max-w-[220px] leading-relaxed',
        style: { display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' },
        title: desc,
      }, desc)
    },
  },
  {
    id: 'price', header: 'Prix',
    cell: ({ row }) => {
      const p = row.original
      return h('div', {}, [
        h('p', { class: 'font-black text-[#274a82] text-sm' }, formatPrice(p.price)),
        p.old_price ? h('p', { class: 'text-[11px] text-gray-400 line-through' }, formatPrice(p.old_price)) : null,
        p.discount_percent && p.discount_percent > 0
          ? h('span', { class: 'text-[10px] font-black text-white bg-[#e60012] px-1.5 py-0.5 rounded-full' }, `-${p.discount_percent}%`)
          : null,
      ])
    },
  },
  {
    id: 'stock', header: 'Stock',
    cell: ({ row }) => {
      const s = row.original.stock
      return h('span', {
        style: { fontWeight: '700', fontSize: '13px', color: s === 0 ? '#dc2626' : s <= 5 ? '#d97706' : '#16a34a' },
      }, String(s))
    },
  },
  {
    id: 'status', header: 'Statut',
    cell: ({ row }) => {
      const p = row.original; const cfg = statusConfig[p.status] ?? statusConfig.draft
      return h('div', { class: 'flex items-center gap-2' }, [
        h('button', { onClick: () => toggleStatus(p), disabled: toggling.value === p.id, class: 'flex items-center gap-1.5 cursor-pointer' }, [
          h('span', { class: 'relative flex-shrink-0 rounded-full transition-colors duration-200',
            style: { width: '36px', height: '20px', backgroundColor: p.status === 'published' ? '#22c55e' : '#d1d5db' } }, [
            h('span', { class: 'absolute bg-white rounded-full shadow-sm transition-transform duration-200',
              style: { top: '2px', left: '0', width: '16px', height: '16px', transform: p.status === 'published' ? 'translateX(18px)' : 'translateX(2px)' } }),
          ]),
          h('span', { class: 'text-[11px] font-black px-2 py-0.5 rounded-full', style: { backgroundColor: cfg.bg, color: cfg.text } }, cfg.label),
        ]),
      ])
    },
  },
  {
    id: 'actions', header: '',
    cell: ({ row }) => {
      const p = row.original
      return h('div', { class: 'flex items-center justify-end gap-1' }, [
        h('button', { onClick: () => openEdit(p), class: 'w-7 h-7 rounded-lg bg-[#274a82]/10 hover:bg-[#274a82] text-[#274a82] hover:text-white flex items-center justify-center transition-all' },
          [h(UIcon, { name: 'i-heroicons-pencil-square', class: 'w-3.5 h-3.5' })]),
        h('button', { onClick: () => askDelete(p), disabled: deleting.value === p.id, class: 'w-7 h-7 rounded-lg bg-red-50 hover:bg-[#e60012] text-red-400 hover:text-white flex items-center justify-center transition-all' },
          [h(UIcon, { name: deleting.value === p.id ? 'i-heroicons-arrow-path' : 'i-heroicons-trash', class: `w-3.5 h-3.5 ${deleting.value === p.id ? 'animate-spin' : ''}` })]),
      ])
    },
  },
]
</script>

<template>
  <div>

    <!-- ══ VUE LISTE ═══════════════════════════════════════════════════════ -->
    <div v-if="view === 'list'" class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-gray-900">Produits</h1>
          <p class="text-sm text-gray-400 mt-0.5">{{ stats.total }} produit(s) au total</p>
        </div>
        <UButton color="error" icon="i-heroicons-plus" @click="openAdd">Ajouter un produit</UButton>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
          <p class="text-xs font-bold text-gray-400 tracking-wider">Total</p>
          <p class="text-2xl font-black text-gray-900 mt-1">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
          <p class="text-xs font-bold text-gray-400 tracking-wider">Publiés</p>
          <p class="text-2xl font-black text-green-600 mt-1">{{ stats.published }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
          <p class="text-xs font-bold text-gray-400 tracking-wider">Brouillons</p>
          <p class="text-2xl font-black text-gray-400 mt-1">{{ stats.draft }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
          <p class="text-xs font-bold text-gray-400 tracking-wider">Stock faible</p>
          <p class="text-2xl font-black text-[#e60012] mt-1">{{ stats.lowStock }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="Rechercher un produit..." class="w-64" />
        <select v-model="filterStatus" class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#274a82] transition-all">
          <option value="">Tous les statuts</option>
          <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <UTable :loading="loading" loading-color="primary" loading-animation="carousel"
          :data="products" :columns="columns"
          :ui="{
            thead: 'bg-gray-50/60',
            th: { base: 'text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3.5 text-left border-b border-gray-100' },
            td: { base: 'px-5 py-3.5 border-b border-gray-50' },
            tr: { base: 'transition-colors hover:bg-gray-50/40' },
          }">
          <template #empty>
            <div class="flex flex-col items-center justify-center py-16 gap-3">
              <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <UIcon name="i-heroicons-cube" class="w-7 h-7 text-gray-300" />
              </div>
              <p class="text-gray-400 text-sm font-medium">Aucun produit trouvé</p>
              <button v-if="searchQuery || filterStatus" @click="searchQuery = ''; filterStatus = ''" class="text-xs text-[#274a82] hover:underline font-bold">Effacer les filtres</button>
            </div>
          </template>
        </UTable>
      </div>
    </div>

    <!-- ══ VUE FORMULAIRE ══════════════════════════════════════════════════ -->
    <div v-else>

      <!-- Header sticky -->
      <div class="bg-white border-b border-gray-100 sticky top-16 z-20 px-6 mb-6 shadow-sm">
        <div class="h-16 flex items-center justify-between gap-4">

          <!-- Gauche : retour + titre -->
          <div class="flex items-center gap-4 min-w-0">
            <button
              @click="view = 'list'"
              class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition flex-shrink-0"
            >
              <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 text-gray-600" />
            </button>

            <!-- Séparateur vertical coloré -->
            <div class="w-1 h-9 rounded-full flex-shrink-0" :class="isEditing ? 'bg-[#274a82]' : 'bg-[#e60012]'"></div>

            <div class="min-w-0 ">
              <div class="flex items-center gap-2">
                <UIcon
                  :name="isEditing ? 'i-heroicons-pencil-square' : 'i-heroicons-plus-circle'"
                  class="w-4 h-4 flex-shrink-0"
                  :class="isEditing ? 'text-[#274a82]' : 'text-[#e60012]'"
                />
                <h1 class="text-base font-black text-gray-900 tracking-tight truncate">
                  {{ isEditing ? 'Modifier le produit' : 'Ajouter un produit' }}
                </h1>
              </div>
              <p class="text-[11px] text-gray-400 mt-0.5 ml-6">
                {{ isEditing ? `Modification de "${form.name}"` : 'Remplissez les informations ci-dessous' }}
              </p>
            </div>
          </div>

          <!-- Droite : actions -->
          <div class="flex items-center gap-6 flex-shrink-0">
            <button
              @click="view = 'list'"
              class="text-xs font-bold text-gray-500 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg transition"
            >
              Annuler
            </button>
            <button
              @click="saveProduct(false)"
              :disabled="saving"
              class="flex items-center gap-2 text-white text-xs font-black px-5 py-2 rounded-lg shadow transition disabled:opacity-50"
              :class="isEditing ? 'bg-[#274a82] hover:bg-[#1e3a6e]' : 'bg-[#e60012] hover:bg-[#c4000f]'"
            >
              <UIcon
                :name="saving ? 'i-heroicons-arrow-path' : 'i-heroicons-check'"
                class="w-3.5 h-3.5"
                :class="saving ? 'animate-spin' : ''"
              />
              {{ isEditing ? 'Sauvegarder' : 'Publier' }}
            </button>
          </div>

        </div>
      </div>
      <!-- Grille -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Col gauche -->
        <div class="lg:col-span-2 flex flex-col gap-5">

          <!-- Infos générales -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-[#274a82]/10 flex items-center justify-center">
                <UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5 text-[#274a82]" />
              </div>
              <h2 class="text-sm font-black text-gray-800">Informations générales</h2>
            </div>
            <div class="p-5 flex flex-col gap-4">
              <div>
                <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">Nom du produit <span class="text-[#e60012]">*</span></label>
                <input v-model="form.name" type="text" placeholder="Ex: Samsung Galaxy S24 Ultra 256Go" :class="inputCls" />
              </div>
              <div>
                <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">Slug</label>
                <input v-model="form.slug" type="text" placeholder="samsung-galaxy-s24" :class="inputCls" />
              </div>
              <div>
                <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea v-model="form.description" rows="4" placeholder="Décrivez le produit..."
                  class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 bg-white focus:outline-none focus:border-[#274a82] focus:ring-2 focus:ring-[#274a82]/10 transition-all resize-none"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">Marque</label>
                  <input v-model="form.brand" type="text" placeholder="Ex: Samsung, Apple..." :class="inputCls" />
                </div>
                <div>
                  <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">SKU / Référence</label>
                  <input v-model="form.sku" type="text" placeholder="Ex: SAM-S24U-256" :class="inputCls" />
                </div>
              </div>
            </div>
          </div>

          <!-- Prix & Stock -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-[#e60012]/10 flex items-center justify-center">
                <UIcon name="i-heroicons-currency-dollar" class="w-3.5 h-3.5 text-[#e60012]" />
              </div>
              <h2 class="text-sm font-black text-gray-800">Prix & Stock</h2>
            </div>
            <div class="p-5 flex flex-col gap-4">
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">Prix (FCFA) <span class="text-[#e60012]">*</span></label>
                  <input v-model="form.price" type="number" placeholder="185000" :class="inputCls" />
                </div>
                <div>
                  <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">Ancien prix</label>
                  <input v-model="form.old_price" type="number" placeholder="220000" :class="inputCls" />
                </div>
                <div>
                  <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">Stock <span class="text-[#e60012]">*</span></label>
                  <input v-model="form.stock" type="number" placeholder="0" :class="inputCls" />
                </div>
              </div>
              <div v-if="discountPercent > 0" class="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
                <UIcon name="i-heroicons-tag" class="w-4 h-4 text-green-600 flex-shrink-0" />
                <span class="text-xs font-black text-green-700">Remise calculée : <span class="text-[#e60012]">-{{ discountPercent }}%</span></span>
              </div>
            </div>
          </div>

          <!-- Spécifications -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-list-bullet" class="w-3.5 h-3.5 text-purple-600" />
                </div>
                <h2 class="text-sm font-black text-gray-800">Spécifications</h2>
              </div>
              <button @click="addSpec" class="text-[11px] font-black text-[#274a82] hover:text-[#e60012] transition flex items-center gap-1">
                <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5" />Ajouter
              </button>
            </div>
            <div class="p-5 flex flex-col gap-2.5">
              <div v-for="(spec, i) in form.specs" :key="i" class="flex gap-2 items-center">
                <input v-model="spec.key" type="text" placeholder="Clé (ex: RAM)" class="w-2/5 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] transition-all" />
                <input v-model="spec.value" type="text" placeholder="Valeur (ex: 8 Go)" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] transition-all" />
                <button @click="removeSpec(i)" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 hover:text-[#e60012] flex items-center justify-center text-gray-400 transition flex-shrink-0">
                  <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />
                </button>
              </div>
              <button v-if="form.specs.length === 0" @click="addSpec" class="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-xs font-semibold text-gray-400 hover:border-[#274a82] hover:text-[#274a82] transition flex items-center justify-center gap-2">
                <UIcon name="i-heroicons-plus-circle" class="w-4 h-4" />Ajouter une spécification
              </button>
            </div>
          </div>

        </div>

        <!-- Col droite -->
        <div class="flex flex-col gap-5">

          <!-- ══ Images ══════════════════════════════════════════════════════ -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="w-3.5 h-3.5 text-orange-500" />
                </div>
                <h2 class="text-sm font-black text-gray-800">Images</h2>
              </div>
              <span v-if="allImages.length > 0" class="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {{ allImages.length }} / 8
              </span>
            </div>
            <div class="p-5 flex flex-col gap-3">

              <!-- Barre upload en cours -->
              <div v-if="uploading" class="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <UIcon name="i-heroicons-arrow-up-tray" class="w-4 h-4 text-blue-500 animate-bounce flex-shrink-0" />
                <span class="text-xs font-black text-blue-700">Upload vers Cloudinary...</span>
              </div>

              <!-- Zone drag & drop -->
              <div
                @dragover.prevent="dragOver = true"
                @dragleave="dragOver = false"
                @drop.prevent="handleDrop"
                @click="fileInput?.click()"
                :class="['border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer',
                  dragOver ? 'border-[#274a82] bg-[#274a82]/5' : 'border-gray-200 hover:border-[#274a82] hover:bg-gray-50']"
              >
                <input ref="fileInput" type="file" multiple accept="image/*" class="hidden" @change="handleFileChange" />
                <div class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <UIcon name="i-heroicons-arrow-up-tray" class="w-4 h-4 text-gray-400" />
                </div>
                <p class="text-xs font-black text-gray-600 mb-0.5">Glissez vos images ici</p>
                <p class="text-[10px] text-gray-400">PNG, JPG, WEBP — max 5 Mo</p>
              </div>

              <!-- Grille images -->
              <div v-if="allImages.length > 0" class="grid grid-cols-3 gap-2">
                <div
                  v-for="(img, i) in allImages" :key="i"
                  class="relative group aspect-square rounded-lg overflow-hidden transition-all"
                  :class="i === 0 ? 'border-2 border-[#274a82] ring-2 ring-[#274a82]/20' : 'border border-gray-100 hover:border-gray-300'"
                >
                  <img :src="img.src" class="w-full h-full object-cover" />

                  <!-- Badge "en attente" -->
                  <div v-if="img.isPending" class="absolute bottom-1 left-1 right-1 bg-orange-500/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md text-center pointer-events-none">
                    En attente
                  </div>

                  <!-- Overlay hover -->
                  <div class="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1.5">
                    <button v-if="i !== 0" @click.stop="setMainImage(i)"
                      class="w-full flex items-center justify-center gap-1 bg-[#274a82] hover:bg-[#1e3a6e] text-white rounded-md py-1.5 text-[10px] font-black transition">
                      <UIcon name="i-heroicons-star" class="w-3 h-3" />Principale
                    </button>
                    <button @click.stop="removeImage(i)"
                      class="w-full flex items-center justify-center gap-1 bg-[#e60012] hover:bg-[#c4000f] text-white rounded-md py-1.5 text-[10px] font-black transition">
                      <UIcon name="i-heroicons-trash" class="w-3 h-3" />Supprimer
                    </button>
                  </div>

                  <!-- Badge principale -->
                  <div v-if="i === 0" class="absolute top-1 left-1 bg-[#274a82] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1 pointer-events-none">
                    <UIcon name="i-heroicons-star-solid" class="w-2.5 h-2.5" />Principale
                  </div>
                  <div v-else class="absolute top-1 right-1 bg-black/40 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">
                    {{ i + 1 }}
                  </div>
                </div>
              </div>

              <p v-if="allImages.length > 0" class="text-[10px] text-gray-400 text-center leading-relaxed">
                Survolez pour <span class="font-bold text-[#274a82]">définir en principale</span> ou <span class="font-bold text-[#e60012]">supprimer</span>
              </p>
            </div>
          </div>

          <!-- Catégorie -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                <UIcon name="i-heroicons-squares-2x2" class="w-3.5 h-3.5 text-teal-600" />
              </div>
              <h2 class="text-sm font-black text-gray-800">Catégorie <span class="text-[#e60012]">*</span></h2>
            </div>
            <div class="p-5">
              <select v-model="form.category_id" class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#274a82] focus:ring-2 focus:ring-[#274a82]/10 transition-all bg-white">
                <option :value="null" disabled>Sélectionner une catégorie</option>
                <option v-for="cat in flatCategories" :key="cat.id" :value="cat.id">{{ cat.label }}</option>
              </select>
            </div>
          </div>

          <!-- Statut & Visibilité -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-yellow-100 flex items-center justify-center">
                <UIcon name="i-heroicons-eye" class="w-3.5 h-3.5 text-yellow-600" />
              </div>
              <h2 class="text-sm font-black text-gray-800">Statut & Visibilité</h2>
            </div>
            <div class="p-5 flex flex-col gap-4">
              <div class="grid grid-cols-2 gap-2">
                <button v-for="s in statuses" :key="s.value" @click="form.status = s.value"
                  :class="['px-3 py-2 rounded-lg border text-xs font-black transition',
                    form.status === s.value ? 'border-[#274a82] bg-[#274a82] text-white' : 'border-gray-200 text-gray-500 hover:border-[#274a82] hover:text-[#274a82]']">
                  {{ s.label }}
                </button>
              </div>
              <div class="flex flex-col gap-3 pt-1">
                <label v-for="(toggle, key) in [
                  { model: 'is_featured',    label: 'En vedette',      sub: 'Page d\'accueil',   color: '#274a82' },
                  { model: 'is_best_seller', label: 'Meilleure vente', sub: 'Badge Best Seller', color: '#e60012' },
                  { model: 'is_new',         label: 'Nouveau',         sub: 'Badge Nouveau',     color: '#16a34a' },
                ]" :key="key" class="flex items-center justify-between cursor-pointer"
                  @click="(form as any)[toggle.model] = !(form as any)[toggle.model]">
                  <div>
                    <p class="text-xs font-black text-gray-700">{{ toggle.label }}</p>
                    <p class="text-[10px] text-gray-400">{{ toggle.sub }}</p>
                  </div>
                  <span class="relative flex-shrink-0 rounded-full"
                    :style="{ width: '40px', height: '22px', backgroundColor: (form as any)[toggle.model] ? toggle.color : '#d1d5db' }">
                    <span class="absolute bg-white rounded-full shadow-sm transition-transform"
                      :style="{ top: '3px', left: '0', width: '16px', height: '16px', transform: (form as any)[toggle.model] ? 'translateX(18px)' : 'translateX(3px)' }">
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <!-- Résumé -->
          <div class="bg-[#274a82] rounded-xl overflow-hidden shadow-md">
            <div class="px-5 py-4">
              <h2 class="text-sm font-black text-white mb-3">Résumé</h2>
              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-white/70">Nom</span>
                  <span class="text-xs text-white font-black truncate max-w-[140px]">{{ form.name || '—' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-white/70">Prix</span>
                  <span class="text-xs text-white font-black">{{ form.price ? `${Number(form.price).toLocaleString()} FCFA` : '—' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-white/70">Stock</span>
                  <span class="text-xs text-white font-black">{{ form.stock || '—' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-white/70">Images</span>
                  <span class="text-xs font-black" :class="pendingFiles.length > 0 ? 'text-orange-300' : 'text-white'">
                    {{ previewImages.length }} uploadée(s)<span v-if="pendingFiles.length > 0"> + {{ pendingFiles.length }} en attente</span>
                  </span>
                </div>
                <div v-if="discountPercent > 0" class="flex justify-between items-center">
                  <span class="text-xs text-white/70">Remise</span>
                  <span class="text-xs text-[#e60012] font-black bg-white/10 px-1.5 py-0.5 rounded-md">-{{ discountPercent }}%</span>
                </div>
              </div>
            </div>
            <div class="px-5 pb-5 flex flex-col gap-2">
              <button @click="saveProduct(false)" :disabled="saving || uploading"
                class="w-full flex items-center justify-center gap-1.5 bg-[#e60012] hover:bg-white hover:text-[#274a82] text-white font-black text-sm py-3 rounded-lg shadow-lg transition disabled:opacity-50">
                <UIcon :name="(saving || uploading) ? 'i-heroicons-arrow-path' : 'i-heroicons-check-circle'" class="w-4 h-4" :class="(saving || uploading) ? 'animate-spin' : ''" />
                {{ uploading ? 'Upload images...' : isEditing ? 'Sauvegarder' : 'Publier le produit' }}
              </button>
              <button @click="saveProduct(true)" :disabled="saving || uploading"
                class="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-[#c4000f] text-[#274a82] hover:text-white font-black text-sm py-3 rounded-lg shadow-lg transition disabled:opacity-50">
                Sauvegarder en brouillon
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- Modal confirm suppression -->
  <UModal v-model:open="showConfirm" :ui="{ width: 'sm:max-w-sm' }">
    <template #content>
      <div class="overflow-hidden rounded-2xl">
        <div class="px-6 py-5 bg-[#e60012] flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 class="text-base font-black text-white">Confirmer la suppression</h2>
            <p class="text-xs text-white/70 mt-0.5">Cette action est irréversible</p>
          </div>
        </div>
        <div class="px-6 py-5 bg-white space-y-3">
          <p class="text-sm text-gray-600">Voulez-vous vraiment supprimer le produit :</p>
          <div class="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
            <div class="w-8 h-8 rounded-lg bg-[#e60012]/10 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-cube" class="w-4 h-4 text-[#e60012]" />
            </div>
            <span class="font-black text-gray-800 text-sm">{{ prodToDelete?.name }}</span>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button @click="showConfirm = false" class="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition">Annuler</button>
          <button @click="confirmDelete" class="flex items-center gap-2 px-5 py-2 text-xs font-black text-white bg-[#e60012] hover:bg-[#c4000f] rounded-lg transition">
            <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />Supprimer
          </button>
        </div>
      </div>
    </template>
  </UModal>

</template>