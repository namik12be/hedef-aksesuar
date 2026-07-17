function remainingStock(productId){
  const p = PRODUCTS.find(x => x.id === productId);
  if(!p) return 0;
  return Math.max(0, p.stock - (cart[productId] || 0));
}

function addToCart(id){
  if(remainingStock(id) <= 0){
    showToast('Stok tükendi — bu üründen daha fazla ekleyemezsin.');
    return;
  }
  cart[id] = (cart[id] || 0) + 1;
  updateCart();
  showToast('Sepete eklendi');
}

function changeQty(id, delta){
  if(!cart[id]) return;
  if(delta > 0 && remainingStock(id) <= 0){
    showToast('Stok tükendi — bu üründen daha fazla ekleyemezsin.');
    return;
  }
  cart[id] += delta;
  if(cart[id] <= 0) delete cart[id];
  updateCart();
}

function removeItem(id){
  delete cart[id];
  updateCart();
}

function updateCart(){
  const count = Object.values(cart).reduce((a,b) => a+b, 0);
  document.getElementById('cartCount').textContent = count;

  const itemsEl = document.getElementById('drawerItems');
  const footEl = document.getElementById('drawerFoot');
  const ids = Object.keys(cart);

  if(ids.length === 0){
    itemsEl.innerHTML = `<div class="drawer-empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      <p>Sepetin şu an boş.<br>Ürün eklemeye ne dersin?</p>
    </div>`;
    footEl.style.display = 'none';
    return;
  }
  footEl.style.display = 'block';

  let subtotal = 0;
  itemsEl.innerHTML = ids.map(id => {
    const p = PRODUCTS.find(x => x.id == id);
    const qty = cart[id];
    subtotal += unitPriceFor(p).value * qty;
    return `
      <div class="cart-row">
        <div class="cart-thumb">${p.device==='saat' ? `<div class="mini-watch" style="width:24px;height:30px;"><div class="mscreen" style="background:${p.screen}"></div></div>` : (p.device==='airpods'||p.device==='kulaklik') ? `<div class="mini-airpods" style="width:34px;height:24px;"><div class="mscreen" style="background:${p.screen}"></div></div>` : p.device==='tablet' ? `<div class="mini-tablet" style="width:38px;height:48px;"><div class="mscreen" style="background:${p.screen}"></div></div>` : `<div class="mini-phone" style="width:26px;height:52px;"><div class="mscreen" style="background:${p.screen}"></div></div>`}</div>
        <div class="cart-info">
          <span class="cart-name">${p.name}</span>
          <span class="cart-price">${fmt(p)}</span>
          <div class="qty-row">
            <button class="qty-btn" onclick="changeQty(${id}, -1)">−</button>
            <span class="qty-val">${qty}</span>
            <button class="qty-btn" ${qty >= p.stock ? 'disabled style="opacity:.35;cursor:not-allowed;"' : ''} onclick="changeQty(${id}, 1)">+</button>
            <button class="remove-btn" onclick="removeItem(${id})" aria-label="Ürünü kaldır">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
          ${qty >= p.stock ? '<span class="cart-stock-warning">Stok sınırına ulaşıldı</span>' : ''}
        </div>
      </div>`;
  }).join('');

  document.getElementById('subtotal').textContent = fmtRaw(subtotal);
}

function showToast(text){
  const toast = document.getElementById('toast');
  document.getElementById('toastText').textContent = text;
  toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

let pendingConfirmAction = null;
function showCustomConfirm(message, onYes){
  document.getElementById('customConfirmMessage').textContent = message;
  pendingConfirmAction = onYes;
  document.getElementById('customConfirmOverlay').classList.add('open');
  document.getElementById('customConfirmBox').classList.add('open');
}
function hideCustomConfirm(){
  document.getElementById('customConfirmOverlay').classList.remove('open');
  document.getElementById('customConfirmBox').classList.remove('open');
  pendingConfirmAction = null;
}
document.getElementById('customConfirmYes').addEventListener('click', () => {
  const action = pendingConfirmAction;
  hideCustomConfirm();
  if(action) action();
});
document.getElementById('customConfirmNo').addEventListener('click', hideCustomConfirm);
document.getElementById('customConfirmOverlay').addEventListener('click', hideCustomConfirm);

function openDrawer(){
  document.getElementById('drawer').classList.add('open');
  document.getElementById('overlay').classList.add('open');
}
function closeDrawer(){
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}

document.getElementById('cartBtn').addEventListener('click', openDrawer);
document.getElementById('closeDrawer').addEventListener('click', closeDrawer);
document.getElementById('overlay').addEventListener('click', closeDrawer);
document.getElementById('checkoutBtn').addEventListener('click', () => {
  closeDrawer();
  showToast('Bu bir demo mağaza — gerçek ödeme alınmadı 🙂');
});
