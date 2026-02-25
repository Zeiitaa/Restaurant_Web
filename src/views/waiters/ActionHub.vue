<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// --- State ---
const auth = useAuthStore()
const appVersion = ref('v1.0.0')

// --- Timer Logic (Mulai dari 04:22:15) ---
const activeSeconds = ref(0) // 4 jam, 22 menit, 15 detik
let timerInterval = null

const formattedSessionTime = computed(() => {
    const h = Math.floor(activeSeconds.value / 3600).toString().padStart(2, '0')
    const m = Math.floor((activeSeconds.value % 3600) / 60).toString().padStart(2, '0')
    const s = (activeSeconds.value % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
})

onMounted(() => {
    timerInterval = setInterval(() => {
        activeSeconds.value++
    }, 1000)
})

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval)
})

// --- Actions / Navigation ---
const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
        console.log('Signing out...')
        auth.logout()
    }
}

const navigateTo = (destination) => {
    console.log(`Navigating to: ${destination}`)
    // Contoh penggunaan router:
    if (destination === 'new-order') router.push('/waiters/table')
    // if (destination === 'ongoing') router.push('/kitchen-status')
    // if (destination === 'payment') router.push('/checkout')
}
</script>

<template>
    <div
        class="font-['Inter'] bg-background-light_action dark:bg-background-dark_action min-h-screen flex flex-col relative overflow-hidden">

        <div
            class="fixed top-0 left-0 w-full h-1.5 bg-linear-to-r from-primary/30 via-primary to-primary/30 opacity-50 z-50">
        </div>

        <nav class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 relative z-20">
            <div class="max-w-7xl mx-auto flex justify-between items-center">
                <div class="flex items-center space-x-3">
                    <div class="bg-primary p-2 rounded-lg shadow-sm">
                        <span class="material-icons text-white text-xl">restaurant_menu</span>
                    </div>
                    <span class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">RestoKita</span>
                </div>
                <button @click="handleSignOut"
                    class="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors cursor-pointer">
                    <span class="material-icons text-lg">logout</span>
                    <span>Sign Out</span>
                </button>
            </div>
        </nav>

        <main class="grow flex flex-col items-center justify-center p-6 md:p-12 relative z-20">
            <div class="w-full max-w-7xl">

                <div class="text-center mb-10 md:mb-16">
                    <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Service Hub</h2>
                    <p class="text-slate-500 dark:text-slate-400 text-lg">Select a primary task to continue</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">

                    <button @click="navigateTo('new-order')"
                        class="action-card group relative bg-primary hover:bg-blue-600 p-8 md:p-12 rounded-3xl shadow-2xl shadow-primary/20 flex flex-col items-center justify-center text-center space-y-8 min-h-80 cursor-pointer">
                        <div class="bg-white/20 p-5 rounded-2xl group-hover:bg-white/30 transition-colors">
                            <span class="material-symbols-outlined text-white text-7xl">add_circle</span>
                        </div>
                        <div>
                            <h3 class="text-2xl md:text-3xl font-bold text-white mb-3">Create New Order</h3>
                            <p class="text-white/80 font-medium">Start a new table service</p>
                        </div>
                    </button>

                    <button @click="navigateTo('ongoing')"
                        class="action-card group relative bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-primary p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-center justify-center text-center space-y-8 min-h-80 cursor-pointer">
                        <div
                            class="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl group-hover:bg-amber-100 transition-colors">
                            <span
                                class="material-symbols-outlined text-amber-600 dark:text-amber-500 text-7xl">skillet</span>
                        </div>
                        <div>
                            <h3 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">Ongoing
                                Orders</h3>
                            <p class="text-slate-500 dark:text-slate-400 font-medium">Monitor kitchen progress</p>
                        </div>
                    </button>

                    <button @click="navigateTo('payment')"
                        class="action-card group relative bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-primary p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-center justify-center text-center space-y-8 min-h-80 cursor-pointer">
                        <div
                            class="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl group-hover:bg-emerald-100 transition-colors">
                            <span
                                class="material-symbols-outlined text-emerald-600 dark:text-emerald-500 text-7xl">account_balance_wallet</span>
                        </div>
                        <div>
                            <h3 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">Complete
                                Payment</h3>
                            <p class="text-slate-500 dark:text-slate-400 font-medium">Checkout and finalize</p>
                        </div>
                    </button>

                </div>

                <div
                    class="max-w-xl mx-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-8 py-5 flex flex-col md:flex-row items-center justify-between shadow-sm">

                    <div class="flex items-center space-x-4 mb-4 md:mb-0">
                        <div class="relative">
                            <div
                                class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                <span class="material-icons text-slate-400">person</span>
                            </div>
                            <div
                                class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full">
                            </div>
                        </div>
                        <div>
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Staff</p>
                            <p class="text-base font-bold text-slate-900 dark:text-white">{{ auth.profile.username }}
                            </p>
                        </div>
                    </div>

                    <div class="h-10 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                    <div class="flex items-center space-x-4">
                        <div class="text-right">
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Session Time</p>
                            <p class="text-base font-mono font-bold text-slate-900 dark:text-white">{{
                                formattedSessionTime }}</p>
                        </div>
                        <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span class="material-icons text-primary text-xl">timer</span>
                        </div>
                    </div>

                </div>
            </div>
        </main>

        <footer class="p-8 text-center relative z-20">
            <div
                class="inline-flex items-center space-x-2 px-4 py-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold">
                <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span>RestoKita Pro Edition • Terminal {{ appVersion }}</span>
            </div>
        </footer>

        <div class="fixed -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0">
        </div>
        <div class="fixed -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0">
        </div>

    </div>
</template>

<style scoped>
/* Scoped styles diletakkan di bagian atas pada instruksi #1, 
   tetapi jika Anda butuh scope lokal, tambahkan di sini */
</style>