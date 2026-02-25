<script setup lang="ts">

  useHead({
    title: 'BRC Market',
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - Apropos de Nous` : 'BRC Market';
    },
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  })

</script>

<template>
  <div class="mx-12">

    <!-- ================= HERO ABOUT ================= -->
    <section
      class="relative h-[300px] md:h-[380px] flex items-center justify-center overflow-hidden mx-4 mt-6"
    >
      <!-- Background -->
      <img
        src="/images/about-us1.jpg"
        alt="À propos de BRC Market"
        class="absolute inset-0 w-full h-full object-cover"
      />

      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/60"></div>

      <!-- Content -->
      <div class="relative z-10 text-center px-6">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
          À propos de BRC Market
        </h1>
        <p class="text-gray-200 max-w-3xl mx-auto text-lg">
          Votre partenaire technologique de confiance à Douala et partout au Cameroun
        </p>
      </div>
    </section>

    <!-- ================= INTRO ================= -->
    <UContainer class="py-10">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl font-semibold mb-6">
          Qui sommes-nous ?
        </h2>
        <p class="text-gray-600 leading-relaxed text-lg">
          <span class="font-semibold text-gray-800">BRC Market</span> est une entreprise
          spécialisée dans la vente de matériel informatique, électronique et
          technologique, ainsi que dans les services IT professionnels.
          <br /><br />
          Nous accompagnons particuliers, entreprises et institutions avec des
          solutions fiables, performantes et adaptées à leurs besoins.
        </p>
      </div>
    </UContainer>

    <!-- ================= VALUES ================= -->
    <UContainer class="pb-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

        <UCard class="p-8 text-center shadow-lg">
          <UIcon name="i-heroicons-shield-check" class="w-10 h-10 text-red-600 mx-auto mb-4" />
          <h3 class="text-xl font-semibold mb-2">Fiabilité</h3>
          <p class="text-gray-600">
            Des produits certifiés, testés et garantis pour une tranquillité totale.
          </p>
        </UCard>

        <UCard class="p-8 text-center shadow-lg">
          <UIcon name="i-heroicons-light-bulb" class="w-10 h-10 text-red-600 mx-auto mb-4" />
          <h3 class="text-xl font-semibold mb-2">Innovation</h3>
          <p class="text-gray-600">
            Nous suivons l’évolution technologique pour vous proposer le meilleur.
          </p>
        </UCard>

        <UCard class="p-8 text-center shadow-lg">
          <UIcon name="i-heroicons-user-group" class="w-10 h-10 text-red-600 mx-auto mb-4" />
          <h3 class="text-xl font-semibold mb-2">Proximité</h3>
          <p class="text-gray-600">
            Une équipe locale, disponible et à l’écoute de vos besoins.
          </p>
        </UCard>

      </div>
    </UContainer>

    <!-- ================= SERVICES ================= -->
    <section class="bg-gray-50 py-10">
      <UContainer>
        <h2 class="text-3xl font-semibold text-center mb-12">
          Ce que nous faisons
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          <UCard class="p-6 shadow-md">
            <h3 class="font-semibold mb-2">Vente de matériel</h3>
            <p class="text-gray-600 text-sm">
              Ordinateurs, smartphones, accessoires, imprimantes, réseaux et sécurité.
            </p>
          </UCard>

          <UCard class="p-6 shadow-md">
            <h3 class="font-semibold mb-2">Maintenance & Réparation</h3>
            <p class="text-gray-600 text-sm">
              Diagnostic, réparation et optimisation de vos équipements.
            </p>
          </UCard>

          <UCard class="p-6 shadow-md">
            <h3 class="font-semibold mb-2">Infrastructure IT</h3>
            <p class="text-gray-600 text-sm">
              Réseaux, serveurs, vidéosurveillance et solutions professionnelles.
            </p>
          </UCard>

          <UCard class="p-6 shadow-md">
            <h3 class="font-semibold mb-2">Sécurité informatique</h3>
            <p class="text-gray-600 text-sm">
              Protection des données, firewalls, contrôle d’accès et biométrie.
            </p>
          </UCard>

          <UCard class="p-6 shadow-md">
            <h3 class="font-semibold mb-2">Audit & Conseil</h3>
            <p class="text-gray-600 text-sm">
              Analyse, recommandations et accompagnement stratégique IT.
            </p>
          </UCard>

          <UCard class="p-6 shadow-md">
            <h3 class="font-semibold mb-2">Support & SAV</h3>
            <p class="text-gray-600 text-sm">
              Assistance technique avant et après vente, rapide et efficace.
            </p>
          </UCard>

        </div>
      </UContainer>
    </section>

    <!-- ================= CTA ================= -->
    <UContainer class="py-20 text-center">
      <h2 class="text-3xl font-semibold mb-4">
        Travaillons ensemble
      </h2>
      <p class="text-gray-600 mb-8 max-w-2xl mx-auto">
        Vous avez un projet ou besoin d’un accompagnement technologique ?
        Contactez-nous dès aujourd’hui.
      </p>

      <div class="flex justify-center gap-4">
        <UButton color="error" size="lg" to="/contact">
          Nous contacter
        </UButton>
        <UButton class="bg-[#274a82] hover:bg-[#274a82] text-white" size="lg" to="/boutique">
          Voir la boutique
        </UButton>
      </div>
    </UContainer>

  </div>
</template>
