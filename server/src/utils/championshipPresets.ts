export interface ChampionshipMcq {
  id: number;
  subject: string;
  chapter: string;
  questionText: string;
  options: string[];
  correctIndex: number; // 0-based
  explanation: string;
}

export const SSC_PHYSICS_PRESET_25: ChampionshipMcq[] = [
  {
    id: 1,
    subject: 'Physics',
    chapter: 'গতি (Motion)',
    questionText: 'একটি বস্তু স্থির অবস্থান থেকে 2 m/s² সুষম ত্বরণে চলতে শুরু করলে 4 সেকেন্ড পর এর বেগ কত হবে?',
    options: ['4 m/s', '8 m/s', '16 m/s', '2 m/s'],
    correctIndex: 1,
    explanation: 'v = u + at সূত্রানুসারে, v = 0 + (2 × 4) = 8 m/s।'
  },
  {
    id: 2,
    subject: 'Physics',
    chapter: 'গতি (Motion)',
    questionText: 'মুক্তভাবে পড়ন্ত কোনো বস্তু প্রথম সেকেন্ডে 4.9 m দূরত্ব অতিক্রম করলে, ২য় সেকেন্ড শেষে মোট অতিক্রান্ত দূরত্ব কত?',
    options: ['9.8 m', '14.7 m', '19.6 m', '24.5 m'],
    correctIndex: 2,
    explanation: 'h = 0.5 * g * t² = 0.5 * 9.8 * 2² = 19.6 m।'
  },
  {
    id: 3,
    subject: 'Physics',
    chapter: 'বল (Force)',
    questionText: '5 kg ভরের বস্তুর ওপর 20 N বল 3 সেকেন্ড ধরে প্রয়োগ করা হলে ত্বরণ কত হবে?',
    options: ['2 m/s²', '4 m/s²', '15 m/s²', '60 m/s²'],
    correctIndex: 1,
    explanation: 'F = ma সূত্রানুসারে, a = F/m = 20 / 5 = 4 m/s²।'
  },
  {
    id: 4,
    subject: 'Physics',
    chapter: 'বল (Force)',
    questionText: 'নিউটনের গতির ৩য় সূত্রের বাস্তব উদাহরণ কোনটি?',
    options: ['গাড়ির ব্রেক চাপা', 'বন্দুক থেকে গুলি ছোঁড়া', 'গাছ থেকে ফল পড়া', 'পানির প্রবাহ'],
    correctIndex: 1,
    explanation: 'বন্দুক থেকে গুলি বের হলে বিপরীত প্রতিক্রিয়া বলের কারণে বন্দুক পেছন দিকে ধাক্কা দেয় (ক্রিয়া ও প্রতিক্রিয়া বল)।'
  },
  {
    id: 5,
    subject: 'Physics',
    chapter: 'কাজ, ক্ষমতা ও শক্তি (Work, Power & Energy)',
    questionText: '10 kg ভরের একটি বস্তুকে ভূ-পৃষ্ঠ থেকে 5 m উঁচুতে তুললে কৃতকাজের পরিমাণ কত?',
    options: ['50 J', '98 J', '490 J', '980 J'],
    correctIndex: 2,
    explanation: 'W = mgh = 10 × 9.8 × 5 = 490 J।'
  },
  {
    id: 6,
    subject: 'Physics',
    chapter: 'কাজ, ক্ষমতা ও শক্তি (Work, Power & Energy)',
    questionText: 'কাজের মাত্রা সমীকরণ কোনটি?',
    options: ['[MLT⁻¹]', '[MLT⁻²]', '[ML²T⁻²]', '[ML²T⁻³]'],
    correctIndex: 2,
    explanation: 'কাজ = বল × সরণ = [MLT⁻²] × [L] = [ML²T⁻²]।'
  },
  {
    id: 7,
    subject: 'Physics',
    chapter: 'পদার্থের অবস্থা ও চাপ (Matter & Pressure)',
    questionText: 'পানির ঘনত্ব সবচেয়ে বেশি কোন তাপমাত্রায়?',
    options: ['0°C', '4°C', '10°C', '100°C'],
    correctIndex: 1,
    explanation: 'পানির ব্যতিক্রমী প্রসারণ ধর্মের কারণে 4°C তাপমাত্রায় ঘনত্ব সর্বাধিক (1000 kg/m³)।'
  },
  {
    id: 8,
    subject: 'Physics',
    chapter: 'পদার্থের অবস্থা ও চাপ (Matter & Pressure)',
    questionText: 'প্যাসকেলের সূত্রটি মূলত কোন ক্ষেত্রে প্রযোজ্য?',
    options: ['কেবল কঠিন পদার্থের জন্য', 'কেবল তরল ও বায়বীয় (আবদ্ধ) পদার্থের জন্য', 'কেবল শূন্যস্থানে', 'কেবল আলোর জন্য'],
    correctIndex: 1,
    explanation: 'আবদ্ধ পাত্রে তরল বা বায়বীয় পদার্থের ওপর বাইরে থেকে চাপ প্রয়োগ করলে তা সবদিকে সমানভাবে সঞ্চালিত হয়।'
  },
  {
    id: 9,
    subject: 'Physics',
    chapter: 'শব্দ ও তরঙ্গ (Waves & Sound)',
    questionText: 'প্রতিধ্বনি শোনার জন্য উৎস ও প্রতিফলকের মধ্যকার ন্যূনতম দূরত্ব কত হওয়া প্রয়োজন (20°C বায়ুতে)?',
    options: ['16.6 m', '17.2 m', '33.2 m', '10 m'],
    correctIndex: 0,
    explanation: 'শব্দানুভূতির স্থায়িত্বকাল 0.1s। 20°C তাপমাত্রায় শব্দের বেগ 344 m/s হলে ন্যূনতম দূরত্ব d = (344 × 0.1)/2 = 17.2 m (অথবা 0°C-এ 16.6 m)।'
  },
  {
    id: 10,
    subject: 'Physics',
    chapter: 'শব্দ ও তরঙ্গ (Waves & Sound)',
    questionText: 'শব্দ কোন ধরণের তরঙ্গ?',
    options: ['তাড়িৎচৌম্বক তরঙ্গ', 'অনুদৈর্ঘ্য / যান্ত্রিক তরঙ্গ', 'অনুপ্ৰস্থ তরঙ্গ', 'স্থির তরঙ্গ'],
    correctIndex: 1,
    explanation: 'শব্দ সংকোচন ও প্রসারণের মাধ্যমে অগ্রসর হয়, তাই এটি অনুদৈর্ঘ্য যান্ত্রিক তরঙ্গ।'
  },
  {
    id: 11,
    subject: 'Physics',
    chapter: 'আলোর প্রতিফলন ও প্রতিসরণ (Light)',
    questionText: 'অবতল দর্পণের বক্রতার কেন্দ্রে কোনো লক্ষ্যবস্তু রাখলে বিম্বের আকার কেমন হবে?',
    options: ['খর্বিত', 'অত্যন্ত বিবর্ধিত', 'লক্ষ্যবস্তুর সমান আকারের', 'অসীমে গঠিত হবে'],
    correctIndex: 2,
    explanation: 'বক্রতার কেন্দ্রে (C) বস্তু রাখলে বিম্বও বক্রতার কেন্দ্রেই গঠিত হয় এবং লক্ষ্যবস্তুর সমান ও উল্টো হয়।'
  },
  {
    id: 12,
    subject: 'Physics',
    chapter: 'আলোর প্রতিফলন ও প্রতিসরণ (Light)',
    questionText: 'আলো ঘন মাধ্যম থেকে হালকা মাধ্যমে যাওয়ার সময় ক্রান্তি কোণ (Critical angle)-এর চেয়ে বড় কোণে আপতিত হলে কী ঘটে?',
    options: ['প্রতিসরণ', 'পূর্ণ অভ্যন্তরীণ প্রতিফলন', 'বিচ্ছুরণ', 'ব্যতিচার'],
    correctIndex: 1,
    explanation: 'আপতন কোণ ক্রান্তি কোণের চেয়ে বড় হলে আলো সম্পূর্ণভাবে ১ম মাধ্যমেই প্রতিফলিত হয় (পূর্ণ অভ্যন্তরীণ প্রতিফলন)।'
  },
  {
    id: 13,
    subject: 'Physics',
    chapter: 'চল তড়িৎ (Current Electricity)',
    questionText: '4 Ω এবং 6 Ω মানের দুটি রোধ সমান্তরাল সমবায়ে যুক্ত করলে তুল্যরোধ কত হবে?',
    options: ['10 Ω', '2.4 Ω', '24 Ω', '1.5 Ω'],
    correctIndex: 1,
    explanation: '1/R_p = 1/4 + 1/6 = 5/12 => R_p = 12/5 = 2.4 Ω।'
  },
  {
    id: 14,
    subject: 'Physics',
    chapter: 'চল তড়িৎ (Current Electricity)',
    questionText: 'তড়িৎ ক্ষমতার এসআই (SI) একক কোনটি?',
    options: ['জুল (Joule)', 'অ্যাম্পিয়ার (Ampere)', 'ওয়াট (Watt)', 'ভোল্ট (Volt)'],
    correctIndex: 2,
    explanation: 'একক সময়ে কৃত কাজকে ক্ষমতা বলে, ক্ষমতার এসআই একক ওয়াট (J/s বা Watt)।'
  },
  {
    id: 15,
    subject: 'Physics',
    chapter: 'তড়িৎ প্রবাহের চৌম্বক ক্রিয়া',
    questionText: 'ট্রান্সফরমার কোন নীতিতে কাজ করে?',
    options: ['স্বকীয় আবেশ', 'পারস্পরিক আবেশ (Mutual Induction)', 'কুলম্বের নীতি', 'ওহমের নীতি'],
    correctIndex: 1,
    explanation: 'ট্রান্সফরমার তড়িৎচৌম্বকীয় পারস্পরিক আবেশ নীতিতে কাজ করে।'
  },
  {
    id: 16,
    subject: 'Physics',
    chapter: 'আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স',
    questionText: 'সেমিকন্ডাক্টরে ডোপিং হিসেবে আর্সেনিক মেশালে কোন ধরণের অর্ধপরিবাহী গঠিত হয়?',
    options: ['p-type', 'n-type', 'অন্তরক', 'অতিপরিবাহী'],
    correctIndex: 1,
    explanation: 'আর্সেনিক একটি পঞ্চযোজী মৌল, যা সিলিকনে মেশালে অতিরিক্ত মুক্ত ইলেকট্রন তৈরি হয়ে n-type সেমিকন্ডাক্টর গঠন করে।'
  },
  {
    id: 17,
    subject: 'Physics',
    chapter: 'পরিমাপ ও ভৌত রাশি',
    questionText: 'ভার্নিয়ার স্কেলের 20 ঘর প্রধান স্কেলের 19 ঘরের সমান হলে ভার্নিয়ার ধ্রুবক (VC) কত? (প্রধান স্কেলের ১ ঘর = 1 mm)',
    options: ['0.1 mm', '0.05 mm', '0.02 mm', '0.005 mm'],
    correctIndex: 1,
    explanation: 'VC = s / n = 1 mm / 20 = 0.05 mm।'
  },
  {
    id: 18,
    subject: 'Physics',
    chapter: 'মহাকর্ষ ও অভিকর্ষ',
    questionText: 'পৃথিবীর কেন্দ্রে কোনো বস্তুর ওজন কত হবে?',
    options: ['অসীম', 'ভূ-পৃষ্ঠের সমান', 'শূন্য (Zero)', 'দ্বিগুণ'],
    correctIndex: 2,
    explanation: 'পৃথিবীর কেন্দ্রে অভিকর্ষজ ত্বরণ g = 0 m/s², ফলে ওজন W = mg = 0 N।'
  },
  {
    id: 19,
    subject: 'Physics',
    chapter: 'শক্তি ও পরিবেশ',
    questionText: 'কোনটি অনবায়নযোগ্য শক্তির উৎস?',
    options: ['সৌর শক্তি', 'বায়ু শক্তি', 'প্রাকৃতিক গ্যাস', 'জলবিদ্যুৎ'],
    correctIndex: 2,
    explanation: 'প্রাকৃতিক গ্যাস জীবাশ্ম জ্বালানি হওয়ায় এটি অনবায়নযোগ্য শক্তি।'
  },
  {
    id: 20,
    subject: 'Physics',
    chapter: 'গতি ও বেগ',
    questionText: 'বেগ-সময় (v-t) লেখচিত্রের ক্ষেত্রফল দ্বারা কোন রাশিটি নির্দেশিত হয়?',
    options: ['ত্বরণ', 'বল', 'অতিক্রান্ত দূরত্ব (সরণ)', 'ক্ষমতা'],
    correctIndex: 2,
    explanation: 'v-t গ্রাফের নিচের ক্ষেত্রফল = ∫ v dt = সরণ (Distance / Displacement)।'
  },
  {
    id: 21,
    subject: 'Physics',
    chapter: 'তাপ ও তাপমাত্রা',
    questionText: 'কোন তাপমাত্রায় সেলসিয়াস ও ফারেনহাইট স্কেলে একই পাঠ দেখায়?',
    options: ['0°', '40°', '-40°', '-273°'],
    correctIndex: 2,
    explanation: 'C/5 = (F-32)/9 সমীকরণে C = F = x বসালে x = -40° পাওয়া যায়।'
  },
  {
    id: 22,
    subject: 'Physics',
    chapter: 'চল তড়িৎ',
    questionText: 'একটি 100 W-এর বৈদ্যুতিক বাতি প্রতিদিন 5 ঘণ্টা জ্বালালে 30 দিনে কত ইউনিট বিদ্যুৎ খরচ হবে?',
    options: ['15 ইউনিট', '30 ইউনিট', '150 ইউনিট', '1.5 ইউনিট'],
    correctIndex: 0,
    explanation: 'E = (P × t × days) / 1000 = (100 × 5 × 30) / 1000 = 15 kWh বা 15 ইউনিট।'
  },
  {
    id: 23,
    subject: 'Physics',
    chapter: 'আলো',
    questionText: 'লেন্সের ক্ষমতার এসআই একক কী?',
    options: ['মিটার', 'ডায়োপ্টার (Diopter)', 'ক্যান্ডেলা', 'লাক্স'],
    correctIndex: 1,
    explanation: 'লেন্সের ফোকাস দূরত্বের বিপরীত রাশি হলো ক্ষমতা, এর একক ডায়োপ্টার (D বা m⁻¹)।'
  },
  {
    id: 24,
    subject: 'Physics',
    chapter: 'বল ও ভরবেগ',
    questionText: 'ভরবেগের সংরক্ষণ সূত্র কোনটি থেকে সরাসরি প্রতিপাদন করা যায়?',
    options: ['নিউটনের ১ম সূত্র', 'নিউটনের ৩য় সূত্র', 'মহাকর্ষ সূত্র', 'হুকের সূত্র'],
    correctIndex: 1,
    explanation: 'নিউটনের ৩য় সূত্র (ক্রিয়া ও প্রতিক্রিয়া বল F₁ = -F₂) থেকে ভরবেগের নিত্যতা সূত্র প্রতিপাদন করা যায়।'
  },
  {
    id: 25,
    subject: 'Physics',
    chapter: 'চিকিৎসা পদার্থবিজ্ঞান',
    questionText: 'দেহের ভেতরের নরম টিস্যু, টিউমার ও মস্তিষ্কের বিশদ 3D ছবি পাওয়ার জন্য সবচেয়ে নিরাপদ পদ্ধতি কোনটি?',
    options: ['এক্স-রে (X-Ray)', 'সিটি স্ক্যান', 'এমআরআই (MRI)', 'রেডিওথেরাপি'],
    correctIndex: 2,
    explanation: 'এমআরআই (Magnetic Resonance Imaging) কোনো ক্ষতিকর তেজস্ক্রিয় রশ্নি ছাড়াই শক্তিশালী চৌম্বকক্ষেত্র ব্যবহার করে নরম কলার নিখুঁত ছবি দেয়।'
  }
];

