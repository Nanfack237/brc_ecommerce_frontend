<script setup lang="ts">
const SEO_URL = 'https://brcmarket.cm/services/electricite-energie'
useSeoMeta({
  title:              'Électricité & Énergie',
  ogTitle:            'Service Électricité & Énergie - BRC Market',
  description:        'Solutions électriques et énergétiques pour particuliers et entreprises au Cameroun. Onduleurs, groupes électrogènes, installation électrique à Douala.',
  ogDescription:      'Solutions électriques et énergétiques pour particuliers et entreprises au Cameroun.',
  ogImage:            'https://brcmarket.cm/images/og-image.png',
  ogUrl:              SEO_URL,
  twitterTitle:       'Électricité & Énergie - BRC Market',
  twitterDescription: 'Solutions électriques et énergétiques au Cameroun.',
  twitterImage:       'https://brcmarket.cm/images/og-image.png',
})
useHead({ link: [{ rel: 'canonical', href: SEO_URL }] })

const carouselIndex = ref(0)
const carouselImages = [
  { src: '/images/services/maintenance-armoire.jpg', alt: 'Maintenance armoire électrique' },
  { src: '/images/services/installation-solaire.jpg', alt: 'Installation panneaux solaires' },
  { src: '/images/services/groupe-maintenance.jpg', alt: 'Maintenance groupe électrogène' },
  { src: '/images/services/cablage-residence.jpg', alt: 'Câblage résidentiel moderne' },
  { src: '/images/services/etude-btp.jpg', alt: 'Étude technique et bilan de puissance' },
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
  id: 'electricite',
  tag: '01',
  icon: 'i-heroicons-bolt',
  title: 'Électricité & Énergie',
  subtitle: 'Solaire, Industriel, Résidentiel & Maintenance',
  color: '#e60012',
  accent: '#274a82',
  intro: 'Expert en solutions énergétiques au Cameroun, BRC Market accompagne les particuliers et les entreprises dans leurs projets d\'installation, de rénovation et de maintenance électrique. De l\'énergie solaire à l\'électricité industrielle, nous garantissons des interventions aux normes.',
  solutions: [
    {
      icon: 'i-heroicons-sun',
      title: 'Énergie Solaire',
      desc: 'Installation, rénovation et maintenance de champs solaires photovoltaïques pour une autonomie durable.',
    },
    {
      icon: 'i-heroicons-building-office-2',
      title: 'Industriel & Commercial',
      desc: 'Maintenance électrique complexe, câblage d\'usines et de surfaces commerciales haute performance.',
    },
    {
      icon: 'i-heroicons-home',
      title: 'Électricité Résidentielle',
      desc: 'Installation complète pour résidences et immeubles, mise aux normes et maintenance d\'équipements.',
    },
    {
      icon: 'i-heroicons-cpu-chip',
      title: 'Ingénierie & Études',
      desc: 'Dessin technique, bilan de puissance, projet d\'éclairage et devis estimatifs détaillés.',
    },
    {
      icon: 'i-heroicons-wrench-screwdriver',
      title: 'Dépannage d\'Urgence',
      desc: 'Intervention 24h/24 et 7j/7 pour coupures, courts-circuits ou surcharges (Spécialité Douala).',
    },
    {
      icon: 'i-heroicons-server-stack',
      title: 'Réseaux & Groupes',
      desc: 'Câblage informatique et maintenance de groupes électrogènes pour assurer votre continuité de service.',
    },
  ],
  avantages: [
    'Sécurité & Conformité aux normes',
    'Équipe technique basée à Douala',
    'Réactivité & Intervention rapide',
    'Devis détaillé et gratuit',
    'Suivi rigoureux (Manager & HSE)',
    'Intervention sur tout le territoire',
  ],
  garantie: 'Engagement qualité : Sécurité, Transparence & Conformité Normative',
}

