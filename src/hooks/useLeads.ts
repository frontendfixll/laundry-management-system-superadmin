import { useState, useCallback } from 'react';
import { superAdminApi } from '@/lib/superAdminApi';

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'closed';
export type BusinessType = 'small_laundry' | 'chain' | 'dry_cleaner' | 'other';

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: BusinessType;
  message?: string;
  status: LeadStatus;
  notes?: string;
  convertedToTenancy?: string;
  // New fields
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  interestedPlan?: 'free' | 'basic' | 'pro' | 'enterprise' | 'undecided';
  expectedMonthlyOrders?: string;
  currentBranches?: number;
  source?: 'website' | 'pricing_page' | 'referral' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  converted: number;
  closed: number;
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  });

  const fetchLeads = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: LeadStatus;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response = await superAdminApi.get(`/leads?${queryParams.toString()}`);
      if (response.success) {
        setLeads(response.data.leads || []);
        const pag = response.data.pagination;
        setPagination({
          current: pag?.page || 1,
          pages: pag?.pages || 1,
          total: pag?.total || 0,
          limit: pag?.limit || 20
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await superAdminApi.get('/leads/stats');
      if (response.success && response.data) {
        setStats({
          total: response.data.total || 0,
          new: response.data.byStatus?.new || 0,
          contacted: response.data.byStatus?.contacted || 0,
          converted: response.data.byStatus?.converted || 0,
          closed: response.data.byStatus?.closed || 0
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch lead stats:', err);
    }
  }, []);

  const getLeadById = useCallback(async (id: string): Promise<Lead | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminApi.get(`/leads/${id}`);
      if (response.success) {
        return response.data; // Backend returns lead directly in data
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch lead');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLead = useCallback(async (id: string, data: {
    status?: LeadStatus;
    notes?: string;
    convertedToTenancy?: string;
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminApi.patch(`/leads/${id}`, data);
      if (response.success) {
        await fetchLeads();
        await fetchStats();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Failed to update lead');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchLeads, fetchStats]);

  const deleteLead = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminApi.delete(`/leads/${id}`);
      if (response.success) {
        await fetchLeads();
        await fetchStats();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Failed to delete lead');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchLeads, fetchStats]);

  return {
    leads,
    stats,
    loading,
    error,
    pagination,
    fetchLeads,
    fetchStats,
    getLeadById,
    updateLead,
    deleteLead
  };
}
