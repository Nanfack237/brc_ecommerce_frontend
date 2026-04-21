<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const messages = [
  "Bonne Fête du Travail à tous nos clients !",
  "Commandez aujourd'hui et recevez une Clé USB offerte !",
  "1er Mai — Produits en promotion pour la Fête du Travail !",
  "Profitez de nos offres spéciales ce 1er Mai !",
]

const images = [
  "/images/banner/banner1.jpg",
  "/images/banner/banner2.jpg",
  "/images/banner/banner3.jpg",
  "/images/banner/banner4.jpg",
  "/images/banner/banner5.jpg",
  "/images/banner/banner6.jpg",
]

const messageIndex = ref(0)
const imageIndex   = ref(0)

let messageTimer: any
let imageTimer: any

onMounted(() => {
  messageTimer = setInterval(() => {
    messageIndex.value = (messageIndex.value + 1) % messages.length
  }, 3500)
  imageTimer = setInterval(() => {
    imageIndex.value = (imageIndex.value + 1) % images.length
  }, 2500)
})

onBeforeUnmount(() => {
  clearInterval(messageTimer)
  clearInterval(imageTimer)
})
</script>

<template>
  <section class="banner-section relative overflow-hidden shadow-inner">
    <div class="absolute inset-0 animate-gradient bg-gradient-to-r from-[#274a82] via-[#c2280a] to-[#ff4d4f]"></div>

    <!-- ===== MOBILE ===== -->
    <div class="relative md:hidden px-3 py-2">
      <div class="flex items-center justify-between gap-2">

        <div class="text-white flex-shrink-0">
          <h1 class="text-sm font-extrabold leading-tight tracking-tight">1er Mai</h1>
          <p class="text-[9px] opacity-75">Fête du Travail</p>
        </div>

        <div class="relative flex-shrink-0 h-10 w-10">
          <transition name="image-fly" mode="out-in">
            <img
              :key="images[imageIndex]"
              :src="images[imageIndex]"
              class="h-full w-full object-contain drop-shadow-xl"
              alt="Produit à gagner"
            />
          </transition>
        </div>

        <a href="/boutique" class="cta-blink flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap">
          Commander
        </a>
      </div>

      <div class="relative overflow-hidden h-5 mt-1.5 w-full">
        <transition name="text-bounce" mode="out-in">
          <span
            :key="messages[messageIndex]"
            class="absolute inset-0 flex items-center justify-center text-white font-semibold text-[10px] text-center px-1 drop-shadow"
          >
            {{ messages[messageIndex] }}
          </span>
        </transition>
      </div>
    </div>

    <!-- ===== DESKTOP ===== -->
    <div class="relative hidden md:flex max-w-7xl mx-auto items-center justify-between gap-6 py-4 px-4">

      <div class="z-10 text-white flex-shrink-0">
        <h1 class="text-lg font-extrabold leading-tight tracking-tight">1er Mai</h1>
        <p class="text-sm opacity-80 font-medium">Fête du Travail</p>
      </div>

      <div class="flex-1 relative overflow-hidden h-10 z-10 min-w-0">
        <transition name="text-bounce" mode="out-in">
          <span
            :key="messages[messageIndex]"
            class="absolute inset-0 flex items-center justify-center text-white font-bold text-base text-center px-2 drop-shadow-md"
          >
            {{ messages[messageIndex] }}
          </span>
        </transition>
      </div>

      <div class="relative flex items-center justify-center h-20 w-32 flex-shrink-0">
        <transition name="image-fly" mode="out-in">
          <img
            :key="images[imageIndex]"
            :src="images[imageIndex]"
            class="h-full w-full object-contain z-10 drop-shadow-xl"
            alt="Produit à gagner"
          />
        </transition>
      </div>

      
         <a href="/boutique"
        class="cta-blink z-10 flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-lg border border-white/20"
      >
        Commander
      </a>
    </div>
  </section>
</template>

<style scoped>
@keyframes gradientBG {
  0%   { background-position: 0% 50%;   }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%;   }
}
.animate-gradient {
  background-size: 200% 200%;
  animation: gradientBG 8s ease infinite;
}

.text-bounce-enter-active { animation: textIn  0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
.text-bounce-leave-active { animation: textOut 0.4s ease-in; }
@keyframes textIn  { 0% { opacity: 0; transform: translateY(16px);  } 100% { opacity: 1; transform: translateY(0);     } }
@keyframes textOut { 0% { opacity: 1; transform: translateY(0);     } 100% { opacity: 0; transform: translateY(-16px); } }

.image-fly-enter-active { animation: imgIn  0.8s ease-out; }
.image-fly-leave-active { animation: imgOut 0.5s ease-in;  }
@keyframes imgIn  { 0% { opacity: 0; transform: scale(0.5) rotate(-10deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
@keyframes imgOut { 0% { opacity: 1; transform: scale(1);                  } 100% { opacity: 0; transform: scale(1.2);         } }

@keyframes pulseBlink {
  0%, 100% { transform: scale(1);     filter: brightness(1);   }
  50%       { transform: scale(1.05); filter: brightness(1.2); }
}
.cta-blink {
  background: linear-gradient(135deg, #274a82, #e60012);
  animation: pulseBlink 2s infinite ease-in-out;
  transition: all 0.3s ease;
}
.cta-blink:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}
</style>