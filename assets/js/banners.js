// ==========================================================
// BANNERS MANAGEMENT - FIXED VIEW MODAL
// File: assets/js/banners.js
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'banners';

    // ------------------------------------------------------
    // Seed sample data
    // ------------------------------------------------------
    const seedBanners = () => {
        if (localStorage.getItem(STORAGE_KEY)) return;
        const sample = [
            { id: 1, title: "Summer Sale", image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80", link: "#", active: true, created: "2023-06-15" },
            { id: 2, title: "New Arrivals", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80", link: "#", active: true, created: "2023-07-10" },
            { id: 3, title: "Winter Collection", image: "https://images.unsplash.com/photo-1558769132-cb25c5d11e85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80", link: "#", active: false, created: "2023-11-05" }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    };

    const getBanners = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const saveBanners = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

    // ------------------------------------------------------
    // Sidebar & View Toggle
    // ------------------------------------------------------
    document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('-translate-x-full');
    });

    const toggleViewBtn = document.getElementById('toggle-view-btn');
    const tableView = document.getElementById('table-view');
    const cardView = document.getElementById('card-view');

    toggleViewBtn?.addEventListener('click', () => {
        if (tableView.classList.contains('hidden')) {
            tableView.classList.remove('hidden');
            cardView.classList.add('hidden');
            toggleViewBtn.innerHTML = 'Card View';
        } else {
            tableView.classList.add('hidden');
            cardView.classList.remove('hidden');
            toggleViewBtn.innerHTML = 'Table View';
            renderBannerCards();
        }
    });

    // ------------------------------------------------------
    // File to Data URL
    // ------------------------------------------------------
    const fileToDataURL = (file) => {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) return reject('Invalid file');
            if (file.size > 5 * 1024 * 1024) return reject('File too large (>5MB)');
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // ------------------------------------------------------
    // Update Preview
    // ------------------------------------------------------
    const updatePreview = (previewEl, url) => {
        if (url) {
            previewEl.style.backgroundImage = `url(${url})`;
            previewEl.innerHTML = '';
        } else {
            previewEl.style.backgroundImage = '';
            previewEl.innerHTML = '<span class="text-gray-500">Preview will appear here</span>';
        }
    };

    // ------------------------------------------------------
    // Tab Switching
    // ------------------------------------------------------
    const setupTabs = (urlTab, uploadTab, urlInput, uploadInput) => {
        urlTab.addEventListener('click', () => {
            urlTab.classList.add('active', 'bg-orange-600', 'text-white');
            urlTab.classList.remove('bg-gray-200', 'text-gray-700');
            uploadTab.classList.remove('active', 'bg-orange-600', 'text-white');
            uploadTab.classList.add('bg-gray-200', 'text-gray-700');
            urlInput.classList.remove('hidden');
            uploadInput.classList.add('hidden');
        });
        uploadTab.addEventListener('click', () => {
            uploadTab.classList.add('active', 'bg-orange-600', 'text-white');
            uploadTab.classList.remove('bg-gray-200', 'text-gray-700');
            urlTab.classList.remove('active', 'bg-orange-600', 'text-white');
            urlTab.classList.add('bg-gray-200', 'text-gray-700');
            uploadInput.classList.remove('hidden');
            urlInput.classList.add('hidden');
        });
    };

    setupTabs(
        document.getElementById('tab-url'),
        document.getElementById('tab-upload'),
        document.getElementById('url-input'),
        document.getElementById('upload-input')
    );

    setupTabs(
        document.getElementById('edit-tab-url'),
        document.getElementById('edit-tab-upload'),
        document.getElementById('edit-url-input'),
        document.getElementById('edit-upload-input')
    );

    // ------------------------------------------------------
    // Add Banner: URL or File
    // ------------------------------------------------------
    const addImageUrlInput = document.getElementById('banner-image-url');
    const addImageFileInput = document.getElementById('banner-image-file');
    const addPreview = document.getElementById('image-preview');
    let addImageData = '';

    addImageUrlInput.addEventListener('input', () => {
        addImageData = addImageUrlInput.value.trim();
        updatePreview(addPreview, addImageData);
    });

    addImageFileInput.addEventListener('change', async () => {
        try {
            const file = addImageFileInput.files[0];
            addImageData = await fileToDataURL(file);
            updatePreview(addPreview, addImageData);
            addImageUrlInput.value = '';
        } catch (err) {
            alert(err);
            addImageFileInput.value = '';
        }
    });

    // ------------------------------------------------------
    // Edit Banner: URL or File
    // ------------------------------------------------------
    const editImageUrlInput = document.getElementById('edit-banner-image-url');
    const editImageFileInput = document.getElementById('edit-banner-image-file');
    const editPreview = document.getElementById('edit-image-preview');
    let editImageData = '';

    editImageUrlInput.addEventListener('input', () => {
        editImageData = editImageUrlInput.value.trim();
        updatePreview(editPreview, editImageData);
    });

    editImageFileInput.addEventListener('change', async () => {
        try {
            const file = editImageFileInput.files[0];
            editImageData = await fileToDataURL(file);
            updatePreview(editPreview, editImageData);
            editImageUrlInput.value = '';
        } catch (err) {
            alert(err);
            editImageFileInput.value = '';
        }
    });

    // ------------------------------------------------------
    // View Modal (FIXED SIZE + CLEAN DETAILS)
    // ------------------------------------------------------
    const viewModal = document.getElementById('view-banner-modal');
    const closeViewBtn = document.getElementById('close-view-modal');

    closeViewBtn.addEventListener('click', () => viewModal.classList.add('hidden'));
    viewModal.addEventListener('click', (e) => {
        if (e.target === viewModal) viewModal.classList.add('hidden');
    });

    window.BannerManager = {
        view: (id) => {
            const banner = getBanners().find(b => b.id === id);
            if (!banner) return;

            document.getElementById('view-banner-title').textContent = banner.title;
            document.getElementById('view-banner-image').src = banner.image;

            const statusEl = document.getElementById('view-banner-status');
            statusEl.textContent = banner.active ? 'Active' : 'Inactive';
            statusEl.className = banner.active ? 'text-green-600' : 'text-red-600';

            document.getElementById('view-banner-created').textContent = banner.created;

            const linkEl = document.getElementById('view-banner-link');
            linkEl.href = banner.link;
            linkEl.textContent = banner.link === '#' ? 'No link set' : banner.link;

            viewModal.classList.remove('hidden');
        },

        toggleActive: (id, isActive) => {
            const banners = getBanners();
            const idx = banners.findIndex(b => b.id === id);
            if (idx > -1) {
                banners[idx].active = isActive;
                saveBanners(banners);
                renderBanners();
                if (cardView && !cardView.classList.contains('hidden')) renderBannerCards();
            }
        },
        remove: (id) => {
            if (!confirm('Delete this banner?')) return;
            saveBanners(getBanners().filter(b => b.id !== id));
            renderBanners();
            if (cardView && !cardView.classList.contains('hidden')) renderBannerCards();
        },
        edit: (id) => {
            const banner = getBanners().find(b => b.id === id);
            if (!banner) return;

            document.getElementById('edit-banner-id').value = banner.id;
            document.getElementById('edit-banner-title').value = banner.title;
            document.getElementById('edit-banner-link').value = banner.link || '';
            document.getElementById('edit-banner-active').checked = banner.active;
            editImageData = banner.image;
            updatePreview(editPreview, banner.image);
            document.getElementById('edit-banner-image-url').value = banner.image.startsWith('http') ? banner.image : '';

            document.getElementById('edit-banner-modal').classList.remove('hidden');
        }
    };

    // ------------------------------------------------------
    // Render Functions
    // ------------------------------------------------------
    const renderBanners = () => {
        const banners = getBanners();
        const tbody = document.querySelector('#banners-table tbody');
        tbody.innerHTML = '';
        banners.forEach(b => {
            const row = document.createElement('tr');
            row.className = b.active ? 'active-banner' : 'inactive-banner';
            row.innerHTML = `
                <td class="py-3 px-4">${b.id}</td>
                <td class="py-3 px-4 font-medium">${b.title}</td>
                <td class="py-3 px-4">
                    <div class="flex items-center">
                        <div class="w-16 h-10 bg-cover bg-center rounded mr-3" style="background-image: url(${b.image})"></div>
                        <a href="${b.image}" target="_blank" class="text-blue-500 hover:underline text-sm">View</a>
                    </div>
                </td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs ${b.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${b.active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="py-3 px-4">${b.created}</td>
                <td class="py-3 px-4">
                    <button onclick="BannerManager.view(${b.id})" class="text-green-600 hover:text-green-800 mr-3" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="BannerManager.edit(${b.id})" class="text-blue-500 hover:text-blue-700 mr-3" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="BannerManager.remove(${b.id})" class="text-red-500 hover:text-red-700" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        updateStats();
    };

    const renderBannerCards = () => {
        const banners = getBanners();
        const container = document.getElementById('card-view');
        container.innerHTML = '';
        banners.forEach(b => {
            const card = document.createElement('div');
            card.className = `bg-white rounded-lg shadow-md banner-card overflow-hidden ${b.active ? 'active-banner' : 'inactive-banner'}`;
            card.innerHTML = `
                <div class="h-48 bg-cover bg-center" style="background-image: url(${b.image})"></div>
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-semibold text-lg">${b.title}</h3>
                        <span class="px-2 py-1 rounded-full text-xs ${b.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${b.active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <p class="text-gray-500 text-sm mb-4">Created: ${b.created}</p>
                    <div class="flex justify-between">
                        <button onclick="BannerManager.toggleActive(${b.id}, ${!b.active})" class="text-sm ${b.active ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}">
                            ${b.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <div>
                            <button onclick="BannerManager.view(${b.id})" class="text-green-600 hover:text-green-800 mr-3" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="BannerManager.edit(${b.id})" class="text-blue-500 hover:text-blue-700 mr-3" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="BannerManager.remove(${b.id})" class="text-red-500 hover:text-red-700" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    };

    const updateStats = () => {
        const banners = getBanners();
        document.getElementById('total-banners').textContent = banners.length;
        document.getElementById('active-banners').textContent = banners.filter(b => b.active).length;
        document.getElementById('inactive-banners').textContent = banners.filter(b => !b.active).length;
    };

    // ------------------------------------------------------
    // Add & Edit Forms (unchanged)
    // ------------------------------------------------------
    const addForm = document.getElementById('add-banner-form');
    const addModal = document.getElementById('add-banner-modal');
    document.getElementById('add-banner-btn').addEventListener('click', () => addModal.classList.remove('hidden'));
    document.getElementById('cancel-banner-btn').addEventListener('click', () => {
        addModal.classList.add('hidden');
        addForm.reset();
        addImageData = '';
        updatePreview(addPreview, '');
        addImageFileInput.value = '';
    });

    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('banner-title').value.trim();
        const link = document.getElementById('banner-link').value.trim();
        const active = document.getElementById('banner-active').checked;
        const image = addImageData;

        if (!title || !image) return alert('Title and Image are required');

        const banners = getBanners();
        const newId = banners.length ? Math.max(...banners.map(b => b.id)) + 1 : 1;
        banners.push({ id: newId, title, image, link: link || '#', active, created: new Date().toISOString().split('T')[0] });
        saveBanners(banners);
        addModal.classList.add('hidden');
        addForm.reset();
        addImageData = '';
        updatePreview(addPreview, '');
        renderBanners();
    });

    const editForm = document.getElementById('edit-banner-form');
    const editModal = document.getElementById('edit-banner-modal');
    document.getElementById('cancel-edit-banner-btn').addEventListener('click', () => {
        editModal.classList.add('hidden');
        editForm.reset();
        editImageData = '';
        updatePreview(editPreview, '');
        editImageFileInput.value = '';
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-banner-id').value);
        const title = document.getElementById('edit-banner-title').value.trim();
        const link = document.getElementById('edit-banner-link').value.trim();
        const active = document.getElementById('edit-banner-active').checked;
        const image = editImageData || editImageUrlInput.value.trim();

        if (!title || !image) return alert('Title and Image are required');

        const banners = getBanners();
        const idx = banners.findIndex(b => b.id === id);
        if (idx > -1) {
            banners[idx] = { ...banners[idx], title, image, link: link || '#', active };
            saveBanners(banners);
            editModal.classList.add('hidden');
            renderBanners();
        }
    });

    // ------------------------------------------------------
    // Init
    // ------------------------------------------------------
    seedBanners();
    renderBanners();
});