<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import type { ToastProps } from '@nuxt/ui'

useSeoMeta({
  title:       'Mot de Passe Oublié',
  description: 'Réinitialisez votre mot de passe BRC Market en quelques étapes simples.',
  ogTitle:     'Mot de Passe Oublié - BRC Market',
  ogUrl:       'https://brcmarket.cm/forgot-password',
  robots:      'noindex, nofollow',
})
useHead({ link: [{ rel: 'canonical', href: 'https://brcmarket.cm/forgot-password' }] })

const toast  = useToast()
const config = useRuntimeConfig()
const API    = config.public.apiBase

// ── Steps : 1 = email, 2 = code, 3 = nouveau mdp ─────────────────────────
const currentStep = ref(1)

// ── Step 1 ────────────────────────────────────────────────────────────────
const email       = ref('')
const loadingSend = ref(false)

// ── Step 2 ────────────────────────────────────────────────────────────────
const code        = ref('')
const loadingCode = ref(false)
const resendTimer = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

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

// ── Step 3 ────────────────────────────────────────────────────────────────
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
    { score: 1, label: 'Faible',    color: 'bg-red-500'    },
    { score: 2, label: 'Moyen',     color: 'bg-orange-400' },
    { score: 3, label: 'Bon',       color: 'bg-yellow-400' },
    { score: 4, label: 'Excellent', color: 'bg-green-500'  },
  ]
  return levels[score - 1] ?? { score: 0, label: '', color: '' }
})

const passwordsMatch = computed(() =>
  confirmNewPassword.value.length > 0 && newPassword.value === confirmNewPassword.value
)

// ── Step 1 : Envoyer le code ──────────────────────────────────────────────
const handleSendCode = async () => {
  loadingSend.value = true
  try {
    await axios.post(`${API}/auth/forgot-password`, { email: email.value }, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    })
    toast.add({
      title:       'Code envoyé !',
      description: `Un code de vérification a été envoyé à ${email.value}.`,
      color:       'success',
      icon:        'i-heroicons-envelope',
    } as ToastProps)
    currentStep.value = 2
    startResendTimer()
  } catch (err: any) {
    if (err.response?.status === 404) {
      toast.add({ title: 'Email introuvable', description: 'Aucun compte associé à cet email.', color: 'error', icon: 'i-heroicons-x-circle' } as ToastProps)
    } else if (err.message === 'Network Error') {
      toast.add({ title: 'Serveur inaccessible', description: 'Vérifiez que Laravel est démarré.', color: 'error', icon: 'i-heroicons-signal-slash' } as ToastProps)
    } else {
      toast.add({ title: 'Erreur', description: err.response?.data?.message ?? 'Une erreur est survenue.', color: 'error', icon: 'i-heroicons-exclamation-circle' } as ToastProps)
    }
  } finally {
    loadingSend.value = false
  }
}

// ── Step 2 : Vérifier le code ─────────────────────────────────────────────
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
      title:       'Code vérifié !',
      description: 'Définissez maintenant votre nouveau mot de passe.',
      color:       'success',
      icon:        'i-heroicons-check-circle',
    } as ToastProps)
    currentStep.value = 3
  } catch (err: any) {
    if (err.response?.status === 422) {
      toast.add({ title: 'Code invalide', description: err.response?.data?.message ?? 'Code incorrect ou expiré.', color: 'error', icon: 'i-heroicons-x-circle' } as ToastProps)
    } else if (err.message === 'Network Error') {
      toast.add({ title: 'Serveur inaccessible', description: 'Vérifiez que Laravel est démarré.', color: 'error', icon: 'i-heroicons-signal-slash' } as ToastProps)
    } else {
      toast.add({ title: 'Erreur', description: err.response?.data?.message ?? 'Une erreur est survenue.', color: 'error', icon: 'i-heroicons-exclamation-circle' } as ToastProps)
    }
  } finally {
    loadingCode.value = false
  }
}

// ── Renvoyer le code ──────────────────────────────────────────────────────
const handleResendCode = async () => {
  if (resendTimer.value > 0) return
  loadingSend.value = true
  try {
    await axios.post(`${API}/auth/forgot-password`, { email: email.value }, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    })
    toast.add({
      title:       'Code renvoyé !',
      description: `Un nouveau code a été envoyé à ${email.value}.`,
      color:       'success',
      icon:        'i-heroicons-envelope',
    } as ToastProps)
    code.value = ''
    startResendTimer()
  } catch (err: any) {
    toast.add({ title: 'Erreur', description: err.response?.data?.message ?? 'Impossible de renvoyer le code.', color: 'error', icon: 'i-heroicons-exclamation-circle' } as ToastProps)
  } finally {
    loadingSend.value = false
  }
}

