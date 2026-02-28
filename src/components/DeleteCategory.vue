<script setup>
import { ref } from 'vue'
import api from '@/helpers/api'
import { useAuthStore } from '@/stores/auth'
import { useCategoryStore } from '@/stores/category'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    item: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'deleted'])

const auth = useAuthStore()
const categoryStore = useCategoryStore()

const deleting = ref(false)
const deleteError = ref('')

const close = () => {
    deleteError.value = ''
    emit('update:modelValue', false)
}

const confirmDelete = async () => {
    if (!props.item) return
    deleting.value = true
    deleteError.value = ''
    try {
        await api.delete(`/category/${props.item.id}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        await categoryStore.fetchCategory()
        emit('deleted')
        close()
    } catch (e) {
        deleteError.value = e.response?.data?.detail ?? 'Failed to delete category.'
    } finally {
        deleting.value = false
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
                    class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-red-500">category</span>
                        </div>
                        <div>
                            <h3 class="text-lg font-black text-slate-900 dark:text-white">Delete Category</h3>
                            <p class="text-xs text-slate-400 mt-0.5">This action cannot be undone</p>
                        </div>
                    </div>
                    <button @click="close"
                        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <!-- Body -->
                <div class="px-6 py-5 flex flex-col gap-4">
                    <p class="text-sm text-slate-600 dark:text-slate-300">
                        Are you sure you want to delete
                        <span class="font-bold text-slate-900 dark:text-white">"{{ item?.name }}"</span>?
                        Menu items linked to this category may be affected.
                    </p>

                    <div v-if="deleteError"
                        class="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl px-4 py-3 text-sm font-medium">
                        <span class="material-symbols-outlined text-base mt-0.5 shrink-0">error</span>
                        {{ deleteError }}
                    </div>
                </div>

                <!-- Footer -->
                <div
                    class="flex gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                    <button @click="close"
                        class="flex-1 h-11 rounded-xl font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        Cancel
                    </button>
                    <button @click="confirmDelete" :disabled="deleting"
                        class="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-md shadow-red-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                        {{ deleting ? 'Deleting…' : 'Delete' }}
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
