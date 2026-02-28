import {
    createApp
} from 'vue'
import {
    createPinia
} from 'pinia'
import './assets/main.css'

import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'
import "vue-toastification/dist/index.css"
import api from '@/helpers/api'
import {
    useAuthStore
} from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Toast)

// ─── Global 401 interceptor ───────────────────────────────────────────────────
// Runs after pinia is ready so useAuthStore() is safe to call
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            const auth = useAuthStore()
            // Only auto-logout if we actually had a token (avoid loop on login page)
            if (auth.token) {
                auth.logout()
            }
        }
        return Promise.reject(err)
    }
)

app.mount('#app')