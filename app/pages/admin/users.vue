<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'

const { requireAdmin, token } = useAuth()
requireAdmin()

useHead({ title: 'Comptes - Admin BRC Market' })

const toast  = useToast()
const config = useRuntimeConfig()
const API    = config.public.apiBase

const authHeaders = computed(() => ({
  Authorization: `Bearer ${token.value}`,
  Accept: 'application/json',
}))

// ── Types ──────────────────────────────────────────────────────────────────────
interface User {
  id:           number
  first_name:   string
  last_name:    string
  email:        string
  phone:        string | null
  role:         string
  is_blocked:   boolean
  orders_count: number
  created_at:   string
}

// ── State ──────────────────────────────────────────────────────────────────────
const users         = ref<User[]>([])
const loading       = ref(true)
const searchQuery   = ref('')
const activeFilter  = ref('all')
const selectedUser  = ref<User | null>(null)
const showDetail    = ref(false)
const updatingRole  = ref(false)
const updatingBlock = ref(false)
const newRole       = ref('')

// Modal création
const showCreate   = ref(false)
const creating     = ref(false)
const createForm   = ref({ first_name: '', last_name: '', email: '', phone: '', password: '', role: 'livreur' })
const createErrors = ref<Record<string, string[]>>({})
const showPassword = ref(false)

// ── Config des rôles ───────────────────────────────────────────────────────────
// Rôles en base : 'client' | 'livreur' | 'user' | 'admin' | 'super_admin'
// Cette page affiche : client, livreur, user — admin et super_admin sont exclus
const roleConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  client:      { label: 'Client',              bg: '#f1f5f9', text: '#475569', icon: 'i-heroicons-user'             },
  livreur:     { label: 'Livreur',             bg: '#eff6ff', text: '#1d4ed8', icon: 'i-heroicons-truck'            },
  user:        { label: 'Utilisateur système', bg: '#f0fdf4', text: '#166534', icon: 'i-heroicons-computer-desktop' },
  admin:       { label: 'Admin',               bg: '#f5f3ff', text: '#6d28d9', icon: 'i-heroicons-shield-check'     },
  super_admin: { label: 'Super Admin',         bg: '#fff1f2', text: '#be123c', icon: 'i-heroicons-star'             },
}

// Création : 2 types seulement
// Création : livreur ou utilisateur système (role 'user' en base)
const roleOptionsCreate = [
  { value: 'livreur', label: 'Livreur',            icon: 'i-heroicons-truck',            desc: 'Peut gérer et livrer les commandes' },
  { value: 'user',    label: 'Utilisateur système', icon: 'i-heroicons-computer-desktop', desc: 'Accès backoffice avec droits limités' },
]

// Changement de rôle : livreur <-> utilisateur système uniquement
// Changement de rôle : livreur <-> utilisateur système (user)
const roleOptionsChange = [
  { value: 'livreur', label: 'Livreur',             icon: 'i-heroicons-truck'            },
  { value: 'user',    label: 'Utilisateur système',  icon: 'i-heroicons-computer-desktop' },
]

const filters = [
  { key: 'all',     label: 'Tous'                 },
  { key: 'client',  label: 'Clients'              },
  { key: 'livreur', label: 'Livreurs'             },
  { key: 'user',    label: 'Utilisateurs système' },
  { key: 'blocked', label: 'Suspendus'            },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
const initials   = (u: User) => `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase()
const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

const avatarColors = ['#274a82', '#e60012', '#0369a1', '#166534', '#854d0e', '#6b21a8']
const avatarColor  = (u: User) => {
  let hash = 0
  for (let i = 0; i < u.email.length; i++) hash = u.email.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

// ── Fetch ──────────────────────────────────────────────────────────────────────
const fetchUsers = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API}/admin/users`, { headers: authHeaders.value, params: { per_page: 200 } })
    users.value = data.data ?? data
  } catch {
    toast.add({ title: 'Erreur de chargement', color: 'error', icon: 'i-heroicons-exclamation-circle' })
  } finally {
    loading.value = false
  }
}

