<template>
  <div ref="chatWidget" class="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-4 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="translate-y-4 opacity-0 scale-95"
    >
      <UCard
        v-if="isOpen"
        class="mb-4 w-[350px] md:w-[400px] shadow-2xl border-primary-500/20 flex flex-col overflow-hidden"
        :ui="{ body: { padding: 'p-0' }, header: { background: 'bg-[#274a82]' }, footer: { padding: 'p-2' } }"
      >
        <template #header>
          <div class="flex items-center justify-between text-white px-4 py-1">
            <div class="flex items-center gap-2">
              <UAvatar src="/brclogo.jpg" alt="BRC Bot" size="sm" />
              <div>
                <p class="text-sm text-[#274a82] font-bold">Support BRC</p>
                <p class="text-[10px] opacity-80 text-green-300">● En ligne</p>
              </div>
            </div>
            <UButton color="white" variant="ghost" icon="i-heroicons-x-mark-20-solid" @click="isOpen = false" />
          </div>
        </template>

        <div ref="chatContainer" class="h-[300px] overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 flex flex-col">
          <div v-for="(msg, index) in messages" :key="index" 
               :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <div :class="[
              'max-w-[85%] p-3 rounded-2xl text-sm shadow-sm',
              msg.role === 'user' ? 'bg-[#274a82] text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-none'
            ]">
              {{ msg.text }}
            </div>
          </div>
          <div v-if="isTyping" class="flex justify-start items-center gap-1 text-xs text-gray-400">
             <span class="animate-bounce">●</span><span class="animate-bounce delay-75">●</span><span class="animate-bounce delay-150">●</span>
          </div>
        </div>

        <template #footer>
          <div class="space-y-3">
            <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <UButton
                v-for="q in faqs" :key="q.id"
                size="2xs" variant="soft"  class="whitespace-nowrap bg-[#274a82] hover:bg-[#e60012] text-white rounded-full px-1 font-medium"
                @click="processMessage(q.question, q.answer)"
                :disabled="isTyping"
              >
                {{ q.question }}
              </UButton>
            </div>

            <UButton
                icon="i-simple-icons-whatsapp"
                block
                variant="solid"
                class="bg-[#274a82] hover:bg-[#e60012] text-white font-bold"
                @click="openWhatsApp('Bonjour BRC, je souhaiterais avoir des informations supplémentaires.')"
                >
                Parler à un agent sur WhatsApp
            </UButton>

            <div class="flex items-center gap-2 border-t pt-2 dark:border-gray-700">
              <UInput
                v-model="userInputValue"
                placeholder="Posez votre question..."
                class="flex-1"
                variant="none"
                @keyup.enter="handleCustomMessage"
                :disabled="isTyping"
              />
              <UButton
                icon="i-heroicons-paper-airplane"
               
                variant="solid"
                class="bg-[#274a82] active:bg-[#274a82]"
                circular
                :disabled="!userInputValue.trim() || isTyping"
                @click="handleCustomMessage"
              />
            </div>
          </div>
        </template>
      </UCard>
    </Transition>

    <UButton
      icon="i-heroicons-chat-bubble-left-right-solid"
      size="xl" 
      class="rounded-full w-14 h-14 shadow-xl bg-[#274a82] active:bg-[#274a82] hover:bg-[#e60012] hover:scale-110 transition-transform text-white"
      @click="isOpen = !isOpen"
    />
  </div>
</template>
<script setup>
import { onClickOutside } from '@vueuse/core'

const isOpen = ref(false)
const chatWidget = ref(null)
const isTyping = ref(false)
const userInputValue = ref('')
const chatContainer = ref(null)

const whatsappNumber = "237683627787"

onClickOutside(chatWidget, () => {
  if (isOpen.value) isOpen.value = false
})

const messages = ref([
  { role: 'bot', text: 'Bonjour ! Je suis l\'assistant BRC. Posez votre question ou cliquez sur un bouton.' }
])

const faqs = [
  { id: 1, question: '📍Emplacement', answer: 'Nous sommes à Akwa Douala, rue Castelnau, juste après la rue du Collège King Akwa.' },
  { id: 2, question: '💻Dell Latitude 3310', answer: 'Le Dell Latitude 3310  Dual Core est disponible à 45 000 FCFA. Souhaitez-vous le commander sur WhatsApp ?' },
  { id: 3, question: '✅Garantie', answer: 'Tous nos produits sont garantis avec un SAV assuré par nos techniciens.' }
]

// Fonction pour ouvrir WhatsApp
const openWhatsApp = (text) => {
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}

const processMessage = (userText, botResponse = null) => {
  if (!userText.trim()) return
  
  // 1. On affiche le message de l'utilisateur dans le chat
  messages.value.push({ role: 'user', text: userText })
  const savedText = userText // On garde une copie du texte
  userInputValue.value = ''
  scrollToBottom()

  isTyping.value = true
  
  setTimeout(() => {
    isTyping.value = false
    
    // 2. Si c'est un message personnalisé (pas un bouton FAQ), on redirige
    if (!botResponse) {
      messages.value.push({ 
        role: 'bot', 
        text: "Je vous redirige vers notre WhatsApp pour qu'un agent vous réponde personnellement..." 
      })
      
      // Petit délai pour laisser le temps de lire le message du bot avant redirection
      setTimeout(() => {
        openWhatsApp(savedText)
      }, 1500)
    } else {
      // 3. Si c'est un bouton FAQ, on donne juste la réponse prévue
      messages.value.push({ role: 'bot', text: botResponse })
    }
    
    scrollToBottom()
  }, 800)
}

const handleCustomMessage = () => {
  if (!userInputValue.value.trim()) return
  
  // On appelle processMessage sans botResponse pour déclencher la redirection WhatsApp
  processMessage(userInputValue.value)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  })
}
</script>