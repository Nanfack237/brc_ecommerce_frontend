<script setup lang="ts">
const { requireAuth } = useAuth()
requireAuth()
import { ref } from 'vue'
import axios from 'axios'
import type { ToastProps } from '@nuxt/ui'

useHead({
  title: 'BRC Market',
  titleTemplate: (titleChunk) => `${titleChunk} - Paramètres`,
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
})

const toast  = useToast()
const token  = useCookie('auth_token')
const router = useRouter()

const notifications = ref({
  email_orders:     true,
  email_promotions: false,
  email_newsletter: true,
})

const showDeleteModal   = ref(false)
const deleteConfirmText = ref('')
const loadingDelete     = ref(false)

const saveNotifications = () => {
  toast.add({ title: 'Préférences sauvegardées', description: 'Vos préférences de notifications ont été mises à jour.', color: 'success', icon: 'i-heroicons-check-circle' } as ToastProps)
}

const logoutAll = async () => {
  try {
    await axios.post('http://127.0.0.1:8000/api/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
  } catch {}
  token.value = null
  toast.add({ title: 'Déconnecté', description: 'Vous avez été déconnecté de tous les appareils.', color: 'success', icon: 'i-heroicons-check-circle' } as ToastProps)
  router.push('/login')
}

const deleteAccount = async () => {
  if (deleteConfirmText.value !== 'SUPPRIMER') return
  loadingDelete.value = true
  try {
    await axios.delete('http://127.0.0.1:8000/api/profile', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    token.value = null
    toast.add({ title: 'Compte supprimé', description: 'Votre compte a été supprimé définitivement.', color: 'neutral', icon: 'i-heroicons-trash' } as ToastProps)
    router.push('/')
  } catch {
    toast.add({ title: 'Erreur', description: 'Impossible de supprimer le compte.', color: 'error', icon: 'i-heroicons-x-circle' } as ToastProps)
  } finally {
    loadingDelete.value   = false
    showDeleteModal.value = false
  }
}

const settingSections = [
  {
    title: 'Compte', icon: 'i-heroicons-user-circle',
    items: [
      { label: 'Modifier mes informations', desc: 'Nom, email, téléphone', to: '/compte/informations', icon: 'i-heroicons-pencil-square' },
      { label: 'Mes adresses',              desc: 'Adresses de livraison',  to: '/compte/adresses',    icon: 'i-heroicons-map-pin' },
    ]
  },
  {
    title: 'Activité', icon: 'i-heroicons-shopping-bag',
    items: [
      { label: 'Mes commandes', desc: 'Historique des achats', to: '/compte/commandes', icon: 'i-heroicons-shopping-bag' },
      { label: 'Mes favoris',   desc: 'Produits sauvegardés',  to: '/compte/favoris',   icon: 'i-heroicons-heart' },
    ]
  },
]
</script>

<template>
  <div class="space-y-5">

      <!-- Breadcrumb + title -->
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <NuxtLink to="/" class="hover:text-[#274a82]">Accueil</NuxtLink>
          <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
          <NuxtLink to="/compte" class="hover:text-[#274a82]">Mon compte</NuxtLink>
          <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
          <span class="text-gray-600">Paramètres</span>
        </div>
        <h1 class="text-2xl font-black text-gray-900">Paramètres</h1>
        <p class="text-gray-500 text-sm mt-1">Gérez vos préférences et votre compte</p>
      </div>

      <!-- Quick links -->
      <div v-for="section in settingSections" :key="section.title" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center gap-2 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
          <UIcon :name="section.icon" class="w-4 h-4 text-[#274a82]" />
          <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">{{ section.title }}</span>
        </div>
        <div>
          <NuxtLink
            v-for="item in section.items" :key="item.label" :to="item.to"
            class="flex items-center justify-between px-5 py-4 hover:bg-blue-50/50 transition group border-b border-gray-50 last:border-0"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-[#274a82]/10 flex items-center justify-center">
                <UIcon :name="item.icon" class="w-4 h-4 text-[#274a82]" />
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800 group-hover:text-[#274a82] transition">{{ item.label }}</p>
                <p class="text-xs text-gray-400">{{ item.desc }}</p>
              </div>
            </div>
            <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-300 group-hover:text-[#274a82] transition" />
          </NuxtLink>
        </div>
      </div>

      <!-- Notifications -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center gap-2 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
          <UIcon name="i-heroicons-bell" class="w-4 h-4 text-[#274a82]" />
          <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Notifications</span>
        </div>
        <div class="divide-y divide-gray-50">
          <div class="flex items-center justify-between px-5 py-4">
            <div>
              <p class="text-sm font-semibold text-gray-800">Commandes</p>
              <p class="text-xs text-gray-400">Confirmations et mises à jour de livraison</p>
            </div>
            <UToggle v-model="notifications.email_orders" color="primary" />
          </div>
          <div class="flex items-center justify-between px-5 py-4">
            <div>
              <p class="text-sm font-semibold text-gray-800">Promotions</p>
              <p class="text-xs text-gray-400">Offres spéciales et réductions</p>
            </div>
            <UToggle v-model="notifications.email_promotions" color="primary" />
          </div>
          <div class="flex items-center justify-between px-5 py-4">
            <div>
              <p class="text-sm font-semibold text-gray-800">Newsletter</p>
              <p class="text-xs text-gray-400">Actualités et nouveaux produits</p>
            </div>
            <UToggle v-model="notifications.email_newsletter" color="primary" />
          </div>
        </div>
        <div class="px-5 py-4 bg-gray-50/50 border-t border-gray-100">
          <UButton size="sm" color="primary" variant="outline" icon="i-heroicons-check" @click="saveNotifications">
            Sauvegarder les préférences
          </UButton>
        </div>
      </div>

      <!-- Security -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center gap-2 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
          <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-[#274a82]" />
          <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Sécurité</span>
        </div>
        <div class="px-5 py-4 flex items-center justify-between border-b border-gray-50">
          <div>
            <p class="text-sm font-semibold text-gray-800">Déconnecter tous les appareils</p>
            <p class="text-xs text-gray-400">Révoque tous les tokens actifs</p>
          </div>
          <UButton size="sm" color="neutral" variant="outline" icon="i-heroicons-arrow-left-on-rectangle" @click="logoutAll">
            Déconnecter
          </UButton>
        </div>
        <NuxtLink to="/compte/informations" class="flex items-center justify-between px-5 py-4 hover:bg-blue-50/50 group transition">
          <div>
            <p class="text-sm font-semibold text-gray-800 group-hover:text-[#274a82] transition">Changer le mot de passe</p>
            <p class="text-xs text-gray-400">Modifier votre mot de passe actuel</p>
          </div>
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-300 group-hover:text-[#274a82] transition" />
        </NuxtLink>
      </div>

      <!-- Danger zone -->
      <div class="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <div class="flex items-center gap-2 px-5 py-3 border-b border-red-50 bg-red-50/50">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-500" />
          <span class="text-xs font-bold text-red-500 uppercase tracking-wider">Zone dangereuse</span>
        </div>
        <div class="px-5 py-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-800">Supprimer mon compte</p>
            <p class="text-xs text-gray-400">Action irréversible — toutes vos données seront effacées</p>
          </div>
          <UButton size="sm" color="error" variant="soft" icon="i-heroicons-trash" @click="showDeleteModal = true">
            Supprimer
          </UButton>
        </div>
      </div>

    </div>

    <!-- Delete modal -->
    <UModal v-model:open="showDeleteModal">
  <template #content>
    <div class="p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <UIcon name="i-heroicons-trash" class="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 class="font-black text-gray-900">Supprimer le compte</h2>
          <p class="text-xs text-gray-400">Cette action est irréversible</p>
        </div>
      </div>
      <p class="text-sm text-gray-600 mb-4">
        Toutes vos commandes, favoris et données personnelles seront supprimés définitivement.
        Tapez <strong>SUPPRIMER</strong> pour confirmer.
      </p>
      <UInput v-model="deleteConfirmText" placeholder="Tapez SUPPRIMER" size="lg" class="mb-4" :color="deleteConfirmText === 'SUPPRIMER' ? 'error' : 'primary'" />
      <div class="flex gap-3">
        <UButton block variant="outline" color="neutral" @click="showDeleteModal = false">Annuler</UButton>
        <UButton block color="error" icon="i-heroicons-trash" :disabled="deleteConfirmText !== 'SUPPRIMER'" :loading="loadingDelete" @click="deleteAccount">
          Supprimer définitivement
        </UButton>
      </div>
    </div>
  </template>
    </UModal>

</template>