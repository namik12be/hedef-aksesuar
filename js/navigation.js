const THEME_STORAGE_KEY = 'hedefAksesuarTheme';
function getThemePreference(){
  return localStorage.getItem(THEME_STORAGE_KEY) || 'system';
}
function systemPrefersDark(){
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function applyThemePreference(pref){
  const effective = pref === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : pref;
  if(effective === 'dark'){
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}
function setThemePreference(pref){
  localStorage.setItem(THEME_STORAGE_KEY, pref);
  applyThemePreference(pref);
  renderThemeToggle();
}
function renderThemeToggle(){
  const el = document.getElementById('themeToggle');
  if(!el) return;
  const current = getThemePreference();
  const options = [
    {key: 'light', label: 'Açık', icon: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>'},
    {key: 'dark', label: 'Koyu', icon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'},
    {key: 'system', label: 'Sistem', icon: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>'},
  ];
  el.innerHTML = options.map(o => `<button class="theme-toggle-btn ${current === o.key ? 'active' : ''}" onclick="setThemePreference('${o.key}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${o.icon}</svg>${o.label}</button>`).join('');
}
if(window.matchMedia){
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if(getThemePreference() === 'system') applyThemePreference('system');
  });
}

const LAST_VIEW_KEY = 'hedefAksesuarLastView';
function saveLastView(view, extra){
  try { sessionStorage.setItem(LAST_VIEW_KEY, JSON.stringify({view, extra: extra || null})); } catch(e){}
}
function restoreLastView(){
  try {
    const raw = sessionStorage.getItem(LAST_VIEW_KEY);
    if(!raw) return;
    const {view, extra} = JSON.parse(raw);
    if(view === 'products') showProducts();
    else if(view === 'admin') showAdmin();
    else if(view === 'profile') showProfile();
    else if(view === 'faq') showFaq();
    else if(view === 'productDetail' && extra) showProductDetail(extra);
  } catch(e){}
}

let faqReturnView = 'home';
function showFaq(){
  saveLastView('faq');
  faqReturnView = currentMainView();
  document.body.classList.remove('admin-mode');
  document.getElementById('homeView').style.display = 'none';
  document.getElementById('productsView').style.display = 'none';
  document.getElementById('adminView').style.display = 'none';
  document.getElementById('profileView').style.display = 'none';
  document.getElementById('productDetailView').style.display = 'none';
  document.getElementById('faqView').style.display = 'block';
  window.scrollTo(0, 0);
  const openAnswer = document.querySelector('#faqList .faq-item.open .faq-answer');
  if(openAnswer) openAnswer.style.maxHeight = openAnswer.scrollHeight + 'px';
}
document.getElementById('faqBackBtn').addEventListener('click', () => {
  if(faqReturnView === 'products') showProducts(); else showHome();
});

function showHome(){
  saveLastView('home');
  document.body.classList.remove('admin-mode');
  document.getElementById('homeView').style.display = 'block';
  document.getElementById('productsView').style.display = 'none';
  document.getElementById('adminView').style.display = 'none';
  document.getElementById('profileView').style.display = 'none';
  document.getElementById('productDetailView').style.display = 'none';
  document.getElementById('faqView').style.display = 'none';
  window.scrollTo(0, 0);
}
function showProducts(){
  saveLastView('products');
  document.body.classList.remove('admin-mode');
  document.getElementById('homeView').style.display = 'none';
  document.getElementById('productsView').style.display = 'block';
  document.getElementById('adminView').style.display = 'none';
  document.getElementById('profileView').style.display = 'none';
  document.getElementById('productDetailView').style.display = 'none';
  document.getElementById('faqView').style.display = 'none';
  window.scrollTo(0, 0);
}
function showAdmin(){
  saveLastView('admin');
  document.body.classList.remove('admin-mode');
  document.getElementById('homeView').style.display = 'none';
  document.getElementById('productsView').style.display = 'none';
  document.getElementById('profileView').style.display = 'none';
  document.getElementById('productDetailView').style.display = 'none';
  document.getElementById('faqView').style.display = 'none';
  document.getElementById('adminView').style.display = 'block';
  window.scrollTo(0, 0);
  if(adminUnlocked){
    document.body.classList.add('admin-mode');
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    renderAdminAll();
  } else {
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
  }
}
function showProfile(){
  saveLastView('profile');
  document.body.classList.remove('admin-mode');
  document.getElementById('homeView').style.display = 'none';
  document.getElementById('productsView').style.display = 'none';
  document.getElementById('adminView').style.display = 'none';
  document.getElementById('productDetailView').style.display = 'none';
  document.getElementById('faqView').style.display = 'none';
  document.getElementById('profileView').style.display = 'block';
  window.scrollTo(0, 0);
  renderProfileView();
}
function requestAdminMode(){
  if(!currentUser || currentUser.role !== 'admin'){
    showToast('Bu özellik sadece yönetici hesapları için.');
    return;
  }
  showAdmin();
}

document.addEventListener('click', (e) => {
  const goProducts = e.target.closest('[data-goto="products"]');
  const goHome = e.target.closest('[data-goto="home"]');
  const goLogo = e.target.closest('[data-goto="logo"]');
  const goProfile = e.target.closest('[data-goto="profile"]');
  const goFaq = e.target.closest('[data-goto="faq"]');
  const goSection = e.target.closest('[data-goto-section]');
  if(goProducts){
    e.preventDefault();
    showProducts();
  } else if(goFaq){
    e.preventDefault();
    showFaq();
  } else if(goLogo){
    e.preventDefault();
    if(document.getElementById('adminView').style.display !== 'none' && document.getElementById('adminDashboard').style.display !== 'none'){
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('.admin-tab-btn[data-tab="genel"]').classList.add('active');
      document.querySelectorAll('.admin-panel').forEach(p => p.style.display = 'none');
      document.getElementById('tab-genel').style.display = 'block';
      window.scrollTo(0, 0);
    } else {
      showHome();
    }
  } else if(goProfile){
    e.preventDefault();
    showProfile();
  } else if(goHome){
    e.preventDefault();
    showHome();
  } else if(goSection){
    e.preventDefault();
    showHome();
    const id = goSection.dataset.gotoSection;
    setTimeout(() => {
      const target = document.getElementById(id);
      if(target) target.scrollIntoView({behavior:'smooth'});
    }, 30);
  }
});

window.addEventListener('scroll', () => {
  document.querySelector('header').classList.toggle('scrolled', window.scrollY > 30);
});

/* ---- Header ürün arama ---- */
function renderHeaderSearchResults(query){
  const el = document.getElementById('headerSearchResults');
  const q = normalizeTr(query.trim());
  if(!q){ el.style.display = 'none'; el.innerHTML = ''; return; }
  const matches = PRODUCTS.filter(p => normalizeTr(p.name).includes(q)).slice(0, 8);
  el.style.display = 'block';
  if(matches.length === 0){
    el.innerHTML = `<div class="nav-search-empty">Sonuç bulunamadı.</div>`;
    return;
  }
  el.innerHTML = matches.map(p => `
    <div class="nav-search-result-item" onclick="goToHeaderSearchResult(${p.id})">
      <div class="nav-search-result-thumb" style="background:${p.screen || 'var(--bg-soft)'};"></div>
      <div>
        <div class="nav-search-result-name">${p.name}</div>
        <div class="nav-search-result-price">${fmtTRY(p.price)}</div>
      </div>
    </div>
  `).join('');
}
function goToHeaderSearchResult(id){
  document.getElementById('headerSearchInput').value = '';
  document.getElementById('headerSearchResults').style.display = 'none';
  showProductDetail(id);
}
document.getElementById('headerSearchInput').addEventListener('input', (e) => {
  renderHeaderSearchResults(e.target.value);
});
document.getElementById('headerSearchInput').addEventListener('focus', (e) => {
  if(e.target.value.trim()) renderHeaderSearchResults(e.target.value);
});
document.getElementById('headerSearchInput').addEventListener('keydown', (e) => {
  if(e.key === 'Enter'){
    e.preventDefault();
    const q = normalizeTr(e.target.value.trim());
    if(!q) return;
    const first = PRODUCTS.find(p => normalizeTr(p.name).includes(q));
    if(first) goToHeaderSearchResult(first.id);
  }
});
document.addEventListener('click', (e) => {
  if(!e.target.closest('#headerSearchWrap')) document.getElementById('headerSearchResults').style.display = 'none';
});

document.getElementById('faqList').addEventListener('click', (e) => {
  const btn = e.target.closest('.faq-question');
  if(!btn) return;
  const item = btn.closest('.faq-item');
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('#faqList .faq-item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-answer').style.maxHeight = null;
  });
  if(!wasOpen){
    item.classList.add('open');
    const answer = item.querySelector('.faq-answer');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
});

const SOCIAL_ICONS = {
  whatsapp: '<path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.5 14.02c-.23.65-1.36 1.24-1.87 1.31-.48.07-1.09.1-1.76-.11-.4-.13-.92-.3-1.58-.58-2.78-1.2-4.6-4-4.74-4.19-.14-.19-1.14-1.51-1.14-2.89 0-1.37.72-2.04.97-2.32.25-.28.55-.35.73-.35.18 0 .37 0 .53.01.17.01.4-.06.62.48.23.55.78 1.9.85 2.04.07.14.11.3.02.48-.09.18-.14.3-.28.46-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.28.36-.23.6-.14.25.09 1.58.75 1.85.88.28.14.46.2.53.32.07.11.07.65-.16 1.3z"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
  twitter: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};
const SOCIAL_LABELS = {whatsapp: 'WhatsApp', facebook: 'Facebook', instagram: 'Instagram', twitter: 'Twitter (X)'};

function renderFooterSocial(){
  const el = document.getElementById('footSocialLinks');
  if(!el) return;
  el.innerHTML = Object.keys(SOCIAL_ICONS).map(key => {
    if(key === 'whatsapp'){
      const digits = (SOCIAL_LINKS.whatsapp || '').replace(/\D/g, '');
      if(!digits) return '';
      return `<a class="foot-social-btn" href="https://wa.me/${digits}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">${SOCIAL_ICONS.whatsapp}</svg></a>`;
    }
    const href = (SOCIAL_LINKS[key] && SOCIAL_LINKS[key].trim()) ? SOCIAL_LINKS[key].trim() : '#';
    return `<a class="foot-social-btn" href="${href}" target="_blank" rel="noopener" aria-label="${SOCIAL_LABELS[key]}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SOCIAL_ICONS[key]}</svg></a>`;
  }).join('');
}

document.getElementById('newsletterSubscribeBtn').addEventListener('click', () => {
  const input = document.getElementById('newsletterEmail');
  const email = input.value.trim();
  if(!email || !email.includes('@') || !email.includes('.')){
    showToast('Lütfen geçerli bir e-posta adresi gir.');
    return;
  }
  if(NEWSLETTER_SUBSCRIBERS.some(s => s.email.toLowerCase() === email.toLowerCase())){
    showToast('Bu e-posta zaten kayıtlı.');
    return;
  }
  const subscribedDate = new Date().toLocaleDateString('tr-TR');
  NEWSLETTER_SUBSCRIBERS.push({email, date: subscribedDate});
  supabaseClient.from('newsletter_subscribers').insert({email, subscribed_date: subscribedDate})
    .then(({error}) => { if(error) console.error('Supabase bülten kayıt hatası:', error.message); });
  input.value = '';
  showToast('Bültenimize katıldığın için teşekkürler!');
  if(document.getElementById('newsletterSubscribersList')) renderNewsletterAdminList();
});
