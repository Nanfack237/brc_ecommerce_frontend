<script setup lang="ts">
const { t } = useI18n()

const SEO_URL = 'https://brcmarket.cm/services/cablage-reseaux'
useSeoMeta({
  title:              t('cablage_reseau.seo_title'),
  ogTitle:            t('cablage_reseau.seo_og_title'),
  description:        t('cablage_reseau.seo_description'),
  ogDescription:      t('cablage_reseau.seo_og_description'),
  ogImage:            'https://brcmarket.cm/images/og-image.png',
  ogUrl:              SEO_URL,
  twitterTitle:       t('cablage_reseau.seo_twitter_title'),
  twitterDescription: t('cablage_reseau.seo_twitter_description'),
  twitterImage:       'https://brcmarket.cm/images/og-image.png',
})
useHead({ link: [{ rel: 'canonical', href: SEO_URL }] })

// ── Carousel ──
const carouselIndex = ref(0)
const carouselImages = computed(() => [
  { src: '/images/services/service_audit_cablage1.jpg', alt: t('cablage_reseau.carousel_alt_1') },
  { src: '/images/services/service_audit_cablage4.jpg', alt: t('cablage_reseau.carousel_alt_2') },
  { src: '/images/services/service_audit_cablage3.jpg', alt: t('cablage_reseau.carousel_alt_3') },
  { src: '/images/services/service_audit_cablage.jpg',  alt: t('cablage_reseau.carousel_alt_4') },
])
let carouselTimer: ReturnType<typeof setInterval> | null = null
const startCarousel = () => {
  carouselTimer = setInterval(() => { carouselIndex.value = (carouselIndex.value + 1) % carouselImages.value.length }, 4000)
}
const stopCarousel = () => { if (carouselTimer) clearInterval(carouselTimer) }
const goTo = (i: number) => { carouselIndex.value = i; stopCarousel(); startCarousel() }
const prev = () => goTo((carouselIndex.value - 1 + carouselImages.value.length) % carouselImages.value.length)
const next = () => goTo((carouselIndex.value + 1) % carouselImages.value.length)
onMounted(startCarousel)
onUnmounted(stopCarousel)

const service = computed(() => ({
  id: 'cablage',
  tag: '03',
  icon: 'i-heroicons-globe-alt',
  title:    t('cablage_reseau.service_title'),
  subtitle: t('cablage_reseau.service_subtitle'),
  color:  '#274a82',
  accent: '#e60012',
  intro:   t('cablage_reseau.service_intro'),
  garantie: t('cablage_reseau.service_garantie'),
  prestationsReseau: [
    { icon: 'i-heroicons-signal', title: t('cablage_reseau.prestation_1_title'), desc: t('cablage_reseau.prestation_1_desc') },
    { icon: 'i-heroicons-wifi',   title: t('cablage_reseau.prestation_2_title'), desc: t('cablage_reseau.prestation_2_desc') },
    { icon: 'i-heroicons-server', title: t('cablage_reseau.prestation_3_title'), desc: t('cablage_reseau.prestation_3_desc') },
    { icon: 'i-heroicons-arrow-path', title: t('cablage_reseau.prestation_4_title'), desc: t('cablage_reseau.prestation_4_desc') },
  ],
  typesClients: [
    { label: t('cablage_reseau.client_1'), icon: 'i-heroicons-home' },
    { label: t('cablage_reseau.client_2'), icon: 'i-heroicons-building-office' },
    { label: t('cablage_reseau.client_3'), icon: 'i-heroicons-building-office-2' },
    { label: t('cablage_reseau.client_4'), icon: 'i-heroicons-home-modern' },
  ],
}))

const steps = computed(() => [
  { num: '01', title: t('cablage_reseau.step_1_title'), desc: t('cablage_reseau.step_1_desc') },
  { num: '02', title: t('cablage_reseau.step_2_title'), desc: t('cablage_reseau.step_2_desc') },
  { num: '03', title: t('cablage_reseau.step_3_title'), desc: t('cablage_reseau.step_3_desc') },
  { num: '04', title: t('cablage_reseau.step_4_title'), desc: t('cablage_reseau.step_4_desc') },
])
</script>

