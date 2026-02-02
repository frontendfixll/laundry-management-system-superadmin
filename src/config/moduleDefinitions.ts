/**
 * Central Module Definitions
 * Single source of truth for all RBAC module definitions and labels
 */

export interface ModuleDefinition {
    id: string
    label: string
}

/**
 * All possible RBAC modules in the system
 */
export const ALL_MODULE_DEFINITIONS: ModuleDefinition[] = [
    { id: 'platform_settings', label: 'Platform Settings' },
    { id: 'tenant_crud', label: 'Tenant Management' },
    { id: 'subscription_plans', label: 'Subscription Plans' },
    { id: 'payments_revenue', label: 'Payments & Revenue' },
    { id: 'refunds', label: 'Refunds' },
    { id: 'marketplace_control', label: 'Marketplace Control' },
    { id: 'platform_coupons', label: 'Platform Coupons' },
    { id: 'rule_engine_global', label: 'Global Rule Engine' },
    { id: 'view_all_orders', label: 'View All Orders' },
    { id: 'audit_logs', label: 'Audit Logs' },
    { id: 'leads', label: 'Platform Leads' },
    { id: 'user_impersonation', label: 'User Impersonation' }
]

/**
 * Module ID to Label mapping
 */
export const MODULE_LABELS: Record<string, string> = {
    platform_settings: 'Platform Settings',
    tenant_crud: 'Tenant Management',
    subscription_plans: 'Subscription Plans',
    payments_revenue: 'Payments & Revenue',
    refunds: 'Refunds',
    marketplace_control: 'Marketplace Control',
    platform_coupons: 'Platform Coupons',
    rule_engine_global: 'Global Rule Engine',
    view_all_orders: 'View All Orders',
    audit_logs: 'Audit Logs',
    leads: 'Platform Leads',
    user_impersonation: 'User Impersonation'
}

/**
 * Get label for a module ID
 */
export function getModuleLabel(moduleId: string): string {
    return MODULE_LABELS[moduleId] || moduleId
}

/**
 * Get module definition by ID
 */
export function getModuleDefinition(moduleId: string): ModuleDefinition | undefined {
    return ALL_MODULE_DEFINITIONS.find(m => m.id === moduleId)
}
