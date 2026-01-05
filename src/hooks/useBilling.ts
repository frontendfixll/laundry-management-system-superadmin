import { useState, useCallback } from 'react';
import { superAdminApi } from '@/lib/superAdminApi';

export interface BillingPlan {
  _id: string;
  name: string;
  displayName: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: {
    maxOrders: number;
    maxStaff: number;
    maxCustomers: number;
    maxBranches: number;
    customDomain: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
    whiteLabel: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
  };
  isActive: boolean;
}

export interface Invoice {
  _id: string;
  tenancy: { _id: string; name: string; subdomain: string };
  invoiceNumber: string;
  billingPeriod: { start: string; end: string };
  plan: string;
  billingCycle: 'monthly' | 'yearly';
  amount: {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  };
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export interface BillingStats {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  planDistribution: Record<string, number>;
}

export function useBilling() {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async (includeInactive: boolean = true) => {
    try {
      const response = await superAdminApi.get(`/billing/plans?includeInactive=${includeInactive}`);
      if (response.success) {
        setPlans(response.data.plans);
      }
    } catch (err: any) {
      console.error('Failed to fetch plans:', err);
    }
  }, []);

  const fetchInvoices = useCallback(async (params?: { tenancyId?: string; status?: string; page?: number }) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (params?.tenancyId) queryParams.append('tenancyId', params.tenancyId);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      
      const response = await superAdminApi.get(`/billing/invoices?${queryParams.toString()}`);
      if (response.success) {
        setInvoices(response.data.invoices);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await superAdminApi.get('/billing/stats');
      if (response.success) {
        setStats(response.data.stats);
      }
    } catch (err: any) {
      console.error('Failed to fetch billing stats:', err);
    }
  }, []);

  const generateInvoice = useCallback(async (tenancyId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') => {
    try {
      const response = await superAdminApi.post('/billing/invoices', { tenancyId, billingCycle });
      if (response.success) {
        await fetchInvoices();
        return { success: true, invoice: response.data.invoice };
      }
      return { success: false };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to generate invoice' };
    }
  }, [fetchInvoices]);

  const markInvoicePaid = useCallback(async (invoiceId: string, paymentMethod: string, transactionId?: string) => {
    try {
      const response = await superAdminApi.patch(`/billing/invoices/${invoiceId}/paid`, {
        paymentMethod,
        transactionId
      });
      if (response.success) {
        await fetchInvoices();
        await fetchStats();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Failed to mark invoice as paid');
      return false;
    }
  }, [fetchInvoices, fetchStats]);

  const updateTenancyPlan = useCallback(async (tenancyId: string, plan: string) => {
    try {
      const response = await superAdminApi.patch(`/billing/tenancies/${tenancyId}/plan`, { plan });
      return response.success;
    } catch (err: any) {
      setError(err.message || 'Failed to update plan');
      return false;
    }
  }, []);

  const updatePlan = useCallback(async (planName: string, data: Partial<Omit<BillingPlan, '_id' | 'name'>>) => {
    try {
      const response = await superAdminApi.post('/billing/plans', {
        name: planName,
        ...data
      });
      if (response.success) {
        await fetchPlans();
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Failed to update plan');
      return false;
    }
  }, [fetchPlans]);

  return {
    plans,
    invoices,
    stats,
    loading,
    error,
    fetchPlans,
    fetchInvoices,
    fetchStats,
    generateInvoice,
    markInvoicePaid,
    updateTenancyPlan,
    updatePlan
  };
}
