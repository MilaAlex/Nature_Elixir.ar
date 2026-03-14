// ==========================================
// 1. إدارة المنتجات (إضافة، تعديل، حذف)
// ==========================================
let editModeId = null; 

// تم ربطها بالـ window مباشرة عشان الـ HTML يشوفها
window.saveProduct = function() { 
    const name = document.getElementById('prod-name')?.value; 
    const price = document.getElementById('prod-price')?.value; 
    const category = document.getElementById('prod-category')?.value; 
    const unit = document.getElementById('prod-unit')?.value || 'كيلو'; 
    const imageInput = document.getElementById('prod-image'); 
    
    // التأكد من وجود خانة الرابط قبل محاولة قراءتها
    const imageUrlInput = document.getElementById('prod-image-url');
    const imageUrl = imageUrlInput ? imageUrlInput.value : '';

    if (!name || !price) { 
        return alert("برجاء إدخال اسم المنتج وسعره على الأقل!"); 
    } 

    const finalizeSave = (imageData) => { 
        let products = JSON.parse(localStorage.getItem('myProducts')) || []; 
        
        if (editModeId) { 
            const index = products.findIndex(p => p.id === editModeId); 
            if (index !== -1) { 
                products[index] = { 
                    ...products[index], 
                    name: name, 
                    price: parseFloat(price), 
                    category: category, 
                    unit: unit, 
                    image: imageData || products[index].image 
                }; 
            } 
            alert("تم تحديث المنتج بنجاح! ✏️"); 
        } else { 
            if (!imageData) return alert("برجاء اختيار صورة للمنتج الجديد أو وضع رابط!"); 
            const newProduct = { 
                id: Date.now(), 
                name: name, 
                price: parseFloat(price), 
                category: category, 
                unit: unit, 
                image: imageData 
            }; 
            products.push(newProduct); 
            alert("تمت إضافة المنتج بنجاح! 🎉"); 
        } 
        
        localStorage.setItem('myProducts', JSON.stringify(products)); 
        resetForm(); 
        displayProducts(); 
    };

    // التحقق: هل المستخدم رفع صورة من الجهاز؟
    if (imageInput && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxWidth = 300; 
                const scale = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * scale;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                finalizeSave(canvas.toDataURL('image/jpeg', 0.7));
            }
        };
        reader.readAsDataURL(imageInput.files[0]);
    } 
    // لو لم يرفع صورة، هل وضع رابطاً؟
    else if (imageUrl) {
        finalizeSave(imageUrl); 
    } 
    // لو لم يفعل هذا ولا ذاك
    else {
        finalizeSave(null); 
    }
}

window.displayProducts = function() {
    const listBody = document.getElementById('products-list');
    if (!listBody) return;

    const products = JSON.parse(localStorage.getItem('myProducts')) || [];
    if (products.length === 0) {
        listBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد منتجات حالياً</td></tr>';
        return;
    }
    
    listBody.innerHTML = products.map(p => `
        <tr>
            <td><img src="${p.image}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;"></td>
            <td>${p.name}</td>
            <td>${p.price} ج.م <br><small>(${p.unit || 'كيلو'})</small></td>
            <td>${p.category}</td>
            <td>
                <button onclick="editProduct(${p.id})" style="background:#3498db; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">تعديل ✏️</button>
                <button onclick="deleteProduct(${p.id})" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;">حذف 🗑️</button>
            </td>
        </tr>
    `).join('');
}

