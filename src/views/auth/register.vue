<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import router from '@/router'


const toast = useToast()
const auth = useAuthStore()

// State untuk data form
const form = reactive({
    Username: '',
    Email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
})

// State untuk visibilitas password
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)

// Logic Register
async function handleRegister() {
    // Validasi sederhana
    if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match!")
        return
    }

    isLoading.value = true

    try {
        await auth.register(form.Username, form.Email, form.password, form.confirmPassword)
        toast.success("Account created successfully!")
        router.push('/register-detail')
    } catch (error) {
        toast.error("Registration failed. Please try again.")
        console.error(error);
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
                    <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100">Create An Account</h2>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Set up your account!</p>
                </div>

                <form @submit.prevent="handleRegister" class="space-y-5">

                    <div class="space-y-1.5">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="username">
                            Username
                        </label>
                        <div class="relative group">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span
                                    class="material-icons text-slate-400 text-sm group-focus-within:text-primary_register transition-colors">person</span>
                            </div>
                            <input v-model="form.Username"
                                class="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary_register transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                id="username" placeholder="e.g. John Doe" required type="text" />
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="email">
                            Email
                        </label>
                        <div class="relative group">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span
                                    class="material-icons text-slate-400 text-sm group-focus-within:text-primary_register transition-colors">person</span>
                            </div>
                            <input v-model="form.Email"
                                class="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary_register transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                id="email" placeholder="e.g. name@example.com" required type="email" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div class="space-y-1.5">
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300" for="password">
                                Password
                            </label>
                            <div class="relative group">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span
                                        class="material-icons text-slate-400 text-sm group-focus-within:text-primary_register transition-colors">lock</span>
                                </div>
                                <input v-model="form.password" :type="showPassword ? 'text' : 'password'"
                                    class="block w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary_register transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                    id="password" placeholder="••••••••" required />
                                <button type="button" @click="showPassword = !showPassword"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                    <span class="material-icons text-sm">{{ showPassword ? 'visibility_off' :
                                        'visibility' }}</span>
                                </button>
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                for="confirm_password">
                                Confirm Password
                            </label>
                            <div class="relative group">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span
                                        class="material-icons text-slate-400 text-sm group-focus-within:text-primary_register transition-colors">verified_user</span>
                                </div>
                                <input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                                    class="block w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary_register transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                    id="confirm_password" placeholder="••••••••" required />
                                <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                    <span class="material-icons text-sm">{{ showConfirmPassword ? 'visibility_off' :
                                        'visibility' }}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-start pt-2">
                        <div class="flex items-center h-5">
                            <input v-model="form.agreedToTerms"
                                class="h-4 w-4 text-primary_register focus:ring-primary/20 border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 cursor-pointer"
                                id="terms" required type="checkbox" />
                        </div>
                        <div class="ml-3 text-xs">
                            <label class="text-slate-500 dark:text-slate-400 cursor-pointer" for="terms">
                                I agree to the <a class="text-primary_register hover:underline font-medium"
                                    href="#">Terms of
                                    Service</a> and <a class="text-primary_register hover:underline font-medium"
                                    href="#">Privacy
                                    Policy</a>.
                            </label>
                        </div>
                    </div>

                    <button type="submit" :disabled="isLoading" :class="[
                        'w-full font-semibold py-3 rounded-lg shadow-md transition-all transform flex items-center justify-center gap-2 mt-4',
                        isLoading ? 'bg-primary_register/70 cursor-not-allowed text-white/80' : 'bg-primary_register hover:bg-primary_register/90 text-white shadow-primary/25 active:scale-[0.98] cursor-pointer'
                    ]">
                        <span>{{ isLoading ? 'Creating Account...' : 'Create Account' }}</span>
                        <span v-if="!isLoading" class="material-icons text-sm">arrow_forward</span>
                        <span v-else class="material-icons text-sm animate-spin">sync</span>
                    </button>
                </form>

                <div class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p class="text-sm text-slate-600 dark:text-slate-400">
                        Already have an account?
                        <a href="#" @click.prevent="goBackToLogin"
                            class="text-primary_register hover:text-primary_register/80 font-semibold transition-colors"
                            to="/">
                            Back to Login</a>
                    </p>
                </div>
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