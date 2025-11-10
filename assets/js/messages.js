// messages.js - Kunash Enterprises IT Equipment Messages
document.addEventListener('DOMContentLoaded', () => {
    let messages = [];

    const initMessagesPage = () => {
        loadMessages();
        injectSampleDataIfEmpty();
        setupEventListeners();
        updateStats();
    };

    const loadMessages = () => {
        const stored = localStorage.getItem('messages');
        messages = stored ? JSON.parse(stored) : [];
        renderMessagesList();
        updateDashboardMessageCount();
    };

    const injectSampleDataIfEmpty = () => {
        if (messages.length > 0) return;

        const sampleMessages = [
            {
                id: 1,
                name: "Rohan Verma",
                email: "rohan.verma@techsolutions.in",
                phone: "+91 98123 45678",
                subject: "Bulk Order – 150 Laptops for Office Upgrade",
                message: "Hi Kunash Team,\n\nWe are upgrading 150 workstations for our new Mumbai office. Need:\n• Dell Latitude 5430 (i7, 16GB, 512GB SSD)\n• 3-year onsite warranty\n• Docking stations & sleeves\n\nPlease share:\n- Best corporate pricing\n- Delivery timeline (target: 15 Dec)\n- Payment terms (Net 30)\n\nRegards,\nRohan Verma\nIT Procurement Head",
                date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                read: false,
                type: "business"
            },
            {
                id: 2,
                name: "Priya Desai",
                email: "priya.desai@globalbank.com",
                phone: "+91 22 6789 1234",
                subject: "Tender Response – 500 Desktops",
                message: "Dear Sales Team,\n\nWe have released Tender #GB-IT-2025-08 for 500 corporate desktops.\n\nRequesting:\n• Technical specs compliance sheet\n• Pricing with GST\n• AMC options (3/5 years)\n• Past client references (Govt/PSU)\n\nSubmission deadline: 12th Nov\n\nBest,\nPriya Desai\nVP - IT Infrastructure",
                date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                read: true,
                type: "business"
            },
            {
                id: 3,
                name: "Amit Sharma",
                email: "amit.sharma@startuphub.co",
                phone: null,
                subject: "Warranty Claim – Faulty Mouse (Order #KNH-9876)",
                message: "Hi Support,\n\nWe received 50 Logitech MX Master 3S mice in Order #KNH-9876.\n3 units have scroll wheel issues (not clicking).\n\nPlease arrange pickup and replacement under warranty.\nAttaching serial numbers and photos.\n\nUrgent – affects daily operations.\n\nThanks,\nAmit",
                date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                read: false,
                type: "support"
            },
            {
                id: 4,
                name: "Kavya Iyer",
                email: "kavya@cloudnineit.com",
                phone: "+91 98450 11223",
                subject: "Server Quote – 10 Rack Servers",
                message: "Hello,\n\nPlanning data center expansion. Need quote for:\n• 10 x HPE ProLiant DL380 Gen10\n• 2 x Intel Xeon Silver, 64GB RAM, 4TB RAID\n• Redundant PSU, iLO Advanced\n\nInclude:\n• Onsite installation\n• 5-year support\n• Trade-in for old servers\n\nThanks,\nKavya Iyer\nCloud Operations",
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                read: true,
                type: "business"
            },
            {
                id: 5,
                name: "Sanjay Patel",
                email: "sanjay.patel@edutech.ac.in",
                phone: "+91 79 4001 2345",
                subject: "Lab Setup – 40 PCs for Computer Lab",
                message: "Dear Kunash,\n\nSetting up a new IT lab for 40 students.\n\nRequirements:\n• Intel i5, 8GB RAM, 256GB SSD\n• 22\" monitors, keyboard + mouse\n• Windows 11 Pro pre-installed\n• Bulk education discount\n\nNeed delivery by 20th Nov.\n\nRegards,\nProf. Sanjay Patel",
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                read: false,
                type: "business"
            },
            {
                id: 6,
                name: "Neha Kapoor",
                email: "neha.kapoor@finsecure.in",
                phone: null,
                subject: "Network Switch Inquiry – PoE Switches",
                message: "Hi Sales,\n\nNeed 8 x 24-port PoE switches for IP camera deployment.\n\nSpecs:\n• Gigabit, 195W PoE budget\n• Layer 3, VLAN, QoS\n• Rack-mountable\n\nPreferred brands: Cisco, TP-Link, Netgear\n\nPlease send comparison + pricing.\n\nNeha Kapoor\nNetwork Engineer",
                date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                read: true,
                type: "business"
            },
            {
                id: 7,
                name: "Vikram Rao",
                email: "vikram.rao@manufacturing.co",
                phone: "+91 80 2525 8888",
                subject: "RMA Request – 5 Defective Keyboards",
                message: "Support Team,\n\nReceived 100 mechanical keyboards (Order #KNH-8765).\n5 units have stuck spacebar keys.\n\nRequesting RMA and replacement.\nAttaching DOA report and photos.\n\nNeed resolution within 48 hours.\n\nVikram Rao\nIT Manager",
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                read: false,
                type: "support"
            },
            {
                id: 8,
                name: "Ananya Mehta",
                email: "ananya@lawfirm.in",
                phone: "+91 22 6610 5500",
                subject: "Laptop Financing & EMI Options",
                message: "Hi,\n\nWe need 25 MacBook Pro 14\" for our legal team.\n\nQuestions:\n• Do you offer corporate EMI (0% interest)?\n• Can we get AppleCare+ bundled?\n• Trade-in for old Windows laptops?\n\nPlease share financing partners and process.\n\nThanks,\nAnanya Mehta\nAdmin Head",
                date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                read: true,
                type: "business"
            },
            {
                id: 9,
                name: "Rahul Gupta",
                email: "rahul.gupta@healthcare.org",
                phone: "+91 11 4700 9123",
                subject: "Medical-Grade PCs for Hospital",
                message: "Hello,\n\nNeed 30 fanless mini PCs for patient rooms.\n\nMust have:\n• Antimicrobial casing\n• EN60601 certification\n• 3-year warranty\n• VESA mount\n\nPlease confirm availability and lead time.\n\nDr. Rahul Gupta\nBiomedical Engineering",
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                read: false,
                type: "business"
            },
            {
                id: 10,
                name: "Meera Singh",
                email: "meera.singh@resellerpro.com",
                phone: "+91 98111 22334",
                subject: "Partner Program Application",
                message: "Hi Partner Team,\n\nWe are a leading IT reseller with 50+ corporate clients.\n\nInterested in:\n• Kunash Authorized Reseller Program\n• Margin structure\n• MDF support\n• Demo units\n\nPlease send partnership kit and next steps.\n\nBest,\nMeera Singh\nChannel Sales Director",
                date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
                read: true,
                type: "business"
            },
            {
                id: 11,
                name: "Arjun Nair",
                email: "arjun.nair@gamingzone.in",
                phone: "+91 98765 43210",
                subject: "Gaming Peripherals Bulk Order",
                message: "Hi Team,\n\nSetting up new gaming cafe with 50 stations.\n\nNeed:\n• Gaming keyboards (mechanical, RGB)\n• Gaming mice (high DPI, programmable)\n• Headsets with mic\n• Mouse pads (extended)\n\nPlease quote for Razer, Logitech, and Corsair options.\n\nArjun Nair\nOwner",
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                read: false,
                type: "business"
            },
            {
                id: 12,
                name: "Sneha Reddy",
                email: "sneha.reddy@creativeagency.com",
                phone: "+91 90000 12345",
                subject: "Mac Studio Setup for Design Team",
                message: "Hello Kunash,\n\nUpgrading our design department with:\n• 15 x Mac Studio (M2 Ultra)\n• Pro Display XDR monitors\n• Wacom tablets\n• External storage\n\nNeed:\n• Educational pricing\n• Setup assistance\n• AppleCare for Business\n\nSneha Reddy\nCreative Director",
                date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
                read: true,
                type: "business"
            }
        ];

        messages = sampleMessages;
        saveMessages();
        renderMessagesList();
        updateStats();
    };

    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diff = now - date;
            const mins = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);
            if (mins < 60) return `${mins}m ago`;
            if (hours < 24) return `${hours}h ago`;
            if (days < 7) return `${days}d ago`;
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch { return dateStr; }
    };

    const renderMessagesList = (filtered = null) => {
        const list = document.getElementById('messages-list');
        const emptyState = document.getElementById('empty-state');
        const data = filtered || messages;
        
        list.innerHTML = '';
        list.classList.add('animate-fadeIn');

        if (data.length === 0) {
            list.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        list.classList.remove('hidden');

        data.forEach(msg => {
            const el = document.createElement('div');
            el.className = `message-card bg-white rounded-lg shadow p-6 transition-all hover:shadow-md ${msg.read ? 'message-read' : 'message-unread'}`;
            
            const typeBadge = msg.type === 'business' ? 
                '<span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Business</span>' :
                '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Support</span>';
            
            el.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                                ${!msg.read ? '<span class="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>' : ''}
                                ${msg.name}
                            </h3>
                            ${typeBadge}
                        </div>
                        <p class="text-sm text-gray-500">${msg.email}</p>
                    </div>
                    <div class="flex flex-col items-end space-y-1">
                        <span class="text-xs text-gray-500">${formatDate(msg.date)}</span>
                        ${!msg.read ? '<span class="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">New</span>' : ''}
                    </div>
                </div>
                <p class="text-gray-700 mb-4 line-clamp-2">${msg.message}</p>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-500 truncate max-w-xs">${msg.subject || '<em>General Inquiry</em>'}</span>
                    <div class="flex space-x-3">
                        <button class="view-message text-orange-600 hover:text-orange-800 hover:underline" data-id="${msg.id}">View Details</button>
                        <button class="toggle-read text-blue-600 hover:text-blue-800 hover:underline" data-id="${msg.id}">${msg.read ? 'Mark Unread' : 'Mark Read'}</button>
                        <button class="delete-message text-red-600 hover:text-red-800 hover:underline" data-id="${msg.id}">Delete</button>
                    </div>
                </div>
            `;
            list.appendChild(el);
        });
        attachButtonListeners();
    };

    const attachButtonListeners = () => {
        document.querySelectorAll('.view-message').forEach(btn => btn.onclick = e => viewMessage(e.target.dataset.id));
        document.querySelectorAll('.toggle-read').forEach(btn => btn.onclick = e => toggleMessageRead(e.target.dataset.id));
        document.querySelectorAll('.delete-message').forEach(btn => btn.onclick = e => deleteMessage(e.target.dataset.id));
    };

    const viewMessage = (id) => {
        const msg = messages.find(m => m.id == id);
        if (!msg) return showNotification('Message not found', 'error');
        if (!msg.read) { 
            msg.read = true; 
            saveMessages(); 
            updateStats();
        }

        const typeBadge = msg.type === 'business' ? 
            '<span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Business Inquiry</span>' :
            '<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Support Request</span>';

        document.getElementById('message-details').innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h4 class="font-semibold text-orange-600 mb-2">Sender Information</h4>
                    <div class="space-y-2">
                        <p><strong class="text-gray-700">Name:</strong> ${msg.name}</p>
                        <p><strong class="text-gray-700">Email:</strong> <a href="mailto:${msg.email}" class="text-orange-600 hover:underline">${msg.email}</a></p>
                        <p><strong class="text-gray-700">Phone:</strong> ${msg.phone ? `<a href="tel:${msg.phone}" class="text-orange-600 hover:underline">${msg.phone}</a>` : 'N/A'}</p>
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold text-orange-600 mb-2">Message Details</h4>
                    <div class="space-y-2">
                        <p><strong class="text-gray-700">Subject:</strong> ${msg.subject || 'General Inquiry'}</p>
                        <p><strong class="text-gray-700">Received:</strong> ${new Date(msg.date).toLocaleString()}</p>
                        <p><strong class="text-gray-700">Type:</strong> ${typeBadge}</p>
                        <p><strong class="text-gray-700">Status:</strong> <span class="px-2 py-1 text-xs rounded-full ${msg.read ? 'bg-gray-200 text-gray-700' : 'bg-orange-100 text-orange-800'}">${msg.read ? 'Read' : 'Unread'}</span></p>
                    </div>
                </div>
            </div>
            <div>
                <h4 class="font-semibold text-orange-600 mb-2">Message Content</h4>
                <div class="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap border">${msg.message}</div>
            </div>
        `;
        document.getElementById('message-modal').classList.remove('hidden');
        renderMessagesList();
    };

    const toggleMessageRead = (id) => {
        const msg = messages.find(m => m.id == id);
        if (msg) { 
            msg.read = !msg.read; 
            saveMessages(); 
            renderMessagesList(); 
            updateStats();
            showNotification(`Marked as ${msg.read ? 'read' : 'unread'}`, 'success'); 
        }
    };

    const deleteMessage = (id) => {
        if (confirm('Delete this message permanently?')) {
            messages = messages.filter(m => m.id != id);
            saveMessages();
            renderMessagesList();
            updateStats();
            showNotification('Message deleted', 'success');
        }
    };

    const markAllAsRead = () => {
        if (!messages.some(m => !m.read)) return showNotification('No unread messages', 'info');
        messages.forEach(m => m.read = true);
        saveMessages();
        renderMessagesList();
        updateStats();
        showNotification('All messages marked as read', 'success');
    };

    const deleteAllReadMessages = () => {
        const readCount = messages.filter(m => m.read).length;
        if (readCount === 0) return showNotification('No read messages', 'info');
        if (confirm(`Delete ${readCount} read message(s)?`)) {
            messages = messages.filter(m => !m.read);
            saveMessages();
            renderMessagesList();
            updateStats();
            showNotification('Read messages deleted', 'success');
        }
    };

    const saveMessages = () => {
        localStorage.setItem('messages', JSON.stringify(messages));
        updateDashboardMessageCount();
    };

    const updateDashboardMessageCount = () => {
        const unread = messages.filter(m => !m.read).length;
        const badge = document.querySelector('#total-messages');
        if (badge) badge.textContent = unread;
    };

    const updateStats = () => {
        const totalMessages = messages.length;
        const unreadMessages = messages.filter(m => !m.read).length;
        const businessInquiries = messages.filter(m => m.type === 'business').length;
        const supportRequests = messages.filter(m => m.type === 'support').length;

        document.getElementById('total-messages-count').textContent = totalMessages;
        document.getElementById('unread-messages-count').textContent = unreadMessages;
        document.getElementById('business-inquiries-count').textContent = businessInquiries;
        document.getElementById('support-requests-count').textContent = supportRequests;
    };

    const showNotification = (msg, type = 'success') => {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = msg;
        
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
    };

    const searchMessages = () => {
        const term = document.getElementById('search-messages').value.toLowerCase().trim();
        if (!term) return renderMessagesList();
        const filtered = messages.filter(m =>
            m.name.toLowerCase().includes(term) ||
            m.email.toLowerCase().includes(term) ||
            (m.subject || '').toLowerCase().includes(term) ||
            m.message.toLowerCase().includes(term)
        );
        renderMessagesList(filtered);
    };

    const closeMessageModal = () => document.getElementById('message-modal').classList.add('hidden');

    const setupEventListeners = () => {
        document.getElementById('search-messages')?.addEventListener('input', searchMessages);
        document.getElementById('mark-all-read')?.addEventListener('click', markAllAsRead);
        document.getElementById('delete-all-read')?.addEventListener('click', deleteAllReadMessages);
        document.getElementById('close-message-modal')?.addEventListener('click', closeMessageModal);
        document.getElementById('message-modal')?.addEventListener('click', e => { 
            if (e.target.id === 'message-modal') closeMessageModal(); 
        });
    };

    if (window.location.pathname.includes('messages.html')) {
        initMessagesPage();
    }
});