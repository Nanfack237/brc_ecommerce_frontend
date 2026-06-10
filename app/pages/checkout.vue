<script setup lang="ts">
import { useRouter } from '#app'
import axios from 'axios'
import useCart from '@/composables/useCart'
import { useAuth } from '@/composables/useAuth' 

const { authUser: user } = useAuth() 
const { t } = useI18n()
const toast  = useToast()
const config = useRuntimeConfig()
const API    = config.public.apiBase
const { cartItems, totalPrice, clearCart } = useCart()

useSeoMeta({
  title:   t('checkout.seo_title'),
  ogTitle: t('checkout.seo_og_title'),
  ogUrl:   'https://brcmarket.cm/checkout',
  robots:  'noindex, nofollow',
})
useHead({ link: [{ rel: 'canonical', href: 'https://brcmarket.cm/checkout' }] })

const playOrderSound = () => {
  try {
    const audio = new Audio('/sounds/order-client.mp3')
    audio.volume = 0.8
    audio.play().catch(() => {})
  } catch {}
}

const currentStep = ref(1)

const steps = computed(() => [
  { id: 1, title: t('checkout.step1_title'), desc: t('checkout.step1_desc'), icon: 'i-heroicons-map-pin'     },
  { id: 2, title: t('checkout.step2_title'), desc: t('checkout.step2_desc'), icon: 'i-heroicons-credit-card' },
  { id: 3, title: t('checkout.step3_title'), desc: t('checkout.step3_desc'), icon: 'i-heroicons-mail'        },
])

const countryCodes = [
  { flag: '🇨🇲', code: '+237', name: 'Cameroun'       },
  { flag: '🇧🇯', code: '+229', name: 'Bénin'          },
  { flag: '🇧🇫', code: '+226', name: 'Burkina Faso'   },
  { flag: '🇨🇬', code: '+242', name: 'Congo'          },
  { flag: '🇨🇩', code: '+243', name: 'RD Congo'       },
  { flag: '🇨🇮', code: '+225', name: "Côte d'Ivoire"  },
  { flag: '🇬🇦', code: '+241', name: 'Gabon'          },
  { flag: '🇬🇭', code: '+233', name: 'Ghana'          },
  { flag: '🇬🇳', code: '+224', name: 'Guinée'         },
  { flag: '🇰🇪', code: '+254', name: 'Kenya'          },
  { flag: '🇲🇦', code: '+212', name: 'Maroc'          },
  { flag: '🇲🇱', code: '+223', name: 'Mali'           },
  { flag: '🇳🇪', code: '+227', name: 'Niger'          },
  { flag: '🇳🇬', code: '+234', name: 'Nigéria'        },
  { flag: '🇸🇳', code: '+221', name: 'Sénégal'        },
  { flag: '🇹🇩', code: '+235', name: 'Tchad'          },
  { flag: '🇹🇬', code: '+228', name: 'Togo'           },
  { flag: '🇹🇳', code: '+216', name: 'Tunisie'        },
  { flag: '🇿🇦', code: '+27',  name: 'Afrique du Sud' },
]

const selectedCountry = ref(countryCodes[0])

const form = ref({
  nom:       '',
  prenom:    '',
  telephone: '',
  whatsapp:  '',
  email:     '',
  pays:      'Cameroun',
  ville:     '',
  quartier:  '',
  infosPlus: '',
  payment:   'cash',
})

// Pré-remplissage si l'utilisateur est connecté
onMounted(() => {
  if (user.value) {
    form.value.nom       = user.value.last_name  ?? ''
    form.value.prenom    = user.value.first_name ?? ''
    form.value.email     = user.value.email      ?? ''
    form.value.telephone = user.value.phone      ?? ''

    // Détecte l'indicatif du numéro de téléphone si présent (ex: "+237 6xx...")
    if (user.value.phone) {
      const matched = countryCodes.find(c => user.value!.phone!.startsWith(c.code))
      if (matched) {
        selectedCountry.value    = matched
        form.value.telephone     = user.value.phone.replace(matched.code, '').trim()
      }
    }
  }
})

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailValid = computed(() => !form.value.email || emailRegex.test(form.value.email))

const subtotal   = computed(() => totalPrice.value)
const grandTotal = computed(() => subtotal.value)

