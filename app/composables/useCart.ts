import { ref, computed } from 'vue'

export interface CartItem {
  id: number
  slug: string
  image: string
  name: string
  price: number
  quantity: number
  options?: string
}

// ── État global singleton (partagé dans toute l'app) ──────────────────────────
const cartItems  = ref<CartItem[]>([])
const isCartOpen = ref(false)

// ── Computed ──────────────────────────────────────────────────────────────────
const totalPrice = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const totalItems = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
)

// ── Actions ───────────────────────────────────────────────────────────────────
const addToCart = (product: Omit<CartItem, 'quantity'>) => {
  const existing = cartItems.value.find(item => item.id === product.id)
  if (existing) {
    existing.quantity++
  } else {
    cartItems.value.push({ ...product, quantity: 1 })
  }
  isCartOpen.value = true  // ouvre le drawer automatiquement
}

const increaseQty = (index: number) => {
  cartItems.value[index].quantity++
}

const decreaseQty = (index: number) => {
  if (cartItems.value[index].quantity > 1) {
    cartItems.value[index].quantity--
  } else {
    cartItems.value.splice(index, 1)  // retire si quantité = 0
  }
}

const removeItem = (index: number) => {
  cartItems.value.splice(index, 1)
}

const clearCart = () => {
  cartItems.value = []
}

export default function useCart() {
  return {
    cartItems,
    totalPrice,
    totalItems,
    isCartOpen,
    addToCart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
  }
}