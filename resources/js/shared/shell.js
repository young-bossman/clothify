/**
 * shared/shell.js
 * ─────────────────────────────────────────────
 * Sidebar/topbar behaviour shared by every <x-app> page:
 * logout and the profile dropdown. Every lookup is null-guarded —
 * Login and Register load app.js but render none of this markup.
 */
import { logout, getAuthUser } from './auth.js';

/* =========================================================
   SHELL USER NAME
   Display-only, read from the locally stored user — no fetch.
   The dashboard's loadUser() remains the real auth check and
   overwrites these with the server's answer.
========================================================= */
export const renderShellUser = () => {
    const els = document.querySelectorAll('.userName');
    if (!els.length) return;

    const name = getAuthUser()?.name;
    if (!name) return;

    els.forEach((el) => { el.textContent = name; });
};

export const bindLogout = () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnTop = document.getElementById('logoutBtnTop');
    if (!logoutBtn && !logoutBtnTop) return;

    const handleLogout = async () => {
        await logout(window.location.origin);
        window.location.href = '/login';
    };

    logoutBtn?.addEventListener('click', handleLogout);
    logoutBtnTop?.addEventListener('click', handleLogout);
};

export const bindProfileDropdown = () => {
    const profileToggle = document.getElementById('profileToggle');
    const profileDropdown = document.getElementById('profileDropdown');
    if (!profileToggle || !profileDropdown) return;

    profileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        profileDropdown.classList.add('hidden');
    });
};

/* =========================================================
   MOBILE DRAWER
   Sidebar is fixed + translated off-screen below the `lg`
   breakpoint (1024px); a scrim and Escape both close it, and
   crossing the breakpoint while open force-closes it so a
   desktop resize never leaves the drawer/overlay stuck open.
========================================================= */
export const bindDrawer = () => {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sidebar || !toggle || !overlay) return;

    let open = false;

    const setDrawer = (next) => {
        open = next;
        sidebar.classList.toggle('collapsed', !open);
        overlay.classList.toggle('hidden', !open);
        document.body.classList.toggle('overflow-hidden', open);
        toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', () => setDrawer(!open));
    overlay.addEventListener('click', () => setDrawer(false));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && open) setDrawer(false);
    });

    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
        if (e.matches && open) setDrawer(false);
    });
};
