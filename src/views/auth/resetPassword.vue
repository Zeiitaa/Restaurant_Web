<script setup>
import { ref, computed, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import { useToast } from 'vue-toastification'

const auth = useAuthStore()
const toast = useToast()
// --- State 

const form = reactive({
    newPassword: '',
    confirmPassword: '',
})
const showNewPassword = ref(false)
const isUpdating = ref(false)
const errorMessage = ref('')

// --- Actions ---
const toggleNewPasswordVisibility = () => {
    showNewPassword.value = !showNewPassword.value
}

const handleUpdatePassword = async () => {
    errorMessage.value = ''

    // Cek kecocokan password
    if (form.newPassword !== form.confirmPassword) {
        errorMessage.value = 'Passwords do not match. Please try again.'
        return
    }

    // Proses API
    isUpdating.value = true

    try {
        await auth.resetPassword(auth.token_reset, form.confirmPassword)
        toast.success("Password updated, Try login again!")
        auth.logout()
    } catch (error) {
        toast.error(error.response?.data?.detail || "Error Reset your password")
        console.error("error reset password", error);
        throw error
    } finally {
        setTimeout(() => {
            isUpdating.value = false
            alert('Password updated successfully!')
        }, 1500)
    }
}

const goBackToLogin = () => {
    auth.logout()
}
</script>

<template>
    <div
        class="font-['Inter'] bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-6 relative overflow-hidden text-slate-900 dark:text-slate-50 antialiased">

        <div
            class="fixed top-0 left-0 w-full h-1 bg-linear-to-r from-primary/20 via-primary to-primary/20 opacity-30 z-0">
        </div>
        <div class="fixed -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl z-0 pointer-events-none">
        </div>
        <div class="fixed -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl z-0 pointer-events-none">
        </div>

        <div class="w-full max-w-md relative z-10">

            <div class="flex flex-col items-center mb-8">
                <div class="bg-primary p-3 rounded-xl mb-3 shadow-lg shadow-primary/20">
                    <span class="material-icons text-white text-3xl">restaurant_menu</span>
                </div>
                <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">RestoManage</h1>
                <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">Step 3: Create a new password</p>
            </div>

            <div
                class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 md:p-10">

                <div class="mb-8">
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white">Reset Your Password</h2>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Please choose a strong password to
                        protect your data.</p>
                </div>

                <div v-if="errorMessage"
                    class="mb-6 p-3 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-lg flex items-center space-x-2 text-red-600 dark:text-red-400">
                    <span class="material-icons text-sm">error_outline</span>
                    <span class="text-xs font-semibold">{{ errorMessage }}</span>
                </div>

                <form @submit.prevent="handleUpdatePassword" class="space-y-6">

                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
                            for="new-password">
                            New Password
                        </label>
                        <div class="relative">
                            <span
                                class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">lock_reset</span>
                            <input v-model="form.newPassword" :type="showNewPassword ? 'text' : 'password'"
                                id="new-password" placeholder="••••••••" required
                                class="block w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                            <button @click="toggleNewPasswordVisibility" type="button"
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors cursor-pointer">
                                <span class="material-icons text-lg">{{ showNewPassword ? 'visibility_off' :
                                    'visibility' }}</span>
                            </button>
                        </div>


                    </div>

                    <div class="space-y-2">
                        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
                            for="confirm-password">
                            Confirm New Password
                        </label>
                        <div class="relative">
                            <span
                                class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">check_circle_outline</span>
                            <input v-model="form.confirmPassword" type="password" id="confirm-password"
                                placeholder="••••••••" required
                                class="block w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                            <button type="button"
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors cursor-pointer">
                            </button>
                        </div>
                    </div>

                    <button type="submit" :disabled="isUpdating" :class="[
                        'w-full text-white font-semibold py-3.5 px-4 rounded-lg transition-all flex items-center justify-center space-x-2',
                        isUpdating ? 'bg-primary/70 cursor-not-allowed shadow-none' : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 active:scale-[0.98]'
                    ]">
                        <span>{{ isUpdating ? 'Updating...' : 'Update Password' }}</span>
                        <span v-if="!isUpdating" class="material-icons text-sm">published_with_changes</span>
                        <span v-else class="material-icons text-sm animate-spin">sync</span>
                    </button>
                </form>

                <div class="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                    <a href="#" @click.prevent="goBackToLogin"
                        class="text-sm font-medium text-slate-500 hover:text-primary transition-all flex items-center justify-center group">
                        <span
                            class="material-icons text-sm mr-2 group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Back to login
                    </a>
                </div>
            </div>

            <div
                class="mt-8 flex flex-wrap justify-center gap-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
                <a href="#" class="hover:text-primary transition-colors uppercase tracking-wider">Security Policy</a>
                <a href="#" class="hover:text-primary transition-colors uppercase tracking-wider">Support</a>
            </div>

        </div>
    </div>
</template>