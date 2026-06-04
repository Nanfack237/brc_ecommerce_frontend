<script setup lang="ts">
useHead({
  title: 'Mentions Légales',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
})

const sections = [
  {
    icon: 'i-heroicons-building-office-2',
    title: 'Éditeur du site',
    content: [
      { label: 'Raison sociale',   value: 'Business Revolution Company (BRC)' },
      { label: 'Forme juridique',  value: 'Entreprise individuelle / SARL' },
      { label: 'Siège social',     value: 'Akwa Douala, rue Castelnau — Juste après la rue du Collège King Akwa, Cameroun' },
      { label: 'Téléphone',        value: '+237 6 89 20 57 51 / 6 83 62 77 87' },
      { label: 'Email',            value: 'businessrevcompany@gmail.com' },
      { label: 'Secteur',          value: 'Commerce électronique — Technologies de l\'information et outils informatiques' },
    ]
  },
  {
    icon: 'i-heroicons-globe-alt',
    title: 'Hébergement',
    content: [
      { label: 'Hébergeur',   value: 'www.codechosting.cm' },
      { label: 'Site web',    value: 'https://brcmarket.com' },
    ]
  },
  {
    icon: 'i-heroicons-shield-check',
    title: 'Protection des données personnelles',
    paragraphs: [
      'Conformément aux lois en vigueur au Cameroun sur la protection des données personnelles, BRC Market s\'engage à protéger la vie privée de ses utilisateurs.',
      'Les données collectées (nom, email, téléphone, adresse de livraison) sont utilisées uniquement dans le cadre du traitement de vos commandes et de la relation client. Elles ne sont jamais cédées, vendues ou louées à des tiers.',
      'Vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données personnelles. Pour exercer ce droit, contactez-nous à : businessrevcompany@gmail.com.',
    ]
  },
  {
    icon: 'i-heroicons-shopping-cart',
    title: 'Conditions générales de vente',
    paragraphs: [
      'Les prix affichés sur BRC Market sont en Francs CFA (FCFA) et incluent toutes les taxes applicables. BRC Market se réserve le droit de modifier ses prix à tout moment.',
      'Toute commande passée sur le site vaut acceptation des prix et descriptions des produits. Les commandes sont définitives après confirmation du paiement.',
      'La livraison est disponible partout en Afrique. Les délais et frais de livraison sont communiqués lors de la validation de la commande.',
    ]
  },
  {
    icon: 'i-heroicons-arrow-path',
    title: 'Politique de retour',
    paragraphs: [
      'Vous disposez de 7 jours à compter de la réception de votre commande pour retourner un article. Le produit doit être dans son état d\'origine, non utilisé et dans son emballage d\'origine.',
      'Pour initier un retour, contactez notre service client par email ou téléphone. BRC Market prend en charge le remplacement ou le remboursement selon les cas.',
    ]
  },
  {
    icon: 'i-heroicons-wrench-screwdriver',
    title: 'Garantie & SAV',
    paragraphs: [
      'Tous les produits vendus sur BRC Market bénéficient d\'une garantie de 12 mois. Cette garantie couvre les défauts de fabrication et les pannes survenant dans des conditions normales d\'utilisation.',
      'Notre Service Après-Vente (SAV BRC Market) est disponible du Lundi au Samedi de 8h15 à 16h45. Contactez-nous au +237 6 89 20 57 51.',
    ]
  },
  {
    icon: 'i-heroicons-scale',
    title: 'Propriété intellectuelle',
    paragraphs: [
      'L\'ensemble du contenu de ce site (textes, images, logos, icônes, vidéos, données) est la propriété exclusive de BRC Market ou de ses partenaires et est protégé par les lois relatives à la propriété intellectuelle.',
      'Toute reproduction, distribution, modification ou utilisation commerciale de ce contenu sans autorisation préalable écrite de BRC Market est strictement interdite.',
    ]
  },
  {
    icon: 'i-heroicons-exclamation-triangle',
    title: 'Limitation de responsabilité',
    paragraphs: [
      'BRC Market s\'efforce de maintenir ce site accessible et à jour. Cependant, nous ne pouvons garantir l\'absence d\'interruptions liées à des opérations de maintenance ou à des problèmes techniques indépendants de notre volonté.',
      'BRC Market ne saurait être tenu responsable des dommages indirects résultant de l\'utilisation du site ou de l\'impossibilité d\'y accéder.',
    ]
  },
  {
    icon: 'i-heroicons-document-text',
    title: 'Droit applicable',
    paragraphs: [
      'Le présent site et ses mentions légales sont soumis au droit camerounais. En cas de litige, et à défaut de résolution amiable, les tribunaux compétents de Douala seront seuls compétents.',
    ]
  },
]
</script>

