import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// User types
interface SuperAdmin {
  id: string
  name: string
  email: string
  role: 'superadmin'
  permissions: {
    branches: boolean
    users: boolean
    orders: boolean
    finances: boolean
    analytics: boolean
    settings: boolean
  }
  avatar?: string
  mfaEnabled: boolean
}

interface SalesUser {
  _id: string
  name: string
  email: string
  phone?: string
  employeeId?: string
  designation: string
  role: 'sales_admin'
  performance: {
    leadsAssigned: number
    leadsConverted: number
    conversionRate: number
    totalRevenue: number
    currentMonthRevenue: number
    target: number
    targetAchieved: number
  }
  permissions: {
    leads: {
      view: boolean
      create: boolean
      update: boolean
      delete: boolean
      export: boolean
    }
    trials: {
      view: boolean
      extend: boolean
      convert: boolean
    }
    subscriptions: {
      view: boolean
      activate: boolean
      pause: boolean
      upgrade: boolean
      downgrade: boolean
    }
    plans: {
      view: boolean
      assign: boolean
      customPricing: boolean
      createPlan: boolean
    }
    payments: {
      view: boolean
      generateLink: boolean
      recordOffline: boolean
      markPaid: boolean
    }
    analytics: {
      view: boolean
      export: boolean
    }
  }
}

type User = SuperAdmin | SalesUser

interface Session {
  sessionId: string
  location?: {
    country: string
    city: string
  }
  isSuspicious?: boolean
  expiresAt?: string
}

interface AuthState {
  user: User | null
  token: string | null
  session: Session | null
  isAuthenticated: boolean
  userType: 'superadmin' | 'sales' | null
  sidebarCollapsed: boolean
  newLeadsCount: number
  
  setUser: (user: User) => void
  setToken: (token: string) => void
  setSession: (session: Session) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setNewLeadsCount: (count: number) => void
  logout: () => void
  clearAll: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      session: null,
      isAuthenticated: false,
      userType: null,
      sidebarCollapsed: false,
      newLeadsCount: 0,

      setUser: (user) => {
        const userType = user.role === 'superadmin' ? 'superadmin' : 'sales'
        set({ 
          user, 
          isAuthenticated: true,
          userType
        })
      },

      setToken: (token) => set({ token }),

      setSession: (session) => set({ session }),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setNewLeadsCount: (count) => set({ newLeadsCount: count }),

      logout: () => set({ 
        user: null, 
        token: null, 
        session: null, 
        isAuthenticated: false,
        userType: null,
        newLeadsCount: 0
      }),

      clearAll: () => set({ 
        user: null, 
        token: null, 
        session: null, 
        isAuthenticated: false,
        userType: null,
        newLeadsCount: 0
      })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        userType: state.userType,
        sidebarCollapsed: state.sidebarCollapsed,
        newLeadsCount: state.newLeadsCount
      })
    }
  )
)

// Helper hooks for type-safe access
export const useSuperAdmin = () => {
  const { user, userType } = useAuthStore()
  if (userType === 'superadmin') {
    return user as SuperAdmin
  }
  return null
}

export const useSalesUser = () => {
  const { user, userType } = useAuthStore()
  if (userType === 'sales') {
    return user as SalesUser
  }
  return null
}
