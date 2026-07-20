/* ===================== VICTORY — SHOP ENGINE ===================== */

const DELIVERY_FEE = 80;
const WHATSAPP_NUMBER = '201277565441';
const CONTACT_PHONE_DISPLAY = '+20 127 756 5441';
const INSTAPAY_NUMBER = '01277565441';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'victory2026';

/* Base prices per category (before any combo offer) */
const BASE_PRICE = {
  basic: 549,
  ranger: 549,
  polo: 599,
  pant: 559,
};

/* -------- Product catalog --------
   Only 4 real styles. Each style is ONE product page; every color is a
   swatch on that page (with its own photo), instead of separate cards. */
const defaultProducts = [
  {
    id: 'basic-boxfit',
    name: 'Basic Box Fit T-Shirt',
    type: 'Basic Box Fit T-Shirt',
    category: 'basic',
    price: BASE_PRICE.basic,
    oldPrice: 900,
    img: 'basic-black.jpg',
    sizes: ['M', 'L', 'XL', 'XXL'],
    desc: 'Heavyweight interlock cotton with an oversized box-fit silhouette and dropped shoulders. Pick your color below.',
    colors: [
      { name: 'Black', hex: '#111111', img: 'basic-black.jpg' },
      { name: 'White', hex: '#f5f5f5', img: 'basic-white.jpg' },
      { name: 'Navy Blue', hex: '#1c2b52', img: 'basic-navy.jpg' },
      { name: 'Maroon', hex: '#5c1420', img: 'basic-maroon.jpg' },
      { name: 'Brown', hex: '#4a3324', img: 'basic-brown.jpg' },
      { name: 'Sand', hex: '#d9c6a8', img: 'basic-sand.jpg' },
    ],
  },
  {
    id: 'basic-polo',
    name: 'Basic Polo Box Fit',
    type: 'Basic Polo Box Fit',
    category: 'polo',
    price: BASE_PRICE.polo,
    oldPrice: 1000,
    img: 'polo-black.jpg',
    sizes: ['M', 'L', 'XL', 'XXL'],
    desc: 'Interlock fabric polo with an open johnny collar and oversized box fit. Pick your color below.',
    colors: [
      { name: 'Black', hex: '#111111', img: 'polo-black.jpg' },
      { name: 'Maroon', hex: '#5c1420', img: 'polo-maroon.jpg' },
      { name: 'Teal', hex: '#0f5257', img: 'polo-teal.jpg' },
      { name: 'Black Stripe', hex: '#1a1a1a', img: 'polo-blackstripe.jpg' },
      { name: 'Brown Stripe', hex: '#6b4a2f', img: 'polo-brownstripe.jpg' },
    ],
  },
  {
    id: 'ranger-tee',
    name: 'Ranger T-Shirt',
    type: 'Ranger T-Shirt',
    category: 'ranger',
    price: BASE_PRICE.ranger,
    oldPrice: 900,
    img: 'ranger-maroon.jpg',
    sizes: ['M', 'L', 'XL', 'XXL'],
    desc: 'Interlock fabric ringer tee with a contrast white collar and cuffs. Pick your color below.',
    colors: [
      { name: 'Maroon', hex: '#5c1420', img: 'ranger-maroon.jpg' },
      { name: 'Black', hex: '#111111', img: 'ranger-black.jpg' },
      { name: 'Navy', hex: '#1c2b52', img: 'ranger-navy.jpg' },
      { name: 'White', hex: '#f5f5f5', img: 'ranger-white.jpg' },
    ],
  },
  {
    id: 'streetpant',
    name: 'Street Pant - Wide Leg',
    type: 'Street Pant - Wide Leg',
    category: 'pant',
    price: BASE_PRICE.pant,
    oldPrice: 950,
    img: 'streetpant-black.jpg',
    sizes: ['L', 'XL', 'XXL'],
    desc: '100% cotton wide-leg street pant, cozy and stylish. Pick your color below.',
    colors: [
      { name: 'Black', hex: '#000000', img: 'streetpant-black.jpg' },
      { name: 'White', hex: '#ffffff', img: 'streetpant-white.jpg' },
      { name: 'Grey', hex: '#b5b5b5', img: 'streetpant-grey.jpg' },
      { name: 'Navy', hex: '#1b2a4a', img: 'streetpant-navy.jpg' },
      { name: 'Teal', hex: '#0f5257', img: 'streetpant-teal.jpg' },
      { name: 'Brown', hex: '#5c4030', img: 'streetpant-brown.jpg' },
    ],
  },
];

