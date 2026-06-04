<script setup lang="ts">
const SEO_URL = 'https://brcmarket.cm/services/cablage-reseaux'
useSeoMeta({
  title:              'Câblage & Réseaux',
  ogTitle:            'Service Câblage & Réseaux - BRC Market',
  description:        'BRC Market assure l\'installation et la maintenance de vos infrastructures réseau au Cameroun. Câblage structuré, Wi-Fi, fibre optique à Douala et Yaoundé.',
  ogDescription:      'Installation et maintenance de vos infrastructures réseau au Cameroun. Câblage structuré, Wi-Fi, fibre optique.',
  ogImage:            'https://brcmarket.cm/images/og-image.png',
  ogUrl:              SEO_URL,
  twitterTitle:       'Câblage & Réseaux - BRC Market',
  twitterDescription: 'Installation et maintenance réseau au Cameroun.',
  twitterImage:       'https://brcmarket.cm/images/og-image.png',
})
useHead({ link: [{ rel: 'canonical', href: SEO_URL }] })

// ── Carousel ──
const carouselIndex = ref(0)
const carouselImages = [
  { src: '/images/services/service_audit_cablage1.jpg', alt: 'Installation câblage réseau structuré' },
  { src: '/images/services/service_audit_cablage4.jpg', alt: 'Armoire de brassage et switch réseau' },
  { src: '/images/services/service_audit_cablage3.jpg', alt: 'Different port du switch' },
  { src: '/images/services/service_audit_cablage.jpg', alt: 'Déploiement WiFi professionnel' },
]
let carouselTimer: ReturnType<typeof setInterval> | null = null
const startCarousel = () => {
  carouselTimer = setInterval(() => { carouselIndex.value = (carouselIndex.value + 1) % carouselImages.length }, 4000)
}
const stopCarousel = () => { if (carouselTimer) clearInterval(carouselTimer) }
const goTo = (i: number) => { carouselIndex.value = i; stopCarousel(); startCarousel() }
const prev = () => goTo((carouselIndex.value - 1 + carouselImages.length) % carouselImages.length)
const next = () => goTo((carouselIndex.value + 1) % carouselImages.length)
onMounted(startCarousel)
onUnmounted(stopCarousel)

const service = {
  id: 'cablage',
  tag: '03',
  icon: 'i-heroicons-globe-alt',
  title: 'Câblage & Réseaux',
  subtitle: 'Connectivité haute performance',
  color: '#274a82',
  accent: '#e60012',
  intro: 'Notre service Câblage et Réseaux constitue la base de votre connectivité. Nous concevons et installons des systèmes de câblage de haute qualité. Que ce soit pour un petit bureau ou une grande entreprise, nous assurons des connexions fiables et rapides.',
  prestationsReseau: [
    {
      icon: 'i-heroicons-signal',
      title: 'Câblage structuré',
      desc: 'Installation câbles Cat5e / Cat6 / Cat6a, fibre optique, prises RJ45, goulottes et armoires de brassage.',
    },
    {
      icon: 'i-heroicons-wifi',
      title: 'Réseau WiFi',
      desc: 'Déploiement de bornes WiFi professionnelles pour une couverture totale de vos locaux sans zones mortes.',
    },
    {
      icon: 'i-heroicons-server',
      title: 'Infrastructure réseau',
      desc: 'Configuration switches, routeurs, VLAN, pare-feu et serveurs pour entreprises petites à grandes.',
    },
    {
      icon: 'i-heroicons-arrow-path',
      title: 'Maintenance & Audit',
      desc: 'Diagnostic réseau, optimisation des performances, supervision et maintenance préventive de votre infrastructure.',
    },
  ],
  typesClients: [
    { label: 'Petits bureaux (1–10 postes)',        icon: 'i-heroicons-home' },
    { label: 'PME & Entreprises moyennes',           icon: 'i-heroicons-building-office' },
    { label: 'Grandes entreprises & Industries',     icon: 'i-heroicons-building-office-2' },
    { label: 'Résidences & Immeubles',               icon: 'i-heroicons-home-modern' },
  ],
  garantie: 'Installations conformes aux normes — Garantie 12 mois',
}

