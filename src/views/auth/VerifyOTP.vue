<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import router from '@/router'

const auth = useAuthStore()
const toast = useToast()
// --- State OTP ---
// Array dengan 6 slot kosong untuk menampung masing-masing digit
const otpValues = ref(['', '', '', '', '', ''])
const inputRefs = ref([]) // Untuk menyimpan referensi elemen DOM input
const isVerifying = ref(false)

// --- State Timer Resend ---
const resendTimer = ref(59) // Mulai dari 59 detik
let timerInterval = null

// --- Format Timer (0:59) ---
const formattedTimer = computed(() => {
    const m = Math.floor(resendTimer.value / 60)
    const s = (resendTimer.value % 60).toString().padStart(2, '0')
    return `(${m}:${s})`
})

const canResend = computed(() => resendTimer.value === 0)

// --- Lifecycle & Timer Logic ---
onMounted(() => {
    startTimer()
    // Auto-focus input pertama saat halaman dimuat
    if (inputRefs.value[0]) {
        inputRefs.value[0].focus()
    }
})

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval)
})

const startTimer = () => {
    resendTimer.value = 59
    timerInterval = setInterval(() => {
        if (resendTimer.value > 0) {
            resendTimer.value--
        } else {
            clearInterval(timerInterval)
        }
    }, 1000)
}

// --- Input Handling ---
const handleInput = (index, event) => {
    const value = event.target.value

    // Hanya simpan angka terakhir yang diketik (jika user menimpa input)
    if (value.length > 0) {
        otpValues.value[index] = value.slice(-1)
    }

    // Jika ada isinya dan bukan kotak terakhir, pindah fokus ke kotak selanjutnya
    if (value && index < 5) {
        inputRefs.value[index + 1].focus()
    }
}

const handleKeydown = (index, event) => {
    // Jika tekan Backspace dan kotak saat ini kosong, pindah ke kotak sebelumnya
    if (event.key === 'Backspace' && !otpValues.value[index] && index > 0) {
        inputRefs.value[index - 1].focus()
    }
}

const handlePaste = (event) => {
    event.preventDefault()
    const pastedData = event.clipboardData.getData('text/plain').trim()

    // Pastikan data yang di-paste hanya angka
    if (/^\d+$/.test(pastedData)) {
        const digits = pastedData.slice(0, 6).split('')
        digits.forEach((digit, index) => {
            otpValues.value[index] = digit
        })

        // Pindah fokus ke kotak terakhir yang terisi
        const lastFilledIndex = Math.min(digits.length - 1, 5)
        inputRefs.value[lastFilledIndex].focus()
    }
}

// --- Actions ---
async function handleVerify() {
    const finalOtp = otpValues.value.join('')
    console.log(finalOtp);

    // Cek apakah 6 digit sudah terisi semua
    if (finalOtp.length < 6) {
        alert('Please enter all 6 digits of the OTP.')
        return
    }

    isVerifying.value = true
    console.log(`Verifying OTP: ${finalOtp}`)

    // Simulasi pemanggilan API
    try {
        await auth.verifyOTP(auth.tempEmail, finalOtp)
        alert('OTP Verification Success!')
        router.push('/reset-password')
    } catch (error) {
        toast.error(error.response?.data?.detail || "Error Verifying your OTP Code")
        console.error("error registering account", error);
        throw error
    } finally {
        setTimeout(() => {
            isVerifying.value = false

        }, 1500)
    }
}

async function handleResend() {
    if (!canResend.value) return

    console.log('Resending OTP code...')
    // Panggil API resend OTP di sini...
    try {
        await auth.forgotPassword(auth.tempEmail)
    } catch (error) {
        toast.error(error.response?.data?.detail || "Error Registering your account details")
        console.error("error registering account", error);
        throw error
    } finally {
        // Reset timer setelah berhasil resend
        startTimer()
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
        <div class="fixed -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl z-0 pointer-events-none"></div>

        <div class="w-full max-w-lg relative z-10">

            <div class="flex flex-col items-center mb-8">
                <div class="bg-primary p-3 rounded-xl mb-3 shadow-lg shadow-primary/20">
                    <span class="material-icons text-white text-3xl">restaurant_menu</span>
                </div>
                <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">RestoManage</h1>
                <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm">Forgot Password Recovery</p>
            </div>

            <div
                class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 md:p-10">

                <div class="text-center mb-8">
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white">Enter Verification Code</h2>
                    <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
                        We've sent a 6-digit code to your email.<br />
                        Please enter it below to verify your account.
                    </p>
                </div>

                <form @submit.prevent="handleVerify" class="space-y-8">

                    <div class="flex justify-between gap-2 sm:gap-4" @paste="handlePaste">
                        <input v-for="(val, index) in otpValues" :key="index" ref="inputRefs" v-model="otpValues[index]"
                            @input="handleInput(index, $event)" @keydown="handleKeydown(index, $event)" type="text"
                            inputmode="numeric" maxlength="1" pattern="[0-9]*" required
                            class="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                    </div>

                    <button type="submit" :disabled="isVerifying" :class="[
                        'w-full text-white font-semibold py-3.5 px-4 rounded-lg transition-all flex items-center justify-center space-x-2',
                        isVerifying ? 'bg-primary/70 cursor-not-allowed shadow-none' : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 active:scale-[0.98]'
                    ]">
                        <span>{{ isVerifying ? 'Verifying...' : 'Verify & Proceed' }}</span>
                        <span v-if="!isVerifying" class="material-icons text-sm">verified_user</span>
                        <span v-else class="material-icons text-sm animate-spin">sync</span>
                    </button>
                </form>

                <div class="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                    <div class="flex flex-col items-center space-y-2">
                        <p class="text-sm text-slate-500 dark:text-slate-400">
                            Didn't receive the code?
                        </p>
                        <div class="flex items-center space-x-2">
                            <button @click="handleResend" :disabled="!canResend"
                                class="text-primary font-bold hover:underline transition-all disabled:text-slate-400 disabled:no-underline">
                                Resend Code
                            </button>
                            <span v-if="!canResend" class="text-sm font-medium text-slate-400 dark:text-slate-500">
                                {{ formattedTimer }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="mt-8 flex flex-wrap justify-center gap-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
                <a href="#" @click.prevent="goBackToLogin"
                    class="hover:text-primary transition-colors flex items-center space-x-1">
                    <span class="material-icons text-xs">arrow_back</span>
                    <span>Back to Login</span>
                </a>
                <span class="text-slate-300 dark:text-slate-700">|</span>
                <a href="#" class="hover:text-primary transition-colors uppercase tracking-wider">Help Center</a>
            </div>

        </div>
    </div>
</template>