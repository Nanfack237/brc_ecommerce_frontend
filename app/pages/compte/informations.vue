<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'

const { requireAuth, token } = useAuth()
requireAuth()

useHead({
  title: 'Mes informations',
  titleTemplate: (t) => t ? `${t} - BRC Market` : 'BRC Market',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
})

const toast  = useToast()
const config = useRuntimeConfig()
const API    = config.public.apiBase

const authHeaders = computed(() => ({
  Authorization: `Bearer ${token.value}`,
  Accept: 'application/json',
}))

// ── State ─────────────────────────────────────────────────────────────────────
const loadingFetch    = ref(true)
const loadingInfo     = ref(false)
const loadingPassword = ref(false)
const errorsInfo      = ref<Record<string, string[]>>({})
const errorsPassword  = ref<Record<string, string[]>>({})

const form = ref({
  first_name: '',
  last_name:  '',
  email:      '',
  phone:      '',
  birthdate:  '',
})

const passwords = ref({
  current_password:      '',
  password:              '',
  password_confirmation: '',
})

// ── Charger les infos depuis l'API ────────────────────────────────────────────
const fetchProfile = async () => {
  loadingFetch.value = true
  try {
    const { data } = await axios.get(`${API}/auth/me`, { headers: authHeaders.value })
    form.value = {
      first_name: data.first_name ?? '',
      last_name:  data.last_name  ?? '',
      email:      data.email      ?? '',
      phone:      data.phone      ?? '',
      birthdate:  data.birthdate  ?? '',
    }
  } catch {
    toast.add({
      title: 'Erreur de chargement',
      description: 'Impossible de récupérer vos informations.',
      color: 'error',
      icon: 'i-heroicons-exclamation-circle',
    })
  } finally {
    loadingFetch.value = false
  }
}

// ── Sauvegarder le profil ─────────────────────────────────────────────────────
const saveProfile = async () => {
  loadingInfo.value = true
  errorsInfo.value  = {}
  try {
    await axios.put(`${API}/profile`, form.value, { headers: authHeaders.value })
    toast.add({
      title: 'Profil mis à jour !',
      description: 'Vos informations ont été enregistrées.',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })
  } catch (err: any) {
    if (err.response?.status === 422) {
      errorsInfo.value = err.response.data.errors ?? {}
      toast.add({ title: 'Erreur de validation', description: 'Vérifiez les champs.', color: 'error', icon: 'i-heroicons-exclamation-triangle' })
    } else {
      toast.add({ title: 'Erreur', description: 'Impossible de sauvegarder.', color: 'error', icon: 'i-heroicons-x-circle' })
    }
  } finally {
    loadingInfo.value = false
  }
}

