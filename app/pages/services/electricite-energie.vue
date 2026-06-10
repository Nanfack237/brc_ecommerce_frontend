<script setup lang="ts">
const { t } = useI18n()

const SEO_URL = 'https://brcmarket.cm/services/electricite-energie'
useSeoMeta({
  title:              t('electricite_energie.seo_title'),
  ogTitle:            t('electricite_energie.seo_og_title'),
  description:        t('electricite_energie.seo_description'),
  ogDescription:      t('electricite_energie.seo_og_description'),
  ogImage:            'https://brcmarket.cm/images/og-image.png',
  ogUrl:              SEO_URL,
  twitterTitle:       t('electricite_energie.seo_twitter_title'),
  twitterDescription: t('electricite_energie.seo_twitter_description'),
  twitterImage:       'https://brcmarket.cm/images/og-image.png',
})
useHead({ link: [{ rel: 'canonical', href: SEO_URL }] })

const carouselIndex = ref(0)
const carouselImages = computed(() => [
  { src: '/images/services/maintenance-armoire.jpg',   alt: t('electricite_energie.carousel_alt_1') },
  { src: '/images/services/installation-solaire.jpg',  alt: t('electricite_energie.carousel_alt_2') },
  { src: '/images/services/groupe-maintenance.jpg',    alt: t('electricite_energie.carousel_alt_3') },
  { src: '/images/services/cablage-residence.jpg',     alt: t('electricite_energie.carousel_alt_4') },
  { src: '/images/services/etude-btp.jpg',             alt: t('electricite_energie.carousel_alt_5') },
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
  id: 'electricite',
  tag: '01',
  icon: 'i-heroicons-bolt',
  title:    t('electricite_energie.service_title'),
  subtitle: t('electricite_energie.service_subtitle'),
  color:  '#e60012',
  accent: '#274a82',
  intro:   t('electricite_energie.service_intro'),
  garantie: t('electricite_energie.service_garantie'),
  solutions: [
    { icon: 'i-heroicons-sun',               title: t('electricite_energie.solution_1_title'), desc: t('electricite_energie.solution_1_desc') },
    { icon: 'i-heroicons-building-office-2', title: t('electricite_energie.solution_2_title'), desc: t('electricite_energie.solution_2_desc') },
    { icon: 'i-heroicons-home',              title: t('electricite_energie.solution_3_title'), desc: t('electricite_energie.solution_3_desc') },
    { icon: 'i-heroicons-cpu-chip',          title: t('electricite_energie.solution_4_title'), desc: t('electricite_energie.solution_4_desc') },
    { icon: 'i-heroicons-wrench-screwdriver',title: t('electricite_energie.solution_5_title'), desc: t('electricite_energie.solution_5_desc') },
    { icon: 'i-heroicons-server-stack',      title: t('electricite_energie.solution_6_title'), desc: t('electricite_energie.solution_6_desc') },
  ],
  avantages: [
    t('electricite_energie.avantage_1'),
    t('electricite_energie.avantage_2'),
    t('electricite_energie.avantage_3'),
    t('electricite_energie.avantage_4'),
    t('electricite_energie.avantage_5'),
    t('electricite_energie.avantage_6'),
  ],
}))

const steps = computed(() => [
  { num: '01', title: t('electricite_energie.step_1_title'), desc: t('electricite_energie.step_1_desc') },
  { num: '02', title: t('electricite_energie.step_2_title'), desc: t('electricite_energie.step_2_desc') },
  { num: '03', title: t('electricite_energie.step_3_title'), desc: t('electricite_energie.step_3_desc') },
  { num: '04', title: t('electricite_energie.step_4_title'), desc: t('electricite_energie.step_4_desc') },
])
</script>

