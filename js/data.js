let CATEGORIES = [
  {key:"kilif", label:"Kılıf", subs:[
    {key:"telefon", label:"Telefon Kılıfı"},
    {key:"tablet", label:"Tablet Kılıfı"},
    {key:"airpods", label:"AirPods Kılıfı"},
    {key:"saat", label:"Apple Watch Kılıfı"},
  ]},
  {key:"sarj", label:"Şarj Aleti", subs:[
    {key:"telefon", label:"Telefon Şarj Standı"},
    {key:"kablo", label:"Şarj Kablosu"},
    {key:"saat", label:"Saat Şarj Standı"},
    {key:"tablet", label:"Tablet Şarj Adaptörü"},
  ]},
  {key:"ekran", label:"Ekran Koruyucu", subs:[
    {key:"telefon", label:"Telefon Ekran Koruyucu"},
    {key:"tablet", label:"Tablet Ekran Koruyucu"},
    {key:"saat", label:"Saat Ekran Koruyucu"},
  ]},
  {key:"aksesuar", label:"Diğer Aksesuar", subs:[
    {key:"tutucu", label:"Telefon Tutucu & Kordon"},
    {key:"kordon", label:"Saat Kordonu"},
    {key:"kulaklik", label:"Kulaklık Aksesuarları"},
  ]},
];

let MARKALAR = [
  {key:"apple", label:"Apple", models:[
    {key:"iphone-15-pro-max", label:"iPhone 15 Pro Max", device:"telefon"},
    {key:"iphone-15-pro", label:"iPhone 15 Pro", device:"telefon"},
    {key:"iphone-15", label:"iPhone 15", device:"telefon"},
    {key:"iphone-14", label:"iPhone 14", device:"telefon"},
    {key:"iphone-13", label:"iPhone 13", device:"telefon"},
    {key:"ipad-air", label:"iPad Air", device:"tablet"},
    {key:"ipad-pro", label:"iPad Pro", device:"tablet"},
    {key:"apple-watch-9", label:"Apple Watch Series 9", device:"saat"},
    {key:"apple-watch-se", label:"Apple Watch SE", device:"saat"},
    {key:"airpods-pro-2", label:"AirPods Pro 2", device:"airpods"},
  ]},
  {key:"samsung", label:"Samsung", models:[
    {key:"galaxy-s24-ultra", label:"Galaxy S24 Ultra", device:"telefon"},
    {key:"galaxy-s24", label:"Galaxy S24", device:"telefon"},
    {key:"galaxy-s23", label:"Galaxy S23", device:"telefon"},
    {key:"galaxy-a54", label:"Galaxy A54", device:"telefon"},
    {key:"galaxy-tab-s9", label:"Galaxy Tab S9", device:"tablet"},
    {key:"galaxy-watch-6", label:"Galaxy Watch 6", device:"saat"},
    {key:"galaxy-buds2-pro", label:"Galaxy Buds2 Pro", device:"airpods"},
  ]},
  {key:"xiaomi", label:"Xiaomi", models:[
    {key:"redmi-note-13", label:"Redmi Note 13", device:"telefon"},
    {key:"xiaomi-13", label:"Xiaomi 13", device:"telefon"},
    {key:"redmi-pad", label:"Redmi Pad", device:"tablet"},
  ]},
];
const MODEL_TO_MARKA = {};
MARKALAR.forEach(m => m.models.forEach(md => MODEL_TO_MARKA[md.key] = m.key));

