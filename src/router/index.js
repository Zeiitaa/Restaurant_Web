import {
  createRouter,
  createWebHistory
} from 'vue-router'

import homeview from '@/views/homeview.vue'

// auth
import Login from '@/views/auth/login.vue'
import Register from '@/views/auth/register.vue'
import registDetail from '@/views/auth/registDetail.vue'
import forgot from '@/views/auth/forgot.vue'
import VerifyOTP from '@/views/auth/VerifyOTP.vue'
import resetPassword from '@/views/auth/resetPassword.vue'

// waiters
import ActionHub from '@/views/waiters/ActionHub.vue'
import Menu from '@/views/waiters/order/Menu.vue'
import Table from '@/views/waiters/order/Table.vue'
import OngoingOrder from '@/views/waiters/order/OngoingOrder.vue'
import SumNPayment from '@/views/waiters/order/SumNPayment.vue'
import Payment from '@/views/waiters/order/Payment.vue'

import NotFound from '@/views/notFound.vue'


const router = createRouter({
  history: createWebHistory(
    import.meta.env.BASE_URL),
  routes: [{
      path: '/',
      name: 'login',
      component: Login,
    },
    {
      path: '/home',
      name: 'home',
      component: homeview
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/register-detail',
      name: 'regisdetail',
      component: registDetail
    },
    {
      path: '/forgot-password',
      name: 'forgot',
      component: forgot
    },
    {
      path: '/verify-otp',
      name: 'verify-otp',
      component: VerifyOTP
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: resetPassword
    },
    {
      path: '/waiters',
      name: 'waiters',
      component: ActionHub
    },
    {
      path: '/waiters/menu/:tableCode?',
      name: 'waiters-menu',
      component: Menu
    },
    {
      path: '/waiters/table',
      name: 'waiters-table',
      component: Table
    },
    {
      path: '/waiters/ongoing-order',
      name: 'waiters-ongoing-order',
      component: OngoingOrder
    },
    {
      path: '/waiters/payment',
      name: 'waiters-sum-payment',
      component: Payment
    },

    {
      path: '/waiters/payment-detail/:id',
      name: 'waiters-payment-detail',
      component: SumNPayment
    },
    {
      path: '/:catchAll(.*)',
      name: 'not-found',
      component: NotFound
    },

  ],
})

export default router