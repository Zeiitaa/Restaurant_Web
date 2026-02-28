<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/helpers/api'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import SideAdmin from '@/components/SideAdmin.vue'

const auth = useAuthStore()
const menuStore = useMenuStore()

// --- State Dashboard ---
const todayDate = ref(new Date().toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' }))
const searchQuery = ref('')
const selectedCategory = ref('All Categories')

// --- API State ---
const monthlySales = ref(null)
const monthlySalesLoading = ref(true)
const topMenus = ref([])
const topMenusLoading = ref(true)
const menuLoading = ref(true)

// menuItems: dari store, sorted by daily_portion asc
const menuItems = computed(() =>
    [...(menuStore.menu ?? [])].sort((a, b) => a.daily_portion - b.daily_portion)
)

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val ?? 0)

// --- Fetch All ---
onMounted(async () => {
    const headers = { Authorization: `Bearer ${auth.token}` }

    // Monthly sales
    try {
        const res = await api.get('/orders/stats/monthly', { headers })
        monthlySales.value = res.data
    } catch (e) {
        console.error('monthly stats error', e)
    } finally {
        monthlySalesLoading.value = false
    }

    // Top menus
    try {
        const res = await api.get('/orders/stats/top-menus', { headers })
        topMenus.value = res.data
    } catch (e) {
        console.error('top-menus error', e)
    } finally {
        topMenusLoading.value = false
    }

    // Menu list — via store
    try {
        await menuStore.fetchMenu()
    } catch (e) {
        console.error('menu error', e)
    } finally {
        menuLoading.value = false
    }
})

// --- Refresh ---
const isRefreshing = ref(false)
const refreshAll = async () => {
    if (isRefreshing.value) return
    isRefreshing.value = true
    searchQuery.value = ''
    selectedCategory.value = 'All Categories'
    const headers = { Authorization: `Bearer ${auth.token}` }
    try {
        const [salesRes, topRes] = await Promise.all([
            api.get('/orders/stats/monthly', { headers }),
            api.get('/orders/stats/top-menus', { headers }),
        ])
        monthlySales.value = salesRes.data
        topMenus.value = topRes.data
    } catch (e) {
        console.error('refresh stats error', e)
    }
    try {
        await menuStore.fetchMenu()
    } catch (e) {
        console.error('refresh menu error', e)
    }
    isRefreshing.value = false
}
const categories = computed(() => {
    const cats = [...new Set(menuItems.value.map(i => i.category?.name).filter(Boolean))]
    return ['All Categories', ...cats]
})

