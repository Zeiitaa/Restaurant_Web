import {
  ref,
  computed
} from 'vue'
import {
  defineStore
} from 'pinia'
import api from '@/helpers/api'
import {
  useToast
} from 'vue-toastification'
import router from '@/router'

const toast = useToast()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem("token") || null,
    profile: JSON.parse(localStorage.getItem("profile")) || null,
    tempEmail: localStorage.getItem("tempEmail") || null,
    token_reset: localStorage.getItem("token_reset") || null
  }),

  actions: {
    async fetchAuth(usn, pw) {
      try {
        const data = new FormData()
        data.set('grant_type', "password")
        data.set('username', usn)
        data.set('password', pw)
        data.set('scope', "")

        const FAuth = await api.post(`/auth/login`, data, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          }
        })

        // setor data ke pinia (auth.js)
        this.token = FAuth.data.access_token
        localStorage.setItem("token", this.token)
        return FAuth
      } catch (error) {
        this.token = null
        localStorage.removeItem("token")
        toast.error(error.response?.data?.detail || "Login Failed")
        console.error(error);
        throw error
      }
    },

    async fetchProfile() {

      try {
        const UProfile = await api.get(`/user/profile`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          }
        });

        this.profile = UProfile.data
        localStorage.setItem('profile', JSON.stringify(UProfile.data));
        return UProfile
      } catch (error) {
        this.profile = null
        localStorage.removeItem('profile')
        console.error(error);
        throw error
      }
    },

    async register(usn, email, pw, cpw) {
      try {
        const res = await api.post(`/auth/register`, {
          username: usn,
          password: pw,
          email: email,
          confirm_password: cpw
        })
        console.log(res);
        // toast.success("Account registered successfully!")
        this.fetchAuth(usn, pw)
      } catch (error) {
        toast.error(error.response?.data?.detail || "Error Registering your account")
        console.error("error registering account", error);
        throw error
      }
    },

    async registerDetail(name, phone, address) {
      try {
        const res = await api.post(`/auth/register-detail`, {
          name: name,
          phone_number: phone,
          address: address
        }, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          }
        })
        console.log(res);
        toast.success("Account registered successfully!")
      } catch (error) {
        toast.error(error.response?.data?.detail || "Error Registering your account details")
        console.error("error registering account", error);
        throw error
      }

    },

    async forgotPassword(email) {
      try {
        const res = await api.post(`/auth/forgot-password`, {
          email: email
        })
        console.log(res);
      } catch (error) {
        toast.error(error.response?.data?.detail || "Error Handling your request")
        console.error("error forgot password", error);
        throw error
      }
    },

    async verifyOTP(email, otp) {
      try {
        const res = await api.post(`/auth/verify-otp`, {
          email: email,
          otp_code: otp
        })
        console.log(res);
        this.token_reset = res.data.reset_token
        localStorage.setItem("token_reset", this.token_reset)
      } catch (error) {
        toast.error(error.response?.data?.detail || "Error Verifying OTP")
        console.error("error verifying OTP", error);
        throw error
      }
    },

    async resetPassword(reset_token, new_password) {
      try {
        const res = await api.post(`/auth/reset-password`, {
          reset_token: reset_token,
          new_password: new_password
        })
        console.log(res);
      } catch (error) {
        toast.error(error.response?.data?.detail || "Error Resetting Password")
        console.error("error resetting password", error);
        throw error
      }
    },

    async logout() {
      this.token = null
      this.profile = null
      this.tempEmail = null
      this.token_reset = null
      localStorage.removeItem('token')
      localStorage.removeItem('profile')
      localStorage.removeItem('token_reset')

      router.push('/')

    }
  },

  getters: {
    isWaiters: (state) =>
      state.profile?.role === 'waiters',

    isCustomer: (state) =>
      state.profile?.role === 'customer',

    isAdmin: (state) =>
      state.profile?.role === 'admin'

  }


})