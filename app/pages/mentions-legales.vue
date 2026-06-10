<script setup lang="ts">
const { t } = useI18n()

useHead({
  title: t('mentions_legales.seo_title'),
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
})

const sections = computed(() => [
  {
    icon: 'i-heroicons-building-office-2',
    title: t('mentions_legales.section_editor_title'),
    content: [
      { label: t('mentions_legales.section_editor_raison'),  value: t('mentions_legales.section_editor_raison_val') },
      { label: t('mentions_legales.section_editor_forme'),   value: t('mentions_legales.section_editor_forme_val') },
      { label: t('mentions_legales.section_editor_siege'),   value: t('mentions_legales.section_editor_siege_val') },
      { label: t('mentions_legales.section_editor_tel'),     value: t('mentions_legales.section_editor_tel_val') },
      { label: t('mentions_legales.section_editor_email'),   value: t('businessrevcompany@gmail.com')},
      { label: t('mentions_legales.section_editor_secteur'), value: t('mentions_legales.section_editor_secteur_val') },
    ]
  },
  {
    icon: 'i-heroicons-globe-alt',
    title: t('mentions_legales.section_hosting_title'),
    content: [
      { label: t('mentions_legales.section_hosting_host'), value: t('mentions_legales.section_hosting_host_val') },
      { label: t('mentions_legales.section_hosting_site'), value: t('mentions_legales.section_hosting_site_val') },
    ]
  },
  {
    icon: 'i-heroicons-shield-check',
    title: t('mentions_legales.section_data_title'),
    paragraphs: [
      t('mentions_legales.section_data_p1'),
      t('mentions_legales.section_data_p2'),
      t('mentions_legales.section_data_p3'),
    ]
  },
  {
    icon: 'i-heroicons-shopping-cart',
    title: t('mentions_legales.section_cgv_title'),
    paragraphs: [
      t('mentions_legales.section_cgv_p1'),
      t('mentions_legales.section_cgv_p2'),
      t('mentions_legales.section_cgv_p3'),
    ]
  },
  {
    icon: 'i-heroicons-arrow-path',
    title: t('mentions_legales.section_return_title'),
    paragraphs: [
      t('mentions_legales.section_return_p1'),
      t('mentions_legales.section_return_p2'),
    ]
  },
  {
    icon: 'i-heroicons-wrench-screwdriver',
    title: t('mentions_legales.section_warranty_title'),
    paragraphs: [
      t('mentions_legales.section_warranty_p1'),
      t('mentions_legales.section_warranty_p2'),
    ]
  },
  {
    icon: 'i-heroicons-scale',
    title: t('mentions_legales.section_ip_title'),
    paragraphs: [
      t('mentions_legales.section_ip_p1'),
      t('mentions_legales.section_ip_p2'),
    ]
  },
  {
    icon: 'i-heroicons-exclamation-triangle',
    title: t('mentions_legales.section_liability_title'),
    paragraphs: [
      t('mentions_legales.section_liability_p1'),
      t('mentions_legales.section_liability_p2'),
    ]
  },
  {
    icon: 'i-heroicons-document-text',
    title: t('mentions_legales.section_law_title'),
    paragraphs: [
      t('mentions_legales.section_law_p1'),
    ]
  },
])
</script>

