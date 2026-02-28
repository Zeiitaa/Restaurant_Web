import {
    defineStore
} from "pinia";
import api from "@/helpers/api";
import {
    useAuthStore
} from "./auth.js";

export const useCategoryStore = defineStore('category', {
    state: () => ({
        category: JSON.parse(localStorage.getItem("category")) || null
    }),

    actions: {

        async fetchCategory() {
            try {
                const res = await api.get(`/category/`)
                this.category = res.data
                localStorage.setItem("category", JSON.stringify(res.data))
            } catch (error) {
                console.error("error fetching category data", error);
                throw error
            }
        },

        async fetchCategoryById(id) {
            try {
                const res = await api.get(`/category/${id}`)
                return res.data
            } catch (error) {
                console.error("error fetching category data by id", error);
                throw error
            }
        },

        async createCategory(name) {
            const auth = useAuthStore()
            try {
                const res = await api.post(`/category/`, {
                    name: name
                }, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`
                    }
                })
                console.log(res.data);
            } catch (error) {
                console.error("error creating category", error);
                throw error
            }
        },

        async updateCategory(id, name) {
            const auth = useAuthStore()
            try {
                const res = await api.patch(`/category/${id}`, {
                    name: name
                }, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`
                    }
                })
                console.log(res.data);
            } catch (error) {
                console.error("error registering account", error);
                throw error
            }
        }

    }
})