<script setup>
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const auth = useAuthStore()

const goBack = () => {
    router.back()
}

const goToDashboard = () => {
  console.log('Navigating to dashboard...')
  // router.push('/dashboard')
}
</script>

<template>
  <div class="font-['Inter'] bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-6 overflow-hidden text-slate-900 dark:text-slate-50 antialiased">
    
    <div class="fixed top-0 left-0 w-full h-1 bg-linear-to-r from-primary/20 via-primary to-primary/20 opacity-30 z-0"></div>
    <div class="fixed -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl z-0 pointer-events-none"></div>
    <div class="fixed -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl z-0 pointer-events-none"></div>

    <div class="fixed bottom-10 right-10 opacity-10 dark:opacity-5 hidden md:block z-0 pointer-events-none">
      <span class="material-symbols-outlined text-[100px] text-slate-900 dark:text-white">restaurant</span>
    </div>
    <div class="fixed top-10 left-10 opacity-10 dark:opacity-5 hidden md:block z-0 pointer-events-none">
      <span class="material-symbols-outlined text-[100px] text-slate-900 dark:text-white">flatware</span>
    </div>

    <div class="w-full max-w-2xl text-center z-10">
      
      <div class="flex flex-col items-center mb-12">
        <div class="bg-primary p-3 rounded-xl mb-3 shadow-lg shadow-primary/20">
          <span class="material-icons text-white text-3xl">restaurant_menu</span>
        </div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">RestoManage</h1>
      </div>

      <div class="relative mb-12">
        <div class="flex justify-center items-center">
          <div class="flex items-center space-x-4">
            <span class="text-[120px] md:text-[180px] font-black text-slate-200 dark:text-slate-800 leading-none select-none">
              4
            </span>
            
            <div class="relative flex items-center justify-center">
              <div class="w-32 h-32 md:w-48 md:h-48 rounded-full border-8 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                <span class="material-symbols-outlined text-slate-300 dark:text-slate-700 text-6xl md:text-8xl">no_food</span>
              </div>
              <div class="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 p-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-800">
                <span class="material-icons text-primary text-2xl md:text-3xl">search_off</span>
              </div>
            </div>
            
            <span class="text-[120px] md:text-[180px] font-black text-slate-200 dark:text-slate-800 leading-none select-none">
              4
            </span>
          </div>
        </div>
      </div>

      <div class="max-w-md mx-auto">    
        <h2 class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Oops! Page Not Found</h2>
        <p class="text-lg text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
          The page you are looking for might have been moved or doesn't exist. Let's get you back on track.
        </p>
        
        <button 
          @click="goBack"
          class="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-10 rounded-xl shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
        >
          <span class="material-icons mr-2 text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span>Go back to where you left</span>
        </button>
      </div>

      <div class="mt-20 flex flex-wrap justify-center gap-8 text-sm text-slate-400 dark:text-slate-500 font-medium">
        <a href="#" class="hover:text-primary transition-colors flex items-center">
          <span class="material-icons text-base mr-1.5">help_outline</span>
          Need help?
        </a>
        <a href="#" class="hover:text-primary transition-colors flex items-center">
          <span class="material-icons text-base mr-1.5">report_problem</span>
          Report Issue
        </a>
        <a href="#" @click.prevent="goToDashboard" class="hover:text-primary transition-colors flex items-center">
          <span class="material-icons text-base mr-1.5">home</span>
          Dashboard
        </a>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Pastikan material symbols di-load dengan benar di environment Vue Anda */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>