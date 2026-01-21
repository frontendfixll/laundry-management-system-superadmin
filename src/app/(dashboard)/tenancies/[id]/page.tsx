'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Settings, 
  Shield, 
  Save,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { superAdminApi } from '@/lib/superAdminApi';
import { useNotificationsWebSocket } from '@/hooks/useNotificationsWebSocket';

interface TenancyOwner {
  _id: string;
  name: string;
  email: string;
  permissions: Record<string, Record<string, boolean>>;
  permissionSummary?: {
    modules: number;
    totalPermissions: number;
  };
}

interface TenancyDetail {
  _id: string;
  name: string;
  businessName: string;
  subdomain: string;
  status: string;
  owner: TenancyOwner;
  subscription: {
    plan: string;
    status: string;
    features: Record<string, boolean | number>;
  };
  createdAt: string;
}

// All available permission modules
const PERMISSION_MODULES = [
  {
    key: 'orders',
    label: 'Orders',
    description: 'Order management and processing',
    actions: ['view', 'create', 'update', 'delete', 'assign', 'cancel', 'process']
  },
  {
    key: 'customers',
    label: 'Customers',
    description: 'Customer management',
    actions: ['view', 'create', 'update', 'delete']
  },
  {
    key: 'inventory',
    label: 'Inventory',
    description: 'Inventory and stock management',
    actions: ['view', 'create', 'update', 'delete', 'restock', 'writeOff']
  },
  {
    key: 'services',
    label: 'Services',
    description: 'Service management and pricing',
    actions: ['view', 'create', 'update', 'delete', 'toggle', 'updatePricing']
  },
  {
    key: 'staff',
    label: 'Staff',
    description: 'Staff management and attendance',
    actions: ['view', 'create', 'update', 'delete', 'assignShift', 'manageAttendance']
  },
  {
    key: 'logistics',
    label: 'Logistics',
    description: 'Delivery and logistics management',
    actions: ['view', 'create', 'update', 'delete', 'assign', 'track']
  },
  {
    key: 'tickets',
    label: 'Support Tickets',
    description: 'Customer support and tickets',
    actions: ['view', 'create', 'update', 'delete', 'assign', 'resolve', 'escalate']
  },
  {
    key: 'performance',
    label: 'Performance',
    description: 'Analytics and performance reports',
    actions: ['view', 'create', 'update', 'delete', 'export']
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Business analytics and insights',
    actions: ['view']
  },
  {
    key: 'settings',
    label: 'Settings',
    description: 'System settings and configuration',
    actions: ['view', 'create', 'update', 'delete']
  },
  {
    key: 'coupons',
    label: 'Coupons',
    description: 'Coupon and discount management',
    actions: ['view', 'create', 'update', 'delete']
  },
  {
    key: 'branches',
    label: 'Branches',
    description: 'Branch management',
    actions: ['view', 'create', 'update', 'delete']
  },
  {
    key: 'branchAdmins',
    label: 'Branch Admins',
    description: 'Branch administrator management',
    actions: ['view', 'create', 'update', 'delete']
  },
  {
    key: 'support',
    label: 'Support',
    description: 'Support system management',
    actions: ['view', 'create', 'update', 'delete', 'assign', 'manage']
  }
];

