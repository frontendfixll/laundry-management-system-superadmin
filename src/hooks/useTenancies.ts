import { useState, useCallback } from 'react';
import { superAdminApi } from '@/lib/superAdminApi';

export interface Tenancy {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  subdomain: string;
  customDomain?: string;
  branding: {
    logo: { url: string; publicId: string };
    favicon: { url: string; publicId: string };
    theme: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      backgroundColor: string;
      textColor: string;
      layout: 'modern' | 'classic' | 'minimal';
    };
    customCss?: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
  };
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'trial' | 'expired' | 'cancelled';
    startDate: string;
    endDate?: string;
    trialEndsAt?: string;
    features: {
      maxOrders: number;
      maxStaff: number;
      maxCustomers: number;
      customDomain: boolean;
      advancedAnalytics: boolean;
      apiAccess: boolean;
      whiteLabel: boolean;
    };
  };
  owner: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalStaff: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TenancyStats {
  total: number;
  active: number;
  trial: number;
  suspended: number;
}

export interface CreateTenancyData {
  name: string;
  slug?: string;
  description?: string;
  subdomain?: string;
  contact?: Partial<Tenancy['contact']>;
  owner: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
  };
  subscription?: Partial<Tenancy['subscription']>;
}

export function useTenancies() {
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [stats, setStats] = useState<TenancyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  });

  const fetchTenancies = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await superAdminApi.get(`/tenancies?${queryParams.toString()}`);
      if (response.data.success) {
        setTenancies(response.data.data.tenancies);
        setPagination(response.data.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tenancies');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await superAdminApi.get('/tenancies/stats');
      if (response.data.success) {
        setStats(response.data.data.stats);
      }
    } catch (err: any) {
      console.error('Failed to fetch tenancy stats:', err);
    }
  }, []);

  const getTenancyById = useCallback(async (id: string): Promise<Tenancy | null> => {
    try {
      const response = await superAdminApi.get(`/tenancies/${id}`);
      if (response.data.success) {
        return response.data.data.tenancy;
      }
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tenancy');
      return null;
    }
  }, []);

  const createTenancy = useCallback(async (data: CreateTenancyData): Promise<{ success: boolean; tenancy?: Tenancy; tempPassword?: string; message?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminApi.post('/tenancies', data);
      if (response.data.success) {
        await fetchTenancies();
        await fetchStats();
        return {
          success: true,
          tenancy: response.data.data.tenancy,
          tempPassword: response.data.data.owner?.tempPassword
        };
      }
      return { success: false, message: response.data.message };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create tenancy';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [fetchTenancies, fetchStats]);

  const updateTenancy = useCallback(async (id: string, data: Partial<Tenancy>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminApi.put(`/tenancies/${id}`, data);
      if (response.data.success) {
        await fetchTenancies();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update tenancy');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTenancies]);

  const updateTenancyStatus = useCallback(async (id: string, status: Tenancy['status']): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminApi.patch(`/tenancies/${id}/status`, { status });
      if (response.data.success) {
        await fetchTenancies();
        await fetchStats();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTenancies, fetchStats]);

  const updateBranding = useCallback(async (id: string, branding: Partial<Tenancy['branding']>): Promise<boolean> => {
    try {
      const response = await superAdminApi.patch(`/tenancies/${id}/branding`, { branding });
      return response.data.success;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update branding');
      return false;
    }
  }, []);

  const updateSubscription = useCallback(async (id: string, subscription: Partial<Tenancy['subscription']>): Promise<boolean> => {
    try {
      const response = await superAdminApi.patch(`/tenancies/${id}/subscription`, { subscription });
      if (response.data.success) {
        await fetchTenancies();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update subscription');
      return false;
    }
  }, [fetchTenancies]);

  const deleteTenancy = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminApi.delete(`/tenancies/${id}`);
      if (response.data.success) {
        await fetchTenancies();
        await fetchStats();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete tenancy');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTenancies, fetchStats]);

  // Invitation functions
  const inviteLaundryAdmin = useCallback(async (data: {
    tenancyId: string;
    name: string;
    email: string;
    phone: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await superAdminApi.post('/invitations/invite', data);
      if (response.data.success) {
        return { success: true, message: 'Invitation sent successfully' };
      }
      return { success: false, message: response.data.message };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to send invitation' };
    }
  }, []);

  const getPendingInvitations = useCallback(async () => {
    try {
      const response = await superAdminApi.get('/invitations/pending');
      return response.data.data || [];
    } catch (err: any) {
      console.error('Failed to fetch pending invitations:', err);
      return [];
    }
  }, []);

  const resendInvitation = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const response = await superAdminApi.post(`/invitations/${userId}/resend`);
      return response.data.success;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend invitation');
      return false;
    }
  }, []);

  const cancelInvitation = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const response = await superAdminApi.delete(`/invitations/${userId}`);
      return response.data.success;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel invitation');
      return false;
    }
  }, []);

  return {
    tenancies,
    stats,
    loading,
    error,
    pagination,
    fetchTenancies,
    fetchStats,
    getTenancyById,
    createTenancy,
    updateTenancy,
    updateTenancyStatus,
    updateBranding,
    updateSubscription,
    deleteTenancy,
    inviteLaundryAdmin,
    getPendingInvitations,
    resendInvitation,
    cancelInvitation
  };
}
