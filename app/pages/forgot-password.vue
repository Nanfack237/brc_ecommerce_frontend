<script setup lang="ts">
import axios from 'axios'
import type { ToastProps } from '@nuxt/ui'

const { t } = useI18n()
const toast  = useToast()
const config = useRuntimeConfig()
const API    = config.public.apiBase

useSeoMeta({
  title:       t('forgot_password.seo_title'),
  description: t('forgot_password.seo_description'),
  ogTitle:     t('forgot_password.seo_og_title'),
  ogUrl:       'https://brcmarket.cm/forgot-password',
  robots:      'noindex, nofollow',
})
useHead({ link: [{ rel: 'canonical', href: 'https://brcmarket.cm/forgot-password' }] })

const currentStep = ref(1)

const email       = ref('')
const loadingSend = ref(false)

const code        = ref('')
const loadingCode = ref(false)
const resendTimer = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

const newPassword        = ref('')
const confirmNewPassword = ref('')
const showNewPassword    = ref(false)
const showConfirmNew     = ref(false)
const loadingReset       = ref(false)

const passwordStrength = computed(() => {
  const p = newPassword.value
  if (!p) return { score: 0, label: '', color: '' }
  let score = 0
  if (p.length >= 8)           score++
  if (/[A-Z]/.test(p))         score++
  if (/[0-9]/.test(p))         score++
  if (/[^A-Za-z0-9]/.test(p))  score++
  const levels = [
    { score: 1, label: t('forgot_password.strength_weak'),      color: 'bg-red-500'    },
    { score: 2, label: t('forgot_password.strength_medium'),    color: 'bg-orange-400' },
    { score: 3, label: t('forgot_password.strength_good'),      color: 'bg-yellow-400' },
    { score: 4, label: t('forgot_password.strength_excellent'), color: 'bg-green-500'  },
  ]
  return levels[score - 1] ?? { score: 0, label: '', color: '' }
})

const passwordsMatch = computed(() =>
  confirmNewPassword.value.length > 0 && newPassword.value === confirmNewPassword.value
)

const startResendTimer = () => {
  resendTimer.value = 60
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0 && timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }, 1000)
}

const handleSendCode = async () => {
  loadingSend.value = true
  try {
    await axios.post(`${API}/auth/forgot-password`, { email: email.value }, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    })
    toast.add({
      title:       t('forgot_password.toast_sent_title'),
      description: t('forgot_password.toast_sent_desc', { email: email.value }),
      color: 'success', icon: 'i-heroicons-envelope',
    } as ToastProps)
    currentStep.value = 2
    startResendTimer()
  } catch (err: any) {
    if (err.response?.status === 404) {
      toast.add({ title: t('forgot_password.toast_404_title'), description: t('forgot_password.toast_404_desc'), color: 'error', icon: 'i-heroicons-x-circle' } as ToastProps)
    } else if (err.message === 'Network Error') {
      toast.add({ title: t('forgot_password.toast_network_title'), description: t('forgot_password.toast_network_desc'), color: 'error', icon: 'i-heroicons-signal-slash' } as ToastProps)
    } else {
      toast.add({ title: t('forgot_password.toast_error_title'), description: err.response?.data?.message ?? t('forgot_password.toast_error_desc'), color: 'error', icon: 'i-heroicons-exclamation-circle' } as ToastProps)
    }
  } finally {
    loadingSend.value = false
  }
}

const handleVerifyCode = async () => {
  loadingCode.value = true
  try {
    await axios.post(`${API}/auth/verify-reset-code`, {
      email: email.value,
      code:  code.value,
    }, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    })
    toast.add({
      title:       t('forgot_password.toast_verified_title'),
      description: t('forgot_password.toast_verified_desc'),
      color: 'success', icon: 'i-heroicons-check-circle',
    } as ToastProps)
    currentStep.value = 3
  } catch (err: any) {
    if (err.response?.status === 422) {
      toast.add({ title: t('forgot_password.toast_code_invalid_title'), description: err.response?.data?.message ?? t('forgot_password.toast_code_invalid_desc'), color: 'error', icon: 'i-heroicons-x-circle' } as ToastProps)
    } else if (err.message === 'Network Error') {
      toast.add({ title: t('forgot_password.toast_network_title'), description: t('forgot_password.toast_network_desc'), color: 'error', icon: 'i-heroicons-signal-slash' } as ToastProps)
    } else {
      toast.add({ title: t('forgot_password.toast_error_title'), description: err.response?.data?.message ?? t('forgot_password.toast_error_desc'), color: 'error', icon: 'i-heroicons-exclamation-circle' } as ToastProps)
    }
  } finally {
    loadingCode.value = false
  }
}

