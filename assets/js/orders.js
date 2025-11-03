/* -------------------------------------------------------------
   Order Management – All Logic (Fixed & Working)
   ------------------------------------------------------------- */
let orders = JSON.parse(localStorage.getItem('orders') || '[]');
let customers = JSON.parse(localStorage.getItem('customers') || '[]');
let products = JSON.parse(localStorage.getItem('products') || '[]');

/* ---- Sample Data (Only if empty) ---- */
if (orders.length === 0) {
    orders = [
        { id: 'ORD2024001', customerId: 'CUST001', date: '2024-10-15', items: [{ productId: 'PROD001', quantity: 2, price: 499 }, { productId: 'PROD002', quantity: 1, price: 299 }], total: 1297, paymentStatus: 'paid', orderStatus: 'processing', paymentMethod: 'UPI', transactionId: 'TXN001234', deliveryType: 'home', trackingId: 'TRK789012', expectedDelivery: '2024-10-20', adminNotes: 'Customer requested early delivery' },
        { id: 'ORD2024002', customerId: 'CUST002', date: '2024-10-16', items: [{ productId: 'PROD003', quantity: 1, price: 899 }], total: 899, paymentStatus: 'pending', orderStatus: 'new', paymentMethod: 'COD', transactionId: '', deliveryType: 'home', trackingId: '', expectedDelivery: '2024-10-22', adminNotes: '' },
        { id: 'ORD2024003', customerId: 'CUST003', date: '2024-10-10', items: [{ productId: 'PROD001', quantity: 1, price: 499 }, { productId: 'PROD004', quantity: 3, price: 199 }], total: 1096, paymentStatus: 'paid', orderStatus: 'delivered', paymentMethod: 'Card', transactionId: 'TXN567890', deliveryType: 'home', trackingId: 'TRK345678', expectedDelivery: '2024-10-15', actualDelivery: '2024-10-14', adminNotes: 'Delivered early' },
        { id: 'ORD2024004', customerId: 'CUST004', date: '2024-10-05', items: [{ productId: 'PROD005', quantity: 1, price: 1299 }], total: 1299, paymentStatus: 'refunded', orderStatus: 'cancelled', paymentMethod: 'UPI', transactionId: 'TXN987654', deliveryType: 'home', trackingId: '', expectedDelivery: '2024-10-12', adminNotes: 'Cancelled, refund processed' },
        { id: 'ORD2024005', customerId: 'CUST005', date: '2024-10-18', items: [{ productId: 'PROD002', quantity: 2, price: 299 }, { productId: 'PROD006', quantity: 1, price: 599 }], total: 1197, paymentStatus: 'paid', orderStatus: 'shipped', paymentMethod: 'UPI', transactionId: 'TXN246810', deliveryType: 'home', trackingId: 'TRK135790', expectedDelivery: '2024-10-25', adminNotes: '' }
    ];
    localStorage.setItem('orders', JSON.stringify(orders));
}
if (customers.length === 0) {
    customers = [
        { id: 'CUST001', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210', address: '123 Main St', city: 'Mumbai', state: 'MH', pincode: '400001' },
        { id: 'CUST002', name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211', address: '456 Park Ave', city: 'Delhi', state: 'DL', pincode: '110001' },
        { id: 'CUST003', name: 'Amit Kumar', email: 'amit@example.com', phone: '9876543212', address: '789 MG Road', city: 'Bangalore', state: 'KA', pincode: '560001' },
        { id: 'CUST004', name: 'Sneha Singh', email: 'sneha@example.com', phone: '9876543213', address: '321 Church St', city: 'Chennai', state: 'TN', pincode: '600001' },
        { id: 'CUST005', name: 'Vikram Reddy', email: 'vikram@example.com', phone: '9876543214', address: '654 Brigade Rd', city: 'Hyderabad', state: 'TS', pincode: '500001' }
    ];
    localStorage.setItem('customers', JSON.stringify(customers));
}
if (products.length === 0) {
    products = [
        { id: 'PROD001', name: 'Wireless Earbuds', price: 499 },
        { id: 'PROD002', name: 'Phone Case', price: 299 },
        { id: 'PROD003', name: 'Smart Watch', price: 899 },
        { id: 'PROD004', name: 'USB Cable', price: 199 },
        { id: 'PROD005', name: 'Bluetooth Speaker', price: 1299 },
        { id: 'PROD006', name: 'Power Bank', price: 599 }
    ];
    localStorage.setItem('products', JSON.stringify(products));
}

/* ---- DOM Elements ---- */
const ordersTableBody = document.getElementById('orders-table-body');
const modal = document.getElementById('order-details-modal');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const paymentFilter = document.getElementById('payment-filter');
const dateFrom = document.getElementById('date-from');
const dateTo = document.getElementById('date-to');
const applyFiltersBtn = document.getElementById('apply-filters');
const selectAll = document.getElementById('select-all');
const prevPage = document.getElementById('prev-page');
const nextPage = document.getElementById('next-page');
const paginationStart = document.getElementById('pagination-start');
const paginationEnd = document.getElementById('pagination-end');
const paginationTotal = document.getElementById('pagination-total');

/* ---- State ---- */
let currentPage = 1;
const itemsPerPage = 10;
let filteredOrders = [...orders];
let selectedOrders = new Set();

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    applyFilters(); // This was missing — now orders show on load
    setupEvents();
});

