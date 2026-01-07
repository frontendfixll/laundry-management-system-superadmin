import { useState } from 'react';
import axios from 'axios';

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
      const response = await axios.get(`${API_URL}/superadmin/banners`, {
        params,
        withCredentials: true
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
      const response = await axios.post(`${API_URL}/superadmin/banners`, bannerData, {
        withCredentials: true
      });
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
      const response = await axios.put(`${API_URL}/superadmin/banners/${bannerId}`, bannerData, {
        withCredentials: true
      });
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
      const response = await axios.delete(`${API_URL}/superadmin/banners/${bannerId}`, {
        withCredentials: true
      });
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
      const response = await axios.patch(`${API_URL}/superadmin/banners/${bannerId}/approve`, {
        approved,
        rejectionReason
      }, {
        withCredentials: true
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

// Toggle banner status
export const useToggleAnyBannerStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async (bannerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.patch(`${API_URL}/superadmin/banners/${bannerId}/toggle-status`, {}, {
        withCredentials: true
      });
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
      const response = await axios.patch(`${API_URL}/superadmin/banners/${bannerId}/disable`, {
        reason
      }, {
        withCredentials: true
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
      const response = await axios.get(`${API_URL}/superadmin/banners/analytics/platform`, {
        params,
        withCredentials: true
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
