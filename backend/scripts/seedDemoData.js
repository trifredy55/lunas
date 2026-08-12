const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env'),
  quiet: true,
});

const User = require('../src/models/User');
const Book = require('../src/models/Book');
const Member = require('../src/models/Member');
const Loan = require('../src/models/Loan');

const PRESERVED_SUPERUSER_EMAIL = 'tricks@unsia.ac.id';
const RESET_FLAG = '--reset';
const DEMO_EMAIL_DOMAIN = '@demo.unsia.ac.id';
const STATUS_DISTRIBUTION = {
  active: 8,
  pending: 2,
  inactive: 1,
};

const DEMO_USER_DEFINITIONS = [
  {
    name: 'Andika Prasetyo',
    email: 'andika.prasetyo@demo.unsia.ac.id',
    status: 'active',
  },
  {
    name: 'Nabila Maharani',
    email: 'nabila.maharani@demo.unsia.ac.id',
    status: 'active',
  },
  {
    name: 'Raka Saputra',
    email: 'raka.saputra@demo.unsia.ac.id',
    status: 'active',
  },
  {
    name: 'Dewi Lestari',
    email: 'dewi.lestari@demo.unsia.ac.id',
    status: 'active',
  },
  {
    name: 'Fajar Ramadhan',
    email: 'fajar.ramadhan@demo.unsia.ac.id',
    status: 'active',
  },
  {
    name: 'Siti Aisyah',
    email: 'siti.aisyah@demo.unsia.ac.id',
    status: 'active',
  },
  {
    name: 'Bagas Pratama',
    email: 'bagas.pratama@demo.unsia.ac.id',
    status: 'active',
  },
  {
    name: 'Citra Ayuningtyas',
    email: 'citra.ayuningtyas@demo.unsia.ac.id',
    status: 'active',
  },
  {
    name: 'Arif Hidayat',
    email: 'arif.hidayat@demo.unsia.ac.id',
    status: 'pending',
  },
  {
    name: 'Nadia Putri',
    email: 'nadia.putri@demo.unsia.ac.id',
    status: 'pending',
  },
  {
    name: 'Rizky Kurniawan',
    email: 'rizky.kurniawan@demo.unsia.ac.id',
    status: 'inactive',
  },
];

const MEMBER_DEFINITIONS = [
  { name: 'Andika Prasetyo', address: 'Jakarta Selatan' },
  { name: 'Nabila Maharani', address: 'Jakarta Timur' },
  { name: 'Raka Saputra', address: 'Depok' },
  { name: 'Dewi Lestari', address: 'Bekasi' },
  { name: 'Fajar Ramadhan', address: 'Bogor' },
  { name: 'Siti Aisyah', address: 'Tangerang Selatan' },
  { name: 'Bagas Pratama', address: 'Bandung' },
  { name: 'Citra Ayuningtyas', address: 'Semarang' },
  { name: 'Arif Hidayat', address: 'Yogyakarta' },
  { name: 'Nadia Putri', address: 'Surabaya' },
  { name: 'Rizky Kurniawan', address: 'Kudus' },
  { name: 'Maya Safitri', address: 'Pati' },
  { name: 'Dimas Setiawan', address: 'Jakarta Selatan' },
  { name: 'Putri Amelia', address: 'Jakarta Timur' },
  { name: 'Galih Prakoso', address: 'Depok' },
  { name: 'Aulia Rahman', address: 'Bekasi' },
  { name: 'Intan Permata', address: 'Bogor' },
  { name: 'Yoga Pradana', address: 'Tangerang Selatan' },
  { name: 'Salma Nuraini', address: 'Bandung' },
  { name: 'Reza Maulana', address: 'Semarang' },
  { name: 'Anisa Rahmawati', address: 'Yogyakarta' },
  { name: 'Denny Firmansyah', address: 'Surabaya' },
  { name: 'Vina Oktaviani', address: 'Kudus' },
  { name: 'Ilham Nugroho', address: 'Pati' },
  { name: 'Farah Azzahra', address: 'Jakarta Selatan' },
];

