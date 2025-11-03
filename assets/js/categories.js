document.addEventListener('DOMContentLoaded', () => {
    let categories = JSON.parse(localStorage.getItem('categories') || '[]');
    let editingCategoryId = null;

    // Allowed electronics-related category names
    const allowedCategories = [
        'Audio', 'Laptops', 'Monitors', 'Keyboards', 'Mice',
        'PCs', 'Accessories', 'Peripherals', 'Components', 'Gadgets'
    ];

    // Show notification
    const showNotification = (message, type) => {
        const notification = document.getElementById('notification');
        if (!notification) return;
        notification.textContent = message;
        notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white animate-fadeIn ${
            type === 'success' ? 'bg-orange-600' :
            type === 'error' ? 'bg-red-600' :
            'bg-blue-600'
        }`;
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    };

    // Clean categories (remove non-electronics)
    const cleanCategories = () => {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        categories = categories.filter(cat => 
            allowedCategories.includes(cat.name) && 
            !['Clothing', 'Home & Garden'].includes(cat.name)
        );

        // Reassign products with invalid categoryIds to a default electronics category
        const defaultCategory = categories.find(c => c.name === 'Accessories') || 
            { id: '999', name: 'Accessories', brand: null, price: 0, productCount: 0, createdAt: new Date().toISOString() };
        if (!categories.some(c => c.id === defaultCategory.id)) {
            categories.push(defaultCategory);
        }

        const updatedProducts = products.map(p => {
            if (!categories.some(c => c.id === p.categoryId) || 
                ['Clothing', 'Home & Garden'].some(name => p.categoryId === categories.find(c => c.name === name)?.id)) {
                return { ...p, categoryId: defaultCategory.id };
            }
            return p;
        });

        // Update product counts in categories
        categories.forEach(cat => {
            cat.productCount = updatedProducts.filter(p => p.categoryId === cat.id).length;
        });

        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('products', JSON.stringify(updatedProducts));
    };

    // Render categories table
    const renderCategories = () => {
        cleanCategories(); // Ensure non-electronics categories are removed
        const tableBody = document.querySelector('#categories-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        if (categories.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-500">No categories found</td></tr>';
            return;
        }

        categories.forEach(cat => {
            const row = `
                <tr class="border-b border-gray-200">
                    <td class="py-3 px-4">${cat.id}</td>
                    <td class="py-3 px-4">${cat.name}</td>
                    <td class="py-3 px-4">${cat.brand || 'N/A'}</td>
                    <td class="py-3 px-4">${cat.price ? `$${cat.price.toFixed(2)}` : 'N/A'}</td>
                    <td class="py-3 px-4">
                        <button onclick="editCategory('${cat.id}')" class="text-orange-600 hover:underline">Edit</button>
                        <button onclick="viewCategory('${cat.id}')" class="text-orange-600 hover:underline ml-2">View</button>
                        <button onclick="deleteCategory('${cat.id}')" class="text-red-600 hover:underline ml-2">Delete</button>
                    </td>
                </tr>`;
            tableBody.innerHTML += row;
        });
    };

    // Add or edit category
    const handleCategoryForm = (e) => {
        e.preventDefault();
        const form = e.target;
        const id = form['category-id'].value.trim();
        const name = form['category-name'].value.trim();
        const brand = form['category-brand'].value.trim();
        const price = parseFloat(form['category-price'].value) || 0;

        if (!id) {
            showNotification('Category ID is required', 'error');
            return;
        }

        if (!name) {
            showNotification('Category name is required', 'error');
            return;
        }

        if (!allowedCategories.includes(name)) {
            showNotification('Category must be electronics-related (e.g., Audio, Laptops, Monitors)', 'error');
            return;
        }

        if (editingCategoryId) {
            // Edit existing category
            const index = categories.findIndex(c => c.id === editingCategoryId);
            if (index !== -1) {
                categories[index] = {
                    ...categories[index],
                    id,
                    name,
                    brand: brand || null,
                    price,
                    updatedAt: new Date().toISOString()
                };
                showNotification('Category updated successfully', 'success');
            } else {
                showNotification('Category not found', 'error');
            }
        } else {
            // Check if ID already exists
            if (categories.some(c => c.id === id)) {
                showNotification('Category ID already exists', 'error');
                return;
            }
            
            // Add new category
            categories.push({
                id,
                name,
                brand: brand || null,
                price,
                productCount: 0,
                createdAt: new Date().toISOString()
            });
            showNotification('Category added successfully', 'success');
        }

        localStorage.setItem('categories', JSON.stringify(categories));
        renderCategories();
        closeCategoryModal();
        updateDashboardCounts();
    };

    // Edit category
    window.editCategory = (id) => {
        const category = categories.find(c => c.id === id);
        if (!category) {
            showNotification('Category not found', 'error');
            return;
        }

        editingCategoryId = id;
        document.getElementById('category-modal-title').textContent = 'Edit Category';
        document.getElementById('category-id').value = category.id;
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-brand').value = category.brand || '';
        document.getElementById('category-price').value = category.price || '';
        document.getElementById('category-modal').classList.remove('hidden');
    };

    // View category
    window.viewCategory = (id) => {
        const category = categories.find(c => c.id === id);
        if (!category) {
            showNotification('Category not found', 'error');
            return;
        }

        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const categoryProducts = products.filter(p => p.categoryId === id);
        const avgPrice = categoryProducts.length
            ? (categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length).toFixed(2)
            : 'N/A';

        const details = `
            <div class="space-y-2">
                <p><strong>ID:</strong> ${category.id}</p>
                <p><strong>Name:</strong> ${category.name}</p>
                <p><strong>Brand:</strong> ${category.brand || 'N/A'}</p>
                <p><strong>Price:</strong> ${category.price ? `$${category.price.toFixed(2)}` : 'N/A'}</p>
                <p><strong>Product Count:</strong> ${category.productCount}</p>
                <p><strong>Created At:</strong> ${new Date(category.createdAt).toLocaleString('en-US')}</p>
                ${category.updatedAt ? `<p><strong>Updated At:</strong> ${new Date(category.updatedAt).toLocaleString('en-US')}</p>` : ''}
            </div>
        `;

        document.getElementById('view-category-details').innerHTML = details;
        document.getElementById('view-category-modal').classList.remove('hidden');
    };

    // Delete category
    window.deleteCategory = (id) => {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        if (products.some(p => p.categoryId === id)) {
            showNotification('Cannot delete category with associated products', 'error');
            return;
        }

        if (confirm('Are you sure you want to delete this category?')) {
            categories = categories.filter(c => c.id !== id);
            localStorage.setItem('categories', JSON.stringify(categories));
            renderCategories();
            showNotification('Category deleted successfully', 'success');
            updateDashboardCounts();
        }
    };

    // Close category modal
    const closeCategoryModal = () => {
        document.getElementById('category-modal').classList.add('hidden');
        document.getElementById('category-form').reset();
        editingCategoryId = null;
        document.getElementById('category-modal-title').textContent = 'Add Category';
    };

    // Close view category modal
    const closeViewCategoryModal = () => {
        document.getElementById('view-category-modal').classList.add('hidden');
    };

    // Update dashboard counts
    const updateDashboardCounts = () => {
        if (document.querySelector('#total-products')) {
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            document.querySelector('#total-products').textContent = products.length;
        }
        if (document.querySelector('#total-categories')) {
            document.querySelector('#total-categories').textContent = categories.length;
        }
    };

    // Setup event listeners
    const setupEventListeners = () => {
        document.getElementById('add-category-btn')?.addEventListener('click', () => {
            editingCategoryId = null;
            document.getElementById('category-modal-title').textContent = 'Add Category';
            document.getElementById('category-form').reset();
            document.getElementById('category-modal').classList.remove('hidden');
        });

        document.getElementById('category-form')?.addEventListener('submit', handleCategoryForm);

        document.getElementById('cancel-category')?.addEventListener('click', closeCategoryModal);

        document.getElementById('close-view-category')?.addEventListener('click', closeViewCategoryModal);

        document.getElementById('view-category-modal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('view-category-modal')) {
                closeViewCategoryModal();
            }
        });

        document.getElementById('category-modal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('category-modal')) {
                closeCategoryModal();
            }
        });
    };

    // Initialize page
    if (window.location.pathname.includes('categories.html')) {
        cleanCategories();
        renderCategories();
        setupEventListeners();
    }
});