<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTableStore } from '@/stores/table'
import api from '@/helpers/api'
import router from '@/router'

const auth = useAuthStore()
const tableStore = useTableStore()

// --- State ---
const pendingOrders = ref([])
const isLoading = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)

const fetchPendingPayments = async () => {
  isLoading.value = true
  try {
    // Pastikan data meja sudah ada untuk mapping id -> code
    if (!tableStore.table) {
      await tableStore.fetchTable()
    }

    const res = await api.get(`/orders/served`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })

    // Map data dari API ke format yang digunakan template
    pendingOrders.value = res.data.map(order => {
      const tableObj = tableStore.table?.find(t => t.id === order.table_id)
      return {
        id: order.id,
        table: tableObj ? tableObj.table_code : order.table_id,
        location: tableObj ? `Seats ${tableObj.capacity}` : 'Indoor Area',
        waitress: order.guest_name || 'Guest',
        status: order.payment_status.toUpperCase(),
        total: order.total_amount
      }
    })
  } catch (error) {
    console.error('Failed to fetch pending payments:', error)
  } finally {
    isLoading.value = false
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price || 0)
}

// --- Computed Properties ---
// Filter pesanan berdasarkan input nomor meja atau lokasi
const filteredOrders = computed(() => {
  if (!searchQuery.value) return pendingOrders.value
  const query = searchQuery.value.toLowerCase()
  return pendingOrders.value.filter(order =>
    order.table.toString().toLowerCase().includes(query) ||
    order.location.toLowerCase().includes(query) ||
    order.waitress.toLowerCase().includes(query)
  )
})

const totalUnpaidCount = computed(() => pendingOrders.value.length)

// --- Methods ---
const processPayment = (order) => {
  // Arahkan ke halaman detail pembayaran dengan ID pesanan
  router.push({ name: 'waiters-payment-detail', params: { id: order.id } })
}

const signOut = () => {
  if (confirm('Are you sure you want to sign out?')) {
    auth.logout()
    router.push('/')
  }
}

// --- Keyboard Shortcut (Cmd/Ctrl + K to focus search) ---
const handleKeydown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    searchInputRef.value?.focus()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  fetchPendingPayments()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    class="font-['Inter'] bg-background-light_action dark:bg-background-dark_action min-h-screen flex flex-col relative text-slate-900 dark:text-white transition-colors duration-200">

    <div
      class="fixed top-0 left-0 w-full h-1.5 bg-linear-to-r from-primary/30 via-primary to-primary/30 opacity-50 z-60">
    </div>
    <div class="fixed -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="fixed -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

    <nav
      class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 top-0 z-50 relative">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <div class="bg-primary p-2 rounded-lg shadow-sm flex items-center justify-center">
            <span class="material-icons text-white text-xl">payments</span>
          </div>
          <span class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">RestoKita</span>
        </div>
        <div class="flex items-center space-x-6">
          <div class="hidden md:flex items-center space-x-2 text-slate-500">
            <span class="material-icons text-sm">person</span>
            <span class="text-sm font-bold uppercase">{{ auth.profile?.username || 'Waiters' }}</span>
          </div>
          <button @click="signOut"
            class="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors cursor-pointer">
            <span class="material-icons text-lg">logout</span>
            <span class="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>

    <main class="grow flex flex-col p-6 md:p-12 relative z-10">
      <div class="w-full max-w-7xl mx-auto grow flex flex-col">

        <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 class="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">Pending Payments</h2>
            <p class="text-slate-500 dark:text-slate-400 text-lg">Orders served and awaiting settlement</p>
          </div>
          <div
            class="flex items-center bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-bold">
            <span class="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
            {{ totalUnpaidCount }} UNPAID ORDERS
          </div>
        </div>

        <div class="mb-10">
          <div
            class="search-container relative flex items-center bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl transition-all duration-200 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary">
            <div class="pl-6 pointer-events-none">
              <span class="material-symbols-outlined text-slate-400 text-3xl">search</span>
            </div>
            <input ref="searchInputRef" v-model="searchQuery"
              class="w-full py-5 px-4 bg-transparent border-none outline-none focus:ring-0 text-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
              placeholder="Search Table Number or Guest..." type="text" />
            <div class="pr-6">
              <kbd
                class="hidden md:inline-flex items-center px-2 py-1 text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg">
                ⌘ K
              </kbd>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">

          <div v-if="isLoading"
            class="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <div class="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4">
            </div>
            <p class="text-slate-500">Loading pending payments...</p>
          </div>

          <div v-else-if="filteredOrders.length === 0"
            class="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">search_off</span>
            <h3 class="text-xl font-bold text-slate-500 dark:text-slate-400">No tables found</h3>
            <p class="text-slate-400 mt-2">Could not find any pending payments matching "{{ searchQuery }}".</p>
          </div>

          <div v-for="order in filteredOrders" :key="order.id"
            class="order-card bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-full hover:-translate-y-1 hover:shadow-md transition-all duration-200">
            <div>
              <div class="flex justify-between items-start mb-6">
                <div class="flex items-center space-x-4">
                  <div
                    class="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-2xl font-black text-primary">
                    {{ order.table }}
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Table Number</h4>
                    <p class="text-lg font-bold text-slate-900 dark:text-white">{{ order.location }}</p>
                  </div>
                </div>
                <span
                  class="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">
                  {{ order.status }}
                </span>
              </div>

              <div class="space-y-4 mb-8">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-slate-500 font-medium">Guest:</span>
                  <span class="text-slate-900 dark:text-slate-300 font-bold">{{ order.waitress }}</span>
                </div>
                <div class="h-px bg-slate-100 dark:bg-slate-700 w-full"></div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-500 font-medium">Total Amount:</span>
                  <span class="text-2xl font-black text-primary">{{ formatPrice(order.total) }}</span>
                </div>
              </div>
            </div>

            <button @click="processPayment(order)"
              class="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg shadow-primary/20 cursor-pointer mt-auto">
              <span class="material-symbols-outlined">payments</span>
              <span>Process Payment</span>
            </button>
          </div>
        </div>

        <div class="flex justify-center mt-auto">
          <button @click="$router.push('/waiters')"
            class="group flex items-center space-x-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 px-8 py-4 rounded-2xl hover:border-primary transition-all active:scale-95 shadow-sm cursor-pointer">
            <span class="material-icons text-slate-400 group-hover:text-primary">arrow_back</span>
            <span class="font-bold text-slate-600 dark:text-slate-300 group-hover:text-primary">Back to Hub</span>
          </button>
        </div>
      </div>
    </main>

    <footer class="p-8 text-center relative z-10">
      <div
        class="inline-flex items-center space-x-2 px-4 py-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold">
        <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
        <span>RestoKita Pro Edition • Terminal v2.4.0</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Icon Fonts Configuration */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 48;
}

/* Ensure no default outline on the search input overrides custom focus styling */
input[type="text"]:focus {
  outline: none;
}
</style>