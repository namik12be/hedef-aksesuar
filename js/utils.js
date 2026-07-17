function getEffectiveTier(){
  if(currentUser && currentUser.tierId){
    const t = PRICE_TIERS.find(x => x.id === currentUser.tierId);
    if(t) return t;
  }
  return PRICE_TIERS.find(x => x.id === 'uye') || {currency:'TRY', discount:0};
}

function formatMoney(value, currency){
  if(currency === 'USD') return '$' + value.toFixed(2);
  return Math.round(value).toLocaleString('tr-TR') + ' ₺';
}

function unitPriceFor(p){
  const tier = getEffectiveTier();
  if(tier.id === 'uye') return {value: p.price, currency: 'TRY'};
  const override = p.tierPrices ? p.tierPrices[tier.id] : null;
  if(override !== undefined && override !== null && override !== ''){
    return {value: parseFloat(override), currency: tier.currency};
  }
  if(tier.currency === 'USD') return {value: (p.price / usdRate) * (1 - (tier.discount || 0) / 100), currency: 'USD'};
  return {value: p.price * (1 - (tier.discount || 0) / 100), currency: 'TRY'};
}

function fmt(p){
  const {value, currency} = unitPriceFor(p);
  return formatMoney(value, currency);
}

function fmtRaw(value){
  const tier = getEffectiveTier();
  return formatMoney(value, tier.currency);
}

function fmtTRY(n){
  return Math.round(n).toLocaleString('tr-TR') + ' ₺';
}

// Canlı dolar kuru çekmeyi dene — başarısız olursa yukarıdaki sabit değer kullanılır
fetch('https://open.er-api.com/v6/latest/USD')
  .then(r => r.json())
  .then(data => {
    if(data && data.result === 'success' && data.rates && data.rates.TRY){
      usdRate = data.rates.TRY;
      usdRateSource = 'canlı kur (' + (data.time_last_update_utc || '') + ')';
      renderGrid(); renderFeaturedRows(); updateCart();
      if(document.getElementById('adminDashboard') && document.getElementById('adminDashboard').style.display !== 'none'){
        renderProductsTable(); renderStats(); renderOrders();
      }
      if(document.getElementById('rateDisplay')) renderRateDisplay();
    }
  })
  .catch(() => { /* kur çekilemedi, sabit yedek değer kullanılmaya devam eder */ });

function brandLabel(key){ const c = CATEGORIES.find(c => c.key === key); return c ? c.label : key; }
function categoryAccentBg(brand){
  const map = {kilif:'#FFECEA', sarj:'#FFF6DE', ekran:'#EEF2FF', aksesuar:'#F3EEFF'};
  return map[brand] || 'var(--bg-soft)';
}
function categoryAccentFg(brand){
  const map = {kilif:'var(--red)', sarj:'#B4880A', ekran:'var(--blue-dark)', aksesuar:'#7B4FD1'};
  return map[brand] || 'var(--muted)';
}
function subLabel(brand, sub){
  const c = CATEGORIES.find(c => c.key === brand);
  if(!c) return sub;
  const s = c.subs.find(s => s.key === sub);
  return s ? s.label : sub;
}

function modelVariantColumns(p){
  return [
    ...p.variants.colors.map(c => ({name: c.name, type: 'color'})),
    ...(p.variants.patterns || []).map(pt => ({name: pt.name, type: 'pattern'})),
  ];
}
function hasModelStockMatrix(p){
  return p.variants.models.length > 0 && modelVariantColumns(p).length > 0;
}
function modelVariantStockValue(m, variantName){
  return (m.variantStock && m.variantStock[variantName] !== undefined) ? (parseInt(m.variantStock[variantName]) || 0) : 0;
}
function modelStockTotal(p, m){
  const columns = modelVariantColumns(p);
  if(columns.length === 0) return m.stock || 0;
  return columns.reduce((sum, col) => sum + modelVariantStockValue(m, col.name), 0);
}
