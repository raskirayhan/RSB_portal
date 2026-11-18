// Official NCTB Textbooks Dataset for Class 8 (JSC), SSC, and HSC
// Provided for Rayhan's Science Lab students

export interface NctbBook {
  id: string;
  title: string;
  classLevel: 'CLASS_8' | 'SSC' | 'HSC';
  classLabel: string;
  subject: string;
  coverImage: string;
  pdfUrl: string;
  fileSize: string;
  description: string;
}

export const NCTB_BOOKS: NctbBook[] = [
  // --- CLASS 8 (JSC) ---
  {
    id: 'nctb-class8-science',
    title: 'বিজ্ঞান (Class 8 Science)',
    classLevel: 'CLASS_8',
    classLabel: '৮ম শ্রেণি (JSC)',
    subject: 'Science',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80',
    pdfUrl: 'http://www.nctb.gov.bd/',
    fileSize: '১২.৫ MB',
    description: 'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত ৮ম শ্রেণির বিজ্ঞান মূল পাঠ্যবই।',
  },
  {
    id: 'nctb-class8-math',
    title: 'গণিত (Class 8 Mathematics)',
    classLevel: 'CLASS_8',
    classLabel: '৮ম শ্রেণি (JSC)',
    subject: 'Mathematics',
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80',
    pdfUrl: 'http://www.nctb.gov.bd/',
    fileSize: '১৪.২ MB',
    description: '৮ম শ্রেণির পাটিগণিত, বীজগণিত ও জ্যামিতির সম্পূর্ণ অফিসিয়াল বোর্ড পাঠ্যবই।',
  },
  {
    id: 'nctb-class8-ict',
    title: 'তথ্য ও যোগাযোগ প্রযুক্তি (Class 8 ICT)',
    classLevel: 'CLASS_8',
    classLabel: '৮ম শ্রেণি (JSC)',
    subject: 'ICT',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
    pdfUrl: 'http://www.nctb.gov.bd/',
    fileSize: '৮.১ MB',
    description: 'কম্পিউটার নেটওয়ার্ক, তথ্য নিরাপত্তা ও স্প্রেডশিটের মৌলিক বোর্ড বই।',
  },

  // --- SSC (Classes 9-10) ---
  {
    id: 'nctb-ssc-physics',
    title: 'পদার্থবিজ্ঞান (SSC Physics)',
    classLevel: 'SSC',
    classLabel: 'এসএসসি (নবম-দশম)',
    subject: 'Physics',
    coverImage: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=400&q=80',
    pdfUrl: 'http://www.nctb.gov.bd/',
    fileSize: '১৮.৬ MB',
    description: 'গতি, বল, কাজ-ক্ষমতা-শক্তি, আলো ও বিদ্যুতের সম্পূর্ণ বোর্ড পাঠ্যবই।',
  },
  {
    id: 'nctb-ssc-chemistry',
    title: 'রসায়ন (SSC Chemistry)',
    classLevel: 'SSC',
    classLabel: 'এসএসসি (নবম-দশম)',
    subject: 'Chemistry',
    coverImage: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=400&q=80',
    pdfUrl: 'http://www.nctb.gov.bd/',
    fileSize: '১৬.৪ MB',
    description: 'পদার্থের গঠন, পর্যায় সারণি, রাসায়নিক বন্ধন ও বিক্রিয়ার মূল বোর্ড বই।',
  },
  {
    id: 'nctb-ssc-higher-math',
    title: 'উচ্চতর গণিত (SSC Higher Math)',
    classLevel: 'SSC',
    classLabel: 'এসএসসি (নবম-দশম)',
    subject: 'Higher Math',
    coverImage: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=400&q=80',
    pdfUrl: 'http://www.nctb.gov.bd/',
    fileSize: '১৫.৮ MB',
    description: 'সেট ও ফাংশন, বীজগণিতীয় রাশি, জ্যামিতি ও ত্রিকোণমিতির অফিসিয়াল বই।',
  },
  {
    id: 'nctb-ssc-biology',
    title: 'জীববিজ্ঞান (SSC Biology)',
    classLevel: 'SSC',
    classLabel: 'এসএসসি (নবম-দশম)',
    subject: 'Biology',
    coverImage: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=400&q=80',
    pdfUrl: 'http://www.nctb.gov.bd/',
    fileSize: '১৭.১ MB',
    description: 'কোষ ও কলা, প্রস্বেদন, বংশগতি ও জীবপ্রযুক্তির মূল বোর্ড পাঠ্যবই।',
  },
  {
    id: 'nctb-ssc-ict',
    title: 'তথ্য ও যোগাযোগ প্রযুক্তি (SSC ICT)',
    classLevel: 'SSC',
    classLabel: 'এসএসসি (নবম-দশম)',
    subject: 'ICT',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    pdfUrl: 'http://www.nctb.gov.bd/',
    fileSize: '৯.২ MB',
    description: 'ডিজিটাল নিরাপত্তা, ওয়ার্ড প্রসেসিং ও ডাটাবেসের সম্পূর্ণ বোর্ড বই।',
  },

  // --- HSC (Classes 11-12) ---
  {
    id: 'nctb-hsc-physics-1',
    title: 'পদার্থবিজ্ঞান ১ম পত্র (HSC Physics 1st Paper)',
    classLevel: 'HSC',
    classLabel: 'এইচএসসি (একাদশ-দ্বাদশ)',
    subject: 'Physics',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80',
    pdfUrl: 'http://www.nctb.gov.bd/',
    fileSize: '২২.৩ MB',
    description: 'ভেক্টর, গতিবিদ্যা, নিউটনীয় বলবিদ্যা ও মহাকর্ষের উচ্চ মাধ্যমিক পাঠ্যবই।',
  },
  {
    id: 'nctb-hsc-physics-2',
    title: 'পদার্থবিজ্ঞান ২য় পত্র (HSC Physics 2nd Paper)',
    classLevel: 'HSC',
    classLabel: 'এইচএসসি (একাদশ-দ্বাদশ)',
    subject: 'Physics',
    coverImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=400&q=80',
    pdfUrl: 'http://www.nctb.gov.bd/',
    fileSize: '২৩.৫ MB',
    description: 'তাপগতিবিদ্যা, স্থির তড়িৎ, চল তড়িৎ ও আধুনিক পদার্থবিজ্ঞানের মূল বই।',
  },
  {
    id: 'nctb-hsc-chemistry-1',
    title: 'রসায়ন ১ম পত্র (HSC Chemistry 1st Paper)',
    classLevel: 'HSC',
    classLabel: 'এইচএসসি (একাদশ-দ্বাদশ)',
    subject: 'Chemistry',
    coverImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=400&q=80',
    pdfUrl: 'http://www.nctb.gov.bd/',
    fileSize: '২১.৮ MB',
    description: 'গুণগত রসায়ন, পর্যায়বৃত্ত ধর্ম ও রাসায়নিক পরিবর্তনের সম্পূর্ণ বই।',
  },
  {
    id: 'nctb-hsc-chemistry-2',
    title: 'রসায়ন ২য় পত্র (HSC Chemistry 2nd Paper)',
    classLevel: 'HSC',
    classLabel: 'এইচএসসি (একাদশ-দ্বাদশ)',
    subject: 'Chemistry',
    coverImage: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=400&q=80',
    pdfUrl: 'http://www.nctb.gov.bd/',
    fileSize: '২৪.১ MB',
    description: 'পরিবেশ রসায়ন, জৈব যৌগ (Organic Chemistry) ও তড়িৎ রসায়নের পাঠ্যবই।',
  },
  {
    id: 'nctb-hsc-higher-math',
    title: 'উচ্চতর গণিত ১ম ও ২য় পত্র (HSC Higher Math)',
    classLevel: 'HSC',
    classLabel: 'এইচএসসি (একাদশ-দ্বাদশ)',
    subject: 'Higher Math',
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80',
    pdfUrl: 'http://www.nctb.gov.bd/',
    fileSize: '২৬.৪ MB',
    description: 'ম্যাট্রিক্স, সরলরেখা, ক্যালকুলাস (অন্তরীকরণ ও যোগজীকরণ) ও কনিক্স।',
  },
  {
    id: 'nctb-hsc-ict',
    title: 'তথ্য ও যোগাযোগ প্রযুক্তি (HSC ICT)',
    classLevel: 'HSC',
    classLabel: 'এইচএসসি (একাদশ-দ্বাদশ)',
    subject: 'ICT',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80',
    pdfUrl: 'http://www.nctb.gov.bd/',
    fileSize: '১৫.২ MB',
    description: 'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস, ওয়েব ডিজাইন (HTML) ও সি প্রোগ্রামিং (C)।',
  },
];
