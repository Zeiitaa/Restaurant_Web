<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
    /** 'dashboard' | 'order-history' */
    activePage: {
        type: String,
        default: 'dashboard',
    },
})

const router = useRouter()
const auth = useAuthStore()

const managerName = computed(() => auth.user?.name ?? auth.user?.username ?? 'Admin')

const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
        auth.logout()
    }
}
</script>

<template>
    <aside
        class="w-72 shrink-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full overflow-y-auto relative">
        <!-- Gradient accent strip -->
        <div class="h-1 w-full bg-linear-to-r from-primary via-blue-400 to-sky-300 shrink-0"></div>

        <div class="p-6 flex flex-col gap-8 h-full">
            <!-- Brand + Profile -->
            <div class="flex gap-4 items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div
                    class="bg-linear-to-br from-primary to-blue-500 rounded-full h-12 w-12 flex items-center justify-center text-white font-bold shadow-md text-sm shrink-0 select-none">
                    {{ managerName.charAt(0).toUpperCase() }}
                </div>
                <div class="flex flex-col min-w-0">
                    <h1 class="text-sm font-bold leading-tight truncate text-slate-800 dark:text-slate-100">{{
                        managerName }}</h1>
                    <p class="text-xs text-slate-500 font-medium">Restaurant Manager</p>
                </div>
            </div>

            <!-- Nav -->
            <nav class="flex flex-col gap-1 flex-1">
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 mb-1">Main Menu</p>

                <button @click="router.push('/admin')" :class="activePage === 'dashboard' ? 'active' : ''"
                    class="nav-link">
                    <span class="material-symbols-outlined">dashboard</span>Dashboard
                </button>

                <button @click="router.push('/admin/order-history')"
                    :class="activePage === 'order-history' ? 'active' : ''" class="nav-link">
                    <span class="material-symbols-outlined">receipt_long</span>Order History
                </button>

                <button class="nav-link">
                    <span class="material-symbols-outlined">restaurant_menu</span>Menu Management
                </button>

                <button class="nav-link">
                    <span class="material-symbols-outlined">group</span>Staff
                </button>

                <button class="nav-link">
                    <span class="material-symbols-outlined">analytics</span>Reports
                </button>
            </nav>

            <!-- Bottom -->
            <div class="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                <button class="nav-link">
                    <span class="material-symbols-outlined">settings</span>Settings
                </button>
                <button @click="handleSignOut"
                    class="nav-link text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                    <span class="material-symbols-outlined">logout</span>Logout
                </button>
            </div>
        </div>
    </aside>
</template>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
