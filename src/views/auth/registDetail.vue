<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import router from '@/router'


const toast = useToast()
const auth = useAuthStore()

// State untuk data form
const form = reactive({
    name: '',
    phone: '',
    address: '',
})
const isLoading = ref(false)


// Logic Register
async function handleRegister() {
    isLoading.value = true
    try {
        await auth.registerDetail(form.name, form.phone, form.address)
        toast.success("Account setup complete!")
        router.push('/')
    } catch (error) {
        toast.error("Failed to save account details.")
        console.error(error);
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div
        class="bg-background-light_action dark:bg-background-dark_action font-display min-h-screen flex items-center justify-center p-6 relative overflow-hidden text-slate-900 dark:text-slate-50 antialiased">

        <div class="fixed top-0 left-0 w-full h-1 bg-linear-to-r from-primary/10 via-primary/40 to-primary/10 z-0">
        </div>
        <div class="fixed -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0">
        </div>
        <div class="fixed -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0">
        </div>

        <div class="w-full max-w-125 relative z-10">

            <div class="flex flex-col items-center mb-8">
                <div
                    class="w-12 h-12 bg-primary_register flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 mb-4">
                    <span class="material-icons text-white text-2xl">restaurant</span>
                </div>
                <h1 class="text-2xl font-bold text-slate-900 dark:text-white">RestoKita</h1>
            </div>

            <div
                class="bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-8 md:p-10 transition-all duration-300">
                <div class="mb-8">
                    <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100">Finishing Your Account</h2>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Complete account setup!</p>
                </div>

                <form @submit.prevent="handleRegister" class="space-y-5">

                    <div class="space-y-1.5">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="full_name">
                            Name
                        </label>
                        <div class="relative group">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span
                                    class="material-icons text-slate-400 text-sm group-focus-within:text-primary_register transition-colors">person</span>
                            </div>
                            <input v-model="form.name"
                                class="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary_register transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                id="username" placeholder="e.g. John Doe" required type="text" />
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="phone">
                            Phone Number
                        </label>
                        <div class="relative group">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span
                                    class="material-icons text-slate-400 text-sm group-focus-within:text-primary_register transition-colors">phone</span>
                            </div>
                            <input v-model="form.phone"
                                class="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary_register transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                id="phone" placeholder="e.g. 0811223344" required type="tel" inputmode="numeric"
                                oninput="this.value = this.value.replace(/\D/g, '')" />
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="address">
                            Address
                        </label>
                        <div class="relative group">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span
                                    class="material-icons text-slate-400 text-sm group-focus-within:text-primary_register transition-colors">location_on</span>
                            </div>
                            <input v-model="form.address"
                                class="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary_register transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                id="address" placeholder="e.g. Aminah Syukur" required type="text" />
                        </div>
                    </div>

                    <button type="submit" :disabled="isLoading" :class="[
                        'w-full font-semibold py-3 rounded-lg shadow-md transition-all transform flex items-center justify-center gap-2 mt-10',
                        isLoading ? 'bg-primary_register/70 cursor-not-allowed text-white/80' : 'bg-primary_register hover:bg-primary_register/90 text-white shadow-primary/25 active:scale-[0.98] cursor-pointer'
                    ]">
                        <span>{{ isLoading ? 'Saving Details...' : 'Finalize?' }}</span>
                        <span v-if="!isLoading" class="material-icons text-sm">arrow_forward</span>
                        <span v-else class="material-icons text-sm animate-spin">sync</span>
                    </button>
                </form>
            </div>

            <div class="mt-8 text-center">
                <p class="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
                    <span class="material-icons text-xs">help_outline</span>
                    Need help setting up your account? <a
                        class="underline hover:text-slate-600 dark:hover:text-slate-300" href="#">Contact Support</a>
                </p>
            </div>
        </div>
    </div>
</template>