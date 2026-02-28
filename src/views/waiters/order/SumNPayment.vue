<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTableStore } from '@/stores/table'
import api from '@/helpers/api'
import CashPayment from '@/components/cashPayment.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const tableStore = useTableStore()

// --- State ---
const orderId = ref(route.params.id)
const tableNumber = ref('--')
const orderNumber = ref('--')
const paymentMethod = ref('cash')
const orderData = ref(null)
const isLoading = ref(false)
const isProcessing = ref(false)

// --- Cash Modal State ---
const showCashModal = ref(false)

// --- QRIS State ---
const showQRIS = ref(false)
const qrCodeUrl = ref('')

const fetchOrderDetail = async () => {
    isLoading.value = true
    try {
        if (!tableStore.table) await tableStore.fetchTable()

        const res = await api.get(`/orders/${orderId.value}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        orderData.value = res.data

        console.log(orderData.value);
        const tableObj = tableStore.table?.find(t => t.id === res.data.table_id)
        tableNumber.value = tableObj ? tableObj.table_code : res.data.table_id
        orderNumber.value = res.data.id.toString()
    } catch (error) {
        console.error('Failed to fetch order detail:', error)
        alert('Order detail not found')
        router.push('/waiters/payment')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    if (orderId.value) {
        fetchOrderDetail()
    }
})

// --- Formatters ---
const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price || 0)
}

// --- Perhitungan Otomatis ---
const subtotal = computed(() => {
    if (!orderData.value) return 0
    return orderData.value.details.reduce((sum, item) => sum + item.subtotal, 0)
})

// discount dari backend adalah persen (misal: 10 = 10%)
const discountAmount = computed(() => {
    if (!orderData.value) return 0
    const pct = orderData.value.discount || 0
    return Math.round(subtotal.value * pct / 100)
})

const afterDiscount = computed(() => subtotal.value - discountAmount.value)

const tax = computed(() => {
    if (!orderData.value) return 0
    return orderData.value.total_amount - afterDiscount.value
})

const grandTotal = computed(() => {
    if (!orderData.value) return 0
    return orderData.value.total_amount
})

// --- Methods ---
const confirmPayment = () => {
    if (paymentMethod.value === 'qris') {
        generateQRIS()
        return
    }
    // Tampilkan modal cash
    showCashModal.value = true
}

const handleCashComplete = async ({ received, change }) => {
    showCashModal.value = false
    isProcessing.value = true
    try {
        await api.patch(`/orders/${orderId.value}/status`, {
            payment_status: 'paid',
            method: 'cash',
            amount_paid: received
        }, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })

        // Mark table as available
        const tableObj = tableStore.table?.find(t => t.id === orderData.value.table_id)
        if (tableObj) {
            await api.patch(`/table/${tableObj.table_code}`, { status: 'available' }, {
                headers: { Authorization: `Bearer ${auth.token}` }
            })
        }

        alert('Pembayaran berhasil!')
        router.push('/waiters/payment')
    } catch (error) {
        console.error('Payment failed:', error)
        alert('Pembayaran gagal diproses.')
    } finally {
        isProcessing.value = false
    }
}

const generateQRIS = async () => {
    isProcessing.value = true
    showQRIS.value = true  // buka modal duluan, tampilkan spinner
    qrCodeUrl.value = ''
    try {
        const res = await api.post(`/orders/${orderId.value}/generate-qris`, {}, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        qrCodeUrl.value = res.data.qr_image_url
    } catch (error) {
        console.error('Failed to generate QRIS:', error)
        showQRIS.value = false
        alert('Gagal membuat QR Code. Coba lagi.')
    } finally {
        isProcessing.value = false
    }
}

const completeQRIS = async () => {
    isProcessing.value = true
    try {
        await api.patch(`/orders/${orderId.value}/status`, {
            payment_status: 'paid',
            method: 'qris',
            amount_paid: grandTotal.value
        }, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })

        // Mark table as available
        const tableObj = tableStore.table?.find(t => t.id === orderData.value.table_id)
        if (tableObj) {
            await api.patch(`/table/${tableObj.table_code}`, { status: 'available' }, {
                headers: { Authorization: `Bearer ${auth.token}` }
            })
        }

        showQRIS.value = false
        qrCodeUrl.value = ''
        router.push('/waiters/payment')
    } catch (error) {
        console.error('Failed to complete QRIS payment:', error)
        alert('Gagal menyelesaikan pembayaran.')
    } finally {
        isProcessing.value = false
    }
}

const cancelQRIS = () => {
    showQRIS.value = false
    qrCodeUrl.value = ''
}

const cancelOrder = () => {
    router.push('/waiters/payment')
}
</script>

<template>
    <div
        class="font-['Inter'] bg-background-light dark:bg-background-dark_register min-h-screen text-[#121811] dark:text-white transition-colors duration-200">

        <header
            class="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-10 py-3 sticky top-0 z-50">
            <div class="flex items-center gap-4">
                <div class="size-8 text-primary">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z"
                            fill="currentColor"></path>
                        <path clip-rule="evenodd"
                            d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z"
                            fill="currentColor" fill-rule="evenodd"></path>
                    </svg>
                </div>
                <h2 class="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">RestoKita</h2>
            </div>
            <div class="flex flex-1 justify-end gap-6 items-center">
                <button @click="$router.push('/waiters/payment')"
                    class="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors cursor-pointer">
                    <span class="material-symbols-outlined text-[20px]">arrow_back</span>
                    Back to List
                </button>
                <div class="flex gap-2">
                    <button
                        class="flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 transition-colors">
                        <span class="material-symbols-outlined">settings</span>
                    </button>
                </div>
                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-primary/20"
                    style="background-image: url('https://ui-avatars.com/api/?name=Waiters&background=random');"></div>
            </div>
        </header>

        <main class="max-w-7xlpx mx-auto px-10 py-8">

            <div class="flex flex-wrap justify-between gap-3 mb-8">
                <div class="flex flex-col gap-1">
                    <p class="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                        Order Summary & Payment</p>
                    <div class="flex items-center gap-4">
                        <p class="text-slate-500 dark:text-slate-400 text-lg font-medium">Table {{ tableNumber }}</p>
                        <span class="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                        <p class="text-slate-500 dark:text-slate-400 text-lg font-medium">Order #{{ orderNumber }}</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

                <div v-if="isLoading" class="col-span-full py-20 text-center">
                    <div
                        class="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4">
                    </div>
                    <p class="text-slate-500">Loading order details...</p>
                </div>

                <template v-else-if="orderData">
                    <div
                        class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <span class="material-symbols-outlined text-primary">receipt_long</span>
                            <h2 class="text-slate-900 dark:text-white text-xl font-bold">Order Items</h2>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead>
                                    <tr class="bg-slate-50 dark:bg-slate-900/50">
                                        <th class="px-6 py-4 text-slate-900 dark:text-white text-sm font-semibold">Item
                                            Name</th>
                                        <th
                                            class="px-6 py-4 text-slate-900 dark:text-white text-sm font-semibold text-center">
                                            Qty</th>
                                        <th
                                            class="px-6 py-4 text-slate-900 dark:text-white text-sm font-semibold text-right">
                                            Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                                    <tr v-for="item in orderData.details" :key="item.id">
                                        <td class="px-6 py-5">
                                            <p class="text-slate-900 dark:text-white text-base font-medium">{{
                                                item.menu?.name }}</p>
                                            <p v-if="item.notes" class="text-xs text-slate-500 italic mt-1">{{
                                                item.notes }}</p>
                                        </td>
                                        <td
                                            class="px-6 py-5 text-slate-600 dark:text-slate-400 text-base text-center font-medium">
                                            {{ item.quantity }}</td>
                                        <td
                                            class="px-6 py-5 text-slate-900 dark:text-white text-base text-right font-semibold">
                                            {{ formatPrice(item.subtotal) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="p-6 bg-slate-50 dark:bg-slate-900/30">
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <p class="text-slate-500 dark:text-slate-400 text-base font-medium">Subtotal</p>
                                    <p class="text-slate-900 dark:text-white text-base font-semibold">{{
                                        formatPrice(subtotal) }}</p>
                                </div>
                                <div v-if="orderData.discount > 0"
                                    class="flex justify-between items-center text-rose-500">
                                    <p class="text-base font-medium">Discount ({{ orderData.discount }}%)</p>
                                    <p class="text-base font-semibold">- {{ formatPrice(discountAmount) }}</p>
                                </div>
                                <div v-if="orderData.discount > 0"
                                    class="flex justify-between items-center text-slate-400 dark:text-slate-500 text-sm border-b border-dashed border-slate-200 dark:border-slate-700 pb-3">
                                    <p class="font-medium italic">Setelah diskon</p>
                                    <p class="font-semibold">{{ formatPrice(afterDiscount) }}</p>
                                </div>
                                <div class="flex justify-between items-center">
                                    <p class="text-slate-500 dark:text-slate-400 text-base font-medium">Tax & Service
                                    </p>
                                    <p class="text-slate-900 dark:text-white text-base font-semibold">{{
                                        formatPrice(tax) }}</p>
                                </div>
                                <div
                                    class="pt-4 mt-2 border-t-2 border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                    <p class="text-slate-900 dark:text-white text-2xl font-black">Grand Total</p>
                                    <p class="text-primary text-3xl font-black tracking-tight">{{
                                        formatPrice(grandTotal) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-8 h-full">
                        <div>
                            <div class="flex items-center gap-3 mb-6">
                                <span class="material-symbols-outlined text-primary">payments</span>
                                <h2 class="text-slate-900 dark:text-white text-xl font-bold">Payment Method</h2>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label class="cursor-pointer group relative">
                                    <input v-model="paymentMethod" value="cash" class="peer hidden"
                                        name="payment_method" type="radio" />
                                    <div
                                        class="h-48 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/50">
                                        <div
                                            class="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <span class="material-symbols-outlined text-4xl!">payments</span>
                                        </div>
                                        <div>
                                            <p class="text-lg font-bold text-slate-900 dark:text-white">Cash</p>
                                            <p class="text-sm text-slate-500">Settle with physical currency</p>
                                        </div>
                                        <div
                                            class="absolute top-4 right-4 opacity-0 peer-checked:opacity-100 transition-opacity">
                                            <span class="material-symbols-outlined text-primary">check_circle</span>
                                        </div>
                                    </div>
                                </label>

                                <label class="cursor-pointer group relative">
                                    <input v-model="paymentMethod" value="qris" class="peer hidden"
                                        name="payment_method" type="radio" />
                                    <div
                                        class="h-48 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/50">
                                        <div
                                            class="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <span class="material-symbols-outlined text-4xl!">qr_code_2</span>
                                        </div>
                                        <div>
                                            <p class="text-lg font-bold text-slate-900 dark:text-white">QRIS</p>
                                            <p class="text-sm text-slate-500">Digital wallet payment</p>
                                        </div>
                                        <div
                                            class="absolute top-4 right-4 opacity-0 peer-checked:opacity-100 transition-opacity">
                                            <span class="material-symbols-outlined text-primary">check_circle</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div
                            class="mt-auto space-y-4 shadow-2xl p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                            <div class="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
                                <span class="material-symbols-outlined text-primary text-sm mt-0.5">info</span>
                                <p class="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                                    Confirming this {{ paymentMethod.toUpperCase() }} payment will finalize the order
                                    and free Table {{ tableNumber }}.
                                </p>
                            </div>

                            <button @click="confirmPayment" :disabled="isProcessing"
                                class="w-full flex items-center justify-center gap-3 bg-primary text-white py-6 rounded-2xl text-xl font-black shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50">
                                <template v-if="!isProcessing">
                                    <span class="material-symbols-outlined">verified</span>
                                    CONFIRM PAYMENT
                                </template>
                                <div v-else
                                    class="size-7 border-4 border-white border-t-transparent rounded-full animate-spin">
                                </div>
                            </button>

                            <button @click="cancelOrder"
                                class="w-full py-4 text-slate-500 hover:text-slate-900 dark:hover:text-white text-base font-bold transition-colors cursor-pointer">
                                Cancel Process
                            </button>
                        </div>
                    </div>
                </template>
            </div>
        </main>

        <!-- Cash Payment Modal -->
        <CashPayment :is-open="showCashModal" :total-due="grandTotal" @close="showCashModal = false"
            @complete="handleCashComplete" />

        <!-- QRIS Modal -->
        <div v-if="showQRIS"
            class="fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <div
                class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center">

                <!-- Header -->
                <div class="w-full bg-primary px-8 pt-8 pb-6 text-center">
                    <div class="flex items-center justify-center gap-2 mb-1">
                        <span class="material-symbols-outlined text-white">qr_code_2</span>
                        <h3 class="text-xl font-black text-white">Bayar via QRIS</h3>
                    </div>
                    <p class="text-white/80 text-sm font-medium">{{ tableNumber }} &bull; Order #{{ orderNumber }}</p>
                </div>

                <div class="px-8 pt-4 pb-2 text-center">
                    <p class="text-slate-500 text-sm">Total Tagihan</p>
                    <p class="text-3xl font-black text-slate-900 dark:text-white">{{ formatPrice(grandTotal) }}</p>
                </div>

                <!-- QR Area -->
                <div class="px-8 pb-6 w-full">
                    <!-- Loading state -->
                    <div v-if="!qrCodeUrl"
                        class="aspect-square w-full bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3">
                        <div class="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin">
                        </div>
                        <p class="text-slate-500 text-sm font-medium">Generating QR Code...</p>
                    </div>
                    <!-- QR Image -->
                    <div v-else class="bg-white p-4 rounded-2xl border-2 border-slate-100 aspect-square w-full">
                        <img :src="qrCodeUrl" alt="QRIS Code" class="w-full h-full object-contain" />
                    </div>
                </div>

                <div class="w-full px-8 pb-8 flex flex-col gap-3">
                    <p class="text-center text-xs text-slate-400">Scan menggunakan aplikasi dompet digital manapun</p>
                    <button @click="completeQRIS" :disabled="!qrCodeUrl || isProcessing"
                        class="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        <div v-if="isProcessing"
                            class="size-5 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin">
                        </div>
                        <template v-else>
                            <span class="material-symbols-outlined text-xl">check_circle</span>
                            Selesai Pembayaran
                        </template>
                    </button>
                    <button @click="cancelQRIS"
                        class="w-full py-3 text-slate-400 hover:text-slate-700 text-sm font-medium transition-colors">
                        Batalkan
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Ensure Material Symbols load properly in the Vue component */
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>