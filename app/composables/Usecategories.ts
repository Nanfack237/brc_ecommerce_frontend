// composables/useCategories.ts

export interface CategoryChild {
  id:             number
  name:           string
  slug:           string
  description:    string | null
  products_count: number
}

export interface Category {
  id:             number
  name:           string
  slug:           string
  description:    string | null
  image:          string | null
  is_promoted:    boolean
  products_count: number
  children:       CategoryChild[]
}

export interface CatNavLink  { label: string; to: string }
export interface CatNavGroup { label: string; slug: string; links: CatNavLink[] }

export const useCategories = () => {
  // ── État partagé via useState (Nuxt SSR-safe singleton) ──────────────────
  const categories  = useState<Category[]>('categories', () => [])
  const loadingCats = useState<boolean>('categories-loading', () => false)
  const loadedCats  = useState<boolean>('categories-loaded',  () => false)
  const errorCats   = useState<string | null>('categories-error', () => null)

  const config = useRuntimeConfig()
  const API    = config.public.apiBase

  // ── Fetch depuis GET /api/categories ─────────────────────────────────────
  const fetchCategories = async () => {
    if (loadedCats.value || loadingCats.value) return

    loadingCats.value = true
    errorCats.value   = null

    try {
      const url = `${API}/categories`
      console.log('[useCategories] GET', url)

      const res = await $fetch<any>(url)

      console.log('[useCategories] response:', JSON.stringify(res).slice(0, 400))

      // Le CategoryController retourne directement un tableau JSON
      // (response()->json($categories) sans pagination)
      let list: Category[] = []

      if (Array.isArray(res)) {
        list = res
      } else if (res && Array.isArray(res.data)) {
        list = res.data
      } else {
        console.warn('[useCategories] format inattendu:', typeof res, res)
      }

      categories.value = list
      loadedCats.value  = true

      console.log(`[useCategories] ${list.length} catégorie(s) chargée(s)`)

    } catch (err: any) {
      const msg = err?.data?.message ?? err?.message ?? 'Erreur inconnue'
      console.error('[useCategories] erreur:', msg, err)
      errorCats.value = msg
    } finally {
      loadingCats.value = false
    }
  }

  // ── Groupes de navigation ────────────────────────────────────────────────
  // CategoryController::index() retourne :
  // [{ id, name, slug, image, is_promoted, products_count, children: [...] }]
  // Les children sont déjà filtrés (activeChildren) et triés (sort_order)
  const navGroups = computed<CatNavGroup[]>(() => {
    return categories.value.map(cat => {
      const links: CatNavLink[] = []

      // Lien "Voir tout" vers la catégorie parente
      links.push({ label: 'Voir tout', to: `/categories/${cat.slug}` })

      // Sous-catégories → /categories/{child.slug}
      if (cat.children?.length) {
        cat.children.forEach(child => {
          links.push({
            label: child.name,
            to:    `/categories/${child.slug}`,
          })
        })
      }

      return { label: cat.name, slug: cat.slug, links }
    })
  })

  // ── Liste plate utile pour les autres pages ──────────────────────────────
  const allCategories = computed(() => {
    const flat: (Category | CategoryChild)[] = []
    categories.value.forEach(cat => {
      flat.push(cat)
      cat.children?.forEach(c => flat.push(c))
    })
    return flat
  })

  return {
    categories,
    navGroups,
    allCategories,
    loadingCats,
    loadedCats,
    errorCats,
    fetchCategories,
  }
}