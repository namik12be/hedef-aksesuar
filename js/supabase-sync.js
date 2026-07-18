/* ============================= SUPABASE ENTEGRASYONU =============================
   Admin panelinden yapılan değişiklikler artık sadece tarayıcıda değil, paylaşılan
   Supabase veritabanında saklanır — böylece tüm ziyaretçiler aynı verileri görür.
   Kullanıcı hesapları/şifreleri (USERS) bu kapsamda DEĞİL, sadece kataloğu ve site
   ayarlarını yönetiyor. */
const SUPABASE_URL = 'https://oklccjiqjbkyzpevllos.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SoVZxwUJGwk0TGtIvB2eVg_N2l5OMzT';
const ADMIN_AUTH_EMAIL = 'hedef-aksesuar@gmail.com';
const ADMIN_AUTH_PASSWORD = 'i3=}!%Ef8qy:"p>';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.usdRateManual = false;

async function adminSupabaseSignIn(){
  try {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: ADMIN_AUTH_EMAIL,
      password: ADMIN_AUTH_PASSWORD,
    });
    if(error) console.error('Supabase admin girişi başarısız:', error.message);
  } catch(e){
    console.error('Supabase admin girişi hatası:', e);
  }
}

/* ---- uygulama nesnesi <-> tablo satırı dönüşümleri ---- */
function productToRow(p){
  return {
    id: p.id, name: p.name, price: p.price, brand: p.brand, sub: p.sub, device: p.device,
    screen: p.screen || null, tag: p.tag || null, universal: !!p.universal,
    models: p.models || [], stock: p.stock || 0, low_stock_threshold: p.lowStockThreshold || 5,
    image: p.image || null, variants: p.variants || {colors:[],patterns:[],models:[]},
    tier_prices: p.tierPrices || {},
  };
}
function rowToProduct(r){
  return {
    id: r.id, name: r.name, price: Number(r.price), brand: r.brand, sub: r.sub, device: r.device,
    screen: r.screen, tag: r.tag, universal: r.universal,
    models: (r.models && r.models.length) ? r.models : undefined,
    stock: r.stock, lowStockThreshold: r.low_stock_threshold,
    image: r.image, variants: r.variants || {colors:[],patterns:[],models:[]},
    tierPrices: r.tier_prices || {},
  };
}
function categoryToRow(c, i){ return {key:c.key, label:c.label, subs:c.subs||[], sort_order:i}; }
function rowToCategory(r){ return {key:r.key, label:r.label, subs:r.subs||[]}; }
function brandToRow(b, i){ return {key:b.key, label:b.label, models:b.models||[], sort_order:i}; }
function rowToBrand(r){ return {key:r.key, label:r.label, models:r.models||[]}; }
function deviceTypeToRow(d, i){ return {key:d.key, label:d.label, sort_order:i}; }
function rowToDeviceType(r){ return {key:r.key, label:r.label}; }
function tierToRow(t){ return {id:t.id, name:t.name, currency:t.currency, discount:t.discount||0, is_protected: !!t.isProtected}; }
function rowToTier(r){ return {id:r.id, name:r.name, currency:r.currency, discount:Number(r.discount), isProtected: r.is_protected}; }
function orderToRow(o){ return {id:o.id, customer:o.customer, username:o.username, items:o.items||[], status:o.status, order_date:o.date}; }
function rowToOrder(r){ return {id:r.id, customer:r.customer, username:r.username, items:r.items||[], status:r.status, date:r.order_date}; }
function newsletterToRow(n){ return {email:n.email, subscribed_date:n.date}; }
function rowToNewsletter(r){ return {email:r.email, date:r.subscribed_date}; }

