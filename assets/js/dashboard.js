// ===============================================
// Dashboard Logic - Separated JS File
// File: assets/js/dashboard.js
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // Only run on dashboard
    if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/' && !window.location.pathname.endsWith('/')) {
        return;
    }

    updateDashboardStats();
    setTimeout(initializeCharts, 500);
});

// ===============================================
// Update All Stats
// ===============================================
function updateDashboardStats() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const banners = JSON.parse(localStorage.getItem('banners') || '[]');

    // Active counts
    const activeProducts = products.filter(p => p.status !== 'inactive').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const activeBanners = banners.filter(b => b.active !== false).length;

    // New customers this month
    const now = new Date();
    const newCustomers = customers.filter(c => {
        const date = new Date(c.date || c.createdAt || c.created);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    // Response rate
    const respondedMessages = messages.filter(m => m.responded).length;
    const responseRate = messages.length > 0 ? Math.round((respondedMessages / messages.length) * 100) : 0;

    // Update DOM
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('total-categories').textContent = categories.length;
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('total-customers').textContent = customers.length;
    document.getElementById('total-messages').textContent = messages.filter(m => !m.read).length;
    document.getElementById('total-banners').textContent = banners.length;

    document.getElementById('active-products').textContent = activeProducts;
    document.getElementById('pending-orders').textContent = pendingOrders;
    document.getElementById('active-banners').textContent = activeBanners;
    document.getElementById('new-customers').textContent = newCustomers;
    document.getElementById('response-rate').textContent = responseRate + '%';

    // Progress bars
    document.getElementById('active-products-progress').style.width = products.length > 0 ? `${(activeProducts / products.length) * 100}%` : '0%';
    document.getElementById('pending-orders-progress').style.width = orders.length > 0 ? `${(pendingOrders / orders.length) * 100}%` : '0%';
    document.getElementById('active-banners-progress').style.width = banners.length > 0 ? `${(activeBanners / banners.length) * 100}%` : '0%';
    document.getElementById('new-customers-progress').style.width = customers.length > 0 ? `${(newCustomers / customers.length) * 100}%` : '0%';
    document.getElementById('response-rate-progress').style.width = `${responseRate}%`;

    updateRecentActivities(orders, messages);
    updateTopProducts(products, orders);
}

// ===============================================
// Recent Activities
// ===============================================
function updateRecentActivities(orders, messages) {
    const container = document.getElementById('recent-activities');
    if (!container) return;

    const activities = [];

    orders.slice(-5).forEach(o => activities.push({
        type: 'order',
        text: `New order #${o.id} from ${o.customerName || 'Guest'}`,
        time: o.date || o.createdAt,
        icon: 'Package'
    }));

    messages.slice(-5).forEach(m => activities.push({
        type: 'message',
        text: `New message from ${m.name}`,
        time: m.date || m.createdAt,
        icon: 'Envelope'
    }));

    activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    container.innerHTML = '';
    activities.forEach(a => {
        const el = document.createElement('div');
        el.className = 'flex items-start border-b border-gray-200 py-3 last:border-0';
        el.innerHTML = `
            <div class="mr-3 text-lg">${a.icon}</div>
            <div class="flex-1">
                <p class="text-sm">${a.text}</p>
                <p class="text-xs text-gray-500">${formatDate(a.time)}</p>
            </div>
        `;
        container.appendChild(el);
    });
}

// ===============================================
// Top Products
// ===============================================
function updateTopProducts(products, orders) {
    const container = document.getElementById('top-products');
    if (!container) return;

    const sales = {};
    orders.forEach(o => {
        if (o.items) {
            o.items.forEach(item => {
                sales[item.productId] = (sales[item.productId] || 0) + item.quantity;
            });
        }
    });

    const list = products.map(p => ({
        ...p,
        sales: sales[p.id] || 0
    })).sort((a, b) => b.sales - a.sales).slice(0, 5);

    container.innerHTML = '';
    list.forEach(p => {
        const el = document.createElement('div');
        el.className = 'flex items-center border-b border-gray-200 py-3 last:border-0';
        el.innerHTML = `
            <div class="w-10 h-10 bg-orange-100 rounded-md flex items-center justify-center mr-3">
                <span class="text-orange-500 font-semibold">${p.name.charAt(0).toUpperCase()}</span>
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium">${p.name}</p>
                <p class="text-xs text-gray-500">${p.category || 'Uncategorized'}</p>
            </div>
            <div class="text-right">
                <p class="text-sm font-semibold text-orange-600">${p.sales} sold</p>
                <p class="text-xs text-gray-500">$${p.price || '0.00'}</p>
            </div>
        `;
        container.appendChild(el);
    });
}

// ===============================================
// Format Date
// ===============================================
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.abs(now - date);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
}

// ===============================================
// Initialize Charts
// ===============================================
function initializeCharts() {
    // Sales Line Chart
    new Chart(document.getElementById('salesChart'), {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Sales ($)',
                data: [1200, 1900, 1500, 2200, 1800, 2500, 2100],
                borderColor: '#ea580c',
                backgroundColor: 'rgba(234, 88, 12, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });

    // Category Doughnut
    new Chart(document.getElementById('categoryChart'), {
        type: 'doughnut',
        data: {
            labels: ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Toys'],
            datasets: [{
                data: [30, 25, 20, 15, 10],
                backgroundColor: ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });

    // Order Status Bar
    new Chart(document.getElementById('orderStatusChart'), {
        type: 'bar',
        data: {
            labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            datasets: [{
                label: 'Orders',
                data: [12, 19, 8, 25, 3],
                backgroundColor: '#ea580c',
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });

    // Revenue Bar
    new Chart(document.getElementById('revenueChart'), {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue ($)',
                data: [12000, 19000, 15000, 22000, 18000, 25000],
                backgroundColor: '#ea580c',
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
}