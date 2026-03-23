<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'Sécurité Informatique',
  titleTemplate: (t) => t ? `${t} - BRC Market` : 'BRC Market',
})

const breadcrumbItems = [
  { label: 'Accueil',  to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Sécurité IT', to: '/services/securite-it', current: true },
]

const threats = [
  { icon: 'i-heroicons-bug-ant',            label: 'Virus & Malwares',     color: '#e60012' },
  { icon: 'i-heroicons-envelope',           label: 'Phishing & Spam',      color: '#b45309' },
  { icon: 'i-heroicons-lock-open',          label: 'Intrusions réseau',    color: '#6b21a8' },
  { icon: 'i-heroicons-document-minus',     label: 'Fuites de données',    color: '#0369a1' },
  { icon: 'i-heroicons-currency-dollar',    label: 'Ransomware',           color: '#e60012' },
  { icon: 'i-heroicons-exclamation-circle', label: 'Vulnérabilités 0-day', color: '#166534' },
]

const services = [
  {
    icon: 'i-heroicons-shield-check',
    color: '#274a82',
    bg: '#eef2fb',
    title: 'Audit de Sécurité',
    desc: "Évaluation complète de votre infrastructure IT. Rapport de vulnérabilités et plan de remédiation priorisé.",
    price: 'À partir de 150 000 FCFA',
    badge: 'Recommandé',
  },
  {
    icon: 'i-heroicons-bug-ant',
    color: '#e60012',
    bg: '#fde8ea',
    title: 'Suppression Virus & Malwares',
    desc: "Détection et éradication complète des logiciels malveillants. Nettoyage, réparation des fichiers système endommagés.",
    price: 'À partir de 15 000 FCFA',
    badge: null,
  },
  {
    icon: 'i-heroicons-lock-closed',
    color: '#0369a1',
    bg: '#e0f2fe',
    title: 'Sécurisation Réseau',
    desc: "Configuration firewall, segmentation VLAN, VPN sécurisé, filtrage DNS. Protection périmétrique avancée.",
    price: 'Sur devis',
    badge: null,
  },
  {
    icon: 'i-heroicons-key',
    color: '#166534',
    bg: '#dcfce7',
    title: 'Gestion des Accès (IAM)',
    desc: "Politique de mots de passe, authentification multi-facteur, contrôle des droits utilisateurs et journaux d'accès.",
    price: 'À partir de 50 000 FCFA',
    badge: null,
  },
  {
    icon: 'i-heroicons-cloud',
    color: '#6b21a8',
    bg: '#f3e8ff',
    title: 'Sauvegarde & Reprise',
    desc: "Stratégie de backup 3-2-1, tests de restauration, plan de reprise d'activité (PRA) documenté.",
    price: 'À partir de 30 000 FCFA',
    badge: null,
  },
  {
    icon: 'i-heroicons-academic-cap',
    color: '#b45309',
    bg: '#fef3c7',
    title: 'Sensibilisation Équipes',
    desc: "Formation des collaborateurs aux bonnes pratiques : phishing, mots de passe, RGPD, gestion des incidents.",
    price: 'À partir de 75 000 FCFA',
    badge: 'Essentiel PME',
  },
]

const certifs = [
  { name: 'ISO 27001', desc: 'Système de management de la sécurité' },
  { name: 'RGPD',      desc: 'Protection des données personnelles'   },
  { name: 'PCI-DSS',   desc: 'Sécurité des paiements'               },
  { name: 'SOC 2',     desc: 'Contrôles de sécurité cloud'           },
]

const levels = [
  { score: 95, label: 'Détection menaces',  color: '#274a82' },
  { score: 88, label: 'Réponse incidents',  color: '#e60012' },
  { score: 92, label: 'Conformité données', color: '#0369a1' },
  { score: 97, label: 'Uptime protégé',     color: '#166534' },
]

const faq = ref([
  {
    q: "Mon entreprise est-elle vraiment à risque ?",
    a: "Oui. Les PME africaines sont de plus en plus ciblées car souvent moins protégées. 60% des cyberattaques touchent des petites structures. Un seul incident peut coûter plusieurs millions de FCFA en perte de données et d'activité.",
    open: false,
  },
  {
    q: "Combien de temps dure un audit de sécurité ?",
    a: "Un audit standard dure 2 à 5 jours selon la taille de l'infrastructure. Nous livrons un rapport détaillé avec les vulnérabilités classées par criticité et les actions correctives recommandées.",
    open: false,
  },
  {
    q: "Proposez-vous un suivi après intervention ?",
    a: "Oui, nous proposons des contrats de surveillance continue avec monitoring 24/7, alertes en temps réel et rapports mensuels de sécurité.",
    open: false,
  },
  {
    q: "Que faire en cas d'incident de sécurité actif ?",
    a: "Appelez-nous immédiatement. Notre équipe de réponse aux incidents peut intervenir sous 2h pour isoler la menace, préserver les preuves et restaurer vos systèmes.",
    open: false,
  },
])
</script>

<template>
  <div class="bg-white min-h-screen">

    <!-- HERO -->
    <section class="relative overflow-hidden" style="background: #0d1117;">
      <div class="absolute inset-0 pointer-events-none"
        style="background: radial-gradient(ellipse 70% 60% at 30% 50%, rgba(39,74,130,0.4) 0%, transparent 70%)"></div>
      <div class="absolute inset-0 pointer-events-none"
        style="background: radial-gradient(ellipse 50% 60% at 80% 30%, rgba(230,0,18,0.2) 0%, transparent 60%)"></div>

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
            <div class="inline-flex items-center gap-2 bg-green-500/15 rounded-full px-4 py-1.5 mb-5 border border-green-500/30">
              <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-green-400" />
              <span class="text-green-400 text-xs font-bold tracking-widest uppercase">Protection Active</span>
            </div>
            <h1 class="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
              Sécurité<br />
              <span class="text-[#274a82]">Informatique</span><br />
              <span class="text-white/50 text-xl md:text-2xl font-bold">Défendez votre SI</span>
            </h1>
            <p class="text-white/60 text-base leading-relaxed mb-8 max-w-md">
              Audit, protection, formation — une approche globale pour sécuriser vos données, vos réseaux et vos utilisateurs contre les cybermenaces modernes.
            </p>
            <div class="flex flex-wrap gap-3">
              <NuxtLink to="/contact"
                class="flex items-center gap-2 px-6 py-3 bg-[#274a82] hover:bg-[#1e3a6e] text-white font-bold rounded-xl text-sm shadow-lg transition-all hover:-translate-y-0.5">
                <UIcon name="i-heroicons-shield-check" class="w-4 h-4" />
                Audit gratuit
              </NuxtLink>
              <a href="tel:+237000000000"
                class="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-sm transition-all">
                <UIcon name="i-heroicons-phone" class="w-4 h-4" />
                Urgence sécurité
              </a>
            </div>
          </div>

          <!-- Indicateurs -->
          <div class="space-y-4">
            <div class="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p class="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Taux de protection</p>
              <div class="space-y-3">
                <div v-for="lvl in levels" :key="lvl.label">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-white/70 text-xs font-medium">{{ lvl.label }}</span>
                    <span class="text-xs font-black" :style="{ color: lvl.color }">{{ lvl.score }}%</span>
                  </div>
                  <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-1000"
                      :style="{ width: lvl.score + '%', backgroundColor: lvl.color }"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div v-for="threat in threats" :key="threat.label"
                class="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col items-center text-center gap-1">
                <UIcon :name="threat.icon" class="w-4 h-4" :style="{ color: threat.color }" />
                <span class="text-[9px] text-white/50 font-bold leading-tight">{{ threat.label }}</span>
              </div>
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
          <p class="text-gray-500 text-sm max-w-lg mx-auto">Une offre complète couvrant tous les aspects de la cybersécurité pour les entreprises camerounaises.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="svc in services" :key="svc.title"
            class="relative bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
            <div v-if="svc.badge"
              class="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full"
              :style="{ backgroundColor: svc.bg, color: svc.color }">
              {{ svc.badge }}
            </div>
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
              :style="{ backgroundColor: svc.bg }">
              <UIcon :name="svc.icon" class="w-6 h-6" :style="{ color: svc.color }" />
            </div>
            <h3 class="font-black text-gray-900 text-base mb-2">{{ svc.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed mb-4">{{ svc.desc }}</p>
            <div class="flex items-center justify-between">
              <span class="text-xs font-black px-3 py-1 rounded-full" :style="{ backgroundColor: svc.bg, color: svc.color }">
                {{ svc.price }}
              </span>
              <NuxtLink to="/contact" class="text-xs font-bold text-gray-400 hover:text-[#e60012] transition-colors flex items-center gap-1">
                Devis <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- CONFORMITÉS -->
    <section class="py-12 bg-white">
      <UContainer>
        <p class="text-center text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Normes & conformités couvertes</p>
        <div class="flex flex-wrap justify-center gap-4">
          <div v-for="cert in certifs" :key="cert.name"
            class="flex flex-col items-center gap-1.5 bg-[#274a82]/5 border border-[#274a82]/15 rounded-2xl px-6 py-4 hover:bg-[#274a82]/10 transition-colors cursor-default">
            <span class="text-base font-black text-[#274a82]">{{ cert.name }}</span>
            <span class="text-[11px] text-gray-500 font-medium text-center">{{ cert.desc }}</span>
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
    <section class="py-12" style="background: #0d1117;">
      <UContainer class="text-center">
        <div class="inline-flex items-center gap-2 bg-green-500/15 rounded-full px-4 py-1.5 mb-5">
          <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span class="text-green-400 text-xs font-bold">Audit de sécurité gratuit</span>
        </div>
        <h2 class="text-2xl md:text-3xl font-black text-white mb-3">Êtes-vous vraiment protégé ?</h2>
        <p class="text-white/50 mb-7 text-sm max-w-md mx-auto">Découvrez les vulnérabilités de votre SI avant que les hackers ne le fassent. Audit express gratuit sous 48h.</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <NuxtLink to="/contact"
            class="flex items-center gap-2 px-7 py-3.5 bg-[#274a82] hover:bg-[#1e3a6e] text-white font-black rounded-xl text-sm shadow-lg transition-all">
            <UIcon name="i-heroicons-shield-check" class="w-4 h-4" />
            Demander l'audit
          </NuxtLink>
          <a href="tel:+237000000000"
            class="flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-sm transition-all">
            <UIcon name="i-heroicons-phone" class="w-4 h-4" />
            Incident actif ?
          </a>
        </div>
      </UContainer>
    </section>

  </div>
</template>