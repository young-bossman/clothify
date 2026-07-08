/**
 * shared/auth.js
 * ─────────────────────────────────────────────
 * Shared authentication utilities used by multiple pages.
 *
 * This file contains reusable auth logic, including:
 * - login / register API calls
 * - token storage and expiry handling
 * - auth guard helpers for admin and customer pages
 * - CSRF cookie support for session-based web forms
 *
 * Use this module from page-specific files like resources/js/auth.js
 * or from entry points such as resources/js/dashboard/main.js.
 *
 * Page-specific files should not duplicate auth state logic.
 */

/* =========================================================
   AUTH STATE MANAGEMENT
========================================================= */

/**
 * Get current authenticated user from localStorage
 * @returns {Object|null} User object with id, email, name, role
 */
export const getAuthUser = () => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
};

/**
 * Get current bearer token (admin/staff or customer)
 * @returns {string|null} Bearer token
 */
export const getAuthToken = () => {
    // Priority: admin token, then customer token
    return localStorage.getItem('token') || localStorage.getItem('customer_token');
};

/**
 * Check if token is expired
 * @returns {boolean} True if expired or missing
 */
export const isTokenExpired = () => {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;
    return Date.now() > parseInt(expiresAt);
};

/**
 * Clear all auth data from localStorage
 * Ensures no stale role/token leakage between sessions
 */
export const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('customer_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('token_expires_at');
};

/**
 * Store auth session after successful login/register
 * @param {Object} authData - { user: {...}, token: '...' }
 */
export const storeAuthSession = (authData) => {
    if (!authData.user || !authData.token) {
        throw new Error('Invalid auth response: missing user or token');
    }

    clearAuthData(); // Wipe stale data first

    const isAdmin = ['admin', 'staff'].includes(authData.user.role);
    const expiresInMs = isAdmin ? (1 * 24 * 60 * 60 * 1000) : (7 * 24 * 60 * 60 * 1000);

    localStorage.setItem('auth_user', JSON.stringify(authData.user));
    localStorage.setItem(isAdmin ? 'token' : 'customer_token', authData.token);
    localStorage.setItem('token_expires_at', Date.now() + expiresInMs);
};

/**
 * Get authorization header for API requests
 * @returns {Object} Headers object with Authorization bearer token
 */
export const getAuthHeaders = () => {
    const token = getAuthToken();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
};

/**
 * Helpers for page-level auth guards.
 * Admin pages should use getAdminToken()/requireAdminAuth().
 * Storefront pages should use getCustomerToken()/requireCustomerAuth().
 */
export const getAdminToken = () => localStorage.getItem('token');
export const getCustomerToken = () => localStorage.getItem('customer_token');

export const isAdminUser = () => {
    const user = getAuthUser();
    return user && ['admin', 'staff'].includes(user.role);
};

export const isCustomerUser = () => {
    const user = getAuthUser();
    return user && user.role === 'customer';
};

export const requireAdminAuth = (redirectTo = null) => {
    const token = getAdminToken();
    const user = getAuthUser();

    if (!user || !token || isTokenExpired() || !['admin', 'staff'].includes(user.role)) {
        clearAuthData();
        const target = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : '';
        window.location.href = `/login${target}`;
    }
};

export const requireCustomerAuth = (redirectTo = null) => {
    const token = getCustomerToken();
    const user = getAuthUser();

    if (!user || !token || isTokenExpired() || user.role !== 'customer') {
        clearAuthData();
        const target = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : '';
        window.location.href = `/login${target}`;
    }
};
/* =========================================================
   CSRF TOKEN HANDLING (for web forms)
========================================================= */

/**
 * Extract CSRF token from document cookie
 * @returns {string|null} XSRF-TOKEN cookie value
 */
export const getCsrfToken = () => {
    const name = 'XSRF-TOKEN';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return decodeURIComponent(parts.pop().split(';').shift());
    }
    return null;
};

/**
 * Fetch CSRF cookie from Sanctum endpoint
 * Required for web forms to set initial XSRF-TOKEN cookie
 */
export const fetchCsrfCookie = async () => {
    try {
        await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
    } catch (err) {
        console.warn('[Auth] CSRF cookie fetch failed:', err);
        // Non-fatal — CSRF is only needed for form submissions, not API Bearer requests
    }
};

/**
 * Get headers for web form submissions (with CSRF token)
 * @returns {Object} Headers object with CSRF token if available
 */