const steps = [
  { num: '01', title: 'Consultation', desc: 'Analyse de votre projet et établissement d\'un devis gratuit sans engagement.' },
  { num: '02', title: 'Étude Technique', desc: 'Bilan de puissance et dessin technique par nos ingénieurs.' },
  { num: '03', title: 'Exécution', desc: 'Travaux réalisés par nos techniciens sous supervision d\'un chef d\'équipe.' },
  { num: '04', title: 'Validation HSE', desc: 'Contrôle final de sécurité et mise en service officielle.' },
]
</script>

<template>
  <div class="bg-[#f4f4f4] min-h-screen pb-10">
    <div class="max-w-7xl mx-auto px-4">

      <!-- ══════════ HERO ══════════ -->
      <section class="relative h-[280px] md:h-[280px] flex items-center overflow-hidden mb-5">
        <div class="absolute inset-0 bg-[#274a82]"></div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#e60012] via-red-400 to-[#e60012]"></div>
        <div class="absolute right-0 top-0 w-[500px] h-[500px] rounded-full border border-white/[0.04] translate-x-1/3 -translate-y-1/3"></div>
        <div class="relative z-10 px-4 md:px-8 max-w-2xl">
          <h1 class="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
            Électricité & Énergie
          </h1>
          <p class="text-white/80 text-sm md:text-base leading-relaxed max-w-xl">
            Solutions solaires, installations industrielles et dépannage 24/7. Excellence technique au service de votre confort à <span class="text-white font-bold">Douala, Yaounde, Cameroun et dans tout l'Afrique</span>.
          </p>
        </div>
      </section>

      <!-- ══════════ BREADCRUMB ══════════ -->
      <nav class="hidden sm:flex items-center gap-2 text-[13px] text-gray-500 font-medium py-4 border-b border-gray-200 mb-8">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">Accueil</NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <span class="text-[#e60012] font-bold">Électricité & Énergie</span>
      </nav>

      <!-- ══════════ HEADER + CAROUSEL ══════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-sm overflow-hidden shadow-lg border border-gray-100 mb-8">
        
        <!-- CAROUSEL -->
        <div
          class="relative h-64 lg:h-auto min-h-[320px] overflow-hidden bg-gray-200 order-2 lg:order-1 group"
          @mouseenter="stopCarousel"
          @mouseleave="startCarousel"
        >
          <template v-for="(img, idx) in carouselImages" :key="idx">
            <img
              :src="img.src"
              :alt="img.alt"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
              :class="idx === carouselIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'"
            />
          </template>
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
            <button v-for="(_, idx) in carouselImages" :key="idx"
              @click="goTo(idx)"
              class="rounded-full transition-all duration-300"
              :class="idx === carouselIndex ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white'"
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
            <UIcon name="i-heroicons-check-badge" class="w-4 h-4 flex-shrink-0" />
            {{ service.garantie }}
          </div>
        </div>
      </div>

      <!-- ══════════ SOLUTIONS ══════════ -->
      <div class="mb-5 text-center">
        <p class="text-[14px] font-black tracking-widest mb-1" :style="`color: ${service.color}`">Nos Compétences</p>
        <h3 class="text-xl font-black text-gray-900">Domaines d'expertise technique</h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <div v-for="(sol, si) in service.solutions" :key="si"
          class="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div class="p-6">
            <div class="w-12 h-12 rounded-sm flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
              :style="`background: ${si % 2 === 0 ? service.accent : service.color}15`">
              <UIcon :name="sol.icon" class="w-6 h-6" :style="`color: ${si % 2 === 0 ? service.accent : service.color}`" />
            </div>
            <h4 class="text-[15px] font-black text-gray-900 mb-2">{{ sol.title }}</h4>
            <p class="text-[12px] text-gray-500 leading-relaxed">{{ sol.desc }}</p>
          </div>
        </div>
      </div>

      <!-- ══════════ ÉQUIPE TECHNIQUE ══════════ -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="md:col-span-1 bg-[#274a82] p-8 text-white rounded-sm">
          <h3 class="text-xl font-black mb-4">Notre Équipe Technique</h3>
          <p class="text-sm text-white/80 leading-relaxed mb-6">
            Basée à Douala et mobile sur tout le territoire national, notre organisation repose sur une séparation rigoureuse des tâches pour une qualité optimale.
          </p>
          <ul class="space-y-3 text-[13px] font-bold">
            <li class="flex items-center gap-2"><UIcon name="i-heroicons-user" class="w-4 h-4 text-red-400" /> Manager Technique</li>
            <li class="flex items-center gap-2"><UIcon name="i-heroicons-shield-exclamation" class="w-4 h-4 text-red-400" /> Responsable HSE</li>
            <li class="flex items-center gap-2"><UIcon name="i-heroicons-users" class="w-4 h-4 text-red-400" /> Chefs d'équipe & Tâcherons</li>
          </ul>
        </div>

        <!-- ══════════ AVANTAGES ══════════ -->
        <div class="md:col-span-2 bg-white rounded-sm border border-gray-100 p-8">
            <p class="text-[14px] font-black text-gray-400 tracking-widest mb-6 ">Vos Avantages & Nos Engagements</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="(av, avi) in service.avantages" :key="avi"
                class="flex items-start gap-3 p-4 rounded-sm transition-colors hover:bg-gray-50 border border-transparent hover:border-gray-200">
                <UIcon name="i-heroicons-check-circle" class="w-5 h-5 flex-shrink-0 mt-0.5" :style="`color: ${service.color}`" />
                <div>
                    <span class="text-[13px] font-bold text-gray-800 block">{{ av }}</span>
                    <span class="text-[11px] text-gray-500">Service certifié BRC Market</span>
                </div>
              </div>
            </div>
        </div>
      </div>

      <!-- ══════════ PROCESSUS ══════════ -->
      <section class="mt-4 mb-10">
        <div class="text-center mb-8">
          <p class="text-[14px] font-black text-[#e60012] tracking-widest mb-1 ">Comment nous intervenons</p>
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Processus de réalisation</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="(step, si) in steps" :key="si"
            class="relative bg-white rounded-sm border border-gray-100 shadow-sm px-5 py-6 overflow-hidden group hover:border-[#274a82]/30 transition-colors">
            <span class="absolute -top-3 -right-2 text-[72px] font-black text-gray-50 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity leading-none select-none">{{ step.num }}</span>
            <div class="relative z-10">
              <div class="w-8 h-8 rounded-full text-white text-[11px] font-black flex items-center justify-center mb-4" :style="`background: ${si % 2 === 0 ? service.color : service.accent}`">{{ step.num }}</div>
              <h3 class="text-[14px] font-black text-gray-900 mb-2">{{ step.title }}</h3>
              <p class="text-[12px] text-gray-500 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════ CTA ══════════ -->
      <section class="rounded-sm overflow-hidden border border-[#e60012]/20 shadow-sm">
        <div class="bg-[#e60012] px-6 md:px-10 py-8 md:py-10 relative overflow-hidden">
          <!-- Pattern de fond -->
          <div class="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
              <UIcon name="i-heroicons-bolt" class="w-64 h-64 text-white" />
          </div>

          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="text-center md:text-left">
              <h3 class="text-xl md:text-2xl font-black text-white mb-2">Besoin d'un dépannage ou d'une installation ?</h3>
              <p class="text-white/80 text-sm max-w-lg font-medium">Intervention 24h/24 — Devis gratuit et détaillé établi d'un commun accord.</p>
              
            </div>

            <div class="flex gap-3 flex-shrink-0">
              <a href="tel:+237689205751"
                class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#274a82] hover:bg-[#1a3460] text-white text-sm font-black rounded-sm transition-all shadow-xl">
                <UIcon name="i-heroicons-phone-arrow-up-right" class="w-4 h-4" />
                Appeler
              </a>
              <a href="https://wa.me/237689205751"
                class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-black rounded-sm transition-all shadow-xl">
                <UIcon name="i-simple-icons-whatsapp" class="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.7s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>