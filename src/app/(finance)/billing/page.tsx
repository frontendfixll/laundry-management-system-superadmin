'use client';

import { useState, useEffect } from 'react';
import { useBilling, Invoice } from '@/hooks/useBilling';
import { useTenancies } from '@/hooks/useTenancies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function BillingPage() {
  const { 
    invoices, 
    stats, 
    loading, 
    fetchInvoices, 
    fetchStats, 
    generateInvoice,
    markInvoicePaid 
  } = useBilling();
  const { tenancies, fetchTenancies } = useTenancies();
  
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [generateForm, setGenerateForm] = useState({ tenancyId: '', billingCycle: 'monthly' as const });
  const [payForm, setPayForm] = useState({ paymentMethod: 'manual', transactionId: '' });

  useEffect(() => {
    fetchInvoices();
    fetchStats();
    fetchTenancies();
  }, [fetchInvoices, fetchStats, fetchTenancies]);

  const handleGenerate = async () => {
    if (!generateForm.tenancyId) {
      toast.error('Please select a tenancy');
      return;
    }
    const result = await generateInvoice(generateForm.tenancyId, generateForm.billingCycle);
    if (result.success) {
      toast.success('Invoice generated successfully');
      setIsGenerateOpen(false);
      setGenerateForm({ tenancyId: '', billingCycle: 'monthly' });
    } else {
      toast.error(result.message || 'Failed to generate invoice');
    }
  };

  const handleMarkPaid = async () => {
    if (!selectedInvoice) return;
    const success = await markInvoicePaid(selectedInvoice._id, payForm.paymentMethod, payForm.transactionId);
    if (success) {
      toast.success('Invoice marked as paid');
      setIsPayOpen(false);
      setSelectedInvoice(null);
      setPayForm({ paymentMethod: 'manual', transactionId: '' });
    }
  };

  const openPayDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPayForm({ paymentMethod: 'manual', transactionId: '' });
    setIsPayOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      paid: 'default',
      pending: 'secondary',
      overdue: 'destructive',
      cancelled: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Manage platform billing and invoices</p>
        </div>
        <Button onClick={() => setIsGenerateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generate Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingInvoices || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.overdueInvoices || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      {stats?.planDistribution && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(stats.planDistribution).map(([plan, count]) => (
                <div key={plan} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <span className="font-medium capitalize">{plan}:</span>
                  <span>{count} tenancies</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>All platform invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Tenancy</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.tenancy?.name || 'N/A'}</TableCell>
                    <TableCell className="capitalize">{invoice.plan}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount.total)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      {invoice.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => openPayDialog(invoice)}>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Generate Invoice Dialog */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>Create a new invoice for a tenancy</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tenancy</Label>
              <Select 
                value={generateForm.tenancyId} 
                onValueChange={(value) => setGenerateForm({ ...generateForm, tenancyId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tenancy" />
                </SelectTrigger>
                <SelectContent>
                  {tenancies.map((t) => (
                    <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Billing Cycle</Label>
              <Select 
                value={generateForm.billingCycle} 
                onValueChange={(value: 'monthly' | 'yearly') => setGenerateForm({ ...generateForm, billingCycle: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerate}>Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Paid Dialog */}
      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Invoice as Paid</DialogTitle>
            <DialogDescription>
              Invoice: {selectedInvoice?.invoiceNumber} - {formatCurrency(selectedInvoice?.amount.total || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <Select 
                value={payForm.paymentMethod} 
                onValueChange={(value) => setPayForm({ ...payForm, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Transaction ID (optional)</Label>
              <Input
                value={payForm.transactionId}
                onChange={(e) => setPayForm({ ...payForm, transactionId: e.target.value })}
                placeholder="Enter transaction ID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayOpen(false)}>Cancel</Button>
            <Button onClick={handleMarkPaid}>
              <CreditCard className="mr-2 h-4 w-4" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