window.editProduct = function(id) {
    const products = JSON.parse(localStorage.getItem('myProducts')) || [];
    const product = products.find(p => p.id === id);
    if (product) {
        document.getElementById('prod-name').value = product.name;
        document.getElementById('prod-price').value = product.price;
        document.getElementById('prod-category').value = product.category;
        
        if(document.getElementById('prod-unit')) {
            document.getElementById('prod-unit').value = product.unit || 'كيلو';
        }

        if(document.getElementById('prod-image-url')) {
            document.getElementById('prod-image-url').value = product.image.startsWith('http') ? product.image : '';
        }

        editModeId = id; 
        
        const btn = document.querySelector('.btn-add');
        if(btn) {
            btn.innerText = "تحديث البيانات 💾";
            btn.style.background = "#3498db";
        }
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
}

function resetForm() {
    editModeId = null;
    if(document.getElementById('prod-name')) document.getElementById('prod-name').value = '';
    if(document.getElementById('prod-price')) document.getElementById('prod-price').value = '';
    if(document.getElementById('prod-unit')) document.getElementById('prod-unit').value = 'كيلو';
    if(document.getElementById('prod-image')) document.getElementById('prod-image').value = '';
    if(document.getElementById('prod-image-url')) document.getElementById('prod-image-url').value = '';
    
    const btn = document.querySelector('.btn-add');
    if(btn) {
        btn.innerText = "إضافة المنتج ✅";
        btn.style.background = "#27ae60";
    }
}

window.deleteProduct = function(id) {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
        let products = JSON.parse(localStorage.getItem('myProducts')) || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem('myProducts', JSON.stringify(products));
        displayProducts(); // تم تصحيح اسم الدالة هنا
        showToast("🗑️ تم الحذف بنجاح");
    }
}

// ==========================================
// 2. نظام الشحن والإعدادات (كما هي بدون تغيير لأنها سليمة)
// ==========================================
window.saveLocationPath = function() { /* نفس الكود الخاص بك */ }
window.renderShippingTable = function() { /* نفس الكود الخاص بك */ }
window.deletePath = function(id) { /* نفس الكود الخاص بك */ }
window.saveStoreSettings = function() { /* نفس الكود الخاص بك */ }
window.loadCurrentConfig = function() { /* نفس الكود الخاص بك */ }

function showToast(msg) {
    let toast = document.getElementById('admin-toast');
    if(!toast) {
        toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.style.cssText = "position:fixed; bottom:20px; left:20px; background:#333; color:#fff; padding:12px 30px; border-radius:30px; z-index:9999; display:none; font-family:'Cairo';";
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    // تأكد من وجود دوال الشحن قبل مناداتها عشان متعملش Error لو مش في نفس الصفحة
    if(document.getElementById('shipping-table-body')) renderShippingTable();
    if(document.getElementById('set-whatsapp')) loadCurrentConfig();
});  

 
// جوه دالة sendOrder في ملف script.js
const itemsSummary = cart.map(i => `${i.name} (${i.qty})`).join('، '); // تجميع الأصناف في سطر

const newOrder = {
    code: orderID,
    date: new Date().toLocaleString('ar-EG'),
    customer: name,
    itemsSummary: itemsSummary, // السطر ده هيخلي السجل يوريك العميل اشترى إيه
    total: finalTotal.toFixed(2)
};

function printSingleOrder(orderCode) {
    const orders = JSON.parse(localStorage.getItem('orderHistory')) || [];
    const order = orders.find(o => o.code === orderCode);

    if (!order) return alert("الطلب غير موجود!");

    // إنشاء نافذة طباعة وهمية للفاتورة
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>فاتورة طلب ${order.code}</title>
            <style>
                body { font-family: 'Cairo', sans-serif; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #27ae60; padding-bottom: 10px; }
                .details { margin-top: 20px; line-height: 1.8; }
                .footer { margin-top: 30px; text-align: center; font-size: 0.9rem; color: #666; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>إكسير الطبيعة - فاتورة طلب</h2>
                <p>كود الطلب: ${order.code}</p>
            </div>
            <div class="details">
                <p><strong>تاريخ الطلب:</strong> ${order.date}</p>
                <p><strong>اسم العميل:</strong> ${order.customer}</p>
                <p><strong>المنتجات:</strong> ${order.itemsSummary}</p>
                <p style="font-size: 1.2rem; color: #27ae60;"><strong>الإجمالي النهائي:</strong> ${order.total} ج.م</p>
            </div>
            <div class="footer">
                <p>شكراً لثقتكم في إكسير الطبيعة 🌿</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}