<template>
  <div class="bg-[#f4f4f4] min-h-screen pb-20">
    <div class="max-w-7xl mx-auto px-4">

      <!-- ===== HERO BANNER ===== -->
      <section class="relative h-[200px] md:h-[320px] mt flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-[#274a82] via-[#1a3460] to-[#0f1f3d]"></div>

        <!-- Décoration géométrique -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute -top-10 -right-10 w-64 h-64 rounded-full border border-white/10"></div>
          <div class="absolute -top-20 -right-20 w-96 h-96 rounded-full border border-white/5"></div>
          <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#e60012]/60 to-transparent"></div>
          <div class="absolute top-10 left-10 w-2 h-2 rounded-full bg-[#e60012]"></div>
          <div class="absolute top-20 left-24 w-1 h-1 rounded-full bg-white/40"></div>
          <div class="absolute bottom-12 right-32 w-1.5 h-1.5 rounded-full bg-[#e60012]/60"></div>
        </div>

        <div class="relative z-10 text-center px-6">
          <h1 class="text-3xl md:text-5xl font-black text-white my-5 tracking-tight">
            {{ $t('mentions_legales.hero_title') }}
          </h1>
          <p class="text-gray-300 text-sm md:text-base max-w-lg mx-auto">
            {{ $t('mentions_legales.hero_sub') }}
            <span class="text-white font-bold">{{ $t('mentions_legales.hero_brand') }}</span>
          </p>
          <p class="text-gray-500 text-xs my-5">{{ $t('mentions_legales.hero_updated') }}</p>
        </div>
      </section>

      <!-- ===== BREADCRUMB ===== -->
      <nav class="flex items-center gap-2 text-[13px] text-gray-500 font-medium py-4 border-b border-gray-200 mb-8">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">{{ $t('mentions_legales.breadcrumb_home') }}</NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <span class="text-[#274a82] font-bold">{{ $t('mentions_legales.breadcrumb_current') }}</span>
      </nav>

      <!-- ===== TABLE DES MATIÈRES (desktop) ===== -->
      <div class="hidden lg:block mb-10">
        <div class="bg-white rounded-sm border border-gray-100 p-6 shadow-sm">
          <p class="text-[14px] font-black text-gray-400 tracking-widest mb-4">{{ $t('mentions_legales.toc_label') }}</p>
          <div class="flex flex-wrap gap-2">
            <a
              v-for="(s, i) in sections" :key="i"
              :href="`#section-${i}`"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] font-bold text-[#274a82] bg-[#274a82]/5 hover:bg-[#274a82] hover:text-white transition-all duration-200 border border-[#274a82]/10"
            >
              <span class="text-[#e60012] font-black">{{ String(i + 1).padStart(2, '0') }}</span>
              {{ s.title }}
            </a>
          </div>
        </div>
      </div>

      <!-- ===== SECTIONS ===== -->
      <div class="space-y-6">
        <div
          v-for="(section, i) in sections"
          :key="i"
          :id="`section-${i}`"
          class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden scroll-mt-6"
        >
          <!-- Header section -->
          <div class="flex items-center gap-4 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div class="w-9 h-9 rounded-sm bg-[#274a82] flex items-center justify-center flex-shrink-0">
              <UIcon :name="section.icon" class="w-4.5 h-4.5 text-white" />
            </div>
            <div class="flex items-center gap-3 flex-1">
              <span class="text-[11px] font-black text-[#e60012] tracking-widest">
                {{ String(i + 1).padStart(2, '0') }}
              </span>
              <h2 class="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                {{ section.title }}
              </h2>
            </div>
          </div>

          <!-- Contenu -->
          <div class="px-6 py-5">

            <!-- Table clé/valeur -->
            <div v-if="section.content" class="space-y-0 divide-y divide-gray-50">
              <div
                v-for="(item, j) in section.content"
                :key="j"
                class="flex items-start gap-4 py-3"
              >
                <span class="text-[14px] font-black text-gray-400 tracking-wider min-w-[140px] pt-0.5 flex-shrink-0">
                  {{ item.label }}
                </span>
                <span class="text-[13px] font-semibold text-gray-800 leading-relaxed">
                  {{ item.value }}
                </span>
              </div>
            </div>

            <!-- Paragraphes -->
            <div v-if="section.paragraphs" class="space-y-3">
              <p
                v-for="(para, j) in section.paragraphs"
                :key="j"
                class="text-[13px] sm:text-[14px] text-gray-600 leading-[1.8]"
              >
                {{ para }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== CONTACT FOOTER ===== -->
      <div class="mt-10 rounded-sm overflow-hidden border border-[#274a82]/20 shadow-sm">
        <div class="bg-[#274a82] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-center sm:text-left">
            <p class="text-white font-black text-base mb-1">{{ $t('mentions_legales.contact_question') }}</p>
            <p class="text-gray-300 text-sm">{{ $t('mentions_legales.contact_hours') }}</p>
          </div>
          <div class="flex gap-3 flex-shrink-0">
            <NuxtLink to="/contact"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e60012] hover:bg-red-700 text-white text-sm font-black rounded-sm transition-all shadow-md">
              <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
              {{ $t('mentions_legales.contact_btn') }}
            </NuxtLink>
            <a href="tel:+237689205751"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-black rounded-sm transition-all">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4" />
              {{ $t('mentions_legales.contact_call') }}
            </a>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>