/* ---- Genel amaçlı tablo eşitleme: yereldeki satırları yaz, yerelde artık olmayanı sil ---- */
async function reconcileTable(table, rows, keyCol){
  if(rows.length){
    const { error } = await supabaseClient.from(table).upsert(rows, {onConflict: keyCol});
    if(error){ console.error(`Supabase yazma hatası (${table}):`, error.message); return; }
  }
  const { data: remoteRows, error: fetchErr } = await supabaseClient.from(table).select(keyCol);
  if(fetchErr){ console.error(`Supabase okuma hatası (${table}):`, fetchErr.message); return; }
  const localKeys = new Set(rows.map(r => String(r[keyCol])));
  const toDelete = (remoteRows || []).map(r => r[keyCol]).filter(k => !localKeys.has(String(k)));
  if(toDelete.length){
    const { error: delErr } = await supabaseClient.from(table).delete().in(keyCol, toDelete);
    if(delErr) console.error(`Supabase silme hatası (${table}):`, delErr.message);
  }
}

async function syncAllToSupabase(){
  try {
    const settingsRows = [{key:'social_links', value: SOCIAL_LINKS}];
    if(window.usdRateManual){ settingsRows.push({key:'usd_rate', value:{rate:usdRate, source:usdRateSource}}); }
    await Promise.all([
      reconcileTable('products', PRODUCTS.map(productToRow), 'id'),
      reconcileTable('categories', CATEGORIES.map(categoryToRow), 'key'),
      reconcileTable('brands', MARKALAR.map(brandToRow), 'key'),
      reconcileTable('device_types', DEVICE_TYPES.map(deviceTypeToRow), 'key'),
      reconcileTable('price_tiers', PRICE_TIERS.map(tierToRow), 'id'),
      reconcileTable('orders', ORDERS.map(orderToRow), 'id'),
      reconcileTable('newsletter_subscribers', NEWSLETTER_SUBSCRIBERS.map(newsletterToRow), 'email'),
      reconcileTable('user_tiers', USERS.map(u => ({username:u.username, tier_id:u.tierId})), 'username'),
      reconcileTable('site_settings', settingsRows, 'key'),
    ]);
  } catch(e){
    console.error('Supabase senkronizasyon hatası:', e);
  }
}

/* ---- Sayfa açılışında: Supabase'de veri varsa yerel örnek veriyi onunla değiştir ---- */
async function loadAllFromSupabase(){
  try {
    const [productsRes, categoriesRes, brandsRes, deviceTypesRes, tiersRes, ordersRes, newsletterRes, userTiersRes, settingsRes] = await Promise.all([
      supabaseClient.from('products').select('*').order('id'),
      supabaseClient.from('categories').select('*').order('sort_order'),
      supabaseClient.from('brands').select('*').order('sort_order'),
      supabaseClient.from('device_types').select('*').order('sort_order'),
      supabaseClient.from('price_tiers').select('*'),
      supabaseClient.from('orders').select('*').order('id'),
      supabaseClient.from('newsletter_subscribers').select('*').order('created_at'),
      supabaseClient.from('user_tiers').select('*'),
      supabaseClient.from('site_settings').select('*'),
    ]);

    let loadedFromRemote = false;

    // Not: bir tablo başarıyla okunduysa (hata yoksa) Supabase'deki hal esas alınır —
    // boş dizi dönmesi "henüz veri yok" değil, "admin hepsini sildi" anlamına da gelebilir.
    if(!productsRes.error){
      PRODUCTS.length = 0;
      (productsRes.data || []).forEach(r => PRODUCTS.push(rowToProduct(r)));
      nextProductId = PRODUCTS.length ? Math.max(...PRODUCTS.map(p => p.id)) + 1 : 1;
      loadedFromRemote = true;
    }
    if(!categoriesRes.error){
      CATEGORIES.length = 0;
      (categoriesRes.data || []).forEach(r => CATEGORIES.push(rowToCategory(r)));
    }
    if(!brandsRes.error){
      MARKALAR.length = 0;
      (brandsRes.data || []).forEach(r => MARKALAR.push(rowToBrand(r)));
      Object.keys(MODEL_TO_MARKA).forEach(k => delete MODEL_TO_MARKA[k]);
      MARKALAR.forEach(m => m.models.forEach(md => MODEL_TO_MARKA[md.key] = m.key));
    }
    if(!deviceTypesRes.error){
      DEVICE_TYPES.length = 0;
      (deviceTypesRes.data || []).forEach(r => DEVICE_TYPES.push(rowToDeviceType(r)));
    }
    // Fiyat kademeleri site genelinde fiyat hesaplamasının temeli olduğu için,
    // burada boş dönmesi bir hatayı yansıtıyor olabilir — güvenli tarafta kalıp yerel varsayılanı koruyoruz.
    if(!tiersRes.error && tiersRes.data && tiersRes.data.length){
      PRICE_TIERS.length = 0;
      tiersRes.data.forEach(r => PRICE_TIERS.push(rowToTier(r)));
    }
    if(!ordersRes.error){
      ORDERS.length = 0;
      (ordersRes.data || []).forEach(r => ORDERS.push(rowToOrder(r)));
    }
    if(!newsletterRes.error){
      NEWSLETTER_SUBSCRIBERS.length = 0;
      (newsletterRes.data || []).forEach(r => NEWSLETTER_SUBSCRIBERS.push(rowToNewsletter(r)));
    }
    if(userTiersRes.data){
      userTiersRes.data.forEach(r => {
        const u = USERS.find(x => x.username === r.username);
        if(u) u.tierId = r.tier_id;
      });
    }
    if(settingsRes.data){
      const social = settingsRes.data.find(s => s.key === 'social_links');
      if(social && social.value) Object.assign(SOCIAL_LINKS, social.value);
      const rate = settingsRes.data.find(s => s.key === 'usd_rate');
      if(rate && rate.value){ usdRate = rate.value.rate; usdRateSource = rate.value.source; window.usdRateManual = true; }
    }

    renderFeaturedRows(); renderMarkaChips(); renderModelChips(); renderSidebar(); renderGrid();
    updateCart(); renderFooterSocial();
    if(typeof renderRateDisplay === 'function') renderRateDisplay();
    renderSupabaseSyncStatus(loadedFromRemote);
  } catch(e){
    console.error('Supabase veri yükleme hatası:', e);
    renderSupabaseSyncStatus(false, true);
  }
}

