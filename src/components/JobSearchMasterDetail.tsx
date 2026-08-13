import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ChevronDown, 
  MapPin, 
  Clock, 
  Building2, 
  Briefcase, 
  CheckCircle2, 
  Users, 
  X,
  Info,
  Bookmark,
  Globe,
  ShieldCheck
} from 'lucide-react';

import { Lowongan } from '../types';
import { getSavedJobIds, toggleSaveJob, sortJobsByNewest, formatDateDisplay, isJobDeadlinePassed } from '../data';
import { JobDetail } from './JobDetail';
import { Footer } from './Footer';

// Full list of Indonesian Provinces & Cities
export interface ProvinceLocation {
  province: string;
  cities: string[];
}

export const INDONESIAN_PROVINCES: ProvinceLocation[] = [
  { province: 'ACEH', cities: ['ACEH BARAT', 'ACEH BARAT DAYA', 'ACEH BESAR', 'ACEH JAYA', 'ACEH SELATAN', 'ACEH TAMIANG', 'ACEH TENGAH', 'ACEH TENGGARA', 'ACEH TIMUR', 'ACEH UTARA', 'BANDA ACEH', 'BENER MERIAH', 'BIREUEN', 'GAYO LUES', 'LHOKSEUMAWE', 'NAGAN RAYA', 'PIDIE', 'PIDIE JAYA', 'SABANG', 'SIMEULUE', 'SUBULUSSALAM'] },
  { province: 'BALI', cities: ['BADUNG', 'BANGLI', 'BULELENG', 'DENPASAR', 'GIANYAR', 'JEMBRANA', 'KARANGASEM', 'KLUNGKUNG', 'TABANAN'] },
  { province: 'BANTEN', cities: ['CILEGON', 'LEBAK', 'PANDEGLANG', 'SERANG', 'TANGERANG', 'TANGERANG SELATAN'] },
  { province: 'BENGKULU', cities: ['BENGKULU', 'BENGKULU SELATAN', 'BENGKULU TENGAH', 'BENGKULU UTARA', 'KAUR', 'KEPAHIANG', 'LEBONG', 'MUKOMUKO', 'REJANG LEBONG', 'SELUMA'] },
  { province: 'DI YOGYAKARTA', cities: ['BANTUL', 'GUNUNGKIDUL', 'KULON PROGO', 'SLEMAN', 'YOGYAKARTA'] },
  { province: 'DKI JAKARTA', cities: ['JAKARTA BARAT', 'JAKARTA PUSAT', 'JAKARTA SELATAN', 'JAKARTA TIMUR', 'JAKARTA UTARA', 'KEPULAUAN SERIBU'] },
  { province: 'GORONTALO', cities: ['BOALEMO', 'BONE BOLANGO', 'GORONTALO', 'GORONTALO UTARA', 'POHUWATO'] },
  { province: 'JAMBI', cities: ['BATANGHARI', 'BUNGO', 'JAMBI', 'KERINCI', 'MERANGIN', 'MUARO JAMBI', 'SAROLANGUN', 'SUNGAI PENUH', 'TANJUNG JABUNG BARAT', 'TANJUNG JABUNG TIMUR', 'TEBO'] },
  { province: 'JAWA BARAT', cities: ['BANDUNG', 'BANDUNG BARAT', 'BANJAR', 'BEKASI', 'BOGOR', 'CIAMIS', 'CIANJUR', 'CIMAHI', 'CIREBON', 'DEPOK', 'GARUT', 'INDRAMAYU', 'KARAWANG', 'KUNINGAN', 'MAJALENGKA', 'PANGANDARAN', 'PURWAKARTA', 'SUBANG', 'SUKABUMI', 'SUMEDANG', 'TASIKMALAYA'] },
  { province: 'JAWA TENGAH', cities: ['BANJARNEGARA', 'BANYUMAS', 'BATANG', 'BLORA', 'BOYOLALI', 'BREBES', 'CILACAP', 'DEMAK', 'GROBOGAN', 'JEPARA', 'KARANGANYAR', 'KEBUMEN', 'KENDAL', 'KLATEN', 'KUDUS', 'MAGELANG', 'PATI', 'PEKALONGAN', 'PEMALANG', 'PURBALINGGA', 'PURWOREJO', 'REMBANG', 'SALATIGA', 'SEMARANG', 'SRAGEN', 'SUKOHARJO', 'SURAKARTA (SOLO)', 'TEGAL', 'TEMANGGUNG', 'WONOGIRI', 'WONOSOBO'] },
  { province: 'JAWA TIMUR', cities: ['BANYUWANGI', 'BATU', 'BLITAR', 'BOJONEGORO', 'BONDOWOSO', 'GRESIK', 'JEMBER', 'JOMBANG', 'KEDIRI', 'LAMONGAN', 'LUMAJANG', 'MADIUN', 'MAGETAN', 'MALANG', 'MOJOKERTO', 'NGANJUK', 'NGAWI', 'PACITAN', 'PAMEKASAN', 'PASURUAN', 'PONOROGO', 'PROBOLINGGO', 'SAMPANG', 'SIDOARJO', 'SITUBONDO', 'SUMENEP', 'SURABAYA', 'TRENGGALEK', 'TUBAN', 'TULUNGAGUNG'] },
  { province: 'KALIMANTAN BARAT', cities: ['BENGKAYANG', 'KAPUAS HULU', 'KAYONG UTARA', 'KETAPANG', 'KUBU RAYA', 'LANDAK', 'MELAWI', 'MEMPAWAH', 'PONTIANAK', 'SAMBAS', 'SANGGAU', 'SEKADAU', 'SINGKAWANG', 'SINTANG'] },
  { province: 'KALIMANTAN SELATAN', cities: ['BALANGAN', 'BANJAR', 'BANJARBARU', 'BANJARMASIN', 'BARITO KUALA', 'HULU SUNGAI SELATAN', 'HULU SUNGAI TENGAH', 'HULU SUNGAI UTARA', 'KOTABARU', 'TABALONG', 'TANAH BUMBU', 'TANAH LAUT', 'TAPIN'] },
  { province: 'KALIMANTAN TENGAH', cities: ['BARITO SELATAN', 'BARITO TIMUR', 'BARITO UTARA', 'GUNUNG MAS', 'KAPUAS', 'KATINGAN', 'KOTAWARINGIN BARAT', 'KOTAWARINGIN TIMUR', 'LAMANDAU', 'MURUNG RAYA', 'PALANGKA RAYA', 'PULANG PISAU', 'SERUYAN', 'SUKAMARA'] },
  { province: 'KALIMANTAN TIMUR', cities: ['BALIKPAPAN', 'BERAU', 'BONTANG', 'IKN NUSANTARA', 'KUTAI BARAT', 'KUTAI KARTANEGARA', 'KUTAI TIMUR', 'MAHAKAM ULU', 'PASER', 'PENAJAM PASER UTARA', 'SAMARINDA'] },
  { province: 'KALIMANTAN UTARA', cities: ['BULUNGAN', 'MALINAU', 'NUNUKAN', 'TANA TIDUNG', 'TARAKAN'] },
  { province: 'KEPULAUAN BANGKA BELITUNG', cities: ['BANGKA', 'BANGKA BARAT', 'BANGKA SELATAN', 'BANGKA TENGAH', 'BELITUNG', 'BELITUNG TIMUR', 'PANGKALPINANG'] },
  { province: 'KEPULAUAN RIAU', cities: ['BATAM', 'BINTAN', 'KARIMUN', 'KEPULAUAN ANAMBAS', 'LINGGA', 'NATUNA', 'TANJUNGPINANG'] },
  { province: 'LAMPUNG', cities: ['BANDAR LAMPUNG', 'LAMPUNG BARAT', 'LAMPUNG SELATAN', 'LAMPUNG TENGAH', 'LAMPUNG TIMUR', 'LAMPUNG UTARA', 'MESUJI', 'METRO', 'PESAWARAN', 'PESISIR BARAT', 'PRINGSEWU', 'TANGGAMUS', 'TULANG BANYANG', 'WAY KANAN'] },
  { province: 'MALUKU', cities: ['AMBON', 'BURU', 'BURU SELATAN', 'KEPULAUAN ARU', 'KEPULAUAN TANIMBAR', 'MALUKU BARAT DAYA', 'MALUKU TENGAH', 'MALUKU TENGGARA', 'SERAM BAGIAN BARAT', 'SERAM BAGIAN TIMUR', 'TUAL'] },
  { province: 'MALUKU UTARA', cities: ['HALMAHERA BARAT', 'HALMAHERA SELATAN', 'HALMAHERA TENGAH', 'HALMAHERA TIMUR', 'HALMAHERA UTARA', 'KEPULAUAN SULA', 'PULAU MOROTAI', 'PULAU TALIABU', 'TERNATE', 'TIDORE KEPULAUAN'] },
  { province: 'NUSA TENGGARA BARAT', cities: ['BIMA', 'DOMPU', 'LOMBOK BARAT', 'LOMBOK TENGAH', 'LOMBOK TIMUR', 'LOMBOK UTARA', 'MATARAM', 'SUMBAWA', 'SUMBAWA BARAT'] },
  { province: 'NUSA TENGGARA TIMUR', cities: ['ALOR', 'BELU', 'ENDE', 'FLORES TIMUR', 'KUPANG', 'LEMBATA', 'MALAKA', 'MANGGARAI', 'MANGGARAI BARAT', 'MANGGARAI TIMUR', 'NAGEKEO', 'NGADA', 'ROTE NDAO', 'SABU RAIJUA', 'SIKKA', 'SUMBA BARAT', 'SUMBA BARAT DAYA', 'SUMBA TENGAH', 'SUMBA TIMUR', 'TTS', 'TTU'] },
  { province: 'PAPUA', cities: ['BIAK NUMFOR', 'JAYAPURA', 'KEEROM', 'MEMBRAMO RAYA', 'SARMI', 'SUPIORI', 'YAPEN'] },
  { province: 'PAPUA BARAT', cities: ['FAKFAK', 'KAIMANA', 'MANOKWARI', 'TELUK BINTUNI', 'TELUK WONDAMA'] },
  { province: 'PAPUA BARAT DAYA', cities: ['MAYBRAT', 'RAJA AMPAT', 'SORONG', 'TAMBRAUW'] },
  { province: 'PAPUA PEGUNUNGAN', cities: ['JAYAWIJAYA (WAMENA)', 'LANNY JAYA', 'NDUGA', 'PEGUNUNGAN BINTANG', 'YALIMO'] },
  { province: 'PAPUA SELATAN', cities: ['ASMAT', 'BOVEN DIGOEL', 'MAPPI', 'MERAUKE'] },
  { province: 'PAPUA TENGAH', cities: ['DOGIYAI', 'INTAN JAYA', 'MIMIKA', 'NABIRE', 'PANIAI', 'PUNCAK'] },
  { province: 'RIAU', cities: ['BENGKALIS', 'DUMAI', 'INDRAGIRI HILIR', 'INDRAGIRI HULU', 'KAMPAR', 'KEPULAUAN MERANTI', 'KUANTAN SINGINGI', 'PEKANBARU', 'PELALAWAN', 'ROKAN HILIR', 'ROKAN HULU', 'SIAK'] },
  { province: 'SULAWESI BARAT', cities: ['MAJENE', 'MAMASA', 'MAMUJU', 'MAMUJU TENGAH', 'PASANGKAYU', 'POLEWALI MANDAR'] },
  { province: 'SULAWESI SELATAN', cities: ['BANTAENG', 'BARRU', 'BONE', 'BULUKUMBA', 'ENREKANG', 'GOWA', 'JENEPONTO', 'KEPULAUAN SELAYAR', 'LUWU', 'LUWU TIMUR', 'LUWU UTARA', 'MAKASSAR', 'MAROS', 'PALOPO', 'PANGKAJENE', 'PAREPARE', 'PINRANG', 'SIDRAP', 'SINJAI', 'SOPPENG', 'TAKALAR', 'TANA TORAJA', 'TORAJA UTARA', 'WAJO'] },
  { province: 'SULAWESI TENGAH', cities: ['BANGGAI', 'BANGGAI KEPULAUAN', 'BANGGAI LAUT', 'BUOL', 'DONGGALA', 'MOROWALI', 'MOROWALI UTARA', 'PALU', 'PARIGI MOUTONG', 'POSO', 'SIGI', 'TOJO UNA-UNA', 'TOLITOLI'] },
  { province: 'SULAWESI TENGGARA', cities: ['BAUBAU', 'BOMBANA', 'BUTON', 'BUTON SELATAN', 'BUTON TENGAH', 'BUTON UTARA', 'KENDARI', 'KOLAKA', 'KOLAKA TIMUR', 'KOLAKA UTARA', 'KONAWE', 'KONAWE KEPULAUAN', 'KONAWE SELATAN', 'KONAWE UTARA', 'MUNA', 'MUNA BARAT', 'WAKATOBI'] },
  { province: 'SULAWESI UTARA', cities: ['BITUNG', 'BOLAANG MONGONDOW', 'KEPULAUAN SANGIHE', 'KEPULAUAN TALAUD', 'KOTAMOBAGU', 'MANADO', 'MINAHASA', 'MINAHASA SELATAN', 'MINAHASA TENGGARA', 'MINAHASA UTARA', 'TOMOHON'] },
  { province: 'SUMATERA BARAT', cities: ['AGAM', 'BUKITTINGGI', 'DHARMASRAYA', 'KEPULAUAN MENTAWAI', 'LIMA PULUH KOTA', 'PADANG', 'PADANG PANJANG', 'PADANG PARIAMAN', 'PARIAMAN', 'PASAMAN', 'PASAMAN BARAT', 'PAYAKUMBUH', 'PESISIR SELATAN', 'SAWAHLUNTO', 'SIJUNJUNG', 'SOLOK', 'SOLOK SELATAN', 'TANAH DATAR'] },
  { province: 'SUMATERA SELATAN', cities: ['BANYUASIN', 'EMPAT LAWANG', 'LAHAT', 'LUBUKLINGGAU', 'MUARA ENIM', 'MUSI BANYUASIN', 'MUSI RAWAS', 'OGAN ILIR', 'OGAN KOMERING ILIR', 'OGAN KOMERING ULU', 'PAGAR ALAM', 'PALEMBANG', 'PENUKAL ABAB LEMATANG ILIR', 'PRABUMULIH'] },
  { province: 'SUMATERA UTARA', cities: ['ASAHAN', 'BATUBARA', 'BINJAI', 'DAIRI', 'DELI SERDANG', 'GUNUNGSITOLI', 'HUMBANG HASUNDUTAN', 'KARO', 'LABUHANBATU', 'LANGKAT', 'MANDAILING NATAL', 'MEDAN', 'NIAS', 'PADANG LAWAS', 'PADANGSIDIMPUAN', 'PAKPAK BHARAT', 'PEMATANGSIANTAR', 'SAMOSIR', 'SERDANG BEDAGAI', 'SIBOLGA', 'SIMALUNGUN', 'TANJUNGBALAI', 'TAPANULI SELATAN', 'TAPANULI TENGAH', 'TAPANULI UTARA', 'TEBING TINGGI', 'TOBA'] }
];

