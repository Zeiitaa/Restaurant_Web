<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '@/helpers/api'
import { useAuthStore } from '@/stores/auth'
import { useTableStore } from '@/stores/table'
import SideAdmin from '@/components/SideAdmin.vue'
import FormTable from '@/components/FormTable.vue'
import DeleteTable from '@/components/DeleteTable.vue'

const auth = useAuthStore()
const tableStore = useTableStore()

// --- Loading ---
const tableLoading = ref(true)

// --- Data ---
const tables = computed(() => tableStore.table ?? [])

const loadTables = async () => {
    tableLoading.value = true
    try {
        await tableStore.fetchTable()
    } catch (e) {
        console.error('ManageTable fetch error', e)
    } finally {
        tableLoading.value = false
    }
}

// --- Search ---
const searchQuery = ref('')

const filteredTables = computed(() => {
    const q = searchQuery.value.toLowerCase()
    return (tables.value ?? []).filter(t =>
        String(t.table_code ?? '').toLowerCase().includes(q)
    )
})

// --- Pagination ---
const PAGE_SIZE = 10
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredTables.value.length / PAGE_SIZE)))
const pagedTables = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredTables.value.slice(start, start + PAGE_SIZE)
})
const visiblePages = computed(() => {
    const total = totalPages.value
    const cur = currentPage.value
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1)
    const start = Math.min(cur, Math.max(1, total - 2))
    return [start, start + 1, start + 2].filter(p => p <= total)
})
watch(searchQuery, () => { currentPage.value = 1 })

// --- Status helpers ---
const getStatusClass = (status) => {
    const map = {
        available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        booked: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    }
    return map[status] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
}
const getDotClass = (status) => {
    const map = { available: 'bg-emerald-500', booked: 'bg-blue-500' }
    return map[status] ?? 'bg-slate-400'
}

// --- Form modal ---
const isFormOpen = ref(false)
const editTarget = ref(null)

const openAdd = () => { editTarget.value = null; isFormOpen.value = true }
const openEdit = (item) => { editTarget.value = item; isFormOpen.value = true }

// --- Delete modal ---
const isDeleteOpen = ref(false)
const deleteTarget = ref(null)

const openDelete = (item) => { deleteTarget.value = item; isDeleteOpen.value = true }

// --- Release table (booked â†’ available) ---
const releasing = ref(null)

