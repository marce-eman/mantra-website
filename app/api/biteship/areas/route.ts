import { NextResponse } from "next/server";

export interface DistrictItem {
  district: string;
  postal_code: string;
  id: string;
  area_name: string;
  city?: string;
  province?: string;
}

interface FallbackAreaRecord {
  id: string;
  name: string;
  country_code: string;
  province: string;
  city: string;
  district: string;
  subdistrict?: string;
  postal_code: string;
}

// Master Location Database for Instant Scoped Cascading Typeahead
const PROVINCES_BY_COUNTRY: Record<string, string[]> = {
  ID: [
    "West Java",
    "Special Capital Region of Jakarta (DKI Jakarta)",
    "Central Java",
    "East Java",
    "Banten",
    "Special Region of Yogyakarta (DI Yogyakarta)",
    "Bali",
    "West Kalimantan",
    "East Kalimantan",
    "South Kalimantan",
    "Central Kalimantan",
    "North Kalimantan",
    "North Sumatra",
    "West Sumatra",
    "South Sumatra",
    "Riau",
    "Riau Islands",
    "Lampung",
    "Jambi",
    "Bengkulu",
    "Bangka Belitung Islands",
    "Aceh",
    "South Sulawesi",
    "North Sulawesi",
    "Central Sulawesi",
    "Southeast Sulawesi",
    "West Sulawesi",
    "Gorontalo",
    "West Nusa Tenggara (NTB)",
    "East Nusa Tenggara (NTT)",
    "Maluku",
    "North Maluku",
    "Papua",
    "West Papua",
    "South Papua",
    "Central Papua",
    "Highland Papua",
    "Southwest Papua",
  ],
  MY: [
    "Wilayah Persekutuan",
    "Selangor",
    "Johor",
    "Penang",
    "Perak",
    "Sabah",
    "Sarawak",
    "Melaka",
    "Negeri Sembilan",
    "Pahang",
    "Kedah",
    "Terengganu",
    "Kelantan",
    "Perlis",
  ],
  SG: [
    "Central Region",
    "East Region",
    "West Region",
    "North Region",
    "North-East Region",
  ],
  US: [
    "California",
    "New York",
    "Texas",
    "Washington",
    "Illinois",
    "Florida",
    "Massachusetts",
    "Pennsylvania",
    "Georgia",
    "North Carolina",
    "Michigan",
    "New Jersey",
    "Virginia",
    "Ohio",
    "Colorado",
    "Arizona",
    "Oregon",
  ],
  GB: [
    "Greater London",
    "Greater Manchester",
    "West Midlands",
    "West Yorkshire",
    "Scotland",
    "Wales",
    "Northern Ireland",
  ],
  AU: [
    "New South Wales",
    "Victoria",
    "Queensland",
    "Western Australia",
    "South Australia",
    "Tasmania",
    "Australian Capital Territory",
  ],
  JP: [
    "Tokyo",
    "Osaka",
    "Kanagawa",
    "Kyoto",
    "Aichi",
    "Fukuoka",
    "Hokkaido",
    "Hyogo",
    "Saitama",
    "Chiba",
  ],
  DE: [
    "Berlin",
    "Bavaria",
    "North Rhine-Westphalia",
    "Hamburg",
    "Hesse",
    "Baden-Wurttemberg",
    "Lower Saxony",
    "Saxony",
  ],
  FR: [
    "Ile-de-France (Paris)",
    "Auvergne-Rhone-Alpes (Lyon)",
    "Provence-Alpes-Cote d'Azur (Marseille/Nice)",
    "Occitanie (Toulouse)",
    "Nouvelle-Aquitaine (Bordeaux)",
  ],
  CA: [
    "Ontario",
    "British Columbia",
    "Quebec",
    "Alberta",
    "Manitoba",
  ],
  NL: [
    "North Holland (Amsterdam)",
    "South Holland (Rotterdam/The Hague)",
    "Utrecht",
    "North Brabant",
  ],
  KR: [
    "Seoul",
    "Gyeonggi-do",
    "Busan",
    "Incheon",
    "Daegu",
    "Daejeon",
  ],
};

