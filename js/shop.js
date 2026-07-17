function renderSidebar(){
  const el = document.getElementById('catSidebar');
  let html = `<button class="cat-all-btn ${activeBrand==='all' ? 'active' : ''}" data-brand="all">Tümü</button>`;
  CATEGORIES.forEach(c => {
    const isOpen = activeBrand === c.key;
    html += `
      <div class="cat-group ${isOpen ? 'open brand-active' : ''}" data-group="${c.key}">
        <button class="cat-group-head" data-brand="${c.key}">
          <span>${c.label}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="cat-subs">
          ${c.subs.map(s => `<button class="cat-sub-item ${activeBrand===c.key && activeSub===s.key ? 'active' : ''}" data-brand="${c.key}" data-sub="${s.key}">${s.label}</button>`).join('')}
        </div>
      </div>`;
  });
  el.innerHTML = html;
}

function deviceLabel(key){
  return {telefon:"Telefon", tablet:"Tablet", airpods:"AirPods", saat:"Apple Watch", kulaklik:"Kulaklık"}[key] || key;
}

function renderMarkaChips(){
  const el = document.getElementById('markaChips');
  el.innerHTML = `<button class="chip ${selectedMarka==='all' ? 'active' : ''}" data-marka="all">Tümü</button>` +
    MARKALAR.map(m => `<button class="chip ${selectedMarka===m.key ? 'active' : ''}" data-marka="${m.key}">${m.label}</button>`).join('');
}

function renderModelChips(){
  const section = document.getElementById('modelSection');
  const el = document.getElementById('modelChips');
  if(selectedMarka === 'all'){
    section.style.display = 'none';
    el.innerHTML = '';
    return;
  }
  section.style.display = 'block';
  const marka = MARKALAR.find(m => m.key === selectedMarka);
  el.innerHTML = `<button class="chip ${selectedModel==='all' ? 'active' : ''}" data-model="all">Tüm ${marka.label} Modelleri</button>` +
    marka.models.map(md => `<button class="chip ${selectedModel===md.key ? 'active' : ''}" data-model="${md.key}">${md.label}</button>`).join('');
}

function updateFilterButton(){
  const btn = document.getElementById('openFilterBtn');
  const badge = document.getElementById('filterBadge');
  const active = selectedMarka !== 'all';
  btn.classList.toggle('active', active);
  badge.style.display = active ? 'flex' : 'none';
  badge.textContent = selectedModel !== 'all' ? '2' : '1';
}

function updateApplyBtnLabel(){
  const count = PRODUCTS.filter(p => {
    const catOk = (activeBrand === 'all') || (p.brand === activeBrand && (activeSub === 'all' || p.sub === activeSub));
    return catOk && modelMatches(p);
  }).length;
  document.getElementById('applyFilterBtn').textContent = `Ürünleri Göster (${count})`;
}

function modelMatches(p){
  if(selectedMarka === 'all') return true;
  if(p.universal) return true;
  if(!p.models) return false;
  if(selectedModel !== 'all') return p.models.includes(selectedModel);
  const markaModelKeys = MARKALAR.find(m => m.key === selectedMarka).models.map(md => md.key);
  return p.models.some(mk => markaModelKeys.includes(mk));
}

function clearModelFilter(){
  selectedMarka = 'all';
  selectedModel = 'all';
  currentProductsPage = 1;
  renderMarkaChips();
  renderModelChips();
  updateFilterButton();
  updateApplyBtnLabel();
  renderGrid();
}

function openFilterDrawer(){
  document.getElementById('filterDrawer').classList.add('open');
  document.getElementById('filterOverlay').classList.add('open');
}
function closeFilterDrawer(){
  document.getElementById('filterDrawer').classList.remove('open');
  document.getElementById('filterOverlay').classList.remove('open');
}

function mediaHTML(p){
  if(p.device === 'saat') return `<div class="mini-watch"><div class="mscreen" style="background:${p.screen}"></div></div>`;
  if(p.device === 'airpods' || p.device === 'kulaklik') return `<div class="mini-airpods"><div class="mscreen" style="background:${p.screen}"></div></div>`;
  if(p.device === 'tablet') return `<div class="mini-tablet"><div class="mscreen" style="background:${p.screen}"></div></div>`;
  return `<div class="mini-phone"><div class="mscreen" style="background:${p.screen}"></div></div>`;
}

function cardMediaHTML(p){
  if(p.image) return `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">`;
  return mediaHTML(p);
}

function buildCard(p, i){
  const card = document.createElement('div');
  card.className = 'card';
  card.style.animationDelay = (i*0.03) + 's';
  const outOfStock = (p.stock !== undefined && p.stock <= 0);
  const lowStock = (p.stock !== undefined && p.stock > 0 && p.stock <= (p.lowStockThreshold || 5));
  const cannotAddMore = (p.stock !== undefined && remainingStock(p.id) <= 0);
  card.innerHTML = `
    <div class="card-media">
      ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
      ${outOfStock ? `<span class="tag" style="background:var(--red); color:#fff;">TÜKENDİ</span>` : ''}
      ${cardMediaHTML(p)}
    </div>
    <div class="card-body">
      <span class="card-cat" style="background:${categoryAccentBg(p.brand)}; color:${categoryAccentFg(p.brand)}; padding:4px 10px; border-radius:100px; display:inline-block; width:fit-content;">${brandLabel(p.brand)} · ${deviceLabel(p.device)}</span>
      <span class="card-name">${p.name}</span>
      ${lowStock ? `<span class="warn-badge">⚠️ Son ${p.stock} adet</span>` : ''}
      <div class="card-bottom">
        <span class="price">${fmt(p)}</span>
        <button class="add-btn" aria-label="Sepete ekle" data-id="${p.id}" ${cannotAddMore ? 'disabled style="opacity:.35;cursor:not-allowed;"' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
    </div>`;
  card.addEventListener('click', (e) => {
    if(e.target.closest('.add-btn')) return;
    showProductDetail(p.id);
  });
  return card;
}