<template>
  <div class="bg-[#f4f4f4] min-h-screen pb-10">
    <div class="max-w-7xl mx-auto px-4">

      <!-- HERO -->
      <section class="relative h-[280px] md:h-[280px] flex items-center overflow-hidden mb-5">
        <div class="absolute inset-0 bg-[#274a82]"></div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#e60012] via-red-400 to-[#e60012]"></div>
        <div class="absolute right-0 top-0 w-[500px] h-[500px] rounded-full border border-white/[0.04] translate-x-1/3 -translate-y-1/3"></div>
        <div class="relative z-10 px-4 md:px-8 max-w-2xl">
          <h1 class="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
            {{ $t('electricite_energie.hero_title') }}
          </h1>
          <p class="text-white/80 text-sm md:text-base leading-relaxed max-w-xl">
            {{ $t('electricite_energie.hero_desc', { cities: '' }) }}
            <span class="text-white font-bold">{{ $t('electricite_energie.hero_cities') }}</span>.
          </p>
        </div>
      </section>

      <!-- BREADCRUMB -->
      <nav class="hidden sm:flex items-center gap-2 text-[13px] text-gray-500 font-medium py-4 border-b border-gray-200 mb-8">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">{{ $t('electricite_energie.breadcrumb_home') }}</NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <span class="text-[#e60012] font-bold">{{ $t('electricite_energie.breadcrumb_current') }}</span>
      </nav>

      <!-- HEADER + CAROUSEL -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-sm overflow-hidden shadow-lg border border-gray-100 mb-8">
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
        <div class="p-8 lg:p-10 bg-white order-1 lg:order-2 flex flex-col justify-center">
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-1">{{ service.title }}</h2>
          <p class="text-sm font-bold mb-4 text-[#e60012]">{{ service.subtitle }}</p>
          <p class="text-[14px] text-gray-600 leading-[1.8] mb-6">{{ service.intro }}</p>
          <div class="flex items-center gap-2 p-3 rounded-sm text-[12px] font-bold bg-[#e60012]/10 text-[#e60012]">
            <UIcon name="i-heroicons-check-badge" class="w-4 h-4 flex-shrink-0" />
            {{ service.garantie }}
          </div>
        </div>
      </div>

      <!-- SOLUTIONS -->
      <div class="mb-5 text-center">
        <p class="text-[14px] font-black tracking-widest mb-1 text-[#e60012]">{{ $t('electricite_energie.solutions_label') }}</p>
        <h3 class="text-xl font-black text-gray-900">{{ $t('electricite_energie.solutions_title') }}</h3>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <div v-for="(sol, si) in service.solutions" :key="si"
          class="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div class="p-6">
            <div class="w-12 h-12 rounded-sm flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
              :style="`background: ${si % 2 === 0 ? '#274a82' : '#e60012'}15`">
              <UIcon :name="sol.icon" class="w-6 h-6" :style="`color: ${si % 2 === 0 ? '#274a82' : '#e60012'}`" />
            </div>
            <h4 class="text-[15px] font-black text-gray-900 mb-2">{{ sol.title }}</h4>
            <p class="text-[12px] text-gray-500 leading-relaxed">{{ sol.desc }}</p>
          </div>
        </div>
      </div>

      <!-- ÉQUIPE + AVANTAGES -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="md:col-span-1 bg-[#274a82] p-8 text-white rounded-sm">
          <h3 class="text-xl font-black mb-4">{{ $t('electricite_energie.team_title') }}</h3>
          <p class="text-sm text-white/80 leading-relaxed mb-6">{{ $t('electricite_energie.team_desc') }}</p>
          <ul class="space-y-3 text-[13px] font-bold">
            <li class="flex items-center gap-2"><UIcon name="i-heroicons-user" class="w-4 h-4 text-red-400" /> {{ $t('electricite_energie.team_manager') }}</li>
            <li class="flex items-center gap-2"><UIcon name="i-heroicons-shield-exclamation" class="w-4 h-4 text-red-400" /> {{ $t('electricite_energie.team_hse') }}</li>
            <li class="flex items-center gap-2"><UIcon name="i-heroicons-users" class="w-4 h-4 text-red-400" /> {{ $t('electricite_energie.team_chefs') }}</li>
          </ul>
        </div>
        <div class="md:col-span-2 bg-white rounded-sm border border-gray-100 p-8">
          <p class="text-[14px] font-black text-gray-400 tracking-widest mb-6">{{ $t('electricite_energie.avantages_label') }}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="(av, avi) in service.avantages" :key="avi"
              class="flex items-start gap-3 p-4 rounded-sm transition-colors hover:bg-gray-50 border border-transparent hover:border-gray-200">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 flex-shrink-0 mt-0.5 text-[#e60012]" />
              <div>
                <span class="text-[13px] font-bold text-gray-800 block">{{ av }}</span>
                <span class="text-[11px] text-gray-500">{{ $t('electricite_energie.avantage_certified') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PROCESSUS -->
      <section class="mt-4 mb-10">
        <div class="text-center mb-8">
          <p class="text-[14px] font-black text-[#e60012] tracking-widest mb-1">{{ $t('electricite_energie.process_label') }}</p>
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{{ $t('electricite_energie.process_title') }}</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="(step, si) in steps" :key="si"
            class="relative bg-white rounded-sm border border-gray-100 shadow-sm px-5 py-6 overflow-hidden group hover:border-[#274a82]/30 transition-colors">
            <span class="absolute -top-3 -right-2 text-[72px] font-black text-gray-50 opacity-[0.05] leading-none select-none">{{ step.num }}</span>
            <div class="relative z-10">
              <div class="w-8 h-8 rounded-full text-white text-[11px] font-black flex items-center justify-center mb-4"
                :style="`background: ${si % 2 === 0 ? '#e60012' : '#274a82'}`">{{ step.num }}</div>
              <h3 class="text-[14px] font-black text-gray-900 mb-2">{{ step.title }}</h3>
              <p class="text-[12px] text-gray-500 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="rounded-sm overflow-hidden border border-[#e60012]/20 shadow-sm">
        <div class="bg-[#e60012] px-6 md:px-10 py-8 md:py-10 relative overflow-hidden">
          <div class="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
            <UIcon name="i-heroicons-bolt" class="w-64 h-64 text-white" />
          </div>
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="text-center md:text-left">
              <h3 class="text-xl md:text-2xl font-black text-white mb-2">{{ $t('electricite_energie.cta_title') }}</h3>
              <p class="text-white/80 text-sm max-w-lg font-medium">{{ $t('electricite_energie.cta_sub') }}</p>
            </div>
            <div class="flex gap-3 flex-shrink-0">
              <a href="tel:+237689205751"
                class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#274a82] hover:bg-[#1a3460] text-white text-sm font-black rounded-sm transition-all shadow-xl">
                <UIcon name="i-heroicons-phone-arrow-up-right" class="w-4 h-4" />
                {{ $t('electricite_energie.cta_call') }}
              </a>
              <a href="https://wa.me/237689205751"
                class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-black rounded-sm transition-all shadow-xl">
                <UIcon name="i-simple-icons-whatsapp" class="w-4 h-4" />
                {{ $t('electricite_energie.cta_whatsapp') }}
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