export type PathId = 'pejuang' | 'pemikir' | 'pemersatu';

export type HeroId =
  | 'diponegoro' | 'cutnyak' | 'pattimura' | 'sudirman'
  | 'kihajar' | 'kartini' | 'tjokro' | 'soekarno' | 'hatta';

export interface Hero {
  id: HeroId;
  name: string;
  fullName: string;
  years: string;
  origin: string;
  struggle: string;
  form: string;
  service: string;
  sacrifice: string;
  fact: string;
  gender: 'male' | 'female';
  colors: { robe: string; accent: string; skin: string; head: string };
  pathIds: PathId[];
}

export interface Choice {
  id: string;
  label: string;
  score: number;
  feedback: string;
  consequence: string;
  heroId?: HeroId;
}

export interface QuestItem {
  id: string;
  name: string;
  kind: 'relic' | 'ally';
  icon: string;
  teaser: string;
  story: string;
  heroId?: HeroId;
  choices?: Choice[];
}

export interface Challenge {
  type: 'quiz' | 'archive' | 'final';
  title: string;
  prompt: string;
  question?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  hint?: string;
}

export interface Chapter {
  n: number;
  title: string;
  kicker: string;
  location: string;
  synopsis: string;
  objective: string;
  hanifIntro: string[];
  hanifTip: string;
  items: QuestItem[];
  challenge: Challenge;
}

export interface PathData {
  id: PathId;
  no: string;
  title: string;
  theme: string;
  tagline: string;
  description: string;
  image: string;
  accent: string;
  accentSoft: string;
  featuredHero: HeroId;
  heroIds: HeroId[];
  scene: {
    skyTop: string;
    skyBottom: string;
    fog: string;
    ground: string;
    path: string;
    grass: string;
    roof: string;
    wood: string;
    glow: string;
  };
  chapters: Chapter[];
  ending: {
    id: string;
    title: string;
    kicker: string;
    narration: string;
    hanif: string;
    moral: string;
    badge: string;
  };
}

export const ZONES: Record<number, { x: number; z: number; spawnX: number; spawnZ: number; label: string }> = {
  1: { x: 0, z: 0, spawnX: 0, spawnZ: 8, label: 'Perkampungan' },
  2: { x: 0, z: -19, spawnX: 0, spawnZ: -11, label: 'Pendopo Pahlawan' },
  3: { x: 19, z: 0, spawnX: 12, spawnZ: 15, label: 'Hutan & Jembatan' },
  4: { x: -19, z: 0, spawnX: -12, spawnZ: 9, label: 'Rumah Arsip' },
  5: { x: 0, z: 21, spawnX: 0, spawnZ: 29, label: 'Bukit Merah Putih' },
};

export const ITEM_OFFSETS: { x: number; z: number }[] = [
  { x: -4.6, z: 2.4 },
  { x: 4.2, z: 3.1 },
  { x: 0.2, z: -4.2 },
];

