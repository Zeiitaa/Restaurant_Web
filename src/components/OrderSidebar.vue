<script setup>
import { useCartStore } from '@/stores/cart';

const props = defineProps({
    tableCode: {
        type: String,
        default: '?'
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const cartStore = useCartStore();
const emit = defineEmits(['send-to-kitchen']);

const API_IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE

const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300x200?text=No+Image'
    if (typeof imagePath === 'string' && (imagePath.startsWith('http') || imagePath.startsWith('https'))) return imagePath
    return `${API_IMAGE_URL}${imagePath}`
}

const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price || 0)
}

const ticketNumber = Math.floor(Math.random() * 9000) + 1000;
</script>

<template>
    <aside
        class="w-105 shrink-0 bg-white dark:bg-background-dark_action border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-20">
        <div
            class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-end bg-white dark:bg-background-dark_action z-10">
            <div>
                <h2 class="text-xl font-bold text-slate-900 dark:text-white">Current Order</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight font-medium">
                    Ticket #{{ ticketNumber }} • Table {{ tableCode }}
                </p>
            </div>
            <button @click="cartStore.clearCart()"
                class="text-sm text-red-500 hover:text-red-700 font-bold hover:underline px-2 py-1 rounded cursor-pointer transition-colors">
                Clear All
            </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4 font-['Inter']">
            <div v-if="cartStore.items.length === 0"
                class="flex flex-col items-center justify-center h-full text-slate-400">
                <span class="material-symbols-outlined text-5xl mb-2 opacity-50">shopping_cart</span>
                <p>No items in the order</p>
            </div>

            <div v-for="(item, index) in cartStore.items" :key="item.id + '_' + index"
                class="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 transition-colors group">
                <div class="flex gap-4 items-start">
                    <div class="w-14 h-14 rounded-lg bg-cover bg-center shrink-0 shadow-sm"
                        :style="`background-image: url(${getImageUrl(item.image_item_url || item.image)});`">
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start">
                            <h4 class="font-bold text-slate-900 dark:text-white text-sm leading-tight truncate">
                                {{ item.name }}</h4>
                            <p class="font-black text-primary_waiters dark:text-primary_waiters text-sm">
                                {{ formatPrice(item.price * item.quantity) }}
                            </p>
                        </div>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">{{ item.notes || 'No special requests' }}</p>
                    </div>
                </div>

                <div
                    class="flex items-center justify-between mt-1 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div class="flex p-0.5 bg-slate-200/70 dark:bg-slate-700 rounded-lg">
                        <button @click="item.orderType = 'dine-in'; cartStore.saveToLocalStorage()" :class="[
                            'flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer',
                            item.orderType === 'dine-in' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary_waiters dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        ]">
                            <span class="material-symbols-outlined text-[14px]">restaurant</span> DINE-IN
                        </button>
                        <button @click="item.orderType = 'takeaway'; cartStore.saveToLocalStorage()" :class="[
                            'flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer',
                            item.orderType === 'takeaway' ? 'bg-white dark:bg-slate-600 shadow-sm text-primary_waiters dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        ]">
                            <span class="material-symbols-outlined text-[14px]">shopping_bag</span> TAKEAWAY
                        </button>
                    </div>

                    <div class="flex items-center gap-3">
                        <div
                            class="flex items-center gap-2 bg-white dark:bg-background-dark_action rounded-md border border-slate-200 dark:border-slate-700 shadow-sm h-8 px-1">
                            <button @click="cartStore.updateQuantity(index, -1)"
                                class="size-6 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                <span class="material-symbols-outlined text-[16px]">remove</span>
                            </button>
                            <span class="text-sm font-bold w-4 text-center text-slate-900 dark:text-white">{{
                                item.quantity }}</span>
                            <button @click="cartStore.updateQuantity(index, 1)"
                                class="size-6 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                <span class="material-symbols-outlined text-[16px]">add</span>
                            </button>
                        </div>
                        <button @click="cartStore.removeFromCart(index)"
                            class="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer">
                            <span class="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
            <div class="space-y-2 mb-6">
                <div class="flex justify-between text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <span>Subtotal</span>
                    <span>{{ formatPrice(cartStore.subtotal) }}</span>
                </div>
                <div class="flex justify-between text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <span>Tax (10%)</span>
                    <span>{{ formatPrice(cartStore.tax) }}</span>
                </div>
                <div
                    class="flex justify-between text-xl font-black text-slate-900 dark:text-white pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-700 mt-2">
                    <span>Total</span>
                    <span class="text-primary_waiters">{{ formatPrice(cartStore.total) }}</span>
                </div>
            </div>
            <button @click="emit('send-to-kitchen')" :disabled="cartStore.items.length === 0 || loading" :class="[
                'w-full rounded-2xl h-16 font-extrabold text-xl shadow-xl flex items-center justify-center gap-3 transition-all group relative overflow-hidden',
                cartStore.items.length === 0 || loading
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-primary_waiters hover:bg-primary-dark_waiters text-white shadow-primary_waiters/30 hover:-translate-y-1 active:scale-95 cursor-pointer'
            ]">
                <template v-if="!loading">
                    <span class="material-symbols-outlined text-2xl group-hover:animate-pulse">cooking</span>
                    SEND TO KITCHEN
                    <span
                        class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </template>
                <div v-else class="flex items-center gap-2">
                    <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    <span>SENDING...</span>
                </div>
            </button>
        </div>
    </aside>
</template>
