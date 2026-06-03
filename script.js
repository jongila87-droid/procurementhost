/* ===================================================
   ProcurementHost — script.js
   Interaksi KHUSUS halaman utama (index.html).
   Bagian umum (menu, dark mode, chat, dll) ada di app.js
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Cek domain (simulasi) ---------- */
  const domainForm = document.getElementById('domainForm');
  const domainInput = document.getElementById('domainInput');
  const domainResult = document.getElementById('domainResult');

  if (domainForm) {
    domainForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let name = domainInput.value.trim().toLowerCase();
      domainResult.className = 'domain-result';

      if (!name) {
        domainResult.textContent = 'Silakan ketik nama domain dulu ya.';
        domainResult.classList.add('no');
        return;
      }
      name = name.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\s+/g, '');
      if (!name.includes('.')) name += '.com';

      const available = (name.length % 10) < 7; // simulasi ~70% tersedia
      if (available) {
        domainResult.innerHTML = `🎉 Selamat! <strong>${name}</strong> tersedia. <a href="checkout.html?plan=bisnis&domain=${encodeURIComponent(name)}" style="color:inherit;text-decoration:underline">Pesan sekarang →</a>`;
        domainResult.classList.add('ok');
      } else {
        domainResult.innerHTML = `😕 Maaf, <strong>${name}</strong> sudah dipakai. Coba nama lain.`;
        domainResult.classList.add('no');
      }
    });
  }

  /* ---------- Toggle harga Bulanan / Tahunan ---------- */
  const billingSwitch = document.getElementById('billingSwitch');
  const labelMonthly = document.getElementById('labelMonthly');
  const labelYearly = document.getElementById('labelYearly');
  const amounts = document.querySelectorAll('.amount');
  const formatRp = (n) => Number(n).toLocaleString('id-ID');

  if (billingSwitch) {
    billingSwitch.addEventListener('click', () => {
      const yearly = billingSwitch.getAttribute('aria-checked') !== 'true';
      billingSwitch.setAttribute('aria-checked', yearly);
      labelMonthly.classList.toggle('active', !yearly);
      labelYearly.classList.toggle('active', yearly);
      amounts.forEach(el => {
        el.textContent = formatRp(yearly ? el.dataset.yearly : el.dataset.monthly);
      });
    });
  }

  /* ---------- Akordion FAQ ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(it => {
        it.classList.remove('open');
        it.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Form kontak (simulasi) ---------- */
  const contactForm = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cName').value.trim();
      const email = document.getElementById('cEmail').value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !emailOk) {
        formMsg.textContent = '⚠️ Mohon isi nama dan email yang valid.';
        formMsg.style.color = '#fde047';
        return;
      }
      formMsg.textContent = `✅ Terima kasih, ${name}! Tim kami akan menghubungi Anda di ${email}.`;
      formMsg.style.color = '#fff';
      contactForm.reset();
      if (window.NH) window.NH.toast('Pesan terkirim! Kami akan menghubungi Anda. 📨');
    });
  }
});