const BOOK_DEFINITIONS = [
  {
    title: 'Dasar-Dasar Pemrograman Web',
    author: 'Rahmat Hidayat',
    category: 'Pemrograman',
    stock: 8,
  },
  {
    title: 'Pemrograman JavaScript Modern',
    author: 'Dwi Anugerah',
    category: 'Pemrograman',
    stock: 7,
  },
  {
    title: 'Pengembangan Aplikasi dengan Node.js',
    author: 'Salsabila Putri',
    category: 'Pemrograman',
    stock: 6,
  },
  {
    title: 'Pemrograman React untuk Aplikasi Web',
    author: 'Bima Prakoso',
    category: 'Pemrograman',
    stock: 5,
  },
  {
    title: 'Dasar Jaringan Komputer',
    author: 'Agus Setiawan',
    category: 'Jaringan Komputer',
    stock: 9,
  },
  {
    title: 'Administrasi Jaringan Komputer',
    author: 'Rina Puspitasari',
    category: 'Jaringan Komputer',
    stock: 6,
  },
  {
    title: 'Routing dan Switching',
    author: 'Farhan Maulana',
    category: 'Jaringan Komputer',
    stock: 5,
  },
  {
    title: 'Manajemen Infrastruktur Jaringan',
    author: 'Taufik Hidayat',
    category: 'Jaringan Komputer',
    stock: 4,
  },
  {
    title: 'Basis Data Relasional',
    author: 'Yusuf Kurnia',
    category: 'Basis Data',
    stock: 8,
  },
  {
    title: 'MongoDB untuk Aplikasi Modern',
    author: 'Widya Maharani',
    category: 'Basis Data',
    stock: 7,
  },
  {
    title: 'Perancangan dan Optimasi Basis Data',
    author: 'Hendra Saputra',
    category: 'Basis Data',
    stock: 6,
  },
  {
    title: 'SQL untuk Sistem Informasi',
    author: 'Lina Marlina',
    category: 'Basis Data',
    stock: 5,
  },
  {
    title: 'Fundamental Keamanan Siber',
    author: 'Naufal Hakim',
    category: 'Keamanan Siber',
    stock: 7,
  },
  {
    title: 'Keamanan Aplikasi Web',
    author: 'Putri Lestari',
    category: 'Keamanan Siber',
    stock: 6,
  },
  {
    title: 'Kriptografi dan Keamanan Informasi',
    author: 'Rizal Fadillah',
    category: 'Keamanan Siber',
    stock: 5,
  },
  {
    title: 'Analisis Keamanan Jaringan',
    author: 'Sinta Permata',
    category: 'Keamanan Siber',
    stock: 4,
  },
  {
    title: 'Rekayasa Perangkat Lunak Modern',
    author: 'Galang Prasetya',
    category: 'Rekayasa Perangkat Lunak',
    stock: 8,
  },
  {
    title: 'Analisis dan Desain Sistem',
    author: 'Meylani Sari',
    category: 'Rekayasa Perangkat Lunak',
    stock: 7,
  },
  {
    title: 'Pengujian Perangkat Lunak',
    author: 'Aditya Ramadhan',
    category: 'Rekayasa Perangkat Lunak',
    stock: 6,
  },
  {
    title: 'Pemodelan Sistem dengan UML',
    author: 'Fina Khairunnisa',
    category: 'Rekayasa Perangkat Lunak',
    stock: 5,
  },
  {
    title: 'Pengantar Kecerdasan Buatan',
    author: 'Surya Mahendra',
    category: 'Kecerdasan Buatan',
    stock: 9,
  },
  {
    title: 'Machine Learning Dasar',
    author: 'Tiara Anindita',
    category: 'Kecerdasan Buatan',
    stock: 8,
  },
  {
    title: 'Sistem Pakar dan Implementasinya',
    author: 'Hanif Akbar',
    category: 'Kecerdasan Buatan',
    stock: 5,
  },
  {
    title: 'Pengolahan Data untuk AI',
    author: 'Lailatul Hasanah',
    category: 'Kecerdasan Buatan',
    stock: 6,
  },
  {
    title: 'Sistem Informasi Manajemen',
    author: 'Reza Saputra',
    category: 'Sistem Informasi',
    stock: 10,
  },
  {
    title: 'Perancangan Sistem Informasi',
    author: 'Nadia Kusuma',
    category: 'Sistem Informasi',
    stock: 7,
  },
  {
    title: 'Transformasi Digital Organisasi',
    author: 'Farida Ningsih',
    category: 'Sistem Informasi',
    stock: 6,
  },
  {
    title: 'Tata Kelola Teknologi Informasi',
    author: 'Dimas Wicaksono',
    category: 'Sistem Informasi',
    stock: 5,
  },
  {
    title: 'Dasar Cloud Computing',
    author: 'Yoga Adi Putra',
    category: 'Cloud Computing',
    stock: 8,
  },
  {
    title: 'Arsitektur Cloud Modern',
    author: 'Nabila Kurniasih',
    category: 'Cloud Computing',
    stock: 6,
  },
  {
    title: 'Virtualisasi dan Infrastruktur Cloud',
    author: 'Fikri Alamsyah',
    category: 'Cloud Computing',
    stock: 5,
  },
  {
    title: 'DevOps untuk Pengembangan Aplikasi',
    author: 'Zaki Mubarok',
    category: 'Cloud Computing',
    stock: 7,
  },
];