export const HEROES: Record<HeroId, Hero> = {
  diponegoro: {
    id: 'diponegoro',
    name: 'Pangeran Diponegoro',
    fullName: 'Raden Mas Mustahar / Pangeran Diponegoro',
    years: '1785 – 1855',
    origin: 'Yogyakarta',
    struggle:
      'Memimpin Perang Jawa (1825–1830) melawan penjajahan Belanda. Perang ini menjadi salah satu perlawanan terbesar di Jawa. Pada 1830 ia ditangkap dalam perundingan di Magelang, lalu diasingkan hingga wafat di Makassar.',
    form: 'Perjuangan bersenjata dan kepemimpinan rakyat',
    service:
      'Membangkitkan perlawanan rakyat terhadap penjajahan dan menjadi teladan keberanian serta keteguhan hati.',
    sacrifice: 'Kehilangan kebebasan dan diasingkan dari tanah kelahirannya sampai akhir hayat.',
    fact: 'Perang Diponegoro berlangsung lima tahun dan menguras tenaga serta biaya besar penjajah Belanda.',
    gender: 'male',
    colors: { robe: '#f2ead6', accent: '#4f7b5c', skin: '#b07b57', head: '#111a18' },
    pathIds: ['pejuang'],
  },
  cutnyak: {
    id: 'cutnyak',
    name: 'Cut Nyak Dhien',
    fullName: 'Cut Nyak Dhien',
    years: '1848 – 1908',
    origin: 'Aceh Besar, Aceh',
    struggle:
      'Memimpin perlawanan rakyat Aceh dalam Perang Aceh. Setelah suaminya, Teuku Umar, gugur, ia meneruskan perjuangan meskipun harus bersembunyi di hutan. Ia akhirnya ditangkap dan diasingkan ke Sumedang, Jawa Barat.',
    form: 'Perjuangan bersenjata bersama rakyat',
    service: 'Menjadi pemimpin perempuan yang mengobarkan semangat perlawanan rakyat Aceh.',
    sacrifice: 'Kehilangan keluarga, hidup berpindah-pindah, lalu diasingkan jauh dari Aceh hingga wafat.',
    fact: 'Setelah ditangkap dan diasingkan, orang-orang di sekitarnya justru menghormati keteguhan hatinya.',
    gender: 'female',
    colors: { robe: '#2b3038', accent: '#c9a35a', skin: '#b07b57', head: '#1c2227' },
    pathIds: ['pejuang'],
  },
  pattimura: {
    id: 'pattimura',
    name: 'Pattimura',
    fullName: 'Thomas Matulessy (Pattimura)',
    years: '1783 – 1817',
    origin: 'Hualoy, Maluku',
    struggle:
      'Memimpin perlawanan rakyat Maluku terhadap Belanda pada 1817. Perlawanan bergerak dari Saparua, antara lain menyerang Benteng Duurstede. Pattimura akhirnya ditangkap, diadili, dan dihukum gantung di Ambon.',
    form: 'Perjuangan bersenjata dan pengorganisasian rakyat',
    service: 'Menyatukan semangat perlawanan rakyat Maluku terhadap penjajahan.',
    sacrifice: 'Memberikan nyawanya untuk perjuangan rakyat Maluku.',
    fact: 'Namanya diabadikan sebagai nama jalan, kapal, dan universitas di Maluku.',
    gender: 'male',
    colors: { robe: '#e8dfc8', accent: '#a4352b', skin: '#9c6b49', head: '#161d1b' },
    pathIds: ['pejuang'],
  },
  sudirman: {
    id: 'sudirman',
    name: 'Jenderal Sudirman',
    fullName: 'Jenderal Besar TNI Raden Soedirman',
    years: '1916 – 1950',
    origin: 'Purbalingga, Jawa Tengah',
    struggle:
      'Menjadi Panglima Besar TKR/TNI pertama. Ia memimpin perjuangan mempertahankan kemerdekaan, termasuk gerilya menghadapi Agresi Militer Belanda. Meskipun sakit paru-paru, ia tetap memimpin perjuangan dari medan gerilya.',
    form: 'Perjuangan bersenjata dan kepemimpinan militer',
    service: 'Menjaga dan mempertahankan kemerdekaan Indonesia melalui keteladanan seorang pemimpin.',
    sacrifice: 'Mengorbankan kesehatan dan ketenangan hidupnya untuk perjuangan bangsa.',
    fact: 'Ia pernah memimpin gerilya sambil ditandu karena kondisi kesehatannya sangat lemah.',
    gender: 'male',
    colors: { robe: '#6c7258', accent: '#c9a35a', skin: '#a77450', head: '#1a211e' },
    pathIds: ['pejuang', 'pemersatu'],
  },
  kihajar: {
    id: 'kihajar',
    name: 'Ki Hajar Dewantara',
    fullName: 'Raden Mas Soewardi Soerjaningrat',
    years: '1889 – 1959',
    origin: 'Yogyakarta',
    struggle:
      'Memperjuangkan pendidikan bagi rakyat Indonesia. Pada 1922 ia mendirikan perguruan Taman Siswa yang memberi kesempatan belajar kepada anak pribumi. Ia juga menjadi Menteri Pendidikan setelah kemerdekaan.',
    form: 'Pendidikan dan pemikiran',
    service: 'Merintis pendidikan yang merdeka dan menghargai setiap anak; diakui sebagai Bapak Pendidikan Nasional.',
    sacrifice: 'Mengalami tekanan dan pembuangan oleh pemerintah kolonial karena gagasan-gagasannya.',
    fact: 'Semboyan Taman Siswa, “Ing ngarsa sung tuladha, ing madya mangun karsa, tut wuri handayani”, sampai sekarang dipakai dalam pendidikan Indonesia.',
    gender: 'male',
    colors: { robe: '#e7ddc4', accent: '#5e6b3f', skin: '#a77450', head: '#1a1a18' },
    pathIds: ['pemikir'],
  },
  kartini: {
    id: 'kartini',
    name: 'R.A. Kartini',
    fullName: 'Raden Ajeng Kartini',
    years: '1879 – 1904',
    origin: 'Jepara, Jawa Tengah',
    struggle:
      'Memperjuangkan pendidikan dan kedudukan perempuan pribumi. Gagasan-gagasannya ia tuliskan dalam surat-surat kepada sahabat-sahabatnya di Belanda. Setelah wafat, surat-surat itu diterbitkan dengan judul “Door Duisternis tot Licht”.',
    form: 'Pemikiran dan pendidikan',
    service: 'Menginspirasi perjuangan pendidikan bagi perempuan dan lahirnya sekolah-sekolah Kartini.',
    sacrifice: 'Berjuang melawan pandangan zaman yang membatasi pendidikan perempuan, dalam usia yang singkat.',
    fact: 'Habis Gelap Terbitlah Terang adalah judul terjemahan Indonesia dari kumpulan suratnya, bukan kalimat yang ia ucapkan langsung.',
    gender: 'female',
    colors: { robe: '#2f3d45', accent: '#d7b46e', skin: '#b98a63', head: '#171c1e' },
    pathIds: ['pemikir'],
  },
  tjokro: {
    id: 'tjokro',
    name: 'H.O.S. Tjokroaminoto',
    fullName: 'Raden Hadji Oemar Said Tjokroaminoto',
    years: '1882 – 1934',
    origin: 'Ponorogo, Jawa Timur',
    struggle:
      'Memimpin Sarekat Islam, organisasi massa yang memperjuangkan kepentingan rakyat pribumi. Ia juga seorang advokat yang membela rakyat kecil dan guru bagi banyak pemuda pejuang, termasuk Soekarno.',
    form: 'Organisasi, pemikiran, dan perjuangan politik',
    service: 'Membangun kesadaran politik rakyat dan menumbuhkan banyak pemimpin pergerakan nasional.',
    sacrifice: 'Hidup dalam tekanan pemerintahan kolonial, namun terus menyuarakan keadilan bagi rakyat.',
    fact: 'Rumahnya di Surabaya menjadi tempat berkumpul dan belajar para pemuda pergerakan.',
    gender: 'male',
    colors: { robe: '#ece2cc', accent: '#3f5d4f', skin: '#9c6b49', head: '#1c1a16' },
    pathIds: ['pemikir'],
  },
  soekarno: {
    id: 'soekarno',
    name: 'Soekarno',
    fullName: 'Ir. Soekarno',
    years: '1901 – 1970',
    origin: 'Surabaya, Jawa Timur',
    struggle:
      'Tokoh pergerakan nasional yang mendirikan Partai Nasional Indonesia (1927). Bersama Mohammad Hatta, ia memproklamasikan kemerdekaan Indonesia pada 17 Agustus 1945. Ia menjadi Presiden pertama Republik Indonesia.',
    form: 'Politik, pemikiran, diplomasi, dan kepemimpinan',
    service: 'Membacakan teks Proklamasi Kemerdekaan dan memimpin bangsa Indonesia pada masa awal kemerdekaan.',
    sacrifice: 'Mengalami penjara dan pengasingan oleh pemerintah kolonial karena perjuangannya.',
    fact: 'Teks Proklamasi disusun di rumah Laksamana Maeda dan ditandatangani oleh Soekarno serta Mohammad Hatta.',
    gender: 'male',
    colors: { robe: '#f1e9d5', accent: '#3c3a39', skin: '#a77450', head: '#171513' },
    pathIds: ['pemersatu'],
  },
  hatta: {
    id: 'hatta',
    name: 'Mohammad Hatta',
    fullName: 'Drs. Mohammad Hatta',
    years: '1902 – 1980',
    origin: 'Bukittinggi, Sumatera Barat',
    struggle:
      'Tokoh pergerakan yang memperjuangkan kemerdekaan melalui organisasi dan diplomasi. Bersama Soekarno, ia memproklamasikan kemerdekaan Indonesia pada 17 Agustus 1945 dan menjadi Wakil Presiden pertama.',
    form: 'Politik, organisasi, dan diplomasi',
    service: 'Berperan dalam perjuangan diplomasi untuk pengakuan kedaulatan Indonesia; dikenal sebagai tokoh yang memperjuangkan ekonomi kerakyatan.',
    sacrifice: 'Beberapa kali ditahan dan diasingkan karena mempertahankan gagasan kemerdekaan.',
    fact: 'Ia dikenal sebagai Bung Hatta, salah satu tokoh yang memperkenalkan pentingnya koperasi bagi ekonomi rakyat.',
    gender: 'male',
    colors: { robe: '#e9e2d0', accent: '#2c3b3c', skin: '#a77450', head: '#161a1a' },
    pathIds: ['pemersatu'],
  },
};

const archiveStatements = [
  { id: 'a1', text: 'Warga negara Indonesia yang berjasa besar terhadap bangsa dan negara.', valid: true, reason: 'Termasuk syarat umum: berjasa terhadap bangsa dan negara.' },
  { id: 'a2', text: 'Memiliki integritas moral dan keteladanan serta berkelakuan baik.', valid: true, reason: 'Termasuk syarat umum dalam UU No. 20 Tahun 2009.' },
  { id: 'a3', text: 'Pernah menyerah kepada penjajah ketika perjuangan sedang sulit.', valid: false, reason: 'Syarat khusus justru menyebut tidak pernah menyerah pada musuh dalam perjuangan.' },
  { id: 'a4', text: 'Pernah melahirkan gagasan atau pemikiran besar yang menunjang pembangunan bangsa.', valid: true, reason: 'Termasuk syarat khusus bagi tokoh yang telah wafat.' },
  { id: 'a5', text: 'Pernah menghasilkan karya besar yang bermanfaat bagi kesejahteraan masyarakat luas.', valid: true, reason: 'Termasuk syarat khusus dalam UU No. 20 Tahun 2009.' },
  { id: 'a6', text: 'Hanya terkenal di media sosial, tanpa jasa atau perjuangan bagi bangsa.', valid: false, reason: 'Ketenaran saja bukan dasar penganugerahan gelar Pahlawan Nasional.' },
];

export const ARCHIVE_STATEMENTS = archiveStatements;

