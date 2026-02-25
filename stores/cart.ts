import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as Array<{ id: number; name: string; price: number; quantity: number }>
  }),
  actions: {
    add(product: { id: number; name: string; price: number; quantity: number }) {
      const existing = this.items.find(item => item.id === product.id)
      if (existing) {
        existing.quantity += product.quantity
      } else {
        this.items.push(product)
      }
    },
    remove(productId: number) {
      this.items = this.items.filter(item => item.id !== productId)
    },
    clear() {
      this.items = []
    }
  }
})
