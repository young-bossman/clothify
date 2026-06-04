document.addEventListener('DOMContentLoaded', () => {
    const loginForm    = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    /* =========================================================
       HELPERS
    ========================================================= */

    // Shows an inline error message above the form instead of alert()
    const showFormError = (formEl, message) => {
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

    const clearFormError = (formEl) => {
        formEl.querySelector('.form-error-box')?.remove();
    };

    // Extracts all validation errors from a 422 response as a flat array
    const extractErrors = (data) => {
        if (data.errors) {
            return Object.values(data.errors).flat();
        }
        return [data.message || 'Something went wrong. Please try again.'];
    };

    const setLoading = (btn, isLoading, loadingText = 'Please wait...') => {
        btn.disabled     = isLoading;
        btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
        btn.textContent  = isLoading ? loadingText : btn.dataset.originalText;
    };

    /* =========================================================
       LOGIN
    ========================================================= */
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('[Auth] Login form submitted');
            clearFormError(loginForm);

            const submitBtn = loginForm.querySelector('[type="submit"]');
            setLoading(submitBtn, true, 'Signing in...');

            const formData = new FormData(loginForm);

            try {
                console.log('[Auth] Sending login request...');
                // Ensure Sanctum CSRF cookie is set so web middleware accepts session login
                try {
                    await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
                } catch (err) {
                    console.warn('[Auth] CSRF cookie fetch failed', err);
                }

                // Extract XSRF token from cookie and send as header (fetch doesn't auto-send it)
                const getCookie = (name) => document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
                const xsrf = getCookie('XSRF-TOKEN');

                const res  = await fetch('/api/v1/login', {
                    method: 'POST',
                    headers: { 
                        Accept: 'application/json',
                        ...(xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {}),
                    },
                    body: formData,
                    credentials: 'include',
                });

                console.log('[Auth] Response received, status:', res.status);
                const data = await res.json();
                console.log('[Auth] Response data:', data);

                if (!res.ok) {
                    // 429 = rate limited, 401 = wrong credentials, 422 = validation
                    console.log('[Auth] Error response');
                    showFormError(loginForm, extractErrors(data));
                    setLoading(submitBtn, false);
                    return;
                }

                // Guard against unexpected response shape from the server
                if (!data.token || !data.user?.role) {
                    console.log('[Auth] Invalid response shape');
                    showFormError(loginForm, 'Unexpected server response. Please try again.');
                    setLoading(submitBtn, false);
                    return;
                }

                console.log('[Auth] Valid response, storing token and redirecting');
                // Always wipe all keys before writing — no stale role leakage
                localStorage.removeItem('token');
                localStorage.removeItem('customer_token');
                localStorage.removeItem('auth_user');
                localStorage.removeItem('token_expires_at');

                // Persist user so any page can read role without another /me call
                localStorage.setItem('auth_user', JSON.stringify(data.user));

                // Store expiry time — admin/staff 1 day, customers 7 days
                // Mirrors the expiration set in AuthController on the backend
                const isAdmin     = ['admin', 'staff'].includes(data.user.role);
                const expiresInMs = isAdmin ? 1 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
                localStorage.setItem('token_expires_at', Date.now() + expiresInMs);

                // Store token under the right key based on role
                if (isAdmin) {
                    localStorage.setItem('token', data.token);
                    console.log('[Auth] Redirecting to /dashboard');
                    window.location.href = '/dashboard';
                } else {
                    localStorage.setItem('customer_token', data.token);
                    console.log('[Auth] Redirecting to /shop');
                    window.location.href = '/shop';
                } 

            } catch (err) {
                // Network failure — fetch itself threw (no internet, server down, etc.)
                console.error('[Auth] Network error:', err);
                showFormError(loginForm, 'A network error occurred. Please check your connection and try again.');
                setLoading(submitBtn, false);
            }
        });
    }

    /* =========================================================
       REGISTER
    ========================================================= */
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormError(registerForm);

            const submitBtn = registerForm.querySelector('[type="submit"]');
            setLoading(submitBtn, true, 'Creating account...');

            const formData = new FormData(registerForm);

            try {
                // Ensure Sanctum CSRF cookie is set so web middleware accepts session login
                try {
                    await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
                } catch (err) {
                    console.warn('[Auth] CSRF cookie fetch failed', err);
                }

                const getCookie = (name) => document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
                const xsrf = getCookie('XSRF-TOKEN');

                const res  = await fetch('/api/v1/register', {
                    method: 'POST',
                    headers: { 
                        Accept: 'application/json',
                        ...(xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {}),
                    },
                    body: formData,
                    credentials: 'include',
                });

                const data = await res.json();

                if (!res.ok) {
                    // Show all validation errors, not just the first one
                    showFormError(registerForm, extractErrors(data));
                    setLoading(submitBtn, false);
                    return;
                }

                // Guard against unexpected response shape from the server
                if (!data.token || !data.user) {
                    showFormError(registerForm, 'Unexpected server response. Please try again.');
                    setLoading(submitBtn, false);
                    return;
                }

                // Wipe any stale session before writing
                localStorage.removeItem('token');
                localStorage.removeItem('customer_token');
                localStorage.removeItem('auth_user');
                localStorage.removeItem('token_expires_at');

                // Register always creates a customer — 7 day expiry
                localStorage.setItem('auth_user', JSON.stringify(data.user));
                localStorage.setItem('customer_token', data.token);
                localStorage.setItem('token_expires_at', Date.now() + (7 * 24 * 60 * 60 * 1000));
                window.location.href = '/shop';

            } catch (err) {
                // Network failure
                showFormError(registerForm, 'A network error occurred. Please check your connection and try again.');
                setLoading(submitBtn, false);
            }
        });
    }
});