export const ARCHIVE_INFO = {
  title: 'Gelar Pahlawan Nasional',
  definition:
    'Pahlawan Nasional adalah gelar yang diberikan kepada warga negara Indonesia atau seseorang yang berjuang melawan penjajahan di wilayah yang sekarang menjadi Negara Kesatuan Republik Indonesia, yang gugur atau meninggal dunia demi membela bangsa dan negara, atau yang semasa hidupnya melakukan tindakan kepahlawanan atau menghasilkan prestasi dan karya luar biasa bagi pembangunan dan kemajuan bangsa dan negara Republik Indonesia.',
  source: 'UU No. 20 Tahun 2009 tentang Gelar, Tanda Jasa, dan Tanda Kehormatan, Pasal 25 dan 26.',
  general: [
    'Warga negara Indonesia, atau seseorang yang berjuang di wilayah yang sekarang menjadi wilayah NKRI.',
    'Memiliki integritas moral dan keteladanan.',
    'Berkelakuan baik serta berjasa terhadap bangsa dan negara.',
    'Setia dan tidak mengkhianati bangsa dan negara.',
    'Tidak pernah dipidana penjara paling singkat 5 tahun berdasarkan putusan pengadilan yang berkekuatan hukum tetap.',
  ],
  special: [
    'Pernah memimpin dan melakukan perjuangan bersenjata, politik, atau perjuangan di bidang lain untuk mencapai, merebut, mempertahankan, dan mengisi kemerdekaan serta mewujudkan persatuan bangsa.',
    'Tidak pernah menyerah pada musuh dalam perjuangan.',
    'Melakukan pengabdian dan perjuangan hampir sepanjang hidupnya, melebihi tugas yang diemban.',
    'Pernah melahirkan gagasan atau pemikiran besar yang menunjang pembangunan bangsa dan negara.',
    'Pernah menghasilkan karya besar yang bermanfaat bagi kesejahteraan masyarakat luas.',
    'Memiliki konsistensi semangat kebangsaan yang tinggi, dengan perjuangan berdampak luas dan berskala nasional.',
  ],
  note: 'Disarikan dalam bahasa sederhana untuk siswa kelas 6 SD. Gelar ini diberikan melalui proses pengusulan dan penelitian, bukan dipilih sendiri.',
};

const pejuangChapters: Chapter[] = [
  {
    n: 1,
    title: 'Gerbang Sejarah',
    kicker: 'Babak I',
    location: 'Kampung Lereng Bukit',
    synopsis:
      'HANIF membawamu ke perkampungan Indonesia pada masa penjajahan. Kehidupan rakyat serba sulit, tetapi semangat gotong royong tetap hidup.',
    objective: 'Temukan 3 jejak memori perjuangan di sekitar perkampungan.',
    hanifIntro: [
      'Inilah perkampungan pada masa penjajahan. Rakyat hidup sederhana, tetapi banyak yang dipaksa bekerja dan menyerahkan hasil panennya.',
      'Di sini ada tiga benda sejarah yang menyimpan jejak perjuangan. Cari dan sentuh benda bercahaya itu, ya!',
    ],
    hanifTip: 'Gunakan joystick atau WASD untuk berjalan. Benda sejarah ditandai cahaya berwarna emas.',
    items: [
      {
        id: 'pej-1-1',
        name: 'Selendang Cut Nyak Dhien',
        kind: 'relic',
        icon: '♜',
        teaser: 'Kain usang beraroma hutan Aceh.',
        story:
          'Selendang ini mengingatkan pada Cut Nyak Dhien, pemimpin perempuan dari Aceh. Ia meneruskan perlawanan rakyat setelah suaminya gugur, meski harus berpindah-pindah di hutan.',
        heroId: 'cutnyak',
      },
      {
        id: 'pej-1-2',
        name: 'Pecahan Bata Benteng Duurstede',
        kind: 'relic',
        icon: '⚑',
        teaser: 'Bata tua dari Maluku, 1817.',
        story:
          'Benda ini membawa ingatan pada Pattimura yang memimpin rakyat Maluku melawan penjajahan. Ia berani menghadapi Benteng Duurstede di Saparua bersama rakyat.',
        heroId: 'pattimura',
      },
      {
        id: 'pej-1-3',
        name: 'Tongkat Gerilya',
        kind: 'relic',
        icon: '✚',
        teaser: 'Tongkat kayu sederhana, saksi perjalanan panjang.',
        story:
          'Tongkat ini mengingatkan pada perjalanan gerilya Jenderal Sudirman. Meski sakit, ia tetap memimpin perjuangan mempertahankan kemerdekaan.',
        heroId: 'sudirman',
      },
    ],
    challenge: {
      type: 'quiz',
      title: 'Memahami Perjuangan',
      prompt: 'HANIF ingin memastikan kamu memahami babak ini.',
      question: 'Mengapa bangsa Indonesia melakukan perjuangan melawan penjajah?',
      options: [
        'Karena rakyat ingin bebas menentukan nasib dan hidup sejahtera di tanahnya sendiri.',
        'Karena ingin memperluas wilayah kekuasaan ke negara lain.',
        'Karena ingin mengganti nama semua kota di Indonesia.',
      ],
      correctIndex: 0,
      explanation:
        'Perjuangan dilakukan untuk membebaskan bangsa dari penjajahan dan memperoleh hak menentukan nasib sendiri.',
      hint: 'Pikirkan hak dasar setiap bangsa: bebas dan sejahtera di tanahnya sendiri.',
    },
  },
  {
    n: 2,
    title: 'Bertemu Sang Pahlawan',
    kicker: 'Babak II',
    location: 'Pendopo Sang Pahlawan',
    synopsis:
      'Di pendopo tua, seorang tokoh agung menantimu. Ia adalah Pangeran Diponegoro, pemimpin Perang Jawa.',
    objective: 'Temui Pangeran Diponegoro di pendopo dan dengarkan kisahnya.',
    hanifIntro: [
      'Di pendopo itu ada sosok yang tidak asing. Itu Pangeran Diponegoro!',
      'Dekati beliau, lalu tekan tombol Interaksi. Simak kisahnya dengan saksama.',
    ],
    hanifTip: 'Tokoh sejarah ditandai lingkaran cahaya. Tekan E di komputer atau tombol Interaksi di layar.',
    items: [],
    challenge: {
      type: 'quiz',
      title: 'Jejak Pangeran Diponegoro',
      prompt: 'Kamu telah mendengar kisah Pangeran Diponegoro.',
      question: 'Apa bentuk perjuangan yang dilakukan Pangeran Diponegoro?',
      options: [
        'Memimpin Perang Jawa melawan penjajahan Belanda pada 1825–1830.',
        'Membangun sekolah untuk anak pribumi.',
        'Memimpin perundingan damai tanpa pernah melawan penjajah.',
      ],
      correctIndex: 0,
      explanation:
        'Pangeran Diponegoro memimpin Perang Jawa (1825–1830). Ia ditangkap dalam perundingan di Magelang lalu diasingkan.',
      hint: 'Beliau memimpin perlawanan besar di Jawa pada abad ke-19.',
    },
  },
  {
    n: 3,
    title: 'Ujian Pengorbanan',
    kicker: 'Babak III',
    location: 'Jembatan Hutan',
    synopsis:
      'Perjalanan menuju tempat aman tidak mudah. Kamu bertemu warga yang membutuhkan bantuan dan harus menentukan pilihan.',
    objective: 'Temui dan bantu 3 warga di jalur hutan. Setiap pilihan meninggalkan kesan berbeda.',
    hanifIntro: [
      'Jalan di hutan ini tidak mudah. Ada warga yang membutuhkan pertolonganmu.',
      'Setiap pilihan akan mengubah pengalamanmu. Tidak ada jawaban yang sempurna, tetapi berjuanglah dengan hati.',
    ],
    hanifTip: 'Dengarkan situasinya, lalu pilih dengan bijak. Pilihanmu akan dicatat dalam Jurnal Perjalanan.',
    items: [
      {
        id: 'pej-3-1',
        name: 'Ibu Sari',
        kind: 'ally',
        icon: '❦',
        teaser: 'Seorang ibu menunggu di tepi jalan.',
        story:
          'Ibu Sari kebingungan. Hasil panennya diambil penjajah, sehingga ia tidak punya bekal untuk anak-anaknya. Kamu membawa sedikit beras dalam tas.',
        choices: [
          { id: 'a', label: 'Berbagi bekal dan membantu mencari makanan bersama.', score: 10, feedback: 'Ibu Sari tersenyum. Gotong royong meringankan beban yang berat.', consequence: 'Warga desa membantumu menunjukkan jalan yang aman.' },
          { id: 'b', label: 'Menanyakan jalan lalu bergegas pergi agar misi cepat selesai.', score: 2, feedback: 'Misi tetap berjalan, tetapi Ibu Sari tampak kecewa.', consequence: 'Perjalananmu lebih sunyi dan cepat.' },
        ],
      },
      {
        id: 'pej-3-2',
        name: 'Jembatan Tua',
        kind: 'ally',
        icon: '⌗',
        teaser: 'Papan jembatan rusak. Ada juru perahu di dekat sungai.',
        story:
          'Jembatan kayu menuju kampung aman rusak. Pak Rudi, juru perahu, menawarkan bantuan, tetapi perahunya perlu didayung bersama.',
        choices: [
          { id: 'a', label: 'Mendayung bersama Pak Rudi dan mengangkut warga.', score: 10, feedback: 'Kerja sama membuat semua warga sampai dengan selamat.', consequence: 'Warga menamai jembatan itu “Jembatan Harapan”.' },
          { id: 'b', label: 'Memperbaiki jembatan sendiri dan meminta warga menunggu.', score: 5, feedback: 'Perbaikan berhasil, tetapi memakan lebih banyak waktu.', consequence: 'Semua selamat, meski sempat menunggu lama.' },
          { id: 'c', label: 'Mencari jalan memutar sendirian.', score: 0, feedback: 'Kamu menemukan jalan, tetapi warga masih terjebak di tepi sungai.', consequence: 'Cerita berlanjut, tetapi warga belum terbantu.' },
        ],
      },
      {
        id: 'pej-3-3',
        name: 'Pemuda Pembawa Pesan',
        kind: 'ally',
        icon: '✉',
        teaser: 'Pemuda itu kehabisan tenaga membawa pesan.',
        story:
          'Seorang pemuda membawa pesan penting dari pejuang, tetapi ia kelelahan. Kamu bisa meneruskan pesan itu atau memaksanya tetap berjalan.',
        choices: [
          { id: 'a', label: 'Meneruskan pesan dengan hati-hati agar tidak hilang.', score: 10, feedback: 'Pesan sampai dengan aman. Kepercayaan tumbuh dari tanggung jawab.', consequence: 'Pejuang menerima kabar tepat waktu.' },
          { id: 'b', label: 'Menyuruhnya beristirahat lalu memeriksa pesan sendiri.', score: 5, feedback: 'Kamu penasaran dengan isi pesan, tetapi tetap menyampaikannya.', consequence: 'Pesan sampai, meskipun terasa ada keraguan.' },
        ],
      },
    ],
    challenge: {
      type: 'quiz',
      title: 'Memaknai Pengorbanan',
      prompt: 'HANIF mengajakmu merenungkan pengalaman di hutan.',
      question: 'Apa makna pengorbanan yang paling tepat dalam perjuangan bangsa?',
      options: [
        'Memberikan yang terbaik bagi kepentingan bersama, meski harus mengorbankan kepentingan pribadi.',
        'Hanya mau membantu bila diberi imbalan.',
        'Meninggalkan semua orang agar cepat mencapai tujuan.',
      ],
      correctIndex: 0,
      explanation:
        'Pengorbanan berarti rela berbuat demi kepentingan yang lebih besar, bukan demi imbalan pribadi.',
      hint: 'Perhatikan kata “bersama” dan “kepentingan orang banyak”.',
    },
  },
  {
    n: 4,
    title: 'Arsip Pahlawan Nasional',
    kicker: 'Babak IV',
    location: 'Rumah Arsip',
    synopsis:
      'Rumah arsip menyimpan rahasia gelar Pahlawan Nasional. Kamu harus memeriksa dokumen dengan teliti.',
    objective: 'Masuki Rumah Arsip dan pilah dokumen sesuai kriteria Pahlawan Nasional.',
    hanifIntro: [
      'Kita tiba di rumah arsip. Di dalamnya tersimpan aturan tentang gelar Pahlawan Nasional.',
      'Ada beberapa dokumen yang perlu kamu pilah. Bacalah dengan tenang, aku akan membantumu.',
    ],
    hanifTip: 'Pilih “Sesuai” bila pernyataan sesuai dengan kriteria UU No. 20 Tahun 2009, dan “Bukan” bila tidak sesuai.',
    items: [],
    challenge: {
      type: 'archive',
      title: 'Memilah Dokumen Arsip',
      prompt: 'Tentukan apakah setiap dokumen sesuai dengan kriteria Pahlawan Nasional.',
      hint: 'Ingat: jasa dan keteladanan penting; menyerah pada penjajah dan ketenaran tanpa jasa tidak termasuk kriteria.',
    },
  },
  {
    n: 5,
    title: 'Warisan Perjuangan',
    kicker: 'Babak V',
    location: 'Bukit Merah Putih',
    synopsis: 'Matahari terbit. Bendera Merah Putih berkibar di puncak bukit. Perjalananmu menuju akhir.',
    objective: 'Naiki bukit dan bicaralah dengan HANIF di dekat bendera.',
    hanifIntro: [
      'Kita sudah sampai di bukit terakhir. Lihat, matahari mulai terbit dan Merah Putih berkibar.',
      'Ada satu pesan yang ingin kusampaikan sebelum petualangan ini selesai. Temuilah aku di dekat bendera.',
    ],
    hanifTip: 'Cari bendera besar di puncak bukit, lalu tekan Interaksi untuk mengakhiri petualangan.',
    items: [],
    challenge: {
      type: 'final',
      title: 'Warisan Perjuangan',
      prompt: 'HANIF menunggumu di dekat bendera.',
    },
  },
];

