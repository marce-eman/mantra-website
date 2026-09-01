# 🚀 Mantra E-Commerce App

Aplikasi web eksklusif yang dibangun menggunakan Next.js (App Router), Prisma, dan Supabase untuk autentikasi dan manajemen database.

## 📋 Persyaratan Sistem (Prerequisites)
Pastikan perangkat Anda sudah terinstal:
* Node.js (v18 atau lebih baru)
* npm, yarn, atau pnpm
* Git

## ⚙️ Pengaturan Environment Variable (.env)
Karena alasan keamanan, file `.env` tidak disertakan di repositori ini. Buat file `.env` baru di folder utama (root) dengan mengacu pada variabel berikut:

\`\`\`env
# Database Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth Config
NEXTAUTH_SECRET="generate_secret_key_anda_di_sini"
NEXTAUTH_URL="http://localhost:3000"

# (Opsional) Google OAuth
GOOGLE_CLIENT_ID="client_id_dari_gcp"
GOOGLE_CLIENT_SECRET="client_secret_dari_gcp"
\`\`\`

## 🛠️ Cara Instalasi & Menjalankan Project

**1. Clone Repository**
\`\`\`bash
git clone https://github.com/username-github-kamu/nama-repo.git
cd nama-repo
\`\`\`

**2. Install Dependencies**
\`\`\`bash
npm install
\`\`\`

**3. Setup & Sinkronisasi Database (Prisma)**
Pastikan URL database sudah benar di `.env`, lalu jalankan:
\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

**4. Jalankan Server Development**
\`\`\`bash
npm run dev
\`\`\`
Aplikasi dapat diakses melalui web browser di `http://localhost:3000`.

## 🔑 Akun Testing (Opsional)
Gunakan kredensial berikut untuk menguji dashboard admin:
* **Email:** admin@testing.com
* **Password:** admin123