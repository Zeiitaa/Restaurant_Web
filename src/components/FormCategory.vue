<script setup>
import { ref, watch } from 'vue'
import { useCategoryStore } from '@/stores/category'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    item: { type: Object, default: null }, // null = Add, object = Edit
})

const emit = defineEmits(['update:modelValue', 'saved'])

const categoryStore = useCategoryStore()

const saving = ref(false)
const formError = ref('')

const form = ref({ name: '' })

watch(
    () => [props.modelValue, props.item],
    ([open]) => {
        if (!open) return
        formError.value = ''
        form.value = { name: props.item?.name ?? '' }
    },
    { immediate: true }
)

const close = () => emit('update:modelValue', false)

const save = async () => {
    const name = form.value.name.trim()
    if (!name) {
        formError.value = 'Category name is required.'
        return
    }
    saving.value = true
    formError.value = ''
    try {
        if (props.item) {
            await categoryStore.updateCategory(props.item.id, name)
        } else {
            await categoryStore.createCategory(name)
        }
        await categoryStore.fetchCategory()
        emit('saved')
        close()
    } catch (e) {
        formError.value = e.response?.data?.detail ?? 'Failed to save category.'
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
                            {{ item ? 'Edit Category' : 'Add New Category' }}
                        </h3>
                        <p class="text-xs text-slate-400 mt-0.5">
                            {{ item ? `Editing: ${item.name}` : 'Create a new menu category' }}
                        </p>
                    </div>
                    <button @click="close"
                        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <!-- Body -->
                <div class="px-6 py-5 flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Category Name <span class="text-red-400">*</span>
                        </label>
                        <input v-model="form.name" type="text" placeholder="e.g. Main Courses" autofocus
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
                        Cancel
                    </button>
                    <button @click="save" :disabled="saving"
                        class="flex-1 h-11 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold shadow-md shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                        {{ saving ? 'Saving…' : (item ? 'Save Changes' : 'Add Category') }}
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
