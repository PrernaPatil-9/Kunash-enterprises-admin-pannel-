/* ===============================================
   Inventory Management Page
   File: assets/js/inventory.js
   Updated with Dynamic Category, Subcategory and RAM Fields
   =============================================== */

document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('inventory.html')) return;

    const LOW_THRESHOLD = 10;
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    let categories = JSON.parse(localStorage.getItem('categories') || '[]');
    let currentEditingProduct = null;

    // Initialize categories if empty (same as add product page)
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

    // ===============================================
    // Initialize
    // ===============================================
    function init() {
        updateStats();
        populateCategoryFilter();
        populateAddStockCategories();
        renderTable();
        setupEventListeners();
    }

    // ===============================================
    // Update Stats
    // ===============================================
    function updateStats() {
        const total = products.reduce(function(sum, p) { 
            return sum + (parseInt(p.stock) || 0); 
        }, 0);
        
        const low = products.filter(function(p) { 
            const stock = parseInt(p.stock) || 0;
            return stock > 0 && stock <= LOW_THRESHOLD; 
        }).length;
        
        const out = products.filter(function(p) { 
            return (parseInt(p.stock) || 0) === 0; 
        }).length;
        
        const restock = products.filter(function(p) { 
            return (parseInt(p.stock) || 0) <= LOW_THRESHOLD; 
        }).length;

        document.getElementById('total-stock').textContent = total.toLocaleString();
        document.getElementById('low-stock').textContent = low;
        document.getElementById('out-stock').textContent = out;
        document.getElementById('restock-needed').textContent = restock;
    }

    // ===============================================
    // Populate Category Filter
    // ===============================================
    function populateCategoryFilter() {
        const filter = document.getElementById('filter-category');
        if (!filter) return;

        // Get unique categories from products
        const uniqueCategories = [];
        products.forEach(function(product) {
            if (product.category && !uniqueCategories.includes(product.category)) {
                uniqueCategories.push(product.category);
            }
        });

        uniqueCategories.sort().forEach(function(category) {
            var option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filter.appendChild(option);
        });
    }

    // ===============================================
    // Populate Add Stock Categories
    // ===============================================
    function populateAddStockCategories() {
        const categorySelect = document.getElementById('product-category');
        if (!categorySelect) return;

        categorySelect.innerHTML = '<option value="">Select Category</option>';
        
        // Get main categories (without parent)
        const mainCategories = categories.filter(function(c) {
            return c.status === 'active' && !c.parent;
        });

        mainCategories.forEach(function(category) {
            var option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name + ' (' + category.code + ')';
            categorySelect.appendChild(option);
        });
    }

    // ===============================================
    // Populate Subcategories based on selected category
    // ===============================================
    function populateSubcategories(selectedCategory) {
        const subcategorySelect = document.getElementById('product-subcategory');
        const ramField = document.getElementById('ram-field');
        
        if (!subcategorySelect) return;

        subcategorySelect.innerHTML = '<option value="">Select Subcategory (Optional)</option>';
        
        // Show/hide RAM field based on category needs
        const selectedCat = categories.find(function(c) {
            return c.name === selectedCategory;
        });
        
        if (ramField) {
            if (selectedCat && selectedCat.needsRam) {
                ramField.style.display = 'block';
            } else {
                ramField.style.display = 'none';
                // Clear RAM selection when hidden
                document.getElementById('product-ram').value = '';
            }
        }

        if (!selectedCategory) return;

        // Get subcategories for selected category
        const subCategories = categories.filter(function(c) {
            return c.parent === selectedCategory && c.status === 'active';
        });

        subCategories.forEach(function(subcategory) {
            var option = document.createElement('option');
            option.value = subcategory.name;
            option.textContent = subcategory.name + ' (' + subcategory.code + ')';
            subcategorySelect.appendChild(option);
        });
    }

    // ===============================================
    // Render Table
    // ===============================================
    function renderTable() {
        const tbody = document.getElementById('inventory-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-8 text-center text-gray-500">
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

        products.forEach(function(p) {
            const stock = parseInt(p.stock) || 0;
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
                            ${p.mainImage ? 
                                `<img src="${p.mainImage}" alt="${p.name}" class="h-8 w-8 rounded object-cover img-thumb">` :
                                `<span class="text-orange-500 font-semibold">${(p.name || '').charAt(0).toUpperCase()}</span>`
                            }
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900">${p.name || 'Unnamed Product'}</div>
                            <div class="text-sm text-gray-500">ID: ${p.id || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.category || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.subcategory || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.ram || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${stock}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="flex flex-col">
                        ${p.oldPrice ? `<del class="text-gray-400">₹${p.oldPrice}</del>` : ''}
                        <span class="text-green-600 font-semibold">₹${p.newPrice || '0'}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <!-- Update Stock -->
                    <button class="text-orange-600 hover:text-orange-900 update-stock" data-id="${p.id}" title="Update Stock">
                        <span class="material-icons text-lg align-middle">inventory_2</span>
                    </button>
                    <!-- View Details -->
                    <button class="text-blue-600 hover:text-blue-900 view-stock" data-id="${p.id}" title="View Details">
                        <span class="material-icons text-lg align-middle">visibility</span>
                    </button>
                    <!-- Edit Product -->
                    <a href="edit-product.html?id=${p.id}" class="text-green-600 hover:text-green-900" title="Edit Product">
                        <span class="material-icons text-lg align-middle">edit</span>
                    </a>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ===============================================
    // Filter Products
    // ===============================================
    function filterProducts() {
        const searchTerm = document.getElementById('search-inventory').value.toLowerCase();
        const categoryFilter = document.getElementById('filter-category').value;
        const statusFilter = document.getElementById('filter-status').value;

        document.querySelectorAll('#inventory-body tr').forEach(function(tr) {
            const productName = tr.querySelector('td:first-child .text-sm.font-medium')?.textContent.toLowerCase() || '';
            const category = tr.querySelector('td:nth-child(2)')?.textContent || '';
            const stock = parseInt(tr.querySelector('td:nth-child(5)')?.textContent) || 0;
            
            let statusMatch = true;
            if (statusFilter === 'in-stock') {
                statusMatch = stock > LOW_THRESHOLD;
            } else if (statusFilter === 'low-stock') {
                statusMatch = stock > 0 && stock <= LOW_THRESHOLD;
            } else if (statusFilter === 'out-of-stock') {
                statusMatch = stock === 0;
            }

            const categoryMatch = !categoryFilter || category === categoryFilter;
            const searchMatch = !searchTerm || productName.includes(searchTerm);
            
            tr.style.display = (searchMatch && categoryMatch && statusMatch) ? '' : 'none';
        });
    }

    // ===============================================
    // Image to Base64
    // ===============================================
    function fileToBase64(file) {
        return new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function() {
                resolve(reader.result);
            };
            reader.onerror = function() {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
    }

    // ===============================================
    // Add Stock Modal Functions
    // ===============================================
    function openAddStockModal() {
        const modal = document.getElementById('add-stock-modal');
        if (!modal) return;

        // Reset form
        document.getElementById('add-stock-form').reset();
        document.getElementById('main-image-preview').innerHTML = '';
        document.getElementById('sub-images-preview').innerHTML = '';
        document.getElementById('ram-field').style.display = 'none';
        document.getElementById('product-subcategory').innerHTML = '<option value="">Select Subcategory (Optional)</option>';
        
        // Show modal
        modal.classList.remove('hidden');
    }

    function closeAddStockModal() {
        const modal = document.getElementById('add-stock-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // ===============================================
    // Update Stock Modal Functions
    // ===============================================
    function openUpdateStockModal(product) {
        currentEditingProduct = product;
        const modal = document.getElementById('update-stock-modal');
        const title = document.getElementById('update-modal-title');
        const productName = document.getElementById('update-modal-product-name');
        const currentStock = document.getElementById('update-modal-current-stock');
        
        if (!modal || !title || !productName || !currentStock) return;

        // Set modal content
        title.textContent = 'Update Stock - ' + (product.name || 'Product');
        productName.textContent = product.name || 'Unnamed Product';
        currentStock.textContent = (parseInt(product.stock) || 0) + ' units';
        
        // Reset form
        document.getElementById('new-stock').value = product.stock || 0;
        document.getElementById('stock-action').value = 'update';
        document.getElementById('stock-reason').value = '';
        
        // Show modal
        modal.classList.remove('hidden');
    }

    function closeUpdateStockModal() {
        const modal = document.getElementById('update-stock-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        currentEditingProduct = null;
    }

    // ===============================================
    // Image Preview Functions
    // ===============================================
    function setupImagePreviews() {
        // Main image preview
        var mainImageInput = document.getElementById('main-image');
        if (mainImageInput) {
            mainImageInput.addEventListener('change', function() {
                var file = this.files[0];
                var preview = document.getElementById('main-image-preview');
                if (!file || !preview) return;
                
                fileToBase64(file).then(function(base64) {
                    preview.innerHTML = '<img src="' + base64 + '" class="img-preview">';
                }).catch(function(error) {
                    console.error('Error loading main image:', error);
                    alert('Error loading image: ' + error.message);
                });
            });
        }

        // Sub images preview
        var subImagesInput = document.getElementById('sub-images');
        if (subImagesInput) {
            subImagesInput.addEventListener('change', function() {
                var preview = document.getElementById('sub-images-preview');
                if (!preview) return;
                
                var files = Array.from(this.files);
                preview.innerHTML = '';
                
                files.forEach(function(file) {
                    fileToBase64(file).then(function(base64) {
                        var wrapper = document.createElement('div');
                        wrapper.className = 'relative';
                        wrapper.innerHTML = '<img src="' + base64 + '" class="sub-img-preview"><div class="remove-img">×</div>';
                        preview.appendChild(wrapper);
                        
                        // Add remove functionality
                        var removeBtn = wrapper.querySelector('.remove-img');
                        if (removeBtn) {
                            removeBtn.onclick = function() {
                                wrapper.remove();
                            };
                        }
                    }).catch(function(error) {
                        console.error('Error loading sub image:', error);
                    });
                });
            });
        }
    }

    // ===============================================
    // Save New Stock
    // ===============================================
    function saveNewStock() {
        var mainImageFile = document.getElementById('main-image').files[0];
        if (!mainImageFile) {
            alert('Main image is required!');
            return;
        }

        var productName = document.getElementById('product-name').value.trim();
        var category = document.getElementById('product-category').value;
        var subcategory = document.getElementById('product-subcategory').value;
        var quantity = parseInt(document.getElementById('product-quantity').value);
        var cost = parseFloat(document.getElementById('product-cost').value);
        var stockStatus = document.getElementById('product-stock-status').value;
        var productStatus = document.getElementById('product-status').value;
        var ram = document.getElementById('product-ram').value;
        var description = document.getElementById('product-description').value.trim();

        // Validation
        if (!productName || !category || isNaN(quantity) || isNaN(cost)) {
            alert('Please fill all required fields correctly.');
            return;
        }

        if (quantity < 0 || cost < 0) {
            alert('Quantity and cost must be positive values.');
            return;
        }

        // Process images
        fileToBase64(mainImageFile).then(function(mainImage) {
            var subImagePromises = [];
            var subImagesInput = document.getElementById('sub-images');
            if (subImagesInput && subImagesInput.files) {
                var subFiles = Array.from(subImagesInput.files);
                subImagePromises = subFiles.map(function(file) {
                    return fileToBase64(file);
                });
            }
            
            return Promise.all([mainImage, Promise.all(subImagePromises)]);
        }).then(function(results) {
            var mainImage = results[0];
            var subImages = results[1] || [];

            // Generate product ID
            var maxId = 0;
            products.forEach(function(p) {
                var num = parseInt(p.id.replace('PROD', '')) || 0;
                if (num > maxId) maxId = num;
            });
            var newId = 'PROD' + String(maxId + 1).padStart(3, '0');

            // Create new product
            var newProduct = {
                id: newId,
                name: productName,
                category: category,
                subcategory: subcategory || '',
                stock: quantity,
                newPrice: cost,
                oldPrice: 0,
                mainImage: mainImage,
                subImages: subImages,
                ram: ram || '',
                status: productStatus,
                description: description,
                createdAt: new Date().toISOString()
            };

            // Add to products array
            products.push(newProduct);
            saveAndRefresh();
            closeAddStockModal();
            
            alert('Product added successfully!\n\nProduct: ' + productName + '\nStock: ' + quantity + ' units\nPrice: ₹' + cost);
        }).catch(function(error) {
            console.error('Error adding product:', error);
            alert('Error adding product: ' + error.message);
        });
    }

    // ===============================================
    // Update Stock
    // ===============================================
    function updateStock() {
        if (!currentEditingProduct) return;

        var newStockInput = document.getElementById('new-stock');
        var actionType = document.getElementById('stock-action').value;
        var reason = document.getElementById('stock-reason').value.trim();
        
        if (!newStockInput) return;

        var newStock = parseInt(newStockInput.value);
        var currentStock = parseInt(currentEditingProduct.stock) || 0;

        if (isNaN(newStock) || newStock < 0) {
            alert('Please enter a valid stock quantity');
            return;
        }

        // Apply action type
        if (actionType === 'add') {
            newStock = currentStock + newStock;
        } else if (actionType === 'remove') {
            newStock = currentStock - newStock;
            if (newStock < 0) {
                alert('Cannot remove more stock than available');
                return;
            }
        }

        // Update product stock
        var productIndex = products.findIndex(function(p) {
            return p.id === currentEditingProduct.id;
        });

        if (productIndex !== -1) {
            products[productIndex].stock = newStock;
            products[productIndex].updatedAt = new Date().toISOString();
            
            // Add stock history entry
            if (!products[productIndex].stockHistory) {
                products[productIndex].stockHistory = [];
            }
            
            products[productIndex].stockHistory.push({
                date: new Date().toISOString(),
                previousStock: currentStock,
                newStock: newStock,
                action: actionType,
                reason: reason,
                changedBy: 'Admin'
            });

            saveAndRefresh();
            closeUpdateStockModal();
            
            // Show success message
            alert('Stock updated successfully!\n\nProduct: ' + currentEditingProduct.name + '\nNew Stock: ' + newStock + ' units');
        }
    }

    // ===============================================
    // View Product Details
    // ===============================================
    function viewProductDetails(product) {
        var discount = product.oldPrice ? Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100) : 0;
        
        var details = `
Product Details:

Name: ${product.name || 'N/A'}
ID: ${product.id || 'N/A'}
Category: ${product.category || 'N/A'}
Subcategory: ${product.subcategory || 'N/A'}
RAM: ${product.ram || 'N/A'}

Pricing:
Old Price: ${product.oldPrice ? '₹' + product.oldPrice : 'N/A'}
New Price: ₹${product.newPrice || '0'}
${discount > 0 ? 'Discount: ' + discount + '% OFF' : ''}

Stock Information:
Current Stock: ${product.stock || 0} units
Status: ${(parseInt(product.stock) || 0) === 0 ? 'Out of Stock' : 
          (parseInt(product.stock) || 0) <= LOW_THRESHOLD ? 'Low Stock' : 'In Stock'}

Created: ${product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
${product.updatedAt ? 'Last Updated: ' + new Date(product.updatedAt).toLocaleDateString() : ''}
        `.trim();

        alert(details);
    }

    // ===============================================
    // Event Listeners Setup
    // ===============================================
    function setupEventListeners() {
        // Search and filter events
        var searchInput = document.getElementById('search-inventory');
        var categoryFilter = document.getElementById('filter-category');
        var statusFilter = document.getElementById('filter-status');
        
        if (searchInput) searchInput.addEventListener('input', filterProducts);
        if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
        if (statusFilter) statusFilter.addEventListener('change', filterProducts);

        // Add stock button
        var addStockBtn = document.getElementById('add-stock-btn');
        if (addStockBtn) {
            addStockBtn.addEventListener('click', openAddStockModal);
        }

        // Category change for subcategories and RAM field
        var productCategory = document.getElementById('product-category');
        if (productCategory) {
            productCategory.addEventListener('change', function() {
                populateSubcategories(this.value);
            });
        }

        // Modal events - Add Stock
        var cancelAddStock = document.getElementById('cancel-add-stock');
        var saveNewStockBtn = document.getElementById('save-new-stock');
        var addStockModal = document.getElementById('add-stock-modal');
        
        if (cancelAddStock) cancelAddStock.addEventListener('click', closeAddStockModal);
        if (saveNewStockBtn) saveNewStockBtn.addEventListener('click', saveNewStock);
        if (addStockModal) {
            addStockModal.addEventListener('click', function(e) {
                if (e.target.id === 'add-stock-modal') {
                    closeAddStockModal();
                }
            });
        }

        // Modal events - Update Stock
        var cancelUpdateStock = document.getElementById('cancel-update-stock');
        var saveStockUpdate = document.getElementById('save-stock-update');
        var updateStockModal = document.getElementById('update-stock-modal');
        
        if (cancelUpdateStock) cancelUpdateStock.addEventListener('click', closeUpdateStockModal);
        if (saveStockUpdate) saveStockUpdate.addEventListener('click', updateStock);
        if (updateStockModal) {
            updateStockModal.addEventListener('click', function(e) {
                if (e.target.id === 'update-stock-modal') {
                    closeUpdateStockModal();
                }
            });
        }

        // Setup image previews
        setupImagePreviews();

        // Table action buttons
        document.addEventListener('click', function(e) {
            var btn = e.target.closest('button');
            if (!btn) return;

            var productId = btn.dataset.id;
            var product = products.find(function(p) { return p.id == productId; });
            if (!product) return;

            // UPDATE STOCK
            if (btn.classList.contains('update-stock')) {
                openUpdateStockModal(product);
            }

            // VIEW DETAILS
            if (btn.classList.contains('view-stock')) {
                viewProductDetails(product);
            }
        });

        // Listen for product updates from other pages
        window.addEventListener('storage', function(e) {
            if (e.key === 'products') {
                try {
                    products = JSON.parse(e.newValue || '[]');
                    updateStats();
                    populateCategoryFilter();
                    renderTable();
                } catch (error) {
                    console.error('Error updating products:', error);
                }
            }
        });

        // Listen for category updates
        window.addEventListener('storage', function(e) {
            if (e.key === 'categories') {
                try {
                    categories = JSON.parse(e.newValue || '[]');
                    populateAddStockCategories();
                } catch (error) {
                    console.error('Error updating categories:', error);
                }
            }
        });
    }

    // ===============================================
    // Save to localStorage & Re-render
    // ===============================================
    function saveAndRefresh() {
        try {
            localStorage.setItem('products', JSON.stringify(products));
            updateStats();
            populateCategoryFilter();
            renderTable();
        } catch (error) {
            console.error('Error saving products:', error);
            alert('Error saving data. Please try again.');
        }
    }

    // ===============================================
    // Initialize
    // ===============================================
    init();
});