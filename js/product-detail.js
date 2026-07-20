/* ============================= PRODUCT DETAIL PAGE ============================= */

function colorHex(name){
  const map = {
    'kirmizi':'#E42313', 'kırmızı':'#E42313', 'mavi':'#1B48D6', 'sari':'#FFC738', 'sarı':'#FFC738',
    'siyah':'#1a1a1f', 'lacivert':'#13379E', 'kahverengi':'#6b4527', 'beyaz':'#eef1f5',
    'seffaf':'#eef1f5', 'şeffaf':'#eef1f5', 'gri':'#9a9a9a', 'mor':'#7B4FD1', 'pembe':'#FF7EB6',
    'turuncu':'#FF7A1A', 'yesil':'#2E9E4F', 'yeşil':'#2E9E4F', 'bej':'#D8C4A0', 'altin':'#D4AF37',
    'altın':'#D4AF37', 'gumus':'#B9BBBE', 'gümüş':'#B9BBBE', 'bordo':'#7A1F2B', 'haki':'#7D8353',
    'krem':'#F3E9D2', 'turkuaz':'#1FB6C1',
  };
  const key = normalizeTr(name);
  return map[key] || '#c9cfd8';
}

let pdProductId = null, pdSelectedColor = null, pdSelectedPattern = null, pdSelectedModelVariant = null, pdQty = 1, pdReturnView = 'home';
let pdMediaOverride = null;

function pdMediaHTML(p){
  const screen = pdSelectedColor ? colorHex(pdSelectedColor) : p.screen;
  return mediaHTML(Object.assign({}, p, {screen}));
}

function currentMainView(){
  return document.getElementById('homeView').style.display !== 'none' ? 'home' : 'products';
}

function showProductDetail(id){
  const p = PRODUCTS.find(x => x.id === id);
  if(!p) return;
  saveLastView('productDetail', id);
  document.body.classList.remove('admin-mode');
  pdReturnView = currentMainView();
  pdProductId = id;
  pdSelectedColor = p.variants.colors[0] ? p.variants.colors[0].name : null;
  pdSelectedPattern = (p.variants.patterns && p.variants.patterns[0]) ? p.variants.patterns[0].name : null;
  pdSelectedModelVariant = p.variants.models[0] || null;
  pdQty = 1;
  pdMediaOverride = null;
  document.getElementById('homeView').style.display = 'none';
  document.getElementById('productsView').style.display = 'none';
  document.getElementById('adminView').style.display = 'none';
  document.getElementById('profileView').style.display = 'none';
  document.getElementById('faqView').style.display = 'none';
  document.getElementById('productDetailView').style.display = 'block';
  window.scrollTo(0, 0);
  renderProductDetail();
}
document.getElementById('pdBackBtn').addEventListener('click', () => {
  document.getElementById('productDetailView').style.display = 'none';
  if(pdReturnView === 'home') showHome(); else showProducts();
});

function pdCurrentMediaHTML(p){
  if(pdMediaOverride){
    if(pdMediaOverride.type === 'video') return `<video src="${pdMediaOverride.src}" controls autoplay muted playsinline></video>`;
    return `<img src="${pdMediaOverride.src}" alt="${p.name}">`;
  }
  const patternObj = (p.variants.patterns || []).find(pt => pt.name === pdSelectedPattern);
  if(patternObj && patternObj.image) return `<img src="${patternObj.image}" alt="${p.name}">`;
  const colorObj = p.variants.colors.find(c => c.name === pdSelectedColor);
  if(colorObj && colorObj.image) return `<img src="${colorObj.image}" alt="${p.name}">`;
  if(p.image) return `<img src="${p.image}" alt="${p.name}">`;
  return pdMediaHTML(p);
}
function pdGalleryHTML(p){
  const media = p.variants.media;
  if(!media || ((!media.images || !media.images.length) && !media.video)) return '';
  const imageThumbs = (media.images || []).map((src, i) => `<button type="button" class="pd-gallery-thumb" onclick="selectPdMedia('image', ${i})"><img src="${src}" alt=""></button>`).join('');
  const videoThumb = media.video ? `<button type="button" class="pd-gallery-thumb pd-gallery-thumb-video" onclick="selectPdMedia('video', 0)">▶</button>` : '';
  return `<div class="pd-gallery">${imageThumbs}${videoThumb}</div>`;
}
function selectPdMedia(type, idx){
  const p = PRODUCTS.find(x => x.id === pdProductId);
  if(!p || !p.variants.media) return;
  pdMediaOverride = type === 'video' ? {type:'video', src: p.variants.media.video} : {type:'image', src: p.variants.media.images[idx]};
  renderProductDetail();
}

