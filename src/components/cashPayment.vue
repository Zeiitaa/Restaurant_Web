<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    totalDue: {
        type: Number,
        default: 0
    },
    isOpen: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['close', 'complete'])

// --- State ---
const amountReceived = ref('0')

// --- Formatter IDR ---
const formatIDR = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value || 0)
}

// --- Logic Numpad ---
const appendNumber = (num) => {
    if (amountReceived.value === '0') {
        amountReceived.value = num.toString()
    } else {
        amountReceived.value += num.toString()
    }
}

const backspace = () => {
    if (amountReceived.value.length <= 1) {
        amountReceived.value = '0'
    } else {
        amountReceived.value = amountReceived.value.slice(0, -1)
    }
}

const clearAmount = () => {
    amountReceived.value = '0'
}

// --- Preset nominal umum ---
const presets = [10000, 20000, 50000, 100000]
const setPreset = (val) => {
    amountReceived.value = val.toString()
}

// --- Perhitungan Kembalian ---
const receivedNumber = computed(() => parseInt(amountReceived.value) || 0)

const changeToReturn = computed(() => {
    const change = receivedNumber.value - props.totalDue
    return change > 0 ? change : 0
})

const isAmountSufficient = computed(() => {
    return receivedNumber.value >= props.totalDue
})

// --- Actions ---
const handleComplete = () => {
    if (!isAmountSufficient.value) {
        alert('Uang yang diterima kurang dari total tagihan!')
        return
    }
    emit('complete', {
        totalDue: props.totalDue,
        received: receivedNumber.value,
        change: changeToReturn.value
    })
}
</script>

<template>
    <div v-if="isOpen"
        class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">

        <div
            class="bg-white dark:bg-gray-900 w-full max-w-160 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-300">

            <button @click="emit('close')"
                class="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors z-10">
                <span class="material-symbols-outlined text-3xl">close</span>
            </button>

            <div class="bg-gray-50 dark:bg-gray-800/50 p-10 text-center border-b border-gray-100 dark:border-gray-800">
                <p class="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Total
                    Tagihan</p>
                <h2 class="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                    {{ formatIDR(totalDue) }}
                </h2>
            </div>

            <div class="p-10 space-y-8">
                <div class="space-y-3">
                    <label
                        class="block text-center text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uang
                        Diterima</label>
                    <div class="relative max-w-[320px] mx-auto">
                        <input readonly
                            class="w-full text-center text-4xl font-black py-5 px-4 bg-[#359EFF]/5 dark:bg-[#359EFF]/10 border-2 border-[#359EFF] rounded-2xl text-[#359EFF] outline-none transition-all"
                            type="text" :value="formatIDR(receivedNumber)" />
                    </div>
                </div>

                <!-- Preset Nominal -->
                <div class="grid grid-cols-4 gap-2 max-w-105 mx-auto">
                    <button v-for="preset in presets" :key="preset" @click="setPreset(preset)"
                        class="py-2 px-1 text-xs font-bold bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-[#359EFF]/10 hover:text-[#359EFF] transition-all cursor-pointer">
                        {{ formatIDR(preset) }}
                    </button>
                </div>

                <div class="grid grid-cols-3 gap-2 max-w-100 mx-auto">
                    <button v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="n" @click="appendNumber(n)"
                        class="h-14 bg-gray-50 dark:bg-gray-800 dark:text-white font-bold text-xl rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all cursor-pointer">{{
                        n }}</button>
                    <button @click="clearAmount"
                        class="h-14 bg-red-50 dark:bg-red-900/20 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all uppercase cursor-pointer">Clear</button>
                    <button @click="appendNumber(0)"
                        class="h-14 bg-gray-50 dark:bg-gray-800 dark:text-white font-bold text-xl rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all cursor-pointer">0</button>
                    <button @click="backspace"
                        class="h-14 bg-gray-50 dark:bg-gray-800 dark:text-white font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all cursor-pointer flex items-center justify-center">
                        <span class="material-symbols-outlined">backspace</span>
                    </button>
                </div>

                <div :class="[
                    'rounded-2xl p-6 text-center border transition-colors',
                    isAmountSufficient ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/50' : 'bg-gray-50 dark:bg-gray-800 border-transparent'
                ]">
                    <p :class="isAmountSufficient ? 'text-green-600 dark:text-green-400' : 'text-gray-400'"
                        class="text-sm font-bold uppercase tracking-widest mb-1">
                        Kembalian
                    </p>
                    <span :class="isAmountSufficient ? 'text-green-700 dark:text-green-400' : 'text-gray-400'"
                        class="text-4xl font-black">
                        {{ formatIDR(changeToReturn) }}
                    </span>
                </div>

                <button @click="handleComplete" :disabled="!isAmountSufficient"
                    :class="!isAmountSufficient ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-[#359EFF]/90 active:scale-[0.98]'"
                    class="w-full bg-[#359EFF] text-white font-black text-xl py-6 rounded-2xl shadow-xl shadow-[#359EFF]/20 flex items-center justify-center gap-3 transition-all transform">
                    <span class="material-symbols-outlined">check_circle</span>
                    Complete Transaction
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Animasi masuk */
.animate-in {
    animation: modal-in 0.3s ease-out;
}

@keyframes modal-in {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
</style>