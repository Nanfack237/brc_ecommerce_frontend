<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { en, fr } from '@nuxt/ui/locale'
import CartDrawer from '@/components/CartDrawer.vue'
import useCart from '@/composables/useCart'

const { cartItems } = useCart()
const locale = ref('fr')
const route = useRoute()
const router = useRouter()
const searchQuery = ref('')
const isMenuOpen = ref(false)
const activeSection = ref<string | null>(null)

const handleSearch = () => {
  if (searchQuery.value.trim() !== '') {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
    isMenuOpen.value = false
  }
}

const toggleSection = (section: string) => {
  activeSection.value = activeSection.value === section ? null : section
}

const categoriesData = [
  { label: 'Ordinateurs Et Accessoires', links: [
    { label: 'Laptops', to: '/categories/ordinateurs/laptop' },
    { label: 'Desktops', to: '/categories/ordinateurs/Desktops' },
    { label: 'All in One', to: '/categories/ordinateurs/all-in-one' },
    { label: 'Ecran Ordinateurs', to: '/categories/accessoires-ordinateurs/ecran-ordinateurs' },
    { label: 'Accessoires Ordinateurs', to: '/categories/accessoires-ordinateurs' }
  ]},
  { label: 'Imprimantes / Scanners', links: [
    { label: 'Imprimantes', to: '/categories/imprimantes' },
    { label: 'Scanners', to: '/categories/scanners' },
    { label: 'Consommables', to: '/categories/accessoire-imprimante' },
    { label: 'Etiqueteuse', to: '/categories/etiqueteuse' }
  ]},
  { label: 'Smartphones et Tablettes', links: [
    { label: 'Iphones', to: '/categories/smartphones/iphones' },
    { label: 'Androide', to: '/categories/smartphones/androides' },
    { label: 'Téléphones Mobiles', to: '/categories/smartphones' },
    { label: 'Tablettes', to: '/categories/Tablettes' }
  ]},
  { label: 'Matériel Reseaux', links: [
    { label: 'Serveurs', to: '/categories/reseau-telecom/serveurs' },
    { label: 'Routeurs', to: '/categories/reseau-telecom/routeurs' },
    { label: 'Switchs', to: '/categories/reseau-telecom/Switchs' },
    { label: 'Fibre Optique', to: '/categories/reseau-telecom/fibre-optique' }
  ]},
  { label: 'Sécurité/Biometrie', links: [
    { label: 'Caméra/NVR/DVR', to: '/categories/securite/camera' },
    { label: 'Videophone', to: '/categories/securite/videophones' },
    { label: 'Biometrie', to: '/categories/securite/biometrie' }
  ]},
  { label: 'Stockage', links: [
    { label: 'Disque Dur Interne', to: '/categories/accessoires-ordinateurs/disque-dur-interne' },
    { label: 'Disque Dur Externe', to: '/categories/accessoires-ordinateurs/disque-dur-externe' },
    { label: 'Clé USB', to: '/categories/accessoires-ordinateurs/cle-usb' }
  ]}
]

const servicesData = [
  { label: 'Maintenance Et Réparation', links: [
    { label: 'Laptops', to: '/services/laptops' },
    { label: 'Desktops', to: '/services/desktops' }
  ]},
  { label: 'Sécurité & Réseau', links: [
    { label: 'Vidéo Surveillance', to: '/services/cameras' },
    { label: 'Audit & Câblage', to: '/services/audit' },
    { label: 'Sécurité IT', to: '/services/securite' }
  ]}
]
</script>

