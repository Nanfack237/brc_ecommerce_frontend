// composables/useAuth.ts
import axios from 'axios'

export const useAuth = () => {
  const token    = useCookie<string | null>('auth_token')
  const authRole = useCookie<string | null>('auth_role')
  const authUser = useState<any>('auth_user', () => null)
  const router   = useRouter()

  // ── Configuration dynamique de l'API ─────────────────────────────────────
  const config = useRuntimeConfig()
  const API    = config.public.apiBase

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin    = computed(() => ['admin', 'user'].includes(authRole.value ?? ''))
  const isClient   = computed(() => authRole.value === 'client')
  const role       = computed(() => authRole.value ?? null)

  // ── Guard : redirige si non connecté ────────────────────────────────────
  const requireAuth = (redirectTo = '/login') => {
    if (!token.value) {
      const route = useRoute()
      router.push(`${redirectTo}?redirect=${route.fullPath}`)
      return false
    }
    return true
  }

  // ── Guard : redirige si pas admin ───────────────────────────────────────
  const requireAdmin = () => {
    if (!token.value) {
      router.push('/login')
      return false
    }
    if (!isAdmin.value) {
      router.push('/')   // client connecté → redirigé vers accueil
      return false
    }
    return true
  }
  
  const requireUserOrAdmin = (redirectTo = '/') => {
    if (!token.value) {
      router.push(`/login?redirect=${useRoute().fullPath}`)
      return false
    }
    
    // Vérifie si c'est un admin ou un user
    if (!['admin', 'user'].includes(authRole.value ?? '')) {
      router.push(redirectTo) // client → redirection accueil
      return false
    }
    
    return true
  }

  // ── Logout (axios) ───────────────────────────────────────────────────────
  const logout = async () => {
    try {
      // Utilisation de la variable API au lieu de localhost
      await axios.post(
        `${API}/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${token.value}` } }
      )
    } catch {
      // Si le token est déjà expiré côté serveur, on ignore l'erreur
    }

    // Nettoyage complet des cookies et de l'état
    token.value    = null
    authRole.value = null
    authUser.value = null

    router.push('/login')
  }

  return {
    token,
    authUser,
    authRole,
    role,
    isLoggedIn,
    isAdmin,
    isClient,
    requireAuth,
    requireAdmin,
    requireUserOrAdmin,
    logout,
  }
}