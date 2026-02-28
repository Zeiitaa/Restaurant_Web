<script setup>
import { ref } from 'vue'
import api from '@/helpers/api'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    item: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'deleted'])

const auth = useAuthStore()

const deleting = ref(false)
const error = ref('')

const close = () => {
    error.value = ''
    emit('update:modelValue', false)
}

const confirm = async () => {
    deleting.value = true
    error.value = ''
    try {
        await api.patch(`/user/deactivate/${props.item.id}`, {}, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        emit('deleted')
        close()
    } catch (e) {
        error.value = e.response?.data?.detail ?? 'Failed to delete staff.'
    } finally {
        deleting.value = false
    }
}
</script>

<template>
    <Teleport to="body">
        <div v-if="modelValue"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-['Inter']">
            <div class="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 flex flex-col gap-5">

                <div class="flex flex-col items-center text-center gap-3">
                    <div class="size-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <span class="material-symbols-outlined text-3xl text-red-500">person_remove</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-black text-slate-900 dark:text-white">Remove Staff?</h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            <span class="font-semibold text-slate-700 dark:text-slate-200">{{ item?.name }}</span>
                            will be permanently removed from the system.
                        </p>
                    </div>
                </div>

                <p v-if="error"
                    class="text-sm text-center text-red-500 font-medium bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2">
                    {{ error }}
                </p>

                <div class="flex gap-3">
                    <button @click="close"
                        class="flex-1 h-11 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-colors">
                        Cancel
                    </button>
                    <button @click="confirm" :disabled="deleting"
                        class="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-md shadow-red-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                        {{ deleting ? 'Removing…' : 'Remove' }}
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
