// ==========================================
// 1. الإعدادات الأساسية
// ==========================================
const CART_KEY = 'userCart'; 
const PRODUCTS_KEY = 'myProducts'; // نفس المفتاح المستخدم في الإدارة
let shippingHierarchy = JSON.parse(localStorage.getItem('shippingHierarchy')) || [];
let storeConfig = JSON.parse(localStorage.getItem('storeConfig')) || { whatsapp: "", serviceFee: 0 };


// ==========================================
// 2. عرض المنتجات في الصفحات (الربط مع الإدارة)
// ==========================================
function renderProducts(filterCategory = 'all') {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    grid.innerHTML = ''; // مسح المحتوى القديم

    // تصفية المنتجات حسب القسم (خضروات، فاكهة، إلخ)
    const filtered = filterCategory === 'all' 
        ? products 
        : products.filter(p => p.category === filterCategory);

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding: 20px;">قريباً.. سيتم إضافة منتجات في هذا القسم 🌿</p>`;
        return;
    }

    filtered.forEach(p => {
        grid.innerHTML += `
            <div class="product-card">
                <div class="product-image">
                    <img src="${p.image}" alt="${p.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p class="price">${p.price} ج.م <span class="unit">/ ${p.unit || 'كيلو'}</span></p>
                    <button class="add-to-cart-btn" onclick="addToCart(${p.id})">
                        <i class="fas fa-shopping-basket"></i> أضف للسلة
                    </button>
                </div>
            </div>
        `;
    });
}

// دالة إضافة منتج للسلة
window.addToCart = function(id) {
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const product = products.find(p => p.id === id);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    const index = cart.findIndex(item => item.id === id);

    if (index > -1) {
        cart[index].qty++;
        cart[index].total = cart[index].qty * cart[index].price;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            qty: 1,
            total: product.price
        });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
    
    // تأثير بصري عند الإضافة
    alert(`تم إضافة ${product.name} للسلة ✅`);
}

// ==========================================
// 3. تحديث عداد السلة
// ==========================================
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    const totalItems = cart.reduce((sum, item) => sum + Number(item.qty), 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// ==========================================
// 4. نظام الشحن وعرض الفاتورة (الكود الخاص بك)
// ==========================================
// ... (دوال populateCountries, updateProvinces, calculateShipping تبقى كما هي)
// تأكد من بقاء دوال الشحن التي أرسلتها في ملفك لأنها سليمة برمجياً.

// ==========================================
// 5. إرسال الطلب عبر الواتساب (تعديل بسيط للربط)
// ==========================================
function sendOrder() {
    // ... (نفس كود sendOrder الخاص بك)
    // تأكد فقط أن رقم الواتساب يسحب من storeConfig.whatsapp الذي يتم ضبطه في الإدارة
    if(!storeConfig.whatsapp) {
        return alert("خطأ: لم يتم ضبط رقم واتساب الإدارة في الإعدادات!");
    }
    // (بقية كود الواتساب الخاص بك...)
}

// ==========================================
// 6. التشغيل التلقائي عند التحميل
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    
    // تحديد القسم الحالي بناءً على عنوان الصفحة أو وسم معين
    // مثال: لو الصفحة اسمها veg.html يعرض الخضروات فقط
    const bodyId = document.body.id; // افترض أنك تعطي id للـ body في كل صفحة
    if (bodyId === 'veg-page') renderProducts('خضروات');
    else if (bodyId === 'fruit-page') renderProducts('الفاكهة');
    else if (bodyId === 'dry-fruit-page') renderProducts('فاكهة مجففة');
    else renderProducts('all'); // يعرض الكل في الرئيسية

    if (document.getElementById('cust-country')) populateCountries();
    if (document.getElementById('invoice-box')) showFinalInvoice();
});