/* ---- Core Functions ---- */
function updateStats() {
    const total = orders.length;
    const pending = orders.filter(o => ['new', 'processing'].includes(o.orderStatus)).length;
    const shipped = orders.filter(o => o.orderStatus === 'shipped').length;
    const revenue = orders
        .filter(o => new Date(o.date).getMonth() === new Date().getMonth() && o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.total, 0);

    document.getElementById('total-orders').textContent = total;
    document.getElementById('pending-orders').textContent = pending;
    document.getElementById('shipped-orders').textContent = shipped;
    document.getElementById('monthly-revenue').textContent = `₹${revenue.toLocaleString()}`;
}

function renderTable() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, filteredOrders.length);
    const page = filteredOrders.slice(start, end);

    ordersTableBody.innerHTML = page.length === 0
        ? `<tr><td colspan="9" class="px-6 py-4 text-center text-gray-500">No orders found</td></tr>`
        : '';

    page.forEach(order => {
        const cust = customers.find(c => c.id === order.customerId) || {};
        const row = document.createElement('tr');
        row.className = 'order-row';
        row.innerHTML = `
            <td class="px-6 py-4"><input type="checkbox" class="order-checkbox rounded text-orange-500" data-order-id="${order.id}"></td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">${order.id}</td>
            <td class="px-6 py-4"><div class="text-sm font-medium text-gray-900">${cust.name || 'N/A'}</div><div class="text-xs text-gray-500">${cust.email || ''}</div></td>
            <td class="px-6 py-4 text-sm text-gray-900">${formatDate(order.date)}</td>
            <td class="px-6 py-4 text-sm text-gray-900">${order.items.length} item(s)</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">₹${order.total}</td>
            <td class="px-6 py-4"><span class="status-badge payment-status-${order.paymentStatus}">${formatStatus(order.paymentStatus)}</span></td>
            <td class="px-6 py-4"><span class="status-badge status-${order.orderStatus}">${formatStatus(order.orderStatus)}</span></td>
            <td class="px-6 py-4 text-sm">
                <button class="text-orange-600 hover:text-orange-900 mr-2 view-order" data-order-id="${order.id}"><i class="fas fa-eye"></i></button>
                <button class="text-red-600 hover:text-red-900 delete-order" data-order-id="${order.id}"><i class="fas fa-trash"></i></button>
            </td>`;
        ordersTableBody.appendChild(row);
    });

    paginationStart.textContent = filteredOrders.length ? start + 1 : 0;
    paginationEnd.textContent = end;
    paginationTotal.textContent = filteredOrders.length;
    prevPage.disabled = currentPage === 1;
    nextPage.disabled = end >= filteredOrders.length;
}

function applyFilters() {
    const term = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    const pay = paymentFilter.value;
    const from = dateFrom.value;
    const to = dateTo.value;

    filteredOrders = orders.filter(o => {
        const cust = customers.find(c => c.id === o.customerId) || {};
        const matchesSearch = !term || 
            o.id.toLowerCase().includes(term) || 
            (cust.name && cust.name.toLowerCase().includes(term)) || 
            (cust.email && cust.email.toLowerCase().includes(term));
        const matchesStatus = !status || o.orderStatus === status;
        const matchesPay = !pay || o.paymentStatus === pay;
        const afterFrom = !from || o.date >= from;
        const beforeTo = !to || o.date <= to;
        return matchesSearch && matchesStatus && matchesPay && afterFrom && beforeTo;
    });
    currentPage = 1;
    renderTable();
}

