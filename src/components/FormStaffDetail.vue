<script setup>
import { ref, watch } from 'vue'
import api from '@/helpers/api'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    userId: { type: [Number, String], default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const auth = useAuthStore()

const saving = ref(false)
const formError = ref('')

const form = ref({ name: '', phone: '', address: '' })

watch(
    () => props.modelValue,
    (open) => {
        if (!open) return
        formError.value = ''
        form.value = { name: '', phone: '', address: '' }
    }
)

const close = () => emit('update:modelValue', false)

const save = async () => {
    if (!form.value.name.trim()) {
        formError.value = 'Full name is required.'
        return
    }
    saving.value = true
    formError.value = ''
    try {
        await api.post(`/user/detail/${props.userId}`, {
            user_id: props.userId,
            name: form.value.name.trim(),
            phone_number: form.value.phone.trim(),
            address: form.value.address.trim(),
        }, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        emit('saved')
        close()
    } catch (e) {
        formError.value = e.response?.data?.detail ?? 'Failed to save staff detail.'
    } finally {
        saving.value = false
    }
}
</script>

<template>
    <Teleport to="body">
        <div v-if="modelValue"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-['Inter']">
            <div class="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col">

                <!-- Header -->
                <div
                    class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700 shrink-0">
                    <div>
                        <div class="flex items-center gap-2 mb-0.5">
                            <span
                                class="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">Step
                                2 of 2</span>
                        </div>
                        <h3 class="text-lg font-black text-slate-900 dark:text-white">Staff Details</h3>
                        <p class="text-xs text-slate-400 mt-0.5">Account created — fill in personal info</p>
                    </div>
                    <button @click="close"
                        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <!-- Body -->
                <div class="px-6 py-5 flex flex-col gap-5">

                    <!-- Full Name -->
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Full Name <span class="text-red-400">*</span>
                        </label>
                        <input v-model="form.name" type="text" placeholder="e.g. Sarah Miller" autofocus
                            class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                    </div>

                    <!-- Phone -->
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                        <input v-model="form.phone" type="tel" placeholder="e.g. 081234567890"
                            class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                    </div>

                    <!-- Address -->
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Address</label>
                        <input v-model="form.address" type="text" placeholder="e.g. Jl. Sudirman No. 1"
                            class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                    </div>

                    <!-- Error -->
                    <div v-if="formError"
                        class="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl px-4 py-3 text-sm font-medium">
                        <span class="material-symbols-outlined text-base mt-0.5 shrink-0">error</span>
                        {{ formError }}
                    </div>
                </div>

                <!-- Footer -->
                <div
                    class="flex gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 shrink-0 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                    <button @click="close"
                        class="flex-1 h-11 rounded-xl font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        Skip
                    </button>
                    <button @click="save" :disabled="saving"
                        class="flex-1 h-11 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold shadow-md shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                        {{ saving ? 'Saving…' : 'Save & Finish' }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
