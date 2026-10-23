const productCatalog = [
  {
    id: 'la-ilaha-illallah',
    name: 'La ilaha illallah',
    arabicText: 'لا إله إلا الله',
    description: 'A contemporary Arabic calligraphy statement piece with layered symbolism, rich blue depth, and bright accents that bring the composition to life.',
    price: 4150,
    size: '24 × 30 inches',
    frame: 'Black frame shown in the reference image; frame inclusion is confirmed only after purchase review.',
    availability: 'Available in limited quantity',
    image: 'assets/placeholder-art.svg',
    accent: 'blue'
  }
];

const cartStorageKey = 'scriptoria-cart';
const orderStorageKey = 'scriptoria-orders';

const formatBDT = (value) => `৳${new Intl.NumberFormat('en-BD').format(value)}`;

defaultCart = () => JSON.parse(localStorage.getItem(cartStorageKey) || '[]');

function saveCart(cart) {
  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
}

function getCart() {
  try {
    const raw = localStorage.getItem(cartStorageKey);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function addToCart(productId) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === productId);

  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart(cart);
  renderCart();
  openCart();
}

function updateCartItem(productId, quantityChange) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === productId);

  if (!item) return;

  item.quantity += quantityChange;

  if (item.quantity <= 0) {
    const filtered = cart.filter((entry) => entry.id !== productId);
    saveCart(filtered);
    renderCart();
    return;
  }

  saveCart(cart);
  renderCart();
}

function removeCartItem(productId) {
  const cart = getCart().filter((entry) => entry.id !== productId);
  saveCart(cart);
  renderCart();
}

function getSelectedProductById(productId) {
  return productCatalog.find((product) => product.id === productId);
}

function getCartSummary() {
  const cart = getCart();
  return cart.map((entry) => {
    const product = getSelectedProductById(entry.id);
    return {
      ...entry,
      product,
      lineTotal: product ? product.price * entry.quantity : 0
    };
  });
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = productCatalog.map((product) => `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="placeholder-art" style="display:none;">Artwork image pending upload</div>
      </div>
      <div class="product-content">
        <div class="product-meta">
          <h3 class="product-name">${product.name}</h3>
          <span class="product-price">${formatBDT(product.price)}</span>
        </div>
        <div class="product-details">
          <span>${product.size}</span>
          <span>${product.availability}</span>
        </div>
        <div class="product-actions">
          <button type="button" class="product-btn primary" data-add-to-cart="${product.id}">Add to Bag</button>
          <button type="button" class="product-btn" data-open-product="${product.id}">View Details</button>
        </div>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('[data-add-to-cart]').forEach((button) => {
    button.addEventListener('click', () => addToCart(button.dataset.addToCart));
  });

  grid.querySelectorAll('[data-open-product]').forEach((button) => {
    button.addEventListener('click', () => openProductModal(button.dataset.openProduct));
  });
}

function renderCart() {
  const cartItemsDrawer = document.getElementById('cartItemsDrawer');
  const cartBadge = document.getElementById('cartBadge');
  const drawerSubtotal = document.getElementById('drawerSubtotal');

  const items = getCartSummary();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  if (cartBadge) cartBadge.textContent = totalQuantity;
  if (drawerSubtotal) drawerSubtotal.textContent = formatBDT(total);

  if (!cartItemsDrawer) return;

  if (!items.length) {
    cartItemsDrawer.innerHTML = '<div class="empty-state">Your bag is empty. Add a piece to begin your order.</div>';
    return;
  }

  cartItemsDrawer.innerHTML = items.map((entry) => {
    const product = entry.product;
    return `
      <div class="cart-item">
        <div class="cart-thumb">${product.name.split(' ')[0]}</div>
        <div>
          <p class="cart-item-name">${product.name}</p>
          <div class="cart-item-meta">
            <span>${product.size}</span>
            <strong>${formatBDT(product.price)}</strong>
          </div>
          <div class="cart-item-meta">
            <div class="qty-controls" aria-label="Quantity controls">
              <button type="button" data-decrease="${product.id}" aria-label="Decrease quantity">−</button>
              <span>${entry.quantity}</span>
              <button type="button" data-increase="${product.id}" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="remove-item" data-remove="${product.id}">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  cartItemsDrawer.querySelectorAll('[data-decrease]').forEach((button) => {
    button.addEventListener('click', () => updateCartItem(button.dataset.decrease, -1));
  });

  cartItemsDrawer.querySelectorAll('[data-increase]').forEach((button) => {
    button.addEventListener('click', () => updateCartItem(button.dataset.increase, 1));
  });

  cartItemsDrawer.querySelectorAll('[data-remove]').forEach((button) => {
    button.addEventListener('click', () => removeCartItem(button.dataset.remove));
  });

  updateSummaryPanel();
}

function updateSummaryPanel() {
  const summaryItems = document.getElementById('summaryItems');
  const summaryTotal = document.getElementById('summaryTotal');
  const orderProduct = document.getElementById('orderProduct');

  const items = getCartSummary();
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

  if (summaryTotal) summaryTotal.textContent = formatBDT(total);

  if (summaryItems) {
    if (!items.length) {
      summaryItems.innerHTML = '<div class="empty-state">No items selected yet.</div>';
      return;
    }

    summaryItems.innerHTML = `
      <ul class="summary-list">
        ${items.map((entry) => `
          <li class="summary-item">
            <span>${entry.product.name} × ${entry.quantity}</span>
            <strong>${formatBDT(entry.lineTotal)}</strong>
          </li>
        `).join('')}
      </ul>
    `;
  }

  if (orderProduct) {
    const currentValue = orderProduct.value || itemFirstProductId();
    const options = productCatalog.map((product) => `
      <option value="${product.name}">${product.name} — ${formatBDT(product.price)}</option>
    `).join('');
    orderProduct.innerHTML = options;
    orderProduct.value = currentValue;
  }
}

function itemFirstProductId() {
  return productCatalog[0]?.name || '';
}

function openCart() {
  document.getElementById('cartDrawer')?.classList.add('open');
}

function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
}

