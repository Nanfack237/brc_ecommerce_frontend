<script setup lang="ts">
import { ref, computed } from 'vue'

const route = useRoute()

// User data
const user = ref({
  firstName: 'Jean',
  lastName: 'Mbala',
  email: 'jean.mbala@gmail.com',
  avatar: null as string | null,
})

const userInitials = computed(() =>
  `${user.value.firstName[0]}${user.value.lastName[0]}`
)

// Mobile drawer state
const isMobileOpen = ref(false)

const navGroups = [
  {
    label: 'Mes achats',
    items: [
      { label: 'Mes commandes',    to: '/compte/commandes',   icon: 'i-heroicons-shopping-bag',    badge: 3  },
      { label: 'Mes favoris',      to: '/compte/favoris',     icon: 'i-heroicons-heart',            badge: null },
      { label: 'Mes retours',      to: '/compte/retours',     icon: 'i-heroicons-arrow-uturn-left', badge: null },
      { label: 'Mes téléchargements', to: '/compte/telechargements', icon: 'i-heroicons-arrow-down-tray', badge: null },
    ]
  },
  {
    label: 'Mon compte',
    items: [
      { label: 'Informations personnelles', to: '/compte/profil',          icon: 'i-heroicons-user-circle',      badge: null },
      { label: 'Adresses de livraison',     to: '/compte/adresses',        icon: 'i-heroicons-map-pin',          badge: null },
      { label: 'Sécurité & Mot de passe',   to: '/compte/securite',        icon: 'i-heroicons-lock-closed',      badge: null },
      { label: 'Notifications',             to: '/compte/notifications',   icon: 'i-heroicons-bell',             badge: 5  },
    ]
  },
  {
    label: 'Avis & Support',
    items: [
      { label: 'Mes commentaires',  to: '/compte/commentaires', icon: 'i-heroicons-star',              badge: 2  },
      { label: 'Mes tickets SAV',   to: '/compte/sav',          icon: 'i-heroicons-chat-bubble-left',  badge: null },
      { label: 'Parrainage',        to: '/compte/parrainage',   icon: 'i-heroicons-gift',              badge: null },
    ]
  },
]

const isActive = (to: string) => route.path === to
</script>

