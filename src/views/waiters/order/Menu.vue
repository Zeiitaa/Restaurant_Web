<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useMenuStore } from '@/stores/menu';
import { useCategoryStore } from '@/stores/category';
import { useCartStore } from '@/stores/cart';
import { useTableStore } from '@/stores/table';
import { useRoute } from 'vue-router';
import CardDetailOrder from '@/components/cardDetailOrder.vue';
import MenuCard from '@/components/MenuCard.vue';
import OrderSidebar from '@/components/OrderSidebar.vue';
import router from '@/router';

const auth = useAuthStore()
const menuStore = useMenuStore()
const categoryStore = useCategoryStore()
const cartStore = useCartStore()
const tableStore = useTableStore()
const route = useRoute()

const tableCode = ref(route.params.tableCode || '')
const tableId = ref(null)
const searchQuery = ref('')
const activeCategory = ref('All')

// --- Modal State ---
const isModalOpen = ref(false)
const isSuccessModalOpen = ref(false)
const isGuestModalOpen = ref(false)
const isLoading = ref(false)
const selectedItem = ref(null)

// --- Guest Info ---
const guestName = ref('')
const discount = ref(0)

onMounted(async () => {
    console.log(auth.profile.id);
    try {
        await categoryStore.fetchCategory()
        await menuStore.fetchMenu()

        // Get Table ID from Table Code
        if (tableCode.value) {
            const table = await tableStore.fetchTableById(tableCode.value)
            if (table) tableId.value = table.id
        }
    } catch (error) {
        console.error('Failed to fetch menu:', error)
    }
})

const categories = computed(() => {
    const cats = categoryStore.category || []
    return [{ name: 'All', icon: 'grid_view' }, ...cats.map(c => ({
        ...c,
        icon: getCategoryIcon(c.name)
    }))]
})

const getCategoryIcon = (name) => {
    const iconMap = {
        'Food': 'restaurant',
        'Makanan': 'restaurant',
        'Drink': 'local_drink',
        'Minuman': 'local_drink',
        'Dessert': 'icecream',
        'Snack': 'fastfood'
    }
    return iconMap[name] || 'restaurant'
}

const filteredMenu = computed(() => {
    let items = menuStore.menu || []

    if (activeCategory.value !== 'All') {
        items = items.filter(item => {
            if (item.category && item.category.name) {
                return item.category.name === activeCategory.value
            }
            const itemCat = categoryStore.category?.find(c => c.id === item.category_id || c.id === item.id_category)
            return itemCat?.name === activeCategory.value
        })
    }

    if (searchQuery.value) {
        items = items.filter(item =>
            item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            item.id.toString().includes(searchQuery.value)
        )
    }

    return items
})

const API_IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE || 'http://localhost:8000/storage/'

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

// --- Modal Methods ---
const openModal = (item) => {
    selectedItem.value = item
    isModalOpen.value = true
}

const closeModal = () => {
    isModalOpen.value = false
    selectedItem.value = null
}

const handleAddToCartFromModal = (data) => {
    cartStore.addToCart(data)
    closeModal()
}

const sendToKitchen = () => {
    if (cartStore.items.length === 0) return
    isGuestModalOpen.value = true
}

const confirmOrder = async () => {
    if (!guestName.value) return

    isGuestModalOpen.value = false
    isLoading.value = true
    try {
        await cartStore.placeOrder(
            tableId.value || 0,
            auth.profile.id,
            guestName.value,
            discount.value
        )
        isSuccessModalOpen.value = true
        // Reset form
        guestName.value = ''
        discount.value = 0
    } catch (error) {
        console.error('Failed to send order:', error)
        alert('Failed to send order to kitchen. Please try again.')
    } finally {
        isLoading.value = false
    }
}

const handleSuccessAction = () => {
    isSuccessModalOpen.value = false
    router.push('/waiters')
}

const backtoTable = () => {
    isSuccessModalOpen.value = false
    router.push('/waiters/table')
}
</script>

