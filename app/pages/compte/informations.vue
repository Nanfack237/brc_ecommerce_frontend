<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'

const { requireAuth, token } = useAuth()
requireAuth()

const { t } = useI18n()

useHead({
  title: () => t('info_compte.seo_title'),
  titleTemplate: (title) => title ? `${title} - BRC Market` : 'BRC Market',
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

const showPassword = ref(false)
const showPassNew1 = ref(false)
const showPassNew2 = ref(false)

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

// ── Fetch ─────────────────────────────────────────────────────────────────────
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
      title:       t('info_compte.toast_load_error_title'),
      description: t('info_compte.toast_load_error_desc'),
      color:       'error',
      icon:        'i-heroicons-exclamation-circle',
    })
  } finally {
    loadingFetch.value = false
  }
}

// ── Save profile ──────────────────────────────────────────────────────────────
const saveProfile = async () => {
  loadingInfo.value = true
  errorsInfo.value  = {}
  try {
    await axios.put(`${API}/profile`, form.value, { headers: authHeaders.value })
    toast.add({
      title:       t('info_compte.toast_save_success_title'),
      description: t('info_compte.toast_save_success_desc'),
      color:       'success',
      icon:        'i-heroicons-check-circle',
    })
  } catch (err: any) {
    if (err.response?.status === 422) {
      errorsInfo.value = err.response.data.errors ?? {}
      toast.add({
        title:       t('info_compte.toast_validation_title'),
        description: t('info_compte.toast_validation_desc'),
        color:       'error',
        icon:        'i-heroicons-exclamation-triangle',
      })
    } else {
      toast.add({
        title:       t('info_compte.toast_save_error_title'),
        description: t('info_compte.toast_save_error_desc'),
        color:       'error',
        icon:        'i-heroicons-x-circle',
      })
    }
  } finally {
    loadingInfo.value = false
  }
}

// ── Change password ───────────────────────────────────────────────────────────
const changePassword = async () => {
  loadingPassword.value = true
  errorsPassword.value  = {}
  try {
    await axios.put(`${API}/profile/password`, passwords.value, { headers: authHeaders.value })
    toast.add({
      title:       t('info_compte.toast_password_success_title'),
      description: t('info_compte.toast_password_success_desc'),
      color:       'success',
      icon:        'i-heroicons-check-circle',
    })
    passwords.value   = { current_password: '', password: '', password_confirmation: '' }
    showPassword.value = false
    showPassNew1.value = false
    showPassNew2.value = false
  } catch (err: any) {
    if (err.response?.status === 422) {
      errorsPassword.value = err.response.data.errors ?? {}
      toast.add({
        title:       t('info_compte.toast_password_error_title'),
        description: Object.values(errorsPassword.value)[0]?.[0] ?? t('info_compte.toast_validation_desc'),
        color:       'error',
        icon:        'i-heroicons-exclamation-triangle',
      })
    } else {
      toast.add({
        title:       t('info_compte.toast_password_error_title'),
        description: err.response?.data?.message ?? t('info_compte.toast_password_error_desc'),
        color:       'error',
        icon:        'i-heroicons-x-circle',
      })
    }
  } finally {
    loadingPassword.value = false
  }
}

await fetchProfile()
</script>

