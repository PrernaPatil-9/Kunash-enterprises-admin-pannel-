// Customer Management functionality

let customers = [];
let currentPage = 1;
const itemsPerPage = 10;
let filteredCustomers = [];
let selectedCustomers = new Set();

// Initialize customers page
function initCustomersPage() {
    loadCustomers();
    setupEventListeners();
    updateStats();
}

// Load customers from localStorage
function loadCustomers() {
    customers = JSON.parse(localStorage.getItem('customers') || '[]');
    
    // Add sample data if empty (for demonstration; in production, data comes from main website)
    if (customers.length === 0) {
        customers = [
            {
                id: 'CUST001',
                name: 'John Doe',
                email: 'john.doe@example.com',
                address: '123 Main Street',
                city: 'Anytown',
                state: 'CA',
                zip: '90210',
                country: 'United States',
                phone: '(555) 123-4567',
                status: 'active',
                joinedDate: '2024-01-15T10:30:00Z',
                lastLogin: '2025-10-20T14:45:00Z',
                emailVerified: true
            },
            {
                id: 'CUST002',
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                address: '456 Elm Avenue',
                city: 'Springfield',
                state: 'IL',
                zip: '62701',
                country: 'United States',
                phone: '(555) 987-6543',
                status: 'active',
                joinedDate: '2024-03-22T09:15:00Z',
                lastLogin: '2025-10-25T16:20:00Z',
                emailVerified: false
            },
            {
                id: 'CUST003',
                name: 'Robert Johnson',
                email: 'robert.j@example.com',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'United States',
                status: 'inactive',
                joinedDate: '2024-05-10T13:00:00Z',
                lastLogin: null,
                emailVerified: true
            },
            {
                id: 'CUST004',
                name: 'Emily Davis',
                email: 'emily.davis@example.com',
                address: '789 Pine Road',
                city: 'Seattle',
                state: 'WA',
                zip: '98101',
                country: 'United States',
                phone: '(555) 246-8135',
                status: 'active',
                joinedDate: '2024-07-05T11:45:00Z',
                lastLogin: '2025-10-26T08:30:00Z',
                emailVerified: true
            },
            {
                id: 'CUST005',
                name: 'Michael Brown',
                email: 'michael.b@example.com',
                address: '1010 Oak Lane',
                city: 'Chicago',
                state: 'IL',
                zip: '60601',
                country: 'United States',
                status: 'active',
                joinedDate: '2024-09-18T15:20:00Z',
                lastLogin: '2025-10-27T10:00:00Z',
                emailVerified: false
            },
            {
                id: 'CUST006',
                name: 'Sarah Wilson',
                email: 'sarah.wilson@example.com',
                address: '222 Maple Street',
                city: 'Boston',
                state: 'MA',
                zip: '02101',
                country: 'United States',
                phone: '(555) 369-2580',
                status: 'active',
                joinedDate: '2024-10-05T08:15:00Z',
                lastLogin: '2025-10-28T11:20:00Z',
                emailVerified: true
            },
            {
                id: 'CUST007',
                name: 'David Miller',
                email: 'david.miller@example.com',
                city: 'Miami',
                state: 'FL',
                zip: '33101',
                country: 'United States',
                status: 'inactive',
                joinedDate: '2024-11-12T14:30:00Z',
                lastLogin: null,
                emailVerified: false
            },
            {
                id: 'CUST008',
                name: 'Lisa Taylor',
                email: 'lisa.taylor@example.com',
                address: '333 Cedar Avenue',
                city: 'Denver',
                state: 'CO',
                zip: '80201',
                country: 'United States',
                phone: '(555) 741-8520',
                status: 'active',
                joinedDate: '2024-12-01T09:45:00Z',
                lastLogin: '2025-10-29T13:10:00Z',
                emailVerified: true
            },
            {
                id: 'CUST009',
                name: 'James Anderson',
                email: 'james.anderson@example.com',
                address: '444 Birch Lane',
                city: 'Phoenix',
                state: 'AZ',
                zip: '85001',
                country: 'United States',
                status: 'active',
                joinedDate: '2025-01-15T16:20:00Z',
                lastLogin: '2025-10-30T15:45:00Z',
                emailVerified: false
            },
            {
                id: 'CUST010',
                name: 'Amanda Thomas',
                email: 'amanda.thomas@example.com',
                address: '555 Spruce Drive',
                city: 'Atlanta',
                state: 'GA',
                zip: '30301',
                country: 'United States',
                phone: '(555) 963-8520',
                status: 'active',
                joinedDate: '2025-02-20T11:10:00Z',
                lastLogin: '2025-10-31T09:30:00Z',
                emailVerified: true
            },
            {
                id: 'CUST011',
                name: 'Christopher Lee',
                email: 'chris.lee@example.com',
                city: 'Dallas',
                state: 'TX',
                zip: '75201',
                country: 'United States',
                status: 'inactive',
                joinedDate: '2025-03-10T13:55:00Z',
                lastLogin: null,
                emailVerified: true
            },
            {
                id: 'CUST012',
                name: 'Jennifer White',
                email: 'jennifer.white@example.com',
                address: '666 Pine Street',
                city: 'San Francisco',
                state: 'CA',
                zip: '94101',
                country: 'United States',
                phone: '(555) 852-7410',
                status: 'active',
                joinedDate: '2025-04-05T10:25:00Z',
                lastLogin: '2025-11-01T14:15:00Z',
                emailVerified: true
            }
        ];
        localStorage.setItem('customers', JSON.stringify(customers));
    }
    
    filteredCustomers = [...customers];
    renderCustomersTable();
    updatePagination();
    updateStats();
}

