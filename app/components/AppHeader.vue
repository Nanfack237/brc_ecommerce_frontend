<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { en, es, fr } from '@nuxt/ui/locale'
import CartDrawer from '@/components/CartDrawer.vue'
import useCart from '@/composables/useCart'

const { cartItems } = useCart()

const locale = ref('fr')

const color = "red";

const route = useRoute()
const router = useRouter()
const searchQuery = ref('')

// Handle search
const handleSearch = () => {
  if (searchQuery.value.trim() !== '') {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

// Navigation items
const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Acceuil',
    to: '/',
    active: route.path === '/',
    class: route.path === '/' ? 'text-red-600 font-semibold' : 'text-gray-700'
  },
  {
    label: 'Boutique',
    to: '/boutique',
    active: route.path.startsWith('/boutique'),
    class: route.path.startsWith('/boutique') ? 'text-red-600 font-semibold' : 'text-gray-700'
  },
  
])


</script>

<template>
  <UHeader class=" py-6 h-24">
    <!-- Logo --> 
   
    <template #title>
         <img
            src="/brclogo.png"
           
            class="h-13 w-18 object-contain"
        />
      <NuxtLink to="/" class="flex mb-3 mr-0 items-center gap-2 font-bold text-lg text-[#274a82]">
       
        BRC Market
      </NuxtLink>
    </template>

    <!-- Desktop Navigation -->
    <div class="hidden md:flex items-center space-x-2">
      <!-- Simple Links -->
        <!-- Accueil -->
        <UButton
            variant="ghost"
            class="font-medium"
            :class="route.path === '/' 
            ? 'text-red-600 font-bold' 
            : 'text-gray-700'"
            to="/"
        >
            Accueil
        </UButton>

        <!-- Boutique -->
        <UButton
            variant="ghost"
            class="font-medium"
            :class="route.path.startsWith('/boutique') 
            ? 'text-red-600 font-bold' 
            : 'text-gray-700'"
            to="/boutique"
        >
            Boutique
        </UButton>

      <!-- Mega Menu for Catégorie -->
      <UPopover mode="hover">
        <UButton
          variant="ghost"
          class="font-medium"
          :class="route.path.startsWith('/categories') ? 'text-red-600' : 'text-gray-700'"
          trailing-icon="i-lucide-chevron-down"
        >
          Catégorie
        </UButton>

        <template #content>
          <div class="md p-5 grid grid-cols-3 gap-5 bg-white shadow-lg rounded">
            <!-- Ordinateurs -->
            <div>
              <h4 class="font-bold mb-2 border-b-2 border-red-500">Ordinateurs Et Accessoires</h4>
              <ul class="space-y-1">
                <li><NuxtLink to="/categories/ordinateurs/laptop">Laptops</NuxtLink></li>
                <li><NuxtLink to="/categories/ordinateurs/Desktops">Desktops</NuxtLink></li>
                <li><NuxtLink to="/categories/ordinateurs/all-in-one">All in One </NuxtLink></li>
                <li><NuxtLink to="/categories/accessoires-ordinateurs/ecran-ordinateurs">Ecran Ordinateurs</NuxtLink></li>
                <li><NuxtLink to="/categories/accessoires-ordinateurs">Accessoires Ordinateurs</NuxtLink></li>
              </ul>
            </div>

            <!-- Accessoires -->
            <div>
              <h4 class="font-bold mb-2 border-b-2 border-red-500">Imprimantes / Scanners</h4>
              <ul class="space-y-1">
                <li><NuxtLink to="/categories/imprimantes">Imprimantes</NuxtLink></li>
                <li><NuxtLink to="/categories/scanners">Scanners</NuxtLink></li>
                <li><NuxtLink to="/categories/accessoire-imprimante">Imprimante Consommables</NuxtLink></li>
                <li><NuxtLink to="/categories/etiqueteuse">Etiqueteuse</NuxtLink></li>
              </ul>
            </div>

            <!-- Autres Produits -->
            <div>
              <h4 class="font-bold mb-2 border-b-2 border-red-500">Smartphones et Tablettes</h4>
              <ul class="space-y-1">
                <li><NuxtLink to="/categories/smartphones/iphones">Iphones</NuxtLink></li>
                <li><NuxtLink to="/categories/smartphones/androides">Androide</NuxtLink></li>
                <li><NuxtLink to="/categories/smartphones">Téléphones Mobiles</NuxtLink></li>
                <li><NuxtLink to="/categories/Tablettes">Tablettes</NuxtLink></li>
                
              </ul>
            </div>
            <!-- Autres Produits -->
            <div>
              <h4 class="font-bold mb-2 border-b-2 border-red-500">Matériel Reseaux</h4>
              <ul class="space-y-1">
                <li><NuxtLink to="/categories/reseau-telecom/serveurs">Serveurs</NuxtLink></li>
                <li><NuxtLink to="/categories/reseau-telecom/routeurs">Routeurs</NuxtLink></li>
                <li><NuxtLink to="/categories/reseau-telecom/Switchs">Switchs</NuxtLink></li>
                <li><NuxtLink to="/categories/reseau-telecom/fibre-optique">Fibre Optique</NuxtLink></li>
                <li><NuxtLink to="/categoriess/reseau-telecom/baie-de-brassage">Baie De Brassage</NuxtLink></li>
                <li><NuxtLink to="/categoriess/reseau-telecom/utm-firewall-qos">UTM/FIREWALL/QOS</NuxtLink></li>
              </ul>
            </div>

            <div>
              <h4 class="font-bold mb-2 border-b-2 border-red-500">Sécurité/Biometrie</h4>
              <ul class="space-y-1">
                <li><NuxtLink to="/categories/securite/camera">Caméra/NVR/DVR</NuxtLink></li>
                <li><NuxtLink to="/categories/securite/videophones">Videophone</NuxtLink></li>
                <li><NuxtLink to="/categories/securite/alarmes">Alarmes</NuxtLink></li>
                <li><NuxtLink to="/categories/securite/biometrie">Biometrie</NuxtLink></li>
                <li><NuxtLink to="/categories/securite/gps-tracker">GPS Tracker</NuxtLink></li>
                
              </ul>
            </div>

            <div>
              <h4 class="font-bold mb-2 border-b-2 border-red-500">Stockage</h4>
              <ul class="space-y-1">
                <li><NuxtLink to="/categories/accessoires-ordinateurs/disque-dur-interne">Disque Dur Interne</NuxtLink></li>
                <li><NuxtLink to="/categories/accessoires-ordinateurs/disque-dur-externe">Disque Dur Externe</NuxtLink></li>
                <li><NuxtLink to="/categories/accessoires-ordinateurs/cle-usb">Clé USB</NuxtLink></li>
                
              </ul>
            </div>
          </div>
        </template>
        
      </UPopover>

      <UPopover mode="hover">
        <UButton
          variant="ghost"
          class="font-medium"
          :class="route.path.startsWith('/services') ? 'text-red-600' : 'text-gray-700'"
          trailing-icon="i-lucide-chevron-down"
        >
          Nos Services
        </UButton>

        <template #content>
          <div class="md p-5 grid grid-cols-3 gap-5 bg-white shadow-lg rounded">
            <!-- Ordinateurs -->
            <div>
              <h4 class="font-bold mb-2 border-b-2 border-red-500">Maintenance Et Réparation</h4>
              <ul class="space-y-1">
                <li><NuxtLink to="/categories/laptops">Laptops</NuxtLink></li>
                <li><NuxtLink to="/categories/desktops">Desktops</NuxtLink></li>
              </ul>
            </div>

            <!-- Accessoires -->
            <div>
              <h4 class="font-bold mb-2 border-b-2 border-red-500">Intégration Et Déploiement </h4>
              <ul class="space-y-1">
                <li><NuxtLink to="/categories/claviers-souris">Claviers & Souris</NuxtLink></li>
                <li><NuxtLink to="/categories/accessoires">Autres Accessoires</NuxtLink></li>
              </ul>
            </div>

            <!-- Autres Produits -->
            <div>
              <h4 class="font-bold mb-2 border-b-2 border-red-500">Video Surveillance</h4>
              <ul class="space-y-1">
                <li><NuxtLink to="/categories/imprimantes">Imprimantes</NuxtLink></li>
                <li><NuxtLink to="/categories/smartphones">Smartphones & Tablettes</NuxtLink></li>
                <li><NuxtLink to="/categories/tv">TV</NuxtLink></li>
                <li><NuxtLink to="/categories/cameras">Caméras de Surveillance</NuxtLink></li>
              </ul>
            </div>

            <div>
              <h4 class="font-bold mb-2 border-b-2 border-red-500">Securité Informatique</h4>
              <ul class="space-y-1">
                <li><NuxtLink to="/categories/imprimantes">Imprimantes</NuxtLink></li>
                <li><NuxtLink to="/categories/smartphones">Smartphones & Tablettes</NuxtLink></li>
                <li><NuxtLink to="/categories/tv">TV</NuxtLink></li>
                <li><NuxtLink to="/categories/cameras">Caméras de Surveillance</NuxtLink></li>
              </ul>
            </div>

            <div>
              <h4 class="font-bold mb-2 border-b-2 border-red-500">Infrastructure IT Et Serveurs</h4>
              <ul class="space-y-1">
                <li><NuxtLink to="/categories/imprimantes">Imprimantes</NuxtLink></li>
                <li><NuxtLink to="/categories/smartphones">Smartphones & Tablettes</NuxtLink></li>
              </ul>
            </div>

             <div>
              <h4 class="font-bold mb-2 border-b-2 border-red-500">Audit Et Câblage Réseau</h4>
              <ul class="space-y-1">
                <li><NuxtLink to="/categories/imprimantes">Imprimantes</NuxtLink></li>
                <li><NuxtLink to="/categories/smartphones">Smartphones & Tablettes</NuxtLink></li>
              </ul>
            </div>
          </div>
        </template>
      </UPopover>

      <!-- Boutique -->
        <UButton
            variant="ghost"
            class="font-medium"
            :class="route.path.startsWith('/contact') 
            ? 'text-red-600 font-bold' 
            : 'text-gray-700'"
            to="/contact"
        >
            Contact
        </UButton>

    </div>

    <!-- Right Actions -->
    <template #right>
      <!-- Search Bar -->
      <div class="relative mr-3 hidden md:flex items-center">
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="Que cherchez vous?"
          class="border rounded-md md-6 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          @click="handleSearch"
          class="absolute right-0 top-0 mt-2 mr-1 text-red-600 hover:text-red-800"
        >
          <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5"/>
        </button>
      </div>
      
          <CartDrawer />
      
     
      <UPopover mode="hover" placement="bottom-end">
        <!-- User button -->
         
        <UButton
            variant="ghost"
            icon="i-heroicons-user-circle"
            aria-label="Compte Client"
            color="neutral"
            class="mx-1"
        />

            <!-- Dropdown menu -->
           <template #content>
            <div class="bg-white dark:bg-gray-900 shadow-xl rounded-xl w-56 py-2 border border-gray-100 dark:border-gray-800">
              <NuxtLink
                to="/login"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5 text-gray-400" />
                <span>Se connecter</span>
              </NuxtLink>

              <div class="border-t border-gray-100 dark:border-gray-800 my-1"></div>

              <NuxtLink
                to="/register" 
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <UIcon name="i-heroicons-user-plus" class="w-5 h-5 text-gray-400" />
                <span>Créer un compte</span>
              </NuxtLink>
            </div>
          </template>
        
            <ULocaleSelect v-model="locale" :locales="[en, fr]" />
       
    </UPopover>
    </template>


  </UHeader>
</template>