const USER_CLEANUP_NAME_PATTERNS = [
  /Akses UI/i,
  /Approval Tester/i,
  /Dashboard UI/i,
  /UI Redesign/i,
  /Penguji/i,
  /Tester/i,
  /Testing/i,
  /Validasi/i,
];

function createUtcDate(year, month, day, hour) {
  return new Date(Date.UTC(year, month - 1, day, hour || 9, 0, 0));
}

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function sanitizeTimestampForFile(date) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function normalizeEmailLocalPart(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .replace(/\s+/g, '.');
}

function buildDemoMemberEmail(name) {
  return `${normalizeEmailLocalPart(name)}${DEMO_EMAIL_DOMAIN}`;
}

function calculateIsbn13CheckDigit(baseTwelveDigits) {
  const sum = baseTwelveDigits.split('').reduce((total, digit, index) => {
    const weight = index % 2 === 0 ? 1 : 3;
    return total + Number(digit) * weight;
  }, 0);

  return (10 - (sum % 10)) % 10;
}

function buildIsbn13(sequenceNumber) {
  const base = `978${String(sequenceNumber).padStart(9, '0')}`;
  const checkDigit = calculateIsbn13CheckDigit(base);
  return `${base}${checkDigit}`;
}

function getStrongSeedPassword() {
  if (process.env.SEED_DEMO_PASSWORD) {
    return process.env.SEED_DEMO_PASSWORD;
  }

  return `Lunas${crypto.randomBytes(12).toString('hex')}9A`;
}

function formatSummaryLine(label, value) {
  return `${label.padEnd(26, ' ')}: ${value}`;
}

async function createBackupFile() {
  const backupDir = path.resolve(__dirname, '..', 'tmp');
  fs.mkdirSync(backupDir, { recursive: true });

  const [users, books, members, loans] = await Promise.all([
    User.find().lean(),
    Book.find().lean(),
    Member.find().lean(),
    Loan.find().lean(),
  ]);

  const backupPayload = {
    exportedAt: new Date().toISOString(),
    collections: {
      users,
      books,
      members,
      loans,
    },
  };

  const backupPath = path.join(
    backupDir,
    `seed-backup-${sanitizeTimestampForFile(new Date())}.json`
  );

  fs.writeFileSync(backupPath, JSON.stringify(backupPayload, null, 2), 'utf8');

  return backupPath;
}

async function ensurePreservedSuperUser() {
  const superUser = await User.findOne({ email: PRESERVED_SUPERUSER_EMAIL }).select(
    '_id email role status'
  );

  if (!superUser) {
    throw new Error(
      `Akun Super User ${PRESERVED_SUPERUSER_EMAIL} tidak ditemukan pada database.`
    );
  }

  await User.updateOne(
    { _id: superUser._id },
    {
      $set: {
        role: 'superuser',
        status: 'active',
      },
    }
  );
}

async function cleanupUsers() {
  const orConditions = [
    { email: /@example\.com$/i },
    { email: /@demo\.unsia\.ac\.id$/i },
    ...USER_CLEANUP_NAME_PATTERNS.map((pattern) => ({ name: pattern })),
  ];

  await User.deleteMany({
    email: { $ne: PRESERVED_SUPERUSER_EMAIL },
    $or: orConditions,
  });
}

async function resetOperationalCollections() {
  await Loan.deleteMany({});
  await Book.deleteMany({});
  await Member.deleteMany({});
}

