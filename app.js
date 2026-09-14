const API_BASE_URL = 'https://tga-furniture-app.vercel.app';

let activeUser = null;
let activeBranchView = 'galenbindunuwewa';
let selectedItem = null;
let activePayPayload = null;
let currentReportsCache = [];
let filteredReportsCache = [];
let enteredPin = "";
let activeCategory = 'furniture';
let currentLanguage = 'en';

const translations = {
    en: {
        settings: "Settings",
        appearance: "Appearance",
        language: "Language / භාෂාව",
        manageAccounts: "Manage Accounts",
        selectRole: "Select Role",
        assignBranch: "Assign Branch",
        saveUser: "Save User",
        logout: "Log Out",
        gallery: "Gallery",
        addItem: "+ Add Item",
        reports: "Sales Reports",
        cleanup: "System Cleanup Options",
        alerts: "Notifications & Alerts",
        navGallery: "Gallery",
        navReports: "Reports",
        navAlerts: "Alerts",
        optGb: "Galenbindunuwewa",
        optMh: "Mihinthale",
        optAll: "All Branches",
        menuPdf: "Download PDF Report",
        menuCleanup: "System Cleanup",
        clearRead: "Clear Read",
        clearAll: "Clear All",
        lblBranchFilter: "Branch",
        lblMonthFilter: "Month",
        lblSortBy: "Sort By",
        pdfModalTitle: "Select PDF Report Type",
        pdfOptToday: "Today's Report",
        pdfOptMonth: "Selected Month Report",
        pdfOptYear: "Current Year Report",
        pdfOptAll: "All Sales Report"
    },
    si: {
        settings: "සැකසීම්",
        appearance: "පෙනුම (Theme)",
        language: "භාෂාව / Language",
        manageAccounts: "ගිණුම් කළමනාකරණය",
        selectRole: "තනතුර තෝරන්න",
        assignBranch: "ශාඛාව පවරන්න",
        saveUser: "සුරකින්න",
        logout: "පද්ධතියෙන් ඉවත් වන්න",
        gallery: "භාණ්ඩ ගැලරිය",
        addItem: "+ අලුත් භාණ්ඩයක්",
        reports: "අලෙවි වාර්තා",
        cleanup: "පද්ධති පිරිසිදු කිරීම්",
        alerts: "දැනුම්දීම්",
        navGallery: "ගැලරිය",
        navReports: "වාර්තා",
        navAlerts: "දැනුම්දීම්",
        optGb: "ගලෙන්බිඳුනුවැව",
        optMh: "මිහින්තලේ",
        optAll: "සියලුම ශාඛා",
        menuPdf: "PDF වාර්තාව ලබාගන්න",
        menuCleanup: "පද්ධතිය පිරිසිදු කරන්න",
        clearRead: "කියවූ ඒවා ඉවත් කරන්න",
        clearAll: "සියල්ල ඉවත් කරන්න",
        lblBranchFilter: "ශාඛාව",
        lblMonthFilter: "මාසය",
        lblSortBy: "පිළිවෙල තෝරන්න",
        pdfModalTitle: "PDF වාර්තා වර්ගය තෝරන්න",
        pdfOptToday: "අද දින වාර්තාව",
        pdfOptMonth: "තෝරාගත් මාසයේ වාර්තාව",
        pdfOptYear: "මෙම වසරේ වාර්තාව",
        pdfOptAll: "සියලුම අලෙවි වාර්තා"
    }
};

window.onload = () => {
    const savedPin = localStorage.getItem('tga_user_pin');
    const savedUserId = localStorage.getItem('tga_user_id');
    if (savedPin && savedUserId) {
        document.getElementById('login-box').classList.add('hidden');
        document.getElementById('pin-box').classList.remove('hidden');
    }
};
// ==========================================
// Language & Theme Logic
// ==========================================
function openFullSettingsPage() {
    document.getElementById('sec-settings').classList.remove('hidden');
}

function closeFullSettingsPage() {
    document.getElementById('sec-settings').classList.add('hidden');
}

function setTheme(theme) {
    localStorage.setItem('tga_theme', theme);
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('theme-dark-btn').className = "w-1/2 py-2.5 rounded-xl font-bold text-xs border border-[#67412c] bg-[#67412c] text-white";
        document.getElementById('theme-light-btn').className = "w-1/2 py-2.5 rounded-xl font-bold text-xs border border-[#e2d7cd] bg-slate-100 text-[#2c221e] dark-btn-sec";
    } else {
        document.body.classList.remove('dark-theme');
        document.getElementById('theme-light-btn').className = "w-1/2 py-2.5 rounded-xl font-bold text-xs border border-[#67412c] bg-[#67412c] text-white";
        document.getElementById('theme-dark-btn').className = "w-1/2 py-2.5 rounded-xl font-bold text-xs border border-[#e2d7cd] bg-slate-100 text-[#2c221e] dark-btn-sec";
    }
}

function changeAppLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('tga_lang', lang);
    const t = translations[lang];

    document.getElementById('setting-language-select').value = lang;
    document.getElementById('lang-btn-settings').innerText = t.settings;
    document.getElementById('lang-settings-heading').innerText = t.settings;
    document.getElementById('lang-setting-appearance').innerText = t.appearance;
    document.getElementById('lang-setting-language').innerText = t.language;
    document.getElementById('lang-setting-accounts').innerText = t.manageAccounts;
    document.getElementById('lang-lbl-role').innerText = t.selectRole;
    document.getElementById('lang-lbl-branch').innerText = t.assignBranch;
    document.getElementById('lang-btn-saveuser').innerText = t.saveUser;
    document.getElementById('lang-btn-logout').innerText = t.logout;

    document.getElementById('lang-gallery-title').innerText = t.gallery;
    document.getElementById('lang-btn-additem').innerText = t.addItem;
    document.getElementById('lang-reports-title').innerText = t.reports;
    document.getElementById('lang-btn-cleanup').innerText = t.cleanup;
    document.getElementById('lang-notif-title').innerText = t.alerts;

    document.getElementById('lang-nav-gallery').innerText = t.navGallery;
    document.getElementById('lang-nav-reports').innerText = t.navReports;
    document.getElementById('lang-nav-alerts').innerText = t.navAlerts;

    document.getElementById('opt-gb').innerText = t.optGb;
    document.getElementById('opt-mh').innerText = t.optMh;
    document.getElementById('opt-all').innerText = t.optAll;

    document.getElementById('menu-pdf-opt').innerText = t.menuPdf;
    document.getElementById('menu-cleanup-opt').innerText = t.menuCleanup;

    document.getElementById('btn-clear-read').innerText = t.clearRead;
    document.getElementById('btn-clear-all').innerText = t.clearAll;

    document.getElementById('lbl-branch-filter').innerText = t.lblBranchFilter;
    document.getElementById('lbl-month-filter').innerText = t.lblMonthFilter;
    document.getElementById('lbl-sort-by').innerText = t.lblSortBy;

    document.getElementById('pdf-modal-title').innerText = t.pdfModalTitle;
    document.getElementById('pdf-opt-today').innerText = t.pdfOptToday;
    document.getElementById('pdf-opt-month').innerText = t.pdfOptMonth;
    document.getElementById('pdf-opt-year').innerText = t.pdfOptYear;
    document.getElementById('pdf-opt-all').innerText = t.pdfOptAll;
}

function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('tga_user_id');
        localStorage.removeItem('tga_user_pin');
        location.reload();
    }
}

// ==========================================
// Gallery & Branch Filtering
// ==========================================
function onGalleryBranchChange(branch) {
    activeBranchView = branch;
    loadGallery();
}

function filterGalleryCategory(category) {
    activeCategory = category;
    document.getElementById('cat-tab-furniture').className = category === 'furniture' ? 'w-1/3 py-1.5 rounded-lg text-xs font-bold transition bg-[#67412c] text-white' : 'w-1/3 py-1.5 rounded-lg text-xs font-bold transition text-[#67412c] dark-text';
    document.getElementById('cat-tab-arpico').className = category === 'arpico' ? 'w-1/3 py-1.5 rounded-lg text-xs font-bold transition bg-[#67412c] text-white' : 'w-1/3 py-1.5 rounded-lg text-xs font-bold transition text-[#67412c] dark-text';
    document.getElementById('cat-tab-helix').className = category === 'helix' ? 'w-1/3 py-1.5 rounded-lg text-xs font-bold transition bg-[#67412c] text-white' : 'w-1/3 py-1.5 rounded-lg text-xs font-bold transition text-[#67412c] dark-text';
    
    renderGallery();
}

