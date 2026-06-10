<script setup lang="ts">
const { t } = useI18n()

const SEO_URL = 'https://brcmarket.cm/services/maintenance-informatique'
useSeoMeta({
  title:              t('maintenance_support.seo_title'),
  ogTitle:            t('maintenance_support.seo_og_title'),
  description:        t('maintenance_support.seo_description'),
  ogDescription:      t('maintenance_support.seo_og_description'),
  ogImage:            'https://brcmarket.cm/images/og-image.png',
  ogUrl:              SEO_URL,
  twitterTitle:       t('maintenance_support.seo_twitter_title'),
  twitterDescription: t('maintenance_support.seo_twitter_description'),
  twitterImage:       'https://brcmarket.cm/images/og-image.png',
})
useHead({ link: [{ rel: 'canonical', href: SEO_URL }] })

const carouselIndex = ref(0)
const carouselImages = computed(() => [
  { src: '/images/services/service_maintenance1.jpg', alt: t('maintenance_support.carousel_alt_1') },
  { src: '/images/services/service_maintenance2.jpg', alt: t('maintenance_support.carousel_alt_2') },
  { src: '/images/services/service_maintenance3.jpg', alt: t('maintenance_support.carousel_alt_3') },
  { src: '/images/services/service_maintenance.jpg',  alt: t('maintenance_support.carousel_alt_4') },
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
  id: 'maintenance',
  tag: '01',
  icon: 'i-heroicons-wrench-screwdriver',
  title:    t('maintenance_support.service_title'),
  subtitle: t('maintenance_support.service_subtitle'),
  color:  '#274a82',
  accent: '#e60012',
  intro:   t('maintenance_support.service_intro'),
  garantie: t('maintenance_support.service_garantie'),
  prestations: [
    { icon: 'i-heroicons-cpu-chip',                   label: t('maintenance_support.prestation_1_label'), price: t('maintenance_support.prestation_1_price'), desc: t('maintenance_support.prestation_1_desc') },
    { icon: 'i-heroicons-bolt',                       label: t('maintenance_support.prestation_2_label'), price: t('maintenance_support.prestation_2_price'), desc: t('maintenance_support.prestation_2_desc') },
    { icon: 'i-heroicons-circle-stack',               label: t('maintenance_support.prestation_3_label'), price: t('maintenance_support.prestation_3_price'), desc: t('maintenance_support.prestation_3_desc') },
    { icon: 'i-heroicons-arrow-down-tray',            label: t('maintenance_support.prestation_4_label'), price: t('maintenance_support.prestation_4_price'), desc: t('maintenance_support.prestation_4_desc') },
    { icon: 'i-heroicons-battery-100',                label: t('maintenance_support.prestation_5_label'), price: t('maintenance_support.prestation_5_price'), desc: t('maintenance_support.prestation_5_desc') },
    { icon: 'i-heroicons-server',                     label: t('maintenance_support.prestation_6_label'), price: t('maintenance_support.prestation_6_price'), desc: t('maintenance_support.prestation_6_desc') },
    { icon: 'i-heroicons-shield-check',               label: t('maintenance_support.prestation_7_label'), price: t('maintenance_support.prestation_7_price'), desc: t('maintenance_support.prestation_7_desc') },
    { icon: 'i-heroicons-chat-bubble-left-right',     label: t('maintenance_support.prestation_8_label'), price: t('maintenance_support.prestation_8_price'), desc: t('maintenance_support.prestation_8_desc') },
  ],
  laptopItems: [
    t('maintenance_support.laptops_item_1'),
    t('maintenance_support.laptops_item_2'),
    t('maintenance_support.laptops_item_3'),
    t('maintenance_support.laptops_item_4'),
    t('maintenance_support.laptops_item_5'),
  ],
  desktopItems: [
    t('maintenance_support.desktops_item_1'),
    t('maintenance_support.desktops_item_2'),
    t('maintenance_support.desktops_item_3'),
    t('maintenance_support.desktops_item_4'),
    t('maintenance_support.desktops_item_5'),
  ],
  brands: ['HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'Apple', 'Toshiba', 'MSI', 'Huawei', 'Samsung'],
}))

