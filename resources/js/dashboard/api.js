/**
 * dashboard/api.js
 * ─────────────────────────────────────────────
 * All network requests for the Dashboard feature.
 */

export const fetchUser = async ({ baseUrl, headers }) => {
    const res = await fetch(`${baseUrl}/api/v1/me`, { headers });
    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
};

export const fetchStats = async ({ baseUrl, headers }) => {
    const res = await fetch(`${baseUrl}/api/v1/stats`, { headers });
    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
};

export const logoutRequest = async ({ baseUrl, headers }) => {
    return fetch(`${baseUrl}/api/v1/logout`, {
        method: 'POST',
        headers,
    });
};
