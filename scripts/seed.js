const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB, logger } = require('../config/db-config');

/**
 * Database Seed Script for Speed Reading Platform
 * Creates initial data for development and testing
 */

/**
 * Default admin user
 */
const defaultUsers = [
  {
    username: 'admin',
    email: 'admin@speedreading.com',
    password: 'Admin123!',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    isActive: true,
    profile: {
      bio: 'System administrator account',
      avatar: null
    },
    preferences: {
      language: 'tr',
      theme: 'light',
      notifications: true
    }
  },
  {
    username: 'teacher1',
    email: 'teacher@speedreading.com',
    password: 'Teacher123!',
    firstName: 'Öğretmen',
    lastName: 'Kullanıcı',
    role: 'teacher',
    isActive: true,
    profile: {
      bio: 'Hızlı okuma eğitmeni',
      avatar: null
    },
    preferences: {
      language: 'tr',
      theme: 'light',
      notifications: true
    }
  },
  {
    username: 'student1',
    email: 'student@speedreading.com',
    password: 'Student123!',
    firstName: 'Öğrenci',
    lastName: 'Kullanıcı',
    role: 'student',
    isActive: true,
    profile: {
      bio: 'Hızlı okuma öğrencisi',
      avatar: null
    },
    preferences: {
      language: 'tr',
      theme: 'light',
      notifications: true
    }
  }
];

/**
 * Sample reading texts
 */
const sampleTexts = [
  {
    title: 'Hızlı Okuma Nedir?',
    content: `Hızlı okuma, metinleri normal okuma hızından daha hızlı anlayarak okuma becerisidir. Bu teknik, zihnin bilgi işleme kapasitesini artırarak, daha az zamanda daha fazla bilgi edinmemizi sağlar.

    Hızlı okuma teknikleri arasında göz hareketlerini optimize etme, alt sesle okumayı azaltma ve odaklanma becerisini geliştirme yer alır. Bu yöntemler sayesinde okuma hızı dakikada 200-300 kelimeden 600-1000 kelimeye çıkarılabilir.

    Hızlı okuma sadece hız değil, aynı zamanda anlama konusunda da gelişim sağlar. Doğru tekniklerle hem hızlı hem de etkili okuma gerçekleştirilebilir.`,
    category: 'Temel Bilgiler',
    difficulty: 'beginner',
    wordCount: 120,
    estimatedTime: 2,
    language: 'tr',
    tags: ['hızlı okuma', 'temel', 'giriş'],
    author: 'Sistem',
    questions: [
      {
        question: 'Hızlı okuma hangi becerileri geliştirir?',
        options: [
          'Sadece okuma hızını',
          'Sadece anlama becerisini',
          'Hem okuma hızını hem anlama becerisini',
          'Sadece göz hareketlerini'
        ],
        correctAnswer: 2,
        explanation: 'Hızlı okuma hem okuma hızını hem de anlama becerisini geliştirir.'
      }
    ],
    metadata: {
      readingLevel: 1,
      complexity: 2,
      topicKeywords: ['hızlı okuma', 'teknik', 'beceri']
    }
  },
  {
    title: 'Dikkat ve Odaklanma',
    content: `Etkili okuma için dikkat ve odaklanma en önemli faktörlerden biridir. Zihnimiz sürekli farklı uyaranlarla bombardımana tutulduğunda, metne odaklanmak zorlaşır.

    Odaklanmayı artırmak için çevresel faktörleri kontrol etmek gerekir. Sessiz bir ortam, rahat bir oturma pozisyonu ve dış etkenlerden uzak durmak önemlidir.

    Ayrıca zihinsel hazırlık da kritiktir. Okuma öncesi metinle ilgili ön bilgileri gözden geçirmek, okuma amacını belirlemek ve zihinsel olarak hazırlanmak dikkat süresini artırır.

    Nefes egzersizleri ve kısa meditasyon seansları da odaklanma becerisini güçlendirebilir. Düzenli pratik ile dikkat süresi önemli ölçüde geliştirilebilir.`,
    category: 'Teknikler',
    difficulty: 'intermediate',
    wordCount: 150,
    estimatedTime: 3,
    language: 'tr',
    tags: ['dikkat', 'odaklanma', 'konsantrasyon'],
    author: 'Sistem',
    questions: [
      {
        question: 'Odaklanmayı artırmak için en önemli faktör nedir?',
        options: [
          'Hızlı okumak',
          'Çevresel faktörleri kontrol etmek',
          'Çok sayıda kitap okumak',
          'Yüksek sesle okumak'
        ],
        correctAnswer: 1,
        explanation: 'Çevresel faktörleri kontrol etmek odaklanmayı artırmak için en önemli faktördür.'
      }
    ],
    metadata: {
      readingLevel: 2,
      complexity: 3,
      topicKeywords: ['dikkat', 'odaklanma', 'çevre']
    }
  },
  {
    title: 'İleri Seviye Okuma Stratejileri',
    content: `İleri seviye okuma stratejileri, kompleks metinleri hızla analiz etme ve kritik bilgileri ayırt etme becerisini gerektirir. Bu seviyede okuyucular artık temel teknikleri otomatikleştirmiş ve gelişmiş yöntemlere geçmiştir.

    Scanning tekniği, metinde belirli bilgileri hızla bulmak için kullanılır. Skimming ise metnin genel yapısını ve ana fikirlerini hızla kavramak için uygulanır. Bu tekniklerin kombinasyonu ile akademik metinler, raporlar ve uzun belgeler etkili şekilde işlenebilir.

    Meta-bilişsel stratejiler de bu seviyede kritik öneme sahiptir. Okuyucu kendi okuma sürecini izler, anlamadığı noktaları tespit eder ve gerektiğinde stratejisini değiştirir.

    Aktif okuma teknikleri ile metin üzerine notlar alınır, sorular sorulur ve bağlantılar kurulur. Bu sayede bilgi daha derin işlenir ve uzun süreli hafızaya kodlanır.

    Eleştirel okuma becerileri de bu düzeyde geliştirilir. Yazarın amacı, argümanların geçerliliği ve metnin güvenilirliği sorgulanır.`,
    category: 'İleri Seviye',
    difficulty: 'advanced',
    wordCount: 220,
    estimatedTime: 5,
    language: 'tr',
    tags: ['ileri seviye', 'strateji', 'eleştirel okuma'],
    author: 'Sistem',
    questions: [
      {
        question: 'Scanning tekniği ne için kullanılır?',
        options: [
          'Metnin genel yapısını kavramak',
          'Belirli bilgileri hızla bulmak',
          'Eleştirel düşünmek',
          'Not almak'
        ],
        correctAnswer: 1,
        explanation: 'Scanning tekniği metinde belirli bilgileri hızla bulmak için kullanılır.'
      },
      {
        question: 'Meta-bilişsel stratejiler nedir?',
        options: [
          'Hızlı okuma teknikleri',
          'Kendi okuma sürecini izleme',
          'Not alma yöntemleri',
          'Göz hareket egzersizleri'
        ],
        correctAnswer: 1,
        explanation: 'Meta-bilişsel stratejiler okuyucunun kendi okuma sürecini izlemesi ve değerlendirmesidir.'
      }
    ],
    metadata: {
      readingLevel: 4,
      complexity: 5,
      topicKeywords: ['scanning', 'skimming', 'meta-bilişsel', 'eleştirel']
    }
  }
];

