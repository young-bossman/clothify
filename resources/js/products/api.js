/**
 * products/api.js
 * ─────────────────────────────────────────────
 * All network requests for the Products feature.
 * Every function receives `{ baseUrl, headers }`
 * so auth state never has to live here.
 */

export const fetchCategories = async ({ baseUrl, headers }) => {
    const res = await fetch(`${baseUrl}/api/v1/categories`, { headers });
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
};

export const fetchProducts = async ({ baseUrl, headers, query }) => {
    const res = await fetch(`${baseUrl}/api/v1/products?${query}`, { headers });
    if (!res.ok) throw new Error('Failed to load products');
    return res.json();
};

export const fetchProductById = async ({ baseUrl, headers, id }) => {
    const res = await fetch(`${baseUrl}/api/v1/products/${id}`, { headers });
    if (!res.ok) throw new Error('Failed to load product');
    return res.json();
};

export const createProduct = async ({ baseUrl, headers, formData }) => {
    return fetch(`${baseUrl}/api/v1/products`, {
        method: 'POST',
        headers,
        body: formData,
    });
};

export const updateProduct = async ({ baseUrl, headers, id, formData }) => {
    return fetch(`${baseUrl}/api/v1/products/${id}`, {
        method: 'POST',
        headers,
        body: formData,
    });
};

export const deleteProduct = async ({ baseUrl, headers, id }) => {
    const res = await fetch(`${baseUrl}/api/v1/products/${id}`, {
        method: 'DELETE',
        headers,
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res;
};

export const logoutRequest = async ({ baseUrl, headers }) => {
    return fetch(`${baseUrl}/api/v1/logout`, {
        method: 'POST',
        headers,
    });
};
