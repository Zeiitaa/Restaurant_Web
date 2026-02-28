<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '@/helpers/api'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { useCategoryStore } from '@/stores/category'
import SideAdmin from '@/components/SideAdmin.vue'
import AddStock from '@/components/addStock.vue'
import FormMenu from '@/components/FormMenu.vue'

const auth = useAuthStore()
const menuStore = useMenuStore()
const categoryStore = useCategoryStore()

// --- Image URL ---
const API_IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE
const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (typeof imagePath === 'string' && imagePath.startsWith('http')) return imagePath
    return `${API_IMAGE_URL}${imagePath}`
}

const formatIDR = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val ?? 0)

// --- Loading ---
const menuLoading = ref(true)

// --- Data ---
const menuItems = computed(() => menuStore.menu ?? [])

// --- Category badge colors ---
const CATEGORY_PALETTE = [
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
]
const getCategoryClass = (catName) => {
    const cats = categoryStore.category ?? []
    const idx = cats.findIndex(c => c.name === catName)
    if (idx === -1) return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
    return CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length]
}

// --- Filter categories from store ---
const filterCategories = computed(() => {
    const cats = [...new Set(menuItems.value.map(i => i.category?.name).filter(Boolean))]
    return ['All', ...cats]
})

// --- Filter & Search ---
const searchQuery = ref('')
const activeCategory = ref('All')

const filteredItems = computed(() =>
    menuItems.value.filter(item => {
        const matchSearch =
            item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            String(item.id).includes(searchQuery.value)
        const matchCat = activeCategory.value === 'All' || item.category?.name === activeCategory.value
        return matchSearch && matchCat
    })
)

// --- Pagination ---
const PAGE_SIZE = 10
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / PAGE_SIZE)))
const pagedItems = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredItems.value.slice(start, start + PAGE_SIZE)
})
const visiblePages = computed(() => {
    const total = totalPages.value
    const cur = currentPage.value
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1)
    const start = Math.min(cur, Math.max(1, total - 2))
    return [start, start + 1, start + 2].filter(p => p <= total)
})
watch([searchQuery, activeCategory], () => { currentPage.value = 1 })

// --- Stock badge ---
const getStockInfo = (portion) => {
    if (!portion || portion <= 0) return { label: 'Out of Stock', class: 'text-red-500 dark:text-red-400' }
    if (portion <= 5) return { label: 'Critical', class: 'text-red-500 dark:text-red-400' }
    if (portion <= 15) return { label: 'Low Stock', class: 'text-amber-500 dark:text-amber-400' }
    return { label: 'Available', class: 'text-emerald-600 dark:text-emerald-400' }
}

// =============================================
// ADD STOCK MODAL
// =============================================
const isStockOpen = ref(false)
const stockTarget = ref(null)

const openStock = (item) => {
    stockTarget.value = item
    isStockOpen.value = true
}

// =============================================
// DELETE MODAL
// =============================================
const isDeleteOpen = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)
const deleteError = ref('')

