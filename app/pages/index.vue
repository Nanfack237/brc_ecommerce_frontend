<script setup lang="ts">
const items = [
{
  image: '/images/publicity0.jpg',
  title: 'Grande Promotion Jusqu’à -40%',
  subtitle: 'Ordinateurs portables et accessoires de haute qualité',
  cta: 'Commander Maintenant'
},
{
  image: '/images/publicity1.jpg',
  title: 'Nouveautés',
  subtitle: 'Des machines puissantes pour les professionnels',
  cta: 'Découvrir'
},
{
  image: '/images/publicity2.jpg',
  title: 'Meilleures Offres de la Semaine',
  subtitle: 'Une Semaine de Haute Gamme',
  cta: 'Voir les Offres'
},
{
  image: '/images/publicity3.jpg',
  title: 'Vivez la Tech avec BRC',
  subtitle: 'Une technologie fiable au meilleur prix',
  cta: 'Voir'
},
{
  image: '/images/publicity4.jpg',
  title: 'Une Maintainance garantie et fiable',
  subtitle: 'Votre machine notre priorité',
  cta: 'Services proposer'
},
{
  image: '/images/publicity5.jpg',
  title: 'Nous Vendons le Neuf et Occasion',
  subtitle: 'Tout depend de vous',
  cta: 'Aller à la Boutique'
},
{
  image: '/images/publicity6.jpg',
  title: 'Meilleures Offres en Smartphones et Tablettes',
  subtitle: 'La qualité  à petit prix',
  cta: 'Voir'
}

]
</script>

<template>
  <!-- 🔥 HERO / PUBLICITY SECTION -->
  <section class="mx-4 my-4">
    <UCarousel
      v-slot="{ item }"
      :items="items"
      fade
     
      dots
      autoplay
      :interval="1000"
      class="relative h-[420px] md:h-[500px]"
    >
      <img
        :src="item.image"
        class="w-full h-137"
        alt="promotion banner"
        
      />

      <div class="absolute inset-0 bg-black/50"></div>

      <div class="absolute inset-0 flex items-center">
        <div class="max-w-7xl mx-auto px-6 text-white">
          <h1 class="text-3xl md:text-5xl font-bold mb-4">
            {{ item.title }}
          </h1>
          <p class="text-lg md:text-xl mb-6">
            {{ item.subtitle }}
          </p>
          <button
            class="bg-error px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            {{ item.cta }}
          </button>
        </div>
      </div>
    </UCarousel>
  </section>

  <!-- ✅ TRUST / SERVICES SECTION -->
  <section class="mx-4 my-8 bg-gray-50 rounded-xl py-8">
    <div
      class="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
    >
      <!-- Livraison Rapide -->
      <div class="flex flex-col items-center gap-3">
        <UIcon name="i-heroicons-truck" class="w-10 h-10 text-error" />
        <h3 class="font-semibold text-lg">Livraison Rapide</h3>
        <p class="text-sm text-gray-600">
          Livraison fiable et rapide partout au Cameroun
        </p>
      </div>

      <!-- Garantie -->
      <div class="flex flex-col items-center gap-3">
        <UIcon name="i-heroicons-shield-check" class="w-10 h-10 text-error" />
        <h3 class="font-semibold text-lg">Garantie</h3>
        <p class="text-sm text-gray-600">
          Produits certifiés avec garantie incluse
        </p>
      </div>

      <!-- SAV -->
      <div class="flex flex-col items-center gap-3">
        <UIcon name="i-heroicons-phone" class="w-10 h-10 text-error" />
        <h3 class="font-semibold text-lg">SAV 24/7</h3>
        <p class="text-sm text-gray-600">
          Assistance client avant et après achat
        </p>
      </div>
    </div>
  </section>
</template>
