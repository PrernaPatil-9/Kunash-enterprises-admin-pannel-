// Authentication functionality

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simple validation (in a real app, this would be handled by a backend)
            if (username === 'admin' && password === 'password') {
                localStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'index.html';
            } else {
                errorMessage.classList.remove('hidden');
            }
        });
    }
});