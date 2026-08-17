import React, { useState } from 'react';
import { 
  User as UserType, 
  Mahasiswa 
} from '../types';
import { 
  updateUserProfile,
  getFromDB,
  getSavedJobIds,
  getValidSavedJobs,
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
  Calendar,
  Settings
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
    mahasiswaData?.photoUrl || user.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
  );

  React.useEffect(() => {
    if (mahasiswaData?.photoUrl) {
      setAvatarUrl(mahasiswaData.photoUrl);
    } else if (user.photoUrl) {
      setAvatarUrl(user.photoUrl);
    }
  }, [mahasiswaData?.photoUrl, user.photoUrl]);

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
          const base64Photo = reader.result; // Base64 data URL
          setAvatarUrl(base64Photo);
          updateUserProfile(user.id, { photoUrl: base64Photo });
          triggerToast('Foto profil dari berkas lokal berhasil diunggah (Base64)!');
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
  const [nim, setNim] = useState(mahasiswaData?.nim || '202101001');
  const [mobile, setMobile] = useState(mahasiswaData?.phone || '085241009988');
  const [nationality, setNationality] = useState(mahasiswaData?.nationality || 'Indonesian');
  const [countryOfResidence, setCountryOfResidence] = useState('Indonesia');
  const [university, setUniversity] = useState('Universitas Muhammadiyah Kendari');
  const [aboutMe, setAboutMe] = useState(
    mahasiswaData?.aboutMe || 'Mahasiswa berdedikasi tinggi dari Universitas Muhammadiyah Kendari yang aktif mengasah keahlian di bidang Teknologi Informasi, Pengembangan Web, dan Manajemen Karir Profesional.'
  );

  const [userStatusType, setUserStatusType] = useState<'Mahasiswa' | 'Alumni' | 'Job Seeker'>(
    mahasiswaData?.userStatusType || (user.role === 'alumni' ? 'Alumni' : user.role === 'job_seeker' ? 'Job Seeker' : 'Mahasiswa')
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

  // Qualification State (Pendidikan)
  const [qualifications, setQualifications] = useState(() => mahasiswaData?.qualifications || [
    {
      id: '1',
      institution: 'UNIVERSITAS MUHAMMADIYAH KENDARI',
      level: 'Sarjana (S1) - Teknik Informatika / Computer Science',
      year: '2026',
      ipk: '3.85 / 4.00'
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
  const [newIpk, setNewIpk] = useState('');

  // Skills State
  const [skills, setSkills] = useState<string[]>(() => mahasiswaData?.skills || [
    'JavaScript', 'React.js', 'UI/UX Design', 'Node.js', 'Python', 'Git & GitHub', 'HTML/CSS', 'Tailwind CSS'
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Experiences State
  const [experiences, setExperiences] = useState(() => mahasiswaData?.experiences || [
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

  // Certificates State
  const [certificates, setCertificates] = useState(() => mahasiswaData?.certificates || [
    {
      id: 'cert_1',
      name: 'Sertifikat Kompetensi Fullstack Web Developer - BNSP',
      issuer: 'BNSP',
      year: '2025'
    },
    {
      id: 'cert_2',
      name: 'Google IT Support Professional Certificate',
      issuer: 'Google / Coursera',
      year: '2024'
    }
  ]);
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertYear, setNewCertYear] = useState('');

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

  const saveProfileData = (partial: Partial<Mahasiswa>) => {
    updateUserProfile(user.id, {
      ...partial,
      qualifications: partial.qualifications || qualifications,
      skills: partial.skills || skills,
      experiences: partial.experiences || experiences,
      certificates: partial.certificates || certificates
    });
    if (onProfileUpdated) onProfileUpdated();
  };

  const handleSaveProfileSection = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: Partial<Mahasiswa> = {
      nama: `${firstName} ${lastName}`.trim(),
      nim,
      email,
      phone: mobile,
      nationality,
      opportunityType,
      preferredStartDate: opportunityStartDate,
      qualifications,
      skills,
      experiences,
      certificates,
      ipk: '3.85 / 4.00'
    };
    
    saveProfileData(updatedProfile);
    setEditingSection(null);
    triggerToast('Profil berhasil diperbarui!');
  };

  // Add Skill Handler
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillInput.trim()) {
      const nextSkills = skills.includes(newSkillInput.trim()) ? skills : [...skills, newSkillInput.trim()];
      setSkills(nextSkills);
      setNewSkillInput('');
      saveProfileData({ skills: nextSkills });
      triggerToast('Skill baru berhasil ditambahkan!');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const nextSkills = skills.filter(s => s !== skillToRemove);
    setSkills(nextSkills);
    saveProfileData({ skills: nextSkills });
    triggerToast('Skill berhasil dihapus');
  };

  // Add Experience Handler
  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpPos && newExpComp) {
      const nextExp = [
        ...experiences,
        {
          id: Date.now().toString(),
          position: newExpPos,
          company: newExpComp,
          period: newExpPeriod || '2026',
          description: newExpDesc || '-'
        }
      ];
      setExperiences(nextExp);
      setNewExpPos('');
      setNewExpComp('');
      setNewExpPeriod('');
      setNewExpDesc('');
      setEditingSection(null);
      saveProfileData({ experiences: nextExp });
      triggerToast('Pengalaman berhasil ditambahkan!');
    }
  };

  const handleRemoveExperience = (expId: string) => {
    const nextExp = experiences.filter(e => e.id !== expId);
    setExperiences(nextExp);
    saveProfileData({ experiences: nextExp });
    triggerToast('Pengalaman berhasil dihapus');
  };

  // Add Certificate Handler
  const handleAddCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCertName) {
      const nextCerts = [
        ...certificates,
        {
          id: Date.now().toString(),
          name: newCertName,
          issuer: newCertIssuer || 'Lembaga Sertifikasi',
          year: newCertYear || '2026'
        }
      ];
      setCertificates(nextCerts);
      setNewCertName('');
      setNewCertIssuer('');
      setNewCertYear('');
      setEditingSection(null);
      saveProfileData({ certificates: nextCerts });
      triggerToast('Sertifikat berhasil ditambahkan!');
    }
  };

  const handleRemoveCertificate = (certId: string) => {
    const nextCerts = certificates.filter(c => c.id !== certId);
    setCertificates(nextCerts);
    saveProfileData({ certificates: nextCerts });
    triggerToast('Sertifikat berhasil dihapus');
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
      const nextQual = [
        ...qualifications,
        {
          id: Date.now().toString(),
          institution: newInst,
          level: newLevel,
          year: newYear || '2026',
          ...(newIpk.trim() ? { ipk: newIpk.trim() } : {})
        }
      ];
      setQualifications(nextQual);
      setNewInst('');
      setNewLevel('');
      setNewYear('');
      setNewIpk('');
      setEditingSection(null);
      saveProfileData({ qualifications: nextQual });
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

      {/* 1. HEADER HERO SECTION (EXPERT PROGRAMMER GRADE UI) */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden shadow-xl border-b border-slate-800">
        {/* Ambient Decorative Lighting Effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-7 relative z-10">
          
          {/* Hidden File Input for Local Image Upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handleImageFileChange} 
            className="hidden" 
          />

          {/* Foto Profil with Ambient Ring Glow */}
          <div className="relative group shrink-0">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-2 border-white/20 ring-4 ring-emerald-500/20 shadow-2xl overflow-hidden bg-slate-800 flex items-center justify-center cursor-pointer relative transition-transform duration-300 group-hover:scale-[1.02]"
              title="Klik untuk ubah foto profil dari berkas lokal"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={firstName} className="w-full h-full object-cover group-hover:opacity-90 transition duration-300" />
              ) : (
                <UserIcon className="w-14 h-14 text-slate-400" />
              )}
              <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center text-white">
                <Camera className="w-7 h-7 mb-1 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Ubah Foto</span>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-[#10B981] hover:bg-emerald-600 text-white p-2.5 rounded-2xl shadow-lg border-2 border-slate-900 transition transform group-hover:scale-110 cursor-pointer"
              title="Ubah Foto Profil dari Berkas Lokal"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Profile Info Summary */}
          <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <button
                type="button"
                onClick={() => setEditingSection('headerInfo')}
                className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md uppercase tracking-wider flex items-center gap-1.5 transition group cursor-pointer"
                title="Klik untuk ubah status (Mahasiswa / Alumni / Job Seeker)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{userStatusType}</span>
                <Pencil className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </button>

              <span className="bg-white/10 text-slate-200 text-[11px] font-semibold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Terverifikasi CDC UMK
              </span>

              <button
                type="button"
                onClick={() => setEditingSection('headerInfo')}
                className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-semibold md:ml-auto cursor-pointer"
                title="Edit Info Utama (Status, Nama & Universitas)"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Info Profil
              </button>
            </div>

            <h1 
              onClick={() => setEditingSection('headerInfo')}
              className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight cursor-pointer hover:text-emerald-300 transition group flex items-center justify-center md:justify-start gap-2"
              title="Klik untuk edit nama"
            >
              <span>{`${firstName} ${lastName}`.trim() || user.name}</span>
            </h1>

            <div 
              onClick={() => setEditingSection('headerInfo')}
              className="flex items-center justify-center md:justify-start gap-2 text-slate-300 text-xs sm:text-sm font-medium cursor-pointer hover:text-white transition group w-fit mx-auto md:mx-0"
              title="Klik untuk ubah nama Universitas"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="underline underline-offset-4 decoration-slate-600 group-hover:decoration-emerald-400">{university}</span>
              <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition text-emerald-400" />
            </div>

            {/* Tentang Saya (Bio Card) */}
            <div className="pt-3 border-t border-slate-800/80 mt-3 space-y-1.5 bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800/60">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="uppercase tracking-wider text-[10px] text-emerald-400 font-extrabold flex items-center gap-1.5">
                  <UserIcon className="w-3 h-3 text-emerald-400" /> TENTANG SAYA
                </span>
                <button 
                  onClick={() => setEditingSection('aboutMe')} 
                  className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-semibold text-xs cursor-pointer"
                >
                  Edit Bio <Pencil className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-2xl whitespace-pre-line font-normal">
                {aboutMe}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. STICKY SUB-NAVIGATION TABS (LINEAR/VERCEL DESIGN) */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setSubTab('profile')}
            className={`py-3.5 px-3 transition-all flex items-center gap-2 relative ${
              subTab === 'profile'
                ? 'text-[#0077C6] font-extrabold border-b-2 border-[#0077C6]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profil Saya</span>
          </button>

          <button
            onClick={() => setSubTab('bookmarks')}
            className={`py-3.5 px-3 transition-all flex items-center gap-2 relative ${
              subTab === 'bookmarks'
                ? 'text-[#0077C6] font-extrabold border-b-2 border-[#0077C6]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Lowongan Tersimpan</span>
            {(() => {
              try {
                const validSaved = getValidSavedJobs();
                if (validSaved.length > 0) {
                  return (
                    <span className="bg-blue-100 text-[#0077C6] text-[10px] font-extrabold px-2 py-0.5 rounded-full ml-0.5">
                      {validSaved.length}
                    </span>
                  );
                }
              } catch {}
              return null;
            })()}
          </button>

          <button
            onClick={() => setSubTab('account')}
            className={`py-3.5 px-3 transition-all flex items-center gap-2 relative ${
              subTab === 'account'
                ? 'text-[#0077C6] font-extrabold border-b-2 border-[#0077C6]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Akun Saya</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN PROFILE CONTENT & STRUCTURE */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* SUB-TAB A: PROFIL SAYA */}
        {subTab === 'profile' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* KELENGKAPAN PROFIL PROGRESS CARD (MODERN DESIGN) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">SKOR KELENGKAPAN PROFIL</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Profil lengkap meningkatkan peluang dilirik oleh Mitra Industri UMK</p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 font-extrabold px-3 py-1 rounded-full text-xs border border-emerald-200 shadow-2xs">
                  {completionPercent}% Selesai
                </span>
              </div>

              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${completionPercent}%` }}
                ></div>
              </div>

              {/* Checklist Badges */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Foto Profil
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Data Pribadi
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pendidikan ({qualifications.length})
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Skill ({skills.length})
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pengalaman ({experiences.length})
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sertifikat ({certificates.length})
                </span>
              </div>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 1: DATA PRIBADI
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Data Pribadi</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Informasi identitas resmi pelamar</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingSection('personal')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-500" /> Edit Data
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-2xs transition">
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">NAMA LENGKAP</div>
                  <div className="font-bold text-slate-900 text-sm truncate">{`${firstName} ${lastName}`.trim() || 'Belum Diisi'}</div>
                </div>

                {userStatusType === 'Mahasiswa' && (
                  <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-2xs transition">
                    <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">NIM (NOMOR INDUK MAHASISWA)</div>
                    <div className="font-bold text-slate-900 text-sm font-mono">{nim || 'Belum Diisi'}</div>
                  </div>
                )}

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-2xs transition">
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">EMAIL</div>
                  <div className="font-bold text-slate-900 text-sm truncate">{email || user.email}</div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-2xs transition">
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">NO. TELEPON / WHATSAPP</div>
                  <div className="font-bold text-slate-900 text-sm">{mobile || 'Belum Diisi'}</div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-2xs transition">
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">JENIS KELAMIN</div>
                  <div className="font-bold text-slate-900 text-sm">{gender === 'Male' ? 'Laki-Laki' : gender === 'Female' ? 'Perempuan' : gender}</div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-2xs transition">
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">KEWARGANEGARAAN</div>
                  <div className="font-bold text-slate-900 text-sm">{nationality || 'Indonesian'}</div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-2xs transition">
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">HAK KERJA</div>
                  <div className="font-bold text-slate-900 text-sm">{workRights}</div>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 2: PENDIDIKAN
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Pendidikan</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Riwayat studi perguruan tinggi dan sekolah</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSection('education')}
                  className="bg-[#0077C6]/10 hover:bg-[#0077C6]/20 text-[#0077C6] px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Pendidikan
                </button>
              </div>

              <div className="space-y-3.5">
                {qualifications.map(q => (
                  <div key={q.id} className="bg-slate-50/80 border border-slate-200/70 hover:border-emerald-300 rounded-2xl p-4.5 transition-all space-y-2 relative group">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          {q.institution}
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{q.level}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                          Tahun Lulus: {q.year}
                        </span>
                        <button 
                          onClick={() => setQualifications(qualifications.filter(item => item.id !== q.id))} 
                          className="text-slate-400 hover:text-rose-600 p-1 transition opacity-70 group-hover:opacity-100"
                          title="Hapus Pendidikan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {q.ipk && (
                      <div className="pt-1 flex items-center gap-2">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                          IPK: {q.ipk}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 3: SKILL & KEAHLIAN
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Code className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Skill &amp; Keahlian</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Keahlian teknis dan kompetensi utama Anda</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSection('skills')}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Kelola Skill
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {skills.map(sk => (
                  <span 
                    key={sk} 
                    className="bg-slate-50 hover:bg-blue-50/60 text-slate-800 border border-slate-200/90 hover:border-blue-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition hover:scale-105"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{sk}</span>
                    <button 
                      onClick={() => handleRemoveSkill(sk)} 
                      className="text-slate-400 hover:text-rose-600 transition ml-0.5 cursor-pointer"
                      title="Hapus Skill"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 4: PENGALAMAN
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Briefcase className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Pengalaman Kerja &amp; Organisasi</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Riwayat pekerjaan, magang, dan kegiatan organisasi</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSection('experience')}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Pengalaman
                </button>
              </div>

              <div className="space-y-4">
                {experiences.map(exp => (
                  <div key={exp.id} className="bg-slate-50/80 border border-slate-200/70 hover:border-amber-300 rounded-2xl p-4.5 space-y-2 relative transition-all border-l-4 border-l-amber-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{exp.position}</h4>
                        <div className="text-xs font-bold text-amber-700 flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5" /> {exp.company}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                          {exp.period}
                        </span>
                        <button 
                          onClick={() => handleRemoveExperience(exp.id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                          title="Hapus Pengalaman"
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
                SEKSI 5: SERTIFIKAT & LISENSI
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Sertifikat &amp; Lisensi</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Sertifikat kompetensi, keahlian profesi, dan lisensi resmi</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSection('certificate')}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Sertifikat
                </button>
              </div>

              <div className="space-y-3.5">
                {certificates.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Belum ada sertifikat yang ditambahkan.</p>
                ) : (
                  certificates.map(cert => (
                    <div key={cert.id} className="bg-slate-50/80 border border-slate-200/70 hover:border-rose-300 rounded-2xl p-4.5 flex items-center justify-between transition-all">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{cert.name}</h4>
                        <div className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-rose-600" /> Penerbit: {cert.issuer || 'Lembaga Sertifikasi'}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">Tahun Perolehan: {cert.year}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveCertificate(cert.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="Hapus Sertifikat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 6: BAHASA
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    <Languages className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Bahasa</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Kemampuan dan penguasaan bahasa komunikasi</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSection('languages')}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Bahasa
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {languagesList.map(lang => (
                  <div key={lang.id} className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm">{lang.name}</div>
                      <div className="text-[11px] text-teal-700 font-bold mt-0.5">{lang.level}</div>
                    </div>
                    <button 
                      onClick={() => setLanguagesList(languagesList.filter(l => l.id !== lang.id))}
                      className="text-slate-400 hover:text-rose-600 transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 7: PREFERENSI KARIR
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0077C6]/10 text-[#0077C6] flex items-center justify-center font-bold">
                    <Briefcase className="w-5 h-5 text-[#0077C6]" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Preferensi Karir</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Kriteria pekerjaan dan penempatan yang dicari</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingSection('career')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-500" /> Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1">
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">JENIS KESEMPATAN</div>
                  <div className="font-bold text-slate-900 text-sm">{opportunityType}</div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1">
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">TANGGAL SIAP KERJA</div>
                  <div className="font-bold text-slate-900 text-sm">{opportunityStartDate}</div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1">
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">INDUSTRI YANG DIMINATI</div>
                  <div className="font-bold text-slate-900 text-sm">{industries}</div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1">
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">LOKASI KERJA IMPIAN</div>
                  <div className="font-bold text-slate-900 text-sm">{locations}</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SUB-TAB B: MY BOOKMARKS */}
        {subTab === 'bookmarks' && (() => {
          const savedJobs = getValidSavedJobs();

          return (
            <div className="w-full space-y-5 animate-fadeIn max-w-4xl mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Lowongan Pekerjaan Tersimpan ({savedJobs.length})</h3>
                  <p className="text-xs text-slate-500 font-medium">Klik pada lowongan untuk melihat detail &amp; pengajuan lamaran</p>
                </div>
              </div>

              {savedJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedJobs.map((job: any) => (
                    <div 
                      key={job.id} 
                      onClick={() => onSelectJob && onSelectJob(job)}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex justify-between items-start cursor-pointer group hover:border-[#0077C6]/50"
                    >
                      <div className="space-y-2.5 min-w-0 pr-3">
                        <span className="text-xs font-bold text-orange-600 uppercase tracking-wide block truncate">{job.namaInstansi}</span>
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
                          className="bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg border border-slate-200 transition text-xs font-semibold cursor-pointer"
                          title="Hapus dari Simpanan"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-[#0077C6] rounded-full flex items-center justify-center mx-auto">
                    <Bookmark className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-lg">Belum Ada Lowongan Tersimpan</h4>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    Saat Anda menekan ikon bookmark pada lowongan pekerjaan di menu pencarian, lowongan tersebut akan tersimpan di sini.
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* SUB-TAB C: MY ACCOUNT */}
        {subTab === 'account' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs max-w-xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#0077C6]/10 text-[#0077C6] flex items-center justify-center font-bold">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Pengaturan Akun</h3>
                <p className="text-xs text-slate-500 font-medium">Informasi kredensial dan keamanan akun pengguna</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Alamat Email Terdaftar</label>
                <input type="email" value={user.email} disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-semibold" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Peran Akun Pengguna</label>
                <input type="text" value="Mahasiswa / Alumni UMK (Terverifikasi)" disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-emerald-700 font-bold" />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. MODALS DISPATCHER (POLISHED EXPERT STYLING) */}

      {/* MODAL EDIT INFO UTAMA (STATUS, NAMA, UNIVERSITAS) */}
      {editingSection === 'headerInfo' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Edit Info Utama Profil</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const updatedNim = userStatusType === 'Mahasiswa' ? nim : '';
              saveProfileData({ 
                nama: `${firstName} ${lastName}`.trim(),
                userStatusType: userStatusType,
                nim: updatedNim
              });
              if (userStatusType !== 'Mahasiswa') setNim('');
              setEditingSection(null);
              triggerToast('Info utama profil berhasil diperbarui!');
            }} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Keanggotaan</label>
                <select 
                  value={userStatusType} 
                  onChange={e => setUserStatusType(e.target.value as 'Mahasiswa' | 'Alumni' | 'Job Seeker')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white font-bold"
                >
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Job Seeker">Job Seeker</option>
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" 
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Belakang</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" 
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" 
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50">Batal</button>
                <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs transition">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* MODAL TENTANG SAYA (BIO) */}
      {editingSection === 'aboutMe' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Edit Tentang Saya (Bio)</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Ringkasan Bio / Profil Profesional</label>
              <textarea 
                rows={5}
                value={aboutMe}
                onChange={e => setAboutMe(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20"
                placeholder="Tuliskan deskripsi singkat mengenai latar belakang, passion, dan tujuan karir Anda..."
              />
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => setEditingSection(null)} className="px-4 py-2 text-xs font-bold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50">Batal</button>
                <button onClick={() => { saveProfileData({ aboutMe }); setEditingSection(null); triggerToast('Bio berhasil diperbarui!'); }} className="px-5 py-2 text-xs font-bold text-white bg-[#0077C6] hover:bg-blue-700 rounded-xl shadow-xs transition">Simpan Bio</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DATA PRIBADI */}
      {editingSection === 'personal' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Edit Data Pribadi</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileSection} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Depan *</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Belakang</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
                </div>
              </div>

              <div className={userStatusType === 'Mahasiswa' ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "block"}>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email / Kontak</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
                </div>
                {userStatusType === 'Mahasiswa' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">NIM (Nomor Induk Mahasiswa)</label>
                    <input type="text" value={nim} onChange={e => setNim(e.target.value)} placeholder="Contoh: 202101001" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 font-mono" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. Telepon / WhatsApp</label>
                  <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white">
                    <option value="Male">Laki-Laki</option>
                    <option value="Female">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kewarganegaraan</label>
                  <input type="text" value={nationality} onChange={e => setNationality(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hak Kerja</label>
                  <input type="text" value={workRights} onChange={e => setWorkRights(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">Batal</button>
                <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-xs transition">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PENDIDIKAN */}
      {editingSection === 'education' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Tambah Pendidikan</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddQualification} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Institusi / Universitas / Sekolah</label>
                <input type="text" required placeholder="Contoh: Universitas Muhammadiyah Kendari" value={newInst} onChange={e => setNewInst(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Jenjang &amp; Program Studi / Jurusan</label>
                <input type="text" required placeholder="Contoh: S1 - Teknik Informatika" value={newLevel} onChange={e => setNewLevel(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tahun Lulus</label>
                <input type="text" placeholder="Contoh: 2026" value={newYear} onChange={e => setNewYear(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  IPK / Nilai Akhir <span className="text-slate-400 font-normal">(Opsional - Khusus Perguruan Tinggi)</span>
                </label>
                <input 
                  type="text" 
                  placeholder="Contoh: 3.85 / 4.00 atau 3.85 (Kosongkan jika SD - SMA)" 
                  value={newIpk} 
                  onChange={e => setNewIpk(e.target.value)} 
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" 
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">Batal</button>
                <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-xs transition">Tambah</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KELOLA SKILL */}
      {editingSection === 'skills' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Kelola Skill &amp; Keahlian</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ketik skill baru (misal: React, Python)..." 
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20"
              />
              <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition shadow-xs">
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </form>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-500">Daftar Skill Saat Ini:</div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                {skills.map(sk => (
                  <span key={sk} className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                    <span>{sk}</span>
                    <button onClick={() => handleRemoveSkill(sk)} className="text-blue-400 hover:text-rose-600 transition cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100">
              <button onClick={() => setEditingSection(null)} className="bg-slate-900 text-white font-bold px-6 py-2 rounded-xl text-xs cursor-pointer">Selesai</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENGALAMAN */}
      {editingSection === 'experience' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Tambah Pengalaman Kerja / Organisasi</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddExperience} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Posisi / Jabatan *</label>
                <input type="text" required placeholder="Contoh: Web Developer Intern" value={newExpPos} onChange={e => setNewExpPos(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Perusahaan / Organisasi *</label>
                <input type="text" required placeholder="Contoh: PT Go Digital Kendari" value={newExpComp} onChange={e => setNewExpComp(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Periode</label>
                <input type="text" placeholder="Contoh: Jan 2026 - Sekarang" value={newExpPeriod} onChange={e => setNewExpPeriod(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Tugas / Pencapaian</label>
                <textarea rows={3} placeholder="Tuliskan gambaran singkat tanggung jawab Anda..." value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">Batal</button>
                <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-xs transition">Tambah</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SERTIFIKAT */}
      {editingSection === 'certificate' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Tambah Sertifikat &amp; Lisensi</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCertificate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Sertifikat / Pelatihan *</label>
                <input type="text" required placeholder="Contoh: Sertifikat Kompetensi Fullstack Web Developer - BNSP" value={newCertName} onChange={e => setNewCertName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Penerbit / Lembaga Sertifikasi</label>
                <input type="text" placeholder="Contoh: BNSP / Google / Dicoding" value={newCertIssuer} onChange={e => setNewCertIssuer(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tahun Perolehan</label>
                <input type="text" placeholder="Contoh: 2025" value={newCertYear} onChange={e => setNewCertYear(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">Batal</button>
                <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-xs transition">Tambah Sertifikat</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BAHASA */}
      {editingSection === 'languages' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Tambah Kemampuan Bahasa</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLanguage} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Bahasa *</label>
                <input type="text" required placeholder="Contoh: Bahasa Jepang / Bahasa Mandarin" value={newLangName} onChange={e => setNewLangName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tingkat Kemampuan</label>
                <select value={newLangLevel} onChange={e => setNewLangLevel(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white">
                  <option value="Fasih / Native">Fasih / Native</option>
                  <option value="Tingkat Lanjut / Advanced">Tingkat Lanjut / Advanced</option>
                  <option value="Menengah / Intermediate">Menengah / Intermediate</option>
                  <option value="Dasar / Elementary">Dasar / Elementary</option>
                </select>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">Batal</button>
                <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl shadow-xs transition">Tambah</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREFERENSI KARIR */}
      {editingSection === 'career' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Edit Preferensi Karir</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfileSection} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Jenis Kesempatan</label>
                <input type="text" value={opportunityType} onChange={e => setOpportunityType(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Siap Kerja</label>
                <input type="text" value={opportunityStartDate} onChange={e => setOpportunityStartDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Industri Yang Diminati</label>
                <input type="text" value={industries} onChange={e => setIndustries(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Lokasi Kerja Impian</label>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer">Batal</button>
                <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl text-xs transition shadow-xs cursor-pointer active:scale-95">Simpan Perubahan</button>
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
