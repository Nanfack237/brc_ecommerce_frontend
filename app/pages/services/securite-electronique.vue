<script setup lang="ts">
const { t } = useI18n()

const SEO_URL = 'https://brcmarket.cm/services/securite-electronique'
useSeoMeta({
  title:              t('securite_electronique.seo_title'),
  ogTitle:            t('securite_electronique.seo_og_title'),
  description:        t('securite_electronique.seo_description'),
  ogDescription:      t('securite_electronique.seo_og_description'),
  ogImage:            'https://brcmarket.cm/images/og-image.png',
  ogUrl:              SEO_URL,
  twitterTitle:       t('securite_electronique.seo_twitter_title'),
  twitterDescription: t('securite_electronique.seo_twitter_description'),
  twitterImage:       'https://brcmarket.cm/images/og-image.png',
})
useHead({ link: [{ rel: 'canonical', href: SEO_URL }] })

const carouselIndex = ref(0)
const carouselImages = computed(() => [
  { src: '/images/services/service_securite_informatique1.jpg', alt: t('securite_electronique.carousel_alt_1') },
  { src: '/images/services/service_securite_informatique4.jpg', alt: t('securite_electronique.carousel_alt_2') },
  { src: '/images/services/service_securite_informatique5.jpg', alt: t('securite_electronique.carousel_alt_3') },
  { src: '/images/services/service_securite_informatique.jpg',  alt: t('securite_electronique.carousel_alt_4') },
  { src: '/images/services/service_securite_informatique2.jpg', alt: t('securite_electronique.carousel_alt_5') },
])

let carouselTimer: ReturnType<typeof setInterval> | null = null
function startCarousel() {
  carouselTimer = setInterval(() => {
    carouselIndex.value = (carouselIndex.value + 1) % carouselImages.value.length
  }, 3500)
}
function stopCarousel() { if (carouselTimer) clearInterval(carouselTimer) }
function goTo(index: number) { carouselIndex.value = index; stopCarousel(); startCarousel() }
onMounted(() => startCarousel())
onUnmounted(() => stopCarousel())

const service = computed(() => ({
  id: 'securite',
  tag: '02',
  icon: 'i-heroicons-shield-check',
  title:    t('securite_electronique.service_title'),
  subtitle: t('securite_electronique.service_subtitle'),
  color:  '#e60012',
  accent: '#274a82',
  intro:   t('securite_electronique.service_intro'),
  garantie: t('securite_electronique.service_garantie'),
  solutions: [
    { icon: 'i-heroicons-video-camera',    title: t('securite_electronique.solution_1_title'), desc: t('securite_electronique.solution_1_desc') },
    { icon: 'i-heroicons-key',             title: t('securite_electronique.solution_2_title'), desc: t('securite_electronique.solution_2_desc') },
    { icon: 'i-heroicons-bell-alert',      title: t('securite_electronique.solution_3_title'), desc: t('securite_electronique.solution_3_desc') },
    { icon: 'i-heroicons-building-office', title: t('securite_electronique.solution_4_title'), desc: t('securite_electronique.solution_4_desc') },
  ],
  avantages: [
    t('securite_electronique.avantage_1'),
    t('securite_electronique.avantage_2'),
    t('securite_electronique.avantage_3'),
    t('securite_electronique.avantage_4'),
    t('securite_electronique.avantage_5'),
    t('securite_electronique.avantage_6'),
  ],
}))

const steps = computed(() => [
  { num: '01', title: t('securite_electronique.step_1_title'), desc: t('securite_electronique.step_1_desc') },
  { num: '02', title: t('securite_electronique.step_2_title'), desc: t('securite_electronique.step_2_desc') },
  { num: '03', title: t('securite_electronique.step_3_title'), desc: t('securite_electronique.step_3_desc') },
  { num: '04', title: t('securite_electronique.step_4_title'), desc: t('securite_electronique.step_4_desc') },
])
</script>

