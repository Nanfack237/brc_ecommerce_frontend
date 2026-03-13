// plugins/axios.client.ts
import axios from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const token  = useCookie('auth_token')

  const api = axios.create({
    baseURL: config.public.apiBase,
    headers: {
      'Accept':       'application/json',
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  })

  // Add token to every request automatically
  api.interceptors.request.use((requestConfig) => {
    if (token.value) {
      requestConfig.headers.Authorization = `Bearer ${token.value}`
    }
    return requestConfig
  })

  // Auto logout if token expired
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        token.value = null
        navigateTo('/connexion')
      }
      return Promise.reject(error)
    }
  )

  return {
    provide: {
      api, // → accessible as $api everywhere
    },
  }
})