async function seedUsers() {
  const password = getStrongSeedPassword();
  const demoUsers = [];

  for (let index = 0; index < DEMO_USER_DEFINITIONS.length; index += 1) {
    const definition = DEMO_USER_DEFINITIONS[index];
    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = createUtcDate(2026, 2, 3 + index, 8);

    demoUsers.push({
      name: definition.name,
      email: definition.email,
      passwordHash,
      role: 'user',
      status: definition.status,
      createdAt,
      updatedAt: createdAt,
    });
  }

  await User.insertMany(demoUsers);
}

async function seedMembers() {
  const members = MEMBER_DEFINITIONS.map((definition, index) => {
    const createdAt = createUtcDate(2026, 2, 5 + index, 9);

    return {
      name: definition.name,
      email: buildDemoMemberEmail(definition.name),
      phone: `0812000000${String(index + 1).padStart(2, '0')}`,
      address: definition.address,
      createdAt,
      updatedAt: createdAt,
    };
  });

  return Member.insertMany(members);
}

async function seedBooks() {
  const books = BOOK_DEFINITIONS.map((definition, index) => {
    const createdAt = createUtcDate(2026, 2 + (index % 4), 2 + (index % 20), 10);

    return {
      title: definition.title,
      author: definition.author,
      category: definition.category,
      isbn: buildIsbn13(index + 1),
      stock: definition.stock,
      availableStock: definition.stock,
      createdAt,
      updatedAt: createdAt,
    };
  });

  return Book.insertMany(books);
}

function buildActiveLoanBlueprints(memberDocs, bookDocs) {
  const activePairs = new Set();
  const activeBookUsage = new Map();
  const activeBookIndexes = [0, 1, 2, 4, 8, 12, 16, 20, 24, 28, 29, 30];
  const activeLoanDates = [
    createUtcDate(2026, 7, 5, 9),
    createUtcDate(2026, 7, 8, 10),
    createUtcDate(2026, 7, 11, 11),
    createUtcDate(2026, 7, 16, 9),
    createUtcDate(2026, 7, 19, 10),
    createUtcDate(2026, 7, 24, 8),
    createUtcDate(2026, 7, 29, 9),
    createUtcDate(2026, 8, 2, 9),
    createUtcDate(2026, 8, 4, 10),
    createUtcDate(2026, 8, 6, 11),
    createUtcDate(2026, 8, 8, 9),
    createUtcDate(2026, 8, 10, 10),
  ];

  const loans = activeBookIndexes.map((bookIndex, index) => {
    const memberDoc = memberDocs[index];
    const bookDoc = bookDocs[bookIndex];
    const pairKey = `${memberDoc._id.toString()}::${bookDoc._id.toString()}`;
    const loanDate = activeLoanDates[index];
    const dueDate = addDays(loanDate, 9 + (index % 4));

    if (activePairs.has(pairKey)) {
      throw new Error('Duplikasi kombinasi peminjaman aktif terdeteksi saat seed.');
    }

    activePairs.add(pairKey);
    activeBookUsage.set(
      bookDoc._id.toString(),
      (activeBookUsage.get(bookDoc._id.toString()) || 0) + 1
    );

    if (activeBookUsage.get(bookDoc._id.toString()) > bookDoc.stock) {
      throw new Error(`Peminjaman aktif melebihi stok untuk buku "${bookDoc.title}".`);
    }

    return {
      member: memberDoc._id,
      book: bookDoc._id,
      loanDate,
      dueDate,
      returnDate: null,
      status: 'borrowed',
      createdAt: loanDate,
      updatedAt: loanDate,
    };
  });

  return { loans, activePairs };
}