// ── Changer le mot de passe ───────────────────────────────────────────────────
const changePassword = async () => {
  loadingPassword.value = true
  errorsPassword.value  = {}
  try {
    await axios.put(`${API}/profile/password`, passwords.value, { headers: authHeaders.value })
    toast.add({
      title: 'Mot de passe changé !',
      description: 'Votre mot de passe a été mis à jour.',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })
    passwords.value = { current_password: '', password: '', password_confirmation: '' }
  } catch (err: any) {
    if (err.response?.status === 422) {
      errorsPassword.value = err.response.data.errors ?? {}
      toast.add({
        title: 'Erreur',
        description: Object.values(errorsPassword.value)[0]?.[0] ?? 'Vérifiez les champs.',
        color: 'error',
        icon: 'i-heroicons-exclamation-triangle',
      })
    } else {
      toast.add({
        title: 'Erreur',
        description: err.response?.data?.message ?? 'Une erreur est survenue.',
        color: 'error',
        icon: 'i-heroicons-x-circle',
      })
    }
  } finally {
    loadingPassword.value = false
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
await fetchProfile()
</script>

<template>
  <div class="space-y-5">

    <!-- ══ BREADCRUMB + TITRE ══════════════════════════════════════════════ -->
    <div>
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">Accueil</NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <NuxtLink to="/compte" class="hover:text-[#274a82] transition-colors">Mon compte</NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <span class="text-gray-600 font-medium">Mes informations</span>
      </div>
      <h1 class="text-2xl font-black text-gray-900">Mes informations</h1>
      <p class="text-gray-500 text-sm mt-1">Gérez votre profil personnel</p>
    </div>

    <!-- ══ LOADING SKELETON ════════════════════════════════════════════════ -->
    <div v-if="loadingFetch" class="space-y-5">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div class="w-14 h-14 rounded-2xl bg-gray-100 flex-shrink-0"></div>
          <div class="space-y-2 flex-1">
            <div class="h-4 bg-gray-100 rounded w-1/3"></div>
            <div class="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="i in 4" :key="i" class="h-10 bg-gray-100 rounded-lg"></div>
          <div class="col-span-2 h-10 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div class="space-y-4">
          <div class="h-10 bg-gray-100 rounded-lg"></div>
          <div class="grid grid-cols-2 gap-4">
            <div class="h-10 bg-gray-100 rounded-lg"></div>
            <div class="h-10 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ CONTENU ══════════════════════════════════════════════════════════ -->
    <template v-else>

      <!-- Section 1 — Profil ──────────────────────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

        <!-- Avatar row -->
        <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div class="w-14 h-14 rounded-2xl bg-[#274a82]/10 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-user-circle" class="w-9 h-9 text-[#274a82]" />
          </div>
          <div>
            <p class="font-bold text-gray-900">{{ form.first_name }} {{ form.last_name }}</p>
            <p class="text-sm text-gray-400">{{ form.email }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-4">
          <div class="w-5 h-5 rounded-full bg-[#274a82] text-white text-[10px] font-bold flex items-center justify-center">1</div>
          <span class="text-xs font-bold text-gray-600 uppercase tracking-wider">Informations personnelles</span>
        </div>

        <form @submit.prevent="saveProfile" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prénom</label>
              <UInput v-model="form.first_name" icon="i-heroicons-user" size="lg" block
                :color="errorsInfo.first_name ? 'error' : 'primary'" />
              <p v-if="errorsInfo.first_name" class="text-xs text-red-500">{{ errorsInfo.first_name[0] }}</p>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom</label>
              <UInput v-model="form.last_name" icon="i-heroicons-user" size="lg" block
                :color="errorsInfo.last_name ? 'error' : 'primary'" />
              <p v-if="errorsInfo.last_name" class="text-xs text-red-500">{{ errorsInfo.last_name[0] }}</p>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
              <UInput v-model="form.email" type="email" icon="i-heroicons-envelope" size="lg" block
                :color="errorsInfo.email ? 'error' : 'primary'" />
              <p v-if="errorsInfo.email" class="text-xs text-red-500">{{ errorsInfo.email[0] }}</p>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Téléphone</label>
              <UInput v-model="form.phone" type="tel" icon="i-heroicons-device-phone-mobile" size="lg" block
                :color="errorsInfo.phone ? 'error' : 'primary'" />
              <p v-if="errorsInfo.phone" class="text-xs text-red-500">{{ errorsInfo.phone[0] }}</p>
            </div>

            <div class="flex flex-col gap-1 sm:col-span-2">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date de naissance</label>
              <UInput v-model="form.birthdate" type="date" icon="i-heroicons-calendar" size="lg" block />
            </div>

          </div>

          <UButton type="submit" color="error" size="lg" :loading="loadingInfo" icon="i-heroicons-check">
            Sauvegarder les modifications
          </UButton>
        </form>
      </div>

      <!-- Section 2 — Mot de passe ────────────────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

        <div class="flex items-center gap-2 mb-4">
          <div class="w-5 h-5 rounded-full bg-[#274a82] text-white text-[10px] font-bold flex items-center justify-center">2</div>
          <span class="text-xs font-bold text-gray-600 uppercase tracking-wider">Changer le mot de passe</span>
        </div>

        <form @submit.prevent="changePassword" class="space-y-4">

          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mot de passe actuel</label>
            <UInput v-model="passwords.current_password" type="password" icon="i-heroicons-lock-closed"
              placeholder="••••••••" size="lg" block
              :color="errorsPassword.current_password ? 'error' : 'primary'" />
            <p v-if="errorsPassword.current_password" class="text-xs text-red-500">{{ errorsPassword.current_password[0] }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nouveau mot de passe</label>
              <UInput v-model="passwords.password" type="password" icon="i-heroicons-lock-closed"
                placeholder="Min. 8 caractères" size="lg" block
                :color="errorsPassword.password ? 'error' : 'primary'" />
              <p v-if="errorsPassword.password" class="text-xs text-red-500">{{ errorsPassword.password[0] }}</p>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirmer</label>
              <UInput v-model="passwords.password_confirmation" type="password" icon="i-heroicons-lock-closed"
                placeholder="Répéter" size="lg" block />
            </div>
          </div>

          <UButton type="submit" color="primary" variant="outline" size="lg" :loading="loadingPassword" icon="i-heroicons-key">
            Changer le mot de passe
          </UButton>
        </form>
      </div>

    </template>

  </div>
</template>