const steps = computed(() => [
  { num: '01', title: t('maintenance_support.step_1_title'), desc: t('maintenance_support.step_1_desc') },
  { num: '02', title: t('maintenance_support.step_2_title'), desc: t('maintenance_support.step_2_desc') },
  { num: '03', title: t('maintenance_support.step_3_title'), desc: t('maintenance_support.step_3_desc') },
  { num: '04', title: t('maintenance_support.step_4_title'), desc: t('maintenance_support.step_4_desc') },
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
        <div class="absolute right-0 top-0 w-[300px] h-[300px] rounded-full border border-white/[0.06] translate-x-1/4 -translate-y-1/4"></div>
        <div class="relative z-10 px-4 md:px-8 max-w-2xl">
          <h1 class="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
            {{ $t('maintenance_support.hero_title') }}
          </h1>
          <p class="text-gray-300 text-sm md:text-base leading-relaxed max-w-xl">
            {{ $t('maintenance_support.hero_desc', { cities: '' }) }}
            <span class="text-white font-bold">{{ $t('maintenance_support.hero_cities') }}</span>.
          </p>
        </div>
      </section>

      <!-- BREADCRUMB -->
      <nav class="hidden sm:flex items-center gap-2 text-[13px] text-gray-500 font-medium py-4 border-b border-gray-200 mb-8">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">{{ $t('maintenance_support.breadcrumb_home') }}</NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <span class="text-[#274a82] font-bold">{{ $t('maintenance_support.breadcrumb_current') }}</span>
      </nav>

      <!-- HEADER + CAROUSEL -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-sm overflow-hidden shadow-lg border border-gray-100 mb-10">
        <div class="relative h-64 lg:h-auto min-h-[280px] overflow-hidden bg-gray-200 order-2 lg:order-1 group">
          <div class="absolute inset-0">
            <transition-group name="carousel-fade">
              <div v-for="(img, idx) in carouselImages" :key="idx" v-show="carouselIndex === idx" class="absolute inset-0">
                <img :src="img.src" :alt="img.alt" class="w-full h-full object-cover" />
              </div>
            </transition-group>
          </div>
          <div class="absolute bottom-0 left-0 w-full h-24 pointer-events-none z-10"
            style="background: linear-gradient(to top, #274a8280, transparent)"></div>
          <button @click="prev" class="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100" :aria-label="$t('maintenance_support.carousel_prev')">
            <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
          </button>
          <button @click="next" class="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100" :aria-label="$t('maintenance_support.carousel_next')">
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
      <div class="mb-8 text-center">
        <p class="text-[14px] font-black tracking-widest mb-1 text-[#e60012]">{{ $t('maintenance_support.prestations_label') }}</p>
        <h3 class="text-xl font-black text-gray-900">{{ $t('maintenance_support.prestations_title') }}</h3>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div v-for="(p, pi) in service.prestations" :key="pi"
          class="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
          <div class="h-1" :style="`background: ${pi % 2 === 0 ? '#274a82' : '#e60012'}`"></div>
          <div class="p-5">
            <div class="w-10 h-10 rounded-sm flex items-center justify-center mb-4"
              :style="`background: ${pi % 2 === 0 ? '#274a82' : '#e60012'}15`">
              <UIcon :name="p.icon" class="w-5 h-5" :style="`color: ${pi % 2 === 0 ? '#274a82' : '#e60012'}`" />
            </div>
            <h4 class="text-[13px] font-black text-gray-900 mb-3 group-hover:text-[#274a82] transition-colors">{{ p.label }}</h4>
            <p class="text-[12px] text-gray-500 leading-relaxed mb-4">{{ p.desc }}</p>
            <span v-if="p.price" class="text-[11px] font-black text-[#e60012]">{{ p.price }}</span>
          </div>
        </div>
      </div>

      <!-- LAPTOPS vs DESKTOPS -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-6 py-4 flex items-center gap-3 bg-gradient-to-r from-[#274a82] to-[#1a3460]">
            <UIcon name="i-heroicons-computer-desktop" class="w-5 h-5 text-white" />
            <h4 class="text-[14px] font-black text-white">{{ $t('maintenance_support.laptops_title') }}</h4>
          </div>
          <div class="p-5 space-y-2.5">
            <div v-for="item in service.laptopItems" :key="item" class="flex items-center gap-3 text-[13px] text-gray-700">
              <span class="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#e60012]"></span>
              {{ item }}
            </div>
          </div>
        </div>
        <div class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-6 py-4 flex items-center gap-3 bg-gradient-to-r from-[#e60012] to-[#b5000f]">
            <UIcon name="i-heroicons-server" class="w-5 h-5 text-white" />
            <h4 class="text-[14px] font-black text-white">{{ $t('maintenance_support.desktops_title') }}</h4>
          </div>
          <div class="p-5 space-y-2.5">
            <div v-for="item in service.desktopItems" :key="item" class="flex items-center gap-3 text-[13px] text-gray-700">
              <span class="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#274a82]"></span>
              {{ item }}
            </div>
          </div>
        </div>
      </div>

      <!-- MARQUES -->
      <div class="bg-white rounded-sm border border-gray-100 shadow-sm px-6 py-6 my-5">
        <p class="text-[14px] font-black text-gray-400 tracking-widest text-center mb-4">{{ $t('maintenance_support.brands_label') }}</p>
        <div class="flex flex-wrap justify-center gap-2">
          <span v-for="b in service.brands" :key="b"
            class="px-4 py-2 bg-[#f4f4f4] border border-gray-200 rounded-sm text-[12px] font-black text-gray-700 hover:text-white hover:border-transparent transition-all cursor-default"
            @mouseenter="($event.target as HTMLElement).style.background = '#274a82'"
            @mouseleave="($event.target as HTMLElement).style.background = ''">
            {{ b }}
          </span>
        </div>
      </div>

      <!-- PROCESSUS -->
      <section class="mt-4 mb-14">
        <div class="text-center mb-8">
          <p class="text-[14px] font-black text-[#e60012] tracking-widest mb-1">{{ $t('maintenance_support.process_label') }}</p>
          <h2 class="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{{ $t('maintenance_support.process_title') }}</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="(step, si) in steps" :key="si"
            class="relative bg-white rounded-sm border border-gray-100 shadow-sm px-5 py-6 overflow-hidden">
            <span class="absolute -top-3 -right-2 text-[72px] font-black text-gray-100 leading-none select-none pointer-events-none">{{ step.num }}</span>
            <div class="relative z-10">
              <div class="w-8 h-8 rounded-full bg-[#274a82] text-white text-[11px] font-black flex items-center justify-center mb-4">{{ step.num }}</div>
              <h3 class="text-[14px] font-black text-gray-900 mb-2">{{ step.title }}</h3>
              <p class="text-[12px] text-gray-500 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="rounded-sm overflow-hidden border border-[#274a82]/20 shadow-sm">
        <div class="bg-[#274a82] px-6 md:px-10 py-8 md:py-10 relative overflow-hidden">
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="text-center md:text-left">
              <h3 class="text-xl md:text-2xl font-black text-white mb-2">{{ $t('maintenance_support.cta_title') }}</h3>
              <p class="text-gray-300 text-sm">{{ $t('maintenance_support.cta_sub') }}</p>
              <div class="flex flex-wrap gap-4 mt-3 justify-center md:justify-start text-xs text-gray-400 font-semibold">
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-[#e60012]" />
                  {{ $t('maintenance_support.cta_address') }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 text-[#e60012]" />
                  {{ $t('maintenance_support.cta_hours') }}
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

<style scoped>
.carousel-fade-enter-active,
.carousel-fade-leave-active {
  transition: opacity 0.6s ease;
  position: absolute;
  inset: 0;
}
.carousel-fade-enter-from,
.carousel-fade-leave-to { opacity: 0; }
.carousel-fade-enter-to,
.carousel-fade-leave-from { opacity: 1; }
</style>