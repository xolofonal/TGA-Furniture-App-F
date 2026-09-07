const API_BASE_URL = 'https://tga-furniture-app.vercel.app';

let activeUser = null;
let activeBranchView = 'galenbindunuwewa';
let selectedItem = null;
let activePayPayload = null;
let currentReportsCache = [];
let enteredPin = "";
let activeCategory = 'furniture';

window.onload = () => {
    const savedPin = localStorage.getItem('tga_user_pin');
    const savedUserId = localStorage.getItem('tga_user_id');
    if (savedPin && savedUserId) {
        document.getElementById('login-box').classList.add('hidden');
        document.getElementById('pin-box').classList.remove('hidden');
    }
};

// ==========================================
// Category Switch Logic (Furniture, Arpico, Helix)
// ==========================================
function filterGalleryCategory(category) {
    activeCategory = category;
    
    document.getElementById('cat-tab-furniture').className = category === 'furniture' ? 'w-1/3 py-1.5 rounded-lg text-xs font-bold transition bg-[#67412c] text-white' : 'w-1/3 py-1.5 rounded-lg text-xs font-bold transition text-[#67412c]';
    document.getElementById('cat-tab-arpico').className = category === 'arpico' ? 'w-1/3 py-1.5 rounded-lg text-xs font-bold transition bg-[#67412c] text-white' : 'w-1/3 py-1.5 rounded-lg text-xs font-bold transition text-[#67412c]';
    document.getElementById('cat-tab-helix').className = category === 'helix' ? 'w-1/3 py-1.5 rounded-lg text-xs font-bold transition bg-[#67412c] text-white' : 'w-1/3 py-1.5 rounded-lg text-xs font-bold transition text-[#67412c]';
    
    renderGallery();
}

function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!window.galleryItemsCache) return;

    const filteredItems = window.galleryItemsCache.filter(item => (item.category || 'furniture') === activeCategory);

    if (filteredItems.length === 0) {
        grid.innerHTML = `<p class="text-xs text-slate-400 col-span-2 text-center py-4">මෙම Category එකෙහි Items කිසිවක් නැත.</p>`;
        return;
    }

    grid.innerHTML = filteredItems.map(item => `
        <div onclick="openItemOptions('${item._id}')" class="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between cursor-pointer">
            <img src="${item.photo || 'https://via.placeholder.com/150'}" class="w-full h-28 object-cover rounded-xl bg-slate-100">
            <div class="mt-2 space-y-1">
                <h4 class="font-bold text-xs text-slate-800 truncate">${item.name}</h4>
                <p class="text-[10px] text-slate-400">Size: ${item.size}</p>
                <p class="text-xs font-bold text-indigo-600">Rs. ${item.sellingPrice || 0}</p>
                <span class="inline-block text-[9px] ${item.quantity <= 2 ? 'bg-rose-100 text-rose-600 font-bold' : 'bg-slate-100 text-slate-600'} px-2 py-0.5 rounded-md font-bold">
                    Qty: ${item.quantity} ${item.quantity <= 2 ? '⚠️ Low' : ''}
                </span>
            </div>
        </div>
    `).join('');
}

// ==========================================
// Profit Calculation Logic
// ==========================================
function calculateProfit() {
    if (!selectedItem) return;

    const qtyInput = document.getElementById('sell-qty');
    const profitInput = document.getElementById('sell-profit');

    const qty = parseInt(qtyInput?.value) || 1;
    const materialCost = selectedItem.materialCost || 0;
    const sellingPrice = selectedItem.sellingPrice || 0;

    const unitProfit = sellingPrice - materialCost;
    const totalProfit = unitProfit * qty;

    if (profitInput) {
        profitInput.value = totalProfit >= 0 ? totalProfit : 0;
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

// Push Notifications
async function requestNotificationPermission() {
    if ('serviceWorker' in navigator && 'Notification' in window) {
        try {
            await navigator.serviceWorker.register('/sw.js');
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Push Notifications enabled');
            }
        } catch (err) {
            console.error('Service Worker registration failed:', err);
        }
    }
}

function showPushNotification(title, body) {
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: body,
                icon: 'https://via.placeholder.com/128',
                badge: 'https://via.placeholder.com/128',
                vibrate: [200, 100, 200],
                tag: 'installment-alert'
            });
        });
    }
} 

