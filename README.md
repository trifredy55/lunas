# LUNAS - Library UNSIA Networked Application System

LUNAS adalah aplikasi manajemen perpustakaan berbasis web yang digunakan untuk mendigitalisasi pengelolaan koleksi buku, data anggota, transaksi peminjaman dan pengembalian, autentikasi pengguna sistem, serta penyajian dashboard informasi. Project ini dibangun dengan arsitektur full-stack JavaScript menggunakan React di sisi frontend dan Node.js + Express di sisi backend, dengan MongoDB sebagai basis data melalui Mongoose.

Repository ini dikembangkan sebagai implementasi UAS Pemrograman Web II dengan judul resmi "Secure UNSIA Digital Library Dashboard". README ini berfungsi sebagai dokumentasi teknis utama repository dan disusun berdasarkan source code aktual pada project.

Repository: https://github.com/trifredy55/lunas

## Daftar Isi
- [1. Tentang LUNAS](#1-tentang-lunas)
- [2. Fitur Utama](#2-fitur-utama)
- [3. Hak Akses](#3-hak-akses)
- [4. Teknologi yang Digunakan](#4-teknologi-yang-digunakan)
- [5. Arsitektur Sistem](#5-arsitektur-sistem)
- [6. Alur Autentikasi](#6-alur-autentikasi)
- [7. Struktur Folder](#7-struktur-folder)
- [8. Desain Database](#8-desain-database)
- [9. REST API](#9-rest-api)
- [10. Contoh Request dan Response API](#10-contoh-request-dan-response-api)
- [11. HTTP Status dan Error Response](#11-http-status-dan-error-response)
- [12. Validasi Input](#12-validasi-input)
- [13. Keamanan Backend](#13-keamanan-backend)
- [14. Frontend](#14-frontend)
- [15. Dashboard dan Visualisasi](#15-dashboard-dan-visualisasi)
- [16. Pengujian API](#16-pengujian-api)
- [17. Pengujian Berhasil dan Gagal](#17-pengujian-berhasil-dan-gagal)
- [18. Screenshot Implementasi](#18-screenshot-implementasi)
- [19. Persyaratan Sistem](#19-persyaratan-sistem)
- [20. Instalasi](#20-instalasi)
- [21. Konfigurasi Environment](#21-konfigurasi-environment)
- [22. Menjalankan Aplikasi Lokal](#22-menjalankan-aplikasi-lokal)
- [23. Cara Menggunakan LUNAS](#23-cara-menggunakan-lunas)
- [24. Deployment dan Akses](#24-deployment-dan-akses)
- [25. Panduan Pemeriksaan untuk Dosen](#25-panduan-pemeriksaan-untuk-dosen)
- [26. Kendala dan Solusi](#26-kendala-dan-solusi)
- [27. Troubleshooting](#27-troubleshooting)
- [28. Catatan Keamanan](#28-catatan-keamanan)
- [29. Informasi Akademik](#29-informasi-akademik)
- [30. Status Implementasi](#30-status-implementasi)
- [31. Project Akademik](#31-project-akademik)

## 1. Tentang LUNAS

LUNAS merupakan singkatan dari Library UNSIA Networked Application System. Aplikasi ini dirancang untuk membantu pengelolaan data perpustakaan secara digital, mulai dari autentikasi pengguna aplikasi, pengelolaan buku, pengelolaan anggota, transaksi peminjaman dan pengembalian, hingga ringkasan informasi pada dashboard.

Ruang lingkup LUNAS berfokus pada manajemen operasional perpustakaan. Aplikasi ini bukan platform peminjaman e-book. Data yang dikelola adalah data koleksi buku fisik, data anggota perpustakaan, serta transaksi pinjam-kembali yang memengaruhi stok tersedia.

Pada implementasi aktual project ini, entitas `User` dan `Member` dipisahkan:
- `User` adalah akun yang digunakan untuk masuk ke sistem dan mengelola aplikasi.
- `Member` adalah anggota perpustakaan yang digunakan pada transaksi peminjaman.

Pemisahan tersebut penting karena seorang anggota perpustakaan tidak otomatis menjadi akun pengelola sistem, dan akun pengelola sistem tidak otomatis menjadi anggota perpustakaan.

## 2. Fitur Utama

### Authentication
- Register akun baru.
- Login akun aktif.
- Logout di sisi frontend dengan menghapus token dari local storage.
- Melihat data akun yang sedang login melalui `/api/auth/me`.
- Ubah password melalui halaman Pengaturan Akun.
- Approval akun baru oleh Super User sebelum akun dapat digunakan penuh.

### Buku
- Melihat daftar buku.
- Menambah data buku.
- Mengubah data buku.
- Menghapus data buku.
- Pengelolaan `availableStock` dilakukan oleh backend, bukan oleh input pengguna.

### Anggota
- Melihat daftar anggota.
- Menambah data anggota.
- Mengubah data anggota.
- Menghapus data anggota.

### Peminjaman
- Melihat daftar transaksi peminjaman.
- Menambah transaksi peminjaman baru.
- Mengembalikan buku.
- Mencegah peminjaman aktif ganda untuk kombinasi anggota dan buku yang sama.
- Mengurangi `availableStock` saat buku dipinjam.
- Menambah `availableStock` saat buku dikembalikan.

### Dashboard
- Menampilkan ringkasan total buku.
- Menampilkan ringkasan total anggota.
- Menampilkan ringkasan total peminjaman.
- Menampilkan ringkasan jumlah buku tersedia.
- Menampilkan Doughnut Chart distribusi buku berdasarkan kategori.

### Manajemen Pengguna
- Melihat daftar akun pengguna.
- Menyetujui akun dengan status `pending`.
- Menonaktifkan akun `active`.
- Mengaktifkan kembali akun `inactive`.
- Membatasi akses manajemen pengguna hanya untuk `superuser`.

## 3. Hak Akses

LUNAS menerapkan kontrol akses berbasis autentikasi JWT, status akun, dan role pengguna.

| Role | Hak Akses |
|---|---|
| `superuser` | Login ke sistem, mengakses seluruh halaman protected, mengelola buku, anggota, peminjaman, dashboard, pengaturan akun, serta membuka halaman `/users` untuk approval dan perubahan status akun pengguna. |
| `user` | Login ke sistem jika status `active`, mengakses halaman `/dashboard`, `/books`, `/members`, `/loans`, `/account`, tetapi tidak dapat mengakses `/users`. |

Status akun pada model `User`:

| Status | Makna |
|---|---|
| `pending` | Akun sudah terdaftar tetapi belum disetujui Super User. Login normal ditolak dengan HTTP 403. |
| `active` | Akun aktif dan dapat mengakses endpoint serta halaman protected sesuai role. |
| `inactive` | Akun dinonaktifkan oleh Super User. Login normal dan penggunaan token lama akan ditolak dengan HTTP 403. |

Implementasi frontend juga membedakan route:
- `ProtectedRoute` menjaga halaman yang hanya boleh dibuka pengguna terautentikasi dan berstatus aktif.
- `SuperUserRoute` menjaga halaman `/users` agar hanya dapat dibuka oleh pengguna dengan role `superuser`.

## 4. Teknologi yang Digunakan

| Bagian | Teknologi |
|---|---|
| Frontend | React.js, Vite |
| Routing frontend | React Router |
| HTTP client frontend | Axios |
| Visualisasi | Chart.js, react-chartjs-2 |
| UI pendukung | react-icons, SweetAlert2 |
| Backend | Node.js, Express.js |
| Database | MongoDB (dikonfigurasi melalui `MONGO_URI`) |
| ODM | Mongoose |
| Authentication | JSON Web Token (JWT) |
| Password hashing | bcryptjs |
| Security middleware | Helmet, CORS, express-rate-limit |
| Validasi input | express-validator |
| Konfigurasi environment | dotenv |

## 5. Arsitektur Sistem

Secara umum LUNAS menggunakan arsitektur client-server. Frontend React berfungsi sebagai antarmuka pengguna, sedangkan backend Express menyediakan REST API yang berkomunikasi dengan MongoDB melalui Mongoose.

```text
User / Browser
      |
      v
React.js + Vite
      |
    Axios
      |
      v
REST API Node.js + Express.js
      |
   Mongoose
      |
      v
 MongoDB
```

Alur autentikasi menggunakan JWT:

```text
Login
  |
  v
Validasi email dan password
  |
  v
Verifikasi password hash dengan bcryptjs
  |
  v
Cek status user (pending / active / inactive)
  |
  v
JWT dibuat
  |
  v
Token dikirim ke frontend
  |
  v
Frontend menyimpan token ke localStorage
  |
  v
Authorization: Bearer <token>
  |
  v
Protected endpoint diverifikasi oleh middleware auth
```

Frontend dan backend dijalankan terpisah. Frontend mengarah ke backend melalui `VITE_API_URL`, sementara backend mengizinkan origin frontend melalui `CLIENT_ORIGIN`.

## 6. Alur Autentikasi

### Register
1. Pengguna mengirim `name`, `email`, dan `password`.
2. Backend memvalidasi input menggunakan `express-validator`.
3. Email dinormalisasi ke lowercase.
4. Password di-hash menggunakan `bcrypt.hash(password, 10)`.
5. Data `User` disimpan dengan `role = 'user'` dan `status = 'pending'`.
6. Backend mengembalikan response sukses dan token kompatibilitas, tetapi akun belum dapat mengakses endpoint protected sebelum disetujui Super User.

### Login
1. Pengguna mengirim `email` dan `password`.
2. Backend memvalidasi input.
3. Backend mencari user berdasarkan email dan mengambil `passwordHash`.
4. Password diverifikasi menggunakan `bcrypt.compare()`.
5. Jika kredensial benar, backend memeriksa `status` user.
6. Hanya user dengan status `active` yang mendapatkan login sukses dan JWT.

### Protected request
1. Frontend menyimpan token ke local storage dengan key `lunas_token`.
2. Axios interceptor otomatis menambahkan header `Authorization: Bearer <token>`.
3. Middleware `protect` memverifikasi token dengan `jwt.verify()`.
4. Middleware mengambil data user dari database, memeriksa status aktif, lalu meneruskan request ke controller.

### Logout
LUNAS tidak memiliki endpoint logout di backend. Logout dilakukan di frontend dengan menghapus token dari local storage dan mengosongkan state autentikasi.

### Change password
Pengguna aktif dapat mengubah password melalui endpoint protected `/api/auth/change-password`. Setelah berhasil, frontend menghapus token dan meminta pengguna login kembali.

## 7. Struktur Folder

Struktur penting repository berdasarkan source code aktual:

```text
LUNAS/
|-- backend/
|   |-- scripts/
|   |   |-- cleanupFutureLoans.js
|   |   |-- migrateUserAccess.js
|   |   `-- seedDemoData.js
|   |-- src/
|   |   |-- config/
|   |   |   `-- db.js
|   |   |-- controllers/
|   |   |   |-- authController.js
|   |   |   |-- bookController.js
|   |   |   |-- dashboardController.js
|   |   |   |-- loanController.js
|   |   |   |-- memberController.js
|   |   |   `-- userController.js
|   |   |-- middleware/
|   |   |   |-- auth.js
|   |   |   |-- authorize.js
|   |   |   |-- errorHandler.js
|   |   |   |-- notFound.js
|   |   |   `-- rateLimiter.js
|   |   |-- models/
|   |   |   |-- Book.js
|   |   |   |-- Loan.js
|   |   |   |-- Member.js
|   |   |   `-- User.js
|   |   |-- routes/
|   |   |   |-- authRoutes.js
|   |   |   |-- bookRoutes.js
|   |   |   |-- dashboardRoutes.js
|   |   |   |-- loanRoutes.js
|   |   |   |-- memberRoutes.js
|   |   |   `-- userRoutes.js
|   |   |-- utils/
|   |   |   `-- generateToken.js
|   |   |-- validators/
|   |   |   |-- authValidator.js
|   |   |   |-- bookValidator.js
|   |   |   |-- loanValidator.js
|   |   |   `-- memberValidator.js
|   |   `-- app.js
|   |-- .env.example
|   |-- package.json
|   `-- server.js
|-- frontend/
|   |-- public/
|   |   |-- favicon.svg
|   |   |-- icons.svg
|   |   `-- lunas-icon.png
|   |-- src/
|   |   |-- api/
|   |   |   `-- api.js
|   |   |-- asset/
|   |   |   |-- lunas1.png
|   |   |   `-- lunas2.png
|   |   |-- assets/
|   |   |   |-- lunas-logo-horizontal.png
|   |   |   `-- lunas-mark.png
|   |   |-- components/
|   |   |   |-- AppFooter.jsx
|   |   |   |-- AppModal.jsx
|   |   |   |-- AppSidebar.jsx
|   |   |   |-- AppTopbar.jsx
|   |   |   |-- AuthShell.jsx
|   |   |   |-- BookForm.jsx
|   |   |   |-- LoanForm.jsx
|   |   |   |-- MemberForm.jsx
|   |   |   |-- PageHeader.jsx
|   |   |   |-- TablePagination.jsx
|   |   |   `-- TableToolbar.jsx
|   |   |-- context/
|   |   |   `-- AuthContext.jsx
|   |   |-- layouts/
|   |   |   `-- AppLayout.jsx
|   |   |-- pages/
|   |   |   |-- Account.jsx
|   |   |   |-- Books.jsx
|   |   |   |-- Dashboard.jsx
|   |   |   |-- Loans.jsx
|   |   |   |-- Login.jsx
|   |   |   |-- Members.jsx
|   |   |   |-- NotFound.jsx
|   |   |   |-- Register.jsx
|   |   |   `-- Users.jsx
|   |   |-- routes/
|   |   |   |-- ProtectedRoute.jsx
|   |   |   `-- SuperUserRoute.jsx
|   |   |-- utils/
|   |   |   |-- alerts.js
|   |   |   `-- formatters.js
|   |   |-- App.jsx
|   |   |-- index.css
|   |   `-- main.jsx
|   |-- .env.example
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|-- .gitignore
`-- README.md
```

Penjelasan folder penting:
- `backend/src/controllers`: logika utama tiap endpoint.
- `backend/src/models`: schema Mongoose untuk `User`, `Book`, `Member`, dan `Loan`.
- `backend/src/routes`: pemetaan method dan endpoint REST API.
- `backend/src/middleware`: autentikasi, otorisasi, rate limiting, 404, dan global error handler.
- `backend/src/validators`: validasi request berbasis `express-validator`.
- `backend/scripts`: script utilitas untuk migrasi akses user, seed demo data, dan cleanup loan demo.
- `frontend/src/api`: konfigurasi Axios dan interceptor token.
- `frontend/src/context`: state autentikasi global.
- `frontend/src/routes`: proteksi route untuk user aktif dan superuser.
- `frontend/src/pages`: halaman utama aplikasi.
- `frontend/src/components`: form, modal, sidebar, topbar, toolbar tabel, dan komponen UI lainnya.

## 8. Desain Database

Seluruh model backend menggunakan `timestamps: true`, sehingga Mongoose otomatis menambahkan `createdAt` dan `updatedAt`.

### 8.1 User

| Field | Tipe | Keterangan |
|---|---|---|
| `name` | String | Wajib diisi, `trim`, panjang 3-50 karakter. |
| `email` | String | Wajib diisi, unik, lowercase, `trim`. |
| `passwordHash` | String | Wajib diisi, `select: false`, menyimpan hash password, bukan plaintext. |
| `role` | String | Enum `superuser` / `user`, default `user`. |
| `status` | String | Enum `pending` / `active` / `inactive`, default `pending`. |
| `createdAt` | Date | Otomatis dari `timestamps`. |
| `updatedAt` | Date | Otomatis dari `timestamps`. |

Catatan: model `User` digunakan untuk autentikasi dan manajemen akses sistem.

### 8.2 Book

| Field | Tipe | Keterangan |
|---|---|---|
| `title` | String | Wajib diisi, `trim`, maksimum 200 karakter. |
| `author` | String | Wajib diisi, `trim`, maksimum 100 karakter. |
| `category` | String | Wajib diisi, `trim`, maksimum 50 karakter. |
| `isbn` | String | Wajib diisi, unik, `trim`. |
| `stock` | Number | Wajib diisi, minimum 0, default 0. |
| `availableStock` | Number | Wajib diisi, minimum 0, default 0. Dikelola backend. |
| `createdAt` | Date | Otomatis dari `timestamps`. |
| `updatedAt` | Date | Otomatis dari `timestamps`. |

Catatan: `availableStock` tidak diinput langsung oleh pengguna. Nilai ini disesuaikan oleh backend saat buku ditambah, stok diperbarui, buku dipinjam, atau buku dikembalikan.

### 8.3 Member

| Field | Tipe | Keterangan |
|---|---|---|
| `name` | String | Wajib diisi, `trim`, panjang 3-100 karakter. |
| `email` | String | Wajib diisi, unik, lowercase, `trim`. |
| `phone` | String | Wajib diisi, `trim`, maksimum 20 karakter. |
| `address` | String | Wajib diisi, `trim`, maksimum 255 karakter. |
| `createdAt` | Date | Otomatis dari `timestamps`. |
| `updatedAt` | Date | Otomatis dari `timestamps`. |

Catatan: model `Member` digunakan sebagai referensi transaksi peminjaman dan tidak dipakai untuk login ke sistem.

### 8.4 Loan

| Field | Tipe | Keterangan |
|---|---|---|
| `member` | ObjectId | Referensi ke model `Member`, wajib diisi. |
| `book` | ObjectId | Referensi ke model `Book`, wajib diisi. |
| `loanDate` | Date | Wajib diisi, default `Date.now`. |
| `dueDate` | Date | Wajib diisi. |
| `returnDate` | Date | Default `null`, terisi saat pengembalian. |
| `status` | String | Enum `borrowed` / `returned`, default `borrowed`. |
| `createdAt` | Date | Otomatis dari `timestamps`. |
| `updatedAt` | Date | Otomatis dari `timestamps`. |

Catatan: `loanDate`, `returnDate`, dan `status` dikelola backend. Frontend hanya mengirim `member`, `book`, dan `dueDate` saat membuat transaksi baru.

## 9. REST API

Klasifikasi akses yang digunakan:
- `Public`: dapat diakses tanpa login.
- `Protected`: memerlukan JWT valid dan akun berstatus `active`.
- `Super User Only`: memerlukan JWT valid, akun `active`, dan role `superuser`.

### Authentication

| Method | Endpoint | Fungsi | Akses |
|---|---|---|---|
| `GET` | `/api/health` | Health check backend. | Public |
| `POST` | `/api/auth/register` | Registrasi akun baru. | Public (rate limited) |
| `POST` | `/api/auth/login` | Login akun aktif. | Public (rate limited) |
| `GET` | `/api/auth/me` | Mengambil data user yang sedang login. | Protected |
| `PUT` | `/api/auth/change-password` | Mengubah password user yang sedang login. | Protected |

### Books

| Method | Endpoint | Fungsi | Akses |
|---|---|---|---|
| `GET` | `/api/books` | Mengambil daftar buku. | Protected |
| `POST` | `/api/books` | Menambah buku baru. | Protected |
| `PUT` | `/api/books/:id` | Memperbarui data buku. | Protected |
| `DELETE` | `/api/books/:id` | Menghapus data buku. | Protected |

### Members

| Method | Endpoint | Fungsi | Akses |
|---|---|---|---|
| `GET` | `/api/members` | Mengambil daftar anggota. | Protected |
| `POST` | `/api/members` | Menambah anggota baru. | Protected |
| `PUT` | `/api/members/:id` | Memperbarui data anggota. | Protected |
| `DELETE` | `/api/members/:id` | Menghapus data anggota. | Protected |

### Loans

| Method | Endpoint | Fungsi | Akses |
|---|---|---|---|
| `GET` | `/api/loans` | Mengambil daftar transaksi peminjaman. | Protected |
| `POST` | `/api/loans` | Mencatat transaksi peminjaman baru. | Protected |
| `PUT` | `/api/loans/:id/return` | Mencatat pengembalian buku. | Protected |

### Dashboard

| Method | Endpoint | Fungsi | Akses |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Mengambil ringkasan dashboard dan distribusi kategori buku. | Protected |

### User Management

| Method | Endpoint | Fungsi | Akses |
|---|---|---|---|
| `GET` | `/api/users` | Mengambil daftar akun pengguna. | Super User Only |
| `PUT` | `/api/users/:id/approve` | Menyetujui akun `pending`. | Super User Only |
| `PUT` | `/api/users/:id/status` | Mengubah status akun menjadi `active` atau `inactive`. | Super User Only |

Endpoint utama UAS yang tercakup langsung dalam implementasi:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/books`
- `POST /api/books`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`
- `GET /api/loans`
- `POST /api/loans`
- `PUT /api/loans/:id/return`
- `GET /api/dashboard/summary`

## 10. Contoh Request dan Response API

Contoh berikut menggunakan data aman dan placeholder. Format JSON di bawah mengikuti struktur aktual pada controller backend, dengan beberapa object data dipersingkat pada field yang tidak relevan agar lebih mudah dibaca.

### Register

Request:

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Raka Saputra",
  "email": "raka.saputra@demo.unsia.ac.id",
  "password": "Lunas1234"
}
```

Response sukses:

```json
{
  "success": true,
  "message": "Registrasi berhasil. Akun Anda menunggu persetujuan Super User.",
  "data": {
    "id": "<user_id>",
    "name": "Raka Saputra",
    "email": "raka.saputra@demo.unsia.ac.id",
    "role": "user",
    "status": "pending",
    "createdAt": "2026-08-12T10:00:00.000Z"
  },
  "token": "<jwt_token>"
}
```

### Login

Request:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "tricks@unsia.ac.id",
  "password": "<password>"
}
```

Response sukses:

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "id": "<user_id>",
    "name": "Tri",
    "email": "tricks@unsia.ac.id",
    "role": "superuser",
    "status": "active",
    "createdAt": "2026-08-12T10:00:00.000Z"
  },
  "token": "<jwt_token>"
}
```

### Protected endpoint

Request:

```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "<user_id>",
    "name": "Tri",
    "email": "tricks@unsia.ac.id",
    "role": "superuser",
    "status": "active",
    "createdAt": "2026-08-12T10:00:00.000Z"
  }
}
```

### Tambah Buku

Request:

```http
POST /api/books
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Dasar-Dasar Pemrograman Web",
  "author": "Andika Prasetyo",
  "category": "Pemrograman",
  "isbn": "9786020000001",
  "stock": 5
}
```

Response sukses:

```json
{
  "success": true,
  "message": "Data buku berhasil ditambahkan.",
  "data": {
    "_id": "<book_id>",
    "title": "Dasar-Dasar Pemrograman Web",
    "author": "Andika Prasetyo",
    "category": "Pemrograman",
    "isbn": "9786020000001",
    "stock": 5,
    "availableStock": 5,
    "createdAt": "2026-08-12T10:05:00.000Z",
    "updatedAt": "2026-08-12T10:05:00.000Z",
    "__v": 0
  }
}
```

### Transaksi Peminjaman

Request:

```http
POST /api/loans
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "member": "<member_id>",
  "book": "<book_id>",
  "dueDate": "2026-08-20T12:00:00.000Z"
}
```

Response sukses:

```json
{
  "success": true,
  "message": "Transaksi peminjaman berhasil dicatat.",
  "data": {
    "_id": "<loan_id>",
    "member": {
      "_id": "<member_id>",
      "name": "Nabila Maharani",
      "email": "nabila.maharani@demo.unsia.ac.id",
      "phone": "081200000002"
    },
    "book": {
      "_id": "<book_id>",
      "title": "Dasar-Dasar Pemrograman Web",
      "author": "Andika Prasetyo",
      "isbn": "9786020000001",
      "category": "Pemrograman"
    },
    "loanDate": "2026-08-12T10:10:00.000Z",
    "dueDate": "2026-08-20T12:00:00.000Z",
    "returnDate": null,
    "status": "borrowed",
    "createdAt": "2026-08-12T10:10:00.000Z",
    "updatedAt": "2026-08-12T10:10:00.000Z",
    "__v": 0
  }
}
```

### Pengembalian

Request:

```http
PUT /api/loans/<loan_id>/return
Authorization: Bearer <jwt_token>
```

Response sukses:

```json
{
  "success": true,
  "message": "Buku berhasil dikembalikan.",
  "data": {
    "_id": "<loan_id>",
    "status": "returned",
    "returnDate": "2026-08-15T08:30:00.000Z"
  }
}
```

### Dashboard Summary

Request:

```http
GET /api/dashboard/summary
Authorization: Bearer <jwt_token>
```

Response sukses:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalBooks": 32,
      "totalMembers": 25,
      "totalLoans": 45,
      "availableBooks": 87
    },
    "booksByCategory": [
      {
        "category": "Pemrograman",
        "total": 6
      },
      {
        "category": "Jaringan Komputer",
        "total": 4
      }
    ]
  }
}
```

## 11. HTTP Status dan Error Response

Status code yang benar-benar digunakan pada source code backend:

| Status | Makna pada project |
|---|---|
| `200 OK` | Request berhasil diproses, misalnya ambil data, login, update, delete, return buku, dashboard. |
| `201 Created` | Data baru berhasil dibuat, misalnya register, tambah buku, tambah anggota, tambah peminjaman. |
| `400 Bad Request` | Parameter tidak valid secara logika, misalnya ObjectId tidak valid, stok baru lebih kecil dari buku yang sedang dipinjam, password baru sama dengan password lama. |
| `401 Unauthorized` | Kredensial salah, token tidak ada, token tidak valid, atau token kedaluwarsa. |
| `403 Forbidden` | Akses ditolak karena status akun `pending`/`inactive` atau role tidak berhak mengakses fitur tertentu. |
| `404 Not Found` | Data atau endpoint tidak ditemukan. |
| `409 Conflict` | Terjadi konflik data, misalnya email sudah terdaftar, ISBN duplikat, akun sudah aktif, double return, atau peminjaman aktif ganda. |
| `422 Unprocessable Entity` | Validasi input gagal. |
| `429 Too Many Requests` | Rate limiting pada endpoint autentikasi public. |
| `500 Internal Server Error` | Error tak terduga yang ditangani global error handler. |

Format umum error response:

```json
{
  "success": false,
  "message": "Pesan kesalahan."
}
```

Format error validasi:

```json
{
  "success": false,
  "message": "Data yang dikirim belum valid.",
  "errors": [
    {
      "field": "email",
      "message": "Format email tidak valid."
    }
  ]
}
```

Catatan:
- Pada mode production, global error handler mengembalikan pesan umum "Terjadi kesalahan pada server."
- Backend tidak mengirim stack trace ke client.

## 12. Validasi Input

Backend menggunakan `express-validator`, sedangkan frontend juga menambahkan validasi form dasar dengan pesan Bahasa Indonesia untuk meningkatkan pengalaman pengguna.

### Register
- `name`: wajib, panjang 3-50 karakter.
- `email`: wajib, format email valid, dinormalisasi.
- `password`: wajib berupa string, minimal 8 karakter, minimal 1 huruf kecil, 1 huruf besar, dan 1 angka.

### Login
- `email`: wajib, format email valid.
- `password`: wajib berupa string dan tidak boleh kosong.

### Change password
- `currentPassword`: wajib diisi.
- `newPassword`: minimal 8 karakter, mengandung huruf kecil, huruf besar, dan angka.
- `confirmPassword`: wajib diisi dan harus sama dengan `newPassword`.

### Tambah Buku
- `title`: wajib, maksimum 200 karakter.
- `author`: wajib, maksimum 100 karakter.
- `category`: wajib, maksimum 50 karakter.
- `isbn`: wajib, maksimum 30 karakter pada validator.
- `stock`: wajib, integer, minimum 0.
- `availableStock`: tidak diterima dari client.

### Update Buku
- Semua field bersifat opsional.
- Jika dikirim, aturan validasinya tetap sama seperti create.
- Backend hanya memproses field whitelist: `title`, `author`, `category`, `isbn`, `stock`.

### Tambah Anggota
- `name`: wajib, panjang 3-100 karakter.
- `email`: wajib, format email valid, dinormalisasi.
- `phone`: wajib, maksimum 20 karakter.
- `address`: wajib, maksimum 255 karakter.

### Update Anggota
- Semua field bersifat opsional.
- Jika dikirim, aturan validasinya tetap sama seperti create.

### Transaksi Peminjaman
- `member`: wajib, harus berupa MongoDB ObjectId.
- `book`: wajib, harus berupa MongoDB ObjectId.
- `dueDate`: wajib, format tanggal valid, dan harus berada setelah waktu saat request dibuat.
- Field `status`, `loanDate`, `returnDate`, dan `availableStock` tidak diterima dari client.

Jika input tidak sesuai, backend tidak melanjutkan proses bisnis dan langsung mengembalikan response JSON berisi `message` dan daftar `errors`.

## 13. Keamanan Backend

### Password Hashing
Password tidak disimpan dalam bentuk plaintext. Backend menyimpan `passwordHash` hasil `bcrypt.hash(password, 10)` pada model `User`.

### JWT Authentication
JWT dibuat menggunakan `jsonwebtoken` dengan algoritma `HS256`. Payload token dibuat minimal dan hanya memuat claim `sub` yang berisi ID user.

### Bearer Token
Endpoint protected mengharuskan header:

```http
Authorization: Bearer <jwt_token>
```

### Protected Middleware
Middleware `protect` memverifikasi token, membaca user dari database, lalu mengecek status `active` sebelum request diteruskan.

### Role Authorization
Middleware `requireSuperUser` membatasi endpoint manajemen pengguna agar hanya bisa diakses oleh role `superuser`.

### dotenv
Konfigurasi sensitif seperti `MONGO_URI` dan `JWT_SECRET` dibaca dari environment variable melalui `dotenv`.

### Helmet
`helmet()` dipasang pada Express untuk menambahkan header keamanan HTTP dasar.

### CORS
Backend mengaktifkan CORS menggunakan `CLIENT_ORIGIN` dan hanya mengizinkan method `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, dan `OPTIONS`, serta header `Content-Type` dan `Authorization`.

### Rate Limiting
Public endpoint `/api/auth/register` dan `/api/auth/login` dibatasi dengan `express-rate-limit` untuk mengurangi percobaan autentikasi berlebihan.

### JSON Body Limit
Body JSON dibatasi dengan `express.json({ limit: '10kb' })`.

### Input Validation
Seluruh input penting divalidasi sebelum masuk ke controller. Ini mengurangi risiko data kotor dan request yang tidak sesuai kontrak API.

### Global Error Handling
Backend memiliki middleware `notFound` dan `errorHandler` untuk menjaga konsistensi response kesalahan dan menghindari bocornya detail internal server ke client.

### Praktik keamanan tambahan pada implementasi
- `passwordHash` memakai `select: false`.
- Login menggunakan pesan generik "Email atau password salah." untuk mencegah account enumeration.
- Token yang sudah dimiliki user `inactive` akan ditolak pada request berikutnya karena status selalu dicek ke database.

## 14. Frontend

Frontend dibangun menggunakan React + Vite dan menggunakan satu instance Axios di `frontend/src/api/api.js` untuk seluruh komunikasi ke backend.

Halaman yang tersedia pada implementasi saat ini:
- `Login`
- `Register`
- `Dashboard`
- `Data Buku`
- `Data Anggota`
- `Data Peminjaman`
- `Manajemen Pengguna`
- `Pengaturan Akun`
- `Not Found`

Implementasi frontend penting:
- `AuthContext` menyimpan state `user`, `token`, dan `loading`.
- Token disimpan di local storage dengan key `lunas_token`.
- Saat aplikasi dibuka, frontend memanggil `/api/auth/me` untuk memvalidasi token yang tersimpan.
- `ProtectedRoute` menjaga halaman untuk user aktif yang sudah login.
- `SuperUserRoute` menjaga halaman `/users`.
- `AppLayout` menyediakan struktur sidebar, topbar, footer, dan area konten utama.
- `Books`, `Members`, `Loans`, dan `Users` menggunakan pencarian client-side serta pagination client-side.
- `BookForm`, `MemberForm`, dan `LoanForm` menampilkan pesan validasi dalam Bahasa Indonesia.
- `SweetAlert2` dipakai untuk konfirmasi aksi penting dan notifikasi singkat.

Catatan autentikasi frontend:
- Register tidak langsung membuat user dianggap login.
- Login baru menyimpan token saat backend mengembalikan response 200.
- Logout dilakukan di sisi frontend dengan menghapus token lokal.

## 15. Dashboard dan Visualisasi

Dashboard React menggunakan endpoint:

```http
GET /api/dashboard/summary
```

Data dashboard berasal langsung dari database dan tidak di-hardcode. Backend menghitung:
- `totalBooks` menggunakan `Book.countDocuments()`
- `totalMembers` menggunakan `Member.countDocuments()`
- `totalLoans` menggunakan `Loan.countDocuments()`
- `availableBooks` menggunakan agregasi `Book.aggregate()`
- `booksByCategory` menggunakan agregasi kategori buku

Empat summary card yang tampil pada frontend:
- Total Buku
- Total Anggota
- Total Peminjaman
- Buku Tersedia

Visualisasi yang digunakan:
- `Chart.js` melalui `react-chartjs-2`
- Jenis grafik: `Doughnut Chart`
- Sumber data: `booksByCategory`

Jika data kategori buku kosong, frontend tidak memaksa merender chart kosong, tetapi menampilkan pesan bahwa data kategori belum tersedia.

## 16. Pengujian API

Pengujian manual REST API pada project ini disusun untuk proses verifikasi menggunakan Thunder Client atau tool sejenis. Tabel berikut merangkum endpoint utama yang relevan dengan kebutuhan UAS.

| No | Method | Endpoint | Skenario | Expected Status |
|---|---|---|---|---|
| 1 | `POST` | `/api/auth/register` | Registrasi akun baru | `201` |
| 2 | `POST` | `/api/auth/login` | Login akun aktif dengan kredensial valid | `200` |
| 3 | `GET` | `/api/auth/me` | Ambil data user yang sedang login | `200` |
| 4 | `GET` | `/api/books` | Ambil daftar buku | `200` |
| 5 | `POST` | `/api/books` | Tambah data buku | `201` |
| 6 | `PUT` | `/api/books/:id` | Perbarui data buku | `200` |
| 7 | `DELETE` | `/api/books/:id` | Hapus data buku | `200` |
| 8 | `GET` | `/api/loans` | Ambil daftar peminjaman | `200` |
| 9 | `POST` | `/api/loans` | Tambah transaksi peminjaman | `201` |
| 10 | `PUT` | `/api/loans/:id/return` | Proses pengembalian buku | `200` |
| 11 | `GET` | `/api/dashboard/summary` | Ambil ringkasan dashboard | `200` |

Endpoint tambahan aktual yang juga tersedia:
- CRUD anggota (`/api/members`)
- Manajemen pengguna (`/api/users`)
- Change password (`/api/auth/change-password`)
- Health check (`/api/health`)

## 17. Pengujian Berhasil dan Gagal

Selain skenario berhasil, source code backend secara eksplisit menangani berbagai skenario gagal dan keamanan berikut:

| Skenario | Status yang digunakan | Sumber implementasi |
|---|---|---|
| Login dengan kredensial benar | `200` | `authController.login` |
| Register berhasil | `201` | `authController.register` |
| Tambah buku berhasil | `201` | `bookController.createBook` |
| Tambah peminjaman berhasil | `201` | `loanController.createLoan` |
| Request tanpa token | `401` | `middleware/auth.js` |
| Token kedaluwarsa | `401` | `middleware/auth.js` |
| Token tidak valid | `401` | `middleware/auth.js` |
| Login salah | `401` | `authController.login` |
| Login akun `pending` | `403` | `authController.login` |
| Login akun `inactive` | `403` | `authController.login` |
| User biasa mengakses `/api/users` | `403` | `middleware/authorize.js` |
| Data tidak ditemukan | `404` | controller terkait |
| ISBN atau email duplikat | `409` | controller buku / anggota / auth |
| Double return | `409` | `loanController.returnLoan` |
| Peminjaman aktif ganda | `409` | `loanController.createLoan` |
| Input tidak valid | `422` | validator + controller |
| Percobaan autentikasi berlebihan | `429` | `middleware/rateLimiter.js` |

Bukti screenshot pengujian tidak tersedia di repository ini. Dokumentasi visual pengujian tersedia pada laporan PDF UAS.

## 18. Screenshot Implementasi

Repository ini tidak menyertakan folder screenshot implementasi aplikasi. Karena itu, dokumentasi visual yang disarankan untuk laporan PDF UAS adalah:

- Halaman Login
- Halaman Register
- Dashboard
- Data Buku
- Form Tambah/Edit Buku
- Data Anggota
- Form Tambah/Edit Anggota
- Data Peminjaman
- Form Tambah Peminjaman
- Grafik Dashboard
- Manajemen Pengguna
- Pengaturan Akun
- Pengujian endpoint menggunakan Thunder Client

Dokumentasi visual lengkap tersedia pada laporan PDF UAS.

## 19. Persyaratan Sistem

Kebutuhan sistem yang dapat diverifikasi dari repository:
- Node.js
- npm
- MongoDB atau MongoDB Atlas melalui `MONGO_URI`
- Git
- Browser modern

Catatan:
- `package.json` backend dan frontend tidak mendefinisikan field `engines`, sehingga README ini tidak mengklaim versi minimum Node.js atau npm tertentu.
- Frontend menggunakan Vite, sehingga browser modern sangat disarankan untuk proses development dan pengujian.

## 20. Instalasi

### Clone repository

```bash
git clone https://github.com/trifredy55/lunas.git
cd lunas
```

### Instalasi backend

```bash
cd backend
npm install
```

### Instalasi frontend

```bash
cd frontend
npm install
```

Repository ini tidak menyediakan script instalasi gabungan dari root. Backend dan frontend diinstal secara terpisah sesuai `package.json` masing-masing.

## 21. Konfigurasi Environment

Gunakan file `.env.example` sebagai acuan. Jangan commit file `.env` ke repository.

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
MONGO_URI=<mongodb_connection_string>
JWT_SECRET=<jwt_secret>
JWT_EXPIRES_IN=1h
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
```

Catatan keamanan:
- Jangan menaruh secret asli di README.
- Jangan commit `.env`.
- Gunakan nilai secret yang kuat untuk environment production.

## 22. Menjalankan Aplikasi Lokal

Jalankan backend dan frontend pada terminal terpisah.

1. Clone repository.
2. Masuk ke folder `backend`.
3. Salin `backend/.env.example` menjadi `backend/.env`, lalu isi `MONGO_URI` dan `JWT_SECRET`.
4. Install dependency backend dengan `npm install`.
5. Jalankan backend dengan `npm run dev`.
6. Masuk ke folder `frontend`.
7. Salin `frontend/.env.example` menjadi `frontend/.env`.
8. Install dependency frontend dengan `npm install`.
9. Jalankan frontend dengan `npm run dev`.
10. Buka URL yang ditampilkan oleh Vite di terminal frontend.

Contoh command:

```bash
# Terminal 1
cd backend
npm install
npm run dev
```

```bash
# Terminal 2
cd frontend
npm install
npm run dev
```

Default yang terlihat dari source code:
- Backend: `http://localhost:5000`
- Frontend memanggil backend melalui `VITE_API_URL=http://localhost:5000`
- URL frontend mengikuti output Vite saat dijalankan

## 23. Cara Menggunakan LUNAS

Alur penggunaan singkat untuk pengguna biasa:

1. Register akun baru.
2. Tunggu persetujuan Super User jika akun masih berstatus `pending`.
3. Login setelah akun `active`.
4. Buka Dashboard untuk melihat ringkasan.
5. Kelola data Buku sesuai kebutuhan.
6. Kelola data Anggota perpustakaan.
7. Catat transaksi Peminjaman.
8. Proses pengembalian buku melalui halaman Peminjaman.
9. Buka Pengaturan Akun jika ingin mengubah password.
10. Logout setelah selesai menggunakan sistem.

Alur tambahan untuk Super User:

1. Login sebagai `superuser`.
2. Buka halaman Manajemen Pengguna.
3. Setujui akun `pending`.
4. Nonaktifkan atau aktifkan kembali akun sesuai kebutuhan.

## 24. Deployment dan Akses

| Komponen | Link / Status |
|---|---|
| GitHub Repository | https://github.com/trifredy55/lunas |
| Frontend | [Tambahkan URL Frontend setelah deployment] |
| Backend API | [Tambahkan URL Backend setelah deployment] |
| Database | MongoDB (ditentukan melalui `MONGO_URI`, dapat diarahkan ke MongoDB Atlas) |
| Video Demo | [Tambahkan URL Video Demo] |
| Dokumentasi PDF | [Tambahkan link jika nantinya di-host] |

Pastikan seluruh link dapat diakses sebelum pengumpulan UAS.

## 25. Panduan Pemeriksaan untuk Dosen

1. Buka repository GitHub project.
2. Baca bagian instalasi dan konfigurasi environment jika ingin menjalankan aplikasi secara lokal.
3. Jalankan backend dan frontend pada terminal terpisah.
4. Register akun baru atau gunakan akun demo yang diberikan secara terpisah.
5. Login ke sistem.
6. Periksa Dashboard dan ringkasan data.
7. Periksa CRUD Buku.
8. Periksa CRUD Anggota.
9. Periksa transaksi Peminjaman dan Pengembalian.
10. Jika menggunakan akun `superuser`, periksa Manajemen Pengguna dan approval akun.
11. Uji REST API menggunakan Thunder Client atau Postman jika diperlukan.

Catatan: credential demo tidak ditulis di README demi keamanan dan sebaiknya diberikan secara terpisah saat presentasi atau pemeriksaan.

## 26. Kendala dan Solusi

Contoh kendala selama pengembangan yang perlu dikonfirmasi sebelum laporan final:

| Kendala | Penyebab | Solusi |
|---|---|---|
| Backend gagal start | `MONGO_URI` atau `JWT_SECRET` belum terisi | Isi file `.env` backend berdasarkan `backend/.env.example`. |
| Frontend tidak bisa memanggil API | `VITE_API_URL` tidak sesuai atau backend belum berjalan | Pastikan backend aktif dan `VITE_API_URL` mengarah ke URL backend yang benar. |
| CORS error saat frontend memanggil backend | `CLIENT_ORIGIN` belum sesuai dengan origin frontend | Sesuaikan `CLIENT_ORIGIN` pada backend dengan URL frontend yang digunakan. |
| Login ditolak walaupun kredensial benar | Status akun masih `pending` atau `inactive` | Approve akun melalui Super User atau aktifkan kembali akun dari halaman `/users`. |
| Request protected selalu `401` | Token tidak ada, tidak valid, atau sudah kedaluwarsa | Login ulang agar frontend mendapatkan token baru. |
| Dashboard tidak berubah setelah data operasional diperbarui | Data lama masih tampil karena pengguna belum memuat ulang halaman | Buka ulang halaman Dashboard atau gunakan tombol `Perbarui` yang tersedia. |

## 27. Troubleshooting

### MongoDB tidak terhubung
- Periksa nilai `MONGO_URI`.
- Pastikan service MongoDB aktif jika memakai lokal.
- Jika memakai MongoDB Atlas, periksa whitelist IP dan akses user database.

### 401 Unauthorized
- Pastikan header `Authorization: Bearer <token>` dikirim.
- Login kembali jika token sudah kedaluwarsa.
- Pastikan frontend menyimpan `lunas_token` setelah login sukses.

### 403 Forbidden
- Periksa apakah akun masih `pending` atau `inactive`.
- Periksa role user jika mencoba membuka halaman atau endpoint manajemen pengguna.

### Frontend gagal memanggil API
- Pastikan backend berjalan.
- Pastikan `VITE_API_URL` mengarah ke backend yang benar.
- Periksa konsol browser dan terminal backend untuk melihat detail error.

### CORS error
- Pastikan `CLIENT_ORIGIN` di backend sesuai dengan origin frontend.
- Jalankan frontend pada origin yang memang diizinkan backend.

### Port sudah digunakan
- Ganti port sesuai kebutuhan pada konfigurasi environment.
- Pastikan tidak ada proses lain yang memakai port yang sama.

## 28. Catatan Keamanan

- Jangan commit file `.env`.
- Jangan menulis `JWT_SECRET`, `MONGO_URI`, token, atau credential lain ke repository.
- Jangan membagikan JWT aktif kepada pihak lain.
- Password harus tetap disimpan dalam bentuk hash, bukan plaintext.
- Gunakan secret yang kuat untuk production.
- Batasi akses database production, termasuk jika memakai MongoDB Atlas.
- Credential deployment tidak boleh disimpan di source code atau README.

## 29. Informasi Akademik

Project: LUNAS - Library UNSIA Networked Application System  
Judul UAS: Secure UNSIA Digital Library Dashboard  
Mata Kuliah: Pemrograman Web II  
Jenis: Ujian Akhir Semester / Project UAS

Nama Mahasiswa : [Isi Nama]  
NIM            : [Isi NIM]  
Program Studi  : [Isi Program Studi]

## 30. Status Implementasi

- [x] Backend REST API
- [x] MongoDB melalui Mongoose
- [x] JWT Authentication
- [x] Password Hashing
- [x] Approval akun dan manajemen status user
- [x] CRUD Buku
- [x] CRUD Anggota
- [x] Peminjaman
- [x] Pengembalian
- [x] React Frontend
- [x] ProtectedRoute
- [x] SuperUserRoute
- [x] Dashboard Summary API
- [x] Chart.js pada dashboard
- [x] Input Validation
- [x] Security middleware
- [x] Pengaturan Akun / change password
- [ ] Frontend Deployment
- [ ] Backend Deployment
- [ ] Video Demo
- [ ] Tautan publik dokumentasi PDF

## 31. Project Akademik

Project LUNAS dikembangkan untuk keperluan akademik UAS Pemrograman Web II. Repository ini tidak menyertakan file `LICENSE` terpisah, sehingga README ini tidak menambahkan lisensi open source tertentu secara otomatis.
