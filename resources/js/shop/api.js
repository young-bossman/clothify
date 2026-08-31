/**
 * shop/api.js
 * ─────────────────────────────────────────────
 * Product and order API requests for the Shop page.
 * Authentication is handled by the shared auth module.
 * Public product endpoints use no auth header.
 * Order placement uses Bearer token from shared auth.
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

export const placeOrderRequest = async (baseUrl, bearerToken, payload) => {
    const res = await fetch(`${baseUrl}/api/v1/orders`, {
        method:  'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept:         'application/json',
            Authorization:  `Bearer ${bearerToken}`,
        },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(Object.values(data.errors ?? {})[0]?.[0] || data.error || data.message || 'Order failed');
    return data;
};