function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!window.galleryItemsCache) return;

    const filteredItems = window.galleryItemsCache.filter(item => (item.category || 'furniture') === activeCategory);

    if (filteredItems.length === 0) {
        grid.innerHTML = `<p class="text-xs text-slate-400 col-span-2 text-center py-4">There are no items in this category.</p>`;
        return;
    }

    grid.innerHTML = filteredItems.map(item => `
        <div onclick="openItemOptions('${item._id}')" class="bg-white dark-bg-box dark-border p-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between cursor-pointer">
            <img src="${item.photo || 'https://via.placeholder.com/150'}" class="w-full h-28 object-cover rounded-xl bg-slate-100">
            <div class="mt-2 space-y-1">
                <h4 class="font-bold text-xs text-slate-800 dark-text-heading truncate">${item.name}</h4>
                <p class="text-[10px] text-slate-400 dark-text-sub">Size: ${item.size}</p>
                <p class="text-xs font-bold text-indigo-600 dark-text">Rs. ${item.sellingPrice || 0}</p>
                <span class="inline-block text-[9px] ${item.quantity <= 2 ? 'bg-rose-100 text-rose-600 font-bold' : 'bg-slate-100 text-slate-600 dark-btn-sec'} px-2 py-0.5 rounded-md font-bold">
                    Qty: ${item.quantity} ${item.quantity <= 2 ? '(Low Stock)' : ''}
                </span>
            </div>
        </div>
    `).join('');
}

// ==========================================
// Notification Management
// ==========================================
function checkLowStockNotifications(items) {
    if (!items) return;

    const lowStockItems = items.filter(item => item.quantity <= 2);
    const badge = document.getElementById('notif-badge');
    const notifList = document.getElementById('notification-list');

    if (badge) badge.innerText = lowStockItems.length;

    if (notifList) {
        if (lowStockItems.length === 0) {
            notifList.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No notifications.</p>`;
        } else {
            notifList.innerHTML = lowStockItems.map(item => `
                <div id="notif-${item._id}" class="bg-amber-50 border border-amber-200 p-3 rounded-xl flex justify-between items-center text-xs dark-bg-box dark-border">
                    <div class="flex items-start space-x-2">
                        <svg class="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                        <div>
                            <p class="font-bold text-amber-900 dark-text">Low Stock Alert: ${item.name}</p>
                            <p class="text-amber-700 dark-text-sub">${item.name} stock level is currently at <b>${item.quantity}</b>.</p>
                        </div>
                    </div>
                    <button onclick="clearSingleNotification('notif-${item._id}')" class="text-amber-800 hover:text-amber-950 p-1">
                        <svg class="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            `).join('');
        }
    }
}

function clearSingleNotification(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function clearNotifications(type) {
    const notifList = document.getElementById('notification-list');
    if (!notifList) return;

    if (type === 'all' || type === 'selected') {
        notifList.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">Notifications cleared.</p>`;
        document.getElementById('notif-badge').innerText = '0';
    }
}

// ==========================================
// Reports, Sorting & PDF Logic
// ==========================================
function toggleReportMenu() {
    const menu = document.getElementById('report-3dot-menu');
    menu.classList.toggle('hidden');
}

function openPdfModal() {
    if (activeUser && activeUser.role !== 'admin') {
        alert('PDF download option is only available for Admin users.');
        return;
    }
    toggleReportMenu();
    document.getElementById('modal-pdf-options').classList.remove('hidden');
}

async function fetchReports() {
    const branch = document.getElementById('report-branch-select').value;
    try {
        const res = await fetch(`${API_BASE_URL}/api/reports/${branch}`);
        const sales = await res.json();
        currentReportsCache = sales || [];
        applyReportFilters();
    } catch (err) {
        console.error('Failed to fetch reports:', err);
    }
}

function applyReportFilters() {
    const selectedMonth = document.getElementById('report-month-select').value; // YYYY-MM
    const sortBy = document.getElementById('report-sort-select').value;

    let filtered = [...currentReportsCache];

    // Month Filtering
    if (selectedMonth) {
        filtered = filtered.filter(s => {
            if (!s.saleDate) return false;
            return s.saleDate.substring(0, 7) === selectedMonth;
        });
    }

    // Sorting
    filtered.sort((a, b) => {
        const priceA = a.totalAmount || ((a.sellingPrice || 0) * (a.quantity || 1));
        const priceB = b.totalAmount || ((b.sellingPrice || 0) * (b.quantity || 1));
        const dateA = new Date(a.saleDate || 0);
        const dateB = new Date(b.saleDate || 0);

        if (sortBy === 'date-desc') return dateB - dateA;
        if (sortBy === 'date-asc') return dateA - dateB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'payment-cash') return (a.paymentType === 'cash' ? -1 : 1);
        if (sortBy === 'payment-installment') return (a.paymentType === 'installment' ? -1 : 1);
        return 0;
    });

    filteredReportsCache = filtered;
    renderReportList(filtered);
}