const paymentOptions = computed(() => [
  { id: 'om',   label: t('checkout.pay_om_label'),   sub: t('checkout.pay_om_sub'),   bg: 'bg-orange-500', text: 'text-white',    border: 'border-orange-400', dot: 'bg-orange-500', abbr: 'OM',  icon: null },
  { id: 'momo', label: t('checkout.pay_momo_label'), sub: t('checkout.pay_momo_sub'), bg: 'bg-yellow-400', text: 'text-blue-900', border: 'border-yellow-400', dot: 'bg-yellow-400', abbr: 'MM',  icon: null },
  { id: 'cash', label: t('checkout.pay_cash_label'), sub: t('checkout.pay_cash_sub'), bg: 'bg-[#274a82]',  text: 'text-white',    border: 'border-[#274a82]',  dot: 'bg-[#274a82]',  abbr: null,  icon: 'i-heroicons-banknotes' },
])

const guarantees = computed(() => [
  { icon: 'i-heroicons-envelope',   text: t('checkout.guarantee_email'),  color: 'text-[#e60012]'  },
  { icon: 'i-heroicons-phone',      text: t('checkout.guarantee_phone'),  color: 'text-[#274a82]'  },
  { icon: 'i-heroicons-arrow-path', text: t('checkout.guarantee_return'), color: 'text-orange-400' },
])

const villesSuggestions = [
  'Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua',
  'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi',
  'Limbé', 'Kumba', 'Buea', 'Edéa', 'Nkongsamba',
]
const showVilleSuggestions     = ref(false)
const villeSuggestionsFiltered = computed(() =>
  form.value.ville.length >= 2
    ? villesSuggestions.filter(v => v.toLowerCase().startsWith(form.value.ville.toLowerCase()))
    : []
)
const selectVille = (v: string) => {
  form.value.ville = v
  showVilleSuggestions.value = false
}

const quartiersYaounde = [
  'Bastos', 'Melen', 'Ngousso', 'Ekounou', 'Biyem-Assi',
  'Essos', 'Omnisport', 'Nlongkak', 'Mvog-Mbi', 'Tsinga',
  'Etoa-Meki', 'Mendong', 'Messa', 'Obili', 'Mvog-Betsi',
  'Nkomo', 'Etoug-Ebe', 'Djoungolo', 'Briqueterie', 'Madagascar',
]
const quartiersDouala = [
  'Akwa', 'Bonanjo', 'Bonapriso', 'Bali', 'Deido',
  'Ndokoti', 'Makepe', 'Kotto', 'Logbessou', 'PK',
  'Bonaberi', 'Bépanda', 'New-Bell', 'Yassa', 'Nyalla',
]
const quartiersAll = [...quartiersYaounde, ...quartiersDouala]

const showQuartierSuggestions     = ref(false)
const quartierSuggestionsFiltered = computed(() =>
  form.value.quartier.length >= 2
    ? quartiersAll.filter(q => q.toLowerCase().startsWith(form.value.quartier.toLowerCase()))
    : []
)
const selectQuartier = (q: string) => {
  form.value.quartier = q
  showQuartierSuggestions.value = false
}

const canGoNext = computed(() => {
  if (currentStep.value === 1)
    return !!form.value.nom.trim() && !!form.value.telephone.trim() && !!form.value.ville && emailValid.value
  return true
})

const isSubmitting = ref(false)

