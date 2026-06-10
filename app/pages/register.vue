<script setup lang="ts">
import axios from 'axios'
import type { ToastProps } from '@nuxt/ui'

const { t } = useI18n()
const config = useRuntimeConfig()
const API    = config.public.apiBase

useSeoMeta({
  title:       t('register.seo_title'),
  description: t('register.seo_description'),
  ogTitle:     t('register.seo_og_title'),
  ogUrl:       'https://brcmarket.cm/register',
  robots:      'noindex, nofollow',
})
useHead({ link: [{ rel: 'canonical', href: 'https://brcmarket.cm/register' }] })

const toast  = useToast()
const router = useRouter()
const token  = useCookie('auth_token')

const firstName           = ref('')
const lastName            = ref('')
const email               = ref('')
const phone               = ref('')
const password            = ref('')
const confirmPassword     = ref('')
const loading             = ref(false)
const errors              = ref<Record<string, string[]>>({})
const showPassword        = ref(false)
const showConfirmPassword = ref(false)

const passwordStrength = computed(() => {
  const p = password.value
  if (!p) return { score: 0, label: '', color: '' }
  let score = 0
  if (p.length >= 8)           score++
  if (/[A-Z]/.test(p))         score++
  if (/[0-9]/.test(p))         score++
  if (/[^A-Za-z0-9]/.test(p))  score++
  const levels = [
    { score: 1, label: t('register.strength_weak'),      color: 'bg-red-500'    },
    { score: 2, label: t('register.strength_medium'),    color: 'bg-orange-400' },
    { score: 3, label: t('register.strength_good'),      color: 'bg-yellow-400' },
    { score: 4, label: t('register.strength_excellent'), color: 'bg-green-500'  },
  ]
  return levels[score - 1] ?? { score: 0, label: '', color: '' }
})

const passwordsMatch = computed(() =>
  confirmPassword.value.length > 0 && password.value === confirmPassword.value
)

