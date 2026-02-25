<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-white p-4">
    <img src="/brclogo.png" class="h-20 mb-6" />
    <h1 class="text-6xl font-black text-[#274a82] mb-2">404</h1>
    <p class="text-xl text-gray-600 mb-8">Oups ! Cette page est introuvable.</p>
    
    <div class="flex gap-4">
      <UButton to="/" color="primary" size="lg">Accueil</UButton>
      <UButton to="/boutique" variant="outline" size="lg">Voir la boutique</UButton>
    </div>
  </div>
</template>

<script setup>
// Ce script permet de "nettoyer" l'erreur quand l'utilisateur clique sur un lien
const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })
</script>