export default function TenancyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenancyId = params.id as string;

  const [tenancy, setTenancy] = useState<TenancyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});

  // Initialize WebSocket for real-time updates
  const { isConnected } = useNotificationsWebSocket();

  useEffect(() => {
    fetchTenancyDetail();
  }, [tenancyId]);

  // Listen for real-time tenancy updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleTenancyUpdate = (event: any) => {
        const { tenancyId: updatedTenancyId, type, tenancyName } = event.detail || event;
        
        // Only refresh if this is the tenancy we're viewing
        if (updatedTenancyId === tenancyId) {
          console.log('🔄 Received real-time tenancy update:', type);
          
          // Show slide notification
          if ((window as any).__addSlideNotification) {
            if (type === 'tenancyFeaturesUpdated') {
              (window as any).__addSlideNotification({
                title: 'Features Updated',
                message: `Features have been updated for ${tenancyName || 'this tenancy'}`,
                type: 'system_alert',
                duration: 5000,
                actionText: 'View Changes',
                onAction: () => {
                  // Scroll to features tab
                  const featuresTab = document.querySelector('[data-value="features"]');
                  if (featuresTab) {
                    (featuresTab as HTMLElement).click();
                  }
                }
              });
            } else if (type === 'tenancyPermissionsUpdated') {
              (window as any).__addSlideNotification({
                title: 'Permissions Updated',
                message: `Owner permissions have been updated for ${tenancyName || 'this tenancy'}`,
                type: 'permission_update',
                duration: 5000,
                actionText: 'View Changes',
                onAction: () => {
                  // Scroll to permissions tab
                  const permissionsTab = document.querySelector('[data-value="permissions"]');
                  if (permissionsTab) {
                    (permissionsTab as HTMLElement).click();
                  }
                }
              });
            }
          }
          
          // Also show toast notification as backup
          if (type === 'tenancyFeaturesUpdated') {
            toast.success('Tenancy features updated - refreshing data');
          } else if (type === 'tenancyPermissionsUpdated') {
            toast.success('Owner permissions updated - refreshing data');
          }
          
          // Refresh tenancy data
          fetchTenancyDetail();
        }
      };

      // Listen for WebSocket events via global socket
      const checkForSocket = () => {
        const socket = (window as any).__notificationSocket;
        if (socket && socket.connected) {
          console.log('🔌 Setting up tenancy update listeners');
          
          // Listen for tenancy feature updates
          socket.on('tenancyFeaturesUpdated', (data: any) => {
            console.log('📡 Received tenancyFeaturesUpdated:', data);
            handleTenancyUpdate({ ...data, type: 'tenancyFeaturesUpdated' });
          });
          
          // Listen for tenancy permission updates
          socket.on('tenancyPermissionsUpdated', (data: any) => {
            console.log('📡 Received tenancyPermissionsUpdated:', data);
            handleTenancyUpdate({ ...data, type: 'tenancyPermissionsUpdated' });
          });
          
          return true;
        }
        return false;
      };

      // Try to set up listeners immediately
      if (!checkForSocket()) {
        // If socket not ready, retry every second for up to 10 seconds
        let retries = 0;
        const interval = setInterval(() => {
          retries++;
          if (checkForSocket() || retries >= 10) {
            clearInterval(interval);
          }
        }, 1000);
        
        return () => clearInterval(interval);
      }

      // Cleanup function
      return () => {
        const socket = (window as any).__notificationSocket;
        if (socket) {
          socket.off('tenancyFeaturesUpdated');
          socket.off('tenancyPermissionsUpdated');
        }
      };
    }
  }, [tenancyId, isConnected]);

  const fetchTenancyDetail = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching tenancy detail for ID:', tenancyId);
      console.log('🌐 API Base URL:', process.env.NEXT_PUBLIC_API_URL);
      
      // Check if we have authentication
      const authHeaders = getAuthHeaders();
      console.log('🔑 Auth headers:', authHeaders);
      
      const response = await superAdminApi.get(`/tenancies/${tenancyId}`);
      console.log('📡 Tenancy API response:', response);
      
      if (response && response.success) {
        const tenancyData = response.data.tenancy;
        console.log('✅ Tenancy data received:', tenancyData);
        setTenancy(tenancyData);
        
        // Fetch owner permissions
        console.log('🛡️ Fetching owner permissions...');
        const permissionsResponse = await superAdminApi.get(`/tenancies/${tenancyId}/owner/permissions`);
        console.log('📡 Permissions API response:', permissionsResponse);
        
        if (permissionsResponse && permissionsResponse.success) {
          console.log('✅ Permissions data received:', permissionsResponse.data.owner.permissions);
          setPermissions(permissionsResponse.data.owner.permissions || {});
        }
      } else {
        console.error('❌ Tenancy API failed:', response);
        toast.error(response?.message || 'Failed to load tenancy');
      }
    } catch (error: any) {
      console.error('❌ Error fetching tenancy:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Check if it's an authentication error
      if (error.message?.includes('Session expired') || error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        // Redirect to login
        router.push('/auth/login?expired=true');
      } else {
        toast.error(error.message || 'Failed to load tenancy details');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check auth headers (for debugging)
  const getAuthHeaders = () => {
    let token = null;
    
    // Try unified auth-storage (new unified store)
    const authData = localStorage.getItem('auth-storage');
    console.log('🔍 auth-storage:', authData ? 'found' : 'not found');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        console.log('🔍 Parsed auth-storage:', { hasState: !!parsed.state, hasToken: !!parsed.state?.token });
        token = parsed.state?.token || parsed.token;
      } catch (e) {
        console.error('Error parsing auth-storage:', e);
      }
    }
    
    // Fallback to legacy superadmin-storage
    if (!token) {
      const superAdminData = localStorage.getItem('superadmin-storage');
      if (superAdminData) {
        try {
          const parsed = JSON.parse(superAdminData);
          token = parsed.state?.token || parsed.token;
        } catch (e) {
          console.error('Error parsing superadmin-storage:', e);
        }
      }
    }
    
    // Fallback to legacy token keys
    if (!token) {
      token = localStorage.getItem('superadmin-token') || localStorage.getItem('superAdminToken') || localStorage.getItem('token');
    }
    
    console.log('🔑 Final token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  };

  const handlePermissionChange = (module: string, action: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: value
      }
    }));
  };

  const handleModuleToggle = (module: string, enable: boolean) => {
    const moduleConfig = PERMISSION_MODULES.find(m => m.key === module);
    if (!moduleConfig) return;

    const modulePermissions: Record<string, boolean> = {};
    moduleConfig.actions.forEach(action => {
      modulePermissions[action] = enable;
    });

    setPermissions(prev => ({
      ...prev,
      [module]: modulePermissions
    }));
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      
      const response = await superAdminApi.patch(`/tenancies/${tenancyId}/owner/permissions`, {
        permissions
      });

      if (response.data.success) {
        toast.success('Owner permissions updated successfully');
        await fetchTenancyDetail(); // Refresh data
      }
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      toast.error(error.response?.data?.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const grantAllPermissions = () => {
    const allPermissions: Record<string, Record<string, boolean>> = {};
    
    PERMISSION_MODULES.forEach(module => {
      allPermissions[module.key] = {};
      module.actions.forEach(action => {
        allPermissions[module.key][action] = true;
      });
    });
    
    setPermissions(allPermissions);
  };

  const revokeAllPermissions = () => {
    const noPermissions: Record<string, Record<string, boolean>> = {};
    
    PERMISSION_MODULES.forEach(module => {
      noPermissions[module.key] = {};
      module.actions.forEach(action => {
        noPermissions[module.key][action] = false;
      });
    });
    
    setPermissions(noPermissions);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!tenancy) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Tenancy not found</h2>
          <p className="text-gray-600 mt-2">The tenancy you're looking for doesn't exist or you don't have permission to view it.</p>
          <div className="mt-4 space-x-2">
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button variant="outline" onClick={() => router.push('/tenancies')}>
              View All Tenancies
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate permission summary
  let enabledModules = 0;
  let totalPermissions = 0;
  
  Object.keys(permissions).forEach(module => {
    const modulePerms = permissions[module] || {};
    const enabledPerms = Object.values(modulePerms).filter(Boolean);
    if (enabledPerms.length > 0) {
      enabledModules++;
      totalPermissions += enabledPerms.length;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tenancy.name}</h1>
            <p className="text-gray-600">Tenancy Management</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Real-time connection indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-xs text-gray-500">
              {isConnected ? 'Live updates' : 'Offline'}
            </span>
          </div>
          
          {/* Manual refresh button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchTenancyDetail}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Badge variant={tenancy.status === 'active' ? 'default' : 'secondary'}>
            {tenancy.status}
          </Badge>
        </div>
      </div>

      {/* Tenancy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Name</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenancy.businessName || tenancy.name}</div>
            <p className="text-xs text-muted-foreground">
              {tenancy.subdomain}.laundrylobby.com
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owner</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenancy.owner.name}</div>
            <p className="text-xs text-muted-foreground">{tenancy.owner.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledModules}/{PERMISSION_MODULES.length}</div>
            <p className="text-xs text-muted-foreground">{totalPermissions} total permissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="permissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="permissions" data-value="permissions">Owner Permissions</TabsTrigger>
          <TabsTrigger value="features" data-value="features">Features</TabsTrigger>
          <TabsTrigger value="settings" data-value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Owner Permissions Management</CardTitle>
                  <CardDescription>
                    Manage what the tenancy owner can access and do in their dashboard
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={revokeAllPermissions}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Revoke All
                  </Button>
                  <Button variant="outline" onClick={grantAllPermissions}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Grant All
                  </Button>
                  <Button onClick={savePermissions} disabled={saving}>
                    {saving ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {PERMISSION_MODULES.map((module) => {
                  const modulePermissions = permissions[module.key] || {};
                  const enabledActions = Object.keys(modulePermissions).filter(
                    action => modulePermissions[action]
                  );
                  const allEnabled = enabledActions.length === module.actions.length;
                  const someEnabled = enabledActions.length > 0;

                  return (
                    <div key={module.key} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{module.label}</h3>
                          <p className="text-sm text-gray-500">{module.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={allEnabled ? 'default' : someEnabled ? 'secondary' : 'outline'}>
                            {enabledActions.length}/{module.actions.length}
                          </Badge>
                          <Button
                            size="sm"
                            variant={allEnabled ? 'destructive' : 'default'}
                            onClick={() => handleModuleToggle(module.key, !allEnabled)}
                          >
                            {allEnabled ? 'Disable All' : 'Enable All'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {module.actions.map((action) => (
                          <label key={action} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={modulePermissions[action] || false}
                              onChange={(e) => handlePermissionChange(module.key, action, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 capitalize">{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Tenancy Features</CardTitle>
              <CardDescription>Features enabled for this tenancy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(tenancy.subscription.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-sm capitalize">{feature.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Tenancy Settings</CardTitle>
              <CardDescription>Basic tenancy information and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Subscription Plan</label>
                  <p className="text-lg">{tenancy.subscription.plan}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Subscription Status</label>
                  <p className="text-lg">{tenancy.subscription.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Created At</label>
                  <p className="text-lg">{new Date(tenancy.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}