const pemikirChapters: Chapter[] = [
  {
    n: 1,
    title: 'Gerbang Sejarah',
    kicker: 'Babak I',
    location: 'Kampung Sekolah Rakyat',
    synopsis:
      'Kamu tiba di kampung pada masa kolonial. Hanya sedikit anak pribumi yang bisa sekolah, tetapi harapan tetap tumbuh.',
    objective: 'Temukan 3 jejak gagasan di sekitar sekolah rakyat.',
    hanifIntro: [
      'Perjuangan tidak hanya di medan perang. Di kampung ini, ada yang berjuang melalui pendidikan.',
      'Cari tiga jejak gagasan bercahaya di sekitar sekolah rakyat. Setiap jejak menyimpan kisah penting.',
    ],
    hanifTip: 'Benda sejarah bersinar keemasan. Dekati dan tekan tombol Interaksi.',
    items: [
      {
        id: 'pem-1-1',
        name: 'Surat untuk Sahabat',
        kind: 'relic',
        icon: '✉',
        teaser: 'Lembaran surat dengan tulisan tertata rapi.',
        story:
          'Surat ini mengingatkan pada R.A. Kartini. Ia menuliskan gagasan tentang pendidikan perempuan pribumi kepada sahabat-sahabatnya. Surat-suratnya kemudian dibukukan.',
        heroId: 'kartini',
      },
      {
        id: 'pem-1-2',
        name: 'Stempel Sarekat Islam',
        kind: 'relic',
        icon: '◉',
        teaser: 'Stempel organisasi rakyat dari masa pergerakan.',
        story:
          'H.O.S. Tjokroaminoto memimpin Sarekat Islam, organisasi yang memperjuangkan kepentingan rakyat pribumi. Rumahnya menjadi tempat belajar banyak pemuda pejuang.',
        heroId: 'tjokro',
      },
      {
        id: 'pem-1-3',
        name: 'Pena Sang Guru',
        kind: 'relic',
        icon: '✎',
        teaser: 'Pena kayu yang terasa hangat.',
        story:
          'Ki Hajar Dewantara percaya bahwa pendidikan dapat membebaskan rakyat. Melalui Taman Siswa, ia membuka pintu belajar bagi anak pribumi.',
        heroId: 'kihajar',
      },
    ],
    challenge: {
      type: 'quiz',
      title: 'Memahami Jalan Pemikiran',
      prompt: 'HANIF mengajakmu merenungkan kekuatan pendidikan.',
      question: 'Mengapa pendidikan penting bagi perjuangan bangsa?',
      options: [
        'Agar rakyat dapat berpikir, belajar, dan maju menuju kehidupan yang lebih baik.',
        'Agar rakyat tidak perlu bekerja dan hanya menunggu bantuan.',
        'Agar hanya orang tertentu yang bisa menjadi pintar.',
      ],
      correctIndex: 0,
      explanation:
        'Pendidikan mencerdaskan rakyat dan membuka jalan menuju kemajuan bersama. Inilah perjuangan melalui pemikiran.',
      hint: 'Pendidikan memberi kemampuan berpikir dan berbuat untuk kemajuan bersama.',
    },
  },
  {
    n: 2,
    title: 'Bertemu Sang Pahlawan',
    kicker: 'Babak II',
    location: 'Taman Siswa',
    synopsis:
      'Di halaman sekolah, Ki Hajar Dewantara menantimu. Ia dikenal sebagai Bapak Pendidikan Nasional.',
    objective: 'Temui Ki Hajar Dewantara dan pelajari jalan perjuangannya.',
    hanifIntro: [
      'Lihat, itu Ki Hajar Dewantara. Beliau memperjuangkan pendidikan bagi seluruh rakyat Indonesia.',
      'Dekati beliau dan tekan tombol Interaksi. Ada pertanyaan yang ingin beliau ajukan kepadamu.',
    ],
    hanifTip: 'Dengarkan informasinya dengan teliti sebelum menjawab pertanyaan.',
    items: [],
    challenge: {
      type: 'quiz',
      title: 'Jejak Ki Hajar Dewantara',
      prompt: 'Ki Hajar Dewantara bertanya tentang pendidikan.',
      question: 'Mengapa pendidikan penting bagi perjuangan bangsa?',
      options: [
        'Agar rakyat dapat berpikir, belajar, dan maju.',
        'Agar rakyat tidak perlu bekerja.',
        'Agar hanya orang tertentu yang pintar.',
      ],
      correctIndex: 0,
      explanation:
        'Pendidikan mencerdaskan kehidupan bangsa. Ki Hajar Dewantara merintis Taman Siswa agar anak pribumi dapat belajar.',
      hint: 'Pikirkan kata “mencerdaskan” dalam Pembukaan UUD 1945.',
    },
  },
  {
    n: 3,
    title: 'Ujian Pengorbanan',
    kicker: 'Babak III',
    location: 'Perpustakaan Tua',
    synopsis:
      'Di perpustakaan tua, gagasan-gagasan perjuangan tersimpan rapih. Namun, beberapa teman membutuhkan bantuanmu.',
    objective: 'Bantu 3 sahabat di perpustakaan dan sekitar sekolah untuk menyebarkan gagasan baik.',
    hanifIntro: [
      'Buku adalah jendela dunia. Namun, ilmu akan bermanfaat jika dibagikan kepada orang lain.',
      'Tiga sahabat kita sedang kesulitan. Bantulah mereka dan lihat apa yang terjadi selanjutnya.',
    ],
    hanifTip: 'Setiap pilihanmu memengaruhi pengalaman perjalanan. Dengarkan dulu, baru putuskan.',
    items: [
      {
        id: 'pem-3-1',
        name: 'Pak Guru Terbantu',
        kind: 'ally',
        icon: '✦',
        teaser: 'Guru muda kelelahan menyiapkan kelas.',
        story:
          'Pak Guru kesulitan menyiapkan bahan pelajaran. Kamu memiliki buku catatan yang bisa membantu.',
        choices: [
          { id: 'a', label: 'Membantu menyusun bahan ajar dan berbagi catatan.', score: 10, feedback: 'Kelas menjadi hidup. Ilmu tumbuh ketika dibagikan.', consequence: 'Banyak anak semangat belajar membaca.' },
          { id: 'b', label: 'Meminjamkan buku tanpa membantu menyusun bahan.', score: 5, feedback: 'Pak Guru berterima kasih, namun pekerjaan tetap berat.', consequence: 'Kelas tetap berjalan dengan sedikit persiapan.' },
        ],
      },
      {
        id: 'pem-3-2',
        name: 'Percetakan Surat Kabar',
        kind: 'ally',
        icon: '▤',
        teaser: 'Mesin cetak berhenti karena kehabisan tenaga.',
        story:
          'Pekerja percetakan kelelahan, padahal surat kabar berisi gagasan persatuan harus segera dibagikan kepada rakyat.',
        choices: [
          { id: 'a', label: 'Ikut membantu menyortir surat kabar agar segera tersebar.', score: 10, feedback: 'Gagasan baik sampai ke banyak orang.', consequence: 'Rakyat mulai berdiskusi tentang nasib bangsanya sendiri.' },
          { id: 'b', label: 'Mengambil satu surat kabar untuk diri sendiri lalu pergi.', score: 2, feedback: 'Kamu mendapat bacaan, tetapi gagasan itu belum sampai kepada rakyat.', consequence: 'Surat kabar tetap menumpuk di percetakan.' },
        ],
      },
      {
        id: 'pem-3-3',
        name: 'Sahabat Belajar',
        kind: 'ally',
        icon: '✧',
        teaser: 'Seorang anak kesulitan membaca.',
        story:
          'Seorang anak merasa malu karena belum lancar membaca. Ia ingin pulang saja.',
        choices: [
          { id: 'a', label: 'Mengajaknya belajar perlahan sambil menyemangati.', score: 10, feedback: 'Anak itu tersenyum dan berani mencoba lagi.', consequence: 'Ia mulai percaya bahwa setiap orang bisa belajar.' },
          { id: 'b', label: 'Menyarankan ia belajar sendiri saja.', score: 0, feedback: 'Anak itu tertunduk dan berjalan pulang.', consequence: 'Kesempatan belajar si anak tertunda.' },
        ],
      },
    ],
    challenge: {
      type: 'quiz',
      title: 'Memaknai Ilmu yang Berbagi',
      prompt: 'HANIF menutup buku dan bertanya tentang pengalamanmu.',
      question: 'Bagaimana ilmu dapat menjadi bentuk perjuangan?',
      options: [
        'Dengan berbagi ilmu agar orang lain dapat maju dan berdaya.',
        'Dengan menyimpan ilmu hanya untuk diri sendiri.',
        'Dengan menggunakan ilmu untuk menipu orang lain.',
      ],
      correctIndex: 0,
      explanation: 'Ilmu bermanfaat bila dibagikan. Pendidikan dan pemikiran mengubah masa depan bangsa.',
      hint: 'Ilmu yang baik akan bertambah ketika dibagikan.',
    },
  },
  {
    n: 4,
    title: 'Arsip Pahlawan Nasional',
    kicker: 'Babak IV',
    location: 'Rumah Arsip',
    synopsis:
      'Rumah arsip tua di ujung jalan menyimpan naskah penting tentang gelar Pahlawan Nasional.',
    objective: 'Masuki Rumah Arsip dan pilah dokumen sesuai kriteria Pahlawan Nasional.',
    hanifIntro: [
      'Arsip ini menyimpan aturan tentang siapa yang dapat memperoleh gelar Pahlawan Nasional.',
      'Ilmu membutuhkan ketelitian. Bacalah setiap dokumen dan tentukan apakah sesuai dengan kriteria.',
    ],
    hanifTip: 'Sesuai berarti pernyataan selaras dengan UU No. 20 Tahun 2009. Bukan berarti tidak ada dalam kriteria.',
    items: [],
    challenge: {
      type: 'archive',
      title: 'Memilah Dokumen Arsip',
      prompt: 'Tentukan apakah setiap dokumen sesuai dengan kriteria Pahlawan Nasional.',
      hint: 'Perhatikan jasa, keteladanan, dan kesetiaan. Ketenaran tanpa jasa bukan kriteria.',
    },
  },
  {
    n: 5,
    title: 'Warisan Perjuangan',
    kicker: 'Babak V',
    location: 'Bukit Cita-Cita',
    synopsis: 'Pagi cerah menyinari halaman sekolah dan bendera Merah Putih di puncak bukit.',
    objective: 'Temui HANIF di dekat bendera untuk menutup petualangan.',
    hanifIntro: [
      'Perjalanan kita hampir selesai. Buku, sekolah, dan surat kabar tadi menunjukkan bahwa pemikiran juga bisa menjadi jalan perjuangan.',
      'Temuilah aku di dekat bendera di puncak bukit. Kita tutup cerita ini bersama.',
    ],
    hanifTip: 'Cari bendera besar di puncak bukit, lalu tekan Interaksi.',
    items: [],
    challenge: { type: 'final', title: 'Warisan Perjuangan', prompt: 'HANIF menunggumu di dekat bendera.' },
  },
];

