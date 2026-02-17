
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm')
    const registerForm = document.getElementById('registerForm')

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault()

            console.log('Login submit fired')

            const formData = new FormData(loginForm)

            const res = await fetch('/api/v1/login', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            })

            const data = await res.json()
            console.log('Login response:', data)

            if (res.ok) {
                localStorage.setItem('token', data.token)
                window.location.href = '/dashboard'
            } else {
                alert(data.message || 'Login failed')
            }
        })
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault()

            const formData = new FormData(registerForm)

            const res = await fetch('/api/v1/register', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            })

            const data = await res.json()

            if (res.ok) {
                localStorage.setItem('token', data.token)
                window.location.href = '/dashboard'
            } else {
                alert(data.message || 'Registration failed')
            }
        })
    }
})
