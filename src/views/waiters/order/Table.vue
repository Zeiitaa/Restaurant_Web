<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

// --- State ---
const appVersion = ref('v2.4.0')

// --- Dummy Data Meja ---
// Status 'available' = bisa diklik (biru)
// Status 'occupied' = tidak bisa diklik (abu-abu/disabled)
const tables = ref([
  { id: 1, number: '01', seats: 4, status: 'available' },
  { id: 2, number: '02', seats: 2, status: 'occupied' },
  { id: 3, number: '03', seats: 6, status: 'available' },
  { id: 4, number: '04', seats: 2, status: 'available' },
  { id: 5, number: '05', seats: 4, status: 'available' },
  { id: 6, number: '06', seats: 4, status: 'occupied' },
  { id: 7, number: '07', seats: 8, status: 'available' },
  { id: 8, number: '08', seats: 4, status: 'available' },
  { id: 9, number: '09', seats: 2, status: 'available' },
  { id: 10, number: '10', seats: 4, status: 'occupied' },
])

// --- Actions ---
const handleSignOut = () => {
  if (confirm('Are you sure you want to sign out?')) {
    console.log('Signing out...')
    // router.push('/login')
  }
}

const selectTable = (table) => {
  if (table.status === 'occupied') return
  console.log(`Table ${table.number} selected!`)
  // Lanjut ke pembuatan pesanan, misalnya:
  // router.push({ name: 'CreateOrder', params: { tableId: table.id } })
}

const goBack = () => {
  console.log('Navigating back to Service Hub...')
  // router.push('/service-hub') atau router.back()
}
</script>

<template>
  <div class="font-['Inter'] bg-background-light_action dark:bg-background_action min-h-screen flex flex-col relative overflow-hidden">
    
    <div class="fixed top-0 left-0 w-full h-1.5 bg-linear-to-r from-primary/30 via-primary to-primary/30 opacity-50 z-20"></div>

    <nav class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 z-10 relative">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <div class="bg-primary p-2 rounded-lg shadow-sm">
            <span class="material-icons text-white text-xl">restaurant_menu</span>
          </div>
          <span class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">RestoKita</span>
        </div>
        <button 
          @click="handleSignOut"
          class="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors cursor-pointer"
        >
          <span class="material-icons text-lg">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </nav>

    <main class="grow flex flex-col items-center p-6 md:p-12 z-10 relative">
      <div class="w-full max-w-7xl">
        
        <div class="text-center mb-10 md:mb-16">
          <h2 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Select a Table</h2>
          <p class="text-slate-500 dark:text-slate-400 text-lg">Choose an available table to begin the order</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-16">
          
          <button 
            v-for="table in tables" 
            :key="table.id"
            @click="selectTable(table)"
            :class="[
              'table-card flex flex-col items-center justify-center text-center space-y-4 min-h-45 rounded-3xl',
              table.status === 'available' 
                ? 'bg-primary hover:bg-blue-600 shadow-lg shadow-primary/20 cursor-pointer' 
                : 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 opacity-80 cursor-not-allowed'
            ]"
            :disabled="table.status === 'occupied'"
          >
            <span :class="['text-4xl font-bold', table.status === 'available' ? 'text-white' : 'text-slate-900 dark:text-white']">
              {{ table.number }}
            </span>
            
            <div :class="['flex items-center space-x-1', table.status === 'available' ? 'text-white/80' : 'text-slate-400']">
              <span :class="['material-symbols-outlined text-xl', table.status === 'occupied' && 'text-slate-300 dark:text-slate-500']">
                groups
              </span>
              <span class="font-semibold uppercase text-xs tracking-wider">{{ table.seats }} Seats</span>
            </div>
            
            <span v-if="table.status === 'occupied'" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Occupied
            </span>
          </button>
          
        </div>
        
        <div class="flex justify-center">
          <button 
            @click="goBack"
            class="group w-full max-w-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-8 py-5 flex items-center justify-center shadow-sm hover:border-primary transition-colors cursor-pointer"
          >
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <span class="material-icons text-slate-400 group-hover:text-primary">arrow_back</span>
              </div>
              <div class="text-left">
                <p class="text-xs font-semibold text-slate-400 group-hover:text-primary uppercase tracking-wider transition-colors">Navigation</p>
                <p class="text-base font-bold text-slate-900 dark:text-white transition-colors">Back to Service Hub</p>
              </div>
            </div>
          </button>
        </div>

      </div>
    </main>

    <footer class="p-8 text-center z-10 relative">
      <div class="inline-flex items-center space-x-2 px-4 py-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold">
        <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
        <span>RestoKita Pro Edition • Terminal {{ appVersion }}</span>
      </div>
    </footer>

    <div class="fixed -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
    <div class="fixed -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

  </div>
</template>

<style scoped>
/* Pastikan material symbols di-load dengan benar di environment Vue Anda */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 48;
}

/* Animasi klik */
.table-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.table-card:not(:disabled):active {
  transform: scale(0.96);
}
</style>