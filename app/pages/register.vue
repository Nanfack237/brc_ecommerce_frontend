<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'BRC Market',
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Creer un Compte` : 'BRC Market';
  },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

const fullName = ref('')
const email = ref('')
const country = ref('')
const city = ref('')
const address = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    alert('Les mots de passe ne correspondent pas !')
    return
  }
  loading.value = true
  const payload = {
    fullName: fullName.value,
    email: email.value,
    country: country.value,
    city: city.value,
    address: address.value,
    phone: phone.value,
    password: password.value,
  }
  console.log('REGISTER PAYLOAD:', payload)
  setTimeout(() => { loading.value = false }, 1500)
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
      <form @submit.prevent="handleRegister" class="flex flex-col gap-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UInput v-model="fullName" type="text" icon="i-heroicons-user" placeholder="Nom complet" size="lg" block required />
          <UInput v-model="email" type="email" icon="i-heroicons-envelope" placeholder="Adresse email" size="lg" block required />
          <UInput v-model="country" type="text" icon="i-heroicons-globe-alt" placeholder="Pays" size="lg" block required />
          <UInput v-model="city" type="text" icon="i-heroicons-building-office" placeholder="Ville" size="lg" block required />
          <UInput v-model="address" type="text" icon="i-heroicons-home" placeholder="Adresse" size="lg" block required />
          <UInput v-model="phone" type="tel" icon="i-heroicons-device-phone-mobile" placeholder="Numéro de téléphone" size="lg" block required />
          <UInput v-model="password" type="password" icon="i-heroicons-lock-closed" placeholder="Mot de passe" size="lg" block required />
          <UInput v-model="confirmPassword" type="password" icon="i-heroicons-lock-closed" placeholder="Confirmer le mot de passe" size="lg" block required />
        </div>

        <UButton type="submit" color="error" size="lg" block :loading="loading" icon="i-heroicons-user-plus">
          Créer un compte
        </UButton>
      </form>

      <!-- LOGIN LINK -->
      <div class="text-center mt-5 text-sm">
        <span class="text-gray-500">Vous avez déjà un compte ?</span>
        <NuxtLink to="/login" class="text-red-600 font-medium hover:underline ml-1">Se connecter</NuxtLink>
      </div>

    </UCard>
  </UContainer>
</template>