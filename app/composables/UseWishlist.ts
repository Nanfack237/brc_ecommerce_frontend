import { ref, computed } from 'vue'
import axios from 'axios'

// ── État global singleton ─────────────────────────────────────────────────────
const wishlistIds = ref<Set<number>>(new Set())
const loading     = ref(false)
let   initialized = false

export const useWishlist = () => {
  const { token, isLoggedIn } = useAuth()
  const toast  = useToast()
  const config = useRuntimeConfig()
  const { t }  = useI18n()
  const API    = config.public.apiBase

  const authHeaders = computed(() => ({ Authorization: `Bearer ${token.value}` }))

  // ── Charger les IDs une seule fois par session ──────────────────────────────
  const initWishlist = async () => {
    if (initialized || !isLoggedIn?.value) return
    initialized = true
    try {
      const { data } = await axios.get(`${API}/wishlist`, { headers: authHeaders.value })
      const items: { id: number }[] = data.data ?? data
      wishlistIds.value = new Set(items.map(i => i.id))
    } catch {
      // non connecté ou erreur réseau — silencieux
    }
  }

  // ── Vérifie si un produit est en favori ────────────────────────────────────
  const isFav = (productId: number): boolean => wishlistIds.value.has(productId)

  // ── Toggle favori ──────────────────────────────────────────────────────────
  const toggleWishlist = async (productId: number, productName?: string) => {
    if (!isLoggedIn?.value) {
      toast.add({
        title: t('wishlist.login_required_title'),
        description: t('wishlist.login_required_desc'),
        color: 'warning',
        icon: 'i-heroicons-user-circle',
      })
      return
    }

    const wasIn = isFav(productId)

    // Optimistic update
    const newSet = new Set(wishlistIds.value)
    wasIn ? newSet.delete(productId) : newSet.add(productId)
    wishlistIds.value = newSet

    try {
      if (wasIn) {
        await axios.delete(`${API}/wishlist/${productId}`, { headers: authHeaders.value })
        toast.add({
          title: t('wishlist.removed_title'),
          description: productName ? t('wishlist.removed_desc', { name: productName }) : undefined,
          color: 'neutral',
          icon: 'i-heroicons-heart',
        })
      } else {
        await axios.post(`${API}/wishlist/${productId}`, {}, { headers: authHeaders.value })
        toast.add({
          title: t('wishlist.added_title'),
          description: productName ? t('wishlist.added_desc', { name: productName }) : undefined,
          color: 'success',
          icon: 'i-heroicons-heart-solid',
        })
      }
    } catch {
      // Rollback en cas d'erreur
      const rollback = new Set(wishlistIds.value)
      wasIn ? rollback.add(productId) : rollback.delete(productId)
      wishlistIds.value = rollback
      toast.add({
        title: t('wishlist.error_title'),
        description: t('wishlist.error_desc'),
        color: 'error',
        icon: 'i-heroicons-x-circle',
      })
    }
  }

  return { wishlistIds, isFav, toggleWishlist, initWishlist, loading }
}

export default useWishlist