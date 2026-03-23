<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'Audit & Câblage Réseau',
  titleTemplate: (t) => t ? `${t} - BRC Market` : 'BRC Market',
})

const breadcrumbItems = [
  { label: 'Accueil',  to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Audit & Câblage', to: '/services/audit', current: true },
]

const services = [
  {
    icon: 'i-heroicons-magnifying-glass',
    color: '#274a82',
    bg: '#eef2fb',
    title: 'Audit Réseau',
    desc: "Analyse complète de votre infrastructure réseau existante. Cartographie, détection des goulots d'étranglement, rapport de recommandations.",
    price: 'À partir de 100 000 FCFA',
  },
  {
    icon: 'i-heroicons-wifi',
    color: '#0369a1',
    bg: '#e0f2fe',
    title: 'Câblage Structuré Cat6/Cat6A',
    desc: "Installation de câblage cuivre certifié Cat6 et Cat6A. Baies de brassage, patch panels, prises RJ45 encastrées.",
    price: 'Sur devis (au mètre)',
  },
  {
    icon: 'i-heroicons-light-bulb',
    color: '#b45309',
    bg: '#fef3c7',
    title: 'Fibre Optique',
    desc: "Déploiement fibre monomode et multimode. Soudure, raccordement, test de réflectométrie. Backbone d'entreprise.",
    price: 'Sur devis',
  },
  {
    icon: 'i-heroicons-server',
    color: '#166534',
    bg: '#dcfce7',
    title: 'Baies & Armoires Réseau',
    desc: "Installation et organisation des baies de brassage, switches, patch panels. Câblage propre et documenté.",
    price: 'À partir de 80 000 FCFA',
  },
  {
    icon: 'i-heroicons-signal',
    color: '#6b21a8',
    bg: '#f3e8ff',
    title: 'Wi-Fi Entreprise',
    desc: "Étude de couverture, installation de points d'accès professionnels (Ubiquiti, Cisco, TP-Link EAP). SSID, VLAN, portail captif.",
    price: 'À partir de 120 000 FCFA',
  },
  {
    icon: 'i-heroicons-document-check',
    color: '#e60012',
    bg: '#fde8ea',
    title: 'Certification & Documentation',
    desc: "Tests de certification des liens, rapport Fluke Networks, plans de câblage AutoCAD, DOE (Dossier des Ouvrages Exécutés).",
    price: 'Inclus dans chaque chantier',
  },
]

const standards = [
  { name: 'ISO/IEC 11801', desc: 'Câblage générique'    },
  { name: 'TIA-568',       desc: 'Câblage commercial'   },
  { name: 'EN 50173',      desc: 'Norme européenne'     },
  { name: 'Cat6A 10GbE',   desc: '10 Gigabit Ethernet'  },
]

const steps = [
  {
    num: '01',
    icon: 'i-heroicons-magnifying-glass',
    title: 'Étude de site',
    desc: "Relevé des locaux, analyse des besoins, étude de faisabilité et chiffrage.",
  },
  {
    num: '02',
    icon: 'i-heroicons-document-text',
    title: 'Conception',
    desc: "Plans de câblage, schémas réseau, sélection du matériel et soumission.",
  },
  {
    num: '03',
    icon: 'i-heroicons-wrench',
    title: 'Déploiement',
    desc: "Installation des chemins de câbles, tirage, raccordements et étiquetage.",
  },
  {
    num: '04',
    icon: 'i-heroicons-check-badge',
    title: 'Certification',
    desc: "Tests Fluke, mesures de performance, rapport et remise de la documentation.",
  },
]

const realizations = [
  {
    type: 'Bureau 50 postes',
    detail: 'Câblage Cat6A + Wi-Fi Ubiquiti',
    location: 'Yaoundé Centre',
    icon: 'i-heroicons-building-office',
  },
  {
    type: 'Hôtel 3 étoiles',
    detail: '45 AP Wi-Fi + Fibre optique',
    location: 'Bastos',
    icon: 'i-heroicons-building-office-2',
  },
  {
    type: 'Entrepôt logistique',
    detail: 'Câblage industriel + switches PoE',
    location: 'Douala PK 10',
    icon: 'i-heroicons-building-storefront',
  },
  {
    type: 'Banque — Agence',
    detail: 'Câblage sécurisé + VLAN dédié',
    location: 'Mvog-Ada',
    icon: 'i-heroicons-banknotes',
  },
]

const faq = ref([
  {
    q: "Quelle est la différence entre Cat5e, Cat6 et Cat6A ?",
    a: "Le Cat5e supporte 1 Gbps jusqu'à 100m. Le Cat6 monte à 10 Gbps sur 55m avec moins d'interférences. Le Cat6A supporte 10 Gbps sur 100m complet. Nous recommandons Cat6A pour toute nouvelle installation.",
    open: false,
  },
  {
    q: "Combien de temps prend l'installation d'un câblage de bureau ?",
    a: "Pour un bureau de 20 à 50 postes, comptez 2 à 5 jours de chantier. Les grands projets sont planifiés en phases pour ne pas perturber votre activité.",
    open: false,
  },
  {
    q: "Est-ce que vous intervenez pendant les week-ends ?",
    a: "Oui, pour minimiser l'impact sur votre activité, nous pouvons planifier les phases critiques du chantier en dehors des heures de travail (soir, week-end).",
    open: false,
  },
  {
    q: "Fournissez-vous une garantie sur le câblage ?",
    a: "Oui. Chaque installation est certifiée avec un testeur Fluke. Nous fournissons un rapport de certification complet et offrons une garantie de 15 ans sur le système de câblage.",
    open: false,
  },
])
</script>

<template>
  <div class="bg-white min-h-screen">

    <!-- HERO -->
    <section class="relative overflow-hidden" style="background: linear-gradient(160deg, #1c2b4a 0%, #274a82 50%, #1a3d6e 100%);">
      <!-- Lignes de câblage décoratives -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
        <svg class="w-full h-full" viewBox="0 0 800 400" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M0,100 Q200,80 400,120 Q600,160 800,100" stroke="white" stroke-width="1" fill="none"/>
          <path d="M0,150 Q200,130 400,170 Q600,210 800,150" stroke="white" stroke-width="0.5" fill="none"/>
          <path d="M0,200 Q200,180 400,220 Q600,260 800,200" stroke="white" stroke-width="0.5" fill="none"/>
          <circle cx="200" cy="87"  r="4" fill="white"   opacity="0.6"/>
          <circle cx="400" cy="120" r="4" fill="white"   opacity="0.6"/>
          <circle cx="600" cy="160" r="4" fill="white"   opacity="0.6"/>
          <circle cx="100" cy="150" r="3" fill="#e60012" opacity="0.8"/>
          <circle cx="500" cy="175" r="3" fill="#e60012" opacity="0.8"/>
          <circle cx="700" cy="155" r="3" fill="#e60012" opacity="0.8"/>
        </svg>
      </div>

      <UContainer class="relative py-14 md:py-20">
        <nav class="flex items-center gap-2 text-[12px] mb-8 text-white/50 font-medium overflow-x-auto">
          <template v-for="(item, index) in breadcrumbItems" :key="index">
            <NuxtLink :to="item.to" class="hover:text-white transition-colors whitespace-nowrap"
              :class="item.current ? 'text-white font-bold pointer-events-none' : ''">
              {{ item.label }}
            </NuxtLink>
            <span v-if="index < breadcrumbItems.length - 1" class="text-white/30">›</span>
          </template>
        </nav>

        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div class="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-5 border border-white/20">
              <UIcon name="i-heroicons-wifi" class="w-4 h-4 text-white" />
              <span class="text-white text-xs font-bold tracking-widest uppercase">Infrastructure Réseau</span>
            </div>
            <h1 class="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
              Audit &<br />
              <span class="text-[#e60012]">Câblage</span><br />
              <span class="text-white/60 text-2xl md:text-3xl font-bold">Réseau Structuré</span>
            </h1>
            <p class="text-white/70 text-base leading-relaxed mb-8 max-w-md">
              Conception, déploiement et certification de vos infrastructures réseau. Cat6A, fibre optique, Wi-Fi entreprise. Normes internationales garanties.
            </p>
            <div class="flex flex-wrap gap-3">
              <NuxtLink to="/contact"
                class="flex items-center gap-2 px-6 py-3 bg-[#e60012] hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-lg transition-all hover:-translate-y-0.5">
                <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
                Demander un devis
              </NuxtLink>
              <a href="tel:+237000000000"
                class="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-sm transition-all">
                <UIcon name="i-heroicons-phone" class="w-4 h-4" />
                Appeler
              </a>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div v-for="stat in [
              { val: '15 ans', label: 'Garantie câblage',      icon: 'i-heroicons-shield-check'  },
              { val: '10 Gbps', label: 'Cat6A max',            icon: 'i-heroicons-bolt'           },
              { val: 'Fluke',   label: 'Certification testeur', icon: 'i-heroicons-check-badge'   },
              { val: '100%',    label: 'Chantiers documentés',  icon: 'i-heroicons-document-check'},
            ]" :key="stat.label"
              class="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-sm">
              <UIcon :name="stat.icon" class="w-5 h-5 text-white/50 mb-2" />
              <p class="text-2xl font-black text-white leading-none">{{ stat.val }}</p>
              <p class="text-white/50 text-[11px] font-medium mt-1 leading-tight">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- SERVICES -->
    <section class="py-14 bg-[#f4f4f4]">
      <UContainer>
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 mb-2">Nos Prestations</h2>
          <p class="text-gray-500 text-sm max-w-lg mx-auto">De l'audit initial à la certification finale, nous prenons en charge l'intégralité de vos projets réseau.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="svc in services" :key="svc.title"
            class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
              :style="{ backgroundColor: svc.bg }">
              <UIcon :name="svc.icon" class="w-6 h-6" :style="{ color: svc.color }" />
            </div>
            <h3 class="font-black text-gray-900 text-base mb-2">{{ svc.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed mb-4">{{ svc.desc }}</p>
            <span class="text-xs font-black px-3 py-1 rounded-full" :style="{ backgroundColor: svc.bg, color: svc.color }">
              {{ svc.price }}
            </span>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- PROCESSUS -->
    <section class="py-14 bg-white">
      <UContainer>
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 mb-2">Méthodologie Projet</h2>
          <p class="text-gray-500 text-sm">Chaque projet est mené avec rigueur, de l'étude de site à la remise du DOE.</p>
        </div>
        <div class="relative">
          <div class="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#274a82] to-[#e60012] opacity-20"></div>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div v-for="step in steps" :key="step.num" class="flex flex-col items-center text-center">
              <div class="w-16 h-16 rounded-2xl bg-[#274a82] flex flex-col items-center justify-center mb-4 shadow-lg shadow-[#274a82]/20">
                <UIcon :name="step.icon" class="w-6 h-6 text-white" />
                <span class="text-[9px] font-black text-white/50 mt-0.5">{{ step.num }}</span>
              </div>
              <h3 class="font-black text-gray-900 mb-2 text-sm">{{ step.title }}</h3>
              <p class="text-gray-500 text-xs leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- RÉALISATIONS -->
    <section class="py-14 bg-[#f4f4f4]">
      <UContainer>
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 mb-2">Réalisations Récentes</h2>
          <p class="text-gray-500 text-sm">Quelques projets livrés avec succès à Yaoundé et Douala.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="real in realizations" :key="real.type"
            class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
            <div class="w-10 h-10 rounded-xl bg-[#274a82]/10 flex items-center justify-center mb-3">
              <UIcon :name="real.icon" class="w-5 h-5 text-[#274a82]" />
            </div>
            <h4 class="font-black text-gray-900 text-sm mb-1">{{ real.type }}</h4>
            <p class="text-gray-500 text-xs mb-2 leading-snug">{{ real.detail }}</p>
            <div class="flex items-center gap-1.5">
              <UIcon name="i-heroicons-map-pin" class="w-3 h-3 text-[#e60012]" />
              <span class="text-[11px] text-gray-400 font-medium">{{ real.location }}</span>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- NORMES -->
    <section class="py-10 bg-white border-y border-gray-100">
      <UContainer>
        <p class="text-center text-xs font-black text-gray-400 uppercase tracking-widest mb-5">Normes & standards respectés</p>
        <div class="flex flex-wrap justify-center gap-3">
          <div v-for="std in standards" :key="std.name"
            class="flex flex-col items-center gap-1 bg-[#274a82]/5 border border-[#274a82]/15 rounded-xl px-5 py-3 hover:bg-[#274a82]/10 transition-colors cursor-default">
            <span class="text-sm font-black text-[#274a82]">{{ std.name }}</span>
            <span class="text-[10px] text-gray-500 font-medium">{{ std.desc }}</span>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- FAQ -->
    <section class="py-14 bg-[#f4f4f4]">
      <UContainer class="max-w-2xl">
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 mb-2">Questions fréquentes</h2>
        </div>
        <div class="space-y-3">
          <div v-for="(item, i) in faq" :key="i" class="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <button @click="item.open = !item.open"
              class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors gap-4">
              <span class="font-bold text-gray-800 text-sm">{{ item.q }}</span>
              <UIcon name="i-heroicons-chevron-down" class="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200"
                :class="item.open ? 'rotate-180 text-[#274a82]' : ''" />
            </button>
            <div v-if="item.open" class="px-5 pb-4">
              <p class="text-gray-500 text-sm leading-relaxed">{{ item.a }}</p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- CTA -->
    <section class="py-12 bg-[#274a82]">
      <UContainer class="text-center">
        <h2 class="text-2xl md:text-3xl font-black text-white mb-3">Un projet réseau en tête ?</h2>
        <p class="text-white/60 mb-7 text-sm max-w-md mx-auto">Étude de site gratuite, devis détaillé sous 48h. Intervention à Yaoundé, Douala et villes environnantes.</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <NuxtLink to="/contact"
            class="flex items-center gap-2 px-7 py-3.5 bg-[#e60012] hover:bg-red-700 text-white font-black rounded-xl text-sm shadow-lg transition-all">
            <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
            Demander un devis
          </NuxtLink>
          <a href="tel:+237000000000"
            class="flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-sm transition-all">
            <UIcon name="i-heroicons-phone" class="w-4 h-4" />
            Appeler
          </a>
        </div>
      </UContainer>
    </section>

  </div>
</template>