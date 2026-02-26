import {
    defineStore
} from "pinia"
import api from "@/helpers/api"
import {
    useAuthStore
} from "./auth"

export const useTableStore = defineStore('table', {
    state: () => ({
        table: JSON.parse(localStorage.getItem("table")) || null,
        tableAvailable: JSON.parse(localStorage.getItem("tableAvailable")) || null,
    }),

    actions: {

        async fetchTable() {
            try {
                const res = await api.get(`/table/`)
                this.table = res.data
                localStorage.setItem("table", JSON.stringify(res.data))
            } catch (error) {
                console.error("error registering account", error);
                throw error
            }
        },

        async fetchTableAvailable() {
            try {
                const tableData = await api.get(`/table/available`)
                this.tableAvailable = tableData.data
                localStorage.setItem("tableAvailable", JSON.stringify(tableData.data))
            } catch (error) {
                console.error(error);
            }
        },

        async fetchTableById(code) {
            try {
                const table = await api.get(`/table/${code}`)
                return table.data
            } catch (error) {
                console.error(error);
                throw error
            }
        },

        async updateTable(code) {
            try {
                const res = await api.patch(`/table/${code}`)
                console.log(res);
            } catch (error) {
                console.error("error registering account", error);
                throw error
            }
        },

        async createTable(code, status, capacity) {
            const auth = useAuthStore()
            try {
                const res = await api.post(`/table/`, {
                    table_code: code,
                    status: status,
                    capacity: capacity
                }, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`
                    }
                })

                console.log(res);
            } catch (error) {
                console.error("error registering account", error);
                throw error
            }
        }


    }
})