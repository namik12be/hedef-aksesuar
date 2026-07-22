/* ============================= AUTH / PROFILE ============================= */

document.getElementById('authTabs').addEventListener('click', (e) => {
  const btn = e.target.closest('.admin-tab-btn');
  if(!btn) return;
  document.querySelectorAll('#authTabs .admin-tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const isLogin = btn.dataset.authtab === 'login';
  document.getElementById('loginForm').style.display = isLogin ? 'block' : 'none';
  document.getElementById('registerForm').style.display = isLogin ? 'none' : 'block';
});

const ACCOUNT_MENU = [
  {key:'siparisler', label:'Siparişlerim', icon:'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>'},
  {key:'mesajlar', label:'Mesajlarım', icon:'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'},
  {key:'kuponlar', label:'İndirim Kuponlarım', icon:'<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>'},
  {key:'bilgiler', label:'Kullanıcı Bilgilerim', icon:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'},
  {key:'adresler', label:'Adres Bilgilerim', icon:'<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'},
  {key:'kartlar', label:'Kayıtlı Kartlarım', icon:'<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>'},
  {key:'sifre', label:'Şifre Değiştir', icon:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'},
  {key:'oturumlar', label:'Aktif Oturumlar', icon:'<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>'},
  {key:'yardim', label:'Yardım', icon:'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>'},
];
let activeAccountSection = 'siparisler';

function updateAccountButton(){
  const btn = document.getElementById('accountBtn');
  const label = document.getElementById('accountBtnLabel');
  const iconWrap = document.getElementById('accountBtnIcon');
  if(currentUser){
    label.textContent = '';
    btn.classList.remove('has-label');
    iconWrap.innerHTML = currentUser.photo
      ? `<img src="${currentUser.photo}" class="account-btn-avatar">`
      : `<span class="account-btn-avatar account-btn-avatar-fallback">${currentUser.displayName.charAt(0).toUpperCase()}</span>`;
  } else {
    label.textContent = 'Giriş Yap / Kayıt Ol';
    btn.classList.add('has-label');
    iconWrap.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    toggleAccountMenu(false);
  }
}

/* Yeni hesap açılır menüsü (header'daki avatar tıklanınca).
   Eski tam-sayfa profil (giriş/kayıt + bölümler) korunuyor; menü öğeleri
   o sayfanın ilgili bölümüne yönlendiriyor. Beğenilmezse accountBtn'in
   click listener'ı aşağıda tek yerde, kolayca eski showProfile() davranışına
   döndürülebilir. */
function toggleAccountMenu(forceState){
  const el = document.getElementById('accountMenu');
  if(!el) return;
  const next = typeof forceState === 'boolean' ? forceState : !el.classList.contains('open');
  el.classList.toggle('open', next);
  if(next) renderAccountMenu();
}

function renderAccountMenu(){
  const el = document.getElementById('accountMenu');
  if(!el || !currentUser) return;
  const isAdmin = currentUser.role === 'admin';
  el.innerHTML = `
    <div class="account-menu-head">
      <div class="account-menu-avatar">${currentUser.photo ? `<img src="${currentUser.photo}">` : currentUser.displayName.charAt(0).toUpperCase()}</div>
      <div>
        <div class="account-menu-name">${currentUser.displayName}</div>
        <span class="account-menu-role ${isAdmin ? 'admin' : ''}">${isAdmin ? 'Yönetici' : 'Müşteri'}</span>
      </div>
    </div>
    <div class="account-menu-theme">
      <span class="account-menu-theme-label">Görünüm</span>
      <div class="theme-toggle"></div>
    </div>
    <div class="account-menu-sep"></div>
    <div class="account-menu-group">
      ${ACCOUNT_MENU.map(item => `
        <button class="account-menu-item" data-menu-section="${item.key}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>
          ${item.label}
        </button>`).join('')}
    </div>
    <div class="account-menu-sep"></div>
    <div class="account-menu-group">
      ${isAdmin ? `
      <button class="account-menu-item admin-item" id="accountMenuAdminBtn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Yönetici Moduna Geç
      </button>` : ''}
      <button class="account-menu-item danger" id="accountMenuLogoutBtn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Çıkış Yap
      </button>
    </div>`;
  renderThemeToggle();
}

document.getElementById('accountMenu').addEventListener('click', (e) => {
  const sectionBtn = e.target.closest('[data-menu-section]');
  const adminBtn = e.target.closest('#accountMenuAdminBtn');
  const logoutBtn = e.target.closest('#accountMenuLogoutBtn');
  if(sectionBtn){
    activeAccountSection = sectionBtn.dataset.menuSection;
    toggleAccountMenu(false);
    showProfile();
  } else if(adminBtn){
    toggleAccountMenu(false);
    requestAdminMode();
  } else if(logoutBtn){
    toggleAccountMenu(false);
    logout();
  }
});

document.getElementById('accountBtn').addEventListener('click', (e) => {
  e.preventDefault();
  if(currentUser){
    toggleAccountMenu();
  } else {
    showProfile();
  }
});

document.addEventListener('click', (e) => {
  if(!e.target.closest('#accountMenu') && !e.target.closest('#accountBtn')) toggleAccountMenu(false);
});

function renderProfileView(){
  updateAccountButton();
  const authWrap = document.getElementById('authForms');
  const profileWrap = document.getElementById('profileCard');
  if(!currentUser){
    authWrap.style.display = 'block';
    profileWrap.style.display = 'none';
    return;
  }
  authWrap.style.display = 'none';
  profileWrap.style.display = 'block';
  profileWrap.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar" id="profileAvatarBox">
        ${currentUser.photo ? `<img src="${currentUser.photo}">` : currentUser.displayName.charAt(0).toUpperCase()}
        <label class="profile-avatar-edit" for="profilePhotoInput" aria-label="Fotoğraf değiştir">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
        </label>
        <input type="file" id="profilePhotoInput" accept="image/*" style="display:none;">
      </div>
      <div>
        <div class="profile-name">${currentUser.displayName}</div>
        <span class="profile-role-badge ${currentUser.role === 'admin' ? 'admin' : ''}">${currentUser.role === 'admin' ? 'Yönetici' : 'Müşteri'}</span>
      </div>
    </div>
    <div class="theme-switch-card">
      <div>
        <div class="theme-switch-label">Görünüm</div>
        <div class="theme-switch-sub">Siteyi açık ya da koyu temada kullan.</div>
      </div>
      <div class="theme-toggle" id="themeToggle"></div>
    </div>
    <div class="profile-layout">
      <nav class="profile-menu" id="profileMenu">
        ${ACCOUNT_MENU.map(item => `
          <button class="profile-menu-item ${activeAccountSection === item.key ? 'active' : ''}" data-section="${item.key}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>
            ${item.label}
          </button>`).join('')}
        ${currentUser.role === 'admin' ? `
          <button class="profile-menu-item admin-mode-item" onclick="requestAdminMode()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Yönetici Moduna Geç
          </button>` : ''}
        <button class="profile-menu-item" style="margin-top:${currentUser.role === 'admin' ? '4' : '12'}px; color:var(--red);" onclick="logout()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Çıkış Yap
        </button>
      </nav>
      <div class="profile-content" id="profileContent"></div>
    </div>`;

  document.getElementById('profileMenu').addEventListener('click', (e) => {
    const btn = e.target.closest('.profile-menu-item[data-section]');
    if(!btn) return;
    activeAccountSection = btn.dataset.section;
    renderProfileView();
  });

  renderThemeToggle();

  document.getElementById('profilePhotoInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => { currentUser.photo = reader.result; renderProfileView(); };
    reader.readAsDataURL(file);
  });

  renderAccountSection();
}

function renderAccountSection(){
  const el = document.getElementById('profileContent');
  if(activeAccountSection === 'siparisler') return renderOrdersAccountSection(el);
  if(activeAccountSection === 'mesajlar') return renderMessagesSection(el);
  if(activeAccountSection === 'kuponlar') return renderCouponsSection(el);
  if(activeAccountSection === 'bilgiler') return renderUserInfoSection(el);
  if(activeAccountSection === 'adresler') return renderAddressesSection(el);
  if(activeAccountSection === 'kartlar') return renderCardsSection(el);
  if(activeAccountSection === 'sifre') return renderPasswordSection(el);
  if(activeAccountSection === 'oturumlar') return renderSessionsSection(el);
  if(activeAccountSection === 'yardim') return renderHelpSection(el);
}

let orderFilterState = 'tumu';
function renderOrdersAccountSection(el){
  const myOrders = ORDERS.filter(o => o.username === currentUser.username);
  const filtered = orderFilterState === 'tumu' ? myOrders :
    orderFilterState === 'hazirlanan' ? myOrders.filter(o => o.status === 'alindi' || o.status === 'hazirlaniyor') :
    myOrders.filter(o => o.status === 'teslim' || o.status === 'kargolandi');

  let ordersHTML = '';
  if(filtered.length === 0){
    ordersHTML = `<p class="muted-note">Bu filtrede sipariş bulunamadı.</p>`;
  } else {
    ordersHTML = filtered.map(o => {
      const itemsText = o.items.map(it => {
        const p = PRODUCTS.find(x => x.id === it.productId);
        return p ? `${p.name} × ${it.qty}` : '';
      }).filter(Boolean).join(', ');
      return `
        <div class="order-mini">
          <div class="order-mini-head">
            <span class="order-mini-id">#${o.id}</span>
            <span class="order-status-pill">${ORDER_STATUS_LABELS[o.status]}</span>
          </div>
          <div class="muted-note" style="margin:0;">${o.date} — ${itemsText}</div>
        </div>`;
    }).join('');
  }

  el.innerHTML = `
    <div class="profile-section-title">Siparişlerim</div>
    <div class="profile-section-sub">Geçmiş, hazırlanan ve teslim edilen siparişlerini buradan takip edebilirsin.</div>
    <div class="account-tabs-mini" id="orderFilterTabs">
      <button class="chip ${orderFilterState==='tumu'?'active':''}" data-f="tumu">Tümü</button>
      <button class="chip ${orderFilterState==='hazirlanan'?'active':''}" data-f="hazirlanan">Hazırlanan</button>
      <button class="chip ${orderFilterState==='teslim'?'active':''}" data-f="teslim">Teslim Edilmiş</button>
    </div>
    <div id="ordersMiniList">${ordersHTML}</div>`;

  document.getElementById('orderFilterTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if(!btn) return;
    orderFilterState = btn.dataset.f;
    renderOrdersAccountSection(el);
  });
}

function renderMessagesSection(el){
  const messages = [
    {from:'Hedef Aksesuar', text:'Siparişin kargoya verildi, teşekkürler!', date:'10 Tem 2026'},
    {from:'Hedef Aksesuar', text:'Yeni sezon indirimlerini kaçırma, kampanyalarımızı incele.', date:'5 Tem 2026'},
  ];
  el.innerHTML = `
    <div class="profile-section-title">Mesajlarım</div>
    <div class="profile-section-sub">Satıcıdan gelen bildirim ve mesajlar.</div>
    ${messages.map(m => `
      <div class="message-card">
        <strong style="font-size:14px;">${m.from}</strong>
        <span class="muted-count" style="margin-left:8px;">${m.date}</span>
        <p style="margin-top:6px; font-size:14px; color:var(--muted);">${m.text}</p>
      </div>`).join('')}`;
}

function renderCouponsSection(el){
  const coupons = [
    {code:'HEDEF10', desc:'Tüm kılıflarda %10 indirim', expiry:'31 Tem 2026'},
    {code:'HOSGELDIN20', desc:'İlk siparişine özel %20 indirim', expiry:'15 Ağu 2026'},
  ];
  el.innerHTML = `
    <div class="profile-section-title">İndirim Kuponlarım</div>
    <div class="profile-section-sub">Kullanabileceğin aktif kuponlar.</div>
    ${coupons.map(c => `
      <div class="coupon-card">
        <div>
          <div class="coupon-code">${c.code}</div>
          <div class="muted-note" style="margin:2px 0 0;">${c.desc} · Son kullanım: ${c.expiry}</div>
        </div>
      </div>`).join('')}`;
}

function renderUserInfoSection(el){
  el.innerHTML = `
    <div class="profile-section-title">Kullanıcı Bilgilerim</div>
    <div class="profile-section-sub">Ad, e-posta ve telefon bilgilerini güncelle.</div>
    <label>Ad</label>
    <input class="admin-input" id="ui_name" value="${currentUser.displayName.replace(/"/g,'&quot;')}" style="margin-bottom:14px;">
    <label>E-posta</label>
    <input class="admin-input" id="ui_email" value="${currentUser.email || ''}" style="margin-bottom:14px;">
    <label>Telefon</label>
    <input class="admin-input" id="ui_phone" value="${currentUser.phone || ''}" style="margin-bottom:18px;">
    <button class="btn btn-primary" id="ui_save">Kaydet</button>`;
  document.getElementById('ui_save').addEventListener('click', () => {
    currentUser.displayName = document.getElementById('ui_name').value.trim() || currentUser.displayName;
    currentUser.email = document.getElementById('ui_email').value.trim();
    currentUser.phone = document.getElementById('ui_phone').value.trim();
    showToast('Bilgilerin güncellendi.');
    renderProfileView();
  });
}

function renderAddressesSection(el){
  currentUser.addresses = currentUser.addresses || [];
  el.innerHTML = `
    <div class="profile-section-title">Adres Bilgilerim</div>
    <div class="profile-section-sub">Teslimat adreslerini yönet.</div>
    <div id="addressList">
      ${currentUser.addresses.length === 0 ? '<p class="muted-note">Henüz kayıtlı adresin yok.</p>' : currentUser.addresses.map((a, i) => `
        <div class="address-card">
          <div style="display:flex; justify-content:space-between;">
            <strong style="font-size:14px;">${a.title}</strong>
            <button class="admin-action-btn danger" onclick="removeAddress(${i})">🗑 Sil</button>
          </div>
          <p class="muted-note" style="margin:6px 0 0;">${a.text}</p>
        </div>`).join('')}
    </div>
    <div class="admin-form" style="margin-top:16px;">
      <div class="admin-form-grid">
        <div><label>Adres Başlığı</label><input class="admin-input" id="addr_title" placeholder="ör. Ev, İş"></div>
        <div><label>Açık Adres</label><input class="admin-input" id="addr_text" placeholder="Mahalle, sokak, il/ilçe"></div>
      </div>
      <button class="btn btn-ghost" id="addr_save">+ Adres Ekle</button>
    </div>`;
  document.getElementById('addr_save').addEventListener('click', () => {
    const title = document.getElementById('addr_title').value.trim();
    const text = document.getElementById('addr_text').value.trim();
    if(!title || !text) return;
    currentUser.addresses.push({title, text});
    renderAddressesSection(el);
  });
}
function removeAddress(i){
  currentUser.addresses.splice(i, 1);
  renderAccountSection();
}

function renderCardsSection(el){
  el.innerHTML = `
    <div class="profile-section-title">Kayıtlı Kartlarım</div>
    <div class="profile-section-sub">Bu bir demo mağazadır — gerçek kart bilgisi girilmez veya saklanmaz.</div>
    <div class="address-card">
      <strong style="font-size:14px;">Visa •••• 4242 (örnek)</strong>
      <p class="muted-note" style="margin:6px 0 0;">Gerçek bir mağazada bu bölüm bir ödeme sağlayıcısı (ör. iyzico, Stripe) ile bağlanır.</p>
    </div>
    <button class="btn btn-ghost" onclick="showToast('Gerçek kart ekleme, bir ödeme sağlayıcısı entegrasyonu gerektirir (demo).')">+ Kart Ekle</button>`;
}

function renderPasswordSection(el){
  el.innerHTML = `
    <div class="profile-section-title">Şifre Değiştir</div>
    <div class="profile-section-sub">Hesap giriş şifreni güncelle.</div>
    <label>Yeni Şifre</label>
    <input class="admin-input" id="pw_new" type="password" style="margin-bottom:14px;">
    <label>Yeni Şifre (Tekrar)</label>
    <input class="admin-input" id="pw_confirm" type="password" style="margin-bottom:14px;">
    <p id="pw_error" style="display:none; color:var(--red); font-size:13px; margin-bottom:10px;">Şifreler eşleşmiyor.</p>
    <button class="btn btn-primary" id="pw_save">Şifreyi Güncelle</button>`;
  document.getElementById('pw_save').addEventListener('click', () => {
    const a = document.getElementById('pw_new').value;
    const b = document.getElementById('pw_confirm').value;
    if(!a || a !== b){
      document.getElementById('pw_error').style.display = 'block';
      return;
    }
    currentUser.password = a;
    showToast('Şifren güncellendi.');
    document.getElementById('pw_new').value = '';
    document.getElementById('pw_confirm').value = '';
    document.getElementById('pw_error').style.display = 'none';
  });
}

function renderSessionsSection(el){
  el.innerHTML = `
    <div class="profile-section-title">Aktif Oturumlar</div>
    <div class="profile-section-sub">Hesabının açık olduğu cihazlar.</div>
    <div class="session-row"><span>Bu cihaz — tarayıcı (şu an aktif)</span><span class="muted-count">Aktif</span></div>
    <div class="session-row"><span>iPhone — Safari, İstanbul</span><button class="admin-action-btn danger" onclick="showToast('Oturum kapatıldı (demo)')">Oturumu Kapat</button></div>`;
}

function renderHelpSection(el){
  el.innerHTML = `
    <div class="profile-section-title">Yardım</div>
    <div class="profile-section-sub">Sık sorulan sorular.</div>
    <div class="message-card"><strong style="font-size:14px;">Kargom ne zaman gelir?</strong><p class="muted-note" style="margin-top:6px;">Siparişler genelde 1-3 iş günü içinde kargoya verilir.</p></div>
    <div class="message-card"><strong style="font-size:14px;">İade nasıl yapılır?</strong><p class="muted-note" style="margin-top:6px;">Ürünü 14 gün içinde orijinal kutusuyla iade edebilirsin.</p></div>
    <a href="mailto:merhaba@hedefaksesuar.com" class="btn btn-ghost" style="margin-top:8px;">Bize Ulaş</a>`;
}

function normalizeTr(s){
  return s.toString().trim().toLowerCase()
    .replace(/ı/g, 'i').replace(/i̇/g, 'i')
    .replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');
}

const SESSION_STORAGE_KEY = 'hedefAksesuarSession';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün boyunca oturum açık kalır
function saveUserSession(user){
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({username: user.username, expiresAt: Date.now() + SESSION_DURATION_MS}));
}
function clearUserSession(){
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
function restoreUserSession(){
  try{
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if(!raw) return;
    const session = JSON.parse(raw);
    if(!session || !session.username || !session.expiresAt || Date.now() > session.expiresAt){
      clearUserSession();
      return;
    }
    const user = USERS.find(u => u.username === session.username);
    if(user){
      currentUser = user;
      saveUserSession(user);
    }
  }catch(e){}
}

document.getElementById('loginSubmitBtn').addEventListener('click', () => {
  const idf = document.getElementById('loginIdentifier').value.trim();
  const idNorm = normalizeTr(idf);
  const user = USERS.find(u =>
    normalizeTr(u.username) === idNorm ||
    normalizeTr(u.displayName) === idNorm ||
    (u.email && normalizeTr(u.email) === idNorm) ||
    (u.phone && u.phone === idf)
  );
  const pwd = document.getElementById('loginPassword').value;
  if(user && user.password === pwd){
    currentUser = user;
    saveUserSession(user);
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('loginIdentifier').value = '';
    document.getElementById('loginPassword').value = '';
    renderProfileView();
    showToast(`Hoş geldin, ${user.displayName}!`);
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
});

document.getElementById('registerSubmitBtn').addEventListener('click', () => {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;
  const errEl = document.getElementById('registerError');
  if(!name || !password || (!email && !phone)){
    errEl.textContent = 'Ad, şifre ve en az bir iletişim bilgisi (e-posta veya telefon) gerekli.';
    errEl.style.display = 'block';
    return;
  }
  const username = name.toLowerCase().replace(/\s+/g, '');
  if(USERS.some(u => u.username === username)){
    errEl.textContent = 'Bu kullanıcı adı zaten alınmış.';
    errEl.style.display = 'block';
    return;
  }
  const newUser = {username, displayName:name, email, phone, password, role:'customer', photo:null, addresses:[], tierId:'uye'};
  USERS.push(newUser);
  currentUser = newUser;
  saveUserSession(newUser);
  errEl.style.display = 'none';
  renderProfileView();
  showToast(`Kayıt başarılı, hoş geldin ${name}!`);
});

function googleMockLogin(){
  let guser = USERS.find(u => u.username === 'google_demo');
  if(!guser){
    guser = {username:'google_demo', displayName:'Google Kullanıcısı', email:'demo@gmail.com', phone:'', password:null, role:'customer', photo:null, addresses:[], tierId:'uye'};
    USERS.push(guser);
  }
  currentUser = guser;
  saveUserSession(guser);
  renderProfileView();
  showToast('Google ile giriş yapıldı (demo — gerçek Google bağlantısı değildir).');
}
document.getElementById('googleLoginBtn').addEventListener('click', googleMockLogin);
document.getElementById('googleRegisterBtn').addEventListener('click', googleMockLogin);

function logout(){
  currentUser = null;
  adminUnlocked = false;
  clearUserSession();
  renderProfileView();
  showToast('Çıkış yapıldı');
}

