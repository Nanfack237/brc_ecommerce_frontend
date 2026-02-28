<script setup lang="ts">
import { ref } from 'vue'

const year = new Date().getFullYear()
const whatsappNumber = "237683627787"

// Accordéon mobile
const openSection = ref<string | null>(null)
const toggle = (section: string) => {
  openSection.value = openSection.value === section ? null : section
}
</script>

<template>
  <footer class="bg-[#274a82] text-gray-300">

    <!-- ===== TOP FOOTER ===== -->
    <UContainer class="py-10">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-10">

        <!-- BRAND (toujours visible) -->
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

          <!-- SOCIAL + Qui sommes-nous -->
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

        <!-- BOUTIQUE — accordéon sur mobile, normal sur desktop -->
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

        <!-- SERVICES — accordéon sur mobile -->
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

        <!-- CONTACT — toujours visible sur mobile (info importante) -->
        <div class="border-t border-white/10 md:border-0 pt-4 md:pt-0">
          <h4 class="text-white font-semibold mb-3">Contact</h4>
          <ul class="space-y-3 text-sm">
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

          <!-- Bouton WhatsApp rapide sur mobile -->
          <!-- <a
            :href="`https://wa.me/${whatsappNumber}`"
            target="_blank"
            class="mt-4 flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition"
          >
            <UIcon name="i-simple-icons-whatsapp" class="w-4 h-4" />
            Nous contacter sur WhatsApp
          </a> -->
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