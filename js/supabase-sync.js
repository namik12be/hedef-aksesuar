/* ============================= SUPABASE ENTEGRASYONU =============================
   Admin panelinden yapılan değişiklikler artık sadece tarayıcıda değil, paylaşılan
   Supabase veritabanında saklanır — böylece tüm ziyaretçiler aynı verileri görür.
   Kullanıcı hesapları/şifreleri (USERS) bu kapsamda DEĞİL, sadece kataloğu ve site
   ayarlarını yönetiyor. */
const SUPABASE_URL = 'https://oklccjiqjbkyzpevllos.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SoVZxwUJGwk0TGtIvB2eVg_N2l5OMzT';
const ADMIN_AUTH_EMAIL = 'hedef-aksesuar@gmail.com';
const ADMIN_AUTH_PASSWORD = 'i3=}!%Ef8qy:"p>';

// persistSession:false — tarayıcı kapatılıp açıldığında (ya da sayfa tazelendiğinde) admin oturumu
// kalmasın, yeniden hedef2026 girilmeden veritabanına yazma izni verilmesin.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
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

/* ---- Tablo yazma: SADECE ekleme/güncelleme (upsert) yapar, hiçbir zaman satır silmez.
   Otomatik arka plan senkronizasyonu bu yüzden güvenlidir — yerel dizi geçici bir hata
   yüzünden boş görünse bile Supabase'deki veriyi asla toplu silmez. Silme işlemleri
   sadece admin bir şeyi gerçekten sildiğinde, ayrı ve hedefli bir çağrıyla yapılır
   (bkz. deleteRowFromSupabase). ---- */
async function upsertTable(table, rows, keyCol){
  if(!rows.length) return;
  const { error } = await supabaseClient.from(table).upsert(rows, {onConflict: keyCol});
  if(error) console.error(`Supabase yazma hatası (${table}):`, error.message);
}

async function deleteRowFromSupabase(table, keyCol, keyValue){
  if(keyValue === undefined || keyValue === null || keyValue === '') return;
  try {
    const { error } = await supabaseClient.from(table).delete().eq(keyCol, keyValue);
    if(error) console.error(`Supabase silme hatası (${table}):`, error.message);
  } catch(e){
    console.error(`Supabase silme hatası (${table}):`, e);
  }
}

async function syncAllToSupabase(){
  try {
    const settingsRows = [{key:'social_links', value: SOCIAL_LINKS}];
    if(window.usdRateManual){ settingsRows.push({key:'usd_rate', value:{rate:usdRate, source:usdRateSource}}); }
    await Promise.all([
      upsertTable('products', PRODUCTS.map(productToRow), 'id'),
      upsertTable('categories', CATEGORIES.map(categoryToRow), 'key'),
      upsertTable('brands', MARKALAR.map(brandToRow), 'key'),
      upsertTable('device_types', DEVICE_TYPES.map(deviceTypeToRow), 'key'),
      upsertTable('price_tiers', PRICE_TIERS.map(tierToRow), 'id'),
      upsertTable('orders', ORDERS.map(orderToRow), 'id'),
      upsertTable('newsletter_subscribers', NEWSLETTER_SUBSCRIBERS.map(newsletterToRow), 'email'),
      upsertTable('user_tiers', USERS.map(u => ({username:u.username, tier_id:u.tierId})), 'username'),
      upsertTable('site_settings', settingsRows, 'key'),
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
    if(adminUnlocked && document.getElementById('adminDashboard').style.display !== 'none') renderAdminAll();
  } catch(e){
    console.error('Supabase veri yükleme hatası:', e);
  }
}

/* ---- Belirli bir düzenleme fonksiyonu veriyi gerçekten değiştirdiğinde çağrılır
   (bkz. admin.js içindeki ekleme/düzenleme/stok/barkod fonksiyonlarının sonu).
   Böylece "kaydedildi" bildirimi sadece gerçek bir değişiklik olduğunda çıkar. ---- */
let supabaseSyncTimer = null;
function scheduleSupabaseSync(){
  if(!adminUnlocked) return;
  clearTimeout(supabaseSyncTimer);
  supabaseSyncTimer = setTimeout(async () => {
    await syncAllToSupabase();
    showToast('Değişiklikler veritabanına kaydedildi ✓');
  }, 900);
}

/* ---- Admin oturumu: sayfa yenilenirken (kısa süreli) admin modunu koru, ama
   sekme/tarayıcı 2 dakikadan uzun süre kapalı kalırsa yeniden hedef2026 istensin. ---- */
const ADMIN_SESSION_KEY = 'hedefAksesuarAdminSession';
const ADMIN_SESSION_DURATION_MS = 2 * 60 * 1000;
function saveAdminSession(){
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({expiresAt: Date.now() + ADMIN_SESSION_DURATION_MS}));
}
function clearAdminSession(){
  localStorage.removeItem(ADMIN_SESSION_KEY);
}
async function restoreAdminSession(){
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if(!raw) return;
    const session = JSON.parse(raw);
    if(!session.expiresAt || session.expiresAt < Date.now()){ clearAdminSession(); return; }
    adminUnlocked = true;
    saveAdminSession();
    showAdmin();
    await adminSupabaseSignIn();
  } catch(e){
    clearAdminSession();
  }
}
setInterval(() => { if(adminUnlocked) saveAdminSession(); }, 30000);