function renderCardsInto(containerId, ids){
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  ids.forEach((id, i) => {
    const p = PRODUCTS.find(x => x.id === id);
    if(!p) return;
    el.appendChild(buildCard(p, i));
  });
  el.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.id)));
  });
}

function renderFeaturedRows(){
  renderCardsInto('bestsellerGrid', [2, 12, 16, 20]);
  renderCardsInto('popularGrid', [1, 8, 10, 24]);
  renderCardsInto('foryouGrid', [3, 9, 22, 6]);
}

function renderGrid(){
  const grid = document.getElementById('productGrid');
  const pagination = document.getElementById('productsPagination');
  grid.innerHTML = '';
  const list = PRODUCTS.filter(p => {
    if(activeBrand !== 'all'){
      if(p.brand !== activeBrand) return false;
      if(activeSub !== 'all' && p.sub !== activeSub) return false;
    }
    return modelMatches(p);
  });

  if(list.length === 0){
    grid.innerHTML = `<div class="grid-empty">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      <p>Seçtiğin marka/model ve kategoriye uygun ürün bulamadık.</p>
      <button onclick="clearModelFilter()">Filtreyi Temizle</button>
    </div>`;
    pagination.innerHTML = '';
    return;
  }

  const totalPages = Math.max(1, Math.ceil(list.length / PRODUCTS_PER_PAGE));
  if(currentProductsPage > totalPages) currentProductsPage = totalPages;
  if(currentProductsPage < 1) currentProductsPage = 1;
  const startIdx = (currentProductsPage - 1) * PRODUCTS_PER_PAGE;
  const pageItems = list.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);

  pageItems.forEach((p, i) => {
    grid.appendChild(buildCard(p, i));
  });
  grid.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.id)));
  });

  renderPagination(totalPages);
}

function paginationRange(current, total){
  const range = [];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  range.push(1);
  if(left > 2) range.push('...');
  for(let i = left; i <= right; i++) range.push(i);
  if(right < total - 1) range.push('...');
  if(total > 1) range.push(total);
  return range;
}

function renderPagination(totalPages){
  const el = document.getElementById('productsPagination');
  if(totalPages <= 1){
    el.innerHTML = '';
    return;
  }
  const pages = paginationRange(currentProductsPage, totalPages);
  let html = `<button class="page-btn" ${currentProductsPage === 1 ? 'disabled' : ''} onclick="goToProductsPage(${currentProductsPage - 1})" aria-label="Önceki sayfa">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
  </button>`;
  pages.forEach(p => {
    if(p === '...'){
      html += `<span class="page-dots">…</span>`;
    } else {
      html += `<button class="page-btn ${p === currentProductsPage ? 'active' : ''}" onclick="goToProductsPage(${p})">${p}</button>`;
    }
  });
  html += `<button class="page-btn" ${currentProductsPage === totalPages ? 'disabled' : ''} onclick="goToProductsPage(${currentProductsPage + 1})" aria-label="Sonraki sayfa">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
  </button>`;
  el.innerHTML = html;
}

function goToProductsPage(n){
  currentProductsPage = n;
  renderGrid();
  document.getElementById('urunler').scrollIntoView({behavior:'smooth', block:'start'});
}

document.getElementById('catSidebar').addEventListener('click', (e) => {
  const subBtn = e.target.closest('.cat-sub-item');
  const headBtn = e.target.closest('.cat-group-head');
  const allBtn = e.target.closest('.cat-all-btn');
  if(subBtn){
    activeBrand = subBtn.dataset.brand;
    activeSub = subBtn.dataset.sub;
  } else if(headBtn){
    const grp = headBtn.dataset.brand;
    activeBrand = (activeBrand === grp) ? 'all' : grp;
    activeSub = 'all';
  } else if(allBtn){
    activeBrand = 'all';
    activeSub = 'all';
  } else {
    return;
  }
  currentProductsPage = 1;
  renderSidebar();
  renderGrid();
  updateApplyBtnLabel();
});

document.getElementById('openFilterBtn').addEventListener('click', openFilterDrawer);
document.getElementById('closeFilterDrawer').addEventListener('click', closeFilterDrawer);
document.getElementById('filterOverlay').addEventListener('click', closeFilterDrawer);
document.getElementById('applyFilterBtn').addEventListener('click', closeFilterDrawer);
document.getElementById('clearFilterBtn').addEventListener('click', clearModelFilter);

document.getElementById('markaChips').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if(!btn) return;
  selectedMarka = btn.dataset.marka;
  selectedModel = 'all';
  currentProductsPage = 1;
  renderMarkaChips();
  renderModelChips();
  updateFilterButton();
  updateApplyBtnLabel();
  renderGrid();
});
document.getElementById('modelChips').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if(!btn) return;
  selectedModel = btn.dataset.model;
  currentProductsPage = 1;
  renderModelChips();
  updateFilterButton();
  updateApplyBtnLabel();
  renderGrid();
});