const releaseTable = async (table) => {
    releasing.value = table.table_code
    try {
        await api.patch(`/table/${table.table_code}`, {status: 'available'}, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        await loadTables()
    } catch (e) {
        console.error('Release table error', e)
    } finally {
        releasing.value = null
    }
}



// --- onMounted ---
onMounted(() => loadTables())
</script>

<template>
    <div
        class="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-['Inter']">
        <SideAdmin activePage="manage-table" />

        <main class="flex-1 flex flex-col h-full overflow-hidden">
            <div class="flex-1 overflow-y-auto p-6 lg:p-10">
                <div class="max-w-7xl mx-auto flex flex-col gap-8">

                    <!-- Header -->
                    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-widest text-primary mb-1">Admin Panel</p>
                            <h1 class="text-3xl md:text-4xl font-black tracking-tight">Table Management</h1>
                            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Manage restaurant
                                tables and their availability</p>
                        </div>
                        <button @click="openAdd" class="btn-primary">
                            <span class="material-symbols-outlined">table_restaurant</span>
                            Add New Table
                        </button>
                    </header>

                    <!-- Table card -->
                    <section
                        class="flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">

                        <!-- Search -->
                        <div class="p-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                            <div class="w-full lg:w-80 relative">
                                <span
                                    class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
                                <input v-model="searchQuery" class="search-input" placeholder="Search table code..."
                                    type="text" />
                            </div>
                        </div>

                        <!-- Table -->
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-sm border-collapse">
                                <thead
                                    class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px] font-semibold">
                                    <tr>
                                        <th class="px-6 py-4">Table Code</th>
                                        <th class="px-6 py-4">Capacity</th>
                                        <th class="px-6 py-4">Status</th>
                                        <th class="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">

                                    <!-- Loading skeletons -->
                                    <template v-if="tableLoading">
                                        <tr v-for="n in 6" :key="n" class="animate-pulse">
                                            <td class="px-6 py-4">
                                                <div class="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700"></div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700"></div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                            </td>
                                            <td class="px-6 py-4 text-right">
                                                <div class="flex justify-end gap-2">
                                                    <div class="h-8 w-20 rounded-lg bg-slate-200 dark:bg-slate-700">
                                                    </div>
                                                    <div class="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700">
                                                    </div>
                                                    <div class="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700">
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </template>

                                    <!-- Empty state -->
                                    <tr v-else-if="pagedTables.length === 0">
                                        <td colspan="4"
                                            class="px-6 py-20 text-center text-slate-400 dark:text-slate-500">
                                            <span
                                                class="material-symbols-outlined text-5xl mb-3 block">table_restaurant</span>
                                            <p class="font-semibold text-base">No tables found</p>
                                            <p class="text-sm mt-1">Try a different search or add a new table</p>
                                        </td>
                                    </tr>

                                    <!-- Rows -->
                                    <tr v-else v-for="table in pagedTables" :key="table.table_code"
                                        class="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">

                                        <!-- Table Code -->
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="size-10 rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0 flex items-center justify-center text-primary font-black text-sm">
                                                    {{ table.table_code }}
                                                </div>
                                            </div>
                                        </td>

                                        <!-- Capacity -->
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                <span
                                                    class="material-symbols-outlined text-[18px] text-slate-400">person</span>
                                                <span class="font-medium">{{ table.capacity }} seats</span>
                                            </div>
                                        </td>

                                        <!-- Status -->
                                        <td class="px-6 py-4">
                                            <span :class="getStatusClass(table.status)"
                                                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide">
                                                <span :class="getDotClass(table.status)"
                                                    class="w-1.5 h-1.5 rounded-full shrink-0"></span>
                                                {{ table.status }}
                                            </span>
                                        </td>

                                        <!-- Actions -->
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex items-center justify-end gap-1">
                                                <!-- Release button â€” only when booked -->
                                                <button v-if="table.status === 'booked'" @click="releaseTable(table)"
                                                    :disabled="releasing === table.table_code"
                                                    class="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                    title="Release table to available">
                                                    <span class="material-symbols-outlined text-[16px]">lock_open</span>
                                                    {{ releasing === table.table_code ? 'Releasingâ€¦' : 'Release' }}
                                                </button>

                                                <button @click="openEdit(table)"
                                                    class="p-2 rounded-lg transition-all text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    title="Edit">
                                                    <span class="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button @click="openDelete(table)"
                                                    class="p-2 rounded-lg transition-all text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                    title="Delete">
                                                    <span class="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Pagination footer -->
                        <div
                            class="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
                            <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                Showing
                                <span class="font-bold text-slate-900 dark:text-slate-100">{{
                                    filteredTables.length }}</span> tables
                            </p>
                            <div v-if="totalPages > 1" class="flex items-center gap-1">
                                <button @click="currentPage--" :disabled="currentPage === 1"
                                    class="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <span class="material-symbols-outlined text-[18px]">chevron_left</span>
                                </button>
                                <button v-for="p in visiblePages" :key="p" @click="currentPage = p"
                                    :class="p === currentPage
                                        ? 'bg-primary text-white border-primary font-bold'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'"
                                    class="min-w-9 h-9 rounded-lg border text-sm transition-colors">
                                    {{ p }}
                                </button>
                                <button @click="currentPage++" :disabled="currentPage === totalPages"
                                    class="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                    <span class="material-symbols-outlined text-[18px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    </div>

    <!-- ADD / EDIT MODAL -->
    <FormTable v-model="isFormOpen" :item="editTarget" @saved="loadTables" />

    <!-- DELETE MODAL -->
    <DeleteTable v-model="isDeleteOpen" :item="deleteTarget" @deleted="loadTables" />
</template>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
