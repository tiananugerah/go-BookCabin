# BookCabin - Sistem Pemesanan Kursi

[... bagian sebelumnya tetap sama ...]

## Arsitektur dan Alur Data

### 1. Layer Architecture
Proyek menggunakan arsitektur 3-tier:
1. Controller Layer (API Endpoints)
   - Menangani HTTP requests dan responses
   - Validasi input
   - Routing ke service layer

2. Service Layer (Business Logic)
   - Implementasi logika bisnis
   - Transaksi database
   - Validasi bisnis

3. Model Layer (Data Layer)
   - Definisi struktur data
   - Relasi antar entitas
   - Constraint database

### 2. Alur Data dan Logika Bisnis

#### A. Proses Pemesanan (Booking)
1. Input Validation (Controller)
   - Validasi token JWT
   - Ekstrak userID dari token
   - Validasi request body (seat_id)

2. Business Logic (Service)
   - Cek ketersediaan kursi
   - Implementasi dalam transaksi database:
     a. Buat record booking baru
     b. Update status kursi menjadi tidak tersedia
   - Return booking details

3. Data Model
   - Booking terhubung ke User dan Seat (foreign keys)
   - Status tracking (pending, confirmed, cancelled)
   - Timestamp dan audit fields (created_at, updated_at)

#### B. Pembatalan Pemesanan
1. Controller Logic
   - Validasi token dan userID
   - Parse bookingID dari URL parameter

2. Service Layer Checks
   - Verifikasi kepemilikan booking (userID match)
   - Cek status booking (tidak bisa cancel jika sudah cancelled)
   - Transaksi database:
     a. Update status booking menjadi cancelled
     b. Set kursi menjadi available kembali

### 3. Relasi Database

#### User Model
- Primary Key: ID (uint)
- Unique Fields: Email
- Relations: One-to-Many dengan Booking
- Timestamps: CreatedAt, UpdatedAt, DeletedAt (soft delete)

#### Seat Model
- Primary Key: ID (uint)
- Unique Fields: SeatCode
- Fields Penting:
  * Available (bool) - status ketersediaan
  * Price (float64) - harga kursi
  * RowNumber (int) - nomor baris
  * Segment (string) - segmen kursi
- Relations: One-to-Many dengan Booking

#### Booking Model
- Primary Key: ID (uint)
- Foreign Keys:
  * UserID - referensi ke User
  * SeatID - referensi ke Seat
- Fields Penting:
  * Status (BookingStatus) - status pemesanan
  * BookedAt (time.Time) - waktu pemesanan
  * Price (float64) - harga saat pemesanan
  * Currency (string) - mata uang

### 4. Keamanan dan Validasi

#### Authentication Flow
1. Register:
   - Validasi email unik
   - Hash password (bcrypt)
   - Simpan user baru

2. Login:
   - Validasi credentials
   - Generate JWT token
   - Return token ke client

3. Protected Routes:
   - Middleware auth memeriksa JWT
   - Inject userID ke context
   - Validasi akses ke resources

#### Data Validation
1. Input Validation:
   - Request body validation menggunakan binding tags
   - Parameter URL validation
   - Custom validation rules

2. Business Rules:
   - Cek ketersediaan kursi
   - Validasi kepemilikan booking
   - Validasi status transitions

### 5. Error Handling

1. HTTP Error Codes:
   - 400: Bad Request (invalid input)
   - 401: Unauthorized (invalid/missing token)
   - 403: Forbidden (tidak punya akses)
   - 404: Not Found (resource tidak ditemukan)
   - 500: Internal Server Error

2. Error Response Format:
   ```json
   {
     "error": "detailed error message"
   }