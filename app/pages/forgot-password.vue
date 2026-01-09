<template>
  <UContainer class="min-h-screen flex items-center justify-center">
    <UCard class="w-full max-w-xl shadow-2xl rounded-2xl my-10 p-8 ">

      <!-- HEADER -->
      <div class="text-center mb-6">
        <UIcon name="i-heroicons-lock-open" class="w-20 h-20 text-gray-400" />
        <h1 class="text-3xl font-bold">
          Mot de passe oublié
        </h1>
        <p class="text-sm text-gray-500">
          Entrez votre email ou numéro de téléphone pour réinitialiser votre mot de passe
        </p>
      </div>

      <!-- TOGGLE -->
      <div class="flex gap-2 mb-6">
        <UButton
          block
          :variant="recoveryMethod === 'email' ? 'solid' : 'soft'"
          color="error"
          icon="i-heroicons-envelope"
          @click="recoveryMethod = 'email'"
        >
          Email
        </UButton>

        <UButton
          block
          :variant="recoveryMethod === 'phone' ? 'solid' : 'soft'"
          color="error"
          icon="i-heroicons-device-phone-mobile"
          @click="recoveryMethod = 'phone'"
        >
          Téléphone
        </UButton>
      </div>

      <!-- FORM -->
      <form @submit.prevent="handleRecovery" class="space-y-4 flex flex-col gap-2">

        <!-- EMAIL -->
        <UInput
          v-if="recoveryMethod === 'email'"
          v-model="email"
          type="email"
          icon="i-heroicons-envelope"
          placeholder="Adresse email"
          size="lg"
         
          required
        />

        <!-- PHONE -->
        <UInput
          v-if="recoveryMethod === 'phone'"
          v-model="phone"
          type="tel"
          icon="i-heroicons-device-phone-mobile"
          placeholder="Numéro de téléphone"
          size="lg"
          block
          required
        />

        <!-- SUBMIT -->
        <UButton
          type="submit"
          color="error"
          size="lg"
          block
          :loading="loading"
          icon="i-heroicons-arrow-right-on-rectangle"
        >
          Envoyer le lien
        </UButton>

      </form>

      <!-- BACK TO LOGIN -->
      <div class="text-center mt-6 text-sm">
        <span class="text-gray-500">
          Vous vous souvenez de votre mot de passe ?
        </span>
        <NuxtLink
          to="/login"
          class="text-red-600 font-medium hover:underline ml-1"
        >
          Se connecter
        </NuxtLink>
      </div>

    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/* Toggle method */
const recoveryMethod = ref<'email' | 'phone'>('email')

/* Form data */
const email = ref('')
const phone = ref('')
const loading = ref(false)

/* Submit */
const handleRecovery = async () => {
  loading.value = true

  const payload =
    recoveryMethod.value === 'email'
      ? { email: email.value }
      : { phone: phone.value }

  console.log('RECOVERY PAYLOAD:', payload)

  setTimeout(() => {
    loading.value = false
    alert('Un lien de réinitialisation a été envoyé !')
  }, 1500)
}
</script>
