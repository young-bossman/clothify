/**
 * dashboard/api.js
 * ─────────────────────────────────────────────
 * All network requests for the Dashboard feature.
 * Session-cookie + CSRF authenticated (see shared/auth.js).
 */

import { fetchJson } from '../shared/api.js';

export const fetchUser = async ({ baseUrl, headers }) => {
    return fetchJson(`${baseUrl}/api/v1/me`, { headers, credentials: 'include' });
};

export const fetchStats = async ({ baseUrl, headers }) => {
    return fetchJson(`${baseUrl}/api/v1/stats`, { headers, credentials: 'include' });
};

