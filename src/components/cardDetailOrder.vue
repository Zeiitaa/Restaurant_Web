<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    item: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close', 'add']);

const quantity = ref(1);
const type = ref('dine-in');
const notes = ref('');

// Reset state when item changes
watch(() => props.item, () => {
    quantity.value = 1;
    type.value = 'dine-in';
    notes.value = '';
}, { deep: true });

const adjustQuantity = (amount) => {
    const newQty = quantity.value + amount;
    if (newQty >= 1) {
        quantity.value = newQty;
    }
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
};

const API_IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE || 'http://localhost:8000/storage/'

const getImageUrl = (image) => {
    if (!image) return '/placeholder-food.jpg';
    if (image.startsWith('http')) return image;
    return `${API_IMAGE_URL}${image}`;
};

const handleClose = () => {
    emit('close');
};

const handleAdd = () => {
    emit('add', {
        item: props.item,
        quantity: quantity.value,
        type: type.value,
        notes: notes.value
    });
};
</script>

<template>
    <div
        class="bg-white dark:bg-surface-dark_waiters w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="relative h-48 w-full shrink-0">
            <div class="w-full h-full bg-cover bg-center"
                :style="{ backgroundImage: `url(${getImageUrl(item?.image)})` }">
            </div>
            <div class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
            <button @click="handleClose"
                class="absolute top-4 right-4 size-10 flex items-center justify-center bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors cursor-pointer">
                <span class="material-symbols-outlined">close</span>
            </button>
            <div class="absolute bottom-4 left-6">
                <h2 class="text-2xl font-bold text-white">{{ item?.name }}</h2>
                <p class="text-white/80 text-sm">{{ formatPrice(item?.price || 0) }} per unit</p>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-8">
            <div class="flex flex-col items-center gap-3">
                <label class="text-xs font-bold uppercase tracking-wider text-slate-400">Select Quantity</label>
                <div class="flex items-center gap-8">
                    <button @click="adjustQuantity(-1)"
                        class="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary_waiters hover:text-white transition-all cursor-pointer">
                        <span class="material-symbols-outlined font-bold">remove</span>
                    </button>
                    <span class="text-4xl font-black text-slate-900 dark:text-white w-12 text-center">{{
                        quantity }}</span>
                    <button @click="adjustQuantity(1)"
                        class="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary_waiters hover:text-white transition-all cursor-pointer">
                        <span class="material-symbols-outlined font-bold">add</span>
                    </button>
                </div>
            </div>

            <div class="space-y-3">
                <label class="text-xs font-bold uppercase tracking-wider text-slate-400">Order Type</label>
                <div class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button @click="type = 'dine-in'"
                        :class="['flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all cursor-pointer', type === 'dine-in' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary_waiters dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200']">
                        <span class="material-symbols-outlined text-[20px]">restaurant</span> Dine-in
                    </button>
                    <button @click="type = 'takeaway'"
                        :class="['flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all cursor-pointer', type === 'takeaway' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary_waiters dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200']">
                        <span class="material-symbols-outlined text-[20px]">shopping_bag</span> Takeaway
                    </button>
                </div>
            </div>

            <div class="space-y-3">
                <label class="text-xs font-bold uppercase tracking-wider text-slate-400">Special Notes</label>
                <textarea v-model="notes"
                    class="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 text-sm focus:ring-primary_waiters focus:border-primary_waiters outline-none resize-none placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="e.g. No onions, extra cheese, allergy information..."></textarea>
            </div>
        </div>

        <div class="p-6 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button @click="handleAdd"
                class="w-full bg-primary_waiters hover:bg-primary-dark_waiters text-white rounded-2xl h-14 font-bold text-lg shadow-lg shadow-primary_waiters/30 flex items-center justify-center gap-3 transition-all active:scale-95 cursor-pointer">
                <span class="material-symbols-outlined">add_shopping_cart</span>
                Add to Order — {{ formatPrice((item?.price || 0) * quantity) }}
            </button>
        </div>
    </div>
</template>