<template>
  <div class="space-y-5">

    <!-- ══ BREADCRUMB + TITRE ══════════════════════════════════════════════ -->
    <div>
      <div class="hidden sm:flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">
          {{ $t('info_compte.breadcrumb_home') }}
        </NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <span class="text-gray-600 font-medium">{{ $t('info_compte.page_title') }}</span>
      </div>
      <h1 class="text-2xl font-black text-gray-900">{{ $t('info_compte.page_title') }}</h1>
      <p class="text-gray-500 text-sm mt-1">{{ $t('info_compte.subtitle') }}</p>
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

        <!-- Avatar + nom -->
        <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div class="w-14 h-14 rounded-2xl bg-[#274a82]/10 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-user-circle" class="w-9 h-9 text-[#274a82]" />
          </div>
          <div>
            <p class="font-bold text-gray-900">{{ form.first_name }} {{ form.last_name }}</p>
            <p class="text-sm text-gray-400">{{ form.email }}</p>
          </div>
        </div>

        <!-- En-tête section -->
        <div class="flex items-center gap-2 mb-4">
          <div class="w-5 h-5 rounded-full bg-[#274a82] text-white text-[10px] font-bold flex items-center justify-center">
            1
          </div>
          <span class="text-xs font-bold text-gray-600 tracking-wider">
            {{ $t('info_compte.section1_label') }}
          </span>
        </div>

        <form @submit.prevent="saveProfile" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 tracking-wide">
                {{ $t('info_compte.field_firstname') }}
              </label>
              <UInput v-model="form.first_name" icon="i-heroicons-user" size="lg" block
                :color="errorsInfo.first_name ? 'error' : 'primary'" />
              <p v-if="errorsInfo.first_name" class="text-xs text-red-500">
                {{ errorsInfo.first_name[0] }}
              </p>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 tracking-wide">
                {{ $t('info_compte.field_lastname') }}
              </label>
              <UInput v-model="form.last_name" icon="i-heroicons-user" size="lg" block
                :color="errorsInfo.last_name ? 'error' : 'primary'" />
              <p v-if="errorsInfo.last_name" class="text-xs text-red-500">
                {{ errorsInfo.last_name[0] }}
              </p>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 tracking-wide">
                {{ $t('info_compte.field_email') }}
              </label>
              <UInput v-model="form.email" type="email" icon="i-heroicons-envelope" size="lg" block
                :color="errorsInfo.email ? 'error' : 'primary'" />
              <p v-if="errorsInfo.email" class="text-xs text-red-500">
                {{ errorsInfo.email[0] }}
              </p>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 tracking-wide">
                {{ $t('info_compte.field_phone') }}
              </label>
              <UInput
                v-model="form.phone"
                type="tel"
                icon="i-heroicons-device-phone-mobile"
                size="lg"
                block
                :placeholder="$t('info_compte.field_phone_placeholder')"
                :color="errorsInfo.phone ? 'error' : 'primary'"
              />
              <p v-if="errorsInfo.phone" class="text-xs text-red-500">
                {{ errorsInfo.phone[0] }}
              </p>
            </div>

            <div class="flex flex-col gap-1 sm:col-span-2">
              <label class="text-xs font-semibold text-gray-500 tracking-wide">
                {{ $t('info_compte.field_birthdate') }}
              </label>
              <UInput v-model="form.birthdate" type="date" icon="i-heroicons-calendar" size="lg" block />
            </div>

          </div>

          <UButton type="submit" color="error" size="lg" :loading="loadingInfo" icon="i-heroicons-check">
            {{ $t('info_compte.btn_save') }}
          </UButton>
        </form>
      </div>

      <!-- Section 2 — Mot de passe ────────────────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

        <div class="flex items-center gap-2 mb-4">
          <div class="w-5 h-5 rounded-full bg-[#274a82] text-white text-[10px] font-bold flex items-center justify-center">
            2
          </div>
          <span class="text-xs font-bold text-gray-600 tracking-wider">
            {{ $t('info_compte.section2_label') }}
          </span>
        </div>

        <form @submit.prevent="changePassword" class="space-y-4">

          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-500 tracking-wide">
              {{ $t('info_compte.field_current_password') }}
            </label>
            <UInput
              v-model="passwords.current_password"
              :type="showPassword ? 'text' : 'password'"
              icon="i-heroicons-lock-closed"
              :placeholder="$t('info_compte.field_current_password_placeholder')"
              size="lg"
              block
              :color="errorsPassword.current_password ? 'error' : 'primary'"
            >
              <template #trailing>
                <button type="button" @click="showPassword = !showPassword"
                  class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                  <UIcon :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                </button>
              </template>
            </UInput>
            <p v-if="errorsPassword.current_password" class="text-xs text-red-500">
              {{ errorsPassword.current_password[0] }}
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 tracking-wide">
                {{ $t('info_compte.field_new_password') }}
              </label>
              <UInput
                v-model="passwords.password"
                :type="showPassNew1 ? 'text' : 'password'"
                icon="i-heroicons-lock-closed"
                :placeholder="$t('info_compte.field_new_password_placeholder')"
                size="lg"
                block
                :color="errorsPassword.password ? 'error' : 'primary'"
              >
                <template #trailing>
                  <button type="button" @click="showPassNew1 = !showPassNew1"
                    class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                    <UIcon :name="showPassNew1 ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                  </button>
                </template>
              </UInput>
              <p v-if="errorsPassword.password" class="text-xs text-red-500">
                {{ errorsPassword.password[0] }}
              </p>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-xs font-semibold text-gray-500 tracking-wide">
                {{ $t('info_compte.field_confirm_password') }}
              </label>
              <UInput
                v-model="passwords.password_confirmation"
                :type="showPassNew2 ? 'text' : 'password'"
                icon="i-heroicons-lock-closed"
                :placeholder="$t('info_compte.field_confirm_password_placeholder')"
                size="lg"
                block
              >
                <template #trailing>
                  <button type="button" @click="showPassNew2 = !showPassNew2"
                    class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                    <UIcon :name="showPassNew2 ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                  </button>
                </template>
              </UInput>
            </div>

          </div>

          <UButton type="submit" color="primary" variant="outline" size="lg" :loading="loadingPassword" icon="i-heroicons-key">
            {{ $t('info_compte.btn_change_password') }}
          </UButton>

        </form>
      </div>

    </template>
  </div>
</template>