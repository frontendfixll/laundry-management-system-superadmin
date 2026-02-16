# Frontend-Superadmin: Roles, Notifications, and Financial Dashboard Analysis

This document summarizes issues with **roles**, **sales dashboard notifications**, and **financial dashboard** in the frontend-superadmin app.

---

## 1. Role layout and notification wiring

| Route group | Layout file | useNotificationsWebSocket() | NotificationBell | NotificationContainer | Status |
|-------------|-------------|----------------------------|------------------|------------------------|--------|
| **(dashboard)** | `(dashboard)/layout.tsx` | Yes | via SuperAdminHeader | Yes | OK |
| **(support)** | `(support)/layout.tsx` | Yes | Yes | Yes | OK |
| **(auditor)** | `(auditor)/layout.tsx` | Yes | Yes | Yes | OK |
| **(finance)** | `(finance)/layout.tsx` | Yes | Yes | Yes | OK |
| **(sales)** | `(sales)/layout.tsx` | **No** | Yes | Yes | **Broken** |

- **Sales** is the only role layout that does **not** call `useNotificationsWebSocket()`. The Sales layout renders `NotificationContainer` and `NotificationBell`, but never starts the WebSocket connection that delivers live notifications. So on the sales dashboard, the bell and dropdown stay empty and do not update in real time.

---

## 2. Sales dashboard – why notifications don’t work

### 2.1 WebSocket not started in Sales layout

- **File:** `src/app/(sales)/layout.tsx`
- **Issue:** The layout does not call `useNotificationsWebSocket()`, unlike support, auditor, and finance layouts.
- **Effect:** No Socket.IO connection is created when a user is in the sales area, so no real-time notifications are received.

**Fix:** In `(sales)/layout.tsx`, add:

```ts
import { useNotificationsWebSocket } from '@/hooks/useNotificationsWebSocket'
// ...
// Inside the component, before return:
useNotificationsWebSocket()
```

### 2.2 Token source mismatch in notification hooks

- **Files:**  
  - `src/hooks/useNotificationsWebSocket.ts` (lines ~50–63): reads `localStorage.getItem('superadmin-auth')` then `localStorage.getItem('token')`.  
  - `src/hooks/useNotifications.ts` (lines 75, 96): reads `localStorage.getItem('token')` only.
- **Issue:** The app persists auth in **`auth-storage`** (Zustand persist in `authStore.ts`). No code sets `superadmin-auth` or a standalone `token` key. So when only `auth-storage` is set (e.g. after unified/sales login), both hooks fail to get a token and neither the REST fetch nor the WebSocket can authenticate.
- **Effect:** Notifications can fail for **all** roles (including superadmin) if they log in via the unified flow that only writes `auth-storage`.

**Fix:** In both hooks, add a fallback to read token from `auth-storage` (same pattern as `superAdminApi.ts` and other app code), e.g.:

```ts
// Example: after existing checks
const authData = localStorage.getItem('auth-storage');
if (authData) {
  try {
    const parsed = JSON.parse(authData);
    const token = parsed?.state?.token ?? parsed?.token;
    if (token) return token;
  } catch (_) {}
}
```

---

## 3. Financial dashboard

- **Relevant pages:**  
  - `(finance)/finance-dashboard/page.tsx`  
  - `(finance)/financial/overview/page.tsx` (if present)  
- **Data loading:** Finance dashboard uses `superAdminApi.getFinancialOverview(timeframe)`, which calls `${API_BASE_URL}/superadmin/financial/overview?timeframe=...` with auth headers. So it uses the **backend** URL, not a relative `/api/` path.
- **Conclusion:** No “wrong host” issue here. The financial dashboard in frontend-superadmin should work as long as `NEXT_PUBLIC_API_URL` points to the backend and the user has a valid token (and backend permissions).

**Note:** The issue described in the main `report.md` (relative `/api/superadmin/financial/overview` hitting Next.js) applies to the **tenant frontend** app (`frontend/src/components/dashboards/PlatformFinanceDashboard.tsx`), not to frontend-superadmin.

---

## 4. Auditor (and other) pages using relative `/api/` URLs

- **Location:** Under `(auditor)/audit/...` (e.g. `audit/export/pdf/page.tsx`, `audit/financial/ledger/page.tsx`, `audit/logs/system/page.tsx`, etc.).
- **Issue:** Many of these pages call `fetch('/api/superadmin/audit/...')` or `fetch('/api/support/audit/...')` with no base URL. The request goes to the **Next.js** origin, which does not implement these routes, so they return 404.
- **Fix:** Use the backend base URL (e.g. `NEXT_PUBLIC_API_URL` or the same pattern as `superAdminApi`) for all these `fetch` calls so they hit the Express backend.

---

## 5. Role redirects from main dashboard

- **File:** `src/app/(dashboard)/layout.tsx`
- **Behaviour:** Only **sales** is redirected: when `userType === 'sales'`, the user is sent to `/sales-dashboard`. There is **no** redirect for `auditor` or `finance` to `/audit-dashboard` or `/finance-dashboard`.
- **Effect:** Auditor and finance users land on the main SuperAdmin dashboard and must use the sidebar (“Auditor Portal”, “Finance Portal”) to reach their sections. This may be intentional; if the product requirement is to auto-redirect auditor/finance to their portals, add similar redirects for those `userType` values.

---

## 6. Summary of recommended fixes

| # | Item | Action |
|---|------|--------|
| 1 | Sales notifications | Call `useNotificationsWebSocket()` in `(sales)/layout.tsx`. |
| 2 | Token for notifications | In `useNotificationsWebSocket.ts` and `useNotifications.ts`, add fallback to read token from `auth-storage` (as above). |
| 3 | Auditor (and similar) API calls | Replace relative `fetch('/api/...')` with backend base URL (e.g. from env or shared API helper). |
| 4 | Auditor/finance redirects | Optional: in `(dashboard)/layout.tsx`, redirect `userType === 'auditor'` to `/audit-dashboard` and `userType === 'finance'` to `/finance-dashboard` if that is desired. |

---

## 7. Files to change (quick reference)

- **Sales notifications:** `src/app/(sales)/layout.tsx` – add `useNotificationsWebSocket()`.
- **Token fallback:** `src/hooks/useNotificationsWebSocket.ts` and `src/hooks/useNotifications.ts` – read token from `auth-storage` when `superadmin-auth` / `token` are missing.
- **Auditor API base URL:** All `(auditor)/audit/**` pages that use `fetch('/api/...')` – switch to backend base URL (e.g. from `process.env.NEXT_PUBLIC_API_URL` or a shared API module).
- **Optional redirects:** `src/app/(dashboard)/layout.tsx` – add auditor/finance redirects if required by product.
