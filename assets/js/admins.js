// Admin Management JavaScript
class AdminManager {
    constructor() {
        this.admins = [];
        this.filteredAdmins = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentEditId = null;
        this.currentAction = null;
        this.currentAdminId = null;
        
        this.initializeEventListeners();
        this.loadAdmins();
    }

    initializeEventListeners() {
        // Add admin button
        document.getElementById('add-admin-btn').addEventListener('click', () => this.openAddModal());
        document.getElementById('empty-add-btn').addEventListener('click', () => this.openAddModal());
        
        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('save-admin').addEventListener('click', () => this.saveAdmin());
        
        // Confirmation modal
        document.getElementById('cancel-confirm').addEventListener('click', () => this.closeConfirmModal());
        document.getElementById('confirm-action').addEventListener('click', () => this.executeAction());
        
        // Search and filters
        document.getElementById('search-admin').addEventListener('input', () => this.filterAdmins());
        document.getElementById('role-filter').addEventListener('change', () => this.filterAdmins());
        document.getElementById('status-filter').addEventListener('change', () => this.filterAdmins());
        
        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => this.previousPage());
        document.getElementById('next-page').addEventListener('click', () => this.nextPage());
        
        // Close modals on outside click
        document.getElementById('admin-modal').addEventListener('click', (e) => {
            if (e.target.id === 'admin-modal') this.closeModal();
        });
        
