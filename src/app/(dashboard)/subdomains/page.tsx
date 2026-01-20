'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Search, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { superAdminApi } from '@/lib/superAdminApi';

interface Subdomain {
  subdomain: string;
  domain: string;
  tenancyName: string;
  status?: string;
  createdAt?: string;
}

export default function SubdomainsPage() {
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkingSubdomain, setCheckingSubdomain] = useState('');
  const [availabilityResult, setAvailabilityResult] = useState<any>(null);

  useEffect(() => {
    fetchSubdomains();
  }, []);

  const fetchSubdomains = async () => {
    try {
      setLoading(true);
      const response = await superAdminApi.get('/subdomains');
      
      if (response.success) {
        setSubdomains(response.data.subdomains || []);
      }
    } catch (error: any) {
      console.error('Error fetching subdomains:', error);
      toast.error('Failed to load subdomains');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!checkingSubdomain.trim()) {
      toast.error('Please enter a subdomain to check');
      return;
    }

    try {
      const response = await superAdminApi.post('/subdomains/check-availability', {
        subdomain: checkingSubdomain.toLowerCase().trim()
      });

      if (response.success) {
        setAvailabilityResult(response.data);
        if (response.data.available) {
          toast.success(`${response.data.subdomain} is available!`);
        } else {
          toast.error(`${response.data.subdomain} is already taken`);
        }
      }
    } catch (error: any) {
      console.error('Error checking availability:', error);
      toast.error(error.message || 'Failed to check availability');
    }
  };

  const removeSubdomain = async (subdomain: string) => {
    if (!confirm(`Are you sure you want to remove ${subdomain}.laundrylobby.com?`)) {
      return;
    }

    try {
      const response = await superAdminApi.delete(`/subdomains/${subdomain}`);
      
      if (response.success) {
        toast.success('Subdomain removed successfully');
        fetchSubdomains(); // Refresh list
      }
    } catch (error: any) {
      console.error('Error removing subdomain:', error);
      toast.error(error.message || 'Failed to remove subdomain');
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" />Unknown</Badge>;
    }
  };

  const filteredSubdomains = subdomains.filter(sub =>
    sub.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.tenancyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subdomain Management</h1>
          <p className="text-gray-600">Manage dynamic subdomains for tenancies</p>
        </div>
        <Button onClick={fetchSubdomains} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subdomains</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subdomains.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {subdomains.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {subdomains.filter(s => s.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {subdomains.filter(s => s.status === 'failed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subdomain Availability Checker */}
      <Card>
        <CardHeader>
          <CardTitle>Check Subdomain Availability</CardTitle>
          <CardDescription>
            Check if a subdomain is available before creating a tenancy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter subdomain (e.g., prakash)"
              value={checkingSubdomain}
              onChange={(e) => setCheckingSubdomain(e.target.value)}
              className="flex-1"
            />
            <span className="flex items-center text-gray-500">.laundrylobby.com</span>
            <Button onClick={checkAvailability}>
              Check
            </Button>
          </div>
          
          {availabilityResult && (
            <div className="mt-4 p-4 rounded-lg border">
              <div className="flex items-center space-x-2">
                {availabilityResult.available ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {availabilityResult.fullDomain}
                </span>
                <Badge variant={availabilityResult.available ? 'default' : 'destructive'}>
                  {availabilityResult.available ? 'Available' : 'Taken'}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Active Subdomains</CardTitle>
          <CardDescription>
            All subdomains currently configured for tenancies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search subdomains or tenancy names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : filteredSubdomains.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No subdomains match your search' : 'No subdomains found'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSubdomains.map((subdomain) => (
                <div
                  key={subdomain.subdomain}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium">{subdomain.domain}</div>
                      <div className="text-sm text-gray-500">{subdomain.tenancyName}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(subdomain.status)}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://${subdomain.domain}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubdomain(subdomain.subdomain)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            How to configure dynamic subdomains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">1. Vercel Configuration</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Add wildcard domain *.laundrylobby.com to your frontend Vercel project</li>
                <li>Configure VERCEL_TOKEN and VERCEL_FRONTEND_PROJECT_ID in backend .env</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">2. DNS Configuration</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Add CNAME record: *.laundrylobby.com → cname.vercel-dns.com</li>
                <li>DNS propagation may take 24-48 hours</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">3. Automatic Creation</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Subdomains are automatically created when you create new tenancies</li>
                <li>Each tenancy gets its own subdomain: tenancyname.laundrylobby.com</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}