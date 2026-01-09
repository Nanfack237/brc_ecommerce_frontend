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
  <!-- FULL SCREEN OVERLAY -->
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
    >
      <!-- POPUP CARD -->
      <div
        class="relative grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl mx-2 bg-white rounded-xl overflow-hidden shadow-2xl"
      >
        <!-- CLOSE ICON -->
        <button
          @click="closePopup"
          aria-label="Fermer"
          class="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full p-1 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 text-gray-700 hover:text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- LEFT CONTENT -->
        <div class="p-8 flex flex-col justify-center">
          <p class="text-sm text-gray-400 mb-2">BRC Market</p>

          <h2 class="text-2xl font-bold mb-3">
            Our Best Deals of the Year
            <span class="text-[#e60012]">50% Off!</span>
          </h2>

          <p class="text-gray-600 mb-6 text-sm">
            DELL Latitude 5510 Intel Core i5 - 10 Generation
          </p>

          <button
            class="bg-[#274a82] text-white px-6 py-3 rounded-md w-fit hover:bg-[#e60012] transition"
          >
            Commander
          </button>

          <p class="text-xs text-gray-400 mt-6">
            Fini le 31 Janvier 2026.
          </p>
        </div>

        <!-- RIGHT IMAGE -->
        <div class="relative hidden md:block">
          <img
            src="/images/about-us1.jpg"
            alt="Promotion"
            class="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>
