// Main JavaScript for shared functionality across all pages

// Initialize data if not exists
function initializeData() {
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify([]));
    }
    if (!localStorage.getItem('categories')) {
        localStorage.setItem('categories', JSON.stringify([
            { id: 1, name: 'Electronics', productCount: 0 },
            { id: 2, name: 'Clothing', productCount: 0 },
            { id: 3, name: 'Home & Garden', productCount: 0 }
        ]));
    }
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
    if (!localStorage.getItem('customers')) {
        localStorage.setItem('customers', JSON.stringify([]));
    }
    if (!localStorage.getItem('banners')) {
        localStorage.setItem('banners', JSON.stringify([]));
    }
    if (!localStorage.getItem('messages')) {
        localStorage.setItem('messages', JSON.stringify([]));
    }
    if (!localStorage.getItem('adminLoggedIn')) {
        localStorage.setItem('adminLoggedIn', 'false');
    }
}

// Check authentication
function checkAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const currentPage = window.location.pathname;
    
    if (!isLoggedIn && !currentPage.includes('login.html')) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (isLoggedIn && currentPage.includes('login.html')) {
        window.location.href = 'index.html';
        return false;
    }
    
    return isLoggedIn;
}

document.addEventListener('DOMContentLoaded', () => {
    // Sidebar toggle
    const sidebar = document.querySelector('#sidebar');
    const sidebarToggle = document.querySelector('#sidebar-toggle');

    if (sidebar && sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }

    // Logout functionality
    const logoutBtn = document.querySelector('#logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Clear any session-related data (e.g., localStorage for auth)
            localStorage.removeItem('authToken'); // Example: Remove auth token if used
            window.location.href = '/login.html';
        });
    }
});

// Logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('adminLoggedIn', 'false');
            window.location.href = 'login.html';
        });
    }
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    checkAuth();
    setupSidebar();
    setupLogout();
});

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    if (sidebar && sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    } else {
        console.error('Sidebar or toggle button not found');
    }
});

// Listen for category updates from any page
window.addEventListener('categoriesUpdated', () => {
    console.log('Categories updated – refreshing dropdowns...');
    // You can call a function in add-product.js or edit-product.js here
});

document.addEventListener('DOMContentLoaded', () => {
    const profile = JSON.parse(localStorage.getItem('adminProfile')) || {
        name: "Admin User", email: "admin@kunash.com", role: "System Administrator", photo: ""
    };

    const avatarImg = document.querySelector('#header-avatar img');
    const avatarLetter = document.querySelector('#header-avatar span');
    const welcomeText = document.querySelector('header .text-gray-700');

    if (profile.photo) {
        avatarImg.src = profile.photo;
        avatarImg.classList.remove('hidden');
        avatarLetter.classList.add('hidden');
    } else {
        avatarLetter.textContent = profile.name.charAt(0).toUpperCase();
    }

    if (welcomeText) {
        welcomeText.textContent = `Welcome, ${profile.name}`;
    }
});