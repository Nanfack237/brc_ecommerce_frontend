// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
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

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      concurrency: 1,
      routes: ['/', '/200.html'],
      ignore: ['/__sitemap__/style.xsl', '/sitemap.xml', '/404'],
    },
  },

  hooks: {
    async 'nitro:config'(nitroConfig) {
      try {
        const routes: string[] = []

        // ── Catégories ────────────────────────────────────────────────
        const resCat = await fetch('https://api.brcmarket.cm/api/categories')

        if (!resCat.ok) throw new Error(`API categories ${resCat.status}`)

        const text = await resCat.text()
        const categories = JSON.parse(text)

        for (const cat of categories) {
          // Route pour la catégorie parente (ex: /categories/ordinateurs)
          routes.push(`/categories/${cat.slug}`)
          
          // Routes pour les catégories enfants mis à plat (ex: /categories/laptops)
          for (const child of cat.children ?? []) {
            if (child.slug) {
              routes.push(`/categories/${child.slug}`)
            }
          }
        }

        // ── Produits ──────────────────────────────────────────────────
        let page = 1
        let lastPage = 1

        do {
          const resProd = await fetch(
            `https://api.brcmarket.cm/api/products?per_page=100&page=${page}`
          )

          if (!resProd.ok) throw new Error(`API products page ${page}: ${resProd.status}`)

          const prodText = await resProd.text()
          const data = JSON.parse(prodText)

          for (const product of data.data ?? []) {
            if (product.slug) {
              routes.push(`/products/${product.slug}`)
            }
          }

          lastPage = data.last_page ?? 1
          page++
        } while (page <= lastPage)

        nitroConfig.prerender!.routes = [
          '/',
          '/200.html',
          ...routes,
        ]

        console.log(`✅ Prerender : ${routes.length} routes générées`)

      } catch (e) {
        console.error('❌ Erreur prerender hook :', e)
        // On garde les routes par défaut si l'API est indisponible
        nitroConfig.prerender!.routes = ['/', '/200.html']
      }
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