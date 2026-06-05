// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/sitemap',  // ← Ajouter pour sitemap auto
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000/api',
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
        { name: 'apple-mobile-web-app-capable',           content: 'yes' },
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

  // ✅ CHANGEMENT PRINCIPAL : plus de preset static, Vercel gère tout
  nitro: {
    preset: 'vercel',  // ← Vercel SSR natif

    // ✅ Cache ISR : pages régénérées automatiquement sans rebuild
    routeRules: {
      '/':                    { isr: 60 * 10 },        // home  → cache 10 min
      '/products/**':         { isr: 60 * 60 },        // produits → cache 1h
      '/categories/**':       { isr: 60 * 60 },        // catégories → cache 1h
      '/boutique':            { isr: 60 * 5  },        // boutique → cache 5 min
      '/api/**':              { cache: false },         // API jamais cachée
    },
  },

  // ✅ SUPPRIMÉ : le hook nitro:config qui faisait le prerender statique
  // Plus besoin — SSR génère les pages à la demande

  // ✅ Sitemap automatique — se met à jour sans rebuild
  sitemap: {
    hostname: 'https://brcmarket.cm',
    sources: ['/api/sitemap-urls'],   // endpoint à créer (voir plus bas)
    defaults: {
      changefreq: 'weekly',
      priority: 0.8,
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
      navigateFallbackDenylist: [/^\/api\//, /^\/_nuxt\//],
      runtimeCaching: [
        {
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