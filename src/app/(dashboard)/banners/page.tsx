'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, BarChart3, Power, CheckCircle, XCircle, AlertTriangle, Globe, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useAllBanners,
  useDeleteAnyBanner,
  useToggleAnyBannerStatus,
  useApproveBanner,
  useDisableBanner
} from '@/hooks/useSuperAdminBanners';
import CreateGlobalBannerModal from '@/components/banners/CreateGlobalBannerModal';
import PlatformAnalyticsDashboard from '@/components/banners/PlatformAnalyticsDashboard';
import BannerPreviewModal from '@/components/banners/BannerPreviewModal';
import EditBannerModal from '@/components/banners/EditBannerModal';
import BannerAnalyticsModal from '@/components/banners/BannerAnalyticsModal';

export default function SuperAdminBannersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [banners, setBanners] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBannerAnalytics, setShowBannerAnalytics] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { getAllBanners, loading } = useAllBanners();
  const { deleteBanner } = useDeleteAnyBanner();
  const { toggleStatus } = useToggleAnyBannerStatus();
  const { approveBanner } = useApproveBanner();
  const { disableBanner } = useDisableBanner();

  useEffect(() => {
    loadBanners();
  }, [currentPage, searchTerm, statusFilter, typeFilter, scopeFilter]);

  const loadBanners = async () => {
    try {
      const params: any = {
        page: currentPage,
        limit: 10
      };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (scopeFilter !== 'ALL') params.scope = scopeFilter;

      const result = await getAllBanners(params);
      const bannersData = result.data?.banners || [];
      setBanners(Array.isArray(bannersData) ? bannersData : []);
      setTotalPages(result.data?.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to load banners:', error);
      setBanners([]); // Set empty array on error
    }
  };

  const handleDelete = async (bannerId: string) => {
    try {
      await deleteBanner(bannerId);
      toast.success('Banner deleted successfully');
      loadBanners();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      console.error('Failed to delete banner:', error);
      toast.error(error.response?.data?.message || 'Failed to delete banner');
    }
  };

  const handleToggleStatus = async (bannerId: string) => {
    try {
      await toggleStatus(bannerId);
      loadBanners();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleApprove = async (bannerId: string, approved: boolean) => {
    try {
      await approveBanner(bannerId, approved);
      setShowApprovalModal(false);
      loadBanners();
    } catch (error) {
      console.error('Failed to approve banner:', error);
    }
  };

  const handleDisable = async (bannerId: string, reason: string) => {
    try {
      await disableBanner(bannerId, reason);
      setShowDisableModal(false);
      loadBanners();
    } catch (error) {
      console.error('Failed to disable banner:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      SCHEDULED: 'bg-blue-100 text-blue-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      DRAFT: 'bg-gray-100 text-gray-600'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getScopeBadge = (scope: string) => {
    return scope === 'GLOBAL'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Banner Management</h1>
          <p className="text-gray-600 mt-1">Manage global and tenant banners across the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <BarChart3 size={20} />
            Platform Analytics
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Create
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Total Banners</p>
              <p className="text-2xl lg:text-3xl font-semibold text-gray-900 mt-1 lg:mt-2">{banners.length}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">Global Banners</p>
              <p className="text-2xl lg:text-3xl font-semibold text-blue-600 mt-1 lg:mt-2">
                {banners.filter(b => b.bannerScope === 'GLOBAL').length}
              </p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">Active Banners</p>
              <p className="text-2xl lg:text-3xl font-semibold text-green-600 mt-1 lg:mt-2">
                {banners.filter(b => b.state === 'ACTIVE').length}
              </p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-lg shadow-sm p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700 mb-1">Pending Approval</p>
              <p className="text-2xl lg:text-3xl font-semibold text-amber-600 mt-1 lg:mt-2">
                {banners.filter(b => b.approval?.required && b.approval?.status === 'PENDING').length}
              </p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Scopes</option>
            <option value="GLOBAL">Global</option>
            <option value="TENANT">Tenant</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PAUSED">Paused</option>
            <option value="EXPIRED">Expired</option>
            <option value="DRAFT">Draft</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="PROMOTIONAL">Promotional</option>
            <option value="INFORMATIONAL">Informational</option>
            <option value="SEASONAL">Seasonal</option>
            <option value="ANNOUNCEMENT">Announcement</option>
          </select>
        </div>
      </div>

      {/* Banner List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No banners found</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{banner.content?.title || 'Untitled Banner'}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(banner.state)}`}>
                      {banner.state}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getScopeBadge(banner.bannerScope)}`}>
                      {banner.bannerScope}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {banner.templateType}
                    </span>
                    {banner.approval?.required && banner.approval?.status === 'PENDING' && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <span>📅 {new Date(banner.schedule?.startDate).toLocaleDateString()} - {new Date(banner.schedule?.endDate).toLocaleDateString()}</span>
                    <span>📍 {banner.position}</span>
                    {banner.tenancy && <span>🏢 Tenant: {banner.tenancy.name || banner.tenancy}</span>}
                  </div>

                  {/* Analytics Preview */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Impressions</p>
                      <p className="text-lg font-bold text-blue-600">{banner.analytics?.impressions?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Clicks</p>
                      <p className="text-lg font-bold text-green-600">{banner.analytics?.clicks?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">CTR</p>
                      <p className="text-lg font-bold text-purple-600">{banner.analytics?.ctr?.toFixed(2) || 0}%</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Conversions</p>
                      <p className="text-lg font-bold text-orange-600">{banner.analytics?.conversions || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {banner.approval?.required && banner.approval?.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(banner._id, true)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Approve"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => handleApprove(banner._id, false)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Reject"
                      >
                        <XCircle size={20} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedBanner(banner);
                      setShowPreviewModal(true);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title="Preview"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBanner(banner);
                      setShowEditModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBanner(banner);
                      setShowBannerAnalytics(true);
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    title="Analytics"
                  >
                    <BarChart3 size={20} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(banner._id)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                    title="Toggle Status"
                  >
                    <Power size={20} />
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter reason for emergency disable:');
                      if (reason) handleDisable(banner._id, reason);
                    }}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                    title="Emergency Disable"
                  >
                    <AlertTriangle size={20} />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(banner._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {banners.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg transition ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateGlobalBannerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadBanners}
      />

      <PlatformAnalyticsDashboard
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Banner</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this banner? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedBanner && (
        <>
          <BannerPreviewModal
            isOpen={showPreviewModal}
            onClose={() => {
              setShowPreviewModal(false);
              setSelectedBanner(null);
            }}
            banner={selectedBanner}
          />

          <EditBannerModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedBanner(null);
            }}
            banner={selectedBanner}
            onSuccess={() => {
              loadBanners();
              setShowEditModal(false);
              setSelectedBanner(null);
            }}
          />

          <BannerAnalyticsModal
            isOpen={showBannerAnalytics}
            onClose={() => {
              setShowBannerAnalytics(false);
              setSelectedBanner(null);
            }}
            banner={selectedBanner}
          />
        </>
      )}
    </div>
  );
}
