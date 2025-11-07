// Order Management System
class OrderManager {
    constructor() {
        this.orders = [];
        this.filteredOrders = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.selectedOrders = new Set();
        
        this.init();
    }

    init() {
        this.loadOrders();
        this.setupEventListeners();
        this.renderOrders();
        this.updateStats();
    }

    loadOrders() {
        // Try to load from localStorage, otherwise use sample data
        const savedOrders = localStorage.getItem('orders');
        
        if (savedOrders) {
            this.orders = JSON.parse(savedOrders);
        } else {
            // Generate sample orders if none exist
            this.generateSampleOrders();
            this.saveOrders();
        }
        
        this.filteredOrders = [...this.orders];
    }

    generateSampleOrders() {
        const customers = [
            { name: "Rajesh Kumar", email: "rajesh@example.com", phone: "9876543210", address: "123 MG Road", city: "Bangalore", state: "Karnataka", pincode: "560001" },
            { name: "Priya Sharma", email: "priya@example.com", phone: "9876543211", address: "456 Brigade Road", city: "Bangalore", state: "Karnataka", pincode: "560002" },
            { name: "Amit Patel", email: "amit@example.com", phone: "9876543212", address: "789 Indiranagar", city: "Bangalore", state: "Karnataka", pincode: "560038" },
            { name: "Sneha Reddy", email: "sneha@example.com", phone: "9876543213", address: "321 Koramangala", city: "Bangalore", state: "Karnataka", pincode: "560034" },
            { name: "Vikram Singh", email: "vikram@example.com", phone: "9876543214", address: "654 Whitefield", city: "Bangalore", state: "Karnataka", pincode: "560066" }
        ];

        const products = [
            { name: "Premium Cashew Nuts 500g", price: 850 },
            { name: "Almonds 500g", price: 650 },
            { name: "Pistachios 250g", price: 550 },
            { name: "Walnuts 250g", price: 450 },
            { name: "Dry Fruits Mix 1kg", price: 1200 }
        ];

        const statuses = ['new', 'processing', 'shipped', 'delivered', 'cancelled'];
        const paymentStatuses = ['paid', 'pending', 'failed', 'refunded'];

        this.orders = [];

        for (let i = 1; i <= 50; i++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const itemCount = Math.floor(Math.random() * 3) + 1;
            const items = [];
            let total = 0;

            for (let j = 0; j < itemCount; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                const subtotal = product.price * quantity;
                total += subtotal;

                items.push({
                    product: product.name,
                    quantity: quantity,
                    price: product.price,
                    subtotal: subtotal
                });
            }

            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
            
            const deliveryDate = new Date(orderDate);
            deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 7) + 3);
            
            const actualDeliveryDate = Math.random() > 0.7 ? 
                new Date(deliveryDate.getTime() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000) : null;

            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