// ── Stats : client + livreur + user (on exclut admin et super_admin) ────────
const stats = computed(() => {
  const visible = users.value.filter(u => u.role === 'client' || u.role === 'livreur' || u.role === 'user')
  return {
    total:    visible.length,
    clients:  visible.filter(u => u.role === 'client').length,
    livreurs: visible.filter(u => u.role === 'livreur').length,
    systeme:  visible.filter(u => u.role === 'user').length,
    bloques:  visible.filter(u => u.is_blocked).length,
  }
})

// ── Liste filtrée : client, livreur, user — admin et super_admin exclus ──────
const filteredUsers = computed(() => {
  let list = users.value.filter(u => u.role === 'client' || u.role === 'livreur' || u.role === 'user')
  if (activeFilter.value === 'blocked')      list = list.filter(u => u.is_blocked)
  else if (activeFilter.value !== 'all')     list = list.filter(u => u.role === activeFilter.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(u =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }
  return list
})

// ── Ouvrir détail ──────────────────────────────────────────────────────────────
const openDetail = (user: User) => {
  selectedUser.value = { ...user }
  newRole.value      = user.role
  showDetail.value   = true
}

// ── Bloquer / Débloquer ────────────────────────────────────────────────────────
const toggleBlock = async (user: User, closeModal = false) => {
  updatingBlock.value = true
  try {
    const endpoint = user.is_blocked ? 'unblock' : 'block'
    await axios.patch(`${API}/admin/users/${user.id}/${endpoint}`, {}, { headers: authHeaders.value })
    const idx = users.value.findIndex(u => u.id === user.id)
    if (idx !== -1) users.value[idx].is_blocked = !user.is_blocked
    if (selectedUser.value?.id === user.id) selectedUser.value.is_blocked = !user.is_blocked
    toast.add({
      title:       user.is_blocked ? 'Accès suspendu' : 'Accès rétabli',
      description: `${user.first_name} ${user.last_name}`,
      color:       user.is_blocked ? 'error' : 'success',
      icon:        user.is_blocked ? 'i-heroicons-no-symbol' : 'i-heroicons-check-circle',
    })
    if (closeModal) showDetail.value = false
  } catch {
    toast.add({ title: 'Erreur', color: 'error', icon: 'i-heroicons-x-circle' })
  } finally {
    updatingBlock.value = false
  }
}

// ── Changer le rôle ────────────────────────────────────────────────────────────
const updateRole = async () => {
  if (!selectedUser.value || newRole.value === selectedUser.value.role) return
  updatingRole.value = true
  try {
    await axios.patch(
      `${API}/admin/users/${selectedUser.value.id}/role`,
      { role: newRole.value },
      { headers: authHeaders.value }
    )
    const idx = users.value.findIndex(u => u.id === selectedUser.value!.id)
    if (idx !== -1) users.value[idx].role = newRole.value
    selectedUser.value.role = newRole.value
    toast.add({
      title:       'Rôle mis à jour',
      description: `${selectedUser.value.first_name} est maintenant « ${roleConfig[newRole.value]?.label} »`,
      color:       'success',
      icon:        'i-heroicons-check-circle',
    })
  } catch (e: any) {
    toast.add({ title: 'Erreur', description: e?.response?.data?.message ?? 'Impossible de modifier.', color: 'error', icon: 'i-heroicons-x-circle' })
  } finally {
    updatingRole.value = false
  }
}

// ── Créer un compte ────────────────────────────────────────────────────────────
const resetCreateForm = () => {
  createForm.value   = { first_name: '', last_name: '', email: '', phone: '', password: '', role: 'livreur' }
  createErrors.value = {}
  showPassword.value = false
}

const createUser = async () => {
  creating.value     = true
  createErrors.value = {}
  try {
    const { data } = await axios.post(`${API}/admin/users`, createForm.value, { headers: authHeaders.value })
    users.value.unshift(data.user)
    showCreate.value = false
    resetCreateForm()
    toast.add({
      title:       'Compte créé',
      description: `${data.user.first_name} ${data.user.last_name} · ${roleConfig[data.user.role]?.label}`,
      color:       'success',
      icon:        'i-heroicons-user-plus',
    })
  } catch (e: any) {
    if (e?.response?.status === 422) createErrors.value = e.response.data.errors ?? {}
    toast.add({ title: 'Erreur', description: e?.response?.data?.message ?? 'Vérifiez les champs.', color: 'error', icon: 'i-heroicons-x-circle' })
  } finally {
    creating.value = false
  }
}

await fetchUsers()
</script>

<template>
  <div class="space-y-6">

    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-gray-900">Gestion des comptes</h1>
        <p class="text-sm text-gray-400 mt-0.5">
          {{ stats.clients }} client{{ stats.clients !== 1 ? 's' : '' }} ·
          {{ stats.livreurs }} livreur{{ stats.livreurs !== 1 ? 's' : '' }} ·
          {{ stats.systeme }} utilisateur{{ stats.systeme !== 1 ? 's' : '' }} système
        </p>
      </div>
      <button @click="showCreate = true"
        class="flex items-center gap-2 px-4 py-2.5 bg-[#274a82] hover:bg-[#1a3460] text-white text-sm font-black rounded-xl transition-all shadow-sm">
        <UIcon name="i-heroicons-user-plus" class="w-4 h-4" />
        Créer un compte
      </button>
    </div>

    <!-- ── Stats cards ────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
        <p class="text-2xl font-black text-gray-900 mt-1">{{ stats.total }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-5 h-5 rounded-md bg-[#f1f5f9] flex items-center justify-center">
            <UIcon name="i-heroicons-user" class="w-3 h-3 text-slate-500" />
          </div>
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Clients</p>
        </div>
        <p class="text-2xl font-black text-slate-600">{{ stats.clients }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-5 h-5 rounded-md bg-[#eff6ff] flex items-center justify-center">
            <UIcon name="i-heroicons-truck" class="w-3 h-3 text-blue-600" />
          </div>
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Livreurs</p>
        </div>
        <p class="text-2xl font-black text-blue-600">{{ stats.livreurs }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-5 h-5 rounded-md bg-[#f0fdf4] flex items-center justify-center">
            <UIcon name="i-heroicons-computer-desktop" class="w-3 h-3 text-green-700" />
          </div>
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Système</p>
        </div>
        <p class="text-2xl font-black text-green-700">{{ stats.systeme }}</p>
      </div>
    </div>

    <!-- ── Filtres + Recherche ────────────────────────────────────────────── -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex gap-2 flex-wrap">
        <button v-for="f in filters" :key="f.key" @click="activeFilter = f.key"
          class="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          :class="activeFilter === f.key
            ? 'bg-[#274a82] text-white shadow-sm'
            : 'bg-white border border-gray-200 text-gray-500 hover:border-[#274a82] hover:text-[#274a82]'">
          {{ f.label }}
          <span v-if="f.key !== 'all'" class="ml-1 opacity-60 text-[10px]">
            {{ f.key === 'client' ? stats.clients : f.key === 'livreur' ? stats.livreurs : f.key === 'user' ? stats.systeme : stats.bloques }}
          </span>
        </button>
      </div>
      <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass"
        placeholder="Rechercher par nom, email..." size="sm" class="w-64" />
    </div>

    <!-- ── Table style Google ─────────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      <!-- En-tête de section -->
      <div class="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
        <UIcon name="i-heroicons-users" class="w-4 h-4 text-gray-400" />
        <p class="text-xs font-black text-gray-500 uppercase tracking-wider">
          {{ filteredUsers.length }} compte{{ filteredUsers.length !== 1 ? 's' : '' }}
        </p>
        <span class="ml-auto text-[10px] text-gray-400 italic hidden sm:block">
          Les clients s'inscrivent eux-mêmes · lecture seule
        </span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
        <UIcon name="i-heroicons-arrow-path" class="w-7 h-7 animate-spin text-[#274a82]" />
        <p class="text-sm text-gray-400">Chargement...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredUsers.length === 0"
        class="flex flex-col items-center justify-center py-20 gap-3">
        <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <UIcon name="i-heroicons-users" class="w-7 h-7 text-gray-300" />
        </div>
        <p class="text-gray-400 text-sm font-medium">Aucun compte trouvé</p>
        <button v-if="searchQuery || activeFilter !== 'all'"
          @click="searchQuery = ''; activeFilter = 'all'"
          class="text-xs text-[#274a82] font-bold hover:underline">
          Effacer les filtres
        </button>
      </div>

      <!-- Rows style Google -->
      <div v-else class="divide-y divide-gray-50">
        <div v-for="user in filteredUsers" :key="user.id"
          class="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors group cursor-default">

          <!-- Avatar initiales -->
          <div class="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm"
            :style="{ backgroundColor: avatarColor(user) }">
            {{ initials(user) }}
          </div>

          <!-- Infos -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="font-bold text-gray-900 text-sm">{{ user.first_name }} {{ user.last_name }}</p>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
                :style="{ backgroundColor: roleConfig[user.role]?.bg, color: roleConfig[user.role]?.text }">
                <UIcon :name="roleConfig[user.role]?.icon ?? 'i-heroicons-user'" class="w-2.5 h-2.5" />
                {{ roleConfig[user.role]?.label ?? user.role }}
              </span>
              <span v-if="user.is_blocked"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-600">
                <UIcon name="i-heroicons-no-symbol" class="w-2.5 h-2.5" />
                Suspendu
              </span>
            </div>
            <p class="text-xs text-gray-400 mt-0.5 truncate">{{ user.email }}</p>
            <div class="flex items-center gap-3 mt-1 flex-wrap">
              <span v-if="user.phone" class="text-[11px] text-gray-400 flex items-center gap-1">
                <UIcon name="i-heroicons-device-phone-mobile" class="w-3 h-3" />{{ user.phone }}
              </span>
              <span class="text-[11px] text-gray-400 flex items-center gap-1">
                <UIcon name="i-heroicons-shopping-bag" class="w-3 h-3" />
                {{ user.orders_count ?? 0 }} commande{{ (user.orders_count ?? 0) !== 1 ? 's' : '' }}
              </span>
              <span class="text-[11px] text-gray-400 flex items-center gap-1">
                <UIcon name="i-heroicons-calendar" class="w-3 h-3" />
                Depuis {{ formatDate(user.created_at) }}
              </span>
            </div>
          </div>

          <!-- Actions (visibles au hover) -->
          <div class="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="openDetail(user)"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-[#274a82] hover:text-white hover:border-[#274a82] text-gray-600 text-xs font-bold transition-all">
              <UIcon :name="user.role === 'client' ? 'i-heroicons-eye' : 'i-heroicons-pencil-square'" class="w-3.5 h-3.5" />
              {{ user.role === 'client' ? 'Voir' : 'Gérer' }}
            </button>
            <button @click="toggleBlock(user)"
              class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
              :class="user.is_blocked
                ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500'
                : 'border-red-100 bg-red-50 text-red-400 hover:bg-[#e60012] hover:text-white hover:border-[#e60012]'"
              :title="user.is_blocked ? 'Rétablir' : 'Suspendre'">
              <UIcon :name="user.is_blocked ? 'i-heroicons-lock-open' : 'i-heroicons-no-symbol'" class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Chevron -->
          <button @click="openDetail(user)"
            class="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all flex-shrink-0">
            <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
          </button>

        </div>
      </div>

    </div>

  </div>

  <!-- ══ MODAL DÉTAIL ════════════════════════════════════════════════════════ -->
  <UModal v-model:open="showDetail">
    <template #content>
      <div v-if="selectedUser" class="overflow-hidden rounded-2xl">

        <!-- Header -->
        <div class="px-6 pt-6 pb-5 border-b border-gray-100 flex items-start gap-4">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0 shadow-sm"
            :style="{ backgroundColor: avatarColor(selectedUser) }">
            {{ initials(selectedUser) }}
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-lg font-black text-gray-900">{{ selectedUser.first_name }} {{ selectedUser.last_name }}</h2>
            <p class="text-sm text-gray-400 truncate">{{ selectedUser.email }}</p>
            <div class="flex items-center gap-2 mt-2 flex-wrap">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black"
                :style="{ backgroundColor: roleConfig[selectedUser.role]?.bg, color: roleConfig[selectedUser.role]?.text }">
                <UIcon :name="roleConfig[selectedUser.role]?.icon ?? 'i-heroicons-user'" class="w-3 h-3" />
                {{ roleConfig[selectedUser.role]?.label ?? selectedUser.role }}
              </span>
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                :class="selectedUser.is_blocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'">
                <UIcon :name="selectedUser.is_blocked ? 'i-heroicons-no-symbol' : 'i-heroicons-check-circle'" class="w-3 h-3" />
                {{ selectedUser.is_blocked ? 'Suspendu' : 'Actif' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Infos -->
        <div class="px-6 py-4 space-y-2">
          <div v-if="selectedUser.phone" class="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl">
            <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span class="text-sm text-gray-700">{{ selectedUser.phone }}</span>
          </div>
          <div class="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl">
            <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span class="text-sm text-gray-700 flex-1">Commandes passées</span>
            <span class="text-sm font-black"
              :class="(selectedUser.orders_count ?? 0) === 0 ? 'text-gray-400' : 'text-[#274a82]'">
              {{ selectedUser.orders_count ?? 0 }}
            </span>
          </div>
          <div class="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl">
            <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span class="text-sm text-gray-700">Membre depuis {{ formatDate(selectedUser.created_at) }}</span>
          </div>
        </div>

        <!-- Changer rôle — uniquement pour livreurs et utilisateurs système -->
        <div v-if="selectedUser.role !== 'client'" class="px-6 pb-4">
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Changer le rôle</p>
          <div class="grid grid-cols-2 gap-2 mb-3">
            <button v-for="opt in roleOptionsChange" :key="opt.value" @click="newRole = opt.value"
              class="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all"
              :class="newRole === opt.value
                ? 'border-[#274a82] bg-[#274a82]/5 text-[#274a82]'
                : 'border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600'">
              <UIcon :name="opt.icon" class="w-4 h-4 flex-shrink-0" />
              {{ opt.label }}
            </button>
          </div>
          <button @click="updateRole" :disabled="updatingRole || newRole === selectedUser.role"
            class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#274a82] hover:bg-[#1a3460] text-white font-black text-sm transition-all disabled:opacity-40">
            <UIcon :name="updatingRole ? 'i-heroicons-arrow-path' : 'i-heroicons-check'"
              class="w-4 h-4" :class="updatingRole ? 'animate-spin' : ''" />
            {{ updatingRole ? 'Enregistrement...' : 'Appliquer le rôle' }}
          </button>
        </div>

        <!-- Info pour les clients — lecture seule -->
        <div v-else class="px-6 pb-4">
          <div class="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p class="text-xs text-slate-500 leading-relaxed">
              Ce client s'est inscrit lui-même via la boutique. Son rôle ne peut pas être modifié depuis cette interface.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 pb-6 flex gap-3 border-t border-gray-100 pt-4">
          <button @click="showDetail = false"
            class="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">
            Fermer
          </button>
          <button @click="toggleBlock(selectedUser, true)" :disabled="updatingBlock"
            class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm transition-all disabled:opacity-40"
            :class="selectedUser.is_blocked
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-[#e60012] hover:bg-red-700 text-white'">
            <UIcon :name="selectedUser.is_blocked ? 'i-heroicons-lock-open' : 'i-heroicons-no-symbol'" class="w-4 h-4" />
            {{ selectedUser.is_blocked ? "Rétablir l'accès" : 'Suspendre' }}
          </button>
        </div>

      </div>
    </template>
  </UModal>

  <!-- ══ MODAL CRÉATION ══════════════════════════════════════════════════════ -->
  <UModal v-model:open="showCreate">
    <template #content>
      <div class="overflow-hidden rounded-2xl">

        <!-- Header bleu -->
        <div class="px-6 py-5 bg-[#274a82]">
          <h3 class="text-lg font-black text-white">Nouveau compte</h3>
          <p class="text-xs text-white/60 mt-0.5">
            Créez un livreur ou un utilisateur système — les clients s'inscrivent eux-mêmes
          </p>
        </div>

        <div class="px-6 py-5 space-y-5">

          <!-- Type de compte — 2 cartes cliquables -->
          <div>
            <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Type de compte</p>
            <div class="grid grid-cols-2 gap-3">
              <button v-for="opt in roleOptionsCreate" :key="opt.value"
                @click="createForm.role = opt.value"
                type="button"
                class="relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all"
                :class="createForm.role === opt.value
                  ? 'border-[#274a82] bg-[#274a82]/5'
                  : 'border-gray-100 hover:border-gray-300 bg-gray-50'">
                <!-- Checkmark actif -->
                <div v-if="createForm.role === opt.value"
                  class="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#274a82] flex items-center justify-center">
                  <UIcon name="i-heroicons-check" class="w-2.5 h-2.5 text-white" />
                </div>
                <!-- Icône colorée -->
                <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  :style="{ backgroundColor: roleConfig[opt.value].bg }">
                  <UIcon :name="opt.icon" class="w-4 h-4" :style="{ color: roleConfig[opt.value].text }" />
                </div>
                <div class="min-w-0">
                  <p class="font-black text-sm text-gray-800 leading-tight">{{ opt.label }}</p>
                  <p class="text-[11px] text-gray-400 mt-1 leading-snug">{{ opt.desc }}</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Prénom + Nom -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-[11px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">
                Prénom <span class="text-[#e60012]">*</span>
              </label>
              <input v-model="createForm.first_name" type="text" placeholder="Jean"
                class="w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-2 focus:ring-[#274a82]/10 transition-all"
                :class="createErrors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-200'" />
              <p v-if="createErrors.first_name" class="text-xs text-red-500 mt-1">{{ createErrors.first_name[0] }}</p>
            </div>
            <div>
              <label class="text-[11px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">
                Nom <span class="text-[#e60012]">*</span>
              </label>
              <input v-model="createForm.last_name" type="text" placeholder="Mbala"
                class="w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-2 focus:ring-[#274a82]/10 transition-all"
                :class="createErrors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-200'" />
              <p v-if="createErrors.last_name" class="text-xs text-red-500 mt-1">{{ createErrors.last_name[0] }}</p>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="text-[11px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">
              Email <span class="text-[#e60012]">*</span>
            </label>
            <input v-model="createForm.email" type="email" placeholder="jean@brcmarket.cm"
              class="w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-2 focus:ring-[#274a82]/10 transition-all"
              :class="createErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'" />
            <p v-if="createErrors.email" class="text-xs text-red-500 mt-1">{{ createErrors.email[0] }}</p>
          </div>

          <!-- Téléphone -->
          <div>
            <label class="text-[11px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Téléphone</label>
            <input v-model="createForm.phone" type="tel" placeholder="+237 6XX XXX XXX"
              class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-2 focus:ring-[#274a82]/10 transition-all" />
          </div>

          <!-- Mot de passe -->
          <div>
            <label class="text-[11px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">
              Mot de passe <span class="text-[#e60012]">*</span>
            </label>
            <div class="relative">
              <input v-model="createForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Minimum 8 caractères"
                class="w-full border rounded-xl px-3 py-2.5 pr-10 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-2 focus:ring-[#274a82]/10 transition-all"
                :class="createErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
              </button>
            </div>
            <p v-if="createErrors.password" class="text-xs text-red-500 mt-1">{{ createErrors.password[0] }}</p>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 pb-6 flex gap-3 border-t border-gray-100 pt-4">
          <button @click="showCreate = false; resetCreateForm()"
            class="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">
            Annuler
          </button>
          <button @click="createUser" :disabled="creating"
            class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#274a82] hover:bg-[#1a3460] text-white font-black text-sm transition-all disabled:opacity-40 shadow-sm">
            <UIcon :name="creating ? 'i-heroicons-arrow-path' : 'i-heroicons-user-plus'"
              class="w-4 h-4" :class="creating ? 'animate-spin' : ''" />
            {{ creating ? 'Création...' : 'Créer le compte' }}
          </button>
        </div>

      </div>
    </template>
  </UModal>

</template>