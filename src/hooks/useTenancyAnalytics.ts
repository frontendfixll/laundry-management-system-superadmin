import { useState, useCallback } from 'react';
import { superAdminApi } from '@/lib/superAdminApi';

export interface TenancyAnalytics {
  tenancy: {
    name: string;
    subdomain: string;
    plan: string;
    status: string;
  };
  overview: {
    totalOrders: number;
    periodOrders: number;
    totalRevenue: number;
    periodRevenue: number;
    totalCustomers: number;
    newCustomers: number;
    avgOrderValue: number;
  };
  ordersByStatus: Record<string, number>;
  dailyOrders: Array<{ _id: string; orders: number; revenue: number }>;
  topServices: Array<{ _id: string; count: number; revenue: number }>;
}

export interface PlatformAnalytics {
  overview: {
    totalTenancies: number;
    activeTenancies: number;
    newTenancies: number;
    platformRevenue: number;
  };
  tenanciesByPlan: Record<string, number>;
  tenanciesByStatus: Record<string, number>;
  topTenanciesByOrders: Array<{ _id: string; name: string; subdomain: string; orderCount: number }>;
  topTenanciesByRevenue: Array<{ _id: string; name: string; subdomain: string; revenue: number }>;
  dailySignups: Array<{ _id: string; count: number }>;
}

export function useTenancyAnalytics() {
  const [tenancyAnalytics, setTenancyAnalytics] = useState<TenancyAnalytics | null>(null);
  const [platformAnalytics, setPlatformAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenancyAnalytics = useCallback(async (tenancyId: string, period: string = '30d') => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminApi.get(`/tenancy-analytics/${tenancyId}?period=${period}`);
      if (response.success) {
        setTenancyAnalytics(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tenancy analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlatformAnalytics = useCallback(async (period: string = '30d') => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminApi.get(`/tenancy-analytics/platform?period=${period}`);
      if (response.success) {
        setPlatformAnalytics(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch platform analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  const compareTenancies = useCallback(async (tenancyIds: string[], period: string = '30d') => {
    try {
      const response = await superAdminApi.post(`/tenancy-analytics/compare?period=${period}`, { tenancyIds });
      if (response.success) {
        return response.data.comparisons;
      }
      return [];
    } catch (err: any) {
      setError(err.message || 'Failed to compare tenancies');
      return [];
    }
  }, []);

  return {
    tenancyAnalytics,
    platformAnalytics,
    loading,
    error,
    fetchTenancyAnalytics,
    fetchPlatformAnalytics,
    compareTenancies
  };
}
