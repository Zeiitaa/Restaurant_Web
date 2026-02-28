import {
  createRouter,
  createWebHistory
} from 'vue-router'
import {
  useAuthStore
} from '@/stores/auth'

// ─── JWT helpers ────────────────────────────────────────────────────────────
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token)
  if (!payload?.exp) return true
  return Date.now() / 1000 > payload.exp
}

function roleDashboard(role) {
  if (role === 'admin') return '/admin'
  if (role === 'waiters') return '/waiters'
  return '/'
}

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

// admin
import Dashboard from '@/views/admin/Dashboard.vue'
import OrderHistory from '@/views/admin/OrderHistory.vue'
import ManageMenu from '@/views/admin/ManageMenu.vue'
import ManageStaff from '@/views/admin/ManageStaff.vue'
import ManageTable from '@/views/admin/ManageTable.vue'
import ManageCategory from '@/views/admin/ManageCategory.vue'

import NotFound from '@/views/notFound.vue'

const router = createRouter({
  history: createWebHistory(
    import.meta.env.BASE_URL),
  routes: [
    // ── Guest-only routes ──────────────────────────────────────────────────
    {
      path: '/',
      name: 'login',
      component: Login,
      meta: {
        guestOnly: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: {
        guestOnly: true
      }
    },
    {
      path: '/register-detail',
      name: 'regisdetail',
      component: registDetail,
      meta: {
        guestOnly: true
      }
    },
    {
      path: '/forgot-password',
      name: 'forgot',
      component: forgot,
      meta: {
        guestOnly: true
      }
    },
    {
      path: '/verify-otp',
      name: 'verify-otp',
      component: VerifyOTP,
      meta: {
        guestOnly: true
      }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: resetPassword,
      meta: {
        guestOnly: true
      }
    },

    // ── General auth ───────────────────────────────────────────────────────
    {
      path: '/home',
      name: 'home',
      component: homeview,
      meta: {
        requiresAuth: true
      }
    },

    // ── Waiters routes ─────────────────────────────────────────────────────
    {
      path: '/waiters',
      name: 'waiters',
      component: ActionHub,
      meta: {
        requiresAuth: true,
        role: 'waiters'
      }
    },
    {
      path: '/waiters/menu/:tableCode?',
      name: 'waiters-menu',
      component: Menu,
      meta: {
        requiresAuth: true,
        role: 'waiters'
      }
    },
    {
      path: '/waiters/table',
      name: 'waiters-table',
      component: Table,
      meta: {
        requiresAuth: true,
        role: 'waiters'
      }
    },
    {
      path: '/waiters/ongoing-order',
      name: 'waiters-ongoing-order',
      component: OngoingOrder,
      meta: {
        requiresAuth: true,
        role: 'waiters'
      }
    },
    {
      path: '/waiters/payment',
      name: 'waiters-sum-payment',
      component: Payment,
      meta: {
        requiresAuth: true,
        role: 'waiters'
      }
    },
    {
      path: '/waiters/payment-detail/:id',
      name: 'waiters-payment-detail',
      component: SumNPayment,
      meta: {
        requiresAuth: true,
        role: 'waiters'
      }
    },

    // ── Admin routes ───────────────────────────────────────────────────────
    {
      path: '/admin',
      name: 'admin',
      component: Dashboard,
      meta: {
        requiresAuth: true,
        role: 'admin'
      }
    },
    {
      path: '/admin/order-history',
      name: 'admin-order-history',
      component: OrderHistory,
      meta: {
        requiresAuth: true,
        role: 'admin'
      }
    },
    {
      path: '/admin/manage-menu',
      name: 'admin-manage-menu',
      component: ManageMenu,
      meta: {
        requiresAuth: true,
        role: 'admin'
      }
    },
    {
      path: '/admin/manage-staff',
      name: 'admin-manage-staff',
      component: ManageStaff,
      meta: {
        requiresAuth: true,
        role: 'admin'
      }
    },
    {
      path: '/admin/manage-staff/:id',
      name: 'admin-manage-staff-edit',
      component: ManageStaff,
      meta: {
        requiresAuth: true,
        role: 'admin'
      }
    },
    {
      path: '/admin/manage-table',
      name: 'admin-manage-table',
      component: ManageTable,
      meta: {
        requiresAuth: true,
        role: 'admin'
      }
    },
    {
      path: '/admin/manage-category',
      name: 'admin-manage-category',
      component: ManageCategory,
      meta: {
        requiresAuth: true,
        role: 'admin'
      }
    },

    // ── Fallback ───────────────────────────────────────────────────────────
    {
      path: '/:catchAll(.*)',
      name: 'not-found',
      component: NotFound
    },
  ],
})

export default router

// ─── Navigation Guard ────────────────────────────────────────────────────────
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  const token = auth.token

  // 1. Token expired -> clear session and go to login
  if (token && isTokenExpired(token)) {
    auth.$patch({
      token: null,
      profile: null,
      token_reset: null
    })
    localStorage.removeItem('token')
    localStorage.removeItem('profile')
    localStorage.removeItem('token_reset')
    return next({
      path: '/',
      query: {
        reason: 'expired'
      }
    })
  }

  const loggedIn = !!token
  const userRole = auth.profile?.role

  // 2. Guest-only pages (login, register, etc.) -> redirect logged-in users to their dashboard
  if (to.meta.guestOnly && loggedIn) {
    return next(roleDashboard(userRole))
  }

  // 3. Protected pages -> redirect guests to login
  if (to.meta.requiresAuth && !loggedIn) {
    return next({
      path: '/',
      query: {
        redirect: to.fullPath
      }
    })
  }

  // 4. Role-restricted pages -> redirect to correct dashboard if wrong role
  if (to.meta.role && userRole !== to.meta.role) {
    return next(roleDashboard(userRole))
  }

  next()
})