export const SSC_CHEMISTRY_PRESET_25: ChampionshipMcq[] = [
  {
    id: 1,
    subject: 'Chemistry',
    chapter: 'পদার্থের গঠন (Atomic Structure)',
    questionText: 'সোডিয়াম আয়ন (Na⁺)-এ কয়টি ইলেকট্রন থাকে?',
    options: ['11', '10', '12', '9'],
    correctIndex: 1,
    explanation: 'সোডিয়ামের পারমাণবিক সংখ্যা 11। Na⁺ আয়নে 1টি ইলেকট্রন কম থাকে, অর্থাৎ 11 - 1 = 10টি।'
  },
  {
    id: 2,
    subject: 'Chemistry',
    chapter: 'পর্যায় সারণি (Periodic Table)',
    questionText: 'নিচের কোন মৌলটির ইলেকট্রন আসক্তি সবচেয়ে বেশি?',
    options: ['ফ্লোরিন (F)', 'ক্লোরিন (Cl)', 'ব্রোমিন (Br)', 'আয়োডিন (I)'],
    correctIndex: 1,
    explanation: 'ফ্লোরিনের আকার অতি ক্ষুদ্র হওয়ায় ইলেকট্রন বিকর্ষণ বেশি, তাই ক্লোরিনের (Cl) ইলেকট্রন আসক্তি সর্বাধিক।'
  },
  {
    id: 3,
    subject: 'Chemistry',
    chapter: 'রাসায়নিক বন্ধন (Chemical Bonding)',
    questionText: 'মিথেন (CH₄) অণুতে কোন ধরণের রাসায়নিক বন্ধন বিদ্যমান?',
    options: ['আয়নিক বন্ধন', 'সমযোজী বন্ধন', 'ধাতব বন্ধন', 'সন্নিবেশ বন্ধন'],
    correctIndex: 1,
    explanation: 'কার্বন ও হাইড্রোজেনের মধ্যে ইলেকট্রন শেয়ারের মাধ্যমে একক সমযোজী বন্ধন তৈরি হয়।'
  },
  {
    id: 4,
    subject: 'Chemistry',
    chapter: 'মোলের ধারণা ও রাসায়নিক গণনা',
    questionText: 'প্রমাণ অবস্থায় (STP) 1 মোল যেকোনো গ্যাসের আয়তন কত লিটার?',
    options: ['22.4 L', '24.789 L', '20.0 L', '11.2 L'],
    correctIndex: 0,
    explanation: 'STP (0°C ও 1 atm চাপে) 1 মোল গ্যাসের মোলার আয়তন 22.4 লিটার।'
  },
  {
    id: 5,
    subject: 'Chemistry',
    chapter: 'মোলের ধারণা ও রাসায়নিক গণনা',
    questionText: '44 g কার্বন ডাই-অক্সাইড (CO₂)-এ কতটি অণু বিদ্যমান?',
    options: ['6.023 × 10²²', '6.023 × 10²³', '3.011 × 10²³', '1.204 × 10²⁴'],
    correctIndex: 1,
    explanation: 'CO₂ এর আণবিক ভর 44 g, যা 1 মোল নির্দেশ করে। 1 মোলে অ্যাভোগাড্রো সংখ্যক (6.023 × 10²³) অণু থাকে।'
  },
  {
    id: 6,
    subject: 'Chemistry',
    chapter: 'রাসায়নিক বিক্রিয়া (Chemical Reactions)',
    questionText: 'Fe + CuSO₄ → FeSO₄ + Cu — এটি কোন ধরণের বিক্রিয়া?',
    options: ['সংযোজন বিক্রিয়া', 'বিয়োজন বিক্রিয়া', 'প্রতিস্থাপন বিক্রিয়া', 'দহন বিক্রিয়া'],
    correctIndex: 2,
    explanation: 'লোহা কপার সালফেট দ্রবণ থেকে কপারকে অপসারিত করে নিজের স্থান দখল করে, এটি প্রতিস্থাপন বিক্রিয়া।'
  },
  {
    id: 7,
    subject: 'Chemistry',
    chapter: 'জারণ-বিজারণ (Redox)',
    questionText: 'H₂SO₄ যৌগে সালফার (S)-এর জারণ সংখ্যা কত?',
    options: ['+4', '+6', '-2', '+2'],
    correctIndex: 1,
    explanation: '2(+1) + x + 4(-2) = 0 => 2 + x - 8 = 0 => x = +6।'
  },
  {
    id: 8,
    subject: 'Chemistry',
    chapter: 'এসিড-ক্ষার সমতা (Acids & Bases)',
    questionText: 'বিশুদ্ধ পানির pH-এর মান কত (25°C-এ)?',
    options: ['0', '7', '14', '1'],
    correctIndex: 1,
    explanation: 'নিরপেক্ষ দ্রবণের (বিশুদ্ধ পানির) pH মান 7।'
  },
  {
    id: 9,
    subject: 'Chemistry',
    chapter: 'এসিড-ক্ষার সমতা',
    questionText: 'ক্ষারকীয় দ্রবণে লাল লিটমাস পেপারের রঙ কেমন হয়?',
    options: ['লালই থাকে', 'নীল বর্ণ ধারণ করে', 'হলুদ হয়', 'বর্ণহীন হয়'],
    correctIndex: 1,
    explanation: 'ক্ষারকীয় দ্রবণ লাল লিটমাসকে নীল বর্ণে রূপান্তরিত করে।'
  },
  {
    id: 10,
    subject: 'Chemistry',
    chapter: 'খনিজ সম্পদ ও জীবাশ্ম (Organic Chemistry)',
    questionText: 'প্রাকৃতিক গ্যাসের প্রধান উপাদান কোনটি?',
    options: ['ইথেন', 'প্রোপেন', 'মিথেন (CH₄)', 'বিউটেন'],
    correctIndex: 2,
    explanation: 'বাংলাদেশের প্রাকৃতিক গ্যাসে প্রায় 99% মিথেন গ্যাস থাকে।'
  },
  {
    id: 11,
    subject: 'Chemistry',
    chapter: 'জৈব যৌগ',
    questionText: 'ইথানয়িক এসিডের 4% - 10% জলীয় দ্রবণকে কী বলা হয়?',
    options: ['ফরমালিন', 'ভিনেগার (Vinegar)', 'রেকটিফাইড স্পিরিট', 'টিনচার'],
    correctIndex: 1,
    explanation: 'ইথানয়িক এসিডের 4%-10% জলীয় দ্রবণ খাদ্য সংরক্ষক ভিনেগার হিসেবে ব্যবহৃত হয়।'
  },
  {
    id: 12,
    subject: 'Chemistry',
    chapter: 'জৈব যৌগ',
    questionText: 'ফরমালডিহাইডের (HCHO) 40% জলীয় দ্রবণকে কী বলা হয়?',
    options: ['ভিনেগার', 'ফরমালিন (Formalin)', 'ইথানল', 'গ্লিসারিন'],
    correctIndex: 1,
    explanation: 'মিথান্যালের 40% জলীয় দ্রবণই ফরমালিন, যা জীবন্ত নমুনা সংরক্ষণে ব্যবহৃত হয়।'
  },
  {
    id: 13,
    subject: 'Chemistry',
    chapter: 'পর্যায় সারণি',
    questionText: 'পর্যায় সারণির গ্রুপ 18-এর মৌলগুলোকে কী বলা হয়?',
    options: ['ক্ষার ধাতু', 'হ্যালোজেন', 'নিষ্ক্রিয় গ্যাস (Noble Gases)', 'মৃৎক্ষার ধাতু'],
    correctIndex: 2,
    explanation: 'হিলিয়াম, নিয়ন, আর্গন ইত্যাদি নিষ্ক্রিয় গ্যাস গ্রুপ 18-এ অবস্থিত।'
  },
  {
    id: 14,
    subject: 'Chemistry',
    chapter: 'পর্যায় সারণি',
    questionText: 'মৌলের পর্যায়ভিত্তিক ধর্মের মধ্যে কোনটি পর্যায় বরাবর বাম থেকে ডানে হ্রাস পায়?',
    options: ['তড়িৎ ঋণাত্মকতা', 'আয়নাকরণ শক্তি', 'পরমাণুর আকার (পারমাণবিক ব্যাসার্ধ)', 'ইলেকট্রন আসক্তি'],
    correctIndex: 2,
    explanation: 'একই পর্যায়ে বাম থেকে ডানে গেলে নিউক্লিয়ার চার্জ বাড়ে এবং পরমাণুর আকার সংকুচিত হয় (ব্যাসার্ধ হ্রাস পায়)।'
  },
  {
    id: 15,
    subject: 'Chemistry',
    chapter: 'পদার্থের অবস্থা',
    questionText: 'যে প্রক্রিয়ায় কোনো কঠিন পদার্থ উত্তাপে সরাসরি গ্যাসে রূপান্তরিত হয় তাকে কী বলে?',
    options: ['বাষ্পীভবন', 'ঘনীভবন', 'উর্ধ্বপাতন (Sublimation)', 'গলন'],
    correctIndex: 2,
    explanation: 'উর্ধ্বপাতন প্রক্রিয়ায় কঠিন বস্তু তরল না হয়ে সরাসরি বাষ্পে পরিণত হয় (যেমন: কর্পূর, নিশাদল)।'
  },
  {
    id: 16,
    subject: 'Chemistry',
    chapter: 'তড়িৎ রসায়ন',
    questionText: 'লেড স্টোরেজ ব্যাটারিতে তড়িৎ বিশ্লেষ্য হিসেবে কোন এসিড ব্যবহৃত হয়?',
    options: ['HCl', 'HNO₃', 'H₂SO₄', 'CH₃COOH'],
    correctIndex: 2,
    explanation: 'গাড়ির ব্যাটারিতে সালফিউরিক এসিড (H₂SO₄) তড়িৎ বিশ্লেষ্য হিসেবে ব্যবহৃত হয়।'
  },
  {
    id: 17,
    subject: 'Chemistry',
    chapter: 'আমাদের জীবনে রসায়ন',
    questionText: 'বেকিং সোডার রাসায়নিক সংকেত কোনটি?',
    options: ['Na₂CO₃', 'NaHCO₃', 'NaCl', 'NaOH'],
    correctIndex: 1,
    explanation: 'বেকিং সোডা হলো সোডিয়াম হাইড্রোজেন কার্বনেট (NaHCO₃)।'
  },
  {
    id: 18,
    subject: 'Chemistry',
    chapter: 'আমাদের জীবনে রসায়ন',
    questionText: 'ব্লিচিং পাউডারের রাসায়নিক সংকেত কোনটি?',
    options: ['Ca(OCl)Cl', 'CaO', 'CaCO₃', 'CaCl₂'],
    correctIndex: 0,
    explanation: 'ক্যালসিয়াম ক্লোরো-হাইপোক্লোরাইট Ca(OCl)Cl হলো ব্লিচিং পাউডার।'
  },
  {
    id: 19,
    subject: 'Chemistry',
    chapter: 'রাসায়নিক বন্ধন',
    questionText: 'নিচের কোন অণুটি মুক্তজোড় (Lone pair) ইলেকট্রন ধারণ করে?',
    options: ['CH₄', 'NH₃', 'CCl₄', 'CO₂'],
    correctIndex: 1,
    explanation: 'অ্যামোনিয়া (NH₃) অণুতে নাইট্রোজেনের শেষ শক্তিস্তরে ১ জোড়া মুক্তজোড় ইলেকট্রন থাকে।'
  },
  {
    id: 20,
    subject: 'Chemistry',
    chapter: 'মৌল ও যোজনী',
    questionText: 'লোহার (Fe) পরিবর্তনশীল যোজনী কোনগুলো?',
    options: ['1 ও 2', '2 ও 3', '3 ও 4', '1 ও 3'],
    correctIndex: 1,
    explanation: 'লোহা ফেরাস (Fe²⁺) এবং ফেরিক (Fe³⁺) হিসেবে 2 ও 3 পরিবর্তনশীল যোজনী প্রদর্শন করে।'
  },
  {
    id: 21,
    subject: 'Chemistry',
    chapter: 'রসায়নের ধারণা',
    questionText: 'আগুন নেভানোর সিলিন্ডারে প্রধানত কোন গ্যাস সংকুচিত অবস্থায় থাকে?',
    options: ['অক্সিজেন', 'কার্বন ডাই-অক্সাইড (CO₂)', 'নাইট্রোজেন', 'হিলিয়াম'],
    correctIndex: 1,
    explanation: 'CO₂ গ্যাস বাতাসের চেয়ে ভারী এবং দহনে সহায়তা করে না বলে অগ্নিনির্বাপক যন্ত্রে ব্যবহৃত হয়।'
  },
  {
    id: 22,
    subject: 'Chemistry',
    chapter: 'খনিজ সম্পদ ও ধাতু নিষ্কাশন',
    questionText: 'অ্যালুমিনিয়ামের প্রধান আকরিক কোনটি?',
    options: ['বক্সাইট (Bauxite)', 'হেমাটাইট', 'ক্যালামাইন', 'গ্যালেনা'],
    correctIndex: 0,
    explanation: 'বক্সাইট (Al₂O₃·2H₂O) হলো অ্যালুমিনিয়ামের প্রধান প্রাকৃতিক আকরিক।'
  },
  {
    id: 23,
    subject: 'Chemistry',
    chapter: 'দ্রবণ ও দ্রাব্যতা',
    questionText: 'নির্দিষ্ট তাপমাত্রায় নির্দিষ্ট পরিমাণ দ্রাবকে সর্বাধিক যে পরিমাণ দ্রব দ্রবীভূত হতে পারে তাকে কী দ্রবণ বলে?',
    options: ['অসম্পৃক্ত দ্রবণ', 'সম্পৃক্ত দ্রবণ (Saturated Solution)', 'অতিপৃক্ত দ্রবণ', 'লঘু দ্রবণ'],
    correctIndex: 1,
    explanation: 'সর্বোচ্চ পরিমাণ দ্রব দ্রবীভূত থাকলে তাকে সম্পৃক্ত দ্রবণ বলা হয়।'
  },
  {
    id: 24,
    subject: 'Chemistry',
    chapter: 'রাসায়নিক শক্তি',
    questionText: 'তাপোৎপাদী বিক্রিয়ায় ডেল্টা এইচ (ΔH)-এর মান কেমন হয়?',
    options: ['ধনাত্মক (+)', 'ঋণাত্মক (-)', 'শূন্য', 'অসীম'],
    correctIndex: 1,
    explanation: 'তাপোৎপাদী বিক্রিয়ায় তাপ নির্গত হয়, তাই এনথালপির পরিবর্তন ΔH ঋণাত্মক (-) হয়।'
  },
  {
    id: 25,
    subject: 'Chemistry',
    chapter: 'পরিবেশ রসায়ন',
    questionText: 'এসিড বৃষ্টির জন্য দায়ী প্রধান গ্যাস কোনটি?',
    options: ['CH₄ ও CO', 'SO₂ ও NO₂', 'O₂ ও N₂', 'He ও Ar'],
    correctIndex: 1,
    explanation: 'সালফার ডাই-অক্সাইড (SO₂) এবং নাইট্রোজেনের অক্সাইড (NO₂) বৃষ্টির পানির সাথে বিক্রিয়া করে সালফিউরিক ও নাইট্রিক এসিড তৈরি করে।'
  }
];

