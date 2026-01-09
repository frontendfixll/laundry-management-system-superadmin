'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSuperAdminStore } from '@/store/superAdminStore';

interface EditBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: any;
  onSuccess: () => void;
}

export default function EditBannerModal({ isOpen, onClose, banner, onSuccess }: EditBannerModalProps) {
  const { token } = useSuperAdminStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ctaText: '',
    ctaUrl: '',
    startDate: '',
    endDate: '',
    priority: 1,
    primaryColor: '#3B82F6',
    backgroundColor: '#FFFFFF'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.content?.title || '',
        description: banner.content?.description || '',
        ctaText: banner.content?.ctaText || '',
        ctaUrl: banner.content?.ctaUrl || '',
        startDate: banner.schedule?.startDate ? new Date(banner.schedule.startDate).toISOString().split('T')[0] : '',
        endDate: banner.schedule?.endDate ? new Date(banner.schedule.endDate).toISOString().split('T')[0] : '',
        priority: banner.priority || 1,
        primaryColor: banner.styling?.primaryColor || '#3B82F6',
        backgroundColor: banner.styling?.backgroundColor || '#FFFFFF'
      });
      
      if (banner.content?.imageUrl) {
        setImagePreview(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${banner.content.imageUrl}`);
      }
    }
  }, [banner]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add content fields
      formDataToSend.append('content[title]', formData.title);
      formDataToSend.append('content[description]', formData.description);
      if (formData.ctaText) formDataToSend.append('content[ctaText]', formData.ctaText);
      if (formData.ctaUrl) formDataToSend.append('content[ctaUrl]', formData.ctaUrl);

      // Add schedule
      formDataToSend.append('schedule[startDate]', formData.startDate);
      formDataToSend.append('schedule[endDate]', formData.endDate);

      // Add styling
      formDataToSend.append('styling[primaryColor]', formData.primaryColor);
      formDataToSend.append('styling[backgroundColor]', formData.backgroundColor);

      // Add priority
      formDataToSend.append('priority', formData.priority.toString());

      // Add image if changed
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/banners/${banner._id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Banner updated successfully!');
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to update banner');
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Failed to update banner');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !banner) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Banner</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* CTA Text & URL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA Button Text
              </label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA URL
              </label>
              <input
                type="url"
                value={formData.ctaUrl}
                onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <input
                type="color"
                value={formData.backgroundColor}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
