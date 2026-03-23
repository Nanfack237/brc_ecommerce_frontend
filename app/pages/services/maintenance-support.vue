<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'Support Technique',
  titleTemplate: (t) => t ? `${t} - BRC Market` : 'BRC Market',
})

const breadcrumbItems = [
  { label: 'Accueil',  to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Support Technique', to: '/services/maintenance-support', current: true },
]

const activeOffer = ref(1) // 0=Basique, 1=Pro, 2=Entreprise

const offers = [
  {
    name: 'Basique',
    price: '15 000',
    period: '/ intervention',
    color: '#0369a1',
    bg: '#e0f2fe',
    highlight: false,
    features: [
      'Support par téléphone',
      'Diagnostic à distance',
      'Résolution problèmes courants',
      'Délai de réponse : 4h',
      '1 intervention incluse',
    ],
    missing: ['Accès prioritaire', 'Support 24/7', 'Rapport mensuel'],
  },
  {
    name: 'Pro',
    price: '75 000',
    period: '/ mois',
    color: '#274a82',
    bg: '#eef2fb',
    highlight: true,
    features: [
      'Support téléphone + WhatsApp',
      'Diagnostic & résolution à distance',
      'Interventions illimitées',
      'Délai de réponse : 1h',
      'Accès prioritaire technicien',
      'Rapport mensuel inclus',
    ],
    missing: ['Support 24/7'],
  },
  {
    name: 'Entreprise',
    price: 'Sur devis',
    period: '',
    color: '#e60012',
    bg: '#fde8ea',
    highlight: false,
    features: [
      'Support dédié 24/7',
      'Technicien attitré',
      'Interventions illimitées',
      'Délai de réponse : 30 min',
      'Rapport hebdomadaire',
      'SLA garanti contractuellement',
      'Formation équipes incluse',
    ],
    missing: [],
  },
]

const supports = [
  {
    icon: 'i-heroicons-computer-desktop',
    color: '#274a82',
    bg: '#eef2fb',
    title: 'Support Système & OS',
    items: ['Installation Windows / Linux', 'Mise à jour pilotes', 'Résolution écran bleu', 'Optimisation démarrage'],
  },
  {
    icon: 'i-heroicons-wifi',
    color: '#0369a1',
    bg: '#e0f2fe',
    title: 'Réseau & Connectivité',
    items: ['Configuration Wi-Fi', 'Partage réseau local', 'VPN & accès distant', 'Diagnostic lenteur réseau'],
  },
  {
    icon: 'i-heroicons-shield-check',
    color: '#166534',
    bg: '#dcfce7',
    title: 'Sécurité Informatique',
    items: ['Suppression virus & malwares', 'Installation antivirus', 'Sécurisation données', 'Contrôle parental'],
  },
  {
    icon: 'i-heroicons-cloud',
    color: '#6b21a8',
    bg: '#f3e8ff',
    title: 'Cloud & Sauvegarde',
    items: ['Configuration OneDrive / G-Drive', 'Sauvegarde automatique', 'Récupération de données', 'Synchronisation multi-appareils'],
  },
  {
    icon: 'i-heroicons-printer',
    color: '#b45309',
    bg: '#fef3c7',
    title: 'Périphériques & Imprimantes',
    items: ['Installation imprimantes', 'Configuration réseau partagé', 'Dépannage scanner', 'Drivers & firmware'],
  },
  {
    icon: 'i-heroicons-building-office',
    color: '#e60012',
    bg: '#fde8ea',
    title: 'Logiciels Métier',
    items: ['Suite Office 365', 'Logiciels comptabilité', 'ERP & CRM PME', 'Formation utilisateurs'],
  },
]

const channels = [
  { icon: 'i-heroicons-phone', label: 'Téléphone', detail: 'Lun – Sam · 8h–18h', color: '#274a82' },
  { icon: 'i-heroicons-chat-bubble-left-right', label: 'WhatsApp', detail: 'Réponse < 30 min', color: '#25D366' },
  { icon: 'i-heroicons-envelope', label: 'Email', detail: 'Réponse < 2h', color: '#e60012' },
  { icon: 'i-heroicons-map-pin', label: 'En boutique', detail: 'Yaoundé · Sans RDV', color: '#0369a1' },
]

const faq = ref([
  { q: "Que couvre le support technique à distance ?", a: "Le support à distance couvre les problèmes logiciels, de configuration, de connectivité réseau, d'installation de logiciels et d'optimisation système. Pour les pannes matérielles, une intervention physique est nécessaire.", open: false },
  { q: "Comment fonctionne le support à distance ?", a: "Nous utilisons des outils sécurisés de prise en main à distance (TeamViewer, AnyDesk). Vous gardez le contrôle total et pouvez interrompre la session à tout moment.", open: false },
  { q: "Puis-je contacter le support en dehors des heures de bureau ?", a: "Les offres Basique et Pro couvrent les heures ouvrées (8h–18h). L'offre Entreprise inclut un support 24h/24 et 7j/7 avec astreinte.", open: false },
  { q: "Combien de temps dure une session de support ?", a: "La durée moyenne d'une session est de 30 à 90 minutes selon la complexité. Les interventions complexes peuvent nécessiter plusieurs sessions.", open: false },
])
</script>

<template>
  <div class="bg-white min-h-screen">

    <!-- ── HERO ── -->
    <section class="relative overflow-hidden" style="background: linear-gradient(135deg, #1a1a2e 0%, #274a82 60%, #0f3460 100%);">
      <!-- Grille décorative -->
      <div class="absolute inset-0 opacity-5 pointer-events-none"
        style="background-image: linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px); background-size: 40px 40px;">
      </div>
      <!-- Cercles lumineux -->
      <div class="absolute top-0 right-1/4 w-96 h-96 bg-[#274a82] rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      <div class="absolute bottom-0 left-1/4 w-64 h-64 bg-[#e60012] rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      <UContainer class="relative py-14 md:py-20">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-[12px] mb-8 text-white/50 font-medium overflow-x-auto">
          <template v-for="(item, index) in breadcrumbItems" :key="index">
            <NuxtLink :to="item.to" class="hover:text-white transition-colors whitespace-nowrap"
              :class="item.current ? 'text-white font-bold pointer-events-none' : ''">
              {{ item.label }}
            </NuxtLink>
            <span v-if="index < breadcrumbItems.length - 1" class="text-white/30">›</span>
          </template>
        </nav>

        <div class="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div class="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-5 border border-white/20">
              <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span class="text-white text-xs font-bold tracking-widest uppercase">Support actif</span>
            </div>
            <h1 class="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
              Support<br />
              <span class="text-[#e60012]">Technique</span><br />
              <span class="text-white/60 text-2xl md:text-3xl font-bold">Assistance IT Pro</span>
            </h1>
            <p class="text-white/70 text-base leading-relaxed mb-8 max-w-md">
              Résolution rapide de vos problèmes informatiques par des experts certifiés.
              À distance ou sur site, pour particuliers et entreprises.
            </p>
            <div class="flex flex-wrap gap-3">
              <NuxtLink to="/contact"
                class="flex items-center gap-2 px-6 py-3 bg-[#e60012] hover:bg-red-700 text-white font-bold rounded-xl transition-all text-sm shadow-lg">
                <UIcon name="i-heroicons-chat-bubble-left-right" class="w-4 h-4" />
                Contacter le support
              </NuxtLink>
              <a href="tel:+237000000000"
                class="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all text-sm">
                <UIcon name="i-heroicons-phone" class="w-4 h-4" />
                Appel direct
              </a>
            </div>
          </div>

          <!-- Canaux de contact -->
          <div class="grid grid-cols-2 gap-3">
            <div v-for="ch in channels" :key="ch.label"
              class="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/15 transition-colors cursor-default">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                :style="{ backgroundColor: ch.color + '30' }">
                <UIcon :name="ch.icon" class="w-5 h-5 text-white" />
              </div>
              <p class="font-black text-white text-sm">{{ ch.label }}</p>
              <p class="text-white/50 text-[11px] font-medium mt-0.5">{{ ch.detail }}</p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ── DOMAINES ── -->
    <section class="py-14 bg-[#f4f4f4]">
      <UContainer>
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 mb-2">Domaines d'intervention</h2>
          <p class="text-gray-500 text-sm max-w-lg mx-auto">Une couverture complète de vos besoins informatiques quotidiens.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="svc in supports" :key="svc.title"
            class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                :style="{ backgroundColor: svc.bg }">
                <UIcon :name="svc.icon" class="w-5 h-5" :style="{ color: svc.color }" />
              </div>
              <h3 class="font-black text-gray-900 text-sm leading-tight">{{ svc.title }}</h3>
            </div>
            <ul class="space-y-1.5">
              <li v-for="item in svc.items" :key="item" class="flex items-center gap-2 text-xs text-gray-600">
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :style="{ backgroundColor: svc.color }"></span>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ── OFFRES / TARIFS ── -->
    <section class="py-14 bg-white">
      <UContainer>
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 mb-2">Nos Formules</h2>
          <p class="text-gray-500 text-sm">Choisissez la formule adaptée à vos besoins et votre budget.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          <div v-for="(offer, i) in offers" :key="offer.name"
            @mouseenter="activeOffer = i"
            @mouseleave="activeOffer = 1"
            class="relative rounded-2xl border-2 overflow-hidden transition-all duration-300 cursor-default"
            :class="[
              offer.highlight ? 'border-[#274a82] shadow-xl shadow-[#274a82]/15 scale-105' : 'border-gray-100',
              activeOffer === i && !offer.highlight ? 'border-gray-300 shadow-md' : ''
            ]">
            <!-- Badge Populaire -->
            <div v-if="offer.highlight"
              class="absolute top-0 left-0 right-0 bg-[#274a82] text-white text-[10px] font-black text-center py-1.5 tracking-widest uppercase">
              ★ Le plus populaire
            </div>

            <div class="p-5" :class="offer.highlight ? 'pt-10' : ''">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <p class="font-black text-gray-900 text-base">{{ offer.name }}</p>
                  <div class="flex items-end gap-1 mt-1">
                    <span class="text-2xl font-black" :style="{ color: offer.color }">{{ offer.price }}</span>
                    <span v-if="offer.period" class="text-gray-400 text-xs font-medium mb-0.5">{{ offer.period }}</span>
                  </div>
                </div>
                <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ backgroundColor: offer.bg }">
                  <UIcon name="i-heroicons-check-badge" class="w-5 h-5" :style="{ color: offer.color }" />
                </div>
              </div>

              <div class="space-y-2 mb-5">
                <div v-for="feat in offer.features" :key="feat" class="flex items-start gap-2">
                  <UIcon name="i-heroicons-check" class="w-4 h-4 flex-shrink-0 mt-0.5" :style="{ color: offer.color }" />
                  <span class="text-xs text-gray-700 font-medium">{{ feat }}</span>
                </div>
                <div v-for="miss in offer.missing" :key="miss" class="flex items-start gap-2 opacity-40">
                  <UIcon name="i-heroicons-x-mark" class="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                  <span class="text-xs text-gray-400">{{ miss }}</span>
                </div>
              </div>

              <NuxtLink to="/contact"
                class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition-all"
                :class="offer.highlight
                  ? 'bg-[#274a82] hover:bg-[#1e3a6e] text-white shadow-sm'
                  : 'border-2 hover:bg-gray-50 text-gray-700'"
                :style="!offer.highlight ? { borderColor: offer.color, color: offer.color } : {}">
                Choisir cette offre
              </NuxtLink>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ── FAQ ── -->
    <section class="py-14 bg-[#f4f4f4]">
      <UContainer class="max-w-2xl">
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 mb-2">Questions fréquentes</h2>
        </div>
        <div class="space-y-3">
          <div v-for="(item, i) in faq" :key="i"
            class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
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

    <!-- ── CTA URGENCE ── -->
    <section class="py-12" style="background: linear-gradient(135deg, #e60012 0%, #b4000e 100%);">
      <UContainer class="text-center">
        <div class="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 mb-5">
          <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span class="text-white text-xs font-bold">Support disponible maintenant</span>
        </div>
        <h2 class="text-2xl md:text-3xl font-black text-white mb-3">Problème urgent ?</h2>
        <p class="text-white/70 mb-7 text-sm max-w-md mx-auto">
          Notre équipe technique répond en moins d'une heure. Ne restez pas bloqué.
        </p>
        <div class="flex flex-wrap gap-3 justify-center">
          <a href="tel:+237000000000"
            class="flex items-center gap-2 px-7 py-3.5 bg-white text-[#e60012] font-black rounded-xl transition-all text-sm hover:shadow-lg hover:-translate-y-0.5">
            <UIcon name="i-heroicons-phone" class="w-4 h-4" />
            Appeler maintenant
          </a>
          <NuxtLink to="/contact"
            class="flex items-center gap-2 px-7 py-3.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold rounded-xl transition-all text-sm">
            <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
            Envoyer un ticket
          </NuxtLink>
        </div>
      </UContainer>
    </section>

  </div>
</template>

<style scoped>
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
section { animation: fadeUp 0.5s ease both; }
</style>