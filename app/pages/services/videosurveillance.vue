<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'Vidéosurveillance & Sécurité',
  titleTemplate: (t) => t ? `${t} - BRC Market` : 'BRC Market',
})

const breadcrumbItems = [
  { label: 'Accueil',  to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Vidéosurveillance', to: '/services/videosurveillance', current: true },
]

const solutions = [
  {
    icon: 'i-heroicons-video-camera',
    color: '#274a82', bg: '#eef2fb',
    title: 'Caméras IP HD/4K',
    desc: 'Installation de caméras intérieures et extérieures haute résolution. Vision nocturne, grand angle, résistance aux intempéries.',
    price: 'À partir de 45 000 FCFA',
  },
  {
    icon: 'i-heroicons-server-stack',
    color: '#e60012', bg: '#fde8ea',
    title: 'Enregistreurs NVR/DVR',
    desc: 'Enregistreurs réseau et numériques avec stockage local. Capacité de 1 To à 16 To. Accès cloud inclus.',
    price: 'À partir de 80 000 FCFA',
  },
  {
    icon: 'i-heroicons-device-phone-mobile',
    color: '#0369a1', bg: '#e0f2fe',
    title: 'Surveillance à Distance',
    desc: "Accès en temps réel depuis votre smartphone ou PC. Notifications d'alertes mouvement. Application mobile incluse.",
    price: "Inclus dans l'installation",
  },
  {
    icon: 'i-heroicons-bell-alert',
    color: '#166534', bg: '#dcfce7',
    title: 'Détection & Alertes',
    desc: "Détection de mouvement intelligente, zones d'exclusion configurables, alertes par SMS et email.",
    price: 'À partir de 15 000 FCFA',
  },
  {
    icon: 'i-heroicons-building-office-2',
    color: '#b45309', bg: '#fef3c7',
    title: 'Installation en Entreprise',
    desc: "Systèmes multi-caméras pour bureaux, entrepôts, commerces. Jusqu'à 64 caméras sur un seul enregistreur.",
    price: 'Sur devis',
  },
  {
    icon: 'i-heroicons-wrench-screwdriver',
    color: '#6b21a8', bg: '#f3e8ff',
    title: 'Maintenance & SAV',
    desc: "Contrats de maintenance préventive, remplacement caméras défectueuses, mise à jour firmware.",
    price: 'À partir de 20 000 FCFA / an',
  },
]

const packages = [
  {
    name: 'Résidentiel',
    cams: '2–4 caméras',
    price: '150 000',
    color: '#274a82',
    bg: '#eef2fb',
    highlight: false,
    features: ['4 caméras 2MP', 'Enregistreur 4 voies', 'Disque dur 1 To', 'Installation incluse', 'Application mobile', 'Garantie 1 an'],
  },
  {
    name: 'Commerce',
    cams: '4–8 caméras',
    price: '350 000',
    color: '#e60012',
    bg: '#fde8ea',
    highlight: true,
    features: ['8 caméras 4MP', 'Enregistreur 8 voies', 'Disque dur 2 To', 'Installation incluse', 'Accès cloud 1 an', 'Support prioritaire', 'Garantie 2 ans'],
  },
  {
    name: 'Entreprise',
    cams: '8–64 caméras',
    price: 'Sur devis',
    color: '#0369a1',
    bg: '#e0f2fe',
    highlight: false,
    features: ['Caméras 4K/PTZ', 'Enregistreur 16–64 voies', 'Stockage NAS dédié', 'Câblage réseau inclus', 'Monitoring 24/7', 'SLA garanti', 'Formation équipes'],
  },
]

const brands = ['Hikvision', 'Dahua', 'Axis', 'Hanwha', 'Uniview', 'Reolink']

const steps = [
  { num: '01', icon: 'i-heroicons-map-pin', title: 'Visite Technique', desc: 'Analyse de vos locaux, identification des points sensibles, étude de faisabilité.' },
  { num: '02', icon: 'i-heroicons-document-text', title: 'Devis Détaillé', desc: "Proposition personnalisée avec liste du matériel, plan d'implantation et tarif fixe." },
  { num: '03', icon: 'i-heroicons-wrench-screwdriver', title: 'Installation', desc: 'Pose des caméras, câblage, configuration enregistreur et application mobile.' },
  { num: '04', icon: 'i-heroicons-academic-cap', title: 'Formation & Remise', desc: "Formation à l'utilisation, remise des accès et documentation technique." },
]

const faq = ref([
  { q: 'Combien de caméras faut-il pour surveiller ma maison ?', a: "Pour une résidence standard, 2 à 4 caméras suffisent : entrée principale, garage, jardin et éventuellement couloir intérieur. Nous réalisons une visite technique gratuite pour vous conseiller.", open: false },
  { q: 'Puis-je voir mes caméras depuis mon téléphone ?', a: "Oui, toutes nos installations incluent la configuration de l'accès à distance via une application mobile (iOS et Android). Vous visualisez vos caméras en temps réel depuis n'importe où.", open: false },
  { q: "Que se passe-t-il en cas de coupure d'électricité ?", a: "Les enregistreurs disposent d'une alimentation de secours (onduleur) en option. Les enregistrements reprennent automatiquement au retour du courant sans perte de données.", open: false },
  { q: 'Proposez-vous des contrats de maintenance ?', a: "Oui, nous proposons des contrats annuels qui incluent une visite préventive, le nettoyage des lentilles, les mises à jour firmware et un temps de réponse prioritaire en cas de panne.", open: false },
])
</script>

<template>
  <div class="bg-white min-h-screen">

    <!-- HERO -->
    <section class="relative overflow-hidden bg-gray-950">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute inset-0 opacity-30"
          style="background: radial-gradient(ellipse 80% 60% at 70% 40%, #274a82 0%, transparent 60%)"></div>
        <div class="absolute inset-0 opacity-20"
          style="background: radial-gradient(ellipse 60% 60% at 20% 80%, #e60012 0%, transparent 60%)"></div>
        <!-- Hexagones décoratifs -->
        <svg class="absolute right-0 top-0 w-1/2 h-full opacity-5" viewBox="0 0 400 400" fill="none">
          <polygon points="200,30 350,115 350,285 200,370 50,285 50,115" stroke="white" stroke-width="1" fill="none"/>
          <polygon points="200,70 320,135 320,265 200,330 80,265 80,135" stroke="white" stroke-width="0.5" fill="none"/>
          <polygon points="200,110 290,155 290,245 200,290 110,245 110,155" stroke="white" stroke-width="0.5" fill="none"/>
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
            <div class="inline-flex items-center gap-2 bg-red-500/20 rounded-full px-4 py-1.5 mb-5 border border-red-500/30">
              <span class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
              <span class="text-red-300 text-xs font-bold tracking-widest uppercase">Sécurité 24/7</span>
            </div>
            <h1 class="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
              Vidéo&shy;surveillance<br />
              <span class="text-[#e60012]">Professionnelle</span>
            </h1>
            <p class="text-white/60 text-base leading-relaxed mb-8 max-w-md">
              Protégez vos biens, votre famille et vos employés avec des systèmes de surveillance HD connectés. Installation clé en main à Yaoundé.
            </p>
            <div class="flex flex-wrap gap-3">
              <NuxtLink to="/contact"
                class="flex items-center gap-2 px-6 py-3 bg-[#e60012] hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-lg transition-all hover:-translate-y-0.5">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                Visite Technique Gratuite
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
              { val: '1 000+', label: 'Caméras installées', icon: 'i-heroicons-video-camera' },
              { val: 'HD/4K', label: 'Résolution maximale', icon: 'i-heroicons-eye' },
              { val: '24/7', label: 'Enregistrement continu', icon: 'i-heroicons-clock' },
              { val: '1 an', label: 'Garantie matériel', icon: 'i-heroicons-shield-check' },
            ]" :key="stat.label"
              class="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <UIcon :name="stat.icon" class="w-5 h-5 text-white/40 mb-2" />
              <p class="text-2xl font-black text-white leading-none">{{ stat.val }}</p>
              <p class="text-white/40 text-[11px] font-medium mt-1 leading-tight">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- SOLUTIONS -->
    <section class="py-14 bg-[#f4f4f4]">
      <UContainer>
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 mb-2">Nos Solutions</h2>
          <p class="text-gray-500 text-sm max-w-lg mx-auto">Des systèmes adaptés à chaque besoin, de la résidence familiale aux complexes industriels.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="svc in solutions" :key="svc.title"
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

    <!-- PACKS -->
    <section class="py-14 bg-white">
      <UContainer>
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 mb-2">Packs Clé en Main</h2>
          <p class="text-gray-500 text-sm">Matériel + Installation + Configuration + Application mobile.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          <div v-for="pack in packages" :key="pack.name"
            class="relative rounded-2xl border-2 overflow-hidden transition-all duration-300"
            :class="pack.highlight ? 'border-[#e60012] shadow-xl shadow-[#e60012]/10 scale-105' : 'border-gray-100 hover:border-gray-300 hover:shadow-md'">
            <div v-if="pack.highlight"
              class="bg-[#e60012] text-white text-[10px] font-black text-center py-1.5 tracking-widest uppercase">
              ★ Le plus demandé
            </div>
            <div class="p-5" :class="pack.highlight ? 'pt-5' : ''">
              <div class="mb-4">
                <div class="inline-block text-[10px] font-black px-2.5 py-1 rounded-full mb-2"
                  :style="{ backgroundColor: pack.bg, color: pack.color }">
                  {{ pack.cams }}
                </div>
                <p class="font-black text-gray-900 text-lg">{{ pack.name }}</p>
                <p class="font-black text-2xl mt-1" :style="{ color: pack.color }">
                  {{ pack.price }}<span v-if="pack.price !== 'Sur devis'" class="text-sm text-gray-400 font-medium"> FCFA</span>
                </p>
              </div>
              <ul class="space-y-2 mb-5">
                <li v-for="feat in pack.features" :key="feat" class="flex items-center gap-2 text-xs text-gray-700">
                  <UIcon name="i-heroicons-check" class="w-4 h-4 flex-shrink-0" :style="{ color: pack.color }" />
                  {{ feat }}
                </li>
              </ul>
              <NuxtLink to="/contact"
                class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition-all"
                :class="pack.highlight ? 'bg-[#e60012] hover:bg-red-700 text-white' : 'border-2 hover:bg-gray-50'"
                :style="!pack.highlight ? { borderColor: pack.color, color: pack.color } : {}">
                Demander un devis
              </NuxtLink>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- PROCESSUS -->
    <section class="py-14 bg-[#f4f4f4]">
      <UContainer>
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 mb-2">Notre Processus</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div v-for="(step, i) in steps" :key="step.num" class="flex flex-col items-center text-center">
            <div class="w-16 h-16 rounded-2xl bg-white border-2 border-[#274a82]/20 flex flex-col items-center justify-center mb-4 shadow-sm">
              <UIcon :name="step.icon" class="w-6 h-6 text-[#274a82]" />
              <span class="text-[9px] font-black text-gray-400 mt-0.5">{{ step.num }}</span>
            </div>
            <h3 class="font-black text-gray-900 mb-2 text-sm">{{ step.title }}</h3>
            <p class="text-gray-500 text-xs leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- MARQUES -->
    <section class="py-8 bg-white border-y border-gray-100">
      <UContainer>
        <p class="text-center text-xs font-black text-gray-400 uppercase tracking-widest mb-5">Marques distribuées</p>
        <div class="flex flex-wrap justify-center gap-3">
          <div v-for="brand in brands" :key="brand"
            class="bg-gray-50 border border-gray-200 rounded-xl px-5 py-2.5 hover:border-[#274a82] hover:bg-[#274a82]/5 transition-all cursor-default">
            <span class="text-sm font-black text-gray-700">{{ brand }}</span>
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
    <section class="py-12 bg-gray-950">
      <UContainer class="text-center">
        <h2 class="text-2xl md:text-3xl font-black text-white mb-3">Sécurisez vos locaux dès aujourd'hui</h2>
        <p class="text-white/50 mb-7 text-sm max-w-md mx-auto">Visite technique gratuite et sans engagement. Devis sous 24h.</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <NuxtLink to="/contact"
            class="flex items-center gap-2 px-7 py-3.5 bg-[#e60012] hover:bg-red-700 text-white font-black rounded-xl text-sm shadow-lg transition-all">
            <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
            Visite gratuite
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