<script setup lang="ts">
import { ref, computed } from 'vue'
import useCart from '@/composables/useCart'
import axios from 'axios'

useHead({
  title: 'Checkout',
  titleTemplate: (t) => t ? `${t} - BRC Market` : 'BRC Market',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
})

// ── Guard auth : vérifie auth_token + auth_role dans les cookies ───────────
const authToken = useCookie('auth_token')
const authRole  = useCookie('auth_role')

const isLoggedIn = computed(() => !!authToken.value && !!authRole.value)

onMounted(() => {
  if (!isLoggedIn.value) navigateTo('/login?redirect=/checkout')
})

if (process.server && !authToken.value) {
  await navigateTo('/login?redirect=/checkout')
}

const toast  = useToast()
const config = useRuntimeConfig()
const API    = config.public.apiBase
const { cartItems, totalPrice, clearCart } = useCart()

// ── Tunnel ──────────────────────────────────────────────────────────────────
const currentStep = ref(1)
const steps = [
  { id: 1, title: 'Adresse',   desc: 'Vos coordonnées',   icon: 'i-heroicons-map-pin'    },
  { id: 2, title: 'Livraison', desc: "Mode d'envoi",       icon: 'i-heroicons-truck'      },
  { id: 3, title: 'Paiement',  desc: 'Mode de règlement',  icon: 'i-heroicons-credit-card'},
]

// ── Pays avec préfixe téléphonique ──────────────────────────────────────────
const countryCodes = [
  { flag: '🇨🇲', code: '+237', name: 'Cameroun'       },
  { flag: '🇧🇯', code: '+229', name: 'Bénin'          },
  { flag: '🇧🇫', code: '+226', name: 'Burkina Faso'   },
  { flag: '🇧🇮', code: '+257', name: 'Burundi'        },
  { flag: '🇨🇻', code: '+238', name: 'Cap-Vert'       },
  { flag: '🇨🇫', code: '+236', name: 'Centrafrique'   },
  { flag: '🇰🇲', code: '+269', name: 'Comores'        },
  { flag: '🇨🇬', code: '+242', name: 'Congo'          },
  { flag: '🇨🇩', code: '+243', name: 'RD Congo'       },
  { flag: '🇨🇮', code: '+225', name: "Côte d'Ivoire"  },
  { flag: '🇩🇯', code: '+253', name: 'Djibouti'       },
  { flag: '🇪🇬', code: '+20',  name: 'Égypte'         },
  { flag: '🇬🇶', code: '+240', name: 'Guinée Éq.'     },
  { flag: '🇪🇷', code: '+291', name: 'Érythrée'       },
  { flag: '🇪🇹', code: '+251', name: 'Éthiopie'       },
  { flag: '🇬🇦', code: '+241', name: 'Gabon'          },
  { flag: '🇬🇲', code: '+220', name: 'Gambie'         },
  { flag: '🇬🇭', code: '+233', name: 'Ghana'          },
  { flag: '🇬🇳', code: '+224', name: 'Guinée'         },
  { flag: '🇬🇼', code: '+245', name: 'Guinée-Bissau'  },
  { flag: '🇰🇪', code: '+254', name: 'Kenya'          },
  { flag: '🇱🇸', code: '+266', name: 'Lesotho'        },
  { flag: '🇱🇷', code: '+231', name: 'Libéria'        },
  { flag: '🇱🇾', code: '+218', name: 'Libye'          },
  { flag: '🇲🇬', code: '+261', name: 'Madagascar'     },
  { flag: '🇲🇼', code: '+265', name: 'Malawi'         },
  { flag: '🇲🇱', code: '+223', name: 'Mali'           },
  { flag: '🇲🇷', code: '+222', name: 'Mauritanie'     },
  { flag: '🇲🇺', code: '+230', name: 'Maurice'        },
  { flag: '🇲🇦', code: '+212', name: 'Maroc'          },
  { flag: '🇲🇿', code: '+258', name: 'Mozambique'     },
  { flag: '🇳🇦', code: '+264', name: 'Namibie'        },
  { flag: '🇳🇪', code: '+227', name: 'Niger'          },
  { flag: '🇳🇬', code: '+234', name: 'Nigéria'        },
  { flag: '🇷🇼', code: '+250', name: 'Rwanda'         },
  { flag: '🇸🇹', code: '+239', name: 'Sao Tomé'       },
  { flag: '🇸🇳', code: '+221', name: 'Sénégal'        },
  { flag: '🇸🇱', code: '+232', name: 'Sierra Leone'   },
  { flag: '🇸🇴', code: '+252', name: 'Somalie'        },
  { flag: '🇿🇦', code: '+27',  name: 'Afrique du Sud' },
  { flag: '🇸🇸', code: '+211', name: 'Soudan du Sud'  },
  { flag: '🇸🇩', code: '+249', name: 'Soudan'         },
  { flag: '🇸🇿', code: '+268', name: 'Eswatini'       },
  { flag: '🇹🇿', code: '+255', name: 'Tanzanie'       },
  { flag: '🇹🇩', code: '+235', name: 'Tchad'          },
  { flag: '🇹🇬', code: '+228', name: 'Togo'           },
  { flag: '🇹🇳', code: '+216', name: 'Tunisie'        },
  { flag: '🇺🇬', code: '+256', name: 'Ouganda'        },
  { flag: '🇿🇲', code: '+260', name: 'Zambie'         },
  { flag: '🇿🇼', code: '+263', name: 'Zimbabwe'       },
]

