<script setup lang="ts">
const SEO_URL = 'https://brcmarket.cm/services/securite-electronique'
useSeoMeta({
  title:              'Sécurité Électronique',
  ogTitle:            'Service Sécurité Électronique - BRC Market',
  description:        'Installation de systèmes de vidéosurveillance, alarmes et contrôle d\'accès au Cameroun. BRC Market sécurise vos locaux à Douala, Yaoundé et partout au Cameroun.',
  ogDescription:      'Vidéosurveillance, alarmes et contrôle d\'accès au Cameroun.',
  ogImage:            'https://brcmarket.cm/images/og-image.png',
  ogUrl:              SEO_URL,
  twitterTitle:       'Sécurité Électronique - BRC Market',
  twitterDescription: 'Installation de systèmes de sécurité électronique au Cameroun.',
  twitterImage:       'https://brcmarket.cm/images/og-image.png',
})
useHead({ link: [{ rel: 'canonical', href: SEO_URL }] })

const carouselIndex = ref(0)
const carouselImages = [
  { src: '/images/services/service_securite_informatique1.jpg', alt: 'Installation caméra de surveillance' },
  { src: '/images/services/service_securite_informatique4.jpg', alt: 'Système de contrôle d\'accès' },
  { src: '/images/services/service_securite_informatique5.jpg', alt: 'Centrale alarme' },
  { src: '/images/services/service_securite_informatique.jpg',  alt: 'Camera de surveillance' },
  { src: '/images/services/service_securite_informatique2.jpg',  alt: 'Surveillez ma maison a distance' },
]

let carouselTimer: ReturnType<typeof setInterval> | null = null

function startCarousel() {
  carouselTimer = setInterval(() => {
    carouselIndex.value = (carouselIndex.value + 1) % carouselImages.length
  }, 3500)
}

function stopCarousel() {
  if (carouselTimer) clearInterval(carouselTimer)
}

function goTo(index: number) {
  carouselIndex.value = index
  stopCarousel()
  startCarousel()
}

onMounted(() => startCarousel())
onUnmounted(() => stopCarousel())

const service = {
  id: 'securite',
  tag: '02',
  icon: 'i-heroicons-shield-check',
  title: 'Sécurité Électronique',
  subtitle: 'Vidéosurveillance, Contrôle d\'accès & Alarme',
  color: '#e60012',
  accent: '#274a82',
  image: '/images/services/securite.jpg',
  imageAlt: 'Installation caméra de surveillance',
  intro: 'Nous fournissons des solutions de sécurité électronique de premier ordre pour assurer la sécurité de votre maison et de votre entreprise. Nous adaptons nos services à vos besoins, vous garantissant une tranquillité d\'esprit.',
  solutions: [
    {
      icon: 'i-heroicons-video-camera',
      title: 'Vidéosurveillance',
      desc: 'Installation de caméras IP / analogiques, enregistreurs NVR/DVR, accès à distance depuis votre smartphone.',
    },
    {
      icon: 'i-heroicons-key',
      title: 'Contrôle d\'accès',
      desc: 'Lecteurs de badges, biométrie, digicodes, gestion des entrées et sorties pour entreprises et résidences.',
    },
    {
      icon: 'i-heroicons-bell-alert',
      title: 'Systèmes d\'alarme',
      desc: 'Détecteurs de mouvement, sirènes, alarmes intrusion filaires et sans fil, avec notification instantanée.',
    },
    {
      icon: 'i-heroicons-building-office',
      title: 'Solutions Entreprises',
      desc: 'Audit sécurité, installation sur sites industriels et commerciaux, maintenance préventive et contrats SAV.',
    },
  ],
  avantages: [
    'Technologie avancée dernière génération',
    'Installation par experts certifiés',
    'Accès mobile et surveillance à distance',
    'Maintenance et assistance 24/7',
    'Adapté maison & entreprise',
    'Devis gratuit et sur mesure',
  ],
  garantie: 'Garantie 12 mois matériel + assistance experte',
}

const steps = [
  { num: '01', title: 'Contact & Devis', desc: 'Appelez-nous ou écrivez-nous. Nous établissons un devis gratuit sous 24h.' },
  { num: '02', title: 'Diagnostic / Audit', desc: 'Nos experts analysent votre besoin sur site ou à distance.' },
  { num: '03', title: 'Intervention', desc: 'Installation ou réparation réalisée par nos techniciens certifiés.' },
  { num: '04', title: 'Garantie & SAV', desc: 'Suivi, garantie et assistance après chaque intervention.' },
]
</script>

