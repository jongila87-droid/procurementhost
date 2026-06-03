# 🔐 Panduan Mengaktifkan "Login dengan Google"

Kodenya sudah aku siapkan lengkap. Kamu **cukup melakukan 3 hal**:
1. Membuat **Client ID** di Google (gratis, ±5 menit)
2. Menempelkannya ke **1 baris** di file `app.js`
3. Membuka website lewat **alamat resmi** (localhost / domain), bukan klik file

Ikuti langkah di bawah pelan-pelan. 😊

---

## ⚠️ Hal paling penting untuk dipahami dulu

Login Google **TIDAK BISA** jalan kalau website dibuka dengan cara **klik dua kali
file `index.html`** (alamatnya `file:///D:/...`). Google menolak alamat seperti itu.

Website harus dibuka lewat **alamat web (http)**, contohnya:
- Saat latihan di komputer: `http://localhost:8000`
- Saat sudah online: `https://namasitusmu.netlify.app`

Cara menjalankan di `localhost` (latihan):
1. Buka folder `hosting` ini di terminal / CMD.
2. Ketik: `python -m http.server 8000`
3. Buka browser ke: **http://localhost:8000**

> Ingat angka port-nya (di contoh ini **8000**) — nanti dipakai di Langkah 4.

---

## 🪪 LANGKAH 1 — Buat Project di Google Cloud

1. Buka **https://console.cloud.google.com/**
2. Login dengan akun Google-mu.
3. Di bagian atas, klik dropdown project → **"New Project"**.
4. Beri nama, misal `ProcurementHost`, lalu **Create**.
5. Pastikan project itu yang terpilih (lihat dropdown atas).

---

## 🛡️ LANGKAH 2 — Atur "OAuth consent screen"

Ini layar persetujuan yang dilihat pengguna saat login.

1. Menu kiri (☰) → **APIs & Services** → **OAuth consent screen**.
2. Pilih **External** → **Create**.
3. Isi yang wajib (bertanda *):
   - **App name**: `ProcurementHost`
   - **User support email**: email kamu
   - **Developer contact email**: email kamu
4. **Save and Continue** sampai selesai (langkah Scopes & lainnya boleh dilewati saja).
5. Di bagian **Test users** → **Add Users** → masukkan **email Google-mu sendiri**.
   > Penting! Selama aplikasi masih "Testing", hanya email yang didaftarkan di sini
   > yang boleh login. Tambahkan email kamu (dan teman yang mau coba).

---

## 🔑 LANGKAH 3 — Buat "OAuth Client ID"

1. Menu kiri → **APIs & Services** → **Credentials**.
2. Klik **+ Create Credentials** → **OAuth client ID**.
3. **Application type**: pilih **Web application**.
4. **Name**: bebas, misal `Web ProcurementHost`.

---

## 🌐 LANGKAH 4 — Daftarkan Alamat Website (paling sering salah!)

Masih di layar yang sama, di bagian **Authorized JavaScript origins**, klik
**+ Add URI** dan masukkan SEMUA alamat tempat website akan dibuka:

| Untuk apa            | Isi dengan                          |
|----------------------|-------------------------------------|
| Latihan di localhost | `http://localhost:8000`             |
| (jika port lain)     | `http://localhost:5500` dll         |
| Sudah online (nanti) | `https://namasitusmu.netlify.app`   |

> Tulis **tanpa garis miring di akhir**. Sesuaikan port (8000) dengan yang kamu
> pakai di terminal. Kalau nanti deploy ke Netlify, tambahkan juga URL Netlify-nya.

Lalu klik **Create**.

---

## 📋 LANGKAH 5 — Salin Client ID

Setelah Create, muncul popup berisi **Client ID**, bentuknya seperti:

```
1234567890-abc123def456.apps.googleusercontent.com
```

**Salin (copy)** teks itu. (Yang dipakai hanya Client ID; Client Secret tidak perlu.)

---

## ✏️ LANGKAH 6 — Tempel ke `app.js`

1. Buka file **`app.js`** (pakai VS Code / Notepad).
2. Cari baris ini (ada di bagian atas):

   ```js
   const GOOGLE_CLIENT_ID = ''; // <-- ISI DI SINI
   ```

3. Tempel Client ID di antara tanda kutip, jadi seperti:

   ```js
   const GOOGLE_CLIENT_ID = '1234567890-abc123def456.apps.googleusercontent.com';
   ```

4. **Simpan** file.

---

## ✅ LANGKAH 7 — Coba!

1. Jalankan server: `python -m http.server 8000`
2. Buka **http://localhost:8000/masuk.html**
3. Klik tombol **G** (Google).
4. Pilih akun Google-mu → kamu langsung masuk ke dashboard. 🎉

---

## 🆘 Kalau Masih Gagal — Cek Ini

- **"Error 400: redirect_uri_mismatch" / origin tidak diizinkan**
  → Alamat di browser (mis. `http://localhost:8000`) **harus sama persis** dengan
  yang didaftarkan di Langkah 4 (termasuk port). Perubahan bisa butuh beberapa menit.
- **"Access blocked / app belum diverifikasi"**
  → Email yang kamu pakai login belum ditambahkan sebagai **Test user** (Langkah 2.5).
- **Tombol tidak bereaksi**
  → Pastikan kamu buka lewat `http://localhost`, **bukan** `file:///`.
- **Tetap muncul pesan "belum dikonfigurasi"**
  → Berarti `GOOGLE_CLIENT_ID` di `app.js` masih kosong / salah tempel / belum disimpan.

---

## 💡 Catatan

- Ini login Google **sungguhan** (memakai layanan resmi Google Identity Services).
  Saat berhasil, nama & email Google-mu otomatis dibuatkan akun di website ini
  dan kamu langsung masuk dashboard.
- Karena website ini masih **statis (tanpa server backend)**, profil hanya disimpan
  di browser. Untuk aplikasi produksi sungguhan, token Google sebaiknya juga
  diverifikasi di sisi server — itu tahap lanjutan berikutnya.

Selamat mencoba! Kalau bingung di satu langkah, kirim screenshot-nya ke aku. 🙌
