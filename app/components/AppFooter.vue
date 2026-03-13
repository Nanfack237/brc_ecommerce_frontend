<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const year = new Date().getFullYear()

// Accordéon mobile
const openSection = ref<string | null>(null)
const toggle = (section: string) => {
  openSection.value = openSection.value === section ? null : section
}

// Auth state
const token  = useCookie('auth_token')
const router = useRouter()
const toast  = useToast()

const isLoggedIn = computed(() => !!token.value)

// User dropdown
const userMenuOpen = ref(false)

const handleLogout = async () => {
  userMenuOpen.value = false
  try {
    await axios.post('http://127.0.0.1:8000/api/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
  } catch {}

  token.value = null

  toast.add({
    title: 'Déconnecté',
    description: 'À bientôt sur BRC Market !',
    color: 'success',
    icon: 'i-heroicons-check-circle',
    duration: 3000,
  })

  router.push('/login')
}

// User menu items
const userLinks = [
  { label: 'Mes commandes',  icon: 'i-heroicons-shopping-bag',   to: '/compte/commandes' },
  { label: 'Mes favoris',    icon: 'i-heroicons-heart',           to: '/compte/favoris' },
  { label: 'Mes informations', icon: 'i-heroicons-user-circle',  to: '/compte/informations' },
  { label: 'Paramètres',     icon: 'i-heroicons-cog-6-tooth',     to: '/compte/parametres' },
]
</script>

<template>

  <footer class="bg-[#274a82] text-gray-300">

    <!-- ===== TOP FOOTER ===== -->
    <UContainer class="py-10">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-10">

        <!-- BRAND -->
        <div class="mb-6 md:mb-0">
          <div class="flex items-center gap-3 mb-3">
            <img src="/brclogo.png" alt="BRC Market" class="h-12 w-auto object-contain" />
            <span class="text-xl font-bold text-white">BRC Market</span>
          </div>

          <p class="text-sm text-gray-400 leading-relaxed mb-4">
            BRC Market est votre partenaire de confiance pour
            l'achat de matériel informatique, smartphones,
            réseaux et services IT professionnels au Cameroun.
          </p>

          <div class="flex items-center gap-3 flex-wrap">
            <NuxtLink to="https://www.facebook.com/profile.php?id=61555704845467" target="_blank">
              <UButton icon="i-lucide-facebook" color="gray" variant="ghost" size="sm" />
            </NuxtLink>
            <NuxtLink to="https://wa.me/237683627787" target="_blank">
              <UButton icon="i-simple-icons-whatsapp" color="gray" variant="ghost" size="sm" />
            </NuxtLink>
            <NuxtLink to="/about-us" class="text-sm hover:text-white transition ml-1">
              Qui sommes-nous ?
            </NuxtLink>
          </div>
        </div>

        <!-- BOUTIQUE -->
        <div class="border-t border-white/10 md:border-0">
          <button
            class="w-full flex items-center justify-between py-3 md:py-0 md:cursor-default text-white font-semibold md:mb-4"
            @click="toggle('shop')"
          >
            <span>Boutique</span>
            <UIcon
              name="i-heroicons-chevron-down"
              class="w-4 h-4 transition-transform md:hidden"
              :class="{ 'rotate-180': openSection === 'shop' }"
            />
          </button>
          <ul
            class="space-y-2 text-sm overflow-hidden transition-all duration-300 md:block"
            :class="openSection === 'shop' ? 'max-h-40 pb-4' : 'max-h-0 md:max-h-none'"
          >
            <li><NuxtLink to="/boutique" class="hover:text-white transition">Tous les produits</NuxtLink></li>
            <li><NuxtLink to="/categories/laptops" class="hover:text-white transition">Ordinateurs</NuxtLink></li>
            <li><NuxtLink to="/categories/smartphones" class="hover:text-white transition">Smartphones</NuxtLink></li>
            <li><NuxtLink to="/categories/accessoires" class="hover:text-white transition">Accessoires</NuxtLink></li>
          </ul>
        </div>

        <!-- SERVICES -->
        <div class="border-t border-white/10 md:border-0">
          <button
            class="w-full flex items-center justify-between py-3 md:py-0 md:cursor-default text-white font-semibold md:mb-4"
            @click="toggle('services')"
          >
            <span>Nos Services</span>
            <UIcon
              name="i-heroicons-chevron-down"
              class="w-4 h-4 transition-transform md:hidden"
              :class="{ 'rotate-180': openSection === 'services' }"
            />
          </button>
          <ul
            class="space-y-2 text-sm overflow-hidden transition-all duration-300 md:block"
            :class="openSection === 'services' ? 'max-h-48 pb-4' : 'max-h-0 md:max-h-none'"
          >
            <li><NuxtLink to="/services/maintenance" class="hover:text-white transition">Maintenance & Réparation</NuxtLink></li>
            <li><NuxtLink to="/services/integration" class="hover:text-white transition">Intégration IT</NuxtLink></li>
            <li><NuxtLink to="/services/videosurveillance" class="hover:text-white transition">Vidéo Surveillance</NuxtLink></li>
            <li><NuxtLink to="/services/reseau" class="hover:text-white transition">Réseau & Sécurité</NuxtLink></li>
          </ul>
        </div>

        <!-- CONTACT -->
        <div class="border-t border-white/10 md:border-0 pt-4 md:pt-0">
          <h4 class="text-white font-semibold mb-3">Contact</h4>
          <ul class="space-y-3 text-sm mb-5">
            <li class="flex items-start gap-2">
              <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>Douala – Cameroun, Akwa Rue face MTN Dubai</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-heroicons-phone" class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>+237 6 89 20 57 51 / 6 83 62 77 87</span>
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <a href="mailto:contact@brcmarket.com" class="hover:text-white transition break-all">
                contact@brcmarket.com
              </a>
            </li>
          </ul>

          <!-- ── NOT LOGGED IN → Se connecter ── -->
          <div v-if="!isLoggedIn">
            <NuxtLink to="/login">
              <UButton
                color="error"
                variant="solid"
                icon="i-heroicons-arrow-right-on-rectangle"
                size="sm"
                block
                class="font-semibold"
              >
                Se connecter
              </UButton>
            </NuxtLink>
          </div>

          <!-- ── LOGGED IN → Account dropdown ── -->
          <div v-else class="relative">
            <UButton
              color="white"
              variant="solid"
              icon="i-heroicons-user-circle"
              trailing-icon="i-heroicons-chevron-down"
              size="sm"
              block
              class="font-semibold text-[#274a82] justify-between"
              @click="userMenuOpen = !userMenuOpen"
            >
              Mon compte
            </UButton>

            <!-- Dropdown -->
            <div
              v-if="userMenuOpen"
              class="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100"
            >
              <!-- Menu links -->
              <NuxtLink
                v-for="link in userLinks"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#274a82] transition"
                @click="userMenuOpen = false"
              >
                <UIcon :name="link.icon" class="w-4 h-4 text-[#274a82]" />
                {{ link.label }}
              </NuxtLink>

              <!-- Divider -->
              <div class="border-t border-gray-100" />

              <!-- Logout -->
              <button
                class="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                @click="handleLogout"
              >
                <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          </div>

        </div>
      </div>
    </UContainer>

    <!-- ===== BOTTOM FOOTER ===== -->
    <div class="border-t border-gray-700">
      <UContainer class="py-4 flex flex-col items-center gap-3 md:flex-row md:justify-between text-xs text-gray-400">
        <span>© {{ year }} BRC Market. Tous droits réservés.</span>
        <div class="flex gap-4">
          <NuxtLink to="/mentions-legales" class="hover:text-white transition">Mentions légales</NuxtLink>
          <NuxtLink to="/politique-confidentialite" class="hover:text-white transition">Confidentialité</NuxtLink>
          <NuxtLink to="/conditions" class="hover:text-white transition">Conditions</NuxtLink>
        </div>
      </UContainer>
    </div>

  </footer>
</template>