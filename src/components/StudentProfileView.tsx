import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User as UserType,
  Mahasiswa
} from '../types';
import {
  updateUserProfile,
  updateInDB,
  getFromDB,
  getSavedJobIds,
  getValidSavedJobs,
  toggleSaveJob,
  DEFAULT_AVATAR_WA,
  getCleanPhotoUrl
} from '../data';
import { uploadProfilePhoto } from '../config/supabase';
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
    getCleanPhotoUrl(mahasiswaData?.photoUrl || user.photoUrl)
  );

  // Offset sticky sub-nav: diukur dari tumpukan header nyata (bar pratinjau peran +
  // header situs), bukan asumsi `top-16` (64px) yang membuat nav tertutup di mobile/iPad.
  const navRef = React.useRef<HTMLDivElement>(null);
  const [navOffset, setNavOffset] = useState(64);

  React.useEffect(() => {
    let frame = 0;
    const measure = () => {
      const nav = navRef.current;
      if (!nav) return;

      // Offset = batas bawah terjauh dari header sticky/fixed yang sedang menempel di atas.
      // Di app ini ada dua lapis: bar "Pratinjau peran" (z-120) + header situs (z-40).
      // Tingginya berubah saat teks wrap di layar sempit (108px di mobile, 53px di desktop),
      // jadi diukur, bukan di-hardcode.
      let bottom = 0;
      document.querySelectorAll<HTMLElement>('body *').forEach((el) => {
        if (nav.contains(el) || el.contains(nav)) return;
        const cs = window.getComputedStyle(el);
        if (cs.position !== 'sticky' && cs.position !== 'fixed') return;
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const r = el.getBoundingClientRect();
        // Hanya elemen selebar halaman yang menempel di tepi atas viewport.
        if (r.width < window.innerWidth * 0.6) return;
        if (r.height < 24 || r.height > 220) return;
        if (r.top > 2) return;
        bottom = Math.max(bottom, r.bottom);
      });

      setNavOffset(Math.max(48, Math.round(bottom)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => { frame = 0; measure(); });
    };

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', onScroll, { passive: true });
    const t = window.setTimeout(measure, 300); // ukur ulang setelah font/layout stabil
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(t);
    };
  }, []);

  React.useEffect(() => {
    if (mahasiswaData?.photoUrl) {
      setAvatarUrl(getCleanPhotoUrl(mahasiswaData.photoUrl));
    } else if (user.photoUrl) {
      setAvatarUrl(getCleanPhotoUrl(user.photoUrl));
    } else {
      setAvatarUrl(DEFAULT_AVATAR_WA);
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
      if (mahasiswaData.qualifications !== undefined) {
        setQualifications(mahasiswaData.qualifications);
        const q0 = mahasiswaData.qualifications[0];
        if (q0) {
          if (q0.institution) setNewInst(q0.institution);
          if (q0.level?.includes('-')) {
            setNewLevel(q0.level.split('-')[0].trim());
            setNewFieldOfStudy(q0.level.split('-').slice(1).join('-').trim());
          } else if (q0.level) {
            setNewLevel(q0.level);
          }
          if (q0.ipk) setNewIpk(q0.ipk);
        } else {
          setNewFieldOfStudy(mahasiswaData.programStudi || '');
        }
      }
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

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      triggerToast('Ukuran foto terlalu besar (maksimal 5MB)');
      return;
    }

    // Tampilkan preview lokal sementara (bukan base64 untuk DB, hanya untuk UI)
    const localPreview = URL.createObjectURL(file);
    setAvatarUrl(localPreview);
    setIsUploadingPhoto(true);

    try {
      // Upload ke Supabase Storage → dapat URL publik permanen
      const publicUrl = await uploadProfilePhoto(user.id, file);

      if (publicUrl) {
        // Simpan URL publik (bukan base64) ke DB — bisa diakses dari semua device
        await updateUserProfile(user.id, { photoUrl: publicUrl });
        setAvatarUrl(publicUrl);
        triggerToast('Foto profil berhasil diunggah dan tersinkronisasi ke semua perangkat!');
      } else {
        // Fallback: jika Supabase Storage tidak tersedia, tetap tampilkan preview lokal
        // tapi beri peringatan bahwa foto tidak akan sinkron ke device lain
        triggerToast('⚠️ Foto tampil di perangkat ini, tapi belum tersinkronisasi (storage tidak tersedia). Hubungi admin untuk setup Supabase Storage bucket "profile-photos".');
      }
    } catch (err: any) {
      triggerToast(err?.message || 'Gagal mengunggah foto profil. Silakan coba lagi.');
      setAvatarUrl(getCleanPhotoUrl(mahasiswaData?.photoUrl || user.photoUrl) || DEFAULT_AVATAR_WA);
    } finally {
      setIsUploadingPhoto(false);
      URL.revokeObjectURL(localPreview); // cleanup object URL
      if (onProfileUpdated) onProfileUpdated();
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

  const [userStatusType, setUserStatusType] = useState<'Mahasiswa' | 'Alumni'>(
    mahasiswaData?.userStatusType || ((user.role as string) === 'alumni' ? 'Alumni' : 'Mahasiswa')
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

  // State Pendidikan (CDC UI Style)
  const [qualifications, setQualifications] = useState(() => mahasiswaData?.qualifications || []);
  const [newInst, setNewInst] = useState(() => mahasiswaData?.university || 'Universitas Muhammadiyah Kendari');
  const [newLevel, setNewLevel] = useState(() => {
    const q0 = mahasiswaData?.qualifications?.[0];
    if (q0?.level?.includes('-')) return q0.level.split('-')[0].trim();
    return q0?.level || 'S1';
  });
  const [newFieldOfStudy, setNewFieldOfStudy] = useState(() => {
    const q0 = mahasiswaData?.qualifications?.[0];
    if (q0?.level?.includes('-')) return q0.level.split('-').slice(1).join('-').trim();
    return mahasiswaData?.programStudi || '';
  });
  const [newAdmissionMonth, setNewAdmissionMonth] = useState(() => {
    return mahasiswaData?.qualifications?.[0] ? 'Agustus' : '';
  });
  const [newAdmissionYear, setNewAdmissionYear] = useState(() => {
    return mahasiswaData?.angkatan || '';
  });
  const [isStillStudying, setIsStillStudying] = useState(true);
  const [newGraduationMonth, setNewGraduationMonth] = useState('');
  const [newGraduationYear, setNewGraduationYear] = useState(() => {
    return mahasiswaData?.graduationYear || '';
  });
  const [newIpk, setNewIpk] = useState(() => mahasiswaData?.qualifications?.[0]?.ipk || '');

  // Varian animasi untuk transisi kartu inline (CDC UI Style)
  const sectionVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] as const } }
  };

  // Buka seksi & gulir halus
  const handleOpenSection = (sectionId: string) => {
    setEditingSection(prev => prev === sectionId ? null : sectionId);
    setTimeout(() => {
      const el = document.getElementById(`section-${sectionId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Keahlian State
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

  const saveProfileData = async (partial: Partial<Mahasiswa>) => {
    // FIX Bug #3: deteksi apakah user login via token demo (fallback static) atau JWT asli
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('cdc_auth_token') : null;
    const isDemoMode = token && (token.startsWith('demo_token_') || token.startsWith('google_token_'));

    if (isDemoMode) {
      // Pada demo/Google token: tetap update MEMORY_DB lokal agar UX smooth,
      // tapi beri peringatan bahwa data TIDAK disinkronkan ke server database
      triggerToast('⚠️ Sesi demo aktif. Data tersimpan sementara di browser. Login ulang dengan akun resmi agar tersimpan ke database.');
      // Update lokal saja menggunakan static import (tanpa sync ke Supabase)
      try {
        const students = getFromDB<Mahasiswa>('mahasiswa');
        const student = students.find(s => s.userId === user.id);
        const mergedPartial = {
          nama: partial.nama !== undefined ? partial.nama : `${firstName} ${lastName}`.trim(),
          nim: partial.nim !== undefined ? partial.nim : nim,
          email: partial.email !== undefined ? partial.email : email,
          phone: partial.phone !== undefined ? partial.phone : mobile,
          aboutMe: partial.aboutMe !== undefined ? partial.aboutMe : aboutMe,
          ...partial
        };
        if (student) {
          updateInDB<Mahasiswa>('mahasiswa', { ...student, ...mergedPartial });
        }
      } catch { /* abaikan */ }
      if (onProfileUpdated) onProfileUpdated();
      return null;
    }

    try {
      const updated = await updateUserProfile(user.id, {
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
      // FIX Fase 5: refresh data dari server setelah berhasil simpan
      if (onProfileUpdated) onProfileUpdated();
      return updated;
    } catch (err: any) {
      // Tampilkan pesan error spesifik dari updateUserProfile (termasuk pesan 403/401)
      triggerToast(err?.message || 'Gagal menyimpan profil. Pastikan server aktif dan coba lagi.');
      return null;
    }
  };

  const handleSaveProfileSection = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: Partial<Mahasiswa> = {
      nama: `${firstName} ${lastName}`.trim(),
      nim: userStatusType === 'Mahasiswa' ? nim : '',
      userStatusType,
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

    await saveProfileData(updatedProfile);
    setEditingSection(null);
    triggerToast('Profil berhasil diperbarui!');
  };

  // Handler Tambah Keahlian
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (trimmed) {
      const nextSkills = skills.includes(trimmed) ? skills : [...skills, trimmed];
      setSkills(nextSkills);
      setNewSkillInput('');
      saveProfileData({ skills: nextSkills });
      triggerToast('Keahlian baru berhasil ditambahkan!');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const nextSkills = skills.filter(s => s !== skillToRemove);
    setSkills(nextSkills);
    saveProfileData({ skills: nextSkills });
    triggerToast('Keahlian berhasil dihapus');
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

  // Save Education Handler (CDC UI Style)
  const handleSaveEducation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInst.trim()) {
      triggerToast('Nama universitas wajib diisi');
      return;
    }
    const fullLevel = newFieldOfStudy.trim() ? `${newLevel.trim()} - ${newFieldOfStudy.trim()}` : newLevel.trim();
    const gradDateStr = isStillStudying 
      ? `Sedang Berjalan (Estimasi ${newGraduationYear || '2028'})`
      : `${newGraduationMonth ? newGraduationMonth + ' ' : ''}${newGraduationYear || '2026'}`.trim();

    const nextQual = [
      {
        id: qualifications[0]?.id || Date.now().toString(),
        institution: newInst.trim(),
        level: fullLevel,
        year: gradDateStr,
        ipk: newIpk.trim() || undefined
      }
    ];
    setQualifications(nextQual);
    saveProfileData({ qualifications: nextQual });
    setEditingSection(null);
    triggerToast('Data pendidikan berhasil disimpan!');
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
      action: () => handleOpenSection('personal'),
      actionLabel: 'Lengkapi Data'
    },
    {
      id: 'aboutMe',
      label: 'Tentang Saya',
      isCompleted: isBioCompleted,
      weight: 10,
      detail: isBioCompleted ? 'Bio Terisi' : 'Belum Diisi',
      action: () => handleOpenSection('aboutMe'),
      actionLabel: 'Tulis Bio'
    },
    {
      id: 'education',
      label: 'Pendidikan',
      isCompleted: isEducationCompleted,
      weight: 15,
      detail: isEducationCompleted ? 'Riwayat Terisi' : 'Belum Diisi',
      action: () => handleOpenSection('education'),
      actionLabel: 'Kelola Pendidikan'
    },
    {
      id: 'skills',
      label: `Keahlian (${skills.length})`,
      isCompleted: isSkillsCompleted,
      weight: 15,
      detail: skills.length > 0 ? `${skills.length} Keahlian` : 'Belum Ada',
      action: () => handleOpenSection('skills'),
      actionLabel: 'Kelola Keahlian'
    },
    {
      id: 'experience',
      label: `Pengalaman (${experiences.length})`,
      isCompleted: isExperienceCompleted,
      weight: 10,
      detail: experiences.length > 0 ? `${experiences.length} Pengalaman` : 'Belum Ada',
      action: () => handleOpenSection('experience'),
      actionLabel: 'Tambah Pengalaman'
    },
    {
      id: 'certificate',
      label: `Sertifikat (${certificates.length})`,
      isCompleted: isCertificateCompleted,
      weight: 10,
      detail: certificates.length > 0 ? `${certificates.length} Sertifikat` : 'Belum Ada',
      action: () => handleOpenSection('certificate'),
      actionLabel: 'Tambah Sertifikat'
    },
    {
      id: 'languages',
      label: `Bahasa (${languagesList.length})`,
      isCompleted: isLanguageCompleted,
      weight: 5,
      detail: languagesList.length > 0 ? `${languagesList.length} Bahasa` : 'Belum Ada',
      action: () => handleOpenSection('languages'),
      actionLabel: 'Tambah Bahasa'
    },
    {
      id: 'career',
      label: 'Preferensi Karier',
      isCompleted: isCareerCompleted,
      weight: 5,
      detail: isCareerCompleted ? 'Terisi' : 'Belum Diisi',
      action: () => handleOpenSection('career'),
      actionLabel: 'Atur Preferensi'
    }
  ];

  const completionPercent = checklistItems.reduce(
    (acc, item) => (item.isCompleted ? acc + item.weight : acc),
    0
  );
  const completedCount = checklistItems.filter(i => i.isCompleted).length;

  return (
    <div className="bg-white min-h-screen font-sans" id="prosple-student-profile-view">

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-50 text-emerald-800 px-5 py-3 rounded-xl shadow-lg border border-emerald-200 flex items-center gap-3 animate-fadeIn text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. HEADER HERO SECTION (INSTITUTIONAL GRADE UI - WHITE THEME) */}
      <div className="bg-white text-slate-900 pt-8 pb-10 px-4 sm:px-6 lg:px-8 relative border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-7 relative z-10">

          {/* Input Berkas Tersembunyi untuk Unggah Foto Lokal */}
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
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-2 border-slate-200 ring-4 ring-[#0077C6]/10 shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer relative transition-transform duration-300 group-hover:scale-[1.02]"
              title="Klik untuk ubah foto profil dari berkas lokal"
            >
              <img
                src={avatarUrl || DEFAULT_AVATAR_WA}
                alt={firstName}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR_WA;
                }}
                className="w-full h-full object-cover group-hover:opacity-90 transition duration-300"
              />
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center text-white">
                <Camera className="w-7 h-7 mb-1 text-white" />
                <span className="text-xs font-bold uppercase tracking-wider">Ubah Foto</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-[#0077C6] hover:bg-[#005FA3] text-white p-2.5 rounded-xl shadow-lg border-2 border-white transition transform group-hover:scale-110 cursor-pointer"
              title="Ubah Foto Profil dari Berkas Lokal"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Profile Info Summary */}
          <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {editingSection === 'headerInfo' ? (
                <motion.form
                  key="edit-header"
                  variants={sectionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  onSubmit={handleSaveProfileSection}
                  className="bg-slate-50/95 border border-slate-200/90 rounded-xl p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Pencil className="w-4 h-4 text-[#0077C6]" /> Edit Info Profil Utama
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingSection(null)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
                      title="Batal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Status Keanggotaan</label>
                      <select
                        value={userStatusType}
                        onChange={e => setUserStatusType(e.target.value as 'Mahasiswa' | 'Alumni')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                      >
                        <option value="Mahasiswa">Mahasiswa</option>
                        <option value="Alumni">Alumni</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nama Perguruan Tinggi *</label>
                      <input
                        type="text"
                        value={university}
                        onChange={e => setUniversity(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nama Depan *</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nama Belakang</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => setEditingSection(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-[#0077C6] hover:bg-[#005FA3] text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm transition cursor-pointer active:scale-95"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="view-header"
                  variants={sectionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="bg-[#E8F3FB] text-[#0077C6] text-xs font-bold px-3.5 py-1 rounded-full border border-[#B3D9F2] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0077C6]" />
                      <span>{userStatusType}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setEditingSection('headerInfo')}
                      className="text-xs text-[#0077C6] hover:text-[#005FA3] hover:underline flex items-center gap-1 font-semibold py-1.5 -my-1.5 md:ml-auto cursor-pointer"
                      title="Edit Info Utama (Status, Nama & Universitas)"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit Info Profil
                    </button>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-2">
                    <span>{`${firstName} ${lastName}`.trim() || user.name}</span>
                  </h1>

                  <div className="flex items-center justify-center md:justify-start gap-2 text-slate-600 text-xs sm:text-sm font-medium w-fit mx-auto md:mx-0">
                    <GraduationCap className="w-4 h-4 text-[#0077C6] shrink-0" />
                    <span>{university}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tentang Saya (Bio Card) */}
            <div id="section-aboutMe" className="pt-3 border-t border-slate-100 mt-3 space-y-1.5 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 scroll-mt-24">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="text-xs text-[#0077C6] font-semibold flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-[#0077C6]" /> Tentang Saya
                </span>
                {editingSection === 'aboutMe' ? (
                  <button
                    onClick={() => setEditingSection(null)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
                    title="Tutup Edit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingSection('aboutMe')}
                    className="text-[#0077C6] hover:text-[#005FA3] hover:underline flex items-center gap-1 font-semibold text-xs py-1.5 -my-1.5 cursor-pointer"
                  >
                    {aboutMe ? 'Edit Bio' : '+ Tulis Bio'} <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {editingSection === 'aboutMe' ? (
                  <motion.div
                    key="edit-about"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-3 pt-1"
                  >
                    <textarea
                      rows={4}
                      value={aboutMe}
                      onChange={e => setAboutMe(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white leading-relaxed"
                      placeholder="Tuliskan deskripsi singkat mengenai latar belakang, minat, dan tujuan karier Anda..."
                    />
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => setEditingSection(null)}
                        className="px-4 py-2 text-xs font-bold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          saveProfileData({ aboutMe });
                          setEditingSection(null);
                          triggerToast('Bio berhasil diperbarui!');
                        }}
                        className="px-5 py-2 text-xs font-bold text-white bg-[#0077C6] hover:bg-[#005FA3] rounded-xl shadow-sm transition cursor-pointer active:scale-95"
                      >
                        Simpan Bio
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.p
                    key="view-about"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal max-w-2xl whitespace-pre-line"
                  >
                    {aboutMe || (
                      <span className="italic text-slate-400">
                        Belum ada deskripsi profil atau bio yang ditulis. Klik &quot;+ Tulis Bio&quot; untuk memperkenalkan diri Anda.
                      </span>
                    )}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      {/* 2. STICKY SUB-NAVIGATION TABS (LINEAR/VERCEL DESIGN) */}
      <div
        ref={navRef}
        className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky z-30 shadow-sm"
        style={{ top: navOffset }}
      >
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setSubTab('profile')}
            className={`py-3.5 px-3 transition flex items-center gap-2 relative ${subTab === 'profile'
              ? 'text-[#0077C6] font-bold border-b-2 border-[#0077C6]'
              : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profil Saya</span>
          </button>

          <button
            onClick={() => setSubTab('bookmarks')}
            className={`py-3.5 px-3 transition flex items-center gap-2 relative ${subTab === 'bookmarks'
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
                    <span className="bg-[#D6E9F8] text-[#0077C6] text-xs font-bold px-2 py-0.5 rounded-full ml-0.5">
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
            className={`py-3.5 px-3 transition flex items-center gap-2 relative ${subTab === 'account'
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
        <AnimatePresence mode="wait">
          <motion.div
            key={subTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* SUB-TAB A: PROFIL SAYA */}
            {subTab === 'profile' && (
          <div className="space-y-6 animate-fadeIn">

            {/* KELENGKAPAN PROFIL PROGRESS CARD (DYNAMIC & CLEAN DESIGN) */}
            <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm space-y-4 hover:border-slate-300 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F3FB] text-[#0055D4] flex items-center justify-center font-bold shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#0055D4]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">Skor Kelengkapan Profil</h4>
                      <span className="text-xs text-slate-500 font-medium">({completedCount}/{checklistItems.length} Lengkap)</span>
                    </div>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">Profil yang terisi lengkap memaksimalkan peluang lolos seleksi berkas Mitra UMK</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`font-bold px-3.5 py-1.5 rounded-full text-xs border shadow-sm ${completionPercent >= 80
                    ? 'bg-blue-50 text-[#0077C6] border-blue-200'
                    : completionPercent >= 50
                      ? 'bg-[#E8F3FB] text-[#0055D4] border-[#B3D9F2]'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                    {completionPercent}% Selesai
                  </span>
                </div>
              </div>

              {/* Dynamic Animated Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                  <div
                    className="h-full rounded-full bg-[#0077C6] transition-[width] duration-700 ease-out"
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
                      ? 'text-[#0077C6] bg-blue-50/90 border-blue-200 hover:bg-blue-100/80 hover:border-blue-300'
                      : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-[#E8F3FB] hover:text-[#0055D4] hover:border-[#8CC4EA]'
                      }`}
                    title={item.isCompleted ? `${item.label}: Lengkap (${item.detail}) - Klik untuk perbarui` : `${item.label}: Belum Lengkap - Klik untuk ${item.actionLabel.toLowerCase()}`}
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0077C6] shrink-0" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span>{item.label}</span>
                    {!item.isCompleted && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 ml-0.5">
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
            <div id="section-personal" className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6 hover:border-slate-300 transition scroll-mt-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E8F3FB] text-[#0077C6] flex items-center justify-center font-bold">
                    <UserIcon className="w-5 h-5 text-[#0077C6]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Data Pribadi</h3>
                    <p className="text-xs text-slate-500 font-normal">Informasi identitas resmi pelamar</p>
                  </div>
                </div>

                {editingSection === 'personal' ? (
                  <button
                    onClick={() => setEditingSection(null)}
                    className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                    title="Tutup / Batal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingSection('personal')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-500" /> Edit Data
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {editingSection === 'personal' ? (
                  <motion.form
                    key="edit-personal"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    onSubmit={handleSaveProfileSection}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

                    <div className={userStatusType === 'Mahasiswa' ? "grid grid-cols-1 sm:grid-cols-2 gap-3.5" : "block"}>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">Email / Kontak</label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                        />
                      </div>
                      {userStatusType === 'Mahasiswa' && (
                        <div>
                          <label className="font-bold text-slate-700 block mb-1.5">NIM (Nomor Induk Mahasiswa)</label>
                          <input
                            type="text"
                            value={nim}
                            onChange={e => setNim(e.target.value)}
                            placeholder="Contoh: 202101001"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">No. Telepon / WhatsApp</label>
                        <input
                          type="text"
                          value={mobile}
                          onChange={e => setMobile(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">Jenis Kelamin</label>
                        <select
                          value={gender}
                          onChange={e => setGender(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                        >
                          <option value="">-- Pilih Jenis Kelamin --</option>
                          <option value="Male">Laki-Laki</option>
                          <option value="Female">Perempuan</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">Kewarganegaraan</label>
                      <input
                        type="text"
                        value={nationality}
                        onChange={e => setNationality(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                      />
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingSection(null)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-[#0077C6] hover:bg-[#005FA3] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition cursor-pointer active:scale-95"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="view-personal"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs"
                  >
                    <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-sm transition">
                      <div className="text-xs font-semibold text-slate-500">Nama Lengkap</div>
                      <div className="font-bold text-slate-900 text-sm truncate">{`${firstName} ${lastName}`.trim() || 'Belum Diisi'}</div>
                    </div>

                    {userStatusType === 'Mahasiswa' && (
                      <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-sm transition">
                        <div className="text-xs font-semibold text-slate-500">NIM (Nomor Induk Mahasiswa)</div>
                        <div className="font-bold text-slate-900 text-sm">{nim || 'Belum Diisi'}</div>
                      </div>
                    )}

                    <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-sm transition">
                      <div className="text-xs font-semibold text-slate-500">Email</div>
                      <div className="font-bold text-slate-900 text-sm truncate">{email || user.email}</div>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-sm transition">
                      <div className="text-xs font-semibold text-slate-500">No. Telepon / WhatsApp</div>
                      <div className="font-bold text-slate-900 text-sm">{mobile || 'Belum Diisi'}</div>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-sm transition">
                      <div className="text-xs font-semibold text-slate-500">Jenis Kelamin</div>
                      <div className="font-bold text-slate-900 text-sm">{gender === 'Male' ? 'Laki-Laki' : gender === 'Female' ? 'Perempuan' : (gender || 'Belum Diisi')}</div>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1 hover:bg-white hover:shadow-sm transition">
                      <div className="text-xs font-semibold text-slate-500">Kewarganegaraan</div>
                      <div className="font-bold text-slate-900 text-sm">{nationality || 'Indonesian'}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 2: PENDIDIKAN (EDUCATION - CDC UI STYLE)
            ══════════════════════════════════════════ */}
            <div id="section-education" className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6 hover:border-slate-300 transition scroll-mt-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0077C6] flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5 text-[#0077C6]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Pendidikan</h3>
                    <p className="text-xs text-slate-500 font-normal">Riwayat studi perguruan tinggi dan sekolah</p>
                  </div>
                </div>

                {editingSection === 'education' ? (
                  <button
                    onClick={() => setEditingSection(null)}
                    className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                    title="Tutup / Batal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : qualifications.length === 0 ? (
                  <button
                    onClick={() => {
                      setNewInst(university || 'Universitas Muhammadiyah Kendari');
                      setNewLevel('S1');
                      setNewFieldOfStudy('');
                      setNewAdmissionMonth('Agustus');
                      setNewAdmissionYear(new Date().getFullYear().toString());
                      setNewGraduationMonth('');
                      setNewGraduationYear((new Date().getFullYear() + 4).toString());
                      setIsStillStudying(true);
                      setNewIpk('');
                      setEditingSection('education');
                    }}
                    className="bg-blue-50 hover:bg-blue-100 text-[#0077C6] px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Pendidikan
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingSection('education')}
                    className="text-[#0077C6] hover:text-[#005FA3] bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {editingSection === 'education' ? (
                  <motion.form
                    key="edit-education"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    onSubmit={handleSaveEducation}
                    className="space-y-4 text-xs"
                  >
                    {/* CDC UI Style Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="font-bold text-slate-700 block mb-1.5">Perguruan Tinggi *</label>
                        <input
                          type="text"
                          required
                          value={newInst}
                          onChange={e => setNewInst(e.target.value)}
                          placeholder="Universitas Muhammadiyah Kendari"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">Jenjang Pendidikan</label>
                        <select
                          value={newLevel}
                          onChange={e => setNewLevel(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                        >
                          <option value="S1">S1 (Sarjana)</option>
                          <option value="D3">D3 (Diploma 3)</option>
                          <option value="D4">D4 (Sarjana Terapan)</option>
                          <option value="S2">S2 (Magister)</option>
                          <option value="S3">S3 (Doktor)</option>
                          <option value="SMA / SMK">SMA / SMK</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">Program Studi</label>
                        <input
                          type="text"
                          value={newFieldOfStudy}
                          onChange={e => setNewFieldOfStudy(e.target.value)}
                          placeholder="Contoh: Sistem dan Teknologi Informasi"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">Tahun Masuk</label>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={newAdmissionMonth}
                            onChange={e => setNewAdmissionMonth(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                          >
                            {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={newAdmissionYear}
                            onChange={e => setNewAdmissionYear(e.target.value)}
                            placeholder="2024"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">Tahun Kelulusan</label>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={newGraduationMonth}
                            onChange={e => setNewGraduationMonth(e.target.value)}
                            disabled={isStillStudying}
                            className={`w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 ${isStillStudying ? 'bg-slate-100 text-slate-400' : 'bg-white'}`}
                          >
                            <option value="">-- Bulan --</option>
                            {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={newGraduationYear}
                            onChange={e => setNewGraduationYear(e.target.value)}
                            placeholder={isStillStudying ? 'Estimasi (2028)' : '2026'}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-2.5 pt-1">
                        <input
                          type="checkbox"
                          id="still-studying-check"
                          checked={isStillStudying}
                          onChange={e => setIsStillStudying(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 accent-[#0077C6] cursor-pointer"
                        />
                        <label htmlFor="still-studying-check" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                          I still studying here (Masih menempuh pendidikan di sini)
                        </label>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-bold text-slate-700 block mb-1.5">
                          IPK / Nilai Akhir <span className="text-slate-400 font-normal">(Opsional)</span>
                        </label>
                        <input
                          type="text"
                          value={newIpk}
                          onChange={e => setNewIpk(e.target.value)}
                          placeholder="Contoh: 3.85 / 4.00"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                      <div>
                        {qualifications.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setQualifications([]);
                              saveProfileData({ qualifications: [] });
                              setEditingSection(null);
                              triggerToast('Riwayat pendidikan berhasil direset.');
                            }}
                            className="text-red-600 hover:text-red-700 font-bold text-xs hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus Pendidikan
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setEditingSection(null)}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="bg-[#0077C6] hover:bg-[#005FA3] text-white font-bold px-7 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="view-education"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    {qualifications.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2">
                        Belum ada riwayat pendidikan yang ditambahkan.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 py-2 border-b border-slate-100 text-xs">
                          <div className="text-xs font-semibold text-slate-500">Perguruan Tinggi</div>
                          <div className="md:col-span-2 font-bold text-slate-900 text-sm">
                            {qualifications[0]?.institution || university || 'Universitas Muhammadiyah Kendari'}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 py-2 border-b border-slate-100 text-xs">
                          <div className="text-xs font-semibold text-slate-500">Jenjang Pendidikan</div>
                          <div className="md:col-span-2 font-bold text-slate-900 text-sm">
                            {qualifications[0]?.level?.includes('-') ? qualifications[0]?.level.split('-')[0].trim() : (qualifications[0]?.level || newLevel || 'S1')}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 py-2 border-b border-slate-100 text-xs">
                          <div className="text-xs font-semibold text-slate-500">Program Studi</div>
                          <div className="md:col-span-2 font-bold text-slate-900 text-sm">
                            {qualifications[0]?.level?.includes('-') ? qualifications[0]?.level.split('-').slice(1).join('-').trim() : (newFieldOfStudy || '-')}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 py-2 border-b border-slate-100 text-xs">
                          <div className="text-xs font-semibold text-slate-500">Tahun Masuk</div>
                          <div className="md:col-span-2 font-bold text-slate-900 text-sm">
                            {newAdmissionMonth ? `${newAdmissionMonth} ` : ''}{newAdmissionYear || '-'}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 py-2 border-b border-slate-100 text-xs">
                          <div className="text-xs font-semibold text-slate-500">Tahun Kelulusan</div>
                          <div className="md:col-span-2 font-bold text-slate-900 text-sm">
                            {qualifications[0]?.year || (isStillStudying ? `Sedang Berjalan (Estimasi ${newGraduationYear || '2028'})` : (newGraduationYear || '-'))}
                          </div>
                        </div>

                        {qualifications[0]?.ipk && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 py-2 text-xs">
                            <div className="text-xs font-semibold text-slate-500">IPK / Nilai Akhir</div>
                            <div className="md:col-span-2 font-bold text-[#0077C6] text-sm">
                              {qualifications[0]?.ipk}
                            </div>
                          </div>
                        )}
                      </div>
                    )}


                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 3: KEAHLIAN
            ══════════════════════════════════════════ */}
            <div id="section-skills" className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6 hover:border-slate-300 transition scroll-mt-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0077C6] flex items-center justify-center font-bold">
                    <Code className="w-5 h-5 text-[#0077C6]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Keahlian</h3>
                    <p className="text-xs text-slate-500 font-normal">Keahlian teknis dan kompetensi utama Anda</p>
                  </div>
                </div>

                {editingSection === 'skills' ? (
                  <button
                    onClick={() => setEditingSection(null)}
                    className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                    title="Tutup / Selesai"
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingSection('skills')}
                    className="bg-blue-50 hover:bg-blue-100 text-[#0077C6] px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Kelola Keahlian
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {editingSection === 'skills' ? (
                  <motion.div
                    key="edit-skills"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    <form onSubmit={handleAddSkill} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ketik keahlian baru (misal: React, Python, UI/UX)..."
                        value={newSkillInput}
                        onChange={e => setNewSkillInput(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                      />
                      <button
                        type="submit"
                        className="bg-[#0077C6] hover:bg-[#005FA3] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 transition shadow-sm cursor-pointer active:scale-95"
                      >
                        <Plus className="w-4 h-4" /> Tambah
                      </button>
                    </form>

                    {/* Rekomendasi / Saran Cepat */}
                    <div className="space-y-2 pt-1">
                      <div className="text-xs font-semibold text-slate-500">
                        Saran Keahlian Populer (Klik untuk tambah):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {['Komunikasi', 'Microsoft Office', 'JavaScript', 'Python', 'React', 'UI/UX Design', 'Data Analysis', 'Public Speaking', 'Problem Solving', 'Teamwork', 'Manajemen Waktu', 'Bahasa Inggris']
                          .filter(s => !skills.includes(s))
                          .map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                const nextSkills = [...skills, preset];
                                setSkills(nextSkills);
                                saveProfileData({ skills: nextSkills });
                                triggerToast(`Keahlian "${preset}" berhasil ditambahkan!`);
                              }}
                              className="text-xs bg-slate-100 hover:bg-[#E8F3FB] text-slate-700 hover:text-[#0077C6] border border-slate-200/80 hover:border-[#8CC4EA] px-2.5 py-1 rounded-lg transition cursor-pointer"
                            >
                              + {preset}
                            </button>
                          ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="text-xs font-bold text-slate-700">Daftar Keahlian Saat Ini:</div>
                      <div className="flex flex-wrap gap-2 p-1 max-h-48 overflow-y-auto">
                        {skills.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">Belum ada keahlian yang ditambahkan.</span>
                        ) : (
                          skills.map(sk => (
                            <span
                              key={sk}
                              className="bg-[#E8F3FB] text-[#005FA3] border border-[#B3D9F2] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2"
                            >
                              <span>{sk}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(sk)}
                                className="text-[#7FBEE8] hover:text-red-600 transition cursor-pointer"
                                title="Hapus Keahlian"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingSection(null)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer active:scale-95"
                      >
                        Selesai
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="view-skills"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex flex-wrap gap-2.5"
                  >
                    {skills.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Belum ada keahlian yang ditambahkan.</p>
                    ) : (
                      skills.map(sk => (
                        <span
                          key={sk}
                          className="bg-slate-100 text-slate-800 border border-slate-200/90 hover:border-[#8CC4EA] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
                        >
                          <span>{sk}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(sk)}
                            className="text-slate-400 hover:text-red-600 transition -my-1 -mr-1 ml-0.5 p-1.5 rounded-md hover:bg-red-50 cursor-pointer"
                            title="Hapus Keahlian"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 4: PENGALAMAN
            ══════════════════════════════════════════ */}
            <div id="section-experience" className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6 hover:border-slate-300 transition scroll-mt-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0077C6] flex items-center justify-center font-bold">
                    <Briefcase className="w-5 h-5 text-[#0077C6]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Pengalaman Kerja &amp; Organisasi</h3>
                    <p className="text-xs text-slate-500 font-normal">Riwayat pekerjaan, magang, dan kegiatan organisasi</p>
                  </div>
                </div>

                {editingSection === 'experience' ? (
                  <button
                    onClick={() => setEditingSection(null)}
                    className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                    title="Tutup / Batal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingSection('experience')}
                    className="bg-blue-50 hover:bg-blue-100 text-[#0077C6] px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Pengalaman
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {editingSection === 'experience' ? (
                  <motion.div
                    key="edit-experience"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-5"
                  >
                    <form onSubmit={handleAddExperience} className="space-y-4 text-xs bg-slate-50/80 p-4.5 rounded-xl border border-slate-200">
                      <div className="text-xs font-semibold text-slate-800 mb-1">
                        Formulir Tambah Pengalaman Baru
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1.5">Posisi / Jabatan *</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Web Developer Intern"
                            value={newExpPos}
                            onChange={e => setNewExpPos(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1.5">Perusahaan / Organisasi *</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: PT Go Digital Kendari"
                            value={newExpComp}
                            onChange={e => setNewExpComp(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">Periode Kerja / Kegiatan</label>
                        <input
                          type="text"
                          placeholder="Contoh: Jan 2025 - Sekarang"
                          value={newExpPeriod}
                          onChange={e => setNewExpPeriod(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">Deskripsi Tugas / Tanggung Jawab</label>
                        <textarea
                          rows={3}
                          placeholder="Tuliskan ringkasan tanggung jawab dan pencapaian Anda..."
                          value={newExpDesc}
                          onChange={e => setNewExpDesc(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white leading-relaxed"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200/70">
                        <button
                          type="button"
                          onClick={() => setEditingSection(null)}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="bg-[#0077C6] hover:bg-[#005FA3] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition cursor-pointer active:scale-95"
                        >
                          Simpan Pengalaman
                        </button>
                      </div>
                    </form>

                    {/* Existing experiences in edit mode */}
                    {experiences.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="text-xs font-bold text-slate-700">Daftar Pengalaman yang Tersimpan:</div>
                        <div className="space-y-3">
                          {experiences.map(exp => (
                            <div key={exp.id} className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-4 flex items-start justify-between">
                              <div className="space-y-1">
                                <h4 className="font-bold text-slate-900 text-sm">{exp.position}</h4>
                                <div className="text-xs font-semibold text-[#0077C6]">{exp.company} • {exp.period}</div>
                                {exp.description && <p className="text-xs text-slate-600 mt-1">{exp.description}</p>}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveExperience(exp.id)}
                                className="text-slate-400 hover:text-red-600 transition p-2 -m-1 rounded-lg hover:bg-red-50 cursor-pointer"
                                title="Hapus Pengalaman"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="view-experience"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    {experiences.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Belum ada pengalaman yang ditambahkan.</p>
                    ) : (
                      experiences.map(exp => (
                        <div key={exp.id} className="bg-slate-50/80 border border-slate-200/70 hover:border-blue-300 rounded-xl p-4.5 space-y-2 relative transition">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base">{exp.position}</h4>
                              <div className="text-xs font-bold text-[#0077C6] flex items-center gap-1.5 mt-0.5">
                                <Building2 className="w-3.5 h-3.5" /> {exp.company}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                                {exp.period}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveExperience(exp.id)}
                                className="text-slate-400 hover:text-red-600 transition p-2 -m-1 rounded-lg hover:bg-red-50 cursor-pointer"
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 5: SERTIFIKAT & LISENSI
            ══════════════════════════════════════════ */}
            <div id="section-certificate" className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6 hover:border-slate-300 transition scroll-mt-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0077C6] flex items-center justify-center font-bold">
                    <Award className="w-5 h-5 text-[#0077C6]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Sertifikat &amp; Lisensi</h3>
                    <p className="text-xs text-slate-500 font-normal">Sertifikat kompetensi, keahlian profesi, dan lisensi resmi</p>
                  </div>
                </div>

                {editingSection === 'certificate' ? (
                  <button
                    onClick={() => setEditingSection(null)}
                    className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                    title="Tutup / Batal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingSection('certificate')}
                    className="bg-blue-50 hover:bg-blue-100 text-[#0077C6] px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Sertifikat
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {editingSection === 'certificate' ? (
                  <motion.div
                    key="edit-certificate"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-5"
                  >
                    <form onSubmit={handleAddCertificate} className="space-y-4 text-xs bg-slate-50/80 p-4.5 rounded-xl border border-slate-200">
                      <div className="text-xs font-semibold text-slate-800 mb-1">
                        Formulir Tambah Sertifikat Baru
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1.5">Nama Sertifikat / Pelatihan *</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Sertifikat Kompetensi Fullstack Developer - BNSP"
                          value={newCertName}
                          onChange={e => setNewCertName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1.5">Penerbit / Lembaga Sertifikasi</label>
                          <input
                            type="text"
                            placeholder="Contoh: BNSP / Google / Dicoding"
                            value={newCertIssuer}
                            onChange={e => setNewCertIssuer(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1.5">Tahun Perolehan</label>
                          <input
                            type="text"
                            placeholder="Contoh: 2025"
                            value={newCertYear}
                            onChange={e => setNewCertYear(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200/70">
                        <button
                          type="button"
                          onClick={() => setEditingSection(null)}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="bg-[#0077C6] hover:bg-[#005FA3] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition cursor-pointer active:scale-95"
                        >
                          Simpan Sertifikat
                        </button>
                      </div>
                    </form>

                    {/* Existing certificates in edit mode */}
                    {certificates.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="text-xs font-bold text-slate-700">Daftar Sertifikat yang Tersimpan:</div>
                        <div className="space-y-2">
                          {certificates.map(cert => (
                            <div key={cert.id} className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between text-xs">
                              <div className="space-y-0.5">
                                <div className="font-bold text-slate-900 text-sm">{cert.name}</div>
                                <div className="text-[#0077C6] font-semibold">{cert.issuer || 'Lembaga Sertifikasi'} • Tahun {cert.year}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveCertificate(cert.id)}
                                className="text-slate-400 hover:text-red-600 transition p-2 -m-1 rounded-lg hover:bg-red-50 cursor-pointer"
                                title="Hapus Sertifikat"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="view-certificate"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-3.5"
                  >
                    {certificates.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Belum ada sertifikat yang ditambahkan.</p>
                    ) : (
                      certificates.map(cert => (
                        <div key={cert.id} className="bg-slate-50/80 border border-slate-200/70 hover:border-blue-300 rounded-xl p-4.5 flex items-center justify-between transition">
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base">{cert.name}</h4>
                            <div className="text-xs font-semibold text-[#0077C6] flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-[#0077C6]" /> Penerbit: {cert.issuer || 'Lembaga Sertifikasi'}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">Tahun Perolehan: {cert.year}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCertificate(cert.id)}
                            className="text-slate-400 hover:text-red-600 transition p-2 -m-1 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Hapus Sertifikat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 6: BAHASA
            ══════════════════════════════════════════ */}
            <div id="section-languages" className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6 hover:border-slate-300 transition scroll-mt-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0077C6] flex items-center justify-center font-bold">
                    <Languages className="w-5 h-5 text-[#0077C6]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Bahasa</h3>
                    <p className="text-xs text-slate-500 font-normal">Kemampuan dan penguasaan bahasa komunikasi</p>
                  </div>
                </div>

                {editingSection === 'languages' ? (
                  <button
                    onClick={() => setEditingSection(null)}
                    className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                    title="Tutup / Batal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingSection('languages')}
                    className="bg-blue-50 hover:bg-blue-100 text-[#0077C6] px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Bahasa
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {editingSection === 'languages' ? (
                  <motion.div
                    key="edit-languages"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-4"
                  >
                    <form onSubmit={handleAddLanguage} className="space-y-4 text-xs bg-slate-50/80 p-4.5 rounded-xl border border-slate-200">
                      <div className="text-xs font-semibold text-slate-800 mb-1">
                        Formulir Tambah Bahasa
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1.5">Nama Bahasa *</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Bahasa Inggris / Bahasa Jepang"
                            value={newLangName}
                            onChange={e => setNewLangName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1.5">Tingkat Kemampuan</label>
                          <select
                            value={newLangLevel}
                            onChange={e => setNewLangLevel(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                          >
                            <option value="Fasih / Native">Fasih / Native</option>
                            <option value="Tingkat Lanjut / Advanced">Tingkat Lanjut / Advanced</option>
                            <option value="Menengah / Intermediate">Menengah / Intermediate</option>
                            <option value="Dasar / Elementary">Dasar / Elementary</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200/70">
                        <button
                          type="button"
                          onClick={() => setEditingSection(null)}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="bg-[#0077C6] hover:bg-[#005FA3] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition cursor-pointer active:scale-95"
                        >
                          Simpan Bahasa
                        </button>
                      </div>
                    </form>

                    {/* Existing languages in edit mode */}
                    {languagesList.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="text-xs font-bold text-slate-700">Daftar Bahasa yang Dikuasai:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {languagesList.map(lang => (
                            <div key={lang.id} className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
                              <div>
                                <div className="font-bold text-slate-900">{lang.name}</div>
                                <div className="text-[#0077C6] font-semibold">{lang.level}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveLanguage(lang.id)}
                                className="text-slate-400 hover:text-red-600 transition p-2 -m-1 rounded-lg hover:bg-red-50 cursor-pointer"
                                title="Hapus Bahasa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="view-languages"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
                  >
                    {languagesList.length === 0 ? (
                      <p className="text-xs text-slate-500 italic col-span-2">Belum ada bahasa yang ditambahkan.</p>
                    ) : (
                      languagesList.map(lang => (
                        <div key={lang.id} className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{lang.name}</div>
                            <div className="text-xs text-[#0077C6] font-bold mt-0.5">{lang.level}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveLanguage(lang.id)}
                            className="text-slate-400 hover:text-red-600 transition p-2 -m-1 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Hapus Bahasa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ══════════════════════════════════════════
                SEKSI 7: PREFERENSI KARIER
            ══════════════════════════════════════════ */}
            <div id="section-career" className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6 hover:border-slate-300 transition scroll-mt-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0077C6]/10 text-[#0077C6] flex items-center justify-center font-bold">
                    <Briefcase className="w-5 h-5 text-[#0077C6]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Preferensi Karier</h3>
                    <p className="text-xs text-slate-500 font-normal">Kriteria pekerjaan dan penempatan yang dicari</p>
                  </div>
                </div>

                {editingSection === 'career' ? (
                  <button
                    onClick={() => setEditingSection(null)}
                    className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                    title="Tutup / Batal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingSection('career')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-500" /> Edit
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {editingSection === 'career' ? (
                  <motion.form
                    key="edit-career"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    onSubmit={handleSaveProfileSection}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <label className="font-bold text-slate-700 block mb-1.5">Industri yang Diminati</label>
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
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingSection(null)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-[#0077C6] hover:bg-[#005FA3] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition cursor-pointer active:scale-95"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="view-career"
                    variants={sectionVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"
                  >
                    <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1">
                      <div className="text-xs font-semibold text-slate-500">Jenis Kesempatan</div>
                      <div className="font-bold text-slate-900 text-sm">{opportunityType || 'Belum Diisi'}</div>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1">
                      <div className="text-xs font-semibold text-slate-500">Tanggal Siap Kerja</div>
                      <div className="font-bold text-slate-900 text-sm">{opportunityStartDate || 'Belum Diisi'}</div>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1">
                      <div className="text-xs font-semibold text-slate-500">Industri yang Diminati</div>
                      <div className="font-bold text-slate-900 text-sm">{industries || 'Belum Diisi'}</div>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl space-y-1">
                      <div className="text-xs font-semibold text-slate-500">Lokasi Kerja Impian</div>
                      <div className="font-bold text-slate-900 text-sm">{locations || 'Belum Diisi'}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                      className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition flex justify-between items-start cursor-pointer group hover:border-[#0077C6]/50"
                    >
                      <div className="space-y-2.5 min-w-0 pr-3">
                        <span className="text-xs font-bold text-[#0077C6] uppercase tracking-wide block truncate">{job.namaInstansi}</span>
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
                        <span className="bg-blue-50 text-[#0077C6] font-bold text-xs px-3 py-1 rounded-full border border-blue-200 shadow-sm flex items-center gap-1.5">
                          <Bookmark className="w-3.5 h-3.5 fill-[#0077C6] text-[#0077C6]" />
                          <span>Tersimpan</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job.id, user.id);
                            setSavedRefreshKey(k => k + 1);
                          }}
                          className="bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 p-1.5 rounded-lg border border-slate-200 transition text-xs font-semibold cursor-pointer"
                          title="Hapus dari Simpanan"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
                  <div className="w-16 h-16 bg-[#E8F3FB] text-[#0077C6] rounded-full flex items-center justify-center mx-auto">
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
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0077C6]/10 text-[#0077C6] flex items-center justify-center font-bold">
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
                <input type="text" value={userStatusType === 'Alumni' ? 'Alumni' : 'Mahasiswa'} disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm cursor-not-allowed" />
              </div>
            </div>
          </div>
        )}
          </motion.div>
        </AnimatePresence>

      </div>



      {/* FOOTER */}
      <Footer />

    </div>
  );
};
