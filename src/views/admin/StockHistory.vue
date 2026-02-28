<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import SideAdmin from '@/components/SideAdmin.vue'
import api from '@/helpers/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

// --- API State ---
const logs = ref([])
const loading = ref(true)

onMounted(async () => {
    try {
        const res = await api.get('/upstock/', {
            headers: { Authorization: `Bearer ${auth.token}` },
        })
        logs.value = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
        console.log('[upstock] raw:', JSON.stringify(res.data))
        if (logs.value.length > 0) console.log('[upstock] first record:', logs.value[0])
    } catch (e) {
        console.error('upstock fetch error', e)
    } finally {
        loading.value = false
    }
})

// --- Search ---
const searchQuery = ref('')

const filteredLogs = computed(() =>
    logs.value.filter(log => {
        const q = searchQuery.value.toLowerCase()
        return (
            String(log.id ?? '').includes(q) ||
            (log.menu?.name ?? log.menu_name ?? log.food_name ?? '').toLowerCase().includes(q) ||
            (log.user?.username ?? log.added_by ?? '').toLowerCase().includes(q)
        )
    })
)

// --- Pagination ---
const PAGE_SIZE = 10
const currentPage = ref(1)
watch(searchQuery, () => { currentPage.value = 1 })

const totalPages = computed(() => Math.max(1, Math.ceil(filteredLogs.value.length / PAGE_SIZE)))
const pagedLogs = computed(() =>
    filteredLogs.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE)
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

        <SideAdmin activePage="stock-history" />

        <main class="flex-1 flex flex-col overflow-hidden">

            <!-- Top bar -->
            <header
                class="shrink-0 flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Stock History</h1>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Audit log of all stock additions</p>
                </div>
                <span class="text-sm text-slate-500 dark:text-slate-400">{{ new Date().toLocaleDateString('id-ID', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                }) }}</span>
            </header>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">

                <!-- Toolbar -->
                <div
                    class="flex justify-end bg-white dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div class="relative w-full lg:w-80">
                        <span
                            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                        <input v-model="searchQuery" class="search-input pl-10"
                            placeholder="Search menu, ID, added stock" type="text" />
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
                                        #</th>
                                    <th
                                        class="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Menu Item</th>
                                        <th
                                        class="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Menu Category</th>
                                    <th
                                        class="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                                        Amount Added</th>
                                    <th
                                        class="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Added By</th>
                                    <th
                                        class="px-6 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Timestamp</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">

                                <!-- Loading skeletons -->
                                <tr v-if="loading" v-for="n in 8" :key="'sk-' + n" class="animate-pulse">
                                    <td class="px-6 py-4">
                                        <div class="h-3 w-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        <div class="h-3 w-10 bg-slate-200 dark:bg-slate-700 rounded mx-auto"></div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    </td>
                                </tr>

                                <!-- Rows -->
                                <tr v-else v-for="log in pagedLogs" :key="log.id"
                                    class="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                                    <td class="px-6 py-4 text-sm font-bold text-primary">#{{ log.id }}</td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2.5">
                                            <div
                                                class="h-8 w-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                                <span class="material-symbols-outlined text-[18px]">inventory_2</span>
                                            </div>
                                            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ log.menu?.name }}</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2.5">
                                            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ log.menu?.category }}</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        <span
                                            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                            <span class="material-symbols-outlined text-[14px]">add</span>
                                            {{ log.stock_after }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-2">
                                            <div
                                                class="h-7 w-7 rounded-full bg-linear-to-br from-primary to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {{ (log.staff?.username ).charAt(0).toUpperCase()
                                                }}
                                            </div>
                                            <span class="text-sm text-slate-600 dark:text-slate-400">
                                                {{ log.staff?.username }}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                        {{ formatDate(log.date) }}
                                    </td>
                                </tr>

                                <!-- Empty -->
                                <tr v-if="!loading && filteredLogs.length === 0">
                                    <td colspan="5" class="px-6 py-14 text-center text-slate-400 dark:text-slate-500">
                                        <span class="material-symbols-outlined text-5xl block mb-3">inventory_2</span>
                                        <p class="font-semibold text-base">No stock history found</p>
                                        <p class="text-sm mt-1">Try a different search term</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Footer pagination -->
                    <div
                        class="px-6 py-3.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
                        <p class="text-sm text-slate-500 dark:text-slate-400">
                            Showing
                            <span class="font-semibold text-slate-800 dark:text-white">
                                {{ filteredLogs.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1 }}–{{
                                    Math.min(currentPage * PAGE_SIZE, filteredLogs.length) }}
                            </span>
                            of
                            <span class="font-semibold text-slate-800 dark:text-white">{{ filteredLogs.length }}</span>
                            entries
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