function openProductModal(productId) {
  const product = getSelectedProductById(productId);
  const modal = document.getElementById('productModal');
  const modalBody = document.getElementById('modalBody');

  if (!product || !modal || !modalBody) return;

  modalBody.innerHTML = `
    <div class="modal-visual">Artwork upload pending</div>
    <div class="modal-copy">
      <p class="eyebrow">Featured work</p>
      <h3 id="modalTitle">${product.name}</h3>
      <div class="arabic">${product.arabicText}</div>
      <p>${product.description}</p>
      <div class="modal-price">${formatBDT(product.price)}</div>
      <p><strong>Size:</strong> ${product.size}</p>
      <p><strong>Availability:</strong> ${product.availability}</p>
      <p><strong>Frame:</strong> ${product.frame}</p>
      <div class="product-actions" style="margin-top:1.4rem;">
        <button type="button" class="product-btn primary" data-modal-add="${product.id}">Add to Bag</button>
        <button type="button" class="product-btn" data-close-modal="true">Close</button>
      </div>
    </div>
  `;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');

  modal.querySelector('[data-modal-add]').addEventListener('click', () => {
    addToCart(product.id);
    modal.classList.remove('open');
  });

  modal.querySelector('[data-close-modal]').addEventListener('click', () => {
    modal.classList.remove('open');
  });
}

function bindOrderForm() {
  const orderForm = document.getElementById('orderForm');
  const formStatus = document.getElementById('formStatus');

  if (!orderForm) return;

  const orderProductField = document.getElementById('orderProduct');
  if (orderProductField && productCatalog.length) {
    orderProductField.innerHTML = productCatalog.map((product) => `
      <option value="${product.name}">${product.name} — ${formatBDT(product.price)}</option>
    `).join('');
  }

  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(orderForm);
    const data = Object.fromEntries(formData.entries());
    const item = {
      orderId: `scriptoria-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...data,
      total: getCartSummary().reduce((sum, item) => sum + item.lineTotal, 0) || 0
    };

    const orders = JSON.parse(localStorage.getItem(orderStorageKey) || '[]');
    orders.push(item);
    localStorage.setItem(orderStorageKey, JSON.stringify(orders));

    formStatus.textContent = 'Your order enquiry has been saved locally. Please confirm details over email or WhatsApp before finalising the sale.';
    formStatus.className = 'form-status success';
    orderForm.reset();
  });
}

function bindCommissionForm() {
  const form = document.getElementById('commissionForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const subject = encodeURIComponent('SCRIPTORIA commission enquiry');
    const body = encodeURIComponent(`Hello SCRIPTORIA,\n\nI would like to discuss a custom commission.\n\nName: ${payload.commissionName}\nContact: ${payload.commissionContact}\nDetails: ${payload.commissionDetails}`);
    window.location.href = `mailto:mostakimsababexe77@gmail.com?subject=${subject}&body=${body}`;
  });
}

function bindBagControls() {
  document.getElementById('bagButton')?.addEventListener('click', () => {
    const drawer = document.getElementById('cartDrawer');
    drawer?.classList.toggle('open');
  });

  document.getElementById('closeCart')?.addEventListener('click', closeCart);
  document.getElementById('checkoutButton')?.addEventListener('click', () => {
    closeCart();
    document.getElementById('orderSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('closeModal')?.addEventListener('click', () => {
    document.getElementById('productModal')?.classList.remove('open');
  });

  document.getElementById('productModal')?.addEventListener('click', (event) => {
    if (event.target.id === 'productModal') {
      event.target.classList.remove('open');
    }
  });

  document.querySelector('.send-email-btn')?.addEventListener('click', () => {
    const form = document.getElementById('orderForm');
    const formData = new FormData(form);
    const orderData = Object.fromEntries(formData.entries());
    const productName = orderData.product || productCatalog[0]?.name || 'Artwork';
    const quantity = Number(orderData.quantity || 1);
    const subtotal = (productCatalog.find((entry) => entry.name === productName)?.price || 0) * quantity;
    const subject = encodeURIComponent('SCRIPTORIA order enquiry');
    const body = encodeURIComponent(
      `Hello SCRIPTORIA,\n\nI would like to place an order for ${productName}.\nQuantity: ${quantity}\nEstimated subtotal: ${formatBDT(subtotal)}\nCustomer name: ${orderData.customerName || ''}\nPhone/WhatsApp: ${orderData.customerPhone || ''}\nDelivery address: ${orderData.deliveryAddress || ''}\nCity/district: ${orderData.city || ''}\nSize/variant: ${orderData.variant || ''}\nInstructions: ${orderData.instructions || ''}`
    );
    window.location.href = `mailto:mostakimsababexe77@gmail.com?subject=${subject}&body=${body}`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCart();
  bindBagControls();
  bindOrderForm();
  bindCommissionForm();
});
