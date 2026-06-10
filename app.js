/* =====================================================================
   ProcurementHost — app.js  (MESIN BERSAMA untuk SEMUA halaman)
   ---------------------------------------------------------------------
   Berisi: header & footer otomatis, dark mode, notifikasi toast,
   banner cookie, live chat + WhatsApp, dan SISTEM AKUN (daftar/login)
   yang datanya disimpan di browser (localStorage).

   Catatan: ini demo edukatif. Password disimpan apa adanya di browser
   (tidak terenkripsi) — JANGAN dipakai untuk data asli/produksi.
   ===================================================================== */

(function () {
  'use strict';

  /* ============ KONFIGURASI ============ */
  const BRAND = 'ProcurementHost';
  const WA_NUMBER = '6281234567890'; // nomor WhatsApp (tanpa +)

  // === LOGIN GOOGLE ===
  // Tempel "Client ID" dari Google Cloud Console di antara tanda kutip di bawah.
  // Cara mendapatkannya: baca file PANDUAN-LOGIN-GOOGLE.md
  // Contoh: '1234567890-abcdef.apps.googleusercontent.com'
  const GOOGLE_CLIENT_ID = '664571232142-armpj5cfa0qs83d3bp2fir3rjc7am23e.apps.googleusercontent.com'; // <-- ISI DI SINI

  // Daftar paket — sumber data tunggal, dipakai checkout & dashboard
  const PLANS = {
    pemula:  { name: 'Pemula',  monthly: 15000, yearly: 12000, storage: '10 GB',  category: 'hosting' },
    bisnis:  { name: 'Bisnis',  monthly: 45000, yearly: 36000, storage: '100 GB', category: 'hosting' },
    premium: { name: 'Premium', monthly: 99000, yearly: 79000, storage: '300 GB', category: 'hosting' },
    // VPS / Cloud — paket berjenjang dengan sumber daya khusus
    'vps-starter': { name: 'VPS Starter', monthly: 120000, yearly: 100000, storage: '50 GB SSD',  category: 'vps', vcpu: '2 vCPU', ram: '2 GB RAM' },
    'vps-pro':     { name: 'VPS Pro',     monthly: 280000, yearly: 235000, storage: '120 GB SSD', category: 'vps', vcpu: '4 vCPU', ram: '8 GB RAM' },
    'vps-max':     { name: 'VPS Max',     monthly: 550000, yearly: 460000, storage: '250 GB SSD', category: 'vps', vcpu: '8 vCPU', ram: '16 GB RAM' },
    // Dedicated Server — server fisik sepenuhnya milik sendiri
    'ded-entry':      { name: 'Dedicated Entry',      monthly: 1500000, yearly: 1300000, storage: '1 TB NVMe', category: 'dedicated', cpu: 'Xeon 4 Core', ram: '16 GB RAM' },
    'ded-power':      { name: 'Dedicated Power',      monthly: 2900000, yearly: 2500000, storage: '2 TB NVMe', category: 'dedicated', cpu: 'Xeon 8 Core', ram: '32 GB RAM' },
    'ded-enterprise': { name: 'Dedicated Enterprise', monthly: 5500000, yearly: 4800000, storage: '4 TB NVMe', category: 'dedicated', cpu: 'Xeon 16 Core', ram: '64 GB RAM' },
    // Hosting WordPress — shared hosting yang dioptimalkan untuk WordPress/WooCommerce
    'wp-personal': { name: 'WordPress Personal', monthly: 20000, yearly: 16000, storage: '20 GB SSD',  category: 'wordpress' },
    'wp-bisnis':   { name: 'WordPress Bisnis',   monthly: 55000, yearly: 45000, storage: '100 GB SSD', category: 'wordpress' },
    'wp-pro':      { name: 'WordPress Pro',       monthly: 110000, yearly: 90000, storage: '200 GB SSD', category: 'wordpress' },
    // Email Hosting — email profesional @domain-sendiri
    'email-starter': { name: 'Email Starter', monthly: 12000, yearly: 9000,  storage: '10 GB / akun', category: 'email' },
    'email-bisnis':  { name: 'Email Bisnis',  monthly: 30000, yearly: 24000, storage: '50 GB / akun', category: 'email' },
    // Cloud Hosting — sumber daya terdedikasi & skalabel, tetap mudah dikelola
    'cloud-start': { name: 'Cloud Start', monthly: 180000, yearly: 150000, storage: '100 GB NVMe', category: 'cloud', vcpu: '2 vCPU', ram: '3 GB RAM' },
    'cloud-pro':   { name: 'Cloud Pro',   monthly: 350000, yearly: 290000, storage: '200 GB NVMe', category: 'cloud', vcpu: '4 vCPU', ram: '6 GB RAM' },
    'cloud-max':   { name: 'Cloud Max',   monthly: 650000, yearly: 540000, storage: '300 GB NVMe', category: 'cloud', vcpu: '6 vCPU', ram: '12 GB RAM' },
  };

  // Pajak & kupon promo (dipakai di checkout)
  const PPN_RATE = 0.11; // PPN 11%
  const COUPONS = {
    HEMAT10: { rate: 0.10, label: 'Diskon 10%' },
    NEWUSER: { rate: 0.15, label: 'Diskon 15% pengguna baru' },
    PROMO25: { rate: 0.25, label: 'Diskon 25% spesial' },
  };

  /* ============ UTIL ============ */
  const $  = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const rp = (n) => 'Rp' + Number(n).toLocaleString('id-ID');
  const store = {
    get: (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
    del: (k) => localStorage.removeItem(k),
  };
  // Nama file halaman aktif, mis. "index.html"
  const PAGE = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  /* =====================================================================
     1. SISTEM AKUN (auth)
     ===================================================================== */
  const Auth = {
    users:    () => store.get('nh_users', []),
    saveUsers:(u) => store.set('nh_users', u),
    current:  () => {
      const email = store.get('nh_session', null);
      if (!email) return null;
      return Auth.users().find(u => u.email === email) || null;
    },
    register({ name, email, password }) {
      email = email.trim().toLowerCase();
      const users = Auth.users();
      if (users.some(u => u.email === email)) throw new Error('Email sudah terdaftar. Silakan masuk.');
      const user = { name: name.trim(), email, password, createdAt: Date.now() };
      users.push(user);
      Auth.saveUsers(users);
      store.set('nh_session', email);
      return user;
    },
    login({ email, password }) {
      email = email.trim().toLowerCase();
      const user = Auth.users().find(u => u.email === email);
      if (!user || user.password !== password) throw new Error('Email atau kata sandi salah.');
      store.set('nh_session', email);
      return user;
    },
    // Masuk/daftar otomatis memakai profil dari Google
    loginWithGoogle({ name, email, picture }) {
      email = (email || '').trim().toLowerCase();
      if (!email) throw new Error('Email Google tidak terbaca.');
      const users = Auth.users();
      let user = users.find(u => u.email === email);
      if (!user) {
        user = { name: name || email.split('@')[0], email, password: null, provider: 'google', picture: picture || '', createdAt: Date.now() };
        users.push(user); Auth.saveUsers(users);
      }
      store.set('nh_session', email);
      return user;
    },
    logout() { store.del('nh_session'); },
    // Cari user berdasarkan email
    findByEmail(email) {
      email = (email || '').trim().toLowerCase();
      return Auth.users().find(u => u.email === email) || null;
    },
    emailExists(email) { return !!Auth.findByEmail(email); },
    // Ganti kata sandi (butuh sandi lama) — dipakai di dashboard
    changePassword({ currentPassword, newPassword }) {
      const u = Auth.current();
      if (!u) throw new Error('Anda belum masuk.');
      if (u.provider === 'google') throw new Error('Akun Google tidak memakai kata sandi di sini. Kelola sandi lewat akun Google Anda.');
      if (u.password !== currentPassword) throw new Error('Kata sandi saat ini salah.');
      if (!newPassword || newPassword.length < 6) throw new Error('Kata sandi baru minimal 6 karakter.');
      if (newPassword === currentPassword) throw new Error('Kata sandi baru tidak boleh sama dengan yang lama.');
      const users = Auth.users();
      const i = users.findIndex(x => x.email === u.email);
      users[i].password = newPassword; Auth.saveUsers(users);
      return true;
    },
    // Reset kata sandi tanpa sandi lama (alur "lupa password" — simulasi)
    resetPassword({ email, newPassword }) {
      email = (email || '').trim().toLowerCase();
      const users = Auth.users();
      const i = users.findIndex(x => x.email === email);
      if (i < 0) throw new Error('Email tidak ditemukan.');
      if (users[i].provider === 'google') throw new Error('Akun ini memakai Login Google, jadi tidak punya kata sandi untuk direset.');
      if (!newPassword || newPassword.length < 6) throw new Error('Kata sandi baru minimal 6 karakter.');
      users[i].password = newPassword; Auth.saveUsers(users);
      return true;
    },
    // Lindungi halaman: jika belum login, lempar ke halaman masuk
    require() {
      const u = Auth.current();
      if (!u) { location.href = 'masuk.html?next=' + encodeURIComponent(PAGE); return null; }
      return u;
    },
  };

  /* ===== Layanan & tagihan milik user (untuk dashboard) ===== */
  const CYCLE_MS = { monthly: 30 * 24 * 3600 * 1000, yearly: 365 * 24 * 3600 * 1000 };

  const Services = {
    all:  () => store.get('nh_services', []),
    mine: () => { const u = Auth.current(); return u ? Services.all().filter(s => s.owner === u.email) : []; },
    // Harga total satu siklus untuk sebuah paket
    priceFor: (planKey, cycle) => {
      const p = PLANS[planKey]; if (!p) return 0;
      return cycle === 'yearly' ? p.yearly * 12 : p.monthly;
    },
    add(svc) {
      const u = Auth.current(); if (!u) return null;
      const list = Services.all();
      const id = 'NH' + (1000 + list.length + 1);
      const now = Date.now();
      const item = { id, owner: u.email, status: 'aktif', createdAt: now,
        expiresAt: now + (CYCLE_MS[svc.cycle] || CYCLE_MS.monthly), ...svc };
      list.push(item); store.set('nh_services', list);
      // Catat invoice pembelian (langsung lunas). invoiceAmount = total dibayar (sudah diskon + PPN);
      // item.price tetap harga dasar siklus agar perhitungan perpanjangan/upgrade konsisten.
      Billing.add({ serviceId: id, type: 'beli', cycle: svc.cycle,
        amount: (svc.invoiceAmount != null ? svc.invoiceAmount : item.price), status: 'paid',
        desc: `Hosting ${item.planName} (${svc.cycle === 'yearly' ? '1 tahun' : '1 bulan'})` + (svc.coupon ? ` — kupon ${svc.coupon}` : '') });
      return item;
    },
    // Ubah paket (upgrade/downgrade) — kembalikan { service, diff }
    changePlan(id, newPlanKey) {
      const list = Services.all();
      const s = list.find(x => x.id === id);
      const np = PLANS[newPlanKey];
      if (!s || !np) return null;
      const oldPrice = s.price;
      s.plan = newPlanKey; s.planName = np.name; s.storage = np.storage;
      s.price = Services.priceFor(newPlanKey, s.cycle);
      store.set('nh_services', list);
      return { service: s, diff: s.price - oldPrice };
    },
    // Perpanjang masa aktif (dipanggil setelah invoice perpanjangan dibayar)
    extend(id, cycle) {
      const list = Services.all();
      const s = list.find(x => x.id === id); if (!s) return null;
      const base = Math.max(s.expiresAt || Date.now(), Date.now());
      s.expiresAt = base + (CYCLE_MS[cycle] || CYCLE_MS.monthly);
      s.status = 'aktif';
      store.set('nh_services', list);
      return s;
    },
    remove(id) {
      store.set('nh_services', Services.all().filter(s => s.id !== id));
      Billing.dropPendingFor(id); // buang tagihan tertunda layanan itu (riwayat lunas tetap disimpan)
    },
  };

  /* ===== Tagihan / Invoice milik user ===== */
  const Billing = {
    all:  () => store.get('nh_invoices', []),
    mine: () => { const u = Auth.current(); return u ? Billing.all().filter(i => i.owner === u.email) : []; },
    pendingMine: () => Billing.mine().filter(i => i.status === 'pending'),
    add({ serviceId, desc, amount, status = 'paid', cycle, type = 'beli', date }) {
      const u = Auth.current(); if (!u) return null;
      const list = Billing.all();
      const seq = store.get('nh_invseq', 1000) + 1;
      store.set('nh_invseq', seq);
      const inv = { id: 'INV-' + seq, owner: u.email, serviceId, desc, amount,
        status, cycle, type, date: date || Date.now() };
      list.push(inv); store.set('nh_invoices', list);
      return inv;
    },
    pay(id) {
      const list = Billing.all();
      const inv = list.find(i => i.id === id);
      if (!inv || inv.status === 'paid') return null;
      inv.status = 'paid'; inv.paidAt = Date.now();
      store.set('nh_invoices', list);
      if (inv.type === 'perpanjang' && inv.serviceId) Services.extend(inv.serviceId, inv.cycle);
      return inv;
    },
    dropPendingFor(serviceId) {
      store.set('nh_invoices', Billing.all().filter(i => !(i.serviceId === serviceId && i.status === 'pending')));
    },
    // Lengkapi data lama: layanan tanpa expiresAt / tanpa invoice pembelian
    seedMissing() {
      const u = Auth.current(); if (!u) return;
      const svcs = Services.all();
      let changed = false;
      svcs.forEach(s => {
        if (s.owner === u.email && !s.expiresAt) {
          s.expiresAt = (s.createdAt || Date.now()) + (CYCLE_MS[s.cycle] || CYCLE_MS.monthly);
          changed = true;
        }
      });
      if (changed) store.set('nh_services', svcs);
      Services.mine().forEach(s => {
        const has = Billing.all().some(i => i.serviceId === s.id && i.type === 'beli');
        if (!has) Billing.add({ serviceId: s.id, type: 'beli', cycle: s.cycle, amount: s.price, status: 'paid',
          date: s.createdAt, desc: `Hosting ${s.planName} (${s.cycle === 'yearly' ? '1 tahun' : '1 bulan'})` });
      });
    },
  };

  /* ===== Keranjang belanja (multi-item) ===== */
  const cartChanged = () => { try { window.dispatchEvent(new Event('nh-cart-change')); } catch {} };
  const Cart = {
    items: () => store.get('nh_cart', []),
    count: () => Cart.items().length,
    add(planKey, cycle = 'monthly', domain = '') {
      if (!PLANS[planKey]) return null;
      const items = Cart.items();
      items.push({ plan: planKey, cycle, domain });
      store.set('nh_cart', items); cartChanged();
      return items;
    },
    setCycle(idx, cycle) { const it = Cart.items(); if (it[idx]) { it[idx].cycle = cycle; store.set('nh_cart', it); cartChanged(); } },
    remove(idx) { const it = Cart.items(); it.splice(idx, 1); store.set('nh_cart', it); cartChanged(); },
    clear() { store.del('nh_cart'); cartChanged(); },
  };

  /* ===== Tiket dukungan ===== */
  const SUPPORT_AUTOREPLY = 'Halo! 👋 Terima kasih sudah menghubungi kami. Tim dukungan akan meninjau tiket Anda dan membalas dalam waktu kurang dari 1×24 jam.';
  const Tickets = {
    all:  () => store.get('nh_tickets', []),
    mine: () => { const u = Auth.current(); return u ? Tickets.all().filter(t => t.owner === u.email) : []; },
    get:  (id) => Tickets.all().find(t => t.id === id) || null,
    add({ subject, topic, message }) {
      const u = Auth.current(); if (!u) return null;
      const list = Tickets.all();
      const seq = store.get('nh_ticketseq', 1000) + 1;
      store.set('nh_ticketseq', seq);
      const now = Date.now();
      const t = { id: 'TKT-' + seq, owner: u.email, subject, topic, status: 'open', createdAt: now,
        replies: [ { from: 'user', text: message, at: now }, { from: 'support', text: SUPPORT_AUTOREPLY, at: now + 1000 } ] };
      list.push(t); store.set('nh_tickets', list);
      return t;
    },
    reply(id, text) {
      const list = Tickets.all(); const t = list.find(x => x.id === id); if (!t) return null;
      t.replies.push({ from: 'user', text, at: Date.now() }); t.status = 'open';
      store.set('nh_tickets', list); return t;
    },
    close(id) { const list = Tickets.all(); const t = list.find(x => x.id === id); if (t) { t.status = 'closed'; store.set('nh_tickets', list); } },
  };

  /* =====================================================================
     2. HEADER & FOOTER OTOMATIS
     ===================================================================== */
  function headerHTML() {
    const links = [
      { label: 'Beranda', href: 'index.html', match: 'index.html' },
      { label: 'Fitur',   href: 'index.html#fitur' },
      { label: 'Harga',   href: 'index.html#harga' },
      { label: 'Produk',  href: 'index.html#produk' },
      { label: 'Domain',  href: 'domain.html',  match: 'domain.html' },
      { label: 'VPS',     href: 'vps.html',     match: 'vps.html' },
      { label: 'Blog',    href: 'blog.html',    match: 'blog.html|artikel.html' },
      { label: 'Tentang', href: 'tentang.html', match: 'tentang.html' },
      { label: 'Bantuan', href: 'bantuan.html', match: 'bantuan.html' },
    ];
    const navItems = links.map(l => {
      const active = l.match && new RegExp('^(' + l.match + ')$').test(PAGE) ? ' class="active"' : '';
      return `<a href="${l.href}"${active}>${l.label}</a>`;
    }).join('');

    return `
    <div class="container nav">
      <a href="index.html" class="logo" aria-label="${BRAND} beranda">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="url(#lg)"/>
          <g transform="translate(2.6,2.4) scale(0.78)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          </g>
          <defs><linearGradient id="lg" x1="0" y1="0" x2="24" y2="24">
            <stop stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/>
          </linearGradient></defs>
        </svg>
        <span>Procurement<strong>Host</strong></span>
      </a>
      <nav class="nav-links" id="navLinks" aria-label="Navigasi utama">
        <div class="nav-menu">${navItems}
        <button class="theme-btn" id="themeBtn" aria-label="Ganti mode gelap/terang" title="Mode gelap/terang">🌙</button>
        <a href="keranjang.html" class="cart-link" id="cartLink" aria-label="Keranjang belanja" title="Keranjang">
          🛒<span class="cart-badge" id="cartBadge" hidden>0</span>
        </a>
        </div>
        <div class="nav-actions">
        <span class="nav-auth" id="navAuth"></span>
        <span class="lang-switch notranslate" id="langSwitch" translate="no">
          <button class="lang-btn" id="langBtn" aria-label="Pilih bahasa" aria-haspopup="true" aria-expanded="false">
            <img id="langFlag" class="lang-flag" alt="" width="22" height="22" />
            <span class="lang-code" id="langCode">ID</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="lang-panel" id="langPanel" role="menu">
            <div class="lang-head">Pilih lokasi & bahasa</div>
            <div class="lang-search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input id="langSearch" placeholder="Cari" autocomplete="off" />
            </div>
            <div class="lang-list" id="langList"></div>
          </div>
        </span>
        </div>
      </nav>
      <button class="nav-toggle" id="navToggle" aria-label="Buka menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>`;
  }

  function footerHTML() {
    return `
    <div class="container footer-grid">
      <div>
        <a href="index.html" class="logo logo-light">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect width="24" height="24" rx="6" fill="url(#lgf)"/>
            <g transform="translate(2.6,2.4) scale(0.78)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </g>
            <defs><linearGradient id="lgf" x1="0" y1="0" x2="24" y2="24">
              <stop stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/>
            </linearGradient></defs>
          </svg>
          <span>Procurement<strong>Host</strong></span>
        </a>
        <p class="foot-desc">Hosting cepat & andal untuk semua orang. Dibuat dengan ❤️ di Indonesia.</p>
      </div>
      <div>
        <h4>Produk</h4>
        <a href="index.html#harga">Web Hosting</a>
        <a href="hosting-wordpress.html">Hosting WordPress</a>
        <a href="cloud-hosting.html">Cloud Hosting</a>
        <a href="email-hosting.html">Email Hosting</a>
        <a href="vps.html">VPS &amp; Cloud</a>
        <a href="dedicated.html">Dedicated Server</a>
        <a href="domain.html">Domain</a>
        <a href="index.html#fitur">Fitur</a>
        <a href="tes-kecepatan.html">Tes Kecepatan</a>
        <a href="status.html">Status Sistem</a>
      </div>
      <div>
        <h4>Perusahaan</h4>
        <a href="tentang.html">Tentang Kami</a>
        <a href="blog.html">Blog</a>
        <a href="bantuan.html">Pusat Bantuan</a>
        <a href="kontak.html">Kontak</a>
        <a href="afiliasi.html">Program Afiliasi</a>
      </div>
      <div>
        <h4>Akun</h4>
        <a href="masuk.html">Masuk</a>
        <a href="daftar.html">Daftar</a>
        <a href="dashboard.html">Dashboard</a>
      </div>
    </div>
    <div class="container foot-bottom">
      <p>© <span id="year"></span> ${BRAND}. Seluruh hak cipta dilindungi. <span class="foot-demo">· Website demo untuk pembelajaran.</span></p>
      <nav class="foot-legal" aria-label="Tautan legal">
        <a href="syarat.html">Syarat &amp; Ketentuan</a>
        <a href="privasi.html">Kebijakan Privasi</a>
        <a href="kontak.html">Kontak</a>
      </nav>
    </div>`;
  }

  function renderChrome() {
    const h = $('#site-header'); if (h) { h.className = 'header'; h.id = 'header'; h.innerHTML = headerHTML(); }
    const f = $('#site-footer'); if (f) { f.className = 'footer'; f.innerHTML = footerHTML(); }
    const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }

  /* ===== Navbar: tampilkan status login ===== */
  // Perbarui badge jumlah item di keranjang (dipanggil saat load & setelah ubah keranjang)
  function renderCart() {
    const badge = $('#cartBadge'); if (!badge) return;
    const n = Cart.count();
    badge.textContent = n;
    badge.hidden = n === 0;
  }
  window.addEventListener('nh-cart-change', renderCart);

  // Tombol "Tambah ke Keranjang" di halaman mana pun: <button data-cart-add="vps-pro" data-cart-cycle="monthly">
  function initCartButtons() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cart-add]');
      if (!btn) return;
      e.preventDefault();
      const plan = btn.getAttribute('data-cart-add');
      const cycle = btn.getAttribute('data-cart-cycle') || 'monthly';
      if (!PLANS[plan]) return;
      Cart.add(plan, cycle);
      toast(`${PLANS[plan].name} ditambahkan ke keranjang. 🛒`);
    });
  }

  function renderNavAuth() {
    const el = $('#navAuth'); if (!el) return;
    const u = Auth.current();
    if (u) {
      const initials = u.name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
      el.innerHTML = `
        <div class="acct" id="acct">
          <button class="acct-btn" id="acctBtn" aria-haspopup="true" aria-expanded="false">
            <span class="acct-ava">${initials}</span>
            <span class="acct-name">${u.name.split(' ')[0]}</span> ▾
          </button>
          <div class="acct-menu" id="acctMenu" role="menu">
            <a href="dashboard.html" role="menuitem">📊 Dashboard</a>
            <a href="dashboard.html#profil" role="menuitem">👤 Profil Saya</a>
            <a href="index.html#harga" role="menuitem">➕ Pesan Layanan</a>
            <button id="logoutBtn" role="menuitem">🚪 Keluar</button>
          </div>
        </div>`;
      const btn = $('#acctBtn'), menu = $('#acctMenu');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = $('#acct').classList.toggle('open');
        btn.setAttribute('aria-expanded', open);
      });
      document.addEventListener('click', () => { $('#acct')?.classList.remove('open'); });
      $('#logoutBtn').addEventListener('click', () => {
        Auth.logout(); toast('Anda telah keluar. Sampai jumpa! 👋');
        setTimeout(() => location.href = 'index.html', 700);
      });
    } else {
      el.innerHTML = `
        <a href="masuk.html" class="nav-login">Masuk</a>
        <a href="daftar.html" class="btn btn-primary btn-sm">Daftar Gratis</a>`;
    }
  }

  /* =====================================================================
     3. INTERAKSI UMUM (menu HP, scroll, to-top, reveal, counter)
     ===================================================================== */
  function wireNav() {
    const header = $('#header'), navToggle = $('#navToggle'), navLinks = $('#navLinks');
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        navToggle.classList.toggle('open', open);
        navToggle.setAttribute('aria-expanded', open);
      });
      navLinks.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => {
          navLinks.classList.remove('open');
          navToggle.classList.remove('open');
        }));
    }
    let toTop = $('#toTop');
    if (!toTop) {
      toTop = document.createElement('button');
      toTop.id = 'toTop'; toTop.className = 'to-top'; toTop.setAttribute('aria-label', 'Kembali ke atas');
      toTop.textContent = '↑';
      document.body.appendChild(toTop);
    }
    const onScroll = () => {
      if (header) header.classList.toggle('scrolled', window.scrollY > 10);
      if (toTop) toTop.classList.toggle('show', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function wireReveal() {
    const revealEls = $$('.reveal'), counters = $$('[data-count]');
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('visible'));
      counters.forEach(animateCount);
      return;
    }
    const io = new IntersectionObserver((es, o) => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); o.unobserve(e.target); }
    }), { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));

    const co = new IntersectionObserver((es, o) => es.forEach(e => {
      if (e.isIntersecting) { animateCount(e.target); o.unobserve(e.target); }
    }), { threshold: 0.4 });
    counters.forEach(el => co.observe(el));
  }

  function animateCount(el) {
    const target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '';
    const isFloat = !Number.isInteger(target), start = performance.now(), dur = 1400;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      let v = target * eased;
      v = isFloat ? v.toFixed(1) : Math.floor(v).toLocaleString('id-ID');
      el.textContent = v + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = (isFloat ? target.toFixed(1) : target.toLocaleString('id-ID')) + suffix;
    };
    requestAnimationFrame(step);
  }

  /* =====================================================================
     4. DARK MODE
     ===================================================================== */
  function initTheme() {
    const saved = store.get('nh_theme', 'light');
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeBtn(saved);
    document.addEventListener('click', (e) => {
      if (e.target.closest('#themeBtn')) {
        const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', cur);
        store.set('nh_theme', cur);
        updateThemeBtn(cur);
      }
    });
  }
  function updateThemeBtn(mode) { const b = $('#themeBtn'); if (b) b.textContent = mode === 'dark' ? '☀️' : '🌙'; }

  /* =====================================================================
     5. NOTIFIKASI TOAST
     ===================================================================== */
  function toast(msg, type = 'success') {
    let wrap = $('#toastWrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toastWrap'; wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = 'toast toast-' + type;
    const icon = type === 'error' ? '⚠️' : type === 'info' ? 'ℹ️' : '✅';
    t.innerHTML = `<span>${icon}</span><p>${msg}</p>`;
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3600);
  }

  /* =====================================================================
     5b. MODAL (dialog konfirmasi serbaguna)
     ===================================================================== */
  // opts: { title, body (HTML string), actions:[{label, variant, onClick(close, root)}] }
  function modal({ title = '', body = '', actions = [] } = {}) {
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-label="${title}">
        <div class="modal-head"><h3>${title}</h3><button class="modal-x" aria-label="Tutup">✕</button></div>
        <div class="modal-body">${body}</div>
        <div class="modal-foot"></div>
      </div>`;
    document.body.appendChild(back);
    const close = () => { back.classList.remove('show'); setTimeout(() => back.remove(), 220); };
    const foot = back.querySelector('.modal-foot');
    actions.forEach(a => {
      const b = document.createElement('button');
      b.className = 'btn btn-sm ' + (a.variant || 'btn-outline');
      b.textContent = a.label;
      b.addEventListener('click', () => a.onClick ? a.onClick(close, back) : close());
      foot.appendChild(b);
    });
    back.querySelector('.modal-x').addEventListener('click', close);
    back.addEventListener('click', (e) => { if (e.target === back) close(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
    requestAnimationFrame(() => back.classList.add('show'));
    return { root: back, close };
  }

  /* =====================================================================
     6. BANNER COOKIE
     ===================================================================== */
  function initCookie() {
    if (store.get('nh_cookie', false)) return;
    const bar = document.createElement('div');
    bar.className = 'cookie';
    bar.innerHTML = `
      <p>🍪 Kami menggunakan cookie untuk meningkatkan pengalaman Anda. Dengan melanjutkan, Anda setuju dengan kebijakan kami.</p>
      <div class="cookie-act">
        <button class="btn btn-sm btn-outline" id="ckReject">Tolak</button>
        <button class="btn btn-sm btn-primary" id="ckAccept">Setuju</button>
      </div>`;
    document.body.appendChild(bar);
    requestAnimationFrame(() => bar.classList.add('show'));
    const close = (accepted) => { store.set('nh_cookie', true); bar.classList.remove('show'); setTimeout(() => bar.remove(), 300); if (accepted) toast('Preferensi cookie disimpan.', 'info'); };
    $('#ckAccept').addEventListener('click', () => close(true));
    $('#ckReject').addEventListener('click', () => close(false));
  }

  /* =====================================================================
     7. WHATSAPP + LIVE CHAT
     ===================================================================== */
  function initWidgets() {
    const dock = document.createElement('div');
    dock.className = 'fab-dock';
    dock.innerHTML = `
      <a class="fab fab-wa" href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener" aria-label="Chat WhatsApp" title="Chat via WhatsApp">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zM6.6 20.1c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.82 9.82 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
      </a>
      <button class="ai-fab" id="aiFab" aria-label="Buka Tanya AI" title="Tanya AI">
        <svg class="ai-spark" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.7 5.1L19 9l-5.3 1.9L12 16l-1.7-5.1L5 9l5.3-1.9L12 2z"/></svg>
        <span>Tanya AI</span>
      </button>`;
    document.body.appendChild(dock);

    const box = document.createElement('div');
    box.className = 'chatbox ai-box'; box.id = 'chatbox';
    box.innerHTML = `
      <div class="chat-head ai-head">
        <div class="ai-title"><span class="ai-ava">✦</span><div><strong>Tanya AI</strong><small><span class="chat-dot"></span> Asisten ${BRAND}</small></div></div>
        <button id="chatClose" aria-label="Tutup">✕</button>
      </div>
      <div class="chat-body" id="chatBody">
        <div class="chat-msg bot">Halo! 👋 Saya <strong>Tanya AI</strong>, asisten ${BRAND}. Tanya apa saja seputar hosting, harga, domain, atau cara pesan ya. 😊</div>
      </div>
      <div class="chat-quick" id="chatQuick">
        <button data-q="Berapa harga paketnya?">💰 Harga</button>
        <button data-q="Bagaimana cara pesan hosting?">🛒 Cara pesan</button>
        <button data-q="Bagaimana cara beli domain?">🌐 Domain</button>
      </div>
      <form class="chat-input" id="chatForm" autocomplete="off">
        <input type="text" id="chatText" placeholder="Tulis pertanyaanmu…" aria-label="Tulis pertanyaan" />
        <button type="submit" aria-label="Kirim pertanyaan">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>`;
    document.body.appendChild(box);

    const body = $('#chatBody');
    const open = () => { box.classList.add('open'); $('#aiFab').classList.add('hide'); setTimeout(() => $('#chatText').focus(), 150); };
    const close = () => { box.classList.remove('open'); $('#aiFab').classList.remove('hide'); };
    $('#aiFab').addEventListener('click', open);
    $('#chatClose').addEventListener('click', close);

    const addMsg = (html, who) => {
      body.insertAdjacentHTML('beforeend', `<div class="chat-msg ${who}">${html}</div>`);
      body.scrollTop = body.scrollHeight;
    };
    const ask = (text) => {
      addMsg(text.replace(/</g, '&lt;'), 'user');
      const typing = document.createElement('div');
      typing.className = 'chat-msg bot typing';
      typing.innerHTML = '<span></span><span></span><span></span>';
      body.appendChild(typing); body.scrollTop = body.scrollHeight;
      setTimeout(() => { typing.remove(); addMsg(getAIReply(text), 'bot'); }, 650 + Math.min(text.length * 18, 900));
    };

    $$('#chatQuick button').forEach(b => b.addEventListener('click', () => ask(b.dataset.q)));
    $('#chatForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const t = $('#chatText').value.trim();
      if (!t) return;
      $('#chatText').value = '';
      ask(t);
    });
  }

  // Otak "Tanya AI" — menjawab berdasarkan kata kunci (gratis, tanpa server)
  function getAIReply(text) {
    const t = ' ' + text.toLowerCase() + ' ';
    const has = (...words) => words.some(w => t.includes(w));

    if (has('halo', 'hai', 'hello', 'assalam', 'pagi', 'siang', 'sore', 'malam'))
      return 'Halo juga! 😊 Ada yang bisa saya bantu? Tanya soal harga, paket, domain, pembayaran, atau cara pesan ya.';
    if (has('harga', 'biaya', 'tarif', 'paket', 'berapa', 'murah', 'price'))
      return 'Pilihan paket kami:<br>• <strong>Pemula</strong> — Rp15.000/bln<br>• <strong>Bisnis</strong> — Rp45.000/bln (terpopuler ⭐)<br>• <strong>Premium</strong> — Rp99.000/bln<br>Hemat 20% bila bayar tahunan. Lihat <a href="index.html#harga">halaman Harga</a> 👉';
    if (has('domain', '.com', '.id', '.net', '.store'))
      return 'Untuk domain, ketik nama impianmu di kotak pencarian <a href="index.html#beranda">beranda</a> untuk cek ketersediaan. Harga: .com Rp149.000/thn, .id Rp220.000/thn, .store Rp99.000/thn. 🌐';
    if (has('pesan', 'beli', 'order', 'checkout', 'langganan', 'berlangganan'))
      return 'Cara pesan hosting:<br>1) Buka <a href="index.html#harga">Harga</a><br>2) Klik "Pilih" pada paket<br>3) Atur siklus & domain<br>4) Login / daftar<br>5) Bayar → layanan langsung aktif di dashboard! 🛒';
    if (has('login', 'masuk', 'akun', 'daftar', 'register', 'google', 'sign'))
      return 'Kamu bisa <a href="daftar.html">Daftar</a> atau <a href="masuk.html">Masuk</a> pakai email & sandi, atau <strong>Login dengan Google</strong> (tombol G di halaman masuk). Cepat & aman. 🔐';
    if (has('bayar', 'pembayaran', 'payment', 'transfer', 'qris', 'wallet', 'gopay', 'ovo', 'dana', 'kartu'))
      return 'Metode pembayaran: QRIS / e-wallet (GoPay, OVO, Dana), transfer bank (BCA, Mandiri, BNI), dan kartu kredit/debit. 💳';
    if (has('ssl', 'aman', 'keamanan', 'secure', 'https', 'backup', 'firewall', 'ddos'))
      return 'Semua paket termasuk <strong>SSL gratis</strong>, firewall + anti-DDoS, dan <strong>backup harian otomatis</strong>. Website-mu aman terlindungi. 🔒';
    if (has('uptime', 'cepat', 'kecepatan', 'nvme', 'ngebut', 'lambat', 'down', 'speed'))
      return 'Kami pakai server <strong>NVMe super cepat</strong> dengan <strong>uptime 99.9%</strong> — website ngebut & jarang down. ⚡';
    if (has('garansi', 'refund', 'uang kembali', 'batal', 'cancel'))
      return 'Ada <strong>garansi uang kembali 30 hari</strong>. Kalau tidak puas, dana kembali penuh tanpa ribet. 💯';
    if (has('migrasi', 'pindah', 'migrate'))
      return 'Migrasi website dari penyedia lama <strong>GRATIS</strong> dan dibantu tim kami, tanpa downtime. 🚚';
    if (has('kontak', 'hubungi', ' cs ', 'customer', 'whatsapp', ' wa ', 'email', 'telepon', 'manusia', 'admin', 'bantuan'))
      return 'Hubungi tim kami via WhatsApp (tombol hijau 🟢), email <a href="mailto:halo@procurementhost.id">halo@procurementhost.id</a>, atau <a href="bantuan.html">Pusat Bantuan</a>. Respon < 5 menit! ⚡';
    if (has('terima kasih', 'makasih', 'thanks', 'thx', 'mantap', 'sip', 'oke', 'keren'))
      return 'Sama-sama! 😊 Senang bisa membantu. Ada lagi yang mau ditanyakan?';
    if (has('siapa', 'kamu', 'bot', 'robot', 'nama'))
      return `Saya <strong>Tanya AI</strong> — asisten virtual ${BRAND} yang siap membantu 24 jam seputar hosting & domain. 🤖`;

    return 'Hmm, saya belum punya jawaban pasti untuk itu. 🙏 Coba tanya soal <strong>harga, paket, domain, cara pesan, pembayaran, keamanan,</strong> atau <strong>uptime</strong>. Untuk hal lain, tim manusia kami siap di <a href="bantuan.html">Pusat Bantuan</a> / WhatsApp. 😊';
  }

  /* =====================================================================
     7b. PEMILIH BAHASA (language switcher) + Google Translate
     ===================================================================== */
  const LANGS = [
    { code: 'id',    short: 'ID', cc: 'id', name: 'Indonesia',      sub: 'Bahasa Indonesia' },
    { code: 'en',    short: 'EN', cc: 'gb', name: 'English',        sub: 'English' },
    { code: 'ar',    short: 'AR', cc: 'sa', name: 'العربية',        sub: 'Arabic' },
    { code: 'zh-CN', short: 'ZH', cc: 'cn', name: '中文',            sub: 'Chinese' },
    { code: 'ja',    short: 'JA', cc: 'jp', name: '日本語',          sub: 'Japanese' },
    { code: 'ko',    short: 'KO', cc: 'kr', name: '한국어',          sub: 'Korean' },
    { code: 'es',    short: 'ES', cc: 'es', name: 'Español',        sub: 'Spanish' },
    { code: 'fr',    short: 'FR', cc: 'fr', name: 'Français',       sub: 'French' },
    { code: 'de',    short: 'DE', cc: 'de', name: 'Deutsch',        sub: 'German' },
    { code: 'pt',    short: 'PT', cc: 'br', name: 'Português',      sub: 'Portuguese' },
    { code: 'ru',    short: 'RU', cc: 'ru', name: 'Русский',        sub: 'Russian' },
    { code: 'hi',    short: 'HI', cc: 'in', name: 'हिन्दी',          sub: 'Hindi' },
    { code: 'th',    short: 'TH', cc: 'th', name: 'ไทย',            sub: 'Thai' },
    { code: 'vi',    short: 'VI', cc: 'vn', name: 'Tiếng Việt',     sub: 'Vietnamese' },
    { code: 'ms',    short: 'MS', cc: 'my', name: 'Bahasa Melayu',  sub: 'Malay' },
    { code: 'it',    short: 'IT', cc: 'it', name: 'Italiano',       sub: 'Italian' },
    { code: 'nl',    short: 'NL', cc: 'nl', name: 'Nederlands',     sub: 'Dutch' },
    { code: 'tr',    short: 'TR', cc: 'tr', name: 'Türkçe',         sub: 'Turkish' },
    { code: 'fil',   short: 'FIL',cc: 'ph', name: 'Filipino',       sub: 'Filipino' },
  ];
  const flagURL = (cc) => `https://flagcdn.com/w40/${cc}.png`;

  function initLang() {
    const wrap = $('#langSwitch'); if (!wrap) return;
    const cur = store.get('nh_lang', 'id');
    const curLang = LANGS.find(l => l.code === cur) || LANGS[0];
    $('#langFlag').src = flagURL(curLang.cc);
    $('#langCode').textContent = curLang.short;

    const list = $('#langList');
    list.innerHTML = LANGS.map(l => `
      <button class="lang-item${l.code === cur ? ' active' : ''}" data-code="${l.code}" data-text="${(l.name + ' ' + l.sub + ' ' + l.code).toLowerCase()}">
        <img class="li-flag" src="${flagURL(l.cc)}" alt="" width="24" height="24" loading="lazy">
        <span class="li-name">${l.name}</span>
        <span class="li-sub">${l.sub}</span>
      </button>`).join('');

    const btn = $('#langBtn'), panel = $('#langPanel');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      if (open) setTimeout(() => $('#langSearch').focus(), 60);
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('#langSwitch')) wrap.classList.remove('open'); });

    $('#langSearch').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      list.querySelectorAll('.lang-item').forEach(it => {
        it.style.display = it.dataset.text.includes(q) ? '' : 'none';
      });
    });

    list.querySelectorAll('.lang-item').forEach(it => it.addEventListener('click', () => {
      const code = it.dataset.code;
      store.set('nh_lang', code);
      if (code === 'id') document.cookie = 'googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      else document.cookie = 'googtrans=/id/' + code + ';path=/';
      location.reload();
    }));

    // Muat Google Translate sekali (mesin penerjemah di belakang layar)
    if (!window.__gtLoaded) {
      window.__gtLoaded = true;
      let gdiv = document.getElementById('google_translate_element');
      if (!gdiv) { gdiv = document.createElement('div'); gdiv.id = 'google_translate_element'; gdiv.style.display = 'none'; document.body.appendChild(gdiv); }
      window.googleTranslateElementInit = function () {
        new google.translate.TranslateElement({ pageLanguage: 'id', autoDisplay: false }, 'google_translate_element');
      };
      const s = document.createElement('script');
      s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(s);
    }
  }

  /* =====================================================================
     8. INISIALISASI
     ===================================================================== */
  // Favicon (ikon tab) untuk semua halaman
  if (!document.querySelector('link[rel="icon"]')) {
    const fav = document.createElement('link');
    fav.rel = 'icon'; fav.type = 'image/svg+xml'; fav.href = 'favicon.svg';
    document.head.appendChild(fav);
  }

  // PWA: manifest, warna tema (address bar HP), & ikon iOS — disuntik ke semua halaman
  if (!document.querySelector('link[rel="manifest"]')) {
    const mani = document.createElement('link'); mani.rel = 'manifest'; mani.href = 'manifest.json'; document.head.appendChild(mani);
    const tcol = document.createElement('meta'); tcol.name = 'theme-color'; tcol.content = '#6366f1'; document.head.appendChild(tcol);
    const atch = document.createElement('link'); atch.rel = 'apple-touch-icon'; atch.href = 'icon-192.png'; document.head.appendChild(atch);
  }

  // Daftarkan Service Worker (offline/PWA) — hanya di http/https, bukan saat dibuka file://
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  initTheme(); // sebelum render agar tidak berkedip
  document.addEventListener('DOMContentLoaded', () => {
    renderChrome();
    renderNavAuth();
    renderCart();
    initCartButtons();
    initLang();
    wireNav();
    wireReveal();
    initCookie();
    initWidgets();
  });

  /* ===== Ekspor ke global agar halaman lain bisa pakai ===== */
  window.NH = { Auth, Services, Billing, Cart, Tickets, PLANS, COUPONS, PPN_RATE, toast, modal, rp, store, $, $$, PAGE, GOOGLE_CLIENT_ID };
})();
