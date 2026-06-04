<template>
  <Transition name="splash" @after-leave="done = true">
    <div v-if="visible" class="splash-screen">
      <div class="splash-content">
        <!-- Logo -->
        <div class="logo-wrap">
          <img src="/images/logos/brclogo.png" alt="BRC Market" class="logo-img" />
        </div>
        <div class="brand-name">BRC Market</div>
        <div class="brand-tagline">Informatique & High-Tech au Cameroun</div>
        <!-- Barre de chargement -->
        <div class="loader-track">
          <div class="loader-bar" />
        </div>
      </div>
      <!-- Vague décorative en bas -->
      <svg class="splash-wave" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="rgba(255,255,255,0.06)" />
      </svg>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const visible = ref(true)
const done    = ref(false)

onMounted(() => {
  // Disparaît après 2.2s (laisse le temps au logo de s'afficher et à la barre de finir)
  setTimeout(() => { visible.value = false }, 2200)
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: linear-gradient(145deg, #274a82 0%, #1a3260 60%, #0f1f42 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: fadeUp 0.6s ease-out both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.logo-wrap {
  width: 110px;
  height: 110px;
  background: white;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  padding: 14px;
  animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.7); }
  to   { opacity: 1; transform: scale(1); }
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-name {
  font-size: 1.6rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0.04em;
  margin-top: 4px;
  animation: fadeUp 0.5s ease-out 0.4s both;
}

.brand-tagline {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.06em;
  animation: fadeUp 0.5s ease-out 0.5s both;
}

/* Barre de chargement */
.loader-track {
  width: 160px;
  height: 3px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 99px;
  overflow: hidden;
  margin-top: 20px;
  animation: fadeUp 0.5s ease-out 0.6s both;
}

.loader-bar {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #e60012, #ff6b6b);
  border-radius: 99px;
  animation: loadBar 1.8s ease-out 0.6s forwards;
}

@keyframes loadBar {
  0%   { width: 0%; }
  40%  { width: 55%; }
  70%  { width: 80%; }
  100% { width: 100%; }
}

/* Vague déco */
.splash-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
}

/* Transition sortie */
.splash-enter-active { transition: opacity 0.4s ease; }
.splash-leave-active { transition: opacity 0.5s ease, transform 0.5s ease; }
.splash-leave-to    { opacity: 0; transform: scale(1.04); }
</style>