function renderReportList(sales) {
    const container = document.getElementById('report-preview-list');

    if (!sales || sales.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No sales records found for selected filters.</p>`;
        return;
    }

    const isAdmin = activeUser && activeUser.role === 'admin';

    container.innerHTML = sales.map(s => {
        const totalAmount = s.totalAmount || ((s.sellingPrice || 0) * (s.quantity || 1));
        const telNumber = s.customerTel ? s.customerTel.trim() : '';

        return `
        <div class="bg-white dark-bg-box dark-border p-4 rounded-xl border border-[#e2d7cd] shadow-sm text-xs space-y-2">
            <div class="flex justify-between font-bold border-b border-[#e2d7cd] dark-border pb-1.5 text-xs text-[#2c221e] dark-text-heading">
                <span>${s.customerName} (${s.customerArea || 'N/A'})</span>
                <span class="${s.paymentType === 'cash' ? 'text-emerald-700' : 'text-[#8c5a3c]'}">${s.paymentType.toUpperCase()}</span>
            </div>
            
            <p class="text-slate-700 dark-text-sub">
                Item: <b>${s.itemName || 'Furniture Item'}</b> | Qty: ${s.quantity} | 
                Tel: ${telNumber ? `<a href="tel:${telNumber}" class="text-indigo-600 font-bold underline">${telNumber}</a>` : 'N/A'}
            </p>
            
            <div class="flex justify-between bg-[#f4ede4] dark-bg-page p-2 rounded-lg text-[11px] font-bold text-[#67412c] dark-text">
                <span>Total Amount: Rs. ${totalAmount}</span>
                ${isAdmin ? `<span>Profit: Rs. ${s.profit || 0}</span>` : ''}
            </div>

            ${s.paymentType === 'installment' && s.installments ? `
                <div class="space-y-1 bg-slate-50 dark-bg-page p-2.5 rounded-lg border border-[#e2d7cd] dark-border">
                    ${s.installments.map(inst => `
                        <div class="flex justify-between items-center text-[11px]">
                            <span class="text-slate-600 dark-text-sub">Month 0${inst.monthNumber} (${new Date(inst.dueDate).toLocaleDateString()})</span>
                            <button onclick="promptInstallmentPay('${s._id}', ${inst.monthNumber})" class="font-bold ${inst.status === 'paid' ? 'text-emerald-600' : 'text-rose-500'}">
                                ${inst.status === 'paid' ? '✓ Paid' : '✗ Unpaid'}
                            </button>
                        </div>
                    `).join('')}
                </div>
            ` : `<p class="text-emerald-600 font-bold text-[11px]">Status: ✓ Fully Paid</p>`}

            ${isAdmin ? `
                <div class="pt-1 flex justify-end">
                    <button onclick="returnAndDeleteReport('${s._id}')" class="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center space-x-1">
                        <svg class="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        <span>Return / Delete Sale</span>
                    </button>
                </div>
            ` : ''}
        </div>
        `;
    }).join('');
}

function downloadReportPDF(type) {
    closeModal('modal-pdf-options');

    let reportsToExport = [...currentReportsCache];
    const todayStr = new Date().toISOString().split('T')[0];
    const currentYearStr = new Date().getFullYear().toString();
    const selectedMonth = document.getElementById('report-month-select').value;

    if (type === 'today') {
        reportsToExport = reportsToExport.filter(s => s.saleDate && s.saleDate.startsWith(todayStr));
    } else if (type === 'month') {
        if (selectedMonth) {
            reportsToExport = reportsToExport.filter(s => s.saleDate && s.saleDate.startsWith(selectedMonth));
        }
    } else if (type === 'year') {
        reportsToExport = reportsToExport.filter(s => s.saleDate && s.saleDate.startsWith(currentYearStr));
    }

    if (reportsToExport.length === 0) {
        alert('No data available for the selected PDF option.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setTextColor(103, 65, 44);
    doc.setFontSize(16);
    doc.text(`TGA Furniture - Sales Report (${type.toUpperCase()})`, 14, 15);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Branch: ${document.getElementById('report-branch-select').value.toUpperCase()} | Generated: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableRows = [];
    let grandTotalAmount = 0;
    let grandTotalProfit = 0;

    reportsToExport.forEach((s, index) => {
        const totalAmount = s.totalAmount || ((s.sellingPrice || 0) * (s.quantity || 1));
        const profit = s.profit || 0;

        grandTotalAmount += totalAmount;
        grandTotalProfit += profit;

        tableRows.push([
            index + 1,
            s.customerName || 'N/A',
            s.itemName || 'Item',
            s.quantity || 1,
            `Rs. ${totalAmount}`,
            `Rs. ${profit}`,
            s.paymentType ? s.paymentType.toUpperCase() : 'CASH',
            s.saleDate ? new Date(s.saleDate).toLocaleDateString() : 'N/A'
        ]);
    });

    doc.autoTable({
        startY: 28,
        head: [['#', 'Customer', 'Item', 'Qty', 'Total Amount', 'Profit', 'Payment', 'Date']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [103, 65, 44], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [244, 237, 228] }
    });

    const finalY = doc.lastAutoTable.finalY || 30;
    doc.setFontSize(11);
    doc.setTextColor(44, 34, 30);
    doc.setFont(undefined, 'bold');
    
    doc.text(`Total Sales Amount : Rs. ${grandTotalAmount}`, 14, finalY + 10);
    doc.text(`Total Profit       : Rs. ${grandTotalProfit}`, 14, finalY + 17);

    // PDF එක New Tab එකකින් View කිරීමට:
const pdfBlobUrl = doc.output('bloburl');
window.open(pdfBlobUrl, '_blank');
}

// ==========================================
// Authentication, Items & App Logic
// ==========================================
function pressKey(num) {
    if (enteredPin.length < 6) {
        enteredPin += num;
        updatePinDots();
        if (enteredPin.length === 6) handlePinSubmit();
    }
}

function deleteKey() {
    enteredPin = enteredPin.slice(0, -1);
    updatePinDots();
}

function updatePinDots() {
    const circles = document.querySelectorAll('#pin-dots .pin-circle');
    circles.forEach((circle, index) => {
        if (index < enteredPin.length) {
            circle.classList.add('filled');
        } else {
            circle.classList.remove('filled');
        }
    });
}

async function handleLogin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    try {
        const res = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
        });

        const data = await res.json();
        if (res.ok) {
            activeUser = data;
            localStorage.setItem('tga_user_id', data.userId);
            localStorage.setItem('tga_user_pin', data.pin);
            initAppUI();
        } else {
            alert(data.error || 'Login failed.');
        }
    } catch (err) {
        alert('Server lost connection.');
    }
}

async function handlePinSubmit() {
    const pin = enteredPin;
    const userId = localStorage.getItem('tga_user_id');

    try {
        const res = await fetch(`${API_BASE_URL}/api/verify-pin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, pin })
        });

        const data = await res.json();
        if (res.ok) {
            activeUser = { userId, role: data.role, branch: data.branch };
            initAppUI();
        } else {
            alert('PIN is wrong! Try again.');
            enteredPin = "";
            updatePinDots();
        }
    } catch (err) {
        alert('Server lost the connection.');
    }
}

