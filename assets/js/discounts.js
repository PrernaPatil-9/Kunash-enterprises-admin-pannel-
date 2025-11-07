/* ==============================================================
   Discount Management – Updated
   • Fixed column alignment with table-layout: fixed
   • Added View button + modal
   • Vertical scroll with sticky header
   • Actions column centered
   ============================================================== */

let discounts = JSON.parse(localStorage.getItem('discounts')) || [
    {
        id: 1, customerName: "Rahul Sharma", email: "rahul.sharma@example.com",
        mobileNumber: "9876543210", couponCode: "WELCOME10", discountValue: 10,
        discountType: "percentage", validUntil: "2025-12-31", status: "active"
    },
    {
        id: 2, customerName: "Priya Patel", email: "priya.patel@example.com",
        mobileNumber: "8765432109", couponCode: "SUMMER25", discountValue: 25,
        discountType: "percentage", validUntil: "2025-09-30", status: "active"
    },
    {
        id: 3, customerName: "Amit Kumar", email: "amit.kumar@example.com",
        mobileNumber: "7654321098", couponCode: "FLAT50", discountValue: 50,
        discountType: "fixed", validUntil: "2025-08-15", status: "expired"
    },
    {
        id: 4, customerName: "Neha Gupta", email: "neha.gupta@example.com",
        mobileNumber: "6543210987", couponCode: "NEWUSER15", discountValue: 15,
        discountType: "percentage", validUntil: "2025-10-20", status: "pending"
    },
    {
        id: 5, customerName: "Vikram Singh", email: "vikram.singh@example.com",
        mobileNumber: "5432109876", couponCode: "FESTIVE20", discountValue: 20,
        discountType: "percentage", validUntil: "2025-11-10", status: "active"
    }
];

/* ---------- Pagination & filtering ---------- */
let currentPage = 1;
const itemsPerPage = 10;
let filteredDiscounts = [...discounts];

/* ---------- DOM Elements ---------- */
const tbody          = document.getElementById('discounts-table-body');
const totalEl        = document.getElementById('total-discounts');
const activeEl       = document.getElementById('active-discounts');
const expiredEl      = document.getElementById('expired-discounts');
const pendingEl      = document.getElementById('pending-discounts');
const tableInfoEl    = document.getElementById('table-info');
const pageInfoEl     = document.getElementById('page-info');
const prevBtn        = document.getElementById('prev-page');
const nextBtn        = document.getElementById('next-page');
const searchInput    = document.getElementById('search-discounts');
const addBtn         = document.getElementById('add-discount-btn');
const modal          = document.getElementById('discount-modal');
const viewModal      = document.getElementById('view-modal');
const deleteModal    = document.getElementById('delete-modal');
const form           = document.getElementById('discount-form');
const modalTitle     = document.getElementById('modal-title');
const idInput        = document.getElementById('discount-id');
const selectAllChk   = document.getElementById('select-all');

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    renderTable();
    setupListeners();
});

/* ---------- Event Listeners ---------- */
function setupListeners() {
    addBtn.addEventListener('click', openAddModal);
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-discount').addEventListener('click', closeModal);
    document.getElementById('close-view').addEventListener('click', closeViewModal);
    document.getElementById('cancel-delete').addEventListener('click', closeDeleteModal);
    document.getElementById('confirm-delete').addEventListener('click', confirmDelete);
    form.addEventListener('submit', handleSubmit);
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    prevBtn.addEventListener('click', () => changePage(-1));
    nextBtn.addEventListener('click', () => changePage(1));
    selectAllChk.addEventListener('change', toggleSelectAll);
    window.addEventListener('click', e => {
        if (e.target === modal) closeModal();
        if (e.target === viewModal) closeViewModal();
        if (e.target === deleteModal) closeDeleteModal();
    });
}

/* ---------- Stats ---------- */
function updateStats() {
    const total   = discounts.length;
    const active  = discounts.filter(d => d.status === 'active').length;
    const expired = discounts.filter(d => d.status === 'expired').length;
    const pending = discounts.filter(d => d.status === 'pending').length;

    totalEl.textContent   = total;
    activeEl.textContent  = active;
    expiredEl.textContent = expired;
    pendingEl.textContent = pending;
}

