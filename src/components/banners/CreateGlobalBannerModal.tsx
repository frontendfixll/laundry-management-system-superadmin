'use client';

import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useCreateGlobalBanner } from '@/hooks/useSuperAdminBanners';
import api from '@/lib/api';

interface CreateGlobalBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Template {
  _id: string;
  name: string;
  code: string;
  type: string;
  allowedPositions: string[];
  layout?: any;
  design?: any;
}

interface Campaign {
  _id: string;
  name: string;
  description: string;
}

interface Promotion {
  id: string;
  type: string;
  name: string;
  description: string;
  status?: string;
}

export default function CreateGlobalBannerModal({ isOpen, onClose, onSuccess }: CreateGlobalBannerModalProps) {
  const { createGlobalBanner, loading } = useCreateGlobalBanner();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [promotions, setPromotions] = useState<{
    campaigns: Promotion[];
    discounts: Promotion[];
    coupons: Promotion[];
    referrals: Promotion[];
    loyalty: Promotion[];
  }>({
    campaigns: [],
    discounts: [],
    coupons: [],
    referrals: [],
    loyalty: []
  });
  const [loadingData, setLoadingData] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    templateId: '',
    position: '',
    content: {
      title: '',
      subtitle: '',
      description: '',
      message: ''
    },
    imageUrl: '',
    imageAlt: '',
    mobileImageUrl: '',
    promotionType: 'none',
    promotionId: '',
    linkedCampaign: '', // Backward compatibility
    cta: {
      text: 'Learn More',
      link: '',
      secondaryText: '',
      secondaryLink: ''
    },
    priority: 0,
    schedule: {
      startDate: '',
      endDate: '',
      autoActivate: true,
      autoComplete: true
    }
  });

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load templates and campaigns
  useEffect(() => {
    if (isOpen) {
      loadTemplatesAndCampaigns();
    } else {
      // Reset form when closed
      setFormData({
        templateId: '',
        position: '',
        content: {
          title: '',
          subtitle: '',
          description: '',
          message: ''
        },
        imageUrl: '',
        imageAlt: '',
        mobileImageUrl: '',
        promotionType: 'none',
        promotionId: '',
        linkedCampaign: '',
        cta: {
          text: 'Learn More',
          link: '',
          secondaryText: '',
          secondaryLink: ''
        },
        priority: 0,
        schedule: {
          startDate: '',
          endDate: '',
          autoActivate: true,
          autoComplete: true
        }
      });
      setSelectedTemplate(null);
      setErrors({});
      setImageFile(null);
      setImagePreview('');
    }
  }, [isOpen]);

  const loadTemplatesAndCampaigns = async () => {
    setLoadingData(true);
    try {
      // Load templates and all promotions
      const [templatesRes, promotionsRes] = await Promise.all([
        api.get('/superadmin/banners/banner-templates'),
        api.get('/superadmin/banners/promotions/all').catch(() => ({ data: { data: null } }))
      ]);

      setTemplates(templatesRes.data.data?.templates || []);
      
      // Set promotions if available
      if (promotionsRes.data.data) {
        setPromotions(promotionsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t._id === templateId);
    console.log('🔍 Selected template:', template);
    console.log('🔍 Template ID:', templateId);
    console.log('🔍 All templates:', templates);
    console.log('🔍 Allowed positions:', template?.allowedPositions);
    console.log('🔍 Is array?', Array.isArray(template?.allowedPositions));
    
    if (template && template.allowedPositions) {
      const globalPositions = template.allowedPositions.filter((pos: string) => pos.startsWith('GLOBAL_'));
      console.log('🔍 GLOBAL positions found:', globalPositions);
    }
    
    setSelectedTemplate(template || null);
    setFormData(prev => ({
      ...prev,
      templateId,
      position: '' // Reset position when template changes
    }));
  };

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

  const uploadImage = async () => {
    if (!imageFile) return '';

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post('/superadmin/banners/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.data.url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.templateId) newErrors.templateId = 'Template is required';
    if (!formData.position) newErrors.position = 'Position is required';
    if (!formData.content.title.trim()) newErrors.title = 'Title is required';
    // Promotion is optional for informational banners
    if (!formData.schedule.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.schedule.endDate) newErrors.endDate = 'End date is required';
    if (formData.schedule.startDate && formData.schedule.endDate && 
        new Date(formData.schedule.startDate) >= new Date(formData.schedule.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPromotionOptions = () => {
    switch (formData.promotionType) {
      case 'campaign':
        return promotions.campaigns;
      case 'discount':
        return promotions.discounts;
      case 'coupon':
        return promotions.coupons;
      case 'referral':
        return promotions.referrals;
      case 'loyalty':
        return promotions.loyalty;
      default:
        return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Upload image if selected
      let uploadedImageUrl = '';
      if (imageFile) {
        uploadedImageUrl = await uploadImage();
      }

      // Use uploaded image URL or existing URL
      const finalImageUrl = uploadedImageUrl || formData.imageUrl;

      const bannerData: any = {
        templateId: formData.templateId,
        position: formData.position,
        content: formData.content,
        imageUrl: finalImageUrl || undefined,
        imageAlt: formData.imageAlt,
        mobileImageUrl: formData.mobileImageUrl,
        cta: formData.cta,
        priority: formData.priority,
        schedule: formData.schedule
      };

      // Add promotion linking
      if (formData.promotionType !== 'none' && formData.promotionId) {
        bannerData.linkedPromotion = {
          type: formData.promotionType,
          id: formData.promotionId
        };
        
        // Backward compatibility for campaigns
        if (formData.promotionType === 'campaign') {
          bannerData.linkedCampaign = formData.promotionId;
        }
      }

      await createGlobalBanner(bannerData);
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
          {loadingData ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading templates and campaigns...</p>
            </div>
          ) : (
            <>
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Template * <span className="text-xs text-gray-500">(Type: HERO, SLIDER, etc.)</span>
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name} ({template.type}) - {template.code}
                    </option>
                  ))}
                </select>
                {errors.templateId && <p className="text-red-500 text-sm mt-1">{errors.templateId}</p>}
              </div>

              {/* Position Selection (only show if template selected) */}
              {selectedTemplate && selectedTemplate.allowedPositions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position * <span className="text-xs text-gray-500">(Where banner will appear globally)</span>
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a position</option>
                    {selectedTemplate.allowedPositions.map((position: string) => (
                      <option key={position} value={position}>
                        {position.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Global banners will appear in this position across all tenants
                  </p>
                  {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                </div>
              )}

              {/* Content Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Banner Content</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.content.title}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        content: { ...formData.content, title: e.target.value }
                      })}
                      maxLength={100}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Welcome Offer - 20% Off"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={formData.content.subtitle}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        content: { ...formData.content, subtitle: e.target.value }
                      })}
                      maxLength={150}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., For first-time customers"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.content.description}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        content: { ...formData.content, description: e.target.value }
                      })}
                      maxLength={500}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Detailed description of the offer..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <input
                      type="text"
                      value={formData.content.message}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        content: { ...formData.content, message: e.target.value }
                      })}
                      maxLength={200}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Limited time offer!"
                    />
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
                
                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
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
                          <span className="text-xs text-gray-500 mt-1">or enter URL below</span>
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

                  <div className="text-center text-sm text-gray-500">OR</div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="https://example.com/banner.jpg"
                      disabled={!!imageFile}
                    />
                    {imageFile && (
                      <p className="text-xs text-gray-500 mt-1">Remove uploaded image to use URL</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image Alt Text</label>
                    <input
                      type="text"
                      value={formData.imageAlt}
                      onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Banner Image"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Image URL</label>
                    <input
                      type="url"
                      value={formData.mobileImageUrl}
                      onChange={(e) => setFormData({ ...formData, mobileImageUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="https://example.com/banner-mobile.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Promotion Linking */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Promotion Linking</h3>
                
                <div className="space-y-4">
                  {/* Promotion Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link to Promotion (Optional)
                    </label>
                    <select
                      value={formData.promotionType}
                      onChange={(e) => setFormData({ ...formData, promotionType: e.target.value, promotionId: '' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="none">No Promotion (Informational Banner)</option>
                      <option value="campaign">Campaign</option>
                      <option value="discount">Discount</option>
                      <option value="coupon">Coupon</option>
                      <option value="referral">Referral Program</option>
                      <option value="loyalty">Loyalty Program</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Link this global banner to a specific promotion or leave as informational
                    </p>
                  </div>

                  {/* Promotion Selection */}
                  {formData.promotionType && formData.promotionType !== 'none' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select {formData.promotionType.charAt(0).toUpperCase() + formData.promotionType.slice(1)}
                      </label>
                      <select
                        value={formData.promotionId}
                        onChange={(e) => setFormData({ ...formData, promotionId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select {formData.promotionType}</option>
                        {getPromotionOptions().map((promo) => (
                          <option key={promo.id} value={promo.id}>
                            {promo.name}
                          </option>
                        ))}
                      </select>
                      {getPromotionOptions().length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          No {formData.promotionType}s available. Create one first or select a different type.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Call to Action</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Text</label>
                    <input
                      type="text"
                      value={formData.cta.text}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        cta: { ...formData.cta, text: e.target.value }
                      })}
                      maxLength={50}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Link</label>
                    <input
                      type="text"
                      value={formData.cta.link}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        cta: { ...formData.cta, link: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="/services or https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Text</label>
                    <input
                      type="text"
                      value={formData.cta.secondaryText}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        cta: { ...formData.cta, secondaryText: e.target.value }
                      })}
                      maxLength={50}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Link</label>
                    <input
                      type="text"
                      value={formData.cta.secondaryLink}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        cta: { ...formData.cta, secondaryLink: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority (0-100) <span className="text-xs text-gray-500">Higher = shown first</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Schedule */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="datetime-local"
                      value={formData.schedule.startDate}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        schedule: { ...formData.schedule, startDate: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                    <input
                      type="datetime-local"
                      value={formData.schedule.endDate}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        schedule: { ...formData.schedule, endDate: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.schedule.autoActivate}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        schedule: { ...formData.schedule, autoActivate: e.target.checked }
                      })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Auto-activate on start date</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.schedule.autoComplete}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        schedule: { ...formData.schedule, autoComplete: e.target.checked }
                      })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Auto-complete on end date</span>
                  </label>
                </div>
              </div>
            </>
          )}

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
              disabled={loading || uploading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : loading ? 'Creating...' : 'Create Global Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