export function isIndonesianLocation(locStr: string): boolean {
  if (!locStr) return false;
  const l = locStr.toLowerCase().trim();
  return INDONESIAN_PROVINCES.some(p => {
    const provName = p.province.toLowerCase();
    if (l === provName || l.includes(provName)) return true;
    return p.cities.some(c => {
      const cityName = c.toLowerCase();
      return l === cityName || l.includes(cityName);
    });
  });
}

export const JOB_SPECIALIZATIONS: string[] = [
  'Akuntansi/Keuangan',
  'Audit & Pajak',
  'Perbankan/Keuangan',
  'Keuangan/Investasi',
  'Akuntansi Umum/Pembiayaan',
  'Administrasi/Personalia',
  'IT/Komputer & Teknologi Informasi',
  'Pemasaran/Pemasaran Digital & PR',
  'Teknik/Rekayasa & Manufaktur',
  'Kesehatan/Farmasi & Medis',
  'Pendidikan/Pelatihan & Pengajaran',
  'Penjualan/Layanan Pelanggan',
  'Desain/Kreatif/Media & Seni',
  'SDM/Sumber Daya Manusia',
  'Logistik/Rantai Pasok & Transportasi',
  'Hukum/Legal & Kepatuhan',
  'Sains & Bioteknologi',
  'Pertanian & Perkebunan',
  'Hotel/Restoran & Pariwisata',
  'Lainnya'
];

