<script setup lang="ts">
const { requireAdmin } = useAuth()
requireAdmin()
import { ref } from 'vue'
import axios from 'axios'
import type { ToastProps } from '@nuxt/ui'

useHead({ title: 'BRC Market - Admin Informations' })

const toast = useToast()
const token = useCookie('auth_token')

const form = ref({
  first_name: 'Sophie',
  last_name:  'Ekwalla',
  email:      'sophie@brcmarket.cm',
  phone:      '+237 690 000 006',
  birthdate:  '1990-03-15',
})

const loadingInfo     = ref(false)
const loadingPassword = ref(false)
const errorsInfo      = ref<Record<string, string[]>>({})
const errorsPassword  = ref<Record<string, string[]>>({})

const passwords = ref({
  current_password:      '',
  password:              '',
  password_confirmation: '',
})

const user = useState<any>('auth_user', () => null)

const initials = computed(() => {
  if (!user.value) return '?'
  return `${user.value.first_name?.[0] ?? ''}${user.value.last_name?.[0] ?? ''}`.toUpperCase()
})

const saveProfile = async () => {
  loadingInfo.value = true
  errorsInfo.value  = {}
  try {
    await axios.put('http://127.0.0.1:8000/api/profile', form.value, {
      headers: { Authorization: `Bearer ${token.value}`, Accept: 'application/json' }
    })
    toast.add({ title: 'Profil mis à jour !', description: 'Vos informations ont été enregistrées.', color: 'success', icon: 'i-heroicons-check-circle' } as ToastProps)
  } catch (err: any) {
    if (err.response?.status === 422) {
      errorsInfo.value = err.response.data.errors ?? {}
      toast.add({ title: 'Erreur de validation', description: 'Vérifiez les champs.', color: 'error', icon: 'i-heroicons-exclamation-triangle' } as ToastProps)
    } else {
      toast.add({ title: 'Erreur', description: 'Impossible de sauvegarder.', color: 'error', icon: 'i-heroicons-x-circle' } as ToastProps)
    }
  } finally {
    loadingInfo.value = false
  }
}

const changePassword = async () => {
  loadingPassword.value = true
  errorsPassword.value  = {}
  try {
    await axios.put('http://127.0.0.1:8000/api/profile/password', passwords.value, {
      headers: { Authorization: `Bearer ${token.value}`, Accept: 'application/json' }
    })
    toast.add({ title: 'Mot de passe changé !', description: 'Votre mot de passe a été mis à jour.', color: 'success', icon: 'i-heroicons-check-circle' } as ToastProps)
    passwords.value = { current_password: '', password: '', password_confirmation: '' }
  } catch (err: any) {
    if (err.response?.status === 422) {
      errorsPassword.value = err.response.data.errors ?? {}
      toast.add({ title: 'Erreur', description: Object.values(errorsPassword.value)[0]?.[0] ?? 'Vérifiez les champs.', color: 'error', icon: 'i-heroicons-exclamation-triangle' } as ToastProps)
    } else {
      toast.add({ title: 'Erreur', description: err.response?.data?.message ?? 'Une erreur est survenue.', color: 'error', icon: 'i-heroicons-x-circle' } as ToastProps)
    }
  } finally {
    loadingPassword.value = false
  }
}
</script>

<template>
  <div class="space-y-5 max-w-3xl">

    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-black text-gray-900">Mes informations</h1>
      <p class="text-gray-400 text-sm mt-0.5">Gérez votre profil administrateur</p>
    </div>

    <!-- ── Section 1 : Profile ── -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

      <!-- Avatar row -->
      <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div class="w-14 h-14 rounded-2xl bg-[#274a82] flex items-center justify-center flex-shrink-0">
          <span class="text-white text-xl font-black">{{ initials }}</span>
        </div>
        <div>
          <p class="font-black text-gray-900">{{ form.first_name }} {{ form.last_name }}</p>
          <p class="text-sm text-gray-400">{{ form.email }}</p>
          <span class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e60012]/10 text-[#e60012]">
            <UIcon name="i-heroicons-shield-check" class="w-3 h-3" />
            {{ user?.role === 'super_admin' ? 'Super Admin' : 'Admin' }}
          </span>
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
            <UInput v-model="form.first_name" icon="i-heroicons-user" size="lg" block :color="errorsInfo.first_name ? 'error' : 'primary'" />
            <p v-if="errorsInfo.first_name" class="text-xs text-red-500">{{ errorsInfo.first_name[0] }}</p>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom</label>
            <UInput v-model="form.last_name" icon="i-heroicons-user" size="lg" block :color="errorsInfo.last_name ? 'error' : 'primary'" />
            <p v-if="errorsInfo.last_name" class="text-xs text-red-500">{{ errorsInfo.last_name[0] }}</p>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
            <UInput v-model="form.email" type="email" icon="i-heroicons-envelope" size="lg" block :color="errorsInfo.email ? 'error' : 'primary'" />
            <p v-if="errorsInfo.email" class="text-xs text-red-500">{{ errorsInfo.email[0] }}</p>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Téléphone</label>
            <UInput v-model="form.phone" type="tel" icon="i-heroicons-device-phone-mobile" size="lg" block :color="errorsInfo.phone ? 'error' : 'primary'" />
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

    <!-- ── Section 2 : Password ── -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

      <div class="flex items-center gap-2 mb-4">
        <div class="w-5 h-5 rounded-full bg-[#274a82] text-white text-[10px] font-bold flex items-center justify-center">2</div>
        <span class="text-xs font-bold text-gray-600 uppercase tracking-wider">Changer le mot de passe</span>
      </div>

      <form @submit.prevent="changePassword" class="space-y-4">

        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mot de passe actuel</label>
          <UInput v-model="passwords.current_password" type="password" icon="i-heroicons-lock-closed" placeholder="••••••••" size="lg" block :color="errorsPassword.current_password ? 'error' : 'primary'" />
          <p v-if="errorsPassword.current_password" class="text-xs text-red-500">{{ errorsPassword.current_password[0] }}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nouveau mot de passe</label>
            <UInput v-model="passwords.password" type="password" icon="i-heroicons-lock-closed" placeholder="Min. 8 caractères" size="lg" block :color="errorsPassword.password ? 'error' : 'primary'" />
            <p v-if="errorsPassword.password" class="text-xs text-red-500">{{ errorsPassword.password[0] }}</p>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirmer</label>
            <UInput v-model="passwords.password_confirmation" type="password" icon="i-heroicons-lock-closed" placeholder="Répéter" size="lg" block />
          </div>
        </div>

        <UButton type="submit" color="primary" variant="outline" size="lg" :loading="loadingPassword" icon="i-heroicons-key">
          Changer le mot de passe
        </UButton>
      </form>
    </div>

  </div>
</template>