/* ---------- Table Rendering ---------- */
function renderTable() {
    const start = (currentPage - 1) * itemsPerPage;
    const end   = start + itemsPerPage;
    const pageItems = filteredDiscounts.slice(start, end);

    tbody.innerHTML = '';

    if (pageItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-8 text-gray-500">No discounts found</td></tr>`;
    } else {
        pageItems.forEach(d => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-center"><input type="checkbox" class="row-check" data-id="${d.id}"></td>
                <td>${escapeHtml(d.customerName)}</td>
                <td>${escapeHtml(d.email)}</td>
                <td>${escapeHtml(d.mobileNumber)}</td>
                <td class="font-mono">${escapeHtml(d.couponCode)}</td>
                <td>${d.discountValue}${d.discountType === 'percentage' ? '%' : '₹'}</td>
                <td>${formatDate(d.validUntil)}</td>
                <td><span class="${statusClass(d.status)}">${capitalize(d.status)}</span></td>
                <td class="text-center">
                    <div class="flex justify-center space-x-1">
                        <button class="view-btn text-green-600 hover:text-green-800" data-id="${d.id}" title="View">
                            <span class="material-icons text-sm">visibility</span>
                        </button>
                        <button class="edit-btn text-blue-600 hover:text-blue-800" data-id="${d.id}" title="Edit">
                            <span class="material-icons text-sm">edit</span>
                        </button>
                        <button class="delete-btn text-red-600 hover:text-red-800" data-id="${d.id}" title="Delete">
                            <span class="material-icons text-sm">delete</span>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Attach handlers
        tbody.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', e => {
            const id = Number(e.currentTarget.dataset.id);
            openViewModal(id);
        }));
        tbody.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', e => {
            const id = Number(e.currentTarget.dataset.id);
            openEditModal(id);
        }));
        tbody.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', e => {
            const id = Number(e.currentTarget.dataset.id);
            openDeleteModal(id);
        }));
    }

    updatePagination();
    syncSelectAllCheckbox();
}

/* ---------- View Modal ---------- */
function openViewModal(id) {
    const d = discounts.find(x => x.id === id);
    if (!d) return;

    const content = document.getElementById('view-content');
    content.innerHTML = `
        <div><strong>Customer:</strong> ${escapeHtml(d.customerName)}</div>
        <div><strong>Email:</strong> ${escapeHtml(d.email)}</div>
        <div><strong>Mobile:</strong> ${escapeHtml(d.mobileNumber)}</div>
        <div><strong>Coupon Code:</strong> <code class="bg-gray-100 px-2 py-1 rounded">${escapeHtml(d.couponCode)}</code></div>
        <div><strong>Discount:</strong> ${d.discountValue}${d.discountType === 'percentage' ? '%' : '₹'}</div>
        <div><strong>Valid Until:</strong> ${formatDate(d.validUntil)}</div>
        <div><strong>Status:</strong> <span class="${statusClass(d.status)}">${capitalize(d.status)}</span></div>
    `;
    viewModal.classList.remove('hidden');
}
function closeViewModal() {
    viewModal.classList.add('hidden');
}

/* ---------- Other Functions (unchanged) ---------- */
function updatePagination() {
    const totalPages = Math.max(1, Math.ceil(filteredDiscounts.length / itemsPerPage));
    const startItem  = (currentPage - 1) * itemsPerPage + 1;
    const endItem    = Math.min(currentPage * itemsPerPage, filteredDiscounts.length);

    tableInfoEl.textContent = `Showing ${startItem} to ${endItem} of ${filteredDiscounts.length} discounts`;
    pageInfoEl.textContent  = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}
