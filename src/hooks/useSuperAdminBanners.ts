import { useState } from 'react';
import api from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get all banners (global + tenant)
export const useAllBanners = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllBanners = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    scope?: string;
    tenancyId?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/superadmin/banners/all-banners`, {
        params
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch banners');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getAllBanners, loading, error };
};

// Create global banner
export const useCreateGlobalBanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGlobalBanner = async (bannerData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/superadmin/banners/global-banners`, bannerData);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create global banner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createGlobalBanner, loading, error };
};

// Update any banner
export const useUpdateAnyBanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBanner = async (bannerId: string, bannerData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/superadmin/banners/${bannerId}`, bannerData);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update banner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateBanner, loading, error };
};

// Delete any banner
export const useDeleteAnyBanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBanner = async (bannerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/superadmin/banners/${bannerId}`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete banner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteBanner, loading, error };
};

// Approve banner
export const useApproveBanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveBanner = async (bannerId: string, approved: boolean, rejectionReason?: string) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = approved 
        ? `/superadmin/banners/${bannerId}/approve`
        : `/superadmin/banners/${bannerId}/reject`;
      
      const response = await api.post(endpoint, {
        rejectionReason
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve banner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { approveBanner, loading, error };
};

// Toggle banner status (change state)
export const useToggleAnyBannerStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async (bannerId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Don't pass newState - let backend determine it automatically
      const response = await api.patch(`/superadmin/banners/${bannerId}/state`, {});
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { toggleStatus, loading, error };
};

// Disable banner (emergency)
export const useDisableBanner = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disableBanner = async (bannerId: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/superadmin/banners/${bannerId}/emergency-disable`, {
        reason
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disable banner');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { disableBanner, loading, error };
};

// Get platform analytics
export const usePlatformAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPlatformAnalytics = async (params?: {
    startDate?: string;
    endDate?: string;
    tenancyId?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/superadmin/banners/analytics/platform`, {
        params
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getPlatformAnalytics, loading, error };
};
