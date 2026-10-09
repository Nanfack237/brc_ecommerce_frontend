<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

/* ══════════════════════════════════════════════════════════════════════════
   CONFIG — à adapter aux vraies infos de BRC Market
   ══════════════════════════════════════════════════════════════════════════ */
const WHATSAPP_NUMBER = '237689205751'

// ⚠️ À VÉRIFIER : horaires d'ouverture (fuseau Africa/Douala)
const OPENING = { days: [1, 2, 3, 4, 5, 6], from: 8, to: 18 } // lundi → samedi, 8h → 18h

// ⚠️ À VÉRIFIER : réponses automatiques. Garde uniquement ce qui est exact.
const KB = {
  location: "Nous sommes à Akwa, Douala, rue Castelnau, juste après la rue du Collège King Akwa.",
  warranty: "Tous nos produits sont garantis, avec un SAV assuré par nos techniciens.",
  delivery: "Nous livrons à Douala et dans les autres villes. Les frais et délais dépendent de votre adresse : un agent peut vous donner le détail exact.",
  payment:  "Plusieurs moyens de paiement sont acceptés. Un agent peut vous confirmer les options disponibles pour votre commande.",
  contact:  "Vous pouvez nous joindre directement sur WhatsApp, c'est le moyen le plus rapide.",
}

/* ══════════════════════════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════════════════════════ */
const route  = useRoute()
const config = useRuntimeConfig()
const API    = config.public.apiBase

const isOpen    = ref(false)
const isTyping  = ref(false)
const input     = ref('')
const unread    = ref(0)
const isOnline  = ref(false)
const messages  = ref([])
const chatBody  = ref(null)
const inputRef  = ref(null)
const widgetRef = ref(null)

// Le widget n'a pas sa place dans l'espace admin / livreur
const hidden = computed(() =>
  route.path.startsWith('/admin') || route.path.startsWith('/livreur')
)

const STORAGE_KEY = 'brc_chat_v1'

/* ══════════════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════════════ */
const nowTime = () =>
  new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

const formatPrice = (p) =>
  new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(p)

const normalize = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

const STOP = new Set([
  'je','tu','il','elle','nous','vous','on','un','une','des','du','de','la','le','les',
  'et','ou','a','au','aux','en','pour','sur','avec','sans','cherche','recherche','veux',
  'voudrais','souhaite','avez','avoir','vendez','vend','avez-vous','il-y-a','y','ce',
  'cet','cette','ces','mon','ma','mes','svp','stp','please','quel','quels','quelle',
  'prix','combien','coute','est','sont','que','qui','dans','moi','me','ai','besoin',
])

const toSearchTerms = (text) =>
  normalize(text)
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP.has(w))
    .join(' ')

const greeting = () => {
  const h = new Date().getHours()
  return h < 18 ? 'Bonjour' : 'Bonsoir'
}

const updateOnline = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Douala', weekday: 'short', hour: 'numeric', hour12: false,
  }).formatToParts(new Date())
  const wd   = parts.find(p => p.type === 'weekday')?.value
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0', 10) % 24
  const dayIdx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[wd]
  isOnline.value = OPENING.days.includes(dayIdx) && hour >= OPENING.from && hour < OPENING.to
}

const openWhatsApp = (text) => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
  window.open(url, '_blank', 'noopener')
}

const productWhatsAppText = (p) =>
  `Bonjour BRC, je suis intéressé par : ${p.name} (${formatPrice(p.price)} FCFA)\n` +
  `${window.location.origin}/products/${p.slug}`

const scrollToBottom = () =>
  nextTick(() => {
    if (chatBody.value) chatBody.value.scrollTo({ top: chatBody.value.scrollHeight, behavior: 'smooth' })
  })

/* ══════════════════════════════════════════════════════════════════════════
   MESSAGES
   ══════════════════════════════════════════════════════════════════════════ */
let uid = 0
const pushMessage = (msg) => {
  messages.value.push({ id: `${Date.now()}-${uid++}`, time: nowTime(), ...msg })
  if (msg.role === 'bot' && !isOpen.value) unread.value++
  scrollToBottom()
}

const botReply = async (build, delay = 600) => {
  isTyping.value = true
  scrollToBottom()
  await new Promise(r => setTimeout(r, delay))
  isTyping.value = false
  pushMessage({ role: 'bot', ...(await build()) })
}