function showLoginFallback() {
    enteredPin = "";
    updatePinDots();
    document.getElementById('pin-box').classList.add('hidden');
    document.getElementById('login-box').classList.remove('hidden');
}

function initAppUI() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('header-user-role').innerText = `Role: ${activeUser.role.toUpperCase()}`;

    // Settings Button එක සියලුම පරිශීලකයින්ට (Admin & Managers) දිස්වේ
    const settingsBtn = document.getElementById('admin-settings-btn');
    if (settingsBtn) settingsBtn.classList.remove('hidden');

    const gallerySelectContainer = document.getElementById('gallery-branch-select-container');
    const reportSelectContainer = document.getElementById('report-branch-select-container');

    if (activeUser.role === 'admin') {
        // Admin සදහා Manage Accounts සහ Cleanup කොටස් විවෘත වේ
        document.getElementById('admin-cleanup-container')?.classList.remove('hidden');
        document.getElementById('admin-menu-cleanup')?.classList.remove('hidden');
        document.getElementById('admin-accounts-section')?.classList.remove('hidden'); 
        
        if (gallerySelectContainer) gallerySelectContainer.classList.remove('hidden');
        if (reportSelectContainer) reportSelectContainer.classList.remove('hidden');

        activeBranchView = document.getElementById('gallery-branch-select')?.value || 'galenbindunuwewa';
    } else {
        // Manager සදහා Manage Accounts සහ Admin පමණක් භාවිතා කරන කොටස් Hide වේ
        activeBranchView = activeUser.branch;
        
        document.getElementById('add-item-btn')?.classList.add('hidden');
        document.getElementById('btn-opt-edit')?.classList.add('hidden');
        document.getElementById('btn-opt-delete')?.classList.add('hidden');
        document.getElementById('admin-menu-cleanup')?.classList.add('hidden');
        document.getElementById('admin-cleanup-container')?.classList.add('hidden');
        
        // Settings ඇතුළත ඇති Manage Accounts කොටස Managers ලට Hide කෙරේ
        document.getElementById('admin-accounts-section')?.classList.add('hidden'); 

        if (gallerySelectContainer) gallerySelectContainer.classList.add('hidden');
        if (reportSelectContainer) reportSelectContainer.classList.add('hidden');

        const gallerySelect = document.getElementById('gallery-branch-select');
        const reportSelect = document.getElementById('report-branch-select');
        if (gallerySelect) gallerySelect.value = activeUser.branch;
        if (reportSelect) reportSelect.value = activeUser.branch;
    }

    loadGallery();
    fetchReports();
}

