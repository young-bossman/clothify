document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnTop = document.getElementById('logoutBtnTop');
    const userNameEls = document.querySelectorAll('.userName');

    const profileToggle = document.getElementById('profileToggle');
    const profileDropdown = document.getElementById('profileDropdown');

    if (userNameEls.length === 0) return;

    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/login';
        return;
    }

    const baseUrl = window.location.origin;

    // --------------------
    // Fetch logged-in user
    // --------------------
    fetch(`${baseUrl}/api/v1/me`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => {
        if (res.status === 401) throw new Error('Unauthorized');
        return res.json();
    })
    .then(user => {
        userNameEls.forEach(el => {
            el.innerText = user.name;
        });
    })
    .catch(() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    });

    // --------------------
    // Logout handler
    // --------------------
    const handleLogout = async () => {
        try {
            await fetch(`${baseUrl}/api/v1/logout`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
        } finally {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    };

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (logoutBtnTop) logoutBtnTop.addEventListener('click', handleLogout);

    // --------------------
    // Profile dropdown toggle (click-based)
    // --------------------
    if (profileToggle && profileDropdown) {
        profileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            profileDropdown.classList.add('hidden');
        });
    }
});
