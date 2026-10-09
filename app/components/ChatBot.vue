<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const { t, locale } = useI18n()
const route  = useRoute()
const config = useRuntimeConfig()
const API    = config.public.apiBase

/* ══════════════════════════════════════════════════════════════════════════
   CONFIG — infos de l'entreprise (les textes sont dans i18n : clés "chat.*")
   ══════════════════════════════════════════════════════════════════════════ */
const WHATSAPP_NUMBER = '237689205751'
const PHONE_DISPLAY   = '+237 6 89 20 57 51'

// Horaires (minutes depuis minuit, fuseau Africa/Douala). 0 = dimanche
// Source : page Contact → Lun–Ven 8h–17h, Sam 8h–14h30
const SCHEDULE = {
  1: [8 * 60, 17 * 60], 2: [8 * 60, 17 * 60], 3: [8 * 60, 17 * 60],
  4: [8 * 60, 17 * 60], 5: [8 * 60, 17 * 60],
  6: [8 * 60, 14 * 60 + 30],
}

/* ══════════════════════════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════════════════════════ */
const isOpen    = ref(false)
const hasOpened = ref(false)
const isTyping  = ref(false)
const input     = ref('')
const unread    = ref(0)
const isOnline  = ref(false)
const messages  = ref([])
const chatBody  = ref(null)
const inputRef  = ref(null)

// Le widget n'a pas sa place dans l'espace admin / livreur
const hidden = computed(() =>
  route.path.startsWith('/admin') || route.path.startsWith('/livreur')
)

const STORAGE_KEY = 'brc_chat_v2'

/* ══════════════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════════════ */
const intlLocale = computed(() => (locale.value === 'fr' ? 'fr-FR' : 'en-GB'))

const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString(intlLocale.value, { hour: '2-digit', minute: '2-digit' })

const formatPrice = (p) =>
  new Intl.NumberFormat(locale.value === 'fr' ? 'fr-CM' : 'en-US', { maximumFractionDigits: 0 }).format(p)

const normalize = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

// Texte d'un message : clé i18n (retraduite si la langue change) ou texte libre (message client)
const msgText = (msg) => (msg.key ? t(msg.key, msg.params ?? {}) : msg.text)

const STOP = new Set([
  // FR
  'je','tu','il','elle','nous','vous','on','un','une','des','du','de','la','le','les','et','ou','a','au','aux',
  'en','pour','sur','avec','sans','cherche','recherche','veux','voudrais','souhaite','avez','avoir','vendez',
  'vend','y','ce','cet','cette','ces','mon','ma','mes','svp','stp','quel','quels','quelle','prix','combien',
  'coute','est','sont','que','qui','dans','moi','me','ai','besoin',
  // EN
  'i','you','we','the','an','is','are','am','do','does','of','to','for','in','on','with','without','looking',
  'want','need','buy','sell','have','has','any','price','how','much','what','which','me','my','please','plz',
])

const toSearchTerms = (text) =>
  normalize(text)
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP.has(w))
    .join(' ')

const isEvening = () => new Date().getHours() >= 18

const updateOnline = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Douala', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false,
  }).formatToParts(new Date())
  const get = (type) => parts.find(p => p.type === type)?.value
  const day  = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')]
  const mins = (parseInt(get('hour') ?? '0', 10) % 24) * 60 + parseInt(get('minute') ?? '0', 10)
  const slot = SCHEDULE[day]
  isOnline.value = !!slot && mins >= slot[0] && mins < slot[1]
}

const openWhatsApp = (text) => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
  window.open(url, '_blank', 'noopener')
}

const productWhatsAppText = (p) =>
  t('chat.wa.product', {
    name:  p.name,
    price: formatPrice(p.price),
    url:   `${window.location.origin}/products/${p.slug}`,
  })

const runAction = (a) => {
  if (a.type === 'whatsapp') openWhatsApp(t(a.waKey, a.waParams ?? {}))
}

const scrollToBottom = () =>
  nextTick(() => {
    if (chatBody.value) chatBody.value.scrollTo({ top: chatBody.value.scrollHeight, behavior: 'smooth' })
  })

/* ══════════════════════════════════════════════════════════════════════════
   MESSAGES
   ══════════════════════════════════════════════════════════════════════════ */
let uid = 0
const pushMessage = (msg) => {
  messages.value.push({ id: `${Date.now()}-${uid++}`, ts: Date.now(), ...msg })
  if (msg.role === 'bot' && !isOpen.value) unread.value++
  scrollToBottom()
}

