import {
    ref,
    computed
} from 'vue'
import {
    defineStore
} from 'pinia'
import api from '@/helpers/api'
import router from '@/router'
import {
    useAuthStore
} from './auth'
import {
    useCategoryStore
} from './category'

export const useMenuStore = defineStore('menu', {
    state: () => ({
        menu: JSON.parse(localStorage.getItem("menu")) || null,
        menuAvailable: JSON.parse(localStorage.getItem("menuAvailable")) || null,


    }),

    actions: {
        async fetchMenu() {
            try {
                const menuData = await api.get(`/menu/`)
                this.menu = menuData.data
                localStorage.setItem("menu", JSON.stringify(menuData.data))
            } catch (error) {
                console.error("Failed to fetch meu", error);
                throw error
            }
        },

        async fetchMenuById(id) {
            try {
                const res = await api.get(`/menu/${id}`)
                return res.data
            } catch (error) {
                console.error("Failed to fetch menu by id", error);
                throw error
            }
        },
        async fetchMenuAvailable() {
            try {
                const res = await api.get(`/menu/available`)
                this.menuAvailable = res.data
                localStorage.setItem("menuAvailable", JSON.stringify(res.data))
            } catch (error) {
                console.error("Failed to fetch menu available", error);
                throw error
            }
        },

        // create dan patch ada di masing masing page aja
    }
})