const handleResendCode = async () => {
  if (resendTimer.value > 0) return
  loadingSend.value = true
  try {
    await axios.post(`${API}/auth/forgot-password`, { email: email.value }, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    })
    toast.add({
      title:       t('forgot_password.toast_resent_title'),
      description: t('forgot_password.toast_resent_desc', { email: email.value }),
      color: 'success', icon: 'i-heroicons-envelope',
    } as ToastProps)
    code.value = ''
    startResendTimer()
  } catch (err: any) {
    toast.add({ title: t('forgot_password.toast_error_title'), description: err.response?.data?.message ?? t('forgot_password.toast_resend_error_desc'), color: 'error', icon: 'i-heroicons-exclamation-circle' } as ToastProps)
  } finally {
    loadingSend.value = false
  }
}

const handleResetPassword = async () => {
  if (!passwordsMatch.value) {
    toast.add({ title: t('forgot_password.toast_passwords_title'), description: t('forgot_password.toast_passwords_desc'), color: 'error', icon: 'i-heroicons-x-circle' } as ToastProps)
    return
  }
  loadingReset.value = true
  try {
    await axios.post(`${API}/auth/reset-password`, {
      email:                 email.value,
      code:                  code.value,
      password:              newPassword.value,
      password_confirmation: confirmNewPassword.value,
    }, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    })
    toast.add({
      title:       t('forgot_password.toast_reset_title'),
      description: t('forgot_password.toast_reset_desc'),
      color: 'success', icon: 'i-heroicons-check-circle',
    } as ToastProps)
    setTimeout(() => navigateTo('/login'), 1500)
  } catch (err: any) {
    if (err.response?.status === 422) {
      toast.add({ title: t('forgot_password.toast_error_title'), description: err.response?.data?.message ?? t('forgot_password.toast_validation_desc'), color: 'error', icon: 'i-heroicons-exclamation-triangle' } as ToastProps)
    } else if (err.message === 'Network Error') {
      toast.add({ title: t('forgot_password.toast_network_title'), description: t('forgot_password.toast_network_desc'), color: 'error', icon: 'i-heroicons-signal-slash' } as ToastProps)
    } else {
      toast.add({ title: t('forgot_password.toast_error_title'), description: err.response?.data?.message ?? t('forgot_password.toast_error_desc'), color: 'error', icon: 'i-heroicons-exclamation-circle' } as ToastProps)
    }
  } finally {
    loadingReset.value = false
  }
}
</script>