// Gallery render වන විට Non-admin නම් Branch Name එක පෙන්වීම
function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!window.galleryItemsCache) return;

    const filteredItems = window.galleryItemsCache.filter(item => (item.category || 'furniture') === activeCategory);

    if (filteredItems.length === 0) {
        grid.innerHTML = `<p class="text-xs text-slate-400 col-span-2 text-center py-4">There are no items in this category.</p>`;
        return;
    }

    grid.innerHTML = filteredItems.map(item => `
        <div onclick="openItemOptions('${item._id}')" class="bg-white dark-bg-box dark-border p-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between cursor-pointer">
            <img src="${item.photo || 'https://via.placeholder.com/150'}" class="w-full h-28 object-cover rounded-xl bg-slate-100">
            <div class="mt-2 space-y-1">
                <h4 class="font-bold text-xs text-slate-800 dark-text-heading truncate">${item.name}</h4>
                <p class="text-[10px] text-slate-500 font-semibold dark-text-sub">Branch: ${(item.branch || activeBranchView).toUpperCase()}</p>
                <p class="text-[10px] text-slate-400 dark-text-sub">Size: ${item.size}</p>
                <p class="text-xs font-bold text-indigo-600 dark-text">Rs. ${item.sellingPrice || 0}</p>
                <span class="inline-block text-[9px] ${item.quantity <= 2 ? 'bg-rose-100 text-rose-600 font-bold' : 'bg-slate-100 text-slate-600 dark-btn-sec'} px-2 py-0.5 rounded-md font-bold">
                    Qty: ${item.quantity} ${item.quantity <= 2 ? '(Low Stock)' : ''}
                </span>
            </div>
        </div>
    `).join('');
}

// PDF Modal opening restriction logic update
function openPdfModal() {
    toggleReportMenu();
    if (activeUser && activeUser.role !== 'admin') {
        alert('PDF download option is only available for Admin users.');
        return;
    }
    document.getElementById('modal-pdf-options').classList.remove('hidden');
}

async function loadGallery() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/items/${activeBranchView}`);
        const items = await res.json();
        window.galleryItemsCache = items;

        renderGallery();
        checkLowStockNotifications(items);
    } catch (err) {
        console.error('Failed to load gallery items:', err);
    }
}

function openAddItemModal() { document.getElementById('modal-add-item').classList.remove('hidden'); }

async function submitAddItem() {
    const name = document.getElementById('add-name').value;
    const branch = document.getElementById('add-branch').value;
    const category = document.getElementById('add-category').value;
    const materialCost = parseFloat(document.getElementById('add-material-cost').value) || 0;
    const profit = parseFloat(document.getElementById('add-profit').value) || 0;
    const sellingPrice = materialCost + profit;
    const size = document.getElementById('add-size').value;
    const quantity = parseInt(document.getElementById('add-qty').value) || 0;
    
    const photoInput = document.getElementById('add-photo');
    const photoFile = photoInput.files[0];
    const photo = await convertFileToBase64(photoFile);

    if (!name || quantity <= 0) {
        alert('Please enter Item Name and Quantity correctly.');
        return;
    }

    const payload = {
        name,
        category,
        materialCost,
        sellingPrice,
        size,
        quantity,
        photo,
        branch
    };

    try {
        const res = await fetch(`${API_BASE_URL}/api/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Item added successfully!');
            closeModal('modal-add-item');
            loadGallery();
        } else {
            alert('Cannot add item to Gallery.');
        }
    } catch (err) {
        alert('Cannot connect to server.');
    }
}

function openItemOptions(itemId) {
    selectedItem = window.galleryItemsCache.find(i => i._id === itemId);
    document.getElementById('pop-item-name').innerText = selectedItem.name;
    document.getElementById('pop-item-qty').innerText = selectedItem.quantity;
    
    const sellBtn = document.querySelector('#modal-item-options button[onclick="openSellModal()"]');
    if (selectedItem.quantity <= 0) {
        sellBtn.disabled = true;
        sellBtn.classList.add('opacity-50', 'cursor-not-allowed');
        sellBtn.innerText = 'Out of Stock (Qty: 0)';
    } else {
        sellBtn.disabled = false;
        sellBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        sellBtn.innerText = 'Sell This Item';
    }

    document.getElementById('modal-item-options').classList.remove('hidden');
}