<template>
  <div>
    <!-- ============================================================
         MOBILE — Bouton flottant + Drawer slide-in
    ============================================================ -->

    <!-- Trigger mobile (bouton bas d'écran) -->
    <button
      @click="isMobileOpen = true"
      class="lg:hidden fixed bottom-5 right-5 z-40 w-14 h-14 bg-[#274a82] hover:bg-[#e60012] rounded-full shadow-2xl flex items-center justify-center text-white transition-colors"
    >
      <UIcon name="i-heroicons-user-circle" class="w-6 h-6" />
    </button>

    <!-- Overlay -->
    <Transition name="overlay">
      <div
        v-if="isMobileOpen"
        class="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        @click="isMobileOpen = false"
      />
    </Transition>

    <!-- Drawer mobile slide depuis la gauche -->
    <Transition name="slide-left">
      <div
        v-if="isMobileOpen"
        class="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-white shadow-2xl flex flex-col"
      >
        <!-- Header drawer -->
        <div class="bg-[#274a82] px-5 pt-8 pb-6 flex-shrink-0">
          <div class="flex items-center justify-between mb-5">
            <span class="text-white font-black text-sm tracking-tight">
              MON <span class="text-[#e60012]">COMPTE</span>
            </span>
            <button
              @click="isMobileOpen = false"
              class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>

          <!-- Avatar + infos -->
          <div class="flex items-center gap-3">
            <div class="relative flex-shrink-0">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#e60012] to-[#274a82] border-2 border-white/30 flex items-center justify-center text-white font-black text-base shadow-md">
                {{ userInitials }}
              </div>
              <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
            </div>
            <div class="min-w-0">
              <p class="text-white font-black text-sm truncate">{{ user.firstName }} {{ user.lastName }}</p>
              <p class="text-white/50 text-[10px] truncate">{{ user.email }}</p>
            </div>
          </div>
        </div>

        <!-- Nav links mobile -->
        <div class="flex-1 overflow-y-auto py-3">
          <div v-for="group in navGroups" :key="group.label" class="mb-1">
            <p class="px-5 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
              {{ group.label }}
            </p>
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              @click="isMobileOpen = false"
              :class="[
                'flex items-center gap-3 px-5 py-2.5 mx-2 rounded-sm transition-all text-xs font-bold',
                isActive(item.to)
                  ? 'bg-[#274a82] text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              ]"
            >
              <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />
              <span class="flex-1">{{ item.label }}</span>
              <span
                v-if="item.badge"
                :class="[
                  'text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0',
                  isActive(item.to) ? 'bg-[#e60012] text-white' : 'bg-[#e60012] text-white'
                ]"
              >
                {{ item.badge }}
              </span>
            </NuxtLink>
          </div>
        </div>

        <!-- Footer drawer -->
        <div class="flex-shrink-0 border-t border-gray-100 p-4">
          <button class="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-bold text-[#e60012] hover:bg-red-50 transition-colors">
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </Transition>

    <!-- ============================================================
         DESKTOP — Sidebar fixe
    ============================================================ -->
    <aside class="hidden lg:flex flex-col w-64 flex-shrink-0 gap-4">

      <!-- Carte profil -->
      <div class="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">
        <!-- Bandeau couleur -->
        <div class="h-16 bg-gradient-to-r from-[#274a82] to-[#1a3060] relative">
          <div class="absolute inset-0 opacity-10"
            style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px);">
          </div>
        </div>

        <!-- Avatar chevauchant le bandeau -->
        <div class="px-5 pb-4">
          <div class="flex items-end gap-3 -mt-7 mb-3">
            <div class="relative flex-shrink-0">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-[#e60012] to-[#274a82] border-3 border-white shadow-lg flex items-center justify-center text-white font-black text-lg ring-2 ring-white">
                {{ userInitials }}
              </div>
              <span class="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-sm"></span>
            </div>
            <div class="mb-1 min-w-0">
              <p class="text-sm font-black text-gray-900 truncate">{{ user.firstName }} {{ user.lastName }}</p>
              <div class="flex items-center gap-1 mt-0.5">
                <span class="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                <span class="text-[10px] text-green-600 font-bold">Actif</span>
              </div>
            </div>
          </div>

          <p class="text-[11px] text-gray-400 truncate mb-3">{{ user.email }}</p>

          <!-- Stats rapides -->
          <div class="grid grid-cols-3 gap-1 p-2 bg-gray-50 rounded-sm">
            <div class="text-center">
              <p class="text-sm font-black text-gray-900">12</p>
              <p class="text-[9px] text-gray-400 font-medium">Commandes</p>
            </div>
            <div class="text-center border-x border-gray-200">
              <p class="text-sm font-black text-gray-900">8</p>
              <p class="text-[9px] text-gray-400 font-medium">Favoris</p>
            </div>
            <div class="text-center">
              <p class="text-sm font-black text-gray-900">5</p>
              <p class="text-[9px] text-gray-400 font-medium">Avis</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation desktop -->
      <div class="bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">
        <div v-for="(group, gi) in navGroups" :key="group.label">
          <!-- Séparateur entre groupes -->
          <div v-if="gi > 0" class="h-px bg-gray-100 mx-4"></div>

          <!-- Label groupe -->
          <div class="px-4 pt-3 pb-1">
            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">{{ group.label }}</p>
          </div>

          <!-- Links -->
          <div class="px-2 pb-2">
            <NuxtLink
              v-for="item in group.items"
              :key="item.to"
              :to="item.to"
              :class="[
                'flex items-center gap-2.5 px-3 py-2 rounded-sm transition-all group/link relative',
                isActive(item.to)
                  ? 'bg-[#274a82] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              ]"
            >
              <!-- Indicateur actif -->
              <span
                v-if="isActive(item.to)"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#e60012] rounded-r-full"
              ></span>

              <UIcon
                :name="item.icon"
                :class="['w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover/link:scale-110', isActive(item.to) ? 'text-white' : 'text-gray-400']"
              />
              <span class="text-[11px] font-bold flex-1 truncate">{{ item.label }}</span>
              <span
                v-if="item.badge"
                class="bg-[#e60012] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
              >
                {{ item.badge }}
              </span>
            </NuxtLink>
          </div>
        </div>

        <!-- Déconnexion -->
        <div class="border-t border-gray-100 p-2">
          <button class="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-[11px] font-bold text-[#e60012] hover:bg-red-50 transition-colors group/logout">
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-3.5 h-3.5 group-hover/logout:translate-x-0.5 transition-transform" />
            Déconnexion
          </button>
        </div>
      </div>

      <!-- Bloc aide -->
      
    </aside>
  </div>
</template>

<style scoped>
/* Overlay */
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.25s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

/* Slide depuis la gauche */
.slide-left-enter-active, .slide-left-leave-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.slide-left-enter-from, .slide-left-leave-to { transform: translateX(-100%); }

/* Ring border-3 custom */
.ring-2 { --tw-ring-offset-width: 2px; }
</style>