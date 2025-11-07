// ==================== PRODUCTS MANAGEMENT ====================
let products = JSON.parse(localStorage.getItem('products') || '[]');
let categories = JSON.parse(localStorage.getItem('categories') || '[]');

// Initialize with sample data if empty
if (products.length === 0) {
    products = [
        {
            id: 'PROD001', 
            name: 'Gaming Laptop', 
            category: 'Laptops', 
            subcategory: 'Gaming Laptops', 
            oldPrice: 89999, 
            newPrice: 74999,
            stock: 15, 
            mainImage: 'https://via.placeholder.com/300', 
            subImages: ['https://via.placeholder.com/60/FF0000', 'https://via.placeholder.com/60/00FF00'],
            ram: '16GB',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 'PROD002', 
            name: 'Wireless Keyboard', 
            category: 'Keyboards', 
            subcategory: 'Wireless Keyboards', 
            oldPrice: 4999, 
            newPrice: 3999,
            stock: 25, 
            mainImage: 'https://via.placeholder.com/300', 
            subImages: ['https://via.placeholder.com/60/0000FF'],
            ram: '',
            status: 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 'PROD003', 
            name: 'Gaming Mouse', 
            category: 'Mouse', 
            subcategory: 'Gaming Mouse', 
            oldPrice: 2999, 
            newPrice: 1999,
            stock: 50, 
            mainImage: 'https://via.placeholder.com/300', 
            subImages: ['https://via.placeholder.com/60/FF00FF', 'https://via.placeholder.com/60/FFFF00'],
            ram: '',
            status: 'active',
            createdAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('products', JSON.stringify(products));
}

if (categories.length === 0) {
    categories = [
        { id: 'CAT001', name: 'Laptops', code: 'LAP', parent: '', status: 'active', needsRam: true },
        { id: 'CAT002', name: 'Keyboards', code: 'KEYB', parent: '', status: 'active', needsRam: false },
        { id: 'CAT003', name: 'Mouse', code: 'MSE', parent: '', status: 'active', needsRam: false },
        { id: 'CAT004', name: 'Accessories', code: 'ACC', parent: '', status: 'active', needsRam: false },
        { id: 'CAT005', name: 'Gaming Laptops', code: 'GAM_LAP', parent: 'Laptops', status: 'active', needsRam: true },
        { id: 'CAT006', name: 'Business Laptops', code: 'BUS_LAP', parent: 'Laptops', status: 'active', needsRam: true },
        { id: 'CAT007', name: 'Student Laptops', code: 'STU_LAP', parent: 'Laptops', status: 'active', needsRam: true },
        { id: 'CAT008', name: 'Ultrabooks', code: 'ULT_LAP', parent: 'Laptops', status: 'active', needsRam: true },
        { id: 'CAT009', name: 'Wired Keyboards', code: 'WIR_KEYB', parent: 'Keyboards', status: 'active', needsRam: false },
        { id: 'CAT010', name: 'Wireless Keyboards', code: 'WRL_KEYB', parent: 'Keyboards', status: 'active', needsRam: false },
        { id: 'CAT011', name: 'Bluetooth Keyboards', code: 'BT_KEYB', parent: 'Keyboards', status: 'active', needsRam: false },
        { id: 'CAT012', name: 'Laptop Keyboards', code: 'LAP_KEYB', parent: 'Keyboards', status: 'active', needsRam: false },
        { id: 'CAT013', name: 'Desktop Keyboards', code: 'DESK_KEYB', parent: 'Keyboards', status: 'active', needsRam: false },
        { id: 'CAT014', name: 'Wired Mouse', code: 'WIR_MSE', parent: 'Mouse', status: 'active', needsRam: false },
        { id: 'CAT015', name: 'Wireless Mouse', code: 'WRL_MSE', parent: 'Mouse', status: 'active', needsRam: false },
        { id: 'CAT016', name: 'Bluetooth Mouse', code: 'BT_MSE', parent: 'Mouse', status: 'active', needsRam: false },
        { id: 'CAT017', name: 'Standard Mouse', code: 'STD_MSE', parent: 'Mouse', status: 'active', needsRam: false },
        { id: 'CAT018', name: 'Gaming Mouse', code: 'GAM_MSE', parent: 'Mouse', status: 'active', needsRam: false },
        { id: 'CAT019', name: 'Laptop Bags', code: 'LAP_BAG', parent: 'Accessories', status: 'active', needsRam: false },
        { id: 'CAT020', name: 'Mouse Pads', code: 'MSE_PAD', parent: 'Accessories', status: 'active', needsRam: false },
        { id: 'CAT021', name: 'USB Hubs', code: 'USB_HUB', parent: 'Accessories', status: 'active', needsRam: false },
        { id: 'CAT022', name: 'Laptop Stands', code: 'LAP_STAND', parent: 'Accessories', status: 'active', needsRam: false },
        { id: 'CAT023', name: 'Screen Protectors', code: 'SCR_PROT', parent: 'Accessories', status: 'active', needsRam: false }
    ];
    localStorage.setItem('categories', JSON.stringify(categories));
}

/* DOM Elements */
const tableBody = document.getElementById('products-table-body');
const selectAll = document.getElementById('select-all');
const bulkDelete = document.getElementById('bulk-delete');
const bulkUpload = document.getElementById('bulk-upload');
const exportCsv = document.getElementById('export-csv');
const exportExcel = document.getElementById('export-excel');
const filterName = document.getElementById('filter-name');
const filterCategory = document.getElementById('filter-category');
const filterSubcategory = document.getElementById('filter-subcategory');
const filterMinPrice = document.getElementById('filter-min-price');
const filterMaxPrice = document.getElementById('filter-max-price');
const viewModal = document.getElementById('view-product-modal');
const viewContent = document.getElementById('view-product-content');
const closeViewModal = document.getElementById('close-view-modal');

/* Init */
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    populateFilters();
    setupEventListeners();
});