// ── Formulaire ──────────────────────────────────────────────────────────────
const selectedCountry = ref(countryCodes[0])
const form = ref({
  nom: '', prenom: '', telephone: '', whatsapp: '',
  email: '',
  pays: 'Cameroun', ville: '', quartier: '', infosPlus: '',
  shipping: 'standard',
  payment: 'cash',
})

// ── Validation email ─────────────────────────────────────────────────────────
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailValid = computed(() => !form.value.email || emailRegex.test(form.value.email))

// ── Zones de livraison ───────────────────────────────────────────────────────
const shippingZones = [
  { label: 'Yaoundé Centre',           keywords: ['yaoundé','yaounde','bastos','ngousso','omnisport','nlongkak','mvog','biyem','etoudi','melen','emana','damas','nsam','ekounou'], fee: 1000  },
  { label: 'Yaoundé périphérie',       keywords: ['soa','nkolafamba','binguela','okola','obala','ngoumou','mbalmayo','mfou'],                                                      fee: 2000  },
  { label: 'Douala Centre',            keywords: ['douala','akwa','bonapriso','deido','bali','bonanjo','new-bell','newbell'],                                                       fee: 2500  },
  { label: 'Douala périphérie',        keywords: ['bonaberi','logbessou','bonamoussadi','kotto','bepanda','ndogbong','logpom'],                                                    fee: 3500  },
  { label: 'Villes proches (<150 km)', keywords: ['bafoussam','dschang','foumban','kribi','edea','nkongsamba','kumba','limbe','buea','tiko','mutengene'],                          fee: 5000  },
  { label: 'Villes éloignées',         keywords: ['bamenda','garoua','ngaoundere','bertoua','ebolowa','maroua','kousseri','kumbo'],                                                fee: 7000  },
  { label: 'Zone très éloignée',       keywords: ['mora','kolofata','mokolo','touboro','batouri','abong','lomie'],                                                                  fee: 10000 },
]

const detectedZone = computed(() => {
  const q = `${form.value.ville} ${form.value.quartier}`.toLowerCase()
  for (const z of shippingZones) {
    if (z.keywords.some(k => q.includes(k))) return z
  }
  return form.value.ville.trim() ? { label: 'Zone non reconnue — estimation', fee: 5000 } : null
})

const shippingFees = computed(() => {
  if (!detectedZone.value) return 0
  return form.value.shipping === 'express'
    ? Math.min(detectedZone.value.fee * 2, 10000)
    : detectedZone.value.fee
})

