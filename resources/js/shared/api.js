/**
 * shared/api.js
 * ─────────────────────────────────────────────
 * Shared fetch helper for JSON-based API calls.
 * Keeps response handling consistent across admin,
 * products, shop, and order pages.
 */

export const fetchJson = async (url, options = {}) => {
    const { headers, ...restOptions } = options;
    const res = await fetch(url, {
        ...restOptions,
        headers: {
            Accept: 'application/json',
            ...headers,
        },
    });

    let data = null;
    try {
        data = await res.json();
    } catch {
        // Ignore JSON parse errors for empty responses
    }

    if (!res.ok) {
        const message = data?.message
            || (data?.errors ? Object.values(data.errors).flat()[0] : null)
            || `HTTP ${res.status}`;
        const error = new Error(message);
        error.status = res.status;
        error.payload = data;
        throw error;
    }

    return data;
};
