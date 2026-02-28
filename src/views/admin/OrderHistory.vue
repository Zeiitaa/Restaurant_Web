<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import SideAdmin from '@/components/SideAdmin.vue'
import api from '@/helpers/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

// --- Helpers ---
const formatIDR = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount ?? 0)

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// "Ordered By" = guest_name OR customer username
const orderedByLabel = (order) =>
    order.guest_name ?? order.customer?.username ?? '—'
const orderedByInitial = (order) =>
    orderedByLabel(order).charAt(0).toUpperCase()

// "Handled By" = staff/waiter username
const handledByLabel = (order) =>
    order.staff?.username ?? '—'
const handledByInitial = (order) =>
    handledByLabel(order).charAt(0).toUpperCase()

// order_status (preparing/served/cancelled) takes priority over payment_status
const getStatusConfig = (order) => {
    if (order.order_status === 'cancelled')
        return { label: 'Cancelled', cls: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/40' }
    if (order.order_status === 'preparing')
        return { label: 'Preparing', cls: 'bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/40' }
    switch (order.payment_status) {
        case 'paid': return { label: 'Paid', cls: 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/40' }
        case 'unpaid': return { label: 'Unpaid', cls: 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/40' }
        default: return { label: order.payment_status, cls: 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' }
    }
}

// --- API State ---
const orders = ref([])
const ordersLoading = ref(true)

onMounted(async () => {
    try {
        const res = await api.get('/orders/', {
            headers: { Authorization: `Bearer ${auth.token}` },
        })
        orders.value = res.data
    } catch (e) {
        console.error('orders fetch error', e)
    } finally {
        ordersLoading.value = false
    }
})

// --- Filter States ---
const searchQuery = ref('')
const activeFilter = ref('all')
const filters = [
    { label: 'All Orders', value: 'all' },
    { label: 'Paid', value: 'paid' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Cancelled', value: 'cancelled' },
]

// --- Computed ---
const filteredOrders = computed(() =>
    orders.value.filter(order => {
        const q = searchQuery.value.toLowerCase()
        const matchSearch =
            String(order.id).includes(q) ||
            orderedByLabel(order).toLowerCase().includes(q) ||
            handledByLabel(order).toLowerCase().includes(q) ||
            String(order.table_id).includes(q)
        const matchStatus =
            activeFilter.value === 'all' ||
            (activeFilter.value === 'cancelled' && order.order_status === 'cancelled') ||
            (activeFilter.value !== 'cancelled' && order.payment_status === activeFilter.value)
        return matchSearch && matchStatus
    })
)

// --- Pagination ---
const PAGE_SIZE = 5
const currentPage = ref(1)

// Reset to page 1 whenever filter or search changes
watch([searchQuery, activeFilter], () => { currentPage.value = 1 })

const totalPages = computed(() => Math.max(1, Math.ceil(filteredOrders.value.length / PAGE_SIZE)))

const pagedOrders = computed(() =>
    filteredOrders.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE)
)

const visiblePages = computed(() => {
    const total = totalPages.value
    const cur = currentPage.value
    const start = Math.min(Math.max(1, cur), Math.max(1, total - 2))
    return Array.from({ length: Math.min(3, total) }, (_, i) => start + i)
})
</script>

<template>
    <div
        class="flex h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-['Inter'] overflow-hidden">

        <SideAdmin activePage="order-history" />

        <!-- ===== MAIN CONTENT ===== -->
        <main class="flex-1 flex flex-col overflow-hidden">

            <!-- Top bar -->
            <header
                class="shrink-0 flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Order History</h1>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Monitor and manage all historical
                        transactions</p>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-sm text-slate-500 dark:text-slate-400">{{ new Date().toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric', month: 'long', year: 'numeric'
                    }) }}</span>
                </div>
            </header>

            <!-- Content scroll area -->
            <div class="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">

                <!-- Toolbar -->
                <div
                    class="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center bg-white dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <!-- Filter pills -->
                    <div class="flex flex-wrap items-center gap-2">
                        <button v-for="f in filters" :key="f.value" @click="activeFilter = f.value" :class="activeFilter === f.value
                            ? 'bg-primary text-white shadow-sm shadow-primary/30'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'"
                            class="px-4 py-1.5 text-sm font-semibold rounded-lg transition-all">
                            {{ f.label }}
                        </button>
                    </div>
                    <!-- Search -->
                    <div class="relative w-full lg:w-80">
                        <span
                            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                        <input v-model="searchQuery" class="search-input pl-10"
                            placeholder="Search order ID, waiter, table…" type="text" />
                    </div>
                </div>

                <!-- Table card -->
                <div
                    class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-sm">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr
                                    class="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700">
                                    <th
                                        class="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Order ID</th>
                                    <th
                                        class="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Timestamp</th>
                                    <th
                                        class="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Ordered by</th>
                                    <th
                                        class="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Handled by</th>
                                    <th
                                        class="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Table</th>
                                    <th
                                        class="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Payment</th>
                                    <th
                                        class="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                                        Amount</th>
                                    <th
                                        class="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                                <!-- Loading skeletons -->
                                <tr v-if="ordersLoading" v-for="n in 6" :key="'sk-' + n">
                                    <td colspan="8" class="px-6 py-4">
                                        <div class="h-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg w-full">
                                        </div>
                                    </td>
                                </tr>

                                <tr v-else v-for="order in pagedOrders" :key="order.id"
                                    class="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                                    <td class="px-6 py-4 text-sm font-bold text-primary">#{{ order.id }}</td>
                                    <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{{
                                        formatDate(order.date) }}</td>
                                    <!-- Ordered By -->
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2.5">
                                            <div
                                                class="h-8 w-8 rounded-full bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {{ orderedByInitial(order) }}
                                            </div>
                                            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{
                                                orderedByLabel(order) }}</span>
                                        </div>
                                    </td>
                                    <!-- Handled By -->
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2.5">
                                            <div
                                                class="h-8 w-8 rounded-full bg-linear-to-br from-primary to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {{ handledByInitial(order) }}
                                            </div>
                                            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{
                                                handledByLabel(order) }}</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">Table
                                        {{ order.table_id }}</td>
                                    <td class="px-6 py-4 text-sm">
                                        <span class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                            <span class="material-symbols-outlined text-base"
                                                :class="order.method === 'qris' ? 'text-emerald-500' : 'text-blue-500'">{{
                                                    order.method === 'qris' ? 'qr_code_2' : 'payments' }}</span>
                                            <span class="uppercase font-semibold text-xs">{{ order.method }}</span>
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-sm font-bold text-slate-800 dark:text-white text-right">{{
                                        formatIDR(order.total_amount) }}</td>
                                    <td class="px-6 py-4">
                                        <span :class="getStatusConfig(order).cls"
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold">{{
                                                getStatusConfig(order).label }}</span>
                                    </td>
                                </tr>

                                <tr v-if="!ordersLoading && filteredOrders.length === 0">
                                    <td colspan="8" class="px-6 py-14 text-center text-slate-400 text-sm">
                                        No orders found matching your criteria.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Footer -->
                    <div
                        class="px-6 py-3.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
                        <p class="text-sm text-slate-500 dark:text-slate-400">
                            Showing
                            <span class="font-semibold text-slate-800 dark:text-white">
                                {{ filteredOrders.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1 }}–{{
                                    Math.min(currentPage * PAGE_SIZE, filteredOrders.length) }}
                            </span>
                            of
                            <span class="font-semibold text-slate-800 dark:text-white">{{ filteredOrders.length
                            }}</span> orders
                        </p>
                        <div class="flex gap-1.5 items-center">
                            <button @click="currentPage > 1 && currentPage--" :disabled="currentPage === 1"
                                class="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                Previous
                            </button>
                            <template v-for="p in visiblePages" :key="p">
                                <button @click="currentPage = p"
                                    :class="currentPage === p
                                        ? 'bg-primary text-white shadow-sm shadow-primary/30'
                                        : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'"
                                    class="px-3 py-1 rounded-lg text-sm font-semibold transition-colors">
                                    {{ p }}
                                </button>
                            </template>
                            <button @click="currentPage < totalPages && currentPage++"
                                :disabled="currentPage === totalPages"
                                class="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                Next
                            </button>
                        </div>
                    </div>
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