// ── Calculs ──────────────────────────────────────────────────────────────────
const subtotal      = computed(() => totalPrice.value)
const promoCode     = ref('')
const promoApplied  = ref(false)
const promoDiscount = ref(0)
const grandTotal    = computed(() => subtotal.value + shippingFees.value - promoDiscount.value)

const applyPromo = () => {
  if (promoCode.value.toUpperCase() === 'BRC10') {
    promoDiscount.value = Math.round(subtotal.value * 0.1)
    promoApplied.value  = true
    toast.add({ title: 'Code appliqué !', description: '-10% sur votre commande', color: 'success', icon: 'i-heroicons-tag' })
  } else {
    toast.add({ title: 'Code invalide', color: 'error', icon: 'i-heroicons-x-circle' })
  }
}

// ── Validation étape ─────────────────────────────────────────────────────────
const canGoNext = computed(() => {
  if (currentStep.value === 1)
    return !!form.value.nom.trim()
      && !!form.value.telephone.trim()
      && !!form.value.ville
      && emailValid.value
  return true
})

// ── Codes marchands Mobile Money ─────────────────────────────────────────────
const MARCHAND_OM   = '075 XX XX XX' // ← remplacer
const MARCHAND_MOMO = '650 XX XX XX' // ← remplacer

// ── Soumission ───────────────────────────────────────────────────────────────
const isSubmitting = ref(false)

const submitOrder = async () => {
  if (currentStep.value < 3) { currentStep.value++; return }

  // Vérification finale cookies
  if (!authToken.value || !authRole.value) {
    toast.add({
      title: 'Session expirée',
      description: 'Veuillez vous reconnecter pour passer commande.',
      color: 'error',
      icon: 'i-heroicons-lock-closed',
    })
    navigateTo('/login?redirect=/checkout')
    return
  }

  isSubmitting.value = true

  let orderRef = ''
  const fullPhone = `${selectedCountry.value.code} ${form.value.telephone}`

  // ── Payload complet ────────────────────────────────────────────────────────
  // ref est optionnel — le backend génère le vrai order_number (CM000001)
  const payload = {
    nom:        `${form.value.prenom} ${form.value.nom}`.trim(),
    email:      form.value.email.trim() || null,   // ← null si vide
    phone:      fullPhone,
    adresse:    [form.value.quartier, form.value.ville, form.value.pays].filter(Boolean).join(', '),
    ville:      form.value.ville    || null,
    quartier:   form.value.quartier || null,
    pays:       form.value.pays     || null,
    items:      cartItems.value.map((i) => ({
      id:       i.id       ?? null,
      name:     i.name,
      price:    i.price,
      quantity: i.quantity,
      // Ne jamais envoyer de base64 — uniquement les URLs http/https (Cloudinary)
      image:    (i.image && !i.image.startsWith('data:')) ? i.image : null,
      slug:     i.slug     || null,
    })),
    subtotal:   subtotal.value,
    livraison:  shippingFees.value,
    discount:   promoDiscount.value || 0,
    total:      grandTotal.value,
    payment:    form.value.payment,
    shipping:   form.value.shipping,
    promo_code: promoApplied.value ? promoCode.value : null,
    notes:      form.value.infosPlus?.trim() || null,
  }

  try {
    // ── Axios avec Bearer token ────────────────────────────────────────────
    const resp = await axios.post(`${API}/orders/checkout`, payload, {
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      },
    })
    // Récupérer le numéro de commande généré par le backend
    orderRef = resp.data?.ref ?? resp.data?.order_number ?? `CMD-${Date.now().toString().slice(-6)}`
  } catch (e: any) {
    isSubmitting.value = false

    if (e?.response?.status === 401) {
      toast.add({
        title: 'Session expirée',
        description: 'Veuillez vous reconnecter.',
        color: 'error',
        icon: 'i-heroicons-lock-closed',
      })
      navigateTo('/login?redirect=/checkout')
      return
    }

    // Affiche le message d'erreur Laravel si disponible
    const msg = e?.response?.data?.message || 'Impossible d\'enregistrer la commande. Réessayez.'
    toast.add({
      title: 'Erreur',
      description: msg,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
    return
  }

  isSubmitting.value = false

  // ── Toasts de confirmation ─────────────────────────────────────────────────
  const emailInfo = form.value.email
    ? `Un email de confirmation a été envoyé à ${form.value.email}.`
    : `Conservez la référence ${orderRef} pour le suivi.`

  toast.add({
    title: '🎉 Commande confirmée !',
    description: `Merci ${form.value.prenom || form.value.nom} ! Votre commande ${orderRef} est enregistrée. ${emailInfo}`,
    color: 'success',
    icon: 'i-heroicons-check-circle',
    duration: 10000,
  })

  if (form.value.payment === 'om') {
    toast.add({
      title: '🟠 Paiement Orange Money',
      description: `Envoyez ${formatPrice(grandTotal.value)} au ${MARCHAND_OM}. Réf : ${orderRef}. Valable 24h.`,
      color: 'warning',
      icon: 'i-heroicons-banknotes',
      duration: 15000,
    })
  } else if (form.value.payment === 'momo') {
    toast.add({
      title: '🟡 Paiement MTN MoMo',
      description: `Envoyez ${formatPrice(grandTotal.value)} au ${MARCHAND_MOMO}. Réf : ${orderRef}. Valable 24h.`,
      color: 'warning',
      icon: 'i-heroicons-banknotes',
      duration: 15000,
    })
  }

  clearCart()
  await new Promise(r => setTimeout(r, 3000))
  navigateTo('/boutique')
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 })
    .format(n).replace('XAF', 'FCFA')
