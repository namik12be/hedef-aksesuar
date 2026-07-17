function showHome(){
  document.getElementById('homeView').style.display = 'block';
  document.getElementById('productsView').style.display = 'none';
  document.getElementById('adminView').style.display = 'none';
  document.getElementById('profileView').style.display = 'none';
  document.getElementById('productDetailView').style.display = 'none';
  window.scrollTo(0, 0);
}
function showProducts(){
  document.getElementById('homeView').style.display = 'none';
  document.getElementById('productsView').style.display = 'block';
  document.getElementById('adminView').style.display = 'none';
  document.getElementById('profileView').style.display = 'none';
  document.getElementById('productDetailView').style.display = 'none';
  window.scrollTo(0, 0);
}
function showAdmin(){
  document.getElementById('homeView').style.display = 'none';
  document.getElementById('productsView').style.display = 'none';
  document.getElementById('profileView').style.display = 'none';
  document.getElementById('productDetailView').style.display = 'none';
  document.getElementById('adminView').style.display = 'block';
  window.scrollTo(0, 0);
  if(adminUnlocked){
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    renderAdminAll();
  } else {
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
  }
}
function showProfile(){
  document.getElementById('homeView').style.display = 'none';
  document.getElementById('productsView').style.display = 'none';
  document.getElementById('adminView').style.display = 'none';
  document.getElementById('productDetailView').style.display = 'none';
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
  const goSection = e.target.closest('[data-goto-section]');
  if(goProducts){
    e.preventDefault();
    showProducts();
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

const SOCIAL_ICONS = {
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
  twitter: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};
const SOCIAL_LABELS = {facebook: 'Facebook', instagram: 'Instagram', twitter: 'Twitter (X)'};

function renderFooterSocial(){
  const el = document.getElementById('footSocialLinks');
  if(!el) return;
  el.innerHTML = Object.keys(SOCIAL_ICONS).map(key => {
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
  NEWSLETTER_SUBSCRIBERS.push({email, date: new Date().toLocaleDateString('tr-TR')});
  input.value = '';
  showToast('Bültenimize katıldığın için teşekkürler!');
  if(document.getElementById('newsletterSubscribersList')) renderNewsletterAdminList();
});
