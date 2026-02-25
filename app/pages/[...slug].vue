<template>
  <UContainer class="py-20 flex flex-col items-center">
    <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-500 mb-4" />
    <h2 class="text-3xl font-bold text-gray-900 mb-2">Page non trouvée</h2>
    <p class="text-gray-500 mb-8 text-center max-w-md">
      Il semble que le lien soit erroné ou que la catégorie ait été déplacée.
    </p>
    
    <div class="grid grid-cols-2 gap-4 w-full max-w-sm">
      <UButton to="/boutique" block class="bg-[#274a82]">Aller à la boutique</UButton>
      <UButton to="/" block class="bg-[#e60012]">Retourner à l'accueil</UButton>
    </div>
  </UContainer>
</template>