<template>
  <UHeader v-model:open="isMenuOpen" class="py-6 h-24">

    <template #title>
      <div class="flex items-center gap-2">
        <img src="/brclogo.png" class="h-10 w-14 md:h-13 md:w-18 object-contain" />
        <NuxtLink to="/" class="flex mb-1 md:mb-3 items-center gap-1 font-bold text-base md:text-lg text-[#274a82]">
          BRC Market
        </NuxtLink>
      </div>
    </template>

    <!-- NAV DESKTOP -->
    <div class="hidden md:flex items-center space-x-2">
      <UButton variant="ghost" :class="route.path === '/' ? 'text-red-600 font-bold' : 'text-gray-700'" to="/">Accueil</UButton>
      <UButton variant="ghost" :class="route.path.startsWith('/boutique') ? 'text-red-600 font-bold' : 'text-gray-700'" to="/boutique">Boutique</UButton>

      <UPopover mode="hover">
        <UButton variant="ghost" :class="route.path.startsWith('/categories') ? 'text-red-600 font-bold' : 'text-gray-700'" trailing-icon="i-lucide-chevron-down">Catégorie</UButton>
        <template #content>
          <div class="p-6 grid grid-cols-3 gap-6 bg-white shadow-xl rounded-lg w-[700px]">
            <div v-for="cat in categoriesData" :key="cat.label">
              <h4 class="font-bold mb-2 border-b-2 border-red-500 text-[14px] text-gray-900">{{ cat.label }}</h4>
              <ul class="space-y-1">
                <li v-for="link in cat.links" :key="link.label">
                  <NuxtLink :to="link.to" class="text-sm text-gray-600 hover:text-red-600 transition-colors">{{ link.label }}</NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </template>
      </UPopover>

      <UPopover mode="hover">
        <UButton variant="ghost" :class="route.path.startsWith('/services') ? 'text-red-600 font-bold' : 'text-gray-700'" trailing-icon="i-lucide-chevron-down">Nos Services</UButton>
        <template #content>
          <div class="p-6 grid grid-cols-2 gap-6 bg-white shadow-xl rounded-lg w-[450px]">
            <div v-for="service in servicesData" :key="service.label">
              <h4 class="font-bold mb-2 border-b-2 border-red-500 text-[14px] text-gray-900">{{ service.label }}</h4>
              <ul class="space-y-1">
                <li v-for="link in service.links" :key="link.label">
                  <NuxtLink :to="link.to" class="text-sm text-gray-600 hover:text-red-600 transition-colors">{{ link.label }}</NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </template>
      </UPopover>

      <UButton variant="ghost" :class="route.path.startsWith('/contact') ? 'text-red-600 font-bold' : 'text-gray-700'" to="/contact">Contact</UButton>
    </div>

    <template #right>
      <div class="relative mr-3 hidden md:flex items-center">
        <input v-model="searchQuery" @keyup.enter="handleSearch" type="text" placeholder="Que cherchez vous?" class="border rounded-md px-3 py-1 focus:ring-2 focus:ring-red-500 text-sm" />
        <button @click="handleSearch" class="absolute right-2 pt-2 text-red-600">
          <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5" />
        </button>
      </div>
      <CartDrawer />
      <div class="hidden md:flex items-center ml-2 gap-2">
        <UPopover mode="hover" placement="bottom-end">
          <UButton variant="ghost" icon="i-heroicons-user-circle" color="neutral" />
          <template #content>
            <div class="bg-white dark:bg-gray-900 shadow-xl rounded-xl w-56 py-2 border border-gray-100 dark:border-gray-800">
              <NuxtLink to="/login" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                <UIcon name="i-heroicons-arrow-right-on-rectangle" /> Se connecter
              </NuxtLink>
              <NuxtLink to="/register" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
                <UIcon name="i-heroicons-user-plus" /> Créer un compte
              </NuxtLink>
            </div>
          </template>
        </UPopover>
        <ULocaleSelect v-model="locale" :locales="[en, fr]" />
      </div>
    </template>

    <!-- ===== DRAWER MOBILE ===== -->
    <template #content>
      <div class="flex flex-col h-full bg-white overflow-hidden">

        <!-- Header drawer -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div class="flex items-center gap-2">
            <img src="/brclogo.png" class="h-8 w-auto object-contain" />
            <span class="font-bold text-[#274a82]">BRC Market</span>
          </div>
          <button
            @click="isMenuOpen = false"
            class="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 transition-colors"
            aria-label="Fermer le menu"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Recherche pleine largeur -->
        <div class="px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Rechercher un produit..."
            @keyup.enter="handleSearch"
            class="w-full"
          />
        </div>

        <!-- ===== BARRE NAV — 5 items égaux sur toute la largeur ===== -->
        <div class="flex-shrink-0 border-b border-gray-100 bg-gray-50 w-full">
          <div class="flex items-stretch w-full">

            <!-- Accueil -->
            <NuxtLink
              to="/"
              @click="isMenuOpen = false; activeSection = null"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all"
              :class="route.path === '/' ? 'bg-[#274a82] text-white' : 'text-gray-500 hover:bg-white hover:text-[#274a82]'"
            >
              <UIcon name="i-heroicons-home" class="w-4 h-4" />
              Accueil
            </NuxtLink>

            <!-- Boutique -->
            <NuxtLink
              to="/boutique"
              @click="isMenuOpen = false; activeSection = null"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all"
              :class="route.path.startsWith('/boutique') ? 'bg-[#274a82] text-white' : 'text-gray-500 hover:bg-white hover:text-[#274a82]'"
            >
              <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4" />
              Boutique
            </NuxtLink>

            <!-- Catégories -->
            <button
              @click="toggleSection('categories')"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all"
              :class="activeSection === 'categories' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-white hover:text-red-600'"
            >
              <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4" />
              Catégories
            </button>

            <!-- Services -->
            <button
              @click="toggleSection('services')"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all"
              :class="activeSection === 'services' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-white hover:text-red-600'"
            >
              <UIcon name="i-heroicons-wrench-screwdriver" class="w-4 h-4" />
              Services
            </button>

            <!-- Contact -->
            <NuxtLink
              to="/contact"
              @click="isMenuOpen = false; activeSection = null"
              class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all"
              :class="route.path.startsWith('/contact') ? 'bg-[#274a82] text-white' : 'text-gray-500 hover:bg-white hover:text-[#274a82]'"
            >
              <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
              Contact
            </NuxtLink>

          </div>
        </div>

        <!-- ===== CONTENU DYNAMIQUE ===== -->

        <!-- Panel Catégories -->
        <div v-if="activeSection === 'categories'" class="flex-1 overflow-y-auto px-4 py-4">
          <div v-for="cat in categoriesData" :key="cat.label" class="mb-5">
            <h4 class="text-[12px] font-bold text-gray-400 tracking-widest mb-2 flex items-center gap-2">
              <span class="flex-1 h-px bg-gray-100"></span>
              {{ cat.label }}
              <span class="flex-1 h-px bg-gray-100"></span>
            </h4>
            <div class="grid grid-cols-2 gap-1.5">
              <NuxtLink
                v-for="link in cat.links"
                :key="link.label"
                :to="link.to"
                @click="isMenuOpen = false"
                class="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-xs text-gray-700 font-medium transition-all text-center"
              >
                {{ link.label }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Panel Services -->
        <div v-else-if="activeSection === 'services'" class="flex-1 overflow-y-auto px-4 py-4">
          <div v-for="service in servicesData" :key="service.label" class="mb-5">
            <h4 class="text-[12px] font-bold text-gray-400  tracking-widest mb-2 flex items-center gap-2">
              <span class="flex-1 h-px bg-gray-100"></span>
              {{ service.label }}
              <span class="flex-1 h-px bg-gray-100"></span>
            </h4>
            <div class="grid grid-cols-2 gap-1.5">
              <NuxtLink
                v-for="link in service.links"
                :key="link.label"
                :to="link.to"
                @click="isMenuOpen = false"
                class="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-xs text-gray-700 font-medium transition-all text-center"
              >
                {{ link.label }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- État par défaut -->
        <div v-else class="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
            <UIcon name="i-heroicons-squares-2x2" class="w-8 h-8 text-gray-200" />
          </div>
          <p class="text-sm text-gray-400 font-medium">Explorez nos catégories<br />ou services ci-dessus</p>
        </div>

        <!-- Bas du drawer -->
        <div class="flex-shrink-0 px-4 py-4 border-t border-gray-100 flex flex-col gap-3 bg-white">
          <div class="flex gap-2">
            <UButton to="/login" class="flex-1" variant="outline" @click="isMenuOpen = false">Connexion</UButton>
            <UButton to="/register" class="flex-1" @click="isMenuOpen = false">S'inscrire</UButton>
          </div>
          <ULocaleSelect v-model="locale" :locales="[en, fr]" class="w-full" />
        </div>

      </div>
    </template>

  </UHeader>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>