</script>

<template>
  <div class="min-h-screen bg-[#f4f5f7]">
    <UContainer class="py-8 sm:py-12">

      <!-- ══ STEPPER ══════════════════════════════════════════════════════════ -->
      <div class="max-w-2xl mx-auto mb-10">
        <div class="flex items-center relative">
          <div class="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gray-200 z-0"></div>
          <div class="absolute top-5 left-[10%] h-0.5 bg-[#e60012] z-0 transition-all duration-700"
            :style="{ width: `${(currentStep - 1) * 40}%` }"></div>
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
              :class="currentStep >= step.id ? 'text-gray-800' : 'text-gray-300'">{{ step.title }}</p>
          </div>
        </div>
      </div>

      <!-- ══ LAYOUT ════════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-12 gap-6 max-w-6xl mx-auto">

        <!-- ── FORMULAIRE ──────────────────────────────────────────────────── -->
        <div class="col-span-12 lg:col-span-7 xl:col-span-8">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            <!-- Header étape -->
            <div class="flex items-center gap-3 px-6 sm:px-8 py-5 border-b border-gray-50 bg-gradient-to-r from-[#274a82]/5 to-transparent">
              <div class="w-8 h-8 rounded-full bg-[#e60012] text-white flex items-center justify-center text-sm font-black flex-shrink-0">{{ currentStep }}</div>
              <div>
                <h2 class="text-base sm:text-lg font-black text-gray-900">
                  {{ ['Coordonnées & Adresse', "Mode d'expédition", 'Mode de paiement'][currentStep - 1] }}
                </h2>
                <p class="text-[11px] text-gray-400 font-medium">{{ steps[currentStep - 1].desc }}</p>
              </div>
            </div>

            <div class="p-6 sm:p-8">
              <Transition name="slide" mode="out-in">

                <!-- ══ STEP 1 — Coordonnées ══════════════════════════════════ -->
                <div v-if="currentStep === 1" key="s1" class="space-y-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <UFormGroup label="Nom *" name="nom">
                      <UInput v-model="form.nom" icon="i-heroicons-user" placeholder="Votre nom"
                        size="lg" variant="outline" class="w-full" />
                    </UFormGroup>

                    <UFormGroup label="Prénom" name="prenom">
                      <UInput v-model="form.prenom" icon="i-heroicons-user" placeholder="Votre prénom"
                        size="lg" variant="outline" class="w-full" />
                    </UFormGroup>

                    <!-- Téléphone avec préfixe -->
                    <UFormGroup label="Téléphone *" name="telephone">
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
                        <UInput v-model="form.telephone" type="tel" placeholder="6xx xxx xxx"
                          size="lg" variant="outline" class="flex-1" />
                      </div>
                    </UFormGroup>

                    <UFormGroup label="WhatsApp (si différent)">
                      <UInput v-model="form.whatsapp" icon="i-heroicons-chat-bubble-left-ellipsis"
                        placeholder="6xx xxx xxx" size="lg" variant="outline" class="w-full" />
                    </UFormGroup>

                    <!-- Email -->
                    <UFormGroup
                      label="Email"
                      :help="!form.email || !emailValid ? '' : 'Un email de confirmation vous sera envoyé'"
                      :error="form.email && !emailValid ? 'Adresse email invalide' : undefined"
                    >
                      <UInput v-model="form.email" icon="i-heroicons-envelope" type="email"
                        placeholder="exemple@mail.com" size="lg" variant="outline" class="w-full"
                        :trailing-icon="form.email ? (emailValid ? 'i-heroicons-check-circle-solid' : 'i-heroicons-x-circle-solid') : undefined"
                      />
                    </UFormGroup>

                    <!-- Ville -->
                    <UFormGroup label="Ville *" name="ville">
                      <UInput v-model="form.ville" icon="i-heroicons-building-office-2"
                        placeholder="Ex : Yaoundé, Douala…"
                        size="lg" variant="outline" class="w-full" />
                    </UFormGroup>

                    <!-- Quartier -->
                    <UFormGroup label="Quartier / Arrondissement" class="sm:col-span-2">
                      <UInput v-model="form.quartier" icon="i-heroicons-map-pin"
                        placeholder="Ex : Bastos, Akwa…"
                        size="lg" variant="outline" class="w-full" />
                    </UFormGroup>

                    <UFormGroup label="Instructions de livraison" class="sm:col-span-2">
                      <UTextarea v-model="form.infosPlus"
                        placeholder="Points de repère, code d'accès, étage…"
                        size="lg" variant="outline" :rows="3" class="w-full" autoresize />
                    </UFormGroup>

                  </div>

                  <!-- Bloc zone + email -->
                  <div class="rounded-xl border border-blue-100 bg-blue-50/40 overflow-hidden">
                    <Transition name="fade">
                      <div v-if="detectedZone" class="flex items-center justify-between px-4 py-3 border-b border-blue-100/80 bg-blue-50/60">
                        <div class="flex items-center gap-2">
                          <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-[#274a82] flex-shrink-0" />
                          <span class="text-xs font-black text-gray-800">{{ detectedZone.label }}</span>
                          <span class="text-[11px] text-gray-400">— frais estimés</span>
                        </div>
                        <span class="text-xs font-black text-[#274a82]">à partir de {{ formatPrice(detectedZone.fee) }}</span>
                      </div>
                    </Transition>
                    <div class="flex items-start gap-3 px-4 py-3">
                      <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-[#274a82] flex-shrink-0 mt-0.5" />
                      <p class="text-[12px] text-gray-600 leading-relaxed">
                        Votre commande sera confirmée et un <strong class="text-gray-800">email de confirmation</strong>
                        avec tous les détails vous sera envoyé
                        <template v-if="form.email && emailValid">
                          à <strong class="text-[#274a82]">{{ form.email }}</strong>.
                        </template>
                        <template v-else>
                          automatiquement. <span class="text-amber-600 font-semibold">Renseignez votre email ci-dessus pour le recevoir.</span>
                        </template>
                      </p>
                    </div>
                  </div>
                </div>

                <!-- ══ STEP 2 — Livraison ════════════════════════════════════ -->
                <div v-else-if="currentStep === 2" key="s2" class="space-y-3">
                  <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 mb-4">
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-[#274a82] flex-shrink-0" />
                    <span>Livraison vers : <strong class="text-gray-800">{{ [form.quartier, form.ville, form.pays].filter(Boolean).join(', ') }}</strong></span>
                  </div>

                  <div v-for="opt in [
                    { id: 'standard', icon: 'i-heroicons-truck', label: 'Livraison Standard', sub: 'Délai : 24h à 72h selon la zone', badge: null },
                    { id: 'express',  icon: 'i-heroicons-bolt',  label: 'Livraison Express',  sub: 'Le jour même ou J+1 (zones proches)', badge: 'Rapide' },
                  ]" :key="opt.id"
                    @click="form.shipping = opt.id"
                    class="relative flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-200"
                    :class="form.shipping === opt.id ? 'border-[#274a82] bg-[#274a82]/3 shadow-sm' : 'border-gray-100 hover:border-gray-200'"
                  >
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                      :class="form.shipping === opt.id ? 'bg-[#274a82] text-white' : 'bg-gray-100 text-gray-400'">
                      <UIcon :name="opt.icon" class="w-6 h-6" />
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <p class="font-black text-gray-900">{{ opt.label }}</p>
                        <span v-if="opt.badge" class="text-[9px] font-black px-2 py-0.5 bg-[#e60012] text-white rounded-full">{{ opt.badge }}</span>
                      </div>
                      <p class="text-xs text-gray-400 mt-0.5">{{ opt.sub }}</p>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <p v-if="detectedZone" class="font-black text-lg" :class="form.shipping === opt.id ? 'text-[#274a82]' : 'text-gray-700'">
                        {{ formatPrice(opt.id === 'express' ? Math.min(detectedZone.fee * 2, 10000) : detectedZone.fee) }}
                      </p>
                      <p v-else class="text-xs text-gray-400 italic">Selon zone</p>
                    </div>
                    <div class="absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      :class="form.shipping === opt.id ? 'border-[#274a82]' : 'border-gray-200'">
                      <div v-if="form.shipping === opt.id" class="w-2.5 h-2.5 rounded-full bg-[#274a82]"></div>
                    </div>
                  </div>

                  <!-- Grille tarifaire -->
                  <div class="rounded-xl border border-gray-100 overflow-hidden mt-4">
                    <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <p class="text-[11px] font-black text-gray-500 uppercase tracking-wider">Grille tarifaire</p>
                    </div>
                    <div class="divide-y divide-gray-50">
                      <div v-for="z in shippingZones" :key="z.label"
                        class="flex items-center justify-between px-4 py-2.5 text-xs transition-colors"
                        :class="detectedZone?.label === z.label ? 'bg-blue-50/60 font-black text-[#274a82]' : 'text-gray-600 hover:bg-gray-50/50'">
                        <div class="flex items-center gap-2">
                          <UIcon v-if="detectedZone?.label === z.label" name="i-heroicons-map-pin" class="w-3 h-3" />
                          <span>{{ z.label }}</span>
                        </div>
                        <span class="font-bold">{{ formatPrice(z.fee) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ══ STEP 3 — Paiement ═════════════════════════════════════ -->
                <div v-else key="s3" class="space-y-3">
                  <div v-for="opt in [
                    { id: 'om',   label: 'Orange Money',            sub: 'Paiement via compte Orange',      bg: 'bg-orange-500', text: 'text-white',    border: 'border-orange-400', dot: 'bg-orange-500', abbr: 'OM',  icon: null },
                    { id: 'momo', label: 'MTN Mobile Money',        sub: 'Rapide, simple et sécurisé',      bg: 'bg-yellow-400', text: 'text-blue-900', border: 'border-yellow-400', dot: 'bg-yellow-400', abbr: 'MM',  icon: null },
                    { id: 'cash', label: 'Paiement à la livraison', sub: 'Payez en espèces à la réception', bg: 'bg-[#274a82]',  text: 'text-white',    border: 'border-[#274a82]',  dot: 'bg-[#274a82]',  abbr: null,  icon: 'i-heroicons-banknotes' },
                  ]" :key="opt.id"
                    @click="form.payment = opt.id"
                    class="flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-200"
                    :class="form.payment === opt.id ? `${opt.border} shadow-sm` : 'border-gray-100 hover:border-gray-200'"
                  >
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm" :class="[opt.bg, opt.text]">
                      <UIcon v-if="opt.icon" :name="opt.icon" class="w-6 h-6" />
                      <span v-else class="text-xs font-black">{{ opt.abbr }}</span>
                    </div>
                    <div class="flex-1">
                      <p class="font-black text-gray-900">{{ opt.label }}</p>
                      <p class="text-xs text-gray-400 mt-0.5">{{ opt.sub }}</p>
                    </div>
                    <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" :class="form.payment === opt.id ? opt.border : 'border-gray-200'">
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
                        <p class="text-xs font-black text-orange-800 mb-1">Paiement Orange Money</p>
                        <p class="text-xs text-orange-700 leading-relaxed">
                          Après confirmation, le <strong>code marchand Orange Money</strong> vous sera envoyé par email. Vous aurez <strong>24h</strong> pour effectuer le paiement.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div v-else-if="form.payment === 'momo'" class="p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center flex-shrink-0">
                        <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-900" />
                      </div>
                      <div>
                        <p class="text-xs font-black text-yellow-800 mb-1">Paiement MTN Mobile Money</p>
                        <p class="text-xs text-yellow-700 leading-relaxed">
                          Après confirmation, le <strong>code marchand MTN MoMo</strong> vous sera envoyé par email. Vous aurez <strong>24h</strong> pour effectuer le paiement.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div v-else class="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-lg bg-[#274a82] flex items-center justify-center flex-shrink-0">
                        <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p class="text-xs font-black text-blue-800 mb-1">Paiement à la livraison</p>
                        <p class="text-xs text-blue-700 leading-relaxed">Préparez le montant exact. Notre livreur BRC vous contactera avant le passage. Aucun paiement demandé à l'avance.</p>
                      </div>
                    </div>
                  </div>

                  <!-- Récap -->
                  <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-3">Récapitulatif</p>
                    <div class="space-y-1.5 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-500">Destinataire</span>
                        <span class="font-bold text-gray-800">{{ form.prenom }} {{ form.nom }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-500">Téléphone</span>
                        <span class="font-bold text-gray-800">{{ selectedCountry.code }} {{ form.telephone }}</span>
                      </div>
                      <div v-if="form.email" class="flex justify-between">
                        <span class="text-gray-500">Email</span>
                        <span class="font-bold text-gray-800 text-right max-w-[55%] truncate">{{ form.email }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-500">Adresse</span>
                        <span class="font-bold text-gray-800 text-right max-w-[55%]">{{ [form.quartier, form.ville, form.pays].filter(Boolean).join(', ') }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-500">Livraison</span>
                        <span class="font-bold text-gray-800">{{ form.shipping === 'express' ? 'Express' : 'Standard' }}</span>
                      </div>
                    </div>
                    <button @click="currentStep = 1" class="mt-3 text-[11px] text-[#274a82] font-bold hover:text-[#e60012] transition-colors flex items-center gap-1">
                      <UIcon name="i-heroicons-pencil-square" class="w-3 h-3" />
                      Modifier
                    </button>
                  </div>
                </div>

              </Transition>
            </div>

            <!-- Footer navigation -->
            <div class="flex items-center justify-between px-6 sm:px-8 py-5 border-t border-gray-50 bg-gray-50/30">
              <button v-if="currentStep > 1" @click="currentStep--"
                class="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold text-sm transition-colors">
                <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
                Retour
              </button>
              <NuxtLink v-else to="/boutique"
                class="flex items-center gap-2 text-gray-400 hover:text-gray-600 font-bold text-sm transition-colors">
                <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
                Boutique
              </NuxtLink>

              <button @click="submitOrder" :disabled="!canGoNext || isSubmitting"
                class="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl font-black text-sm tracking-widest uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                :class="currentStep === 3
                  ? 'bg-[#e60012] hover:bg-red-700 text-white shadow-lg shadow-red-200'
                  : 'bg-[#274a82] hover:bg-[#1a3460] text-white'">
                <UIcon v-if="isSubmitting" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
                <UIcon v-else-if="currentStep === 3" name="i-heroicons-lock-closed" class="w-4 h-4" />
                <span>{{ isSubmitting ? 'Traitement...' : currentStep === 3 ? 'Confirmer la commande' : 'Continuer' }}</span>
                <UIcon v-if="!isSubmitting && currentStep < 3" name="i-heroicons-arrow-right" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- ── RÉCAP SIDEBAR ─────────────────────────────────────────────────── -->
        <div class="col-span-12 lg:col-span-5 xl:col-span-4">
          <div class="sticky top-6 space-y-4">
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <h3 class="font-black text-gray-800 text-sm tracking-wider uppercase">Votre commande</h3>
                <span class="text-xs text-gray-400 font-bold">{{ cartItems.length }} article{{ cartItems.length > 1 ? 's' : '' }}</span>
              </div>
              <div class="divide-y divide-gray-50 max-h-52 overflow-y-auto">
                <div v-for="item in cartItems" :key="item.id" class="flex items-center gap-3 px-5 py-3">
                  <div class="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50">
                    <img :src="item.image" :alt="item.name" class="w-full h-full object-contain p-1" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-gray-800 line-clamp-1">{{ item.name }}</p>
                    <p class="text-[11px] text-gray-400 mt-0.5">Qté : {{ item.quantity }}</p>
                  </div>
                  <p class="text-sm font-black text-gray-900 flex-shrink-0">{{ formatPrice(item.price * item.quantity) }}</p>
                </div>
                <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center py-8 gap-2 text-gray-300">
                  <UIcon name="i-heroicons-shopping-bag" class="w-10 h-10" />
                  <p class="text-xs font-bold">Panier vide</p>
                </div>
              </div>
              <div class="px-5 py-4 border-t border-gray-50 space-y-2.5 bg-gray-50/30">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Sous-total</span>
                  <span class="font-bold text-gray-800">{{ formatPrice(subtotal) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Livraison</span>
                  <span v-if="shippingFees > 0" class="font-bold text-[#274a82]">+ {{ formatPrice(shippingFees) }}</span>
                  <span v-else class="text-xs text-gray-400 italic">À estimer</span>
                </div>
                <div v-if="promoApplied" class="flex justify-between text-sm">
                  <span class="text-green-600 font-bold flex items-center gap-1">
                    <UIcon name="i-heroicons-tag" class="w-3.5 h-3.5" />Code promo
                  </span>
                  <span class="font-bold text-green-600">- {{ formatPrice(promoDiscount) }}</span>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span class="font-black text-gray-900 text-sm">Total</span>
                  <span class="text-xl font-black text-[#e60012]">{{ formatPrice(grandTotal) }}</span>
                </div>
              </div>
              <div class="px-5 py-4 border-t border-gray-100">
                <div class="flex gap-2">
                  <input v-model="promoCode" placeholder="Code promo" :disabled="promoApplied"
                    class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#274a82] bg-gray-50/50 disabled:opacity-40 placeholder:text-gray-300" />
                  <button @click="applyPromo" :disabled="promoApplied || !promoCode"
                    class="px-3 py-2 bg-gray-900 hover:bg-[#274a82] text-white text-[11px] font-black rounded-lg transition-colors disabled:opacity-40">
                    {{ promoApplied ? '✓' : 'Appliquer' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div v-for="g in [
                { icon: 'i-heroicons-shield-check',  text: 'Paiement 100% sécurisé',     color: 'text-green-500'  },
                { icon: 'i-heroicons-truck',          text: 'Livraison garantie BRC',     color: 'text-[#274a82]' },
                { icon: 'i-heroicons-envelope',       text: 'Confirmation par email/SMS', color: 'text-[#e60012]' },
                { icon: 'i-heroicons-arrow-path',     text: 'Retour sous 7 jours',        color: 'text-orange-400'},
              ]" :key="g.text" class="flex items-center gap-3">
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
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from  { opacity: 0; transform: translateY(6px); }
.fade-leave-to    { opacity: 0; }
</style>