export const getFormHeaders = () => {
    const token = getCsrfToken();
    return token ? { 'X-XSRF-TOKEN': token } : {};
};

/* =========================================================
   API REQUESTS
========================================================= */

/**
 * API request helper with error handling
 * @param {string} url - API endpoint
 * @param {Object} options - fetch options
 * @returns {Promise<Object>} Response JSON
 * @throws {Error} With message from server or network error
 */
const apiRequest = async (url, options = {}) => {
    const res = await fetch(url, {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    const data = await res.json();

    if (!res.ok) {
        // Extract server error message
        if (data.errors) {
            const errorMsgs = Object.values(data.errors).flat();
            throw new Error(errorMsgs[0] || 'Request failed');
        }
        throw new Error(data.message || `HTTP ${res.status}`);
    }

    return data;
};

/**
 * Login with email and password
 * @param {string} baseUrl - API base URL
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} { user, token }
 */
export const login = async (baseUrl, email, password) => {
    await fetchCsrfCookie();

    const data = await apiRequest(`${baseUrl}/api/v1/login`, {
        method: 'POST',
        headers: getFormHeaders(),
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });

    if (!data.user || !data.token) {
        throw new Error('Invalid login response from server');
    }

    storeAuthSession(data);
    return data;
};

/**
 * Register new customer account
 * @param {string} baseUrl - API base URL
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} { user, token }
 */
export const register = async (baseUrl, name, email, password) => {
    await fetchCsrfCookie();

    const data = await apiRequest(`${baseUrl}/api/v1/register`, {
        method: 'POST',
        headers: getFormHeaders(),
        credentials: 'include',
        body: JSON.stringify({ name, email, password, password_confirmation: password }),
    });

    if (!data.user || !data.token) {
        throw new Error('Invalid register response from server');
    }

    storeAuthSession(data);
    return data;
};

/**
 * Logout current user
 * Clears all auth data and makes logout API call
 * @param {string} baseUrl - API base URL
 */
export const logout = async (baseUrl) => {
    try {
        // Make logout request but don't fail if it errors
        const token = getAuthToken();
        if (token) {
            await apiRequest(`${baseUrl}/api/v1/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
        }
    } catch (err) {
        console.warn('[Auth] Logout API call failed:', err);
    } finally {
        clearAuthData();
    }
};

/* =========================================================
   REDIRECT HELPERS
========================================================= */

/**
 * Redirect based on authenticated user role
 * • Admin/Staff → /dashboard
 * • Customer → /shop
 */
export const redirectAfterAuth = () => {
    const user = getAuthUser();
    if (!user) {
        window.location.href = '/login';
        return;
    }

    const isDashboard = ['admin', 'staff'].includes(user.role);
    window.location.href = isDashboard ? '/dashboard' : '/shop';
};

/**
 * Ensure user is logged in, redirect to login if not
 * @param {string} redirectTo - URL to redirect to after login (optional)
 */
export const requireAuth = (redirectTo = null) => {
    const user = getAuthUser();
    const token = getAuthToken();

    if (!user || !token || isTokenExpired()) {
        clearAuthData();
        const target = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : '';
        window.location.href = `/login${target}`;
    }
};

/* =========================================================
   FORM ERROR HANDLING
========================================================= */

/**
 * Display form validation errors
 * @param {HTMLElement} formEl - Form element
 * @param {string|string[]} message - Error message(s)
 */
export const showFormError = (formEl, message) => {
    let errorBox = formEl.querySelector('.form-error-box');
    if (!errorBox) {
        errorBox = document.createElement('div');
        errorBox.className = 'form-error-box text-red-400 text-sm mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg';
        formEl.prepend(errorBox);
    }
    errorBox.innerHTML = '';
    const messages = Array.isArray(message) ? message : [message];
    messages.forEach(msg => {
        const line = document.createElement('div');
        line.textContent = `• ${msg}`;
        errorBox.appendChild(line);
    });
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/**
 * Clear form error display
 * @param {HTMLElement} formEl - Form element
 */
export const clearFormError = (formEl) => {
    formEl.querySelector('.form-error-box')?.remove();
};

/**
 * Set form button loading state
 * @param {HTMLElement} btn - Button element
 * @param {boolean} isLoading
 * @param {string} loadingText - Text to show while loading
 */
export const setButtonLoading = (btn, isLoading, loadingText = 'Please wait...') => {
    btn.disabled = isLoading;
    btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
    btn.textContent = isLoading ? loadingText : btn.dataset.originalText;
};