const pemersatuChapters: Chapter[] = [
  {
    n: 1,
    title: 'Gerbang Sejarah',
    kicker: 'Babak I',
    location: 'Alun-Alun Kota',
    synopsis:
      'Kota bersejarah ini penuh suara perundingan dan harapan. Namun, perbedaan pendapat masih menjadi tantangan.',
    objective: 'Temukan 3 jejak perjuangan di sekitar alun-alun kota.',
    hanifIntro: [
      'Kita berada di kota pada masa pergerakan. Banyak tokoh berdiskusi tentang masa depan bangsa.',
      'Temukan tiga jejak perjuangan di sekitar alun-alun. Setiap jejak membuka kisah persatuan yang berbeda.',
    ],
    hanifTip: 'Benda bercahaya emas bisa ditemukan di sekitar alun-alun. Gunakan peta mini untuk membantu.',
    items: [
      {
        id: 'pms-1-1',
        name: 'Catatan Perundingan',
        kind: 'relic',
        icon: '▤',
        teaser: 'Catatan rapat dengan banyak coretan.',
        story:
          'Catatan ini mengingatkan pada perjuangan diplomasi Mohammad Hatta. Ia berperan besar dalam memperjuangkan pengakuan kedaulatan Indonesia melalui jalan perundingan.',
        heroId: 'hatta',
      },
      {
        id: 'pms-1-2',
        name: 'Buku Saku Proklamasi',
        kind: 'relic',
        icon: '▣',
        teaser: 'Buku kecil dengan tulisan “Merdeka”.',
        story:
          'Soekarno bersama Mohammad Hatta memproklamasikan kemerdekaan Indonesia pada 17 Agustus 1945. Peristiwa itu menjadi awal berdirinya negara merdeka.',
        heroId: 'soekarno',
      },
      {
        id: 'pms-1-3',
        name: 'Tanda Pangkat Gerilya',
        kind: 'relic',
        icon: '★',
        teaser: 'Tanda pangkat dari medan perjuangan.',
        story:
          'Jenderal Sudirman memimpin gerilya untuk mempertahankan kemerdekaan. Ia menjadi contoh persatuan antara pemimpin dan rakyat.',
        heroId: 'sudirman',
      },
    ],
    challenge: {
      type: 'quiz',
      title: 'Memahami Persatuan',
      prompt: 'HANIF mengajakmu merenungkan arti persatuan.',
      question: 'Mengapa persatuan penting bagi bangsa Indonesia?',
      options: [
        'Dengan bersatu, perjuangan menjadi kuat meskipun rakyat berbeda suku dan pendapat.',
        'Persatuan hanya penting bagi orang yang memimpin.',
        'Perbedaan pendapat harus dihilangkan dengan cara apa pun.',
      ],
      correctIndex: 0,
      explanation: 'Persatuan menyatukan kekuatan berbagai kelompok untuk mencapai tujuan bersama: Indonesia merdeka.',
      hint: 'Ingat semboyan bangsa Indonesia tentang perbedaan yang tetap satu.',
    },
  },
  {
    n: 2,
    title: 'Bertemu Sang Pahlawan',
    kicker: 'Babak II',
    location: 'Pendopo Persatuan',
    synopsis:
      'Di pendopo pertemuan, Soekarno berdiri dengan tegas. Ia memperjuangkan kemerdekaan melalui politik dan kepemimpinan.',
    objective: 'Temui Soekarno dan pelajari perjuangannya menyatukan bangsa.',
    hanifIntro: [
      'Itu Bapak Soekarno, salah satu Proklamator Kemerdekaan Indonesia.',
      'Dekati beliau dan dengarkan pesannya. Ada pertanyaan penting yang menantimu.',
    ],
    hanifTip: 'Soekarno memperjuangkan kemerdekaan melalui politik, pemikiran, dan kepemimpinan.',
    items: [],
    challenge: {
      type: 'quiz',
      title: 'Jejak Sang Proklamator',
      prompt: 'Kamu baru saja mendengar kisah Soekarno.',
      question: 'Mengapa peran Soekarno penting dalam sejarah kemerdekaan Indonesia?',
      options: [
        'Ia bersama Mohammad Hatta membacakan teks Proklamasi Kemerdekaan pada 17 Agustus 1945.',
        'Ia menandatangani perjanjian penyerahan Indonesia kepada Belanda.',
        'Ia melarang rakyat berkumpul untuk merayakan kemerdekaan.',
      ],
      correctIndex: 0,
      explanation:
        'Soekarno adalah salah satu Proklamator. Proklamasi 17 Agustus 1945 menjadi tonggak berdirinya negara Indonesia.',
      hint: 'Ingat peristiwa 17 Agustus 1945 di Jalan Pegangsaan Timur.',
    },
  },
  {
    n: 3,
    title: 'Ujian Pengorbanan',
    kicker: 'Babak III',
    location: 'Ruang Perundingan',
    synopsis:
      'Perbedaan pendapat memenuhi ruang perundingan. Kamu perlu belajar mendengar, berbicara, dan mencari titik temu.',
    objective: 'Bantu 3 pihak dengan pendapat berbeda menemukan jalan bersama.',
    hanifIntro: [
      'Di ruang ini, setiap orang punya pendapat. Perbedaan itu wajar, asal kita mau mendengarkan.',
      'Bantu tiga pihak menemukan jalan bersama. Ingat, kadang mengalah bukan berarti kalah.',
    ],
    hanifTip: 'Pilihan terbaik biasanya lahir dari mendengar semua pihak, bukan memaksakan kehendak.',
    items: [
      {
        id: 'pms-3-1',
        name: 'Rapat Warga',
        kind: 'ally',
        icon: '⇄',
        teaser: 'Dua kelompok warga saling berbicara keras.',
        story:
          'Kelompok petani dan pedagang berbeda pendapat tentang pembagian tempat di pasar. Mereka berhenti mendengarkan satu sama lain.',
        choices: [
          { id: 'a', label: 'Mengajak semua duduk dan mendengarkan kebutuhan masing-masing.', score: 10, feedback: 'Mereka mulai saling memahami. Kesepakatan pun terbuka.', consequence: 'Pasar dikelola bersama dengan aturan yang adil.' },
          { id: 'b', label: 'Memihak kelompok yang paling banyak anggotanya.', score: 2, feedback: 'Keputusan cepat dibuat, tetapi kelompok lain kecewa.', consequence: 'Masalah mereda sebentar, lalu muncul lagi.' },
        ],
      },
      {
        id: 'pms-3-2',
        name: 'Pesan Persatuan',
        kind: 'ally',
        icon: '✉',
        teaser: 'Seorang kurir kebingungan membawa pesan.',
        story:
          'Kurir membawa pesan penting untuk pertemuan pemuda, tetapi ia tidak menemukan alamatnya. Waktu terus berjalan.',
        choices: [
          { id: 'a', label: 'Membantu mencari alamat sambil menemani kurir.', score: 10, feedback: 'Pesan sampai. Persatuan dibangun oleh kepedulian kecil.', consequence: 'Pemuda berkumpul dan merumuskan tujuan bersama.' },
          { id: 'b', label: 'Menunjukkan arah perkiraan lalu melanjutkan perjalanan.', score: 3, feedback: 'Kurir tersesat sebentar, tetapi akhirnya menemukan tempat itu.', consequence: 'Pertemuan dimulai terlambat.' },
        ],
      },
      {
        id: 'pms-3-3',
        name: 'Juru Bahasa Perundingan',
        kind: 'ally',
        icon: '❝',
        teaser: 'Dua orang berbicara dengan bahasa berbeda.',
        story:
          'Seorang warga menjawab dengan bahasa daerah yang belum dimengerti petugas. Situasi mulai tegang.',
        choices: [
          { id: 'a', label: 'Meminta waktu untuk menerjemahkan dengan sabar.', score: 10, feedback: 'Kedua pihak mengerti satu sama lain. Ketegangan mereda.', consequence: 'Perundingan berlanjut dengan saling menghormati.' },
          { id: 'b', label: 'Menyimpulkan jawabannya tanpa bertanya lebih dulu.', score: 0, feedback: 'Ternyata kesimpulanmu keliru dan masalah makin rumit.', consequence: 'Perundingan harus diulang dari awal.' },
        ],
      },
    ],
    challenge: {
      type: 'quiz',
      title: 'Memaknai Persatuan',
      prompt: 'HANIF ingin mendengar pendapatmu tentang persatuan.',
      question: 'Apa yang sebaiknya dilakukan ketika ada perbedaan pendapat dalam masyarakat?',
      options: [
        'Berdialog, saling mendengarkan, dan mencari jalan tengah yang adil.',
        'Meninggalkan musyawarah dan memaksakan kehendak sendiri.',
        'Memusuhi semua orang yang berbeda pandangan.',
      ],
      correctIndex: 0,
      explanation: 'Musyawarah dan saling menghormati adalah jalan menjaga persatuan dalam perbedaan.',
      hint: 'Ingat cara musyawarah yang diajarkan Pancasila.',
    },
  },
  {
    n: 4,
    title: 'Arsip Pahlawan Nasional',
    kicker: 'Babak IV',
    location: 'Rumah Arsip',
    synopsis:
      'Dokumen tentang gelar Pahlawan Nasional tersimpan di ruang arsip kota. Saatnya meneliti dengan teliti.',
    objective: 'Masuki Rumah Arsip dan pilah dokumen sesuai kriteria Pahlawan Nasional.',
    hanifIntro: [
      'Gelar Pahlawan Nasional bukan hadiah biasa. Ada syarat yang harus dipenuhi.',
      'Ayo periksa dokumen ini. Ketelitianmu penting agar informasi sejarah tidak keliru.',
    ],
    hanifTip: 'Buka panduan kriteria bila lupa. HANIF akan menampilkan petunjuk yang sederhana.',
    items: [],
    challenge: {
      type: 'archive',
      title: 'Memilah Dokumen Arsip',
      prompt: 'Tentukan apakah setiap dokumen sesuai dengan kriteria Pahlawan Nasional.',
      hint: 'Sesuai dengan kriteria berarti selaras dengan syarat umum dan khusus UU No. 20 Tahun 2009.',
    },
  },
  {
    n: 5,
    title: 'Warisan Perjuangan',
    kicker: 'Babak V',
    location: 'Bukit Merah Putih',
    synopsis:
      'Berbagai karakter masyarakat berkumpul di bukit. Bendera Merah Putih berkibar di antara mereka.',
    objective: 'Temui HANIF di dekat bendera untuk menutup petualangan.',
    hanifIntro: [
      'Lihat, mereka datang dari berbagai latar belakang, tetapi memiliki tujuan yang sama.',
      'Temuilah aku di dekat bendera. Saatnya kamu memahami arti persatuan dalam perjuangan bangsa.',
    ],
    hanifTip: 'Bendera besar dan HANIF berada di puncak bukit. Tekan Interaksi untuk mengakhiri petualangan.',
    items: [],
    challenge: { type: 'final', title: 'Warisan Perjuangan', prompt: 'HANIF menunggumu di dekat bendera.' },
  },
];

