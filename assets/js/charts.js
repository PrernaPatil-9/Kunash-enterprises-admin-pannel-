// // Charts functionality for dashboard

// function initCharts() {
//     if (!document.getElementById('salesChart')) return;
    
//     const orders = JSON.parse(localStorage.getItem('orders') || '[]');
//     const products = JSON.parse(localStorage.getItem('products') || '[]');
//     const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    
//     const salesData = calculateSalesData(orders);
//     const categoryData = calculateCategoryData(products, categories);
//     const orderStatusData = calculateOrderStatusData(orders);
//     const revenueData = calculateRevenueData(orders);
    
//     renderSalesChart(salesData);
//     renderCategoryChart(categoryData);
//     renderOrderStatusChart(orderStatusData);
//     renderRevenueChart(revenueData);
// }

// function calculateSalesData(orders) {
//     // Get last 7 days
//     const days = [];
//     for (let i = 6; i >= 0; i--) {
//         const date = new Date();
//         date.setDate(date.getDate() - i);
//         days.push(date.toISOString().split('T')[0]);
//     }
    
//     // Calculate sales per day
//     const salesByDay = days.map(day => {
//         const dayOrders = orders.filter(order => order.date && order.date.startsWith(day));
//         return dayOrders.reduce((total, order) => {
//             return total + order.items.reduce((orderTotal, item) => 
//                 orderTotal + (item.price * item.quantity), 0
//             );
//         }, 0);
//     });
    
//     return {
//         labels: days.map(day => new Date(day).toLocaleDateString('en-US', { weekday: 'short' })),
//         data: salesByDay
//     };
// }

// function calculateCategoryData(products, categories) {
//     const categoryCount = {};
    
//     // Initialize all categories with 0
//     categories.forEach(category => {
//         categoryCount[category.name] = 0;
//     });
    
//     // Count products in each category
//     products.forEach(product => {
//         if (categoryCount[product.category] !== undefined) {
//             categoryCount[product.category]++;
//         } else {
//             categoryCount[product.category] = 1;
//         }
//     });
    
//     return {
//         labels: Object.keys(categoryCount),
//         data: Object.values(categoryCount)
//     };
// }

// function calculateOrderStatusData(orders) {
//     const statusCount = {
//         'Pending': 0,
//         'Processing': 0,
//         'Shipped': 0,
//         'Delivered': 0,
//         'Cancelled': 0
//     };
    
//     // Count orders by status
//     orders.forEach(order => {
//         if (statusCount[order.status] !== undefined) {
//             statusCount[order.status]++;
//         } else {
//             statusCount[order.status] = 1;
//         }
//     });
    
//     return {
//         labels: Object.keys(statusCount),
//         data: Object.values(statusCount)
//     };
// }

// function calculateRevenueData(orders) {
//     // Get last 6 months
//     const months = [];
//     for (let i = 5; i >= 0; i--) {
//         const date = new Date();
//         date.setMonth(date.getMonth() - i);
//         months.push(date.toISOString().substring(0, 7)); // YYYY-MM format
//     }
    
//     // Calculate revenue per month
//     const revenueByMonth = months.map(month => {
//         const monthOrders = orders.filter(order => order.date && order.date.startsWith(month));
//         return monthOrders.reduce((total, order) => {
//             return total + order.items.reduce((orderTotal, item) => 
//                 orderTotal + (item.price * item.quantity), 0
//             );
//         }, 0);
//     });
    
//     return {
//         labels: months.map(month => {
//             const date = new Date(month + '-01');
//             return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
//         }),
//         data: revenueByMonth
//     };
// }

// function renderSalesChart(salesData) {
//     const ctx = document.getElementById('salesChart').getContext('2d');
    