function buildReturnedLoanBlueprints(memberDocs, bookDocs, activePairs) {
  const loans = [];

  for (let index = 0; index < 33; index += 1) {
    const memberDoc = memberDocs[index % memberDocs.length];
    let bookIndex = (index * 5 + 3) % bookDocs.length;
    let pairKey = `${memberDoc._id.toString()}::${bookDocs[bookIndex]._id.toString()}`;
    let guard = 0;

    while (activePairs.has(pairKey) && guard < bookDocs.length) {
      bookIndex = (bookIndex + 1) % bookDocs.length;
      pairKey = `${memberDoc._id.toString()}::${bookDocs[bookIndex]._id.toString()}`;
      guard += 1;
    }

    if (activePairs.has(pairKey)) {
      throw new Error('Gagal membentuk pasangan peminjaman selesai yang unik.');
    }

    const month = 2 + (index % 7);
    const day = 3 + ((index * 2) % 22);
    const loanDate = createUtcDate(2026, month, day, 9 + (index % 3));
    const dueDate = addDays(loanDate, 7 + (index % 9));
    let returnDate;

    if (index % 3 === 0) {
      returnDate = addDays(dueDate, -2);
    } else if (index % 3 === 1) {
      returnDate = new Date(dueDate);
    } else {
      returnDate = addDays(dueDate, 3);
    }

    if (returnDate <= loanDate) {
      returnDate = addDays(loanDate, 2);
    }

    loans.push({
      member: memberDoc._id,
      book: bookDocs[bookIndex]._id,
      loanDate,
      dueDate,
      returnDate,
      status: 'returned',
      createdAt: loanDate,
      updatedAt: returnDate,
    });
  }

  return loans;
}

async function seedLoans(memberDocs, bookDocs) {
  const { loans: activeLoans, activePairs } = buildActiveLoanBlueprints(
    memberDocs,
    bookDocs
  );
  const returnedLoans = buildReturnedLoanBlueprints(memberDocs, bookDocs, activePairs);
  const loanPayloads = [...returnedLoans, ...activeLoans];

  return Loan.insertMany(loanPayloads);
}

async function recalculateAvailableStock() {
  const borrowedCounts = await Loan.aggregate([
    {
      $match: {
        status: 'borrowed',
      },
    },
    {
      $group: {
        _id: '$book',
        total: { $sum: 1 },
      },
    },
  ]);

  const borrowedMap = new Map(
    borrowedCounts.map((item) => [item._id.toString(), item.total])
  );
  const books = await Book.find().select('_id stock').lean();
  const operations = books.map((book) => {
    const activeBorrowed = borrowedMap.get(book._id.toString()) || 0;
    const availableStock = book.stock - activeBorrowed;

    if (availableStock < 0) {
      throw new Error(`availableStock negatif terdeteksi pada buku dengan ID ${book._id}.`);
    }

    return {
      updateOne: {
        filter: { _id: book._id },
        update: {
          $set: {
            availableStock,
          },
        },
      },
    };
  });

  if (operations.length > 0) {
    await Book.bulkWrite(operations);
  }
}