            this.orders.push({
                id: `ORD${String(i).padStart(4, '0')}`,
                customer: customer,
                date: orderDate.toISOString().split('T')[0],
                items: items,
                total: total,
                status: status,
                paymentStatus: paymentStatus,
                paymentMethod: Math.random() > 0.5 ? 'Credit Card' : 'UPI',
                transactionId: `TXN${String(i).padStart(6, '0')}`,
                deliveryMode: 'Standard',
                trackingId: status === 'shipped' || status === 'delivered' ? `TRK${String(i).padStart(8, '0')}` : null,
                expectedDelivery: deliveryDate.toISOString().split('T')[0],
                actualDelivery: actualDeliveryDate ? actualDeliveryDate.toISOString().split('T')[0] : null,
                adminNotes: ''
            });
        }
    }

    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    setupEventListeners() {
        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderOrders();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderOrders();
            }
        });

        // Search and filters
        document.getElementById('search-input').addEventListener('input', () => {
            this.applyFilters();
        });

        document.getElementById('status-filter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('payment-filter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('date-from').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('date-to').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('filter-btn').addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('reset-filters').addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            document.getElementById('status-filter').value = '';
            document.getElementById('payment-filter').value = '';
            document.getElementById('date-from').value = '';
            document.getElementById('date-to').value = '';
            this.applyFilters();
        });

        // Bulk actions
        document.getElementById('select-all').addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.order-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
                this.toggleOrderSelection(checkbox.dataset.id, checkbox.checked);
            });
            this.updateBulkActions();
        });

        document.getElementById('bulk-delete-btn').addEventListener('click', () => {
            this.bulkDeleteOrders();
        });

        // Modal events
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('close-modal-btn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('save-changes').addEventListener('click', () => {
            this.saveOrderChanges();
        });

        document.getElementById('download-invoice').addEventListener('click', () => {
            this.generateInvoice();
        });

        // Invoice modal events
        document.getElementById('close-invoice-modal').addEventListener('click', () => {
            this.closeInvoiceModal();
        });

        document.getElementById('close-invoice').addEventListener('click', () => {
            this.closeInvoiceModal();
        });

        document.getElementById('print-invoice').addEventListener('click', () => {
            this.printInvoice();
        });

        document.getElementById('download-pdf').addEventListener('click', () => {
            this.downloadInvoicePDF();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const orderModal = document.getElementById('order-details-modal');
            const invoiceModal = document.getElementById('invoice-modal');
            
            if (e.target === orderModal) {
                this.closeModal();
            }
            
            if (e.target === invoiceModal) {
                this.closeInvoiceModal();
            }
        });
    }

    applyFilters() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;
        const paymentFilter = document.getElementById('payment-filter').value;
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;

        this.filteredOrders = this.orders.filter(order => {
            const matchesSearch = 
                order.id.toLowerCase().includes(searchTerm) ||
                order.customer.name.toLowerCase().includes(searchTerm) ||
                order.customer.email.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || order.status === statusFilter;
            const matchesPayment = !paymentFilter || order.paymentStatus === paymentFilter;
            
            let matchesDate = true;
            if (dateFrom && order.date < dateFrom) {
                matchesDate = false;
            }
            if (dateTo && order.date > dateTo) {
                matchesDate = false;
            }
            
            return matchesSearch && matchesStatus && matchesPayment && matchesDate;
        });

        this.currentPage = 1;
        this.renderOrders();
        this.updateStats();
    }

    renderOrders() {
        const tableBody = document.getElementById('orders-table-body');
        tableBody.innerHTML = '';

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredOrders.length);
        const currentOrders = this.filteredOrders.slice(startIndex, endIndex);

        currentOrders.forEach(order => {
            const row = document.createElement('tr');
            row.className = 'order-row';
            
            // Format date
            const orderDate = new Date(order.date);
            const formattedDate = orderDate.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });

            // Status badge
            const statusClass = `status-${order.status}`;
            const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
            
            // Payment status badge
            const paymentClass = `payment-status-${order.paymentStatus}`;
            const paymentText = order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1);

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="order-checkbox rounded text-orange-500" data-id="${order.id}">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.id}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${order.customer.name}</div>
                    <div class="text-sm text-gray-500">${order.customer.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formattedDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.items.length} items</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹${order.total}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge ${paymentClass}">${paymentText}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 invoice-order mr-3" data-id="${order.id}">
                        <i class="fas fa-file-invoice"></i> 
                    </button>
                    <button class="text-red-600 hover:text-red-900 delete-order" data-id="${order.id}">
                        <i class="fas fa-trash"></i> 
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Add event listeners to invoice and delete buttons
        document.querySelectorAll('.invoice-order').forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.target.closest('button').dataset.id;
                this.generateInvoiceFromTable(orderId);
            });
        });

        document.querySelectorAll('.delete-order').forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.target.closest('button').dataset.id;
                this.deleteOrder(orderId);
            });
        });

        // Add event listeners to checkboxes
        document.querySelectorAll('.order-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleOrderSelection(e.target.dataset.id, e.target.checked);
                this.updateBulkActions();
            });
        });

        this.updatePagination();
        this.updateBulkActions();
    }

    updatePagination() {
        const totalOrders = this.filteredOrders.length;
        const totalPages = Math.ceil(totalOrders / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.itemsPerPage, totalOrders);

        document.getElementById('pagination-start').textContent = startIndex;
        document.getElementById('pagination-end').textContent = endIndex;
        document.getElementById('pagination-total').textContent = totalOrders;

        document.getElementById('prev-page').disabled = this.currentPage === 1;
        document.getElementById('next-page').disabled = this.currentPage === totalPages || totalPages === 0;
    }

    updateStats() {
        const totalOrders = this.filteredOrders.length;
        const pendingOrders = this.filteredOrders.filter(order => 
            order.status === 'new' || order.status === 'processing').length;
        const shippedOrders = this.filteredOrders.filter(order => order.status === 'shipped').length;
        
        // Calculate monthly revenue (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = this.filteredOrders
            .filter(order => {
                const orderDate = new Date(order.date);
                return orderDate.getMonth() === currentMonth && 
                       orderDate.getFullYear() === currentYear &&
                       order.paymentStatus === 'paid';
            })
            .reduce((sum, order) => sum + order.total, 0);

        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('pending-orders').textContent = pendingOrders;
        document.getElementById('shipped-orders').textContent = shippedOrders;
        document.getElementById('monthly-revenue').textContent = `₹${monthlyRevenue}`;
    }

    toggleOrderSelection(orderId, isSelected) {
        if (isSelected) {
            this.selectedOrders.add(orderId);
        } else {
            this.selectedOrders.delete(orderId);
        }
    }

    updateBulkActions() {
        const bulkCount = document.getElementById('bulk-count');
        const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
        const selectAll = document.getElementById('select-all');

        bulkCount.textContent = this.selectedOrders.size;
        bulkDeleteBtn.disabled = this.selectedOrders.size === 0;

        // Update select all checkbox state
        const checkboxes = document.querySelectorAll('.order-checkbox');
        const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
        const someChecked = Array.from(checkboxes).some(cb => cb.checked);
        
        selectAll.checked = allChecked;
        selectAll.indeterminate = someChecked && !allChecked;
    }

    generateInvoiceFromTable(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const invoiceContent = document.getElementById('invoice-content');
        
        // Format dates
        const orderDate = new Date(order.date);
        const formattedOrderDate = orderDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        const deliveryDate = new Date(order.expectedDelivery);
        const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        invoiceContent.innerHTML = `
            <div class="invoice-header">
                <div class="flex justify-between items-start">
                    <div>
                        <img src="../assets/images/logoo bg.png" alt="Kunash Enterprises" class="invoice-logo">
                        <h1 class="text-2xl font-bold text-orange-600">Kunash Enterprises</h1>
                        <p class="text-gray-600">Premium Dry Fruits & Nuts</p>
                        <p class="text-gray-600">Bangalore, Karnataka - 560001</p>
                        <p class="text-gray-600">GSTIN: 29AAECK1234L1Z5</p>
                    </div>
                    <div class="text-right">
                        <h2 class="text-3xl font-bold text-gray-800">INVOICE</h2>
                        <p class="text-gray-600 mt-2">Invoice #: ${order.id}</p>
                        <p class="text-gray-600">Date: ${formattedOrderDate}</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">Bill To:</h3>
                    <p class="font-medium">${order.customer.name}</p>
                    <p>${order.customer.address}</p>
                    <p>${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}</p>
                    <p>${order.customer.email}</p>
                    <p>${order.customer.phone}</p>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">Order Details:</h3>
                    <p><span class="font-medium">Order ID:</span> ${order.id}</p>
                    <p><span class="font-medium">Order Date:</span> ${formattedOrderDate}</p>
                    <p><span class="font-medium">Expected Delivery:</span> ${formattedDeliveryDate}</p>
                    <p><span class="font-medium">Payment Method:</span> ${order.paymentMethod}</p>
                    <p><span class="font-medium">Status:</span> <span class="capitalize">${order.status}</span></p>
                </div>
            </div>

            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.product}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price}</td>
                            <td>₹${item.subtotal}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="text-right font-semibold">Subtotal:</td>
                        <td class="font-semibold">₹${order.total}</td>
                    </tr>
                    <tr>
                        <td colspan="3" class="text-right font-semibold">Shipping:</td>
                        <td class="font-semibold">₹0</td>
                    </tr>
                    <tr>
                        <td colspan="3" class="text-right font-semibold">Total:</td>
                        <td class="font-semibold text-lg">₹${order.total}</td>
                    </tr>
                </tfoot>
            </table>

            <div class="mt-8 text-center text-gray-600">
                <p>Thank you for your business with Kunash Enterprises!</p>
                <p class="mt-2">For any queries, contact us at support@kunash.com or call +91-9876543210</p>
            </div>
        `;

        // Show invoice modal
        document.getElementById('invoice-modal').style.display = 'flex';
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        // Populate customer information
        document.getElementById('customer-name').textContent = order.customer.name;
        document.getElementById('customer-email').textContent = order.customer.email;
        document.getElementById('customer-phone').textContent = order.customer.phone;
        document.getElementById('customer-address').textContent = order.customer.address;
        document.getElementById('customer-location').textContent = 
            `${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}`;

        // Populate order information
        document.getElementById('modal-order-id').textContent = order.id;
        
        const orderDate = new Date(order.date);
        document.getElementById('modal-order-date').textContent = 
            orderDate.toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
            });
            
        const deliveryDate = new Date(order.expectedDelivery);
        document.getElementById('modal-delivery-date').textContent = 
            deliveryDate.toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
            });
            
        document.getElementById('modal-order-status').value = order.status;

        // Populate ordered items
        const itemsBody = document.getElementById('modal-items-body');
        itemsBody.innerHTML = '';
        
        order.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-4 py-2 text-sm">${item.product}</td>
                <td class="px-4 py-2 text-sm">${item.quantity}</td>
                <td class="px-4 py-2 text-sm">₹${item.price}</td>
                <td class="px-4 py-2 text-sm">₹${item.subtotal}</td>
            `;
            itemsBody.appendChild(row);
        });
        
        document.getElementById('modal-total-amount').textContent = `₹${order.total}`;

        // Populate payment details
        document.getElementById('modal-payment-method').textContent = order.paymentMethod;
        document.getElementById('modal-transaction-id').textContent = order.transactionId;
        document.getElementById('modal-payment-status').value = order.paymentStatus;

        // Populate delivery information
        document.getElementById('modal-delivery-mode').textContent = order.deliveryMode;
        document.getElementById('modal-tracking-id').textContent = order.trackingId || 'Not available';
        
        if (order.actualDelivery) {
            const actualDeliveryDate = new Date(order.actualDelivery);
            document.getElementById('modal-actual-delivery-date').textContent = 
                actualDeliveryDate.toLocaleDateString('en-IN', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                });
        } else {
            document.getElementById('modal-actual-delivery-date').textContent = 'Not delivered yet';
        }

        // Populate admin notes
        document.getElementById('admin-notes').value = order.adminNotes || '';

        // Store current order ID for saving changes
        document.getElementById('save-changes').dataset.orderId = orderId;

        // Show modal
        document.getElementById('order-details-modal').style.display = 'flex';
    }

    closeModal() {
        document.getElementById('order-details-modal').style.display = 'none';
    }

    saveOrderChanges() {
        const orderId = document.getElementById('save-changes').dataset.orderId;
        const order = this.orders.find(o => o.id === orderId);
        
        if (!order) return;

        // Update order status
        order.status = document.getElementById('modal-order-status').value;
        
        // Update payment status
        order.paymentStatus = document.getElementById('modal-payment-status').value;
        
        // Update admin notes
        order.adminNotes = document.getElementById('admin-notes').value;

        this.saveOrders();
        this.renderOrders();
        this.updateStats();
        this.closeModal();
        
        // Show success message
        this.showNotification('Order updated successfully!', 'success');
    }

    deleteOrder(orderId) {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }

        this.orders = this.orders.filter(order => order.id !== orderId);
        this.saveOrders();
        this.applyFilters(); // Re-apply filters to update the view
        
        this.showNotification('Order deleted successfully!', 'success');
    }

    bulkDeleteOrders() {
        if (this.selectedOrders.size === 0) return;
        
        if (!confirm(`Are you sure you want to delete ${this.selectedOrders.size} order(s)? This action cannot be undone.`)) {
            return;
        }

        this.orders = this.orders.filter(order => !this.selectedOrders.has(order.id));
        this.selectedOrders.clear();
        this.saveOrders();
        this.applyFilters();
        
        this.showNotification(`${this.selectedOrders.size} order(s) deleted successfully!`, 'success');
    }

    generateInvoice() {
        const orderId = document.getElementById('save-changes').dataset.orderId;
        const order = this.orders.find(o => o.id === orderId);
        
        if (!order) return;

        const invoiceContent = document.getElementById('invoice-content');
        
        // Format dates
        const orderDate = new Date(order.date);
        const formattedOrderDate = orderDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        const deliveryDate = new Date(order.expectedDelivery);
        const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        invoiceContent.innerHTML = `
            <div class="invoice-header">
                <div class="flex justify-between items-start">
                    <div>
                        <img src="../assets/images/logoo bg.png" alt="Kunash Enterprises" class="invoice-logo">
                        <h1 class="text-2xl font-bold text-orange-600">Kunash Enterprises</h1>
                        <p class="text-gray-600">Premium Dry Fruits & Nuts</p>
                        <p class="text-gray-600">Bangalore, Karnataka - 560001</p>
                        <p class="text-gray-600">GSTIN: 29AAECK1234L1Z5</p>
                    </div>
                    <div class="text-right">
                        <h2 class="text-3xl font-bold text-gray-800">INVOICE</h2>
                        <p class="text-gray-600 mt-2">Invoice #: ${order.id}</p>
                        <p class="text-gray-600">Date: ${formattedOrderDate}</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">Bill To:</h3>
                    <p class="font-medium">${order.customer.name}</p>
                    <p>${order.customer.address}</p>
                    <p>${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}</p>
                    <p>${order.customer.email}</p>
                    <p>${order.customer.phone}</p>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">Order Details:</h3>
                    <p><span class="font-medium">Order ID:</span> ${order.id}</p>
                    <p><span class="font-medium">Order Date:</span> ${formattedOrderDate}</p>
                    <p><span class="font-medium">Expected Delivery:</span> ${formattedDeliveryDate}</p>
                    <p><span class="font-medium">Payment Method:</span> ${order.paymentMethod}</p>
                    <p><span class="font-medium">Status:</span> <span class="capitalize">${order.status}</span></p>
                </div>
            </div>

            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.product}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price}</td>
                            <td>₹${item.subtotal}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="text-right font-semibold">Subtotal:</td>
                        <td class="font-semibold">₹${order.total}</td>
                    </tr>
                    <tr>
                        <td colspan="3" class="text-right font-semibold">Shipping:</td>
                        <td class="font-semibold">₹0</td>
                    </tr>
                    <tr>
                        <td colspan="3" class="text-right font-semibold">Total:</td>
                        <td class="font-semibold text-lg">₹${order.total}</td>
                    </tr>
                </tfoot>
            </table>

            <div class="mt-8 text-center text-gray-600">
                <p>Thank you for your business with Kunash Enterprises!</p>
                <p class="mt-2">For any queries, contact us at support@kunash.com or call +91-9876543210</p>
            </div>
        `;

        // Show invoice modal
        document.getElementById('invoice-modal').style.display = 'flex';
    }

    closeInvoiceModal() {
        document.getElementById('invoice-modal').style.display = 'none';
    }

    printInvoice() {
        const invoiceElement = document.getElementById('invoice-content');
        const originalContents = document.body.innerHTML;
        
        document.body.innerHTML = invoiceElement.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        
        // Re-initialize the order manager after printing
        this.init();
    }

    downloadInvoicePDF() {
        const invoiceElement = document.getElementById('invoice-content');
        
        const options = {
            margin: 10,
            filename: `invoice_${document.getElementById('modal-order-id').textContent}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(options).from(invoiceElement).save();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the order manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new OrderManager();
});