const handleRegister = async () => {
  errors.value = {}

  if (password.value !== confirmPassword.value) {
    errors.value = { confirmPassword: [t('register.toast_passwords_desc')] }
    toast.add({
      title:       t('register.toast_passwords_title'),
      description: t('register.toast_passwords_desc'),
      color:       'error',
      icon:        'i-heroicons-x-circle',
    } as ToastProps)
    return
  }

  loading.value = true

  try {
    const response = await axios.post(`${API}/auth/register`, {
      first_name:            firstName.value,
      last_name:             lastName.value,
      email:                 email.value,
      phone:                 phone.value,
      password:              password.value,
      password_confirmation: confirmPassword.value,
    }, {
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json',
      },
    })

    token.value = response.data.token

    toast.add({
      title:       t('register.toast_success_title'),
      description: t('register.toast_success_desc', { name: response.data.user.first_name }),
      color:       'success',
      icon:        'i-heroicons-check-circle',
    } as ToastProps)

    setTimeout(() => router.push('/boutique'), 1500)

  } catch (err: any) {
    if (err.response?.status === 422) {
      errors.value = err.response.data.errors ?? {}
      const firstError = Object.values(errors.value)[0]?.[0]
      toast.add({
        title:       t('register.toast_validation_title'),
        description: firstError ?? t('register.toast_error_desc'),
        color:       'error',
        icon:        'i-heroicons-exclamation-triangle',
      } as ToastProps)

    } else if (err.message === 'Network Error') {
      toast.add({
        title:       t('register.toast_network_title'),
        description: t('register.toast_network_desc'),
        color:       'error',
        icon:        'i-heroicons-signal-slash',
      } as ToastProps)

    } else {
      toast.add({
        title:       t('register.toast_error_title'),
        description: err.response?.data?.message ?? t('register.toast_error_desc'),
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
    <UCard class="w-full max-w-2xl shadow-2xl rounded-2xl p-6">

      <!-- HEADER -->
      <div class="text-center mb-6">
        <UIcon name="i-heroicons-user-plus" class="w-16 h-16 text-gray-400" />
        <h1 class="text-2xl font-bold mt-2">{{ $t('register.header_title') }}</h1>
        <p class="text-sm text-gray-500">{{ $t('register.header_sub') }}</p>
      </div>

      <!-- FORM -->
      <form @submit.prevent="handleRegister" class="flex flex-col gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

          <!-- FIRST NAME -->
          <div class="flex flex-col gap-1">
            <UInput
              v-model="firstName"
              type="text"
              icon="i-heroicons-user"
              :placeholder="$t('register.field_firstname')"
              size="lg"
              block
              required
              :color="errors.first_name ? 'error' : 'primary'"
            />
            <p v-if="errors.first_name" class="text-xs text-red-500 ml-1">
              {{ errors.first_name[0] }}
            </p>
          </div>

          <!-- LAST NAME -->
          <div class="flex flex-col gap-1">
            <UInput
              v-model="lastName"
              type="text"
              icon="i-heroicons-user"
              :placeholder="$t('register.field_lastname')"
              size="lg"
              block
              required
              :color="errors.last_name ? 'error' : 'primary'"
            />
            <p v-if="errors.last_name" class="text-xs text-red-500 ml-1">
              {{ errors.last_name[0] }}
            </p>
          </div>

          <!-- EMAIL -->
          <div class="flex flex-col gap-1">
            <UInput
              v-model="email"
              type="email"
              icon="i-heroicons-envelope"
              :placeholder="$t('register.field_email')"
              size="lg"
              block
              required
              :color="errors.email ? 'error' : 'primary'"
            />
            <p v-if="errors.email" class="text-xs text-red-500 ml-1">
              {{ errors.email[0] }}
            </p>
          </div>

          <!-- PHONE -->
          <div class="flex flex-col gap-1">
            <UInput
              v-model="phone"
              type="tel"
              icon="i-heroicons-device-phone-mobile"
              :placeholder="$t('register.field_phone')"
              size="lg"
              block
              :color="errors.phone ? 'error' : 'primary'"
            />
            <p v-if="errors.phone" class="text-xs text-red-500 ml-1">
              {{ errors.phone[0] }}
            </p>
          </div>

          <!-- PASSWORD -->
          <div class="flex flex-col gap-1">
            <UInput
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              icon="i-heroicons-lock-closed"
              :placeholder="$t('register.field_password')"
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

            <!-- Strength bar -->
            <div v-if="password" class="flex gap-1 mt-1 px-1">
              <div
                v-for="i in 4" :key="i"
                class="h-1 flex-1 rounded-full transition-all duration-300"
                :class="i <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'"
              />
            </div>
            <p v-if="password" class="text-xs ml-1" :class="{
              'text-red-500':    passwordStrength.score === 1,
              'text-orange-400': passwordStrength.score === 2,
              'text-yellow-500': passwordStrength.score === 3,
              'text-green-500':  passwordStrength.score === 4,
            }">
              {{ $t('register.password_strength', { label: passwordStrength.label }) }}
            </p>
            <p v-if="errors.password" class="text-xs text-red-500 ml-1">
              {{ errors.password[0] }}
            </p>
          </div>

          <!-- CONFIRM PASSWORD -->
          <div class="flex flex-col gap-1">
            <UInput
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              icon="i-heroicons-lock-closed"
              :placeholder="$t('register.field_confirm_password')"
              size="lg"
              block
              required
              :color="errors.confirmPassword ? 'error' : confirmPassword && passwordsMatch ? 'success' : 'primary'"
            >
              <template #trailing>
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                >
                  <UIcon
                    :name="showConfirmPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                    class="w-4 h-4"
                  />
                </button>
              </template>
            </UInput>

            <p v-if="confirmPassword && passwordsMatch" class="text-xs text-green-500 font-medium ml-1">
              {{ $t('register.passwords_match') }}
            </p>
            <p v-else-if="confirmPassword && !passwordsMatch" class="text-xs text-red-500 ml-1">
              {{ $t('register.passwords_no_match') }}
            </p>
            <p v-if="errors.confirmPassword" class="text-xs text-red-500 ml-1">
              {{ errors.confirmPassword[0] }}
            </p>
          </div>

        </div>

        <!-- SUBMIT -->
        <UButton
          type="submit"
          color="error"
          size="lg"
          block
          :loading="loading"
          icon="i-heroicons-user-plus"
        >
          {{ $t('register.submit') }}
        </UButton>
      </form>

      <!-- LOGIN LINK -->
      <div class="text-center mt-5 text-sm">
        <span class="text-gray-500">{{ $t('register.already_account') }}</span>
        <NuxtLink to="/login" class="text-red-600 font-medium hover:underline ml-1">
          {{ $t('register.login_link') }}
        </NuxtLink>
      </div>

    </UCard>
  </UContainer>
</template>