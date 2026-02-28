<script setup>
import { ref, watch } from 'vue'
import api from '@/helpers/api'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { useCategoryStore } from '@/stores/category'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    item: { type: Object, default: null }, // null = Add mode, object = Edit mode
})

const emit = defineEmits(['update:modelValue'])

const auth = useAuthStore()
const menuStore = useMenuStore()
const categoryStore = useCategoryStore()

const API_IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE
const getImageUrl = (img) => {
    if (!img) return null
    if (img.startsWith('http')) return img
    return `${API_IMAGE_URL}${img}`
}

const saving = ref(false)
const formError = ref('')
const imageMode = ref('upload') // 'upload' | 'url'
const imageUrl = ref('')

const form = ref({
    name: '',
    price: '',
    description: '',
    daily_portion: 0,
    status: 'available',
    category_id: '',
    imageFile: null,
    imagePreview: null,
})

// Sync form when item or visibility changes
watch(
    () => [props.modelValue, props.item],
    ([open]) => {
        if (!open) return
        formError.value = ''
        imageMode.value = 'upload'
        imageUrl.value = ''
        if (props.item) {
            form.value = {
                name: props.item.name ?? '',
                price: props.item.price ?? '',
                description: props.item.description ?? '',
                daily_portion: props.item.daily_portion ?? 0,
                status: props.item.status ?? 'available',
                category_id: props.item.category?.id ?? props.item.category_id ?? '',
                imageFile: null,
                imagePreview: getImageUrl(props.item.image) ?? null,
            }
        } else {
            form.value = {
                name: '', price: '', description: '',
                daily_portion: 0, status: 'available',
                category_id: categoryStore.category?.[0]?.id ?? '',
                imageFile: null, imagePreview: null,
            }
        }
    },
    { immediate: true }
)

const onImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    form.value.imageFile = file
    form.value.imagePreview = URL.createObjectURL(file)
}

const close = () => emit('update:modelValue', false)

const save = async () => {
    if (!form.value.name.trim() || !form.value.price || !form.value.category_id) {
        formError.value = 'Name, price, and category are required.'
        return
    }
    saving.value = true
    formError.value = ''
    try {
        const hasFile = imageMode.value === 'upload' && form.value.imageFile
        const hasUrl = imageMode.value === 'url' && imageUrl.value.trim()

        let body
        let headers = { Authorization: `Bearer ${auth.token}` }

        if (hasFile) {
            // multipart only when uploading a file
            const fd = new FormData()
            fd.append('name', form.value.name.trim())
            fd.append('price', Number(form.value.price))
            fd.append('description', form.value.description ?? '')
            fd.append('daily_portion', Number(form.value.daily_portion) || 0)
            fd.append('status', form.value.status)
            fd.append('category_id', Number(form.value.category_id))
            fd.append('image', form.value.imageFile)
            body = fd
        } else {
            // plain JSON otherwise
            headers['Content-Type'] = 'application/json'
            body = {
                name: form.value.name.trim(),
                price: Number(form.value.price),
                description: form.value.description ?? '',
                daily_portion: Number(form.value.daily_portion) || 0,
                status: form.value.status,
                category_id: Number(form.value.category_id),
                ...(hasUrl ? { image: imageUrl.value.trim() } : {}),
            }
        }

        if (props.item) {
            await api.patch(`/menu/${props.item.id}`, body, { headers })
        } else {
            await api.post(`/menu/`, body, { headers })
        }
        await menuStore.fetchMenu()
        close()
    } catch (e) {
        formError.value = e.response?.data?.detail ?? 'Failed to save item.'
    } finally {
        saving.value = false
    }
}
</script>

<template>
    <Teleport to="body">
        <div v-if="modelValue"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-['Inter']">
            <div class="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                <!-- Header -->
                <div
                    class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700 shrink-0">
                    <div>
                        <h3 class="text-lg font-black text-slate-900 dark:text-white">
                            {{ item ? 'Edit Item' : 'Add New Item' }}
                        </h3>
                        <p class="text-xs text-slate-400 mt-0.5">
                            {{ item ? `#${item.id}` : 'New menu item' }}
                        </p>
                    </div>
                    <button @click="close"
                        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <!-- Body (scrollable) -->
                <div class="overflow-y-auto px-6 py-5 flex flex-col gap-5">

                    <!-- Image -->
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Image</label>
                            <!-- Mode toggle -->
                            <div class="flex p-0.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold">
                                <button type="button" @click="imageMode = 'upload'"
                                    :class="['px-3 py-1 rounded-md transition-colors', imageMode === 'upload' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200']">
                                    Upload
                                </button>
                                <button type="button" @click="imageMode = 'url'"
                                    :class="['px-3 py-1 rounded-md transition-colors', imageMode === 'url' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200']">
                                    URL
                                </button>
                            </div>
                        </div>

                        <!-- Preview (shared) -->
                        <div
                            class="relative h-36 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-600">
                            <img :src="imageMode === 'url' ? imageUrl || undefined : form.imagePreview || undefined"
                                v-if="(imageMode === 'url' && imageUrl) || (imageMode === 'upload' && form.imagePreview)"
                                class="absolute inset-0 w-full h-full object-cover" />
                            <div v-else
                                class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                                <span class="material-symbols-outlined text-4xl">add_photo_alternate</span>
                                <span class="text-sm font-medium">{{ imageMode === 'upload' ? 'Click below to upload' :
                                    'Enter URL below' }}</span>
                            </div>
                        </div>

                        <!-- Upload input -->
                        <label v-if="imageMode === 'upload'"
                            class="flex items-center justify-center gap-2 h-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-500 hover:text-primary hover:border-primary transition-colors cursor-pointer">
                            <span class="material-symbols-outlined text-base">upload</span>
                            {{ form.imagePreview ? 'Change file…' : 'Choose file…' }}
                            <input type="file" accept="image/*" class="hidden" @change="onImageChange" />
                        </label>

                        <!-- URL input -->
                        <input v-else v-model="imageUrl" type="url" placeholder="https://example.com/image.jpg"
                            class="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                    </div>

                    <!-- Name -->
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Name <span class="text-red-400">*</span>
                        </label>
                        <input v-model="form.name" type="text" placeholder="e.g. Nasi Goreng Spesial"
                            class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                    </div>

                    <!-- Price + Category -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Price (IDR) <span class="text-red-400">*</span>
                            </label>
                            <input v-model.number="form.price" type="number" min="0" placeholder="25000"
                                class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Category <span class="text-red-400">*</span>
                            </label>
                            <select v-model.number="form.category_id"
                                class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition">
                                <option value="" disabled>Select…</option>
                                <option v-for="cat in categoryStore.category" :key="cat.id" :value="cat.id">
                                    {{ cat.name }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- Daily Portion + Status -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Daily
                                Portion</label>
                            <input v-model.number="form.daily_portion" type="number" min="0" placeholder="0"
                                class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</label>
                            <select v-model="form.status"
                                class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition">
                                <option value="available">Available</option>
                                <option value="outOfStock">Out of Stock</option>
                            </select>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                        <textarea v-model="form.description" rows="3" placeholder="Short description of this menu item…"
                            class="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none" />
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
                        {{ saving ? 'Saving…' : (item ? 'Save Changes' : 'Add Item') }}
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