async function validateSeedData() {
  const preservedUser = await User.findOne({ email: PRESERVED_SUPERUSER_EMAIL })
    .select('email role status')
    .lean();

  if (!preservedUser) {
    throw new Error('Akun Super User utama tidak ditemukan setelah proses seed.');
  }

  if (preservedUser.role !== 'superuser' || preservedUser.status !== 'active') {
    throw new Error('Akun Super User utama tidak memiliki role/status yang benar.');
  }

  const demoUsers = await User.find({ email: /@demo\.unsia\.ac\.id$/i })
    .select('email status')
    .lean();

  if (demoUsers.length !== DEMO_USER_DEFINITIONS.length) {
    throw new Error('Jumlah pengguna demo tidak sesuai.');
  }

  const statusCounts = demoUsers.reduce(
    (result, user) => {
      result[user.status] = (result[user.status] || 0) + 1;
      return result;
    },
    { active: 0, pending: 0, inactive: 0 }
  );

  if (
    statusCounts.active !== STATUS_DISTRIBUTION.active ||
    statusCounts.pending !== STATUS_DISTRIBUTION.pending ||
    statusCounts.inactive !== STATUS_DISTRIBUTION.inactive
  ) {
    throw new Error('Distribusi status pengguna demo tidak sesuai.');
  }

  const exampleEmailCount = await User.countDocuments({ email: /@example\.com$/i });
  if (exampleEmailCount > 0) {
    throw new Error('Masih ada akun user dengan email @example.com.');
  }

  const [bookCount, memberCount, loanCount] = await Promise.all([
    Book.countDocuments(),
    Member.countDocuments(),
    Loan.countDocuments(),
  ]);

  if (bookCount < 30) {
    throw new Error('Jumlah buku demo kurang dari 30.');
  }

  if (memberCount < 20) {
    throw new Error('Jumlah anggota demo kurang dari 20.');
  }

  if (loanCount < 40) {
    throw new Error('Jumlah peminjaman demo kurang dari 40.');
  }

  const populatedLoans = await Loan.find().populate('member').populate('book').lean();
  const hasBrokenReference = populatedLoans.some((loan) => !loan.member || !loan.book);

  if (hasBrokenReference) {
    throw new Error('Terdapat peminjaman dengan referensi member/book yang tidak valid.');
  }

  const invalidStocks = await Book.countDocuments({
    $expr: {
      $or: [
        { $lt: ['$availableStock', 0] },
        { $gt: ['$availableStock', '$stock'] },
      ],
    },
  });

  if (invalidStocks > 0) {
    throw new Error('Terdapat data buku dengan availableStock yang tidak valid.');
  }

  const duplicateIsbn = await Book.aggregate([
    {
      $group: {
        _id: '$isbn',
        total: { $sum: 1 },
      },
    },
    {
      $match: {
        total: { $gt: 1 },
      },
    },
    { $count: 'duplicates' },
  ]);

  if (duplicateIsbn.length > 0) {
    throw new Error('Terdapat ISBN duplikat pada data buku demo.');
  }

  const duplicateUserEmails = await User.aggregate([
    {
      $group: {
        _id: '$email',
        total: { $sum: 1 },
      },
    },
    {
      $match: {
        total: { $gt: 1 },
      },
    },
    { $count: 'duplicates' },
  ]);

  if (duplicateUserEmails.length > 0) {
    throw new Error('Terdapat email user duplikat.');
  }

  const duplicateMemberEmails = await Member.aggregate([
    {
      $group: {
        _id: '$email',
        total: { $sum: 1 },
      },
    },
    {
      $match: {
        total: { $gt: 1 },
      },
    },
    { $count: 'duplicates' },
  ]);

  if (duplicateMemberEmails.length > 0) {
    throw new Error('Terdapat email anggota duplikat.');
  }

  const duplicateActiveLoans = await Loan.aggregate([
    {
      $match: {
        status: 'borrowed',
      },
    },
    {
      $group: {
        _id: {
          member: '$member',
          book: '$book',
        },
        total: { $sum: 1 },
      },
    },
    {
      $match: {
        total: { $gt: 1 },
      },
    },
    { $count: 'duplicates' },
  ]);

  if (duplicateActiveLoans.length > 0) {
    throw new Error('Terdapat duplikasi peminjaman aktif pada kombinasi member dan buku.');
  }

  return {
    demoUserCount: demoUsers.length,
    memberCount,
    bookCount,
    loanCount,
    borrowedLoanCount: await Loan.countDocuments({ status: 'borrowed' }),
    returnedLoanCount: await Loan.countDocuments({ status: 'returned' }),
  };
}

async function seedDemoData() {
  if (!process.argv.includes(RESET_FLAG)) {
    console.log('Gunakan --reset untuk menjalankan proses seed data demo.');
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI belum didefinisikan pada file .env backend.');
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    await createBackupFile();
    await ensurePreservedSuperUser();
    await cleanupUsers();
    await resetOperationalCollections();

    await seedUsers();
    const memberDocs = await seedMembers();
    const bookDocs = await seedBooks();
    await seedLoans(memberDocs, bookDocs);
    await recalculateAvailableStock();

    const summary = await validateSeedData();

    console.log('================================');
    console.log('LUNAS Demo Data Seed');
    console.log('================================');
    console.log(formatSummaryLine('Super User dipertahankan', 1));
    console.log(formatSummaryLine('Pengguna demo', summary.demoUserCount));
    console.log(formatSummaryLine('Anggota', summary.memberCount));
    console.log(formatSummaryLine('Buku', summary.bookCount));
    console.log(formatSummaryLine('Peminjaman', summary.loanCount));
    console.log(formatSummaryLine('Peminjaman aktif', summary.borrowedLoanCount));
    console.log(formatSummaryLine('Peminjaman selesai', summary.returnedLoanCount));
    console.log('');
    console.log('Data demo berhasil dibuat.');
    console.log('================================');
  } finally {
    await mongoose.disconnect();
  }
}

seedDemoData().catch((error) => {
  console.error(`Seed data demo gagal: ${error.message}`);
  process.exit(1);
});