const openDelete = (item) => {
    deleteTarget.value = item
    deleteError.value = ''
    isDeleteOpen.value = true
}
const confirmDelete = async () => {
    deleting.value = true
    deleteError.value = ''
    try {
        await api.delete(`/menu/${deleteTarget.value.id}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        await menuStore.fetchMenu()
        isDeleteOpen.value = false
    } catch (e) {
        deleteError.value = e.response?.data?.detail ?? 'Failed to delete item.'
    } finally {
        deleting.value = false
    }
}

// =============================================
// ADD / EDIT MODAL
// =============================================
const isFormOpen = ref(false)
const editTarget = ref(null)

const openAdd = () => {
    editTarget.value = null
    isFormOpen.value = true
}
const openEdit = (item) => {
    editTarget.value = item
    isFormOpen.value = true
}

// --- onMounted ---
onMounted(async () => {
    try {
        await Promise.all([menuStore.fetchMenu(), categoryStore.fetchCategory()])
    } catch (e) {
        console.error('ManageMenu fetch error', e)
    } finally {
        menuLoading.value = false
    }
})
</script>

<template>
    <div
        class="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-['Inter']">
        <SideAdmin activePage="manage-menu" />

        <main class="flex-1 flex flex-col h-full overflow-hidden">
            <div class="flex-1 overflow-y-auto p-6 lg:p-10">
                <div class="max-w-7xl mx-auto flex flex-col gap-8">

                    <!-- Header -->
                    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-widest text-primary mb-1">Admin Panel</p>
                            <h1 class="text-3xl md:text-4xl font-black tracking-tight">Menu & Stock</h1>
                            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Monitor inventory
                                levels and manage menu offerings</p>
                        </div>
                        <button @click="openAdd" class="btn-primary">
                            <span class="material-symbols-outlined">add</span>
                            Add New Item
                        </button>
                    </header>

                    <!-- Table card -->
                    <section
                        class="flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">

                        <!-- Filters -->
                        <div
                            class="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white dark:bg-slate-800/50">
                            <div class="w-full lg:w-80 relative">
                                <span
                                    class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
                                <input v-model="searchQuery" class="search-input" placeholder="Search name or ID..."
                                    type="text" />
                            </div>
                            <div
                                class="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-x-auto w-full lg:w-auto shrink-0">
                                <button v-for="cat in filterCategories" :key="cat" @click="activeCategory = cat" :class="activeCategory === cat
                                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm font-semibold'
                                    : 'text-slate-500 dark:text-slate-400 font-medium'"
                                    class="px-4 py-1.5 rounded-md text-sm whitespace-nowrap transition-all">
                                    {{ cat }}
                                </button>
                            </div>
                        </div>

                        <!-- Table -->
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-sm border-collapse">
                                <thead
                                    class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px] font-semibold">
                                    <tr>
                                        <th class="px-6 py-4">Item</th>
                                        <th class="px-6 py-4">Category</th>
                                        <th class="px-6 py-4 text-center">Price</th>
                                        <th class="px-6 py-4 text-center">Stock</th>
                                        <th class="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">

                                    <!-- Loading skeletons -->
                                    <template v-if="menuLoading">
                                        <tr v-for="n in 6" :key="n" class="animate-pulse">
                                            <td class="px-6 py-4">
                                                <div class="flex items-center gap-4">
                                                    <div
                                                        class="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0">
                                                    </div>
                                                    <div class="flex flex-col gap-2">
                                                        <div class="h-3 w-36 rounded bg-slate-200 dark:bg-slate-700">
                                                        </div>
                                                        <div class="h-2.5 w-16 rounded bg-slate-100 dark:bg-slate-800">
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700">
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 text-center">
                                                <div class="h-3 w-20 mx-auto rounded bg-slate-200 dark:bg-slate-700">
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 text-center">
                                                <div class="flex flex-col items-center gap-1">
                                                    <div class="h-3 w-8 rounded bg-slate-200 dark:bg-slate-700">
                                                    </div>
                                                    <div class="h-2.5 w-16 rounded bg-slate-100 dark:bg-slate-800">
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 text-right">
                                                <div class="flex justify-end gap-2">
                                                    <div class="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700">
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
                                    <tr v-else-if="pagedItems.length === 0">
                                        <td colspan="5"
                                            class="px-6 py-20 text-center text-slate-400 dark:text-slate-500">
                                            <span
                                                class="material-symbols-outlined text-5xl mb-3 block">restaurant_menu</span>
                                            <p class="font-semibold text-base">No items found</p>
                                            <p class="text-sm mt-1">Try a different search or category</p>
                                        </td>
                                    </tr>

                                    <!-- Rows -->
                                    <tr v-else v-for="item in pagedItems" :key="item.id"
                                        class="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-4">
                                                <div
                                                    class="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0 shadow-sm overflow-hidden flex items-center justify-center">
                                                    <img v-if="getImageUrl(item.image)" :src="getImageUrl(item.image)"
                                                        :alt="item.name" class="h-full w-full object-cover" />
                                                    <span v-else
                                                        class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-2xl">image_not_supported</span>
                                                </div>
                                                <div>
                                                    <p class="font-bold text-slate-900 dark:text-slate-100">{{
                                                        item.name }}</p>
                                                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                        #{{ item.id }}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span :class="getCategoryClass(item.category?.name)"
                                                class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide">
                                                {{ item.category?.name ?? '—' }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-center font-bold text-slate-900 dark:text-slate-100">
                                            {{ formatIDR(item.price) }}
                                        </td>
                                        <td class="px-6 py-4 text-center">
                                            <div class="flex flex-col items-center gap-0.5">
                                                <span
                                                    :class="(!item.daily_portion || item.daily_portion <= 0) ? 'text-red-500' : 'text-slate-900 dark:text-white'"
                                                    class="font-bold">{{ item.daily_portion ?? 0 }}</span>
                                                <span :class="getStockInfo(item.daily_portion).class"
                                                    class="text-[10px] uppercase font-bold tracking-tight">
                                                    {{ getStockInfo(item.daily_portion).label }}
                                                </span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex items-center justify-end gap-1">
                                                <button @click="openStock(item)"
                                                    class="p-2 rounded-lg transition-all text-primary hover:bg-primary/10"
                                                    title="Add Stock">
                                                    <span class="material-symbols-outlined text-[20px]">add_box</span>
                                                </button>
                                                <button @click="openEdit(item)"
                                                    class="p-2 rounded-lg transition-all text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    title="Edit">
                                                    <span class="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button @click="openDelete(item)"
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
                                    filteredItems.length }}</span> items
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

    <!-- ============================================= -->
    <!-- ADD STOCK MODAL                               -->
    <!-- ============================================= -->
    <AddStock v-model="isStockOpen" :item="stockTarget" />

    <!-- ============================================= -->
    <!-- DELETE MODAL                                  -->
    <!-- ============================================= -->
    <Teleport to="body">
        <div v-if="isDeleteOpen"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div
                class="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 flex flex-col gap-5 font-['Inter']">
                <div class="flex flex-col items-center text-center gap-3">
                    <div class="size-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <span class="material-symbols-outlined text-3xl text-red-500">delete_forever</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-black text-slate-900 dark:text-white">Delete Item?</h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            <span class="font-semibold text-slate-700 dark:text-slate-200">{{
                                deleteTarget?.name }}</span>
                            will be permanently removed.
                        </p>
                    </div>
                </div>

                <p v-if="deleteError"
                    class="text-sm text-center text-red-500 font-medium bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2">
                    {{ deleteError }}</p>

                <div class="flex gap-3">
                    <button @click="isDeleteOpen = false"
                        class="flex-1 h-11 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-colors">
                        Cancel
                    </button>
                    <button @click="confirmDelete" :disabled="deleting"
                        class="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-md shadow-red-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                        {{ deleting ? 'Deleting…' : 'Delete' }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>

    <!-- ============================================= -->
    <!-- ADD / EDIT MODAL                              -->
    <!-- ============================================= -->
    <FormMenu v-model="isFormOpen" :item="editTarget" />
</template>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>