<template>
  <UContainer class="flex items-center justify-center py-8">
    <UCard class="w-full max-w-md shadow-2xl rounded-2xl p-6">

      <!-- HEADER -->
      <div class="text-center mb-6">
        <UIcon
          :name="currentStep === 3 ? 'i-heroicons-lock-open' : currentStep === 2 ? 'i-heroicons-shield-check' : 'i-heroicons-key'"
          class="w-16 h-16 text-gray-400"
        />
        <h1 class="text-2xl font-bold mt-2">
          {{ currentStep === 1 ? $t('forgot_password.header_title_1')
           : currentStep === 2 ? $t('forgot_password.header_title_2')
           : $t('forgot_password.header_title_3') }}
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          {{ currentStep === 1 ? $t('forgot_password.header_sub_1')
           : currentStep === 2 ? $t('forgot_password.header_sub_2', { email })
           : $t('forgot_password.header_sub_3') }}
        </p>
      </div>

      <!-- STEPPER -->
      <div class="flex items-center justify-center mb-6 relative">
        <div class="absolute top-4 left-[20%] right-[20%] h-0.5 bg-gray-200 z-0"></div>
        <div class="absolute top-4 left-[20%] h-0.5 bg-[#e60012] z-0 transition-all duration-500"
          :style="{ width: currentStep > 1 ? (currentStep > 2 ? '60%' : '30%') : '0%' }"></div>
        <div v-for="s in 3" :key="s" class="flex flex-col items-center z-10 flex-1">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300"
            :class="currentStep > s
              ? 'bg-[#e60012] border-[#e60012] text-white'
              : currentStep === s
                ? 'bg-white border-[#e60012] text-[#e60012]'
                : 'bg-white border-gray-200 text-gray-300'">
            <UIcon v-if="currentStep > s" name="i-heroicons-check" class="w-4 h-4" />
            <span v-else>{{ s }}</span>
          </div>
        </div>
      </div>

      <Transition name="slide" mode="out-in">

        <!-- STEP 1 : EMAIL -->
        <form v-if="currentStep === 1" key="s1" @submit.prevent="handleSendCode" class="flex flex-col gap-4">
          <UInput
            v-model="email"
            type="email"
            icon="i-heroicons-envelope"
            :placeholder="$t('forgot_password.field_email')"
            size="lg"
            block
            required
          />
          <UButton type="submit" color="error" size="lg" block :loading="loadingSend" icon="i-heroicons-paper-airplane">
            {{ $t('forgot_password.btn_send_code') }}
          </UButton>
        </form>

        <!-- STEP 2 : CODE -->
        <form v-else-if="currentStep === 2" key="s2" @submit.prevent="handleVerifyCode" class="flex flex-col gap-4">

          <div class="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-[#274a82] flex-shrink-0 mt-0.5" />
            <p class="text-xs text-gray-600">
              {{ $t('forgot_password.code_info', { email }) }}
            </p>
          </div>

          <UInput
            v-model="code"
            type="text"
            icon="i-heroicons-hashtag"
            :placeholder="$t('forgot_password.field_code')"
            size="lg"
            block
            required
            maxlength="6"
          />

          <UButton type="submit" color="error" size="lg" block :loading="loadingCode" icon="i-heroicons-shield-check">
            {{ $t('forgot_password.btn_verify_code') }}
          </UButton>

          <div class="text-center text-sm">
            <span class="text-gray-400">{{ $t('forgot_password.resend_label') }} </span>
            <button type="button" @click="handleResendCode" :disabled="resendTimer > 0 || loadingSend"
              class="font-bold transition-colors"
              :class="resendTimer > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:underline'">
              {{ resendTimer > 0 ? $t('forgot_password.resend_timer', { seconds: resendTimer }) : $t('forgot_password.resend_btn') }}
            </button>
          </div>

          <button type="button" @click="currentStep = 1"
            class="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600 font-bold transition-colors">
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
            {{ $t('forgot_password.change_email') }}
          </button>
        </form>

        <!-- STEP 3 : NOUVEAU MOT DE PASSE -->
        <form v-else key="s3" @submit.prevent="handleResetPassword" class="flex flex-col gap-4">

          <div class="flex flex-col gap-1">
            <UInput v-model="newPassword" :type="showNewPassword ? 'text' : 'password'"
              icon="i-heroicons-lock-closed" :placeholder="$t('forgot_password.field_new_password')"
              size="lg" block required>
              <template #trailing>
                <button type="button" @click="showNewPassword = !showNewPassword"
                  class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                  <UIcon :name="showNewPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                </button>
              </template>
            </UInput>
            <div v-if="newPassword" class="flex gap-1 mt-1 px-1">
              <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-all duration-300"
                :class="i <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'" />
            </div>
            <p v-if="newPassword" class="text-xs ml-1" :class="{
              'text-red-500':    passwordStrength.score === 1,
              'text-orange-400': passwordStrength.score === 2,
              'text-yellow-500': passwordStrength.score === 3,
              'text-green-500':  passwordStrength.score === 4,
            }">
              {{ $t('forgot_password.password_strength', { label: passwordStrength.label }) }}
            </p>
          </div>

          <div class="flex flex-col gap-1">
            <UInput v-model="confirmNewPassword" :type="showConfirmNew ? 'text' : 'password'"
              icon="i-heroicons-lock-closed" :placeholder="$t('forgot_password.field_confirm_password')"
              size="lg" block required
              :color="confirmNewPassword && passwordsMatch ? 'success' : 'primary'">
              <template #trailing>
                <button type="button" @click="showConfirmNew = !showConfirmNew"
                  class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                  <UIcon :name="showConfirmNew ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                </button>
              </template>
            </UInput>
            <p v-if="confirmNewPassword && passwordsMatch" class="text-xs text-green-500 font-medium ml-1">
              {{ $t('forgot_password.passwords_match') }}
            </p>
            <p v-else-if="confirmNewPassword && !passwordsMatch" class="text-xs text-red-500 ml-1">
              {{ $t('forgot_password.passwords_no_match') }}
            </p>
          </div>

          <UButton type="submit" color="error" size="lg" block :loading="loadingReset" :disabled="!passwordsMatch" icon="i-heroicons-check-circle">
            {{ $t('forgot_password.btn_reset') }}
          </UButton>

        </form>

      </Transition>

      <!-- LIEN CONNEXION -->
      <div v-if="currentStep === 1" class="text-center mt-5 text-sm">
        <span class="text-gray-500">{{ $t('forgot_password.back_to_login') }}</span>
        <NuxtLink to="/login" class="text-red-600 font-medium hover:underline ml-1">
          {{ $t('forgot_password.login_link') }}
        </NuxtLink>
      </div>

    </UCard>
  </UContainer>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.slide-enter-from { opacity: 0; transform: translateX(20px);  }
.slide-leave-to   { opacity: 0; transform: translateX(-20px); }
</style>