/* Render Table */
function renderProducts() {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const filtered = getFilteredProducts();

    filtered.forEach(p => {
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-orange-50 transition';
        row.innerHTML = `
            <td class="py-3 px-2 text-center">
                <input type="checkbox" class="row-checkbox" data-id="${p.id}">
            </td>
            <td class="py-3 px-4 text-sm">${p.id}</td>
            <td class="py-3 px-4 text-sm font-medium">${p.name}</td>
            <td class="py-3 px-4"><img src="${p.mainImage}" alt="" class="img-thumb"></td>
            <td class="py-3 px-4">
                <div class="sub-images">
                    ${p.subImages && p.subImages.length > 0 
                        ? p.subImages.map(img => `<img src="${img}" alt="">`).join('') 
                        : '<span class="text-gray-400 text-xs">No images</span>'
                    }
                </div>
            </td>
            <td class="py-3 px-4 text-sm">${p.category}</td>
            <td class="py-3 px-4 text-sm">${p.subcategory || '-'}</td>
            <td class="py-3 px-4 text-sm">${p.ram || '-'}</td>
            <td class="py-3 px-4 text-sm"><del>₹${p.oldPrice}</del></td>
            <td class="py-3 px-4 text-sm font-semibold text-green-600">₹${p.newPrice}</td>
            <td class="py-3 px-4 text-sm ${p.stock < 10 ? 'text-red-600 font-semibold' : ''}">${p.stock}</td>
            <td class="py-3 px-4 text-sm">
                <span class="px-2 py-1 rounded-full text-xs ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${p.status}
                </span>
            </td>
            <td class="py-3 px-4 text-sm space-x-2">
                <button class="text-blue-600 hover:text-blue-800 view-btn" data-id="${p.id}" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <a href="edit-product.html?id=${p.id}" class="text-orange-600 hover:text-orange-800" title="Edit">
                    <i class="fas fa-edit"></i>
                </a>
                <button class="text-red-600 hover:text-red-800 delete-btn" data-id="${p.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    attachRowEvents();
    updateBulkDeleteButton();
}

/* Show Product Details in Modal */
function showProductDetails(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const discount = product.oldPrice > 0 ? Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100) : 0;
    
    viewContent.innerHTML = `
        <div class="grid md:grid-cols-2 gap-6">
            <div>
                <img src="${product.mainImage}" alt="${product.name}" class="modal-img w-full">
                <div class="sub-gallery flex flex-wrap justify-center mt-4">
                    ${product.subImages && product.subImages.length > 0 
                        ? product.subImages.map(img => `<img src="${img}" alt="">`).join('') 
                        : '<p class="text-gray-500">No additional images</p>'
                    }
                </div>
            </div>
            <div class="space-y-4">
                <div><strong>Product ID:</strong> ${product.id}</div>
                <div><strong>Name:</strong> ${product.name}</div>
                <div><strong>Category:</strong> ${product.category} ${product.subcategory ? `> ${product.subcategory}` : ''}</div>
                <div><strong>RAM:</strong> ${product.ram || 'N/A'}</div>
                <div><strong>Old Price:</strong> <del>₹${product.oldPrice}</del></div>
                <div><strong>New Price:</strong> <span class="text-green-600 font-bold">₹${product.newPrice}</span></div>
                <div><strong>Discount:</strong> <span class="text-red-600 font-semibold">${discount}% OFF</span></div>
                <div><strong>Stock:</strong> ${product.stock} units</div>
                <div><strong>Status:</strong> <span class="px-2 py-1 rounded-full text-xs ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${product.status}</span></div>
                <div><strong>Created:</strong> ${new Date(product.createdAt).toLocaleDateString()}</div>
            </div>
        </div>

        <hr class="my-6">

        <div class="space-y-4">
            <div>
                <strong>Description:</strong>
                <p class="mt-2">${product.description || 'No description available.'}</p>
            </div>
        </div>
    `;

    viewModal.classList.remove('hidden');
}

/* Filters */
function getFilteredProducts() {
    return products.filter(p => {
        const nameMatch = !filterName.value || p.name.toLowerCase().includes(filterName.value.toLowerCase());
        const catMatch = !filterCategory.value || p.category === filterCategory.value;
        const subMatch = !filterSubcategory.value || (p.subcategory || '') === filterSubcategory.value;
        const minPrice = filterMinPrice.value ? parseFloat(filterMinPrice.value) : 0;
        const maxPrice = filterMaxPrice.value ? parseFloat(filterMaxPrice.value) : Infinity;
        const priceMatch = p.newPrice >= minPrice && p.newPrice <= maxPrice;
        return nameMatch && catMatch && subMatch && priceMatch;
    });
}

function populateFilters() {
    const cats = [...new Set(products.map(p => p.category))].sort();
    filterCategory.innerHTML = '<option value="">All Categories</option>';
    cats.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        filterCategory.appendChild(opt);
    });

    filterSubcategory.innerHTML = '<option value="">All Subcategories</option>';
    const subcats = [...new Set(products.map(p => p.subcategory).filter(Boolean))].sort();
    subcats.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.textContent = sub;
        filterSubcategory.appendChild(opt);
    });
}

/* Event Listeners */
function setupEventListeners() {
    [filterName, filterCategory, filterSubcategory, filterMinPrice, filterMaxPrice].forEach(el => {
        el.addEventListener('input', debounce(renderProducts, 300));
    });

    selectAll.addEventListener('change', () => {
        document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = selectAll.checked);
        updateBulkDeleteButton();
    });

    bulkDelete.addEventListener('click', () => {
        const selected = [...document.querySelectorAll('.row-checkbox:checked')].map(cb => cb.dataset.id);
        if (selected.length === 0) return;
        if (confirm(`Delete ${selected.length} products?`)) {
            products = products.filter(p => !selected.includes(p.id));
            localStorage.setItem('products', JSON.stringify(products));
            renderProducts();
        }
    });

    bulkUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = ev.target.result;
                let parsed;
                if (file.name.endsWith('.csv')) {
                    parsed = Papa.parse(data, { header: true }).data;
                } else {
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    parsed = XLSX.utils.sheet_to_json(sheet);
                }
                const newProducts = parsed.map((row, i) => ({
                    id: 'PROD' + String(products.length + i + 1).padStart(3, '0'),
                    name: row.name || 'Unknown',
                    category: row.category || 'Uncategorized',
                    subcategory: row.subcategory || '',
                    oldPrice: parseFloat(row.oldPrice) || 0,
                    newPrice: parseFloat(row.newPrice) || 0,
                    stock: parseInt(row.stock) || 0,
                    ram: row.ram || '',
                    mainImage: row.mainImage || 'https://via.placeholder.com/40',
                    subImages: row.subImages ? row.subImages.split(',').map(s => s.trim()) : [],
                    status: 'active',
                    createdAt: new Date().toISOString()
                }));
                products.push(...newProducts);
                localStorage.setItem('products', JSON.stringify(products));
                alert(`${newProducts.length} products uploaded!`);
                renderProducts();
            } catch (err) {
                alert('Error uploading file: ' + err.message);
            }
        };
        reader.readAsBinaryString(file);
    });

    exportCsv.addEventListener('click', () => {
        const csv = Papa.unparse(products);
        downloadFile(csv, 'products.csv', 'text/csv');
    });

    exportExcel.addEventListener('click', () => {
        const ws = XLSX.utils.json_to_sheet(products);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        XLSX.writeFile(wb, "products.xlsx");
    });

    // Category Modal
    const modal = document.getElementById('add-category-modal');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const closeModal = document.getElementById('close-category-modal');
    const cancelBtn = document.getElementById('cancel-category');
    const form = document.getElementById('add-category-form');
    const parentSelect = document.getElementById('parent-category');

    addCategoryBtn?.addEventListener('click', () => modal.classList.remove('hidden'));
    [closeModal, cancelBtn].forEach(b => b?.addEventListener('click', () => {
        modal.classList.add('hidden'); form.reset();
    }));
    modal.addEventListener('click', e => e.target === modal && modal.classList.add('hidden'));
    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('category-name').value.trim();
        if (!name) return alert('Name required');
        
        // Check if category needs RAM (only laptops and their subcategories)
        const needsRam = name.toLowerCase().includes('laptop');
        
        categories.push({
            id: 'CAT' + String(categories.length + 1).padStart(3, '0'),
            name, 
            code: document.getElementById('category-code').value.trim(),
            parent: parentSelect.value, 
            status: document.getElementById('category-status').value,
            needsRam: needsRam
        });
        localStorage.setItem('categories', JSON.stringify(categories));
        alert('Category added');
        modal.classList.add('hidden'); 
        form.reset();
        populateParentCategories();
    });

    function populateParentCategories() {
        parentSelect.innerHTML = '<option value="">None (Top Level)</option>';
        categories.filter(c => c.status === 'active' && !c.parent).forEach(c => {
            const opt = new Option(c.name, c.name);
            parentSelect.appendChild(opt);
        });
    }
    populateParentCategories();
}

/* Row Events */
function attachRowEvents() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => showProductDetails(btn.dataset.id);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = () => {
            if (confirm('Delete product?')) {
                products = products.filter(p => p.id !== btn.dataset.id);
                localStorage.setItem('products', JSON.stringify(products));
                renderProducts();
            }
        };
    });

    document.querySelectorAll('.row-checkbox').forEach(cb => {
        cb.addEventListener('change', updateBulkDeleteButton);
    });
}

function updateBulkDeleteButton() {
    const checked = document.querySelectorAll('.row-checkbox:checked').length;
    bulkDelete.disabled = checked === 0;
    bulkDelete.textContent = checked > 0 ? `Delete (${checked})` : 'Delete';
    selectAll.checked = checked > 0 && checked === document.querySelectorAll('.row-checkbox').length;
}

closeViewModal.onclick = () => viewModal.classList.add('hidden');
viewModal.addEventListener('click', e => e.target === viewModal && viewModal.classList.add('hidden'));

/* Utilities */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    a.click(); URL.revokeObjectURL(url);
}

// Listen for storage changes to update products in real-time
window.addEventListener('storage', (e) => {
    if (e.key === 'products') {
        products = JSON.parse(e.newValue || '[]');
        renderProducts();
        populateFilters();
    }
});