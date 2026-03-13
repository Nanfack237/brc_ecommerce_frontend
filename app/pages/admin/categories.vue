<script setup lang="ts">
import { ref, computed, watch, h, resolveComponent } from 'vue'
import axios from 'axios'
import type { TableColumn } from '@nuxt/ui'
import type { ToastProps } from '@nuxt/ui'

const { requireAdmin, token } = useAuth()
requireAdmin()

useHead({ title: 'BRC Market — Admin Catégories' })

const toast  = useToast()
const config = useRuntimeConfig()
const API    = config.public.apiBase

const UIcon   = resolveComponent('UIcon')
const UButton = resolveComponent('UButton')

// ── Types ──────────────────────────────────────────────────────────────────
interface Subcategory {
  id:             number
  name:           string
  slug:           string
  description:    string
  products_count: number
  is_active:      boolean
  is_promoted:    boolean
  parent_id:      number
  sort_order:     number
}

interface Category {
  id:             number
  name:           string
  slug:           string
  description:    string
  products_count: number
  total_products: number
  is_active:      boolean
  is_promoted:    boolean
  sort_order:     number
  children:       Subcategory[]
}

type TableRow = {
  id:             number
  name:           string
  slug:           string
  description:    string
  products_count: number
  total_products?: number
  is_active:      boolean
  is_promoted:    boolean
  sort_order:     number
  _isSubcat:      boolean
  _parentId:      number | null
  _childCount:    number
}

// ── State ──────────────────────────────────────────────────────────────────
const categories  = ref<Category[]>([])
const loading     = ref(true)
const saving      = ref(false)
const searchQuery = ref('')
const expanded    = ref<Record<number, boolean>>({})
const toggling    = ref<number | null>(null)
const deleting    = ref<number | null>(null)

const authHeaders = computed(() => ({
  Authorization: `Bearer ${token.value}`,
}))

