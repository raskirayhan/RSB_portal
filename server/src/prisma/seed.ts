import { PrismaClient, Role, UserStatus, MaterialType, InvoiceStatus, PaymentMethod, PaymentStatus, GameType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { QrService } from '../services/qrService.js';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding RSB_portal initial database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Super Admin (Rayhan Sir)
  const admin = await prisma.user.upsert({
    where: { email: 'rayhan@rsb.com' },
    update: {},
    create: {
      name: 'Rayhan Sir',
      email: 'rayhan@rsb.com',
      passwordHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`[Seed] Super Admin created: ${admin.email}`);

  // 2. Seed Batches
  const batchSsc = await prisma.batch.upsert({
    where: { id: 'batch-ssc-26' },
    update: {},
    create: {
      id: 'batch-ssc-26',
      name: 'SSC 2026 Science Master Batch',
      academicLevel: 'SSC',
      scheduleDays: 'রবি, মঙ্গল, বৃহস্পতি',
      timeSlot: 'বিকাল ৪:০০ - ৬:০০',
      monthlyFee: 2000.0,
      isActive: true,
    },
  });

  const batchHsc = await prisma.batch.upsert({
    where: { id: 'batch-hsc-26' },
    update: {},
    create: {
      id: 'batch-hsc-26',
      name: 'HSC 2026 Science VIP Batch',
      academicLevel: 'HSC',
      scheduleDays: 'সোম, বুধ, শুক্র',
      timeSlot: 'বিকাল ৫:০০ - ৭:৩০',
      monthlyFee: 2500.0,
      isActive: true,
    },
  });

  const batchClass8 = await prisma.batch.upsert({
    where: { id: 'batch-class8-26' },
    update: {},
    create: {
      id: 'batch-class8-26',
      name: 'Class 8 (JSC) Science & Math Foundation Batch',
      academicLevel: 'CLASS_8',
      scheduleDays: 'শনি, সোম, বুধ',
      timeSlot: 'বিকাল ৩:০০ - ৪:৩০',
      monthlyFee: 1500.0,
      isActive: true,
    },
  });

  // 3. Seed Subjects & Chapters
  const subjectsData = [
    {
      code: 'PHYSICS',
      name: 'Physics (পদার্থবিজ্ঞান)',
      academicLevel: 'BOTH',
      chapters: [
        { title: 'অধ্যায় ২: ভেক্টর (Vectors & 3D Calculations)', chapterNumber: 2 },
        { title: 'অধ্যায় ৩: গতিবিদ্যা (Dynamics & Projectile Motion)', chapterNumber: 3 },
        { title: 'অধ্যায় ৪: নিউটনীয় বলবিদ্যা (Newtonian Mechanics)', chapterNumber: 4 },
      ],
    },
    {
      code: 'CHEMISTRY',
      name: 'Chemistry (রসায়ন)',
      academicLevel: 'BOTH',
      chapters: [
        { title: 'অধ্যায় ২: গুণগত রসায়ন (Qualitative Chemistry)', chapterNumber: 2 },
        { title: 'অধ্যায় ৩: পর্যায়বৃত্ত ধর্ম (Periodic Properties)', chapterNumber: 3 },
        { title: 'অধ্যায় ২ (২য় পত্র): জৈব যৌগ (Organic Chemistry)', chapterNumber: 2 },
      ],
    },
    {
      code: 'HIGHER_MATH',
      name: 'Higher Math (উচ্চতর গণিত)',
      academicLevel: 'BOTH',
      chapters: [
        { title: 'অধ্যায় ১: ম্যাট্রিক্স ও নির্ণায়ক (Matrices & Determinants)', chapterNumber: 1 },
        { title: 'অধ্যায় ৩: সরলরেখা (Straight Lines)', chapterNumber: 3 },
        { title: 'অধ্যায় ৯: অন্তরীকরণ (Differentiation & Calculus)', chapterNumber: 9 },
      ],
    },
    {
      code: 'BIOLOGY',
      name: 'Biology (জীববিজ্ঞান)',
      academicLevel: 'BOTH',
      chapters: [
        { title: 'অধ্যায় ১: কোষ ও এর গঠন (Cell Structure)', chapterNumber: 1 },
        { title: 'অধ্যায় ১১: জিনতত্ত্ব ও বিবর্তন (Genetics)', chapterNumber: 11 },
      ],
    },
    {
      code: 'ICT',
      name: 'ICT (তথ্য ও যোগাযোগ প্রযুক্তি)',
      academicLevel: 'HSC',
      chapters: [
        { title: 'অধ্যায় ৩: সংখ্যা পদ্ধতি ও ডিজিটাল লজিক (Logic Gates)', chapterNumber: 3 },
        { title: 'অধ্যায় ৫: প্রোগ্রামিং ভাষা (C Programming)', chapterNumber: 5 },
      ],
    },
    {
      code: 'CLASS_8_SCIENCE',
      name: 'Class 8 Science (বিজ্ঞান)',
      academicLevel: 'CLASS_8',
      chapters: [
        { title: 'অধ্যায় ১: প্রাণিজগতের শ্রেণিবিন্যাস', chapterNumber: 1 },
        { title: 'অধ্যায় ৮: রাসায়নিক বিক্রিয়া ও সমীকরণ', chapterNumber: 8 },
        { title: 'অধ্যায় ৯: বর্তনী ও চলবিদ্যুৎ', chapterNumber: 9 },
      ],
    },
    {
      code: 'CLASS_8_MATH',
      name: 'Class 8 Math (গণিত)',
      academicLevel: 'CLASS_8',
      chapters: [
        { title: 'অধ্যায় ১: প্যাটার্ন ও সংখ্যাতত্ত্ব', chapterNumber: 1 },
        { title: 'অধ্যায় ৪: বীজগণিতীয় সূত্রাবলী ও প্রয়োগ', chapterNumber: 4 },
      ],
    },
  ];

  for (const s of subjectsData) {
    const subject = await prisma.subject.upsert({
      where: { code: s.code },
      update: {},
      create: {
        name: s.name,
        code: s.code,
        academicLevel: s.academicLevel,
      },
    });

    for (const c of s.chapters) {
      let chapter = await prisma.chapter.findFirst({
        where: { subjectId: subject.id, chapterNumber: c.chapterNumber },
      });

      if (!chapter) {
        chapter = await prisma.chapter.create({
          data: {
            subjectId: subject.id,
            title: c.title,
            chapterNumber: c.chapterNumber,
          },
        });
      }

      const matCount = await prisma.studyMaterial.count({
        where: { chapterId: chapter.id },
      });

      if (matCount === 0) {
        await prisma.studyMaterial.createMany({
          data: [
            {
              title: `${c.title} - লেকচার শিট ও বোর্ড থিওরি`,
              chapterId: chapter.id,
              materialType: MaterialType.LECTURE_SHEET,
              fileUrl: 'generated',
              fileSize: '2.4 MB',
              isPremium: true,
            },
            {
              title: `${c.title} - সূত্রের শিট ও শর্টকাট নোট`,
              chapterId: chapter.id,
              materialType: MaterialType.FORMULA_SHEET,
              fileUrl: 'generated',
              fileSize: '1.1 MB',
              isPremium: true,
            },
            {
              title: `${c.title} - ক্যাডেট কলেজ সৃজনশীল CQ প্রশ্নব্যাংক`,
              chapterId: chapter.id,
              materialType: MaterialType.CQ_QUESTION_BANK,
              fileUrl: 'generated',
              fileSize: '3.6 MB',
              isPremium: true,
            },
          ],
        });
      }
    }
  }

  // 4. Seed Demo Videos (Real Faceless 3D Science Concept Lessons from Extraclass)
  await prisma.demoVideo.deleteMany();
  await prisma.demoVideo.createMany({
    data: [
      {
        title: 'ডপলার ক্রিয়া ও শব্দ তরঙ্গের ৩ডি বিশ্লেষণ (Doppler Effect in Sound Waves)',
        subject: 'Physics',
        chapter: 'তরঙ্গ ও শব্দ (Wave & Sound)',
        duration: '৩:৩০ মিনিট',
        youtubeUrl: 'https://www.youtube.com/watch?v=mv6C99LCcxg',
        thumbnailUrl: 'https://img.youtube.com/vi/mv6C99LCcxg/hqdefault.jpg',
        featured: true,
      },
      {
        title: 'টর্ক ও ঘূর্ণন বলবিদ্যার ৩ডি মেকানিজম (What is Torque & Rotational Dynamics)',
        subject: 'Physics',
        chapter: 'নিউটনিয়ান বলবিদ্যা (Mechanics)',
        duration: '৩:১৫ মিনিট',
        youtubeUrl: 'https://www.youtube.com/watch?v=zXxrAJld9mo',
        thumbnailUrl: 'https://img.youtube.com/vi/zXxrAJld9mo/hqdefault.jpg',
        featured: true,
      },
      {
        title: 'মুক্তিবেগ ও কৃত্রিম উপগ্রহের ৩ডি গতিপথ (Escape Velocity & Orbital Motion)',
        subject: 'Physics',
        chapter: 'মহাকর্ষ ও অভিকর্ষ (Gravitation)',
        duration: '৩:২০ মিনিট',
        youtubeUrl: 'https://www.youtube.com/watch?v=tgHsjvSWQe8',
        thumbnailUrl: 'https://img.youtube.com/vi/tgHsjvSWQe8/hqdefault.jpg',
        featured: true,
      },
      {
        title: 'জারণ-বিজারণ ও ইলেকট্রন স্থানান্তরের ৩ডি মেকানিজম (Redox Reaction 3D Mechanism)',
        subject: 'Chemistry',
        chapter: 'জারণ-বিজারণ ও তড়িৎ রসায়ন',
        duration: '৪:১৯ মিনিট',
        youtubeUrl: 'https://www.youtube.com/watch?v=h3XTkpTDN-E',
        thumbnailUrl: 'https://img.youtube.com/vi/h3XTkpTDN-E/hqdefault.jpg',
        featured: true,
      },
      {
        title: 'লা শাতেলিয়ের নীতি ও বিক্রিয়ার সাম্যাবস্থা (Le Chatelier’s Principle 3D)',
        subject: 'Chemistry',
        chapter: 'রাসায়নিক সাম্যাবস্থা (Chemical Equilibrium)',
        duration: '৩:৪৫ মিনিট',
        youtubeUrl: 'https://www.youtube.com/watch?v=iiO2PkL9jsg',
        thumbnailUrl: 'https://img.youtube.com/vi/iiO2PkL9jsg/hqdefault.jpg',
        featured: true,
      },
      {
        title: 'মোলের ধারণা ও অ্যাভোগাড্রো সংখ্যা (What is a Mole Concept in 3D)',
        subject: 'Chemistry',
        chapter: 'মৌলের ধারণা ও রাসায়নিক গণনা',
        duration: '৩:১০ মিনিট',
        youtubeUrl: 'https://www.youtube.com/watch?v=zX918pF1HO0',
        thumbnailUrl: 'https://img.youtube.com/vi/zX918pF1HO0/hqdefault.jpg',
        featured: true,
      },
    ],
  });

  // 5. Seed Test Student 1 (Completed Profile)
  const studentUser1 = await prisma.user.upsert({
    where: { email: 'student@rsb.com' },
    update: {},
    create: {
      name: 'আবির হোসেন',
      email: 'student@rsb.com',
      passwordHash,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
    },
  });

  const qr1Payload = QrService.generateBadgePayload('RSB-26-001', studentUser1.id, studentUser1.name, 'HSC_2026');
  const qr1DataUrl = await QrService.generateQrDataUrl(qr1Payload);

  await prisma.studentProfile.upsert({
    where: { userId: studentUser1.id },
    update: {},
    create: {
      userId: studentUser1.id,
      studentIdNumber: 'RSB-26-001',
      academicLevel: 'HSC_2026',
      institutionName: 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ',
      batchId: batchHsc.id,
      fatherName: 'মো: মোস্তফা কামাল',
      motherName: 'নাজমা বেগম',
      studentPhone: '01711223344',
      guardianPhone: '01811223344',
      guardianEmail: 'guardian.abir@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      qrCodeDataUrl: qr1DataUrl,
      isCompleted: true,
      totalXp: 450,
      currentStreak: 12,
    },
  });

  // Seed sample invoice for student 1
  let inv1 = await prisma.invoice.findFirst({
    where: { userId: studentUser1.id, month: 'November 2026' },
  });

  if (!inv1) {
    inv1 = await prisma.invoice.create({
      data: {
        userId: studentUser1.id,
        month: 'November 2026',
        amount: 2500.0,
        dueDate: new Date(2026, 10, 10),
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
      },
    });
  }

  const existingReceipt = await prisma.paymentReceipt.findUnique({
    where: { trxId: 'BKASH8839210A' },
  });

  if (!existingReceipt) {
    await prisma.paymentReceipt.create({
      data: {
        invoiceId: inv1.id,
        userId: studentUser1.id,
        paymentMethod: PaymentMethod.BKASH_MANUAL,
        senderNumber: '01711223344',
        trxId: 'BKASH8839210A',
        amount: 2500.0,
        status: PaymentStatus.APPROVED,
        verifiedBy: 'Rayhan Sir',
        verifiedAt: new Date(),
      },
    });
  }

  // Seed Attendance & Badges for Student 1
  const attCount = await prisma.attendance.count({ where: { userId: studentUser1.id } });
  if (attCount === 0) {
    await prisma.attendance.create({
      data: {
        userId: studentUser1.id,
        batchId: batchHsc.id,
        status: 'PRESENT',
        scannedVia: 'CAMERA_QR_SCANNER',
      },
    });
  }

  const badgeCount = await prisma.userBadge.count({ where: { userId: studentUser1.id } });
  if (badgeCount === 0) {
    await prisma.userBadge.createMany({
      data: [
        {
          userId: studentUser1.id,
          title: 'Periodic Table Wizard',
          badgeCode: 'ORGANIC_WIZARD',
          icon: '⚗️',
        },
        {
          userId: studentUser1.id,
          title: 'Rayhan Science Scholar',
          badgeCode: 'SCIENCE_SCHOLAR',
          icon: '🎓',
        },
      ],
    });
  }

  // Seed Feedback for Student 1
  const feedbackCount = await prisma.studentFeedback.count({ where: { userId: studentUser1.id } });
  if (feedbackCount === 0) {
    await prisma.studentFeedback.create({
      data: {
        userId: studentUser1.id,
        authorId: admin.id,
        authorName: 'Rayhan Sir',
        remarks: 'আবিরের ফিজিক্সের গাণিতিক দক্ষতায় প্রভূত উন্নতি হয়েছে। তবে অর্গানিক কেমিস্ট্রির বিক্রিয়ার মেকানিজমে আরো কয়েকবার লিখে অনুশীলন করতে হবে।',
        strengths: 'ভেক্টর ও গতিবিদ্যার সমস্যা সমাধানে দ্রুততা',
        areasToImprove: 'জৈব রসায়নের নেমড রিঅ্যাকশনসমূহ',
        month: 'November 2026',
      },
    });
  }

  // 6. Seed Student 2 (Sakib - Profile Pending Completion)
  const studentUser2 = await prisma.user.upsert({
    where: { email: 'sakib@rsb.com' },
    update: {},
    create: {
      name: 'সাকিব আল হাসান',
      email: 'sakib@rsb.com',
      passwordHash,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
    },
  });

  const qr2Payload = QrService.generateBadgePayload('RSB-26-002', studentUser2.id, studentUser2.name, 'SSC_2026');
  const qr2DataUrl = await QrService.generateQrDataUrl(qr2Payload);

  await prisma.studentProfile.upsert({
    where: { userId: studentUser2.id },
    update: {},
    create: {
      userId: studentUser2.id,
      studentIdNumber: 'RSB-26-002',
      academicLevel: 'SSC_2026',
      institutionName: 'আইডিয়াল স্কুল অ্যান্ড কলেজ',
      batchId: batchSsc.id,
      studentPhone: '01912345678',
      qrCodeDataUrl: qr2DataUrl,
      isCompleted: false, // Incomplete profile!
      totalXp: 120,
      currentStreak: 3,
    },
  });

  // Seed Unpaid invoice for student 2 to test payment workflow
  const inv2 = await prisma.invoice.findFirst({
    where: { userId: studentUser2.id, month: 'November 2026' },
  });

  if (!inv2) {
    await prisma.invoice.create({
      data: {
        userId: studentUser2.id,
        month: 'November 2026',
        amount: 2000.0,
        dueDate: new Date(2026, 10, 10),
        status: InvoiceStatus.UNPAID,
      },
    });
  }

  console.log('[Seed] Database successfully populated with initial data!');
}

main()
  .catch((e) => {
    console.error('[Seed Error]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
