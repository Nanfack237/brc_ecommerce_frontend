<script setup lang="ts">
import axios from 'axios'
import type { ToastProps } from '@nuxt/ui'

const { t } = useI18n()
const config = useRuntimeConfig()
const API    = config.public.apiBase

useSeoMeta({
  title:       t('login.seo_title'),
  description: t('login.seo_description'),
  ogTitle:     t('login.seo_og_title'),
  ogUrl:       'https://brcmarket.cm/login',
  robots:      'noindex, nofollow',
})
useHead({ link: [{ rel: 'canonical', href: 'https://brcmarket.cm/login' }] })

const toast    = useToast()
const router   = useRouter()
const route    = useRoute()

const token    = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7 })
const authRole = useCookie('auth_role',  { maxAge: 60 * 60 * 24 * 7 })
const authUser = useState<any>('auth_user', () => null)

const email        = ref('')
const password     = ref('')
const loading      = ref(false)
const errors       = ref<Record<string, string[]>>({})
const showPassword = ref(false)

const handleLogin = async () => {
  loading.value = true
  errors.value  = {}

  try {
    const response = await axios.post(`${API}/auth/login`, {
      email:    email.value,
      password: password.value,
    }, {
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json',
      },
    })

    const { token: userToken, user } = response.data

    token.value    = userToken
    authRole.value = user.role
    authUser.value = user

    toast.add({
      title:       t('login.toast_success_title'),
      description: t('login.toast_success_desc', { name: user.first_name }),
      color:       'success',
      icon:        'i-heroicons-check-circle',
    } as ToastProps)

    setTimeout(() => {
      const redirect = route.query.redirect as string | undefined
      if (redirect) {
        router.push(redirect)
      } else if (user.role === 'admin' || user.role === 'super_admin') {
        router.push('/admin')
      } else if (user.role === 'livreur') {
        router.push('/livreur/livraisons')
      } else {
        router.push('/boutique')
      }
    }, 800)

  } catch (err: any) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors ?? {}
      toast.add({
        title:       t('login.toast_validation_title'),
        description: t('login.toast_validation_desc'),
        color:       'error',
        icon:        'i-heroicons-exclamation-triangle',
      } as ToastProps)

    } else if (err.response?.status === 401) {
      toast.add({
        title:       t('login.toast_401_title'),
        description: err.response.data.message ?? t('login.toast_401_desc'),
        color:       'error',
        icon:        'i-heroicons-x-circle',
      } as ToastProps)

    } else if (err.response?.status === 403) {
      toast.add({
        title:       t('login.toast_403_title'),
        description: err.response.data.message ?? t('login.toast_403_desc'),
        color:       'error',
        icon:        'i-heroicons-no-symbol',
      } as ToastProps)

    } else if (err.message === 'Network Error') {
      toast.add({
        title:       t('login.toast_network_title'),
        description: t('login.toast_network_desc'),
        color:       'error',
        icon:        'i-heroicons-signal-slash',
      } as ToastProps)

    } else {
      toast.add({
        title:       t('login.toast_error_title'),
        description: t('login.toast_error_desc', { message: err.message }),
        color:       'error',
        icon:        'i-heroicons-exclamation-circle',
      } as ToastProps)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="flex items-center justify-center py-8">
    <UCard class="w-full max-w-md shadow-2xl rounded-2xl p-6">

      <!-- HEADER -->
      <div class="text-center mb-6">
        <UIcon name="i-heroicons-user-circle" class="w-16 h-16 text-gray-400" />
        <h1 class="text-2xl font-bold mt-2">{{ $t('login.header_title') }}</h1>
        <p class="text-sm text-gray-500">{{ $t('login.header_sub') }}</p>
      </div>

      <!-- FORM -->
      <form @submit.prevent="handleLogin" class="flex flex-col gap-3">

        <!-- EMAIL -->
        <div class="flex flex-col gap-1">
          <UInput
            v-model="email"
            type="email"
            icon="i-heroicons-envelope"
            :placeholder="$t('login.field_email')"
            size="lg"
            block
            required
            :color="errors.email ? 'error' : 'primary'"
          />
          <p v-if="errors.email" class="text-xs text-red-500 ml-1">
            {{ errors.email[0] }}
          </p>
        </div>

        <!-- PASSWORD -->
        <div class="flex flex-col gap-1">
          <UInput
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            icon="i-heroicons-lock-closed"
            :placeholder="$t('login.field_password')"
            size="lg"
            block
            required
            :color="errors.password ? 'error' : 'primary'"
          >
            <template #trailing>
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                <UIcon
                  :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  class="w-4 h-4"
                />
              </button>
            </template>
          </UInput>
          <p v-if="errors.password" class="text-xs text-red-500 ml-1">
            {{ errors.password[0] }}
          </p>
        </div>

        <!-- MOT DE PASSE OUBLIÉ -->
        <div class="flex justify-end -mt-1">
          <NuxtLink to="/forgot-password" class="text-sm text-red-600 hover:underline">
            {{ $t('login.forgot_password') }}
          </NuxtLink>
        </div>

        <!-- SUBMIT -->
        <UButton
          type="submit"
          color="error"
          size="lg"
          block
          :loading="loading"
          icon="i-heroicons-arrow-right-on-rectangle"
        >
          {{ $t('login.submit') }}
        </UButton>

      </form>

      <!-- LIEN INSCRIPTION -->
      <div class="text-center mt-5 text-sm">
        <span class="text-gray-500">{{ $t('login.no_account') }}</span>
        <NuxtLink to="/register" class="text-red-600 font-medium hover:underline ml-1">
          {{ $t('login.create_account') }}
        </NuxtLink>
      </div>

    </UCard>
  </UContainer>
</template>