// Normalized state lookup helper
function normalizeStateKey(country: string, stateStr: string): string {
  const s = stateStr.toLowerCase().trim();
  if (country === "ID") {
    if (s.includes("jakarta")) return "ID_Jakarta";
    if (s.includes("west java") || (s.includes("jawa") && s.includes("barat"))) return "ID_West Java";
    if (s.includes("central java") || (s.includes("jawa") && s.includes("tengah"))) return "ID_Central Java";
    if (s.includes("east java") || (s.includes("jawa") && s.includes("timur"))) return "ID_East Java";
    if (s.includes("banten")) return "ID_Banten";
    if (s.includes("yogyakarta") || s.includes("jogja")) return "ID_DI Yogyakarta";
    if (s.includes("bali")) return "ID_Bali";
    if (s.includes("west kalimantan") || (s.includes("kalimantan") && s.includes("barat"))) return "ID_West Kalimantan";
    if (s.includes("east kalimantan") || (s.includes("kalimantan") && s.includes("timur"))) return "ID_East Kalimantan";
    if (s.includes("south kalimantan") || (s.includes("kalimantan") && s.includes("selatan"))) return "ID_South Kalimantan";
    if (s.includes("north sumatra") || (s.includes("sumatera") && s.includes("utara"))) return "ID_North Sumatra";
    if (s.includes("south sulawesi") || (s.includes("sulawesi") && s.includes("selatan"))) return "ID_South Sulawesi";
    if (s.includes("papua")) return "ID_Papua";
  }
  return `${country}_${stateStr}`;
}

const CITIES_BY_COUNTRY_STATE: Record<string, string[]> = {
  // === INDONESIA ===
  "ID_West Kalimantan": ["Kab. Sanggau", "Kota Pontianak", "Kota Singkawang", "Kab. Kubu Raya", "Kab. Mempawah", "Kab. Sambas", "Kab. Bengkayang", "Kab. Landak", "Kab. Sekadau", "Kab. Sintang", "Kab. Melawi", "Kab. Kapuas Hulu", "Kab. Ketapang", "Kab. Kayong Utara"],
  "ID_Jakarta": ["South Jakarta (Jakarta Selatan)", "Central Jakarta (Jakarta Pusat)", "West Jakarta (Jakarta Barat)", "East Jakarta (Jakarta Timur)", "North Jakarta (Jakarta Utara)", "Thousand Islands (Kepulauan Seribu)"],
  "ID_West Java": ["Bandung (Kota Bandung)", "Bogor (Kota Bogor)", "Depok", "Bekasi (Kota Bekasi)", "Cimahi", "Cirebon", "Sukabumi", "Tasikmalaya", "Banjar", "Bandung Regency (Kab. Bandung)", "West Bandung (Kab. Bandung Barat)", "Bekasi Regency", "Bogor Regency", "Ciamis", "Cianjur", "Cirebon Regency", "Garut", "Indramayu", "Karawang", "Kuningan", "Majalengka", "Pangandaran", "Purwakarta", "Subang", "Sukabumi Regency", "Sumedang", "Tasikmalaya Regency"],
  "ID_Banten": ["Tangerang (Kota Tangerang)", "South Tangerang (Tangerang Selatan)", "Serang", "Cilegon", "Tangerang Regency", "Serang Regency", "Pandeglang", "Lebak"],
  "ID_Central Java": ["Semarang", "Surakarta (Solo)", "Magelang", "Salatiga", "Pekalongan", "Tegal", "Banyumas (Purwokerto)", "Cilacap", "Kudus", "Jepara", "Klaten", "Sukoharjo", "Wonogiri", "Brebes", "Pemalang", "Batang", "Kendal", "Demak", "Grobogan", "Blora", "Rembang", "Pati", "Boyolali", "Karanganyar", "Sragen", "Kebumen", "Purworejo", "Wonosobo", "Temanggung", "Banjarnegara", "Purbalingga"],
  "ID_East Java": ["Surabaya", "Malang", "Batu", "Sidoarjo", "Gresik", "Kediri", "Madiun", "Mojokerto", "Pasuruan", "Probolinggo", "Blitar", "Jember", "Banyuwangi", "Lumajang", "Bondowoso", "Situbondo", "Bojonegoro", "Tuban", "Lamongan", "Magetan", "Ngawi", "Ponorogo", "Pacitan", "Nganjuk", "Tulungagung", "Trenggalek", "Bangkalan", "Sampang", "Pamekasan", "Sumenep"],
  "ID_DI Yogyakarta": ["Yogyakarta City", "Sleman", "Bantul", "Gunungkidul", "Kulon Progo"],
  "ID_Bali": ["Denpasar", "Badung", "Gianyar", "Tabanan", "Buleleng", "Klungkung", "Karangasem", "Bangli", "Jembrana"],
  "ID_East Kalimantan": ["Samarinda", "Balikpapan", "Bontang", "Kutai Kartanegara", "Kutai Timur", "Berau", "Penajam Paser Utara (IKN)", "Paser"],
  "ID_South Kalimantan": ["Banjarmasin", "Banjarbaru", "Banjar", "Tanah Bumbu", "Kotabaru", "Barito Kuala"],
  "ID_North Sumatra": ["Medan", "Binjai", "Pematangsiantar", "Tebing Tinggi", "Tanjungbalai", "Deli Serdang", "Karo", "Simalungun", "Langkat", "Asahan"],
  "ID_South Sulawesi": ["Makassar", "Parepare", "Palopo", "Gowa", "Maros", "Bone", "Bulukumba", "Bantaeng", "Wajo"],
  "ID_Papua": ["Jayapura City", "Jayapura Regency", "Keerom", "Sarmi", "Biak Numfor", "Supiori", "Mamberamo Raya"],

  // === MALAYSIA ===
  "MY_Wilayah Persekutuan": ["Kuala Lumpur", "Putrajaya", "Labuan"],
  "MY_Selangor": ["Petaling Jaya", "Subang Jaya", "Shah Alam", "Klang", "Ampang", "Kajang", "Cyberjaya", "Sepang", "Rawang", "Puchong", "Seri Kembangan"],
  "MY_Johor": ["Johor Bahru", "Iskandar Puteri", "Batu Pahat", "Muar", "Kluang", "Kulai", "Pasir Gudang", "Segamat"],
  "MY_Penang": ["George Town", "Bayan Lepas", "Butterworth", "Bukit Mertajam", "Seberang Perai"],
  "MY_Perak": ["Ipoh", "Taiping", "Teluk Intan", "Manjung", "Kuala Kangsar"],

  // === SINGAPORE ===
  "SG_Central Region": ["Orchard", "Marina Bay", "Downtown Core", "Tanjong Pagar", "Novena", "Bukit Merah", "Queenstown", "Toa Payoh"],
  "SG_East Region": ["Tampines", "Bedok", "Pasir Ris", "Changi", "Paya Lebar"],
  "SG_West Region": ["Jurong East", "Jurong West", "Clementi", "Bukit Batok", "Choa Chu Kang"],
  "SG_North Region": ["Woodlands", "Yishun", "Sembawang"],
  "SG_North-East Region": ["Ang Mo Kio", "Hougang", "Sengkang", "Punggol", "Serangoon"],

  // === UNITED STATES ===
  "US_California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento", "Fresno", "Long Beach", "Oakland", "Anaheim", "Irvine", "Beverly Hills", "Pasadena"],
  "US_New York": ["New York City (Manhattan)", "Brooklyn", "Queens", "Bronx", "Staten Island", "Buffalo", "Rochester", "Albany", "Syracuse"],
  "US_Texas": ["Houston", "Austin", "Dallas", "San Antonio", "Fort Worth", "El Paso", "Arlington", "Plano"],
  "US_Washington": ["Seattle", "Bellevue", "Tacoma", "Spokane", "Vancouver", "Redmond", "Everett"],
  "US_Illinois": ["Chicago", "Aurora", "Naperville", "Rockford", "Joliet", "Evanston"],
};