// ==========================================
// 2. تحديث عداد السلة
// ==========================================
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    const totalItems = cart.reduce((sum, item) => sum + Number(item.qty), 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// ==========================================
// 3. نظام الشحن الهرمي (الدول، المحافظات، المدن)
// ==========================================
function populateCountries() {
    const countrySelect = document.getElementById('cust-country');
    if (!countrySelect) return;
    const uniqueCountries = [...new Set(shippingHierarchy.map(item => item.country))];
    countrySelect.innerHTML = '<option value="">اختر الدولة</option>';
    uniqueCountries.forEach(c => {
        let opt = document.createElement('option');
        opt.value = opt.innerText = c;
        countrySelect.appendChild(opt);
    });
}

function updateProvinces() {
    const country = document.getElementById('cust-country')?.value;
    const provSelect = document.getElementById('cust-province');
    if (!provSelect) return;
    provSelect.innerHTML = '<option value="">اختر المحافظة</option>';
    provSelect.disabled = !country;
    const filtered = shippingHierarchy.filter(item => item.country === country);
    const uniqueProvs = [...new Set(filtered.map(item => item.province))];
    uniqueProvs.forEach(p => {
        let opt = document.createElement('option');
        opt.value = opt.innerText = p;
        provSelect.appendChild(opt);
    });
    showFinalInvoice();
}

function updateCities() {
    const country = document.getElementById('cust-country')?.value;
    const province = document.getElementById('cust-province')?.value;
    const citySelect = document.getElementById('cust-city');
    if (!citySelect) return;
    citySelect.innerHTML = '<option value="">اختر المدينة / المنطقة</option>';
    citySelect.disabled = !province;
    const filtered = shippingHierarchy.filter(item => item.country === country && item.province === province);
    const uniqueCities = [...new Set(filtered.map(item => item.city))];
    uniqueCities.forEach(ct => {
        let opt = document.createElement('option');
        opt.value = opt.innerText = ct;
        citySelect.appendChild(opt);
    });
    showFinalInvoice();
}

function updateNeighborhoods() {
    const country = document.getElementById('cust-country')?.value;
    const province = document.getElementById('cust-province')?.value;
    const city = document.getElementById('cust-city')?.value;
    const neighSelect = document.getElementById('cust-neighborhood');
    if (!neighSelect) return;
    neighSelect.innerHTML = '<option value="">اختر الحي / القرية</option>';
    neighSelect.disabled = !city;
    const filtered = shippingHierarchy.filter(item => item.country === country && item.province === province && item.city === city);
    const uniqueNeighs = [...new Set(filtered.map(item => item.neighborhood))];
    uniqueNeighs.forEach(n => {
        let opt = document.createElement('option');
        opt.value = opt.innerText = n;
        neighSelect.appendChild(opt);
    });
    showFinalInvoice();
}

// ==========================================
// 4. حساب الشحن وعرض الفاتورة
// ==========================================
function calculateShipping() {
    const c = document.getElementById('cust-country')?.value;
    const p = document.getElementById('cust-province')?.value;
    const ct = document.getElementById('cust-city')?.value;
    const n = document.getElementById('cust-neighborhood')?.value;
    const path = shippingHierarchy.find(item => item.country === c && item.province === p && item.city === ct && item.neighborhood === n);
    return path ? (path.prices.c + path.prices.p + path.prices.ct + path.prices.n) : 0;
}

function showFinalInvoice() {
    const box = document.getElementById('invoice-box');
    if (!box) return;
    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    let subtotal = cart.reduce((sum, item) => sum + Number(item.total), 0);
    let shipping = calculateShipping();
    let serviceFee = parseFloat(storeConfig.serviceFee) || 0;
    let total = subtotal + shipping + serviceFee;
    window.lastCalculatedTotal = total;

    box.innerHTML = `
    <div style="text-align:center; border-bottom:1px solid #ddd; margin-bottom:10px; padding-bottom:5px; color: #27ae60; font-weight: bold;">🧾 تفاصيل الفاتورة</div>
    ${cart.map(item => `<div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom: 5px;"><span>${item.name} (x${item.qty})</span><span>${Number(item.total).toFixed(2)} ج.م</span></div>`).join('')}
    <div style="margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
        <p style="display:flex; justify-content:space-between; margin: 3px 0;"><span>المجموع:</span> <span>${subtotal.toFixed(2)} ج.م</span></p>
        <p style="display:flex; justify-content:space-between; margin: 3px 0;"><span>التوصيل:</span> <span style="color: ${shipping === 0 ? '#27ae60' : 'inherit'}; font-weight: bold;">${shipping > 0 ? shipping.toFixed(2) + ' ج.م' : 'مجاني'}</span></p>
        <p style="display:flex; justify-content:space-between; margin: 3px 0;"><span>الخدمة:</span> <span>${serviceFee > 0 ? serviceFee.toFixed(2) + ' ج.م' : 'مجاني'}</span></p>
        <div style="background:#27ae60; color:white; padding:10px; border-radius:8px; text-align:center; margin-top:10px;">
            <b style="font-size: 1.2rem;">الإجمالي النهائي: ${total.toFixed(2)} ج.م</b>
        </div>
    </div>`;
}

// ==========================================
// 5. السيريال وإرسال الواتساب
// ==========================================
function generateDailyOrderID() {
    const now = new Date();
    const dateKey = now.toLocaleDateString('en-GB').replace(/\//g, ''); 
    let tracker = JSON.parse(localStorage.getItem('orderTracker')) || { date: '', lastCount: 0 };
    
    if (tracker.date !== dateKey) {
        tracker = { date: dateKey, lastCount: 1 };
    } else {
        tracker.lastCount++;
    }
    localStorage.setItem('orderTracker', JSON.stringify(tracker));

    const prefix = "R"; 
    return `${prefix}-${dateKey}-${tracker.lastCount.toString().padStart(3, '0')}`;
}

function sendOrder() {
    // سحب البيانات من الفورم
    const name = document.getElementById('cust-name')?.value;
    const phone = document.getElementById('cust-phone')?.value;
    const country = document.getElementById('cust-country')?.value;
    const province = document.getElementById('cust-province')?.value;
    const city = document.getElementById('cust-city')?.value || "";
    const neighborhood = document.getElementById('cust-neighborhood')?.value || "";
    const address = document.getElementById('cust-address')?.value || "";

    // التحقق من البيانات
    if (!name || !phone || !country || !province) {
        return alert("⚠️ من فضلك أكمل بيانات التوصيل الأساسية أولاً");
    }

    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    if (cart.length === 0) return alert("السلة فارغة!");

    const orderID = generateDailyOrderID();
    const shipping = calculateShipping();
    const serviceFee = parseFloat(storeConfig.serviceFee) || 0;
    
    let subtotal = cart.reduce((sum, item) => sum + Number(item.total), 0);
    const finalTotal = subtotal + shipping + serviceFee;

// تجميع سطر العنوان بالكامل (دولة - محافظة - مدينة - حي)
    let fullLocation = `${country} - ${province}`;
    if (city) fullLocation += ` - ${city}`;
    if (neighborhood) fullLocation += ` - ${neighborhood}`;

    // بناء رسالة الواتساب
    let msg = `*🌿 إكسير الطبيعة - طلب جديد ${orderID}*%0A`;
    msg += `-----------------------%0A`;
    msg += `👤 العميل: ${name}%0A`;
    msg += `📱 الهاتف: ${phone}%0A`;
    msg += `📍 العنوان: ${fullLocation}%0A`; // هنا تم إضافة العنوان المجمع بالحي
    msg += `🏠 تفاصيل: ${address}%0A`;
    msg += `-----------------------%0A*📦 المنتجات:*%0A`;
    
    cart.forEach(i => {
        const unitLabel = (i.unit && i.unit !== "undefined") ? i.unit : "كيلو";
        msg += `- ${i.name} (x${i.qty} ${unitLabel}) = ${Number(i.total).toFixed(2)}%0A`;
    });
    
    msg += `-----------------------%0A`;
    msg += `💰 المجموع: ${subtotal.toFixed(2)} ج.م%0A`;
    msg += `🚚 التوصيل: ${shipping > 0 ? shipping.toFixed(2) + ' ج.م' : 'مجاني'}%0A`;
    msg += `⚙️ الخدمة: ${serviceFee > 0 ? serviceFee.toFixed(2) + ' ج.م' : 'مجاني'}%0A`;
    msg += `-----------------------%0A`;
    msg += `*💵 الإجمالي النهائي: ${finalTotal.toFixed(2)} ج.م*`;

    window.open(`https://wa.me/${storeConfig.whatsapp}?text=${msg}`, '_blank');
}

// ==========================================
// 6. التشغيل التلقائي
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    populateCountries();
    showFinalInvoice();

});