        document.getElementById('confirm-modal').addEventListener('click', (e) => {
            if (e.target.id === 'confirm-modal') this.closeConfirmModal();
        });
    }

    // Load admins from localStorage (simulate API call)
    loadAdmins() {
        // Show loading state
        document.getElementById('loading-state').classList.remove('hidden');
        document.getElementById('admins-table-body').classList.add('hidden');
        document.getElementById('empty-state').classList.add('hidden');
        
        // Simulate API delay
        setTimeout(() => {
            const savedAdmins = localStorage.getItem('kunash_admins');
            
            if (savedAdmins) {
                this.admins = JSON.parse(savedAdmins);
            } else {
                // Initialize with default admin
                this.admins = [
                    {
                        id: 1,
                        fullName: 'Super Admin',
                        email: 'admin@kunash.com',
                        role: 'super_admin',
                        status: 'active',
                        lastLogin: new Date().toISOString(),
                        createdAt: new Date('2024-01-01').toISOString(),
                        avatar: null
                    }
                ];
                this.saveToStorage();
            }
            
            this.renderAdmins();
        }, 800);
    }

    saveToStorage() {
        localStorage.setItem('kunash_admins', JSON.stringify(this.admins));
    }

    filterAdmins() {
        const searchTerm = document.getElementById('search-admin').value.toLowerCase();
        const roleFilter = document.getElementById('role-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        
        this.filteredAdmins = this.admins.filter(admin => {
            const matchesSearch = admin.fullName.toLowerCase().includes(searchTerm) || 
                                admin.email.toLowerCase().includes(searchTerm);
            const matchesRole = !roleFilter || admin.role === roleFilter;
            const matchesStatus = !statusFilter || admin.status === statusFilter;
            
            return matchesSearch && matchesRole && matchesStatus;
        });
        
        this.currentPage = 1;
        this.renderAdmins();
    }

    renderAdmins() {
        const tableBody = document.getElementById('admins-table-body');
        const emptyState = document.getElementById('empty-state');
        const loadingState = document.getElementById('loading-state');
        
        // Hide loading state
        loadingState.classList.add('hidden');
        
        if (this.filteredAdmins.length === 0 && this.admins.length > 0) {
            this.filteredAdmins = [...this.admins];
        }
        
        if (this.filteredAdmins.length === 0) {
            tableBody.classList.add('hidden');
            emptyState.classList.remove('hidden');
            this.updateStats();
            this.renderPagination();
            return;
        }
        
        tableBody.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedAdmins = this.filteredAdmins.slice(startIndex, endIndex);
        
        tableBody.innerHTML = '';
        
        paginatedAdmins.forEach(admin => {
            const row = this.createAdminRow(admin);
            tableBody.appendChild(row);
        });
        
        this.updateStats();
        this.renderPagination();
    }

    createAdminRow(admin) {
        const row = document.createElement('tr');
        
        // Format dates
        const lastLogin = admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never';
        const createdDate = new Date(admin.createdAt).toLocaleDateString();
        
        // Role badge
        const roleBadge = this.getRoleBadge(admin.role);
        
        // Status badge
        const statusBadge = this.getStatusBadge(admin.status);
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        ${admin.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${admin.fullName}</div>
                        <div class="text-sm text-gray-500">ID: ${admin.id}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${admin.email}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${roleBadge}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${statusBadge}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${lastLogin}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${createdDate}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button class="edit-admin text-orange-600 hover:text-orange-900" data-id="${admin.id}">
                        <span class="material-icons text-base">edit</span>
                    </button>
                    <button class="delete-admin text-red-600 hover:text-red-900" data-id="${admin.id}">
                        <span class="material-icons text-base">delete</span>
                    </button>
                    ${admin.status === 'active' ? 
                        `<button class="disable-admin text-yellow-600 hover:text-yellow-900" data-id="${admin.id}">
                            <span class="material-icons text-base">block</span>
                        </button>` :
                        `<button class="enable-admin text-green-600 hover:text-green-900" data-id="${admin.id}">
                            <span class="material-icons text-base">check_circle</span>
                        </button>`
                    }
                    <button class="reset-password text-blue-600 hover:text-blue-900" data-id="${admin.id}">
                        <span class="material-icons text-base">vpn_key</span>
                    </button>
                </div>
            </td>
        `;
        
        // Add event listeners to action buttons
        row.querySelector('.edit-admin').addEventListener('click', (e) => {
            this.editAdmin(e.target.closest('button').dataset.id);
        });
        
        row.querySelector('.delete-admin').addEventListener('click', (e) => {
            this.confirmDelete(e.target.closest('button').dataset.id);
        });
        
        const disableBtn = row.querySelector('.disable-admin');
        const enableBtn = row.querySelector('.enable-admin');
        
        if (disableBtn) {
            disableBtn.addEventListener('click', (e) => {
                this.confirmDisable(e.target.closest('button').dataset.id);
            });
        }
        
        if (enableBtn) {
            enableBtn.addEventListener('click', (e) => {
                this.enableAdmin(e.target.closest('button').dataset.id);
            });
        }
        
        row.querySelector('.reset-password').addEventListener('click', (e) => {
            this.confirmResetPassword(e.target.closest('button').dataset.id);
        });
        
        return row;
    }

    getRoleBadge(role) {
        const roleConfig = {
            super_admin: { text: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
            product_manager: { text: 'Product Manager', color: 'bg-blue-100 text-blue-800' },
            order_manager: { text: 'Order Manager', color: 'bg-green-100 text-green-800' },
            customer_manager: { text: 'Customer Manager', color: 'bg-indigo-100 text-indigo-800' },
            banner_manager: { text: 'Banner Manager', color: 'bg-pink-100 text-pink-800' }
        };
        
        const config = roleConfig[role] || { text: role, color: 'bg-gray-100 text-gray-800' };
        return `<span class="role-badge ${config.color}">${config.text}</span>`;
    }

    getStatusBadge(status) {
        const statusConfig = {
            active: { text: 'Active', color: 'bg-green-100 text-green-800' },
            inactive: { text: 'Inactive', color: 'bg-red-100 text-red-800' }
        };
        
        const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
        return `<span class="status-badge ${config.color}">${config.text}</span>`;
    }

    updateStats() {
        const totalAdmins = this.filteredAdmins.length;
        const activeAdmins = this.filteredAdmins.filter(a => a.status === 'active').length;
        const superAdmins = this.filteredAdmins.filter(a => a.role === 'super_admin').length;
        const inactiveAdmins = this.filteredAdmins.filter(a => a.status === 'inactive').length;
        
        // Calculate active today (simulated)
        const activeToday = this.filteredAdmins.filter(a => {
            if (!a.lastLogin) return false;
            const lastLogin = new Date(a.lastLogin);
            const today = new Date();
            return lastLogin.toDateString() === today.toDateString();
        }).length;
        
        document.getElementById('total-admins').textContent = totalAdmins;
        document.getElementById('active-admins').textContent = activeAdmins;
        document.getElementById('super-admins').textContent = superAdmins;
        document.getElementById('active-today').textContent = activeToday;
        document.getElementById('inactive-admins').textContent = inactiveAdmins;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredAdmins.length / this.itemsPerPage);
        const paginationNumbers = document.getElementById('pagination-numbers');
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');
        
        // Update showing info
        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.filteredAdmins.length);
        
        document.getElementById('showing-from').textContent = startIndex;
        document.getElementById('showing-to').textContent = endIndex;
        document.getElementById('showing-total').textContent = this.filteredAdmins.length;
        
        // Update button states
        prevButton.disabled = this.currentPage === 1;
        nextButton.disabled = this.currentPage === totalPages || totalPages === 0;
        
        // Render page numbers
        paginationNumbers.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = `px-3 py-1 border border-gray-300 rounded-md text-sm ${
                i === this.currentPage ? 'bg-orange-500 text-white border-orange-500' : 'text-gray-700'
            }`;
            button.addEventListener('click', () => this.goToPage(i));
            paginationNumbers.appendChild(button);
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderAdmins();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredAdmins.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderAdmins();
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderAdmins();
    }

    openAddModal() {
        this.currentEditId = null;
        document.getElementById('modal-title').textContent = 'Add New Admin';
        document.getElementById('admin-form').reset();
        document.getElementById('password-fields').classList.remove('hidden');
        document.getElementById('status').checked = true;
        document.getElementById('admin-id').value = '';
        this.showModal();
    }

    editAdmin(id) {
        const admin = this.admins.find(a => a.id == id);
        if (!admin) return;
        
        this.currentEditId = id;
        document.getElementById('modal-title').textContent = 'Edit Admin';
        document.getElementById('admin-id').value = admin.id;
        document.getElementById('full-name').value = admin.fullName;
        document.getElementById('email').value = admin.email;
        document.getElementById('role').value = admin.role;
        document.getElementById('status').checked = admin.status === 'active';
        document.getElementById('password-fields').classList.add('hidden');
        
        this.showModal();
    }

    showModal() {
        const modal = document.getElementById('admin-modal');
        modal.classList.add('active');
        modal.classList.remove('opacity-0', 'pointer-events-none');
    }

    closeModal() {
        const modal = document.getElementById('admin-modal');
        modal.classList.remove('active');
        modal.classList.add('opacity-0', 'pointer-events-none');
        this.clearErrors();
    }

    clearErrors() {
        const errorElements = document.querySelectorAll('[id$="-error"]');
        errorElements.forEach(el => {
            el.classList.add('hidden');
            el.textContent = '';
        });
    }

    showError(field, message) {
        const errorElement = document.getElementById(`${field}-error`);
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }

    validateForm() {
        this.clearErrors();
        let isValid = true;
        
        const fullName = document.getElementById('full-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const role = document.getElementById('role').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!fullName) {
            this.showError('full-name', 'Full name is required');
            isValid = false;
        }
        
        if (!email) {
            this.showError('email', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('email', 'Please enter a valid email address');
            isValid = false;
        } else if (this.isDuplicateEmail(email)) {
            this.showError('email', 'This email is already registered');
            isValid = false;
        }
        
        if (!role) {
            this.showError('role', 'Please select a role');
            isValid = false;
        }
        
        // Password validation for new admins
        if (!this.currentEditId) {
            if (!password) {
                this.showError('password', 'Password is required');
                isValid = false;
            } else if (password.length < 6) {
                this.showError('password', 'Password must be at least 6 characters');
                isValid = false;
            }
            
            if (password !== confirmPassword) {
                this.showError('confirm-password', 'Passwords do not match');
                isValid = false;
            }
        }
        
        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isDuplicateEmail(email) {
        return this.admins.some(admin => 
            admin.email === email && admin.id != this.currentEditId
        );
    }

    saveAdmin() {
        if (!this.validateForm()) return;
        
        const formData = {
            fullName: document.getElementById('full-name').value.trim(),
            email: document.getElementById('email').value.trim(),
            role: document.getElementById('role').value,
            status: document.getElementById('status').checked ? 'active' : 'inactive',
            lastLogin: null,
            createdAt: new Date().toISOString(),
            avatar: null
        };
        
        if (this.currentEditId) {
            // Update existing admin
            const index = this.admins.findIndex(a => a.id == this.currentEditId);
            if (index !== -1) {
                // Preserve some existing data
                formData.id = this.currentEditId;
                formData.createdAt = this.admins[index].createdAt;
                formData.lastLogin = this.admins[index].lastLogin;
                this.admins[index] = formData;
            }
        } else {
            // Add new admin
            formData.id = this.generateId();
            this.admins.push(formData);
        }
        
        this.saveToStorage();
        this.closeModal();
        this.filterAdmins();
        
        // Show success message (you can implement toast notifications)
        this.showNotification('Admin saved successfully!', 'success');
    }

    generateId() {
        return this.admins.length > 0 ? Math.max(...this.admins.map(a => a.id)) + 1 : 1;
    }

    confirmDelete(id) {
        this.currentAction = 'delete';
        this.currentAdminId = id;
        const admin = this.admins.find(a => a.id == id);
        
        document.getElementById('confirm-title').textContent = 'Delete Admin';
        document.getElementById('confirm-message').textContent = 
            `Are you sure you want to delete ${admin.fullName}? This action cannot be undone.`;
        document.getElementById('confirm-action').textContent = 'Delete';
        document.getElementById('confirm-action').className = 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition';
        
        this.showConfirmModal();
    }

    confirmDisable(id) {
        this.currentAction = 'disable';
        this.currentAdminId = id;
        const admin = this.admins.find(a => a.id == id);
        
        document.getElementById('confirm-title').textContent = 'Disable Admin';
        document.getElementById('confirm-message').textContent = 
            `Are you sure you want to disable ${admin.fullName}? They will not be able to login until re-enabled.`;
        document.getElementById('confirm-action').textContent = 'Disable';
        document.getElementById('confirm-action').className = 'bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition';
        
        this.showConfirmModal();
    }

    confirmResetPassword(id) {
        this.currentAction = 'resetPassword';
        this.currentAdminId = id;
        const admin = this.admins.find(a => a.id == id);
        
        document.getElementById('confirm-title').textContent = 'Reset Password';
        document.getElementById('confirm-message').textContent = 
            `Are you sure you want to reset password for ${admin.fullName}? A temporary password will be generated and sent to their email.`;
        document.getElementById('confirm-action').textContent = 'Reset Password';
        document.getElementById('confirm-action').className = 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition';
        
        this.showConfirmModal();
    }

    showConfirmModal() {
        const modal = document.getElementById('confirm-modal');
        modal.classList.add('active');
        modal.classList.remove('opacity-0', 'pointer-events-none');
    }

    closeConfirmModal() {
        const modal = document.getElementById('confirm-modal');
        modal.classList.remove('active');
        modal.classList.add('opacity-0', 'pointer-events-none');
        this.currentAction = null;
        this.currentAdminId = null;
    }

    executeAction() {
        switch (this.currentAction) {
            case 'delete':
                this.deleteAdmin(this.currentAdminId);
                break;
            case 'disable':
                this.disableAdmin(this.currentAdminId);
                break;
            case 'resetPassword':
                this.resetPassword(this.currentAdminId);
                break;
        }
        this.closeConfirmModal();
    }

    deleteAdmin(id) {
        this.admins = this.admins.filter(admin => admin.id != id);
        this.saveToStorage();
        this.filterAdmins();
        this.showNotification('Admin deleted successfully!', 'success');
    }

    disableAdmin(id) {
        const admin = this.admins.find(a => a.id == id);
        if (admin) {
            admin.status = 'inactive';
            this.saveToStorage();
            this.filterAdmins();
            this.showNotification('Admin disabled successfully!', 'success');
        }
    }

    enableAdmin(id) {
        const admin = this.admins.find(a => a.id == id);
        if (admin) {
            admin.status = 'active';
            this.saveToStorage();
            this.filterAdmins();
            this.showNotification('Admin enabled successfully!', 'success');
        }
    }

    resetPassword(id) {
        // In a real application, this would send an email with reset instructions
        this.showNotification('Password reset instructions sent to admin email!', 'success');
    }

    showNotification(message, type = 'info') {
        // Simple notification implementation - you can enhance this with a proper toast library
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// Initialize the admin manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdminManager();
});