function renderProductDetail(){
  const p = PRODUCTS.find(x => x.id === pdProductId);
  if(!p) return;
  const outOfStock = p.stock <= 0;
  const patterns = p.variants.patterns || [];
  document.getElementById('productDetailBody').innerHTML = `
    <div class="pd-media-col">
      <div class="pd-media">
        ${pdCurrentMediaHTML(p)}
      </div>
      ${pdGalleryHTML(p)}
    </div>
    <div class="pd-info">
      <div class="pd-cat" style="background:${categoryAccentBg(p.brand)}; color:${categoryAccentFg(p.brand)}; padding:5px 12px; border-radius:100px; display:inline-block;">${brandLabel(p.brand)} · ${deviceLabel(p.device)}</div>
      <div class="pd-name">${p.name}</div>
      <div class="pd-price">${fmt(p)}</div>
      ${p.variants.colors.length ? `
        <div class="pd-section-label">Renk</div>
        <div class="pd-color-row">
          ${p.variants.colors.map(c => `<button class="pd-color-chip ${c.name === pdSelectedColor ? 'active' : ''}" ${c.stock <= 0 ? 'disabled style="opacity:.4;text-decoration:line-through;cursor:not-allowed;"' : ''} onclick="selectPdColor('${c.name.replace(/'/g, "\\'")}')"><span class="pd-color-dot" style="background:${colorHex(c.name)}"></span>${c.name}</button>`).join('')}
        </div>` : ''}
      ${patterns.length ? `
        <div class="pd-section-label">Desen</div>
        <div class="pd-color-row">
          ${patterns.map(pt => `<button class="pd-model-chip ${pt.name === pdSelectedPattern ? 'active' : ''}" onclick="selectPdPattern('${pt.name.replace(/'/g, "\\'")}')">${pt.name}</button>`).join('')}
        </div>` : ''}
      ${p.variants.models.length ? `
        <div class="pd-section-label">Model</div>
        <div class="pd-color-row">
          ${p.variants.models.map(m => `<button class="pd-model-chip ${m.name === pdSelectedModelVariant ? 'active' : ''}" ${modelStockTotal(p, m) <= 0 ? 'disabled style="opacity:.4;text-decoration:line-through;cursor:not-allowed;"' : ''} onclick="selectPdModel('${m.name.replace(/'/g, "\\'")}')">${m.name}</button>`).join('')}
        </div>` : ''}
      <div class="pd-section-label">Adet</div>
      <div class="pd-qty-row">
        <button class="qty-btn" onclick="changePdQty(-1)">−</button>
        <span class="qty-val" id="pdQtyVal">${pdQty}</span>
        <button class="qty-btn" onclick="changePdQty(1)">+</button>
      </div>
      <button class="btn btn-primary pd-add-btn" ${outOfStock ? 'disabled style="opacity:.4;cursor:not-allowed;"' : ''} onclick="addPdToCart()">${outOfStock ? 'Tükendi' : 'Sepete Ekle'}</button>
      <p class="pd-stock-note">${outOfStock ? 'Bu ürün şu an stokta yok.' : (p.stock <= p.lowStockThreshold ? `⚠️ Son ${p.stock} adet kaldı` : 'Stokta var')}</p>
    </div>`;
}
function selectPdColor(c){ pdSelectedColor = c; renderProductDetail(); }
function selectPdPattern(pt){ pdSelectedPattern = pt; renderProductDetail(); }
function selectPdModel(m){ pdSelectedModelVariant = m; renderProductDetail(); }
function changePdQty(delta){
  const max = Math.max(1, remainingStock(pdProductId));
  pdQty = Math.min(max, Math.max(1, pdQty + delta));
  document.getElementById('pdQtyVal').textContent = pdQty;
}
function addPdToCart(){
  const p = PRODUCTS.find(x => x.id === pdProductId);
  const remaining = remainingStock(p.id);
  if(remaining <= 0){
    showToast('Stok tükendi — bu üründen daha fazla ekleyemezsin.');
    return;
  }
  const qtyToAdd = Math.min(pdQty, remaining);
  cart[p.id] = (cart[p.id] || 0) + qtyToAdd;
  updateCart();
  let label = qtyToAdd < pdQty ? `Stok yetersiz, sadece ${qtyToAdd} adet eklendi` : 'Sepete eklendi';
  const variantBits = [pdSelectedColor, pdSelectedModelVariant].filter(Boolean);
  if(variantBits.length) label += ` (${variantBits.join(', ')})`;
  showToast(label);
}