// --- Category Color Map ---
const getCategoryClass = (cat) => {
    const palette = [
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
        'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
        'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    ]
    const idx = categories.value.indexOf(cat) - 1
    return palette[idx % palette.length] ?? 'bg-slate-100 text-slate-600'
}

// --- Status Badge ---
const getStatus = (item) => {
    if (item.status === 'outOfStock' || item.daily_portion === 0)
        return { label: 'Out of Stock', class: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' }
    if (item.daily_portion <= 2)
        return { label: 'Critical', class: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 animate-pulse' }
    if (item.daily_portion <= 5)
        return { label: 'Low Stock', class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 animate-pulse' }
    return { label: 'Available', class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' }
}

// --- Low Stock Stats ---
const lowStockItems = computed(() =>
    menuItems.value.filter(i => i.daily_portion <= 5 || i.status === 'outOfStock')
)
const lowStockCount = computed(() => lowStockItems.value.length)
const worstStockItem = computed(() => menuItems.value[0] ?? null) // already sorted asc

// --- Filter & Search ---
const filteredItems = computed(() => {
    return menuItems.value.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchCategory = selectedCategory.value === 'All Categories' || item.category?.name === selectedCategory.value
        return matchSearch && matchCategory
    })
})

</script>

<template>
    <div
        class="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-['Inter']">

        <SideAdmin activePage="dashboard" />

        <main class="flex-1 flex flex-col h-full overflow-hidden relative">
            <div class="flex-1 overflow-y-auto p-6 lg:p-10">
                <div class="max-w-7xl mx-auto flex flex-col gap-8">

                    <header class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-widest text-primary mb-1">Admin Panel</p>
                            <h1 class="text-3xl md:text-4xl font-black tracking-tight">Daily Operations</h1>
                            <p class="text-slate-400 font-medium text-sm mt-1.5">{{ todayDate }}</p>
                        </div>
                        <div class="flex gap-3">
                            <button class="btn-primary" @click="refreshAll" :disabled="isRefreshing">
                                <span class="material-symbols-outlined text-[20px]"
                                    :class="isRefreshing ? 'animate-spin' : ''">refresh</span>
                                {{ isRefreshing ? 'Refreshing...' : 'Refresh Data' }}
                            </button>
                        </div>
                    </header>

                    <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Sales Card -->
                        <div class="stat-card border-l-4 border-primary">
                            <span
                                class="material-symbols-outlined absolute top-4 right-4 text-7xl opacity-[0.07] text-primary">payments</span>
                            <div class="flex items-center gap-2 text-primary">
                                <span class="material-symbols-outlined text-[18px]">payments</span>
                                <p class="text-xs font-bold uppercase tracking-widest">Monthly Sales</p>
                            </div>
                            <div v-if="monthlySalesLoading"
                                class="mt-2 h-9 w-40 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg"></div>
                            <p v-else class="text-3xl font-black mt-2 text-slate-800 dark:text-white">
                                {{ formatIDR(monthlySales?.total_revenue)
                                }}
                            </p>
                            <p class="text-xs text-slate-400 mt-1">
                                {{ monthlySales?.total_orders }}
                                <span v-if="monthlySales?.total_orders"> orders this month</span>
                            </p>
                        </div>
                        <!-- Top Menu Card -->
                        <div class="stat-card border-l-4 border-emerald-500">
                            <span
                                class="material-symbols-outlined absolute top-4 right-4 text-7xl opacity-[0.07] text-emerald-500">emoji_food_beverage</span>
                            <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <span class="material-symbols-outlined text-[18px]">emoji_food_beverage</span>
                                <p class="text-xs font-bold uppercase tracking-widest">Top Menu</p>
                            </div>
                            <!-- Loading skeleton -->
                            <div v-if="topMenusLoading" class="mt-3 flex flex-col gap-2">
                                <div v-for="n in 3" :key="n"
                                    class="h-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                            </div>
                            <!-- Top items list -->
                            <ul v-else class="mt-3 flex flex-col gap-2">
                                <li v-for="(item, i) in topMenus.slice(0, 4)" :key="i"
                                    class="flex items-center justify-between gap-2">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <span class="text-[10px] font-black w-4 text-center"
                                            :class="i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : 'text-slate-300'">
                                            #{{ i + 1 }}
                                        </span>
                                        <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                                            {{ item.name }}
                                        </span>
                                    </div>
                                    <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                        {{ item.total_quantity }} sold
                                    </span>
                                </li>
                                <li v-if="!topMenus.length" class="text-xs text-slate-400">No data yet</li>
                            </ul>
                        </div>
                        <!-- Low Stock Card -->
                        <div class="stat-card border-l-4 border-amber-500 bg-amber-50/60 dark:bg-amber-950/20">
                            <span
                                class="material-symbols-outlined absolute top-4 right-4 text-7xl opacity-[0.07] text-amber-500">warning</span>
                            <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                <span class="material-symbols-outlined text-[18px]">warning</span>
                                <p class="text-xs font-bold uppercase tracking-widest">Low Stock Alerts</p>
                            </div>
                            <div v-if="menuLoading" class="mt-2 flex flex-col gap-2">
                                <div class="h-8 w-24 bg-amber-200/60 dark:bg-amber-900/40 animate-pulse rounded-lg">
                                </div>
                                <div class="h-3 w-36 bg-amber-200/40 animate-pulse rounded"></div>
                            </div>
                            <template v-else>
                                <p class="text-3xl font-black mt-2 text-slate-800 dark:text-white">{{ lowStockCount }}
                                    Items</p>
                                <div v-if="worstStockItem" class="mt-2 flex items-center gap-1.5">
                                    <span
                                        class="material-symbols-outlined text-[14px] text-amber-500">restaurant_menu</span>
                                    <p class="text-xs text-amber-600 dark:text-amber-400 font-semibold truncate">
                                        {{ worstStockItem.name }}
                                        <span class="font-normal text-slate-400"> — {{ worstStockItem.daily_portion }}
                                            left</span>
                                    </p>
                                </div>
                                <p v-else class="text-xs text-emerald-500 font-medium mt-1">All stocked up!</p>
                            </template>
                        </div>
                    </section>

                    <section
                        class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <!-- Toolbar -->
                        <div
                            class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div>
                                <h2 class="font-bold text-slate-800 dark:text-white">Menu Stock Overview</h2>
                                <p class="text-xs text-slate-400">{{ filteredItems.length }} items · sorted by lowest
                                    stock first</p>
                            </div>
                            <div class="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                <div class="relative w-full md:w-64">
                                    <span
                                        class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
                                    <input v-model="searchQuery" class="search-input" placeholder="Search menu..."
                                        type="text" />
                                </div>
                                <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                                    <button v-for="cat in categories" :key="cat" @click="selectedCategory = cat"
                                        :class="selectedCategory === cat
                                            ? 'bg-primary text-white shadow-sm shadow-primary/30 border-primary'
                                            : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-primary/50 hover:text-primary'"
                                        class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all">
                                        {{ cat }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-sm">
                                <thead
                                    class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th
                                            class="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Item Name</th>
                                        <th
                                            class="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Category</th>
                                        <th
                                            class="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Description</th>
                                        <th
                                            class="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                                            Price
                                        </th>
                                        <th
                                            class="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                                            Daily
                                            Portion</th>
                                        <th
                                            class="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 dark:divide-slate-700/70">
                                    <!-- Loading skeleton -->
                                    <template v-if="menuLoading">
                                        <tr v-for="n in 5" :key="n">
                                            <td class="px-6 py-4">
                                                <div class="flex items-center gap-3">
                                                    <div
                                                        class="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0">
                                                    </div>
                                                    <div class="flex flex-col gap-1.5">
                                                        <div
                                                            class="h-3 w-28 bg-slate-200 dark:bg-slate-700 animate-pulse rounded">
                                                        </div>
                                                        <div
                                                            class="h-2.5 w-14 bg-slate-100 dark:bg-slate-700/50 animate-pulse rounded">
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div
                                                    class="h-5 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-full">
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div
                                                    class="h-3 w-36 bg-slate-200 dark:bg-slate-700 animate-pulse rounded">
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 text-center">
                                                <div
                                                    class="h-3 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mx-auto">
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 text-center">
                                                <div
                                                    class="h-3 w-8 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mx-auto">
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 text-right">
                                                <div
                                                    class="h-5 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-full ml-auto">
                                                </div>
                                            </td>
                                        </tr>
                                    </template>
                                    <!-- Real rows -->
                                    <template v-else>
                                        <tr v-for="item in filteredItems" :key="item.id"
                                            class="hover:bg-blue-50/40 dark:hover:bg-slate-700/40 transition-colors"
                                            :class="item.daily_portion <= 5 || item.status === 'outOfStock' ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''">
                                            <td class="px-6 py-4">
                                                <div class="flex items-center gap-3">
                                                    <img :src="item.image" :alt="item.name"
                                                        class="h-10 w-10 rounded-xl object-cover shadow-sm shrink-0" />
                                                    <div>
                                                        <p class="font-semibold text-slate-800 dark:text-slate-100">{{
                                                            item.name }}</p>
                                                        <p class="text-xs text-slate-400">#{{ item.id }}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <span :class="getCategoryClass(item.category?.name)"
                                                    class="px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                    {{ item.category?.name }}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 max-w-45">
                                                <p class="text-xs text-slate-500 truncate">{{ item.description }}</p>
                                            </td>
                                            <td
                                                class="px-6 py-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                                                {{ formatIDR(item.price) }}
                                            </td>
                                            <td class="px-6 py-4 text-center">
                                                <span class="font-black text-base"
                                                    :class="item.daily_portion === 0 ? 'text-red-600' : item.daily_portion <= 2 ? 'text-red-500' : item.daily_portion <= 5 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-200'">
                                                    {{ item.daily_portion }}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 text-right">
                                                <span :class="getStatus(item).class"
                                                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold">
                                                    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                    {{ getStatus(item).label }}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr v-if="!filteredItems.length">
                                            <td colspan="6" class="px-6 py-12 text-center text-slate-400 text-sm">No
                                                menu items found</td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>