export const PATHS: Record<PathId, PathData> = {
  pejuang: {
    id: 'pejuang',
    no: '01',
    title: 'Sang Pejuang',
    theme: 'Keberanian & Pengorbanan',
    tagline: 'Langkah di medan juang',
    description:
      'Masuki hutan perjuangan dan benteng pertahanan. Temui para pejuang yang mempertaruhkan segalanya demi kebebasan bangsa.',
    image: 'images/path-pejuang.jpg',
    accent: '#c85a3f',
    accentSoft: '#f3c9a2',
    featuredHero: 'diponegoro',
    heroIds: ['diponegoro', 'cutnyak', 'pattimura', 'sudirman'],
    scene: {
      skyTop: '#204b4b', skyBottom: '#e2b578', fog: '#8fa982', ground: '#72854f', path: '#b39669',
      grass: '#5c7a42', roof: '#8b3f2e', wood: '#5f4631', glow: '#e9c17a',
    },
    chapters: pejuangChapters,
    ending: {
      id: 'ending-pejuang',
      title: 'Sang Penjaga Kemerdekaan',
      kicker: 'Ending · Jalur Sang Pejuang',
      narration:
        'Kamu telah memahami bahwa kemerdekaan membutuhkan keberanian, keteguhan hati, dan pengorbanan yang besar.',
      hanif:
        'Para pejuang telah memberikan pengorbanan luar biasa. Tugas kita sekarang adalah menjaga kemerdekaan dan mengisinya dengan kebaikan.',
      moral: 'Jadilah generasi yang berani membela kebenaran.',
      badge: 'Pejuang Kecil',
    },
  },
  pemikir: {
    id: 'pemikir',
    no: '02',
    title: 'Sang Pemikir',
    theme: 'Pendidikan & Ilmu',
    tagline: 'Kekuatan gagasan',
    description:
      'Jelajahi sekolah rakyat, perpustakaan tua, dan percetakan surat kabar. Perjuangan bisa tumbuh dari pena dan keberanian berpikir.',
    image: 'images/path-pemikir.jpg',
    accent: '#d9ac5c',
    accentSoft: '#f3e0b4',
    featuredHero: 'kihajar',
    heroIds: ['kihajar', 'kartini', 'tjokro'],
    scene: {
      skyTop: '#456a68', skyBottom: '#f0cf9a', fog: '#b7ac8c', ground: '#8f9762', path: '#c5a675',
      grass: '#74824a', roof: '#8a4933', wood: '#6c5138', glow: '#f3d398',
    },
    chapters: pemikirChapters,
    ending: {
      id: 'ending-pemikir',
      title: 'Sang Penerus Cita-Cita',
      kicker: 'Ending · Jalur Sang Pemikir',
      narration:
        'Kamu telah memahami bahwa perjuangan tidak selalu menggunakan senjata. Pendidikan, ilmu pengetahuan, dan pemikiran dapat mengubah masa depan bangsa.',
      hanif: 'Ilmu pengetahuan adalah bekal untuk melanjutkan perjuangan para pahlawan.',
      moral: 'Jadilah generasi yang cerdas, berilmu, dan bermanfaat.',
      badge: 'Pena Harapan',
    },
  },
  pemersatu: {
    id: 'pemersatu',
    no: '03',
    title: 'Sang Pemersatu',
    theme: 'Persatuan & Diplomasi',
    tagline: 'Bersama menjadi kuat',
    description:
      'Hadiri pertemuan, jelajahi kota bersejarah, dan bantu menyatukan pendapat. Persatuan lahir dari keberanian berdialog.',
    image: 'images/path-pemersatu.jpg',
    accent: '#b98947',
    accentSoft: '#f0d8a8',
    featuredHero: 'soekarno',
    heroIds: ['soekarno', 'hatta', 'sudirman'],
    scene: {
      skyTop: '#2c4657', skyBottom: '#d9a97a', fog: '#8d9a8a', ground: '#77845a', path: '#b29468',
      grass: '#5f7245', roof: '#74352c', wood: '#5c4532', glow: '#f0cf8a',
    },
    chapters: pemersatuChapters,
    ending: {
      id: 'ending-pemersatu',
      title: 'Sang Pemersatu Bangsa',
      kicker: 'Ending · Jalur Sang Pemersatu',
      narration:
        'Kamu telah memahami bahwa persatuan, kerja sama, dan diplomasi merupakan bagian penting dalam perjuangan bangsa.',
      hanif: 'Perbedaan bukan alasan untuk terpecah. Bersama-sama kita menjadi kuat.',
      moral: 'Jadilah generasi yang menjaga persatuan Indonesia.',
      badge: 'Jembatan Bangsa',
    },
  },
};

