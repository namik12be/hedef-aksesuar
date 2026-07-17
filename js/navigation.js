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
