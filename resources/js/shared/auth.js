/**
 * shared/auth.js
 * ─────────────────────────────────────────────
 * Shared authentication utilities used by multiple pages.
 *
 * This file contains reusable auth logic, including:
 * - login / register API calls
 * - user-info storage for client-side UI gating/display
 * - auth guard helpers for admin and customer pages
 * - CSRF cookie support (every authenticated request is session+CSRF)
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
 * Clear all auth data from localStorage
 * Ensures no stale role/user-info leakage between sessions
 */
export const clearAuthData = () => {
    localStorage.removeItem('auth_user');
};

/**
 * Store auth session after successful login/register.
 * Auth itself is the session cookie (+ CSRF); this only keeps the
 * user's profile info around for client-side UI gating/display.
 * @param {Object} authData - { user: {...} }
 */
export const storeAuthSession = (authData) => {
    if (!authData.user) {
        throw new Error('Invalid auth response: missing user');
    }

    clearAuthData(); // Wipe stale data first
    localStorage.setItem('auth_user', JSON.stringify(authData.user));
};

/**
 * Helpers for page-level auth guards.
 */
export const isAdminUser = () => {
    const user = getAuthUser();
    return user && ['admin', 'staff'].includes(user.role);
};

export const isCustomerUser = () => {
    const user = getAuthUser();
    return user && user.role === 'customer';
};

/**
 * Client-side pre-checks only, to avoid a flash of the wrong page before
 * a real auth check completes. They are NOT the security boundary — every
 * API call is independently session+CSRF authenticated server-side, and
 * callers (e.g. dashboard's loadUser()) already redirect on a failed
 * request if the session turns out to be invalid.
 */
export const requireAdminAuth = (redirectTo = null) => {
    const user = getAuthUser();

    if (!user || !['admin', 'staff'].includes(user.role)) {
        clearAuthData();
        const target = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : '';
        window.location.href = `/login${target}`;
    }
};

export const requireCustomerAuth = (redirectTo = null) => {
    const user = getAuthUser();

    if (!user || user.role !== 'customer') {
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
    const { headers, ...restOptions } = options;
    const res = await fetch(url, {
        ...restOptions,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...headers,
        },
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
 * @returns {Promise<Object>} { user }
 */
export const login = async (baseUrl, email, password) => {
    await fetchCsrfCookie();

    const data = await apiRequest(`${baseUrl}/api/v1/login`, {
        method: 'POST',
        headers: getFormHeaders(),
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });

    if (!data.user) {
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
 * @returns {Promise<Object>} { user }
 */
export const register = async (baseUrl, name, email, password) => {
    await fetchCsrfCookie();

    const data = await apiRequest(`${baseUrl}/api/v1/register`, {
        method: 'POST',
        headers: getFormHeaders(),
        credentials: 'include',
        body: JSON.stringify({ name, email, password, password_confirmation: password }),
    });

    if (!data.user) {
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
        await apiRequest(`${baseUrl}/api/v1/logout`, {
            method: 'POST',
            headers: getFormHeaders(),
            credentials: 'include',
        });
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

    if (!user) {
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