function renderSupabaseSyncStatus(loadedFromRemote, failed){
  const el = document.getElementById('supabaseSyncStatus');
  if(!el) return;
  if(failed){
    el.textContent = 'Supabase bağlantısı kurulamadı — geçici olarak yerel örnek veriler gösteriliyor.';
  } else if(loadedFromRemote){
    el.textContent = `Bağlı — veriler Supabase'den yüklendi (${PRODUCTS.length} ürün).`;
  } else {
    el.textContent = 'Supabase\'de henüz veri yok — aşağıdaki butonla mevcut örnek verileri bir kez aktarabilirsin.';
  }
}

/* ---- Admin panelinde herhangi bir değişiklik yapıldığında, kısa bir gecikmeyle tüm tabloları eşitle ---- */
let supabaseSyncTimer = null;
function scheduleSupabaseSync(){
  if(!adminUnlocked) return;
  clearTimeout(supabaseSyncTimer);
  supabaseSyncTimer = setTimeout(() => { syncAllToSupabase(); }, 900);
}
document.getElementById('adminDashboard').addEventListener('click', scheduleSupabaseSync);
document.getElementById('adminDashboard').addEventListener('input', scheduleSupabaseSync);
document.getElementById('adminDashboard').addEventListener('change', scheduleSupabaseSync);

/* ---- İlk kurulum: mevcut örnek verileri Supabase'e bir kez aktar (sadece admin, giriş yapmış halde) ---- */
document.getElementById('seedSupabaseBtn').addEventListener('click', () => {
  showCustomConfirm('Mevcut ürün/kategori/marka/ünvan verileri Supabase\'e aktarılacak. Devam edilsin mi?', async () => {
    document.getElementById('supabaseSyncStatus').textContent = 'Aktarılıyor…';
    await adminSupabaseSignIn();
    await syncAllToSupabase();
    renderSupabaseSyncStatus(true);
    showToast('Veriler Supabase\'e aktarıldı.');
  });
});
