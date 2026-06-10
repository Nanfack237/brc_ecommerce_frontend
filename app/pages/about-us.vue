<script setup lang="ts">
const { t } = useI18n()

const SEO_URL = 'https://brcmarket.cm/about'
useSeoMeta({
  title:              t('about.seo_title'),
  ogTitle:            t('about.seo_og_title'),
  description:        t('about.seo_description'),
  ogDescription:      t('about.seo_og_description'),
  ogImage:            'https://brcmarket.cm/images/og-image.png',
  ogUrl:              SEO_URL,
  twitterTitle:       t('about.seo_twitter_title'),
  twitterDescription: t('about.seo_twitter_description'),
  twitterImage:       'https://brcmarket.cm/images/og-image.png',
})
useHead({ link: [{ rel: 'canonical', href: SEO_URL }] })
</script>

<template>
  <div class="max-w-7xl mx-auto px-4">

    <!-- HERO BANNER -->
    <section class="relative h-[320px] md:h-[400px] gap-5 flex items-center justify-center overflow-hidden">
      <img
        src="/images/about-us1.jpg"
        alt="À propos de BRC Market"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black/60"></div>
      <div class="relative z-10 text-center px-6">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
          {{ $t('about.hero_title') }}
        </h1>
        <p class="text-gray-200 max-w-3xl mx-auto text-lg">
          {{ $t('about.hero_sub') }}
        </p>
      </div>
    </section>

    <!-- INTRO -->
    <UContainer class="py-10">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl font-semibold mb-6">{{ $t('about.intro_title') }}</h2>
        <p class="text-gray-600 leading-relaxed text-lg">
          <span class="font-semibold text-gray-800">BRC Market</span>
          {{ $t('about.intro_body', { brand: '' }).replace('BRC Market', '').trimStart() }}
          <br /><br />
          {{ $t('about.intro_body2') }}
        </p>
      </div>
    </UContainer>

    <!-- VALUES -->
    <UContainer class="pb-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

        <UCard class="p-8 text-center shadow-lg">
          <UIcon name="i-heroicons-shield-check" class="w-10 h-10 text-red-600 mx-auto mb-4" />
          <h3 class="text-xl font-semibold mb-2">{{ $t('about.value1_title') }}</h3>
          <p class="text-gray-600">{{ $t('about.value1_body') }}</p>
        </UCard>

        <UCard class="p-8 text-center shadow-lg">
          <UIcon name="i-heroicons-light-bulb" class="w-10 h-10 text-red-600 mx-auto mb-4" />
          <h3 class="text-xl font-semibold mb-2">{{ $t('about.value2_title') }}</h3>
          <p class="text-gray-600">{{ $t('about.value2_body') }}</p>
        </UCard>

        <UCard class="p-8 text-center shadow-lg">
          <UIcon name="i-heroicons-user-group" class="w-10 h-10 text-red-600 mx-auto mb-4" />
          <h3 class="text-xl font-semibold mb-2">{{ $t('about.value3_title') }}</h3>
          <p class="text-gray-600">{{ $t('about.value3_body') }}</p>
        </UCard>

      </div>
    </UContainer>

    <!-- SERVICES -->
    <section class="bg-gray-50 py-10">
      <UContainer>
        <h2 class="text-3xl font-semibold text-center mb-12">{{ $t('about.services_title') }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          <UCard class="p-6 shadow-md">
            <h3 class="font-semibold mb-2">{{ $t('about.service1_title') }}</h3>
            <p class="text-gray-600 text-sm">{{ $t('about.service1_body') }}</p>
          </UCard>

          <UCard class="p-6 shadow-md">
            <h3 class="font-semibold mb-2">{{ $t('about.service2_title') }}</h3>
            <p class="text-gray-600 text-sm">{{ $t('about.service2_body') }}</p>
          </UCard>

          <UCard class="p-6 shadow-md">
            <h3 class="font-semibold mb-2">{{ $t('about.service3_title') }}</h3>
            <p class="text-gray-600 text-sm">{{ $t('about.service3_body') }}</p>
          </UCard>

          <UCard class="p-6 shadow-md">
            <h3 class="font-semibold mb-2">{{ $t('about.service4_title') }}</h3>
            <p class="text-gray-600 text-sm">{{ $t('about.service4_body') }}</p>
          </UCard>

          <UCard class="p-6 shadow-md">
            <h3 class="font-semibold mb-2">{{ $t('about.service5_title') }}</h3>
            <p class="text-gray-600 text-sm">{{ $t('about.service5_body') }}</p>
          </UCard>

          <UCard class="p-6 shadow-md">
            <h3 class="font-semibold mb-2">{{ $t('about.service6_title') }}</h3>
            <p class="text-gray-600 text-sm">{{ $t('about.service6_body') }}</p>
          </UCard>

        </div>
      </UContainer>
    </section>

    <!-- CTA -->
    <UContainer class="py-20 text-center">
      <h2 class="text-3xl font-semibold mb-4">{{ $t('about.cta_title') }}</h2>
      <p class="text-gray-600 mb-8 max-w-2xl mx-auto">{{ $t('about.cta_body') }}</p>
      <div class="flex justify-center gap-4">
        <UButton color="error" size="lg" to="/contact">{{ $t('about.cta_contact') }}</UButton>
        <UButton class="bg-[#274a82] hover:bg-[#274a82] text-white" size="lg" to="/boutique">{{ $t('about.cta_shop') }}</UButton>
      </div>
    </UContainer>

  </div>
</template>