function openEditModal() {
    closeModal('modal-item-options');
    document.getElementById('edit-name').value = selectedItem.name;
    document.getElementById('edit-category').value = selectedItem.category || 'furniture';
    document.getElementById('edit-material-cost').value = selectedItem.materialCost || '';
    document.getElementById('edit-selling-price').value = selectedItem.sellingPrice;
    document.getElementById('edit-size').value = selectedItem.size;
    document.getElementById('edit-qty').value = selectedItem.quantity;
    document.getElementById('modal-edit-item').classList.remove('hidden');
}

async function submitEditItem() {
    const photoInput = document.getElementById('edit-photo');
    const photoFile = photoInput.files[0];
    
    let photo = selectedItem.photo || '';
    if (photoFile) {
        photo = await convertFileToBase64(photoFile);
    }

    const payload = {
        name: document.getElementById('edit-name').value,
        category: document.getElementById('edit-category').value,
        materialCost: parseFloat(document.getElementById('edit-material-cost').value),
        sellingPrice: parseFloat(document.getElementById('edit-selling-price').value),
        size: document.getElementById('edit-size').value,
        quantity: parseInt(document.getElementById('edit-qty').value),
        photo: photo
    };

    const res = await fetch(`${API_BASE_URL}/api/items/${selectedItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert('Item updated successfully!');
        closeModal('modal-edit-item');
        loadGallery();
    } else {
        alert('Item update failed!');
    }
}

function calculateSellingPrice(mode) {
    const materialCost = parseFloat(document.getElementById(`${mode}-material-cost`).value) || 0;
    const profit = parseFloat(document.getElementById(`${mode}-profit`).value) || 0;
    const sellingPriceInput = document.getElementById(`${mode}-selling-price`);
    
    if (sellingPriceInput) {
        sellingPriceInput.value = materialCost + profit;
    }
}

function calculateProfit() {
    if (!selectedItem) return;
    const qtyInput = document.getElementById('sell-qty');
    const profitInput = document.getElementById('sell-profit');

    const qty = parseInt(qtyInput?.value) || 1;
    const materialCost = selectedItem.materialCost || 0;
    const sellingPrice = selectedItem.sellingPrice || 0;

    const unitProfit = sellingPrice - materialCost;
    const totalProfit = unitProfit * qty;

    if (profitInput) profitInput.value = totalProfit >= 0 ? totalProfit : 0;
}

function toggleInstallmentOptions() {
    const val = document.getElementById('sell-payment-type').value;
    document.getElementById('installment-months-box').className = val === 'installment' ? 'block space-y-2' : 'hidden';
}

function handleMonthsSelectChange() {
    const val = document.getElementById('sell-months-select').value;
    const customInput = document.getElementById('sell-custom-months');
    if (val === 'custom') {
        customInput.classList.remove('hidden');
    } else {
        customInput.classList.add('hidden');
    }
}

function openSellModal() {
    if (!selectedItem || selectedItem.quantity <= 0) {
        alert('Out of Stock!');
        return;
    }
    closeModal('modal-item-options');
    
    const sellPriceInput = document.getElementById('sell-selling-price');
    if (sellPriceInput) sellPriceInput.value = selectedItem.sellingPrice || 0;

    document.getElementById('modal-sell').classList.remove('hidden');
    calculateProfit();
}

async function submitSell() {
    const qtyInput = parseInt(document.getElementById('sell-qty').value) || 0;

    if (!selectedItem || selectedItem.quantity <= 0) {
        alert('Out of Stock!');
        return;
    }

    if (qtyInput <= 0 || qtyInput > selectedItem.quantity) {
        alert('Invalid Quantity!');
        return;
    }

    let monthsVal = document.getElementById('sell-months-select').value;
    if (monthsVal === 'custom') {
        monthsVal = document.getElementById('sell-custom-months').value;
    }

    const payload = {
        itemId: selectedItem._id,
        customerName: document.getElementById('sell-cust-name').value,
        customerArea: document.getElementById('sell-cust-area').value,
        customerTel: document.getElementById('sell-cust-tel').value,
        quantity: qtyInput,
        saleDate: document.getElementById('sell-date').value || new Date().toISOString().split('T')[0],
        paymentType: document.getElementById('sell-payment-type').value,
        months: monthsVal,
        sellingPrice: selectedItem.sellingPrice,
        profit: parseFloat(document.getElementById('sell-profit').value) || 0,
        branch: activeBranchView
    };

    const res = await fetch(`${API_BASE_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert('Sale successful!');
        closeModal('modal-sell');
        loadGallery();
        fetchReports();
        switchTab('reports');
    } else {
        alert('Sale failed.');
    }
}

async function returnAndDeleteReport(saleId) {
    if (!activeUser || activeUser.role !== 'admin') {
        alert('Admin access required.');
        return;
    }

    if (confirm('Return this item and remove sale? (Quantity will be restored to stock)')) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/sales/${saleId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'user-role': activeUser.role }
            });

            if (res.ok) {
                alert('Sale removed & item returned!');
                fetchReports();
                loadGallery();
            } else {
                alert('Failed to delete sale.');
            }
        } catch (err) {
            alert('Server error.');
        }
    }
}