// Curated District Items with Default Postal Codes and Biteship Area IDs
const CURATED_DISTRICT_ITEMS: DistrictItem[] = [
  // Sanggau
  { district: "Meliau", postal_code: "78571", id: "ID_SGU_MELIAU_01", area_name: "Meliau, Kab. Sanggau, Kalimantan Barat. 78571", city: "Kab. Sanggau", province: "West Kalimantan" },
  { district: "Kapuas", postal_code: "78512", id: "ID_SGU_KPS_01", area_name: "Kapuas, Kab. Sanggau, Kalimantan Barat. 78512", city: "Kab. Sanggau", province: "West Kalimantan" },
  { district: "Tayan Hilir", postal_code: "78564", id: "ID_SGU_TYH_01", area_name: "Tayan Hilir, Kab. Sanggau, Kalimantan Barat. 78564", city: "Kab. Sanggau", province: "West Kalimantan" },
  { district: "Tayan Hulu", postal_code: "78562", id: "ID_SGU_TYU_01", area_name: "Tayan Hulu, Kab. Sanggau, Kalimantan Barat. 78562", city: "Kab. Sanggau", province: "West Kalimantan" },
  { district: "Parindu", postal_code: "78561", id: "ID_SGU_PRD_01", area_name: "Parindu, Kab. Sanggau, Kalimantan Barat. 78561", city: "Kab. Sanggau", province: "West Kalimantan" },
  { district: "Bonti", postal_code: "78563", id: "ID_SGU_BNT_01", area_name: "Bonti, Kab. Sanggau, Kalimantan Barat. 78563", city: "Kab. Sanggau", province: "West Kalimantan" },
  { district: "Kembayan", postal_code: "78553", id: "ID_SGU_KMB_01", area_name: "Kembayan, Kab. Sanggau, Kalimantan Barat. 78553", city: "Kab. Sanggau", province: "West Kalimantan" },
  { district: "Beduai", postal_code: "78555", id: "ID_SGU_BDU_01", area_name: "Beduai, Kab. Sanggau, Kalimantan Barat. 78555", city: "Kab. Sanggau", province: "West Kalimantan" },
  { district: "Sekayam", postal_code: "78556", id: "ID_SGU_SKY_01", area_name: "Sekayam, Kab. Sanggau, Kalimantan Barat. 78556", city: "Kab. Sanggau", province: "West Kalimantan" },
  { district: "Entikong", postal_code: "78557", id: "ID_SGU_ETK_01", area_name: "Entikong, Kab. Sanggau, Kalimantan Barat. 78557", city: "Kab. Sanggau", province: "West Kalimantan" },
  { district: "Noyan", postal_code: "78554", id: "ID_SGU_NYN_01", area_name: "Noyan, Kab. Sanggau, Kalimantan Barat. 78554", city: "Kab. Sanggau", province: "West Kalimantan" },
  { district: "Mukok", postal_code: "78582", id: "ID_SGU_MKK_01", area_name: "Mukok, Kab. Sanggau, Kalimantan Barat. 78582", city: "Kab. Sanggau", province: "West Kalimantan" },
  { district: "Jangkang", postal_code: "78581", id: "ID_SGU_JKG_01", area_name: "Jangkang, Kab. Sanggau, Kalimantan Barat. 78581", city: "Kab. Sanggau", province: "West Kalimantan" },
  { district: "Toba", postal_code: "78565", id: "ID_SGU_TOB_01", area_name: "Toba, Kab. Sanggau, Kalimantan Barat. 78565", city: "Kab. Sanggau", province: "West Kalimantan" },

  // Pontianak
  { district: "Pontianak Selatan", postal_code: "78121", id: "ID_PTK_01", area_name: "Pontianak Selatan, Kota Pontianak, Kalimantan Barat. 78121", city: "Kota Pontianak", province: "West Kalimantan" },
  { district: "Pontianak Kota", postal_code: "78111", id: "ID_PTK_03", area_name: "Pontianak Kota, Kota Pontianak, Kalimantan Barat. 78111", city: "Kota Pontianak", province: "West Kalimantan" },
  { district: "Pontianak Barat", postal_code: "78113", id: "ID_PTK_05", area_name: "Pontianak Barat, Kota Pontianak, Kalimantan Barat. 78113", city: "Kota Pontianak", province: "West Kalimantan" },
  { district: "Pontianak Timur", postal_code: "78231", id: "ID_PTK_06", area_name: "Pontianak Timur, Kota Pontianak, Kalimantan Barat. 78231", city: "Kota Pontianak", province: "West Kalimantan" },
  { district: "Pontianak Tenggara", postal_code: "78124", id: "ID_PTK_07", area_name: "Pontianak Tenggara, Kota Pontianak, Kalimantan Barat. 78124", city: "Kota Pontianak", province: "West Kalimantan" },
  { district: "Pontianak Utara", postal_code: "78241", id: "ID_PTK_08", area_name: "Pontianak Utara, Kota Pontianak, Kalimantan Barat. 78241", city: "Kota Pontianak", province: "West Kalimantan" },

  // Singkawang
  { district: "Singkawang Barat", postal_code: "79123", id: "ID_SKW_01", area_name: "Singkawang Barat, Kota Singkawang, Kalimantan Barat. 79123", city: "Kota Singkawang", province: "West Kalimantan" },
  { district: "Singkawang Tengah", postal_code: "79111", id: "ID_SKW_03", area_name: "Singkawang Tengah, Kota Singkawang, Kalimantan Barat. 79111", city: "Kota Singkawang", province: "West Kalimantan" },
  { district: "Singkawang Timur", postal_code: "79141", id: "ID_SKW_04", area_name: "Singkawang Timur, Kota Singkawang, Kalimantan Barat. 79141", city: "Kota Singkawang", province: "West Kalimantan" },
  { district: "Singkawang Utara", postal_code: "79151", id: "ID_SKW_05", area_name: "Singkawang Utara, Kota Singkawang, Kalimantan Barat. 79151", city: "Kota Singkawang", province: "West Kalimantan" },
  { district: "Singkawang Selatan", postal_code: "79163", id: "ID_SKW_06", area_name: "Singkawang Selatan, Kota Singkawang, Kalimantan Barat. 79163", city: "Kota Singkawang", province: "West Kalimantan" },

  // Bandung
  { district: "Coblong", postal_code: "40135", id: "ID_BDG_03", area_name: "Coblong, Kota Bandung, Jawa Barat. 40135", city: "Bandung (Kota Bandung)", province: "West Java" },
  { district: "Cibeunying Kaler", postal_code: "40122", id: "ID_BDG_01", area_name: "Cibeunying Kaler, Kota Bandung, Jawa Barat. 40122", city: "Bandung (Kota Bandung)", province: "West Java" },
  { district: "Sumur Bandung", postal_code: "40111", id: "ID_BDG_05", area_name: "Sumur Bandung, Kota Bandung, Jawa Barat. 40111", city: "Bandung (Kota Bandung)", province: "West Java" },
  { district: "Lengkong", postal_code: "40264", id: "ID_BDG_06", area_name: "Lengkong, Kota Bandung, Jawa Barat. 40264", city: "Bandung (Kota Bandung)", province: "West Java" },
  { district: "Sukasari", postal_code: "40152", id: "ID_BDG_07", area_name: "Sukasari, Kota Bandung, Jawa Barat. 40152", city: "Bandung (Kota Bandung)", province: "West Java" },
  { district: "Cicendo", postal_code: "40171", id: "ID_BDG_08", area_name: "Cicendo, Kota Bandung, Jawa Barat. 40171", city: "Bandung (Kota Bandung)", province: "West Java" },
  { district: "Astanaanyar", postal_code: "40241", id: "ID_BDG_09", area_name: "Astanaanyar, Kota Bandung, Jawa Barat. 40241", city: "Bandung (Kota Bandung)", province: "West Java" },
  { district: "Andir", postal_code: "40181", id: "ID_BDG_10", area_name: "Andir, Kota Bandung, Jawa Barat. 40181", city: "Bandung (Kota Bandung)", province: "West Java" },
  { district: "Regol", postal_code: "40251", id: "ID_BDG_11", area_name: "Regol, Kota Bandung, Jawa Barat. 40251", city: "Bandung (Kota Bandung)", province: "West Java" },
  { district: "Buahbatu", postal_code: "40286", id: "ID_BDG_12", area_name: "Buahbatu, Kota Bandung, Jawa Barat. 40286", city: "Bandung (Kota Bandung)", province: "West Java" },
  { district: "Bandung Wetan", postal_code: "40115", id: "ID_BDG_13", area_name: "Bandung Wetan, Kota Bandung, Jawa Barat. 40115", city: "Bandung (Kota Bandung)", province: "West Java" },
  { district: "Batununggal", postal_code: "40266", id: "ID_BDG_14", area_name: "Batununggal, Kota Bandung, Jawa Barat. 40266", city: "Bandung (Kota Bandung)", province: "West Java" },
  { district: "Kiaracondong", postal_code: "40284", id: "ID_BDG_15", area_name: "Kiaracondong, Kota Bandung, Jawa Barat. 40284", city: "Bandung (Kota Bandung)", province: "West Java" },
  { district: "Antapani", postal_code: "40291", id: "ID_BDG_16", area_name: "Antapani, Kota Bandung, Jawa Barat. 40291", city: "Bandung (Kota Bandung)", province: "West Java" },

  // Jakarta Selatan & Pusat
  { district: "Kebayoran Baru", postal_code: "12190", id: "ID_JKT_02", area_name: "Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta. 12190", city: "South Jakarta (Jakarta Selatan)", province: "Special Capital Region of Jakarta (DKI Jakarta)" },
  { district: "Setiabudi", postal_code: "12940", id: "ID_JKT_03", area_name: "Setiabudi, Kota Jakarta Selatan, DKI Jakarta. 12940", city: "South Jakarta (Jakarta Selatan)", province: "Special Capital Region of Jakarta (DKI Jakarta)" },
  { district: "Mampang Prapatan", postal_code: "12790", id: "ID_JKT_04", area_name: "Mampang Prapatan, Kota Jakarta Selatan, DKI Jakarta. 12790", city: "South Jakarta (Jakarta Selatan)", province: "Special Capital Region of Jakarta (DKI Jakarta)" },
  { district: "Cilandak", postal_code: "12430", id: "ID_JKT_05", area_name: "Cilandak, Kota Jakarta Selatan, DKI Jakarta. 12430", city: "South Jakarta (Jakarta Selatan)", province: "Special Capital Region of Jakarta (DKI Jakarta)" },
  { district: "Pasar Minggu", postal_code: "12520", id: "ID_JKT_06", area_name: "Pasar Minggu, Kota Jakarta Selatan, DKI Jakarta. 12520", city: "South Jakarta (Jakarta Selatan)", province: "Special Capital Region of Jakarta (DKI Jakarta)" },
  { district: "Tebet", postal_code: "12810", id: "ID_JKT_07", area_name: "Tebet, Kota Jakarta Selatan, DKI Jakarta. 12810", city: "South Jakarta (Jakarta Selatan)", province: "Special Capital Region of Jakarta (DKI Jakarta)" },
  { district: "Pancoran", postal_code: "12780", id: "ID_JKT_08", area_name: "Pancoran, Kota Jakarta Selatan, DKI Jakarta. 12780", city: "South Jakarta (Jakarta Selatan)", province: "Special Capital Region of Jakarta (DKI Jakarta)" },
  { district: "Gambir", postal_code: "10110", id: "ID_JKT_01", area_name: "Gambir, Kota Jakarta Pusat, DKI Jakarta. 10110", city: "Central Jakarta (Jakarta Pusat)", province: "Special Capital Region of Jakarta (DKI Jakarta)" },
  { district: "Menteng", postal_code: "10310", id: "ID_JKT_09", area_name: "Menteng, Kota Jakarta Pusat, DKI Jakarta. 10310", city: "Central Jakarta (Jakarta Pusat)", province: "Special Capital Region of Jakarta (DKI Jakarta)" },
  { district: "Tanah Abang", postal_code: "10250", id: "ID_JKT_10", area_name: "Tanah Abang, Kota Jakarta Pusat, DKI Jakarta. 10250", city: "Central Jakarta (Jakarta Pusat)", province: "Special Capital Region of Jakarta (DKI Jakarta)" },
  { district: "Senen", postal_code: "10410", id: "ID_JKT_11", area_name: "Senen, Kota Jakarta Pusat, DKI Jakarta. 10410", city: "Central Jakarta (Jakarta Pusat)", province: "Special Capital Region of Jakarta (DKI Jakarta)" },
  { district: "Kemayoran", postal_code: "10620", id: "ID_JKT_12", area_name: "Kemayoran, Kota Jakarta Pusat, DKI Jakarta. 10620", city: "Central Jakarta (Jakarta Pusat)", province: "Special Capital Region of Jakarta (DKI Jakarta)" },

  // Surabaya
  { district: "Gubeng", postal_code: "60281", id: "ID_SBY_01", area_name: "Gubeng, Kota Surabaya, Jawa Timur. 60281", city: "Surabaya", province: "East Java" },
  { district: "Tegalsari", postal_code: "60262", id: "ID_SBY_02", area_name: "Tegalsari, Kota Surabaya, Jawa Timur. 60262", city: "Surabaya", province: "East Java" },
  { district: "Wonokromo", postal_code: "60241", id: "ID_SBY_03", area_name: "Wonokromo, Kota Surabaya, Jawa Timur. 60241", city: "Surabaya", province: "East Java" },
  { district: "Genteng", postal_code: "60275", id: "ID_SBY_04", area_name: "Genteng, Kota Surabaya, Jawa Timur. 60275", city: "Surabaya", province: "East Java" },
  { district: "Rungkut", postal_code: "60293", id: "ID_SBY_05", area_name: "Rungkut, Kota Surabaya, Jawa Timur. 60293", city: "Surabaya", province: "East Java" },

  // Semarang
  { district: "Semarang Barat", postal_code: "50141", id: "ID_SMG_01", area_name: "Semarang Barat, Kota Semarang, Jawa Tengah. 50141", city: "Semarang", province: "Central Java" },
  { district: "Semarang Tengah", postal_code: "50132", id: "ID_SMG_02", area_name: "Semarang Tengah, Kota Semarang, Jawa Tengah. 50132", city: "Semarang", province: "Central Java" },
  { district: "Semarang Selatan", postal_code: "50249", id: "ID_SMG_03", area_name: "Semarang Selatan, Kota Semarang, Jawa Tengah. 50249", city: "Semarang", province: "Central Java" },
  { district: "Candisari", postal_code: "50257", id: "ID_SMG_04", area_name: "Candisari, Kota Semarang, Jawa Tengah. 50257", city: "Semarang", province: "Central Java" },

  // Yogyakarta
  { district: "Gondomanan", postal_code: "55121", id: "ID_YOG_01", area_name: "Gondomanan, Kota Yogyakarta, DI Yogyakarta. 55121", city: "Yogyakarta City", province: "Special Region of Yogyakarta (DI Yogyakarta)" },
  { district: "Danurejan", postal_code: "55211", id: "ID_YOG_02", area_name: "Danurejan, Kota Yogyakarta, DI Yogyakarta. 55211", city: "Yogyakarta City", province: "Special Region of Yogyakarta (DI Yogyakarta)" },
  { district: "Kotagede", postal_code: "55171", id: "ID_YOG_03", area_name: "Kotagede, Kota Yogyakarta, DI Yogyakarta. 55171", city: "Yogyakarta City", province: "Special Region of Yogyakarta (DI Yogyakarta)" },

  // Denpasar
  { district: "Denpasar Selatan", postal_code: "80227", id: "ID_DPS_01", area_name: "Denpasar Selatan, Kota Denpasar, Bali. 80227", city: "Denpasar", province: "Bali" },
  { district: "Denpasar Barat", postal_code: "80119", id: "ID_DPS_02", area_name: "Denpasar Barat, Kota Denpasar, Bali. 80119", city: "Denpasar", province: "Bali" },
  { district: "Denpasar Utara", postal_code: "80115", id: "ID_DPS_03", area_name: "Denpasar Utara, Kota Denpasar, Bali. 80115", city: "Denpasar", province: "Bali" },
  { district: "Denpasar Timur", postal_code: "80237", id: "ID_DPS_04", area_name: "Denpasar Timur, Kota Denpasar, Bali. 80237", city: "Denpasar", province: "Bali" },

  // Medan
  { district: "Medan Baru", postal_code: "20153", id: "ID_MDN_01", area_name: "Medan Baru, Kota Medan, Sumatera Utara. 20153", city: "Medan", province: "North Sumatra" },
  { district: "Medan Kota", postal_code: "20212", id: "ID_MDN_02", area_name: "Medan Kota, Kota Medan, Sumatera Utara. 20212", city: "Medan", province: "North Sumatra" },
  { district: "Medan Petisah", postal_code: "20112", id: "ID_MDN_03", area_name: "Medan Petisah, Kota Medan, Sumatera Utara. 20112", city: "Medan", province: "North Sumatra" },

  // Makassar
  { district: "Panakkukang", postal_code: "90231", id: "ID_MKS_01", area_name: "Panakkukang, Kota Makassar, Sulawesi Selatan. 90231", city: "Makassar", province: "South Sulawesi" },
  { district: "Ujung Pandang", postal_code: "90111", id: "ID_MKS_02", area_name: "Ujung Pandang, Kota Makassar, Sulawesi Selatan. 90111", city: "Makassar", province: "South Sulawesi" },
  { district: "Tamalanrea", postal_code: "90245", id: "ID_MKS_03", area_name: "Tamalanrea, Kota Makassar, Sulawesi Selatan. 90245", city: "Makassar", province: "South Sulawesi" },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = (searchParams.get("scope") || "all").toLowerCase();
    const country = (
      searchParams.get("country") ||
      searchParams.get("countries") ||
      searchParams.get("country_code") ||
      "ID"
    ).toUpperCase().trim();
    const stateParam = searchParams.get("state")?.trim() || "";
    const cityParam = searchParams.get("city")?.trim() || "";
    const districtParam = searchParams.get("district")?.trim() || "";
    const query = (
      searchParams.get("search") ||
      searchParams.get("input") ||
      searchParams.get("q") ||
      ""
    ).trim();

    const targetCountry = country && country !== "OTHER" ? country : "ID";
    const apiKey = process.env.BITESHIP_API_KEY?.trim();

    // 1. SCOPE: STATE / PROVINCE
    if (scope === "state" || scope === "province") {
      const stateList = PROVINCES_BY_COUNTRY[targetCountry] || [];
      const qLower = query.toLowerCase();
      const filtered = qLower
        ? stateList.filter((s) => s.toLowerCase().includes(qLower))
        : stateList;

      return NextResponse.json({
        success: true,
        scope: "state",
        country: targetCountry,
        results: filtered,
      });
    }

    // 2. SCOPE: CITY / MUNICIPALITY / REGENCY
    if (scope === "city") {
      let cityList: string[] = [];

      if (stateParam) {
        const normalizedKey = normalizeStateKey(targetCountry, stateParam);
        if (CITIES_BY_COUNTRY_STATE[normalizedKey]) {
          cityList = CITIES_BY_COUNTRY_STATE[normalizedKey];
        } else {
          const matchedKey = Object.keys(CITIES_BY_COUNTRY_STATE).find(
            (k) =>
              k.startsWith(`${targetCountry}_`) &&
              (k.toLowerCase().includes(stateParam.toLowerCase()) || stateParam.toLowerCase().includes(k.replace(`${targetCountry}_`, "").toLowerCase()))
          );
          if (matchedKey) {
            cityList = CITIES_BY_COUNTRY_STATE[matchedKey];
          }
        }
      }

      if (cityList.length === 0) {
        const allCountryKeys = Object.keys(CITIES_BY_COUNTRY_STATE).filter((k) =>
          k.startsWith(`${targetCountry}_`)
        );
        const combined = new Set<string>();
        for (const k of allCountryKeys) {
          for (const c of CITIES_BY_COUNTRY_STATE[k]) {
            combined.add(c);
          }
        }
        cityList = Array.from(combined);
      }

      const qLower = query.toLowerCase();
      const filtered = qLower
        ? cityList.filter((c) => c.toLowerCase().includes(qLower))
        : cityList;

      return NextResponse.json({
        success: true,
        scope: "city",
        country: targetCountry,
        state: stateParam,
        results: filtered,
      });
    }

    // 3. SCOPE: DISTRICT / KECAMATAN (Returns DistrictItem[] with Postal Code & Area ID)
    if (scope === "district" || scope === "kecamatan") {
      const districtsMap = new Map<string, DistrictItem>();

      // Clean city string for matching
      const cleanCity = cityParam.replace(/\(.*\)/, "").trim().toLowerCase();

      // Check fallback/curated database first
      for (const item of CURATED_DISTRICT_ITEMS) {
        const itemCity = item.city?.toLowerCase() || "";
        const cityMatches = !cleanCity || itemCity.includes(cleanCity) || cleanCity.includes(itemCity.replace(/^(kab\.|kota)\s*/, ""));
        if (cityMatches) {
          districtsMap.set(item.district.toLowerCase(), item);
        }
      }

      // If live Biteship API available and query/city specified, fetch live areas from Biteship Maps
      if (apiKey && (query.length >= 2 || cleanCity.length >= 3)) {
        try {
          const searchCombined = [query, cityParam.replace(/\(.*\)/, "").trim(), stateParam.replace(/\(.*\)/, "").trim()].filter(Boolean).join(" ").trim();
          const biteshipUrl = `https://api.biteship.com/v1/maps/areas?input=${encodeURIComponent(searchCombined)}&countries=${encodeURIComponent(targetCountry)}&type=single`;
          const res = await fetch(biteshipUrl, {
            headers: {
              Authorization: apiKey,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          });

          if (res.ok) {
            const data = await res.json();
            if (data?.areas && Array.isArray(data.areas) && data.areas.length > 0) {
              for (const a of data.areas) {
                const distName = a.administrative_division_level_3_name || a.district;
                if (distName) {
                  const key = distName.toLowerCase();
                  if (!districtsMap.has(key)) {
                    districtsMap.set(key, {
                      district: distName,
                      postal_code: a.postal_code ? String(a.postal_code) : "",
                      id: a.id || `${distName}-${a.postal_code || ""}`,
                      area_name: a.name || `${distName}, ${a.administrative_division_level_2_name || cityParam}, ${a.administrative_division_level_1_name || stateParam}. ${a.postal_code || ""}`,
                      city: a.administrative_division_level_2_name || cityParam,
                      province: a.administrative_division_level_1_name || stateParam,
                    });
                  }
                }
              }
            }
          }
        } catch (apiErr) {
          console.warn("[BITESHIP DISTRICTS API ERROR]:", apiErr);
        }
      }

      // If empty, search all curated districts
      if (districtsMap.size === 0) {
        for (const item of CURATED_DISTRICT_ITEMS) {
          districtsMap.set(item.district.toLowerCase(), item);
        }
      }

      let allDistricts = Array.from(districtsMap.values());
      const qLower = query.toLowerCase();
      if (qLower) {
        allDistricts = allDistricts.filter(
          (d) =>
            d.district.toLowerCase().includes(qLower) ||
            d.postal_code.includes(qLower) ||
            d.area_name.toLowerCase().includes(qLower)
        );
      }

      return NextResponse.json({
        success: true,
        scope: "district",
        country: targetCountry,
        state: stateParam,
        city: cityParam,
        results: allDistricts,
      });
    }

    // Default fallback
    return NextResponse.json({
      success: true,
      scope: "all",
      country: targetCountry,
      results: [],
    });
  } catch (error: any) {
    console.error("[AREAS SCOPED SEARCH ERROR]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to search location data." },
      { status: 500 }
    );
  }
}