function checkInstallmentAlerts(sales) {
    if (!sales || sales.length === 0) return;
    const today = new Date().toISOString().split('T')[0];

    sales.forEach(sale => {
        if (sale.paymentType === 'installment' && sale.installments) {
            sale.installments.forEach(inst => {
                const dueDate = new Date(inst.dueDate).toISOString().split('T')[0];
                if (inst.status === 'unpaid' && dueDate <= today) {
                    showPushNotification(
                        "ගෙවීම් හිඟයක් ඇත!", 
                        `${sale.customerName} මහතාගේ Month 0${inst.monthNumber} වාරිකය ගෙවීමට කාලය පැනගොස් ඇත.`
                    );
                }
            });
        }
    });
}

function checkLowStockNotifications(items) {
    if (!items || items.length === 0) return;

    const lowStockItems = items.filter(item => item.quantity <= 2);
    const badge = document.getElementById('notif-badge');
    const notifList = document.getElementById('notification-list');

    if (badge) badge.innerText = lowStockItems.length;

    if (notifList) {
        if (lowStockItems.length === 0) {
            notifList.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No notification yet.</p>`;
        } else {
            notifList.innerHTML = lowStockItems.map(item => `
                <div class="bg-amber-50 border border-amber-200 p-3 rounded-xl flex justify-between items-center text-xs">
                    <div>
                        <p class="font-bold text-amber-900">⚠️ Low Stock </p>
                        <p class="text-amber-700">${item.name} remains at present is <b>${item.quantity}</b> කි.</p>
                    </div>
                    <span class="bg-amber-200 text-amber-900 font-bold px-2 py-1 rounded-lg text-[10px]">
                        Qty: ${item.quantity}
                    </span>
                </div>
            `).join('');
        }
    }
}

// PIN & Auth Logic
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
        const span = circle.querySelector('span');
        if (index < enteredPin.length) {
            circle.classList.add('filled');
            span.innerText = enteredPin[index];
        } else {
            circle.classList.remove('filled');
            span.innerText = '';
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
            alert(data.error || 'Login අසාර්ථක විය.');
        }
    } catch (err) {
        alert('Server සම්බන්ධතාවයේ දෝෂයකි.');
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
            alert('PIN එක වැරදියි! නැවත උත්සාහ කරන්න.');
            enteredPin = "";
            updatePinDots();
        }
    } catch (err) {
        alert('Server සම්බන්ධතාවයේ දෝෂයකි.');
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

    if (activeUser.role === 'admin') {
        document.getElementById('admin-branch-tabs').classList.remove('hidden');
        document.getElementById('admin-cleanup-container').classList.remove('hidden');
        document.getElementById('admin-report-selector').classList.remove('hidden');
        document.getElementById('admin-settings-btn')?.classList.remove('hidden');
        document.getElementById('btn-download-pdf')?.classList.remove('hidden');
        activeBranchView = 'galenbindunuwewa';
    } else {
        activeBranchView = activeUser.branch;
        document.getElementById('add-item-btn').classList.add('hidden');
        document.getElementById('btn-opt-edit').classList.add('hidden');
        document.getElementById('btn-opt-delete').classList.add('hidden');
        document.getElementById('btn-download-pdf')?.classList.add('hidden');
    }

    loadGallery();
    fetchReports(); // <-- මෙතැනට එකතු කරන්න (App එක open කරද්දීම පැරණි Reports load වේ)
    requestNotificationPermission();
}

function selectAdminBranch(branch) {
    activeBranchView = branch;
    document.getElementById('tab-gb').className = branch === 'galenbindunuwewa' ? 'px-4 py-1.5 bg-indigo-600 rounded-lg text-white' : 'px-4 py-1.5 bg-slate-700 rounded-lg text-slate-300';
    document.getElementById('tab-mh').className = branch === 'mihinthale' ? 'px-4 py-1.5 bg-indigo-600 rounded-lg text-white' : 'px-4 py-1.5 bg-slate-700 rounded-lg text-slate-300';
    loadGallery();
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
        alert('කරුණාකර Item Name සහ Quantity නිවැරදිව ඇතුළත් කරන්න.');
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
        branch: activeBranchView || 'galenbindunuwewa'
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
            alert('Can not add to the Gallery.');
        }
    } catch (err) {
        alert('Can not connect to the server..');
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
        alert('මෙම භාණ්ඩය තොගයේ නොමැත (Out of Stock)!');
        return;
    }
    closeModal('modal-item-options');
    
    // Selling Price එක Field එකට Set කිරීම
    const sellPriceInput = document.getElementById('sell-selling-price');
    if (sellPriceInput) {
        sellPriceInput.value = selectedItem.sellingPrice || 0;
    }

    document.getElementById('modal-sell').classList.remove('hidden');
    calculateProfit();
}

async function submitSell() {
    const qtyInput = parseInt(document.getElementById('sell-qty').value) || 0;

    if (!selectedItem || selectedItem.quantity <= 0) {
        alert('මෙම භාණ්ඩය තොගයේ නොමැත!');
        return;
    }

    if (qtyInput <= 0) {
        alert('කරුණාකර නිවැරදි Quantity එකක් ඇතුළත් කරන්න.');
        return;
    }

    if (qtyInput > selectedItem.quantity) {
        alert(`තොගයේ ඇත්තේ භාණ්ඩ ${selectedItem.quantity} ක් පමණි. කරුණාකර ප්‍රමාණය පරීක්ෂා කරන්න.`);
        return;
    }

    let monthsVal = document.getElementById('sell-months-select').value;
    if (monthsVal === 'custom') {
        monthsVal = document.getElementById('sell-custom-months').value;
        if (!monthsVal || monthsVal < 1 || monthsVal > 12) {
            alert('කරුණාකර මාස 1 සිට 12 දක්වා ප්‍රමාණයක් ඇතුළත් කරන්න.');
            return;
        }
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
        profit: parseFloat(document.getElementById('sell-profit').value) || ((selectedItem.sellingPrice - (selectedItem.materialCost || 0)) * qtyInput),
        branch: activeBranchView
    };

    const res = await fetch(`${API_BASE_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert('විකිණීම සාර්ථකයි!');
        closeModal('modal-sell');
        loadGallery();
        fetchReports();
        switchTab('reports');
    } else {
        const errorData = await res.json();
        alert(errorData.error || 'ගනුදෙනුව අසාර්ථක විය.');
    }
}

// Fetch Reports (Profit පෙන්වන්නේ Admin ට පමණි)
async function fetchReports(branch = activeBranchView) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/reports/${branch}`);
        const sales = await res.json();
        currentReportsCache = sales;
        
        checkInstallmentAlerts(sales);

        const container = document.getElementById('report-preview-list');

        if (!sales || sales.length === 0) {
            container.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No Reports found.</p>`;
            return;
        }

        const isAdmin = activeUser && activeUser.role === 'admin';

        container.innerHTML = sales.map(s => {
            const totalAmount = s.totalAmount || ((s.sellingPrice || 0) * (s.quantity || 1));
            return `
            <div class="bg-white p-4 rounded-xl border border-[#e2d7cd] shadow-sm text-xs space-y-2">
                <div class="flex justify-between font-bold border-b border-[#e2d7cd] pb-1.5 text-xs text-[#2c221e]">
                    <span>${s.customerName} (${s.customerArea || 'N/A'})</span>
                    <span class="${s.paymentType === 'cash' ? 'text-emerald-700' : 'text-[#8c5a3c]'}">${s.paymentType.toUpperCase()}</span>
                </div>
                <p class="text-slate-700">Item: <b>${s.itemName || 'Furniture Item'}</b> | Qty: ${s.quantity} | Tel: ${s.customerTel}</p>
                
                <div class="flex justify-between bg-[#f4ede4] p-2 rounded-lg text-[11px] font-bold text-[#67412c]">
                    <span>Total Amount: Rs. ${totalAmount}</span>
                    ${isAdmin ? `<span>Profit: Rs. ${s.profit || 0}</span>` : ''}
                </div>

                ${s.paymentType === 'installment' && s.installments ? `
                    <div class="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-[#e2d7cd]">
                        ${s.installments.map(inst => `
                            <div class="flex justify-between items-center text-[11px]">
                                <span class="text-slate-600">Month 0${inst.monthNumber} (${new Date(inst.dueDate).toLocaleDateString()})</span>
                                <button onclick="promptInstallmentPay('${s._id}', ${inst.monthNumber})" class="font-bold ${inst.status === 'paid' ? 'text-emerald-600' : 'text-rose-500'}">
                                    ${inst.status === 'paid' ? '✓ Paid' : '✗ Unpaid'}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                ` : `<p class="text-emerald-600 font-bold text-[11px]">Status: ✓ Fully Paid</p>`}

                <!-- Return / Delete Report Option (Only Admin) -->
                ${isAdmin ? `
                    <div class="pt-1 flex justify-end">
                        <button onclick="returnAndDeleteReport('${s._id}')" class="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center space-x-1">
                            <span>🗑️ Return Item (Delete Sale)</span>
                        </button>
                    </div>
                ` : ''}
            </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Failed to fetch reports:', err);
    }
}

// Return වූ විට Report එක Delete කිරීමේ ශ්‍රිතය (Admin Only)
async function returnAndDeleteReport(saleId) {
    if (!activeUser || activeUser.role !== 'admin') {
        alert('මෙම ක්‍රියාව සිදු කිරීමට Admin ලෙස ලොග් විය යුතුය.');
        return;
    }

    if (confirm('මෙම භාණ්ඩය Return එකක් ලෙස සලකා Report එකෙන් ඉවත් කිරීමට ඔබට විශ්වාසද? (මෙහිදී අදාළ Item එකෙහි Quantity එක නැවත එකතු වේ)')) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/sales/${saleId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'user-role': activeUser.role
                }
            });

            if (res.ok) {
                alert('භාණ්ඩය Return එකක් ලෙස සලකා වාර්තාවෙන් ඉවත් කරන ලදී!');
                fetchReports();
                loadGallery();
            } else {
                alert('Report එක ඉවත් කිරීම අසාර්ථක විය.');
            }
        } catch (err) {
            alert('Server සම්බන්ධතාවයේ දෝෂයකි.');
        }
    }
}

