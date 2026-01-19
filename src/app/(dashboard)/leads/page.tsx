'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LeadsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to sales-leads page
    router.replace('/sales-leads');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="ml-3 text-gray-600">Redirecting to Sales Leads...</p>
    </div>
  );
}
