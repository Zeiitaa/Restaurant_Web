<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import router from '@/router';

const toast = useToast()
const auth = useAuthStore()

// --- State ---
const form = reactive({
    email: ''
})
const isLoading = ref(false)

// function
async function handleResetPassword() {
    // Regex for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!form.email) {
        toast.error("Please enter your email address")
        return
    }

    if (!emailRegex.test(form.email)) {
        toast.error("Please enter a valid email address (e.g. name@restaurant.com)")
        return
    }

    isLoading.value = true

    // hit
    try {
        await auth.forgotPassword(form.email)
        toast.success("Reset code has been sent to your email!")
        auth.tempEmail = form.email
        router.push('/verify-otp')
    } catch (error) {
        // Error already handled in store, but we can add specific handling here if needed
        console.error("Forgot password error:", error);
    } finally {
        isLoading.value = false
    }
}

const goBackToLogin = () => {
    auth.logout()
}
</script>

<template>
    <div
        class="font-['Inter'] bg-background-light_action dark:bg-background-dark_action min-h-screen flex items-center justify-center p-6 relative overflow-hidden text-slate-900 dark:text-slate-50 antialiased">

        <div class="fixed top-0 left-0 w-full h-1 bg-linear-to-r from-primary/10 via-primary/40 to-primary/10 z-0">
        </div>
        <div class="fixed -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0">
        </div>
        <div class="fixed -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0">
        </div>

        <div class="w-full max-w-110 relative z-10">

            <div class="flex flex-col items-center mb-10">
                <div
                    class="w-14 h-14 bg-primary flex items-center justify-center rounded-2xl shadow-xl shadow-primary/25 mb-4">
                    <span class="material-symbols-outlined text-white text-3xl">restaurant</span>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">RestoKita</h1>
                <p class="text-slate-500 dark:text-slate-400 mt-1.5 text-sm font-medium">Restaurant Administration
                    System</p>
            </div>

            <div
                class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-200/60 dark:shadow-none p-8 sm:p-10">

                <div class="text-center mb-8">
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white">Forgot Password</h2>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                        Enter the email address associated with your account and we'll send you a reset code.
                    </p>
                </div>

                <form @submit.prevent="handleResetPassword" class="space-y-6">
                    <div class="space-y-2.5">
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200" for="email">
                            Email Address
                        </label>
                        <div class="relative group">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span
                                    class="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-xl">mail</span>
                            </div>
                            <input v-model="form.email" id="email" type="email" required
                                placeholder="name@restaurant.com"
                                class="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                        </div>
                    </div>

                    <button type="submit" :disabled="isLoading" :class="[
                        'w-full text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2',
                        isLoading ? 'bg-primary/70 cursor-not-allowed shadow-none' : 'bg-primary hover:bg-primary/90 shadow-primary/25 active:scale-[0.98] cursor-pointer'
                    ]">
                        <span>{{ isLoading ? 'Sending...' : 'Send Reset Code' }}</span>
                        <span v-if="!isLoading" class="material-symbols-outlined text-[20px]">arrow_forward</span>
                        <span v-else class="material-symbols-outlined text-[20px] animate-spin">sync</span>
                    </button>
                </form>

                <div class="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                    <a href="#" @click.prevent="goBackToLogin"
                        class="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors group cursor-pointer">
                        <span
                            class="material-symbols-outlined text-[18px] mr-1.5 transition-transform group-hover:-translate-x-1">arrow_back</span>
                        Back to Login
                    </a>
                </div>

            </div>

            <div
                class="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                <a href="#" class="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" class="hover:text-primary transition-colors">Terms of Use</a>
                <a href="#" class="hover:text-primary transition-colors">Support</a>
            </div>

        </div>
    </div>
</template>

<style scoped>
/* Pastikan material symbols di-load dengan benar di environment Vue Anda */
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>