const steps = [
  { num: '01', title: 'Contact & Devis', desc: 'Appelez-nous ou écrivez-nous. Nous établissons un devis gratuit sous 24h.' },
  { num: '02', title: 'Diagnostic / Audit', desc: 'Nos experts analysent votre besoin sur site ou à distance.' },
  { num: '03', title: 'Intervention', desc: 'Installation ou réparation réalisée par nos techniciens certifiés.' },
  { num: '04', title: 'Garantie & SAV', desc: 'Suivi, garantie et assistance après chaque intervention.' },
]
</script>

<template>
  <div class="bg-[#f4f4f4] min-h-screen pb-20">
    <div class="max-w-7xl mx-auto px-4">

      <!-- ══════════ HERO ══════════ -->
      <section class="relative h-[280px] md:h-[280px] flex items-center overflow-hidden mb-0">
        <div class="absolute inset-0 bg-[#274a82]"></div>
        
        <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#e60012] via-red-400 to-[#e60012]"></div>
        <div class="absolute right-0 top-0 w-[500px] h-[500px] rounded-full border border-white/[0.04] translate-x-1/3 -translate-y-1/3"></div>
        <div class="absolute right-0 top-0 w-[300px] h-[300px] rounded-full border border-white/[0.06] translate-x-1/4 -translate-y-1/4"></div>

        <div class="relative z-10 px-4 md:px-8 max-w-2xl">
          
          <h1 class="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
            Câblage & Réseaux
          </h1>
          <p class="text-white/80 text-sm md:text-base leading-relaxed max-w-xl">
            Infrastructure réseau, WiFi professionnel et câblage structuré pour votre entreprise à <span class="text-white font-bold">Douala, Yaounde, Cameroun et dans tout l'Afrique</span>.
          </p>
        </div>
      </section>

      <!-- ══════════ BREADCRUMB ══════════ -->
      <nav class="hidden sm:flex items-center gap-2 text-[13px] text-gray-500 font-medium py-4 border-b border-gray-200 mb-12">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">Accueil</NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
       
        <span class="font-bold" :style="`color: ${service.color}`">Câblage & Réseaux</span>
      </nav>

      <!-- ══════════ HEADER + IMAGE ══════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-sm overflow-hidden shadow-lg border border-gray-100 mb-10">
        <!-- ── Carousel ── -->
        <div class="relative h-64 lg:h-auto min-h-[280px] overflow-hidden bg-gray-200 order-2 lg:order-1 group">
          <div class="absolute inset-0">
            <transition-group name="carousel-fade">
              <div v-for="(img, idx) in carouselImages" :key="idx" v-show="carouselIndex === idx" class="absolute inset-0">
                <img :src="img.src" :alt="img.alt" class="w-full h-full object-cover"
                  @error="($event.target as HTMLImageElement).parentElement!.querySelector('.carousel-placeholder')!.classList.remove('hidden')" />
                <div class="carousel-placeholder hidden absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 gap-3">
                  <UIcon :name="service.icon" class="w-14 h-14 opacity-20" :style="`color: ${service.color}`" />
                  <p class="text-[11px] text-gray-400 font-semibold text-center px-4">{{ img.src }}</p>
                </div>
              </div>
            </transition-group>
          </div>
          <div class="absolute bottom-0 left-0 w-full h-24 pointer-events-none z-10"
            :style="`background: linear-gradient(to top, ${service.color}80, transparent)`"></div>
          <button @click="prev" class="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100" aria-label="Image précédente">
            <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
          </button>
          <button @click="next" class="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100" aria-label="Image suivante">
            <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
          </button>
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            <button v-for="(_, idx) in carouselImages" :key="idx" @click="goTo(idx)"
              class="h-1.5 rounded-full transition-all duration-300"
              :class="carouselIndex === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'" />
          </div>
          <div class="absolute top-3 right-3 z-20 bg-black/40 backdrop-blur-sm text-white text-[11px] font-black px-2 py-1 rounded-sm">
            {{ carouselIndex + 1 }} / {{ carouselImages.length }}
          </div>
        </div>
        <div class="p-8 lg:p-10 bg-white order-1 lg:order-2 flex flex-col justify-center">
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-1">{{ service.title }}</h2>
          <p class="text-sm font-bold mb-4" :style="`color: ${service.color}`">{{ service.subtitle }}</p>
          <p class="text-[14px] text-gray-600 leading-[1.8] mb-6">{{ service.intro }}</p>
          <div class="flex items-center gap-2 p-3 rounded-sm text-[12px] font-bold"
            :style="`background: ${service.color}10; color: ${service.color}`">
            <UIcon name="i-heroicons-shield-check" class="w-4 h-4 flex-shrink-0" />
            {{ service.garantie }}
          </div>
        </div>
      </div>

      <!-- ══════════ PRESTATIONS RÉSEAU ══════════ -->
      <div class="mb-5 text-center">
        <p class="text-[14px] font-black tracking-widest mb-1" :style="`color: ${service.color}`">Nos prestations réseau</p>
        <h3 class="text-xl font-black text-gray-900">Infrastructure & Connectivité</h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div v-for="(pr, pri) in service.prestationsReseau" :key="pri"
          class="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
          <div class="h-1" :style="`background: ${pri % 2 === 0 ? service.color : service.accent}`"></div>
          <div class="p-6 flex gap-4">
            <div class="w-11 h-11 rounded-sm flex items-center justify-center flex-shrink-0"
              :style="`background: ${pri % 2 === 0 ? service.color : service.accent}15`">
              <UIcon :name="pr.icon" class="w-5 h-5" :style="`color: ${pri % 2 === 0 ? service.color : service.accent}`" />
            </div>
            <div>
              <h4 class="text-[14px] font-black text-gray-900 mb-2 group-hover:text-[#1a6e3c] transition-colors">{{ pr.title }}</h4>
              <p class="text-[12px] text-gray-500 leading-relaxed">{{ pr.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════ TYPES CLIENTS ══════════ -->
      <div class="bg-white rounded-sm border border-gray-100 shadow-sm p-6 mb-10">
        <p class="text-[14px] font-black text-gray-400 tracking-widest mb-5">Nous intervenons pour</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="(tc, tci) in service.typesClients" :key="tci"
            class="flex flex-col items-center text-center gap-3 p-5 rounded-sm border border-gray-100 hover:shadow-md transition-all">
            <div class="w-12 h-12 rounded-full flex items-center justify-center"
              :style="`background: ${service.color}15`">
              <UIcon :name="tc.icon" class="w-6 h-6" :style="`color: ${service.color}`" />
            </div>
            <span class="text-[12px] font-bold text-gray-700">{{ tc.label }}</span>
          </div>
        </div>
      </div>

      <!-- ══════════ PROCESSUS ══════════ -->
      <section class="mt-4 mb-10">
        <div class="text-center mb-8">
          <p class="text-[14px] font-black tracking-widest mb-1" :style="`color: ${service.color}`">Comment ça marche</p>
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Notre processus en 4 étapes</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="(step, si) in steps" :key="si"
            class="relative bg-white rounded-sm border border-gray-100 shadow-sm px-5 py-6 overflow-hidden">
            <span class="absolute -top-3 -right-2 text-[72px] font-black text-gray-100 leading-none select-none pointer-events-none">{{ step.num }}</span>
            <div class="relative z-10">
              <div class="w-8 h-8 rounded-full text-white text-[11px] font-black flex items-center justify-center mb-4" :style="`background: ${service.color}`">{{ step.num }}</div>
              <h3 class="text-[14px] font-black text-gray-900 mb-2">{{ step.title }}</h3>
              <p class="text-[12px] text-gray-500 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════ CTA ══════════ -->
      <section class="rounded-sm overflow-hidden border border-[#1a6e3c]/20 shadow-sm">
        <div class=" bg-[#274a82] px-6 md:px-10 py-8 md:py-10 relative overflow-hidden">
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="text-center md:text-left">
              <h3 class="text-xl md:text-2xl font-black text-white mb-2">Besoin d'une infrastructure réseau ?</h3>
              <p class="text-white/70 text-sm">Contactez-nous — devis gratuit, installation professionnelle.</p>
              <div class="flex flex-wrap gap-4 mt-3 justify-center md:justify-start text-xs text-white/50 font-semibold">
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-[#e60012]" />
                  Akwa Douala, rue Castelnau
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 text-[#e60012]" />
                  Lun–Sam : 8h15–16h45
                </span>
              </div>
            </div>
            <div class="flex gap-3 flex-shrink-0">
              <a href="tel:+237689205751"
                class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#e60012] hover:bg-red-700 text-white text-sm font-black rounded-sm transition-all shadow-lg">
                <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" />
              </a>
              <a href="https://wa.me/237689205751"
                class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-black rounded-sm transition-all shadow-lg">
                <UIcon name="i-simple-icons-whatsapp" class="w-4 h-4" />
              </a>
              <NuxtLink to="/contact"
                class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-black rounded-sm transition-all">
                <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>