/**
 * System settings
 */
const systemSettings = [
  {
    key: 'app_name',
    value: 'Speed Reading Platform',
    category: 'general',
    description: 'Application name'
  },
  {
    key: 'app_version',
    value: '1.0.0',
    category: 'system',
    description: 'Current application version'
  },
  {
    key: 'maintenance_mode',
    value: false,
    category: 'system',
    description: 'Maintenance mode status'
  },
  {
    key: 'registration_enabled',
    value: true,
    category: 'user',
    description: 'User registration enabled'
  },
  {
    key: 'email_verification_required',
    value: false,
    category: 'user',
    description: 'Email verification required for new users'
  },
  {
    key: 'default_reading_speed',
    value: 250,
    category: 'reading',
    description: 'Default reading speed in words per minute'
  },
  {
    key: 'session_timeout',
    value: 3600000,
    category: 'security',
    description: 'Session timeout in milliseconds'
  },
  {
    key: 'max_file_upload_size',
    value: 5242880,
    category: 'upload',
    description: 'Maximum file upload size in bytes'
  },
  {
    key: 'supported_languages',
    value: ['tr', 'en'],
    category: 'general',
    description: 'Supported application languages'
  },
  {
    key: 'rate_limit_window',
    value: 900000,
    category: 'security',
    description: 'Rate limit window in milliseconds'
  }
];

/**
 * Hash password
 */
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Seed users
 */
const seedUsers = async () => {
  try {
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    logger.info('Seeding users...');
    
    for (const user of defaultUsers) {
      const existingUser = await usersCollection.findOne({
        $or: [
          { email: user.email },
          { username: user.username }
        ]
      });
      
      if (!existingUser) {
        const hashedPassword = await hashPassword(user.password);
        
        await usersCollection.insertOne({
          ...user,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        logger.info(`User created: ${user.username} (${user.role})`);
      } else {
        logger.info(`User already exists: ${user.username}`);
      }
    }
    
    logger.info('Users seeding completed');
    
  } catch (error) {
    logger.error('Error seeding users:', error);
    throw error;
  }
};

/**
 * Seed reading texts
 */
const seedTexts = async () => {
  try {
    const db = mongoose.connection.db;
    const textsCollection = db.collection('reading_texts');
    
    logger.info('Seeding reading texts...');
    
    for (const text of sampleTexts) {
      const existingText = await textsCollection.findOne({ title: text.title });
      
      if (!existingText) {
        await textsCollection.insertOne({
          ...text,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        logger.info(`Text created: ${text.title}`);
      } else {
        logger.info(`Text already exists: ${text.title}`);
      }
    }
    
    logger.info('Reading texts seeding completed');
    
  } catch (error) {
    logger.error('Error seeding reading texts:', error);
    throw error;
  }
};

/**
 * Seed system settings
 */
const seedSettings = async () => {
  try {
    const db = mongoose.connection.db;
    const settingsCollection = db.collection('system_settings');
    
    logger.info('Seeding system settings...');
    
    for (const setting of systemSettings) {
      const existingSetting = await settingsCollection.findOne({ key: setting.key });
      
      if (!existingSetting) {
        await settingsCollection.insertOne({
          ...setting,
          isActive: true,
          updatedAt: new Date()
        });
        
        logger.info(`Setting created: ${setting.key}`);
      } else {
        logger.info(`Setting already exists: ${setting.key}`);
      }
    }
    
    logger.info('System settings seeding completed');
    
  } catch (error) {
    logger.error('Error seeding system settings:', error);
    throw error;
  }
};

/**
 * Run seeding
 */
const runSeeding = async () => {
  try {
    logger.info('Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Run seeding operations
    await seedUsers();
    await seedTexts();
    await seedSettings();
    
    logger.info('Database seeding completed successfully');
    
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  runSeeding()
    .then(() => {
      logger.info('Seeding script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  defaultUsers,
  sampleTexts,
  systemSettings,
  seedUsers,
  seedTexts,
  seedSettings,
  runSeeding
};