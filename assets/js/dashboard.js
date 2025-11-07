// ===============================================
// Dashboard Logic – CHART GUARANTEED TO SHOW
// File: assets/js/dashboard.js
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the dashboard page
    const isDashboard = window.location.pathname.includes('index.html') || 
                        window.location.pathname === '/' || 
                        window.location.pathname.endsWith('/');
    
    if (!isDashboard) return;

    // Initialize charts first, then update data
    initializeCharts();
    updateDashboardStats();
});

// ------------------------------------------------------------------
// 1. INITIALIZE CHARTS (container has fixed height → always visible)
// ------------------------------------------------------------------
function initializeCharts() {
    console.log('Initializing charts...');
    
    // === PRODUCTS & CATEGORIES DOUGHNUT ===
    const pcCtx = document.getElementById('productsCategoriesChart');
    if (pcCtx) {
        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(pcCtx);
        if (existingChart) {
            existingChart.destroy();
        }
        
        // Get initial data
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        
        new Chart(pcCtx, {
            type: 'doughnut',
            data: {
                labels: ['Products', 'Categories'],
                datasets: [{
                    data: [products.length || 1, categories.length || 1],
                    backgroundColor: ['#ea580c', '#f97316'],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: { 
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
        console.log('Products & Categories chart initialized');
    } else {
        console.error('Products & Categories chart canvas not found');
    }

    // === SALES LINE CHART ===
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        // Destroy existing chart if it exists
        const existingChart = Chart.getChart(salesCtx);
        if (existingChart) {
            existingChart.destroy();
        }
        
        // Generate sample sales data for the last 7 days
        const salesData = generateSalesData();
        
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: salesData.labels,
                datasets: [{
                    label: 'Sales ($)',
                    data: salesData.values,
                    borderColor: '#ea580c',
                    backgroundColor: 'rgba(234, 88, 12, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ea580c',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#ea580c',
                        borderWidth: 1
                    }
                },
                scales: { 
                    y: { 
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });
        console.log('Sales chart initialized');
    } else {
        console.error('Sales chart canvas not found');
    }
}

// Generate sample sales data for the last 7 days
function generateSalesData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const values = [];
    
    // Start with a base value and add some randomness
    let baseValue = 1200;
    for (let i = 0; i < 7; i++) {
        // Add some variation to make it look realistic
        const variation = Math.floor(Math.random() * 1000) - 500;
        values.push(Math.max(800, baseValue + variation));
        baseValue = values[i]; // Use the last value as base for next
    }
    
    return {
        labels: days,
        values: values
    };
}

// ------------------------------------------------------------------
// 2. UPDATE ALL STATS + CHART DATA
// ------------------------------------------------------------------
function updateDashboardStats() {
    console.log('Updating dashboard stats...');
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const banners = JSON.parse(localStorage.getItem('banners') || '[]');

    const activeProducts = products.filter(p => p.status !== 'inactive').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const activeBanners = banners.filter(b => b.active !== false).length;

    const now = new Date();
    const newCustomers = customers.filter(c => {
        const d = new Date(c.date || c.createdAt || c.created || now);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const responded = messages.filter(m => m.responded).length;
    const responseRate = messages.length > 0 ? Math.round((responded / messages.length) * 100) : 0;

    // Update DOM
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('total-categories').textContent = categories.length;
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('total-customers').textContent = customers.length;
    document.getElementById('total-messages').textContent = messages.filter(m => !m.read).length;
    document.getElementById('total-banners').textContent = banners.length;
    document.getElementById('pending-orders').textContent = pendingOrders;
    document.getElementById('active-banners').textContent = activeBanners;
    document.getElementById('new-customers').textContent = newCustomers;
    document.getElementById('response-rate').textContent = responseRate + '%';

    // Progress bars
    document.getElementById('pending-orders-progress').style.width = orders.length ? `${(pendingOrders / orders.length) * 100}%` : '0%';
    document.getElementById('active-banners-progress').style.width = banners.length ? `${(activeBanners / banners.length) * 100}%` : '0%';
    document.getElementById('new-customers-progress').style.width = customers.length ? `${(newCustomers / customers.length) * 100}%` : '0%';
    document.getElementById('response-rate-progress').style.width = `${responseRate}%`;

    // UPDATE DOUGHNUT CHART DATA
    const doughnutChart = Chart.getChart('productsCategoriesChart');
    if (doughnutChart) {
        const p = products.length || 1;
        const c = categories.length || 1;
        doughnutChart.data.datasets[0].data = [p, c];
        doughnutChart.update();
        console.log('Doughnut chart updated with data:', [p, c]);
    }

    // Update other dashboard elements if they exist
    updateRecentActivities(orders, messages);
    updateTopProducts(products, orders);
}

// ------------------------------------------------------------------
// 3. RECENT ACTIVITIES & TOP PRODUCTS
// ------------------------------------------------------------------
function updateRecentActivities(orders, messages) {
    const container = document.getElementById('recent-activities');
    if (!container) return;
    
    const acts = [];
    
    // Add recent orders
    orders.slice(-5).forEach(o => {
        acts.push({ 
            type: 'order', 
            text: `New order #${o.id} from ${o.customerName || 'Guest'}`, 
            time: o.date || o.createdAt, 
            icon: '📦' 
        });
    });
    
    // Add recent messages
    messages.slice(-5).forEach(m => {
        acts.push({ 
            type: 'message', 
            text: `New message from ${m.name}`, 
            time: m.date || m.createdAt, 
            icon: '✉️' 
        });
    });
    
    // Sort by time and limit to 5
    acts.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
    
    container.innerHTML = '';
    acts.forEach(a => {
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

function updateTopProducts(products, orders) {
    const container = document.getElementById('top-products');
    if (!container) return;
    
    const sales = {};
    orders.forEach(o => { 
        if (o.items) {
            o.items.forEach(i => {
                sales[i.productId] = (sales[i.productId] || 0) + (i.quantity || 1);
            });
        }
    });
    
    const list = products.map(p => ({ ...p, sales: sales[p.id] || 0 }))
                        .sort((a, b) => b.sales - a.sales)
                        .slice(0, 5);
    
    container.innerHTML = '';
    list.forEach(p => {
        const el = document.createElement('div');
        el.className = 'flex items-center border-b border-gray-200 py-3 last:border-0';
        el.innerHTML = `
            <div class="w-10 h-10 bg-orange-100 rounded-md flex items-center justify-center mr-3">
                <span class="text-orange-500 font-semibold">${p.name ? p.name.charAt(0).toUpperCase() : 'P'}</span>
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium">${p.name || 'Unknown Product'}</p>
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

function formatDate(str) {
    if (!str) return 'Recently';
    
    const d = new Date(str);
    if (isNaN(d.getTime())) return 'Recently';
    
    const diff = Math.abs(Date.now() - d);
    const days = Math.ceil(diff / 86400000);
    
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    
    return d.toLocaleDateString();
}

// Export functions for potential use elsewhere
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeCharts,
        updateDashboardStats,
        updateRecentActivities,
        updateTopProducts,
        formatDate
    };
}