<template>
  <div class="bg-[#f4f4f4] min-h-screen pb-20">
    <div class="max-w-7xl mx-auto px-4">

      <!-- ===== HERO BANNER ===== -->
      <section class="relative h-[200px] md:h-[320px] mt flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-[#274a82] via-[#1a3460] to-[#0f1f3d]"></div>

        <!-- Décoration géométrique -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute -top-10 -right-10 w-64 h-64 rounded-full border border-white/10"></div>
          <div class="absolute -top-20 -right-20 w-96 h-96 rounded-full border border-white/5"></div>
          <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#e60012]/60 to-transparent"></div>
          <div class="absolute top-10 left-10 w-2 h-2 rounded-full bg-[#e60012]"></div>
          <div class="absolute top-20 left-24 w-1 h-1 rounded-full bg-white/40"></div>
          <div class="absolute bottom-12 right-32 w-1.5 h-1.5 rounded-full bg-[#e60012]/60"></div>
        </div>

        <div class="relative z-10 text-center px-6">
          <h1 class="text-3xl md:text-5xl font-black text-white my-5 tracking-tight">
            Mentions Légales
          </h1>
          <p class="text-gray-300 text-sm md:text-base max-w-lg mx-auto">
            Informations légales relatives à l'exploitation du site
            <span class="text-white font-bold">BRC Market</span>
          </p>
          <p class="text-gray-500 text-xs my-5">Dernière mise à jour : Mai 2026</p>
        </div>
      </section>

      <!-- ===== BREADCRUMB ===== -->
      <nav class="flex items-center gap-2 text-[13px] text-gray-500 font-medium py-4 border-b border-gray-200 mb-8">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">Boutique</NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <span class="text-[#274a82] font-bold">Mentions Légales</span>
      </nav>

      <!-- ===== TABLE DES MATIÈRES (desktop) ===== -->
      <div class="hidden lg:block mb-10">
        <div class="bg-white rounded-sm border border-gray-100 p-6 shadow-sm">
          <p class="text-[14px] font-black text-gray-400 tracking-widest mb-4">Table des matières</p>
          <div class="flex flex-wrap gap-2">
            <a
              v-for="(s, i) in sections" :key="i"
              :href="`#section-${i}`"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] font-bold text-[#274a82] bg-[#274a82]/5 hover:bg-[#274a82] hover:text-white transition-all duration-200 border border-[#274a82]/10"
            >
              <span class="text-[#e60012] font-black">{{ String(i + 1).padStart(2, '0') }}</span>
              {{ s.title }}
            </a>
          </div>
        </div>
      </div>

      <!-- ===== SECTIONS ===== -->
      <div class="space-y-6">
        <div
          v-for="(section, i) in sections"
          :key="i"
          :id="`section-${i}`"
          class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden scroll-mt-6"
        >
          <!-- Header section -->
          <div class="flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div class="w-9 h-9 rounded-sm bg-[#274a82] flex items-center justify-center flex-shrink-0">
              <UIcon :name="section.icon" class="w-4.5 h-4.5 text-white" />
            </div>
            <div class="flex items-center gap-3 flex-1">
              <span class="text-[11px] font-black text-[#e60012] tracking-widest">
                {{ String(i + 1).padStart(2, '0') }}
              </span>
              <h2 class="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                {{ section.title }}
              </h2>
            </div>
          </div>

          <!-- Contenu -->
          <div class="px-6 py-5">

            <!-- Table clé/valeur -->
            <div v-if="section.content" class="space-y-0 divide-y divide-gray-50">
              <div
                v-for="(item, j) in section.content"
                :key="j"
                class="flex items-start gap-4 py-3"
              >
                <span class="text-[14px] font-black text-gray-400 tracking-wider min-w-[140px] pt-0.5 flex-shrink-0">
                  {{ item.label }}
                </span>
                <span class="text-[13px] font-semibold text-gray-800 leading-relaxed">
                  {{ item.value }}
                </span>
              </div>
            </div>

            <!-- Paragraphes -->
            <div v-if="section.paragraphs" class="space-y-3">
              <p
                v-for="(para, j) in section.paragraphs"
                :key="j"
                class="text-[13px] sm:text-[14px] text-gray-600 leading-[1.8]"
              >
                {{ para }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== CONTACT FOOTER ===== -->
      <div class="mt-10 rounded-sm overflow-hidden border border-[#274a82]/20 shadow-sm">
        <div class=" bg-[#274a82] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-center sm:text-left">
            <p class="text-white font-black text-base mb-1">Une question sur ces mentions ?</p>
            <p class="text-gray-300 text-sm">Notre équipe est disponible du Lundi au Samedi de 8h15 à 16h45</p>
          </div>
          <div class="flex gap-3 flex-shrink-0">
            <NuxtLink to="/contact"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e60012] hover:bg-red-700 text-white text-sm font-black rounded-sm transition-all shadow-md">
              <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
              Nous contacter
            </NuxtLink>
            <a href="tel:+237689205751"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-black rounded-sm transition-all">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" />
              Appeler
            </a>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>