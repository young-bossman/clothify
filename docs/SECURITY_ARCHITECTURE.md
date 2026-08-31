# Security Architecture Documentation

## CSRF Token Protection & API Authentication

### Issue Fixed
**CSRF Token Mismatch Error**: When placing orders via the shop frontend, the request failed with a CSRF token mismatch error.

### Root Cause
The middleware configuration applied CSRF token validation to **all routes** (`api/*`), but the API uses Bearer token authentication which is stateless and inherently CSRF-safe. CSRF protection is only needed for cookie-based session authentication.

### Solution Implemented

#### 1. Bootstrap Configuration (`bootstrap/app.php`)
```php
$middleware->validateCsrfTokens(except: ['api/*']);
```

**What this does:**
- Exempts all `/api/*` routes from CSRF token validation
- Maintains CSRF protection for web forms that use session cookies
- Allows Bearer token authentication to work without ceremony

**Security Model:**
- `api/*` routes: Bearer token auth (stateless) → No CSRF needed
- `web/*` routes: Session cookies (stateful) → CSRF protection active

#### 2. Centralized Authentication (`resources/js/shared/auth.js`)
Created a unified auth module to eliminate duplication and ensure consistent security practices across all pages.

**Key Features:**
- **Token Management**: Centralized token storage/retrieval
- **CSRF Handling**: For web forms that need it (login/register)
- **Error Handling**: Consistent error extraction and display
- **Session Lifecycle**: Proper token expiration tracking
- **Role-based Logic**: Different expiry times for admin (1 day) vs customer (7 days)

**Token Storage Strategy:**
```javascript
// Priority: admin token > customer token
const token = localStorage.getItem('token') || localStorage.getItem('customer_token');
```

#### 3. Implementation Details

**Bearer Token Requests (API calls):**
```javascript
// No CSRF token needed — Bearer token is CSRF-safe
headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
}
```

**Form Submissions (login/register):**
```javascript
// CSRF token added for web forms via Sanctum
await fetchCsrfCookie(); // Sets XSRF-TOKEN cookie
headers: { 'X-XSRF-TOKEN': getCsrfToken() }
```

---

## Security Best Practices Applied

### 1. Token Isolation
- Admin/staff tokens stored under `token` key
- Customer tokens stored under `customer_token` key
- Prevents role escalation through token confusion

### 2. Token Expiration
- **Admin/Staff**: 1 day (sensitive dashboard access)
- **Customer**: 7 days (standard shop access)
- Expiry time always validated: `Date.now() > parseInt(expiresAt)`
- Matches backend expiration set in `AuthController`

### 3. Stale Data Prevention
```javascript
clearAuthData(); // Always wipe before storing new session
// Prevents stale admin tokens leaking to customer sessions
```

### 4. CSRF Protection Layers
1. **API routes** (Bearer tokens): Stateless → No CSRF needed
2. **Web forms** (Sessions): Stateful → CSRF token required
3. **Sanctum CSRF cookie**: Ensures initial XSRF-TOKEN is set
4. **Header validation**: Laravel validates X-XSRF-TOKEN header on web forms

### 5. Error Handling
- **Security**: Error messages don't leak sensitive info (e.g., "user doesn't exist")
- **UX**: Specific validation errors shown (required fields, format issues)
- **Debugging**: Console logs for development (marked with `[Auth]`)

### 6. Code Architecture
- **DRY Principle**: Auth logic centralized in `shared/auth.js`
- **Single Responsibility**: Each file has one purpose (api.js, handlers.js, auth.js)
- **No Duplication**: Login/register logic only in one place
- **Maintainability**: Changes to auth flow only need one update

---

## Authentication Flow

### Login/Register Flow
```
User submits form
    ↓
Fetch CSRF cookie (/sanctum/csrf-cookie)
    ↓
Extract XSRF-TOKEN from cookie
    ↓
POST to /api/v1/login with bearer auth + XSRF header
    ↓
Backend validates CSRF token + credentials
    ↓
Success: Backend returns { user, token }
    ↓
Frontend stores token + user role
    ↓
Redirect based on role (admin → /dashboard, customer → /shop)
```

### Order Placement Flow
```
Customer adds items to cart
    ↓
Clicks checkout
    ↓
Gets auth token from localStorage
    ↓
If no token → redirect to login modal
    ↓
If token exists → open checkout form
    ↓
User fills delivery info + payment method
    ↓
POST /api/v1/orders with Bearer token
    ↓
NO CSRF token needed (Bearer tokens are stateless)
    ↓
Success: Order created, cart cleared
```

---

## Files Modified

### Backend
- **`bootstrap/app.php`**: Added CSRF exemption for API routes

### Frontend
- **`resources/js/shared/auth.js`** (NEW): Centralized auth module
- **`resources/js/auth.js`**: Refactored to use shared module
- **`resources/js/shop/handlers.js`**: 
  - Uses shared auth module for login/register
  - Updated checkout validation
  - Removed localStorage duplication
- **`resources/js/shop/api.js`**: Removed duplicate login/register functions

---

## Security Validation Checklist

✅ CSRF tokens only enforced on stateful routes (web forms)  
✅ Bearer tokens work without CSRF (stateless API)  
✅ Auth tokens centrally managed (no duplication)  
✅ Token expiration enforced consistently  
✅ Stale session data cleared before storing new auth  
✅ Role-based token storage (admin vs customer)  
✅ Error messages don't leak sensitive info  
✅ CSRF cookie fetched before form submission  
✅ X-XSRF-TOKEN header included in web forms  
✅ Bearer Authorization header used for API calls  

---

## Testing the Fix

### Test 1: Order Placement (Bearer Token)
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Authorization: Bearer {customer_token}" \
  -H "Content-Type: application/json" \
  -d '{...order_payload...}'
# Should succeed without CSRF token
```

### Test 2: Login via Web Form
```bash
# Browser auto-includes cookies from /sanctum/csrf-cookie
# X-XSRF-TOKEN header added from cookie
POST /api/v1/login
# Should succeed with CSRF validation
```

### Test 3: Mobile App (Bearer Token)
```bash
# No cookies set, no CSRF cookie fetch needed
curl -X POST http://api.clothify.local/api/v1/orders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{...order_payload...}'
# Should succeed (API exempt from CSRF)
```

---

## Future Enhancements

1. **Implement refresh tokens**: Current tokens are long-lived, consider short-lived tokens + refresh flow
2. **Add token revocation**: Log out should invalidate server-side token
3. **Implement rate limiting**: Protect auth endpoints from brute force
4. **Add 2FA**: For admin/staff accounts
5. **Use httpOnly cookies**: Better than localStorage for token storage (requires backend changes)
6. **CSP headers**: Prevent XSS attacks that could steal tokens
