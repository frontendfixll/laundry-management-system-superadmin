'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  Activity,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface ABACLogEntry {
  _id: string;
  decisionId: string;
  userId: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  decision: 'ALLOW' | 'DENY';
  appliedPolicies: Array<{
    policyId: string;
    policyName: string;
    effect: string;
    matched: boolean;
    reason?: string;
  }>;
  evaluationTime: number;
  ipAddress?: string;
  endpoint?: string;
  method?: string;
  createdAt: string;
}

interface AuditLogViewerProps {
  className?: string;
}

export default function AuditLogViewer({ className }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<ABACLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<string>('all');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<ABACLogEntry | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadAuditLogs();
  }, [pagination.page, decisionFilter, resourceTypeFilter, actionFilter]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (decisionFilter !== 'all') params.append('decision', decisionFilter);
      if (resourceTypeFilter !== 'all') params.append('resourceType', resourceTypeFilter);
      if (actionFilter !== 'all') params.append('action', actionFilter);

      const response = await api.get(`/superadmin/abac/audit-logs?${params}`);
      setLogs(response.data.data.logs);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.pagination.total,
        pages: response.data.data.pagination.pages
      }));
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (decisionFilter !== 'all') params.append('decision', decisionFilter);
      if (resourceTypeFilter !== 'all') params.append('resourceType', resourceTypeFilter);
      if (actionFilter !== 'all') params.append('action', actionFilter);
      params.append('limit', '1000'); // Export more records

      const response = await api.get(`/superadmin/abac/audit-logs?${params}`);
      const csvContent = convertToCSV(response.data.data.logs);
      downloadCSV(csvContent, `abac-audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast.error('Failed to export audit logs');
    }
  };

  const convertToCSV = (data: ABACLogEntry[]): string => {
    const headers = [
      'Decision ID',
      'User ID',
      'User Role',
      'Action',
      'Resource Type',
      'Resource ID',
      'Decision',
      'Evaluation Time (ms)',
      'IP Address',
      'Endpoint',
      'Method',
      'Applied Policies',
      'Timestamp'
    ];

    const rows = data.map(log => [
      log.decisionId,
      log.userId,
      log.userRole,
      log.action,
      log.resourceType,
      log.resourceId || '',
      log.decision,
      log.evaluationTime,
      log.ipAddress || '',
      log.endpoint || '',
      log.method || '',
      log.appliedPolicies.map(p => `${p.policyName}(${p.effect})`).join('; '),
      new Date(log.createdAt).toISOString()
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.decisionId.toLowerCase().includes(searchLower) ||
      log.userId.toLowerCase().includes(searchLower) ||
      log.userRole.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      log.resourceType.toLowerCase().includes(searchLower) ||
      log.appliedPolicies.some(p => 
        p.policyName.toLowerCase().includes(searchLower) ||
        p.policyId.toLowerCase().includes(searchLower)
      )
    );
  });

  const getDecisionColor = (decision: string) => {
    return decision === 'ALLOW' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getDecisionIcon = (decision: string) => {
    return decision === 'ALLOW' ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-600" />
    );
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={decisionFilter} onValueChange={setDecisionFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Decision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Decisions</SelectItem>
                <SelectItem value="ALLOW">Allow</SelectItem>
                <SelectItem value="DENY">Deny</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="tenancy">Tenancy</SelectItem>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="payout">Payout</SelectItem>
                <SelectItem value="notification">Notification</SelectItem>
                <SelectItem value="automation_rule">Automation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="notify">Notify</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadAuditLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ABAC Audit Logs</CardTitle>
            <Badge variant="outline">
              {filteredLogs.length} of {pagination.total} logs
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div key={log._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getDecisionIcon(log.decision)}
                        <Badge className={getDecisionColor(log.decision)}>
                          {log.decision}
                        </Badge>
                        <span className="font-medium">{log.action}</span>
                        <span className="text-gray-500">on</span>
                        <span className="font-medium">{log.resourceType}</span>
                        {log.resourceId && (
                          <span className="text-gray-500 text-sm">({log.resourceId})</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{log.userRole}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{log.evaluationTime}ms</span>
                        </div>
                        {log.ipAddress && (
                          <span>IP: {log.ipAddress}</span>
                        )}
                        {log.endpoint && (
                          <span>{log.method} {log.endpoint}</span>
                        )}
                      </div>

                      {log.appliedPolicies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {log.appliedPolicies.map((policy, index) => (
                            <Badge 
                              key={index} 
                              variant={policy.matched ? "default" : "outline"}
                              className="text-xs"
                            >
                              {policy.policyName} ({policy.effect})
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <LogDetailsModal
          log={selectedLog}
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}

// Log Details Modal Component
interface LogDetailsModalProps {
  log: ABACLogEntry;
  isOpen: boolean;
  onClose: () => void;
}

function LogDetailsModal({ log, isOpen, onClose }: LogDetailsModalProps) {
  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="fixed inset-4 bg-white rounded-lg shadow-xl overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Audit Log Details</h2>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Decision ID:</span>
                <span className="ml-2 font-mono">{log.decisionId}</span>
              </div>
              <div>
                <span className="font-medium">Decision:</span>
                <Badge className={`ml-2 ${log.decision === 'ALLOW' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {log.decision}
                </Badge>
              </div>
              <div>
                <span className="font-medium">User ID:</span>
                <span className="ml-2">{log.userId}</span>
              </div>
              <div>
                <span className="font-medium">User Role:</span>
                <span className="ml-2">{log.userRole}</span>
              </div>
              <div>
                <span className="font-medium">Action:</span>
                <span className="ml-2">{log.action}</span>
              </div>
              <div>
                <span className="font-medium">Resource Type:</span>
                <span className="ml-2">{log.resourceType}</span>
              </div>
              <div>
                <span className="font-medium">Evaluation Time:</span>
                <span className="ml-2">{log.evaluationTime}ms</span>
              </div>
              <div>
                <span className="font-medium">Timestamp:</span>
                <span className="ml-2">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {log.appliedPolicies.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Applied Policies</h3>
                <div className="space-y-2">
                  {log.appliedPolicies.map((policy, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{policy.policyName}</span>
                        <div className="flex gap-2">
                          <Badge variant={policy.matched ? "default" : "outline"}>
                            {policy.matched ? 'Matched' : 'Not Matched'}
                          </Badge>
                          <Badge variant="secondary">{policy.effect}</Badge>
                        </div>
                      </div>
                      {policy.reason && (
                        <p className="text-sm text-gray-600">{policy.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}