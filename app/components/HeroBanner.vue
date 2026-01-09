<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 📝 Messages
const messages = [
  "🔥 Grande Promotion Jusqu’à -40% sur tous les ordinateurs portables !",
  "💻 Nouveautés : Machines puissantes pour professionnels",
  "🛒 Livraison rapide et gratuite à partir de 100000 FCFA"
]

// 🖼️ Images (6)
const images = [
  "/images/banner/banner1.jpg",
  "/images/banner/banner2.jpg",
  "/images/banner/banner3.jpg",
  "/images/banner/banner4.jpg",
  "/images/banner/banner5.jpg",
  "/images/banner/banner6.jpg"
]

const messageIndex = ref(0)
const imageIndex = ref(0)

let messageTimer: number
let imageTimer: number

onMounted(() => {
  messageTimer = window.setInterval(() => {
    messageIndex.value = (messageIndex.value + 1) % messages.length
  }, 3000)

  imageTimer = window.setInterval(() => {
    imageIndex.value = (imageIndex.value + 1) % images.length
  }, 2000)
})

onBeforeUnmount(() => {
  clearInterval(messageTimer)
  clearInterval(imageTimer)
})
</script>

<template>
  <section class="relative overflow-hidden py-4 px-4">
    <!-- 🌈 Background gradient animé -->
    <div
      class="absolute inset-0 animate-gradient bg-gradient-to-r from-[#274a82] via-[#b83232] to-[#ff4d4f]"
    ></div>

    <div class="relative max-w-7xl mx-auto flex items-center gap-6">
      
      <!-- Branding -->
      <div class="z-10 text-white whitespace-nowrap">
        <h1 class="text-sm md:text-lg font-bold">
          Business Revolution Company
        </h1>
        <p class="text-xs md:text-sm italic opacity-90">
          Un Africain, un Ordinateur
        </p>
      </div>

      <!-- 📝 Texte bounce -->
      <div class="flex-1 relative overflow-hidden h-6 md:h-8 z-10">
        <transition name="text-bounce" mode="out-in">
          <span
            :key="messages[messageIndex]"
            class="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm md:text-base whitespace-nowrap"
          >
            {{ messages[messageIndex] }}
          </span>
        </transition>
      </div>

      <!-- 🖼️ Image bounce -->
      <transition name="image-fly" mode="out-in">
        <img
          :key="images[imageIndex]"
          :src="images[imageIndex]"
          class="h-14 md:h-20 object-contain z-10"
          alt="Produit"
        />
      </transition>

      <!-- 🔥 CTA -->
      <a
        href="/boutique"
        class="cta-blink z-10 hidden md:inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white"
      >
        Commander maintenant 🔥
      </a>
    </div>
  </section>
</template>

<style scoped>
/* 📝 Texte : bounce naturel */
@keyframes textBounce {
  0% {
    opacity: 0;
    transform: translateY(120%);
  }
  40% {
    opacity: 1;
    transform: translateY(-12%);
  }
  60% {
    transform: translateY(6%);
  }
  80% {
    transform: translateY(-3%);
  }
  100% {
    transform: translateY(0);
  }
}

.text-bounce-enter-active {
  animation: textBounce 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.text-bounce-leave-active {
  animation: textBounce 0.6s ease-in reverse forwards;
}

/* 🖼️ Image : fly + bounce */
@keyframes flyBounce {
  0% {
    opacity: 0;
    transform: translateX(-60px) scale(0.9);
  }
  40% {
    opacity: 1;
    transform: translateX(30%) scale(1.05);
  }
  70% {
    transform: translateX(60%) translateY(-6px);
  }
  100% {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }
}

.image-fly-enter-active {
  animation: flyBounce 2s ease forwards;
}

/* 🌈 Gradient animé */
@keyframes gradient {
  0%,100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 10s ease infinite;
}

/* 🔥 CTA clignotant */
@keyframes blink {
  0%,100% { transform: scale(1); box-shadow: none; }
  50% { transform: scale(1.05); box-shadow: 0 0 18px rgba(255,255,255,0.8); }
}
.cta-blink {
  background: linear-gradient(135deg, #274a82, #b83232);
  animation: blink 1.2s infinite;
}
.cta-blink:hover {
  animation-play-state: paused;
  opacity: 0.9;
}
</style>
