<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import type { ToastProps } from '@nuxt/ui'

useHead({
  title: 'BRC Market',
  titleTemplate: (titleChunk) => titleChunk ? `${titleChunk} - Se connecter` : 'BRC Market',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
})

const toast    = useToast()
const router   = useRouter()
const route    = useRoute()

// ── Persistance session ──────────────────────────────────────────────────
// auth_token  : cookie HTTP (survit aux rechargements)
// auth_user   : useState (état réactif global Nuxt, partagé entre composants)
// auth_role   : cookie (accessible dans les middlewares SSR aussi)
const token    = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7 }) // 7 jours
const authRole = useCookie('auth_role',  { maxAge: 60 * 60 * 24 * 7 }) // 7 jours
const authUser = useState<any>('auth_user', () => null)

// ── Form state ────────────────────────────────────────────────────────────
const email    = ref('')
const password = ref('')
const loading  = ref(false)
const errors   = ref<Record<string, string[]>>({})

const handleLogin = async () => {
  loading.value = true
  errors.value  = {}

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/auth/login', {
      email:    email.value,
      password: password.value,
    }, {
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json',
      },
    })

    const { token: userToken, user } = response.data

    // 1. Stocker le token dans le cookie
    token.value = userToken

    // 2. Stocker le rôle dans un cookie dédié (accessible aux middlewares)
    authRole.value = user.role

    // 3. Stocker tout l'objet user dans useState (état réactif global)
    authUser.value = user

    toast.add({
      title:       'Connexion réussie !',
      description: `Bienvenue, ${user.first_name} !`,
      color:       'success',
      icon:        'i-heroicons-check-circle',
    } as ToastProps)

    // 4. Redirection après 800ms
    setTimeout(() => {
      // Si un paramètre ?redirect= existe, y retourner
      const redirect = route.query.redirect as string | undefined
      if (redirect) {
        router.push(redirect)
      } else if (user.role === 'super_admin' || user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/boutique')
      }
    }, 800)

  } catch (err: any) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors ?? {}
      toast.add({
        title:       'Erreur de validation',
        description: 'Vérifiez les champs du formulaire.',
        color:       'error',
        icon:        'i-heroicons-exclamation-triangle',
      } as ToastProps)

    } else if (err.response?.status === 401) {
      toast.add({
        title:       'Identifiants incorrects',
        description: err.response.data.message ?? 'Email ou mot de passe incorrect.',
        color:       'error',
        icon:        'i-heroicons-x-circle',
      } as ToastProps)

    } else if (err.response?.status === 403) {
      toast.add({
        title:       'Compte suspendu',
        description: err.response.data.message ?? 'Contactez le support.',
        color:       'error',
        icon:        'i-heroicons-no-symbol',
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
        description: `Une erreur est survenue : ${err.message}`,
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
    <UCard class="w-full max-w-md shadow-2xl rounded-2xl p-6">

      <!-- HEADER -->
      <div class="text-center mb-6">
        <UIcon name="i-heroicons-user-circle" class="w-16 h-16 text-gray-400" />
        <h1 class="text-2xl font-bold mt-2">Connexion à votre compte</h1>
        <p class="text-sm text-gray-500">Accédez à votre espace BRC Market</p>
      </div>

      <!-- FORM -->
      <form @submit.prevent="handleLogin" class="flex flex-col gap-3">

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

        <!-- PASSWORD -->
        <div class="flex flex-col gap-1">
          <UInput
            v-model="password"
            type="password"
            icon="i-heroicons-lock-closed"
            placeholder="Mot de passe"
            size="lg"
            block
            required
            :color="errors.password ? 'error' : 'primary'"
          />
          <p v-if="errors.password" class="text-xs text-red-500 ml-1">
            {{ errors.password[0] }}
          </p>
        </div>

        <!-- MOT DE PASSE OUBLIÉ -->
        <div class="flex justify-end -mt-1">
          <NuxtLink to="/forgot-password" class="text-sm text-red-600 hover:underline">
            Mot de passe oublié ?
          </NuxtLink>
        </div>

        <!-- SUBMIT -->
        <UButton
          type="submit"
          color="error"
          size="lg"
          block
          :loading="loading"
          icon="i-heroicons-arrow-right-on-rectangle"
        >
          Se connecter
        </UButton>

      </form>

      <!-- LIEN INSCRIPTION -->
      <div class="text-center mt-5 text-sm">
        <span class="text-gray-500">Pas encore de compte ?</span>
        <NuxtLink to="/register" class="text-red-600 font-medium hover:underline ml-1">
          Créer un compte
        </NuxtLink>
      </div>

    </UCard>
  </UContainer>
</template>