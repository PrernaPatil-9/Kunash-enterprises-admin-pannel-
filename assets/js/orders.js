/* ==============================================================
   Order Management – everything in one class
   ============================================================== */
class OrderManager {
    constructor() {
        this.orders = [];
        this.filteredOrders = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;  // ← PAGINATION: 10 per page
        this.selectedOrders = new Set();

        this.init();
    }

    /* ---------------------------------------------------------- */
    init() {
        this.loadOrders();
        this.setupEventListeners();
        this.renderOrders();
        this.updateStats();
    }

    /* ---------------------------------------------------------- */
    loadOrders() {
        const saved = localStorage.getItem('orders');
        if (saved) {
            this.orders = JSON.parse(saved);
        } else {
            this.generateSampleOrders();
            this.saveOrders();
        }
        this.filteredOrders = [...this.orders];
    }

    /* ---------------------------------------------------------- */
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
            const cust = customers[Math.floor(Math.random() * customers.length)];
            const itemCount = Math.floor(Math.random() * 3) + 1;
            const items = [];
            let total = 0;
            for (let j = 0; j < itemCount; j++) {
                const prod = products[Math.floor(Math.random() * products.length)];
                const qty = Math.floor(Math.random() * 3) + 1;
                const sub = prod.price * qty;
                total += sub;
                items.push({ product: prod.name, quantity: qty, price: prod.price, subtotal: sub });
            }

            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));

            const expDate = new Date(orderDate);
            expDate.setDate(expDate.getDate() + Math.floor(Math.random() * 7) + 3);

            const actDate = Math.random() > 0.7 ? new Date(expDate) : null;
            if (actDate) actDate.setDate(actDate.getDate() - Math.floor(Math.random() * 3));

            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const payStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

            this.orders.push({
                id: `ORD${String(i).padStart(4, '0')}`,
                customer: cust,
                date: orderDate.toISOString().split('T')[0],
                items,
                total,
                status,
                paymentStatus: payStatus,
                paymentMethod: Math.random() > 0.5 ? 'Credit Card' : 'UPI',
                transactionId: `TXN${String(i).padStart(6, '0')}`,
                deliveryMode: 'Standard',
                trackingId: (status === 'shipped' || status === 'delivered') ? `TRK${String(i).padStart(8, '0')}` : null,
                expectedDelivery: expDate.toISOString().split('T')[0],
                actualDelivery: actDate ? actDate.toISOString().split('T')[0] : null,
                adminNotes: ''
            });
        }
    }

    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    /* ---------------------------------------------------------- */
    setupEventListeners() {
        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) { this.currentPage--; this.renderOrders(); }
        });
        document.getElementById('next-page').addEventListener('click', () => {
            const pages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
            if (this.currentPage < pages) { this.currentPage++; this.renderOrders(); }
        });

        // Filters
        const apply = () => this.applyFilters();
        document.getElementById('search-input').addEventListener('input', apply);
        document.getElementById('status-filter').addEventListener('change', apply);
        document.getElementById('payment-filter').addEventListener('change', apply);
        document.getElementById('date-from').addEventListener('change', apply);
        document.getElementById('date-to').addEventListener('change', apply);
        document.getElementById('filter-btn').addEventListener('click', apply);
        document.getElementById('reset-filters').addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            document.getElementById('status-filter').value = '';
            document.getElementById('payment-filter').value = '';
            document.getElementById('date-from').value = '';
            document.getElementById('date-to').value = '';
            this.applyFilters();
        });

        // Bulk Actions
        document.getElementById('select-all').addEventListener('change', e => {
            document.querySelectorAll('.order-checkbox').forEach(cb => {
                cb.checked = e.target.checked;
                this.toggleOrderSelection(cb.dataset.id, cb.checked);
            });
            this.updateBulkActions();
        });
        document.getElementById('bulk-delete-btn').addEventListener('click', () => this.bulkDeleteOrders());

        // Modal
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('close-modal-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('save-changes').addEventListener('click', () => this.saveOrderChanges());
        document.getElementById('download-invoice').addEventListener('click', () => this.generateInvoice());

        // Invoice Modal
        document.getElementById('close-invoice-modal').addEventListener('click', () => this.closeInvoiceModal());
        document.getElementById('close-invoice').addEventListener('click', () => this.closeInvoiceModal());
        document.getElementById('print-invoice').addEventListener('click', () => this.printInvoice());
        document.getElementById('download-pdf').addEventListener('click', () => this.downloadInvoicePDF());

        // Click outside modal
        window.addEventListener('click', e => {
            const oModal = document.getElementById('order-details-modal');
            const iModal = document.getElementById('invoice-modal');
            if (e.target === oModal) this.closeModal();
            if (e.target === iModal) this.closeInvoiceModal();
        });
    }

    /* ---------------------------------------------------------- */
    applyFilters() {
        const term = document.getElementById('search-input').value.toLowerCase();
        const status = document.getElementById('status-filter').value;
        const pay = document.getElementById('payment-filter').value;
        const from = document.getElementById('date-from').value;
        const to = document.getElementById('date-to').value;

        this.filteredOrders = this.orders.filter(o => {
            const matchSearch = !term ||
                o.id.toLowerCase().includes(term) ||
                o.customer.name.toLowerCase().includes(term) ||
                o.customer.email.toLowerCase().includes(term);
            const matchStatus = !status || o.status === status;
            const matchPay = !pay || o.paymentStatus === pay;
            const afterFrom = !from || o.date >= from;
            const beforeTo = !to || o.date <= to;
            return matchSearch && matchStatus && matchPay && afterFrom && beforeTo;
        });

        this.currentPage = 1;
        this.renderOrders();
        this.updateStats();
    }

    /* ---------------------------------------------------------- */
    renderOrders() {
        const tbody = document.getElementById('orders-table-body');
        tbody.innerHTML = '';

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = Math.min(start + this.itemsPerPage, this.filteredOrders.length);
        const page = this.filteredOrders.slice(start, end);

        if (page.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="px-6 py-4 text-center text-gray-500">No orders found</td></tr>`;
            this.updatePagination();
            this.updateBulkActions();
            return;
        }

        page.forEach(order => {
            const row = document.createElement('tr');
            row.className = 'order-row';

            const fmtDate = new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

            const statusClass = `status-badge status-${order.status}`;
            const payClass = `status-badge payment-status-${order.paymentStatus}`;

            row.innerHTML = `
                <td class="px-6 py-4"><input type="checkbox" class="order-checkbox rounded text-orange-500" data-id="${order.id}"></td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">${order.id}</td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">${order.customer.name}</div>
                    <div class="text-xs text-gray-500">${order.customer.email}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">${fmtDate}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${order.items.length} item(s)</td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">₹${order.total}</td>
                <td class="px-6 py-4"><span class="${payClass}">${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</span></td>
                <td class="px-6 py-4"><span class="${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                <td class="px-6 py-4 text-sm space-x-2">
                    <button class="text-blue-600 hover:text-blue-800 invoice-order" data-id="${order.id}" title="Invoice">
                        <i class="fas fa-file-invoice"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800 delete-order" data-id="${order.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Attach action listeners
        document.querySelectorAll('.invoice-order').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = e.currentTarget.dataset.id;
                this.generateInvoiceFromTable(id);
            });
        });
        document.querySelectorAll('.delete-order').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = e.currentTarget.dataset.id;
                this.deleteOrder(id);
            });
        });
        document.querySelectorAll('.order-checkbox').forEach(cb => {
            cb.addEventListener('change', e => {
                this.toggleOrderSelection(e.target.dataset.id, e.target.checked);
                this.updateBulkActions();
            });
        });

        this.updatePagination();
        this.updateBulkActions();
    }

    /* ---------------------------------------------------------- */
    updatePagination() {
        const total = this.filteredOrders.length;
        const pages = Math.ceil(total / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, total);

        document.getElementById('pagination-start').textContent = total ? start : 0;
        document.getElementById('pagination-end').textContent = end;
        document.getElementById('pagination-total').textContent = total;
        document.getElementById('prev-page').disabled = this.currentPage === 1;
        document.getElementById('next-page').disabled = this.currentPage >= pages || total === 0;
    }

    updateStats() {
        const total = this.filteredOrders.length;
        const pending = this.filteredOrders.filter(o => ['new', 'processing'].includes(o.status)).length;
        const shipped = this.filteredOrders.filter(o => o.status === 'shipped').length;

        const now = new Date();
        const monthRev = this.filteredOrders
            .filter(o => {
                const d = new Date(o.date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && o.paymentStatus === 'paid';
            })
            .reduce((s, o) => s + o.total, 0);

        document.getElementById('total-orders').textContent = total;
        document.getElementById('pending-orders').textContent = pending;
        document.getElementById('shipped-orders').textContent = shipped;
        document.getElementById('monthly-revenue').textContent = `₹${monthRev}`;
    }

    toggleOrderSelection(id, sel) {
        sel ? this.selectedOrders.add(id) : this.selectedOrders.delete(id);
    }

    updateBulkActions() {
        const cnt = this.selectedOrders.size;
        document.getElementById('bulk-count').textContent = cnt;
        document.getElementById('bulk-delete-btn').disabled = cnt === 0;

        const allCB = document.querySelectorAll('.order-checkbox');
        const checked = Array.from(allCB).filter(c => c.checked).length;
        const selectAll = document.getElementById('select-all');
        selectAll.checked = checked === allCB.length;
        selectAll.indeterminate = checked > 0 && checked < allCB.length;
    }

    /* ---------------------------------------------------------- */
    viewOrderDetails(orderId) {
        const o = this.orders.find(x => x.id === orderId);
        if (!o) return;

        document.getElementById('customer-name').textContent = o.customer.name;
        document.getElementById('customer-email').textContent = o.customer.email;
        document.getElementById('customer-phone').textContent = o.customer.phone;
        document.getElementById('customer-address').textContent = o.customer.address;
        document.getElementById('customer-location').textContent = `${o.customer.city}, ${o.customer.state} - ${o.customer.pincode}`;

        document.getElementById('modal-order-id').textContent = o.id;
        document.getElementById('modal-order-date').textContent = new Date(o.date).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
        document.getElementById('modal-delivery-date').textContent = new Date(o.expectedDelivery).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
        document.getElementById('modal-order-status').value = o.status;

        const itemsBody = document.getElementById('modal-items-body');
        itemsBody.innerHTML = '';
        o.items.forEach(it => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="px-4 py-2 text-sm">${it.product}</td>
                            <td class="px-4 py-2 text-sm">${it.quantity}</td>
                            <td class="px-4 py-2 text-sm">₹${it.price}</td>
                            <td class="px-4 py-2 text-sm">₹${it.subtotal}</td>`;
            itemsBody.appendChild(tr);
        });
        document.getElementById('modal-total-amount').textContent = `₹${o.total}`;

        document.getElementById('modal-payment-method').textContent = o.paymentMethod;
        document.getElementById('modal-transaction-id').textContent = o.transactionId;
        document.getElementById('modal-payment-status').value = o.paymentStatus;

        document.getElementById('modal-delivery-mode').textContent = o.deliveryMode;
        document.getElementById('modal-tracking-id').textContent = o.trackingId || '—';
        document.getElementById('modal-actual-delivery-date').textContent = o.actualDelivery ?
            new Date(o.actualDelivery).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' }) : 'Not delivered';

        document.getElementById('admin-notes').value = o.adminNotes || '';
        document.getElementById('save-changes').dataset.orderId = orderId;

        document.getElementById('order-details-modal').style.display = 'flex';
    }

    closeModal() {
        document.getElementById('order-details-modal').style.display = 'none';
    }

    saveOrderChanges() {
        const id = document.getElementById('save-changes').dataset.orderId;
        const o = this.orders.find(x => x.id === id);
        if (!o) return;

        o.status = document.getElementById('modal-order-status').value;
        o.paymentStatus = document.getElementById('modal-payment-status').value;
        o.adminNotes = document.getElementById('admin-notes').value;

        this.saveOrders();
        this.renderOrders();
        this.updateStats();
        this.closeModal();
        this.showNotification('Order updated successfully!', 'success');
    }

    deleteOrder(id) {
        if (!confirm('Delete this order?')) return;
        this.orders = this.orders.filter(o => o.id !== id);
        this.saveOrders();
        this.applyFilters();
        this.showNotification('Order deleted', 'success');
    }

    bulkDeleteOrders() {
        if (!this.selectedOrders.size) return;
        if (!confirm(`Delete ${this.selectedOrders.size} order(s)?`)) return;
        this.orders = this.orders.filter(o => !this.selectedOrders.has(o.id));
        this.selectedOrders.clear();
        this.saveOrders();
        this.applyFilters();
        this.showNotification('Bulk delete complete', 'success');
    }

    /* ---------------------------------------------------------- */
    generateInvoiceFromTable(orderId) {
        const o = this.orders.find(x => x.id === orderId);
        if (!o) return;
        this._populateInvoice(o);
        document.getElementById('invoice-modal').style.display = 'flex';
    }

    generateInvoice() {
        const id = document.getElementById('save-changes').dataset.orderId;
        const o = this.orders.find(x => x.id === id);
        if (!o) return;
        this._populateInvoice(o);
        document.getElementById('invoice-modal').style.display = 'flex';
    }

    _populateInvoice(o) {
        const orderDate = new Date(o.date).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
        const expDate   = new Date(o.expectedDelivery).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });

        const itemsHTML = o.items.map(it => `
            <tr>
                <td>${it.product}</td>
                <td>${it.quantity}</td>
                <td>₹${it.price}</td>
                <td>₹${it.subtotal}</td>
            </tr>`).join('');

        document.getElementById('invoice-content').innerHTML = `
            <div class="invoice-header">
                <div class="flex justify-between items-start">
                    <div>
                        <img src="../assets/images/logoo bg.png" alt="Kunash" class="invoice-logo">
                        <h1 class="text-2xl font-bold text-orange-600">Kunash Enterprises</h1>
                        <p class="text-gray-600">Premium Dry Fruits & Nuts</p>
                        <p class="text-gray-600">Bangalore, Karnataka - 560001</p>
                        <p class="text-gray-600">GSTIN: 29AAECK1234L1Z5</p>
                    </div>
                    <div class="text-right">
                        <h2 class="text-3xl font-bold text-gray-800">INVOICE</h2>
                        <p class="text-gray-600 mt-2">Invoice #: ${o.id}</p>
                        <p class="text-gray-600">Date: ${orderDate}</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">Bill To:</h3>
                    <p class="font-medium">${o.customer.name}</p>
                    <p>${o.customer.address}</p>
                    <p>${o.customer.city}, ${o.customer.state} - ${o.customer.pincode}</p>
                    <p>${o.customer.email}</p>
                    <p>${o.customer.phone}</p>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">Order Details:</h3>
                    <p><span class="font-medium">Order ID:</span> ${o.id}</p>
                    <p><span class="font-medium">Order Date:</span> ${orderDate}</p>
                    <p><span class="font-medium">Expected Delivery:</span> ${expDate}</p>
                    <p><span class="font-medium">Payment Method:</span> ${o.paymentMethod}</p>
                    <p><span class="font-medium">Status:</span> ${o.status}</p>
                </div>
            </div>

            <table class="invoice-table">
                <thead>
                    <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr>
                </thead>
                <tbody>${itemsHTML}</tbody>
                <tfoot>
                    <tr><td colspan="3" class="text-right font-semibold">Subtotal:</td><td class="font-semibold">₹${o.total}</td></tr>
                    <tr><td colspan="3" class="text-right font-semibold">Shipping:</td><td class="font-semibold">₹0</td></tr>
                    <tr><td colspan="3" class="text-right font-semibold">Total:</td><td class="font-semibold text-lg">₹${o.total}</td></tr>
                </tfoot>
            </table>

            <div class="mt-8 text-center text-gray-600">
                <p>Thank you for your business with Kunash Enterprises!</p>
                <p class="mt-2">Contact us at support@kunash.com</p>
            </div>
        `;
    }

    closeInvoiceModal() {
        document.getElementById('invoice-modal').style.display = 'none';
    }

    printInvoice() {
        const content = document.getElementById('invoice-content').innerHTML;
        const win = window.open('', '', 'width=800,height=600');
        win.document.write(`<html><head><title>Invoice ${document.getElementById('modal-order-id')?.textContent}</title></head><body>${content}</body></html>`);
        win.document.close();
        win.print();
    }

    downloadInvoicePDF() {
        const el = document.getElementById('invoice-content');
        const opt = {
            margin: 10,
            filename: `invoice_${document.getElementById('modal-order-id')?.textContent || 'unknown'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(el).save();
    }

    showNotification(msg, type = 'info') {
        const div = document.createElement('div');
        div.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn text-white ${
            type==='success'?'bg-green-500':type==='error'?'bg-red-500':'bg-blue-500'
        }`;
        div.textContent = msg;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }
}

/* ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    new OrderManager();
});