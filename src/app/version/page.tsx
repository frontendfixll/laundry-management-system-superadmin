import { APP_VERSION } from '@/lib/version';

export default function VersionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Laundry Management System
        </h1>
        <div className="space-y-2">
          <p className="text-gray-600">
            <span className="font-semibold">Version:</span> {APP_VERSION}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Frontend:</span> SuperAdmin Portal
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Build:</span> {new Date().toISOString()}
          </p>
        </div>
      </div>
    </div>
  );
}
