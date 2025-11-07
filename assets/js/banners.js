// ==========================================================
// BANNERS MANAGEMENT – 4 FIXED IMAGE SLOTS + RESPONSIVE MODALS + IMAGE SLIDER + TOGGLE SWITCH
// File: assets/js/banners.js
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'banners';
    let currentSlide = 0;
    // ---------- Seed ----------
    const seedBanners = () => {
        if (localStorage.getItem(STORAGE_KEY)) return;
        const sample = [
            { id: 1, title: "Summer Sale", page: "home", images: [
                "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
            ], link: "#", active: true, created: "2023-06-15" }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    };
    const getBanners = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const saveBanners = arr => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    // ---------- File → DataURL ----------
    const fileToDataURL = file => new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) return reject('Invalid file');
        if (file.size > 5 * 1024 * 1024) return reject('File too large (>5MB)');
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    // ---------- Preview Helper ----------
    const updatePreview = (previewEl, url) => {
        if (url) {
            previewEl.style.backgroundImage = `url(${url})`;
            previewEl.innerHTML = `<div class="remove-btn">X</div>`;
            previewEl.querySelector('.remove-btn').onclick = e => {
                e.stopPropagation();
                previewEl.style.backgroundImage = '';
                previewEl.innerHTML = `<span class="text-gray-500 text-sm">No image selected</span>`;
                const input = previewEl.closest('div').querySelector('input[type=file]');
                if (input) input.value = '';
            };
        } else {
            previewEl.style.backgroundImage = '';
            previewEl.innerHTML = `<span class="text-gray-500 text-sm">No image selected</span>`;
        }
    };
    // ---------- ADD IMAGE SLOTS ----------
    const addImages = ['', '', '', ''];
    for (let i = 1; i <= 4; i++) {
        const fileInput = document.getElementById(`add-image-file-${i}`);
        const preview = document.getElementById(`add-image-preview-${i}`);
        fileInput.addEventListener('change', async () => {
            try {
                const dataUrl = await fileToDataURL(fileInput.files[0]);
                addImages[i - 1] = dataUrl;
                updatePreview(preview, dataUrl);
            } catch (err) { alert(err); fileInput.value = ''; }
        });
        preview.addEventListener('click', () => fileInput.click());
    }
    // ---------- EDIT IMAGE SLOTS ----------
    let editImages = [];
    const bindEditSlot = i => {
        const fileInput = document.getElementById(`edit-image-file-${i}`);
        const preview = document.getElementById(`edit-image-preview-${i}`);
        fileInput.addEventListener('change', async () => {
            try {
                const dataUrl = await fileToDataURL(fileInput.files[0]);
                editImages[i - 1] = dataUrl;
                updatePreview(preview, dataUrl);
            } catch (err) { alert(err); fileInput.value = ''; }
        });
        preview.addEventListener('click', () => fileInput.click());
    };
    for (let i = 1; i <= 4; i++) bindEditSlot(i);
    // ---------- TOGGLE TEXT UPDATE ----------
    const updateToggleText = (checkboxId, textId) => {
        const checkbox = document.getElementById(checkboxId);
        const text = document.getElementById(textId);
        if (!checkbox || !text) return;
        const update = () => {
            text.textContent = checkbox.checked ? 'Active Banner' : 'Inactive Banner';
            text.className = checkbox.checked ? 'ml-3 text-green-600 font-medium' : 'ml-3 text-red-600 font-medium';
        };
        checkbox.addEventListener('change', update);
        update(); // initial
    };
    updateToggleText('banner-active', 'banner-status-text');
    updateToggleText('edit-banner-active', 'edit-status-text');
    // ---------- IMAGE SLIDER ----------
    const showSlide = (index, images) => {
        const slides = document.getElementById('view-slides');
        const dots = document.getElementById('view-dots');
        const total = images.length;
        if (index >= total) currentSlide = 0;
        if (index < 0) currentSlide = total - 1;
        slides.style.transform = `translateX(-${currentSlide * 100}%)`;
        dots.innerHTML = '';
        images.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'dot';
            if (i === currentSlide) dot.classList.add('active');
            dot.onclick = () => { currentSlide = i; showSlide(currentSlide, images); };
            dots.appendChild(dot);
        });
    };
    // ---------- VIEW MODAL ----------
    const viewModal = document.getElementById('view-banner-modal');
    const closeViewBtn = document.getElementById('close-view-modal');
    closeViewBtn.addEventListener('click', () => viewModal.classList.add('hidden'));
    viewModal.addEventListener('click', e => { if (e.target === viewModal) viewModal.classList.add('hidden'); });
    document.querySelector('.prev-btn')?.addEventListener('click', () => {
        currentSlide--;
        showSlide(currentSlide, window.currentBannerImages || []);
    });
    document.querySelector('.next-btn')?.addEventListener('click', () => {
        currentSlide++;
        showSlide(currentSlide, window.currentBannerImages || []);
    });
    // ---------- GLOBAL BannerManager ----------
    window.BannerManager = {
        view: id => {
            const b = getBanners().find(x => x.id === id);
            if (!b) return;
            document.getElementById('view-banner-title').textContent = b.title;
            const pageMap = { home:'Home Page', products:'Products', services:'Services', about:'About Us', contact:'Contact Us' };
            document.getElementById('view-banner-page').textContent = pageMap[b.page] || b.page;
            const slidesContainer = document.getElementById('view-slides');
            slidesContainer.innerHTML = '';
            window.currentBannerImages = b.images.filter(img => img);
            if (window.currentBannerImages.length === 0) {
                slidesContainer.innerHTML = '<div class="slide"><p class="text-center text-gray-500">No images</p></div>';
            } else {
                window.currentBannerImages.forEach(img => {
                    const slide = document.createElement('div');
                    slide.className = 'slide';
                    slide.innerHTML = `<img src="${img}" alt="Banner Image">`;
                    slidesContainer.appendChild(slide);
                });
            }
            currentSlide = 0;
            showSlide(currentSlide, window.currentBannerImages);
            const st = document.getElementById('view-banner-status');
            st.textContent = b.active ? 'Active' : 'Inactive';
            st.className = b.active ? 'text-green-600' : 'text-red-600';
            document.getElementById('view-banner-created').textContent = b.created;
            const lnk = document.getElementById('view-banner-link');
            lnk.href = b.link; lnk.textContent = b.link === '#' ? 'No link set' : b.link;
            viewModal.classList.remove('hidden');
        },
        toggleActive: (id, active) => {
            const arr = getBanners();
            const idx = arr.findIndex(x => x.id === id);
            if (idx > -1) { arr[idx].active = active; saveBanners(arr); renderBanners(); if (!document.getElementById('card-view').classList.contains('hidden')) renderBannerCards(); }
        },
        remove: id => {
            if (!confirm('Delete this banner?')) return;
            saveBanners(getBanners().filter(x => x.id !== id));
            renderBanners();
            if (!document.getElementById('card-view').classList.contains('hidden')) renderBannerCards();
        },
        edit: id => {
            const b = getBanners().find(x => x.id === id);
            if (!b) return;
            document.getElementById('edit-banner-id').value = b.id;
            document.getElementById('edit-banner-title').value = b.title;
            document.getElementById('edit-banner-link').value = b.link === '#' ? '' : b.link;
            document.getElementById('edit-banner-page').value = b.page;
            const checkbox = document.getElementById('edit-banner-active');
            checkbox.checked = b.active;
            checkbox.dispatchEvent(new Event('change')); // trigger text update
            editImages = [...b.images];
            while (editImages.length < 4) editImages.push('');
            for (let i = 0; i < 4; i++) {
                const preview = document.getElementById(`edit-image-preview-${i + 1}`);
                updatePreview(preview, editImages[i]);
                document.getElementById(`edit-image-file-${i + 1}`).value = '';
            }
            document.getElementById('edit-banner-modal').classList.remove('hidden');
        }
    };
    // ---------- RENDER ----------
    const pageNames = { home:'Home Page', products:'Products', services:'Services', about:'About Us', contact:'Contact Us' };
    const renderBanners = () => {
        const banners = getBanners();
        const tbody = document.querySelector('#banners-table tbody');
        tbody.innerHTML = '';
        banners.forEach(b => {
            const tr = document.createElement('tr');
            tr.className = b.active ? 'active-banner' : 'inactive-banner';
            tr.innerHTML = `
                <td class="py-3 px-4">${b.id}</td>
                <td class="py-3 px-4 font-medium">${b.title}</td>
                <td class="py-3 px-4">${pageNames[b.page]||b.page}</td>
                <td class="py-3 px-4">
                    <div class="flex items-center">
                        <div class="w-16 h-10 bg-cover bg-center rounded mr-3" style="background-image:url(${b.images[0]||''})"></div>
                        <span class="text-xs text-gray-500">${b.images.length} image${b.images.length>1?'s':''}</span>
                    </div>
                </td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded-full text-xs ${b.active?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}">
                        ${b.active?'Active':'Inactive'}
                    </span>
                </td>
                <td class="py-3 px-4">${b.created}</td>
                <td class="py-3 px-4">
                    <button onclick="BannerManager.view(${b.id})" class="text-green-600 hover:text-green-800 mr-3" title="View"><i class="fas fa-eye"></i></button>
                    <button onclick="BannerManager.edit(${b.id})" class="text-blue-500 hover:text-blue-700 mr-3" title="Edit"><i class="fas fa-edit"></i></button>
                    <button onclick="BannerManager.remove(${b.id})" class="text-red-500 hover:text-red-700" title="Delete"><i class="fas fa-trash"></i></button>
                </td>`;
            tbody.appendChild(tr);
        });
        updateStats();
    };
    const renderBannerCards = () => {
        const container = document.getElementById('card-view');
        container.innerHTML = '';
        getBanners().forEach(b => {
            const card = document.createElement('div');
            card.className = `bg-white rounded-lg shadow-md banner-card overflow-hidden ${b.active?'active-banner':'inactive-banner'}`;
            card.innerHTML = `
                <div class="h-48 bg-cover bg-center" style="background-image:url(${b.images[0]||''})"></div>
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-semibold text-lg">${b.title}</h3>
                        <span class="px-2 py-1 rounded-full text-xs ${b.active?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}">
                            ${b.active?'Active':'Inactive'}
                        </span>
                    </div>
                    <p class="text-gray-500 text-sm mb-1">Page: ${pageNames[b.page]||b.page}</p>
                    <p class="text-gray-500 text-sm mb-4">Created: ${b.created}</p>
                    <div class="flex justify-between">
                        <button onclick="BannerManager.toggleActive(${b.id},${!b.active})" class="text-sm ${b.active?'text-yellow-600 hover:text-yellow-800':'text-green-600 hover:text-green-800'}">
                            ${b.active?'Deactivate':'Activate'}
                        </button>
                        <div>
                            <button onclick="BannerManager.view(${b.id})" class="text-green-600 hover:text-green-800 mr-3" title="View"><i class="fas fa-eye"></i></button>
                            <button onclick="BannerManager.edit(${b.id})" class="text-blue-500 hover:text-blue-700 mr-3" title="Edit"><i class="fas fa-edit"></i></button>
                            <button onclick="BannerManager.remove(${b.id})" class="text-red-500 hover:text-red-700" title="Delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>`;
            container.appendChild(card);
        });
    };
    const updateStats = () => {
        const arr = getBanners();
        document.getElementById('total-banners').textContent = arr.length;
        document.getElementById('active-banners').textContent = arr.filter(x=>x.active).length;
        document.getElementById('inactive-banners').textContent = arr.filter(x=>!x.active).length;
    };
    // ---------- ADD FORM ----------
    const addModal = document.getElementById('add-banner-modal');
    const addForm = document.getElementById('add-banner-form');
    document.getElementById('add-banner-btn').addEventListener('click', () => {
        addModal.classList.remove('hidden');
        addImages.fill('');
        for (let i = 1; i <= 4; i++) {
            updatePreview(document.getElementById(`add-image-preview-${i}`), '');
            document.getElementById(`add-image-file-${i}`).value = '';
        }
        document.getElementById('banner-active').checked = true;
        document.getElementById('banner-active').dispatchEvent(new Event('change'));
    });
    document.getElementById('cancel-banner-btn').addEventListener('click', () => {
        addModal.classList.add('hidden');
        addForm.reset();
    });
    addForm.addEventListener('submit', e => {
        e.preventDefault();
        const title = document.getElementById('banner-title').value.trim();
        const link = document.getElementById('banner-link').value.trim();
        const page = document.getElementById('banner-page').value;
        const active = document.getElementById('banner-active').checked;
        const images = addImages.filter(x => x);
        if (!title || !page || images.length === 0) return alert('Title, Page and at least one image are required');
        const arr = getBanners();
        const newId = arr.length ? Math.max(...arr.map(x=>x.id)) + 1 : 1;
        arr.push({ id:newId, title, page, images, link:link||'#', active, created:new Date().toISOString().split('T')[0] });
        saveBanners(arr);
        addModal.classList.add('hidden');
        renderBanners();
    });
    // ---------- EDIT FORM ----------
    const editModal = document.getElementById('edit-banner-modal');
    const editForm = document.getElementById('edit-banner-form');
    document.getElementById('cancel-edit-banner-btn').addEventListener('click', () => {
        editModal.classList.add('hidden');
        editForm.reset();
    });
    editForm.addEventListener('submit', e => {
        e.preventDefault();
        const id = +document.getElementById('edit-banner-id').value;
        const title = document.getElementById('edit-banner-title').value.trim();
        const link = document.getElementById('edit-banner-link').value.trim();
        const page = document.getElementById('edit-banner-page').value;
        const active = document.getElementById('edit-banner-active').checked;
        const images = editImages.filter(x => x);
        if (!title || !page || images.length === 0) return alert('Title, Page and at least one image are required');
        const arr = getBanners();
        const idx = arr.findIndex(x => x.id === id);
        if (idx > -1) {
            arr[idx] = { ...arr[idx], title, page, images, link:link||'#', active };
            saveBanners(arr);
            editModal.classList.add('hidden');
            renderBanners();
            if (!document.getElementById('card-view').classList.contains('hidden')) renderBannerCards();
        }
    });
    // ---------- VIEW TOGGLE ----------
    const toggleViewBtn = document.getElementById('toggle-view-btn');
    const tableView = document.getElementById('table-view');
    const cardView = document.getElementById('card-view');
    toggleViewBtn.addEventListener('click', () => {
        if (tableView.classList.contains('hidden')) {
            tableView.classList.remove('hidden');
            cardView.classList.add('hidden');
            toggleViewBtn.textContent = 'Card View';
            renderBanners(); // Add this
        } else {
            tableView.classList.add('hidden');
            cardView.classList.remove('hidden');
            toggleViewBtn.textContent = 'Table View';
            renderBannerCards();
        }
    });
    // Close all modals when clicking outside
    document.querySelectorAll('#add-banner-modal, #edit-banner-modal, #view-banner-modal').forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    });
    // ---------- INIT ----------
    seedBanners();
    // FIX: Defer rendering to ensure DOM is ready
    setTimeout(() => {
        renderBanners();
        updateStats();
    }, 0);
});