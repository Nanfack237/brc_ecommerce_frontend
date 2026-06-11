import { writeFileSync } from 'fs'

const BASE_URL = 'https://brcmarket.cm'
const API = 'https://api.brcmarket.cm/api'

async function generateSitemap() {
  const staticRoutes = [
    { loc: '/',                                priority: '1.0', changefreq: 'daily'   },
    { loc: '/boutique',                        priority: '0.9', changefreq: 'daily'   },
    { loc: '/contact',                         priority: '0.6', changefreq: 'monthly' },
    { loc: '/about-us',                        priority: '0.6', changefreq: 'monthly' },
    { loc: '/mentions-legales',                priority: '0.3', changefreq: 'monthly' },
    { loc: '/promotions',                      priority: '0.8', changefreq: 'daily'   },
    { loc: '/services/maintenance-support',    priority: '0.7', changefreq: 'monthly' },
    { loc: '/services/securite-electronique',  priority: '0.7', changefreq: 'monthly' },
    { loc: '/services/electricite-energie',    priority: '0.7', changefreq: 'monthly' },
    { loc: '/services/audit-cablage',          priority: '0.7', changefreq: 'monthly' },
  ]

  let productUrls: any[] = []
  let categoryUrls: any[] = []

  try {
    const [productRes, categoryRes] = await Promise.all([
      fetch(`${API}/products?per_page=500`),
      fetch(`${API}/categories`),
    ])

    if (!productRes.ok || !categoryRes.ok) {
      throw new Error(`API error: ${productRes.status} / ${categoryRes.status}`)
    }

    const [productData, categoryData] = await Promise.all([
      productRes.json(),
      categoryRes.json(),
    ])

    const products   = productData.data ?? []
    const categories = Array.isArray(categoryData) ? categoryData : categoryData.data ?? []

    productUrls = products.map((p: any) => ({
      loc:        `/products/${p.slug}`,
      priority:   '0.8',
      changefreq: 'weekly',
      lastmod:    p.updated_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
    }))

   categoryUrls = categories.flatMap((c: any) => {
    const parent = {
      loc:        `/categories/${c.slug}`,
      priority:   '0.7',
      changefreq: 'weekly',
    }

    const children = (c.children ?? []).map((sub: any) => ({
      loc:        `/categories/${sub.slug}`,  // ← juste le slug, sans parent
      priority:   '0.7',
      changefreq: 'weekly',
    }))

    return [parent, ...children]
  })

    console.log(`✅ API OK — ${products.length} produits, ${categories.length} catégories`)
  } catch (e) {
    console.warn('⚠️  API inaccessible:', e)
  }

  const allRoutes = [...staticRoutes, ...categoryUrls, ...productUrls]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map((r: any) => `  <url>
    <loc>${BASE_URL}${r.loc}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
    ${r.lastmod ? `<lastmod>${r.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`

  writeFileSync('public/sitemap.xml', xml, 'utf-8')
  console.log(`✅ sitemap.xml généré avec ${allRoutes.length} URLs`)
}

generateSitemap()