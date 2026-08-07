import React, { useState } from 'react';
import { 
  User as UserType, 
  Mahasiswa 
} from '../types';
import { 
  updateUserProfile,
  getFromDB,
  getSavedJobIds,
  toggleSaveJob
} from '../data';
import { 
  Pencil, 
  CheckCircle2, 
  Plus, 
  FileText, 
  Bookmark, 
  Search, 
  Briefcase, 
  Building2, 
  GraduationCap, 
  X,
  ShieldCheck,
  UserCheck,
  MapPin,
  ArrowRight,
  ExternalLink,
  Camera,
  User as UserIcon,
  Code,
  Globe,
  Award,
  BookOpen,
  Languages,
  Sparkles,
  Trash2,
  Calendar
} from 'lucide-react';
import { Footer } from './Footer';

interface StudentProfileViewProps {
  user: UserType;
  mahasiswaData: Mahasiswa | null;
  onProfileUpdated?: () => void;
  onSelectJob?: (job: any) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  user,
  mahasiswaData,
  onProfileUpdated,
  onSelectJob
}) => {
  // Secondary sub-tab: 'profile' | 'bookmarks' | 'account'
  const [subTab, setSubTab] = useState<'profile' | 'bookmarks' | 'account'>('profile');
  const [savedRefreshKey, setSavedRefreshKey] = useState<number>(0);

  // Modal Editing States
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Avatar State & File Ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(
    mahasiswaData?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
  );

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        triggerToast('Ukuran foto terlalu besar (maksimal 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          updateUserProfile(user.id, { photoUrl: reader.result });
          triggerToast('Foto profil dari berkas lokal berhasil diunggah!');
          if (onProfileUpdated) onProfileUpdated();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Fields State
  const [firstName, setFirstName] = useState(() => {
    const names = (mahasiswaData?.nama || user.name).split(' ');
    return names[0] || '';
  });
  const [lastName, setLastName] = useState(() => {
    const names = (mahasiswaData?.nama || user.name).split(' ');
    return names.slice(1).join(' ') || '';
  });
  const [email, setEmail] = useState(mahasiswaData?.email || user.email);
  const [mobile, setMobile] = useState(mahasiswaData?.phone || '085241009988');
  const [nationality, setNationality] = useState(mahasiswaData?.nationality || 'Indonesian');
  const [countryOfResidence, setCountryOfResidence] = useState('Indonesia');
  const [university, setUniversity] = useState('Universitas Muhammadiyah Kendari');
  const [aboutMe, setAboutMe] = useState(
    mahasiswaData?.aboutMe || 'Mahasiswa berdedikasi tinggi dari Universitas Muhammadiyah Kendari yang aktif mengasah keahlian di bidang Teknologi Informasi, Pengembangan Web, dan Manajemen Karir Profesional.'
  );

  const [userStatusType, setUserStatusType] = useState<'Mahasiswa' | 'Alumni'>(
    user.role === 'alumni' ? 'Alumni' : 'Mahasiswa'
  );

  // Career preferences
  const [opportunityType, setOpportunityType] = useState(mahasiswaData?.opportunityType || 'Internship, Clerkship or Placement (Magang)');
  const [opportunityStartDate, setOpportunityStartDate] = useState(mahasiswaData?.preferredStartDate || 'As soon as possible (Segera)');
  const [industries, setIndustries] = useState('IT & Computer Science, Business & Management');
  const [locations, setLocations] = useState('Kendari, Jakarta, Remote, Morowali');
  
  // High school states
  const [hsGradYear, setHsGradYear] = useState('2022');
  const [hsCountry, setHsCountry] = useState('Indonesia');
  const [hsName, setHsName] = useState('SMA Negeri 1 Kendari');
  const [hsSubjects, setHsSubjects] = useState('IPA (Natural Sciences)');

  // Extra info states
  const [workRights, setWorkRights] = useState('Indonesia / WNI (Warga Negara Indonesia)');
  const [gender, setGender] = useState('Male');
  const [sendOpportunities, setSendOpportunities] = useState('Yes');
  const [cvName, setCvName] = useState('CV_Muhammad_Fadly.pdf');
  const [ethnicity, setEthnicity] = useState('Bugis / Tolaki');
  const [religion, setReligion] = useState('Islam');

  // Qualification State (Pendidikan)
  const [qualifications, setQualifications] = useState([
    {
      id: '1',
      institution: 'UNIVERSITAS MUHAMMADIYAH KENDARI',
      level: 'Sarjana (S1) - Teknik Informatika / Computer Science',
      year: '2026'
    },
    {
      id: '2',
      institution: 'SMA Negeri 1 Kendari',
      level: 'SMA - Jurusan IPA (Natural Sciences)',
      year: '2022'
    }
  ]);
  const [newInst, setNewInst] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [newYear, setNewYear] = useState('');

  // Skills State
  const [skills, setSkills] = useState<string[]>([
    'JavaScript', 'React.js', 'UI/UX Design', 'Node.js', 'Python', 'Git & GitHub', 'HTML/CSS', 'Problem Solving'
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Experiences State
  const [experiences, setExperiences] = useState([
    {
      id: '1',
      position: 'Fullstack Web Developer Intern',
      company: 'PT Go Digital Kendari',
      period: '2026 - Sekarang',
      description: 'Mengembangkan dan memelihara aplikasi portal akademik kampus dan integrasi RESTful API backend.'
    },
    {
      id: '2',
      position: 'Anggota Divisi IT & Komunikasi',
      company: 'Himpunan Mahasiswa Teknik Informatika UMK',
      period: '2024 - 2025',
      description: 'Mengelola situs web kegiatan mahasiswa dan publikasi digital kampus.'
    }
  ]);
  const [newExpPos, setNewExpPos] = useState('');
  const [newExpComp, setNewExpComp] = useState('');
  const [newExpPeriod, setNewExpPeriod] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');

  // Languages State
  const [languagesList, setLanguagesList] = useState([
    { id: '1', name: 'Bahasa Indonesia', level: 'Fasih / Native' },
    { id: '2', name: 'Bahasa Inggris', level: 'Menengah / Intermediate' }
  ]);
  const [newLangName, setNewLangName] = useState('');
  const [newLangLevel, setNewLangLevel] = useState('Fasih / Native');

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveProfileSection = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: Partial<Mahasiswa> = {
      nama: `${firstName} ${lastName}`.trim(),
      email,
      phone: mobile,
      nationality,
      opportunityType,
      preferredStartDate: opportunityStartDate
    };
    
    updateUserProfile(user.id, updatedProfile);
    setEditingSection(null);
    triggerToast('Profil berhasil diperbarui!');
    if (onProfileUpdated) onProfileUpdated();
  };

  // Add Skill Handler
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillInput.trim()) {
      if (!skills.includes(newSkillInput.trim())) {
        setSkills([...skills, newSkillInput.trim()]);
      }
      setNewSkillInput('');
      triggerToast('Skill baru berhasil ditambahkan!');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
    triggerToast('Skill berhasil dihapus');
  };

  // Add Experience Handler
  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpPos && newExpComp) {
      setExperiences([
        ...experiences,
        {
          id: Date.now().toString(),
          position: newExpPos,
          company: newExpComp,
          period: newExpPeriod || '2026',
          description: newExpDesc || '-'
        }
      ]);
      setNewExpPos('');
      setNewExpComp('');
      setNewExpPeriod('');
      setNewExpDesc('');
      setEditingSection(null);
      triggerToast('Pengalaman berhasil ditambahkan!');
    }
  };

  // Add Language Handler
  const handleAddLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLangName) {
      setLanguagesList([
        ...languagesList,
        {
          id: Date.now().toString(),
          name: newLangName,
          level: newLangLevel
        }
      ]);
      setNewLangName('');
      setEditingSection(null);
      triggerToast('Bahasa baru berhasil ditambahkan!');
    }
  };

  // Add Qualification Handler
  const handleAddQualification = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInst && newLevel) {
      setQualifications([
        ...qualifications,
        {
          id: Date.now().toString(),
          institution: newInst,
          level: newLevel,
          year: newYear || new Date().getFullYear().toString()
        }
      ]);
      setNewInst('');
      setNewLevel('');
      setNewYear('');
      setEditingSection(null);
      triggerToast('Pendidikan berhasil ditambahkan!');
    }
  };

  // Profile completion calculation
  const calculateCompletion = () => {
    const fields = [firstName, lastName, email, mobile, nationality, opportunityType, hsName, aboutMe];
    const filled = fields.filter(f => f && f.trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const completionPercent = calculateCompletion();

  return (
    <div className="bg-slate-50/50 min-h-screen font-sans" id="prosple-student-profile-view">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-50 text-emerald-800 px-5 py-3 rounded-2xl shadow-lg border border-emerald-200 flex items-center gap-3 animate-fadeIn text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. HEADER CARD / BANNER HERO SECTION */}
      <div className="bg-gradient-to-r from-[#0B1340] via-[#1E3A8A] to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          
          {/* Hidden File Input for Local Image Upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handleImageFileChange} 
            className="hidden" 
          />

          {/* Foto Profil */}
          <div className="relative group shrink-0">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-slate-800 flex items-center justify-center cursor-pointer relative"
              title="Klik untuk ubah foto profil dari berkas lokal"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover group-hover:opacity-90 transition" />
              ) : (
                <UserIcon className="w-16 h-16 text-slate-400" />
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-[#10B981] hover:bg-emerald-600 text-white p-2.5 rounded-full shadow-md transition transform group-hover:scale-110"
              title="Ubah Foto Profil dari Berkas Lokal"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Info Summary */}
          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <button
                type="button"
                onClick={() => setEditingSection('headerInfo')}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-extrabold px-3.5 py-1 rounded-full border border-emerald-400/30 backdrop-blur-xs uppercase tracking-wider flex items-center gap-1.5 transition group cursor-pointer"
                title="Klik untuk ubah status (Mahasiswa / Alumni)"
              >
                <span>{userStatusType}</span>
                <Pencil className="w-3 h-3 opacity-70 group-hover:opacity-100" />
              </button>

              <span className="bg-white/10 text-slate-200 text-xs font-semibold px-3.5 py-1 rounded-full border border-white/10">
                Terverifikasi CDC UMK
              </span>

              <button
                type="button"
                onClick={() => setEditingSection('headerInfo')}
                className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-semibold ml-auto"
                title="Edit Info Utama (Status, Nama & Universitas)"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Info Profil
              </button>
            </div>

            <h1 
              onClick={() => setEditingSection('headerInfo')}
              className="text-2xl sm:text-4xl font-black text-white tracking-tight cursor-pointer hover:text-emerald-300 transition group flex items-center gap-2"
              title="Klik untuk edit nama"
            >
              <span>{`${firstName} ${lastName}`.trim() || user.name}</span>
            </h1>

            <div 
              onClick={() => setEditingSection('headerInfo')}
              className="flex items-center justify-center md:justify-start gap-2 text-blue-200 text-sm font-semibold cursor-pointer hover:text-white transition group w-fit"
              title="Klik untuk ubah nama Universitas"
            >
              <GraduationCap className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span className="underline underline-offset-4 decoration-emerald-500/40 group-hover:decoration-emerald-400">{university}</span>
              <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition text-emerald-400" />
            </div>

            {/* Tentang Saya */}
            <div className="pt-3 border-t border-white/10 mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="uppercase tracking-wider text-[11px] text-emerald-400 font-extrabold">TENTANG SAYA</span>
                <button 
                  onClick={() => setEditingSection('aboutMe')} 
                  className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-semibold text-xs"
                >
                  Edit Bio <Pencil className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans max-w-2xl whitespace-pre-line">
                {aboutMe}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. SECONDARY SUB-NAVIGATION TABS */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-center gap-6 sm:gap-10 text-sm font-bold">
          <button
            onClick={() => setSubTab('profile')}
            className={`py-4 transition-all relative ${
              subTab === 'profile'
                ? 'text-[#DD4B25] border-b-2 border-[#DD4B25]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profil Saya
          </button>

          <button
            onClick={() => setSubTab('bookmarks')}
            className={`py-4 transition-all relative ${
              subTab === 'bookmarks'
                ? 'text-[#DD4B25] border-b-2 border-[#DD4B25]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lowongan Tersimpan
          </button>

          <button
            onClick={() => setSubTab('account')}
            className={`py-4 transition-all relative ${
              subTab === 'account'
                ? 'text-[#DD4B25] border-b-2 border-[#DD4B25]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Akun Saya
          </button>
        </div>
      </div>

      {/* 3. MAIN PROFILE CONTENT & STRUCTURE */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* SUB-TAB A: PROFIL SAYA (STRUCTURED IN ORDER REQUESTED BY USER) */}
        {subTab === 'profile' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* KELENGKAPAN PROFIL PROGRESS BAR */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">KELENGKAPAN PROFIL MAHASISWA</span>
                <span className="text-xs font-extrabold text-emerald-600">{completionPercent}% Selesai</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#10B981] h-2.5 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${completionPercent}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Profil yang lengkap akan memperbesar peluang diterima saat melamar lowongan kerja dan magang.
              </p>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 1: DATA PRIBADI
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-[#1E3A8A]" />
                  Data Pribadi
                </h3>
                <button 
                  onClick={() => setEditingSection('personal')}
                  className="text-[#DD4B25] hover:underline text-xs font-bold flex items-center gap-1"
                >
                  Edit <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">NAMA LENGKAP</div>
                  <div className="font-bold text-slate-800 text-sm">{`${firstName} ${lastName}`.trim() || 'Belum Diisi'}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">EMAIL</div>
                  <div className="font-bold text-slate-800 text-sm">{email || user.email}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">NO. TELEPON / WHATSAPP</div>
                  <div className="font-bold text-slate-800 text-sm">{mobile || 'Belum Diisi'}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">JENIS KELAMIN</div>
                  <div className="font-bold text-slate-800 text-sm">{gender === 'Male' ? 'Laki-Laki' : gender === 'Female' ? 'Perempuan' : gender}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">KEWARGANEGARAAN</div>
                  <div className="font-bold text-slate-800 text-sm">{nationality || 'Indonesian'}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">AGAMA</div>
                  <div className="font-bold text-slate-800 text-sm">{religion}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">SUKU / ETNIS</div>
                  <div className="font-bold text-slate-800 text-sm">{ethnicity}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">HAK KERJA</div>
                  <div className="font-bold text-slate-800 text-sm">{workRights}</div>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 2: PENDIDIKAN
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#1E3A8A]" />
                  Pendidikan
                </h3>
                <button
                  onClick={() => setEditingSection('education')}
                  className="text-[#DD4B25] hover:underline text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Pendidikan
                </button>
              </div>

              <div className="space-y-3">
                {qualifications.map(q => (
                  <div key={q.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 relative space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        {q.institution}
                      </div>
                      <button 
                        onClick={() => setQualifications(qualifications.filter(item => item.id !== q.id))} 
                        className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm sm:text-base">{q.level}</div>
                    <div className="text-xs text-slate-500 font-medium">Tahun Lulus: {q.year}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 3: SKILL (KEAHLIAN)
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Code className="w-5 h-5 text-[#1E3A8A]" />
                  Skill &amp; Keahlian
                </h3>
                <button
                  onClick={() => setEditingSection('skills')}
                  className="text-[#DD4B25] hover:underline text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Kelola Skill
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map(sk => (
                  <span 
                    key={sk} 
                    className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>{sk}</span>
                    <button 
                      onClick={() => handleRemoveSkill(sk)} 
                      className="text-blue-400 hover:text-rose-600 transition ml-0.5"
                      title="Hapus Skill"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 4: PENGALAMAN
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#1E3A8A]" />
                  Pengalaman
                </h3>
                <button
                  onClick={() => setEditingSection('experience')}
                  className="text-[#DD4B25] hover:underline text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Pengalaman
                </button>
              </div>

              <div className="space-y-4">
                {experiences.map(exp => (
                  <div key={exp.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{exp.position}</h4>
                        <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5" /> {exp.company}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                          {exp.period}
                        </span>
                        <button 
                          onClick={() => setExperiences(experiences.filter(e => e.id !== exp.id))}
                          className="text-slate-400 hover:text-rose-600 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium pt-1">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 5: BAHASA
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Languages className="w-5 h-5 text-[#1E3A8A]" />
                  Bahasa
                </h3>
                <button
                  onClick={() => setEditingSection('languages')}
                  className="text-[#DD4B25] hover:underline text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Bahasa
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {languagesList.map(lang => (
                  <div key={lang.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm">{lang.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{lang.level}</div>
                    </div>
                    <button 
                      onClick={() => setLanguagesList(languagesList.filter(l => l.id !== lang.id))}
                      className="text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 6: PREFERENSI KARIR
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#1E3A8A]" />
                  Preferensi Karir
                </h3>
                <button 
                  onClick={() => setEditingSection('career')}
                  className="text-[#DD4B25] hover:underline text-xs font-bold flex items-center gap-1"
                >
                  Edit <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">JENIS KESEMPATAN</div>
                  <div className="font-bold text-slate-800 text-sm">{opportunityType}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">TANGGAL SIAP KERJA</div>
                  <div className="font-bold text-slate-800 text-sm">{opportunityStartDate}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">INDUSTRI YANG DIMINATI</div>
                  <div className="font-bold text-slate-800 text-sm">{industries}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">LOKASI KERJA IMPIAN</div>
                  <div className="font-bold text-slate-800 text-sm">{locations}</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SUB-TAB B: MY BOOKMARKS */}
        {subTab === 'bookmarks' && (() => {
          let savedJobIds: string[] = [];
          try {
            const saved = localStorage.getItem('cdc_saved_job_ids');
            savedJobIds = saved ? JSON.parse(saved) : [];
          } catch {}

          const allJobs = getFromDB<any>('lowongan');
          const savedJobs = allJobs.filter((j: any) => savedJobIds.includes(j.id));

          return (
            <div className="w-full space-y-4 animate-fadeIn max-w-5xl mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-lg">Lowongan Pekerjaan Tersimpan ({savedJobs.length})</h3>
                <span className="text-xs text-slate-500 font-medium">Klik pada lowongan untuk melihat detail &amp; melamar</span>
              </div>

              {savedJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedJobs.map((job: any) => (
                    <div 
                      key={job.id} 
                      onClick={() => onSelectJob && onSelectJob(job)}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex justify-between items-start cursor-pointer group hover:border-[#0077C6]/40"
                    >
                      <div className="space-y-2.5 min-w-0 pr-3">
                        <span className="text-xs font-bold text-[#0077C6] uppercase tracking-wide block truncate">{job.namaInstansi}</span>
                        <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#0077C6] transition-colors leading-snug line-clamp-2">
                          {job.judul}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.lokasi}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.tipe === 'magang' ? 'Magang' : 'Kerja'}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                          Tersimpan 🔖
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job.id);
                            setSavedRefreshKey(k => k + 1);
                          }}
                          className="bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg border border-slate-200 transition text-xs font-semibold"
                          title="Hapus dari Simpanan"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-4 min-h-[340px] flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <Bookmark className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">Belum Ada Lowongan Tersimpan</h3>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto font-medium">
                    Saat Anda menekan ikon simpan atau bookmark pada lowongan pekerjaan, lowongan tersebut akan muncul di bagian ini.
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* SUB-TAB D: MY ACCOUNT */}
        {subTab === 'account' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">Pengaturan Akun</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Email</label>
                <input type="email" value={user.email} disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Peran Akun</label>
                <input type="text" value="Mahasiswa / Alumni" disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-bold" />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. MODALS DISPATCHER */}

      {/* MODAL EDIT INFO UTAMA (STATUS, NAMA, UNIVERSITAS) */}
      {editingSection === 'headerInfo' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Edit Info Utama Profil</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setEditingSection(null);
              triggerToast('Info utama profil berhasil diperbarui!');
            }} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Keanggotaan</label>
                <select 
                  value={userStatusType} 
                  onChange={e => setUserStatusType(e.target.value as 'Mahasiswa' | 'Alumni')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-white font-bold"
                >
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Alumni">Alumni</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Depan *</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    required 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Belakang</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Perguruan Tinggi / Universitas *</label>
                <input 
                  type="text" 
                  value={university} 
                  onChange={e => setUniversity(e.target.value)} 
                  required 
                  placeholder="Contoh: Universitas Muhammadiyah Kendari"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" 
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">Batal</button>
                <button type="submit" className="bg-[#10B981] text-white font-bold px-6 py-2 rounded-xl">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* MODAL TENTANG SAYA (BIO) */}
      {editingSection === 'aboutMe' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Edit Tentang Saya (Bio)</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Ringkasan Bio / Profil Profesional</label>
              <textarea 
                rows={5}
                value={aboutMe}
                onChange={e => setAboutMe(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"
                placeholder="Tuliskan deskripsi singkat mengenai latar belakang, passion, dan tujuan karir Anda..."
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => setEditingSection(null)} className="px-4 py-2 text-xs font-bold text-slate-600 rounded-xl border border-slate-200">Batal</button>
                <button onClick={() => { setEditingSection(null); triggerToast('Bio berhasil diperbarui!'); }} className="px-5 py-2 text-xs font-bold text-white bg-[#10B981] rounded-xl">Simpan Bio</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DATA PRIBADI */}
      {editingSection === 'personal' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Edit Data Pribadi</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileSection} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Depan *</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Belakang</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. Telepon / WhatsApp</label>
                  <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 bg-white">
                    <option value="Male">Laki-Laki</option>
                    <option value="Female">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kewarganegaraan</label>
                  <input type="text" value={nationality} onChange={e => setNationality(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Agama</label>
                  <input type="text" value={religion} onChange={e => setReligion(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Suku / Etnis</label>
                  <input type="text" value={ethnicity} onChange={e => setEthnicity(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hak Kerja</label>
                  <input type="text" value={workRights} onChange={e => setWorkRights(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20" />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">Batal</button>
                <button type="submit" className="bg-[#10B981] text-white font-bold px-6 py-2 rounded-xl">Simpan Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PENDIDIKAN */}
      {editingSection === 'education' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Tambah Pendidikan</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddQualification} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Institusi / Universitas / Sekolah</label>
                <input type="text" required placeholder="Contoh: Universitas Muhammadiyah Kendari" value={newInst} onChange={e => setNewInst(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Jenjang &amp; Program Studi / Jurusan</label>
                <input type="text" required placeholder="Contoh: S1 - Teknik Informatika" value={newLevel} onChange={e => setNewLevel(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tahun Lulus</label>
                <input type="text" placeholder="Contoh: 2026" value={newYear} onChange={e => setNewYear(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">Batal</button>
                <button type="submit" className="bg-[#10B981] text-white font-bold px-6 py-2 rounded-xl">Tambah</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KELOLA SKILL */}
      {editingSection === 'skills' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Kelola Skill &amp; Keahlian</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ketik skill baru (misal: React, Python)..." 
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
              />
              <button type="submit" className="bg-[#10B981] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1">
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </form>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-500">Daftar Skill Saat Ini:</div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                {skills.map(sk => (
                  <span key={sk} className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                    <span>{sk}</span>
                    <button onClick={() => handleRemoveSkill(sk)} className="text-blue-400 hover:text-rose-600 transition">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setEditingSection(null)} className="bg-slate-900 text-white font-bold px-6 py-2 rounded-xl text-xs">Selesai</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENGALAMAN */}
      {editingSection === 'experience' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Tambah Pengalaman Kerja / Organisasi</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddExperience} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Posisi / Jabatan *</label>
                <input type="text" required placeholder="Contoh: Web Developer Intern" value={newExpPos} onChange={e => setNewExpPos(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Perusahaan / Organisasi *</label>
                <input type="text" required placeholder="Contoh: PT Go Digital Kendari" value={newExpComp} onChange={e => setNewExpComp(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Periode</label>
                <input type="text" placeholder="Contoh: Jan 2026 - Sekarang" value={newExpPeriod} onChange={e => setNewExpPeriod(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Singkat</label>
                <textarea rows={3} placeholder="Jelaskan peranan dan pencapaian Anda..." value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">Batal</button>
                <button type="submit" className="bg-[#10B981] text-white font-bold px-6 py-2 rounded-xl">Tambah</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BAHASA */}
      {editingSection === 'languages' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Tambah Bahasa</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLanguage} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Bahasa *</label>
                <input type="text" required placeholder="Contoh: Bahasa Jepang / Bahasa Mandarin" value={newLangName} onChange={e => setNewLangName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tingkat Kemampuan</label>
                <select value={newLangLevel} onChange={e => setNewLangLevel(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-white">
                  <option value="Fasih / Native">Fasih / Native</option>
                  <option value="Tingkat Lanjut / Advanced">Tingkat Lanjut / Advanced</option>
                  <option value="Menengah / Intermediate">Menengah / Intermediate</option>
                  <option value="Dasar / Elementary">Dasar / Elementary</option>
                </select>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">Batal</button>
                <button type="submit" className="bg-[#10B981] text-white font-bold px-6 py-2 rounded-xl">Tambah</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREFERENSI KARIR */}
      {editingSection === 'career' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Edit Preferensi Karir</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfileSection} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Jenis Kesempatan</label>
                <input type="text" value={opportunityType} onChange={e => setOpportunityType(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Siap Kerja</label>
                <input type="text" value={opportunityStartDate} onChange={e => setOpportunityStartDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Industri Yang Diminati</label>
                <input type="text" value={industries} onChange={e => setIndustries(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Lokasi Kerja Impian</label>
                <input type="text" value={locations} onChange={e => setLocations(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">Batal</button>
                <button type="submit" className="bg-[#10B981] text-white font-bold px-6 py-2 rounded-xl">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer />

    </div>
  );
};