<template>
    <div
        class="bg-background-light_action dark:bg-background-dark_action text-slate-900 dark:text-slate-100 font-['Inter'] antialiased overflow-hidden h-screen flex flex-col relative">

        <!-- Detail Order Modal -->
        <div v-if="isModalOpen"
            class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
            <CardDetailOrder :item="selectedItem" @close="closeModal" @add="handleAddToCartFromModal" />
        </div>

        <!-- Guest Information Modal -->
        <div v-if="isGuestModalOpen"
            class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
            <div
                class="bg-white dark:bg-surface-dark_waiters w-full max-w-sm rounded-4xl overflow-hidden shadow-2xl p-8 flex flex-col scale-in">
                <div class="flex items-center gap-3 mb-6">
                    <div class="size-10 bg-primary_waiters/10 rounded-full flex items-center justify-center">
                        <span class="material-symbols-outlined text-primary_waiters">person_add</span>
                    </div>
                    <h3 class="text-xl font-black text-slate-900 dark:text-white">Guest Details</h3>
                </div>

                <div class="space-y-5">
                    <div class="space-y-2">
                        <label class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Guest
                            Name</label>
                        <input v-model="guestName" type="text" placeholder="Who's ordering?"
                            class="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-primary_waiters/30 focus:bg-white dark:focus:bg-slate-900 rounded-2xl h-12 px-4 outline-none transition-all font-medium text-slate-700 dark:text-slate-200" />
                    </div>

                    <div class="space-y-2">
                        <label class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Discount
                            (%)</label>
                        <div class="relative">
                            <input v-model.number="discount" type="number" min="0" max="100" placeholder="0"
                                class="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-primary_waiters/30 focus:bg-white dark:focus:bg-slate-900 rounded-2xl h-12 px-4 pr-12 outline-none transition-all font-bold text-primary_waiters dark:text-primary_waiters" />
                            <span class="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 mt-8">
                    <button @click="isGuestModalOpen = false"
                        class="flex-1 h-12 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                        Cancel
                    </button>
                    <button @click="confirmOrder" :disabled="!guestName"
                        class="flex-2 bg-primary_waiters hover:bg-primary-dark_waiters disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl h-12 font-bold shadow-lg shadow-primary_waiters/20 transition-all active:scale-95 cursor-pointer">
                        Confirm Order
                    </button>
                </div>
            </div>
        </div>

        <!-- Success Order Modal -->
        <div v-if="isSuccessModalOpen"
            class="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
            <div
                class="bg-white dark:bg-surface-dark_waiters w-full max-w-sm rounded-4xl overflow-hidden shadow-2xl p-8 flex flex-col items-center text-center scale-in">
                <div
                    class="size-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <span
                        class="material-symbols-outlined text-4xl text-emerald-600 dark:text-emerald-400">check_circle</span>
                </div>
                <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2">Order Placed!</h3>
                <p class="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    The order has been successfully sent to the kitchen.
                </p>
                <p @click="backtoTable"
                    class="text-primary hover:cursor-pointer dark:text-primary mb-8 leading-relaxed">
                    Back to Tables
                </p>
                <button @click="handleSuccessAction"
                    class="w-full bg-primary_waiters hover:bg-primary-dark_waiters text-white rounded-2xl h-14 font-bold text-lg shadow-lg shadow-primary_waiters/30 transition-all active:scale-95 cursor-pointer">
                    Back to Service Hub
                </button>
            </div>
        </div>

        <header
            class="h-16 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark_action px-6 shrink-0 z-20">
            <div class="flex items-center gap-4">
                <div class="size-8 text-primary_waiters">
                    <svg class="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
                            fill="currentColor"></path>
                    </svg>
                </div>
                <h2 class="text-xl font-bold leading-tight tracking-tight">RestoKita</h2>
                <div
                    class="ml-8 flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                    <span class="material-symbols-outlined text-sm text-slate-500">table_restaurant</span>
                    <span class="text-sm font-semibold">Table #{{ tableCode || '--' }}</span>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <button
                    class="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                    <span class="material-symbols-outlined">notifications</span>
                    <span class="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>
                </button>
                <div class="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                    <div class="text-right hidden sm:block">
                        <p class="text-sm font-bold leading-none">{{ auth.profile?.username || 'Waiters' }}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{{
                            auth.profile?.role }}</p>
                    </div>
                    <div
                        class="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-white dark:border-slate-700 shadow-sm bg-slate-100 flex items-center justify-center">
                        <span class="material-symbols-outlined text-slate-400">person</span>
                    </div>
                </div>
            </div>
        </header>

        <main class="flex-1 flex overflow-hidden">
            <section
                class="flex-1 flex flex-col bg-background-light_action/50 dark:bg-background-dark_action/50 min-w-0">
                <div
                    class="sticky top-0 z-10 bg-background-light_action/95 dark:bg-background-dark_action/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col gap-4">
                    <div class="flex items-center justify-between gap-4">
                        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Menu</h1>
                        <div class="w-full max-w-md">
                            <label
                                class="flex items-center w-full h-10 rounded-lg bg-white dark:bg-surface-dark_waiters border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-primaryshadow-primary_waiters focus-within:border-primaryshadow-primary_waiters overflow-hidden transition-all shadow-sm">
                                <div class="grid place-items-center h-full w-12 text-slate-400">
                                    <span class="material-symbols-outlined text-[20px]">search</span>
                                </div>
                                <input v-model="searchQuery"
                                    class="peer h-full w-full outline-none text-sm text-slate-700 dark:text-slate-200 pr-2 bg-transparent placeholder-slate-400"
                                    placeholder="Search items by name or ID..." type="text" />
                            </label>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
                        <button v-for="cat in categories" :key="cat.name" @click="activeCategory = cat.name" :class="[
                            'flex items-center gap-2 px-4 py-2 rounded-full transition-transform active:scale-95 shrink-0 cursor-pointer',
                            activeCategory === cat.name
                                ? 'bg-primary_waiters text-white shadow-md shadow-primary_waiters/20 font-bold'
                                : 'bg-white dark:bg-surface-dark_waiters text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primaryshadow-primary_waiters/50 hover:text-primaryshadow-primary_waiters font-medium'
                        ]">
                            <span class="material-symbols-outlined text-[18px]">{{ cat.icon }}</span>
                            <span class="text-sm">{{ cat.name }}</span>
                        </button>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto p-6">
                    <div v-if="filteredMenu.length > 0"
                        class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">

                        <MenuCard v-for="item in filteredMenu" :key="item.id" :item="item" @open-modal="openModal" />


                    </div>
                    <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
                        <span class="material-symbols-outlined text-5xl mb-2">search_off</span>
                        <p>No items found for "{{ searchQuery }}"</p>
                    </div>
                </div>
            </section>

            <OrderSidebar :tableCode="tableCode" :loading="isLoading" @send-to-kitchen="sendToKitchen" />
        </main>
    </div>
</template>