const PRODUCTS = [
  {id:1, name:"Silikon Telefon Kılıfı — Kırmızı", brand:"kilif", sub:"telefon", device:"telefon", price:149, screen:"linear-gradient(160deg,#F1544A,#C41C0F)", tag:null, models:["iphone-15","iphone-15-pro","iphone-14"]},
  {id:2, name:"Şeffaf Telefon Kılıfı", brand:"kilif", sub:"telefon", device:"telefon", price:99, screen:"linear-gradient(160deg,#eef1f5,#c9cfd8)", tag:"ÇOK SATAN", models:["iphone-15","iphone-14","iphone-13","galaxy-s24","galaxy-s23"]},
  {id:3, name:"Deri Telefon Kılıfı — Lacivert", brand:"kilif", sub:"telefon", device:"telefon", price:219, screen:"linear-gradient(160deg,#274FDE,#13379E)", tag:null, models:["iphone-15-pro-max","iphone-15-pro"]},
  {id:4, name:"Silikon Telefon Kılıfı — Sarı", brand:"kilif", sub:"telefon", device:"telefon", price:149, screen:"linear-gradient(160deg,#FFD873,#FFB800)", tag:null, models:["galaxy-s24","galaxy-s23","galaxy-a54"]},
  {id:5, name:"Deri Telefon Kılıfı — Kırmızı", brand:"kilif", sub:"telefon", device:"telefon", price:229, screen:"linear-gradient(160deg,#F1544A,#C41C0F)", tag:null, models:["redmi-note-13","xiaomi-13"]},
  {id:6, name:"Tablet Kılıfı — Standlı", brand:"kilif", sub:"tablet", device:"tablet", price:249, screen:"linear-gradient(160deg,#3a3a42,#1a1a1f)", tag:null, models:["ipad-air","ipad-pro"]},
  {id:7, name:"Tablet Kılıfı — Deri", brand:"kilif", sub:"tablet", device:"tablet", price:289, screen:"linear-gradient(160deg,#274FDE,#13379E)", tag:null, models:["galaxy-tab-s9","redmi-pad"]},
  {id:8, name:"AirPods Silikon Kılıf — Sarı", brand:"kilif", sub:"airpods", device:"airpods", price:89, screen:"linear-gradient(160deg,#FFD873,#FFB800)", tag:null, models:["airpods-pro-2"]},
  {id:9, name:"AirPods Deri Kılıf — Lacivert", brand:"kilif", sub:"airpods", device:"airpods", price:139, screen:"linear-gradient(160deg,#274FDE,#13379E)", tag:null, models:["airpods-pro-2"]},
  {id:10, name:"Apple Watch Kılıfı — Şeffaf", brand:"kilif", sub:"saat", device:"saat", price:79, screen:"linear-gradient(160deg,#eef1f5,#c9cfd8)", tag:null, models:["apple-watch-9","apple-watch-se"]},
  {id:11, name:"Apple Watch Kılıfı — Silikon Siyah", brand:"kilif", sub:"saat", device:"saat", price:89, screen:"linear-gradient(160deg,#3a3a42,#1a1a1f)", tag:null, models:["apple-watch-9","apple-watch-se"]},
  {id:12, name:"Manyetik Kablosuz Şarj Standı", brand:"sarj", sub:"telefon", device:"telefon", price:349, screen:"linear-gradient(160deg,#3a3a42,#1a1a1f)", tag:"YENİ", universal:true},
  {id:13, name:"Hızlı Şarj Kablosu 1m", brand:"sarj", sub:"kablo", device:"telefon", price:119, screen:"linear-gradient(160deg,#3a3a42,#1a1a1f)", tag:null, universal:true},
  {id:14, name:"Manyetik Saat Şarj Standı", brand:"sarj", sub:"saat", device:"saat", price:259, screen:"linear-gradient(160deg,#3a3a42,#1a1a1f)", tag:"YENİ", models:["apple-watch-9","apple-watch-se"]},
  {id:15, name:"Tablet Şarj Adaptörü 20W", brand:"sarj", sub:"tablet", device:"tablet", price:179, screen:"linear-gradient(160deg,#3a3a42,#1a1a1f)", tag:null, universal:true},
  {id:16, name:"Ekran Koruyucu — Temperli Cam", brand:"ekran", sub:"telefon", device:"telefon", price:59, screen:"linear-gradient(160deg,#eef1f5,#c9cfd8)", tag:null, models:["iphone-15","iphone-14","galaxy-s24","galaxy-s23"]},
  {id:17, name:"Kamera Lens Koruyucu", brand:"ekran", sub:"telefon", device:"telefon", price:69, screen:"linear-gradient(160deg,#eef1f5,#c9cfd8)", tag:null, models:["iphone-15-pro","iphone-15-pro-max"]},
  {id:18, name:"Tablet Ekran Koruyucu — Temperli Cam", brand:"ekran", sub:"tablet", device:"tablet", price:99, screen:"linear-gradient(160deg,#eef1f5,#c9cfd8)", tag:null, models:["ipad-air","galaxy-tab-s9"]},
  {id:19, name:"Saat Ekran Koruyucu (2'li)", brand:"ekran", sub:"saat", device:"saat", price:49, screen:"linear-gradient(160deg,#eef1f5,#c9cfd8)", tag:null, models:["apple-watch-9","galaxy-watch-6"]},
  {id:20, name:"PopSocket Telefon Tutucu", brand:"aksesuar", sub:"tutucu", device:"telefon", price:79, screen:"linear-gradient(160deg,#F1544A,#E42313)", tag:null, universal:true},
  {id:21, name:"Örgü Telefon Kordonu", brand:"aksesuar", sub:"tutucu", device:"telefon", price:129, screen:"linear-gradient(160deg,#274FDE,#13379E)", tag:null, universal:true},
  {id:22, name:"Silikon Saat Kordonu — Siyah", brand:"aksesuar", sub:"kordon", device:"saat", price:99, screen:"linear-gradient(160deg,#3a3a42,#1a1a1f)", tag:null, models:["apple-watch-9","apple-watch-se"]},
  {id:23, name:"Deri Saat Kordonu — Kahverengi", brand:"aksesuar", sub:"kordon", device:"saat", price:179, screen:"linear-gradient(160deg,#9a6a44,#6b4527)", tag:null, models:["galaxy-watch-6"]},
  {id:24, name:"Kulaklık Kulak Ucu Seti (3 Boy)", brand:"aksesuar", sub:"kulaklik", device:"kulaklik", price:45, screen:"linear-gradient(160deg,#eef1f5,#c9cfd8)", tag:null, universal:true},
  {id:25, name:"Kulaklık Taşıma Çantası", brand:"aksesuar", sub:"kulaklik", device:"kulaklik", price:99, screen:"linear-gradient(160deg,#F1544A,#C41C0F)", tag:null, universal:true},
];

