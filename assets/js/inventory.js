/* ===============================================
   Inventory Management Page
   File: assets/js/inventory.js
   =============================================== */
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('inventory.html')) return;

    const LOW_THRESHOLD = 10;
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    let currentEditingProduct = null;

    // ===============================================
    // Update Stats
    // ===============================================
    function updateStats() {
        const total = products.reduce((s, p) => s + (p.stock || 0), 0);
        const low = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= LOW_THRESHOLD).length;
        const out = products.filter(p => (p.stock || 0) === 0).length;
        const restock = products.filter(p => (p.stock || 0) <= LOW_THRESHOLD).length;

        document.getElementById('total-stock').textContent = total;
        document.getElementById('low-stock').textContent = low;
        document.getElementById('out-stock').textContent = out;
        document.getElementById('restock-needed').textContent = restock;
    }

    // ===============================================
    // Render Table
    // ===============================================
    function renderTable() {
        const tbody = document.getElementById('inventory-body');
        tbody.innerHTML = '';

        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <span class="material-icons text-4xl text-gray-300 mb-2">inventory_2</span>
                            <p class="text-lg">No products found</p>
                            <p class="text-sm">Click "Add Stock" to add your first product</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        products.forEach(p => {
            const stock = p.stock || 0;
            const rowClass = stock === 0 ? 'stock-out' : (stock <= LOW_THRESHOLD ? 'stock-low' : '');
            const status = stock === 0 ? 'Out of Stock' :
                           stock <= LOW_THRESHOLD ? 'Low Stock' : 'In Stock';
            const statusClass = stock === 0 ? 'bg-red-100 text-red-800' :
                                stock <= LOW_THRESHOLD ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800';

            const tr = document.createElement('tr');
            tr.className = rowClass;
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-md flex items-center justify-center mr-3">
                            ${p.image ? 
                                `<img src="${p.image}" alt="${p.name}" class="h-8 w-8 rounded object-cover">` :
                                `<span class="text-orange-500 font-semibold">${p.name.charAt(0).toUpperCase()}</span>`
                            }
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900">${p.name}</div>
                            ${p.price ? `<div class="text-sm text-gray-500">$${p.price}</div>` : ''}
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.category || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${stock}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${LOW_THRESHOLD}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <!-- View -->
                    <button class="text-blue-600 hover:text-blue-900 view-stock" data-id="${p.id}" title="View Details">
                        <span class="material-icons text-lg align-middle">visibility</span>
                    </button>
                    <!-- Edit -->
                    <button class="text-orange-600 hover:text-orange-900 edit-stock" data-id="${p.id}" title="Edit Product">
                        <span class="material-icons text-lg align-middle">edit</span>
                    </button>
                    <!-- Delete -->
                    <button class="text-red-600 hover:text-red-900 delete-stock" data-id="${p.id}" title="Delete Product">
                        <span class="material-icons text-lg align-middle">delete</span>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ===============================================
    // Modal Functions
    // ===============================================
    function openStockModal(product = null) {
        currentEditingProduct = product;
        const modal = document.getElementById('stock-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('stock-form');
        
        // Set modal title
        title.textContent = product ? 'Edit Product' : 'Add New Product';
        
        // Reset form
        form.reset();
        resetImagePreview();
        
        // Fill form if editing
        if (product) {
            document.getElementById('product-name').value = product.name || '';
            document.getElementById('product-category').value = product.category || '';
            document.getElementById('product-stock').value = product.stock || 0;
            document.getElementById('product-price').value = product.price || '';
            document.getElementById('product-description').value = product.description || '';
            
            if (product.image) {
                displayImagePreview(product.image);
            }
        }
        
        // Show modal
        modal.classList.remove('hidden');
    }

    function closeStockModal() {
        document.getElementById('stock-modal').classList.add('hidden');
        currentEditingProduct = null;
    }

    function resetImagePreview() {
        const preview = document.getElementById('image-preview');
        preview.innerHTML = '<span class="text-gray-400 text-sm">No image</span>';
    }

    function displayImagePreview(imageUrl) {
        const preview = document.getElementById('image-preview');
        preview.innerHTML = `<img src="${imageUrl}" alt="Preview" class="w-full h-full object-cover">`;
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file (JPG, PNG, GIF)');
                return;
            }
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                displayImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    function saveProduct() {
        const name = document.getElementById('product-name').value.trim();
        const category = document.getElementById('product-category').value;
        const stock = parseInt(document.getElementById('product-stock').value);
        const price = document.getElementById('product-price').value ? parseFloat(document.getElementById('product-price').value) : null;
        const description = document.getElementById('product-description').value.trim();
        
        // Get image data
        const imagePreview = document.getElementById('image-preview');
        const image = imagePreview.querySelector('img') ? imagePreview.querySelector('img').src : null;

        // Validation
        if (!name) {
            alert('Please enter product name');
            return;
        }
        
        if (!category) {
            alert('Please select a category');
            return;
        }
        
        if (isNaN(stock) || stock < 0) {
            alert('Please enter a valid stock quantity');
            return;
        }

        if (currentEditingProduct) {
            // Update existing product
            const index = products.findIndex(p => p.id === currentEditingProduct.id);
            if (index !== -1) {
                products[index] = {
                    ...products[index],
                    name,
                    category,
                    stock,
                    price,
                    description,
                    image: image || products[index].image
                };
            }
        } else {
            // Add new product
            const newProduct = {
                id: Date.now().toString(),
                name,
                category,
                stock,
                price,
                description,
                image,
                createdAt: new Date().toISOString()
            };
            products.push(newProduct);
        }

        saveAndRefresh();
        closeStockModal();
        
        // Show success message
        alert(`Product "${name}" ${currentEditingProduct ? 'updated' : 'added'} successfully!`);
    }

    // ===============================================
    // Search Functionality
    // ===============================================
    document.getElementById('search-inventory').addEventListener('input', e => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('#inventory-body tr').forEach(tr => {
            const txt = tr.textContent.toLowerCase();
            tr.style.display = txt.includes(term) ? '' : 'none';
        });
    });

    // ===============================================
    // Event Listeners for Modal
    // ===============================================
    document.getElementById('add-stock-btn').addEventListener('click', () => {
        openStockModal();
    });

    document.getElementById('cancel-modal').addEventListener('click', closeStockModal);

    document.getElementById('save-product').addEventListener('click', saveProduct);

    document.getElementById('browse-image').addEventListener('click', () => {
        document.getElementById('product-image').click();
    });

    document.getElementById('product-image').addEventListener('change', handleImageUpload);

    // Close modal when clicking outside
    document.getElementById('stock-modal').addEventListener('click', (e) => {
        if (e.target.id === 'stock-modal') {
            closeStockModal();
        }
    });

    // ===============================================
    // Action Buttons: View / Edit / Delete
    // ===============================================
    document.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const id = btn.dataset.id;
        const product = products.find(p => p.id == id);
        if (!product) return;

        // VIEW
        if (btn.classList.contains('view-stock')) {
            const desc = product.description ? product.description : 'No description';
            const price = product.price ? `$${product.price}` : 'Not set';
            const category = product.category || 'Not set';
            
            alert(
                `Product Details\n\n` +
                `Name: ${product.name}\n` +
                `Category: ${category}\n` +
                `Price: ${price}\n` +
                `Stock: ${product.stock || 0}\n` +
                `Description: ${desc}`
            );
        }

        // EDIT
        if (btn.classList.contains('edit-stock')) {
            openStockModal(product);
        }

        // DELETE
        if (btn.classList.contains('delete-stock')) {
            if (confirm(`Delete "${product.name}" permanently? This cannot be undone.`)) {
                products = products.filter(p => p.id != id);
                saveAndRefresh();
                alert(`Product "${product.name}" has been deleted.`);
            }
        }
    });

    // ===============================================
    // Save to localStorage & Re-render
    // ===============================================
    function saveAndRefresh() {
        localStorage.setItem('products', JSON.stringify(products));
        updateStats();
        renderTable();
    }

    // ===============================================
    // Initialize
    // ===============================================
    updateStats();
    renderTable();
});