<template>
  <div class="bg-[#f4f4f4] min-h-screen pb-10">
    <div class="max-w-7xl mx-auto px-4">

      <!-- HERO -->
      <section class="relative h-[280px] md:h-[280px] flex items-center overflow-hidden mb-5">
        <div class="absolute inset-0 bg-[#e60012]"></div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#274a82] via-blue-400 to-[#274a82]"></div>
        <div class="absolute right-0 top-0 w-[500px] h-[500px] rounded-full border border-white/[0.04] translate-x-1/3 -translate-y-1/3"></div>
        <div class="absolute right-0 top-0 w-[300px] h-[300px] rounded-full border border-white/[0.06] translate-x-1/4 -translate-y-1/4"></div>
        <div class="relative z-10 px-4 md:px-8 max-w-2xl">
          <h1 class="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
            {{ $t('securite_electronique.hero_title') }}
          </h1>
          <p class="text-white/80 text-sm md:text-base leading-relaxed max-w-xl">
            {{ $t('securite_electronique.hero_desc', { cities: '' }) }}
            <span class="text-white font-bold">{{ $t('securite_electronique.hero_cities') }}</span>.
          </p>
        </div>
      </section>

      <!-- BREADCRUMB -->
      <nav class="hidden sm:flex items-center gap-2 text-[13px] text-gray-500 font-medium py-4 border-b border-gray-200 mb-12">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">{{ $t('securite_electronique.breadcrumb_home') }}</NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <span class="text-[#e60012] font-bold">{{ $t('securite_electronique.breadcrumb_current') }}</span>
      </nav>

      <!-- HEADER + CAROUSEL -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-sm overflow-hidden shadow-lg border border-gray-100 mb-8">
        <div
          class="relative h-64 lg:h-auto min-h-[280px] overflow-hidden bg-gray-200 order-2 lg:order-1 group"
          @mouseenter="stopCarousel"
          @mouseleave="startCarousel"
        >
          <template v-for="(img, idx) in carouselImages" :key="idx">
            <img
              :src="img.src" :alt="img.alt"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
              :class="idx === carouselIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'"
            />
          </template>
          <div class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 gap-3 z-0">
            <UIcon :name="service.icon" class="w-16 h-16 opacity-20 text-[#e60012]" />
          </div>
          <div class="absolute bottom-0 left-0 w-full h-20 pointer-events-none z-20"
            style="background: linear-gradient(to top, #e6001260, transparent)"></div>
          <button class="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            @click="goTo((carouselIndex - 1 + carouselImages.length) % carouselImages.length)">
            <UIcon name="i-heroicons-chevron-left" class="w-4 h-4 text-white" />
          </button>
          <button class="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            @click="goTo((carouselIndex + 1) % carouselImages.length)">
            <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-white" />
          </button>
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
            <button v-for="(_, idx) in carouselImages" :key="idx"
              class="rounded-full transition-all duration-300"
              :class="idx === carouselIndex ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'"
              @click="goTo(idx)" />
          </div>
        </div>
        <div class="p-8 lg:p-10 bg-white order-1 lg:order-2 flex flex-col justify-center">
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-1">{{ service.title }}</h2>
          <p class="text-sm font-bold mb-4 text-[#e60012]">{{ service.subtitle }}</p>
          <p class="text-[14px] text-gray-600 leading-[1.8] mb-6">{{ service.intro }}</p>
          <div class="flex items-center gap-2 p-3 rounded-sm text-[12px] font-bold bg-[#e60012]/10 text-[#e60012]">
            <UIcon name="i-heroicons-shield-check" class="w-4 h-4 flex-shrink-0" />
            {{ service.garantie }}
          </div>
        </div>
      </div>

      <!-- SOLUTIONS -->
      <div class="mb-5">
        <p class="text-[14px] font-black tracking-widest mb-1 text-[#e60012]">{{ $t('securite_electronique.solutions_label') }}</p>
        <h3 class="text-xl font-black text-gray-900">{{ $t('securite_electronique.solutions_title') }}</h3>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div v-for="(sol, si2) in service.solutions" :key="si2"
          class="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
          <div class="h-1" :style="`background: ${si2 % 2 === 0 ? '#e60012' : '#274a82'}`"></div>
          <div class="p-6 flex gap-4">
            <div class="w-11 h-11 rounded-sm flex items-center justify-center flex-shrink-0"
              :style="`background: ${si2 % 2 === 0 ? '#e60012' : '#274a82'}15`">
              <UIcon :name="sol.icon" class="w-5 h-5" :style="`color: ${si2 % 2 === 0 ? '#e60012' : '#274a82'}`" />
            </div>
            <div>
              <h4 class="text-[14px] font-black text-gray-900 mb-2 group-hover:text-[#e60012] transition-colors">{{ sol.title }}</h4>
              <p class="text-[12px] text-gray-500 leading-relaxed">{{ sol.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- AVANTAGES -->
      <div class="bg-white rounded-sm border border-gray-100 shadow-sm p-6 mb-10">
        <p class="text-[14px] font-black text-gray-400 tracking-widest mb-5">{{ $t('securite_electronique.avantages_label') }}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div v-for="(av, avi) in service.avantages" :key="avi"
            class="flex items-center gap-3 p-3 rounded-sm bg-[#e60012]/[0.08]">
            <UIcon name="i-heroicons-check-circle" class="w-5 h-5 flex-shrink-0 text-[#e60012]" />
            <span class="text-[13px] font-semibold text-gray-700">{{ av }}</span>
          </div>
        </div>
      </div>

      <!-- PROCESSUS -->
      <section class="mt-4 mb-10">
        <div class="text-center mb-8">
          <p class="text-[14px] font-black text-[#e60012] tracking-widest mb-1">{{ $t('securite_electronique.process_label') }}</p>
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{{ $t('securite_electronique.process_title') }}</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="(step, si) in steps" :key="si"
            class="relative bg-white rounded-sm border border-gray-100 shadow-sm px-5 py-6 overflow-hidden">
            <span class="absolute -top-3 -right-2 text-[72px] font-black text-gray-100 leading-none select-none pointer-events-none">{{ step.num }}</span>
            <div class="relative z-10">
              <div class="w-8 h-8 rounded-full text-white text-[11px] font-black flex items-center justify-center mb-4 bg-[#e60012]">{{ step.num }}</div>
              <h3 class="text-[14px] font-black text-gray-900 mb-2">{{ step.title }}</h3>
              <p class="text-[12px] text-gray-500 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="rounded-sm overflow-hidden border border-[#e60012]/20 shadow-sm">
        <div class="bg-[#e60012] px-6 md:px-10 py-8 md:py-10 relative overflow-hidden">
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="text-center md:text-left">
              <h3 class="text-xl md:text-2xl font-black text-white mb-2">{{ $t('securite_electronique.cta_title') }}</h3>
              <p class="text-white/70 text-sm">{{ $t('securite_electronique.cta_sub') }}</p>
              <div class="flex flex-wrap gap-4 mt-3 justify-center md:justify-start text-xs text-white/50 font-semibold">
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5" />
                  {{ $t('securite_electronique.cta_address') }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
                  {{ $t('securite_electronique.cta_hours') }}
                </span>
              </div>
            </div>
            <div class="flex gap-3 flex-shrink-0">
              <a href="tel:+237689205751" class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#274a82] hover:bg-[#1a3460] text-white text-sm font-black rounded-sm transition-all shadow-lg">
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