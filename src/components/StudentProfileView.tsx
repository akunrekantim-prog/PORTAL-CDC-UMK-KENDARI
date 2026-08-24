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
  TrendingUp,
  AlertCircle,
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

  React.useEffect(() => {
    if (mahasiswaData) {
      const names = (mahasiswaData.nama || user.name).split(' ');
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
      if (mahasiswaData.email !== undefined) setEmail(mahasiswaData.email);
      if (mahasiswaData.nim !== undefined) setNim(mahasiswaData.nim);
      if (mahasiswaData.phone !== undefined) setMobile(mahasiswaData.phone);
      if (mahasiswaData.aboutMe !== undefined) setAboutMe(mahasiswaData.aboutMe);
      if (mahasiswaData.userStatusType) setUserStatusType(mahasiswaData.userStatusType);
      if (mahasiswaData.qualifications !== undefined) setQualifications(mahasiswaData.qualifications);
      if (mahasiswaData.skills !== undefined) setSkills(mahasiswaData.skills);
      if (mahasiswaData.experiences !== undefined) setExperiences(mahasiswaData.experiences);
      if (mahasiswaData.certificates !== undefined) setCertificates(mahasiswaData.certificates);
      if (mahasiswaData.languages !== undefined) setLanguagesList(mahasiswaData.languages);
      if (mahasiswaData.university !== undefined) setUniversity(mahasiswaData.university);
      if (mahasiswaData.nationality !== undefined) setNationality(mahasiswaData.nationality);
      if (mahasiswaData.gender !== undefined) setGender(mahasiswaData.gender);
      if (mahasiswaData.workRights !== undefined) setWorkRights(mahasiswaData.workRights);
      if (mahasiswaData.opportunityType !== undefined) setOpportunityType(mahasiswaData.opportunityType);
      if (mahasiswaData.preferredStartDate !== undefined) setOpportunityStartDate(mahasiswaData.preferredStartDate);
      if (mahasiswaData.industries !== undefined) setIndustries(mahasiswaData.industries);
      if (mahasiswaData.locations !== undefined) setLocations(mahasiswaData.locations);
    }
  }, [mahasiswaData, user.name]);

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
  const [email, setEmail] = useState(mahasiswaData?.email || user.email || '');
  const [nim, setNim] = useState(mahasiswaData?.nim || '');
  const [mobile, setMobile] = useState(mahasiswaData?.phone || user.phone || '');
  const [nationality, setNationality] = useState(mahasiswaData?.nationality || 'Indonesian');
  const [countryOfResidence, setCountryOfResidence] = useState('Indonesia');
  const [university, setUniversity] = useState(mahasiswaData?.university || 'Universitas Muhammadiyah Kendari');
  const [aboutMe, setAboutMe] = useState(mahasiswaData?.aboutMe || '');

  const [userStatusType, setUserStatusType] = useState<'Mahasiswa' | 'Alumni' | 'Job Seeker'>(
    mahasiswaData?.userStatusType || (user.role === 'alumni' ? 'Alumni' : user.role === 'job_seeker' ? 'Job Seeker' : 'Mahasiswa')
  );

  // Career preferences
  const [opportunityType, setOpportunityType] = useState(mahasiswaData?.opportunityType || '');
  const [opportunityStartDate, setOpportunityStartDate] = useState(mahasiswaData?.preferredStartDate || '');
  const [industries, setIndustries] = useState(mahasiswaData?.industries || '');
  const [locations, setLocations] = useState(mahasiswaData?.locations || '');

  // High school states
  const [hsGradYear, setHsGradYear] = useState(mahasiswaData?.graduationYear || '');
  const [hsCountry, setHsCountry] = useState(mahasiswaData?.nationality || 'Indonesia');
  const [hsName, setHsName] = useState('');
  const [hsSubjects, setHsSubjects] = useState('');

  // Extra info states
  const [workRights, setWorkRights] = useState(mahasiswaData?.workRights || 'Indonesia / WNI (Warga Negara Indonesia)');
  const [gender, setGender] = useState(mahasiswaData?.gender || '');
  const [sendOpportunities, setSendOpportunities] = useState(mahasiswaData?.sendOpportunities || '');
  const [cvName, setCvName] = useState(mahasiswaData?.cvName || '');

  // Qualification State (Pendidikan)
  const [qualifications, setQualifications] = useState(() => mahasiswaData?.qualifications || []);
  const [newInst, setNewInst] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newIpk, setNewIpk] = useState('');

  // Skills State
  const [skills, setSkills] = useState<string[]>(() => mahasiswaData?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Experiences State
  const [experiences, setExperiences] = useState(() => mahasiswaData?.experiences || []);
  const [newExpPos, setNewExpPos] = useState('');
  const [newExpComp, setNewExpComp] = useState('');
  const [newExpPeriod, setNewExpPeriod] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');

  // Certificates State
  const [certificates, setCertificates] = useState(() => mahasiswaData?.certificates || []);
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertYear, setNewCertYear] = useState('');

  // Languages State
  const [languagesList, setLanguagesList] = useState(() => mahasiswaData?.languages || []);
  const [newLangName, setNewLangName] = useState('');
  const [newLangLevel, setNewLangLevel] = useState('Fasih / Native');

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const saveProfileData = (partial: Partial<Mahasiswa>) => {
    const updated = updateUserProfile(user.id, {
      nama: partial.nama !== undefined ? partial.nama : `${firstName} ${lastName}`.trim(),
      nim: partial.nim !== undefined ? partial.nim : nim,
      email: partial.email !== undefined ? partial.email : email,
      phone: partial.phone !== undefined ? partial.phone : mobile,
      nationality: partial.nationality !== undefined ? partial.nationality : nationality,
      opportunityType: partial.opportunityType !== undefined ? partial.opportunityType : opportunityType,
      preferredStartDate: partial.preferredStartDate !== undefined ? partial.preferredStartDate : opportunityStartDate,
      aboutMe: partial.aboutMe !== undefined ? partial.aboutMe : aboutMe,
      userStatusType: partial.userStatusType !== undefined ? partial.userStatusType : userStatusType,
      qualifications: partial.qualifications !== undefined ? partial.qualifications : qualifications,
      skills: partial.skills !== undefined ? partial.skills : skills,
      experiences: partial.experiences !== undefined ? partial.experiences : experiences,
      certificates: partial.certificates !== undefined ? partial.certificates : certificates,
      languages: partial.languages !== undefined ? partial.languages : languagesList,
      gender: partial.gender !== undefined ? partial.gender : gender,
      workRights: partial.workRights !== undefined ? partial.workRights : workRights,
      industries: partial.industries !== undefined ? partial.industries : industries,
      locations: partial.locations !== undefined ? partial.locations : locations,
      university: partial.university !== undefined ? partial.university : university,
      ...partial
    });
    if (onProfileUpdated) onProfileUpdated();
    return updated;
  };

  const handleSaveProfileSection = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: Partial<Mahasiswa> = {
      nama: `${firstName} ${lastName}`.trim(),
      nim: userStatusType === 'Mahasiswa' ? nim : '',
      email,
      phone: mobile,
      nationality,
      opportunityType,
      preferredStartDate: opportunityStartDate,
      qualifications,
      skills,
      experiences,
      certificates,
      languages: languagesList,
      gender,
      workRights,
      industries,
      locations,
      university
    };

    saveProfileData(updatedProfile);
    setEditingSection(null);
    triggerToast('Profil berhasil diperbarui!');
  };

  // Add Skill Handler
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (trimmed) {
      const nextSkills = skills.includes(trimmed) ? skills : [...skills, trimmed];
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
    if (newExpPos.trim() && newExpComp.trim()) {
      const nextExp = [
        ...experiences,
        {
          id: Date.now().toString(),
          position: newExpPos.trim(),
          company: newExpComp.trim(),
          period: newExpPeriod.trim() || '2026',
          description: newExpDesc.trim() || '-'
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
    if (newCertName.trim()) {
      const nextCerts = [
        ...certificates,
        {
          id: Date.now().toString(),
          name: newCertName.trim(),
          issuer: newCertIssuer.trim() || 'Lembaga Sertifikasi',
          year: newCertYear.trim() || '2026'
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
    if (newLangName.trim()) {
      const nextLang = [
        ...languagesList,
        {
          id: Date.now().toString(),
          name: newLangName.trim(),
          level: newLangLevel
        }
      ];
      setLanguagesList(nextLang);
      setNewLangName('');
      setEditingSection(null);
      saveProfileData({ languages: nextLang });
      triggerToast('Bahasa baru berhasil ditambahkan!');
    }
  };

  const handleRemoveLanguage = (langId: string) => {
    const nextLang = languagesList.filter(l => l.id !== langId);
    setLanguagesList(nextLang);
    saveProfileData({ languages: nextLang });
    triggerToast('Bahasa berhasil dihapus');
  };

  // Add Qualification Handler
  const handleAddQualification = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInst.trim() && newLevel.trim()) {
      const nextQual = [
        ...qualifications,
        {
          id: Date.now().toString(),
          institution: newInst.trim(),
          level: newLevel.trim(),
          year: newYear.trim() || '2026',
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

  const handleRemoveQualification = (qualId: string) => {
    const nextQual = qualifications.filter(item => item.id !== qualId);
    setQualifications(nextQual);
    saveProfileData({ qualifications: nextQual });
    triggerToast('Riwayat pendidikan berhasil dihapus');
  };

  // Profile completion calculation system (9 dynamic weighted criteria)
  const isPhotoCompleted = Boolean(avatarUrl && avatarUrl.trim() !== '');
  const isPersonalCompleted = Boolean(
    firstName.trim() !== '' &&
    email.trim() !== '' &&
    mobile.trim() !== '' &&
    (userStatusType !== 'Mahasiswa' || (nim && nim.trim() !== ''))
  );
  const isBioCompleted = Boolean(aboutMe && aboutMe.trim().length >= 15);
  const isEducationCompleted = qualifications.length > 0;
  const isSkillsCompleted = skills.length > 0;
  const isExperienceCompleted = experiences.length > 0;
  const isCertificateCompleted = certificates.length > 0;
  const isLanguageCompleted = languagesList.length > 0;
  const isCareerCompleted = Boolean(
    opportunityType && opportunityType.trim() !== '' &&
    industries && industries.trim() !== '' &&
    locations && locations.trim() !== ''
  );

  const checklistItems = [
    {
      id: 'photo',
      label: 'Foto Profil',
      isCompleted: isPhotoCompleted,
      weight: 10,
      detail: isPhotoCompleted ? 'Foto Terpasang' : 'Belum Ada Foto',
      action: () => fileInputRef.current?.click(),
      actionLabel: 'Unggah Foto'
    },
    {
      id: 'personal',
      label: 'Data Pribadi',
      isCompleted: isPersonalCompleted,
      weight: 20,
      detail: isPersonalCompleted ? 'Identitas Lengkap' : 'Belum Lengkap',
      action: () => setEditingSection('personal'),
      actionLabel: 'Lengkapi Data'
    },
    {
      id: 'aboutMe',
      label: 'Tentang Saya',
      isCompleted: isBioCompleted,
      weight: 10,
      detail: isBioCompleted ? 'Bio Terisi' : 'Belum Diisi',
      action: () => setEditingSection('aboutMe'),
      actionLabel: 'Tulis Bio'
    },
    {
      id: 'education',
      label: `Pendidikan (${qualifications.length})`,
      isCompleted: isEducationCompleted,
      weight: 15,
      detail: qualifications.length > 0 ? `${qualifications.length} Riwayat` : 'Belum Ada',
      action: () => setEditingSection('education'),
      actionLabel: 'Tambah Pendidikan'
    },
    {
      id: 'skills',
      label: `Skill (${skills.length})`,
      isCompleted: isSkillsCompleted,
      weight: 15,
      detail: skills.length > 0 ? `${skills.length} Keahlian` : 'Belum Ada',
      action: () => setEditingSection('skills'),
      actionLabel: 'Kelola Skill'
    },
    {
      id: 'experience',
      label: `Pengalaman (${experiences.length})`,
      isCompleted: isExperienceCompleted,
      weight: 10,
      detail: experiences.length > 0 ? `${experiences.length} Pengalaman` : 'Belum Ada',
      action: () => setEditingSection('experience'),
      actionLabel: 'Tambah Pengalaman'
    },
    {
      id: 'certificate',
      label: `Sertifikat (${certificates.length})`,
      isCompleted: isCertificateCompleted,
      weight: 10,
      detail: certificates.length > 0 ? `${certificates.length} Sertifikat` : 'Belum Ada',
      action: () => setEditingSection('certificate'),
      actionLabel: 'Tambah Sertifikat'
    },
    {
      id: 'languages',
      label: `Bahasa (${languagesList.length})`,
      isCompleted: isLanguageCompleted,
      weight: 5,
      detail: languagesList.length > 0 ? `${languagesList.length} Bahasa` : 'Belum Ada',
      action: () => setEditingSection('languages'),
      actionLabel: 'Tambah Bahasa'
    },
    {
      id: 'career',
      label: 'Preferensi Karir',
      isCompleted: isCareerCompleted,
      weight: 5,
      detail: isCareerCompleted ? 'Terisi' : 'Belum Diisi',
      action: () => setEditingSection('career'),
      actionLabel: 'Atur Preferensi'
    }
  ];

  const completionPercent = checklistItems.reduce(
    (acc, item) => (item.isCompleted ? acc + item.weight : acc),
    0
  );
  const completedCount = checklistItems.filter(i => i.isCompleted).length;

  return (
    <div className="bg-slate-50/50 min-h-screen font-sans" id="prosple-student-profile-view">

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-50 text-emerald-800 px-5 py-3 rounded-2xl shadow-lg border border-emerald-200 flex items-center gap-3 animate-fadeIn text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. HEADER HERO SECTION (INSTITUTIONAL GRADE UI) */}
      <div className="bg-[#0b132b] text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 relative shadow-lg border-b border-slate-800">
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
                <span className="text-xs font-bold uppercase tracking-wider">Ubah Foto</span>
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
                className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold px-3.5 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md uppercase tracking-wider flex items-center gap-1.5 transition group cursor-pointer"
                title="Klik untuk ubah status (Mahasiswa / Alumni / Job Seeker)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{userStatusType}</span>
                <Pencil className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </button>

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
            <div className="pt-3 border-t border-slate-800/80 mt-3 space-y-1.5 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/60">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="uppercase tracking-wider text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-400" /> TENTANG SAYA
                </span>
                <button
                  onClick={() => setEditingSection('aboutMe')}
                  className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-semibold text-xs cursor-pointer"
                >
                  {aboutMe ? 'Edit Bio' : '+ Tulis Bio'} <Pencil className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-2xl whitespace-pre-line">
                {aboutMe || <span className="italic text-slate-400">Belum ada deskripsi profil atau bio yang ditulis. Klik &quot;+ Tulis Bio&quot; untuk memperkenalkan diri Anda.</span>}
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
            className={`py-3.5 px-3 transition-all flex items-center gap-2 relative ${subTab === 'profile'
              ? 'text-[#0077C6] font-bold border-b-2 border-[#0077C6]'
              : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profil Saya</span>
          </button>

          <button
            onClick={() => setSubTab('bookmarks')}
            className={`py-3.5 px-3 transition-all flex items-center gap-2 relative ${subTab === 'bookmarks'
              ? 'text-[#0077C6] font-bold border-b-2 border-[#0077C6]'
              : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Lowongan Tersimpan</span>
            {(() => {
              try {
                const validSaved = getValidSavedJobs(user.id);
                if (validSaved.length > 0) {
                  return (
                    <span className="bg-blue-100 text-[#0077C6] text-xs font-bold px-2 py-0.5 rounded-full ml-0.5">
                      {validSaved.length}
                    </span>
                  );
                }
              } catch { }
              return null;
            })()}
          </button>

          <button
            onClick={() => setSubTab('account')}
            className={`py-3.5 px-3 transition-all flex items-center gap-2 relative ${subTab === 'account'
              ? 'text-[#0077C6] font-bold border-b-2 border-[#0077C6]'
              : 'text-slate-600 hover:text-slate-900 font-medium'
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

            {/* KELENGKAPAN PROFIL PROGRESS CARD (DYNAMIC & CLEAN DESIGN) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 hover:border-slate-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0055D4] flex items-center justify-center font-bold shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#0055D4]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">SKOR KELENGKAPAN PROFIL</h4>
                      <span className="text-xs text-slate-500 font-medium">({completedCount}/{checklistItems.length} Lengkap)</span>
                    </div>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">Profil yang terisi lengkap memaksimalkan peluang lolos seleksi berkas Mitra UMK</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`font-bold px-3.5 py-1.5 rounded-full text-xs border shadow-2xs ${completionPercent >= 80
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : completionPercent >= 50
                      ? 'bg-blue-50 text-[#0055D4] border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    {completionPercent}% Selesai
                  </span>
                </div>
              </div>

              {/* Dynamic Animated Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${completionPercent >= 80
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                      : completionPercent >= 50
                        ? 'bg-gradient-to-r from-blue-500 to-[#0077C6]'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                    style={{ width: `${Math.max(completionPercent, 4)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                  <span>
                    {completionPercent >= 80
                      ? 'Profil siap untuk diajukan melamar pekerjaan & magang resmi.'
                      : completionPercent >= 50
                        ? 'Profil cukup lengkap, lengkapi bagian yang tersisa untuk hasil optimal.'
                        : 'Lengkapi seluruh bagian agar berkas lamaran Anda memenuhi syarat mitra.'}
                  </span>
                  <span className="font-bold text-slate-700">{completionPercent}/100</span>
                </div>
              </div>

              {/* Dynamic Interactive Checklist Badges */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                {checklistItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${item.isCompleted
                      ? 'text-emerald-800 bg-emerald-50/90 border-emerald-200 hover:bg-emerald-100/80 hover:border-emerald-300'
                      : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-blue-50 hover:text-[#0055D4] hover:border-blue-300'
                      }`}
                    title={item.isCompleted ? `${item.label}: Lengkap (${item.detail}) - Klik untuk perbarui` : `${item.label}: Belum Lengkap - Klik untuk ${item.actionLabel.toLowerCase()}`}
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span>{item.label}</span>
                    {!item.isCompleted && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-800 ml-0.5">
                        + Lengkapi
                      </span>
                    )}
                  </button>
                ))}
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
                    <h3 className="text-base font-bold text-slate-900">Data Pribadi</h3>
                    <p className="text-xs text-slate-500 font-normal">Informasi identitas resmi pelamar</p>
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
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">NAMA LENGKAP</div>
                  <div className="font-bold text-slate-900 text-sm truncate">{`${firstName} ${lastName}`.trim() || 'Belum Diisi'}</div>
                </div>

                {userStatusType === 'Mahasiswa' && (
                  <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-2xs transition">
                    <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">NIM (NOMOR INDUK MAHASISWA)</div>
                    <div className="font-bold text-slate-900 text-sm">{nim || 'Belum Diisi'}</div>
                  </div>
                )}

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-2xs transition">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">EMAIL</div>
                  <div className="font-bold text-slate-900 text-sm truncate">{email || user.email}</div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-2xs transition">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">NO. TELEPON / WHATSAPP</div>
                  <div className="font-bold text-slate-900 text-sm">{mobile || 'Belum Diisi'}</div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-2xs transition">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">JENIS KELAMIN</div>
                  <div className="font-bold text-slate-900 text-sm">{gender === 'Male' ? 'Laki-Laki' : gender === 'Female' ? 'Perempuan' : (gender || 'Belum Diisi')}</div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-2xs transition">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">KEWARGANEGARAAN</div>
                  <div className="font-bold text-slate-900 text-sm">{nationality || 'Indonesian'}</div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-2xs transition">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">HAK KERJA</div>
                  <div className="font-bold text-slate-900 text-sm">{workRights || 'Belum Diisi'}</div>
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
                    <h3 className="text-base font-bold text-slate-900">Pendidikan</h3>
                    <p className="text-xs text-slate-500 font-normal">Riwayat studi perguruan tinggi dan sekolah</p>
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
                {qualifications.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Belum ada riwayat pendidikan yang ditambahkan.</p>
                ) : (
                  qualifications.map(q => (
                    <div key={q.id} className="bg-slate-50/80 border border-slate-200/70 hover:border-emerald-300 rounded-2xl p-4.5 transition-all space-y-2 relative group">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                            {q.institution}
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">{q.level}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                            Tahun Lulus: {q.year}
                          </span>
                          <button
                            onClick={() => handleRemoveQualification(q.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition opacity-70 group-hover:opacity-100 cursor-pointer"
                            title="Hapus Pendidikan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {q.ipk && (
                        <div className="pt-1 flex items-center gap-2">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            IPK: {q.ipk}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
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
                    <h3 className="text-base font-bold text-slate-900">Skill &amp; Keahlian</h3>
                    <p className="text-xs text-slate-500 font-normal">Keahlian teknis dan kompetensi utama Anda</p>
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
                {skills.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Belum ada skill yang ditambahkan.</p>
                ) : (
                  skills.map(sk => (
                    <span
                      key={sk}
                      className="bg-slate-100 text-slate-800 border border-slate-200/90 hover:border-blue-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition"
                    >
                      <span>{sk}</span>
                      <button
                        onClick={() => handleRemoveSkill(sk)}
                        className="text-slate-400 hover:text-rose-600 transition ml-0.5 cursor-pointer"
                        title="Hapus Skill"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
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
                    <h3 className="text-base font-bold text-slate-900">Pengalaman Kerja &amp; Organisasi</h3>
                    <p className="text-xs text-slate-500 font-normal">Riwayat pekerjaan, magang, dan kegiatan organisasi</p>
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
                {experiences.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Belum ada pengalaman yang ditambahkan.</p>
                ) : (
                  experiences.map(exp => (
                    <div key={exp.id} className="bg-slate-50/80 border border-slate-200/70 hover:border-amber-300 rounded-2xl p-4.5 space-y-2 relative transition-all border-l-4 border-l-amber-500">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">{exp.position}</h4>
                          <div className="text-xs font-bold text-amber-700 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5" /> {exp.company}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                            {exp.period}
                          </span>
                          <button
                            onClick={() => handleRemoveExperience(exp.id)}
                            className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                            title="Hapus Pengalaman"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal pt-1">
                        {exp.description}
                      </p>
                    </div>
                  ))
                )}
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
                    <h3 className="text-base font-bold text-slate-900">Sertifikat &amp; Lisensi</h3>
                    <p className="text-xs text-slate-500 font-normal">Sertifikat kompetensi, keahlian profesi, dan lisensi resmi</p>
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
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{cert.name}</h4>
                        <div className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-rose-600" /> Penerbit: {cert.issuer || 'Lembaga Sertifikasi'}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">Tahun Perolehan: {cert.year}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveCertificate(cert.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
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
                    <h3 className="text-base font-bold text-slate-900">Bahasa</h3>
                    <p className="text-xs text-slate-500 font-normal">Kemampuan dan penguasaan bahasa komunikasi</p>
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
                {languagesList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic col-span-2">Belum ada bahasa yang ditambahkan.</p>
                ) : (
                  languagesList.map(lang => (
                    <div key={lang.id} className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{lang.name}</div>
                        <div className="text-xs text-teal-700 font-bold mt-0.5">{lang.level}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveLanguage(lang.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                        title="Hapus Bahasa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
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
                    <h3 className="text-base font-bold text-slate-900">Preferensi Karir</h3>
                    <p className="text-xs text-slate-500 font-normal">Kriteria pekerjaan dan penempatan yang dicari</p>
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
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">JENIS KESEMPATAN</div>
                  <div className="font-bold text-slate-900 text-sm">{opportunityType || 'Belum Diisi'}</div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">TANGGAL SIAP KERJA</div>
                  <div className="font-bold text-slate-900 text-sm">{opportunityStartDate || 'Belum Diisi'}</div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">INDUSTRI YANG DIMINATI</div>
                  <div className="font-bold text-slate-900 text-sm">{industries || 'Belum Diisi'}</div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">LOKASI KERJA IMPIAN</div>
                  <div className="font-bold text-slate-900 text-sm">{locations || 'Belum Diisi'}</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SUB-TAB B: MY BOOKMARKS */}
        {subTab === 'bookmarks' && (() => {
          const savedJobs = getValidSavedJobs(user.id);

          return (
            <div className="w-full space-y-5 animate-fadeIn max-w-4xl mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Lowongan Pekerjaan Tersimpan ({savedJobs.length})</h3>
                  <p className="text-xs text-slate-500 font-normal">Klik pada lowongan untuk melihat detail &amp; pengajuan lamaran</p>
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
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-[#0077C6] transition-colors leading-snug line-clamp-2">
                          {job.judul}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-normal">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.lokasi}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.tipe === 'magang' ? 'Magang' : 'Kerja'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full border border-emerald-200 shadow-2xs flex items-center gap-1.5">
                          <Bookmark className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                          <span>Tersimpan</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job.id, user.id);
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
                  <h4 className="font-bold text-slate-900 text-lg">Belum Ada Lowongan Tersimpan</h4>
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
                <h3 className="text-lg font-bold text-slate-900">Pengaturan Akun</h3>
                <p className="text-xs text-slate-500 font-normal">Informasi kredensial dan keamanan akun pengguna</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Alamat Email Terdaftar</label>
                <input type="email" value={user.email} disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Peran Akun Pengguna</label>
                <input type="text" value="Mahasiswa / Alumni UMK (Terverifikasi)" disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-emerald-700 font-bold text-xs sm:text-sm" />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. MODALS MANAGEMENT */}
      {/* MODAL EDIT INFO UTAMA */}
      {editingSection === 'headerInfo' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Info Utama</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfileSection} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Status Keanggotaan</label>
                <select
                  value={userStatusType}
                  onChange={e => setUserStatusType(e.target.value as 'Mahasiswa' | 'Alumni' | 'Job Seeker')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                >
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Job Seeker">Job Seeker</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Nama Depan *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Nama Belakang</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Nama Perguruan Tinggi / Universitas *</label>
                <input
                  type="text"
                  value={university}
                  onChange={e => setUniversity(e.target.value)}
                  required
                  placeholder="Contoh: Universitas Muhammadiyah Kendari"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer">Batal</button>
                <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs transition cursor-pointer">Simpan Perubahan</button>
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
              <h3 className="text-base font-bold text-slate-900">Edit Tentang Saya (Bio)</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Ringkasan Bio / Profil Profesional</label>
              <textarea
                rows={5}
                value={aboutMe}
                onChange={e => setAboutMe(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white leading-relaxed"
                placeholder="Tuliskan deskripsi singkat mengenai latar belakang, passion, dan tujuan karir Anda..."
              />
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => setEditingSection(null)} className="px-4 py-2.5 text-xs font-bold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer">Batal</button>
                <button onClick={() => { saveProfileData({ aboutMe }); setEditingSection(null); triggerToast('Bio berhasil diperbarui!'); }} className="px-5 py-2.5 text-xs font-bold text-white bg-[#0077C6] hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer">Simpan Bio</button>
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
              <h3 className="text-base font-bold text-slate-900">Edit Data Pribadi</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileSection} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Nama Depan *</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Nama Belakang</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
                </div>
              </div>

              <div className={userStatusType === 'Mahasiswa' ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "block"}>
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Email / Kontak</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
                </div>
                {userStatusType === 'Mahasiswa' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">NIM (Nomor Induk Mahasiswa)</label>
                    <input type="text" value={nim} onChange={e => setNim(e.target.value)} placeholder="Contoh: 202101001" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">No. Telepon / WhatsApp</label>
                  <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Jenis Kelamin</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white">
                    <option value="">-- Pilih Jenis Kelamin --</option>
                    <option value="Male">Laki-Laki</option>
                    <option value="Female">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Kewarganegaraan</label>
                  <input type="text" value={nationality} onChange={e => setNationality(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Hak Kerja</label>
                  <input type="text" value={workRights} onChange={e => setWorkRights(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer">Batal</button>
                <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs transition cursor-pointer">Simpan Perubahan</button>
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
              <h3 className="text-base font-bold text-slate-900">Tambah Pendidikan</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddQualification} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Nama Institusi / Universitas / Sekolah</label>
                <input type="text" required placeholder="Contoh: Universitas Muhammadiyah Kendari" value={newInst} onChange={e => setNewInst(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Jenjang &amp; Program Studi / Jurusan</label>
                <input type="text" required placeholder="Contoh: S1 - Teknik Informatika" value={newLevel} onChange={e => setNewLevel(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Tahun Lulus</label>
                <input type="text" placeholder="Contoh: 2026" value={newYear} onChange={e => setNewYear(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  IPK / Nilai Akhir <span className="text-slate-400 font-normal">(Opsional - Khusus Perguruan Tinggi)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 3.85 / 4.00 atau 3.85 (Kosongkan jika SD - SMA)"
                  value={newIpk}
                  onChange={e => setNewIpk(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer">Batal</button>
                <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs transition cursor-pointer">Tambah</button>
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
              <h3 className="text-base font-bold text-slate-900">Kelola Skill &amp; Keahlian</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik skill baru (misal: React, Python)..."
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
              />
              <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 transition shadow-xs cursor-pointer">
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
              <button onClick={() => setEditingSection(null)} className="bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer">Selesai</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENGALAMAN */}
      {editingSection === 'experience' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Tambah Pengalaman Kerja / Organisasi</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddExperience} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Posisi / Jabatan *</label>
                <input type="text" required placeholder="Contoh: Web Developer Intern" value={newExpPos} onChange={e => setNewExpPos(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Perusahaan / Organisasi *</label>
                <input type="text" required placeholder="Contoh: PT Go Digital Kendari" value={newExpComp} onChange={e => setNewExpComp(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Periode</label>
                <input type="text" placeholder="Contoh: Jan 2026 - Sekarang" value={newExpPeriod} onChange={e => setNewExpPeriod(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Deskripsi Tugas / Pencapaian</label>
                <textarea rows={3} placeholder="Tuliskan gambaran singkat tanggung jawab Anda..." value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white leading-relaxed" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer">Batal</button>
                <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs transition cursor-pointer">Tambah</button>
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
              <h3 className="text-base font-bold text-slate-900">Tambah Sertifikat &amp; Lisensi</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCertificate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Nama Sertifikat / Pelatihan *</label>
                <input type="text" required placeholder="Contoh: Sertifikat Kompetensi Fullstack Web Developer - BNSP" value={newCertName} onChange={e => setNewCertName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Penerbit / Lembaga Sertifikasi</label>
                <input type="text" placeholder="Contoh: BNSP / Google / Dicoding" value={newCertIssuer} onChange={e => setNewCertIssuer(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Tahun Perolehan</label>
                <input type="text" placeholder="Contoh: 2025" value={newCertYear} onChange={e => setNewCertYear(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer">Batal</button>
                <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs transition cursor-pointer">Tambah Sertifikat</button>
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
              <h3 className="text-base font-bold text-slate-900">Tambah Kemampuan Bahasa</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLanguage} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Nama Bahasa *</label>
                <input type="text" required placeholder="Contoh: Bahasa Jepang / Bahasa Mandarin" value={newLangName} onChange={e => setNewLangName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Tingkat Kemampuan</label>
                <select value={newLangLevel} onChange={e => setNewLangLevel(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white">
                  <option value="Fasih / Native">Fasih / Native</option>
                  <option value="Tingkat Lanjut / Advanced">Tingkat Lanjut / Advanced</option>
                  <option value="Menengah / Intermediate">Menengah / Intermediate</option>
                  <option value="Dasar / Elementary">Dasar / Elementary</option>
                </select>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer">Batal</button>
                <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-xs transition cursor-pointer">Tambah</button>
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
              <h3 className="text-base font-bold text-slate-900">Edit Preferensi Karir</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfileSection} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Jenis Kesempatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Internship, Placement, Full-time"
                  value={opportunityType}
                  onChange={e => setOpportunityType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Tanggal Siap Kerja</label>
                <input
                  type="text"
                  placeholder="Contoh: Segera / As soon as possible"
                  value={opportunityStartDate}
                  onChange={e => setOpportunityStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Industri Yang Diminati</label>
                <input
                  type="text"
                  placeholder="Contoh: IT, Perbankan, Pendidikan"
                  value={industries}
                  onChange={e => setIndustries(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Lokasi Kerja Impian</label>
                <input
                  type="text"
                  placeholder="Contoh: Kendari, Jakarta, Remote, Morowali"
                  value={locations}
                  onChange={e => setLocations(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer">Batal</button>
                <button type="submit" className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-xs cursor-pointer active:scale-95">Simpan Perubahan</button>
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
