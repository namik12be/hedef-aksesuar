/* ============================= ADMIN PANEL ============================= */

document.getElementById('adminLoginBtn').addEventListener('click', () => {
  const val = document.getElementById('adminPasswordInput').value;
  if(val === ADMIN_PASSWORD){
    adminUnlocked = true;
    document.getElementById('adminLoginError').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    renderAdminAll();
  } else {
    document.getElementById('adminLoginError').style.display = 'block';
  }
});
document.getElementById('adminPasswordInput').addEventListener('keydown', (e) => {
  if(e.key === 'Enter') document.getElementById('adminLoginBtn').click();
});

document.getElementById('adminTabs').addEventListener('click', (e) => {
  const btn = e.target.closest('.admin-tab-btn');
  if(!btn) return;
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.admin-panel').forEach(p => p.style.display = 'none');
  document.getElementById('tab-' + btn.dataset.tab).style.display = 'block';
});

function renderAdminAll(){
  renderStats();
  renderLowStockList();
  renderProductsTable();
  renderCategoryManager();
  renderBrandManager();
  renderDeviceTypeList();
  renderStockTable();
  renderBarcodeTab();
  renderTierManager();
  renderUserTierManager();
  renderOrders();
  renderRateDisplay();
  renderSocialLinksForm();
  renderNewsletterAdminList();
}

/* ---- Genel Bakış ---- */
function renderStats(){
  const lowStock = PRODUCTS.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outOfStock = PRODUCTS.filter(p => p.stock <= 0).length;
  const warnCount = lowStock + outOfStock;
  document.getElementById('statGrid').innerHTML = `
    <div class="stat-card"><div class="stat-label">Toplam Ürün</div><div class="stat-value">${PRODUCTS.length}</div></div>
    <div class="stat-card"><div class="stat-label">Toplam Sipariş</div><div class="stat-value">${ORDERS.length}</div></div>
    <div class="stat-card"><div class="stat-label">Aktif Kullanıcı (demo)</div><div class="stat-value">${DEMO_VISITOR_COUNT.toLocaleString('tr-TR')}</div></div>
    <div class="stat-card ${warnCount > 0 ? 'warn' : ''}"><div class="stat-label">Düşük / Biten Stok</div><div class="stat-value">${warnCount}</div></div>
  `;
}

function renderLowStockList(){
  const el = document.getElementById('lowStockList');
  const items = PRODUCTS.filter(p => p.stock <= p.lowStockThreshold);
  if(items.length === 0){
    el.innerHTML = `<p class="muted-note">Şu an düşük stoklu ürün yok.</p>`;
    return;
  }
  el.innerHTML = items.map(p => `
    <div class="category-row">
      <span>${p.name}</span>
      <span class="warn-badge">⚠️ ${p.stock <= 0 ? 'Tükendi' : 'Stok: ' + p.stock}</span>
    </div>
  `).join('');
}

/* ---- Ürünler ---- */

function renderProductsTable(){
  document.getElementById('productCountLabel').textContent = `(${PRODUCTS.length})`;
  document.getElementById('productsTableBody').innerHTML = PRODUCTS.map(p => `
    <tr>
      <td><div class="admin-thumb">${p.image ? `<img src="${p.image}">` : '📦'}</div></td>
      <td>${p.name}</td>
      <td><span style="background:${categoryAccentBg(p.brand)}; color:${categoryAccentFg(p.brand)}; padding:3px 9px; border-radius:100px; font-size:12px; font-weight:700;">${brandLabel(p.brand)}</span> · ${deviceLabel(p.device)}</td>
      <td>${fmtTRY(p.price)} <span class="muted-count">+KDV</span></td>
      <td>${stockBadgeHTML(p)}</td>
      <td>${(p.variants.colors.length || (p.variants.patterns && p.variants.patterns.length) || p.variants.models.length) ? `${p.variants.colors.length} renk, ${(p.variants.patterns || []).length} desen, ${p.variants.models.length} model` : '—'}</td>
      <td>
        <button class="admin-action-btn" onclick="openProductEditor(${p.id})">✎ Düzenle</button>
        <button class="admin-action-btn danger" onclick="deleteProduct(${p.id})">🗑 Sil</button>
      </td>
    </tr>
  `).join('');
}

function stockBadgeHTML(p){
  if(p.stock <= 0) return `<span class="stock-badge stock-out">Tükendi</span>`;
  if(p.stock <= p.lowStockThreshold) return `<span class="stock-badge stock-low">⚠️ ${p.stock}</span>`;
  return `<span class="stock-badge stock-ok">${p.stock}</span>`;
}

document.getElementById('newProductBtn').addEventListener('click', () => openProductEditor(null));

let pfColors = [];
let pfPatterns = [];
let pfModelVariants = [];
let pfUploadedImage = null;
let pfTierPrices = {};
let pfEditingProductId = null;

function enterProductEditMode(){
  document.getElementById('adminTabs').style.display = 'none';
  document.querySelectorAll('.admin-panel').forEach(el => el.style.display = 'none');
  document.getElementById('productEditScreen').style.display = 'block';
  window.scrollTo(0, 0);
}
function exitProductEditMode(){
  document.getElementById('productEditScreen').style.display = 'none';
  document.getElementById('adminTabs').style.display = 'flex';
  const activeBtn = document.querySelector('.admin-tab-btn.active') || document.querySelector('.admin-tab-btn[data-tab="urunler"]');
  activeBtn.classList.add('active');
  document.getElementById('tab-' + activeBtn.dataset.tab).style.display = 'block';
  renderProductsTable(); renderStockTable(); renderStats(); renderLowStockList();
}

function renderPfColorChips(){
  document.getElementById('pf_colors_chips').innerHTML = pfColors.map((c, i) => `
    <span class="tag-chip variant-chip">
      <span class="tag-chip-dot" style="background:${colorHex(c.name)}"></span>${c.name}
      <button type="button" class="variant-photo-btn ${c.image ? 'has-photo' : ''}" onclick="triggerVariantPhoto('color', ${i})" title="${c.image ? 'Fotoğrafı değiştir' : 'Fotoğraf ekle'}">${c.image ? '✓' : '📷'}</button>
      <button type="button" onclick="removePfColor(${i})">✕</button>
    </span>
  `).join('');
  renderVariantBarcodes();
}
function removePfColor(i){ pfColors.splice(i, 1); renderPfColorChips(); }

function renderPfPatternChips(){
  document.getElementById('pf_patterns_chips').innerHTML = pfPatterns.map((p, i) => `
    <span class="tag-chip variant-chip">
      ${p.name}
      <button type="button" class="variant-photo-btn ${p.image ? 'has-photo' : ''}" onclick="triggerVariantPhoto('pattern', ${i})" title="${p.image ? 'Fotoğrafı değiştir' : 'Fotoğraf ekle'}">${p.image ? '✓' : '📷'}</button>
      <button type="button" onclick="removePfPattern(${i})">✕</button>
    </span>
  `).join('');
  renderVariantBarcodes();
}
function removePfPattern(i){ pfPatterns.splice(i, 1); renderPfPatternChips(); }