// Demo stok verisi — birkaç ürün bilinçli olarak düşük/tükenmiş bırakıldı ki düşük stok uyarısı görülebilsin
const DEMO_STOCK = {2:3, 6:0, 14:2, 21:4};
let nextProductId = Math.max(...PRODUCTS.map(p => p.id)) + 1;
PRODUCTS.forEach(p => {
  p.stock = DEMO_STOCK[p.id] !== undefined ? DEMO_STOCK[p.id] : 24;
  p.lowStockThreshold = 5;
  p.image = p.image || null;
  p.variants = p.variants || {colors:[], patterns:[], models:[]};
  p.tierPrices = p.tierPrices || {};
});

let usdRate = 47; // yaklaşık yedek kur — sayfa yüklenince canlı kur ile güncellenmeye çalışılır
let usdRateSource = 'varsayılan (sabit)';

let PRICE_TIERS = [
  {id:'uye', name:'Üye', currency:'TRY', discount:0, isProtected:true},
  {id:'bayi', name:'Bayi', currency:'USD', discount:15},
  {id:'servis', name:'Servis', currency:'USD', discount:25},
];

// Ürünlere renk/model varyantları ekle, boş görünmesinler diye
const VARIANT_SEED = {
  1:{colors:['Kırmızı','Mavi','Siyah'], models:['iPhone 15','iPhone 14'], patterns:['Mermer','Çizgili']},
  2:{colors:['Şeffaf'], models:['iPhone 15','Galaxy S24']},
  3:{colors:['Lacivert','Kahverengi'], models:['iPhone 15 Pro Max','iPhone 15 Pro']},
  4:{colors:['Sarı','Mavi','Siyah'], models:['Galaxy S24','Galaxy S23']},
  5:{colors:['Kırmızı','Siyah'], models:['Redmi Note 13','Xiaomi 13']},
  6:{colors:['Siyah','Gri'], models:['iPad Air','iPad Pro']},
  7:{colors:['Lacivert','Kahverengi'], models:['Galaxy Tab S9']},
  8:{colors:['Sarı','Beyaz'], models:['AirPods Pro 2']},
  9:{colors:['Lacivert'], models:['AirPods Pro 2']},
  10:{colors:['Şeffaf'], models:['Apple Watch Series 9','Apple Watch SE']},
  11:{colors:['Siyah'], models:['Apple Watch Series 9']},
  12:{colors:['Siyah','Beyaz']},
  13:{colors:['Siyah','Beyaz'], patterns:['Kamuflaj']},
  14:{colors:['Siyah'], models:['Apple Watch Series 9']},
  15:{colors:['Beyaz','Siyah']},
  16:{models:['iPhone 15','Galaxy S24']},
  17:{models:['iPhone 15 Pro']},
  18:{models:['iPad Air']},
  19:{models:['Apple Watch Series 9']},
  20:{colors:['Kırmızı','Mavi','Sarı']},
  21:{colors:['Lacivert','Siyah']},
  22:{colors:['Siyah'], models:['Apple Watch Series 9']},
  23:{colors:['Kahverengi'], models:['Galaxy Watch 6']},
  24:{},
  25:{colors:['Kırmızı','Siyah']},
};
PRODUCTS.forEach(p => {
  const seed = VARIANT_SEED[p.id] || {};
  p.variants = {
    colors: (seed.colors || []).map((name, i) => ({name, image: null, stock: 6 + ((i * 5) % 18), barcode: null})),
    patterns: (seed.patterns || []).map(name => ({name, image: null, barcode: null})),
    models: (seed.models || []).map((name, i) => ({name, stock: 5 + ((i * 7) % 20)})),
  };
});
// Model + renk/desen kombinasyonu olan ürünlerde, her modelin stoğu artık renk/desen bazında tutulur
// (bir modelin toplam stoğu, o modeldeki renk/desen adetlerinin toplamıdır — Stok sekmesinde girilir)
PRODUCTS.forEach(p => {
  const variantNames = [...p.variants.colors.map(c => c.name), ...p.variants.patterns.map(pt => pt.name)];
  if(p.variants.models.length === 0 || variantNames.length === 0) return;
  p.variants.models.forEach((m, mi) => {
    m.variantStock = {};
    variantNames.forEach((name, vi) => {
      m.variantStock[name] = 3 + ((mi * 7 + vi * 5) % 20);
    });
  });
});

