/**
 * dashboard/api.js
 * ─────────────────────────────────────────────
 * All network requests for the Dashboard feature.
 */

import { fetchJson } from '../shared/api.js';

export const fetchUser = async ({ baseUrl, headers }) => {
    return fetchJson(`${baseUrl}/api/v1/me`, { headers });
};

export const fetchStats = async ({ baseUrl, headers }) => {
    return fetchJson(`${baseUrl}/api/v1/stats`, { headers });
};

export const logoutRequest = async ({ baseUrl, headers }) => {
    return fetch(`${baseUrl}/api/v1/logout`, {
        method: 'POST',
        headers,
    });
};