function downloadReportPDF() {
    if (!activeUser || activeUser.role !== 'admin') {
        alert('Month-end PDF වාර්තා ලබා ගත හැක්කේ Admin හට පමණි.');
        return;
    }

    if (!currentReportsCache || currentReportsCache.length === 0) {
        alert('No Data to Download.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setTextColor(103, 65, 44);
    doc.setFontSize(16);
    doc.text("TGA Furniture - Monthly Sales Report", 14, 15);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Branch: ${activeBranchView.toUpperCase()} | Generated Date: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableRows = [];
    let grandTotalAmount = 0;
    let grandTotalProfit = 0;

    currentReportsCache.forEach((s, index) => {
        const totalAmount = s.totalAmount || ((s.sellingPrice || 0) * (s.quantity || 1));
        const profit = s.profit || 0;

        grandTotalAmount += totalAmount;
        grandTotalProfit += profit;

        const rowData = [
            index + 1,
            s.customerName || 'N/A',
            s.itemName || 'Item',
            s.quantity || 1,
            `Rs. ${totalAmount}`,
            `Rs. ${profit}`,
            s.paymentType ? s.paymentType.toUpperCase() : 'CASH',
            s.saleDate ? new Date(s.saleDate).toLocaleDateString() : 'N/A'
        ];
        tableRows.push(rowData);
    });

    // වගුව සෑදීම
    doc.autoTable({
        startY: 28,
        head: [['#', 'Customer Name', 'Item', 'Qty', 'Total Amount', 'Profit', 'Payment', 'Date']],
        body: tableRows,
        theme: 'striped',
        headStyles: { 
            fillColor: [103, 65, 44],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [244, 237, 228]
        }
    });

    // වගුව අවසන් වන Y පිහිටුම ලබා ගැනීම
    const finalY = doc.lastAutoTable.finalY || 30;

    // Total Amount සහ Total Profit සටහන් කිරීම
    doc.setFontSize(11);
    doc.setTextColor(44, 34, 30);
    doc.setFont(undefined, 'bold');
    
    doc.text(`Total Sales Amount : Rs. ${grandTotalAmount}`, 14, finalY + 10);
    doc.text(`Total Profit       : Rs. ${grandTotalProfit}`, 14, finalY + 17);

    // --- Mobile Friendly PDF Download Fix ---
    const fileName = `TGA_Sales_Report_${activeBranchView}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // PDF එක Blob එකක් ලෙස ලබා ගැනීම
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    // Anchor Element එකක් සාදා Download එක Trigger කිරීම
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // Clean up
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    }, 100);
}

function promptInstallmentPay(saleId, monthNumber) {
    activePayPayload = { saleId, monthNumber };
    document.getElementById('pay-modal-desc').innerText = `Month 0${monthNumber} සඳහා ගෙවීම් ලබාගත්තේ යැයි සටහන් කරන්නද?`;
    document.getElementById('modal-pay-installment').classList.remove('hidden');
}

async function confirmInstallmentPayment() {
    const res = await fetch(`${API_BASE_URL}/api/sales/pay-installment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activePayPayload)
    });

    if (res.ok) {
        alert('ගෙවීම් සටහන් කිරීම සාර්ථකයි!');
        closeModal('modal-pay-installment');
        fetchReports();
    }
}

