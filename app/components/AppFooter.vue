<script setup lang="ts">
const year = new Date().getFullYear()

const whatsappNumber = "237683627787"
</script>

<template>
  <footer class="bg-[#274a82] text-gray-300 ">
    <!-- TOP FOOTER -->
    <UContainer class="py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10">

        <!-- BRAND -->
        <div>
          <div class="flex items-center gap-3 mb-4">
            <img
              src="/brclogo.png"
              alt="BRC Market"
              class="h-12 w-auto object-contain"
            />
            <span class="text-xl font-bold text-white">
              BRC Market
            </span>
          </div>

          <p class="text-sm text-gray-400 leading-relaxed">
            BRC Market est votre partenaire de confiance pour
            l’achat de matériel informatique, smartphones,
            réseaux et services IT professionnels au Cameroun.
          </p>

          <!-- SOCIAL -->
          <div class="flex gap-3 mt-4">
            <NuxtLink to="https://www.facebook.com/profile.php?id=61555704845467">
              <UButton
                icon="i-lucide-facebook"
                color="gray"
                variant="ghost"
                size="sm"
              />
            </NuxtLink>
            <NuxtLink to="https://wa.me/237683627787?text=">
              <UButton
                icon="i-simple-icons-whatsapp"
                color="gray"
                variant="ghost"
                size="sm"
            />
            </NuxtLink>
            
            <NuxtLink to="/about-us" class="hover:text-white transition">
              Qui sommes-nous ?
            </NuxtLink>
           
          </div>
             
        </div>

        <!-- SHOP -->
        <div>
          <h4 class="text-white font-semibold mb-4">
            Boutique
          </h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/boutique">Tous les produits</NuxtLink></li>
            <li><NuxtLink to="/categories/laptops">Ordinateurs</NuxtLink></li>
            <li><NuxtLink to="/categories/smartphones">Smartphones</NuxtLink></li>
            <li><NuxtLink to="/categories/accessoires">Accessoires</NuxtLink></li>
          </ul>
        </div>

        <!-- SERVICES -->
        <div>
          <h4 class="text-white font-semibold mb-4">
            Nos Services
          </h4>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/services/maintenance">Maintenance & Réparation</NuxtLink></li>
            <li><NuxtLink to="/services/integration">Intégration IT</NuxtLink></li>
            <li><NuxtLink to="/services/videosurveillance">Vidéo Surveillance</NuxtLink></li>
            <li><NuxtLink to="/services/reseau">Réseau & Sécurité</NuxtLink></li>
          </ul>
        </div>

        <!-- CONTACT -->
        <div>
          <h4 class="text-white font-semibold mb-4">
            Contact
          </h4>
          <ul class="space-y-3 text-sm">
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-red-500" />
              Douala – Cameroun
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-phone" class="w-5 h-5 text-red-500" />
              +237 6 89 20 57 51 / 6 83 62 77 87
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-red-500" />
              contact@brcmarket.com
            </li>

          </ul>
        </div>

      </div>
    </UContainer>

    <!-- BOTTOM FOOTER -->
    <div class="border-t border-gray-800">
      <UContainer class="py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-400">
        <span>
          © {{ year }} BRC Market. Tous droits réservés.
        </span>

        <div class="flex gap-4">
          <NuxtLink to="/mentions-legales">Mentions légales</NuxtLink>
          <NuxtLink to="/politique-confidentialite">Confidentialité</NuxtLink>
          <NuxtLink to="/conditions">Conditions</NuxtLink>
        </div>
      </UContainer>
    </div>
  </footer>
</template>
