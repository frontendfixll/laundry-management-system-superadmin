/**
 * Role-to-Module Mapping Configuration
 * Defines which RBAC modules are relevant for each platform role
 */

export const ROLE_MODULE_MAPPING: Record<string, string[]> = {
    'super-admin': [
        'platform_settings',
        'tenant_crud',
        'tenant_suspend',
        'subscription_plans',
        'payments_revenue',
        'refunds',
        'marketplace_control',
        'platform_coupons',
        'rule_engine_global',
        'view_all_orders',
        'audit_logs',
        'leads',
        'user_impersonation'
    ],
    'platform-sales': [
        'leads',                    // Used: Leads, Team pages
        'subscription_plans',       // Used: Subscriptions, Upgrades pages
        'payments_revenue'          // Used: Payments page
    ],
    'platform-sales-junior': [
        'leads',                    // Basic sales: Only leads
        'subscription_plans'        // Basic sales: Only subscriptions
    ],
    'platform-sales-senior': [
        'leads',                    // Senior sales: All basic permissions
        'subscription_plans',       // Senior sales: Subscriptions
        'payments_revenue',         // Senior sales: Can see payments
        'audit_logs',              // Senior sales: Can see audit logs
        'tenant_crud'              // Senior sales: Can manage tenants
    ],
    'platform-finance-admin': [
        'payments_revenue',
        'refunds',
        'subscription_plans',
        'view_all_orders',
        'audit_logs',
        'leads'
    ],
    'platform-support': [
        'tenant_crud',
        'view_all_orders',
        'audit_logs',
        'leads',
        'user_impersonation',
        'marketplace_control'
    ],
    'platform-auditor': [
        'payments_revenue',
        'view_all_orders',
        'audit_logs',
        'leads'
    ]
};

/**
 * Get relevant modules for a given role slug
 */
export function getModulesForRole(roleSlug: string): string[] {
    return ROLE_MODULE_MAPPING[roleSlug] || ROLE_MODULE_MAPPING['super-admin'];
}

/**
 * Check if a module is relevant for a given role
 */
export function isModuleRelevantForRole(moduleId: string, roleSlug: string): boolean {
    const relevantModules = getModulesForRole(roleSlug);
    return relevantModules.includes(moduleId);
}
