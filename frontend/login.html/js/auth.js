document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const res = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            setToken(data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            document.getElementById('errorMsg').innerText = data.error || 'Erreur';
        }
    } catch (err) {
        document.getElementById('errorMsg').innerText = 'Erreur de connexion';
    }
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    removeToken();
    window.location.href = 'login.html';
});