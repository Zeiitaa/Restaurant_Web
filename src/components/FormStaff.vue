<script setup>
import { ref, watch } from 'vue'
import api from '@/helpers/api'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    item: { type: Object, default: null }, // null = Add, object = Edit
})

const emit = defineEmits(['update:modelValue', 'saved', 'created'])

const auth = useAuthStore()

const ROLES = ['waiters', 'manager', 'employee']

const saving = ref(false)
const formError = ref('')

// ADD mode: username, email, role, password only
// EDIT mode: all fields including name, phone, address
const form = ref({
    email: '',
    username: '',
    password: '',
    role: 'waiters',
    status: 'active',
    // edit-only fields
    name: '',
    phone: '',
    address: '',
})

watch(
    () => [props.modelValue, props.item],
    ([open]) => {
        if (!open) return
        formError.value = ''
        if (props.item) {
            form.value = {
                email: props.item.email ?? '',
                username: props.item.username ?? '',
                password: '',
                role: props.item.role ?? 'waiters',
                name: props.item.name ?? '',
                phone: props.item.phone ?? '',
                address: props.item.address ?? '',
            }
        } else {
            form.value = { email: '', username: '', password: '', role: 'waiters', status: 'active', name: '', phone: '', address: '' }
        }
    },
    { immediate: true }
)

const close = () => emit('update:modelValue', false)

const save = async () => {
    if (!form.value.email.trim()) {
        formError.value = 'Email is required.'
        return
    }
    if (!props.item && !form.value.password.trim()) {
        formError.value = 'Password is required for new staff.'
        return
    }
    saving.value = true
    formError.value = ''
    try {
        const headers = { Authorization: `Bearer ${auth.token}` }

        if (props.item) {
            // EDIT — single PATCH to /user/{id}
            const body = {
                email: form.value.email.trim(),
                username: form.value.username.trim() || form.value.email.trim(),
                role: form.value.role,
                name: form.value.name.trim(),
                phone_number: form.value.phone.trim(),
                address: form.value.address.trim(),
                ...(form.value.password.trim() ? { password: form.value.password.trim() } : {}),
            }
            await api.patch(`/user/${props.item.id}`, body, { headers })
            emit('saved')
            close()
        } else {
            // ADD — POST /user/ with credentials only
            const body = {
                email: form.value.email.trim(),
                username: form.value.username.trim() || form.value.email.trim(),
                password: form.value.password.trim(),
                role: form.value.role,
                status: form.value.status,
            }
            const res = await api.post('/user/', body, { headers })
            emit('created', res.data)
            close()
        }
    } catch (e) {
        formError.value = e.response?.data?.detail ?? 'Failed to save staff.'
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
                            {{ item ? 'Edit Staff' : 'Add New Staff' }}
                        </h3>
                        <p class="text-xs text-slate-400 mt-0.5">
                            {{ item ? `#${item.id}` : 'New team member' }}
                        </p>
                    </div>
                    <button @click="close"
                        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <!-- Body -->
                <div class="overflow-y-auto px-6 py-5 flex flex-col gap-5">

                    <!-- Edit-only: Name + Phone -->
                    <template v-if="item">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="flex flex-col gap-2">
                                <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Full
                                    Name</label>
                                <input v-model="form.name" type="text" placeholder="e.g. Sarah Miller"
                                    class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone</label>
                                <input v-model="form.phone" type="tel" placeholder="e.g. 081234567890"
                                    class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Address</label>
                            <input v-model="form.address" type="text" placeholder="e.g. Jl. Sudirman No. 1"
                                class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                        </div>
                        <hr class="border-slate-200 dark:border-slate-700" />
                    </template>

                    <!-- Email -->
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Email <span class="text-red-400">*</span>
                        </label>
                        <input v-model="form.email" type="email" placeholder="e.g. sarah@resto.com"
                            class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                    </div>

                    <!-- Username -->
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Username</label>
                        <input v-model="form.username" type="text" placeholder="Leave blank to use email"
                            class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                    </div>

                    <!-- Password -->
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Password
                            <span v-if="!item" class="text-red-400">*</span>
                            <span v-else class="text-slate-400 normal-case font-normal ml-1">(leave blank to keep
                                current)</span>
                        </label>
                        <input v-model="form.password" type="password"
                            :placeholder="item ? 'Enter new password to change…' : 'Min. 8 characters'"
                            class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                    </div>

                    <!-- Role + Status -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Role <span
                                    class="text-red-400">*</span></label>
                            <select v-model="form.role"
                                class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition">
                                <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
                            </select>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</label>
                            <select v-model="form.status"
                                class="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
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
                        {{ saving ? 'Saving…' : (item ? 'Save Changes' : 'Create Account →') }}
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
