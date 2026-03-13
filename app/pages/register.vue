<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import type { ToastProps } from '@nuxt/ui'

useHead({
  title: 'BRC Market',
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Créer un Compte` : 'BRC Market'
  },
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
})

const toast = useToast()

const firstName       = ref('')
const lastName        = ref('')
const email           = ref('')
const phone           = ref('')
const password        = ref('')
const confirmPassword = ref('')
const loading         = ref(false)
const errors          = ref<Record<string, string[]>>({})

const router = useRouter()
const token  = useCookie('auth_token')

// Password strength
const passwordStrength = computed(() => {
  const p = password.value
  if (!p) return { score: 0, label: '', color: '' }
  let score = 0
  if (p.length >= 8)           score++
  if (/[A-Z]/.test(p))         score++
  if (/[0-9]/.test(p))         score++
  if (/[^A-Za-z0-9]/.test(p))  score++
  const levels = [
    { score: 1, label: 'Faible',    color: 'bg-red-500' },
    { score: 2, label: 'Moyen',     color: 'bg-orange-400' },
    { score: 3, label: 'Bon',       color: 'bg-yellow-400' },
    { score: 4, label: 'Excellent', color: 'bg-green-500' },
  ]
  return levels[score - 1] ?? { score: 0, label: '', color: '' }
})

const passwordsMatch = computed(() =>
  confirmPassword.value.length > 0 && password.value === confirmPassword.value
)

const handleRegister = async () => {
  errors.value = {}

  if (password.value !== confirmPassword.value) {
    errors.value = { confirmPassword: ['Les mots de passe ne correspondent pas.'] }
    toast.add({
      title:       'Erreur',
      description: 'Les mots de passe ne correspondent pas.',
      color:       'error',
      icon:        'i-heroicons-x-circle',
    } as ToastProps)
    return
  }

  loading.value = true

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/auth/register', {
      first_name:            firstName.value,
      last_name:             lastName.value,
      email:                 email.value,
      phone:                 phone.value,
      password:              password.value,
      password_confirmation: confirmPassword.value,
    }, {
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json',
      },
    })

    token.value = response.data.token

    toast.add({
      title:       '🎉 Compte créé avec succès !',
      description: `Bienvenue sur BRC Market, ${response.data.user.first_name} ${response.data.user.last_name} !`,
      color:       'success',
      icon:        'i-heroicons-check-circle',
    } as ToastProps)

    setTimeout(() => router.push('/boutique'), 1500)

  } catch (err: any) {
    console.log('STATUS:', err.response?.status)
    console.log('DATA:',   err.response?.data)

    if (err.response?.status === 422) {
      errors.value = err.response.data.errors ?? {}
      const firstError = Object.values(errors.value)[0]?.[0]
      toast.add({
        title:       'Erreur de validation',
        description: firstError ?? 'Vérifiez les champs du formulaire.',
        color:       'error',
        icon:        'i-heroicons-exclamation-triangle',
      } as ToastProps)

    } else if (err.message === 'Network Error') {
      toast.add({
        title:       'Serveur inaccessible',
        description: 'Vérifiez que Laravel est démarré.',
        color:       'error',
        icon:        'i-heroicons-signal-slash',
      } as ToastProps)

    } else {
      toast.add({
        title:       'Erreur',
        description: err.response?.data?.message ?? 'Une erreur est survenue.',
        color:       'error',
        icon:        'i-heroicons-exclamation-circle',
      } as ToastProps)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="flex items-center justify-center py-8">
    <UCard class="w-full max-w-2xl shadow-2xl rounded-2xl p-6">

      <!-- HEADER -->
      <div class="text-center mb-6">
        <UIcon name="i-heroicons-user-plus" class="w-16 h-16 text-gray-400" />
        <h1 class="text-2xl font-bold mt-2">Créer un compte</h1>
        <p class="text-sm text-gray-500">Rejoignez BRC Market dès aujourd'hui !</p>
      </div>

      <!-- FORM -->
      <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

          <!-- FIRST NAME -->
          <div class="flex flex-col gap-1">
            <UInput
              v-model="firstName"
              type="text"
              icon="i-heroicons-user"
              placeholder="Prénom"
              size="lg"
              block
              required
              :color="errors.first_name ? 'error' : 'primary'"
            />
            <p v-if="errors.first_name" class="text-xs text-red-500 ml-1">
              {{ errors.first_name[0] }}
            </p>
          </div>

          <!-- LAST NAME -->
          <div class="flex flex-col gap-1">
            <UInput
              v-model="lastName"
              type="text"
              icon="i-heroicons-user"
              placeholder="Nom de famille"
              size="lg"
              block
              required
              :color="errors.last_name ? 'error' : 'primary'"
            />
            <p v-if="errors.last_name" class="text-xs text-red-500 ml-1">
              {{ errors.last_name[0] }}
            </p>
          </div>

          <!-- EMAIL -->
          <div class="flex flex-col gap-1">
            <UInput
              v-model="email"
              type="email"
              icon="i-heroicons-envelope"
              placeholder="Adresse email"
              size="lg"
              block
              required
              :color="errors.email ? 'error' : 'primary'"
            />
            <p v-if="errors.email" class="text-xs text-red-500 ml-1">
              {{ errors.email[0] }}
            </p>
          </div>

          <!-- PHONE -->
          <div class="flex flex-col gap-1">
            <UInput
              v-model="phone"
              type="tel"
              icon="i-heroicons-device-phone-mobile"
              placeholder="Numéro de téléphone"
              size="lg"
              block
              :color="errors.phone ? 'error' : 'primary'"
            />
            <p v-if="errors.phone" class="text-xs text-red-500 ml-1">
              {{ errors.phone[0] }}
            </p>
          </div>

          <!-- PASSWORD -->
          <div class="flex flex-col gap-1">
            <UInput
              v-model="password"
              type="password"
              icon="i-heroicons-lock-closed"
              placeholder="Mot de passe (min. 8 caractères)"
              size="lg"
              block
              required
              :color="errors.password ? 'error' : 'primary'"
            />
            <!-- Strength bar -->
            <div v-if="password" class="flex gap-1 mt-1 px-1">
              <div
                v-for="i in 4" :key="i"
                class="h-1 flex-1 rounded-full transition-all duration-300"
                :class="i <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'"
              />
            </div>
            <p v-if="password" class="text-xs ml-1" :class="{
              'text-red-500':    passwordStrength.score === 1,
              'text-orange-400': passwordStrength.score === 2,
              'text-yellow-500': passwordStrength.score === 3,
              'text-green-500':  passwordStrength.score === 4,
            }">
              Force : {{ passwordStrength.label }}
            </p>
            <p v-if="errors.password" class="text-xs text-red-500 ml-1">
              {{ errors.password[0] }}
            </p>
          </div>

          <!-- CONFIRM PASSWORD -->
          <div class="flex flex-col gap-1">
            <UInput
              v-model="confirmPassword"
              type="password"
              icon="i-heroicons-lock-closed"
              placeholder="Confirmer le mot de passe"
              size="lg"
              block
              required
              :color="errors.confirmPassword ? 'error' : confirmPassword && passwordsMatch ? 'success' : 'primary'"
            />
            <p v-if="confirmPassword && passwordsMatch" class="text-xs text-green-500 font-medium ml-1">
              ✓ Les mots de passe correspondent
            </p>
            <p v-else-if="confirmPassword && !passwordsMatch" class="text-xs text-red-500 ml-1">
              ✗ Les mots de passe ne correspondent pas
            </p>
            <p v-if="errors.confirmPassword" class="text-xs text-red-500 ml-1">
              {{ errors.confirmPassword[0] }}
            </p>
          </div>

        </div>

        <!-- SUBMIT -->
        <UButton
          type="submit"
          color="error"
          size="lg"
          block
          :loading="loading"
          icon="i-heroicons-user-plus"
        >
          Créer mon compte
        </UButton>
      </form>

      <!-- LOGIN LINK -->
      <div class="text-center mt-5 text-sm">
        <span class="text-gray-500">Vous avez déjà un compte ?</span>
        <NuxtLink to="/login" class="text-red-600 font-medium hover:underline ml-1">
          Se connecter
        </NuxtLink>
      </div>

    </UCard>
  </UContainer>
</template>