<template>
  <div class="bg-[#f4f4f4] min-h-screen pb-10">
    <div class="max-w-7xl mx-auto px-4">

      <!-- ══════════ HERO ══════════ -->
      <section class="relative h-[280px] md:h-[280px] flex items-center overflow-hidden mb-5">
        <div class="absolute inset-0 bg-[#e60012]"></div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#274a82] via-blue-400 to-[#274a82]"></div>
        <div class="absolute right-0 top-0 w-[500px] h-[500px] rounded-full border border-white/[0.04] translate-x-1/3 -translate-y-1/3"></div>
        <div class="absolute right-0 top-0 w-[300px] h-[300px] rounded-full border border-white/[0.06] translate-x-1/4 -translate-y-1/4"></div>
        <div class="relative z-10 px-4 md:px-8 max-w-2xl">
          <h1 class="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
            Sécurité Électronique
          </h1>
          <p class="text-white/80 text-sm md:text-base leading-relaxed max-w-xl">
            Vidéosurveillance, contrôle d'accès et alarmes pour votre maison et entreprise à <span class="text-white font-bold">Douala, Yaounde, Cameroun et dans tout l'Afrique</span>.
          </p>
        </div>
      </section>

      <!-- ══════════ BREADCRUMB ══════════ -->
      <nav class="hidden sm:flex items-center gap-2 text-[13px] text-gray-500 font-medium py-4 border-b border-gray-200 mb-12">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">Accueil</NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <span class="text-[#e60012] font-bold">Sécurité Électronique</span>
      </nav>

      <!-- ══════════ HEADER + CAROUSEL ══════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-sm overflow-hidden shadow-lg border border-gray-100 mb-8">

        <!-- CAROUSEL -->
        <div
          class="relative h-64 lg:h-auto min-h-[280px] overflow-hidden bg-gray-200 order-2 lg:order-1 group"
          @mouseenter="stopCarousel"
          @mouseleave="startCarousel"
        >
          <!-- Images -->
          <template v-for="(img, idx) in carouselImages" :key="idx">
            <img
              :src="img.src"
              :alt="img.alt"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
              :class="idx === carouselIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'"
            />
          </template>

          <!-- Fallback placeholder (si aucune image) -->
          <div class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 gap-3 z-0">
            <UIcon :name="service.icon" class="w-16 h-16 opacity-20" :style="`color: ${service.color}`" />
          </div>

          <!-- Gradient bas -->
          <div
            class="absolute bottom-0 left-0 w-full h-20 pointer-events-none z-20"
            :style="`background: linear-gradient(to top, ${service.color}60, transparent)`"
          ></div>

          <!-- Flèches navigation -->
          <button
            class="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            @click="goTo((carouselIndex - 1 + carouselImages.length) % carouselImages.length)"
          >
            <UIcon name="i-heroicons-chevron-left" class="w-4 h-4 text-white" />
          </button>
          <button
            class="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            @click="goTo((carouselIndex + 1) % carouselImages.length)"
          >
            <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-white" />
          </button>

          <!-- Dots -->
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
            <button
              v-for="(_, idx) in carouselImages"
              :key="idx"
              class="rounded-full transition-all duration-300"
              :class="idx === carouselIndex
                ? 'w-5 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'"
              @click="goTo(idx)"
            />
          </div>
        </div>

        <!-- Texte -->
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

      <!-- ══════════ SOLUTIONS ══════════ -->
      <div class="mb-5 text center">
        <p class="text-[14px] font-black tracking-widest mb-1" :style="`color: ${service.color}`">Nos solutions</p>
        <h3 class="text-xl font-black text-gray-900">Systèmes de sécurité</h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div v-for="(sol, si2) in service.solutions" :key="si2"
          class="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
          <div class="h-1" :style="`background: ${si2 % 2 === 0 ? service.color : service.accent}`"></div>
          <div class="p-6 flex gap-4">
            <div class="w-11 h-11 rounded-sm flex items-center justify-center flex-shrink-0"
              :style="`background: ${si2 % 2 === 0 ? service.color : service.accent}15`">
              <UIcon :name="sol.icon" class="w-5 h-5" :style="`color: ${si2 % 2 === 0 ? service.color : service.accent}`" />
            </div>
            <div>
              <h4 class="text-[14px] font-black text-gray-900 mb-2 group-hover:text-[#e60012] transition-colors">{{ sol.title }}</h4>
              <p class="text-[12px] text-gray-500 leading-relaxed">{{ sol.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════ AVANTAGES ══════════ -->
      <div class="bg-white rounded-sm border border-gray-100 shadow-sm p-6 mb-10">
        <p class="text-[14px] font-black text-gray-400 tracking-widest mb-5">Pourquoi choisir BRC Market</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div v-for="(av, avi) in service.avantages" :key="avi"
            class="flex items-center gap-3 p-3 rounded-sm"
            :style="`background: ${service.color}08`">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 flex-shrink-0" :style="`color: ${service.color}`" />
            <span class="text-[13px] font-semibold text-gray-700">{{ av }}</span>
          </div>
        </div>
      </div>

      <!-- ══════════ PROCESSUS ══════════ -->
      <section class="mt-4 mb-10">
        <div class="text-center mb-8">
          <p class="text-[14px] font-black text-[#e60012] tracking-widest mb-1">Comment ça marche</p>
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
      <section class="rounded-sm overflow-hidden border border-[#e60012]/20 shadow-sm">
        <div class="bg-[#e60012] px-6 md:px-10 py-8 md:py-10 relative overflow-hidden">
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="text-center md:text-left">
              <h3 class="text-xl md:text-2xl font-black text-white mb-2">Sécurisez votre domicile ou entreprise ?</h3>
              <p class="text-white/70 text-sm">Contactez-nous — devis gratuit, installation rapide.</p>
              <div class="flex flex-wrap gap-4 mt-3 justify-center md:justify-start text-xs text-white/50 font-semibold">
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-[#274a8]" />
                  Akwa Douala, rue Castelnau
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 text-[#274a8]" />
                  Lun–Sam : 8h15–16h45
                </span>
              </div>
            </div>
            <div class="flex gap-3 flex-shrink-0">
              <a href="tel:+237689205751"
                class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#274a82] hover:bg-[#1a3460] text-white text-sm font-black rounded-sm transition-all shadow-lg">
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