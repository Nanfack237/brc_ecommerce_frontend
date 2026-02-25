<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
    <div class="flex flex-col items-center gap-4">
      <!-- Spinner Nuxt UI -->
      <USpinner size="lg" class="text-[#274a82]" />

      <!-- Dots animés -->
      <div class="flex gap-1">
        <span class="dot bg-[#274a82]"></span>
        <span class="dot bg-[#ff4d4f]"></span>
        <span class="dot bg-[#274a82]"></span>
      </div>

      <p class="text-md font-bold text-[#274a82]">
        Business Revolution Company
      </p>
      <span class="text-xs italic text-gray-500">
        Un Africain, un Ordinateur
      </span>
    </div>
  </div>
</template>

<style scoped>
.dot {
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  animation: bounce 1.4s infinite ease-in-out;
}
.dot:nth-child(2) { animation-delay: 0.2s }
.dot:nth-child(3) { animation-delay: 0.4s }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>
