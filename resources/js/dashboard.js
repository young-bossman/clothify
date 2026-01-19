document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const userNameEl = document.getElementById('userName');

    if (!logoutBtn || !userNameEl) return;

    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/login';
        return;
    }

    const baseUrl = window.location.origin;

    // Fetch user
    fetch(`${baseUrl}/api/v1/me`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => {
        if (res.status === 401) throw new Error('Unauthorized');
        return res.json();
    })
    .then(user => {
        userNameEl.innerText = user.name;
    })
    .catch(() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    });

    // Logout
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch(`${baseUrl}/api/v1/logout`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } finally {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    });
});
