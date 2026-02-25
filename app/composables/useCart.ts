import { ref, computed } from 'vue'

interface CartItem {
  image: string
  name: string
  price: number
  quantity: number
  options?: string
}

// Reactive cart
const cartItems = ref<CartItem[]>([
  { image: '/images/publicity0.jpg', name: 'Laptop Dell XPS 15', price: 139000, quantity: 1 },
  { image: '/images/publicity1.jpg', name: 'Souris Gamer Logitech', price: 25000, quantity: 2 }
])

// Total price
const totalPrice = computed(() =>
  cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
)

// Functions
const increaseQty = (index: number) => {
  cartItems.value[index].quantity++
}

const decreaseQty = (index: number) => {
  if (cartItems.value[index].quantity > 1) cartItems.value[index].quantity--
}

export default function useCart() {
  return { cartItems, totalPrice, increaseQty, decreaseQty }
}
