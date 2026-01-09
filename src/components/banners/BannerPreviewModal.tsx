'use client';

import { X } from 'lucide-react';

interface BannerPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: any;
}

export default function BannerPreviewModal({ isOpen, onClose, banner }: BannerPreviewModalProps) {
  if (!isOpen || !banner) return null;

  const renderBannerPreview = () => {
    const { templateType, content, styling, imageUrl } = banner;

    switch (templateType) {
      case 'HERO':
        return (
          <div className="relative h-96 rounded-lg overflow-hidden">
            {imageUrl && (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`}
                alt={content?.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
              <div className="p-8 text-white max-w-2xl">
                <h2 className="text-4xl font-bold mb-4">{content?.title}</h2>
                {content?.subtitle && (
                  <p className="text-xl mb-2">{content.subtitle}</p>
                )}
                <p className="text-xl mb-6">{content?.description}</p>
                {banner.cta?.text && (
                  <button
                    style={{ backgroundColor: styling?.primaryColor || '#3B82F6' }}
                    className="px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    {banner.cta.text}
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case 'CARD':
        return (
          <div
            className="rounded-lg p-6 shadow-lg"
            style={{ backgroundColor: styling?.backgroundColor || '#FFFFFF' }}
          >
            {imageUrl && (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`}
                alt={content?.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-2xl font-bold mb-2" style={{ color: styling?.primaryColor || '#1F2937' }}>
              {content?.title}
            </h3>
            {content?.subtitle && (
              <p className="text-lg text-gray-700 mb-2">{content.subtitle}</p>
            )}
            <p className="text-gray-600 mb-4">{content?.description}</p>
            {banner.cta?.text && (
              <button
                style={{ backgroundColor: styling?.primaryColor || '#3B82F6' }}
                className="w-full py-2 rounded-lg text-white font-semibold hover:opacity-90 transition"
              >
                {banner.cta.text}
              </button>
            )}
          </div>
        );

      case 'STRIP':
        return (
          <div
            className="py-3 px-6 flex items-center justify-between"
            style={{ backgroundColor: styling?.backgroundColor || '#3B82F6' }}
          >
            <div className="flex items-center gap-4">
              <span className="text-white font-semibold">{content?.title}</span>
              {content?.message && (
                <span className="text-white/90">{content.message}</span>
              )}
            </div>
            {banner.cta?.text && (
              <button className="bg-white text-blue-600 px-4 py-1 rounded-lg font-semibold hover:bg-gray-100 transition">
                {banner.cta.text}
              </button>
            )}
          </div>
        );

      case 'FLOATING':
        return (
          <div
            className="fixed bottom-4 right-4 w-80 rounded-lg shadow-2xl p-4"
            style={{ backgroundColor: styling?.backgroundColor || '#FFFFFF' }}
          >
            {imageUrl && (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`}
                alt={content?.title}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
            )}
            <h4 className="font-bold text-lg mb-2" style={{ color: styling?.primaryColor || '#1F2937' }}>
              {content?.title}
            </h4>
            {content?.subtitle && (
              <p className="text-sm text-gray-700 mb-2">{content.subtitle}</p>
            )}
            <p className="text-sm text-gray-600 mb-3">{content?.description}</p>
            {banner.cta?.text && (
              <button
                style={{ backgroundColor: styling?.primaryColor || '#3B82F6' }}
                className="w-full py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition"
              >
                {banner.cta.text}
              </button>
            )}
          </div>
        );

      case 'MODAL':
        return (
          <div className="bg-white rounded-lg shadow-2xl max-w-md mx-auto p-6">
            {imageUrl && (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`}
                alt={content?.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-2xl font-bold mb-3" style={{ color: styling?.primaryColor || '#1F2937' }}>
              {content?.title}
            </h3>
            {content?.subtitle && (
              <p className="text-lg text-gray-700 mb-2">{content.subtitle}</p>
            )}
            <p className="text-gray-600 mb-4">{content?.description}</p>
            {banner.cta?.text && (
              <button
                style={{ backgroundColor: styling?.primaryColor || '#3B82F6' }}
                className="w-full py-3 rounded-lg text-white font-semibold hover:opacity-90 transition"
              >
                {banner.cta.text}
              </button>
            )}
          </div>
        );

      case 'SLIDER':
        return (
          <div className="relative h-80 rounded-lg overflow-hidden">
            {imageUrl && (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`}
                alt={content?.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{content?.title}</h3>
              {content?.subtitle && (
                <p className="text-lg mb-2">{content.subtitle}</p>
              )}
              <p className="mb-4">{content?.description}</p>
              {banner.cta?.text && (
                <button
                  style={{ backgroundColor: styling?.primaryColor || '#3B82F6' }}
                  className="px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  {banner.cta.text}
                </button>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-2">Preview not available for this banner type</p>
            <p className="text-sm text-gray-400">Template Type: {templateType}</p>
            <div className="mt-4 text-left bg-white p-4 rounded">
              <p className="font-semibold mb-2">Banner Content:</p>
              <p className="text-sm"><strong>Title:</strong> {content?.title}</p>
              {content?.subtitle && <p className="text-sm"><strong>Subtitle:</strong> {content.subtitle}</p>}
              {content?.description && <p className="text-sm"><strong>Description:</strong> {content.description}</p>}
              {banner.cta?.text && <p className="text-sm"><strong>CTA:</strong> {banner.cta.text}</p>}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Banner Preview</h2>
            <p className="text-sm text-gray-600 mt-1">
              {banner.templateType} • {banner.position}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {banner.state}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {banner.bannerScope}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Banner Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Schedule:</span>
                <p className="font-medium">
                  {new Date(banner.schedule?.startDate).toLocaleDateString()} - {new Date(banner.schedule?.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Priority:</span>
                <p className="font-medium">{banner.priority}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            {renderBannerPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
