<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '@/helpers/api'
import { useAuthStore } from '@/stores/auth'
import SideAdmin from '@/components/SideAdmin.vue'
import FormStaff from '@/components/FormStaff.vue'
import FormStaffDetail from '@/components/FormStaffDetail.vue'
import DeleteStaff from '@/components/DeleteStaff.vue'

const auth = useAuthStore()

// --- Loading ---
const staffLoading = ref(true)

// --- Data ---
const staffMembers = ref([])

const loadStaff = async () => {
    staffLoading.value = true
    try {
        const res = await api.get('/user/staff', {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        staffMembers.value = res.data
    } catch (e) {
        console.error('ManageStaff fetch error', e)
    } finally {
        staffLoading.value = false
    }
}

// --- Search & Filter ---
const searchQuery = ref('')

const filteredStaff = computed(() => {
    return (staffMembers.value ?? []).filter(member => {
        return (
            member.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            String(member.id).includes(searchQuery.value) ||
            member.phone?.includes(searchQuery.value)
        )
    })
})

// --- Pagination ---
const PAGE_SIZE = 10
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredStaff.value.length / PAGE_SIZE)))
const pagedStaff = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredStaff.value.slice(start, start + PAGE_SIZE)
})
const visiblePages = computed(() => {
    const total = totalPages.value
    const cur = currentPage.value
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1)
    const start = Math.min(cur, Math.max(1, total - 2))
    return [start, start + 1, start + 2].filter(p => p <= total)
})
watch(searchQuery, () => { currentPage.value = 1 })

// --- Form modal ---
const isFormOpen = ref(false)
const editTarget = ref(null)

const openAdd = () => { editTarget.value = null; isFormOpen.value = true }
const openEdit = (item) => { editTarget.value = item; isFormOpen.value = true }

// --- Detail modal (step 2 of add flow) ---
const isDetailOpen = ref(false)
const newUserId = ref(null)

const onCreated = (user) => {
    newUserId.value = user?.id ?? null
    isDetailOpen.value = true
}

const onDetailSaved = () => {
    isDetailOpen.value = false
    loadStaff()
}

// --- Delete modal ---
const isDeleteOpen = ref(false)
const deleteTarget = ref(null)

const openDelete = (item) => { deleteTarget.value = item; isDeleteOpen.value = true }

// --- onMounted ---
onMounted(() => loadStaff())
</script>

<template>
    <div
        class="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-['Inter']">
        <SideAdmin activePage="manage-staff" />

        <main class="flex-1 flex flex-col h-full overflow-hidden">
            <div class="flex-1 overflow-y-auto p-6 lg:p-10">
                <div class="max-w-7xl mx-auto flex flex-col gap-8">

                    <!-- Header -->
                    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-widest text-primary mb-1">Admin Panel</p>
                            <h1 class="text-3xl md:text-4xl font-black tracking-tight">Staff Management</h1>
                            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Manage and monitor
                                your restaurant team members</p>
                        </div>
                        <button @click="openAdd" class="btn-primary">
                            <span class="material-symbols-outlined">person_add</span>
                            Add New Staff
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
                                <input v-model="searchQuery" class="search-input"
                                    placeholder="Search name, ID or phone..." type="text" />
                            </div>
                        </div>

                        <!-- Table -->
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-sm border-collapse">
                                <thead
                                    class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px] font-semibold">
                                    <tr>
                                        <th class="px-6 py-4">Name</th>
                                        <th class="px-6 py-4">Phone Number</th>
                                        <th class="px-6 py-4">Address</th>
                                        <th class="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">

                                    <!-- Loading skeletons -->
                                    <template v-if="staffLoading">
                                        <tr v-for="n in 6" :key="n" class="animate-pulse">
                                            <td class="px-6 py-4">
                                                <div class="flex items-center gap-3">
                                                    <div
                                                        class="size-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0">
                                                    </div>
                                                    <div class="flex flex-col gap-2">
                                                        <div class="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700">
                                                        </div>
                                                        <div class="h-2.5 w-20 rounded bg-slate-100 dark:bg-slate-800">
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700"></div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="h-3 w-40 rounded bg-slate-200 dark:bg-slate-700"></div>
                                            </td>
                                            <td class="px-6 py-4 text-right">
                                                <div class="flex justify-end gap-2">
                                                    <div class="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700">
                                                    </div>
                                                    <div class="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700">
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </template>

                                    <!-- Empty state -->
                                    <tr v-else-if="pagedStaff.length === 0">
                                        <td colspan="4"
                                            class="px-6 py-20 text-center text-slate-400 dark:text-slate-500">
                                            <span class="material-symbols-outlined text-5xl mb-3 block">group_off</span>
                                            <p class="font-semibold text-base">No staff members found</p>
                                            <p class="text-sm mt-1">Try a different search or filter</p>
                                        </td>
                                    </tr>

                                    <!-- Rows -->
                                    <tr v-else v-for="member in pagedStaff" :key="member.id"
                                        class="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="size-10 rounded-full bg-primary/10 dark:bg-primary/20 shrink-0 flex items-center justify-center text-primary font-bold text-sm overflow-hidden">
                                                    <img v-if="member.avatar || member.img"
                                                        :src="member.avatar || member.img" :alt="member.name"
                                                        class="w-full h-full object-cover" />
                                                    <span v-else>{{ member.name?.charAt(0)?.toUpperCase() ?? '?'
                                                    }}</span>
                                                </div>
                                                <div>
                                                    <p class="font-bold text-slate-900 dark:text-slate-100">{{
                                                        member.username }}</p>
                                                    <p class="text-xs text-slate-400 mt-0.5">#{{ member.id }}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            {{ member.phone_number }}
                                        </td>
                                        <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            {{ member.address ?? '—' }}
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex items-center justify-end gap-1">
                                                <button @click="openEdit(member)"
                                                    class="p-2 rounded-lg transition-all text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    title="Edit">
                                                    <span class="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button @click="openDelete(member)"
                                                    class="p-2 rounded-lg transition-all text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                    title="Remove">
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
                                <span class="font-bold text-slate-900 dark:text-slate-100">{{ filteredStaff.length
                                }}</span> members
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
    <FormStaff v-model="isFormOpen" :item="editTarget" @saved="loadStaff" @created="onCreated" />

    <!-- DETAIL MODAL (step 2 of add) -->
    <FormStaffDetail v-model="isDetailOpen" :userId="newUserId" @saved="onDetailSaved" />

    <!-- DELETE MODAL -->
    <DeleteStaff v-model="isDeleteOpen" :item="deleteTarget" @deleted="loadStaff" />
</template>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>