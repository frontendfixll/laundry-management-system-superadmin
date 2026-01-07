'use client';

import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useCreateGlobalBanner } from '@/hooks/useSuperAdminBanners';

interface CreateGlobalBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateGlobalBannerModal({ isOpen, onClose, onSuccess }: CreateGlobalBannerModalProps) {
  const { createGlobalBanner, loading } = useCreateGlobalBanner();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'PROMOTIONAL' as 'PROMOTIONAL' | 'INFORMATIONAL' | 'SEASONAL' | 'ANNOUNCEMENT',
    imageUrl: '',
    targetPages: [] as string[],
    actionType: 'NONE' as 'LINK' | 'PROMOTION' | 'NONE',
    actionUrl: '',
    priority: 1,
    startDate: '',
    endDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        type: 'PROMOTIONAL',
        imageUrl: '',
        targetPages: [],
        actionType: 'NONE',
        actionUrl: '',
        priority: 1,
        startDate: '',
        endDate: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleTargetPageToggle = (page: string) => {
    setFormData(prev => ({
      ...prev,
      targetPages: prev.targetPages.includes(page)
        ? prev.targetPages.filter(p => p !== page)
        : [...prev.targetPages, page]
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.imageUrl) newErrors.imageUrl = 'Image URL is required';
    if (formData.targetPages.length === 0) newErrors.targetPages = 'Select at least one target page';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createGlobalBanner(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create global banner:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Create Global Banner</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Banner Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Banner Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="PROMOTIONAL">Promotional</option>
              <option value="INFORMATIONAL">Informational</option>
              <option value="SEASONAL">Seasonal</option>
              <option value="ANNOUNCEMENT">Announcement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/banner.jpg"
            />
            {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Pages *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['HOME', 'SERVICES', 'CHECKOUT', 'DASHBOARD', 'ORDERS', 'PROFILE'].map((page) => (
                <label
                  key={page}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${
                    formData.targetPages.includes(page) ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.targetPages.includes(page)}
                    onChange={() => handleTargetPageToggle(page)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">{page}</span>
                </label>
              ))}
            </div>
            {errors.targetPages && <p className="text-red-500 text-sm mt-1">{errors.targetPages}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Global Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