// ── Step 3 : Réinitialiser ────────────────────────────────────────────────
const handleResetPassword = async () => {
  if (!passwordsMatch.value) {
    toast.add({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', color: 'error', icon: 'i-heroicons-x-circle' } as ToastProps)
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
      title:       'Mot de passe modifié !',
      description: 'Vous pouvez maintenant vous connecter.',
      color:       'success',
      icon:        'i-heroicons-check-circle',
    } as ToastProps)
    setTimeout(() => navigateTo('/login'), 1500)
  } catch (err: any) {
    if (err.response?.status === 422) {
      toast.add({ title: 'Erreur', description: err.response?.data?.message ?? 'Vérifiez les champs.', color: 'error', icon: 'i-heroicons-exclamation-triangle' } as ToastProps)
    } else if (err.message === 'Network Error') {
      toast.add({ title: 'Serveur inaccessible', description: 'Vérifiez que Laravel est démarré.', color: 'error', icon: 'i-heroicons-signal-slash' } as ToastProps)
    } else {
      toast.add({ title: 'Erreur', description: err.response?.data?.message ?? 'Une erreur est survenue.', color: 'error', icon: 'i-heroicons-exclamation-circle' } as ToastProps)
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
          {{ currentStep === 1 ? 'Mot de passe oublié'
           : currentStep === 2 ? 'Vérification du code'
           : 'Nouveau mot de passe' }}
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          {{ currentStep === 1 ? 'Entrez votre email pour recevoir un code'
           : currentStep === 2 ? `Code envoyé à ${email}`
           : 'Choisissez un nouveau mot de passe sécurisé' }}
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

        <!-- ══ STEP 1 : EMAIL ══ -->
        <form v-if="currentStep === 1" key="s1" @submit.prevent="handleSendCode" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <UInput
              v-model="email"
              type="email"
              icon="i-heroicons-envelope"
              placeholder="Adresse email"
              size="lg"
              block
              required
            />
          </div>
          <UButton type="submit" color="error" size="lg" block :loading="loadingSend" icon="i-heroicons-paper-airplane">
            Envoyer le code
          </UButton>
          
        </form>

        <!-- ══ STEP 2 : CODE ══ -->
        <form v-else-if="currentStep === 2" key="s2" @submit.prevent="handleVerifyCode" class="flex flex-col gap-4">

          <div class="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-[#274a82] flex-shrink-0 mt-0.5" />
            <p class="text-xs text-gray-600">
              Vérifiez votre boîte mail <strong class="text-[#274a82]">{{ email }}</strong> et entrez le code à 6 chiffres reçu.
            </p>
          </div>

          <UInput
            v-model="code"
            type="text"
            icon="i-heroicons-hashtag"
            placeholder="• • • • • •"
            size="lg"
            block
            required
            maxlength="6"
          />

          <UButton type="submit" color="error" size="lg" block :loading="loadingCode" icon="i-heroicons-shield-check">
            Vérifier le code
          </UButton>

          <div class="text-center text-sm">
            <span class="text-gray-400">Pas reçu ? </span>
            <button type="button" @click="handleResendCode" :disabled="resendTimer > 0 || loadingSend"
              class="font-bold transition-colors"
              :class="resendTimer > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:underline'">
              {{ resendTimer > 0 ? `Renvoyer dans ${resendTimer}s` : 'Renvoyer le code' }}
            </button>
          </div>

          <button type="button" @click="currentStep = 1"
            class="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600 font-bold transition-colors">
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
            Changer d'email
          </button>
        </form>

        <!-- ══ STEP 3 : NOUVEAU MOT DE PASSE ══ -->
        <form v-else key="s3" @submit.prevent="handleResetPassword" class="flex flex-col gap-4">

          <div class="flex flex-col gap-1">
            <UInput v-model="newPassword" :type="showNewPassword ? 'text' : 'password'"
              icon="i-heroicons-lock-closed" placeholder="Nouveau mot de passe" size="lg" block required>
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
              'text-red-500': passwordStrength.score === 1,
              'text-orange-400': passwordStrength.score === 2,
              'text-yellow-500': passwordStrength.score === 3,
              'text-green-500': passwordStrength.score === 4,
            }">Force : {{ passwordStrength.label }}</p>
          </div>

          <div class="flex flex-col gap-1">
            <UInput v-model="confirmNewPassword" :type="showConfirmNew ? 'text' : 'password'"
              icon="i-heroicons-lock-closed" placeholder="Confirmer le mot de passe" size="lg" block required
              :color="confirmNewPassword && passwordsMatch ? 'success' : 'primary'">
              <template #trailing>
                <button type="button" @click="showConfirmNew = !showConfirmNew"
                  class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                  <UIcon :name="showConfirmNew ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-4 h-4" />
                </button>
              </template>
            </UInput>
            <p v-if="confirmNewPassword && passwordsMatch" class="text-xs text-green-500 font-medium ml-1">✓ Les mots de passe correspondent</p>
            <p v-else-if="confirmNewPassword && !passwordsMatch" class="text-xs text-red-500 ml-1">✗ Les mots de passe ne correspondent pas</p>
          </div>

          <UButton type="submit" color="error" size="lg" block :loading="loadingReset" :disabled="!passwordsMatch" icon="i-heroicons-check-circle">
            Réinitialiser le mot de passe
          </UButton>

        </form>

      </Transition>

      <!-- LIEN CONNEXION -->
      <div v-if="currentStep === 1" class="text-center mt-5 text-sm">
        <span class="text-gray-500">Vous vous souvenez de votre mot de passe ?</span>
        <NuxtLink to="/login" class="text-red-600 font-medium hover:underline ml-1">Se connecter</NuxtLink>
      </div>

    </UCard>
  </UContainer>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.slide-enter-from { opacity: 0; transform: translateX(20px);  }
.slide-leave-to   { opacity: 0; transform: translateX(-20px); }
</style>