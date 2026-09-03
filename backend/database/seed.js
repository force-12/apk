require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seed() {
  let connection;
  try {
    // Connect without database first to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('Connected to MySQL');

    // Read and execute schema
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schema);
    console.log('Schema created successfully');

    // Switch to database
    await connection.query('USE smartphone_store');

    // ==================== USERS ====================
    const adminPassword = await bcrypt.hash('admin123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    await connection.query(`INSERT INTO users (name, email, password, role, phone, address, province, city, district, postal_code) VALUES
      ('Admin Store', 'admin@smartphonestore.com', ?, 'admin', '081234567890', 'Jl. Admin No. 1', 'DKI Jakarta', 'Jakarta Selatan', 'Kebayoran Baru', '12110'),
      ('Budi Santoso', 'customer@example.com', ?, 'customer', '081298765432', 'Jl. Merdeka No. 10', 'DKI Jakarta', 'Jakarta Pusat', 'Menteng', '10310'),
      ('Siti Nurhaliza', 'siti@example.com', ?, 'customer', '085712345678', 'Jl. Sudirman No. 25', 'Jawa Barat', 'Bandung', 'Coblong', '40132'),
      ('Ahmad Rizki', 'ahmad@example.com', ?, 'customer', '082145678901', 'Jl. Diponegoro No. 15', 'Jawa Timur', 'Surabaya', 'Tegalsari', '60264')
    `, [adminPassword, customerPassword, customerPassword, customerPassword]);

    console.log('Users seeded');

    // Create carts for customers
    await connection.query(`INSERT INTO cart (user_id) VALUES (2), (3), (4)`);

    // ==================== BRANDS ====================
    await connection.query(`INSERT INTO brands (name) VALUES
      ('Samsung'), ('Apple'), ('Xiaomi'), ('OPPO'), ('vivo'),
      ('realme'), ('Infinix'), ('TECNO'), ('ASUS'), ('OnePlus')`);

    console.log('Brands seeded');

    // ==================== CATEGORIES ====================
    await connection.query(`INSERT INTO categories (name) VALUES
      ('Flagship'), ('Mid-Range'), ('Entry-Level')`);

    console.log('Categories seeded');

    // ==================== PRODUCTS ====================
    const products = [
      // Samsung
      {
        brand_id: 1, category_id: 1, name: 'Samsung Galaxy S24 Ultra',
        description: 'Samsung Galaxy S24 Ultra adalah smartphone flagship terbaru dari Samsung dengan teknologi AI Galaxy yang revolusioner. Dilengkapi dengan S Pen terintegrasi, layar Dynamic AMOLED 2X 6.8 inci yang menakjubkan, dan chipset Snapdragon 8 Gen 3 yang powerful. Kamera 200MP dengan AI Photo Editing memungkinkan Anda mengambil foto luar biasa dalam segala kondisi.',
        price: 19999000, discount: 10, stock: 50, sold: 120, rating: 4.9, is_featured: true, warranty: '1 Tahun Garansi Resmi Samsung',
        image: '/images/products/samsung-galaxy-s24-ultra.jpg',
        specs: JSON.stringify({ display: '6.8" Dynamic AMOLED 2X, 120Hz, 2560x1440', processor: 'Snapdragon 8 Gen 3', ram: '12GB', storage: '256GB/512GB/1TB', camera: '200MP + 50MP + 12MP + 10MP', battery: '5000 mAh', os: 'Android 14, One UI 6.1', connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, NFC', dimensions: '162.3 x 79.0 x 8.6 mm', weight: '232g' }),
        variants: [
          { ram: '12GB', storage: '256GB', color: 'Titanium Gray', price: 19999000, stock: 20 },
          { ram: '12GB', storage: '512GB', color: 'Titanium Black', price: 22999000, stock: 15 },
          { ram: '12GB', storage: '1TB', color: 'Titanium Violet', price: 26999000, stock: 10 }
        ]
      },
      {
        brand_id: 1, category_id: 2, name: 'Samsung Galaxy A55',
        description: 'Samsung Galaxy A55 hadir dengan desain premium khas Galaxy, layar Super AMOLED 6.6 inci yang jernih, dan perlindungan Gorilla Glass Victus+. Ditenagai chipset Exynos 1480 yang efisien, smartphone ini menawarkan performa smooth untuk penggunaan sehari-hari dengan baterai 5000mAh yang tahan seharian.',
        price: 5999000, discount: 15, stock: 80, sold: 250, rating: 4.5, is_featured: true, warranty: '1 Tahun Garansi Resmi Samsung',
        image: '/images/products/samsung-galaxy-a55.jpg',
        specs: JSON.stringify({ display: '6.6" Super AMOLED, 120Hz, 1080x2340', processor: 'Exynos 1480', ram: '8GB', storage: '128GB/256GB', camera: '50MP + 12MP + 5MP', battery: '5000 mAh', os: 'Android 14, One UI 6.1', connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, NFC', dimensions: '158.0 x 77.0 x 8.2 mm', weight: '213g' }),
        variants: [
          { ram: '8GB', storage: '128GB', color: 'Awesome Iceblue', price: 5999000, stock: 30 },
          { ram: '8GB', storage: '256GB', color: 'Awesome Navy', price: 6499000, stock: 25 }
        ]
      },
      {
        brand_id: 1, category_id: 3, name: 'Samsung Galaxy M15',
        description: 'Samsung Galaxy M15 adalah pilihan entry-level terbaik dari Samsung dengan baterai monster 6000mAh yang mampu bertahan hingga 2 hari. Layar Super AMOLED 6.5 inci memberikan pengalaman visual yang luar biasa di kelasnya, cocok untuk hiburan dan penggunaan sehari-hari.',
        price: 2499000, discount: 5, stock: 100, sold: 380, rating: 4.2, is_featured: false, warranty: '1 Tahun Garansi Resmi Samsung',
        image: '/images/products/samsung-galaxy-m15.jpg',
        specs: JSON.stringify({ display: '6.5" Super AMOLED, 90Hz, 1080x2340', processor: 'MediaTek Dimensity 6100+', ram: '4GB/6GB', storage: '128GB', camera: '50MP + 5MP + 2MP', battery: '6000 mAh', os: 'Android 14, One UI 6.1', connectivity: '5G, Wi-Fi 5, Bluetooth 5.3', dimensions: '160.1 x 76.8 x 9.3 mm', weight: '200g' }),
        variants: [
          { ram: '4GB', storage: '128GB', color: 'Blue', price: 2499000, stock: 50 },
          { ram: '6GB', storage: '128GB', color: 'Dark Blue', price: 2799000, stock: 40 }
        ]
      },
      // Apple
      {
        brand_id: 2, category_id: 1, name: 'iPhone 15 Pro Max',
        description: 'iPhone 15 Pro Max adalah iPhone tercanggih yang pernah dibuat. Dengan chip A17 Pro yang revolusioner, bodi titanium grade 5 yang ringan dan kuat, serta sistem kamera Pro 48MP dengan Tetraprism telephoto 5x. Action Button yang baru memberikan akses cepat ke fitur favorit Anda.',
        price: 24999000, discount: 5, stock: 40, sold: 95, rating: 4.9, is_featured: true, warranty: '1 Tahun Garansi Resmi Apple (iBox)',
        image: '/images/products/iphone-15-pro-max.jpg',
        specs: JSON.stringify({ display: '6.7" Super Retina XDR OLED, 120Hz, 2796x1290', processor: 'Apple A17 Pro', ram: '8GB', storage: '256GB/512GB/1TB', camera: '48MP + 12MP + 12MP', battery: '4441 mAh', os: 'iOS 17', connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3, NFC, USB-C', dimensions: '159.9 x 76.7 x 8.25 mm', weight: '221g' }),
        variants: [
          { ram: '8GB', storage: '256GB', color: 'Natural Titanium', price: 24999000, stock: 15 },
          { ram: '8GB', storage: '512GB', color: 'Blue Titanium', price: 28999000, stock: 10 },
          { ram: '8GB', storage: '1TB', color: 'Black Titanium', price: 32999000, stock: 8 }
        ]
      },
      {
        brand_id: 2, category_id: 1, name: 'iPhone 15',
        description: 'iPhone 15 hadir dengan Dynamic Island, chip A16 Bionic, kamera utama 48MP, dan desain baru dengan bahan aluminium aerospace-grade. USB-C universal memberikan kemudahan konektivitas. Ceramic Shield yang kuat melindungi layar Super Retina XDR 6.1 inci.',
        price: 14999000, discount: 8, stock: 60, sold: 180, rating: 4.7, is_featured: true, warranty: '1 Tahun Garansi Resmi Apple (iBox)',
        image: '/images/products/iphone-15.jpg',
        specs: JSON.stringify({ display: '6.1" Super Retina XDR OLED, 60Hz, 2556x1179', processor: 'Apple A16 Bionic', ram: '6GB', storage: '128GB/256GB/512GB', camera: '48MP + 12MP', battery: '3877 mAh', os: 'iOS 17', connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, NFC, USB-C', dimensions: '147.6 x 71.6 x 7.80 mm', weight: '171g' }),
        variants: [
          { ram: '6GB', storage: '128GB', color: 'Pink', price: 14999000, stock: 25 },
          { ram: '6GB', storage: '256GB', color: 'Blue', price: 16999000, stock: 20 },
          { ram: '6GB', storage: '512GB', color: 'Black', price: 19999000, stock: 10 }
        ]
      },
      {
        brand_id: 2, category_id: 2, name: 'iPhone SE 2022',
        description: 'iPhone SE 2022 menggabungkan desain klasik yang dicintai banyak orang dengan chip A15 Bionic yang powerful. Touch ID, layar Retina HD 4.7 inci, dan konektivitas 5G menjadikannya iPhone paling terjangkau namun tetap powerful untuk kebutuhan sehari-hari.',
        price: 7999000, discount: 12, stock: 45, sold: 150, rating: 4.3, is_featured: false, warranty: '1 Tahun Garansi Resmi Apple (iBox)',
        image: '/images/products/iphone-se-2022.jpg',
        specs: JSON.stringify({ display: '4.7" Retina HD IPS LCD, 60Hz, 1334x750', processor: 'Apple A15 Bionic', ram: '4GB', storage: '64GB/128GB/256GB', camera: '12MP', battery: '2018 mAh', os: 'iOS 17', connectivity: '5G, Wi-Fi 6, Bluetooth 5.0, NFC', dimensions: '138.4 x 67.3 x 7.3 mm', weight: '144g' }),
        variants: [
          { ram: '4GB', storage: '64GB', color: 'Midnight', price: 7999000, stock: 20 },
          { ram: '4GB', storage: '128GB', color: 'Starlight', price: 8999000, stock: 15 }
        ]
      },
      // Xiaomi
      {
        brand_id: 3, category_id: 1, name: 'Xiaomi 14 Ultra',
        description: 'Xiaomi 14 Ultra menghadirkan sistem kamera Leica Summilux professional dengan sensor 1 inci Light Fusion 900. Ditenagai Snapdragon 8 Gen 3, layar LTPO AMOLED 2K dengan kecerahan hingga 3000 nit, dan pengisian daya 90W HyperCharge. Flagship sejati untuk pecinta fotografi mobile.',
        price: 14999000, discount: 10, stock: 35, sold: 78, rating: 4.8, is_featured: true, warranty: '1 Tahun Garansi Resmi Xiaomi',
        image: '/images/products/xiaomi-14-ultra.jpg',
        specs: JSON.stringify({ display: '6.73" LTPO AMOLED, 120Hz, 3200x1440', processor: 'Snapdragon 8 Gen 3', ram: '12GB/16GB', storage: '256GB/512GB', camera: '50MP (Leica) + 50MP + 50MP + 50MP', battery: '5000 mAh', os: 'Android 14, HyperOS', connectivity: '5G, Wi-Fi 7, Bluetooth 5.4, NFC', dimensions: '161.4 x 75.3 x 9.2 mm', weight: '227g' }),
        variants: [
          { ram: '12GB', storage: '256GB', color: 'Black', price: 14999000, stock: 15 },
          { ram: '16GB', storage: '512GB', color: 'White', price: 17999000, stock: 10 }
        ]
      },
      {
        brand_id: 3, category_id: 2, name: 'Xiaomi Redmi Note 13 Pro',
        description: 'Redmi Note 13 Pro menawarkan kamera 200MP Samsung ISOCELL HP3 yang luar biasa di kelasnya. Layar AMOLED 120Hz dengan kecerahan 1800 nit, chipset Snapdragon 7s Gen 2, dan pengisian daya 67W Turbo Charge. Smartphone mid-range terbaik untuk fotografi.',
        price: 3499000, discount: 10, stock: 90, sold: 420, rating: 4.5, is_featured: false, warranty: '1 Tahun Garansi Resmi Xiaomi',
        image: '/images/products/xiaomi-redmi-note-13-pro.jpg',
        specs: JSON.stringify({ display: '6.67" AMOLED, 120Hz, 1080x2400', processor: 'Snapdragon 7s Gen 2', ram: '8GB', storage: '128GB/256GB', camera: '200MP + 8MP + 2MP', battery: '5100 mAh', os: 'Android 13, MIUI 14', connectivity: '4G, Wi-Fi 5, Bluetooth 5.2, NFC', dimensions: '161.1 x 74.95 x 7.98 mm', weight: '187g' }),
        variants: [
          { ram: '8GB', storage: '128GB', color: 'Midnight Black', price: 3499000, stock: 40 },
          { ram: '8GB', storage: '256GB', color: 'Aurora Purple', price: 3999000, stock: 30 }
        ]
      },
      {
        brand_id: 3, category_id: 2, name: 'Xiaomi POCO X6 Pro',
        description: 'POCO X6 Pro adalah monster performa mid-range dengan chipset MediaTek Dimensity 8300-Ultra. Layar Flow AMOLED 120Hz dengan resolusi 1.5K, pengisian daya 67W turbo, dan kamera utama 64MP OIS. Smartphone gaming terbaik di harga 4 jutaan.',
        price: 4499000, discount: 15, stock: 70, sold: 310, rating: 4.6, is_featured: true, warranty: '1 Tahun Garansi Resmi Xiaomi',
        image: '/images/products/xiaomi-poco-x6-pro.jpg',
        specs: JSON.stringify({ display: '6.67" Flow AMOLED, 120Hz, 1220x2712', processor: 'MediaTek Dimensity 8300-Ultra', ram: '8GB/12GB', storage: '256GB/512GB', camera: '64MP OIS + 8MP + 2MP', battery: '5000 mAh', os: 'Android 14, HyperOS', connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, NFC', dimensions: '160.5 x 74.3 x 8.25 mm', weight: '186g' }),
        variants: [
          { ram: '8GB', storage: '256GB', color: 'Gray', price: 4499000, stock: 30 },
          { ram: '12GB', storage: '512GB', color: 'Yellow', price: 5499000, stock: 20 }
        ]
      },
      // OPPO
      {
        brand_id: 4, category_id: 1, name: 'OPPO Find X7 Ultra',
        description: 'OPPO Find X7 Ultra merupakan flagship fotografi dengan sistem kamera Hasselblad dual periscope telephoto. Sensor utama Sony LYT-900 1 inci, layar LTPO AMOLED 2K ProXDR, dan Snapdragon 8 Gen 3. MariSilicon X chip khusus untuk pemrosesan foto dan video.',
        price: 16999000, discount: 8, stock: 30, sold: 55, rating: 4.8, is_featured: true, warranty: '1 Tahun Garansi Resmi OPPO',
        image: '/images/products/oppo-find-x7-ultra.jpg',
        specs: JSON.stringify({ display: '6.82" LTPO AMOLED, 120Hz, 3168x1440', processor: 'Snapdragon 8 Gen 3', ram: '12GB/16GB', storage: '256GB/512GB', camera: '50MP (Hasselblad) + 50MP + 50MP + 50MP', battery: '5210 mAh', os: 'Android 14, ColorOS 14', connectivity: '5G, Wi-Fi 7, Bluetooth 5.4, NFC', dimensions: '164.3 x 76.2 x 9.5 mm', weight: '221g' }),
        variants: [
          { ram: '16GB', storage: '256GB', color: 'Hasselblad Brown', price: 16999000, stock: 15 },
          { ram: '16GB', storage: '512GB', color: 'Ocean Blue', price: 19999000, stock: 10 }
        ]
      },
      {
        brand_id: 4, category_id: 2, name: 'OPPO Reno 11',
        description: 'OPPO Reno 11 hadir dengan desain tipis dan ringan yang elegan. Kamera portrait 50MP dengan sensor Sony IMX890, chipset MediaTek Dimensity 7050, dan layar AMOLED 120Hz. SUPERVOOC 67W mengisi baterai dengan cepat.',
        price: 5499000, discount: 12, stock: 65, sold: 195, rating: 4.4, is_featured: false, warranty: '1 Tahun Garansi Resmi OPPO',
        image: '/images/products/oppo-reno-11.jpg',
        specs: JSON.stringify({ display: '6.7" AMOLED, 120Hz, 1080x2412', processor: 'MediaTek Dimensity 7050', ram: '8GB', storage: '256GB', camera: '50MP + 32MP + 8MP', battery: '5000 mAh', os: 'Android 14, ColorOS 14', connectivity: '5G, Wi-Fi 6, Bluetooth 5.2, NFC', dimensions: '162.4 x 74.1 x 7.6 mm', weight: '184g' }),
        variants: [
          { ram: '8GB', storage: '256GB', color: 'Rock Grey', price: 5499000, stock: 30 },
          { ram: '8GB', storage: '256GB', color: 'Wave Green', price: 5499000, stock: 25 }
        ]
      },
      {
        brand_id: 4, category_id: 3, name: 'OPPO A78',
        description: 'OPPO A78 adalah smartphone entry-level dengan layar AMOLED 90Hz yang cerah dan warna akurat. Pengisian daya 67W SUPERVOOC memastikan pengisian cepat, sementara baterai 5000mAh menjamin daya tahan seharian.',
        price: 2999000, discount: 5, stock: 85, sold: 340, rating: 4.2, is_featured: false, warranty: '1 Tahun Garansi Resmi OPPO',
        image: '/images/products/oppo-a78.jpg',
        specs: JSON.stringify({ display: '6.43" AMOLED, 90Hz, 1080x2400', processor: 'Qualcomm Snapdragon 680', ram: '8GB', storage: '128GB/256GB', camera: '50MP + 2MP', battery: '5000 mAh', os: 'Android 13, ColorOS 13', connectivity: '4G, Wi-Fi 5, Bluetooth 5.1', dimensions: '160.2 x 73.0 x 7.99 mm', weight: '180g' }),
        variants: [
          { ram: '8GB', storage: '128GB', color: 'Aqua Green', price: 2999000, stock: 40 },
          { ram: '8GB', storage: '256GB', color: 'Mist Black', price: 3299000, stock: 30 }
        ]
      },
      // vivo
      {
        brand_id: 5, category_id: 1, name: 'vivo X100 Pro',
        description: 'vivo X100 Pro menghadirkan sistem kamera ZEISS APO Telephoto Floating yang revolusioner. Chipset MediaTek Dimensity 9300, layar LTPO AMOLED 120Hz dengan kecerahan 3000 nit, dan chip V3 khusus untuk fotografi malam hari yang luar biasa.',
        price: 12999000, discount: 10, stock: 40, sold: 88, rating: 4.7, is_featured: true, warranty: '1 Tahun Garansi Resmi vivo',
        image: '/images/products/vivo-x100-pro.jpg',
        specs: JSON.stringify({ display: '6.78" LTPO AMOLED, 120Hz, 2800x1260', processor: 'MediaTek Dimensity 9300', ram: '12GB/16GB', storage: '256GB/512GB', camera: '50MP (ZEISS) + 50MP + 50MP', battery: '5400 mAh', os: 'Android 14, FunTouch OS 14', connectivity: '5G, Wi-Fi 7, Bluetooth 5.4, NFC', dimensions: '164.1 x 75.3 x 8.9 mm', weight: '225g' }),
        variants: [
          { ram: '12GB', storage: '256GB', color: 'Asteroid Black', price: 12999000, stock: 20 },
          { ram: '16GB', storage: '512GB', color: 'Stardust Blue', price: 14999000, stock: 12 }
        ]
      },
      {
        brand_id: 5, category_id: 2, name: 'vivo V30',
        description: 'vivo V30 fokus pada studio-quality portrait photography dengan lampu Aura Light yang menyerupai pencahayaan studio profesional. Layar AMOLED 120Hz, chipset Snapdragon 7 Gen 3, dan desain tipis yang premium.',
        price: 5999000, discount: 8, stock: 55, sold: 165, rating: 4.4, is_featured: false, warranty: '1 Tahun Garansi Resmi vivo',
        image: '/images/products/vivo-v30.jpg',
        specs: JSON.stringify({ display: '6.78" AMOLED, 120Hz, 1260x2800', processor: 'Snapdragon 7 Gen 3', ram: '8GB/12GB', storage: '256GB/512GB', camera: '50MP + 50MP', battery: '5000 mAh', os: 'Android 14, FunTouch OS 14', connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, NFC', dimensions: '163.2 x 75.0 x 7.4 mm', weight: '186g' }),
        variants: [
          { ram: '8GB', storage: '256GB', color: 'Peacock Green', price: 5999000, stock: 25 },
          { ram: '12GB', storage: '512GB', color: 'Noble Brown', price: 6999000, stock: 15 }
        ]
      },
      {
        brand_id: 5, category_id: 3, name: 'vivo Y27',
        description: 'vivo Y27 hadir untuk pengguna yang membutuhkan smartphone andal dengan baterai besar 5000mAh. Layar LCD 6.64 inci, kamera 50MP, dan dukungan Extended RAM 8GB untuk multitasking yang lancar.',
        price: 2299000, discount: 0, stock: 95, sold: 280, rating: 4.1, is_featured: false, warranty: '1 Tahun Garansi Resmi vivo',
        image: '/images/products/vivo-y27.jpg',
        specs: JSON.stringify({ display: '6.64" IPS LCD, 60Hz, 1080x2388', processor: 'MediaTek Helio G85', ram: '6GB', storage: '128GB', camera: '50MP + 2MP', battery: '5000 mAh', os: 'Android 13, FunTouch OS 13', connectivity: '4G, Wi-Fi 5, Bluetooth 5.0', dimensions: '164.0 x 76.1 x 8.1 mm', weight: '190g' }),
        variants: [
          { ram: '6GB', storage: '128GB', color: 'Garden Green', price: 2299000, stock: 45 },
          { ram: '6GB', storage: '128GB', color: 'Burgundy Black', price: 2299000, stock: 40 }
        ]
      },
      // realme
      {
        brand_id: 6, category_id: 1, name: 'realme GT 5 Pro',
        description: 'realme GT 5 Pro menghadirkan performa flagship dengan Snapdragon 8 Gen 3 dan kamera periscope telephoto Sony IMX890. Layar ProXDR OLED dengan kecerahan 4500 nit terbaik di kelasnya, pengisian daya 100W SUPERVOOC.',
        price: 8999000, discount: 15, stock: 45, sold: 135, rating: 4.6, is_featured: true, warranty: '1 Tahun Garansi Resmi realme',
        image: '/images/products/realme-gt5-pro.jpg',
        specs: JSON.stringify({ display: '6.78" LTPO AMOLED, 120Hz, 2780x1264', processor: 'Snapdragon 8 Gen 3', ram: '8GB/12GB/16GB', storage: '128GB/256GB/512GB', camera: '50MP (Sony) + 8MP + 50MP Periscope', battery: '5400 mAh', os: 'Android 14, realme UI 5.0', connectivity: '5G, Wi-Fi 7, Bluetooth 5.4, NFC', dimensions: '161.8 x 75.2 x 8.9 mm', weight: '218g' }),
        variants: [
          { ram: '12GB', storage: '256GB', color: 'Superspeed Black', price: 8999000, stock: 20 },
          { ram: '16GB', storage: '512GB', color: 'Superspeed Blue', price: 10999000, stock: 15 }
        ]
      },
      {
        brand_id: 6, category_id: 2, name: 'realme 12 Pro+',
        description: 'realme 12 Pro+ tampil premium dengan desain luxury watch yang terinspirasi dari jam tangan mewah. Kamera periscope telephoto 64MP, layar ProXDR AMOLED, dan chipset Snapdragon 7s Gen 2 untuk performa optimal.',
        price: 5499000, discount: 10, stock: 55, sold: 175, rating: 4.4, is_featured: false, warranty: '1 Tahun Garansi Resmi realme',
        image: '/images/products/realme-12-pro-plus.jpg',
        specs: JSON.stringify({ display: '6.7" LTPO AMOLED, 120Hz, 1080x2412', processor: 'Snapdragon 7s Gen 2', ram: '8GB/12GB', storage: '256GB', camera: '50MP + 64MP Periscope + 8MP', battery: '5000 mAh', os: 'Android 14, realme UI 5.0', connectivity: '5G, Wi-Fi 6, Bluetooth 5.2, NFC', dimensions: '161.5 x 73.9 x 8.7 mm', weight: '190g' }),
        variants: [
          { ram: '8GB', storage: '256GB', color: 'Submarine Blue', price: 5499000, stock: 25 },
          { ram: '12GB', storage: '256GB', color: 'Navigator Beige', price: 5999000, stock: 20 }
        ]
      },
      {
        brand_id: 6, category_id: 3, name: 'realme C67',
        description: 'realme C67 memberikan pengalaman terbaik di segmen entry-level dengan kamera 108MP yang luar biasa, chipset Snapdragon 685, dan baterai besar 5000mAh. Layar IPS LCD 90Hz dan pengisian daya 33W.',
        price: 2199000, discount: 5, stock: 100, sold: 450, rating: 4.1, is_featured: false, warranty: '1 Tahun Garansi Resmi realme',
        image: '/images/products/realme-c67.jpg',
        specs: JSON.stringify({ display: '6.72" IPS LCD, 90Hz, 1080x2400', processor: 'Snapdragon 685', ram: '4GB/6GB', storage: '128GB/256GB', camera: '108MP + 2MP', battery: '5000 mAh', os: 'Android 13, realme UI 4.0', connectivity: '4G, Wi-Fi 5, Bluetooth 5.0', dimensions: '165.6 x 76.1 x 7.9 mm', weight: '185g' }),
        variants: [
          { ram: '6GB', storage: '128GB', color: 'Dark Purple', price: 2199000, stock: 50 },
          { ram: '6GB', storage: '256GB', color: 'Sunny Oasis', price: 2499000, stock: 40 }
        ]
      },
      // Infinix
      {
        brand_id: 7, category_id: 2, name: 'Infinix GT 20 Pro',
        description: 'Infinix GT 20 Pro adalah smartphone gaming yang didesain dengan gaya cyberpunk yang unik. Ditenagai MediaTek Dimensity 8200 Ultimate, layar AMOLED 144Hz, JBL-tuned speakers, dan Vapor Chamber cooling untuk gaming tanpa lag.',
        price: 3999000, discount: 20, stock: 60, sold: 210, rating: 4.5, is_featured: true, warranty: '1 Tahun Garansi Resmi Infinix',
        image: '/images/products/infinix-gt20-pro.jpg',
        specs: JSON.stringify({ display: '6.78" AMOLED, 144Hz, 1080x2436', processor: 'MediaTek Dimensity 8200 Ultimate', ram: '8GB/12GB', storage: '256GB', camera: '108MP + 2MP + 2MP', battery: '5000 mAh', os: 'Android 14, XOS 14', connectivity: '5G, Wi-Fi 6, Bluetooth 5.3, NFC', dimensions: '163.7 x 75.5 x 8.9 mm', weight: '195g' }),
        variants: [
          { ram: '8GB', storage: '256GB', color: 'Mecha Blue', price: 3999000, stock: 30 },
          { ram: '12GB', storage: '256GB', color: 'Mecha Gold', price: 4499000, stock: 20 }
        ]
      },
      {
        brand_id: 7, category_id: 2, name: 'Infinix Note 40 Pro',
        description: 'Infinix Note 40 Pro menawarkan pengisian daya nirkabel 20W yang jarang ditemukan di segmennya, serta wired charging 68W. Layar AMOLED 3D curved, chipset MediaTek Helio G99 Ultimate, dan kamera 108MP.',
        price: 3299000, discount: 10, stock: 75, sold: 245, rating: 4.3, is_featured: false, warranty: '1 Tahun Garansi Resmi Infinix',
        image: '/images/products/infinix-note-40-pro.jpg',
        specs: JSON.stringify({ display: '6.78" AMOLED, 120Hz, 1080x2436', processor: 'MediaTek Helio G99 Ultimate', ram: '8GB', storage: '256GB', camera: '108MP + 2MP + AI Lens', battery: '5000 mAh', os: 'Android 14, XOS 14', connectivity: '4G, Wi-Fi 5, Bluetooth 5.2', dimensions: '163.8 x 74.6 x 7.9 mm', weight: '189g' }),
        variants: [
          { ram: '8GB', storage: '256GB', color: 'Vintage Green', price: 3299000, stock: 35 },
          { ram: '8GB', storage: '256GB', color: 'Obsidian Black', price: 3299000, stock: 30 }
        ]
      },
      // TECNO
      {
        brand_id: 8, category_id: 1, name: 'TECNO Phantom V Fold 2',
        description: 'TECNO Phantom V Fold 2 adalah smartphone lipat yang terjangkau dengan layar utama LTPO AMOLED 7.85 inci dan layar cover 6.42 inci. Snapdragon 8+ Gen 1, kamera 50MP dengan OIS, dan desain premium dengan hinge yang kokoh.',
        price: 14999000, discount: 15, stock: 20, sold: 32, rating: 4.5, is_featured: true, warranty: '1 Tahun Garansi Resmi TECNO',
        image: '/images/products/tecno-phantom-v-fold-2.jpg',
        specs: JSON.stringify({ display: '7.85" LTPO AMOLED Foldable, 120Hz (Main) + 6.42" AMOLED Cover', processor: 'Snapdragon 8+ Gen 1', ram: '12GB', storage: '256GB/512GB', camera: '50MP + 50MP + 13MP', battery: '5750 mAh', os: 'Android 14, HiOS 14', connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3, NFC', dimensions: '159.4 x 142.0 x 5.5 mm (unfolded)', weight: '269g' }),
        variants: [
          { ram: '12GB', storage: '256GB', color: 'Karst Green', price: 14999000, stock: 10 },
          { ram: '12GB', storage: '512GB', color: 'Ripple Black', price: 16999000, stock: 8 }
        ]
      },
      {
        brand_id: 8, category_id: 3, name: 'TECNO Spark 20 Pro',
        description: 'TECNO Spark 20 Pro menawarkan layar AMOLED besar 6.78 inci, kamera selfie 32MP dengan dual flash, dan desain yang stylish di segmen entry-level. Baterai 5000mAh dengan pengisian daya 18W untuk daya tahan seharian.',
        price: 2499000, discount: 5, stock: 80, sold: 320, rating: 4.0, is_featured: false, warranty: '1 Tahun Garansi Resmi TECNO',
        image: '/images/products/tecno-spark-20-pro.jpg',
        specs: JSON.stringify({ display: '6.78" AMOLED, 90Hz, 1080x2436', processor: 'MediaTek Helio G99', ram: '8GB', storage: '128GB/256GB', camera: '50MP + QVGA', battery: '5000 mAh', os: 'Android 13, HiOS 13', connectivity: '4G, Wi-Fi 5, Bluetooth 5.0', dimensions: '165.0 x 75.9 x 8.1 mm', weight: '192g' }),
        variants: [
          { ram: '8GB', storage: '128GB', color: 'Sunset Blush', price: 2499000, stock: 40 },
          { ram: '8GB', storage: '256GB', color: 'Magic Skin Green', price: 2799000, stock: 30 }
        ]
      },
      // ASUS
      {
        brand_id: 9, category_id: 1, name: 'ASUS ROG Phone 8 Pro',
        description: 'ASUS ROG Phone 8 Pro adalah smartphone gaming terkuat dengan Snapdragon 8 Gen 3, layar LTPO AMOLED 165Hz, dan pendinginan GameCool 8 yang canggih. AirTrigger ultrasonik, speaker stereo dioptimalkan Dirac, dan AeroActive Cooler X untuk gaming marathon.',
        price: 17999000, discount: 10, stock: 25, sold: 45, rating: 4.9, is_featured: true, warranty: '1 Tahun Garansi Resmi ASUS',
        image: '/images/products/asus-rog-phone-8-pro.jpg',
        specs: JSON.stringify({ display: '6.78" LTPO AMOLED, 165Hz, 2400x1080', processor: 'Snapdragon 8 Gen 3', ram: '16GB/24GB', storage: '512GB/1TB', camera: '50MP (Sony) + 13MP + 32MP', battery: '5500 mAh', os: 'Android 14, ROG UI', connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, NFC', dimensions: '163.8 x 76.8 x 8.9 mm', weight: '225g' }),
        variants: [
          { ram: '16GB', storage: '512GB', color: 'Phantom Black', price: 17999000, stock: 12 },
          { ram: '24GB', storage: '1TB', color: 'Phantom Black', price: 21999000, stock: 8 }
        ]
      },
      {
        brand_id: 9, category_id: 1, name: 'ASUS Zenfone 11 Ultra',
        description: 'ASUS Zenfone 11 Ultra menawarkan pengalaman flagship yang komplit dengan layar LTPO AMOLED 6.78 inci, Snapdragon 8 Gen 3, sistem kamera Gimbal 50MP untuk stabilisasi video terbaik, dan baterai 5500mAh dengan pengisian daya 65W.',
        price: 12999000, discount: 8, stock: 30, sold: 62, rating: 4.6, is_featured: false, warranty: '1 Tahun Garansi Resmi ASUS',
        image: '/images/products/asus-zenfone-11-ultra.jpg',
        specs: JSON.stringify({ display: '6.78" LTPO AMOLED, 120Hz, 2400x1080', processor: 'Snapdragon 8 Gen 3', ram: '12GB/16GB', storage: '256GB/512GB', camera: '50MP Gimbal + 13MP + 32MP Telephoto', battery: '5500 mAh', os: 'Android 14, ZenUI', connectivity: '5G, Wi-Fi 7, Bluetooth 5.3, NFC', dimensions: '163.6 x 77.3 x 8.9 mm', weight: '225g' }),
        variants: [
          { ram: '12GB', storage: '256GB', color: 'Eternal Black', price: 12999000, stock: 15 },
          { ram: '16GB', storage: '512GB', color: 'Skyline Blue', price: 15999000, stock: 10 }
        ]
      },
      // OnePlus
      {
        brand_id: 10, category_id: 1, name: 'OnePlus 12',
        description: 'OnePlus 12 membawa kembali flagship killer sejati dengan Snapdragon 8 Gen 3, layar ProXDR LTPO AMOLED 2K, kamera Hasselblad generasi keempat, dan pengisian daya 100W SUPERVOOC. Performa tanpa kompromi.',
        price: 11999000, discount: 12, stock: 35, sold: 98, rating: 4.7, is_featured: true, warranty: '1 Tahun Garansi Resmi OnePlus',
        image: '/images/products/oneplus-12.jpg',
        specs: JSON.stringify({ display: '6.82" LTPO AMOLED, 120Hz, 3168x1440', processor: 'Snapdragon 8 Gen 3', ram: '12GB/16GB', storage: '256GB/512GB', camera: '50MP (Hasselblad) + 48MP + 64MP Periscope', battery: '5400 mAh', os: 'Android 14, OxygenOS 14', connectivity: '5G, Wi-Fi 7, Bluetooth 5.4, NFC', dimensions: '164.3 x 75.8 x 9.2 mm', weight: '220g' }),
        variants: [
          { ram: '12GB', storage: '256GB', color: 'Flowy Emerald', price: 11999000, stock: 15 },
          { ram: '16GB', storage: '512GB', color: 'Silky Black', price: 14999000, stock: 12 }
        ]
      }
    ];

    // Insert products and variants
    for (const product of products) {
      const [result] = await connection.query(
        `INSERT INTO products (brand_id, category_id, name, description, price, discount, stock, sold, rating, image, specifications, warranty, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [product.brand_id, product.category_id, product.name, product.description, product.price,
         product.discount, product.stock, product.sold, product.rating, product.image,
         product.specs, product.warranty, product.is_featured]
      );

      const productId = result.insertId;

      for (const variant of product.variants) {
        await connection.query(
          'INSERT INTO product_variants (product_id, ram, storage, color, price, stock) VALUES (?, ?, ?, ?, ?, ?)',
          [productId, variant.ram, variant.storage, variant.color, variant.price, variant.stock]
        );
      }
    }

    console.log(`${products.length} products seeded with variants`);

    // ==================== SAMPLE ORDERS ====================
    const orderData = [
      { user_id: 2, order_number: 'ORD-20240815-00001', subtotal: 17999100, shipping_cost: 15000, discount: 0, total: 18014100, payment_method: 'transfer_bank', status: 'completed', recipient_name: 'Budi Santoso', recipient_phone: '081298765432', shipping_address: 'Jl. Merdeka No. 10', province: 'DKI Jakarta', city: 'Jakarta Pusat', district: 'Menteng', postal_code: '10310', courier: 'JNE' },
      { user_id: 3, order_number: 'ORD-20240820-00002', subtotal: 5099150, shipping_cost: 15000, discount: 0, total: 5114150, payment_method: 'e_wallet', status: 'shipped', recipient_name: 'Siti Nurhaliza', recipient_phone: '085712345678', shipping_address: 'Jl. Sudirman No. 25', province: 'Jawa Barat', city: 'Bandung', district: 'Coblong', postal_code: '40132', courier: 'SiCepat' },
      { user_id: 4, order_number: 'ORD-20240825-00003', subtotal: 3149250, shipping_cost: 15000, discount: 0, total: 3164250, payment_method: 'cod', status: 'processing', recipient_name: 'Ahmad Rizki', recipient_phone: '082145678901', shipping_address: 'Jl. Diponegoro No. 15', province: 'Jawa Timur', city: 'Surabaya', district: 'Tegalsari', postal_code: '60264', courier: 'J&T' }
    ];

    for (const order of orderData) {
      await connection.query(
        `INSERT INTO orders (user_id, order_number, subtotal, shipping_cost, discount, total, payment_method, status, recipient_name, recipient_phone, shipping_address, province, city, district, postal_code, courier)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [order.user_id, order.order_number, order.subtotal, order.shipping_cost, order.discount, order.total, order.payment_method, order.status, order.recipient_name, order.recipient_phone, order.shipping_address, order.province, order.city, order.district, order.postal_code, order.courier]
      );
    }

    // Order items
    await connection.query(`INSERT INTO order_items (order_id, product_id, variant_id, quantity, price, subtotal) VALUES
      (1, 1, 1, 1, 17999100, 17999100),
      (2, 2, 3, 1, 5099150, 5099150),
      (3, 8, 15, 1, 3149250, 3149250)`);

    // Payments
    await connection.query(`INSERT INTO payments (order_id, payment_method, payment_status, amount, paid_at) VALUES
      (1, 'transfer_bank', 'paid', 18014100, '2024-08-15 14:30:00'),
      (2, 'e_wallet', 'paid', 5114150, '2024-08-20 10:15:00'),
      (3, 'cod', 'pending', 3164250, NULL)`);

    // Sample reviews
    await connection.query(`INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
      (2, 1, 5, 'Smartphone luar biasa! Kameranya juara, performa sangat cepat. Sangat puas dengan pembelian ini.'),
      (3, 2, 4, 'Bagus untuk harganya. Layar AMOLED cerah dan baterai tahan lama. Recommended!'),
      (4, 8, 5, 'Kamera 200MP-nya gila! Foto detail banget. Harga terjangkau tapi kualitas premium.'),
      (2, 4, 5, 'iPhone terbaik yang pernah saya gunakan. Worth every penny!'),
      (3, 9, 4, 'POCO X6 Pro performa mantap buat gaming. Layar 120Hz smooth banget.')`);

    console.log('Sample orders, payments, and reviews seeded');

    console.log('\n=================================');
    console.log('Database seeded successfully!');
    console.log('=================================');
    console.log('\nAdmin Login:');
    console.log('Email: admin@smartphonestore.com');
    console.log('Password: admin123');
    console.log('\nCustomer Login:');
    console.log('Email: customer@example.com');
    console.log('Password: customer123');
    console.log('=================================\n');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

seed();
