<script setup lang="ts">
import { ref, computed } from 'vue'

/* Toggle login method */
const loginMethod = ref<'email' | 'phone'>('email')

/* Form data */
const email = ref('')
const phone = ref('')
const password = ref('')
const loading = ref(false)

/* Submit */
const handleLogin = async () => {
  loading.value = true

  const payload =
    loginMethod.value === 'email'
      ? { email: email.value, password: password.value }
      : { phone: phone.value, password: password.value }

  console.log('LOGIN PAYLOAD:', payload)

  // 🔗 API call later
  // await $fetch('/api/login', { method: 'POST', body: payload })

  setTimeout(() => {
    loading.value = false
  }, 1500)
}
</script>

<template>
  <UContainer class="min-h-screen flex items-center justify-center">
    <UCard class="w-full max-w-md shadow-2xl my-10 rounded-2xl p-6">

      <!-- HEADER -->
      <div class="text-center mb-6">
        <UIcon name="i-heroicons-user-circle" class="w-20 h-20 text-gray-400" />
        <h1 class="text-2xl font-bold">
          Connexion à votre compte
        </h1>
        <p class="text-sm text-gray-500">
          Accédez à votre espace BRC Market
        </p>
      </div>

      <!-- TOGGLE -->
      <div class="flex gap-2 mb-6">
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
      <form @submit.prevent="handleLogin" class="space-y-4 flex flex-col gap-2">

        <!-- EMAIL -->
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

        <!-- PHONE -->
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

        <!-- PASSWORD -->
        <UInput
          v-model="password"
          type="password"
          icon="i-heroicons-lock-closed"
          placeholder="Mot de passe"
          size="lg"
          block
          required
        />

        <!-- FORGOT -->
        <div class="flex justify-end">
          <NuxtLink
            to="/forgot-password"
            class="text-sm text-red-600 hover:underline"
          >
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

      <!-- REGISTER -->
      <div class="text-center mt-6 text-sm">
        <span class="text-gray-500">
          Pas encore de compte ?
        </span>
        <NuxtLink
          to="/register"
          class="text-red-600 font-medium hover:underline ml-1"
        >
          Créer un compte
        </NuxtLink>
      </div>

    </UCard>
  </UContainer>
</template>
