<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { jwtDecode } from 'jwt-decode'
import router from '@/router'

// State variables
const auth = useAuthStore()

const form = reactive({
    Username: '',
    Password: '',
})

const rememberMe = ref(false)
const showPassword = ref(false)

// Function untuk toggle visibilitas password
const togglePassword = () => {
    showPassword.value = !showPassword.value
}

// Function untuk handle login
async function handleLogin() {
    try {
        await auth.fetchAuth(form.Username, form.Password)

        if (auth.token) {
            await auth.fetchProfile()
            console.log(auth.profile.role);

            // redirect 
            if (auth.isCustomer) {
                router.push('/customers')

            } else if (auth.isAdmin) {
                router.push('/admin')

            } else if (auth.isWaiters) {
                router.push('/waiters')
            }
        }
    } catch (error) {
        console.error("Login Error:", error);
    }
}

</script>
<template>
    <div
        class="font-display bg-background-light_action dark:bg-background-dark_action min-h-screen flex items-center justify-center p-6 relative overflow-hidden text-slate-900 dark:text-slate-50 antialiased">

        <div class="fixed top-0 left-0 w-full h-1 bg-linear-to-r from-primary/10 via-primary/40 to-primary/10 z-0">
        </div>
        <div class="fixed -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0">
        </div>
        <div class="fixed -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0">
        </div>

        <div class="w-full max-w-md relative z-10">

            <div class="flex flex-col items-center mb-8">
                <div class="bg-primary pt-2 pl-2 pr-2 pb-1 rounded-xl mb-3 shadow-lg shadow-primary/20">
                    <span class="material-icons text-white text-3xl">restaurant_menu</span>
                </div>
                <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">RestoKita</h1>
                <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">Efficient restaurant administration</p>
            </div>

            <div
                class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 md:p-10 transition-colors duration-300">
                <form @submit.prevent="handleLogin" class="space-y-6">

                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200" for="email">
                            Username
                        </label>
                        <div class="relative">
                            <span
                                class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">mail_outline</span>
                            <input v-model="form.Username"
                                class="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                id="email" placeholder="John" required />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
                                for="password">
                                Password
                            </label>
                            <RouterLink class="text-xs font-medium text-primary hover:underline transition-all"
                                to="/forgot-password">
                                Forgot Password?
                            </RouterLink>
                        </div>
                        <div class="relative">
                            <span
                                class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock_outline</span>
                            <input v-model="form.Password" :type="showPassword ? 'text' : 'password'"
                                class="block w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                id="password" placeholder="••••••••" required />
                            <button type="button" @click="togglePassword"
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <span class="material-icons text-lg">
                                    {{ showPassword ? 'visibility_off' : 'visibility' }}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div class="flex items-center">
                        <input v-model="rememberMe"
                            class="form-checkbox h-4 w-4 text-primary border-slate-300 dark:border-slate-700 rounded focus:ring-primary focus:ring-offset-0 bg-background-light dark:bg-slate-800 "
                            id="remember" type="checkbox" />
                        <label class="ml-2 block text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
                            for="remember">
                            Remember this device
                        </label>
                    </div>

                    <button
                        class="w-full bg-primary hover:bg-primary/90 hover:cursor-pointer text-white font-semibold py-3.5 px-4 rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
                        type="submit">
                        <span>Sign In</span>
                        <span class="material-icons text-sm">arrow_forward</span>
                    </button>
                </form>

                <div class="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                        Don't have an account?
                        <RouterLink class="text-primary font-bold ml-1 hover:underline transition-all" to="/register">
                            Register now
                        </RouterLink>
                    </p>
                </div>
            </div>

            <div
                class="mt-8 flex flex-wrap justify-center gap-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
                <a class="hover:text-primary transition-colors uppercase tracking-wider" href="#">Privacy Policy</a>
                <a class="hover:text-primary transition-colors uppercase tracking-wider" href="#">Terms of Service</a>
                <a class="hover:text-primary transition-colors uppercase tracking-wider" href="#">Help Center</a>
            </div>
        </div>
    </div>
</template>