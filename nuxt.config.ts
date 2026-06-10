// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/i18n',
  ],

  i18n: {
    locales: [
      { code: 'fr', name: 'Français', flag: '🇫🇷', file: 'fr.json' },
      { code: 'en', name: 'English',  flag: '🇬🇧', file: 'en.json' },
    ],
    defaultLocale: 'fr',
    langDir: 'locales/',
    strategy: 'no_prefix',        // ← change ici
    detectBrowserLanguage: false, // ← désactive
  },

  plugins: [
    './plugin/i18n-locale.client.ts',
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      cloudinaryCloudName:    process.env.NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME    ?? '',
      cloudinaryUploadPreset: process.env.NUXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
      title: 'BRC Market - Informatique & High-Tech au Cameroun',
      meta: [
        { name: 'description',   content: 'BRC Market : Laptops, Imprimantes, Réseaux, Smartphones au meilleur prix au Cameroun. Livraison rapide à Douala, Yaoundé et dans tout le Cameroun.' },
        { name: 'keywords',      content: 'informatique cameroun, laptop cameroun, ordinateur douala, HP dell lenovo cameroun, smartphone cameroun, imprimante cameroun' },
        { name: 'author',        content: 'BRC Market' },
        { name: 'robots',        content: 'index, follow' },
        { name: 'googlebot',     content: 'index, follow' },
        { property: 'og:site_name', content: 'BRC Market' },
        { property: 'og:type',      content: 'website' },
        { property: 'og:locale',    content: 'fr_CM' },
        { name: 'twitter:card',  content: 'summary_large_image' },
        { name: 'mobile-web-app-capable',                 content: 'yes' }, // ✅ remplace apple-mobile-web-app-capable déprécié
        { name: 'apple-mobile-web-app-status-bar-style',  content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title',             content: 'BRC Market' },
        { name: 'theme-color',                            content: '#274a82' },
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/icons/pwa-192x192.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/pwa-64x64.png' },
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type':    'Store',
            name:       'BRC Market',
            url:        'https://brcmarket.cm',
            logo:       'https://brcmarket.cm/images/logos/brclogo.png',
            description: 'Meilleur site de vente informatique en ligne au Cameroun',
            address: {
              '@type':         'PostalAddress',
              addressCountry:  'CM',
              addressLocality: 'Douala',
            },
            telephone:    '+237689205751',
            contactPoint: {
              '@type':     'ContactPoint',
              contactType: 'customer service',
              telephone:   '+237689205751',
            },
          }),
        },
      ],
    },
  },

  // ✅ SSR Vercel — plus de preset static
  nitro: {
    preset: process.env.NODE_ENV === 'production' ? 'vercel' : 'node-server',

    routeRules: {
      '/':              { isr: process.env.NODE_ENV === 'production' ? 60 * 10 : false },
      '/products/**':   { isr: process.env.NODE_ENV === 'production' ? 60 * 60 : false },
      '/categories/**': { isr: process.env.NODE_ENV === 'production' ? 60 * 60 : false },
      '/boutique':      { isr: process.env.NODE_ENV === 'production' ? 60 * 5  : false },
      '/api/**':        { cache: false },
    },
  },

  icon: {
    serverBundle: {
      collections: ['heroicons', 'lucide', 'simple-icons'],
    },
    clientBundle: {
      scan: true,
      sizeLimitKb: 1024,
      includeCustomCollections: true,
    },
    fetchTimeout: 0,
    collections: ['heroicons', 'simple-icons', 'lucide'],
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name:             'BRC Market',
      short_name:       'BRC Market',
      description:      'Plateforme e-commerce BRC Market',
      theme_color:      '#274a82',
      background_color: '#ffffff',
      display:          'standalone',
      orientation:      'portrait',
      scope:            '/',
      start_url:        '/',
      lang:             'fr',
      icons: [
        { src: '/icons/pwa-64x64.png',            sizes: '64x64',   type: 'image/png' },
        { src: '/icons/pwa-192x192.png',          sizes: '192x192', type: 'image/png' },
        { src: '/icons/pwa-512x512.png',          sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icons/pwa-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
      screenshots: [
        { src: '/screenshots/mobile.png', sizes: '1169x2531', type: 'image/png', form_factor: 'narrow' },
      ],
    },

    workbox: {
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true,
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      navigateFallbackDenylist: [
        /^\/api\//,
        /^\/_nuxt\//,
      ],
      runtimeCaching: [
        {
          // ✅ API externe brcmarket → NetworkOnly, jamais mis en cache
          urlPattern: ({ url }: { url: URL }) =>
            url.hostname === 'api.brcmarket.cm',
          handler: 'NetworkOnly',  // ← corrige le ERR_FAILED
        },
        {
          // ✅ API interne Nuxt → NetworkFirst
          urlPattern: ({ url }: { url: URL }) =>
            url.pathname.startsWith('/api') && !url.pathname.startsWith('/api/_nuxt'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'brc-api-cache',
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            networkTimeoutSeconds: 5,
          },
        },
        {
          urlPattern: ({ request }: { request: Request }) => request.destination === 'image',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'brc-images-cache',
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
          },
        },
        {
          urlPattern: ({ url }: { url: URL }) =>
            url.origin === 'https://fonts.googleapis.com' ||
            url.origin === 'https://fonts.gstatic.com',
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
          },
        },
      ],
    },
    devOptions: { enabled: true, type: 'module' },
    client: { installPrompt: true, periodicSyncForUpdates: 3600 },
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
    fallback:   'light',
    classSuffix: '',
  },

  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs',
      },
    },
  },
})