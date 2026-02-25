<script setup lang="ts">
import { ref } from 'vue'

  useHead({
    title: 'BRC Market',
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - Contact` : 'BRC Market';
    },
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  })

/* ================= FORM DATA ================= */
const name = ref('')
const email = ref('')
const phone = ref('')
const subject = ref('')
const message = ref('')
const loading = ref(false)

/* ================= ERRORS ================= */
const errors = ref<Record<string, string>>({})

const validateForm = () => {
  errors.value = {}

  if (!name.value) errors.value.name = 'Le nom est requis'
  if (!email.value) errors.value.email = 'Email requis'
  if (!subject.value) errors.value.subject = 'Sujet requis'
  if (!message.value) errors.value.message = 'Message requis'

  return Object.keys(errors.value).length === 0
}

/* ================= SUBMIT ================= */
const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  const payload = {
    name: name.value,
    email: email.value,
    phone: phone.value,
    subject: subject.value,
    message: message.value
  }

  console.log('CONTACT PAYLOAD:', payload)

  setTimeout(() => {
    loading.value = false
    alert('Votre message a bien été envoyé. Merci !')

    name.value = ''
    email.value = ''
    phone.value = ''
    subject.value = ''
    message.value = ''
  }, 1500)
}
</script>

<template>
 <div class="bg-[#f4f4f4] min-h-screen pb-20">
  <div class="max-w-7xl mx-auto px-4">
    <!-- ================= HERO BANNER ================= -->
    <section
      class="relative h-[320px] md:h-[400px] gap-5 flex items-center justify-center overflow-hidden  "
    >
      <img
        src="/images/contact-banner1.jpg"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black/60"></div>

      <div class="relative z-10 text-center px-6">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
          Contactez-nous
        </h1>
        <p class="text-gray-200 max-w-2xl mx-auto text-lg">
          Une question, un devis ou une assistance ?  
          L’équipe <span class="font-semibold text-white">BRC Market</span> est à votre écoute.
        </p>
      </div>
    </section>

    <!-- ================= CONTENT ================= -->
    <UContainer class="py-16">
    <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-2">

    <!-- ===== LEFT : CONTACT INFO ===== -->
    <div class="pr-0 lg:pr-12">
      <h2 class="text-2xl font-semibold mb-6">Nos coordonnées</h2>

      <div class="space-y-6 text-gray-700">

        <div class="flex items-start gap-2">
          <UIcon name="i-heroicons-map-pin" class="w-6 h-6 text-red-600 mt-1" />
          <span>
            Akwa Douala, rue Castelnau<br />
            <span class="text-sm text-gray-500">
              Juste après la rue du Collège King Akwa
            </span>
          </span>
        </div>

        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-device-phone-mobile" class="w-6 h-6 text-red-600" />
          <span>+237 6 89 20 57 51 / 6 83 62 77 87</span>
        </div>

        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-envelope" class="w-6 h-6 text-red-600" />
          <span>contact@brcmarket.com</span>
        </div>

        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-clock" class="w-6 h-6 text-red-600" />
          <span>Lun – Sam : 8h00 – 18h00</span>
        </div>
      </div>

      <!-- SOCIALS -->
      <div class="flex gap-3 mt-8">
        <NuxtLink to="https://www.facebook.com/profile.php?id=61555704845467">
            <UButton
            icon="i-lucide-facebook"
            class="bg-[#274a82] text-white hover:bg-[#e60012]"
            />
        </NuxtLink>
        <NuxtLink to=" https://wa.me/c/237689205751">
            <UButton
            icon="i-simple-icons-whatsapp"
            class="bg-green-500 text-white hover:bg-green-600"
            />
        </NuxtLink>
      </div>
    </div>

    <!-- ===== VERTICAL DIVIDER (DESKTOP) ===== -->
    <div class="hidden lg:block absolute left-1/2 top-0 h-full w-px bg-gray-200 "></div>

    <!-- ===== RIGHT : CONTACT FORM ===== -->
    <div class="pl-0 lg:pl-12">
      <h2 class="text-2xl font-semibold mb-6">Envoyez-nous un message</h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">

        <!-- GRID -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- Nom -->
            <UInput
            v-model="name"
            placeholder="Nom complet"
            icon="i-heroicons-user"
            size="lg"
            block
            :error="errors.name"
            />

            <!-- Email -->
            <UInput
            v-model="email"
            type="email"
            placeholder="Adresse email"
            icon="i-heroicons-envelope"
            size="lg"
            block
            :error="errors.email"
            />

            <!-- Téléphone -->
            <UInput
            v-model="phone"
            type="tel"
            placeholder="Numéro de téléphone"
            icon="i-heroicons-device-phone-mobile"
            size="lg"
            
            block
            />

            <!-- Sujet -->
            <UInput
            v-model="subject"
            placeholder="Sujet"
            icon="i-heroicons-chat-bubble-left-right"
            size="lg"
            block
            :error="errors.subject"
            />
        </div>

        <!-- Message (full width) -->
        <UTextarea
            v-model="message"
            placeholder="Votre message"
            rows="5"
            cols="65"
            size="lg"
            block
            :error="errors.message"
        />

        <!-- Submit -->
        <UButton
        
            type="submit"
            color="error"
            size="lg"
            block
            :loading="loading"
            icon="i-heroicons-paper-airplane"
        >
            Envoyer le message
        </UButton>

        </form>

    </div>

  </div>

</UContainer>
 <section class="relative h-[320px] md:h-[400px] flex items-center justify-center overflow-hidden mb-10">
  <iframe
    src="https://www.google.com/maps?q=Akwa%20Douala%20rue%20Castelnau&output=embed"
    class="w-full h-[450px] md:h-[550px] border-0"
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"
  ></iframe>
</section>
  </div>
  </div>
</template>