function changePage(delta) {
    const newPage = currentPage + delta;
    const maxPage = Math.ceil(filteredDiscounts.length / itemsPerPage);
    if (newPage >= 1 && newPage <= maxPage) {
        currentPage = newPage;
        renderTable();
    }
}
function handleSearch() {
    const term = searchInput.value.trim().toLowerCase();
    filteredDiscounts = term === ''
        ? [...discounts]
        : discounts.filter(d =>
            d.customerName.toLowerCase().includes(term) ||
            d.email.toLowerCase().includes(term) ||
            d.couponCode.toLowerCase().includes(term) ||
            d.mobileNumber.includes(term)
        );
    currentPage = 1;
    renderTable();
}
function debounce(fn, wait) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), wait);
    };
}
function toggleSelectAll() {
    const checked = selectAllChk.checked;
    document.querySelectorAll('.row-check').forEach(chk => chk.checked = checked);
}
function syncSelectAllCheckbox() {
    const all = document.querySelectorAll('.row-check');
    const checked = document.querySelectorAll('.row-check:checked');
    selectAllChk.checked = all.length > 0 && all.length === checked.length;
    selectAllChk.indeterminate = checked.length > 0 && checked.length < all.length;
}
function openAddModal() {
    modalTitle.textContent = 'Add New Discount';
    form.reset();
    idInput.value = '';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('valid-until').value = tomorrow.toISOString().split('T')[0];
    modal.classList.remove('hidden');
}
function openEditModal(id) {
    const d = discounts.find(x => x.id === id);
    if (!d) return;
    modalTitle.textContent = 'Edit Discount';
    idInput.value = d.id;
    document.getElementById('customer-name').value   = d.customerName;
    document.getElementById('customer-email').value  = d.email;
    document.getElementById('mobile-number').value   = d.mobileNumber;
    document.getElementById('coupon-code').value     = d.couponCode;
    document.getElementById('discount-value').value = d.discountValue;
    document.getElementById('discount-type').value  = d.discountType;
    document.getElementById('valid-until').value    = d.validUntil;
    document.getElementById('discount-status').value = d.status;
    modal.classList.remove('hidden');
}
function closeModal() { modal.classList.add('hidden'); }
function handleSubmit(e) {
    e.preventDefault();
    const id = idInput.value ? Number(idInput.value) : null;
    const payload = {
        id: id || generateId(),
        customerName: document.getElementById('customer-name').value.trim(),
        email:        document.getElementById('customer-email').value.trim(),
        mobileNumber: document.getElementById('mobile-number').value.trim(),
        couponCode:   document.getElementById('coupon-code').value.trim().toUpperCase(),
        discountValue: Number(document.getElementById('discount-value').value),
        discountType: document.getElementById('discount-type').value,
        validUntil:   document.getElementById('valid-until').value,
        status:       document.getElementById('discount-status').value
    };
    const codeExists = discounts.some(d => d.couponCode === payload.couponCode && d.id !== payload.id);
    if (codeExists) {
        showNotify('Coupon code already exists.', 'error');
        return;
    }
    if (id) {
        const idx = discounts.findIndex(d => d.id === id);
        if (idx > -1) discounts[idx] = payload;
    } else {
        discounts.push(payload);
    }
    localStorage.setItem('discounts', JSON.stringify(discounts));
    updateStats();
    filteredDiscounts = [...discounts];
    renderTable();
    closeModal();
    showNotify(`Discount ${id ? 'updated' : 'added'} successfully!`, 'success');
}
function openDeleteModal(id) {
    deleteModal.dataset.id = id;
    deleteModal.classList.remove('hidden');
}
function closeDeleteModal() {
    deleteModal.classList.add('hidden');
    deleteModal.removeAttribute('data-id');
}
function confirmDelete() {
    const id = Number(deleteModal.dataset.id);
    discounts = discounts.filter(d => d.id !== id);
    localStorage.setItem('discounts', JSON.stringify(discounts));
    updateStats();
    filteredDiscounts = [...discounts];
    renderTable();
    closeDeleteModal();
    showNotify('Discount deleted!', 'success');
}
function generateId() {
    return discounts.length ? Math.max(...discounts.map(d => d.id)) + 1 : 1;
}
function formatDate(str) {
    return new Date(str).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' });
}
function statusClass(st) {
    return st === 'active' ? 'status-active' :
           st === 'expired' ? 'status-expired' : 'status-pending';
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
function showNotify(msg, type = 'info') {
    const el = document.createElement('div');
    el.textContent = msg;
    el.className = `fixed top-4 right-4 p-4 rounded-lg text-white shadow-lg z-50 animate-fadeIn ${
        type === 'success' ? 'bg-green-500' :
        type === 'error'   ? 'bg-red-500' : 'bg-blue-500'
    }`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}