/**
 * products/api.js
 * ─────────────────────────────────────────────
 * All network requests for the Products feature.
 * Every function receives `{ baseUrl, headers }`
 * so auth state never has to live here.
 */

import { fetchJson } from '../shared/api.js';

export const fetchCategories = async ({ baseUrl, headers }) => {
    return fetchJson(`${baseUrl}/api/v1/categories`, { headers });
};

export const fetchProducts = async ({ baseUrl, headers, query }) => {
    return fetchJson(`${baseUrl}/api/v1/products?${query}`, { headers });
};

export const fetchProductById = async ({ baseUrl, headers, id }) => {
    return fetchJson(`${baseUrl}/api/v1/products/${id}`, { headers });
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


// Additional API functions for variants, stock movements, etc. can be added here as needed.
export const fetchVariants = async ({ baseUrl, headers, productId }) => {
    const res = await fetch(`${baseUrl}/api/v1/products/${productId}/variants`, { headers });
    if (!res.ok) throw new Error('Failed to load variants');
    return res.json();
};

export const createVariant = async ({ baseUrl, headers, productId, data }) => {
    const res = await fetch(`${baseUrl}/api/v1/products/${productId}/variants`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res;
};

export const updateVariant = async ({ baseUrl, headers, productId, variantId, data }) => {
    const res = await fetch(`${baseUrl}/api/v1/products/${productId}/variants/${variantId}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res;
};

export const deleteVariant = async ({ baseUrl, headers, productId, variantId }) => {
    const res = await fetch(`${baseUrl}/api/v1/products/${productId}/variants/${variantId}`, {
        method: 'DELETE',
        headers,
    });
    if (!res.ok) throw new Error('Failed to delete variant');
    return res;
};