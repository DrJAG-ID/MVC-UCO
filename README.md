# UCO Presence System - MVC (Multi View Controller) Demonstration

Demonstrasi sistem absensi real-life dengan arsitektur MVC (Model View Controller), pengecekan keaslian fisik (liveness check) berbasis ucapan 5 digit angka acak dalam bahasa Indonesia, kamera depan, integrasi API Flask Python (Gunicorn port 35553), dan database SQLite3 `dataabsen.sqlite`.

---

## 1. Arsitektur MVC (Multi View Controller)

- **Model**:
  - Database: `dataabsen.sqlite` (SQLite3).
  - Tabel `main-absence`: `[no, usernumber/ID, real name, thumbnail photo, date stamp]`
  - Tabel `init-absence`: `[no, usernumber/ID, real name, thumbnail photo, date stamp, status]`
  - Model Pengguna: `users` (status inisialisasi, otorisasi peran pengguna/admin).
- **View**:
  - Desain responsif untuk ponsel 5"-7", tablet 12"-14", dan monitor laptop/desktop 12"-20".
  - Skema warna: Gradasi Biru (Red=63, Green=72, Blue=204) ke Biru Muda (Red=230, Green=231, Blue=249).
  - Garis aksen/border: Warna solid jingga terang/lime (Red=233, Green=251, Blue=102).
  - Tampilan UI/UX ringkas dengan info tooltip icon dan penamaan tombol singkat (*Masuk, Batal, Ambil Foto, Kirim, Ubah, Hapus, Setuju*).
  - Halaman:
    1. **Login Page** (`/logindepan`): Login pengguna & admin dengan deteksi status inisialisasi.
    2. **Absence Page**: Liveness check 5 digit acak (regenerasi 15 detik), Web Speech API bahasa Indonesia, kamera depan, tombol Batal ('X'), simpan ke `main-absence`.
    3. **Initialization Page** (`/init-absence`): Format ID otomatis `YYYYMMDD-XYZ`, pengambilan foto canvas, simpan ke `init-absence`.
    4. **Admin Pages**:
       - Approval Initializations (`/appsinit`): Tabel & CRUD inisialisasi pendaftaran.
       - Data Absence Process (`/databsen`): Tabel & CRUD data presensi harian.
    5. **Flask API & Docker Console**: Pengujian endpoint langsung, log debugging, dan viewer kode.
- **Controller**:
  - Controller Liveness: Logika pencocokan pengucapan angka Indonesia (1="satu", 2="dua", 3="tiga", 4="empat", 5="lima", 6="enam", 7="tujuh", 8="delapan", 9="sembilan", 0="nol"/"null").
  - Controller Kamera: Stream media kamera depan (`facingMode: "user"`) & render capture canvas.
  - Controller API: Dispatch request REST Flask ke database SQLite.

---

## 2. GitHub Model (Push & Pull)

```bash
# 1. Mengambil kode terbaru dari GitHub (Pull)
git checkout main
git pull origin main

# 2. Membuat branch fitur baru
git checkout -b feature/liveness-indonesia-port35553

# 3. Menjalankan container Docker
docker compose up -d --build

# 4. Melakukan commit dan push ke remote repository (Push)
git add .
git commit -m "feat(mvc): implement real-life absence with Indonesian liveness and Gunicorn port 35553"
git push origin feature/liveness-indonesia-port35553
```

---

## 3. Menjalankan dengan Docker & YAML Configuration

Konfigurasi YAML ada di `docker-compose.yml`:

```bash
# Build dan jalankan container
docker compose up --build -d

# Periksa status container
docker compose ps

# Periksa log Gunicorn
docker compose logs -f uco-flask-api
```

Layanan Flask akan berjalan dan melayani request di `http://localhost:35553`.

---

## 4. Spesifikasi Endpoint Flask Python (Port 35553)

1. `GET /` -> Mencetak `<h1>Hello, World! UCO DEMO </h1>`
2. `GET /logindepan` -> Memuat resource halaman login & landing page
3. `GET /appsinit` & `POST /appsinit` -> Penanganan persetujuan inisialisasi (CRUD tabel `init-absence`)
4. `GET /databsen` -> Mengambil data log presensi (tabel `main-absence`)
5. `POST /main-absence` -> Menyimpan presensi dari Absence-page ke `dataabsen.sqlite`
6. `POST /init-absence` -> Menerima input form pendaftaran ID `YYYYMMDD-XYZ`

## 5. Cek Wiki https://github.com/DrJAG-ID/MVC-UCO/wiki untuk demo preview login, user page, admin page, dan lainnya.