let variantPhotoTarget = null;
function triggerVariantPhoto(kind, index){
  variantPhotoTarget = {kind, index};
  document.getElementById('variantPhotoInput').click();
}
document.getElementById('variantPhotoInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file || !variantPhotoTarget) return;
  const reader = new FileReader();
  reader.onload = () => {
    const list = variantPhotoTarget.kind === 'color' ? pfColors : pfPatterns;
    list[variantPhotoTarget.index].image = reader.result;
    if(variantPhotoTarget.kind === 'color') renderPfColorChips(); else renderPfPatternChips();
    variantPhotoTarget = null;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

function simpleHash(str){
  let hash = 0;
  for(let i = 0; i < str.length; i++){
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
function generateBarcodeNumber(productId, variantName){
  const hash = simpleHash(productId + '-' + variantName);
  return '869' + String(hash).padStart(10, '0').slice(0, 10);
}
function generateBarcodeSVG(code){
  const barHeight = 46;
  let x = 4;
  let bars = '';
  code.split('').forEach((d, i) => {
    const w = (parseInt(d, 10) % 3) + 1;
    if(i % 2 === 0){
      bars += `<rect x="${x}" y="0" width="${w}" height="${barHeight}" fill="#1a1a1f"/>`;
    }
    x += w;
  });
  const totalWidth = x + 4;
  return `<svg viewBox="0 0 ${totalWidth} ${barHeight + 18}" width="100%" height="64" xmlns="http://www.w3.org/2000/svg" style="max-width:220px;">
    ${bars}
    <text x="${totalWidth / 2}" y="${barHeight + 14}" text-anchor="middle" font-size="10" font-family="IBM Plex Mono, monospace" fill="#1a1a1f">${code}</text>
  </svg>`;
}
function renderVariantBarcodes(){
  const el = document.getElementById('pf_barcodes');
  if(!el) return;
  populateBarcodeVariantSelect();
  const idForCode = pfEditingProductId || 'yeni';
  const allVariants = [
    ...pfColors.map(c => ({name: c.name, kind: 'Renk', kindKey: 'color', manual: c.barcode})),
    ...pfPatterns.map(p => ({name: p.name, kind: 'Desen', kindKey: 'pattern', manual: p.barcode})),
  ];
  if(allVariants.length === 0){
    el.innerHTML = `<p class="muted-note" style="margin:0;">Barkod oluşturmak için önce bir renk veya desen ekle.</p>`;
    return;
  }
  el.innerHTML = allVariants.map(v => {
    const code = v.manual || generateBarcodeNumber(idForCode, v.name);
    return `<div class="barcode-card">
      <div class="barcode-label">${v.kind}: ${v.name}${v.manual ? ' <span class="barcode-manual-tag">Elle eklendi</span>' : ''}</div>
      ${generateBarcodeSVG(code)}
      ${v.manual ? `<button type="button" class="admin-action-btn danger" onclick="resetVariantBarcode('${v.kindKey}','${v.name.replace(/'/g, "\\'")}')">🗑 Kaldır</button>` : ''}
    </div>`;
  }).join('');
}
function populateBarcodeVariantSelect(){
  const el = document.getElementById('pf_barcode_variant_select');
  if(!el) return;
  const options = [
    ...pfColors.map(c => ({label: 'Renk: ' + c.name, name: c.name, kind: 'color'})),
    ...pfPatterns.map(p => ({label: 'Desen: ' + p.name, name: p.name, kind: 'pattern'})),
  ];
  if(options.length === 0){
    el.innerHTML = '<option value="">Önce renk/desen ekle</option>';
    el.disabled = true;
    return;
  }
  el.disabled = false;
  el.innerHTML = options.map(o => `<option value="${o.kind}::${o.name}">${o.label}</option>`).join('');
}
function addManualBarcode(){
  const sel = document.getElementById('pf_barcode_variant_select').value;
  const code = document.getElementById('pf_barcode_input').value.trim();
  if(!sel || !code) return;
  const [kind, name] = sel.split('::');
  const list = kind === 'color' ? pfColors : pfPatterns;
  const item = list.find(x => x.name === name);
  if(item) item.barcode = code;
  document.getElementById('pf_barcode_input').value = '';
  renderVariantBarcodes();
  showToast('Barkod eklendi — otomatik oluşturulan barkodun yerine geçti.');
}
function resetVariantBarcode(kind, name){
  const list = kind === 'color' ? pfColors : pfPatterns;
  const item = list.find(x => x.name === name);
  if(item) item.barcode = null;
  renderVariantBarcodes();
}

function renderPfModelChips(){
  document.getElementById('pf_models_chips').innerHTML = pfModelVariants.map((m, i) => `
    <span class="tag-chip model-chip-added">
      ${m.name}
      <span class="model-stock-input"><input type="number" value="${m.stock}" min="0" onchange="setPfModelStock(${i}, this.value)" title="Stok"></span>
      <button type="button" onclick="removePfModelVariant(${i})">✕</button>
    </span>
  `).join('');
}
function setPfModelStock(i, val){ pfModelVariants[i].stock = parseInt(val) || 0; }
function removePfModelVariant(i){
  pfModelVariants.splice(i, 1);
  renderPfModelChips();
  renderPfModelOptions();
}

let pfSelectedMarkaForModels = null;
function renderPfMarkaPicker(){
  document.getElementById('pf_marka_picker').innerHTML = MARKALAR.map(m => `
    <button type="button" class="chip ${pfSelectedMarkaForModels === m.key ? 'active' : ''}" onclick="selectPfMarka('${m.key}')">${m.label}</button>
  `).join('');
}
function selectPfMarka(key){
  pfSelectedMarkaForModels = key;
  renderPfMarkaPicker();
  renderPfModelOptions();
}
function renderPfModelOptions(){
  const el = document.getElementById('pf_model_options');
  if(!pfSelectedMarkaForModels){ el.innerHTML = ''; return; }
  const marka = MARKALAR.find(m => m.key === pfSelectedMarkaForModels);
  const device = document.getElementById('pf_device').value;
  const options = marka.models.filter(md => md.device === device && !pfModelVariants.some(pm => pm.name === md.label));
  if(options.length === 0){
    el.innerHTML = `<p class="muted-note" style="margin:0;">${marka.label} markasının bu cihaz tipi için eklenebilecek başka modeli yok.</p>`;
    return;
  }
  el.innerHTML = options.map(md => `<button type="button" class="chip model-chip-available" onclick="addPfModelFromPicker('${md.label.replace(/'/g, "\\'")}')">+ ${md.label}</button>`).join('');
}
function addPfModelFromPicker(label){
  if(!pfModelVariants.some(m => m.name === label)){
    pfModelVariants.push({name: label, stock: 10});
    renderPfModelChips();
    renderPfModelOptions();
  }
}

function renderPfTierPrices(p){
  const nonUyeTiers = PRICE_TIERS.filter(t => t.id !== 'uye');
  const basePrice = p ? p.price : (parseFloat(document.getElementById('pf_price') ? document.getElementById('pf_price').value : 0) || 0);
  if(nonUyeTiers.length === 0){
    document.getElementById('pf_tier_prices').innerHTML = `<p class="muted-note" style="margin:0;">Henüz Üye dışında bir ünvan tanımlanmamış. "Ünvanlar ve Fiyat Kademeleri" sekmesinden ekleyebilirsin.</p>`;
    return;
  }
  document.getElementById('pf_tier_prices').innerHTML = nonUyeTiers.map(t => {
    const fallback = t.currency === 'USD'
      ? '$' + (basePrice / usdRate * (1 - (t.discount || 0) / 100)).toFixed(2)
      : Math.round(basePrice * (1 - (t.discount || 0) / 100)) + ' ₺';
    const existing = pfTierPrices[t.id];
    const symbolBefore = t.currency === 'USD' ? '$' : '';
    const symbolAfter = t.currency === 'USD' ? '' : '₺';
    return `
      <div class="admin-form-row" style="align-items:center;">
        <span style="min-width:90px; font-weight:600; font-size:13.5px;">${t.name}</span>
        ${symbolBefore ? `<span style="color:var(--muted); font-size:13px;">${symbolBefore}</span>` : ''}
        <input class="admin-input" data-tier-price="${t.id}" type="number" step="0.01" value="${existing !== undefined && existing !== null ? existing : ''}" placeholder="otomatik: ${fallback}">
        ${symbolAfter ? `<span style="color:var(--muted); font-size:13px;">${symbolAfter}</span>` : ''}
      </div>`;
  }).join('');
}

function openProductEditor(productId){
  const p = productId ? PRODUCTS.find(x => x.id === productId) : null;
  pfEditingProductId = productId || null;
  pfColors = p ? p.variants.colors.map(c => ({...c})) : [];
  pfPatterns = p ? (p.variants.patterns || []).map(pt => ({...pt})) : [];
  pfModelVariants = p ? p.variants.models.map(m => ({...m})) : [];
  pfUploadedImage = p ? p.image : null;
  pfTierPrices = p ? Object.assign({}, p.tierPrices) : {};

  const catOptions = CATEGORIES.map(c => `<option value="${c.key}" ${p && p.brand===c.key ? 'selected':''}>${c.label}</option>`).join('');
  const deviceOptions = ['telefon','tablet','airpods','saat','kulaklik'].map(d => `<option value="${d}" ${p && p.device===d ? 'selected':''}>${deviceLabel(d)}</option>`).join('');

  document.getElementById('productEditScreen').innerHTML = `
    <button class="btn btn-ghost" id="pf_back">← Ürünlere Geri Dön</button>
    <div class="admin-form" style="margin-top:18px;">
      <h3>${p ? 'Ürünü Düzenle: ' + p.name : 'Yeni Ürün Ekle'}</h3>
      <div class="admin-form-grid">
        <div><label>Ürün Adı</label><input class="admin-input" id="pf_name" value="${p ? p.name.replace(/"/g,'&quot;') : ''}"></div>
        <div><label>Fiyat (₺ +KDV — Üye)</label><input class="admin-input" id="pf_price" type="number" value="${p ? p.price : ''}"></div>
        <div><label>Kategori</label><select class="admin-input" id="pf_brand">${catOptions}</select></div>
        <div><label>Cihaz Tipi</label><select class="admin-input" id="pf_device">${deviceOptions}</select></div>
        <div><label>Stok Adedi</label><input class="admin-input" id="pf_stock" type="number" value="${p ? p.stock : 20}"></div>
        <div><label>Düşük Stok Eşiği</label><input class="admin-input" id="pf_threshold" type="number" value="${p ? p.lowStockThreshold : 5}"></div>
      </div>
      <div style="margin-top:6px;">
        <label>Renk Varyantları — yaz, Enter'a bas</label>
        <p class="muted-note" style="margin:0 0 8px;">Her rengin yanındaki 📷 ikonuna basarak o renge özel fotoğraf ekleyebilirsin.</p>
        <div class="tag-input-box">
          <div class="tag-chip-row" id="pf_colors_chips"></div>
          <input class="tag-input-field" id="pf_colors_input" placeholder="ör. Kırmızı">
        </div>
      </div>
      <div style="margin-top:16px;">
        <label>Desen Varyantları (opsiyonel)</label>
        <p class="muted-note" style="margin:0 0 8px;">Desen eklemek zorunda değilsin — istersen boş bırak.</p>
        <div class="tag-input-box">
          <div class="tag-chip-row" id="pf_patterns_chips"></div>
          <input class="tag-input-field" id="pf_patterns_input" placeholder="ör. Mermer">
        </div>
      </div>
      <div style="margin-top:16px;">
        <label>Varyant Barkodları</label>
        <p class="muted-note" style="margin:0 0 10px;">Her renk ve desen için otomatik bir barkod oluşturulur. Ürün tedarikçiden hazır barkodlu geldiyse, hangi renk/deseni olduğunu seçip kendi barkodunu ekleyebilirsin — otomatik oluşturulanın yerine geçer.</p>
        <div class="admin-form-row" style="margin-top:0;">
          <select class="admin-input" id="pf_barcode_variant_select" style="max-width:200px;"></select>
          <input class="admin-input" id="pf_barcode_input" placeholder="Barkod numarası">
          <button class="btn btn-ghost" id="pf_add_barcode_btn">+ Barkod Ekle</button>
        </div>
        <div id="pf_barcodes" class="barcode-grid" style="margin-top:14px;"></div>
      </div>
      <div style="margin-top:16px;">
        <label>Model Varyantları</label>
        <p class="muted-note" style="margin:0 0 10px;">Önce bir marka seç — o markanın, seçtiğin cihaz tipine uygun modelleri çıkacak. Modele tıklayınca ekleniyor ve aşağıdaki listeye taşınıyor.</p>
        <div class="tag-input-box">
          <div class="chip-row" id="pf_marka_picker"></div>
          <div class="chip-row" id="pf_model_options" style="margin-top:10px;"></div>
        </div>
        <p class="muted-note" style="margin:14px 0 8px;">Eklenen modeller (stok girebilirsin):</p>
        <div class="tag-chip-row" id="pf_models_chips"></div>
      </div>
      <div style="margin-top:16px;">
        <label>Ünvanlara Özel Fiyatlar</label>
        <p class="muted-note" style="margin:0 0 10px;">Üye her zaman yukarıdaki TL (+KDV) fiyatını görür. Diğer ünvanlar için boş bırakırsan güncel kura göre otomatik hesaplanır; istersen kendi fiyatını gir.</p>
        <div id="pf_tier_prices"></div>
      </div>
      <div style="margin-top:16px;">
        <label>Ürün Fotoğrafı</label>
        <input class="admin-input" id="pf_image" type="file" accept="image/*">
      </div>
      <div class="admin-form-actions" style="margin-top:20px;">
        <button class="btn btn-primary" id="pf_save">${p ? 'Kaydet' : 'Ürünü Ekle'}</button>
        <button class="btn btn-ghost" id="pf_cancel">Vazgeç</button>
      </div>
    </div>`;

  renderPfColorChips();
  renderPfPatternChips();
  renderPfModelChips();
  pfSelectedMarkaForModels = null;
  renderPfMarkaPicker();
  renderPfModelOptions();
  renderPfTierPrices(p);
  enterProductEditMode();

  document.getElementById('pf_back').addEventListener('click', exitProductEditMode);
  document.getElementById('pf_cancel').addEventListener('click', exitProductEditMode);

  document.getElementById('pf_colors_input').addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
      e.preventDefault();
      const val = e.target.value.trim();
      if(val && !pfColors.some(c => c.name === val)){ pfColors.push({name: val, image: null, stock: 10, barcode: null}); renderPfColorChips(); }
      e.target.value = '';
    }
  });
  document.getElementById('pf_patterns_input').addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
      e.preventDefault();
      const val = e.target.value.trim();
      if(val && !pfPatterns.some(p => p.name === val)){ pfPatterns.push({name: val, image: null, barcode: null}); renderPfPatternChips(); }
      e.target.value = '';
    }
  });
  document.getElementById('pf_device').addEventListener('change', renderPfModelOptions);
  document.getElementById('pf_add_barcode_btn').addEventListener('click', addManualBarcode);

  document.getElementById('pf_image').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => { pfUploadedImage = reader.result; };
    reader.readAsDataURL(file);
  });

  document.getElementById('pf_save').addEventListener('click', () => {
    const name = document.getElementById('pf_name').value.trim();
    const price = parseFloat(document.getElementById('pf_price').value) || 0;
    const brand = document.getElementById('pf_brand').value;
    const device = document.getElementById('pf_device').value;
    const stock = parseInt(document.getElementById('pf_stock').value) || 0;
    const threshold = parseInt(document.getElementById('pf_threshold').value) || 5;
    if(!name){ showToast('Ürün adı gerekli.'); return; }

    const tierPrices = {};
    document.querySelectorAll('[data-tier-price]').forEach(input => {
      const val = input.value.trim();
      tierPrices[input.dataset.tierPrice] = val === '' ? null : parseFloat(val);
    });

    if(p){
      p.name = name; p.price = price; p.brand = brand; p.device = device;
      p.stock = stock; p.lowStockThreshold = threshold;
      p.variants = {colors: pfColors.map(c=>({...c})), patterns: pfPatterns.map(pt=>({...pt})), models: pfModelVariants.map(m=>({...m}))};
      p.tierPrices = tierPrices;
      if(pfUploadedImage) p.image = pfUploadedImage;
    } else {
      PRODUCTS.push({
        id: nextProductId++, name, price, brand, sub: device, device,
        screen: 'linear-gradient(160deg,#c9cfd8,#eef1f5)', tag: null, universal: true,
        stock, lowStockThreshold: threshold, image: pfUploadedImage, variants:{colors: pfColors.map(c=>({...c})), patterns: pfPatterns.map(pt=>({...pt})), models: pfModelVariants.map(m=>({...m}))},
        tierPrices,
      });
    }
    renderGrid(); renderFeaturedRows(); renderSidebar();
    exitProductEditMode();
  });
}

function deleteProduct(id){
  showCustomConfirm('Bu ürünü silmek istediğine emin misin?', () => {
    const idx = PRODUCTS.findIndex(p => p.id === id);
    if(idx > -1) PRODUCTS.splice(idx, 1);
    renderProductsTable(); renderStockTable(); renderStats(); renderLowStockList();
    renderGrid(); renderFeaturedRows(); renderSidebar();
  });
}

/* ---- Kategoriler & Markalar ---- */
function renderCategoryManager(){
  document.getElementById('categoryManager').innerHTML = CATEGORIES.map(c => `
    <div class="category-row" style="flex-direction:column; align-items:stretch;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span><span style="display:inline-block; width:9px; height:9px; border-radius:50%; background:${categoryAccentFg(c.key)}; margin-right:8px;"></span><strong>${c.label}</strong> <span class="muted-count">(${c.subs.length} cihaz tipi)</span></span>
        <button class="admin-btn-icon danger" onclick="removeCategory('${c.key}')" aria-label="Sil">🗑</button>
      </div>
      <div class="brand-models">
        ${c.subs.map(s => `<span class="brand-model-chip">${s.label}<button type="button" class="chip-remove-btn" onclick="removeCategorySub('${c.key}','${s.key}')">✕</button></span>`).join('')}
        <div style="margin-top:8px; display:flex; gap:6px;">
          <input class="admin-input" placeholder="Yeni cihaz tipi (ör. Kulaklık)" id="newSubInput_${c.key}" style="font-size:12.5px; padding:7px 10px;">
          <button class="btn btn-ghost" style="padding:7px 12px; font-size:12.5px;" onclick="addCategorySub('${c.key}')">+ Ekle</button>
        </div>
      </div>
    </div>
  `).join('');
}
document.getElementById('addCategoryBtn').addEventListener('click', () => {
  const input = document.getElementById('newCategoryInput');
  const label = input.value.trim();
  if(!label) return;
  const key = label.toLowerCase().replace(/[^a-z0-9ığüşöç]+/gi, '-');
  CATEGORIES.push({key, label, subs:[]});
  input.value = '';
  renderCategoryManager(); renderSidebar();
});
function removeCategory(key){
  const cat = CATEGORIES.find(c => c.key === key);
  const hasDependents = (cat.subs.length > 0) || PRODUCTS.some(p => p.brand === key);
  const doDelete = () => {
    CATEGORIES = CATEGORIES.filter(c => c.key !== key);
    renderCategoryManager(); renderSidebar();
  };
  if(hasDependents){
    showCustomConfirm(`"${cat.label}" kategorisinin içinde ${cat.subs.length} cihaz tipi ve/veya ürün var. Yine de silmek istediğine emin misin?`, doDelete);
  } else {
    doDelete();
  }
}
function addCategorySub(catKey){
  const input = document.getElementById('newSubInput_' + catKey);
  const label = input.value.trim();
  if(!label) return;
  const cat = CATEGORIES.find(c => c.key === catKey);
  const key = label.toLowerCase().replace(/[^a-z0-9ığüşöç]+/gi, '-');
  cat.subs.push({key, label});
  input.value = '';
  renderCategoryManager(); renderSidebar();
}
function removeCategorySub(catKey, subKey){
  const cat = CATEGORIES.find(c => c.key === catKey);
  const sub = cat.subs.find(s => s.key === subKey);
  const hasDependents = PRODUCTS.some(p => p.brand === catKey && p.sub === subKey);
  const doDelete = () => {
    cat.subs = cat.subs.filter(s => s.key !== subKey);
    renderCategoryManager(); renderSidebar();
  };
  if(hasDependents){
    showCustomConfirm(`"${sub.label}" cihaz tipinde ürün var. Yine de silmek istediğine emin misin?`, doDelete);
  } else {
    doDelete();
  }
}

let DEVICE_TYPES = [
  {key:'telefon', label:'Telefon'},
  {key:'tablet', label:'Tablet'},
  {key:'airpods', label:'Kulaklık'},
  {key:'saat', label:'Akıllı Saat'},
];
let brandModelFilter = {};

function renderBrandManager(){
  document.getElementById('brandManager').innerHTML = MARKALAR.map(m => {
    const filterKey = brandModelFilter[m.key] || 'all';
    const shownModels = filterKey === 'all' ? m.models : m.models.filter(md => md.device === filterKey);
    return `
    <div class="brand-row" style="flex-direction:column; align-items:stretch;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${m.label}</strong>
        <button class="admin-btn-icon danger" onclick="removeBrand('${m.key}')" aria-label="Sil">🗑</button>
      </div>
      <div class="brand-models">
        ${m.models.length > 0 ? `
        <div class="chip-row" style="margin-bottom:10px;">
          <button type="button" class="chip ${filterKey==='all' ? 'active' : ''}" style="padding:5px 12px; font-size:12px;" onclick="setBrandModelFilter('${m.key}','all')">Tümü</button>
          ${DEVICE_TYPES.map(d => `<button type="button" class="chip ${filterKey===d.key ? 'active' : ''}" style="padding:5px 12px; font-size:12px;" onclick="setBrandModelFilter('${m.key}','${d.key}')">${d.label}</button>`).join('')}
        </div>` : ''}
        ${shownModels.length === 0 ? `<p class="muted-note" style="margin:0 0 8px;">Bu filtrede model yok.</p>` : shownModels.map(md => `<span class="brand-model-chip">${md.label}<button type="button" class="chip-remove-btn" onclick="removeModel('${m.key}','${md.key}')">✕</button></span>`).join('')}
        <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
          <input class="admin-input" placeholder="Yeni model" id="newModelInput_${m.key}" style="font-size:12.5px; padding:7px 10px; flex:1; min-width:100px;">
          <select class="admin-input" id="newModelDevice_${m.key}" style="font-size:12.5px; padding:7px 10px; max-width:130px;">
            ${DEVICE_TYPES.map(d => `<option value="${d.key}">${d.label}</option>`).join('')}
          </select>
          <button class="btn btn-ghost" style="padding:7px 12px; font-size:12.5px;" onclick="addModel('${m.key}')">+ Model</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
function setBrandModelFilter(brandKey, deviceKey){
  brandModelFilter[brandKey] = deviceKey;
  renderBrandManager();
}
function addDeviceType(){
  const input = document.getElementById('newDeviceTypeInput');
  const label = input.value.trim();
  if(!label) return;
  const key = label.toLowerCase().replace(/[^a-z0-9ığüşöç]+/gi, '-');
  if(DEVICE_TYPES.some(d => d.key === key)) return;
  DEVICE_TYPES.push({key, label});
  input.value = '';
  renderBrandManager();
  renderDeviceTypeList();
}
function renderDeviceTypeList(){
  const el = document.getElementById('deviceTypeList');
  if(!el) return;
  el.innerHTML = DEVICE_TYPES.map(d => `<span class="brand-model-chip">${d.label}</span>`).join('');
}
document.getElementById('addBrandBtn').addEventListener('click', () => {
  const input = document.getElementById('newBrandInput');
  const label = input.value.trim();
  if(!label) return;
  const key = label.toLowerCase().replace(/[^a-z0-9]+/gi, '-');
  MARKALAR.push({key, label, models:[]});
  input.value = '';
  renderBrandManager();
});
document.getElementById('addDeviceTypeBtn').addEventListener('click', addDeviceType);
function removeBrand(key){
  showCustomConfirm('Bu markayı silmek istediğine emin misin?', () => {
    MARKALAR = MARKALAR.filter(m => m.key !== key);
    renderBrandManager();
  });
}
function addModel(brandKey){
  const input = document.getElementById('newModelInput_' + brandKey);
  const deviceSel = document.getElementById('newModelDevice_' + brandKey);
  const label = input.value.trim();
  if(!label) return;
  const marka = MARKALAR.find(m => m.key === brandKey);
  const key = label.toLowerCase().replace(/[^a-z0-9]+/gi, '-');
  marka.models.push({key, label, device: deviceSel.value});
  MODEL_TO_MARKA[key] = brandKey;
  renderBrandManager();
}
function removeModel(brandKey, modelKey){
  const marka = MARKALAR.find(m => m.key === brandKey);
  marka.models = marka.models.filter(md => md.key !== modelKey);
  delete MODEL_TO_MARKA[modelKey];
  renderBrandManager();
}

/* ---- Stok ---- */
let stockSearchTerm = '';
let stockExpanded = {};
function renderStockTable(){
  const el = document.getElementById('stockCardsList');
  const search = normalizeTr(stockSearchTerm);
  const list = PRODUCTS.filter(p => !search || normalizeTr(p.name).includes(search));
  if(list.length === 0){
    el.innerHTML = `<p class="muted-note">Ürün bulunamadı.</p>`;
    return;
  }
  el.innerHTML = list.map(p => {
    const hasVariants = p.variants.colors.length > 0 || p.variants.models.length > 0;
    const isOpen = !!stockExpanded[p.id];
    return `
    <div class="stock-card">
      <div class="stock-card-head ${hasVariants ? 'clickable' : ''}" ${hasVariants ? `onclick="toggleStockVariants(${p.id})"` : ''}>
        <div class="stock-card-thumb">${p.image ? `<img src="${p.image}">` : '📦'}</div>
        <div class="stock-card-name">${p.name}</div>
        ${stockBadgeHTML(p)}
        <div class="qty-inline" onclick="event.stopPropagation()">
          <button class="qty-btn" onclick="adjustStock(${p.id}, -1)">−</button>
          <span class="qty-val">${p.stock}</span>
          <button class="qty-btn" onclick="adjustStock(${p.id}, 1)">+</button>
        </div>
        <button class="admin-btn-icon" onclick="event.stopPropagation(); restockProduct(${p.id})" title="Toplu yenile (25)">↻</button>
        ${hasVariants ? `<svg class="stock-chevron ${isOpen ? 'open' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>` : ''}
      </div>
      ${hasVariants ? `
      <div class="stock-variant-section ${isOpen ? 'open' : ''}" id="stockVariants_${p.id}">
        ${hasModelStockMatrix(p) ? stockMatrixHTML(p) : `
        <div class="stock-grid-wrap">
          ${p.variants.colors.length ? `
            <div class="stock-grid-block">
              <div class="stock-variant-group-label">🎨 Renk Stokları</div>
              <div class="stock-grid">
                ${p.variants.colors.map((c, i) => `
                  <div class="stock-grid-row">
                    <span class="stock-grid-label"><span class="tag-chip-dot" style="background:${colorHex(c.name)};"></span>${c.name}</span>
                    ${variantStockBadge(c.stock)}
                    <input type="number" class="stock-grid-input" value="${c.stock}" min="0" onchange="setColorStock(${p.id}, ${i}, this.value)">
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          ${p.variants.models.length ? `
            <div class="stock-grid-block">
              <div class="stock-variant-group-label">📱 Model Stokları</div>
              <div class="stock-grid">
                ${p.variants.models.map((m, i) => `
                  <div class="stock-grid-row">
                    <span class="stock-grid-label">${m.name}</span>
                    ${variantStockBadge(m.stock)}
                    <input type="number" class="stock-grid-input" value="${m.stock}" min="0" onchange="setModelStock(${p.id}, ${i}, this.value)">
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        `}
      </div>` : ''}
    </div>`;
  }).join('');
}
function stockMatrixHTML(p){
  const columns = modelVariantColumns(p);
  return `
    <div class="stock-matrix-wrap">
      <table class="stock-matrix">
        <thead>
          <tr>
            <th>Model</th>
            ${columns.map(col => `<th>${col.type === 'color' ? `<span class="stock-col-dot" style="background:${colorHex(col.name)};"></span>` : ''}${col.name}</th>`).join('')}
            <th>Toplam</th>
          </tr>
        </thead>
        <tbody>
          ${p.variants.models.map((m, mi) => `
            <tr>
              <td>${m.name}</td>
              ${columns.map(col => `<td><input type="number" class="stock-matrix-input" min="0" value="${modelVariantStockValue(m, col.name)}" onchange="setModelVariantStock(${p.id}, ${mi}, '${col.name.replace(/'/g, "\\'")}', this.value)"></td>`).join('')}
              <td>${variantStockBadge(modelStockTotal(p, m))}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td>Toplam</td>
            ${columns.map(col => `<td>${p.variants.models.reduce((sum, m) => sum + modelVariantStockValue(m, col.name), 0)}</td>`).join('')}
            <td>${p.variants.models.reduce((sum, m) => sum + modelStockTotal(p, m), 0)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <p class="stock-matrix-note">Her modelin toplam stoğu, o modeldeki renk/desen adetlerinin toplamından otomatik hesaplanır — ayrıca model için tek bir sayı girmenize gerek yok.</p>
  `;
}
function setColorStock(productId, idx, val){
  const p = PRODUCTS.find(x => x.id === productId);
  p.variants.colors[idx].stock = Math.max(0, parseInt(val) || 0);
  renderStockTable();
}
function setModelStock(productId, idx, val){
  const p = PRODUCTS.find(x => x.id === productId);
  p.variants.models[idx].stock = Math.max(0, parseInt(val) || 0);
  renderStockTable();
}
function setModelVariantStock(productId, modelIdx, variantName, val){
  const p = PRODUCTS.find(x => x.id === productId);
  const m = p.variants.models[modelIdx];
  if(!m.variantStock) m.variantStock = {};
  m.variantStock[variantName] = Math.max(0, parseInt(val) || 0);
  renderStockTable();
}
function variantStockBadge(stock){
  if(stock <= 0) return `<span class="stock-badge stock-out">Tükendi</span>`;
  if(stock <= 5) return `<span class="stock-badge stock-low">⚠️ ${stock}</span>`;
  return `<span class="stock-badge stock-ok">${stock}</span>`;
}
function toggleStockVariants(id){
  stockExpanded[id] = !stockExpanded[id];
  renderStockTable();
}
document.getElementById('stockSearchInput').addEventListener('input', (e) => {
  stockSearchTerm = e.target.value;
  renderStockTable();
});
function adjustStock(id, delta){
  const p = PRODUCTS.find(x => x.id === id);
  p.stock = Math.max(0, p.stock + delta);
  renderStockTable(); renderStats(); renderLowStockList(); renderProductsTable(); renderGrid(); renderFeaturedRows();
}
function restockProduct(id){
  const p = PRODUCTS.find(x => x.id === id);
  p.stock = 25;
  renderStockTable(); renderStats(); renderLowStockList(); renderProductsTable(); renderGrid(); renderFeaturedRows();
}

/* ---- Barkodlar ---- */
let barcodeSearchTerm = '';
let barcodeExpanded = {};
function renderBarcodeTab(){
  const el = document.getElementById('barcodeCardsList');
  if(!el) return;
  const search = normalizeTr(barcodeSearchTerm);
  const list = PRODUCTS.filter(p => {
    const hasVariants = p.variants.colors.length > 0 || (p.variants.patterns && p.variants.patterns.length > 0);
    return hasVariants && (!search || normalizeTr(p.name).includes(search));
  });
  if(list.length === 0){
    el.innerHTML = `<p class="muted-note">Barkodlu varyantı olan ürün bulunamadı.</p>`;
    return;
  }
  el.innerHTML = list.map(p => {
    const isOpen = !!barcodeExpanded[p.id];
    const hasModels = hasModelStockMatrix(p);
    const columns = modelVariantColumns(p);
    const variantCount = hasModels ? p.variants.models.length * columns.length : columns.length;
    return `
    <div class="stock-card">
      <div class="stock-card-head clickable" onclick="toggleBarcodeVariants(${p.id})">
        <div class="stock-card-thumb">${p.image ? `<img src="${p.image}">` : '📦'}</div>
        <div class="stock-card-name">${p.name}</div>
        <span class="muted-count">${variantCount} barkod${hasModels ? ' · ' + p.variants.models.length + ' model' : ''}</span>
        <svg class="stock-chevron ${isOpen ? 'open' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </div>
      <div class="stock-variant-section ${isOpen ? 'open' : ''}">
        ${hasModels ? barcodeModelMatrixHTML(p, columns) : `
        <div class="barcode-grid">
          ${p.variants.colors.map((c, i) => barcodeCardHTML(p, 'color', i, c)).join('')}
          ${(p.variants.patterns || []).map((pt, i) => barcodeCardHTML(p, 'pattern', i, pt)).join('')}
        </div>
        `}
      </div>
    </div>`;
  }).join('');
}
function barcodeCardHTML(p, kind, idx, variant){
  const code = variant.barcode || generateBarcodeNumber(p.id, variant.name);
  const kindLabel = kind === 'color' ? 'Renk' : 'Desen';
  const fieldId = `barcodeManualInput_${p.id}_${kind}_${idx}`;
  return `<div class="barcode-card">
    <div class="barcode-label">${kindLabel}: ${variant.name}${variant.barcode ? ' <span class="barcode-manual-tag">Elle eklendi</span>' : ''}</div>
    ${generateBarcodeSVG(code)}
    ${variant.barcode
      ? `<button type="button" class="admin-action-btn danger" onclick="resetProductVariantBarcode(${p.id}, '${kind}', ${idx})">🗑 Kaldır</button>`
      : `<div class="admin-form-row" style="margin-top:0;">
          <input class="admin-input" id="${fieldId}" placeholder="Barkod no" style="font-size:12px; padding:8px 10px; min-width:110px;">
          <button type="button" class="admin-action-btn" onclick="saveManualBarcodeFromField(${p.id}, '${kind}', ${idx})">Ekle</button>
        </div>`}
  </div>`;
}
function barcodeModelMatrixHTML(p, columns){
  return p.variants.models.map((m, mi) => `
    <div class="barcode-model-group">
      <div class="stock-variant-group-label">📱 ${m.name}</div>
      <div class="barcode-grid">
        ${columns.map((col, ci) => barcodeModelVariantCardHTML(p, mi, m, col, ci)).join('')}
      </div>
    </div>
  `).join('');
}
function barcodeModelVariantCardHTML(p, modelIdx, m, col, colIdx){
  const manual = m.variantBarcodes && m.variantBarcodes[col.name];
  const code = manual || generateBarcodeNumber(p.id + '-' + m.name, col.name);
  const kindLabel = col.type === 'color' ? 'Renk' : 'Desen';
  const fieldId = `barcodeModelInput_${p.id}_${modelIdx}_${colIdx}`;
  return `<div class="barcode-card">
    <div class="barcode-label">${kindLabel}: ${col.name}${manual ? ' <span class="barcode-manual-tag">Elle eklendi</span>' : ''}</div>
    ${generateBarcodeSVG(code)}
    ${manual
      ? `<button type="button" class="admin-action-btn danger" onclick="resetModelVariantBarcode(${p.id}, ${modelIdx}, '${col.name.replace(/'/g, "\\'")}')">🗑 Kaldır</button>`
      : `<div class="admin-form-row" style="margin-top:0;">
          <input class="admin-input" id="${fieldId}" placeholder="Barkod no" style="font-size:12px; padding:8px 10px; min-width:110px;">
          <button type="button" class="admin-action-btn" onclick="saveModelVariantBarcode(${p.id}, ${modelIdx}, '${col.name.replace(/'/g, "\\'")}', '${fieldId}')">Ekle</button>
        </div>`}
  </div>`;
}
function toggleBarcodeVariants(id){
  barcodeExpanded[id] = !barcodeExpanded[id];
  renderBarcodeTab();
}
function saveManualBarcodeFromField(productId, kind, idx){
  const input = document.getElementById(`barcodeManualInput_${productId}_${kind}_${idx}`);
  const val = input.value.trim();
  if(!val) return;
  const p = PRODUCTS.find(x => x.id === productId);
  const variant = kind === 'color' ? p.variants.colors[idx] : p.variants.patterns[idx];
  variant.barcode = val;
  renderBarcodeTab();
  showToast('Barkod eklendi — otomatik oluşturulanın yerine geçti.');
}
function resetProductVariantBarcode(productId, kind, idx){
  const p = PRODUCTS.find(x => x.id === productId);
  const variant = kind === 'color' ? p.variants.colors[idx] : p.variants.patterns[idx];
  variant.barcode = null;
  renderBarcodeTab();
}
function saveModelVariantBarcode(productId, modelIdx, variantName, fieldId){
  const input = document.getElementById(fieldId);
  const val = input.value.trim();
  if(!val) return;
  const p = PRODUCTS.find(x => x.id === productId);
  const m = p.variants.models[modelIdx];
  if(!m.variantBarcodes) m.variantBarcodes = {};
  m.variantBarcodes[variantName] = val;
  renderBarcodeTab();
  showToast('Barkod eklendi — otomatik oluşturulanın yerine geçti.');
}
function resetModelVariantBarcode(productId, modelIdx, variantName){
  const p = PRODUCTS.find(x => x.id === productId);
  const m = p.variants.models[modelIdx];
  if(m.variantBarcodes) delete m.variantBarcodes[variantName];
  renderBarcodeTab();
}
document.getElementById('barcodeSearchInput').addEventListener('input', (e) => {
  barcodeSearchTerm = e.target.value;
  renderBarcodeTab();
});

/* ---- Fiyat Kademeleri & Bayiler ---- */
let editingTierId = null;
function renderTierManager(){
  document.getElementById('tierManager').innerHTML = PRICE_TIERS.map(t => {
    if(editingTierId === t.id){
      return `
        <div class="tier-row" style="flex-direction:column; align-items:stretch; gap:8px;">
          <div class="admin-form-row" style="margin-top:0;">
            <input class="admin-input" id="editTierName_${t.id}" value="${t.name.replace(/"/g,'&quot;')}">
            <select class="admin-input" id="editTierCurrency_${t.id}" style="max-width:110px;">
              <option value="TRY" ${t.currency==='TRY'?'selected':''}>₺ TL</option>
              <option value="USD" ${t.currency==='USD'?'selected':''}>$ USD</option>
            </select>
            <input class="admin-input" id="editTierDiscount_${t.id}" type="number" value="${t.discount}" style="max-width:100px;">
          </div>
          <div class="admin-form-actions" style="margin-top:0;">
            <button class="btn btn-primary" onclick="saveTierEdit('${t.id}')">Kaydet</button>
            <button class="btn btn-ghost" onclick="cancelTierEdit()">Vazgeç</button>
          </div>
        </div>`;
    }
    return `
      <div class="tier-row">
        <span>${t.name} <span class="muted-count">— ${t.currency === 'USD' ? '$' : '₺'} · %${t.discount} indirim ${t.isProtected ? '· Varsayılan' : ''}</span></span>
        <div>
          <button class="admin-action-btn" onclick="startTierEdit('${t.id}')">✎ Düzenle</button>
          ${t.isProtected ? '' : `<button class="admin-action-btn danger" onclick="removeTier('${t.id}')">🗑 Sil</button>`}
        </div>
      </div>`;
  }).join('');
}
function startTierEdit(id){ editingTierId = id; renderTierManager(); }
function cancelTierEdit(){ editingTierId = null; renderTierManager(); }
function saveTierEdit(id){
  const t = PRICE_TIERS.find(x => x.id === id);
  t.name = document.getElementById('editTierName_' + id).value.trim() || t.name;
  t.currency = document.getElementById('editTierCurrency_' + id).value;
  t.discount = parseFloat(document.getElementById('editTierDiscount_' + id).value) || 0;
  editingTierId = null;
  renderTierManager();
  renderGrid(); renderFeaturedRows(); updateCart();
}
document.getElementById('addTierBtn').addEventListener('click', () => {
  const name = document.getElementById('newTierName').value.trim();
  const currency = document.getElementById('newTierCurrency').value;
  const discount = parseFloat(document.getElementById('newTierDiscount').value) || 0;
  if(!name) return;
  PRICE_TIERS.push({id:'t' + Date.now(), name, currency, discount});
  document.getElementById('newTierName').value = '';
  document.getElementById('newTierDiscount').value = '';
  renderTierManager(); renderUserTierManager();
});
function removeTier(id){
  showCustomConfirm('Bu ünvanı silmek istediğine emin misin? Bu ünvana atanmış kullanıcılar varsayılan Üye fiyatına döner.', () => {
    PRICE_TIERS = PRICE_TIERS.filter(t => t.id !== id);
    USERS.forEach(u => { if(u.tierId === id) u.tierId = 'uye'; });
    renderTierManager(); renderUserTierManager();
    renderGrid(); renderFeaturedRows(); updateCart();
  });
}

let userMgmtSearch = '';
let userMgmtFilter = 'tumu';
function renderUserFilterChips(){
  document.getElementById('userFilterChips').innerHTML = `
    <button class="chip ${userMgmtFilter==='tumu'?'active':''}" data-f="tumu">Tümü</button>
    <button class="chip ${userMgmtFilter==='yeni'?'active':''}" data-f="yeni">Yeni Üyeler</button>
    <button class="chip ${userMgmtFilter==='eski'?'active':''}" data-f="eski">Eski Üyeler</button>
  `;
}
function renderUserTierManager(){
  renderUserFilterChips();
  const searchNorm = normalizeTr(userMgmtSearch);
  let list = USERS.filter(u => {
    if(userMgmtFilter === 'yeni' && u.isSeed) return false;
    if(userMgmtFilter === 'eski' && !u.isSeed) return false;
    if(!searchNorm) return true;
    return normalizeTr(u.displayName).includes(searchNorm) ||
      (u.email && normalizeTr(u.email).includes(searchNorm)) ||
      (u.phone && u.phone.includes(userMgmtSearch));
  });
  if(list.length === 0){
    document.getElementById('userTierManager').innerHTML = `<p class="muted-note">Bu filtreye uyan kullanıcı bulunamadı.</p>`;
    return;
  }
  document.getElementById('userTierManager').innerHTML = list.map(u => `
    <div class="dealer-row">
      <span>${u.displayName} <span class="muted-count">— ${u.role === 'admin' ? 'Yönetici' : 'Müşteri'}${!u.isSeed ? ' · <span style="color:var(--red); font-weight:700;">Yeni</span>' : ''}</span></span>
      <select class="admin-input" style="max-width:160px;" onchange="setUserTier('${u.username}', this.value)">
        ${PRICE_TIERS.map(t => `<option value="${t.id}" ${u.tierId === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
      </select>
    </div>
  `).join('');
}
document.getElementById('userSearchInput').addEventListener('input', (e) => {
  userMgmtSearch = e.target.value;
  renderUserTierManager();
});
document.getElementById('userFilterChips').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if(!btn) return;
  userMgmtFilter = btn.dataset.f;
  renderUserTierManager();
});
function setUserTier(username, tierId){
  const u = USERS.find(x => x.username === username);
  if(u){ u.tierId = tierId; }
  if(currentUser && currentUser.username === username){
    renderGrid(); renderFeaturedRows(); updateCart();
  }
  showToast(`${u.displayName} artık "${PRICE_TIERS.find(t=>t.id===tierId).name}" ünvanında.`);
}

/* ---- Siparişler ---- */
function renderOrders(){
  document.getElementById('ordersList').innerHTML = ORDERS.map(o => {
    const itemsText = o.items.map(it => {
      const p = PRODUCTS.find(x => x.id === it.productId);
      return p ? `${p.name} × ${it.qty}` : '';
    }).filter(Boolean).join(', ');
    const total = o.items.reduce((sum, it) => {
      const p = PRODUCTS.find(x => x.id === it.productId);
      return sum + (p ? p.price * it.qty : 0);
    }, 0);
    const currentIdx = ORDER_STATUS_STEPS.indexOf(o.status);
    return `
      <div class="order-card">
        <div class="order-head">
          <div>
            <div class="order-id">#${o.id} — ${o.customer}</div>
            <div class="order-customer">${o.date} · ${fmtTRY(total)}</div>
          </div>
        </div>
        <div class="order-items">${itemsText}</div>
        <div class="status-stepper">
          ${ORDER_STATUS_STEPS.map((s, i) => `
            <button class="status-step ${i < currentIdx ? 'done' : ''} ${i === currentIdx ? 'current' : ''}" onclick="setOrderStatus(${o.id}, '${s}')">${ORDER_STATUS_LABELS[s]}</button>
          `).join('')}
        </div>
      </div>`;
  }).join('');
}
function setOrderStatus(orderId, status){
  const o = ORDERS.find(x => x.id === orderId);
  o.status = status;
  renderOrders();
  showToast(`Sipariş #${orderId} durumu güncellendi: ${ORDER_STATUS_LABELS[status]} (demo bildirim)`);
}

/* ---- Ayarlar ---- */
function renderRateDisplay(){
  document.getElementById('rateDisplay').textContent = `1 $ ≈ ${usdRate.toFixed(2)} ₺`;
  document.getElementById('manualRateInput').value = usdRate.toFixed(2);
}
document.getElementById('saveManualRateBtn').addEventListener('click', () => {
  const val = parseFloat(document.getElementById('manualRateInput').value);
  if(!val || val <= 0) return;
  usdRate = val;
  usdRateSource = 'manuel olarak ayarlandı';
  renderRateDisplay();
  renderGrid(); renderFeaturedRows(); updateCart(); renderProductsTable(); renderStats(); renderOrders();
  showToast('Dolar kuru güncellendi.');
});

function renderSocialLinksForm(){
  document.getElementById('socialFacebookInput').value = SOCIAL_LINKS.facebook || '';
  document.getElementById('socialInstagramInput').value = SOCIAL_LINKS.instagram || '';
  document.getElementById('socialTwitterInput').value = SOCIAL_LINKS.twitter || '';
}
document.getElementById('saveSocialLinksBtn').addEventListener('click', () => {
  SOCIAL_LINKS.facebook = document.getElementById('socialFacebookInput').value.trim();
  SOCIAL_LINKS.instagram = document.getElementById('socialInstagramInput').value.trim();
  SOCIAL_LINKS.twitter = document.getElementById('socialTwitterInput').value.trim();
  renderFooterSocial();
  showToast('Sosyal medya bağlantıları güncellendi.');
});

function renderNewsletterAdminList(){
  const el = document.getElementById('newsletterSubscribersList');
  if(!el) return;
  document.getElementById('newsletterCountLabel').textContent = `(${NEWSLETTER_SUBSCRIBERS.length})`;
  if(NEWSLETTER_SUBSCRIBERS.length === 0){
    el.innerHTML = `<p class="muted-note">Henüz abone yok.</p>`;
    return;
  }
  el.innerHTML = NEWSLETTER_SUBSCRIBERS.map((s, i) => `
    <div class="category-row">
      <span>${s.email} <span class="muted-count">— ${s.date}</span></span>
      <button class="admin-btn-icon danger" onclick="removeNewsletterSubscriber(${i})" aria-label="Sil">🗑</button>
    </div>
  `).join('');
}
function removeNewsletterSubscriber(i){
  NEWSLETTER_SUBSCRIBERS.splice(i, 1);
  renderNewsletterAdminList();
}
