/**
 * products/api.js
 * ─────────────────────────────────────────────
 * All network requests for the Products feature.
 * Every function receives `{ baseUrl, headers }`.
 * Session-cookie + CSRF authenticated (see shared/auth.js).
 */

import { fetchJson } from '../shared/api.js';
import { getFormHeaders } from '../shared/auth.js';

export const fetchCategories = async ({ baseUrl, headers }) => {
    return fetchJson(`${baseUrl}/api/v1/categories`, { headers, credentials: 'include' });
};

export const fetchProducts = async ({ baseUrl, headers, query }) => {
    return fetchJson(`${baseUrl}/api/v1/products?${query}`, { headers, credentials: 'include' });
};

export const fetchProductById = async ({ baseUrl, headers, id }) => {
    return fetchJson(`${baseUrl}/api/v1/products/${id}`, { headers, credentials: 'include' });
};
export const createProduct = async ({ baseUrl, headers, formData }) => {
    return fetch(`${baseUrl}/api/v1/products`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...headers, ...getFormHeaders() },
        body: formData,
    });
};

export const updateProduct = async ({ baseUrl, headers, id, formData }) => {
    return fetch(`${baseUrl}/api/v1/products/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...headers, ...getFormHeaders() },
        body: formData,
    });
};

export const deleteProduct = async ({ baseUrl, headers, id }) => {
    const res = await fetch(`${baseUrl}/api/v1/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...headers, ...getFormHeaders() },
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res;
};

export const logoutRequest = async ({ baseUrl, headers }) => {
    return fetch(`${baseUrl}/api/v1/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...headers, ...getFormHeaders() },
    });
};


// Additional API functions for variants, stock movements, etc. can be added here as needed.
export const fetchVariants = async ({ baseUrl, headers, productId }) => {
    const res = await fetch(`${baseUrl}/api/v1/products/${productId}/variants`, { headers, credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load variants');
    return res.json();
};

export const createVariant = async ({ baseUrl, headers, productId, data }) => {
    const res = await fetch(`${baseUrl}/api/v1/products/${productId}/variants`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...headers, 'Content-Type': 'application/json', ...getFormHeaders() },
        body: JSON.stringify(data),
    });
    return res;
};

export const updateVariant = async ({ baseUrl, headers, productId, variantId, data }) => {
    const res = await fetch(`${baseUrl}/api/v1/products/${productId}/variants/${variantId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { ...headers, 'Content-Type': 'application/json', ...getFormHeaders() },
        body: JSON.stringify(data),
    });
    return res;
};

export const deleteVariant = async ({ baseUrl, headers, productId, variantId }) => {
    const res = await fetch(`${baseUrl}/api/v1/products/${productId}/variants/${variantId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...headers, ...getFormHeaders() },
    });
    if (!res.ok) throw new Error('Failed to delete variant');
    return res;
};