//     new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: salesData.labels,
//             datasets: [{
//                 label: 'Sales ($)',
//                 data: salesData.data,
//                 borderColor: 'rgb(249, 115, 22)',
//                 backgroundColor: 'rgba(249, 115, 22, 0.1)',
//                 tension: 0.4,
//                 fill: true,
//                 pointBackgroundColor: 'rgb(249, 115, 22)',
//                 pointBorderColor: '#fff',
//                 pointBorderWidth: 2,
//                 pointRadius: 5
//             }]
//         },
//         options: {
//             responsive: true,
//             plugins: {
//                 legend: {
//                     display: false
//                 },
//                 tooltip: {
//                     mode: 'index',
//                     intersect: false
//                 }
//             },
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     grid: {
//                         drawBorder: false
//                     },
//                     ticks: {
//                         callback: function(value) {
//                             return '$' + value;
//                         }
//                     }
//                 },
//                 x: {
//                     grid: {
//                         display: false
//                     }
//                 }
//             }
//         }
//     });
// }

// function renderCategoryChart(categoryData) {
//     const ctx = document.getElementById('categoryChart').getContext('2d');
    
//     // Generate colors for each category
//     const backgroundColors = [
//         'rgba(249, 115, 22, 0.7)',
//         'rgba(59, 130, 246, 0.7)',
//         'rgba(16, 185, 129, 0.7)',
//         'rgba(245, 158, 11, 0.7)',
//         'rgba(139, 92, 246, 0.7)',
//         'rgba(14, 165, 233, 0.7)',
//         'rgba(236, 72, 153, 0.7)'
//     ];
    
//     new Chart(ctx, {
//         type: 'pie',
//         data: {
//             labels: categoryData.labels,
//             datasets: [{
//                 data: categoryData.data,
//                 backgroundColor: backgroundColors,
//                 borderColor: 'white',
//                 borderWidth: 2
//             }]
//         },
//         options: {
//             responsive: true,
//             plugins: {
//                 legend: {
//                     position: 'right',
//                 },
//                 tooltip: {
//                     callbacks: {
//                         label: function(context) {
//                             const label = context.label || '';
//                             const value = context.raw || 0;
//                             const total = context.dataset.data.reduce((a, b) => a + b, 0);
//                             const percentage = Math.round((value / total) * 100);
//                             return `${label}: ${value} (${percentage}%)`;
//                         }
//                     }
//                 }
//             }
//         }
//     });
// }

// function renderOrderStatusChart(orderStatusData) {
//     const ctx = document.getElementById('orderStatusChart').getContext('2d');
    
//     const backgroundColors = [
//         'rgba(245, 158, 11, 0.7)',   // Pending - Amber
//         'rgba(59, 130, 246, 0.7)',   // Processing - Blue
//         'rgba(139, 92, 246, 0.7)',   // Shipped - Purple
//         'rgba(16, 185, 129, 0.7)',   // Delivered - Green
//         'rgba(239, 68, 68, 0.7)'     // Cancelled - Red
//     ];
    
//     new Chart(ctx, {
//         type: 'doughnut',
//         data: {
//             labels: orderStatusData.labels,
//             datasets: [{
//                 data: orderStatusData.data,
//                 backgroundColor: backgroundColors,
//                 borderColor: 'white',
//                 borderWidth: 2
//             }]
//         },
//         options: {
//             responsive: true,
//             plugins: {
//                 legend: {
//                     position: 'right',
//                 },
//                 tooltip: {
//                     callbacks: {
//                         label: function(context) {
//                             const label = context.label || '';
//                             const value = context.raw || 0;
//                             const total = context.dataset.data.reduce((a, b) => a + b, 0);
//                             const percentage = Math.round((value / total) * 100);
//                             return `${label}: ${value} (${percentage}%)`;
//                         }
//                     }
//                 }
//             }
//         }
//     });
// }

// function renderRevenueChart(revenueData) {
//     const ctx = document.getElementById('revenueChart').getContext('2d');
    
//     new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: revenueData.labels,
//             datasets: [{
//                 label: 'Revenue ($)',
//                 data: revenueData.data,
//                 backgroundColor: 'rgba(16, 185, 129, 0.7)',
//                 borderColor: 'rgb(16, 185, 129)',
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             plugins: {
//                 legend: {
//                     display: false
//                 }
//             },
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     grid: {
//                         drawBorder: false
//                     },
//                     ticks: {
//                         callback: function(value) {
//                             return '$' + value;
//                         }
//                     }
//                 },
//                 x: {
//                     grid: {
//                         display: false
//                     }
//                 }
//             }
//         }
//     });
// }

// // Initialize charts when DOM is loaded
// document.addEventListener('DOMContentLoaded', function() {
//     if (window.location.pathname.includes('index.html') || 
//         window.location.pathname === '/' || 
//         window.location.pathname.endsWith('/')) {
//         initCharts();
//     }
// });