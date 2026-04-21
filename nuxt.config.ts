// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/content',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000/api',
      cloudinaryCloudName:    process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME    ?? '',
      cloudinaryUploadPreset: process.env.NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '',
    },
  },

  vite: {
    server: {
      allowedHosts: [
        'unadoringly-registrable-marcus.ngrok-free.dev',
      ],
    },
  },

  // ── Icônes bundlées localement ──────────────────────────────────────────
  icon: {
    serverBundle: false,
    clientBundle: {
      scan: true,
      collections: ['heroicons', 'lucide', 'simple-icons'],
      sizeLimitKb: 512,
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'BRC Market',
      short_name: 'BRC Market',
      description: 'Plateforme e-commerce BRC Market',
      theme_color: '#274a82',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      lang: 'fr',
      icons: [
        {
          src: '/icons/pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
        },
        {
          src: '/icons/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          // TRÈS IMPORTANT : Ce fichier doit être ton logo SUR FOND BLEU PLEIN
          src: '/icons/pwa-512x512-maskable.png', 
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
      // Les screenshots aident Chrome à afficher un bouton "Installer" plus grand (Rich Install UI)
      screenshots: [
        {
          src: '/screenshots/mobile.png',
          sizes: '1169x2531',
          type: 'image/png',
          form_factor: 'narrow',
        },
      ],
    },

    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],

      navigateFallbackDenylist: [
        /^\/api\//,
        /^\/_nuxt\//,
      ],

      runtimeCaching: [
        {
          urlPattern: ({ url }) =>
            url.pathname.startsWith('/api') &&
            !url.pathname.startsWith('/api/_nuxt'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'brc-api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24,
            },
            networkTimeoutSeconds: 5,
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'brc-images-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
        {
          urlPattern: ({ url }) =>
            url.origin === 'https://fonts.googleapis.com' ||
            url.origin === 'https://fonts.gstatic.com',
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
          },
        },
      ],
    },

    devOptions: {
      enabled: true,          // ← active le SW en dev
      type: 'module',         // ← requis avec Vite
    },

    client: {
      installPrompt: true, // Active la détection du bouton d'installation
      periodicSyncForUpdates: 3600,
    },
  },

  ui: {
    theme: {
      extend: {
        colors: {
          primary:   '#007bff',
          secondary: '#ff0000',
          brcBlue:   '#274a82',
        },
      },
    },
  },

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: '',
  },

  devtools: {
    enabled: true,
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true },
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle:  '1tbs',
      },
    },
  },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
      meta: [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'BRC Market' },
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/icons/pwa-192x192.png' },
      ]
    }
  },
  
})