function promptInstallmentPay(saleId, monthNumber) {
    activePayPayload = { saleId, monthNumber };
    document.getElementById('pay-modal-desc').innerText = `Record Month 0${monthNumber} payment as received?`;
    document.getElementById('modal-pay-installment').classList.remove('hidden');
}

async function confirmInstallmentPayment() {
    const res = await fetch(`${API_BASE_URL}/api/sales/pay-installment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activePayPayload)
    });

    if (res.ok) {
        alert('Payment recorded!');
        closeModal('modal-pay-installment');
        fetchReports();
    }
}

function openCleanupModal() {
    if (!activeUser || activeUser.role !== 'admin') {
        alert('Admin access required.');
        return;
    }
    document.getElementById('modal-cleanup-options').classList.remove('hidden');
}

async function executeCleanup(type) {
    if (confirm('Are you sure you want to clean up selected data?')) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/cleanup?type=${type}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'user-role': activeUser.role }
            });

            if (res.ok) {
                alert('Cleanup successful!');
                closeModal('modal-cleanup-options');
                fetchReports();
                loadGallery();
            }
        } catch (err) {
            alert('Server error.');
        }
    }
}

async function submitCredentialChange() {
    const targetRole = document.getElementById('target-user-role').value;
    const targetBranch = document.getElementById('target-user-branch').value;
    const username = document.getElementById('target-username').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const newPin = document.getElementById('new-pin').value;
    const confirmPin = document.getElementById('confirm-pin').value;

    if (newPassword && newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (newPin && newPin !== confirmPin) {
        alert('PINs do not match!');
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/users/change-credentials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'user-role': activeUser ? activeUser.role : '' },
            body: JSON.stringify({ requesterRole: activeUser ? activeUser.role : '', targetRole, targetBranch, username, newPassword, newPin })
        });

        if (res.ok) {
            alert('User updated successfully!');
            closeFullSettingsPage();
        }
    } catch (err) {
        alert('Server error.');
    }
}

function switchTab(tab) {
    document.getElementById('sec-gallery').className = tab === 'gallery' ? 'block' : 'hidden';
    document.getElementById('sec-reports').className = tab === 'reports' ? 'block' : 'hidden';
    document.getElementById('sec-notifications').className = tab === 'notifications' ? 'block' : 'hidden';

    document.getElementById('nav-gallery').className = tab === 'gallery' ? 'text-indigo-600 flex flex-col items-center' : 'text-slate-400 flex flex-col items-center';
    document.getElementById('nav-reports').className = tab === 'reports' ? 'text-indigo-600 flex flex-col items-center' : 'text-slate-400 flex flex-col items-center';
    document.getElementById('nav-notifs').className = tab === 'notifications' ? 'text-indigo-600 flex flex-col items-center' : 'text-slate-400 flex flex-col items-center';

    if (tab === 'reports') fetchReports();
}

async function deleteSelectedItem() {
    if (!selectedItem) return;
    if (confirm('Delete this item?')) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/items/${selectedItem._id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Item deleted!');
                closeModal('modal-item-options');
                loadGallery();
            }
        } catch (err) {
            alert('Server error.');
        }
    }
}

function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) resolve('');
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function togglePasswordVisibility(inputId, iconId) {
    const inputField = document.getElementById(inputId);
    const iconSvg = document.getElementById(iconId);
    if (!inputField || !iconSvg) return;

    if (inputField.type === "password") {
        inputField.type = "text";
        iconSvg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />`;
    } else {
        inputField.type = "password";
        iconSvg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />`;
    }
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}