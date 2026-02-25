<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useMenuStore } from '@/stores/menu';

const auth = useAuthStore()
const menuStore = useMenuStore()

const searchQuery = ref('')
const activeCategory = ref('All')
const cart = ref([])

onMounted(async () => {
    try {
        await menuStore.fetchCategory()
        await menuStore.fetchMenu()
        await menuStore.fetchMenuJoinCategory()
    } catch (error) {
        console.error('Failed to fetch menu:', error)
    }
})

const categories = computed(() => {
    const cats = menuStore.category || []
    return [{ name: 'All', icon: 'grid_view' }, ...cats.map(c => ({
        ...c,
        icon: getCategoryIcon(c.name)
    }))]
})

const getCategoryIcon = (name) => {
    const iconMap = {
        'Food': 'restaurant',
        'Drink': 'local_drink',
        'Dessert': 'icecream',
        'Snack': 'fastfood'
    }
    return iconMap[name] || 'restaurant'
}

const filteredMenu = computed(() => {
    let items = menuStore.menuJoinCategory || menuStore.menu || []

    if (activeCategory.value !== 'All') {
        items = items.filter(item => {
            // Jika sudah digabung, gunakan item.category.name
            if (item.category) return item.category.name === activeCategory.value
            // Jika belum, cari manual
            const itemCat = menuStore.category?.find(c => c.id === item.category_id || c.id === item.id_category)
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

const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price || 0)
}

const addToCart = (item) => {
    const existingItem = cart.value.find(i => i.id === item.id)
    if (existingItem) {
        existingItem.quantity++
    } else {
        cart.value.push({
            ...item,
            quantity: 1,
            orderType: 'dine-in',
            notes: ''
        })
    }
}

const updateQuantity = (index, change) => {
    const item = cart.value[index]
    if (item) {
        item.quantity += change
        if (item.quantity <= 0) {
            cart.value.splice(index, 1)
        }
    }
}

const removeFromCart = (index) => {
    cart.value.splice(index, 1)
}

const clearCart = () => {
    cart.value = []
}

const subtotal = computed(() => {
    return cart.value.reduce((acc, item) => acc + (item.price * item.quantity), 0)
})

const tax = computed(() => {
    return subtotal.value * 0.08
})

const total = computed(() => {
    return subtotal.value + tax.value
})

const sendToKitchen = () => {
    console.log('Sending order to kitchen:', cart.value)
    alert('Order successfully sent to kitchen!')
    clearCart()
}
</script>

<template>
    <div
        class="bg-background-light dark:bg-background-dark_waiters text-slate-900 dark:text-slate-100 font-['Inter'] antialiased overflow-hidden h-screen flex flex-col">

        <header
            class="h-16 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark_waiters px-6 shrink-0 z-20">
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
                    <span class="text-sm font-semibold">Table #4</span>
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
                        <p class="text-sm font-bold leading-none">Sarah Jenkins</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Waitress</p>
                    </div>
                    <div class="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-white dark:border-slate-700 shadow-sm bg-slate-300"
                        style='background-image: url("https://i.pravatar.cc/150?img=47");'></div>
                </div>
            </div>
        </header>

        <main class="flex-1 flex overflow-hidden">
            <section class="flex-1 flex flex-col bg-background-light_waiters dark:bg-surface-dark_waiters min-w-0">
                <div
                    class="sticky top-0 z-10 bg-background-light_waiters/95 dark:bg-surface-dark_waiters/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col gap-4">
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

                        <div v-for="item in filteredMenu" :key="item.id"
                            class="group relative flex flex-col bg-white dark:bg-surface-dark_waiters rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700/50">
                            <div class="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                                <div class="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                    :style="`background-image: url(${item.image});`"></div>
                                <div class="absolute top-2 right-2">
                                    <span
                                        class="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-md shadow-sm backdrop-blur-md">In
                                        Stock</span>
                                </div>
                            </div>
                            <div class="p-4 flex flex-col flex-1">
                                <div class="flex justify-between items-start gap-2 mb-2">
                                    <h3 class="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">{{
                                        item.name }}</h3>
                                    <p class="font-bold text-slate-900 dark:text-white whitespace-nowrap">{{
                                        formatPrice(item.price) }}</p>
                                </div>
                                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{{
                                    item.description }}</p>
                                <div class="mt-auto pt-2">
                                    <button @click="addToCart(item)"
                                        class="w-full h-10 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-primaryshadow-primary_waiters hover:text-white dark:hover:bg-primaryshadow-primary_waiters rounded-lg font-bold text-sm transition-colors cursor-pointer active:scale-95">
                                        <span class="material-symbols-outlined text-[20px]">add</span>
                                        Add to Order
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
                        <span class="material-symbols-outlined text-5xl mb-2">search_off</span>
                        <p>No items found for "{{ searchQuery }}"</p>
                    </div>
                </div>
            </section>

            <aside
                class="w-105 shrink-0 bg-white dark:bg-surface-dark_waiters border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-20">
                <div
                    class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-end bg-white dark:bg-surface-dark_waiters z-10">
                    <div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Current Order</h2>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Ticket #1024 • Table 4</p>
                    </div>
                    <button @click="clearCart"
                        class="text-sm text-red-500 hover:text-red-700 font-medium hover:underline px-2 py-1 rounded cursor-pointer transition-colors">
                        Clear All
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto p-4 space-y-4">
                    <div v-if="cart.length === 0"
                        class="flex flex-col items-center justify-center h-full text-slate-400">
                        <span class="material-symbols-outlined text-5xl mb-2 opacity-50">shopping_cart</span>
                        <p>No items in the order</p>
                    </div>

                    <div v-for="(item, index) in cart" :key="item.id + '_' + index"
                        class="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 transition-colors group">
                        <div class="flex gap-4 items-start">
                            <div class="w-14 h-14 rounded-lg bg-cover bg-center shrink-0 shadow-sm"
                                :style="`background-image: url(${item.image});`"></div>
                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-start">
                                    <h4 class="font-bold text-slate-900 dark:text-white text-sm leading-tight truncate">
                                        {{ item.name }}</h4>
                                    <p class="font-bold text-slate-900 dark:text-white text-sm">{{
                                        formatPrice(item.price * item.quantity) }}</p>
                                </div>
                                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{{ item.notes || 'No special requests' }}</p>
                            </div>
                        </div>

                        <div
                            class="flex items-center justify-between mt-1 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                            <div class="flex p-0.5 bg-slate-200/70 dark:bg-slate-700 rounded-lg">
                                <button @click="item.orderType = 'dine-in'" :class="[
                                    'flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer',
                                    item.orderType === 'dine-in' ? 'bg-white dark:bg-slate-600 shadow-sm text-primaryshadow-primary_waiters dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                ]">
                                    <span class="material-symbols-outlined text-[14px]">restaurant</span> DINE-IN
                                </button>
                                <button @click="item.orderType = 'takeaway'" :class="[
                                    'flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer',
                                    item.orderType === 'takeaway' ? 'bg-white dark:bg-slate-600 shadow-sm text-primaryshadow-primary_waiters dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                ]">
                                    <span class="material-symbols-outlined text-[14px]">shopping_bag</span> TAKEAWAY
                                </button>
                            </div>

                            <div class="flex items-center gap-3">
                                <div
                                    class="flex items-center gap-2 bg-white dark:bg-surface-dark_waiters rounded-md border border-slate-200 dark:border-slate-700 shadow-sm h-8 px-1">
                                    <button @click="updateQuantity(index, -1)"
                                        class="size-6 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                        <span class="material-symbols-outlined text-[16px]">remove</span>
                                    </button>
                                    <span class="text-sm font-bold w-4 text-center">{{ item.quantity }}</span>
                                    <button @click="updateQuantity(index, 1)"
                                        class="size-6 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                        <span class="material-symbols-outlined text-[16px]">add</span>
                                    </button>
                                </div>
                                <button @click="removeFromCart(index)"
                                    class="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer">
                                    <span class="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
                    <div class="space-y-2 mb-6">
                        <div class="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                            <span>Subtotal</span>
                            <span>{{ formatPrice(subtotal) }}</span>
                        </div>
                        <div class="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                            <span>Tax (8%)</span>
                            <span>{{ formatPrice(tax) }}</span>
                        </div>
                        <div
                            class="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-700 mt-2">
                            <span>Total</span>
                            <span>{{ formatPrice(total) }}</span>
                        </div>
                    </div>
                    <button @click="sendToKitchen" :disabled="cart.length === 0" :class="[
                        'w-full rounded-2xl h-16 font-extrabold text-xl shadow-xl flex items-center justify-center gap-3 transition-all group',
                        cart.length === 0
                            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'
                            : 'bg-primaryshadow-primary_waiters hover:bg-primary-dark_waiters text-white shadow-primary_waiters/30 hover:-translate-y-1 active:scale-95 cursor-pointer'
                    ]">
                        <span class="material-symbols-outlined text-2xl group-hover:animate-pulse">cooking</span>
                        SEND TO KITCHEN
                        <span
                            class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </div>
            </aside>
        </main>
    </div>
</template>