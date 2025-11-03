/* =====================================================
   Products + Categories Management (Fixed & Working)
   ===================================================== */
let products = JSON.parse(localStorage.getItem('products') || '[]');
let categories = JSON.parse(localStorage.getItem('categories') || '[]');

/* Sample Data */
if (products.length === 0) {
    products = [
        { id: 'PROD001', name: 'Wireless Mouse', category: 'Mice', price: 499, stock: 50, type: 'Peripheral', status: 'active' },
        { id: 'PROD002', name: 'Gaming Keyboard', category: 'Keyboards', price: 1299, stock: 30, type: 'Peripheral', status: 'active' }
    ];
    localStorage.setItem('products', JSON.stringify(products));
}

if (categories.length === 0) {
    categories = [
        { id: 'CAT001', name: 'Laptops', code: 'LAP', description: 'Gaming & Business Laptops', parent: '', image: '', order: 1, status: 'active', created: new Date().toISOString() },
        { id: 'CAT002', name: 'Keyboards', code: 'KEYB', description: 'Mechanical & Membrane', parent: '', image: '', order: 2, status: 'active', created: new Date().toISOString() },
        { id: 'CAT003', name: 'Mice', code: 'MSE', description: 'Wired & Wireless Mice', parent: '', image: '', order: 3, status: 'active', created: new Date().toISOString() }
    ];
    localStorage.setItem('categories', JSON.stringify(categories));
}

/* DOM Elements */
const productsTableBody = document.getElementById('products-table-body');
const addCategoryBtn = document.getElementById('add-category-btn');
const modal = document.getElementById('add-category-modal');
const closeModal = document.getElementById('close-category-modal');
const cancelBtn = document.getElementById('cancel-category');
const form = document.getElementById('add-category-form');
const parentSelect = document.getElementById('parent-category');

/* Init */
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    populateParentCategories();
    setupEventListeners();
});

/* Render Products Table */
function renderProducts() {
    if (!productsTableBody) return;
    productsTableBody.innerHTML = '';

    products.forEach(p => {
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-orange-50 transition';
        row.innerHTML = `
            <td class="py-3 px-4 text-sm">${p.id}</td>
            <td class="py-3 px-4 text-sm font-medium">${p.name}</td>
            <td class="py-3 px-4 text-sm">${p.category}</td>
            <td class="py-3 px-4 text-sm">₹${p.price}</td>
            <td class="py-3 px-4 text-sm">${p.stock}</td>
            <td class="py-3 px-4 text-sm">${p.type}</td>
            <td class="py-3 px-4 text-sm space-x-3">
                <a href="edit-product.html?id=${p.id}" class="text-orange-600 hover:text-orange-800">
                    <i class="fas fa-edit"></i>
                </a>
                <button class="text-red-600 hover:text-red-800 delete-btn" data-id="${p.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        productsTableBody.appendChild(row);
    });

    // Attach delete listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            if (confirm('Delete this product?')) {
                products = products.filter(p => p.id !== id);
                localStorage.setItem('products', JSON.stringify(products));
                renderProducts();
            }
        });
    });
}

/* Populate Parent Category Dropdown */
function populateParentCategories() {
    if (!parentSelect) return;
    parentSelect.innerHTML = '<option value="">None (Top Level)</option>';
    categories
        .filter(c => c.status === 'active')
        .sort((a, b) => a.order - b.order)
        .forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.name;
            opt.textContent = `${cat.name} (${cat.code || 'no code'})`;
            parentSelect.appendChild(opt);
        });
}

/* Event Listeners */
function setupEventListeners() {
    addCategoryBtn?.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    [closeModal, cancelBtn].forEach(btn => {
        btn?.addEventListener('click', () => {
            modal.classList.add('hidden');
            form.reset();
        });
    });

    modal.addEventListener('click', e => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            form.reset();
        }
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        saveCategory();
    });
}

/* Save Category */
function saveCategory() {
    const name = document.getElementById('category-name').value.trim();
    if (!name) return alert('Category name is required!');

    const newCat = {
        id: 'CAT' + String(categories.length + 1).padStart(3, '0'),
        name,
        code: document.getElementById('category-code').value.trim() || '',
        description: document.getElementById('category-desc').value.trim(),
        parent: document.getElementById('parent-category').value,
        image: '',
        order: parseInt(document.getElementById('display-order').value) || 999,
        status: document.getElementById('category-status').value,
        created: new Date().toISOString()
    };

    categories.push(newCat);
    localStorage.setItem('categories', JSON.stringify(categories));

    alert('Category added successfully!');
    modal.classList.add('hidden');
    form.reset();

    populateParentCategories();
    window.dispatchEvent(new Event('categoriesUpdated'));
}