// Bayi/Servis ünvanları için örnek dolar fiyatları (üye TL fiyatına yakın ama görünür şekilde farklı)
PRODUCTS.forEach(p => {
  const bayiUSD = Math.round((p.price / 45) * 0.85 * 4) / 4;
  const servisUSD = Math.round((p.price / 45) * 0.75 * 4) / 4;
  p.tierPrices = {bayi: bayiUSD, servis: servisUSD};
});

const ORDER_STATUS_STEPS = ['alindi', 'hazirlaniyor', 'kargolandi', 'teslim'];
const ORDER_STATUS_LABELS = {alindi:'Sipariş Alındı', hazirlaniyor:'Hazırlanıyor', kargolandi:'Kargolandı', teslim:'Teslim Edildi'};

let ORDERS = [
  {id:1001, customer:'Hasan', username:'hasan', items:[{productId:1, qty:1}, {productId:16, qty:1}], status:'kargolandi', date:'10 Tem 2026'},
  {id:1002, customer:'Hasan', username:'hasan', items:[{productId:8, qty:2}], status:'hazirlaniyor', date:'12 Tem 2026'},
  {id:1003, customer:'Hasan', username:'hasan', items:[{productId:12, qty:1}], status:'alindi', date:'14 Tem 2026'},
  {id:1004, customer:'Hasan', username:'hasan', items:[{productId:3, qty:1}, {productId:20, qty:1}], status:'teslim', date:'8 Tem 2026'},
];

const DEMO_VISITOR_COUNT = 1284;
let adminUnlocked = false;
const ADMIN_PASSWORD = 'hedef2026';

let USERS = [
  {username:'ozan', displayName:'Ozan', email:'ozan@example.com', phone:'', password:'1', role:'admin', photo:null, addresses:[], tierId:'uye', isSeed:true},
  {username:'firat', displayName:'Fırat', email:'firat@example.com', phone:'', password:'12', role:'customer', photo:null, addresses:[], tierId:'bayi', isSeed:true},
  {username:'furkan', displayName:'Furkan', email:'furkan@example.com', phone:'', password:'123', role:'customer', photo:null, addresses:[], tierId:'servis', isSeed:true},
  {username:'hasan', displayName:'Hasan', email:'hasan@example.com', phone:'', password:'1234', role:'customer', photo:null, addresses:[{title:'Ev', text:'Örnek Mah. Çınar Sok. No:12 Daire:4, Konak/İzmir'}], tierId:'uye', isSeed:true},
];
let currentUser = null;

let cart = {};
let activeBrand = 'all';
let activeSub = 'all';
let selectedMarka = 'all';
let selectedModel = 'all';
const PRODUCTS_PER_PAGE = 12;
let currentProductsPage = 1;

let SOCIAL_LINKS = {
  facebook: '',
  instagram: '',
  twitter: '',
  whatsapp: '',
};
let NEWSLETTER_SUBSCRIBERS = [];
