import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SuperAdmin {
  id: string
  name: string
  email: string
  role: string
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

interface Session {
  sessionId: string
  location: {
    country: string
    city: string
  }
  isSuspicious: boolean
}

interface SuperAdminState {
  admin: SuperAdmin | null
  token: string | null
  session: Session | null
  isAuthenticated: boolean
  sidebarCollapsed: boolean
  
  setAdmin: (admin: SuperAdmin) => void
  setToken: (token: string) => void
  setSession: (session: Session) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  logout: () => void
  clearAll: () => void
}

export const useSuperAdminStore = create<SuperAdminState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      session: null,
      isAuthenticated: false,
      sidebarCollapsed: false,

      setAdmin: (admin) => set({ 
        admin, 
        isAuthenticated: true 
      }),

      setToken: (token) => set({ token }),

      setSession: (session) => set({ session }),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      logout: () => set({ 
        admin: null, 
        token: null, 
        session: null, 
        isAuthenticated: false 
      }),

      clearAll: () => set({ 
        admin: null, 
        token: null, 
        session: null, 
        isAuthenticated: false 
      })
    }),
    {
      name: 'superadmin-storage',
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        sidebarCollapsed: state.sidebarCollapsed
      })
    }
  )
)