function openCleanupModal() {
    if (!activeUser || activeUser.role !== 'admin') {
        alert('මෙම ක්‍රියාව සිදු කිරීමට Admin ලෙස ලොග් විය යුතුය.');
        return;
    }
    document.getElementById('modal-cleanup-options').classList.remove('hidden');
}

async function executeCleanup(type) {
    let confirmMsg = "";
    if (type === 'full') confirmMsg = 'පද්ධතියේ සියලුම දත්ත (Sales & Gallery Items) ඉවත් කිරීමට ඔබට විශ්වාසද?';
    if (type === 'reports') confirmMsg = 'සියලුම Sales Reports ඉවත් කිරීමට ඔබට විශ්වාසද?';
    if (type === 'gallery') confirmMsg = 'සියලුම Gallery Items ඉවත් කිරීමට ඔබට විශ්වාසද?';

    if (confirm(confirmMsg)) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/cleanup?type=${type}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'user-role': activeUser.role
                }
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message || 'Cleanup ක්‍රියාවලිය සාර්ථකයි!');
                closeModal('modal-cleanup-options');
                fetchReports();
                loadGallery();
            } else {
                alert(data.error || 'Cleanup ක්‍රියාවලිය අසාර්ථක විය.');
            }
        } catch (err) {
            console.error('Cleanup Fetch Error:', err);
            alert('Server සම්බන්ධතාවයේ දෝෂයකි.');
        }
    }
}

