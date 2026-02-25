<script setup>
const props = defineProps({
    item: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['open-modal']);

const API_IMAGE_URL = import.meta.env.VITE_API_URL_IMAGE || 'http://localhost:8000/storage/';

const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (typeof imagePath === 'string' && (imagePath.startsWith('http') || imagePath.startsWith('https'))) return imagePath;
    return `${API_IMAGE_URL}${imagePath}`;
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price || 0);
};
</script>

<template>
    <div
        class="group relative flex flex-col bg-white dark:bg-surface-dark_waiters rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700/50">
        <div class="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
            <div class="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                :style="`background-image: url(${getImageUrl(item.image)});`"></div>
            <div class="absolute top-2 right-2 flex flex-col gap-1 items-end">
                <span :class="[
                    'text-[12px] font-bold px-2 py-1 rounded-md shadow-sm backdrop-blur-md uppercase tracking-wider',
                    item.status === 'available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                ]">
                    {{ item.status }}
                </span>
                <span
                    class="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[12px] font-bold px-2 py-1 rounded-md shadow-sm backdrop-blur-md">
                    {{ item.daily_portion }} Left
                </span>
            </div>
        </div>
        <div class="p-4 flex flex-col flex-1">
            <div class="flex justify-between items-start gap-2 mb-2">
                <h3 class="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                    {{ item.name }}
                </h3>
                <p class="font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {{ formatPrice(item.price) }}
                </p>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                {{ item.description }}
            </p>
            <div class="mt-auto pt-2">
                <button @click="emit('open-modal', item)"
                    :disabled="item.status !== 'available' || item.daily_portion <= 0" :class="[
                        'w-full h-10 flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition-all active:scale-95',
                        item.status === 'available' && item.daily_portion > 0
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-primary_waiters hover:text-white dark:hover:bg-primary_waiters cursor-pointer'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50'
                    ]">
                    <span class="material-symbols-outlined text-[20px]">
                        {{ item.status === 'available' ? 'add' : 'block' }}
                    </span>
                    {{ item.status === 'available' && item.daily_portion > 0 ? 'Add to Order' : 'Unavailable' }}
                </button>
            </div>
        </div>
    </div>
</template>
