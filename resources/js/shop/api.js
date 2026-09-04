/**
 * shop/api.js
 * ─────────────────────────────────────────────
 * Product and order API requests for the Shop page.
 * Public product endpoints are unauthenticated.
 * Order placement is session-cookie + CSRF authenticated,
 * same as cart.js.
 */

import { getFormHeaders } from '../shared/auth.js';

const JSON_HEADERS = { Accept: 'application/json' };

export const fetchCategories = async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/v1/categories`, { headers: JSON_HEADERS });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
};

export const fetchProducts = async (baseUrl, query) => {
    const res = await fetch(`${baseUrl}/api/v1/products?${query}`, { headers: JSON_HEADERS });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
};

export const fetchProductById = async (baseUrl, id) => {
    const res = await fetch(`${baseUrl}/api/v1/products/${id}`, { headers: JSON_HEADERS });
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
};

export const placeOrderRequest = async (baseUrl, payload) => {
    const res = await fetch(`${baseUrl}/api/v1/orders`, {
        method:      'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Accept:         'application/json',
            ...getFormHeaders(),
        },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(Object.values(data.errors ?? {})[0]?.[0] || data.error || data.message || 'Order failed');
    return data;
};