const submitOrder = async () => {
  if (currentStep.value === 1) {
    currentStep.value++
    return
  }

  isSubmitting.value = true
  let orderRef = ''
  const fullPhone = `${selectedCountry.value.code} ${form.value.telephone}`

  const payload = {
    nom:      `${form.value.prenom} ${form.value.nom}`.trim(),
    email:    form.value.email.trim() || null,
    phone:    fullPhone,
    adresse:  [form.value.quartier, form.value.ville, form.value.pays].filter(Boolean).join(', '),
    ville:    form.value.ville    || null,
    quartier: form.value.quartier || null,
    pays:     form.value.pays     || null,
    items:    cartItems.value.map((i) => ({
      id:       i.id       ?? null,
      name:     i.name,
      price:    i.price,
      quantity: i.quantity,
      image:    (i.image && !i.image.startsWith('data:')) ? i.image : null,
      slug:     i.slug     || null,
    })),
    subtotal:  subtotal.value,
    livraison: 0,
    discount:  0,
    total:     grandTotal.value,
    payment:   form.value.payment,
    shipping:  'standard',
    notes:     form.value.infosPlus?.trim() || null,
  }

  try {
    const resp = await axios.post(`${API}/orders/checkout`, payload, {
      headers:         { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      withCredentials: true, // envoie le cookie Sanctum si connecté
    })
    orderRef = resp.data?.ref ?? resp.data?.order_number ?? `CMD-${Date.now().toString().slice(-6)}`
  } catch (e: any) {
    isSubmitting.value = false
    const msg = e?.response?.data?.message || t('checkout.toast_error_desc')
    toast.add({ title: t('checkout.toast_error_title'), description: msg, color: 'error', icon: 'i-heroicons-exclamation-triangle' })
    return
  }

  isSubmitting.value = false
  playOrderSound()

  const senderName  = form.value.prenom || form.value.nom
  const description = form.value.email
    ? t('checkout.toast_success_with_email', { name: senderName, ref: orderRef, email: form.value.email })
    : t('checkout.toast_success_no_email',   { name: senderName, ref: orderRef })

  toast.add({
    title:       t('checkout.toast_success_title'),
    description,
    color:       'success',
    icon:        'i-heroicons-check-circle',
    duration:    10000,
  })

  window.dispatchEvent(new Event('order:placed'))
  clearCart()
  await new Promise(r => setTimeout(r, 3000))
  navigateTo('/boutique')
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 })
    .format(n).replace('XAF', 'FCFA')

const articleLabel = (count: number) =>
  count > 1 ? t('checkout.articles') : t('checkout.article')
</script>