<template>
  <div class="bg-[#f4f4f4] min-h-screen pb-20">
    <div class="max-w-7xl mx-auto px-4">

      <!-- HERO -->
      <section class="relative h-[280px] md:h-[280px] flex items-center overflow-hidden mb-0">
        <div class="absolute inset-0 bg-[#274a82]"></div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#e60012] via-red-400 to-[#e60012]"></div>
        <div class="absolute right-0 top-0 w-[500px] h-[500px] rounded-full border border-white/[0.04] translate-x-1/3 -translate-y-1/3"></div>
        <div class="absolute right-0 top-0 w-[300px] h-[300px] rounded-full border border-white/[0.06] translate-x-1/4 -translate-y-1/4"></div>
        <div class="relative z-10 px-4 md:px-8 max-w-2xl">
          <h1 class="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
            {{ $t('cablage_reseau.hero_title') }}
          </h1>
          <p class="text-white/80 text-sm md:text-base leading-relaxed max-w-xl">
            {{ $t('cablage_reseau.hero_desc', { cities: '' }) }}
            <span class="text-white font-bold">{{ $t('cablage_reseau.hero_cities') }}</span>.
          </p>
        </div>
      </section>

      <!-- BREADCRUMB -->
      <nav class="hidden sm:flex items-center gap-2 text-[13px] text-gray-500 font-medium py-4 border-b border-gray-200 mb-12">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">{{ $t('cablage_reseau.breadcrumb_home') }}</NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <span class="font-bold text-[#274a82]">{{ $t('cablage_reseau.breadcrumb_current') }}</span>
      </nav>

      <!-- HEADER + IMAGE -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-sm overflow-hidden shadow-lg border border-gray-100 mb-10">
        <!-- Carousel -->
        <div class="relative h-64 lg:h-auto min-h-[280px] overflow-hidden bg-gray-200 order-2 lg:order-1 group">
          <div class="absolute inset-0">
            <transition-group name="carousel-fade">
              <div v-for="(img, idx) in carouselImages" :key="idx" v-show="carouselIndex === idx" class="absolute inset-0">
                <img :src="img.src" :alt="img.alt" class="w-full h-full object-cover" />
              </div>
            </transition-group>
          </div>
          <div class="absolute bottom-0 left-0 w-full h-24 pointer-events-none z-10"
            :style="`background: linear-gradient(to top, ${service.color}80, transparent)`"></div>
          <button @click="prev" class="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100" :aria-label="$t('cablage_reseau.carousel_prev')">
            <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
          </button>
          <button @click="next" class="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100" :aria-label="$t('cablage_reseau.carousel_next')">
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
          <p class="text-sm font-bold mb-4 text-[#274a82]">{{ service.subtitle }}</p>
          <p class="text-[14px] text-gray-600 leading-[1.8] mb-6">{{ service.intro }}</p>
          <div class="flex items-center gap-2 p-3 rounded-sm text-[12px] font-bold bg-[#274a82]/10 text-[#274a82]">
            <UIcon name="i-heroicons-shield-check" class="w-4 h-4 flex-shrink-0" />
            {{ service.garantie }}
          </div>
        </div>
      </div>

      <!-- PRESTATIONS -->
      <div class="mb-5 text-center">
        <p class="text-[14px] font-black tracking-widest mb-1 text-[#274a82]">{{ $t('cablage_reseau.prestations_label') }}</p>
        <h3 class="text-xl font-black text-gray-900">{{ $t('cablage_reseau.prestations_title') }}</h3>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div v-for="(pr, pri) in service.prestationsReseau" :key="pri"
          class="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
          <div class="h-1" :style="`background: ${pri % 2 === 0 ? '#274a82' : '#e60012'}`"></div>
          <div class="p-6 flex gap-4">
            <div class="w-11 h-11 rounded-sm flex items-center justify-center flex-shrink-0"
              :style="`background: ${pri % 2 === 0 ? '#274a82' : '#e60012'}15`">
              <UIcon :name="pr.icon" class="w-5 h-5" :style="`color: ${pri % 2 === 0 ? '#274a82' : '#e60012'}`" />
            </div>
            <div>
              <h4 class="text-[14px] font-black text-gray-900 mb-2">{{ pr.title }}</h4>
              <p class="text-[12px] text-gray-500 leading-relaxed">{{ pr.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TYPES CLIENTS -->
      <div class="bg-white rounded-sm border border-gray-100 shadow-sm p-6 mb-10">
        <p class="text-[14px] font-black text-gray-400 tracking-widest mb-5">{{ $t('cablage_reseau.clients_label') }}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="(tc, tci) in service.typesClients" :key="tci"
            class="flex flex-col items-center text-center gap-3 p-5 rounded-sm border border-gray-100 hover:shadow-md transition-all">
            <div class="w-12 h-12 rounded-full flex items-center justify-center bg-[#274a82]/10">
              <UIcon :name="tc.icon" class="w-6 h-6 text-[#274a82]" />
            </div>
            <span class="text-[12px] font-bold text-gray-700">{{ tc.label }}</span>
          </div>
        </div>
      </div>

      <!-- PROCESSUS -->
      <section class="mt-4 mb-10">
        <div class="text-center mb-8">
          <p class="text-[14px] font-black tracking-widest mb-1 text-[#274a82]">{{ $t('cablage_reseau.process_label') }}</p>
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{{ $t('cablage_reseau.process_title') }}</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="(step, si) in steps" :key="si"
            class="relative bg-white rounded-sm border border-gray-100 shadow-sm px-5 py-6 overflow-hidden">
            <span class="absolute -top-3 -right-2 text-[72px] font-black text-gray-100 leading-none select-none pointer-events-none">{{ step.num }}</span>
            <div class="relative z-10">
              <div class="w-8 h-8 rounded-full text-white text-[11px] font-black flex items-center justify-center mb-4 bg-[#274a82]">{{ step.num }}</div>
              <h3 class="text-[14px] font-black text-gray-900 mb-2">{{ step.title }}</h3>
              <p class="text-[12px] text-gray-500 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="rounded-sm overflow-hidden border border-[#1a6e3c]/20 shadow-sm">
        <div class="bg-[#274a82] px-6 md:px-10 py-8 md:py-10 relative overflow-hidden">
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="text-center md:text-left">
              <h3 class="text-xl md:text-2xl font-black text-white mb-2">{{ $t('cablage_reseau.cta_title') }}</h3>
              <p class="text-white/70 text-sm">{{ $t('cablage_reseau.cta_sub') }}</p>
              <div class="flex flex-wrap gap-4 mt-3 justify-center md:justify-start text-xs text-white/50 font-semibold">
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-[#e60012]" />
                  {{ $t('cablage_reseau.cta_address') }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 text-[#e60012]" />
                  {{ $t('cablage_reseau.cta_hours') }}
                </span>
              </div>
            </div>
            <div class="flex gap-3 flex-shrink-0">
              <a href="tel:+237689205751" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#e60012] hover:bg-red-700 text-white text-sm font-black rounded-sm transition-all shadow-lg">
                <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" />
              </a>
              <a href="https://wa.me/237689205751" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-black rounded-sm transition-all shadow-lg">
                <UIcon name="i-simple-icons-whatsapp" class="w-4 h-4" />
              </a>
              <NuxtLink to="/contact" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-black rounded-sm transition-all">
                <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>