// ── Fetch ──────────────────────────────────────────────────────────────────
const fetchCategories = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API}/admin/categories`, { headers: authHeaders.value })
    categories.value = data
  } catch {
    toast.add({ title: 'Erreur de chargement', color: 'error', icon: 'i-heroicons-exclamation-circle' } as ToastProps)
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategories)

// ── Filtrage & stats ───────────────────────────────────────────────────────
const filtered = computed(() =>
  categories.value.filter(c =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    c.children?.some(s => s.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
)

const totalSubcats = computed(() =>
  categories.value.reduce((s, c) => s + (c.children?.length ?? 0), 0)
)

// ── Flatten rows for UTable ────────────────────────────────────────────────
const tableRows = computed<TableRow[]>(() => {
  const rows: TableRow[] = []
  for (const cat of filtered.value) {
    rows.push({
      id:             cat.id,
      name:           cat.name,
      slug:           cat.slug,
      description:    cat.description ?? '',
      products_count: cat.products_count,
      total_products: cat.total_products,
      is_active:      cat.is_active,
      is_promoted:    cat.is_promoted ?? false,
      sort_order:     cat.sort_order,
      _isSubcat:      false,
      _parentId:      null,
      _childCount:    cat.children?.length ?? 0,
    })
    if (expanded.value[cat.id]) {
      for (const sub of cat.children ?? []) {
        rows.push({
          id:             sub.id,
          name:           sub.name,
          slug:           sub.slug,
          description:    sub.description ?? '',
          products_count: sub.products_count,
          is_active:      sub.is_active,
          is_promoted:    sub.is_promoted ?? false,
          sort_order:     sub.sort_order,
          _isSubcat:      true,
          _parentId:      cat.id,
          _childCount:    0,
        })
      }
    }
  }
  return rows
})

// ── Slug ───────────────────────────────────────────────────────────────────
const toSlug = (name: string) =>
  name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

// ── Toggle visibilité ──────────────────────────────────────────────────────
const toggleVisibility = async (row: TableRow) => {
  toggling.value = row.id
  try {
    const { data } = await axios.patch(
      `${API}/admin/categories/${row.id}/toggle`,
      {},
      { headers: authHeaders.value }
    )
    // Mise à jour réactive dans categories
    if (row._isSubcat) {
      const parent = categories.value.find(c => c.id === row._parentId)
      const sub    = parent?.children.find(s => s.id === row.id)
      if (sub) sub.is_active = data.is_active
    } else {
      const cat = categories.value.find(c => c.id === row.id)
      if (cat) cat.is_active = data.is_active
    }
    toast.add({
      title:       data.is_active ? 'Activée' : 'Désactivée',
      description: `"${row.name}" est maintenant ${data.is_active ? 'visible' : 'masquée'}.`,
      color:       data.is_active ? 'success' : 'neutral',
      icon:        data.is_active ? 'i-heroicons-eye' : 'i-heroicons-eye-slash',
    } as ToastProps)
  } catch {
    toast.add({ title: 'Erreur', color: 'error', icon: 'i-heroicons-exclamation-circle' } as ToastProps)
  } finally {
    toggling.value = null
  }
}

// ── Delete — géré par askDelete / confirmDelete ci-dessous ─────────────────

// ── Modal ──────────────────────────────────────────────────────────────────
const showModal = ref(false)
const isEditing = ref(false)
const isSubcat  = ref(false)
const parentId  = ref<number | null>(null)

// ── Confirm delete ─────────────────────────────────────────────────────────
const showConfirm    = ref(false)
const rowToDelete    = ref<TableRow | null>(null)

const askDelete = (row: TableRow) => {
  if (!row._isSubcat) {
    const cat = categories.value.find(c => c.id === row.id)
    if ((cat?.children?.length ?? 0) > 0) {
      toast.add({ title: 'Suppression impossible', description: "Supprimez d'abord les sous-catégories.", color: 'error', icon: 'i-heroicons-exclamation-triangle' } as ToastProps)
      return
    }
  }
  rowToDelete.value = row
  showConfirm.value = true
}

const confirmDelete = async () => {
  const row = rowToDelete.value
  if (!row) return
  deleting.value = row.id
  showConfirm.value = false
  try {
    await axios.delete(`${API}/admin/categories/${row.id}`, { headers: authHeaders.value })
    if (row._isSubcat) {
      const parent = categories.value.find(c => c.id === row._parentId)
      if (parent) parent.children = parent.children.filter(s => s.id !== row.id)
    } else {
      categories.value = categories.value.filter(c => c.id !== row.id)
    }
    toast.add({ title: row._isSubcat ? 'Sous-catégorie supprimée' : 'Catégorie supprimée', color: 'neutral', icon: 'i-heroicons-trash' } as ToastProps)
  } catch (err: any) {
    toast.add({ title: 'Erreur', description: err.response?.data?.message ?? 'Erreur lors de la suppression.', color: 'error', icon: 'i-heroicons-exclamation-circle' } as ToastProps)
  } finally {
    deleting.value = null
    rowToDelete.value = null
  }
}

const emptyForm = () => ({
  id:          0,
  name:        '',
  slug:        '',
  description: '',
  is_active:   false,
  is_promoted: false,
  sort_order:  0,
})

const form = ref(emptyForm())

watch(() => form.value.name, (val) => {
  if (!isEditing.value) form.value.slug = toSlug(val)
})

const openAddCategory = () => {
  isEditing.value = false; isSubcat.value = false; parentId.value = null
  form.value = emptyForm(); showModal.value = true
}

const openAddSubcategory = (catId: number) => {
  isEditing.value = false; isSubcat.value = true; parentId.value = catId
  expanded.value[catId] = true
  form.value = emptyForm(); showModal.value = true
}

const openEdit = (row: TableRow) => {
  isEditing.value = true
  isSubcat.value  = row._isSubcat
  parentId.value  = row._parentId
  form.value = {
    id:          row.id,
    name:        row.name,
    slug:        row.slug,
    description: row.description ?? '',
    is_active:   row.is_active,
    is_promoted: row.is_promoted ?? false,
    sort_order:  row.sort_order,
  }
  showModal.value = true
}

// ── Save ───────────────────────────────────────────────────────────────────
const saveItem = async () => {
  if (!form.value.name.trim()) {
    toast.add({ title: 'Erreur', description: 'Le nom est obligatoire.', color: 'error', icon: 'i-heroicons-exclamation-triangle' } as ToastProps)
    return
  }
  saving.value = true
  const payload: Record<string, any> = {
    name:        form.value.name,
    slug:        form.value.slug,
    description: form.value.description || null,
    is_active:   form.value.is_active,
    is_promoted: form.value.is_promoted,
    sort_order:  form.value.sort_order,
  }
  if (isSubcat.value && !isEditing.value) payload.parent_id = parentId.value

  try {
    if (isEditing.value) {
      const { data } = await axios.put(`${API}/admin/categories/${form.value.id}`, payload, { headers: authHeaders.value })
      if (isSubcat.value) {
        const parent = categories.value.find(c => c.id === parentId.value)
        if (parent) {
          const idx = parent.children.findIndex(s => s.id === form.value.id)
          if (idx !== -1) parent.children[idx] = data
        }
      } else {
        const idx = categories.value.findIndex(c => c.id === form.value.id)
        if (idx !== -1) categories.value[idx] = { ...categories.value[idx], ...data }
      }
      toast.add({ title: isSubcat.value ? 'Sous-catégorie mise à jour' : 'Catégorie mise à jour', description: data.name, color: 'success', icon: 'i-heroicons-check-circle' } as ToastProps)
    } else {
      const { data } = await axios.post(`${API}/admin/categories`, payload, { headers: authHeaders.value })
      if (isSubcat.value) {
        const parent = categories.value.find(c => c.id === parentId.value)
        if (parent) parent.children.push(data)
        toast.add({ title: 'Sous-catégorie ajoutée', description: `${data.name} → ${parent?.name}`, color: 'success', icon: 'i-heroicons-check-circle' } as ToastProps)
      } else {
        categories.value.push({ ...data, children: [] })
        toast.add({ title: 'Catégorie ajoutée', description: data.name, color: 'success', icon: 'i-heroicons-check-circle' } as ToastProps)
      }
    }
    showModal.value = false
  } catch (err: any) {
    const errors = err.response?.data?.errors
    const msg    = errors ? Object.values(errors).flat().join(' ') : err.response?.data?.message ?? 'Une erreur est survenue.'
    toast.add({ title: 'Erreur', description: msg, color: 'error', icon: 'i-heroicons-exclamation-triangle' } as ToastProps)
  } finally {
    saving.value = false
  }
}

// ── Modal helpers ──────────────────────────────────────────────────────────
const modalTitle = computed(() => {
  if (isEditing.value) return isSubcat.value ? 'Modifier la sous-catégorie' : 'Modifier la catégorie'
  return isSubcat.value ? 'Nouvelle sous-catégorie' : 'Nouvelle catégorie'
})

const parentName = computed(() =>
  parentId.value ? categories.value.find(c => c.id === parentId.value)?.name ?? '' : ''
)

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 bg-white focus:outline-none focus:border-[#274a82] focus:ring-2 focus:ring-[#274a82]/10 transition-all'

// ── Colonnes UTable (Nuxt UI v3 — TanStack, cell via h()) ─────────────────
const columns: TableColumn<TableRow>[] = [
  {
    id:     'name',
    header: 'Catégorie',
    cell:   ({ row }) => {
      const r = row.original
      return h('div', { class: `flex items-center gap-2.5 ${r._isSubcat ? 'pl-10' : ''}` }, [
        // chevron expand (cat seulement)
        !r._isSubcat
          ? h('button', {
              onClick: () => { expanded.value[r.id] = !expanded.value[r.id] },
              class:   'w-5 h-5 flex items-center justify-center text-gray-400 hover:text-[#274a82] transition-colors flex-shrink-0',
            }, [
              h(UIcon, {
                name:  'i-heroicons-chevron-right',
                class: `w-3.5 h-3.5 transition-transform duration-200 ${expanded.value[r.id] ? 'rotate-90' : ''}`,
              }),
            ])
          : h('div', { class: 'flex flex-col w-4 flex-shrink-0 -ml-6' }, [
              h('span', { class: 'w-px h-3 bg-gray-200 mx-auto block' }),
              h('span', { class: 'w-3 h-px bg-gray-200 block' }),
            ]),
        // icône
        h('div', {
          class: r._isSubcat
            ? 'w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0'
            : 'w-8 h-8 rounded-lg bg-[#274a82]/10 flex items-center justify-center flex-shrink-0',
        }, [
          h(UIcon, {
            name:  r._isSubcat ? 'i-heroicons-tag' : 'i-heroicons-folder',
            class: r._isSubcat ? 'w-3.5 h-3.5 text-gray-400' : 'w-4 h-4 text-[#274a82]',
          }),
        ]),
        // texte
        h('div', { class: 'min-w-0' }, [
          h('p', { class: `font-bold truncate ${r._isSubcat ? 'text-sm text-gray-600' : 'text-gray-800'}` }, r.name),
          !r._isSubcat
            ? h('p', { class: 'text-[10px] text-gray-400' }, `${r._childCount} sous-cat.`)
            : null,
        ]),
      ])
    },
  },
  {
    id:     'slug',
    header: 'Slug',
    cell:   ({ row }) =>
      h('span', { class: 'font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 truncate block max-w-[150px]' }, row.original.slug),
  },
  {
    id:     'description',
    header: 'Description',
    cell:   ({ row }) => {
      const desc = row.original.description
      return desc
        ? h('p', { class: 'text-xs text-gray-500 truncate max-w-[180px]', title: desc }, desc)
        : h('span', { class: 'text-xs text-gray-300 italic' }, '—')
    },
  },
  {
    id:     'products_count',
    header: 'Produits',
    cell:   ({ row }) => {
      const r     = row.original
      const count = r._isSubcat ? r.products_count : (r.total_products ?? r.products_count)
      return h('span', {
        class: r._isSubcat
          ? 'bg-gray-100 text-gray-500 text-xs font-black px-2.5 py-1 rounded-full'
          : 'bg-[#274a82]/10 text-[#274a82] text-xs font-black px-2.5 py-1 rounded-full',
      }, String(count))
    },
  },
  {
    id:     'is_active',
    header: 'Visibilité',
    cell:   ({ row }) => {
      const r = row.original
      return h('button', {
        onClick:  () => toggleVisibility(r),
        disabled: toggling.value === r.id,
        class:    'flex items-center gap-2 cursor-pointer',
      }, [
        // Track — couleur via style inline pour éviter les purges Tailwind
        h('span', {
          class: 'relative flex-shrink-0 rounded-full transition-colors duration-200',
          style: {
            width:           '40px',
            height:          '22px',
            backgroundColor: r.is_active ? '#22c55e' : '#d1d5db',
          },
        }, [
          // Thumb — position via style inline
          h('span', {
            class: 'absolute bg-white rounded-full shadow-sm transition-transform duration-200',
            style: {
              top:       '3px',
              left:      '0px',
              width:     '16px',
              height:    '16px',
              transform: r.is_active ? 'translateX(18px)' : 'translateX(3px)',
            },
          }),
        ]),
        h('span', {
          style: { color: r.is_active ? '#16a34a' : '#9ca3af', fontSize: '12px', fontWeight: '600' },
        }, r.is_active ? 'Visible' : 'Masquée'),
      ])
    },
  },
  {
    id:     'actions',
    header: '',
    cell:   ({ row }) => {
      const r = row.original
      const btns = []

      // Bouton + sous-cat (cat seulement)
      if (!r._isSubcat) {
        btns.push(h('button', {
          title:   'Ajouter une sous-catégorie',
          onClick: () => openAddSubcategory(r.id),
          class:   'w-7 h-7 rounded-lg bg-green-50 hover:bg-green-500 text-green-500 hover:text-white flex items-center justify-center transition-all',
        }, [h(UIcon, { name: 'i-heroicons-plus', class: 'w-3.5 h-3.5' })]))
      }

      // Éditer
      btns.push(h('button', {
        onClick: () => openEdit(r),
        class:   'w-7 h-7 rounded-lg bg-[#274a82]/10 hover:bg-[#274a82] text-[#274a82] hover:text-white flex items-center justify-center transition-all',
      }, [h(UIcon, { name: 'i-heroicons-pencil-square', class: 'w-3.5 h-3.5' })]))

      // Supprimer
      btns.push(h('button', {
        onClick:  () => askDelete(r),
        disabled: deleting.value === r.id,
        class:    'w-7 h-7 rounded-lg bg-red-50 hover:bg-[#e60012] text-red-400 hover:text-white flex items-center justify-center transition-all',
      }, [h(UIcon, {
        name:  deleting.value === r.id ? 'i-heroicons-arrow-path' : 'i-heroicons-trash',
        class: `w-3.5 h-3.5 ${deleting.value === r.id ? 'animate-spin' : ''}`,
      })]))

      return h('div', { class: 'flex items-center justify-end gap-1' }, btns)
    },
  },
]
</script>

<template>
  <div class="space-y-6">

    <!-- En-tête ──────────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-gray-900">Catégories</h1>
        <p class="text-sm text-gray-400 mt-0.5">
          {{ categories.length }} catégorie(s) — {{ totalSubcats }} sous-catégorie(s)
        </p>
      </div>
      <UButton color="error" icon="i-heroicons-plus" @click="openAddCategory">
        Ajouter une catégorie
      </UButton>
    </div>

    <!-- Recherche ────────────────────────────────────────────────────────── -->
    <UInput
      v-model="searchQuery"
      icon="i-heroicons-magnifying-glass"
      placeholder="Rechercher une catégorie..."
      class="max-w-xs"
    />

    <!-- UTable ───────────────────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <UTable
        :loading="loading"
        :loading-color="'primary'"
        :loading-animation="'carousel'"
        :data="tableRows"
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
              <UIcon name="i-heroicons-folder" class="w-7 h-7 text-gray-300" />
            </div>
            <p class="text-gray-400 text-sm font-medium">Aucune catégorie trouvée</p>
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="text-xs text-[#274a82] hover:underline font-bold"
            >
              Effacer la recherche
            </button>
          </div>
        </template>
      </UTable>

      <!-- Boutons "Ajouter sous-cat" sous chaque cat dépliée -->
      <template v-for="cat in filtered" :key="`add-sub-${cat.id}`">
        <div
          v-if="expanded[cat.id]"
          class="border-b border-dashed border-gray-100 bg-gray-50/20 px-5 py-2"
        >
          <button
            @click="openAddSubcategory(cat.id)"
            class="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[#274a82] transition-colors ml-[72px]"
          >
            <UIcon name="i-heroicons-plus-circle" class="w-3.5 h-3.5" />
            Ajouter une sous-catégorie à "{{ cat.name }}"
          </button>
        </div>
      </template>

    </div>

  </div>

  <!-- ════════════════════════════════════════════════════════════
       MODAL — Ajout / Modification
  ════════════════════════════════════════════════════════════ -->
  <UModal v-model:open="showModal" :ui="{ width: 'sm:max-w-lg' }">
    <template #content>
      <div class="overflow-hidden rounded-2xl">

        <!-- Header coloré -->
        <div
          class="px-6 py-5 flex items-center gap-4"
          :class="isSubcat ? 'bg-[#274a82]' : 'bg-[#e60012]'"
        >
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <UIcon
              :name="isSubcat ? 'i-heroicons-tag' : 'i-heroicons-folder-plus'"
              class="w-5 h-5 text-white"
            />
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-base font-black text-white leading-tight">{{ modalTitle }}</h2>
            <p v-if="isSubcat && parentName" class="text-xs text-white/70 mt-0.5">
              Sous-catégorie de <span class="font-bold text-white">{{ parentName }}</span>
            </p>
            <p v-else-if="!isSubcat && !isEditing" class="text-xs text-white/70 mt-0.5">
              Catégorie principale de la boutique
            </p>
          </div>
          <button
            @click="showModal = false"
            class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors flex-shrink-0"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <!-- Formulaire -->
        <div class="px-6 py-5 space-y-4 bg-white">

          <!-- Nom -->
          <div>
            <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Nom <span class="text-[#e60012]">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              :placeholder="isSubcat ? 'Ex : Laptops Gaming' : 'Ex : Ordinateurs'"
              :class="inputCls"
              autofocus
            />
          </div>

          <!-- Slug -->
          <div>
            <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Slug
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs font-mono select-none">/</span>
              <input
                v-model="form.slug"
                type="text"
                placeholder="ex-ordinateurs"
                class="w-full border border-gray-200 rounded-lg pl-6 pr-3 py-2.5 text-sm font-mono text-gray-700 placeholder-gray-300 bg-white focus:outline-none focus:border-[#274a82] focus:ring-2 focus:ring-[#274a82]/10 transition-all"
              />
            </div>
            <p class="text-[10px] text-gray-400 mt-1">Généré automatiquement · modifiable manuellement</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Décrivez brièvement cette catégorie..."
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 bg-white focus:outline-none focus:border-[#274a82] focus:ring-2 focus:ring-[#274a82]/10 transition-all resize-none"
            ></textarea>
          </div>

          <!-- Toggles — Visibilité + Promotion -->
          <div class="grid grid-cols-2 gap-3 pt-1">

            <!-- Visibilité -->
            <button
              type="button"
              @click="form.is_active = !form.is_active"
              class="flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 transition-all text-left"
              :class="form.is_active ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  :class="form.is_active ? 'bg-green-100' : 'bg-gray-100'"
                >
                  <UIcon
                    :name="form.is_active ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'"
                    class="w-3.5 h-3.5 transition-colors"
                    :class="form.is_active ? 'text-green-600' : 'text-gray-400'"
                  />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-black leading-tight" :class="form.is_active ? 'text-green-700' : 'text-gray-500'">
                    {{ form.is_active ? 'Visible' : 'Masquée' }}
                  </p>
                  <p class="text-[9px] text-gray-400 mt-0.5">
                    {{ form.is_active ? 'Publique' : 'Privée' }}
                  </p>
                </div>
              </div>
              <span
                class="relative w-9 h-5 rounded-full flex-shrink-0 transition-colors duration-200"
                :class="form.is_active ? 'bg-green-500' : 'bg-gray-300'"
              >
                <span
                  class="absolute top-[3px] w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-200"
                  :class="form.is_active ? 'translate-x-[18px]' : 'translate-x-[3px]'"
                ></span>
              </span>
            </button>

            <!-- En promotion -->
            <button
              type="button"
              @click="form.is_promoted = !form.is_promoted"
              class="flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 transition-all text-left"
              :class="form.is_promoted ? 'border-[#e60012] bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  :class="form.is_promoted ? 'bg-red-100' : 'bg-gray-100'"
                >
                  <UIcon
                    name="i-heroicons-fire"
                    class="w-3.5 h-3.5 transition-colors"
                    :class="form.is_promoted ? 'text-[#e60012]' : 'text-gray-400'"
                  />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-black leading-tight" :class="form.is_promoted ? 'text-[#e60012]' : 'text-gray-500'">
                    {{ form.is_promoted ? 'Promo' : 'Normal' }}
                  </p>
                  <p class="text-[9px] text-gray-400 mt-0.5">
                    {{ form.is_promoted ? 'Badge promo' : 'Aucun badge' }}
                  </p>
                </div>
              </div>
              <span
                class="relative w-9 h-5 rounded-full flex-shrink-0 transition-colors duration-200"
                :class="form.is_promoted ? 'bg-[#e60012]' : 'bg-gray-300'"
              >
                <span
                  class="absolute top-[3px] w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-200"
                  :class="form.is_promoted ? 'translate-x-[18px]' : 'translate-x-[3px]'"
                ></span>
              </span>
            </button>

          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <p v-if="form.slug" class="text-[11px] text-gray-400 font-mono truncate">
            /categories/<span class="font-bold" :class="isSubcat ? 'text-[#274a82]' : 'text-[#e60012]'">{{ form.slug }}</span>
          </p>
          <span v-else></span>
          <div class="flex items-center gap-2.5 flex-shrink-0">
            <button
              @click="showModal = false"
              :disabled="saving"
              class="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              @click="saveItem"
              :disabled="saving || !form.name.trim()"
              class="flex items-center gap-2 px-5 py-2 text-xs font-black text-white rounded-lg transition-all disabled:opacity-50"
              :class="isSubcat ? 'bg-[#274a82] hover:bg-[#1e3a6e]' : 'bg-[#e60012] hover:bg-[#c4000f]'"
            >
              <UIcon
                :name="saving ? 'i-heroicons-arrow-path' : 'i-heroicons-check'"
                class="w-3.5 h-3.5"
                :class="saving ? 'animate-spin' : ''"
              />
              {{ isEditing ? 'Sauvegarder' : 'Ajouter' }}
            </button>
          </div>
        </div>

      </div>
    </template>
  </UModal>

  <!-- ════════════════════════════════════════════════════════════
       MODAL — Confirmation suppression
  ════════════════════════════════════════════════════════════ -->
  <UModal v-model:open="showConfirm" :ui="{ width: 'sm:max-w-sm' }">
    <template #content>
      <div class="overflow-hidden rounded-2xl">

        <!-- Header -->
        <div class="px-6 py-5 bg-[#e60012] flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 class="text-base font-black text-white leading-tight">Confirmer la suppression</h2>
            <p class="text-xs text-white/70 mt-0.5">Cette action est irréversible</p>
          </div>
        </div>

        <!-- Corps -->
        <div class="px-6 py-5 bg-white space-y-3">
          <p class="text-sm text-gray-600">
            Voulez-vous vraiment supprimer
            <span class="font-black text-gray-900">{{ rowToDelete?._isSubcat ? 'la sous-catégorie' : 'la catégorie' }}</span> :
          </p>
          <div class="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="rowToDelete?._isSubcat ? 'bg-gray-100' : 'bg-[#e60012]/10'"
            >
              <UIcon
                :name="rowToDelete?._isSubcat ? 'i-heroicons-tag' : 'i-heroicons-folder'"
                class="w-4 h-4"
                :class="rowToDelete?._isSubcat ? 'text-gray-400' : 'text-[#e60012]'"
              />
            </div>
            <span class="font-black text-gray-800 text-sm">{{ rowToDelete?.name }}</span>
          </div>
          <p class="text-xs text-gray-400">
            Les produits liés ne seront pas supprimés, mais ils n'auront plus de catégorie.
          </p>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button
            @click="showConfirm = false"
            class="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            @click="confirmDelete"
            class="flex items-center gap-2 px-5 py-2 text-xs font-black text-white bg-[#e60012] hover:bg-[#c4000f] rounded-lg transition-all"
          >
            <UIcon name="i-heroicons-trash" class="w-3.5 h-3.5" />
            Supprimer
          </button>
        </div>

      </div>
    </template>
  </UModal>

</template>