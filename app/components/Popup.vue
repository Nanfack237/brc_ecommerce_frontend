<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isVisible = ref(false)

const SHOW_DURATION = 8000 // 8 seconds
let timer: number

const closePopup = () => {
  isVisible.value = false
  clearTimeout(timer)
}

onMounted(() => {
  isVisible.value = true

  timer = window.setTimeout(() => {
    isVisible.value = false
  }, SHOW_DURATION)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 py-6"
    >
      <!-- POPUP CARD -->
      <div
        class="relative flex flex-col md:grid md:grid-cols-2 w-full max-w-sm md:max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl overflow-y-auto"
      >
        <!-- CLOSE ICON -->
        <button
          @click="closePopup"
          aria-label="Fermer"
          class="absolute top-3 right-3 z-30 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all active:scale-90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- IMAGE AREA -->
        <!-- Changed h-48 to h-60 and added p-4 + bg-gray-50 to make the product stand out without cutting -->
        <div class="relative w-full h-60 md:h-full bg-gray-50 flex items-center justify-center md:p-2 order-1 md:order-2">
          <img
            src="/images/dell_5510.png"
            alt="Promotion Product"
            class="w-full h-full object-fill drop-shadow-xl" 
          />
          <!-- object-contain ensures the image is NEVER cut -->
        </div>

        <!-- TEXT CONTENT AREA -->
        <div class="p-8 md:p-12 flex flex-col justify-center order-2 md:order-1 text-center md:text-left">
          <p class="text-xs font-bold text-[#274a82] uppercase tracking-widest mb-2">BRC Market Special</p>

          <h2 class="text-2xl md:text-4xl font-extrabold mb-4 leading-tight text-gray-900">
            Le Best Deals du Mois <br class="hidden md:block" />
            <span class="text-[#e60012]">Jusqu'à -50% !</span>
          </h2>

          <p class="text-gray-600 mb-8 text-lg md:text-xl font-medium">
            Dell Latitude 5510 <br/> Intel Core i5 - 10th Gen
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <NuxtLink to="/products/dell-latitude-5510-core-i5-10th-gen-8gb-ram-512gb-ssd-en-vente-au-cameroun" class="hover:text-white transition">
              <button
                class="w-full sm:w-auto bg-[#274a82] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#e60012] transition-all shadow-xl hover:shadow-[#e60012]/20 active:scale-95"
              >
                Commander
              </button>
            </NuxtLink>
          </div>

          <p class="text-[10px] md:text-xs text-gray-400 mt-8 italic border-t pt-4">
            *Offre valable jusqu'au 31 Mai 2026 dans la limite des stocks.
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Optional: fade in animation for better UX */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.relative {
  animation: fadeIn 0.4s ease-out;
}
</style>