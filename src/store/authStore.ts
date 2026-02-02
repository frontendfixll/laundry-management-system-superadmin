import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// User types
interface SuperAdmin {
  _id: string
  name: string
  email: string
  role: 'superadmin' | 'support' | 'auditor' | 'finance'
  roles: Array<{
    _id: string
    name: string
    slug: string
    description: string
    color: string
    permissions: Record<string, any>
  }>
  isActive: boolean
  mfaEnabled?: boolean
  profileImage?: string
}

interface SalesUser {
  _id: string
  name: string
  email: string
  phone?: string
  employeeId?: string
  designation: string
  role: 'sales_admin'
  roles?: Array<{
    name: string
    slug: string
    description?: string
    color?: string
    permissions?: any
  }>
  performance: {
    leadsAssigned: number
    leadsConverted: number
    conversionRate: number
    totalRevenue: number
    currentMonthRevenue: number
    target: number
    targetAchieved: number
    avgDealSize: number
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
  userType: 'superadmin' | 'sales' | 'support' | 'auditor' | 'finance' | null
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
        // Determine user type based on role and RBAC roles
        let userType: 'superadmin' | 'sales' | 'support' | 'auditor' | 'finance' = 'superadmin'

        console.log('🏪 Auth Store - Setting user:', {
          email: user.email,
          legacyRole: user.role,
          rolesCount: user.roles?.length || 0,
          firstRoleName: user.roles?.[0]?.name,
          firstRoleSlug: user.roles?.[0]?.slug
        })

        // Check RBAC roles first (if available)
        if (user.roles && user.roles.length > 0) {
          const primaryRole = user.roles[0]
          const slug = (primaryRole.slug || '').toLowerCase().replace(/-/g, '_')
          const name = (primaryRole.name || '').toLowerCase()

          console.log('🏪 Auth Store - Normalizing role:', { slug, name })

          if (slug.includes('support') || name.includes('support')) {
            userType = 'support'
          } else if (slug.includes('auditor') || name.includes('auditor')) {
            userType = 'auditor'
          } else if (slug.includes('finance') || name.includes('finance')) {
            userType = 'finance'
          } else if (slug.includes('super_admin') || slug.includes('superadmin') || name.includes('super admin')) {
            userType = 'superadmin'
          }

          console.log('🏪 Auth Store - Classified userType:', userType)
        } else {
          // Fallback to legacy role field
          console.log('🏪 Auth Store - No RBAC roles, checking legacy role:', user.role)

          if (user.role === 'superadmin') {
            userType = 'superadmin'
            console.log('🏪 Auth Store - Classified as SUPERADMIN via legacy role')
          } else if (user.role === 'support') {
            userType = 'support'
            console.log('🏪 Auth Store - Classified as SUPPORT via legacy role')
          } else if (user.role === 'auditor') {
            userType = 'auditor'
            console.log('🏪 Auth Store - Classified as AUDITOR via legacy role')
          } else if (user.role === 'finance') {
            userType = 'finance'
            console.log('🏪 Auth Store - Classified as FINANCE via legacy role')
          } else if (user.role === 'sales_admin') {
            userType = 'sales'
            console.log('🏪 Auth Store - Classified as SALES via legacy role')
          } else {
            // Default fallback
            userType = 'superadmin'
            console.log('🏪 Auth Store - Unknown legacy role, defaulting to SUPERADMIN')
          }
        }

        console.log('🏪 Auth Store - Final userType:', userType)

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
export const useAuthInfo = () => {
  const { user, userType } = useAuthStore()

  const getPrimaryRoleName = () => {
    if (user?.roles && user.roles.length > 0) {
      return user.roles[0].name
    }
    // Fallback to legacy role or userType
    if (userType === 'superadmin') return 'Super Admin'
    if (userType === 'finance') return 'Finance Admin'
    if (userType === 'support') return 'Support Agent'
    if (userType === 'auditor') return 'Platform Auditor'
    if (userType === 'sales') return (user as any)?.designation || 'Sales Agent'
    return 'User'
  }

  const hasPermission = (module: string, action: string = 'view') => {
    // SuperAdmin bypass - Check both userType and legacy role
    if (userType === 'superadmin' || (user as any)?.role === 'superadmin') return true

    // Check RBAC role first (if available)
    const permissions = (user as any)?.permissions || {}
    const modulePerms = permissions[module]

    console.log(`🔐 Permission Check [${module}.${action}]:`, {
      hasModule: !!modulePerms,
      permValue: modulePerms,
      userType
    })

    if (!modulePerms) return false

    // Handle compact string format ("rc")
    if (typeof modulePerms === 'string') {
      const SHORT_CODES: Record<string, string> = { 'r': 'view', 'c': 'create', 'u': 'update', 'd': 'delete', 'e': 'export' }
      const char = Object.keys(SHORT_CODES).find(key => SHORT_CODES[key] === action)
      return char ? modulePerms.includes(char) : false
    }

    // Handle object format ({ view: true })
    if (typeof modulePerms === 'object') {
      return modulePerms[action] === true || modulePerms[action === 'view' ? 'r' : action] === true
    }

    // Fallback to boolean
    return modulePerms === true
  }

  return {
    user,
    userType,
    roleName: getPrimaryRoleName(),
    email: user?.email || '',
    name: user?.name || '',
    hasPermission
  }
}

export const useSuperAdmin = () => {
  const { user } = useAuthStore()
  return user as SuperAdmin
}

export const useSalesUser = () => {
  const { user } = useAuthStore()
  return user as SalesUser
}

export const useFinanceUser = () => {
  const { user } = useAuthStore()
  return user as SuperAdmin // Finance users are currently SuperAdmin documents with specific roles
}

export const useAuditorUser = () => {
  const { user } = useAuthStore()
  return user as SuperAdmin // Auditor users are currently SuperAdmin documents with specific roles
}
