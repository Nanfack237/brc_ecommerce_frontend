<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'BRC Market',
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Se connecter` : 'BRC Market';
  },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

const loginMethod = ref<'email' | 'phone'>('email')
const email = ref('')
const phone = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  const payload =
    loginMethod.value === 'email'
      ? { email: email.value, password: password.value }
      : { phone: phone.value, password: password.value }

  console.log('LOGIN PAYLOAD:', payload)
  setTimeout(() => { loading.value = false }, 1500)
}
</script>

<template>
  <!-- min-h retire la hauteur écran complète, py-8 donne juste ce qu'il faut -->
  <UContainer class="flex items-center justify-center py-8">
    <UCard class="w-full max-w-md shadow-2xl rounded-2xl p-6">

      <!-- HEADER -->
      <div class="text-center mb-6">
        <UIcon name="i-heroicons-user-circle" class="w-16 h-16 text-gray-400" />
        <h1 class="text-2xl font-bold mt-2">Connexion à votre compte</h1>
        <p class="text-sm text-gray-500">Accédez à votre espace BRC Market</p>
      </div>

      <!-- TOGGLE -->
      <div class="flex gap-2 mb-5">
        <UButton
          block
          :variant="loginMethod === 'email' ? 'solid' : 'soft'"
          color="error"
          icon="i-heroicons-envelope"
          @click="loginMethod = 'email'"
        >
          Email
        </UButton>
        <UButton
          block
          :variant="loginMethod === 'phone' ? 'solid' : 'soft'"
          color="error"
          icon="i-heroicons-device-phone-mobile"
          @click="loginMethod = 'phone'"
        >
          Téléphone
        </UButton>
      </div>

      <!-- FORM -->
      <form @submit.prevent="handleLogin" class="flex flex-col gap-3">

        <UInput
          v-if="loginMethod === 'email'"
          v-model="email"
          type="email"
          icon="i-heroicons-envelope"
          placeholder="Adresse email"
          size="lg"
          block
          required
        />

        <UInput
          v-if="loginMethod === 'phone'"
          v-model="phone"
          type="tel"
          icon="i-heroicons-device-phone-mobile"
          placeholder="Numéro de téléphone"
          size="lg"
          block
          required
        />

        <UInput
          v-model="password"
          type="password"
          icon="i-heroicons-lock-closed"
          placeholder="Mot de passe"
          size="lg"
          block
          required
        />

        <div class="flex justify-end -mt-1">
          <NuxtLink to="/forgot-password" class="text-sm text-red-600 hover:underline">
            Mot de passe oublié ?
          </NuxtLink>
        </div>

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

      <!-- REGISTER -->
      <div class="text-center mt-5 text-sm">
        <span class="text-gray-500">Pas encore de compte ?</span>
        <NuxtLink to="/register" class="text-red-600 font-medium hover:underline ml-1">
          Créer un compte
        </NuxtLink>
      </div>

    </UCard>
  </UContainer>
</template>