<script setup lang="ts">
const { t } = useI18n()

const SEO_URL = 'https://brcmarket.cm/contact'

useSeoMeta({
  title:              t('contact.seo_title'),
  ogTitle:            t('contact.seo_og_title'),
  description:        t('contact.seo_description'),
  ogDescription:      t('contact.seo_description'),
  ogImage:            'https://brcmarket.cm/images/og-image.png',
  ogUrl:              SEO_URL,
  twitterTitle:       t('contact.seo_twitter_title'),
  twitterDescription: t('contact.seo_twitter_description'),
  twitterImage:       'https://brcmarket.cm/images/og-image.png',
})

useHead({
  link: [{ rel: 'canonical', href: SEO_URL }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context':  'https://schema.org',
      '@type':     'ContactPage',
      name:        `${t('contact.seo_title')} - BRC Market`,
      url:         SEO_URL,
      description: t('contact.seo_description'),
    }),
  }],
})

const config = useRuntimeConfig()
const API    = config.public.apiBase
const toast  = useToast()

const name    = ref('')
const email   = ref('')
const phone   = ref('')
const subject = ref('')
const message = ref('')
const loading = ref(false)

const errors = ref<Record<string, string>>({})

const validateForm = () => {
  errors.value = {}
  if (!name.value)    errors.value.name    = t('contact.error_name')
  if (!email.value)   errors.value.email   = t('contact.error_email')
  if (!subject.value) errors.value.subject = t('contact.error_subject')
  if (!message.value) errors.value.message = t('contact.error_message')
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  loading.value = true

  const senderName = name.value

  try {
    await $fetch(`${API}/contact`, {
      method: 'POST',
      body: {
        name:    name.value,
        email:   email.value,
        phone:   phone.value,
        subject: subject.value,
        message: message.value,
      }
    })

    name.value    = ''
    email.value   = ''
    phone.value   = ''
    subject.value = ''
    message.value = ''

    toast.add({
      title:       t('contact.toast_success_title'),
      description: t('contact.toast_success_desc', { name: senderName }),
      color:       'success',
      icon:        'i-heroicons-check-circle',
      duration:    8000,
    })

  } catch {
    toast.add({
      title:       t('contact.toast_error_title'),
      description: t('contact.toast_error_desc'),
      color:       'error',
      icon:        'i-heroicons-x-circle',
      duration:    6000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-[#f4f4f4] min-h-screen pb-10">
    <div class="max-w-7xl mx-auto px-4">

      <!-- HERO BANNER -->
      <section class="relative h-[320px] md:h-[400px] flex items-center justify-center overflow-hidden">
        <img src="/images/contact-banner1.jpg" class="absolute inset-0 w-full h-full object-cover" />
        <div class="absolute inset-0 bg-black/60"></div>
        <div class="relative z-10 text-center px-6">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">{{ $t('contact.hero_title') }}</h1>
          <p class="text-gray-200 max-w-2xl mx-auto text-lg">
            {{ $t('contact.hero_sub', { brand: 'BRC Market' }) }}
          </p>
        </div>
      </section>

      <!-- CONTENT -->
      <UContainer class="py-10">
        <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-2">

          <!-- LEFT : CONTACT INFO -->
          <div class="pr-0 lg:pr-12">
            <h2 class="text-2xl font-semibold mb-6">{{ $t('contact.coordinates_title') }}</h2>

            <div class="space-y-6 text-gray-700">
              <div class="flex items-start gap-2">
                <UIcon name="i-heroicons-map-pin" class="w-6 h-6 text-red-600 mt-1" />
                <span>
                  {{ $t('contact.address') }}<br />
                  <span class="text-sm text-gray-500">{{ $t('contact.address_sub') }}</span>
                </span>
              </div>

              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-device-phone-mobile" class="w-6 h-6 text-red-600" />
                <span>+237 6 89 20 57 51 / 6 83 62 77 87</span>
              </div>

              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-envelope" class="w-6 h-6 text-red-600" />
                <span>contact@brcmarket.cm</span>
              </div>

              <div class="flex items-start gap-2">
                <UIcon name="i-heroicons-clock" class="w-6 h-6 text-red-600 mt-0.5" />
                <div class="flex flex-col gap-0.5">
                  <span>{{ $t('contact.hours_weekday') }}</span>
                  <span>{{ $t('contact.hours_saturday') }}</span>
                </div>
              </div>
            </div>

            <!-- SOCIALS -->
            <div class="flex gap-3 mt-8">
              <NuxtLink to="https://www.facebook.com/profile.php?id=61555704845467">
                <UButton icon="i-lucide-facebook" class="bg-[#274a82] text-white hover:bg-[#e60012]" />
              </NuxtLink>
              <NuxtLink to="https://wa.me/c/237689205751">
                <UButton icon="i-simple-icons-whatsapp" class="bg-green-500 text-white hover:bg-green-600" />
              </NuxtLink>
            </div>
          </div>

          <!-- VERTICAL DIVIDER (DESKTOP) -->
          <div class="hidden lg:block absolute left-1/2 top-0 h-full w-px bg-gray-200"></div>

          <!-- RIGHT : CONTACT FORM -->
          <div class="pl-0 lg:pl-12">
            <h2 class="text-2xl font-semibold mb-6">{{ $t('contact.form_title') }}</h2>

            <form @submit.prevent="handleSubmit" class="space-y-6">

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UInput
                  v-model="name"
                  :placeholder="$t('contact.field_name')"
                  icon="i-heroicons-user"
                  size="lg"
                  block
                  :error="errors.name"
                />
                <UInput
                  v-model="email"
                  type="email"
                  :placeholder="$t('contact.field_email')"
                  icon="i-heroicons-envelope"
                  size="lg"
                  block
                  :error="errors.email"
                />
                <UInput
                  v-model="phone"
                  type="tel"
                  :placeholder="$t('contact.field_phone')"
                  icon="i-heroicons-device-phone-mobile"
                  size="lg"
                  block
                />
                <UInput
                  v-model="subject"
                  :placeholder="$t('contact.field_subject')"
                  icon="i-heroicons-chat-bubble-left-right"
                  size="lg"
                  block
                  :error="errors.subject"
                />
              </div>

              <UTextarea
                v-model="message"
                :placeholder="$t('contact.field_message')"
                rows="5"
                cols="65"
                size="lg"
                block
                :error="errors.message"
              />

              <UButton
                type="submit"
                color="error"
                size="lg"
                block
                :loading="loading"
                icon="i-heroicons-paper-airplane"
              >
                {{ $t('contact.submit') }}
              </UButton>

            </form>
          </div>

        </div>
      </UContainer>

      <!-- MAP -->
      <section class="relative h-[450px] md:h-[550px] overflow-hidden mb-0">
        <iframe
          src="https://www.google.com/maps?q=Akwa%20Douala%20rue%20Castelnau&output=embed"
          class="w-full h-full border-0"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>

    </div>
  </div>
</template>