export const PATH_LIST: PathData[] = [PATHS.pejuang, PATHS.pemikir, PATHS.pemersatu];

export const ALL_HERO_IDS: HeroId[] = [
  'diponegoro', 'cutnyak', 'pattimura', 'sudirman',
  'kihajar', 'kartini', 'tjokro', 'soekarno', 'hatta',
];

export const HERO_RESPONSES: Record<HeroId, { correct: string; hint: string; hanif: string }> = {
  diponegoro: {
    correct: 'Benar. Keberanian bukan berarti tidak merasa takut, tetapi tetap melangkah untuk membela kebenaran dan rakyat.',
    hint: 'Ingat, Pangeran Diponegoro memimpin perlawanan besar di Jawa melawan penjajahan Belanda.',
    hanif: 'Hebat! Kamu berhasil memahami keberanian dan pengorbanan Pangeran Diponegoro.',
  },
  cutnyak: {
    correct: 'Keteguhan hati seorang perempuan Aceh menjadi contoh bahwa keberanian tidak mengenal gender.',
    hint: 'Cut Nyak Dhien meneruskan perlawanan rakyat Aceh setelah suaminya gugur.',
    hanif: 'Hebat! Kamu berhasil memahami keteguhan Cut Nyak Dhien.',
  },
  pattimura: {
    correct: 'Perjuangan rakyat Maluku menunjukkan bahwa rakyat bersatu dapat menghadapi penjajahan.',
    hint: 'Pattimura memimpin rakyat Maluku dan menyerang Benteng Duurstede pada 1817.',
    hanif: 'Hebat! Kamu berhasil memahami keberanian Pattimura.',
  },
  sudirman: {
    correct: 'Pemimpin yang baik memberi teladan. Jenderal Sudirman memimpin gerilya meski sedang sakit.',
    hint: 'Beliau memimpin gerilya mempertahankan kemerdekaan, bahkan sambil ditandu.',
    hanif: 'Hebat! Kamu berhasil memahami keteladanan Jenderal Sudirman.',
  },
  kihajar: {
    correct: 'Benar! Pendidikan merupakan jalan penting untuk mencerdaskan kehidupan bangsa.',
    hint: 'Pikirkan tujuan mulia pendidikan: membuat rakyat mampu berpikir dan maju bersama.',
    hanif: 'Hebat! Kamu berhasil memahami salah satu bentuk perjuangan bangsa.',
  },
  kartini: {
    correct: 'Pendidikan membuka jalan bagi perempuan dan laki-laki untuk ikut memajukan bangsa.',
    hint: 'Kartini memperjuangkan pendidikan bagi perempuan pribumi melalui gagasan-gagasannya.',
    hanif: 'Hebat! Kamu berhasil memahami jalan pemikiran R.A. Kartini.',
  },
  tjokro: {
    correct: 'Organisasi dan pemikiran dapat menyatukan suara rakyat untuk memperjuangkan keadilan.',
    hint: 'Tjokroaminoto memimpin Sarekat Islam yang memperjuangkan kepentingan rakyat pribumi.',
    hanif: 'Hebat! Kamu berhasil memahami kekuatan organisasi rakyat.',
  },
  soekarno: {
    correct: 'Persatuan adalah kekuatan. Dengan bersatu, bangsa ini mampu berdiri tegak dan merdeka.',
    hint: 'Ingat peran Soekarno dalam Proklamasi Kemerdekaan 17 Agustus 1945.',
    hanif: 'Hebat! Kamu berhasil memahami arti persatuan dalam perjuangan.',
  },
  hatta: {
    correct: 'Diplomasi dan musyawarah adalah jalan untuk memperjuangkan kedaulatan dengan bermartabat.',
    hint: 'Mohammad Hatta berperan besar dalam perjuangan diplomasi dan pengakuan kedaulatan.',
    hanif: 'Hebat! Kamu berhasil memahami perjuangan melalui diplomasi.',
  },
};

