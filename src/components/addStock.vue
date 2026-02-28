<script setup>
import { ref, computed } from 'vue'
import api from '@/helpers/api'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    item: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const auth = useAuthStore()
const menuStore = useMenuStore()

const stockAdd = ref(1)
const saving = ref(false)
const error = ref('')

const newTotal = computed(() =>
    (props.item?.daily_portion ?? 0) + (stockAdd.value > 0 ? stockAdd.value : 0)
)

const close = () => {
    stockAdd.value = 1
    error.value = ''
    emit('update:modelValue', false)
}

const save = async () => {
    if (!stockAdd.value || stockAdd.value <= 0) {
        error.value = 'Enter a positive number.'
        return
    }
    saving.value = true
    error.value = ''
    try {
        await api.patch(
            `/menu/${props.item.id}`,
            { daily_portion: (props.item.daily_portion ?? 0) + Number(stockAdd.value),
                status: "available"
             },
            { headers: { Authorization: `Bearer ${auth.token}` } }
        )
        await menuStore.fetchMenu()
        close()
    } catch (e) {
        error.value = e.response?.data?.detail ?? 'Failed to update stock.'
    } finally {
        saving.value = false
    }
}
</script>

<template>
    <Teleport to="body">
        <div v-if="modelValue"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-['Inter']">
            <div class="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 flex flex-col gap-5">

                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-black text-slate-900 dark:text-white">Add Stock</h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{{ item?.name }}</p>
                    </div>
                    <button @click="close"
                        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <!-- Current stock -->
                <div
                    class="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span class="material-symbols-outlined text-primary text-base">inventory_2</span>
                    Current stock:
                    <span class="font-black text-slate-900 dark:text-white ml-auto">
                        {{ item?.daily_portion ?? 0 }} portions
                    </span>
                </div>

                <!-- Input -->
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Portions to Add</label>
                    <input v-model.number="stockAdd" type="number" min="1"
                        class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-slate-900 dark:text-white font-bold text-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                    <p v-if="error" class="text-sm text-red-500 font-medium">{{ error }}</p>
                </div>

                <!-- New total preview -->
                <div
                    class="flex items-center gap-3 bg-primary/5 dark:bg-primary/10 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                    New total:
                    <span class="font-black text-primary ml-auto">{{ newTotal }} portions</span>
                </div>

                <!-- Actions -->
                <div class="flex gap-3">
                    <button @click="close"
                        class="flex-1 h-11 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        Cancel
                    </button>
                    <button @click="save" :disabled="saving"
                        class="flex-1 h-11 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold shadow-md shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                        {{ saving ? 'Saving…' : 'Confirm' }}
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
