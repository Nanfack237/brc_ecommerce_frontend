<script setup lang="ts">
/**
 * PwaPopup.vue
 *
 * Fonctionne avec :
 *   registerType: 'autoUpdate'
 *   client: { installPrompt: true }
 *
 * Le plugin @vite-pwa/nuxt expose $pwa via useNuxtApp()
 * Il gère lui-même le BeforeInstallPromptEvent en interne.
 * On utilise donc $pwa directement — pas besoin d'écouter
 * beforeinstallprompt manuellement.
 */
const { $pwa } = useNuxtApp()
</script>

<template>
  <div>

    <!-- ── Bannière installation ──────────────────────────────────────── -->
    <Transition name="slide-up">
      <div
        v-if="$pwa?.showInstallPrompt && !$pwa?.isPWAInstalled"
        class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-[9999]"
      >
        <div class="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div class="h-1.5 bg-gradient-to-r from-[#274a82] to-[#e60012]" />
          <div class="p-4">
            <div class="flex items-start gap-3">
              <img
                src="/brclogo.png"
                alt="BRC Market"
                class="w-10 h-10 rounded-xl object-contain flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p class="font-black text-gray-900 text-sm">Installer BRC Market</p>
                <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Accès rapide, mode hors-ligne et notifications de livraison.
                </p>
              </div>
            </div>
            <div class="flex gap-2 mt-3">
              <button
                @click="$pwa?.cancelInstall()"
                class="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all"
              >
                Plus tard
              </button>
              <button
                @click="$pwa?.install()"
                class="flex-1 py-2 rounded-xl bg-[#274a82] hover:bg-[#1a3460] text-white text-xs font-black transition-all"
              >
                Installer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Bannière mise à jour ───────────────────────────────────────── -->
    <Transition name="slide-down">
      <div
        v-if="$pwa?.needRefresh"
        class="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-[9999]"
      >
        <div class="bg-[#274a82] rounded-2xl shadow-2xl overflow-hidden">
          <div class="p-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-black text-white text-sm">Mise à jour disponible</p>
                <p class="text-xs text-white/70 mt-0.5">
                  Une nouvelle version de BRC Market est prête.
                </p>
              </div>
            </div>
            <div class="flex gap-2 mt-3">
              <button
                @click="$pwa?.cancelPrompt()"
                class="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
              >
                Ignorer
              </button>
              <button
                @click="$pwa?.updateServiceWorker()"
                class="flex-1 py-2 rounded-xl bg-white text-[#274a82] text-xs font-black hover:bg-gray-100 transition-all"
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>