const botReply = async (build, delay = 600) => {
  isTyping.value = true
  scrollToBottom()
  await new Promise(r => setTimeout(r, delay))
  const reply = await build()
  isTyping.value = false
  pushMessage({ role: 'bot', ...reply })
}

const initChat = () => {
  pushMessage({ role: 'bot', key: isEvening() ? 'chat.welcome_evening' : 'chat.welcome_morning' })
  if (!isOnline.value) {
    pushMessage({ role: 'bot', key: 'chat.offline_notice' })
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   INTENTS (mots-clés FR + EN, sans accents)
   - "mot"  : le mot commence par ce préfixe  (livr → livraison, livrer…)
   - "mot$" : mot entier uniquement           (hi$ ≠ hitachi)
   - short  : n'est pris en compte que pour les messages courts (≤ 3 mots)
   ══════════════════════════════════════════════════════════════════════════ */
const INTENTS = [
  { name: 'order',
    keys: ['ma commande', 'mes commandes', 'suivi', 'suivre', 'colis', 'ou en est ma', 'my order', 'track', 'order status'],
    reply: () => ({ key: 'chat.ans.order', actions: [
      { type: 'link', labelKey: 'chat.act.see_orders', to: '/compte/commandes' },
    ] }) },

  { name: 'greeting', short: true,
    keys: ['bonjour', 'bonsoir', 'salut', 'hello', 'hi$', 'hey$', 'coucou', 'bjr'],
    reply: () => ({ key: isEvening() ? 'chat.ans.greeting_evening' : 'chat.ans.greeting_morning' }) },

  { name: 'thanks', short: true,
    keys: ['merci', 'thanks', 'thank you', 'thx'],
    reply: () => ({ key: 'chat.ans.thanks' }) },

  { name: 'location',
    keys: ['adresse', 'emplacement', 'localisation', 'localiser', 'ou etes', 'ou vous trouvez', 'ou se trouve la boutique',
           'ou se trouve le magasin', 'ou se trouve votre', 'ou se situe', 'ou est la boutique', 'ou est le magasin',
           'magasin', 'situe', 'comment venir', 'itineraire', 'trouver la boutique',
           'address', 'where are you', 'where is the shop', 'where is the store', 'where is your', 'location', 'directions'],
    reply: () => ({ key: 'chat.ans.location' }) },

  { name: 'hours',
    keys: ['horaire', 'heure', 'ouvert', 'ferme', 'ouverture', 'hours', 'hour', 'opening', 'open$', 'closed', 'close$'],
    reply: () => ({ key: isOnline.value ? 'chat.ans.hours_open' : 'chat.ans.hours_closed' }) },

  { name: 'delivery',
    keys: ['livr', 'expedi', 'delai', 'deliver', 'shipping', 'ship$'],
    reply: () => ({ key: 'chat.ans.delivery', actions: [
      { type: 'whatsapp', labelKey: 'chat.act.ask_delivery', waKey: 'chat.wa.delivery' },
    ] }) },

  { name: 'payment',
    keys: ['paiement', 'payer', 'payment', 'pay$', 'momo', 'mobile money', 'orange money', 'cash', 'carte bancaire', 'credit card'],
    reply: () => ({ key: 'chat.ans.payment', actions: [
      { type: 'whatsapp', labelKey: 'chat.act.ask_payment', waKey: 'chat.wa.payment' },
    ] }) },

  { name: 'warranty',
    keys: ['garantie', 'sav$', 'retour', 'rembours', 'echang', 'warranty', 'guarantee', 'return', 'refund', 'exchange'],
    reply: () => ({ key: 'chat.ans.warranty' }) },

  { name: 'contact',
    keys: ['telephone', 'numero', 'appel', 'contact', 'agent', 'conseiller', 'humain', 'phone', 'call$', 'human', 'advisor', 'whatsapp'],
    reply: () => ({ key: 'chat.ans.contact', params: { phone: PHONE_DISPLAY }, actions: [
      { type: 'whatsapp', labelKey: 'chat.act.advisor', waKey: 'chat.wa.advisor' },
    ] }) },
]

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const matchKey = (text, key) => {
  const whole = key.endsWith('$')
  const base  = escapeRe(whole ? key.slice(0, -1) : key)
  return new RegExp(`(^|[^a-z0-9])${base}${whole ? '($|[^a-z0-9])' : ''}`).test(text)
}

const detectIntent = (text) => {
  const n     = normalize(text)
  const words = n.split(/\s+/).filter(Boolean).length
  return INTENTS.find(i => (!i.short || words <= 3) && i.keys.some(k => matchKey(n, k)))
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
  const askAdvisor = { type: 'whatsapp', labelKey: 'chat.act.ask_advisor', waKey: 'chat.wa.search', waParams: { q: text } }

  if (!res || !res.products?.length) {
    return {
      key: 'chat.ans.none',
      actions: [askAdvisor, { type: 'link', labelKey: 'chat.act.browse', to: '/boutique' }],
    }
  }

  const items = res.products.slice(0, 3)

  if (res.type === 'exact') {
    return {
      key: res.products.length > 1 ? 'chat.ans.found_many' : 'chat.ans.found_one',
      params: { count: res.products.length },
      products: items,
      actions: [{ type: 'link', labelKey: 'chat.act.see_all', to: `/boutique?q=${encodeURIComponent(text)}` }],
    }
  }
  if (res.type === 'similar') {
    return {
      key: 'chat.ans.similar',
      products: items,
      actions: [{ ...askAdvisor, labelKey: 'chat.act.ask_exact' }],
    }
  }
  return { key: 'chat.ans.suggestions', products: items, actions: [askAdvisor] }
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
    () => (intent ? intent.reply() : productAnswer(clean)),
    intent ? 500 : 700,
  )
}

// Les boutons rapides appellent directement la bonne réponse (aucune détection de mots-clés)
const quickReplies = [
  { labelKey: 'chat.quick.product',  askKey: 'chat.ask.product',  action: 'search' },
  { labelKey: 'chat.quick.delivery', askKey: 'chat.ask.delivery', intent: 'delivery' },
  { labelKey: 'chat.quick.payment',  askKey: 'chat.ask.payment',  intent: 'payment' },
  { labelKey: 'chat.quick.warranty', askKey: 'chat.ask.warranty', intent: 'warranty' },
  { labelKey: 'chat.quick.address',  askKey: 'chat.ask.address',  intent: 'location' },
  { labelKey: 'chat.quick.hours',    askKey: 'chat.ask.hours',    intent: 'hours' },
]

const onQuickReply = (q) => {
  if (isTyping.value) return
  pushMessage({ role: 'user', key: q.askKey })

  if (q.action === 'search') {
    botReply(() => ({ key: 'chat.ans.search_prompt' }), 400)
    nextTick(() => inputRef.value?.focus())
    return
  }
  const intent = INTENTS.find(i => i.name === q.intent)
  botReply(() => intent.reply(), 500)
}

const resetChat = () => {
  messages.value = []
  sessionStorage.removeItem(STORAGE_KEY)
  initChat()
}

const toggleChat = () => {
  isOpen.value = !isOpen.value
  hasOpened.value = true
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
  <div v-if="!hidden" class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] flex flex-col items-end"
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
        role="dialog" :aria-label="t('chat.title')"
        class="mb-3 flex flex-col w-[calc(100vw-2rem)] sm:w-[400px] h-[min(600px,calc(100vh-8rem))] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

        <!-- HEADER -->
        <header class="flex items-center gap-3 px-4 py-3 bg-[#274a82] text-white flex-shrink-0">
          <div class="relative flex-shrink-0">
            <img src="/images/logos/brclogo.png" alt="BRC Market" class="w-10 h-10 rounded-full bg-white object-contain p-0.5" />
            <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#274a82]"
              :class="isOnline ? 'bg-green-400' : 'bg-gray-400'"></span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold leading-tight truncate">{{ t('chat.title') }}</p>
            <p class="text-[11px] text-white/80">
              {{ isOnline ? t('chat.status_online') : t('chat.status_offline') }}
            </p>
          </div>
          <button type="button" :title="t('chat.new_chat')" :aria-label="t('chat.new_chat')"
            class="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors"
            @click="resetChat">
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
          </button>
          <button type="button" :aria-label="t('chat.close')"
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
              {{ msgText(msg) }}
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
                    {{ formatPrice(p.price) }} <span class="text-[10px] font-semibold text-gray-400">{{ t('chat.currency') }}</span>
                  </p>
                  <div class="flex gap-1.5 mt-auto pt-1.5">
                    <NuxtLink :to="`/products/${p.slug}`" @click="isOpen = false"
                      class="flex-1 text-center text-[11px] font-bold px-2 py-1.5 rounded-lg border border-[#274a82] text-[#274a82] hover:bg-[#274a82] hover:text-white transition-colors">
                      {{ t('chat.view') }}
                    </NuxtLink>
                    <button type="button"
                      class="flex-1 text-[11px] font-bold px-2 py-1.5 rounded-lg bg-[#25D366] text-white hover:brightness-95 transition flex items-center justify-center gap-1"
                      @click="openWhatsApp(productWhatsAppText(p))">
                      <UIcon name="i-simple-icons-whatsapp" class="w-3 h-3" /> {{ t('chat.order') }}
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
                  {{ t(a.labelKey) }}
                </NuxtLink>
                <button v-else type="button"
                  class="text-xs font-bold px-3 py-1.5 rounded-full bg-[#25D366] text-white hover:brightness-95 transition flex items-center gap-1.5"
                  @click="runAction(a)">
                  <UIcon name="i-simple-icons-whatsapp" class="w-3.5 h-3.5" /> {{ t(a.labelKey) }}
                </button>
              </template>
            </div>

            <span class="mt-1 text-[10px] text-gray-400 px-1">{{ fmtTime(msg.ts) }}</span>
          </div>

          <!-- Indicateur de saisie -->
          <div v-if="isTyping" class="flex items-center gap-1 px-3.5 py-3 bg-white border border-gray-200 rounded-2xl rounded-bl-md w-fit shadow-sm" :aria-label="t('chat.typing')">
            <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]"></span>
          </div>
        </div>

        <!-- FOOTER -->
        <footer class="flex-shrink-0 border-t border-gray-100 bg-white p-3 space-y-2.5">

          <div class="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button v-for="q in quickReplies" :key="q.labelKey" type="button"
              :disabled="isTyping"
              class="whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:border-[#274a82] hover:text-[#274a82] hover:bg-[#274a82]/5 transition-colors disabled:opacity-50"
              @click="onQuickReply(q)">
              {{ t(q.labelKey) }}
            </button>
          </div>

          <form class="flex items-center gap-2" @submit.prevent="send(input)">
            <input ref="inputRef" v-model="input" type="text" maxlength="300" :disabled="isTyping"
              :placeholder="t('chat.placeholder')" :aria-label="t('chat.placeholder')"
              class="flex-1 text-sm px-3.5 py-2.5 rounded-full bg-gray-100 outline-none border border-transparent focus:border-[#274a82] focus:bg-white transition-colors disabled:opacity-60" />
            <button type="submit" :aria-label="t('chat.send')"
              :disabled="!input.trim() || isTyping"
              class="w-10 h-10 rounded-full bg-[#274a82] text-white flex items-center justify-center hover:bg-[#e60012] transition-colors disabled:opacity-40 disabled:hover:bg-[#274a82] flex-shrink-0">
              <UIcon name="i-heroicons-paper-airplane" class="w-4 h-4" />
            </button>
          </form>

          <button type="button"
            class="w-full flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-lg text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
            @click="openWhatsApp(t('chat.wa.generic'))">
            <UIcon name="i-simple-icons-whatsapp" class="w-4 h-4" />
            {{ t('chat.whatsapp_cta') }}
          </button>
        </footer>
      </section>
    </Transition>

    <!-- BOUTON FLOTTANT -->
    <button type="button"
      :aria-label="isOpen ? t('chat.close') : t('chat.open')" :aria-expanded="isOpen"
      class="relative w-14 h-14 rounded-full bg-[#274a82] text-white shadow-xl hover:bg-[#e60012] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
      @click="toggleChat">

      <!-- Anneau pulsant : disparaît après la première ouverture -->
      <span v-if="!hasOpened && !isOpen"
        class="absolute inset-0 rounded-full bg-[#274a82] opacity-40 animate-ping pointer-events-none"></span>

      <Transition
        mode="out-in"
        enter-active-class="transition duration-150"
        enter-from-class="opacity-0 rotate-90 scale-75"
        leave-active-class="transition duration-100"
        leave-to-class="opacity-0 -rotate-90 scale-75"
      >
        <UIcon v-if="isOpen" key="close" name="i-lucide-x" class="relative w-6 h-6" />
        <UIcon v-else key="open" name="i-lucide-message-circle-more" class="relative w-7 h-7" />
      </Transition>

      <span v-if="unread > 0 && !isOpen"
        class="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#e60012] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
        {{ unread }}
      </span>
    </button>
  </div>
</template>