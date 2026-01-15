'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLeads, Lead, LeadStatus } from '@/hooks/useLeads';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Phone, Building2, Calendar, Trash2, Save, MapPin, Package, Crown, Globe, CreditCard, Copy, ExternalLink, Clock, Share2, MessageCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  small_laundry: 'Small Laundry',
  chain: 'Chain',
  dry_cleaner: 'Dry Cleaner',
  other: 'Other'
};

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
  enterprise: 'Enterprise',
  undecided: 'Not Decided'
};

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  basic: 'bg-blue-100 text-blue-700',
  pro: 'bg-purple-100 text-purple-700',
  enterprise: 'bg-amber-100 text-amber-700',
  undecided: 'bg-gray-100 text-gray-500'
};

const SOURCE_LABELS: Record<string, string> = {
  website: 'Website',
  pricing_page: 'Pricing Page',
  referral: 'Referral',
  other: 'Other'
};

const STATUS_COLORS: Record<LeadStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  new: 'default',
  contacted: 'secondary',
  converted: 'default',
  closed: 'outline'
};

interface PaymentLink {
  _id: string;
  token: string;
  plan: string;
  billingCycle: 'monthly' | 'yearly';
  amount: {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  };
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  expiresAt: string;
  createdAt: string;
  paidAt?: string;
}

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;
  
  const { getLeadById, updateLead, deleteLead, loading, error } = useLeads();
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [status, setStatus] = useState<LeadStatus>('new');
  const [notes, setNotes] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Payment link state
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<string>('basic');
  const [paymentCycle, setPaymentCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentDiscount, setPaymentDiscount] = useState<string>('0');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [creatingPaymentLink, setCreatingPaymentLink] = useState(false);
  const [newPaymentUrl, setNewPaymentUrl] = useState<string | null>(null);
  
  // Custom pricing state
  const [useCustomPricing, setUseCustomPricing] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>('');
  
  // Mark as paid state
  const [isMarkPaidDialogOpen, setIsMarkPaidDialogOpen] = useState(false);
  const [markPaidLinkId, setMarkPaidLinkId] = useState<string | null>(null);
  const [offlinePaymentMethod, setOfflinePaymentMethod] = useState<string>('upi');
  const [offlineTransactionId, setOfflineTransactionId] = useState('');
  const [offlineNotes, setOfflineNotes] = useState('');
  const [markingAsPaid, setMarkingAsPaid] = useState(false);
  
  // Share dropdown state
  const [shareDropdownOpen, setShareDropdownOpen] = useState<string | null>(null);
  
  // Available plans for payment link
  const [availablePlans, setAvailablePlans] = useState<Array<{name: string; displayName: string; isActive: boolean}>>([]);

  const loadPaymentLinks = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/superadmin/payment-links/lead/${leadId}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setPaymentLinks(data.data);
      }
    } catch (err) {
      console.error('Failed to load payment links:', err);
    }
  }, [leadId]);

  const loadAvailablePlans = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/superadmin/billing/plans`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        // Filter only active plans
        const activePlans = data.data.filter((plan: { isActive: boolean }) => plan.isActive);
        setAvailablePlans(activePlans);
        // Set default plan if available
        if (activePlans.length > 0 && !paymentPlan) {
          setPaymentPlan(activePlans[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    }
  }, [paymentPlan]);

  // Helper to get auth headers
  function getAuthHeaders() {
    let token = null;
    
    // Try superadmin-storage (Zustand persist format)
    const superAdminData = localStorage.getItem('superadmin-storage');
    if (superAdminData) {
      try {
        const parsed = JSON.parse(superAdminData);
        token = parsed.state?.token || parsed.token;
      } catch (e) {}
    }
    
    // Fallback to legacy keys
    if (!token) {
      token = localStorage.getItem('superadmin-token') || localStorage.getItem('superAdminToken');
    }
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  useEffect(() => {
    const loadLead = async () => {
      const data = await getLeadById(leadId);
      if (data) {
        setLead(data);
        setStatus(data.status);
        setNotes(data.notes || '');
        // Pre-select plan if lead has one
        if (data.interestedPlan && data.interestedPlan !== 'undecided' && data.interestedPlan !== 'free') {
          setPaymentPlan(data.interestedPlan);
        }
      }
    };
    loadLead();
    loadPaymentLinks();
    loadAvailablePlans();
  }, [leadId, getLeadById, loadPaymentLinks, loadAvailablePlans]);

  const handleSave = async () => {
    if (!lead) return;
    
    setIsSaving(true);
    const success = await updateLead(lead._id, { status, notes });
    setIsSaving(false);
    
    if (success) {
      toast.success('Lead updated successfully');
      const updated = await getLeadById(leadId);
      if (updated) {
        setLead(updated);
      }
    } else {
      toast.error('Failed to update lead');
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    
    const success = await deleteLead(lead._id);
    if (success) {
      toast.success('Lead deleted');
      router.push('/leads');
    } else {
      toast.error('Failed to delete lead');
    }
    setIsDeleteDialogOpen(false);
  };

  const handleCreatePaymentLink = async () => {
    setCreatingPaymentLink(true);
    setNewPaymentUrl(null);
    
    try {
      const response = await fetch(`${API_URL}/superadmin/payment-links`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          leadId,
          plan: paymentPlan,
          billingCycle: paymentCycle,
          discount: parseFloat(paymentDiscount) || 0,
          customAmount: useCustomPricing ? parseFloat(customAmount) || 0 : undefined,
          notes: paymentNotes
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Payment link created!');
        setNewPaymentUrl(data.data.paymentUrl);
        loadPaymentLinks();
        // Refresh lead to get updated status
        const updated = await getLeadById(leadId);
        if (updated) {
          setLead(updated);
          setStatus(updated.status);
        }
      } else {
        toast.error(data.message || 'Failed to create payment link');
      }
    } catch (err) {
      toast.error('Failed to create payment link');
    } finally {
      setCreatingPaymentLink(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleCancelPaymentLink = async (linkId: string) => {
    try {
      const response = await fetch(`${API_URL}/superadmin/payment-links/${linkId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Payment link cancelled');
        loadPaymentLinks();
      } else {
        toast.error(data.message || 'Failed to cancel');
      }
    } catch (err) {
      toast.error('Failed to cancel payment link');
    }
  };

  // Share functions
  const handleShareWhatsApp = (url: string) => {
    const message = `Hi! Here's your payment link for LaundryLobby subscription:\n\n${url}\n\nPlease complete the payment at your convenience.`;
    const whatsappUrl = `https://wa.me/${lead?.phone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShareDropdownOpen(null);
  };

  const handleShareEmail = (url: string) => {
    const subject = `Payment Link for ${lead?.businessName} - LaundryLobby`;
    const body = `Hi ${lead?.name},\n\nHere's your payment link for LaundryLobby subscription:\n\n${url}\n\nPlease complete the payment at your convenience.\n\nThank you!`;
    window.location.href = `mailto:${lead?.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setShareDropdownOpen(null);
  };

  const handleShareSMS = (url: string) => {
    const message = `Hi! Your LaundryLobby payment link: ${url}`;
    window.location.href = `sms:${lead?.phone || ''}?body=${encodeURIComponent(message)}`;
    setShareDropdownOpen(null);
  };

  // Mark as paid functions
  const openMarkPaidDialog = (linkId: string) => {
    setMarkPaidLinkId(linkId);
    setOfflinePaymentMethod('upi');
    setOfflineTransactionId('');
    setOfflineNotes('');
    setIsMarkPaidDialogOpen(true);
  };

  const handleMarkAsPaid = async () => {
    if (!markPaidLinkId) return;
    
    setMarkingAsPaid(true);
    try {
      const response = await fetch(`${API_URL}/superadmin/payment-links/${markPaidLinkId}/mark-paid`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          paymentMethod: offlinePaymentMethod,
          transactionId: offlineTransactionId,
          notes: offlineNotes
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Payment marked as paid!');
        setIsMarkPaidDialogOpen(false);
        loadPaymentLinks();
        // Refresh lead to get updated status
        const updated = await getLeadById(leadId);
        if (updated) {
          setLead(updated);
          setStatus(updated.status);
        }
      } else {
        toast.error(data.message || 'Failed to mark as paid');
      }
    } catch (err) {
      toast.error('Failed to mark as paid');
    } finally {
      setMarkingAsPaid(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentLinkUrl = (token: string) => {
    const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL || 'http://localhost:3002';
    return `${marketingUrl}/pay/${token}`;
  };

  if (loading && !lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.push('/leads')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Button>
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error || 'Lead not found'}
        </div>
      </div>
    );
  }

  const hasAddress = lead.address && (lead.address.line1 || lead.address.city);
  const canCreatePaymentLink = lead.interestedPlan !== 'free' && lead.status !== 'converted';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/leads')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
              {lead.interestedPlan && lead.interestedPlan !== 'undecided' && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${PLAN_COLORS[lead.interestedPlan] || PLAN_COLORS.undecided}`}>
                  {PLAN_LABELS[lead.interestedPlan]} Plan
                </span>
              )}
            </div>
            <p className="text-muted-foreground">{lead.businessName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Lead contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                  {lead.email}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                  {lead.phone}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Business Type</p>
                <p>{BUSINESS_TYPE_LABELS[lead.businessType] || lead.businessType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p>{format(new Date(lead.createdAt), 'PPpp')}</p>
              </div>
            </div>
            {lead.source && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Source</p>
                  <p>{SOURCE_LABELS[lead.source] || lead.source}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
            <CardDescription>Scale and plan interest</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Interested Plan</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${PLAN_COLORS[lead.interestedPlan || 'undecided']}`}>
                  {PLAN_LABELS[lead.interestedPlan || 'undecided']}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Expected Monthly Orders</p>
                <p>{lead.expectedMonthlyOrders || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Current Branches</p>
                <p>{lead.currentBranches || 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        {hasAddress && (
          <Card>
            <CardHeader>
              <CardTitle>Business Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  {lead.address?.line1 && <p>{lead.address.line1}</p>}
                  {lead.address?.line2 && <p>{lead.address.line2}</p>}
                  <p>
                    {[lead.address?.city, lead.address?.state, lead.address?.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {lead.address?.country && <p>{lead.address.country}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status & Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Notes</CardTitle>
            <CardDescription>Update lead status and add internal notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Internal Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this lead..."
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Links */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Links
              </CardTitle>
              <CardDescription>Send payment links to collect subscription fees</CardDescription>
            </div>
            {canCreatePaymentLink && (
              <Button onClick={() => setIsPaymentDialogOpen(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Create Payment Link
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {paymentLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No payment links created yet.
                {canCreatePaymentLink && ' Click "Create Payment Link" to send one.'}
              </p>
            ) : (
              <div className="space-y-4">
                {paymentLinks.map((link) => (
                  <div
                    key={link._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{PLAN_LABELS[link.plan]} Plan</span>
                        <Badge variant={
                          link.status === 'paid' ? 'default' :
                          link.status === 'pending' ? 'secondary' :
                          'outline'
                        }>
                          {link.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(link.amount.total)} • {link.billingCycle}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {link.status === 'paid' 
                          ? `Paid on ${format(new Date(link.paidAt!), 'PP')}`
                          : `Expires ${format(new Date(link.expiresAt), 'PP')}`
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {link.status === 'pending' && (
                        <>
                          {/* Share Dropdown */}
                          <div className="relative">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShareDropdownOpen(shareDropdownOpen === link._id ? null : link._id)}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                            {shareDropdownOpen === link._id && (
                              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10">
                                <button
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                  onClick={() => handleShareWhatsApp(getPaymentLinkUrl(link.token))}
                                >
                                  <MessageCircle className="h-4 w-4 text-green-500" />
                                  WhatsApp
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                  onClick={() => handleShareEmail(getPaymentLinkUrl(link.token))}
                                >
                                  <Mail className="h-4 w-4 text-blue-500" />
                                  Email
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                  onClick={() => handleShareSMS(getPaymentLinkUrl(link.token))}
                                >
                                  <Phone className="h-4 w-4 text-purple-500" />
                                  SMS
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-t"
                                  onClick={() => {
                                    handleCopyLink(getPaymentLinkUrl(link.token));
                                    setShareDropdownOpen(null);
                                  }}
                                >
                                  <Copy className="h-4 w-4" />
                                  Copy Link
                                </button>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getPaymentLinkUrl(link.token), '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openMarkPaidDialog(link._id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Paid
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelPaymentLink(link._id)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message */}
        {lead.message && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Message from Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{lead.message}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Payment Link Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={(open) => {
        setIsPaymentDialogOpen(open);
        if (!open) {
          setNewPaymentUrl(null);
          setPaymentNotes('');
          setPaymentDiscount('0');
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Payment Link</DialogTitle>
            <DialogDescription>
              Generate a payment link to send to {lead.businessName}
            </DialogDescription>
          </DialogHeader>
          
          {newPaymentUrl ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                  Payment link created successfully!
                </p>
                <div className="flex items-center gap-2">
                  <Input value={newPaymentUrl} readOnly className="text-xs" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(newPaymentUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this link with the lead via email or WhatsApp.
              </p>
              <DialogFooter>
                <Button onClick={() => {
                  setIsPaymentDialogOpen(false);
                  setNewPaymentUrl(null);
                }}>
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={paymentPlan} onValueChange={setPaymentPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.length > 0 ? (
                      availablePlans.map((plan) => (
                        <SelectItem key={plan.name} value={plan.name}>
                          {plan.displayName}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Billing Cycle</Label>
                <Select value={paymentCycle} onValueChange={(v) => setPaymentCycle(v as 'monthly' | 'yearly')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly (Save 20%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Discount (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={paymentDiscount}
                  onChange={(e) => setPaymentDiscount(e.target.value)}
                  placeholder="0"
                />
              </div>
              
              {/* Custom Pricing Option */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useCustomPricing"
                    checked={useCustomPricing}
                    onChange={(e) => setUseCustomPricing(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="useCustomPricing" className="cursor-pointer">
                    Use Custom Pricing (for special deals)
                  </Label>
                </div>
                {useCustomPricing && (
                  <Input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter custom amount (₹)"
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Internal notes about this payment link..."
                  rows={2}
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePaymentLink} disabled={creatingPaymentLink}>
                  {creatingPaymentLink ? 'Creating...' : 'Create Link'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Dialog */}
      <Dialog open={isMarkPaidDialogOpen} onOpenChange={setIsMarkPaidDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Payment as Paid</DialogTitle>
            <DialogDescription>
              Record an offline payment (cash, bank transfer, UPI, etc.)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={offlinePaymentMethod} onValueChange={setOfflinePaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="manual">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Transaction ID / Reference (optional)</Label>
              <Input
                value={offlineTransactionId}
                onChange={(e) => setOfflineTransactionId(e.target.value)}
                placeholder="e.g., UPI ref number, cheque number"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={offlineNotes}
                onChange={(e) => setOfflineNotes(e.target.value)}
                placeholder="Any additional notes about this payment..."
                rows={2}
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMarkPaidDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleMarkAsPaid} 
                disabled={markingAsPaid}
                className="bg-green-600 hover:bg-green-700"
              >
                {markingAsPaid ? 'Processing...' : 'Confirm Payment'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
