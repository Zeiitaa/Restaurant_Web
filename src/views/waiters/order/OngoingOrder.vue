<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTableStore } from '@/stores/table'
import api from '@/helpers/api'
import router from '@/router'

const auth = useAuthStore()
const tableStore = useTableStore()

const orders = ref([])
const isLoading = ref(false)

const fetchOngoingOrders = async () => {
    isLoading.value = true
    try {
        // Pastikan data meja sudah ada untuk mapping id -> code
        if (!tableStore.table) {
            await tableStore.fetchTable()
        }

        const res = await api.get(`/orders/preparing`, {
            headers: {
                Authorization: `Bearer ${auth.token}`
            }
        })

        // Map data dari API ke format yang digunakan template
        orders.value = res.data.map(order => {
            const tableObj = tableStore.table?.find(t => t.id === order.table_id)
            return {
                id: order.id,
                table: tableObj ? tableObj.table_code : order.table_id,
                status: order.order_status,
                items: order.details.map(detail => ({
                    qty: detail.quantity,
                    name: detail.menu?.name || 'Unknown Item',
                    notes: detail.notes,
                    time: new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }))
            }
        })
    } catch (error) {
        console.error('Failed to fetch orders:', error)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchOngoingOrders()
})

// --- Perhitungan Otomatis ---
// Menghitung total semua item (qty) yang sedang disiapkan dari semua meja
const totalPreparingItems = computed(() => {
    return orders.value.reduce((total, order) => {
        return total + order.items.reduce((sum, item) => sum + item.qty, 0)
    }, 0)
})

// --- Methods ---
const markAsServed = async (orderId, tableNumber) => {
    if (confirm(`Mark all items for Table ${tableNumber} as served?`)) {
        try {
            await api.patch(`/orders/${orderId}/status`, {
                order_status: 'served'
            }, {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            })

            // Refresh list setelah update
            await fetchOngoingOrders()
            console.log(`Table ${tableNumber} order completed!`)
        } catch (error) {
            console.error('Failed to update status:', error)
            alert('Failed to mark order as served. Please try again.')
        }
    }
}

const signOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
        auth.logout()
        router.push('/')
    }
}
</script>

<template>
    <div
        class="font-['Inter'] bg-[#f1f5f9] dark:bg-background-dark_action min-h-screen flex flex-col relative overflow-hidden text-slate-900 dark:text-white transition-colors duration-200">

        <div
            class="fixed top-0 left-0 w-full h-1.5 bg-linear-to-r from-primary/30 via-primary to-primary/30 opacity-50 z-20">
        </div>
        <div class="fixed -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none">
        </div>
        <div class="fixed -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

        <nav
            class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 top-0 z-50 relative">
            <div class="max-w-7xl mx-auto flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <div class="bg-primary p-2 rounded-lg shadow-sm flex items-center justify-center">
                        <span class="material-icons text-white text-xl">restaurant_menu</span>
                    </div>
                    <span class="text-xl font-bold tracking-tight">RestoKita</span>
                </div>
                <button @click="signOut"
                    class="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors cursor-pointer">
                    <span class="material-icons text-lg">logout</span>
                    <span>Sign Out</span>
                </button>
            </div>
        </nav>

        <main class="grow p-6 md:p-12 relative z-10">
            <div class="max-w-7xl mx-auto">

                <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <h1 class="text-3xl md:text-4xl font-extrabold mb-2">Ongoing Orders</h1>
                        <p class="text-slate-500 dark:text-slate-400 text-lg">Monitoring items currently in preparation
                        </p>
                    </div>
                    <div
                        class="flex items-center space-x-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <span class="material-symbols-outlined text-amber-500 animate-pulse">skillet</span>
                        <span class="font-semibold text-slate-700 dark:text-slate-300">{{ totalPreparingItems }} Items
                            Preparing</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">

                    <div v-if="isLoading"
                        class="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
                        <div
                            class="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4">
                        </div>
                        <p class="text-slate-500">Loading ongoing orders...</p>
                    </div>

                    <div v-else-if="orders.length === 0"
                        class="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <span
                            class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">done_all</span>
                        <h3 class="text-xl font-bold text-slate-500 dark:text-slate-400">All caught up!</h3>
                        <p class="text-slate-400 dark:text-slate-500 mt-2">No ongoing orders at the moment.</p>
                    </div>

                    <div v-for="order in orders" :key="order.id"
                        class="order-card bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">

                        <div class="grow">
                            <div class="flex items-start justify-between mb-4">
                                <div>
                                    <h2 class="text-2xl font-black leading-none">Table {{ order.table }}</h2>
                                    <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1"></p>
                                </div>
                                <span
                                    class="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider">
                                    {{ order.status }}
                                </span>
                            </div>

                            <div class="custom-scrollbar overflow-y-auto max-h-64 pr-2">
                                <ul class="space-y-4">
                                    <li v-for="(item, index) in order.items" :key="index"
                                        class="flex justify-between items-start text-slate-700 dark:text-slate-200">
                                        <div class="flex items-start space-x-3">
                                            <span
                                                class="w-6 h-6 mt-0.5 flex items-center justify-center bg-slate-100 dark:bg-slate-600 rounded text-sm font-bold shrink-0">
                                                {{ item.qty }}
                                            </span>
                                            <div>
                                                <span class="font-medium">{{ item.name }}</span>
                                                <p v-if="item.notes"
                                                    class="text-md text-slate-500 dark:text-slate-400 italic mt-0.5">
                                                    Notes: {{item.notes }}</p>
                                            </div>
                                        </div>
                                        <span class="text-xs text-slate-400 italic shrink-0 ml-4">{{ item.time }}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div class="flex flex-col justify-end">
                            <button @click="markAsServed(order.id, order.table)"
                                class="bg-primary hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex flex-col items-center justify-center space-y-2 min-w-35 cursor-pointer">
                                <span class="material-symbols-outlined text-3xl">check_circle</span>
                                <span class="text-sm">Mark as Served</span>
                            </button>
                        </div>

                    </div>
                </div>

                <div class="flex justify-center mt-12">
                    <button @click="$router.push('/waiters')"
                        class="group flex items-center space-x-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer">
                        <span class="material-icons group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span class="font-bold tracking-wide">BACK TO HUB</span>
                    </button>
                </div>
            </div>
        </main>

        <footer class="p-8 text-center mt-auto relative z-10">
            <div
                class="inline-flex items-center space-x-2 px-4 py-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold">
                <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span>RestoKita Pro Edition • Terminal v2.4.0</span>
            </div>
        </footer>
    </div>
</template>

<style scoped>
/* Icon Fonts Configuration */
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 48;
}

/* Animations */
.order-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Custom Scrollbar for inner lists */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #475569;
}
</style>