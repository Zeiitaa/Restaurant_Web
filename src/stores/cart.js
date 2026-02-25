import { defineStore } from "pinia";
import api from "@/helpers/api";
import { useAuthStore } from "./auth";

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: JSON.parse(localStorage.getItem("cart")) || []
    }),

    getters: {
        subtotal: (state) => {
            return state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        },
        tax: (getters) => {
            return getters.subtotal * 0.1
        },
        total: (getters) => {
            return getters.subtotal + getters.tax
        },
        cartCount: (state) => {
            return state.items.reduce((acc, item) => acc + item.quantity, 0)
        }
    },

    actions: {
        async placeOrder(tableId, guestName = 'Guest') {
            const auth = useAuthStore()
            try {
                const orderData = {
                    table_id: tableId,
                    customer_id: 1, // Default guest
                    staff_id: auth.profile?.id || 1,
                    guest_name: guestName,
                    method: "cash",
                    items: this.items.map(item => ({
                        menu_id: item.id,
                        quantity: item.quantity,
                        notes: item.notes || "",
                        order_type: item.orderType === 'dine-in' ? 'dinein' : 'takeaway'
                    })),
                    discount: 0
                }
                
                const response = await api.post('/orders/', orderData)
                if (response.data) {
                    this.clearCart()
                    return response.data
                }
            } catch (error) {
                console.error("Failed to place order:", error)
                throw error
            }
        },

        addToCart(data) {
            const { item, quantity, type, notes } = data
            const existingItem = this.items.find(i => 
                i.id === item.id && 
                i.orderType === (type || 'dine-in') && 
                i.notes === (notes || '')
            )

            if (existingItem) {
                existingItem.quantity += quantity
            } else {
                this.items.push({
                    ...item,
                    quantity: quantity,
                    orderType: type || 'dine-in',
                    notes: notes || ''
                })
            }
            this.saveToLocalStorage()
        },

        updateQuantity(index, change) {
            const item = this.items[index]
            if (item) {
                item.quantity += change
                if (item.quantity <= 0) {
                    this.items.splice(index, 1)
                }
            }
            this.saveToLocalStorage()
        },

        removeFromCart(index) {
            this.items.splice(index, 1)
            this.saveToLocalStorage()
        },

        clearCart() {
            this.items = []
            this.saveToLocalStorage()
        },

        saveToLocalStorage() {
            localStorage.setItem("cart", JSON.stringify(this.items))
        }
    }
})
