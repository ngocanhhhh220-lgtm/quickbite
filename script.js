// ================= DỮ LIỆU MÓN ĂN =================

const products = [
    {
        id: 1,
        name: "Cơm gà xối mỡ",
        category: "Cơm",
        price: 35000,
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=85"
    },
    {
        id: 2,
        name: "Cơm sườn nướng",
        category: "Cơm",
        price: 40000,
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=85"
    },
    {
        id: 3,
        name: "Mì xào bò",
        category: "Mì",
        price: 30000,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=85"
    },
    {
        id: 4,
        name: "Bún chả Hà Nội",
        category: "Bún",
        price: 35000,
        image: "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=85"
    },
    {
        id: 5,
        name: "Phở bò tái",
        category: "Phở",
        price: 40000,
        image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=85"
    },
    {
        id: 6,
        name: "Bánh mì thịt",
        category: "Bánh mì",
        price: 25000,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=85"
    },
    {
        id: 7,
        name: "Trà đào cam sả",
        category: "Đồ uống",
        price: 20000,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=85"
    },
    {
        id: 8,
        name: "Trà sữa trân châu",
        category: "Đồ uống",
        price: 25000,
        image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=85"
    }
];

let cart = JSON.parse(localStorage.getItem("cart")) || [];


// ================= HIỂN THỊ SẢN PHẨM =================

function renderProducts(list = products) {
    const container = document.getElementById("product-list");

    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                Không tìm thấy món ăn phù hợp.
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(product => `
        <div class="product-card">
            <img 
                src="${product.image}" 
                alt="${product.name}"
                onerror="this.src='https://placehold.co/800x500/f3f4f6/777?text=${encodeURIComponent(product.name)}'"
            >

            <div class="product-info">
                <span class="product-category">
                    ${product.category}
                </span>

                <h3>${product.name}</h3>

                <div class="product-bottom">
                    <strong>
                        ${product.price.toLocaleString("vi-VN")} đ
                    </strong>

                    <button onclick="addToCart(${product.id})">
                        + Thêm
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}


// ================= TÌM KIẾM =================

function searchProducts() {
    const keyword = document
        .getElementById("search-input")
        ?.value
        .toLowerCase()
        .trim() || "";

    const category = document
        .getElementById("category-filter")
        ?.value || "";

    const filtered = products.filter(product => {
        const matchName = product.name
            .toLowerCase()
            .includes(keyword);

        const matchCategory =
            category === "" || product.category === category;

        return matchName && matchCategory;
    });

    renderProducts(filtered);
}


// ================= LỌC DANH MỤC =================

function filterByCategory(category) {
    const select = document.getElementById("category-filter");

    if (select) {
        select.value = category;
    }

    searchProducts();

    document.getElementById("menu")?.scrollIntoView({
        behavior: "smooth"
    });
}


// ================= GIỎ HÀNG =================

function addToCart(id) {
    const product = products.find(item => item.id === id);

    if (!product) return;

    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();
    renderCart();

    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const cartCount = document.getElementById("cart-count");

    if (cartCount) {
        cartCount.textContent = count;
    }
}


// ================= HIỂN THỊ GIỎ HÀNG =================

function renderCart() {
    const container = document.getElementById("cart-list");
    const totalElement = document.getElementById("cart-total");

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                Giỏ hàng đang trống.
            </div>
        `;

        if (totalElement) {
            totalElement.textContent = "0 đ";
        }

        return;
    }

    container.innerHTML = cart.map(item => `
        <div style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            padding:15px 0;
            border-bottom:1px solid #eee;
        ">
            <div>
                <strong>${item.name}</strong>
                <p style="color:#777;margin-top:5px;">
                    ${item.price.toLocaleString("vi-VN")} đ × ${item.quantity}
                </p>
            </div>

            <div style="display:flex;gap:8px;align-items:center;">
                <button onclick="changeQuantity(${item.id}, -1)">−</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${item.id}, 1)">+</button>
                <button onclick="removeFromCart(${item.id})">Xóa</button>
            </div>
        </div>
    `).join("");

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    if (totalElement) {
        totalElement.textContent =
            total.toLocaleString("vi-VN") + " đ";
    }
}

function changeQuantity(id, amount) {
    const item = cart.find(item => item.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== id);
    }

    saveCart();
    updateCartCount();
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);

    saveCart();
    updateCartCount();
    renderCart();
}

function scrollToCart() {
    document.getElementById("cart")?.scrollIntoView({
        behavior: "smooth"
    });
}


// ================= ĐẶT HÀNG =================

function checkout() {
    if (cart.length === 0) {
        alert("Vui lòng thêm món ăn vào giỏ hàng trước.");
        return;
    }

    alert("Đặt món thành công! Cảm ơn bạn đã sử dụng CanteenGo.");

    cart = [];
    saveCart();
    updateCartCount();
    renderCart();
}


// ================= ĐĂNG NHẬP =================

function login() {
    const modal = document.getElementById("login-modal");

    if (modal) {
        modal.style.display = "flex";
    }
}

function closeLogin() {
    const modal = document.getElementById("login-modal");

    if (modal) {
        modal.style.display = "none";
    }
}

function submitLogin() {
    const username = document.getElementById("login-username")?.value;

    if (!username) {
        alert("Vui lòng nhập tên đăng nhập.");
        return;
    }

    alert(`Xin chào ${username}! Đăng nhập thành công.`);
    closeLogin();
}


// ================= KHỞI CHẠY =================

document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    renderCart();
    updateCartCount();

    document
        .getElementById("search-input")
        ?.addEventListener("input", searchProducts);

    document
        .getElementById("category-filter")
        ?.addEventListener("change", searchProducts);
});