export const INTRO_DIALOGUE = [
  { speaker: 'hanif', text: 'Selamat datang, Penjelajah Sejarah!' },
  { speaker: 'hanif', text: 'Tahukah kamu bahwa kemerdekaan Indonesia tidak diperoleh dengan mudah?' },
  { speaker: 'player', text: 'Aku ingin mengetahui bagaimana para pahlawan berjuang!' },
  { speaker: 'hanif', text: 'Kalau begitu, bersiaplah! Kita akan menjelajahi berbagai kisah perjuangan bangsa Indonesia.' },
  { speaker: 'hanif', text: 'Tetapi ingat, setiap pilihan akan membawa kita pada pengalaman yang berbeda.' },
  { speaker: 'hanif', text: 'Apakah kamu sudah siap memulai petualangan?' },
];

export const GUIDE_STEPS = [
  { icon: 'compass', title: 'Gerakkan Penjelajah', text: 'Gunakan WASD / tombol panah di komputer, atau joystick di layar HP. Tekan Shift untuk berlari dan Space untuk melompat.' },
  { icon: 'spark', title: 'Cari Jejak Sejarah', text: 'Benda bersejarah dan tokoh ditandai cahaya emas. Dekati lalu tekan E atau tombol Interaksi.' },
  { icon: 'chat', title: 'Bicaralah & Pilih', text: 'Semua tokoh memiliki cerita dan pertanyaan. Pilihanmu memengaruhi respons, pengalaman, dan catatan jurnal.' },
  { icon: 'archive', title: 'Selesaikan 5 Babak', text: 'Setiap jalur memiliki lima babak. Kumpulkan jejak, selesaikan tantangan, dan temui tokoh untuk membuka galeri.' },
  { icon: 'flag', title: 'Raih Ending-mu', text: 'Setiap jalur memiliki ending berbeda. Skor tinggi memberimu gelar istimewa, tetapi semua pemain dapat menyelesaikan cerita.' },
  { icon: 'save', title: 'Progres Tersimpan', text: 'Progres disimpan otomatis di perangkatmu. Kamu bisa melanjutkan petualangan kapan saja dari menu utama.' },
];

export const TIPS = [
  'Perhatikan peta mini di kanan atas untuk menemukan tujuan bercahaya.',
  'Tekan tombol Tanya HANIF kapan saja jika kamu lupa tujuan misi.',
  'Tidak ada jawaban yang membuatmu gagal permanen. Kamu selalu bisa mencoba lagi.',
  'Buka Jurnal Perjalanan untuk melihat pilihan yang sudah kamu ambil.',
  'Galeri Pahlawan terbuka sedikit demi sedikit setiap kali kamu menemukan kisah baru.',
];

export function getRank(score: number, maxScore: number, missions: number) {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio >= 0.84 || (score >= 225 && missions >= 4)) {
    return { title: 'Penjaga Warisan Bangsa', description: 'Luar biasa! Kamu memahami jejak perjuangan dengan sangat baik.', tier: 4 };
  }
  if (ratio >= 0.62 || score >= 165) {
    return { title: 'Ahli Jejak Pahlawan', description: 'Hebat! Pengetahuanmu tentang perjuangan bangsa sudah kuat.', tier: 3 };
  }
  if (ratio >= 0.38 || score >= 100) {
    return { title: 'Penjaga Sejarah', description: 'Baik! Kamu telah menjaga banyak kisah penting dari masa lalu.', tier: 2 };
  }
  return { title: 'Penjelajah Pemula', description: 'Setiap langkah kecil adalah awal perjalanan besar. Teruslah belajar!', tier: 1 };
}

export const MAX_SCORE = 270;