// Save customers to localStorage
function saveCustomers() {
    localStorage.setItem('customers', JSON.stringify(customers));
    loadCustomers(); // Refresh the data
}

// Render customers table
function renderCustomersTable() {
    const tableBody = document.getElementById('customers-table-body');
    const emptyState = document.getElementById('empty-state');
    const deleteSelectedBtn = document.getElementById('delete-selected');
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const customersToShow = filteredCustomers.slice(startIndex, endIndex);
    
    tableBody.innerHTML = '';
    
    if (customersToShow.length === 0) {
        tableBody.innerHTML = '';
        emptyState.classList.remove('hidden');
        deleteSelectedBtn.classList.add('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    customersToShow.forEach((customer, index) => {
        const srNo = startIndex + index + 1;
        const isSelected = selectedCustomers.has(customer.id);
        const row = document.createElement('tr');
        row.className = 'table-row-hover';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <input type="checkbox" class="customer-checkbox rounded border-gray-300 text-orange-600 focus:ring-orange-500" data-id="${customer.id}" ${isSelected ? 'checked' : ''}>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${srNo}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#${customer.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                        ${customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${customer.name}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center">
                    <span>${customer.email}</span>
                    ${customer.emailVerified ? '<span class="ml-2 text-green-500" title="Verified">✓</span>' : ''}
                </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 max-w-xs">
                <div class="line-clamp-2">${customer.address ? formatAddress(customer) : 'No address'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${customer.phone || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="status-badge ${customer.status === 'active' ? 'status-delivered' : 'status-cancelled'}">
                    ${customer.status === 'active' ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(customer.joinedDate)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-orange-600 hover:text-orange-900 view-customer mr-3" data-id="${customer.id}" title="View Details">
                    👁️ 
                </button>
                <button class="text-green-600 hover:text-green-900 edit-customer mr-3" data-id="${customer.id}" title="Edit Customer">
                    ✏️ 
                </button>
                <button class="text-red-600 hover:text-red-900 delete-customer" data-id="${customer.id}" title="Delete Customer">
                    🗑️ 
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Show/hide delete selected button
    if (selectedCustomers.size > 0) {
        deleteSelectedBtn.classList.remove('hidden');
        deleteSelectedBtn.textContent = `Delete (${selectedCustomers.size})`;
    } else {
        deleteSelectedBtn.classList.add('hidden');
    }
    
    // Add event listeners to action buttons
    addActionEventListeners();
}

// Format address for display
function formatAddress(customer) {
    const parts = [];
    if (customer.address) parts.push(customer.address);
    if (customer.city) parts.push(customer.city);
    if (customer.state) parts.push(customer.state);
    if (customer.zip) parts.push(customer.zip);
    if (customer.country && customer.country !== 'United States') parts.push(customer.country);
    
    return parts.join(', ');
}

// Add event listeners to action buttons
function addActionEventListeners() {
    // Checkbox event listeners
    document.querySelectorAll('.customer-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const customerId = e.target.getAttribute('data-id');
            if (e.target.checked) {
                selectedCustomers.add(customerId);
            } else {
                selectedCustomers.delete(customerId);
            }
            updateSelectAllCheckbox();
            renderCustomersTable();
        });
    });
    
    // View customer details
    document.querySelectorAll('.view-customer').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const customerId = e.target.getAttribute('data-id');
            viewCustomerDetails(customerId);
        });
    });
    
    // Edit customer
    document.querySelectorAll('.edit-customer').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const customerId = e.target.getAttribute('data-id');
            editCustomer(customerId);
        });
    });
    
    // Delete single customer
    document.querySelectorAll('.delete-customer').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const customerId = e.target.getAttribute('data-id');
            deleteCustomer(customerId);
        });
    });
}

