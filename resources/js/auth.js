/**
 * auth.js
 * ─────────────────────────────────────────────
 * Page-specific auth entry point for the login/register page.
 *
 * This file wires the DOM forms to shared authentication logic.
 * It does not implement auth rules itself; it reuses the shared
 * auth helper in resources/js/shared/auth.js.
 */
import {
    login,
    register,
    showFormError,
    clearFormError,
    setButtonLoading,
    redirectAfterAuth,
} from './shared/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm    = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const baseUrl = window.location.origin;

    /* =========================================================
       LOGIN
       Page-specific form behavior: collect inputs, submit,
       display errors, and redirect after successful login.
    ========================================================= */
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormError(loginForm);

            const submitBtn = loginForm.querySelector('[type="submit"]');
            setButtonLoading(submitBtn, true, 'Signing in...');

            const email = loginForm.querySelector('input[name="email"]').value.trim();
            const password = loginForm.querySelector('input[name="password"]').value;

            try {
                await login(baseUrl, email, password);
                redirectAfterAuth();
            } catch (err) {
                showFormError(loginForm, err.message);
                setButtonLoading(submitBtn, false);
            }
        });
    }

    /* =========================================================
       REGISTER
       Page-specific form behavior for new account creation.
       Reuses shared register() and common error UI helpers.
    ========================================================= */
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormError(registerForm);

            const submitBtn = registerForm.querySelector('[type="submit"]');
            setButtonLoading(submitBtn, true, 'Creating account...');

            const name = registerForm.querySelector('input[name="name"]').value.trim();
            const email = registerForm.querySelector('input[name="email"]').value.trim();
            const password = registerForm.querySelector('input[name="password"]').value;

            try {
                await register(baseUrl, name, email, password);
                redirectAfterAuth();
            } catch (err) {
                showFormError(registerForm, err.message);
                setButtonLoading(submitBtn, false);
            }
        });
    }
});