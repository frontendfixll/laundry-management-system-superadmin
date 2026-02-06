const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class SuperAdminAPI {
  private getAuthHeaders() {
    let token = null

    // Try unified auth-storage (new unified store)
    const authData = localStorage.getItem('auth-storage')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        token = parsed.state?.token || parsed.token
      } catch (e) {
        console.error('Error parsing auth-storage:', e)
      }
    }

    // Fallback to legacy superadmin-storage
    if (!token) {
      const superAdminData = localStorage.getItem('superadmin-storage')
      if (superAdminData) {
        try {
          const parsed = JSON.parse(superAdminData)
          token = parsed.state?.token || parsed.token
        } catch (e) {
          console.error('Error parsing superadmin-storage:', e)
        }
      }
    }

    // Fallback to legacy token keys
    if (!token) {
      token = localStorage.getItem('superadmin-token') || localStorage.getItem('superAdminToken') || localStorage.getItem('token')
    }

    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private async handleResponse(response: Response) {
    const contentType = response.headers.get('content-type')

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Non-JSON response received:', text)
      throw new Error(`Server returned non-JSON response. Status: ${response.status}. Content: ${text.substring(0, 200)}`)
    }

    let data
    try {
      data = await response.json()
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError)
      throw new Error('Server returned invalid JSON response')
    }

    if (!response.ok) {
      // Handle 401 Unauthorized - auto logout
      if (response.status === 401) {
        // console.log('🔴 401 Unauthorized - clearing auth data')
        this.clearAuthData()
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login?expired=true'
        }
        throw new Error('Session expired. Please login again.')
      }

      // Show validation errors if available
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map((e: any) => e.msg || e.message).join(', ')
        throw new Error(errorMessages || data.message || 'Validation failed')
      }
      throw new Error(data.message || 'API request failed')
    }

    return data
  }

  // Clear all auth data from localStorage
  private clearAuthData() {
    if (typeof window === 'undefined') return

    // Clear unified auth storage
    const authData = localStorage.getItem('auth-storage')
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        parsed.state = {
          user: null,
          token: null,
          session: null,
          isAuthenticated: false,
          userType: null,
          sidebarCollapsed: false,
          newLeadsCount: 0
        }
        localStorage.setItem('auth-storage', JSON.stringify(parsed))
      } catch (e) {
        localStorage.removeItem('auth-storage')
      }
    }

    // Clear legacy superadmin storage
    const superAdminData = localStorage.getItem('superadmin-storage')
    if (superAdminData) {
      try {
        const parsed = JSON.parse(superAdminData)
        parsed.state = {
          admin: null,
          token: null,
          session: null,
          isAuthenticated: false,
          sidebarCollapsed: false
        }
        localStorage.setItem('superadmin-storage', JSON.stringify(parsed))
      } catch (e) {
        localStorage.removeItem('superadmin-storage')
      }
    }

    // Clear legacy keys
    localStorage.removeItem('superadmin-token')
    localStorage.removeItem('superAdminToken')
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    return this.handleResponse(response)
  }

  async verifyMFA(mfaToken: string, otp?: string, backupCode?: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/auth/verify-mfa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mfaToken, otp, backupCode })
    })

    return this.handleResponse(response)
  }

  async logout() {
    const response = await fetch(`${API_BASE_URL}/superadmin/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async logoutAll() {
    const response = await fetch(`${API_BASE_URL}/superadmin/auth/logout-all`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/superadmin/auth/profile`, {
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async enableMFA() {
    const response = await fetch(`${API_BASE_URL}/superadmin/auth/mfa/enable`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async disableMFA(password: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/auth/mfa/disable`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ password })
    })

    return this.handleResponse(response)
  }

  // Dashboard
  async getDashboardOverview(timeframe: string = '30d') {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/dashboard/overview?timeframe=${timeframe}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getDetailedAnalytics(params: {
    startDate: string
    endDate: string
    groupBy?: string
    metrics?: string[]
  }) {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      ...(params.groupBy && { groupBy: params.groupBy }),
      ...(params.metrics && { metrics: params.metrics.join(',') })
    })

    const response = await fetch(
      `${API_BASE_URL}/superadmin/dashboard/analytics?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  // Branch Management
  async getBranches(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    city?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/branches?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getBranch(branchId: string) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/branches/${branchId}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async createBranch(branchData: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/branches`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(branchData)
    })

    return this.handleResponse(response)
  }

  async updateBranch(branchId: string, branchData: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/branches/${branchId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(branchData)
    })

    return this.handleResponse(response)
  }

  async deleteBranch(branchId: string, permanent: boolean = false) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/branches/${branchId}?permanent=${permanent}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      }
    )

    return this.handleResponse(response)
  }

  async assignManager(branchId: string, managerId: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/branches/${branchId}/manager`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ managerId })
    })

    return this.handleResponse(response)
  }

  async addStaff(branchId: string, staffData: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/branches/${branchId}/staff`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(staffData)
    })

    return this.handleResponse(response)
  }

  async removeStaff(branchId: string, userId: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/branches/${branchId}/staff/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async getBranchAnalytics(branchId: string, params: {
    startDate: string
    endDate: string
    groupBy?: string
  }) {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      ...(params.groupBy && { groupBy: params.groupBy })
    })

    const response = await fetch(
      `${API_BASE_URL}/superadmin/branches/${branchId}/analytics?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  // Role Management
  async getRoles(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    level?: number
    isActive?: boolean
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/roles?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getRole(roleId: string) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/roles/${roleId}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async createRole(roleData: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/roles`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(roleData)
    })

    return this.handleResponse(response)
  }

  async updateRole(roleId: string, roleData: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/roles/${roleId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(roleData)
    })

    return this.handleResponse(response)
  }

  async deleteRole(roleId: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/roles/${roleId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async addRolePermission(roleId: string, permissionData: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/roles/${roleId}/permissions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(permissionData)
    })

    return this.handleResponse(response)
  }

  async removeRolePermission(roleId: string, module: string, action?: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/roles/${roleId}/permissions`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ module, action })
    })

    return this.handleResponse(response)
  }

  async assignRole(userId: string, roleId: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/roles/assign`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId, roleId })
    })

    return this.handleResponse(response)
  }

  async getRoleHierarchy() {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/roles/hierarchy`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async initializeDefaultRoles() {
    const response = await fetch(`${API_BASE_URL}/superadmin/roles/initialize`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  // Pricing Management
  async getPricingConfigurations(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/pricing?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getPricingConfiguration(pricingId: string) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/pricing/${pricingId}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getActivePricing() {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/pricing/active`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async createPricingConfiguration(pricingData: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/pricing`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(pricingData)
    })

    return this.handleResponse(response)
  }

  async updatePricingConfiguration(pricingId: string, pricingData: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/pricing/${pricingId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(pricingData)
    })

    return this.handleResponse(response)
  }

  async approvePricingConfiguration(pricingId: string, makeActive: boolean = false) {
    const response = await fetch(`${API_BASE_URL}/superadmin/pricing/${pricingId}/approve`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ makeActive })
    })

    return this.handleResponse(response)
  }

  async activatePricingConfiguration(pricingId: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/pricing/${pricingId}/activate`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async clonePricingConfiguration(pricingId: string, newVersion: string, newName?: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/pricing/${pricingId}/clone`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ newVersion, newName })
    })

    return this.handleResponse(response)
  }

  async calculatePrice(items: any[], options: any = {}) {
    const response = await fetch(`${API_BASE_URL}/superadmin/pricing/calculate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ items, options })
    })

    return this.handleResponse(response)
  }

  async getServiceItems(category?: string) {
    const searchParams = new URLSearchParams()
    if (category) {
      searchParams.append('category', category)
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/pricing/service-items?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getDiscountPolicies(active: boolean = true) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/pricing/discount-policies?active=${active}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async validateDiscountCode(code: string, orderValue: number = 0, customerInfo: any = {}) {
    const response = await fetch(`${API_BASE_URL}/superadmin/pricing/validate-discount`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ code, orderValue, customerInfo })
    })

    return this.handleResponse(response)
  }

  // Financial Management
  async getFinancialOverview(timeframe: string = '30d') {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/financial/overview?timeframe=${timeframe}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getTransactions(params?: {
    page?: number
    limit?: number
    type?: string
    status?: string
    startDate?: string
    endDate?: string
    branchId?: string
    customerId?: string
    minAmount?: number
    maxAmount?: number
    paymentMethod?: string
    search?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/financial/transactions?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getTransaction(transactionId: string) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/financial/transactions/${transactionId}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async approveRefund(transactionId: string, notes?: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/financial/transactions/${transactionId}/approve-refund`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ notes })
    })

    return this.handleResponse(response)
  }

  async rejectRefund(transactionId: string, reason: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/financial/transactions/${transactionId}/reject-refund`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason })
    })

    return this.handleResponse(response)
  }

  async getSettlements(params?: {
    page?: number
    limit?: number
    type?: string
    status?: string
    startDate?: string
    endDate?: string
    recipientId?: string
    minAmount?: number
    maxAmount?: number
    search?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/financial/settlements?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async createSettlement(settlementData: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/financial/settlements`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settlementData)
    })

    return this.handleResponse(response)
  }

  async approveSettlement(settlementId: string, comments?: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/financial/settlements/${settlementId}/approve`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ comments })
    })

    return this.handleResponse(response)
  }

  async getFinancialReports(params?: {
    page?: number
    limit?: number
    type?: string
    status?: string
    startDate?: string
    endDate?: string
    search?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/financial/reports?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async generateFinancialReport(reportData: {
    type: string
    startDate: string
    endDate: string
    filters?: any
  }) {
    const response = await fetch(`${API_BASE_URL}/superadmin/financial/reports/generate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(reportData)
    })

    return this.handleResponse(response)
  }

  async getFinancialReport(reportId: string) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/financial/reports/${reportId}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  // Risk Management
  async getRiskOverview(timeframe: string = '30d') {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/risk/overview?timeframe=${timeframe}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getComplaints(params?: {
    page?: number
    limit?: number
    status?: string
    category?: string
    severity?: string
    priority?: string
    isEscalated?: boolean
    slaBreached?: boolean
    fraudRisk?: string
    startDate?: string
    endDate?: string
    branchId?: string
    customerId?: string
    assignedTo?: string
    search?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/risk/complaints?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getComplaint(complaintId: string) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/risk/complaints/${complaintId}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async escalateComplaint(complaintId: string, reason: string, level?: number) {
    const response = await fetch(`${API_BASE_URL}/superadmin/risk/complaints/${complaintId}/escalate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason, level })
    })

    return this.handleResponse(response)
  }

  async assignComplaint(complaintId: string, assignedTo: string, assignedToModel: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/risk/complaints/${complaintId}/assign`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ assignedTo, assignedToModel })
    })

    return this.handleResponse(response)
  }

  async resolveComplaint(complaintId: string, resolution: string, resolutionType: string, amount?: number) {
    const response = await fetch(`${API_BASE_URL}/superadmin/risk/complaints/${complaintId}/resolve`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ resolution, resolutionType, amount })
    })

    return this.handleResponse(response)
  }

  async getBlacklistEntries(params?: {
    page?: number
    limit?: number
    entityType?: string
    status?: string
    reason?: string
    severity?: string
    riskScore?: number
    search?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/risk/blacklist?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async createBlacklistEntry(entryData: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/risk/blacklist`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(entryData)
    })

    return this.handleResponse(response)
  }

  async updateBlacklistEntry(entryId: string, entryData: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/risk/blacklist/${entryId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(entryData)
    })

    return this.handleResponse(response)
  }

  async checkBlacklist(entityType: string, identifiers: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/risk/blacklist/check`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ entityType, identifiers })
    })

    return this.handleResponse(response)
  }

  async getSLAConfigurations(params?: {
    page?: number
    limit?: number
    isActive?: boolean
    scope?: string
    search?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/risk/sla-configs?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async createSLAConfiguration(configData: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/risk/sla-configs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(configData)
    })

    return this.handleResponse(response)
  }

  // Analytics Management
  async getAnalyticsOverview(timeframe: string = '30d') {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/analytics/overview?timeframe=${timeframe}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async generateCustomerRetentionAnalysis(data: {
    startDate: string
    endDate: string
    filters?: any
  }) {
    const response = await fetch(`${API_BASE_URL}/superadmin/analytics/customer-retention`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    return this.handleResponse(response)
  }

  async generateBranchPerformanceAnalysis(data: {
    startDate: string
    endDate: string
    filters?: any
  }) {
    const response = await fetch(`${API_BASE_URL}/superadmin/analytics/branch-performance`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    return this.handleResponse(response)
  }

  async generateRevenueForecast(data: {
    startDate: string
    endDate: string
    forecastHorizon?: number
    methodology?: string
    filters?: any
  }) {
    const response = await fetch(`${API_BASE_URL}/superadmin/analytics/revenue-forecast`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    return this.handleResponse(response)
  }

  async generateExpansionAnalysis(data: {
    targetLocation: {
      city: string
      area?: string
      pincode?: string
      coordinates?: {
        latitude: number
        longitude: number
      }
    }
    marketData: {
      populationDensity?: number
      averageIncome?: number
      competitorCount?: number
      marketSaturation?: number
      demandEstimate?: number
      seasonalityFactor?: number
    }
  }) {
    const response = await fetch(`${API_BASE_URL}/superadmin/analytics/expansion-analysis`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    return this.handleResponse(response)
  }

  async getAnalytics(params?: {
    page?: number
    limit?: number
    type?: string
    status?: string
    startDate?: string
    endDate?: string
    search?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/analytics?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getAnalyticsById(analyticsId: string) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/analytics/${analyticsId}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  // Settings Management
  async getSystemSettings() {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/settings/system`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async updateSystemSettings(category: string, settings: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/settings/system`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ category, settings })
    })

    return this.handleResponse(response)
  }

  async getProfileSettings() {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/settings/profile`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async updateProfile(profileData: {
    name?: string
    phone?: string
    avatar?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/superadmin/settings/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData)
    })

    return this.handleResponse(response)
  }

  async changePassword(passwordData: {
    currentPassword: string
    newPassword: string
  }) {
    const response = await fetch(`${API_BASE_URL}/superadmin/settings/password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(passwordData)
    })

    return this.handleResponse(response)
  }

  async getSystemInfo() {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/settings/system-info`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  // Audit Management
  async getAuditLogs(params?: {
    page?: number
    limit?: number
    category?: string
    action?: string
    userEmail?: string
    riskLevel?: string
    status?: string
    startDate?: string
    endDate?: string
    search?: string
    sortBy?: string
    sortOrder?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/audit?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getAuditLog(logId: string) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/audit/${logId}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getAuditStats(timeframe: string = '30d') {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/audit/stats?timeframe=${timeframe}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async exportAuditLogs(params?: {
    format?: string
    category?: string
    startDate?: string
    endDate?: string
    riskLevel?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/audit/export?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getActivitySummary() {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/audit/activity-summary`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  // Notification Management
  async getNotifications(params?: {
    page?: number
    limit?: number
    unreadOnly?: boolean
    priority?: string
    type?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      if (params.page) searchParams.append('page', params.page.toString())
      if (params.limit) searchParams.append('limit', params.limit.toString())
      if (params.unreadOnly) searchParams.append('unreadOnly', 'true')
      if (params.priority) searchParams.append('priority', params.priority)
      if (params.type) searchParams.append('type', params.type)
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/notifications?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getNotification(notificationId: string) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/notifications/${notificationId}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getNotificationUnreadCount() {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/notifications/unread-count`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async markNotificationsAsRead(notificationIds: string[]) {
    const response = await fetch(`${API_BASE_URL}/superadmin/notifications/read`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ notificationIds })
    })

    return this.handleResponse(response)
  }

  async markAllNotificationsAsRead() {
    const response = await fetch(`${API_BASE_URL}/superadmin/notifications/read-all`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async markNotificationAsRead(notificationId: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async clearAllNotifications() {
    const response = await fetch(`${API_BASE_URL}/superadmin/notifications/clear-all`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  /** Send a test platform alert to verify live notifications (SuperAdmin only) */
  async sendTestAlert(params?: { title?: string; message?: string; priority?: string }) {
    const response = await fetch(`${API_BASE_URL}/superadmin/notifications/test-alert`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(params ?? {})
    })
    return this.handleResponse(response)
  }

  // Customer Management
  async getCustomers(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/customers?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getCustomer(customerId: string) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/customers/${customerId}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async updateCustomerStatus(customerId: string, isActive: boolean) {
    const response = await fetch(`${API_BASE_URL}/superadmin/customers/${customerId}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ isActive })
    })

    return this.handleResponse(response)
  }

  async getCustomerOrders(customerId: string, params?: {
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/customers/${customerId}/orders?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  // Billing Plans
  async getBillingPlans() {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/billing/plans`,
      { headers: this.getAuthHeaders() }
    )
    return this.handleResponse(response)
  }

  async getBillingPlan(planId: string) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/billing/plans/${planId}`,
      { headers: this.getAuthHeaders() }
    )
    return this.handleResponse(response)
  }

  // Generic HTTP methods for flexible API calls
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin${endpoint}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  async post(endpoint: string, data?: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })
    return this.handleResponse(response)
  }

  async put(endpoint: string, data?: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })
    return this.handleResponse(response)
  }

  async patch(endpoint: string, data?: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })
    return this.handleResponse(response)
  }

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  // Add-On Management
  async getAddOns(params?: {
    status?: string
    category?: string
    search?: string
    sortBy?: string
    sortOrder?: string
    limit?: number
    page?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/addons?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getAddOn(addOnId: string) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/addons/${addOnId}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async createAddOn(addOnData: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/addons`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(addOnData)
    })

    return this.handleResponse(response)
  }

  async updateAddOn(addOnId: string, addOnData: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/addons/${addOnId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(addOnData)
    })

    return this.handleResponse(response)
  }

  async deleteAddOn(addOnId: string) {
    const response = await fetch(`${API_BASE_URL}/superadmin/addons/${addOnId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async getAddOnAnalytics(addOnId: string, period?: string) {
    const searchParams = new URLSearchParams()
    if (period) {
      searchParams.append('period', period)
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/addons/${addOnId}/analytics?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async assignAddOnToTenant(addOnId: string, assignmentData: any) {
    const response = await fetch(`${API_BASE_URL}/superadmin/addons/${addOnId}/assign`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(assignmentData)
    })

    return this.handleResponse(response)
  }

  async getAddOnSubscribers(addOnId: string, params?: {
    status?: string
    sortBy?: string
    sortOrder?: string
    limit?: number
    page?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/addons/${addOnId}/subscribers?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getAddOnCategories() {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/addons/categories`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  // Finance-specific API methods
  async getPaymentFailures(params?: {
    page?: number
    limit?: number
    gateway?: string
    reason?: string
    search?: string
    range?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/finances/failures?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getRefunds(params?: {
    page?: number
    limit?: number
    status?: string
    reason?: string
    type?: string
    search?: string
    range?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/finances/refunds?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getRevenueData(range?: string) {
    const searchParams = new URLSearchParams()
    if (range) {
      searchParams.append('range', range)
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/finances/revenue?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getFinanceTransactions(params?: {
    page?: number
    limit?: number
    status?: string
    type?: string
    gateway?: string
    search?: string
    range?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/finances/transactions?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getRevenueReports(params?: {
    range?: string
    type?: string
    tenant?: string
    includeRefunds?: boolean
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/finances/reports/revenue?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getTaxReports(period?: string) {
    const searchParams = new URLSearchParams()
    if (period) {
      searchParams.append('period', period)
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/finances/reports/tax?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  // Audit Management API methods
  async getAuditDashboard(timeframe?: string) {
    const searchParams = new URLSearchParams()
    if (timeframe) {
      searchParams.append('timeframe', timeframe)
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/audit/dashboard?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getAuditCompliance() {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/audit/compliance`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getAuditLogsDeep(params?: {
    page?: number,
    limit?: number,
    severity?: string,
    action?: string,
    search?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/audit/logs?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  async getAuditMetrics(timeframe?: string) {
    const searchParams = new URLSearchParams()
    if (timeframe) {
      searchParams.append('timeframe', timeframe)
    }

    const response = await fetch(
      `${API_BASE_URL}/superadmin/audit/metrics?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  // Blog Management Methods

  // Get all blog posts for admin
  async getBlogPosts(params?: {
    page?: number
    limit?: number
    status?: string
    category?: string
    search?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.status) searchParams.append('status', params.status)
    if (params?.category) searchParams.append('category', params.category)
    if (params?.search) searchParams.append('search', params.search)

    const response = await fetch(
      `${API_BASE_URL}/superadmin/blog/posts?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  // Get single blog post
  async getBlogPost(id: string) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/blog/posts/${id}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  // Create blog post
  async createBlogPost(postData: any) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/blog/posts`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(postData)
      }
    )

    return this.handleResponse(response)
  }

  // Update blog post
  async updateBlogPost(id: string, postData: any) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/blog/posts/${id}`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(postData)
      }
    )

    return this.handleResponse(response)
  }

  // Delete blog post
  async deleteBlogPost(id: string) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/blog/posts/${id}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      }
    )

    return this.handleResponse(response)
  }

  // Get blog categories
  async getBlogCategories() {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/blog/categories`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }

  // Create blog category
  async createBlogCategory(categoryData: any) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/blog/categories`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(categoryData)
      }
    )

    return this.handleResponse(response)
  }

  // Update blog category
  async updateBlogCategory(id: string, categoryData: any) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/blog/categories/${id}`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(categoryData)
      }
    )

    return this.handleResponse(response)
  }

  // Delete blog category
  async deleteBlogCategory(id: string) {
    const response = await fetch(
      `${API_BASE_URL}/superadmin/blog/categories/${id}`,
      {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      }
    )

    return this.handleResponse(response)
  }

  // Get blog analytics
  async getBlogAnalytics(timeframe?: string) {
    const searchParams = new URLSearchParams()
    if (timeframe) searchParams.append('timeframe', timeframe)

    const response = await fetch(
      `${API_BASE_URL}/superadmin/blog/analytics?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )

    return this.handleResponse(response)
  }
}

export const superAdminApi = new SuperAdminAPI()