const initChat = () => {
  pushMessage({
    role: 'bot',
    text: `${greeting()} et bienvenue chez BRC Market ! Je peux vous aider à trouver un produit, connaître nos conditions ou vous mettre en relation avec un conseiller.`,
  })
  if (!isOnline.value) {
    pushMessage({
      role: 'bot',
      text: `Nos conseillers sont actuellement hors ligne (${OPENING.from}h–${OPENING.to}h, du lundi au samedi). Laissez-nous un message sur WhatsApp, nous vous répondrons dès l'ouverture.`,
    })
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   INTENTS
   ══════════════════════════════════════════════════════════════════════════ */
const INTENTS = [
  { name: 'greeting', keys: ['bonjour', 'bonsoir', 'salut', 'hello', 'coucou', 'bjr'],
    answer: () => ({ text: `${greeting()} ! Que recherchez-vous aujourd'hui ?` }) },
  { name: 'thanks', keys: ['merci', 'thanks', 'thank you'],
    answer: () => ({ text: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions." }) },
  { name: 'location', keys: ['adresse', 'emplacement', 'localisation', 'ou etes', 'ou est la boutique', 'magasin', 'situe', 'trouver la boutique'],
    answer: () => ({ text: KB.location }) },
  { name: 'hours', keys: ['horaire', 'heure d', 'ouvert', 'ferme', 'ouverture'],
    answer: () => ({ text: `Nous sommes ouverts du lundi au samedi, de ${OPENING.from}h à ${OPENING.to}h. ${isOnline.value ? 'Nous sommes ouverts en ce moment.' : 'Nous sommes actuellement fermés.'}` }) },
  { name: 'delivery', keys: ['livraison', 'livrer', 'expedition', 'expedier', 'delai'],
    answer: () => ({ text: KB.delivery, actions: [{ type: 'whatsapp', label: 'Demander les frais de livraison', text: 'Bonjour BRC, je souhaite connaître les frais et délais de livraison.' }] }) },
  { name: 'payment', keys: ['paiement', 'payer', 'momo', 'mobile money', 'orange money', 'cash', 'carte bancaire'],
    answer: () => ({ text: KB.payment, actions: [{ type: 'whatsapp', label: 'Confirmer les moyens de paiement', text: 'Bonjour BRC, quels sont les moyens de paiement disponibles ?' }] }) },
  { name: 'warranty', keys: ['garantie', 'sav', 'retour', 'rembours', 'echange', 'echanger'],
    answer: () => ({ text: KB.warranty }) },
  { name: 'order', keys: ['ma commande', 'suivi', 'suivre', 'colis', 'ou en est'],
    answer: () => ({ text: "Vous pouvez suivre vos commandes depuis votre compte.", actions: [{ type: 'link', label: 'Voir mes commandes', to: '/compte/commandes' }] }) },
  { name: 'contact', keys: ['telephone', 'numero', 'appeler', 'contacter', 'agent', 'conseiller', 'humain'],
    answer: () => ({ text: KB.contact, actions: [{ type: 'whatsapp', label: 'Parler à un conseiller', text: 'Bonjour BRC, je souhaiterais parler à un conseiller.' }] }) },
]

const detectIntent = (text) => {
  const t = normalize(text)
  return INTENTS.find(i => i.keys.some(k => t.includes(k)))
}

/* ══════════════════════════════════════════════════════════════════════════
   PRODUCT SEARCH (réutilise /products/search)
   ══════════════════════════════════════════════════════════════════════════ */
const searchProducts = async (text) => {
  const q = toSearchTerms(text)
  if (q.length < 2) return null
  try {
    return await $fetch(`${API}/products/search`, { params: { q } })
  } catch {
    return null
  }
}

const productAnswer = async (text) => {
  const res = await searchProducts(text)

  if (!res || !res.products?.length) {
    return {
      text: "Je n'ai pas trouvé de produit correspondant. Un conseiller peut vous aider à trouver exactement ce que vous cherchez.",
      actions: [
        { type: 'whatsapp', label: 'Demander à un conseiller', text: `Bonjour BRC, je cherche : ${text}` },
        { type: 'link', label: 'Parcourir la boutique', to: '/boutique' },
      ],
    }
  }

  const items = res.products.slice(0, 3)

  if (res.type === 'exact') {
    return {
      text: items.length > 1 ? `J'ai trouvé ${res.products.length} produit(s) correspondant à votre recherche :` : "Voici le produit correspondant :",
      products: items,
      actions: [{ type: 'link', label: 'Voir tous les résultats', to: `/boutique?q=${encodeURIComponent(text)}` }],
    }
  }
  if (res.type === 'similar') {
    return {
      text: "Je n'ai pas trouvé exactement ce produit, mais voici des articles proches :",
      products: items,
      actions: [{ type: 'whatsapp', label: 'Demander le produit exact', text: `Bonjour BRC, je cherche : ${text}` }],
    }
  }
  return {
    text: "Je n'ai rien trouvé pour cette recherche. Voici quelques produits populaires, ou parlez à un conseiller :",
    products: items,
    actions: [{ type: 'whatsapp', label: 'Demander à un conseiller', text: `Bonjour BRC, je cherche : ${text}` }],
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   SEND
   ══════════════════════════════════════════════════════════════════════════ */
const send = async (text) => {
  const clean = text.trim()
  if (!clean || isTyping.value) return
  pushMessage({ role: 'user', text: clean })
  input.value = ''

  const intent = detectIntent(clean)
  await botReply(
    () => (intent ? intent.answer() : productAnswer(clean)),
    intent ? 500 : 700,
  )
}

const quickReplies = [
  { label: 'Trouver un produit', send: 'Je cherche un produit' },
  { label: 'Livraison',          send: 'Quelles sont les conditions de livraison ?' },
  { label: 'Paiement',           send: 'Quels moyens de paiement acceptez-vous ?' },
  { label: 'Garantie',           send: 'Quelle garantie proposez-vous ?' },
  { label: 'Adresse',            send: 'Où se trouve la boutique ?' },
]

const onQuickReply = (q) => {
  if (q.label === 'Trouver un produit') {
    pushMessage({ role: 'user', text: q.send })
    botReply(() => ({ text: "Bien sûr ! Écrivez le nom ou le type de produit (ex : « Dell Latitude », « imprimante », « caméra de surveillance »)." }), 400)
    nextTick(() => inputRef.value?.focus())
    return
  }
  send(q.send)
}

const resetChat = () => {
  messages.value = []
  sessionStorage.removeItem(STORAGE_KEY)
  initChat()
}

/* ══════════════════════════════════════════════════════════════════════════
   LIFECYCLE
   ══════════════════════════════════════════════════════════════════════════ */
let clock = null

onMounted(() => {
  updateOnline()
  clock = setInterval(updateOnline, 60_000)

  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')
    if (saved?.length) messages.value = saved
    else initChat()
  } catch {
    initChat()
  }
  unread.value = 0
})

onUnmounted(() => clock && clearInterval(clock))

watch(messages, (val) => {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val.slice(-50))) } catch {}
}, { deep: true })

watch(isOpen, (open) => {
  if (open) {
    unread.value = 0
    scrollToBottom()
    nextTick(() => inputRef.value?.focus())
  }
})

const onKey = (e) => { if (e.key === 'Escape') isOpen.value = false }
</script>

<template>
  <div v-if="!hidden" ref="widgetRef" class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] flex flex-col items-end"
       @keydown="onKey">

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-4 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="translate-y-4 opacity-0 scale-95"
    >
      <section v-if="isOpen"
        role="dialog" aria-label="Assistant BRC Market"
        class="mb-3 flex flex-col w-[calc(100vw-2rem)] sm:w-[400px] h-[min(600px,calc(100vh-8rem))] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

        <!-- HEADER -->
        <header class="flex items-center gap-3 px-4 py-3 bg-[#274a82] text-white flex-shrink-0">
          <div class="relative flex-shrink-0">
            <img src="/images/logos/brclogo.png" alt="BRC Market" class="w-10 h-10 rounded-full bg-white object-contain p-0.5" />
            <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#274a82]"
              :class="isOnline ? 'bg-green-400' : 'bg-gray-400'"></span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold leading-tight truncate">Assistant BRC Market</p>
            <p class="text-[11px] text-white/80">
              {{ isOnline ? 'En ligne · réponse rapide' : `Hors ligne · ouvert dès ${OPENING.from}h` }}
            </p>
          </div>
          <button type="button" title="Nouvelle conversation" aria-label="Nouvelle conversation"
            class="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"
            @click="resetChat">
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
          </button>
          <button type="button" aria-label="Fermer le chat"
            class="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"
            @click="isOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </header>

        <!-- MESSAGES -->
        <div ref="chatBody" role="log" aria-live="polite"
          class="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">

          <div v-for="msg in messages" :key="msg.id"
            class="flex flex-col" :class="msg.role === 'user' ? 'items-end' : 'items-start'">

            <div class="max-w-[88%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line"
              :class="msg.role === 'user'
                ? 'bg-[#274a82] text-white rounded-br-md'
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'">
              {{ msg.text }}
            </div>

            <!-- Cartes produits -->
            <div v-if="msg.products?.length" class="mt-2 w-full max-w-[92%] space-y-2">
              <div v-for="p in msg.products" :key="p.id"
                class="flex gap-3 p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div class="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img v-if="p.images?.[0]" :src="p.images[0]" :alt="p.name" class="w-full h-full object-contain p-1" loading="lazy" />
                  <UIcon v-else name="i-heroicons-photo" class="w-6 h-6 text-gray-300" />
                </div>
                <div class="flex-1 min-w-0 flex flex-col">
                  <p class="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2">{{ p.name }}</p>
                  <p class="text-sm font-black text-[#274a82] mt-0.5">
                    {{ formatPrice(p.price) }} <span class="text-[10px] font-semibold text-gray-400">FCFA</span>
                  </p>
                  <div class="flex gap-1.5 mt-auto pt-1.5">
                    <NuxtLink :to="`/products/${p.slug}`" @click="isOpen = false"
                      class="flex-1 text-center text-[11px] font-bold px-2 py-1.5 rounded-lg border border-[#274a82] text-[#274a82] hover:bg-[#274a82] hover:text-white transition-colors">
                      Voir
                    </NuxtLink>
                    <button type="button"
                      class="flex-1 text-[11px] font-bold px-2 py-1.5 rounded-lg bg-[#25D366] text-white hover:brightness-95 transition flex items-center justify-center gap-1"
                      @click="openWhatsApp(productWhatsAppText(p))">
                      <UIcon name="i-simple-icons-whatsapp" class="w-3 h-3" /> Commander
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div v-if="msg.actions?.length" class="mt-2 flex flex-wrap gap-1.5 max-w-[92%]">
              <template v-for="(a, i) in msg.actions" :key="i">
                <NuxtLink v-if="a.type === 'link'" :to="a.to" @click="isOpen = false"
                  class="text-xs font-bold px-3 py-1.5 rounded-full border border-[#274a82] text-[#274a82] hover:bg-[#274a82] hover:text-white transition-colors">
                  {{ a.label }}
                </NuxtLink>
                <button v-else type="button"
                  class="text-xs font-bold px-3 py-1.5 rounded-full bg-[#25D366] text-white hover:brightness-95 transition flex items-center gap-1.5"
                  @click="openWhatsApp(a.text)">
                  <UIcon name="i-simple-icons-whatsapp" class="w-3.5 h-3.5" /> {{ a.label }}
                </button>
              </template>
            </div>

            <span class="mt-1 text-[10px] text-gray-400 px-1">{{ msg.time }}</span>
          </div>

          <!-- Indicateur de saisie -->
          <div v-if="isTyping" class="flex items-center gap-1 px-3.5 py-3 bg-white border border-gray-200 rounded-2xl rounded-bl-md w-fit shadow-sm" aria-label="L'assistant écrit">
            <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]"></span>
          </div>
        </div>

        <!-- FOOTER -->
        <footer class="flex-shrink-0 border-t border-gray-100 bg-white p-3 space-y-2.5">

          <div class="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button v-for="q in quickReplies" :key="q.label" type="button"
              :disabled="isTyping"
              class="whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:border-[#274a82] hover:text-[#274a82] hover:bg-[#274a82]/5 transition-colors disabled:opacity-50"
              @click="onQuickReply(q)">
              {{ q.label }}
            </button>
          </div>

          <form class="flex items-center gap-2" @submit.prevent="send(input)">
            <input ref="inputRef" v-model="input" type="text" maxlength="300" :disabled="isTyping"
              placeholder="Écrivez votre message…" aria-label="Votre message"
              class="flex-1 text-sm px-3.5 py-2.5 rounded-full bg-gray-100 outline-none border border-transparent focus:border-[#274a82] focus:bg-white transition-colors disabled:opacity-60" />
            <button type="submit" aria-label="Envoyer"
              :disabled="!input.trim() || isTyping"
              class="w-10 h-10 rounded-full bg-[#274a82] text-white flex items-center justify-center hover:bg-[#e60012] transition-colors disabled:opacity-40 disabled:hover:bg-[#274a82] flex-shrink-0">
              <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4" />
            </button>
          </form>

          <button type="button"
            class="w-full flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-lg text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
            @click="openWhatsApp('Bonjour BRC, je souhaiterais avoir des informations supplémentaires.')">
            <UIcon name="i-simple-icons-whatsapp" class="w-4 h-4" />
            Continuer avec un conseiller sur WhatsApp
          </button>
        </footer>
      </section>
    </Transition>

    <!-- BOUTON FLOTTANT -->
    <button type="button"
      :aria-label="isOpen ? 'Fermer le chat' : 'Ouvrir le chat'" :aria-expanded="isOpen"
      class="relative w-14 h-14 rounded-full bg-[#274a82] text-white shadow-xl hover:bg-[#e60012] hover:scale-105 transition-all flex items-center justify-center"
      @click="isOpen = !isOpen">
      <UIcon :name="isOpen ? 'i-heroicons-x-mark' : 'i-heroicons-chat-bubble-left-right-solid'" class="w-6 h-6" />
      <span v-if="unread > 0 && !isOpen"
        class="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#e60012] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
        {{ unread }}
      </span>
    </button>
  </div>
</template>