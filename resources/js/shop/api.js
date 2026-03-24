/**
 * shop/api.js
 * ─────────────────────────────────────────────
 * All network requests for the Shop page.
 * Public endpoints use no auth header.
 * Checkout uses the customer_token.
 */

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

export const loginRequest = async (baseUrl, { email, password }) => {
    const res = await fetch(`${baseUrl}/api/v1/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
};

export const registerRequest = async (baseUrl, { name, email, password }) => {
    const res = await fetch(`${baseUrl}/api/v1/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify({ name, email, password, password_confirmation: password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(Object.values(data.errors ?? {})[0]?.[0] || data.message || 'Registration failed');
    return data;
};

export const placeOrderRequest = async (baseUrl, customerToken, payload) => {
    const res = await fetch(`${baseUrl}/api/v1/orders`, {
        method:  'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept:         'application/json',
            Authorization:  `Bearer ${customerToken}`,
        },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(Object.values(data.errors ?? {})[0]?.[0] || data.message || 'Order failed');
    return data;
};