/* -------- Firebase (cloud sync so product edits reach every device) -------- */
const firebaseConfig = {
  apiKey: 'AIzaSyAw8hvxYPsGsz_TTh68FiiOKrQDvMnP7K8',
  authDomain: 'victory-eg.firebaseapp.com',
  projectId: 'victory-eg',
  storageBucket: 'victory-eg.firebasestorage.app',
  messagingSenderId: '910009321008',
  appId: '1:910009321008:web:e170267695df12b44c0ff5',
  measurementId: 'G-4J5ZS0T97G',
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let cachedProducts = null;
let productsReadyPromise = null;

/* Loads the product catalog from Firestore once per page load.
   Call this before the first getProducts()/getProductById() and wait for it. */
function initProducts() {
  if (productsReadyPromise) return productsReadyPromise;

  productsReadyPromise = db.collection('products').get().then((snapshot) => {
    if (snapshot.empty) {
      // First time ever running: seed Firestore with the built-in catalog.
      const batch = db.batch();
      defaultProducts.forEach((product) => {
        batch.set(db.collection('products').doc(product.id), product);
      });
      return batch.commit().then(() => {
        cachedProducts = defaultProducts;
        localStorage.setItem('victoryProducts', JSON.stringify(cachedProducts));
      });
    }
    cachedProducts = snapshot.docs.map((doc) => doc.data());
    localStorage.setItem('victoryProducts', JSON.stringify(cachedProducts));
  }).catch((error) => {
    console.error('Could not reach Firestore, showing last known products:', error);
    cachedProducts = JSON.parse(localStorage.getItem('victoryProducts') || JSON.stringify(defaultProducts));
  });

  return productsReadyPromise;
}

function getProducts() {
  if (cachedProducts) return cachedProducts;
  return JSON.parse(localStorage.getItem('victoryProducts') || JSON.stringify(defaultProducts));
}

function getProductById(id) {
  return getProducts().find((product) => product.id === id) || getProducts()[0];
}

function saveProducts(products) {
  cachedProducts = products;
  localStorage.setItem('victoryProducts', JSON.stringify(products));
}

function formatMoney(value) {
  return `${value} EGP`;
}

function productUrl(product) {
  return `product.html?id=${encodeURIComponent(product.id)}`;
}

/* -------- Bundle offer engine --------
   3 Basic                          -> 1350
   2 Basic + 2 (Ranger or Basic)    -> 1800
   1 Basic + 1 Polo                 -> 999
   1 Pant  + 1 Basic (full suit)    -> 999
   Anything left over is charged at its normal price.
   A memoized search finds the minimum possible total. */
const defaultOffers = [
  { id: '3basic', tag: 'Bundle', title: '3 Basic Box Fit Tees', price: 1350, oldPrice: 1650 },
  { id: '2b2rb', tag: 'Bundle', title: '2 Basic Box Fit + 2 Ranger or Basic Tees', price: 1800, oldPrice: 2300 },
  { id: 'basicpolo', tag: 'Combo', title: '1 Basic Box Fit + 1 Basic Polo Box Fit', price: 999, oldPrice: 1150 },
  { id: 'suit', tag: 'Full Suit', title: '1 Street Pant + 1 Basic Box Fit', price: 999, oldPrice: null },
];

let OFFER_3BASIC = defaultOffers[0].price;
let OFFER_2B2RB = defaultOffers[1].price;
let OFFER_BASIC_POLO = defaultOffers[2].price;
let OFFER_SUIT = defaultOffers[3].price;

let cachedOffers = null;
let offersReadyPromise = null;

function applyOfferValues(offers) {
  const byId = Object.fromEntries(offers.map((offer) => [offer.id, offer]));
  if (byId['3basic']) OFFER_3BASIC = byId['3basic'].price;
  if (byId['2b2rb']) OFFER_2B2RB = byId['2b2rb'].price;
  if (byId['basicpolo']) OFFER_BASIC_POLO = byId['basicpolo'].price;
  if (byId['suit']) OFFER_SUIT = byId['suit'].price;
}

/* Loads bundle-offer prices from Firestore (one doc holding all 4 offers). */
function initOffers() {
  if (offersReadyPromise) return offersReadyPromise;

  offersReadyPromise = db.collection('settings').doc('offers').get().then((doc) => {
    if (!doc.exists) {
      return db.collection('settings').doc('offers').set({ items: defaultOffers }).then(() => {
        cachedOffers = defaultOffers;
        applyOfferValues(cachedOffers);
        localStorage.setItem('victoryOffers', JSON.stringify(cachedOffers));
      });
    }
    cachedOffers = doc.data().items || defaultOffers;
    applyOfferValues(cachedOffers);
    localStorage.setItem('victoryOffers', JSON.stringify(cachedOffers));
  }).catch((error) => {
    console.error('Could not reach Firestore for offers, using last known prices:', error);
    cachedOffers = JSON.parse(localStorage.getItem('victoryOffers') || JSON.stringify(defaultOffers));
    applyOfferValues(cachedOffers);
  });

  return offersReadyPromise;
}

function getOffers() {
  if (cachedOffers) return cachedOffers;
  return JSON.parse(localStorage.getItem('victoryOffers') || JSON.stringify(defaultOffers));
}

function saveOffers(offers) {
  cachedOffers = offers;
  applyOfferValues(offers);
  localStorage.setItem('victoryOffers', JSON.stringify(offers));
  return db.collection('settings').doc('offers').set({ items: offers });
}

function minComboCost(b, r, p, n, memo) {
  const key = `${b},${r},${p},${n}`;
  if (memo.has(key)) return memo.get(key);
  if (b === 0 && r === 0 && p === 0 && n === 0) return 0;

  let best = Infinity;

  if (b >= 3) best = Math.min(best, OFFER_3BASIC + minComboCost(b - 3, r, p, n, memo));

  if (b >= 2 && (b - 2 + r) >= 2) {
    const maxFromBasic = Math.min(2, b - 2);
    for (let k = 0; k <= maxFromBasic; k++) {
      const useRanger = 2 - k;
      if (useRanger <= r) {
        best = Math.min(best, OFFER_2B2RB + minComboCost(b - 2 - k, r - useRanger, p, n, memo));
      }
    }
  }

  if (b >= 1 && p >= 1) best = Math.min(best, OFFER_BASIC_POLO + minComboCost(b - 1, r, p - 1, n, memo));
  if (b >= 1 && n >= 1) best = Math.min(best, OFFER_SUIT + minComboCost(b - 1, r, p, n - 1, memo));

  if (b >= 1) best = Math.min(best, BASE_PRICE.basic + minComboCost(b - 1, r, p, n, memo));
  if (r >= 1) best = Math.min(best, BASE_PRICE.ranger + minComboCost(b, r - 1, p, n, memo));
  if (p >= 1) best = Math.min(best, BASE_PRICE.polo + minComboCost(b, r, p - 1, n, memo));
  if (n >= 1) best = Math.min(best, BASE_PRICE.pant + minComboCost(b, r, p, n - 1, memo));

  memo.set(key, best);
  return best;
}

function getCart() {
  return JSON.parse(localStorage.getItem('victoryCart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('victoryCart', JSON.stringify(cart));
  updateCartCount();
}

function getCartCounts() {
  const cart = getCart();
  const counts = { basic: 0, ranger: 0, polo: 0, pant: 0 };
  let otherTotal = 0;
  cart.forEach((item) => {
    const cat = item.category;
    if (counts[cat] !== undefined) {
      counts[cat] += item.quantity;
    } else {
      otherTotal += (item.price || 0) * item.quantity;
    }
  });
  return { counts, otherTotal };
}

function getCartSubtotal() {
  const { counts, otherTotal } = getCartCounts();
  const bundled = minComboCost(counts.basic, counts.ranger, counts.polo, counts.pant, new Map());
  return bundled + otherTotal;
}

function getCartFullPrice() {
  const { counts, otherTotal } = getCartCounts();
  return (counts.basic * BASE_PRICE.basic)
    + (counts.ranger * BASE_PRICE.ranger)
    + (counts.polo * BASE_PRICE.polo)
    + (counts.pant * BASE_PRICE.pant)
    + otherTotal;
}

function getCartSavings() {
  const savings = getCartFullPrice() - getCartSubtotal();
  return savings > 0 ? savings : 0;
}

function getCartTotal() {
  const cart = getCart();
  if (cart.length === 0) return 0;
  return getCartSubtotal() + DELIVERY_FEE;
}

function updateCartCount() {
  const el = document.getElementById('cartCount');
  if (!el) return;
  const count = getCart().reduce((total, item) => total + item.quantity, 0);
  el.textContent = count;
}

function renderCart() {
  const cart = getCart();
  const cartItems = document.getElementById('cartItems');
  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="emptyCart">Your cart is empty.</p>';
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <div class="cartItem">
      <img src="${item.img}" alt="${item.name}" />
      <div class="cartItemInfo">
        <h3>${item.name}</h3>
        <p>${item.type} - Size ${item.size}${item.color ? ' - Color ' + item.color : ''}</p>
        <span>${formatMoney(item.price)} x ${item.quantity}</span>
      </div>
      <button class="removeCartBtn" type="button" onclick="removeCartItem(${index})">Remove</button>
    </div>
  `).join('') + `
    <div class="cartTotals">
      ${getCartSavings() > 0 ? `<div><span>Bundle savings</span><strong>-${formatMoney(getCartSavings())}</strong></div>` : ''}
      <div><span>Subtotal</span><strong>${formatMoney(getCartSubtotal())}</strong></div>
      <div><span>Delivery</span><strong>${formatMoney(DELIVERY_FEE)}</strong></div>
      <div><span>Total</span><strong>${formatMoney(getCartTotal())}</strong></div>
    </div>
  `;
}

function openCart() {
  renderCart();
  document.getElementById('cartOverlay').classList.add('active');
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('active');
}

function closeCartOnOverlay(event) {
  if (event.target === document.getElementById('cartOverlay')) closeCart();
}

function removeCartItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function clearCart() {
  saveCart([]);
  renderCart();
}

function openModal() {
  document.getElementById('overlay').classList.add('active');
}

function closeModal() {
  document.getElementById('overlay').classList.remove('active');
}

function closeOnOverlay(event) {
  if (event.target === document.getElementById('overlay')) closeModal();
}

function openCheckout() {
  if (getCart().length === 0) {
    document.getElementById('cartItems').innerHTML = '<p class="emptyCart">Add products before ordering.</p>';
    return;
  }
  closeCart();
  renderOrderSummary();
  togglePaymentFields();
  document.getElementById('checkoutOverlay').classList.add('active');
}

function closeCheckout() {
  document.getElementById('checkoutOverlay').classList.remove('active');
}

function closeCheckoutOnOverlay(event) {
  if (event.target === document.getElementById('checkoutOverlay')) closeCheckout();
}

function togglePaymentFields() {
  const checked = document.querySelector('input[name="paymentMethod"]:checked');
  const paymentMethod = checked ? checked.value : 'cash';
  const instapayFields = document.getElementById('instapayFields');
  if (instapayFields) instapayFields.classList.toggle('active', paymentMethod === 'instapay');
  const numberEl = document.getElementById('instapayNumber');
  if (numberEl) numberEl.textContent = INSTAPAY_NUMBER;
}

function renderOrderSummary() {
  const checked = document.querySelector('input[name="paymentMethod"]:checked');
  const paymentMethod = checked ? checked.value : 'cash';
  const paymentLabel = paymentMethod === 'instapay' ? 'Full Instapay Payment' : 'Cash on Delivery';
  document.getElementById('orderSummary').innerHTML = `
    ${getCartSavings() > 0 ? `<div class="priceLine"><span>Bundle savings</span><strong>-${formatMoney(getCartSavings())}</strong></div>` : ''}
    <div class="priceLine"><span>Items</span><strong>${formatMoney(getCartSubtotal())}</strong></div>
    <div class="priceLine"><span>Delivery</span><strong>${formatMoney(DELIVERY_FEE)}</strong></div>
    <div class="priceLine total"><span>Total (${paymentLabel})</span><strong>${formatMoney(getCartTotal())}</strong></div>
  `;
}

function buildOrderMessage(paymentMethod) {
  const cart = getCart();
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const address = document.getElementById('customerAddress').value.trim();
  const items = cart.map((item) => `- ${item.name} / Size ${item.size}${item.color ? ' / Color ' + item.color : ''} / Qty ${item.quantity} / ${formatMoney(item.price)}`).join('\n');
  const savingsLine = getCartSavings() > 0 ? `\nBundle savings: -${formatMoney(getCartSavings())}` : '';
  const paymentText = paymentMethod === 'instapay'
    ? `Full Instapay Payment (to ${INSTAPAY_NUMBER}) — screenshot to follow in this chat`
    : 'Cash on Delivery';
  return `New Victory Order\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\nItems:\n${items}\n\nSubtotal: ${formatMoney(getCartSubtotal())}${savingsLine}\nDelivery: ${formatMoney(DELIVERY_FEE)}\nTotal: ${formatMoney(getCartTotal())}\nPayment: ${paymentText}`;
}

function submitOrder(event) {
  event.preventDefault();
  const orderMessage = document.getElementById('orderMessage');
  const phoneInput = document.getElementById('customerPhone');
  const phoneDigits = phoneInput.value.trim();

  if (!/^01[0-9]{9}$/.test(phoneDigits)) {
    orderMessage.textContent = 'Please enter a valid 11-digit phone number (e.g. 01xxxxxxxxx).';
    phoneInput.focus();
    return;
  }

  const checked = document.querySelector('input[name="paymentMethod"]:checked');
  const paymentMethod = checked ? checked.value : 'cash';

  const message = buildOrderMessage(paymentMethod);
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');

  orderMessage.textContent = paymentMethod === 'instapay'
    ? `Order opened in WhatsApp. Send the message, then attach your Instapay screenshot (to ${INSTAPAY_NUMBER}) in the same chat.`
    : 'Order opened in WhatsApp. Send the message to confirm your order.';

  saveCart([]);
  renderCart();
  document.getElementById('checkoutForm').reset();
  renderOrderSummary();
  togglePaymentFields();
}

/* -------- Admin (local browser only) -------- */
function loginAdmin() {
  const username = document.getElementById('adminUser').value.trim().toLowerCase();
  const password = document.getElementById('adminPassword').value;
  const message = document.getElementById('adminLoginMessage');

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    closeModal();
    openAdminPanel();
    return;
  }
  message.textContent = 'Wrong admin username or password.';
}

function openAdminPanel() {
  document.getElementById('adminOverlay').classList.add('active');
  Promise.all([initProducts(), initOffers()]).then(function () {
    renderAdminProducts();
    renderAdminOffers();
  });
}

function closeAdminPanel() {
  document.getElementById('adminOverlay').classList.remove('active');
}

function closeAdminOnOverlay(event) {
  if (event.target === document.getElementById('adminOverlay')) closeAdminPanel();
}

function saveAdminProduct() {
  const name = document.getElementById('adminProductName').value.trim();
  const type = document.getElementById('adminProductType').value.trim() || 'T-Shirt';
  const price = Number(document.getElementById('adminProductPrice').value) || BASE_PRICE.basic;
  const img = document.getElementById('adminProductImg').value.trim();
  if (!name || !img) return;

  const products = getProducts();
  const existing = products.find((product) => product.name.toLowerCase() === name.toLowerCase());
  let savedProduct;
  if (existing) {
    existing.type = type;
    existing.price = price;
    existing.img = img;
    savedProduct = existing;
  } else {
    savedProduct = { id: name.toLowerCase().replace(/\s+/g, '-'), name, type, price, img, category: 'other', sizes: ['M', 'L', 'XL', 'XXL'], desc: '' };
    products.push(savedProduct);
  }
  saveProducts(products);
  renderAdminProducts();
  if (typeof renderProducts === 'function') renderProducts();

  db.collection('products').doc(savedProduct.id).set(savedProduct).catch((error) => {
    console.error('Failed to sync product to Firestore:', error);
    alert('اتحفظ على جهازك بس، لكن حصل خطأ في المزامنة مع باقي الأجهزة. جرب تاني.');
  });
}

function deleteAdminProduct(index) {
  const products = getProducts();
  const [removed] = products.splice(index, 1);
  saveProducts(products);
  renderAdminProducts();
  if (typeof renderProducts === 'function') renderProducts();

  if (removed) {
    db.collection('products').doc(removed.id).delete().catch((error) => {
      console.error('Failed to delete product from Firestore:', error);
    });
  }
}

function editAdminProduct(index) {
  const product = getProducts()[index];
  document.getElementById('adminProductName').value = product.name;
  document.getElementById('adminProductType').value = product.type;
  document.getElementById('adminProductPrice').value = product.price || BASE_PRICE.basic;
  document.getElementById('adminProductImg').value = product.img;
}

function renderAdminProducts() {
  const adminProducts = document.getElementById('adminProducts');
  adminProducts.innerHTML = getProducts().map((product, index) => `
    <div class="adminProduct">
      <span>${product.name} - ${formatMoney(product.price || BASE_PRICE.basic)}</span>
      <div>
        <button type="button" onclick="editAdminProduct(${index})">Edit</button>
        <button type="button" onclick="deleteAdminProduct(${index})">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderAdminOffers() {
  const container = document.getElementById('adminOffers');
  if (!container) return;
  container.innerHTML = getOffers().map((offer, index) => `
    <div class="field">
      <label for="adminOfferPrice${index}">${offer.title}</label>
      <input id="adminOfferPrice${index}" type="number" value="${offer.price}" data-offer-id="${offer.id}" />
    </div>
  `).join('');
}

function saveAdminOffers() {
  const offers = getOffers().map((offer, index) => {
    const input = document.getElementById(`adminOfferPrice${index}`);
    const price = Number(input.value) || offer.price;
    return { ...offer, price };
  });

  saveOffers(offers).then(() => {
    alert('اتحفظت أسعار العروض وهتظهر على كل الأجهزة.');
  }).catch((error) => {
    console.error('Failed to sync offers to Firestore:', error);
    alert('اتحفظت على جهازك بس، لكن حصل خطأ في المزامنة. جرب تاني.');
  });
}

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeModal();
    closeCart();
    closeCheckout();
    closeAdminPanel();
  }
});