// Update statistics
function updateStats() {
    const totalCustomers = customers.length;
    const activeEmails = customers.filter(c => c.status === 'active').length;
    
    // Calculate new customers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = customers.filter(c => {
        const joinedDate = new Date(c.joinedDate);
        return joinedDate >= thirtyDaysAgo;
    }).length;
    
    // Calculate deactivated customers
    const deactivatedCustomers = customers.filter(c => c.status === 'inactive').length;
    
    document.getElementById('total-customers-count').textContent = totalCustomers;
    document.getElementById('active-emails-count').textContent = activeEmails;
    document.getElementById('new-customers-count').textContent = newCustomers;
    document.getElementById('deactivated-customers-count').textContent = deactivatedCustomers;
}

// Edit customer
function editCustomer(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    const modal = document.getElementById('customer-modal');
    const title = document.getElementById('customer-modal-title');
    
    title.textContent = 'Edit Customer';
    document.getElementById('customer-id').value = customer.id;
    document.getElementById('customer-name').value = customer.name;
    document.getElementById('customer-email').value = customer.email;
    document.getElementById('customer-phone').value = customer.phone || '';
    document.getElementById('customer-status').value = customer.status || 'active';
    document.getElementById('customer-address').value = customer.address || '';
    document.getElementById('customer-city').value = customer.city || '';
    document.getElementById('customer-state').value = customer.state || '';
    document.getElementById('customer-zip').value = customer.zip || '';
    document.getElementById('customer-country').value = customer.country || 'United States';
    
    modal.classList.remove('hidden');
}

