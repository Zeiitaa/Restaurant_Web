<script setup>
import { ref, onMounted } from 'vue'
import { useTableStore } from '@/stores/table'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// --- State ---
const appVersion = ref('v1.0.0')
const tableStore = useTableStore()
const authStore = useAuthStore()

// --- Actions ---
onMounted(async () => {
  await tableStore.fetchTableAvailable()
})

const handleSignOut = () => {
  if (confirm('Are you sure you want to sign out?')) {
    authStore.logout()
    router.push('/')
  }
}

const selectTable = (table) => {
  if (table.status === 'booked') return
  console.log(`Table ${table.table_code} selected!`)
  router.push({ name: 'waiters-menu', params: { tableCode: table.table_code } })
}

const goBack = () => {
  router.push('/waiters')
}
</script>

<template>
  <div
    class="font-['Inter'] bg-background-light_action dark:bg-background-dark_action min-h-screen flex flex-col relative overflow-hidden">

    <div
      class="fixed top-0 left-0 w-full h-1.5 bg-linear-to-r from-primary/30 via-primary to-primary/30 opacity-50 z-20">
    </div>

    <nav class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 z-10 relative">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <div class="bg-primary p-2 rounded-lg shadow-sm">
            <span class="material-icons text-white text-xl">restaurant_menu</span>
          </div>
          <span class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">RestoKita</span>
        </div>
        <button @click="handleSignOut"
          class="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors cursor-pointer">
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

        <div v-if="tableStore.tableAvailable.length == 0" class="flex justify-center gap-4 md:gap-6 mb-16">
          <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Currently No Table are Available </h2>
        </div>


        <div v-else class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-16">

          <button v-for="table in tableStore.tableAvailable" :key="table.id" @click="selectTable(table)" :class="[
            'table-card flex flex-col items-center justify-center text-center space-y-4 min-h-45 rounded-3xl transition-all duration-300',
            table.status === 'available'
              ? 'bg-white dark:bg-slate-800 border-2 border-primary/20 hover:border-primary shadow-sm hover:shadow-xl hover:shadow-primary/10 cursor-pointer'
              : 'bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed'
          ]" :disabled="table.status === 'booked'">
            <span
              :class="['text-4xl font-bold transition-colors', table.status === 'available' ? 'text-primary' : 'text-slate-400']">
              {{ table.table_code }}
            </span>

            <div
              :class="['flex items-center space-x-1 transition-colors', table.status === 'available' ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400']">
              <span class="material-symbols-outlined text-xl">
                groups
              </span>
              <span class="font-semibold uppercase text-xs tracking-wider">{{ table.capacity }} Seats</span>
            </div>

            <div v-if="table.status === 'available'"
              class="flex items-center space-x-1.5 text-primary text-[10px] font-bold uppercase tracking-wider">
              <span class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
              <span>Available</span>
            </div>
            <span v-else class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <button
                class="btn btn-primary"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#Id1"
                aria-controls="Id1"
              >
                Enable both scrolling & backdrop
              </button>
              
              <div
                class="offcanvas offcanvas-start"
                data-bs-scroll="true"
                tabindex="-1"
                id="Id1"
                aria-labelledby="Enable both scrolling & backdrop"
              >
                <div class="offcanvas-header">
                  <h5 class="offcanvas-title" id="Enable both scrolling & backdrop">
                    Backdrop with scrolling
                  </h5>
                  <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                  ></button>
                </div>
                <div class="offcanvas-body">
                  <p>
                    Try scrolling the rest of the page to see this option in
                    action.
                  </p>
                </div>
              </div>
              
            </span>
          </button>

        </div>

        <div class="flex justify-center">
          <button @click="goBack"
            class="group w-full max-w-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-8 py-5 flex items-center justify-center shadow-sm hover:border-primary transition-colors cursor-pointer">
            <div class="flex items-center space-x-4">
              <div
                class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <span class="material-icons text-slate-400 group-hover:text-primary">arrow_back</span>
              </div>
              <div class="text-left">
                <p
                  class="text-xs font-semibold text-slate-400 group-hover:text-primary uppercase tracking-wider transition-colors">
                  Navigation</p>
                <p class="text-base font-bold text-slate-900 dark:text-white transition-colors">Back to Service Hub</p>
              </div>
            </div>
          </button>
        </div>

      </div>
    </main>

    <footer class="p-8 text-center z-10 relative">
      <div
        class="inline-flex items-center space-x-2 px-4 py-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold">
        <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
        <span>RestoKita Pro Edition • Terminal {{ appVersion }}</span>
      </div>
    </footer>

    <div class="fixed -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0">
    </div>
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