function setupEvents() {
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('-translate-x-full');
    });

    searchInput.addEventListener('input', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    paymentFilter.addEventListener('change', applyFilters);
    applyFiltersBtn.addEventListener('click', applyFilters);
    prevPage.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTable(); } });
    nextPage.addEventListener('click', () => { if ((currentPage * itemsPerPage) < filteredOrders.length) { currentPage++; renderTable(); } });

    selectAll.addEventListener('change', () => {
        document.querySelectorAll('.order-checkbox').forEach(cb => {
            cb.checked = selectAll.checked;
            selectAll.checked ? selectedOrders.add(cb.dataset.orderId) : selectedOrders.delete(cb.dataset.orderId);
        });
        renderTable();
    });

    ordersTableBody.addEventListener('click', e => {
        const cb = e.target.closest('.order-checkbox');
        const view = e.target.closest('.view-order');
        const del = e.target.closest('.delete-order');

        if (cb) {
            const id = cb.dataset.orderId;
            cb.checked ? selectedOrders.add(id) : selectedOrders.delete(id);
            selectAll.checked = [...document.querySelectorAll('.order-checkbox')].every(c => c.checked);
            return;
        }
        if (view) openModal(view.dataset.orderId);
        if (del) if (confirm('Delete this order?')) {
            orders = orders.filter(o => o.id !== del.dataset.orderId);
            localStorage.setItem('orders', JSON.stringify(orders));
            updateStats();
            applyFilters();
        }
    });

    document.getElementById('close-modal').addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('close-modal-btn').addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('save-changes').addEventListener('click', saveModal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
}

function openModal(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const cust = customers.find(c => c.id === order.customerId) || {};

    document.getElementById('customer-name').textContent = cust.name || 'N/A';
    document.getElementById('customer-email').textContent = cust.email || 'N/A';
    document.getElementById('customer-phone').textContent = cust.phone || 'N/A';
    document.getElementById('customer-address').textContent = cust.address || 'N/A';
    document.getElementById('customer-location').textContent = `${cust.city || ''}, ${cust.state || ''} - ${cust.pincode || ''}`;
    document.getElementById('modal-order-id').textContent = order.id;
    document.getElementById('modal-order-date').textContent = formatDate(order.date);
    document.getElementById('modal-delivery-date').textContent = order.expectedDelivery ? formatDate(order.expectedDelivery) : 'N/A';
    document.getElementById('modal-order-status').value = order.orderStatus;

    const itemsBody = document.getElementById('modal-items-body');
    itemsBody.innerHTML = '';
    let total = 0;
    order.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId) || {};
        const sub = item.quantity * item.price;
        total += sub;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="px-4 py-2">${prod.name || 'Unknown'}</td><td class="px-4 py-2">${item.quantity}</td><td class="px-4 py-2">₹${item.price}</td><td class="px-4 py-2">₹${sub}</td>`;
        itemsBody.appendChild(tr);
    });
    document.getElementById('modal-total-amount').textContent = `₹${total}`;

    document.getElementById('modal-payment-method').textContent = order.paymentMethod || 'N/A';
    document.getElementById('modal-transaction-id').textContent = order.transactionId || 'N/A';
    document.getElementById('modal-payment-status').value = order.paymentStatus;
    document.getElementById('modal-delivery-mode').textContent = order.deliveryType || 'N/A';
    document.getElementById('modal-tracking-id').textContent = order.trackingId || 'N/A';
    document.getElementById('modal-actual-delivery-date').textContent = order.actualDelivery ? formatDate(order.actualDelivery) : 'Not delivered';
    document.getElementById('admin-notes').value = order.adminNotes || '';

    document.getElementById('save-changes').dataset.id = id;
    modal.style.display = 'flex';
}

function saveModal() {
    const id = document.getElementById('save-changes').dataset.id;
    const order = orders.find(o => o.id === id);
    if (!order) return;
    order.orderStatus = document.getElementById('modal-order-status').value;
    order.paymentStatus = document.getElementById('modal-payment-status').value;
    order.adminNotes = document.getElementById('admin-notes').value;
    localStorage.setItem('orders', JSON.stringify(orders));
    updateStats();
    renderTable();
    modal.style.display = 'none';
}

/* ---- Helpers ---- */
function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatStatus(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}