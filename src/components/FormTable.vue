<script setup>
import { ref, watch } from 'vue'
import api from '@/helpers/api'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    item: { type: Object, default: null }, // null = Add, object = Edit
})

const emit = defineEmits(['update:modelValue', 'saved'])

const auth = useAuthStore()

const saving = ref(false)
const formError = ref('')

const form = ref({
    table_code: '',
    capacity: '',
    status: 'available',
})

watch(
    () => [props.modelValue, props.item],
    ([open]) => {
        if (!open) return
        formError.value = ''
        if (props.item) {
            form.value = {
                table_code: props.item.table_code ?? '',
                capacity: props.item.capacity ?? '',
                status: props.item.status ?? 'available',
            }
        } else {
            form.value = { table_code: '', capacity: '', status: 'available' }
        }
    },
    { immediate: true }
)

const close = () => emit('update:modelValue', false)

const save = async () => {
    if (!String(form.value.table_code ?? '').trim()) {
        formError.value = 'Table code is required.'
        return
    }
    if (!form.value.capacity || Number(form.value.capacity) < 1) {
        formError.value = 'Capacity must be at least 1.'
        return
    }
    saving.value = true
    formError.value = ''
    try {
        const headers = { Authorization: `Bearer ${auth.token}` }
        if (props.item) {
            await api.patch(`/table/${props.item.table_code}`, {
                capacity: Number(form.value.capacity),
                status: form.value.status,
            }, { headers })
        } else {
            await api.post('/table/', {
                table_code: String(form.value.table_code ?? '').trim(),
                capacity: Number(form.value.capacity),
                status: form.value.status,
            }, { headers })
        }
        emit('saved')
        close()
    } catch (e) {
        formError.value = e.response?.data?.detail ?? 'Failed to save table.'
    } finally {
        saving.value = false
    }
}
</script>

<template>
    <Teleport to="body">
        <div v-if="modelValue"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-['Inter']">
            <div class="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col">

                <!-- Header -->
                <div
                    class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700 shrink-0">
                    <div>
                        <h3 class="text-lg font-black text-slate-900 dark:text-white">
                            {{ item ? 'Edit Table' : 'Add New Table' }}
                        </h3>
                        <p class="text-xs text-slate-400 mt-0.5">
                            {{ item ? `Code: ${item.table_code}` : 'New table entry' }}
                        </p>
                    </div>
                    <button @click="close"
                        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <!-- Body -->
                <div class="px-6 py-5 flex flex-col gap-5">

                    <!-- Table Code -->
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Table Code <span class="text-red-400">*</span>
                        </label>
                        <input v-model="form.table_code" type="text" placeholder="e.g. T-01" :disabled="!!item"
                            :class="item ? 'opacity-60 cursor-not-allowed' : ''"
                            class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                        <p v-if="item" class="text-[11px] text-slate-400">Table code cannot be changed.</p>
                    </div>

                    <!-- Capacity + Status -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Capacity <span class="text-red-400">*</span>
                            </label>
                            <input v-model="form.capacity" type="number" min="1" placeholder="e.g. 4"
                                class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</label>
                            <select v-model="form.status"
                                class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition">
                                <option value="available">Available</option>
                                <option value="booked">Booked</option>
                            </select>
                        </div>
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
                        Cancel
                    </button>
                    <button @click="save" :disabled="saving"
                        class="flex-1 h-11 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold shadow-md shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                        {{ saving ? 'Saving…' : (item ? 'Save Changes' : 'Add Table') }}
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
