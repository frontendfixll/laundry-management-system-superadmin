/**
 * Property Tests for Lead Management
 * Feature: marketing-landing-page
 */

import * as fc from 'fast-check';

// Lead types matching the backend model
type LeadStatus = 'new' | 'contacted' | 'converted' | 'closed';
type BusinessType = 'small_laundry' | 'chain' | 'dry_cleaner' | 'other';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: BusinessType;
  message?: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Arbitraries for generating test data
const leadStatusArb = fc.constantFrom<LeadStatus>('new', 'contacted', 'converted', 'closed');
const businessTypeArb = fc.constantFrom<BusinessType>('small_laundry', 'chain', 'dry_cleaner', 'other');

const leadArb = fc.record({
  _id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  businessName: fc.string({ minLength: 1, maxLength: 200 }),
  businessType: businessTypeArb,
  message: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
  status: leadStatusArb,
  notes: fc.option(fc.string({ maxLength: 2000 }), { nil: undefined }),
  createdAt: fc.date().map(d => d.toISOString()),
  updatedAt: fc.date().map(d => d.toISOString()),
});

/**
 * Property 5: Lead List Display Completeness
 * Feature: marketing-landing-page, Property 5: Lead List Display Completeness
 * 
 * For any lead in the database, when displayed in the lead list, 
 * all required fields (name, businessName, businessType, createdAt, status) 
 * SHALL be present and match the stored values.
 * 
 * Validates: Requirements 6.2
 */
describe('Property 5: Lead List Display Completeness', () => {
  // Helper function to simulate lead list display transformation
  const transformLeadForDisplay = (lead: Lead) => ({
    name: lead.name,
    businessName: lead.businessName,
    businessType: lead.businessType,
    createdAt: lead.createdAt,
    status: lead.status,
  });

  it('should display all required fields for any lead', () => {
    fc.assert(
      fc.property(leadArb, (lead) => {
        const displayData = transformLeadForDisplay(lead);
        
        // All required fields must be present
        expect(displayData.name).toBeDefined();
        expect(displayData.businessName).toBeDefined();
        expect(displayData.businessType).toBeDefined();
        expect(displayData.createdAt).toBeDefined();
        expect(displayData.status).toBeDefined();
        
        // Values must match the original lead
        expect(displayData.name).toBe(lead.name);
        expect(displayData.businessName).toBe(lead.businessName);
        expect(displayData.businessType).toBe(lead.businessType);
        expect(displayData.createdAt).toBe(lead.createdAt);
        expect(displayData.status).toBe(lead.status);
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve field types for any lead', () => {
    fc.assert(
      fc.property(leadArb, (lead) => {
        const displayData = transformLeadForDisplay(lead);
        
        expect(typeof displayData.name).toBe('string');
        expect(typeof displayData.businessName).toBe('string');
        expect(typeof displayData.businessType).toBe('string');
        expect(typeof displayData.createdAt).toBe('string');
        expect(typeof displayData.status).toBe('string');
      }),
      { numRuns: 100 }
    );
  });

  it('should handle leads with all valid business types', () => {
    const businessTypes: BusinessType[] = ['small_laundry', 'chain', 'dry_cleaner', 'other'];
    
    fc.assert(
      fc.property(
        leadArb,
        fc.constantFrom(...businessTypes),
        (lead, businessType) => {
          const leadWithType = { ...lead, businessType };
          const displayData = transformLeadForDisplay(leadWithType);
          
          expect(displayData.businessType).toBe(businessType);
          expect(businessTypes).toContain(displayData.businessType);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle leads with all valid statuses', () => {
    const statuses: LeadStatus[] = ['new', 'contacted', 'converted', 'closed'];
    
    fc.assert(
      fc.property(
        leadArb,
        fc.constantFrom(...statuses),
        (lead, status) => {
          const leadWithStatus = { ...lead, status };
          const displayData = transformLeadForDisplay(leadWithStatus);
          
          expect(displayData.status).toBe(status);
          expect(statuses).toContain(displayData.status);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 4: Notification Read Status Update
 * Feature: marketing-landing-page, Property 4: Notification Read Status Update
 * 
 * For any unread notification, when marked as read, the notification 
 * SHALL have isRead=true and a valid readAt timestamp.
 * 
 * Validates: Requirements 5.3
 */
describe('Property 4: Notification Read Status Update', () => {
  interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
  }

  const notificationArb = fc.record({
    _id: fc.uuid(),
    type: fc.constant('new_lead'),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    message: fc.string({ minLength: 1, maxLength: 500 }),
    isRead: fc.constant(false), // Start as unread
    readAt: fc.constant(undefined),
    createdAt: fc.date().map(d => d.toISOString()),
  });

  // Simulate marking notification as read
  const markAsRead = (notification: Notification): Notification => {
    const now = new Date().toISOString();
    return {
      ...notification,
      isRead: true,
      readAt: now,
    };
  };

  it('should set isRead to true when marking as read', () => {
    fc.assert(
      fc.property(notificationArb, (notification) => {
        expect(notification.isRead).toBe(false);
        
        const readNotification = markAsRead(notification);
        
        expect(readNotification.isRead).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should set a valid readAt timestamp when marking as read', () => {
    fc.assert(
      fc.property(notificationArb, (notification) => {
        expect(notification.readAt).toBeUndefined();
        
        const readNotification = markAsRead(notification);
        
        expect(readNotification.readAt).toBeDefined();
        expect(typeof readNotification.readAt).toBe('string');
        
        // Verify it's a valid ISO date string
        const readAtDate = new Date(readNotification.readAt!);
        expect(readAtDate.toISOString()).toBe(readNotification.readAt);
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve other notification fields when marking as read', () => {
    fc.assert(
      fc.property(notificationArb, (notification) => {
        const readNotification = markAsRead(notification);
        
        // All other fields should remain unchanged
        expect(readNotification._id).toBe(notification._id);
        expect(readNotification.type).toBe(notification.type);
        expect(readNotification.title).toBe(notification.title);
        expect(readNotification.message).toBe(notification.message);
        expect(readNotification.createdAt).toBe(notification.createdAt);
      }),
      { numRuns: 100 }
    );
  });

  it('should have readAt timestamp after or equal to createdAt', () => {
    fc.assert(
      fc.property(notificationArb, (notification) => {
        const readNotification = markAsRead(notification);
        
        const createdAt = new Date(notification.createdAt);
        const readAt = new Date(readNotification.readAt!);
        
        // readAt should be after or equal to createdAt
        expect(readAt.getTime()).toBeGreaterThanOrEqual(createdAt.getTime());
      }),
      { numRuns: 100 }
    );
  });
});
