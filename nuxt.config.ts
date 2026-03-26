// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/content',
    '@pinia/nuxt',
    '@vite-pwa/nuxt' // Ajout du module PWA ici
  ],

  pwa: {
    manifest: {
      name: 'BRC Market',
      short_name: 'BRC Market',
      description: 'Un Africain, Un Ordinateur - E-commerce informatique',
      theme_color: '#274a82', // Ton brcBlue
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: 'icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/'
    },
    devOptions: {
      enabled: true, // Permet de tester l'installation même en local (npm run dev)
      type: 'module'
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000/api',
      cloudinaryCloudName:     process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME    ?? '',
      cloudinaryUploadPreset: process.env.NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? ''
    }
  },

  vite: {
    server: {
      allowedHosts: [
        'unadoringly-registrable-marcus.ngrok-free.dev'
      ]
    }
  },

  ui: {
    theme: {
      extend: {
        colors: {
          primary:   '#007bff',
          secondary: '#ff0000',
          brcBlue:   '#274a82'
        }
      }
    }
  },

  colorMode: {
    preference: 'light', // Force le mode clair par défaut
    fallback: 'light',   // Si le système ne répond pas, reste en clair
    storageKey: 'nuxt-color-mode'
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle:  '1tbs'
      }
    }
  }
})