interface JobSearchMasterDetailProps {
  jobs: Lowongan[];
  onApply: (job: Lowongan) => void;
  isLoggedIn?: boolean;
  onSelectLowongan?: (id: string) => void;
  setTab?: (tab: string) => void;
}

export const JobSearchMasterDetail: React.FC<JobSearchMasterDetailProps> = ({
  jobs,
  onApply,
  isLoggedIn = true,
  onSelectLowongan,
  setTab
}) => {
  // 1 Textbox Searching Kata Kunci, Jabatan, Perusahaan
  const [keyword, setKeyword] = useState('');

  // Checkbox Filter States (Location & Specialization)
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);

  // Search text inputs inside popover dropdowns
  const [locationSearch, setLocationSearch] = useState('');
  const [specializationSearch, setSpecializationSearch] = useState('');

  // Open Popup State: 'location' | 'specialization' | null
  const [openPopup, setOpenPopup] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Selected Job for Full JobDetail Page View
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<Lowongan | null>(null);

  // Saved Jobs State
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => getSavedJobIds());

  // Click Outside Listener for Popups
  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setOpenPopup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, selectedLocations, selectedSpecializations]);

  // Filter Published Jobs (Lowongan kerja terbaru selalu di atas)
  const publishedJobs = sortJobsByNewest(jobs.filter(j => j.status === 'published'));

  // Filter Jobs Logic
  const filteredJobs = publishedJobs.filter(job => {
    // 1 Textbox: Kata Kunci, Jabatan, Perusahaan
    if (keyword) {
      const kw = keyword.toLowerCase();
      const matchTitle = job.judul.toLowerCase().includes(kw);
      const matchCompany = job.namaInstansi.toLowerCase().includes(kw);
      const matchCategory = (job.kategori || '').toLowerCase().includes(kw);
      const matchDesc = job.deskripsi.toLowerCase().includes(kw);
      if (!matchTitle && !matchCompany && !matchCategory && !matchDesc) {
        return false;
      }
    }

    // Checkbox 1: Location Filter (All 38 Indonesian Provinces & Cities + Luar Negeri / Lainnya)
    if (selectedLocations.length > 0) {
      const matchLoc = selectedLocations.some(loc => {
        const l = loc.toLowerCase().trim();
        const jobLoc = job.lokasi.toLowerCase().trim();

        // 1. Checkbox "LAINNYA (LUAR NEGERI)" or "LAINNYA"
        if (l.includes('lainnya') || l.includes('luar negeri')) {
          if (!isIndonesianLocation(jobLoc)) return true;
        }

        // 2. Direct name/substring match
        if (jobLoc.includes(l) || l.includes(jobLoc)) return true;

        // 3. Province hierarchy lookup: If 'loc' is a province, check if jobLoc matches any city in that province
        const matchedProv = INDONESIAN_PROVINCES.find(
          p => p.province.toLowerCase() === l
        );
        if (matchedProv) {
          if (jobLoc.includes(matchedProv.province.toLowerCase())) return true;
          if (matchedProv.cities.some(city => jobLoc.includes(city.toLowerCase()))) return true;
        }

        // 4. Reverse lookup: If jobLoc is a city/province, check against province hierarchy
        const jobProv = INDONESIAN_PROVINCES.find(
          p => p.province.toLowerCase() === jobLoc || p.cities.some(c => c.toLowerCase() === jobLoc)
        );
        if (jobProv) {
          if (jobProv.province.toLowerCase().includes(l) || l.includes(jobProv.province.toLowerCase())) return true;
        }

        return false;
      });
      if (!matchLoc) return false;
    }

    // Checkbox 2: Specialization Filter
    if (selectedSpecializations.length > 0) {
      const matchSpec = selectedSpecializations.some(spec => {
        const s = spec.toLowerCase().trim();
        const cat = (job.kategori || '').toLowerCase();
        const title = job.judul.toLowerCase();
        const desc = job.deskripsi.toLowerCase();

        // 1. Direct substring match
        if (cat.includes(s) || title.includes(s) || desc.includes(s)) return true;

        // 2. Check individual category items split by comma
        const jobCatItems = cat.split(',').map(c => c.trim()).filter(Boolean);
        if (jobCatItems.some(ci => ci.includes(s) || s.includes(ci))) return true;

        // 3. Sub-word match for multi-word categories (e.g. "Sains & Bioteknologi")
        const sWords = s.split(/[\s/&,]+/).filter(w => w.length > 2);
        if (sWords.length > 0 && sWords.some(w => cat.includes(w) || title.includes(w))) return true;

        // 4. Keyword domain aliases
        if (s.includes('it') || s.includes('komputer') || s.includes('teknologi')) {
          if (cat.includes('it') || cat.includes('ti') || cat.includes('komputer') || cat.includes('teknologi') || title.includes('developer') || title.includes('engineer') || title.includes('ui/ux') || title.includes('software')) return true;
        }
        if (s.includes('akuntansi') || s.includes('keuangan')) {
          if (cat.includes('keuangan') || cat.includes('akuntansi') || title.includes('accountant') || title.includes('finance') || title.includes('akuntan')) return true;
        }
        if (s.includes('pemasaran') || s.includes('digital')) {
          if (cat.includes('pemasaran') || cat.includes('marketing') || title.includes('marketing') || title.includes('exim') || title.includes('promosi')) return true;
        }
        if (s.includes('teknik') || s.includes('rekayasa') || s.includes('manufaktur')) {
          if (cat.includes('teknik') || cat.includes('rekayasa') || cat.includes('manufaktur') || title.includes('engineer') || title.includes('project')) return true;
        }
        return false;
      });
      if (!matchSpec) return false;
    }

    return true;
  });

  // Dynamic Pagination
  const totalJobs = filteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalJobs / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);
  const endIndex = Math.min(startIndex + displayedJobs.length, totalJobs);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleCheckboxOption = (setList: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setList(prev => prev.includes(val) ? prev.filter(item => item !== val) : [...prev, val]);
  };

  const clearAllFilters = () => {
    setSelectedLocations([]);
    setSelectedSpecializations([]);
    setKeyword('');
    setLocationSearch('');
    setSpecializationSearch('');
  };

  const hasActiveFilters = selectedLocations.length > 0 || selectedSpecializations.length > 0 || keyword !== '';

  // IF STUDENT CLICKED A JOB CARD: RENDER FULL JOB DETAIL PAGE MATCHING JOB DETAIL DESIGN
  if (selectedJobForDetail) {
    return (
      <div className="bg-white min-h-screen">
        <JobDetail
          job={selectedJobForDetail}
          onBack={() => setSelectedJobForDetail(null)}
          onApply={() => {
            const j = selectedJobForDetail;
            setSelectedJobForDetail(null);
            onApply(j);
          }}
          isLoggedIn={isLoggedIn}
          setTab={setTab}
          hideHeader={true}
          hideFooter={true}
          onSelectJob={(id) => {
            const found = jobs.find(j => j.id === id);
            if (found) setSelectedJobForDetail(found);
          }}
        />
        <Footer onSelectLowongan={onSelectLowongan} setTab={setTab} />
      </div>
    );
  }

  // MAIN SEARCH VIEW: BLACK SEARCH BAR + 1:1 REPLICA OF PUBLIC JOB INFO CARDS GRID
  return (
    <div className="space-y-6 animate-fadeIn font-sans bg-white" id="job-info-trisakti-search-view">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 space-y-4">

        {/* BLUE SEARCH BAR CONTAINER (PUSAT KARIR TRISAKTI SEARCH BAR DESIGN - BLUE THEME) */}
        <div className="bg-[#1E3A8A] text-white p-3.5 md:p-4 rounded-md shadow-xl relative" ref={popupRef}>
          <div className="flex flex-col md:flex-row items-stretch gap-2.5 md:gap-3">
            
            {/* TEXTBOX 1: Kata Kunci, Jabatan, Perusahaan */}
            <div className="flex-1 bg-white text-slate-900 rounded flex items-center px-3 py-2.5 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 transition">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Kata Kunci, Jabatan, Perusahaan"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none text-xs md:text-sm font-medium text-slate-800 placeholder:text-slate-400"
              />
              {keyword && (
                <button onClick={() => setKeyword('')} className="text-slate-400 hover:text-slate-600 ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* CHECKBOX 1: Semua Lokasi (All 38 Indonesian Provinces & Cities) */}
            <div className="flex-1 relative">
              <button
                type="button"
                onClick={() => setOpenPopup(openPopup === 'location' ? null : 'location')}
                className="w-full bg-white text-slate-800 rounded flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-slate-300 transition text-xs md:text-sm font-medium text-left"
              >
                <div className="flex items-center min-w-0 pr-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                  <span className="truncate">
                    {selectedLocations.length === 0
                      ? 'Semua Lokasi'
                      : `${selectedLocations.length} Lokasi Terpilih (${selectedLocations.slice(0, 2).join(', ')}${selectedLocations.length > 2 ? '...' : ''})`}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openPopup === 'location' ? 'rotate-180' : ''}`} />
              </button>

              {/* POPOVER MENU FOR LOCATION CHECKBOXES */}
              {openPopup === 'location' && (
                <div className="absolute top-full left-0 mt-1.5 z-50 w-80 max-w-[90vw] bg-white border border-slate-300 shadow-2xl rounded-md overflow-hidden text-slate-800 text-xs animate-fadeIn">
                  <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2 font-bold text-slate-700 flex items-center justify-between">
                    <span>Lokasi Pekerjaan</span>
                    {selectedLocations.length > 0 && (
                      <button 
                        onClick={() => setSelectedLocations([])}
                        className="text-[11px] font-semibold text-red-600 hover:underline"
                      >
                        Reset ({selectedLocations.length})
                      </button>
                    )}
                  </div>

                  <div className="p-2 border-b border-slate-100 bg-white">
                    <input
                      type="text"
                      placeholder="Cari provinsi, kota, atau luar negeri..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="max-h-72 overflow-y-auto p-2.5 space-y-3">
                    {(!locationSearch || 'lainnya (luar negeri)'.includes(locationSearch.toLowerCase()) || 'luar negeri'.includes(locationSearch.toLowerCase()) || 'lainnya'.includes(locationSearch.toLowerCase())) && (
                      <div className="pb-2.5 border-b border-slate-200 mb-2">
                        <label className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition">
                          <input
                            type="checkbox"
                            checked={selectedLocations.includes('LAINNYA (LUAR NEGERI)')}
                            onChange={() => toggleCheckboxOption(setSelectedLocations, 'LAINNYA (LUAR NEGERI)')}
                            className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                          />
                          <span className="flex items-center gap-1.5 text-blue-700 font-extrabold">
                            <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>LAINNYA (LUAR NEGERI)</span>
                          </span>
                        </label>
                        <p className="text-[10px] text-slate-400 pl-7 font-normal">Lokasi pekerjaan luar negeri (Jepang, Jerman, Tokyo, dll.)</p>
                      </div>
                    )}
                    {INDONESIAN_PROVINCES.map((prov) => {
                      const filteredCities = prov.cities.filter(c => 
                        c.toLowerCase().includes(locationSearch.toLowerCase()) || 
                        prov.province.toLowerCase().includes(locationSearch.toLowerCase())
                      );

                      if (locationSearch && !prov.province.toLowerCase().includes(locationSearch.toLowerCase()) && filteredCities.length === 0) {
                        return null;
                      }

                      const isProvChecked = selectedLocations.includes(prov.province);

                      return (
                        <div key={prov.province} className="space-y-1">
                          <label className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer hover:bg-slate-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={isProvChecked}
                              onChange={() => toggleCheckboxOption(setSelectedLocations, prov.province)}
                              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                            />
                            <span>{prov.province}</span>
                          </label>

                          <div className="pl-5 space-y-1 border-l border-slate-100 ml-2">
                            {filteredCities.map((city) => {
                              const isCityChecked = selectedLocations.includes(city);
                              return (
                                <label key={city} className="flex items-center gap-2 font-normal text-slate-700 cursor-pointer hover:bg-slate-50 p-0.5 rounded">
                                  <input
                                    type="checkbox"
                                    checked={isCityChecked}
                                    onChange={() => toggleCheckboxOption(setSelectedLocations, city)}
                                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                  />
                                  <span>{city}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* CHECKBOX 2: Semua Spesialisasi */}
            <div className="flex-1 relative">
              <button
                type="button"
                onClick={() => setOpenPopup(openPopup === 'specialization' ? null : 'specialization')}
                className="w-full bg-white text-slate-800 rounded flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-slate-300 transition text-xs md:text-sm font-medium text-left"
              >
                <div className="flex items-center min-w-0 pr-2">
                  <Users className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                  <span className="truncate">
                    {selectedSpecializations.length === 0
                      ? 'Semua Spesialisasi'
                      : `${selectedSpecializations.length} Spesialisasi Terpilih`}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openPopup === 'specialization' ? 'rotate-180' : ''}`} />
              </button>

              {/* POPOVER MENU FOR SPECIALIZATION CHECKBOXES */}
              {openPopup === 'specialization' && (
                <div className="absolute top-full left-0 mt-1.5 z-50 w-80 max-w-[90vw] bg-white border border-slate-300 shadow-2xl rounded-md overflow-hidden text-slate-800 text-xs animate-fadeIn">
                  <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2 font-bold text-slate-700 flex items-center justify-between">
                    <span>Spesialisasi Pekerjaan</span>
                    {selectedSpecializations.length > 0 && (
                      <button 
                        onClick={() => setSelectedSpecializations([])}
                        className="text-[11px] font-semibold text-red-600 hover:underline"
                      >
                        Reset ({selectedSpecializations.length})
                      </button>
                    )}
                  </div>

                  <div className="p-2 border-b border-slate-100 bg-white">
                    <input
                      type="text"
                      placeholder="Cari bidang spesialisasi..."
                      value={specializationSearch}
                      onChange={(e) => setSpecializationSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="max-h-72 overflow-y-auto p-2.5 space-y-1">
                    {JOB_SPECIALIZATIONS.filter(spec => 
                      spec.toLowerCase().includes(specializationSearch.toLowerCase())
                    ).map((spec) => {
                      const isChecked = selectedSpecializations.includes(spec);
                      return (
                        <label key={spec} className="flex items-center gap-2.5 font-medium text-slate-700 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCheckboxOption(setSelectedSpecializations, spec)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                          />
                          <span>{spec}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* BUTTON: Cari */}
            <button
              type="button"
              onClick={() => setOpenPopup(null)}
              className="bg-[#0F172A] hover:bg-slate-900 text-white px-7 py-2.5 rounded font-bold text-xs md:text-sm transition shrink-0 border border-blue-400/30 shadow-md"
            >
              Cari
            </button>

          </div>
        </div>

        {/* ACTIVE FILTERS SUMMARY & COUNTER */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-600 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Menampilkan <strong>{totalJobs > 0 ? startIndex + 1 : 0}-{endIndex}</strong> dari <strong>{totalJobs}</strong> lowongan</span>
            
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-red-600 hover:underline text-[11px] font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded ml-2"
              >
                <X className="w-3 h-3" /> Bersihkan Filter
              </button>
            )}
          </div>
        </div>

        {/* CARDS GRID (1:1 REPLICA OF PUBLIC JOB INFO PAGE CARDS AS IN SCREENSHOT 2) */}
        {displayedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {displayedJobs.map(item => {
              const hasLogo = Boolean(item.companyLogo);
              const isBookmarked = savedJobIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedJobForDetail(item)}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group relative"
                >
                  <div>
                    {/* Company Logo Image Container (Matching Job Info logo container) */}
                    <div className="w-full h-44 relative overflow-hidden bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100">
                      {hasLogo ? (
                        <img
                          src={item.companyLogo}
                          alt={item.namaInstansi}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300 space-y-1">
                          <Building2 className="w-10 h-10 text-slate-400" />
                          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{item.namaInstansi}</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        {item.jenisPekerjaan && (
                          <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md shadow-xs bg-slate-700 text-white">
                            {item.jenisPekerjaan === 'full-time' ? 'Full-Time' : 'Part-Time'}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveJob(item.id);
                          setSavedJobIds(getSavedJobIds());
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full border transition z-10 cursor-pointer ${
                          savedJobIds.includes(item.id)
                            ? 'bg-amber-50 text-amber-600 border-amber-300 shadow-2xs'
                            : 'bg-white/90 hover:bg-white text-slate-400 hover:text-amber-500 border-slate-200'
                        }`}
                        title={savedJobIds.includes(item.id) ? 'Lowongan Tersimpan' : 'Simpan Lowongan'}
                      >
                        <Bookmark className={`w-4 h-4 ${savedJobIds.includes(item.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-2">
                      {/* Instansi Subheading in Accent Orange */}
                      <div className="text-xs font-bold text-orange-600 tracking-wide uppercase truncate">
                        {item.namaInstansi}
                      </div>

                      {/* Main Title */}
                      <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-[#0077C6] transition-colors line-clamp-2">
                        {item.judul}
                      </h3>

                      {/* Meta Footer: source + Upload Date */}
                      <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2.5 border-t border-slate-100/80 mt-2">
                        {item.sumber === 'admin' ? (
                          <span className="whitespace-nowrap font-bold text-emerald-600 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> By Admin CDC
                          </span>
                        ) : (
                          <span className="whitespace-nowrap font-medium text-slate-400">by {item.namaInstansi}</span>
                        )}
                        <span className="flex items-center gap-1.5 whitespace-nowrap text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {formatDateDisplay(item.createdAt || item.deadline)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-2xs p-8 space-y-2">
            <Info className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-base">Tidak Ada Lowongan Ditemukan</h3>
            <p className="text-slate-400 text-sm mt-1">Coba kata kunci lain atau pilih filter kategori/lokasi yang berbeda.</p>
            <button
              onClick={clearAllFilters}
              className="mt-3 bg-[#1B365D] hover:bg-blue-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* PAGINATION */}
        {totalJobs > 0 && (
          <div className="flex items-center justify-center gap-1.5 pt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition ${
                    isActive
                      ? 'bg-[#1B365D] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              &gt;
            </button>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <Footer 
        onSelectLowongan={onSelectLowongan} 
        setTab={setTab} 
      />

    </div>
  );
};