// View customer details
function viewCustomerDetails(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    const modal = document.getElementById('customer-details-modal');
    const content = document.getElementById('customer-details-content');
    
    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <h4 class="font-semibold mb-3 text-gray-900">Personal Information</h4>
                <div class="space-y-2">
                    <p><strong class="text-gray-700">Customer ID:</strong> #${customer.id}</p>
                    <p><strong class="text-gray-700">Name:</strong> ${customer.name}</p>
                    <p><strong class="text-gray-700">Email:</strong> ${customer.email} ${customer.emailVerified ? '<span class="text-green-500">(Verified)</span>' : ''}</p>
                    <p><strong class="text-gray-700">Phone:</strong> ${customer.phone || 'N/A'}</p>
                    <p><strong class="text-gray-700">Status:</strong> <span class="capitalize ${customer.status === 'active' ? 'text-green-600' : 'text-red-600'}">${customer.status}</span></p>
                </div>
            </div>
            <div>
                <h4 class="font-semibold mb-3 text-gray-900">Account Information</h4>
                <div class="space-y-2">
                    <p><strong class="text-gray-700">Joined Date:</strong> ${formatDate(customer.joinedDate)}</p>
                    <p><strong class="text-gray-700">Last Login:</strong> ${customer.lastLogin ? formatDate(customer.lastLogin) : 'Never'}</p>
                    <p><strong class="text-gray-700">Total Orders:</strong> ${getCustomerOrderCount(customer.id)}</p>
                    <p><strong class="text-gray-700">Total Spent:</strong> $${getCustomerTotalSpent(customer.id).toFixed(2)}</p>
                </div>
            </div>
        </div>
        
        <div class="mb-6">
            <h4 class="font-semibold mb-3 text-gray-900">Address Information</h4>
            <div class="bg-gray-50 rounded-lg p-4">
                ${customer.address ? `
                    <p class="text-gray-700">${formatAddress(customer)}</p>
                ` : '<p class="text-gray-500">No address provided</p>'}
            </div>
        </div>
        
        ${getCustomerOrders(customer.id).length > 0 ? `
            <div class="mb-4">
                <h4 class="font-semibold mb-3 text-gray-900">Recent Orders (${getCustomerOrders(customer.id).length})</h4>
                <div class="border rounded-lg overflow-hidden">
                    <table class="min-w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">Order ID</th>
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">Total</th>
                                <th class="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${getCustomerOrders(customer.id).slice(0, 5).map(order => {
                                const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                return `
                                    <tr class="border-t">
                                        <td class="px-4 py-2 text-sm">#${order.id}</td>
                                        <td class="px-4 py-2 text-sm">${formatDate(order.date)}</td>
                                        <td class="px-4 py-2 text-sm">$${total.toFixed(2)}</td>
                                        <td class="px-4 py-2 text-sm capitalize">${order.status}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        ` : '<p class="text-gray-500">No orders found for this customer.</p>'}
    `;
    
    modal.classList.remove('hidden');
}

// Get customer order count
function getCustomerOrderCount(customerId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.filter(order => order.customerId === customerId).length;
}

// Get customer total spent
function getCustomerTotalSpent(customerId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const customerOrders = orders.filter(order => order.customerId === customerId);
    return customerOrders.reduce((total, order) => {
        return total + order.items.reduce((orderTotal, item) => 
            orderTotal + (item.price * item.quantity), 0
        );
    }, 0);
}

// Get customer orders
function getCustomerOrders(customerId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.filter(order => order.customerId === customerId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Delete customer
function deleteCustomer(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    const orderCount = getCustomerOrderCount(customerId);
    
    if (orderCount > 0) {
        alert(`Cannot delete customer "${customer.name}" because they have ${orderCount} order(s). Please delete the orders first.`);
        return;
    }
    
    if (confirm(`Are you sure you want to delete customer "${customer.name}"? This action cannot be undone.`)) {
        customers = customers.filter(c => c.id !== customerId);
        saveCustomers();
        showNotification('Customer deleted successfully', 'success');
    }
}

// Delete selected customers
function deleteSelectedCustomers() {
    if (selectedCustomers.size === 0) return;
    
    const selectedCustomerNames = customers
        .filter(c => selectedCustomers.has(c.id))
        .map(c => c.name);
    
    const hasOrders = customers.some(c => 
        selectedCustomers.has(c.id) && getCustomerOrderCount(c.id) > 0
    );
    
    if (hasOrders) {
        alert('Cannot delete customers who have orders. Please delete their orders first.');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedCustomers.size} customer(s)?\n\n${selectedCustomerNames.join(', ')}`)) {
        customers = customers.filter(c => !selectedCustomers.has(c.id));
        selectedCustomers.clear();
        saveCustomers();
        showNotification(`${selectedCustomers.size} customers deleted successfully`, 'success');
    }
}

// Save customer (update only)
function saveCustomer(customerData) {
    const customerId = document.getElementById('customer-id').value;
    
    if (customerId) {
        // Update existing customer
        const index = customers.findIndex(c => c.id === customerId);
        if (index !== -1) {
            customers[index] = { 
                ...customers[index], 
                ...customerData,
                updatedAt: new Date().toISOString()
            };
            saveCustomers();
            closeCustomerModal();
            showNotification('Customer updated successfully', 'success');
        }
    }
}

// Close customer modal
function closeCustomerModal() {
    document.getElementById('customer-modal').classList.add('hidden');
}

// Close details modal
function closeDetailsModal() {
    document.getElementById('customer-details-modal').classList.add('hidden');
}

// Search and filter customers
function filterCustomers() {
    const searchTerm = document.getElementById('search-customers').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    
    filteredCustomers = customers.filter(customer => {
        const matchesSearch = !searchTerm || 
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.email.toLowerCase().includes(searchTerm) ||
            (customer.phone && customer.phone.includes(searchTerm)) ||
            (customer.address && customer.address.toLowerCase().includes(searchTerm));
        
        const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    currentPage = 1;
    selectedCustomers.clear();
    renderCustomersTable();
    updatePagination();
}

// Clear filters
function clearFilters() {
    document.getElementById('search-customers').value = '';
    document.getElementById('status-filter').value = 'all';
    filteredCustomers = [...customers];
    currentPage = 1;
    selectedCustomers.clear();
    renderCustomersTable();
    updatePagination();
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginationNumbers = document.getElementById('pagination-numbers');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    
    // Update showing text
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredCustomers.length);
    
    document.getElementById('showing-start').textContent = startIndex;
    document.getElementById('showing-end').textContent = endIndex;
    document.getElementById('total-items').textContent = filteredCustomers.length;
    
    // Update pagination numbers
    paginationNumbers.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.className = `px-3 py-1 border rounded-md ${currentPage === i ? 'bg-orange-600 text-white border-orange-600' : 'border-gray-300 hover:bg-gray-50'}`;
        button.textContent = i;
        button.addEventListener('click', () => {
            currentPage = i;
            renderCustomersTable();
            updatePagination();
        });
        paginationNumbers.appendChild(button);
    }
    
    // Update button states
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
}

// Update select all checkbox
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('select-all');
    const currentPageCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    
    const allSelected = currentPageCustomers.every(customer => 
        selectedCustomers.has(customer.id)
    );
    
    selectAllCheckbox.checked = allSelected;
    selectAllCheckbox.indeterminate = !allSelected && currentPageCustomers.some(customer => 
        selectedCustomers.has(customer.id)
    );
}

// Select all customers on current page
function selectAllCustomers() {
    const selectAllCheckbox = document.getElementById('select-all');
    const currentPageCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    
    if (selectAllCheckbox.checked) {
        currentPageCustomers.forEach(customer => {
            selectedCustomers.add(customer.id);
        });
    } else {
        currentPageCustomers.forEach(customer => {
            selectedCustomers.delete(customer.id);
        });
    }
    
    renderCustomersTable();
}

// Setup event listeners
function setupEventListeners() {
    // Refresh button
    document.getElementById('refresh-customers')?.addEventListener('click', loadCustomers);
    
    // Customer form submission (for edit)
    document.getElementById('customer-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const customerData = {
            name: document.getElementById('customer-name').value,
            email: document.getElementById('customer-email').value,
            phone: document.getElementById('customer-phone').value || null,
            status: document.getElementById('customer-status').value,
            address: document.getElementById('customer-address').value || null,
            city: document.getElementById('customer-city').value || null,
            state: document.getElementById('customer-state').value || null,
            zip: document.getElementById('customer-zip').value || null,
            country: document.getElementById('customer-country').value || 'United States'
        };
        
        saveCustomer(customerData);
    });
    
    // Cancel buttons
    document.getElementById('cancel-customer')?.addEventListener('click', closeCustomerModal);
    document.getElementById('close-details-modal')?.addEventListener('click', closeDetailsModal);
    
    // Search and filter
    document.getElementById('search-customers')?.addEventListener('input', filterCustomers);
    document.getElementById('status-filter')?.addEventListener('change', filterCustomers);
    document.getElementById('clear-filters')?.addEventListener('click', clearFilters);
    
    // Pagination
    document.getElementById('prev-page')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderCustomersTable();
            updatePagination();
        }
    });
    
    document.getElementById('next-page')?.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderCustomersTable();
            updatePagination();
        }
    });
    
    // Select all checkbox
    document.getElementById('select-all')?.addEventListener('change', selectAllCustomers);
    
    // Delete selected button
    document.getElementById('delete-selected')?.addEventListener('click', deleteSelectedCustomers);
    
    // Close modals when clicking outside
    document.getElementById('customer-modal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeCustomerModal();
        }
    });
    
    document.getElementById('customer-details-modal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeDetailsModal();
        }
    });
}

// Utility functions
function formatDate(str) {
    if (!str) return 'N/A';
    
    const d = new Date(str);
    if (isNaN(d.getTime())) return 'N/A';
    
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function generateId() {
    return 'CUST' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize customers page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('customers.html')) {
        initCustomersPage();
    }
});

// Export functions for use in main website
window.customerManagement = {
    addCustomerFromWebsite: function(customerData) {
        const newCustomer = {
            id: generateId(),
            ...customerData,
            joinedDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            status: 'active',
            emailVerified: false,
            lastLogin: null
        };
        
        // Get existing customers
        const existingCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
        
        // Check if email already exists
        const existingCustomer = existingCustomers.find(c => c.email === customerData.email);
        if (existingCustomer) {
            console.log('Customer with this email already exists');
            return existingCustomer.id;
        }
        
        // Add new customer
        existingCustomers.push(newCustomer);
        localStorage.setItem('customers', JSON.stringify(existingCustomers));
        
        console.log('New customer added from website:', newCustomer);
        return newCustomer.id;
    },
    
    updateCustomerLogin: function(customerId) {
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        const customer = customers.find(c => c.id === customerId);
        
        if (customer) {
            customer.lastLogin = new Date().toISOString();
            localStorage.setItem('customers', JSON.stringify(customers));
        }
    }
};