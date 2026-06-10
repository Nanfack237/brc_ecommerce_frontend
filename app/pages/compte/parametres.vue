<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import type { ToastProps } from '@nuxt/ui'

const { requireAuth } = useAuth()
requireAuth()

const { t } = useI18n()

const config = useRuntimeConfig()
const API    = config.public.apiBase

useHead({
  title: () => t('parametre_compte.seo_title'),
  titleTemplate: (title) => title ? `${title} - BRC Market` : 'BRC Market',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
})

const toast  = useToast()
const token  = useCookie('auth_token')
const router = useRouter()

const showDeleteModal   = ref(false)
const deleteConfirmText = ref('')
const loadingDelete     = ref(false)

const notifications = ref({
  email_orders:     true,
  email_promotions: false,
  email_newsletter: true,
})

// ── Sections liens rapides (computed pour réactivité i18n) ────────────────────
const settingSections = computed(() => [
  {
    title: t('parametre_compte.section_account_title'),
    icon:  'i-heroicons-user-circle',
    items: [
      {
        label: t('parametre_compte.link_edit_info_label'),
        desc:  t('parametre_compte.link_edit_info_desc'),
        to:    '/compte/informations',
        icon:  'i-heroicons-pencil-square',
      },
    ],
  },
  {
    title: t('parametre_compte.section_activity_title'),
    icon:  'i-heroicons-shopping-bag',
    items: [
      {
        label: t('parametre_compte.link_orders_label'),
        desc:  t('parametre_compte.link_orders_desc'),
        to:    '/compte/commandes',
        icon:  'i-heroicons-shopping-bag',
      },
      {
        label: t('parametre_compte.link_favorites_label'),
        desc:  t('parametre_compte.link_favorites_desc'),
        to:    '/compte/favoris',
        icon:  'i-heroicons-heart',
      },
    ],
  },
])

// ── Actions ───────────────────────────────────────────────────────────────────
const saveNotifications = () => {
  toast.add({
    title:       t('parametre_compte.toast_notif_title'),
    description: t('parametre_compte.toast_notif_desc'),
    color:       'success',
    icon:        'i-heroicons-check-circle',
  } as ToastProps)
}

const logoutAll = async () => {
  try {
    await axios.post(`${API}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token.value}` },
    })
  } catch {}

  token.value = null
  toast.add({
    title:       t('parametre_compte.toast_logout_title'),
    description: t('parametre_compte.toast_logout_desc'),
    color:       'success',
    icon:        'i-heroicons-check-circle',
  } as ToastProps)

  router.push('/login')
}

const deleteAccount = async () => {
  if (deleteConfirmText.value !== 'SUPPRIMER') return
  loadingDelete.value = true
  try {
    await axios.delete(`${API}/profile`, {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    token.value = null
    toast.add({
      title:       t('parametre_compte.toast_delete_success_title'),
      description: t('parametre_compte.toast_delete_success_desc'),
      color:       'neutral',
      icon:        'i-heroicons-trash',
    } as ToastProps)
    router.push('/')
  } catch {
    toast.add({
      title:       t('parametre_compte.toast_delete_error_title'),
      description: t('parametre_compte.toast_delete_error_desc'),
      color:       'error',
      icon:        'i-heroicons-x-circle',
    } as ToastProps)
  } finally {
    loadingDelete.value   = false
    showDeleteModal.value = false
  }
}
</script>

<template>
  <div class="space-y-5">

    <!-- ══ BREADCRUMB + TITRE ══════════════════════════════════════════════ -->
    <div>
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/" class="hover:text-[#274a82] transition-colors">
          {{ $t('parametre_compte.breadcrumb_home') }}
        </NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
        <span class="text-gray-600">{{ $t('parametre_compte.page_title') }}</span>
      </div>
      <h1 class="text-2xl font-black text-gray-900">{{ $t('parametre_compte.page_title') }}</h1>
      <p class="text-gray-500 text-sm mt-1">{{ $t('parametre_compte.subtitle') }}</p>
    </div>

    <!-- ══ LIENS RAPIDES ═══════════════════════════════════════════════════ -->
    <div
      v-for="section in settingSections"
      :key="section.title"
      class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div class="flex items-center gap-2 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
        <UIcon :name="section.icon" class="w-4 h-4 text-[#274a82]" />
        <span class="text-[14px] font-bold text-gray-500 tracking-wider">{{ section.title }}</span>
      </div>
      <div>
        <NuxtLink
          v-for="item in section.items"
          :key="item.label"
          :to="item.to"
          class="flex items-center justify-between px-5 py-4 hover:bg-blue-50/50 transition group border-b border-gray-50 last:border-0"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-[#274a82]/10 flex items-center justify-center">
              <UIcon :name="item.icon" class="w-4 h-4 text-[#274a82]" />
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-800 group-hover:text-[#274a82] transition">
                {{ item.label }}
              </p>
              <p class="text-xs text-gray-400">{{ item.desc }}</p>
            </div>
          </div>
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-300 group-hover:text-[#274a82] transition" />
        </NuxtLink>
      </div>
    </div>

    <!-- ══ SÉCURITÉ ════════════════════════════════════════════════════════ -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="flex items-center gap-2 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
        <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-[#274a82]" />
        <span class="text-[14px] font-bold text-gray-500 tracking-wider">
          {{ $t('parametre_compte.section_security_title') }}
        </span>
      </div>

      <!-- Déconnecter tous les appareils -->
      <div class="px-5 py-4 flex items-center justify-between border-b border-gray-50">
        <div>
          <p class="text-sm font-semibold text-gray-800">
            {{ $t('parametre_compte.logout_all_label') }}
          </p>
          <p class="text-xs text-gray-400">{{ $t('parametre_compte.logout_all_desc') }}</p>
        </div>
        <UButton
          size="sm"
          color="neutral"
          variant="outline"
          icon="i-heroicons-arrow-left-on-rectangle"
          @click="logoutAll"
        >
          {{ $t('parametre_compte.logout_all_btn') }}
        </UButton>
      </div>

      <!-- Changer le mot de passe -->
      <NuxtLink
        to="/compte/informations"
        class="flex items-center justify-between px-5 py-4 hover:bg-blue-50/50 group transition"
      >
        <div>
          <p class="text-sm font-semibold text-gray-800 group-hover:text-[#274a82] transition">
            {{ $t('parametre_compte.change_password_label') }}
          </p>
          <p class="text-xs text-gray-400">{{ $t('parametre_compte.change_password_desc') }}</p>
        </div>
        <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-gray-300 group-hover:text-[#274a82] transition" />
      </NuxtLink>
    </div>

  </div>
</template>