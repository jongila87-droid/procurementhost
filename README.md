# 🌐 ProcurementHost — Website Perusahaan Hosting (Multi-Halaman)

Website **perusahaan penyedia jasa hosting** yang lengkap dan terasa nyata,
dibuat dengan HTML, CSS, dan JavaScript murni (tanpa instalasi apa pun).

> **Apa maksudnya?** Ini "etalase toko" lengkap untuk perusahaan hosting —
> punya banyak halaman yang saling terhubung, sistem akun, dashboard pelanggan,
> dan proses checkout. Mirip situs Niagahoster / Hostinger versi mini.

---

## 🚀 Cara Membuka (paling gampang)

**Klik dua kali file `index.html`** → website terbuka di browser. Selesai! 🎉
Tidak perlu install apa pun.

> 💡 Beberapa browser membatasi fitur saat file dibuka langsung. Jika ingin
> pengalaman 100% mulus (seperti aslinya), jalankan server lokal sederhana:
> buka folder ini di terminal lalu ketik `python -m http.server`,
> kemudian buka `http://localhost:8000` di browser.

---

## 📄 Daftar Halaman

| File             | Halaman             | Isi                                                        |
|------------------|---------------------|------------------------------------------------------------|
| `index.html`     | 🏠 Beranda          | Hero, cari domain, fitur, harga, testimoni, FAQ, kontak    |
| `daftar.html`    | ✍️ Daftar           | Buat akun baru                                             |
| `masuk.html`     | 🔑 Masuk            | Login (+ tombol "Buat Akun Demo" instan)                  |
| `dashboard.html` | 📊 Dashboard        | Panel pelanggan: layanan, domain, tagihan, profil          |
| `checkout.html`  | 🛒 Checkout         | Pesan paket → pilih siklus → "bayar"                       |
| `tentang.html`   | ℹ️ Tentang Kami     | Cerita, misi, visi, tim                                    |
| `blog.html`      | 📝 Blog             | Daftar artikel                                            |
| `artikel.html`   | 📖 Artikel          | Contoh isi artikel                                        |
| `bantuan.html`   | 🤝 Pusat Bantuan    | FAQ + form tiket dukungan                                  |

## 🧠 File "Mesin" (jangan dihapus)

| File         | Fungsinya                                                            |
|--------------|---------------------------------------------------------------------|
| `app.js`     | Mesin bersama SEMUA halaman: header, footer, dark mode, chat, AKUN   |
| `script.js`  | Interaksi khusus halaman utama (cari domain, toggle harga, FAQ)      |
| `styles.css` | Semua tampilan/desain + mode gelap                                  |
| `favicon.svg`| Ikon kecil di tab browser                                           |

---

## ✨ Fitur "Seperti Website Asli"

- **Sistem akun beneran** — daftar & login; data tersimpan di browser
  (localStorage), jadi benar-benar diingat.
- **Dashboard pelanggan** — setelah login, lihat layanan aktif, domain,
  riwayat tagihan, dan edit profil.
- **Checkout** — pilih paket → siklus bulanan/tahunan → metode bayar →
  layanan langsung muncul di dashboard.
- 🌙 **Mode gelap** (tombol di navbar, pilihan diingat).
- 💬 **Live chat** mengambang + bot otomatis, dan tombol **WhatsApp**.
- 🔔 **Notifikasi toast** di setiap aksi.
- 🍪 **Banner cookie consent** seperti situs profesional.
- Navbar **berubah otomatis**: "Masuk/Daftar" → nama akun setelah login.
- **Responsif** penuh (HP, tablet, laptop).

### Coba cepat 👉
Buka `masuk.html` → klik **"Buat Akun Demo"** → Anda langsung masuk ke
dashboard. Lalu coba pesan paket lewat menu **Harga**.

---

## ✏️ Cara Mengubah Isi

- **Ganti nama brand / nomor WhatsApp** → buka `app.js` paling atas
  (`const BRAND` dan `const WA_NUMBER`).
- **Ubah harga paket** → di `app.js` bagian `const PLANS`.
- **Ubah warna tema** → di `styles.css` bagian `:root` (terang) dan
  `[data-theme="dark"]` (gelap).
- **Ubah teks halaman** → cari kalimatnya di file `.html` terkait.

Gunakan editor seperti **VS Code** untuk mengedit.

---

## ⚠️ Catatan Penting

Ini website **statis untuk demo/portofolio**. Artinya:

- Akun, pembayaran, pencarian domain, dan form adalah **simulasi** yang
  berjalan di browser Anda — belum benar-benar memproses uang, mengirim
  email, atau mendaftarkan domain. Untuk itu butuh server & backend.
- Data akun tersimpan **hanya di browser ini** (localStorage). Membuka di
  browser/komputer lain akan mulai dari kosong. Bisa direset lewat tombol
  "Hapus semua data demo" di Dashboard.

---

## 🌍 Cara Membuat Online (gratis, opsional)

Lewat **Netlify**:
1. Buka https://app.netlify.com → login.
2. **"Add new site" → "Deploy manually"**.
3. **Seret folder `hosting`** ke kotak yang muncul.
4. Beberapa detik kemudian website Anda dapat alamat online. 🎉

---

Dibuat dengan ❤️ — selamat belajar!
