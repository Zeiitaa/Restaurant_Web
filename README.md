# Restaurant Frontend

Frontend web application untuk sistem manajemen restoran, dibangun dengan **Vue 3** + **Vite**. Aplikasi ini mendukung dua peran pengguna: **Admin** dan **Waiters**.

---

## Tech Stack

| Kategori | Library / Tool |
|---|---|
| Framework | Vue 3 |
| Build Tool | Vite 7 |
| State Management | Pinia |
| Routing | Vue Router 5 |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Auth | JWT (`jwt-decode`) |
| Notifications | Vue Toastification |
| Dev Tools | Vite Plugin Vue DevTools, Prettier |

---

## Fitur Utama

### Autentikasi
- Login, Register, Register Detail
- Lupa Password  Verifikasi OTP  Reset Password
- JWT-based session dengan auto-expire detection
- Route guard berbasis role (admin / waiters)

### Admin

| Halaman | Path |
|---|---|
| Dashboard | `/admin` |
| Riwayat Pesanan | `/admin/order-history` |
| Kelola Menu | `/admin/manage-menu` |
| Kelola Staff | `/admin/manage-staff` |
| Kelola Meja | `/admin/manage-table` |
| Kelola Kategori | `/admin/manage-category` |
| Riwayat Stok | `/admin/stock-history` |

### Waiters

| Halaman | Path |
|---|---|
| Action Hub | `/waiters` |
| Pilih Meja | `/waiters/table` |
| Pesan Menu | `/waiters/menu/:tableCode` |
| Pesanan Berjalan | `/waiters/ongoing-order` |
| Daftar Pembayaran | `/waiters/payment` |
| Detail Pembayaran | `/waiters/payment-detail/:id` |

---

## Struktur Direktori

```
src/
 App.vue
 main.js
 assets/
    main.css
 components/          # Komponen reusable (form, card, sidebar, modal, dll.)
    addStock.vue
    cardDetailOrder.vue
    cashPayment.vue
    DeleteCategory.vue
    DeleteStaff.vue
    DeleteTable.vue
    FormCategory.vue
    FormMenu.vue
    FormStaff.vue
    FormStaffDetail.vue
    FormTable.vue
    MenuCard.vue
    OrderSidebar.vue
    SideAdmin.vue
    statsCard.vue
 helpers/
    api.js           # Instance Axios dengan base URL dari .env
 router/
    index.js         # Definisi route + navigation guard berbasis role
 stores/              # Pinia stores
    auth.js          # Autentikasi & profil user
    cart.js          # Keranjang pesanan
    category.js      # Kategori menu
    menu.js          # Data menu
    table.js         # Data meja
 views/
     homeview.vue
     notFound.vue
     auth/            # Login, Register, OTP, Reset Password
        login.vue
        register.vue
        registDetail.vue
        forgot.vue
        VerifyOTP.vue
        resetPassword.vue
     admin/           # Seluruh halaman admin
        Dashboard.vue
        OrderHistory.vue
        ManageMenu.vue
        ManageStaff.vue
        ManageTable.vue
        ManageCategory.vue
        StockHistory.vue
     waiters/         # Seluruh halaman waiters
         ActionHub.vue
         order/
             Menu.vue
             Table.vue
             OngoingOrder.vue
             Payment.vue
             SumNPayment.vue
```

---

## Setup & Menjalankan Proyek

### Prasyarat

- Node.js `^20.19.0` atau `>=22.12.0`

### Instalasi

```sh
npm install
```

### Konfigurasi Environment

Buat file `.env` di root proyek:

```env
VITE_API_URL=http://localhost:8000
```

### Development Server (port 3000)

```sh
npm run dev
```

### Build untuk Production

```sh
npm run build
```

### Preview Build

```sh
npm run preview
```

### Format Kode

```sh
npm run format
```

---

## Konfigurasi

- **Dev server** berjalan di port `3000`
- **API proxy**: request ke `/api` akan diteruskan ke `localhost:8000`
- Konfigurasi lengkap Vite ada di [`vite.config.js`](vite.config.js)

---

## IDE yang Direkomendasikan

[VS Code](https://code.visualstudio.com/) + ekstensi [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (nonaktifkan Vetur jika terpasang).

### Vue DevTools (Browser)

- **Chrome / Edge / Brave**: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox**: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)