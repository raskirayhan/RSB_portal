# Rayhan Special Batch (RSB_portal) — Interactive Science Lab & Management Platform
> **৮ম শ্রেণি (JSC), এসএসসি (SSC) ও এইচএসসি (HSC) বিজ্ঞান বিভাগের** (Physics, Chemistry, Higher Math, General Math, Biology, ICT) আধুনিক স্পেশাল প্রাইভেট কোচিং ম্যানেজমেন্ট, ইন্টারেক্টিভ লার্নিং ও সিকিউর এডুটেক প্ল্যাটফর্ম।
> খুলনা ও বাগেরহাটের বিজ্ঞান শিক্ষার্থীদের জন্য বিশেষায়িত।

---

## 🌐 লাইভ প্রোডাকশন লিংক (Live Deployments)

* **ক্লায়েন্ট পোর্টাল (Frontend):** [https://client-xi-lac.vercel.app/](https://client-xi-lac.vercel.app/)
* **সার্ভার এপিআই (Backend API):** [https://rsb-portal-server.vercel.app](https://rsb-portal-server.vercel.app)
* **গিট রিপোজিটরি:** [https://github.com/raskirayhan/RSB_portal](https://github.com/raskirayhan/RSB_portal)
* **হটলাইন / ডিরেক্ট সাপোর্ট:** 📞 `01779181871` (WhatsApp & Call)

---

## 🌟 মূল বৈশিষ্ট্যসমূহ (Core Features)

### ১. সহজ ও পরিষ্কার লগইন এবং ডুয়াল-ডিভাইস সিকিউরিটি (Clean Login & Dual-Device Security)
* **ক্লিন ইউআই:** বিভ্রান্তিমুক্ত সিম্পল লগইন পেজ—শুধুমাত্র শিক্ষাস্তর (৮ম শ্রেণি, SSC, HSC), ইমেইল এবং পাসওয়ার্ড (চোখ/Eye টগলসহ)।
* **ডুয়াল-ডিভাইস পলিসি:** শিক্ষার্থী প্রতি সর্বোচ্চ ২টি ডিভাইসে (যেমন: ১টি ফোন + ১টি ল্যাপটপ) একই সাথে লগইন থাকতে পারে; ৩য় ডিভাইসে লগইন করলে পুরনো ডিভাইসটি স্বয়ংক্রিয়ভাবে লগআউট (FIFO eviction) হয়ে যায়।
* **সিকিউর ইমেইল OTP:** ৬-ডিজিটের ওটিপি ভেরিফিকেশন ও পাসওয়ার্ড রিসেট ব্যবস্থা।

### ২. শিক্ষাস্তর ভিত্তিক কঠোর সেগমেন্টেশন (Academic Level Segmentation)
* **৮ম শ্রেণি (JSC):** বিজ্ঞান ও গণিত ফাউন্ডেশন ব্যাচ—৮ম শ্রেণির শিক্ষার্থীরা শুধুমাত্র তাদের নির্দিষ্ট বিজ্ঞান, গণিত অধ্যায় ও নোটস দেখতে পাবে।
* **এসএসসি (SSC Science):** পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত, সাধারণ গণিত ও জীববিজ্ঞান।
* **এইচএসসি (HSC Science):** পদার্থবিজ্ঞান ১ম ও ২য় পত্র, রসায়ন ১ম ও ২য় পত্র, উচ্চতর গণিত ১ম ও ২য় পত্র, জীববিজ্ঞান ও আইসিটি (ICT)।
* প্রতিটি শিক্ষার্থী তার ক্লাসের সিলেবাস অনুযায়ী স্বয়ংক্রিয়ভাবে ফিল্টার করা ড্যাশবোর্ড ও স্টাডি ভল্ট দেখতে পায়।

### ৩. NCTB মূল বোর্ড বইসমূহ (Official Textbooks PDF Vault)
* জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত ৮ম শ্রেণি, এসএসসি ও এইচএসসি বিজ্ঞান ও গণিত মূল বইসমূহ সরাসরি যুক্ত।
* শিক্ষার্থীরা স্টাডি ভল্ট ও ড্যাশবোর্ড থেকে ১-ক্লিকে মূল বোর্ড বই অনলাইনে পড়তে এবং সরাসরি ডাউনলোড করতে পারে।

### ৪. শিক্ষার্থী প্রোফাইল ছবি ও ডিজিটাল স্টুডেন্ট আইডি (Avatar Upload & QR Badge)
* **ছবি আপলোড ও সায়েন্টিফিক অবতার:** শিক্ষার্থীরা ফোন বা পিসির গ্যালারি/ক্যামেরা থেকে পাসপোর্ট ছবি আপলোড করতে পারে (যা ব্রাউজারেই স্বয়ংক্রিয়ভাবে অপ্টিমাইজ ও কম্প্রেস হয়ে সেভ হয়) অথবা ৬টি সায়েন্টিফিক অবতার থেকে বেছে নিতে পারে।
* **অফিসিয়াল ডিজিটাল আইডি কার্ড:** প্রোফাইল ১০০% সম্পন্ন হলে স্বয়ংক্রিয় ইউনিক আইডি (যেমন: `RSB-26-001`) এবং এনক্রিপ্টেড কিউআর (QR) কোডসহ ফুল-কার্ড ও প্রিন্ট ভিউ আনলক হয়।
* শিক্ষার্থীর ছবি টপ নেভবার, প্রোফাইল কার্ড এবং প্রিন্ট ব্যাজে প্রদর্শিত হয়।

### ৫. ডে মোড ও ডিপ ফোকাস নাইট মোড (Day Lab & Deep Focus Night Theme)
* সম্পূর্ণ প্ল্যাটফর্মে লাইট মোড ও ডার্ক মোডের নিখুঁত সিঙ্ক (`darkMode: 'class'`)।
* রাতে পড়াশোনার সুবিধার্থে চোখের আরামদায়ক ডিপ নেভি/স্লেট ডার্ক থিম।
* ওয়েব অডিও এপিআই (Web Audio API) সিন্থেসাইজারে তৈরি ইন্টারেক্টিভ সাউন্ড ইফেক্টস (পপ, ক্লিক, রিওয়ার্ড চাইম) যা চাইলে ১-ক্লিকে মিউট করা যায়।

### ৬. স্মার্ট স্টাডি ভল্ট ও অ্যান্টি-লিক ডাইনামিক PDF ওয়াটারমার্কিং (`pdf-lib`)
* প্রতিটি বিষয়ের অধ্যায়ভিত্তিক লেকচার শিট, সূত্রের শিট ও ক্যাডেট কলেজ CQ প্রশ্নব্যাংক।
* শিক্ষার্থী ডাউনলোড করলেই সার্ভার রিয়েল-টাইমে প্রতিটি পেজে শিক্ষার্থীর নাম, আইডি, ফোন নম্বর ও টাইমস্ট্যাম্প দিয়ে ডায়াগোনাল ওয়াটারমার্ক বসিয়ে দেয়।

### ৭. অটোমেটেড মান্থলি পেমেন্ট ও ডিজিটাল মানি রিসিট
* প্রতি মাসের ১ তারিখে `node-cron` স্বয়ংক্রিয়ভাবে সক্রিয় শিক্ষার্থীদের ইনভয়েস তৈরি করে।
* bKash/Nagad ম্যানুয়াল TrxID সাবমিশন ও রায়হান স্যারের ১-ক্লিক অনুমোদন।
* অনুমোদনের সাথে সাথে স্বয়ংক্রিয় সাইন করা অফিসিয়াল হাফ-A4 সাইজ PDF মানি রিসিট ডাউনলোড সুবিধা।
* বকেয়া থাকলে মাসের ১৫ তারিখের পর স্টাডি ভল্ট সাময়িক লক রাখার অটো-গেটিং।

### ৮. গ্যামিফিকেশন, দৈনিক রিওয়ার্ড ও সায়েন্স ব্রেইন গেমস
* **দৈনিক লগইন রিওয়ার্ড:** প্রতিদিন সাইটে লগইন করলেই +Gems এবং +Stars বোনাস ক্লেইম।
* **৪টি ইন-অ্যাপ সায়েন্স গেমস:**
  1. *Periodic Table Quick Match* (পর্যায় সারণি খেলা)
  2. *Physics Formula Rush* (পদার্থবিজ্ঞানের সূত্র মেলানো)
  3. *Mental Math Sprint* (ক্যালকুলেটর ছাড়া দ্রুত গণিত)
  4. *Science MCQ Battle* (টাইমার ভিত্তিক বহু নির্বাচনী প্রশ্ন)
* লাইভ ব্যাচ লিডারবোর্ড ও স্ট্রিক সিস্টেম।

### ৯. টিচার-স্টুডেন্ট পার্সোনালাইজড ফিডব্যাক ও গার্ডিয়ান ডাইজেস্ট
* রায়হান স্যার শিক্ষার্থীদের ব্যক্তিগত সবল ও দুর্বল দিক পর্যবেক্ষণ করে ফিডব্যাক দিতে পারেন।
* প্রতি মাসের শেষে অভিভাবকের ইমেইলে উপস্থিতি, কুইজ পারফরম্যান্স ও রিপোর্ট পৌঁছে যায়।

### ১০. সুপার অ্যাডমিন কন্ট্রোল রুম (Super Admin Portal)
* কালেকশন ও বকেয়া ফি মনিটরিং ড্যাশবোর্ড।
* পেন্ডিং পেমেন্ট ট্রানজেকশন ১-ক্লিক অ্যাপ্রুভাল কিউ।
* ক্যামেরা বা ওয়েবক্যাম দিয়ে অফলাইন ক্লাসের দ্রুত QR কোড হাজিরা (Attendance) স্ক্যানার।
* নতুন লেকচার শিট, ভিডিও ও নোটিশ আপলোড সুবিধা।

---

## 🛠 টেকনোলজি স্ট্যাক (Tech Stack)

| স্তর | টেকনোলজি |
| :--- | :--- |
| **ফ্রন্টএন্ড (Frontend)** | React 19, TypeScript, Vite, Tailwind CSS (Dark Mode), Lucide React, Framer Motion, Canvas Confetti, HTML5-QRCode |
| **ব্যাকএন্ড (Backend)** | Node.js, Express.js (TypeScript), Modular MVC & Service Architecture |
| **ডেটাবেস ও ওআরএম** | PostgreSQL (Neon Serverless), Prisma ORM (15 Relational Models) |
| **পিডিএফ ও কিউআর ইঞ্জিন** | `pdf-lib` (Dynamic Realtime Watermarking), `qrcode` (Vector DataURLs) |
| **সিকিউরিটি ও শিডিউলার** | JWT (Dual-Device Access & Refresh Tokens), Bcrypt, `node-cron` (Automated Invoicing) |
| **হোস্টিং ও ক্লাউড** | Vercel (Client & Serverless Functions), GitHub Actions CI/CD |

---

## 📁 প্রজেক্ট স্ট্রাকচার (Project Structure)

```
RSB_Portal/
├── client/                     # React 19 + TypeScript + Vite ফ্রন্টএন্ড
│   ├── src/
│   │   ├── api/                # Axios API ক্লায়েন্ট ও ইন্টারসেপ্টর
│   │   ├── components/         # রিইউজেবল কম্পোনেন্ট (Navbar, QRBadgeModal, NctbBooksSection, ইত্যাদি)
│   │   ├── context/            # AuthContext, ThemeContext (Day/Night Mode)
│   │   ├── data/               # nctbBooks.ts (বোর্ড বই ডাটাবেস)
│   │   ├── pages/
│   │   │   ├── admin/          # Admin Dashboard, Attendance Scanner, Billing Management
│   │   │   ├── auth/           # LoginPage, RegisterPage, ForgotPasswordPage
│   │   │   ├── games/          # Periodic Table, Formula Rush, Math Sprint, MCQ Battle
│   │   │   ├── public/         # LandingPage (Interactive Science Lab Showcase)
│   │   │   └── student/        # StudentDashboard, StudyVaultPage, ProfilePage, BillingPage
│   │   └── utils/              # সাউন্ড এফেক্টস, রিওয়ার্ডস, ডেট ফরম্যাটার
│   ├── tailwind.config.js      # Tailwind CSS (darkMode: 'class')
│   └── package.json
│
├── server/                     # Express.js + TypeScript ব্যাকএন্ড
│   ├── src/
│   │   ├── config/             # Prisma Client ও এনভায়রনমেন্ট কনফিগ
│   │   ├── controllers/        # Auth, Profile, Vault, Billing, Attendance, Feedback, Game
│   │   ├── middleware/         # JWT Auth, Dual-Device Enforcement, Role-based Access
│   │   ├── routes/             # এক্সপ্রেস রাউটারসমূহ
│   │   ├── services/           # QR জেনারেশন, pdf-lib ওয়াটারমার্কিং, ইমেইল সার্ভিস
│   │   └── prisma/             # schema.prisma এবং সিড স্ক্রিপ্ট (seed.ts)
│   ├── api/index.js            # Vercel Serverless এন্ট্রি পয়েন্ট
│   └── package.json
│
└── README.md                   # প্রজেক্ট ডকুমেন্টেশন
```

---

## 💻 লোকাল মেশিনে রান করার নিয়মাবলী (Setup & Run)

### পূর্বশর্ত:
* Node.js (v18 বা পরবর্তী)
* PostgreSQL ডাটাবেস (অথবা Neon PostgreSQL কানেকশন স্ট্রিং)

### ১. রিপোজিটরি ক্লোন করুন
```bash
git clone https://github.com/raskirayhan/RSB_portal.git
cd RSB_portal
```

### ২. ব্যাকএন্ড সার্ভার কনফিগারেশন ও রান
```bash
cd server
npm install

# .env ফাইলে DATABASE_URL, JWT_SECRET ইত্যাদি সেট করুন
npm run prisma:generate
npm run prisma:push
npm run seed              # ডেমো ব্যাচ, শিক্ষার্থী ও নোটস সিড করতে
npm run dev               # সার্ভার চালু হবে: http://localhost:5000
```

### ৩. ফ্রন্টএন্ড ক্লায়েন্ট রান
```bash
cd ../client
npm install
npm run dev               # ক্লায়েন্ট চালু হবে: http://localhost:5173
```

### ৪. প্রোডাকশন টেস্ট বিল্ড
```bash
cd client
npm run build             # টাইপস্ক্রিপ্ট ও ভিটে বিল্ড ভেরিফাই করবে
```

---

## 🔑 টেস্ট লগইন একাউন্টসমূহ (Test Accounts)

* **সুপার অ্যাডমিন (রায়হান স্যার):**  
  * ইমেইল: `rayhan@rsb.com` | পাসওয়ার্ড: `Password123!`
* **এইচএসসি শিক্ষার্থী (আবির - ১০০% প্রোফাইল ও পেইড):**  
  * ইমেইল: `student@rsb.com` | পাসওয়ার্ড: `Password123!`
* **এসএসসি শিক্ষার্থী (সাকিব - প্র্যাকটিস অ্যাকাউন্ট):**  
  * ইমেইল: `sakib@rsb.com` | পাসওয়ার্ড: `Password123!`

---

## 📞 যোগাযোগ ও সাপোর্ট
* **মেন্টর:** রায়হান স্যার (Rayhan's Science Lab)
* **লোকেশন:** খুলনা ও বাগেরহাট
* **মোবাইল / হোয়াটসঅ্যাপ:** `+880 1779-181871`
* **ওয়েবসাইট:** [https://client-xi-lac.vercel.app/](https://client-xi-lac.vercel.app/)

*Developed for Rayhan Special Batch (RSB_Portal) — SSC & HSC Science Excellence.*