<template>
  <div class="min-h-screen bg-[#f4f5f7]">
    <UContainer class="py-8 sm:py-12">

      <!-- STEPPER -->
      <div class="max-w-2xl mx-auto mb-10">
        <div class="flex items-center relative">
          <div class="absolute top-5 left-[15%] right-[15%] h-0.5 bg-gray-200 z-0"></div>
          <div class="absolute top-5 left-[15%] h-0.5 bg-[#e60012] z-0 transition-all duration-700"
            :style="{ width: currentStep > 1 ? '70%' : '0%' }"></div>
          <div v-for="step in steps" :key="step.id" class="flex flex-col items-center z-10 flex-1">
            <div class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 text-sm font-black"
              :class="currentStep > step.id
                ? 'bg-[#e60012] border-[#e60012] text-white'
                : currentStep === step.id
                  ? 'bg-white border-[#e60012] text-[#e60012] shadow-md shadow-red-100'
                  : 'bg-white border-gray-200 text-gray-300'">
              <UIcon v-if="currentStep > step.id" name="i-heroicons-check" class="w-5 h-5" />
              <span v-else>{{ step.id }}</span>
            </div>
            <p class="text-[11px] sm:text-xs font-black tracking-wider mt-2 text-center"
              :class="currentStep >= step.id ? 'text-gray-800' : 'text-gray-300'">
              {{ step.title }}
            </p>
          </div>
        </div>
      </div>

      <!-- LAYOUT -->
      <div class="grid grid-cols-12 gap-6 max-w-6xl mx-auto">

        <!-- FORMULAIRE -->
        <div class="col-span-12 lg:col-span-7 xl:col-span-8">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            <!-- Header étape -->
            <div class="flex items-center gap-3 px-6 sm:px-8 py-5 border-b border-gray-50 bg-gradient-to-r from-[#274a82]/5 to-transparent">
              <div class="w-8 h-8 rounded-full bg-[#e60012] text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                {{ currentStep }}
              </div>
              <div>
                <h2 class="text-base sm:text-lg font-black text-gray-900">
                  {{ currentStep === 1 ? $t('checkout.form_title_step1') : $t('checkout.form_title_step2') }}
                </h2>
                <p class="text-[11px] text-gray-400 font-medium">{{ steps[currentStep - 1].desc }}</p>
              </div>

              <!-- Badge utilisateur connecté (header) -->
              <div v-if="user" class="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 flex-shrink-0">
                <UIcon name="i-heroicons-check-badge" class="w-3.5 h-3.5 text-green-600" />
                <span class="text-[11px] font-black text-green-700 hidden sm:inline">{{ user.first_name }}</span>
              </div>
            </div>

            <div class="p-6 sm:p-8">
              <Transition name="slide" mode="out-in">

                <!-- STEP 1 -->
                <div v-if="currentStep === 1" key="s1" class="space-y-4">

                  <!-- Bannière connecté -->
                  <div v-if="user" class="flex items-center gap-3 px-4 py-3 rounded-xl border border-green-100 bg-green-50/50">
                    <UIcon name="i-heroicons-check-badge" class="w-4 h-4 text-green-600 flex-shrink-0" />
                    
                    <i18n-t keypath="checkout.auth_prefilled" tag="p" class="text-[12px] text-gray-600 leading-relaxed">
                      <template #name>
                        <strong class="text-gray-800">
                          {{ user.first_name }} {{ user.last_name }}
                        </strong>
                      </template>
                    </i18n-t>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <UFormGroup :label="$t('checkout.field_nom')">
                      <UInput v-model="form.nom" icon="i-heroicons-user" :placeholder="$t('checkout.field_nom').replace(' *','')" size="lg" variant="outline" class="w-full" />
                    </UFormGroup>

                    <UFormGroup :label="$t('checkout.field_prenom')">
                      <UInput v-model="form.prenom" icon="i-heroicons-user" :placeholder="$t('checkout.field_prenom')" size="lg" variant="outline" class="w-full" />
                    </UFormGroup>

                    <UFormGroup :label="$t('checkout.field_telephone')">
                      <div class="flex gap-2 items-center">
                        <div class="relative flex-shrink-0">
                          <select v-model="selectedCountry"
                            class="pl-2 pr-6 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#274a82] appearance-none cursor-pointer font-medium text-gray-700"
                            style="height:42px; min-width:84px;">
                            <option v-for="c in countryCodes" :key="c.code + c.name" :value="c">
                              {{ c.flag }} {{ c.code }}
                            </option>
                          </select>
                          <UIcon name="i-heroicons-chevron-down" class="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        </div>
                        <UInput v-model="form.telephone" type="tel" placeholder="6xx xxx xxx" size="lg" variant="outline" class="flex-1" />
                      </div>
                    </UFormGroup>

                    <UFormGroup :label="$t('checkout.field_whatsapp')">
                      <UInput v-model="form.whatsapp" icon="i-heroicons-chat-bubble-left-ellipsis" placeholder="6xx xxx xxx" size="lg" variant="outline" class="w-full" />
                    </UFormGroup>

                    <UFormGroup :label="$t('checkout.field_email')"
                      :error="form.email && !emailValid ? $t('checkout.field_email_invalid') : undefined">
                      <UInput v-model="form.email" icon="i-heroicons-envelope" type="email"
                        placeholder="exemple@mail.com" size="lg" variant="outline" class="w-full"
                        :trailing-icon="form.email ? (emailValid ? 'i-heroicons-check-circle-solid' : 'i-heroicons-x-circle-solid') : undefined" />
                    </UFormGroup>

                    <!-- Ville -->
                    <UFormGroup :label="$t('checkout.field_ville')" class="relative">
                      <UInput v-model="form.ville" icon="i-heroicons-building-office-2"
                        :placeholder="$t('checkout.field_ville_placeholder')"
                        size="lg" variant="outline" class="w-full" autocomplete="off"
                        @focus="showVilleSuggestions = true"
                        @blur="setTimeout(() => showVilleSuggestions = false, 200)" />
                      <ul v-if="showVilleSuggestions && villeSuggestionsFiltered.length"
                        class="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
                        <li v-for="v in villeSuggestionsFiltered" :key="v"
                          @mousedown.prevent="selectVille(v)"
                          class="px-4 py-2.5 text-sm cursor-pointer hover:bg-[#274a82]/10 hover:text-[#274a82] font-medium transition-colors flex items-center gap-2">
                          <UIcon name="i-heroicons-building-office-2" class="w-3.5 h-3.5 text-gray-300" />
                          {{ v }}
                        </li>
                      </ul>
                    </UFormGroup>

                    <!-- Quartier -->
                    <UFormGroup :label="$t('checkout.field_quartier')" class="sm:col-span-2 relative">
                      <UInput v-model="form.quartier" icon="i-heroicons-map-pin"
                        :placeholder="$t('checkout.field_quartier_placeholder')"
                        size="lg" variant="outline" class="w-full" autocomplete="off"
                        @focus="showQuartierSuggestions = true"
                        @blur="setTimeout(() => showQuartierSuggestions = false, 200)" />
                      <ul v-if="showQuartierSuggestions && quartierSuggestionsFiltered.length"
                        class="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
                        <li v-for="q in quartierSuggestionsFiltered" :key="q"
                          @mousedown.prevent="selectQuartier(q)"
                          class="px-4 py-2.5 text-sm cursor-pointer hover:bg-[#274a82]/10 hover:text-[#274a82] font-medium transition-colors flex items-center gap-2">
                          <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-gray-300" />
                          {{ q }}
                        </li>
                      </ul>
                    </UFormGroup>

                    <UFormGroup :label="$t('checkout.field_instructions')" class="sm:col-span-2">
                      <UTextarea v-model="form.infosPlus" :placeholder="$t('checkout.field_instructions_placeholder')" size="lg" variant="outline" :rows="3" class="w-full" autoresize />
                    </UFormGroup>

                  </div>

                  <!-- Info email -->
                  <div class="flex items-start gap-3 px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/40">
                    <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-[#274a82] flex-shrink-0 mt-0.5" />
                    <p class="text-[12px] text-gray-600 leading-relaxed">
                      <template v-if="form.email && emailValid">
                        {{ $t('checkout.email_info_set', { email: form.email }) }}
                      </template>
                      <template v-else>
                        {{ $t('checkout.email_info_empty') }}
                      </template>
                    </p>
                  </div>
                </div>

                <!-- STEP 2 -->
                <div v-else key="s2" class="space-y-3">

                  <!-- Récap adresse -->
                  <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 mb-4">
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-[#274a82] flex-shrink-0" />
                    <span>{{ $t('checkout.delivery_address') }} <strong class="text-gray-800">{{ [form.quartier, form.ville, form.pays].filter(Boolean).join(', ') }}</strong></span>
                    <button @click="currentStep = 1" class="ml-auto text-[#274a82] font-bold hover:text-[#e60012] transition-colors flex items-center gap-1">
                      <UIcon name="i-heroicons-pencil-square" class="w-3 h-3" />
                      {{ $t('checkout.edit') }}
                    </button>
                  </div>

                  <!-- Options paiement -->
                  <div v-for="opt in paymentOptions" :key="opt.id"
                    @click="form.payment = opt.id"
                    class="flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-200"
                    :class="form.payment === opt.id ? `${opt.border} shadow-sm` : 'border-gray-100 hover:border-gray-200'">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm" :class="[opt.bg, opt.text]">
                      <UIcon v-if="opt.icon" :name="opt.icon" class="w-6 h-6" />
                      <span v-else class="text-xs font-black">{{ opt.abbr }}</span>
                    </div>
                    <div class="flex-1">
                      <p class="font-black text-gray-900">{{ opt.label }}</p>
                      <p class="text-xs text-gray-400 mt-0.5">{{ opt.sub }}</p>
                    </div>
                    <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      :class="form.payment === opt.id ? opt.border : 'border-gray-200'">
                      <div v-if="form.payment === opt.id" class="w-2.5 h-2.5 rounded-full" :class="opt.dot"></div>
                    </div>
                  </div>

                  <!-- Info paiement -->
                  <div v-if="form.payment === 'om'" class="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                        <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p class="text-xs font-black text-orange-800 mb-1">{{ $t('checkout.info_om_title') }}</p>
                        <p class="text-xs text-orange-700 leading-relaxed">{{ $t('checkout.info_om_body') }}</p>
                      </div>
                    </div>
                  </div>
                  <div v-else-if="form.payment === 'momo'" class="p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center flex-shrink-0">
                        <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-900" />
                      </div>
                      <div>
                        <p class="text-xs font-black text-yellow-800 mb-1">{{ $t('checkout.info_momo_title') }}</p>
                        <p class="text-xs text-yellow-700 leading-relaxed">{{ $t('checkout.info_momo_body') }}</p>
                      </div>
                    </div>
                  </div>
                  <div v-else class="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-lg bg-[#274a82] flex items-center justify-center flex-shrink-0">
                        <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p class="text-xs font-black text-blue-800 mb-1">{{ $t('checkout.info_cash_title') }}</p>
                        <p class="text-xs text-blue-700 leading-relaxed">{{ $t('checkout.info_cash_body') }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Récap complet -->
                  <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p class="text-xs font-black text-gray-400 tracking-wider mb-3">{{ $t('checkout.recap_title') }}</p>
                    <div class="space-y-1.5 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-500">{{ $t('checkout.recap_recipient') }}</span>
                        <span class="font-bold text-gray-800">{{ form.prenom }} {{ form.nom }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-500">{{ $t('checkout.recap_phone') }}</span>
                        <span class="font-bold text-gray-800">{{ selectedCountry.code }} {{ form.telephone }}</span>
                      </div>
                      <div v-if="form.email" class="flex justify-between">
                        <span class="text-gray-500">{{ $t('checkout.recap_email') }}</span>
                        <span class="font-bold text-gray-800 text-right max-w-[55%] truncate">{{ form.email }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-500">{{ $t('checkout.recap_address') }}</span>
                        <span class="font-bold text-gray-800 text-right max-w-[55%]">{{ [form.quartier, form.ville, form.pays].filter(Boolean).join(', ') }}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </Transition>
            </div>

            <!-- Footer navigation -->
            <div class="flex items-center justify-between px-6 sm:px-8 py-5 border-t border-gray-50 bg-gray-50/30">
              <button v-if="currentStep > 1" @click="currentStep--"
                class="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold text-sm transition-colors">
                <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
                {{ $t('checkout.btn_back') }}
              </button>
              <NuxtLink v-else to="/boutique"
                class="flex items-center gap-2 text-gray-400 hover:text-gray-600 font-bold text-sm transition-colors">
                <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
                {{ $t('checkout.btn_shop') }}
              </NuxtLink>

              <button @click="submitOrder" :disabled="!canGoNext || isSubmitting"
                class="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl font-black text-sm tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                :class="currentStep === 2
                  ? 'bg-[#e60012] hover:bg-red-700 text-white shadow-lg shadow-red-200'
                  : 'bg-[#274a82] hover:bg-[#1a3460] text-white'">
                <UIcon v-if="isSubmitting" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
                <UIcon v-else-if="currentStep === 2" name="i-heroicons-lock-closed" class="w-4 h-4" />
                <span>{{ isSubmitting ? $t('checkout.btn_processing') : currentStep === 2 ? $t('checkout.btn_confirm') : $t('checkout.btn_continue') }}</span>
                <UIcon v-if="!isSubmitting && currentStep < 2" name="i-heroicons-arrow-right" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- RÉCAP SIDEBAR -->
        <div class="col-span-12 lg:col-span-5 xl:col-span-4">
          <div class="sticky top-6 space-y-4">
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <h3 class="font-black text-gray-800 text-xs tracking-wider">{{ $t('checkout.order_title') }}</h3>
                <span class="text-xs text-gray-400 font-bold">{{ cartItems.length }} {{ articleLabel(cartItems.length) }}</span>
              </div>
              <div class="divide-y divide-gray-50 max-h-52 overflow-y-auto">
                <div v-for="item in cartItems" :key="item.id" class="flex items-center gap-3 px-5 py-3">
                  <div class="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50">
                    <img :src="item.image" :alt="item.name" class="w-full h-full object-contain p-1" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-gray-800 line-clamp-1">{{ item.name }}</p>
                    <p class="text-[11px] text-gray-400 mt-0.5">{{ $t('checkout.qty') }} {{ item.quantity }}</p>
                  </div>
                  <p class="text-sm font-black text-gray-900 flex-shrink-0">{{ formatPrice(item.price * item.quantity) }}</p>
                </div>
                <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center py-8 gap-2 text-gray-300">
                  <UIcon name="i-heroicons-shopping-bag" class="w-10 h-10" />
                  <p class="text-xs font-bold">{{ $t('checkout.empty_cart') }}</p>
                </div>
              </div>
              <div class="px-5 py-4 border-t border-gray-50 bg-gray-50/30">
                <div class="flex justify-between items-center">
                  <span class="font-black text-gray-900 text-sm">{{ $t('checkout.total') }}</span>
                  <span class="text-xl font-black text-[#e60012]">{{ formatPrice(grandTotal) }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div v-for="g in guarantees" :key="g.text" class="flex items-center gap-3">
                <UIcon :name="g.icon" class="w-4 h-4 flex-shrink-0" :class="g.color" />
                <span class="text-xs font-semibold text-gray-600">{{ g.text }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </UContainer>
  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.slide-enter-from { opacity: 0; transform: translateX(20px);  }
.slide-leave-to   { opacity: 0; transform: translateX(-20px); }
</style>