async function submitCredentialChange() {
    const targetRole = document.getElementById('target-user-role').value;
    const targetBranch = document.getElementById('target-user-branch').value;
    const username = document.getElementById('target-username').value;
    const newPassword = document.getElementById('new-password').value;
    const newPin = document.getElementById('new-pin').value;

    if (!newPassword && !newPin) {
        alert('කරුණාකර නව Password එකක් හෝ PIN එකක් ඇතුළත් කරන්න.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/users/change-credentials`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'user-role': activeUser ? activeUser.role : ''
            },
            body: JSON.stringify({ 
                requesterRole: activeUser.role,
                targetRole, 
                newPassword, 
                newPin 
            })
        });

        if (res.ok) {
            alert('පරිශීලක තොරතුරු සාර්ථකව යාවත්කාලීන විය!');
            closeModal('modal-admin-settings');
        } else {
            alert('යාවත්කාලීන කිරීම අසාර්ථක විය.');
        }
    } catch (err) {
        alert('Server සම්බන්ධතාවයේ දෝෂයකි.');
    }
}

// app_11.js හි line 332-340 අතර ඇති switchTab ශ්‍රිතය පහත පරිදි සකසන්න:

function switchTab(tab) {
    document.getElementById('sec-gallery').className = tab === 'gallery' ? 'block' : 'hidden';
    document.getElementById('sec-reports').className = tab === 'reports' ? 'block' : 'hidden';
    document.getElementById('sec-notifications').className = tab === 'notifications' ? 'block' : 'hidden';

    document.getElementById('nav-gallery').className = tab === 'gallery' ? 'text-indigo-600 flex flex-col items-center' : 'text-slate-400 flex flex-col items-center';
    document.getElementById('nav-reports').className = tab === 'reports' ? 'text-indigo-600 flex flex-col items-center' : 'text-slate-400 flex flex-col items-center'; // <-- 'nav-[#a89282]' වෙනුවට 'nav-reports' යොදන්න
    document.getElementById('nav-notifs').className = tab === 'notifications' ? 'text-indigo-600 flex flex-col items-center' : 'text-slate-400 flex flex-col items-center';

    if (tab === 'reports') fetchReports();
}

async function deleteSelectedItem() {
    if (!selectedItem) return;
    if (confirm('මෙම item එක ඉවත් කරන්නද?')) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/items/${selectedItem._id}`, { 
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                alert('Item එක සාර්ථකව ඉවත් කරන ලදී!');
                closeModal('modal-item-options');
                loadGallery();
            } else {
                alert('Item එක Delete කිරීමට නොහැකි විය.');
            }
        } catch (err) {
            alert('Server සම්බන්ධතාවයේ දෝෂයකි.');
        }
    }
}

function openAdminSettingsModal() { document.getElementById('modal-admin-settings').classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }