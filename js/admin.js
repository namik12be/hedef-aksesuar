/* ============================= ADMIN PANEL ============================= */

document.getElementById('adminLoginBtn').addEventListener('click', async () => {
  const val = document.getElementById('adminPasswordInput').value;
  if(val === ADMIN_PASSWORD){
    adminUnlocked = true;
    document.body.classList.add('admin-mode');
    document.getElementById('adminLoginError').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    renderAdminAll();
    saveAdminSession();
    await adminSupabaseSignIn();
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

/* ---- Site Ayarları (hamburger menü) ---- */
function openSettingsDrawer(){
  document.getElementById('adminMenuBtn').classList.add('open');
  document.getElementById('settingsDrawer').classList.add('open');
  document.getElementById('settingsOverlay').classList.add('open');
}
function closeSettingsDrawer(){
  document.getElementById('adminMenuBtn').classList.remove('open');
  document.getElementById('settingsDrawer').classList.remove('open');
  document.getElementById('settingsOverlay').classList.remove('open');
}
document.getElementById('adminMenuBtn').addEventListener('click', () => {
  const isOpen = document.getElementById('settingsDrawer').classList.contains('open');
  if(isOpen) closeSettingsDrawer(); else openSettingsDrawer();
});
document.getElementById('closeSettingsDrawer').addEventListener('click', closeSettingsDrawer);
document.getElementById('settingsOverlay').addEventListener('click', closeSettingsDrawer);

/* ---- Kategoriler & Markalar alt sekmeleri ---- */
document.getElementById('katalogSubNav').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if(!btn) return;
  document.querySelectorAll('#katalogSubNav .chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const sub = btn.dataset.katalogsub;
  document.getElementById('katalogSubKategoriler').style.display = sub === 'kategoriler' ? 'block' : 'none';
  document.getElementById('katalogSubMarkalar').style.display = sub === 'markalar' ? 'block' : 'none';
});
document.getElementById('toggleNewCategoryBtn').addEventListener('click', () => {
  const row = document.getElementById('newCategoryRow');
  row.style.display = row.style.display === 'none' ? 'flex' : 'none';
});
document.getElementById('toggleNewBrandBtn').addEventListener('click', () => {
  const row = document.getElementById('newBrandRow');
  row.style.display = row.style.display === 'none' ? 'flex' : 'none';
});

/* ---- Ünvanlar ve Fiyat Kademeleri alt sekmeleri ---- */
document.getElementById('fiyatSubNav').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if(!btn) return;
  document.querySelectorAll('#fiyatSubNav .chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const sub = btn.dataset.fiyatsub;
  document.getElementById('fiyatSubKademeler').style.display = sub === 'kademeler' ? 'block' : 'none';
  document.getElementById('fiyatSubKullanicilar').style.display = sub === 'kullanicilar' ? 'block' : 'none';
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
let adminProductSearch = '';
let adminProductCategoryFilter = 'tumu';

function renderAdminProductFilterChips(){
  const el = document.getElementById('adminProductFilterChips');
  if(!el) return;
  const chips = [{key:'tumu', label:'Tümü'}, ...CATEGORIES.map(c => ({key:c.key, label:c.label}))];
  el.innerHTML = chips.map(c => `<button class="chip ${adminProductCategoryFilter===c.key?'active':''}" data-catfilter="${c.key}">${c.label}</button>`).join('');
}

function renderProductsTable(){
  renderAdminProductFilterChips();
  const search = normalizeTr(adminProductSearch);
  const list = PRODUCTS.filter(p => {
    if(adminProductCategoryFilter !== 'tumu' && p.brand !== adminProductCategoryFilter) return false;
    if(search && !normalizeTr(p.name).includes(search)) return false;
    return true;
  });
  document.getElementById('productCountLabel').textContent = `(${list.length})`;
  document.getElementById('productsTableBody').innerHTML = list.length ? list.map(p => `
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
  `).join('') : `<tr><td colspan="7"><p class="muted-note" style="margin:10px 0;">Bu aramaya/filtreye uyan ürün bulunamadı.</p></td></tr>`;
}
document.getElementById('adminProductSearchInput').addEventListener('input', (e) => {
  adminProductSearch = e.target.value;
  renderProductsTable();
});
document.getElementById('adminProductFilterChips').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-catfilter]');
  if(!btn) return;
  adminProductCategoryFilter = btn.dataset.catfilter;
  renderProductsTable();
});

function stockBadgeHTML(p){
  if(p.stock <= 0) return `<span class="stock-badge stock-out">Tükendi</span>`;
  if(p.stock <= p.lowStockThreshold) return `<span class="stock-badge stock-low">⚠️ ${p.stock}</span>`;
  return `<span class="stock-badge stock-ok">${p.stock}</span>`;
}

document.getElementById('newProductBtn').addEventListener('click', () => openProductEditor(null));

let pfColors = [];
let pfPatterns = [];
let pfModelVariants = [];
let pfImages = [];
let pfVideo = null;
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
function generateBarcodeSVGCompact(code){
  const barHeight = 24;
  let x = 2;
  let bars = '';
  code.split('').forEach((d, i) => {
    const w = (parseInt(d, 10) % 2) + 1;
    if(i % 2 === 0){
      bars += `<rect x="${x}" y="0" width="${w}" height="${barHeight}" fill="currentColor"/>`;
    }
    x += w;
  });
  const totalWidth = x + 2;
  return `<svg viewBox="0 0 ${totalWidth} ${barHeight}" height="${barHeight}" xmlns="http://www.w3.org/2000/svg" style="display:block; color:var(--ink); opacity:.8;">${bars}</svg>`;
}
function renderPfModelChips(){
  document.getElementById('pf_models_chips').innerHTML = pfModelVariants.map((m, i) => `
    <span class="tag-chip model-chip-added">
      ${m.name}
      <button type="button" onclick="removePfModelVariant(${i})">✕</button>
    </span>
  `).join('');
}
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

function renderPfMediaPreview(){
  const el = document.getElementById('pf_media_preview');
  if(!el) return;
  const imageThumbs = pfImages.map((src, i) => `
    <div class="media-thumb">
      <img src="${src}" alt="">
      <button type="button" onclick="removePfImage(${i})">✕</button>
    </div>
  `).join('');
  const videoThumb = pfVideo ? `
    <div class="media-thumb">
      <video src="${pfVideo}" muted></video>
      <button type="button" onclick="removePfVideo()">✕</button>
    </div>
  ` : '';
  el.innerHTML = imageThumbs + videoThumb;
}
function removePfImage(i){ pfImages.splice(i, 1); renderPfMediaPreview(); }
function removePfVideo(){ pfVideo = null; renderPfMediaPreview(); }

function openProductEditor(productId){
  const p = productId ? PRODUCTS.find(x => x.id === productId) : null;
  pfEditingProductId = productId || null;
  pfColors = p ? p.variants.colors.map(c => ({...c})) : [];
  pfPatterns = p ? (p.variants.patterns || []).map(pt => ({...pt})) : [];
  pfModelVariants = p ? p.variants.models.map(m => ({...m})) : [];
  pfImages = p && p.variants.media && p.variants.media.images ? [...p.variants.media.images] : (p && p.image ? [p.image] : []);
  pfVideo = p && p.variants.media ? (p.variants.media.video || null) : null;
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
        <label>Model Varyantları</label>
        <p class="muted-note" style="margin:0 0 10px;">Önce bir marka seç — o markanın, seçtiğin cihaz tipine uygun modelleri çıkacak. Modele tıklayınca ekleniyor ve aşağıdaki listeye taşınıyor. Stok girişi "Stok" sekmesinden yapılır.</p>
        <div class="tag-input-box">
          <div class="chip-row" id="pf_marka_picker"></div>
          <div class="chip-row" id="pf_model_options" style="margin-top:10px;"></div>
        </div>
        <p class="muted-note" style="margin:14px 0 8px;">Eklenen modeller:</p>
        <div class="tag-chip-row" id="pf_models_chips"></div>
      </div>
      <div style="margin-top:16px;">
        <label>Ünvanlara Özel Fiyatlar</label>
        <p class="muted-note" style="margin:0 0 10px;">Üye her zaman yukarıdaki TL (+KDV) fiyatını görür. Diğer ünvanlar için boş bırakırsan güncel kura göre otomatik hesaplanır; istersen kendi fiyatını gir.</p>
        <div id="pf_tier_prices"></div>
      </div>
      <div style="margin-top:16px;">
        <label>Ürün Fotoğrafları ve Videosu</label>
        <p class="muted-note" style="margin:0 0 10px;">Birden fazla fotoğraf ekleyebilirsin, istersen bir de video ekle.</p>
        <div class="media-upload-row">
          <label class="media-upload-btn" for="pf_images_input">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            Fotoğraf Ekle
          </label>
          <input type="file" id="pf_images_input" accept="image/*" multiple style="display:none;">
          <label class="media-upload-btn" for="pf_video_input">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            Video Ekle
          </label>
          <input type="file" id="pf_video_input" accept="video/*" style="display:none;">
        </div>
        <div class="media-preview-grid" id="pf_media_preview"></div>
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
  renderPfMediaPreview();
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

  document.getElementById('pf_images_input').addEventListener('change', (e) => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => { pfImages.push(reader.result); renderPfMediaPreview(); };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  });
  document.getElementById('pf_video_input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => { pfVideo = reader.result; renderPfMediaPreview(); };
    reader.readAsDataURL(file);
    e.target.value = '';
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

    const media = {images: [...pfImages], video: pfVideo};
    if(p){
      p.name = name; p.price = price; p.brand = brand; p.device = device;
      p.stock = stock; p.lowStockThreshold = threshold;
      p.variants = {colors: pfColors.map(c=>({...c})), patterns: pfPatterns.map(pt=>({...pt})), models: pfModelVariants.map(m=>({...m})), media};
      p.tierPrices = tierPrices;
      p.image = pfImages[0] || null;
    } else {
      PRODUCTS.push({
        id: nextProductId++, name, price, brand, sub: device, device,
        screen: 'linear-gradient(160deg,#c9cfd8,#eef1f5)', tag: null, universal: true,
        stock, lowStockThreshold: threshold, image: pfImages[0] || null,
        variants:{colors: pfColors.map(c=>({...c})), patterns: pfPatterns.map(pt=>({...pt})), models: pfModelVariants.map(m=>({...m})), media},
        tierPrices,
      });
    }
    renderGrid(); renderFeaturedRows(); renderSidebar();
    exitProductEditMode();
    scheduleSupabaseSync();
  });
}

function deleteProduct(id){
  showCustomConfirm('Bu ürünü silmek istediğine emin misin?', () => {
    const idx = PRODUCTS.findIndex(p => p.id === id);
    if(idx > -1) PRODUCTS.splice(idx, 1);
    renderProductsTable(); renderStockTable(); renderStats(); renderLowStockList();
    renderGrid(); renderFeaturedRows(); renderSidebar();
    deleteRowFromSupabase('products', 'id', id);
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
          <input class="admin-input admin-input-add" placeholder="Yeni cihaz tipi (ör. Kulaklık)" id="newSubInput_${c.key}" style="font-size:12.5px; padding:7px 10px;">
          <button class="btn btn-ghost admin-btn-add" style="padding:7px 12px; font-size:12.5px;" onclick="addCategorySub('${c.key}')">+ Ekle</button>
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
  scheduleSupabaseSync();
});
function removeCategory(key){
  const cat = CATEGORIES.find(c => c.key === key);
  const hasDependents = (cat.subs.length > 0) || PRODUCTS.some(p => p.brand === key);
  const doDelete = () => {
    CATEGORIES = CATEGORIES.filter(c => c.key !== key);
    renderCategoryManager(); renderSidebar();
    deleteRowFromSupabase('categories', 'key', key);
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
  scheduleSupabaseSync();
}
function removeCategorySub(catKey, subKey){
  const cat = CATEGORIES.find(c => c.key === catKey);
  const sub = cat.subs.find(s => s.key === subKey);
  const hasDependents = PRODUCTS.some(p => p.brand === catKey && p.sub === subKey);
  const doDelete = () => {
    cat.subs = cat.subs.filter(s => s.key !== subKey);
    renderCategoryManager(); renderSidebar();
    scheduleSupabaseSync();
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
          <input class="admin-input admin-input-add" placeholder="Yeni model" id="newModelInput_${m.key}" style="font-size:12.5px; padding:7px 10px; flex:1; min-width:100px;">
          <select class="admin-input" id="newModelDevice_${m.key}" style="font-size:12.5px; padding:7px 10px; max-width:130px;">
            ${DEVICE_TYPES.map(d => `<option value="${d.key}">${d.label}</option>`).join('')}
          </select>
          <button class="btn btn-ghost admin-btn-add" style="padding:7px 12px; font-size:12.5px;" onclick="addModel('${m.key}')">+ Model</button>
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
  scheduleSupabaseSync();
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
  scheduleSupabaseSync();
});
document.getElementById('addDeviceTypeBtn').addEventListener('click', addDeviceType);
function removeBrand(key){
  showCustomConfirm('Bu markayı silmek istediğine emin misin?', () => {
    MARKALAR = MARKALAR.filter(m => m.key !== key);
    renderBrandManager();
    deleteRowFromSupabase('brands', 'key', key);
  });
}
function titleCaseModelName(str){
  return str.replace(/\S+/g, word => word.charAt(0).toUpperCase() + word.slice(1));
}
function addModel(brandKey){
  const input = document.getElementById('newModelInput_' + brandKey);
  const deviceSel = document.getElementById('newModelDevice_' + brandKey);
  const label = titleCaseModelName(input.value.trim());
  if(!label) return;
  const marka = MARKALAR.find(m => m.key === brandKey);
  const key = label.toLowerCase().replace(/[^a-z0-9]+/gi, '-');
  marka.models.push({key, label, device: deviceSel.value});
  marka.models.sort((a, b) => a.label.localeCompare(b.label, 'tr'));
  MODEL_TO_MARKA[key] = brandKey;
  renderBrandManager();
  scheduleSupabaseSync();
}
function removeModel(brandKey, modelKey){
  const marka = MARKALAR.find(m => m.key === brandKey);
  marka.models = marka.models.filter(md => md.key !== modelKey);
  delete MODEL_TO_MARKA[modelKey];
  renderBrandManager();
  scheduleSupabaseSync();
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
  scheduleSupabaseSync();
}
function setModelStock(productId, idx, val){
  const p = PRODUCTS.find(x => x.id === productId);
  p.variants.models[idx].stock = Math.max(0, parseInt(val) || 0);
  renderStockTable();
  scheduleSupabaseSync();
}
function setModelVariantStock(productId, modelIdx, variantName, val){
  const p = PRODUCTS.find(x => x.id === productId);
  const m = p.variants.models[modelIdx];
  if(!m.variantStock) m.variantStock = {};
  m.variantStock[variantName] = Math.max(0, parseInt(val) || 0);
  renderStockTable();
  scheduleSupabaseSync();
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
  scheduleSupabaseSync();
}
function restockProduct(id){
  const p = PRODUCTS.find(x => x.id === id);
  p.stock = 25;
  renderStockTable(); renderStats(); renderLowStockList(); renderProductsTable(); renderGrid(); renderFeaturedRows();
  scheduleSupabaseSync();
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
        <div class="barcode-list">
          ${p.variants.colors.map((c, i) => barcodeRowHTML(p, 'color', i, c)).join('')}
          ${(p.variants.patterns || []).map((pt, i) => barcodeRowHTML(p, 'pattern', i, pt)).join('')}
        </div>
        `}
      </div>
    </div>`;
  }).join('');
}
function barcodeRowHTML(p, kind, idx, variant){
  const code = variant.barcode || generateBarcodeNumber(p.id, variant.name);
  const dot = kind === 'color' ? `<span class="tag-chip-dot" style="background:${colorHex(variant.name)};"></span>` : '';
  const fieldId = `barcodeManualInput_${p.id}_${kind}_${idx}`;
  return `<div class="barcode-row">
    <span class="barcode-row-name">${dot}${variant.name}${variant.barcode ? '<span class="barcode-manual-tag-mini">Elle</span>' : ''}</span>
    <span class="barcode-row-svg">${generateBarcodeSVGCompact(code)}</span>
    <span class="barcode-row-code">${code}</span>
    <span class="barcode-row-action">
      ${variant.barcode
        ? `<button type="button" class="admin-btn-icon danger" onclick="resetProductVariantBarcode(${p.id}, '${kind}', ${idx})" title="Kaldır">🗑</button>`
        : `<input class="barcode-mini-input" id="${fieldId}" placeholder="Barkod no">
           <button type="button" class="admin-btn-icon" onclick="saveManualBarcodeFromField(${p.id}, '${kind}', ${idx})" title="Ekle">＋</button>`}
    </span>
  </div>`;
}
function barcodeModelMatrixHTML(p, columns){
  return p.variants.models.map((m, mi) => `
    <div class="barcode-model-block">
      <div class="stock-variant-group-label">📱 ${m.name}</div>
      <div class="barcode-list">
        ${columns.map((col, ci) => barcodeModelVariantRowHTML(p, mi, m, col, ci)).join('')}
      </div>
    </div>
  `).join('');
}
function barcodeModelVariantRowHTML(p, modelIdx, m, col, colIdx){
  const manual = m.variantBarcodes && m.variantBarcodes[col.name];
  const code = manual || generateBarcodeNumber(p.id + '-' + m.name, col.name);
  const dot = col.type === 'color' ? `<span class="tag-chip-dot" style="background:${colorHex(col.name)};"></span>` : '';
  const fieldId = `barcodeModelInput_${p.id}_${modelIdx}_${colIdx}`;
  return `<div class="barcode-row">
    <span class="barcode-row-name">${dot}${col.name}${manual ? '<span class="barcode-manual-tag-mini">Elle</span>' : ''}</span>
    <span class="barcode-row-svg">${generateBarcodeSVGCompact(code)}</span>
    <span class="barcode-row-code">${code}</span>
    <span class="barcode-row-action">
      ${manual
        ? `<button type="button" class="admin-btn-icon danger" onclick="resetModelVariantBarcode(${p.id}, ${modelIdx}, '${col.name.replace(/'/g, "\\'")}')" title="Kaldır">🗑</button>`
        : `<input class="barcode-mini-input" id="${fieldId}" placeholder="Barkod no">
           <button type="button" class="admin-btn-icon" onclick="saveModelVariantBarcode(${p.id}, ${modelIdx}, '${col.name.replace(/'/g, "\\'")}', '${fieldId}')" title="Ekle">＋</button>`}
    </span>
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
  scheduleSupabaseSync();
}
function resetProductVariantBarcode(productId, kind, idx){
  const p = PRODUCTS.find(x => x.id === productId);
  const variant = kind === 'color' ? p.variants.colors[idx] : p.variants.patterns[idx];
  variant.barcode = null;
  renderBarcodeTab();
  scheduleSupabaseSync();
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
  scheduleSupabaseSync();
}
function resetModelVariantBarcode(productId, modelIdx, variantName){
  const p = PRODUCTS.find(x => x.id === productId);
  const m = p.variants.models[modelIdx];
  if(m.variantBarcodes) delete m.variantBarcodes[variantName];
  renderBarcodeTab();
  scheduleSupabaseSync();
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
  scheduleSupabaseSync();
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
  scheduleSupabaseSync();
});
function removeTier(id){
  showCustomConfirm('Bu ünvanı silmek istediğine emin misin? Bu ünvana atanmış kullanıcılar varsayılan Üye fiyatına döner.', () => {
    PRICE_TIERS = PRICE_TIERS.filter(t => t.id !== id);
    USERS.forEach(u => { if(u.tierId === id) u.tierId = 'uye'; });
    renderTierManager(); renderUserTierManager();
    renderGrid(); renderFeaturedRows(); updateCart();
    deleteRowFromSupabase('price_tiers', 'id', id);
    scheduleSupabaseSync();
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
  scheduleSupabaseSync();
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
  scheduleSupabaseSync();
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
  window.usdRateManual = true;
  renderRateDisplay();
  renderGrid(); renderFeaturedRows(); updateCart(); renderProductsTable(); renderStats(); renderOrders();
  showToast('Dolar kuru güncellendi.');
  scheduleSupabaseSync();
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
  scheduleSupabaseSync();
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
  const email = NEWSLETTER_SUBSCRIBERS[i] && NEWSLETTER_SUBSCRIBERS[i].email;
  NEWSLETTER_SUBSCRIBERS.splice(i, 1);
  renderNewsletterAdminList();
  deleteRowFromSupabase('newsletter_subscribers', 'email', email);
}
