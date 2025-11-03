document.addEventListener('DOMContentLoaded', () => {
    // Initialize settings page
    const initSettingsPage = () => {
        loadSettings();
        updateSystemInfo();
        setupEventListeners();
    };

    // Generate unique ID
    const generateId = () => {
        return Math.floor(100000 + Math.random() * 900000);
    };

    // Load settings from localStorage
    const loadSettings = () => {
        const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        document.getElementById('site-name').value = settings.siteName || 'Kunash Enterprises';
        document.getElementById('admin-email').value = settings.adminEmail || 'admin@kunash.com';
        document.getElementById('site-description').value = settings.siteDescription || '';
        document.getElementById('maintenance-mode').checked = settings.maintenanceMode || false;
    };

    // Update system information
    const updateSystemInfo = () => {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');

        document.getElementById('sys-products').textContent = products.length;
        document.getElementById('sys-orders').textContent = orders.length;
        document.getElementById('sys-customers').textContent = customers.length;
        document.getElementById('sys-messages').textContent = messages.filter(m => !m.read).length;

        // Update dashboard counts if on dashboard page
        if (document.querySelector('#total-products')) {
            document.querySelector('#total-products').textContent = products.length;
        }
        if (document.querySelector('#total-orders')) {
            document.querySelector('#total-orders').textContent = orders.length;
        }
        if (document.querySelector('#total-customers')) {
            document.querySelector('#total-customers').textContent = customers.length;
        }
        if (document.querySelector('#total-messages')) {
            document.querySelector('#total-messages').textContent = messages.filter(m => !m.read).length;
        }
    };

    // Show notification
    const showNotification = (message, type) => {
        const notification = document.getElementById('notification');
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

    // Save general settings
    const saveGeneralSettings = (settingsData) => {
        if (!settingsData.siteName || !settingsData.adminEmail) {
            showNotification('Site name and admin email are required', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settingsData.adminEmail)) {
            showNotification('Invalid email format', 'error');
            return;
        }

        const currentSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
        const updatedSettings = { ...currentSettings, ...settingsData };
        localStorage.setItem('adminSettings', JSON.stringify(updatedSettings));
        showNotification('Settings saved successfully', 'success');
    };

    // Export all data
    const exportData = () => {
        const data = {
            products: JSON.parse(localStorage.getItem('products') || '[]'),
            categories: JSON.parse(localStorage.getItem('categories') || '[]'),
            orders: JSON.parse(localStorage.getItem('orders') || '[]'),
            customers: JSON.parse(localStorage.getItem('customers') || '[]'),
            banners: JSON.parse(localStorage.getItem('banners') || '[]'),
            messages: JSON.parse(localStorage.getItem('messages') || '[]'),
            settings: JSON.parse(localStorage.getItem('adminSettings') || '{}'),
            exportDate: new Date().toISOString()
        };

        if (Object.values(data).every(arr => Array.isArray(arr) ? arr.length === 0 : Object.keys(arr).length === 0)) {
            showNotification('No data to export', 'info');
            return;
        }

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `kunash-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        showNotification('Data exported successfully', 'success');
    };

    // Clear all data
    const clearAllData = () => {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            localStorage.removeItem('products');
            localStorage.removeItem('categories');
            localStorage.removeItem('orders');
            localStorage.removeItem('customers');
            localStorage.removeItem('banners');
            localStorage.removeItem('messages');
            localStorage.removeItem('adminSettings');

            updateSystemInfo();
            showNotification('All data cleared successfully', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    };

    // Add sample data
    const addSampleData = () => {
        if (confirm('This will add sample data for testing. Continue?')) {
            // Sample products
            const sampleProducts = [
                {
                    id: generateId(),
                    name: "Wireless Bluetooth Headphones",
                    categoryId: "1",
                    price: 79.99,
                    stock: 25,
                    description: "High-quality wireless headphones with noise cancellation",
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                    createdAt: new Date().toISOString()
                },
                {
                    id: generateId(),
                    name: "Smart Fitness Watch",
                    categoryId: "1",
                    price: 199.99,
                    stock: 15,
                    description: "Advanced fitness tracking with heart rate monitoring",
                    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
                    createdAt: new Date().toISOString()
                },
                {
                    id: generateId(),
                    name: "Cotton T-Shirt",
                    categoryId: "2",
                    price: 24.99,
                    stock: 50,
                    description: "Comfortable cotton t-shirt available in multiple colors",
                    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
                    createdAt: new Date().toISOString()
                }
            ];

            // Sample categories
            const sampleCategories = [
                { id: "1", name: "Electronics", productCount: 2, createdAt: new Date().toISOString() },
                { id: "2", name: "Clothing", productCount: 1, createdAt: new Date().toISOString() },
                { id: "3", name: "Home & Garden", productCount: 0, createdAt: new Date().toISOString() }
            ];

            // Sample customers
            const sampleCustomers = [
                {
                    id: generateId(),
                    name: "John Doe",
                    email: "john.doe@example.com",
                    phone: "+1234567890",
                    joinedDate: new Date().toISOString()
                },
                {
                    id: generateId(),
                    name: "Jane Smith",
                    email: "jane.smith@example.com",
                    phone: "+0987654321",
                    joinedDate: new Date().toISOString()
                }
            ];

            // Sample orders
            const sampleOrders = [
                {
                    id: generateId(),
                    customerId: sampleCustomers[0].id,
                    date: new Date().toISOString(),
                    status: "delivered",
                    items: [
                        { productId: sampleProducts[0].id, name: sampleProducts[0].name, price: sampleProducts[0].price, quantity: 1 },
                        { productId: sampleProducts[2].id, name: sampleProducts[2].name, price: sampleProducts[2].price, quantity: 2 }
                    ],
                    shippingAddress: "123 Main St, City, State 12345"
                }
            ];

            // Sample banners
            const sampleBanners = [
                {
                    id: generateId(),
                    title: "Summer Sale",
                    image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800",
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: generateId(),
                    title: "New Arrival Banner",
                    image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800",
                    active: false,
                    createdAt: new Date().toISOString()
                }
            ];

            // Sample messages
            const sampleMessages = [
                {
                    id: generateId(),
                    name: "Robert Johnson",
                    email: "robert.j@example.com",
                    phone: "+1122334455",
                    subject: "Product Inquiry",
                    message: "I'm interested in the wireless headphones. Do you have them in stock?",
                    date: new Date().toISOString(),
                    read: false
                },
                {
                    id: generateId(),
                    name: "Sarah Williams",
                    email: "sarah.w@example.com",
                    phone: "+4455667788",
                    subject: "Order Issue",
                    message: "My order hasn't arrived yet. Can you check the status?",
                    date: new Date().toISOString(),
                    read: true
                }
            ];

            // Save sample data only if respective keys are empty
            if (!JSON.parse(localStorage.getItem('products') || '[]').length) {
                localStorage.setItem('products', JSON.stringify(sampleProducts));
            }
            if (!JSON.parse(localStorage.getItem('categories') || '[]').length) {
                localStorage.setItem('categories', JSON.stringify(sampleCategories));
            }
            if (!JSON.parse(localStorage.getItem('customers') || '[]').length) {
                localStorage.setItem('customers', JSON.stringify(sampleCustomers));
            }
            if (!JSON.parse(localStorage.getItem('orders') || '[]').length) {
                localStorage.setItem('orders', JSON.stringify(sampleOrders));
            }
            if (!JSON.parse(localStorage.getItem('banners') || '[]').length) {
                localStorage.setItem('banners', JSON.stringify(sampleBanners));
            }
            if (!JSON.parse(localStorage.getItem('messages') || '[]').length) {
                localStorage.setItem('messages', JSON.stringify(sampleMessages));
            }

            updateSystemInfo();
            showNotification('Sample data added successfully', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    };

    // Setup event listeners
    const setupEventListeners = () => {
        document.getElementById('general-settings-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const settingsData = {
                siteName: document.getElementById('site-name').value.trim(),
                adminEmail: document.getElementById('admin-email').value.trim(),
                siteDescription: document.getElementById('site-description').value.trim(),
                maintenanceMode: document.getElementById('maintenance-mode').checked
            };
            saveGeneralSettings(settingsData);
        });

        document.getElementById('export-data')?.addEventListener('click', exportData);
        document.getElementById('clear-data')?.addEventListener('click', clearAllData);
        document.getElementById('add-sample-data')?.addEventListener('click', addSampleData);
    };

    // Initialize page
    if (window.location.pathname.includes('settings.html')) {
        initSettingsPage();
    }
});