export const SSC_BIOLOGY_PRESET_25: ChampionshipMcq[] = [
  {
    id: 1,
    subject: 'Biology',
    chapter: 'জীবকোষ ও টিস্যু (Cell & Tissue)',
    questionText: 'কোষের শক্তিঘর (Powerhouse of the Cell) বলা হয় কোন অঙ্গাণুকে?',
    options: ['রাইবোসোম', 'গলগি বডি', 'মাইটোকন্ড্রিয়া (Mitochondria)', 'লাইসোসোম'],
    correctIndex: 2,
    explanation: 'মাইটোকন্ড্রিয়ায় ক্রেবস চক্র ও শ্বসন প্রক্রিয়ায় সর্বাধিক ATP উৎপাদিত হয়, তাই একে শক্তিঘর বলে।'
  },
  {
    id: 2,
    subject: 'Biology',
    chapter: 'জীবকোষ ও টিস্যু',
    questionText: 'উদ্ভিদের দেহে পানি ও খনিজ লবণ পরিবহনের দায়িত্বে নিয়োজিত টিস্যু কোনটি?',
    options: ['ফ্লোয়েম', 'জাইলেম (Xylem)', 'প্যারেনকাইমা', 'কোলেনকাইমা'],
    correctIndex: 1,
    explanation: 'জাইলেম টিস্যু মূল থেকে কাণ্ড ও পাতায় পানি ও খনিজ লবণ ঊর্ধ্বমুখী পরিবহন করে।'
  },
  {
    id: 3,
    subject: 'Biology',
    chapter: 'কোষ বিভাজন (Cell Division)',
    questionText: 'মাইটোসিস কোষ বিভাজনের কোন ধাপে ক্রোমোজোমগুলো বিষুবীয় অঞ্চলে অবস্থান নেয়?',
    options: ['প্রোফেজ', 'মেটাফেজ (Metaphase)', 'অ্যানাফেজ', 'টেলোফেজ'],
    correctIndex: 1,
    explanation: 'মেটাফেজ ধাপে স্পিন্ডল যন্ত্রের বিষুবীয় অঞ্চলে ক্রোমোজোমসমূহ সারিবদ্ধভাবে সজ্জিত হয়।'
  },
  {
    id: 4,
    subject: 'Biology',
    chapter: 'কোষ বিভাজন',
    questionText: 'মায়োসিস (Meiosis) কোষ বিভাজন মূলত কোথায় ঘটে?',
    options: ['দেহ কোষে', 'জনন মাতৃকোষে', 'মূলের অগ্রভাগে', 'ভ্রূণমূলে'],
    correctIndex: 1,
    explanation: 'জনন মাতৃকোষে মায়োসিস বিভাজনের ফলে হ্যাপ্লয়েড গ্যামেট (শুক্রাণু ও ডিম্বাণু) তৈরি হয়।'
  },
  {
    id: 5,
    subject: 'Biology',
    chapter: 'জীবনীশক্তি (Bioenergetics)',
    questionText: 'সালোকসংশ্লেষণ প্রক্রিয়ায় উপজাত (By-product) হিসেবে কোনটি নির্গত হয়?',
    options: ['CO₂', 'O₂ (অক্সিজেন)', 'গ্লুকোজ', 'পানি'],
    correctIndex: 1,
    explanation: 'পানির ফটোলাইসিস প্রক্রিয়ার মাধ্যমে উপজাত হিসেবে অক্সিজেন (O₂) পরিবেশে মুক্ত হয়।'
  },
  {
    id: 6,
    subject: 'Biology',
    chapter: 'জীবনীশক্তি',
    questionText: 'শ্বসনের কোন ধাপে অক্সিজেনের কোনো প্রয়োজন হয় না?',
    options: ['গ্লাইকোলাইসিস (Glycolysis)', 'অ্যাসিটাইল কো-এ সৃষ্টি', 'ক্রেবস চক্র', 'ইটিএস'],
    correctIndex: 0,
    explanation: 'গ্লাইকোলাইসিস সাইটোপ্লাজমে সংঘটিত হয় এবং এতে অক্সিজেনের প্রয়োজন হয় না।'
  },
  {
    id: 7,
    subject: 'Biology',
    chapter: 'উদ্ভিদে পরিবহন ও প্রস্বেদন',
    questionText: 'উদ্ভিদ তার অতিরিক্ত পানি বাষ্পাকারে বের করে দেওয়ার প্রক্রিয়াকে কী বলে?',
    options: ['অভিস্রবণ', 'ব্যাপন', 'প্রস্বেদন (Transpiration)', 'ইমবাইবিশন'],
    correctIndex: 2,
    explanation: 'পাতার পত্ররন্ধ্রের মাধ্যমে অতিরিক্ত পানি বাষ্পাকারে বের হয়ে যাওয়াকে প্রস্বেদন বলে।'
  },
  {
    id: 8,
    subject: 'Biology',
    chapter: 'মানব শারীরতত্ত্ব - রক্ত সংবহন',
    questionText: 'মানবদেহের কোন রক্তকণিকাকে দেহের "প্রহরী বা সৈনিক" বলা হয়?',
    options: ['লোহিত রক্তকণিকা (RBC)', 'শ্বেত রক্তকণিকা (WBC)', 'অণুচক্রিকা (Platelet)', 'প্লাজমা'],
    correctIndex: 1,
    explanation: 'শ্বেত রক্তকণিকা ফ্যাগোসাইটোসিস পদ্ধতিতে জীবাণু ধ্বংস করে দেহের রোগ প্রতিরোধ বজায় রাখে।'
  },
  {
    id: 9,
    subject: 'Biology',
    chapter: 'রক্ত সংবহন',
    questionText: 'রক্তের সার্বজনীন গ্রহীতা (Universal Recipient) কোন গ্রুপের রক্তকে বলা হয়?',
    options: ['A', 'B', 'AB', 'O'],
    correctIndex: 2,
    explanation: 'AB রক্ত গ্রুপে কোনো অ্যান্টিবডি থাকে না, তাই এরা সকল গ্রুপের রক্ত গ্রহণ করতে পারে।'
  },
  {
    id: 10,
    subject: 'Biology',
    chapter: 'পরিপাক ও পৌষ্টিকতন্ত্র',
    questionText: 'মানবদেহের সবচেয়ে বড় গ্রন্থি কোনটি?',
    options: ['অগ্ন্যাশয়', 'যকৃৎ (Liver)', 'থাইরয়েড', 'পিটুইটারি'],
    correctIndex: 1,
    explanation: 'যকৃৎ মানবদেহের বৃহত্তম জৈব রাসায়নিক গবেষণাগার ও গ্রন্থি।'
  },
  {
    id: 11,
    subject: 'Biology',
    chapter: 'পরিপাকতন্ত্র',
    questionText: 'পাকস্থলীতে প্রোটিন পরিপাককারী প্রধান এনজাইম কোনটি?',
    options: ['টায়ালিন', 'পেপসিন (Pepsin)', 'ট্রিপসিন', 'লাইপেজ'],
    correctIndex: 1,
    explanation: 'পাকস্থলীর গ্যাস্ট্রিক জুসে থাকা পেপসিনোজেন HCl-এর উপস্থিতিতে সক্রিয় পেপসিনে পরিণত হয়ে প্রোটিন ভাঙে।'
  },
  {
    id: 12,
    subject: 'Biology',
    chapter: 'রেচনতন্ত্র (Excretion)',
    questionText: 'বৃক্কের (Kidney) গঠন ও কাজের একক কোনটি?',
    options: ['নিউরন', 'নেফ্রন (Nephron)', 'অ্যালভিওলাই', 'সাইটন'],
    correctIndex: 1,
    explanation: 'বৃক্কের গঠন ও কাজের কার্যকরী একক হলো নেফ্রন (প্রতি বৃক্কে প্রায় ১০-১২ লাখ থাকে)।'
  },
  {
    id: 13,
    subject: 'Biology',
    chapter: 'স্নায়ুতন্ত্র ও হরমোন',
    questionText: 'মস্তিষ্কের কোন অংশ মানবদেহের ভারসাম্য রক্ষা করে?',
    options: ['সেরিব্রাম', 'সেরিবেলাম (Cerebellum)', 'মেডুলা', 'পনস'],
    correctIndex: 1,
    explanation: 'পশ্চাৎ মস্তিষ্কের সেরিবেলাম পেশির টান ও দেহের শারীরিক ভারসাম্য নিয়ন্ত্রণ করে।'
  },
  {
    id: 14,
    subject: 'Biology',
    chapter: 'স্নায়ুতন্ত্র',
    questionText: 'মানবদেহে ইনসুলিন হরমোন কোথা থেকে ক্ষরিত হয়?',
    options: ['যকৃৎ', 'অগ্ন্যাশয়ের আইলেটস অব ল্যাঙ্গারহ্যান্স', 'থাইরয়েড গ্রন্থি', 'অ্যাড্রেনাল গ্রন্থি'],
    correctIndex: 1,
    explanation: 'অগ্ন্যাশয়ের আইলেটস অব ল্যাঙ্গারহ্যান্সের বিটা (β) কোষ থেকে ইনসুলিন নিঃসৃত হয়।'
  },
  {
    id: 15,
    subject: 'Biology',
    chapter: 'জীবের প্রজনন',
    questionText: 'একটি আদর্শ ফুলের কয়টি স্তবক থাকে?',
    options: ['৩টি', '৪টি', '৫টি', '৬টি'],
    correctIndex: 2,
    explanation: 'আদর্শ ফুলে ৫টি স্তবক থাকে: পুষ্পাক্ষ, বৃত্যংশ, দলমন্ডল, পুংস্তবক এবং স্ত্রীস্তবক।'
  },
  {
    id: 16,
    subject: 'Biology',
    chapter: 'বংশগতি ও বিবর্তন (Genetics & Evolution)',
    questionText: 'বংশগতির জনক (Father of Genetics) কাকে বলা হয়?',
    options: ['চার্লস ডারউইন', 'গ্রেগর জোহান মেন্ডেল', 'রবার্ট হুক', 'লুই পাস্তুর'],
    correctIndex: 1,
    explanation: 'মটরশুঁটি গাছের ওপর গবেষণা করে বংশগতির মৌলিক সূত্র আবিষ্কারের কারণে মেন্ডেলকে বংশগতির জনক বলা হয়।'
  },
  {
    id: 17,
    subject: 'Biology',
    chapter: 'বংশগতি ও ডিএনএ',
    questionText: 'ডিএনএ (DNA) অণুতে এডেনিন (A)-এর সাথে কয়টি হাইড্রোজেন বন্ধন দিয়ে থাইমিন (T) যুক্ত থাকে?',
    options: ['১টি', '২টি', '৩টি', '৪টি'],
    correctIndex: 1,
    explanation: 'A ও T-এর মধ্যে ২টি (A = T) এবং G ও C-এর মধ্যে ৩টি (G ≡ C) হাইড্রোজেন বন্ধন থাকে।'
  },
  {
    id: 18,
    subject: 'Biology',
    chapter: 'বংশগতি',
    questionText: 'মানুষের দেহকোষে ক্রোমোজোম সংখ্যা কতটি?',
    options: ['২৩টি', '৪৬টি (২৩ জোড়া)', '৪৪টি', '৪৮টি'],
    correctIndex: 1,
    explanation: 'মানুষের ডিপ্লয়েড দেহকোষে ২৩ জোড়া বা মোট ৪৬টি ক্রোমোজোম থাকে।'
  },
  {
    id: 19,
    subject: 'Biology',
    chapter: 'জীবপ্রযুক্তি (Biotechnology)',
    questionText: 'কোন এনজাইমকে জৈব কাঁচি বা আণবিক কাঁচি (Molecular Scissors) বলা হয়?',
    options: ['ডিএনএ পলিমারেজ', 'লাইগেজ', 'রেস্ট্রিকশন এনজাইম (Restriction Enzyme)', 'অ্যামাইলেজ'],
    correctIndex: 2,
    explanation: 'রেস্ট্রিকশন এনজাইম দিয়ে ডিএনএ অণুর নির্দিষ্ট অংশ কেটে নেওয়া যায় বলে একে আণবিক কাঁচি বলে।'
  },
  {
    id: 20,
    subject: 'Biology',
    chapter: 'বাস্তুসংস্থান ও পরিবেশ (Ecology)',
    questionText: 'একটি পুকুরের বাস্তুসংস্থানে ১ম স্তরের খাদক কোনটি?',
    options: ['ফাইটোপ্ল্যাঙ্কটন', 'জুপ্ল্যাঙ্কটন ও ছোট মাছ', 'বড় বোয়াল মাছ', 'জলজ শেওলা'],
    correctIndex: 1,
    explanation: 'উৎপাদক ফাইটোপ্ল্যাঙ্কটনকে যারা প্রথম ভক্ষণ করে (জুপ্ল্যাঙ্কটন ও পতঙ্গ) তারা ১ম স্তরের খাদক।'
  },
  {
    id: 21,
    subject: 'Biology',
    chapter: 'শ্বসনতন্ত্র',
    questionText: 'ফুসফুসের কার্যকরী একক কোনটি যেখানে গ্যাসীয় বিনিময় ঘটে?',
    options: ['ব্রঙ্কাস', 'অ্যালভিওলাই (Alveoli)', 'ট্রাকিয়া', 'প্লুরা'],
    correctIndex: 1,
    explanation: 'অ্যালভিওলাসের পাতলা প্রাচীর দিয়ে কৈশিকজালিকার রক্তের সাথে অক্সিজেন ও CO₂ বিনিময় ঘটে।'
  },
  {
    id: 22,
    subject: 'Biology',
    chapter: 'অস্থি ও পেশি',
    questionText: 'হাড়ের সাথে পেশিকে সংযুক্ত করে কোনটি?',
    options: ['লিগামেন্ট', 'টেন্ডন (Tendon)', 'তরুণাস্থি', 'মজ্জা'],
    correctIndex: 1,
    explanation: 'টেন্ডন হলো ঘন শ্বেত তন্তুময় যোজক কলা যা মাংসপেশিকে অস্থির সাথে দৃঢ়ভাবে যুক্ত করে।'
  },
  {
    id: 23,
    subject: 'Biology',
    chapter: 'রোগ ও স্বাস্থ্য',
    questionText: 'ডেঙ্গু জ্বরের জীবাণু কোন মশার মাধ্যমে মানবদেহে ছড়ায়?',
    options: ['অ্যানোফিলিস মশা', 'এডিস মশা (Aedes aegypti)', 'কিউলেক্স মশা', 'মাছি'],
    correctIndex: 1,
    explanation: 'এডিস মশা ডেঙ্গু ভাইরাস (ফ্ল্যাভিভাইরাস) বহন করে মানুষের রক্তে সংক্রমণ ঘটায়।'
  },
  {
    id: 24,
    subject: 'Biology',
    chapter: 'উদ্ভিদ শারীরতত্ত্ব',
    questionText: 'কোন আলোর উপস্থিতিতে সালোকসংশ্লেষণের হার সবচেয়ে বেশি হয়?',
    options: ['সবুজ ও হলুদ আলো', 'লাল ও নীল আলো', 'বেগুনি ও আসমানি', 'কেবল সাদা আলো'],
    correctIndex: 1,
    explanation: 'ক্লোরোফিল লাল ও নীল আলো সর্বাধিক শোষণ করে, ফলে এ দুই আলোতে সালোকসংশ্লেষণ সর্বোচ্চ হয়।'
  },
  {
    id: 25,
    subject: 'Biology',
    chapter: 'কোষ অঙ্গাণু',
    questionText: 'আত্মঘাতী থলিকা (Suicidal Bag) নামে পরিচিত কোষীয় অঙ্গাণু কোনটি?',
    options: ['গলগি বডি', 'লাইসোসোম (Lysosome)', 'সেন্ট্রোসোম', 'প্লাস্টিড'],
    correctIndex: 1,
    explanation: 'লাইসোসোমে তীব্র হাইড্রোলাইটিক এনজাইম থাকে যা তীব্র প্রতিকূলতায় ফেটে গিয়ে সম্পূর্ণ কোষকে পাচিত করে ধ্বংস করতে পারে।'
  }
];

export const CHAMPIONSHIP_PRESETS = {
  PHYSICS: {
    title: 'SSC Physics 24-Hour Board Mastery Challenge (25 MCQs)',
    subject: 'Physics',
    chapter: 'গতি, বল, কাজ-শক্তি, তরঙ্গ, চলতড়িৎ ও আধুনিক পদার্থবিজ্ঞান',
    timeLimitMinutes: 12,
    questions: SSC_PHYSICS_PRESET_25
  },
  CHEMISTRY: {
    title: 'SSC Chemistry 24-Hour Ultimate Board Challenge (25 MCQs)',
    subject: 'Chemistry',
    chapter: 'পদার্থের গঠন, পর্যায় সারণি, রাসায়নিক বন্ধন, মোল ও জৈব রসায়ন',
    timeLimitMinutes: 12,
    questions: SSC_CHEMISTRY_PRESET_25
  },
  BIOLOGY: {
    title: 'SSC Biology 24-Hour Champion Exam (25 MCQs)',
    subject: 'Biology',
    chapter: 'কোষ, বিভাজন, জীবনীশক্তি, সংবহন, বংশগতি ও বাস্তুসংস্থান',
    timeLimitMinutes: 12,
    questions: SSC_BIOLOGY_PRESET_25
  }
};
