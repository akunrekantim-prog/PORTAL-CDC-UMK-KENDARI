import React, { useState, useEffect } from 'react';
import {
  User as UserType,
  Mahasiswa,
  Lowongan
} from '../types';
import {
  getFromDB,
  applyForJob,
  updateUserProfile
} from '../data';
import {
  Search,
  Briefcase,
  User as UserIcon,
  CheckCircle2,
  MapPin,
  Clock,
  Building2,
  ChevronDown,
  LogOut,
  Menu,
  X,
  FileText,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JobApplicationModal } from './JobApplicationModal';
import { JobSearchMasterDetail } from './JobSearchMasterDetail';
import { StudentProfileView } from './StudentProfileView';
import { StudentApplicationsView } from './StudentApplicationsView';
import { JobDetail } from './JobDetail';
import { PengajuanMagang } from '../types';

interface MahasiswaDashboardProps {
  user: UserType;
  onLogout: () => void;
  allLowongan: Lowongan[];
  activeTab?: 'search' | 'applications' | 'profile';
  onTabChange?: (tab: 'search' | 'applications' | 'profile') => void;
}

export default function MahasiswaDashboard({ user, onLogout, allLowongan, activeTab: activeTabProp, onTabChange }: MahasiswaDashboardProps) {
  const [activeTab, setActiveTabInternal] = useState<'search' | 'applications' | 'profile'>(activeTabProp || 'search');

  const setActiveTab = (tab: 'search' | 'applications' | 'profile') => {
    setActiveTabInternal(tab);
    if (onTabChange) onTabChange(tab);
  };

  useEffect(() => {
    if (activeTabProp && activeTabProp !== activeTab) {
      setActiveTabInternal(activeTabProp);
    }
  }, [activeTabProp]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data States
  const [mahasiswaData, setMahasiswaData] = useState<Mahasiswa | null>(null);
  const [applyingJob, setApplyingJob] = useState<Lowongan | null>(null);
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<Lowongan | null>(null);

  // Search States
  const [studyFieldSearch, setStudyFieldSearch] = useState('');
  const [keywordSearch, setKeywordSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [remoteFilter, setRemoteFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');

  // Profile Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [degree, setDegree] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [mobile, setMobile] = useState('');
  const [nationality, setNationality] = useState('');
  const [opportunityType, setOpportunityType] = useState('');
  const [preferredStartDate, setPreferredStartDate] = useState('');

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadStudentData = () => {
    const students = getFromDB<Mahasiswa>('mahasiswa');
    let stud = students.find(m => m.userId === user.id);

    if (stud) {
      setMahasiswaData(stud);
      // Try to split name roughly for the form
      const names = (stud.nama || user.name).split(' ');
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
      setEmail(stud.email || user.email);
      setDegree(stud.fakultas || ''); // mapping fakultas to degree loosely
      setMajor(stud.programStudi || '');
      setGraduationYear(stud.graduationYear || '');
      setMobile(stud.phone || '');
      setNationality(stud.nationality || '');
      setOpportunityType(stud.opportunityType || '');
      setPreferredStartDate(stud.preferredStartDate || '');
    } else {
      const names = user.name.split(' ');
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
      setEmail(user.email);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [user.id]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleApplySubmit = async (data: any) => {
    if (applyingJob) {
      try {
        await applyForJob(user.id, applyingJob, data);
        window.dispatchEvent(new Event('storage'));
        triggerToast(`Lamaran untuk ${applyingJob.judul} di ${applyingJob.namaInstansi} berhasil terkirim ke Mitra!`);
      } catch (err: any) {
        triggerToast(err.message || 'Pendaftaran telah ditutup karena melewati batas waktu.');
      }
    }
  };

  // Calculate my applications count & active interview alerts
  const myApplications = getFromDB<PengajuanMagang>('pengajuan_magang').filter(a =>
    a.userId === user.id ||
    a.namaMahasiswa === user.name ||
    (mahasiswaData && a.nim === mahasiswaData.nim) ||
    a.mahasiswaId === `mhs_${user.id}` ||
    a.mahasiswaId === mahasiswaData?.id ||
    (user.role === 'user' && (a.userId === 'usr_mhs_demo' || a.userId === '2'))
  );
  const interviewAlertCount = myApplications.filter(a => (a.status || '').toLowerCase() === 'interview').length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: Partial<Mahasiswa> = {
      nama: `${firstName} ${lastName}`.trim(),
      email,
      phone: mobile,
      fakultas: degree,
      programStudi: major,
      graduationYear,
      nationality,
      opportunityType,
      preferredStartDate
    };

    try {
      const updated = await updateUserProfile(user.id, updatedProfile);
      setMahasiswaData(updated);
      triggerToast('Profile updated successfully!');
    } catch (err: any) {
      triggerToast(err?.message || 'Gagal menyimpan profil. Silakan coba lagi.');
    }
  };

  // Calculate profile completion
  const calculateCompletion = () => {
    const fields = [firstName, lastName, email, degree, major, graduationYear, mobile, nationality, opportunityType, preferredStartDate];
    const filled = fields.filter(f => f && f.trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const completionPercent = calculateCompletion();

  // Filter jobs
  const filteredJobs = allLowongan.filter(job => {
    if (job.status !== 'published') return false;

    // Basic search
    if (keywordSearch && !job.judul.toLowerCase().includes(keywordSearch.toLowerCase()) && !job.namaInstansi.toLowerCase().includes(keywordSearch.toLowerCase())) {
      return false;
    }
    // Location filter
    if (locationFilter && !job.lokasi.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    // Job type filter
    if (jobTypeFilter && job.tipe !== jobTypeFilter) return false;

    // Simplistic start date & remote handling for mock
    if (remoteFilter === 'remote' && !job.lokasi.toLowerCase().includes('remote')) return false;
    if (remoteFilter === 'hybrid' && !job.lokasi.toLowerCase().includes('hybrid')) return false;
    if (remoteFilter === 'onsite' && (job.lokasi.toLowerCase().includes('remote') || job.lokasi.toLowerCase().includes('hybrid'))) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans" id="mahasiswa-dashboard">

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-50 text-emerald-800 px-5 py-3 rounded-2xl shadow-lg border border-emerald-200 flex items-center gap-3 animate-fadeIn text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header / Top Navigation */}
      <header className="bg-white text-slate-900 sticky top-0 z-40 border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-16 lg:gap-40">
            <button
              onClick={() => {
                setSelectedJobForDetail(null);
                setActiveTab('search');
              }}
              className="flex items-center cursor-pointer group focus:outline-none shrink-0"
              aria-label="Kembali ke Lowongan"
            >
              <img
                src="/logo besar cdc.png"
                alt="Logo CDC UMK"
                className="h-10 sm:h-11 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </button>

            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedJobForDetail(null);
                  setActiveTab('search');
                }}
                className={`px-3.5 py-5 border-b-2 font-extrabold text-sm transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'search' && !selectedJobForDetail
                  ? 'border-[#0055D4] text-[#0055D4]'
                  : 'border-transparent text-slate-600 hover:text-[#0055D4] hover:border-[#0055D4]'
                  }`}
              >
                Lowongan
              </button>

              <button
                onClick={() => {
                  setSelectedJobForDetail(null);
                  setActiveTab('applications');
                }}
                className={`px-3.5 py-5 border-b-2 font-extrabold text-sm transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'applications' && !selectedJobForDetail
                  ? 'border-[#0055D4] text-[#0055D4]'
                  : 'border-transparent text-slate-600 hover:text-[#0055D4] hover:border-[#0055D4]'
                  }`}
              >
                <span>Lamaran Saya</span>
                {interviewAlertCount > 0 && (
                  <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {interviewAlertCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setSelectedJobForDetail(null);
                  setActiveTab('profile');
                }}
                className={`px-3.5 py-5 border-b-2 font-extrabold text-sm transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'profile' && !selectedJobForDetail
                  ? 'border-[#0055D4] text-[#0055D4]'
                  : 'border-transparent text-slate-600 hover:text-[#0055D4] hover:border-[#0055D4]'
                  }`}
              >
                Profil Saya
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div
              onClick={() => {
                setSelectedJobForDetail(null);
                setActiveTab('profile');
              }}
              className="text-right hidden sm:flex items-center cursor-pointer group"
            >
              <span className="font-extrabold text-sm text-slate-800 group-hover:text-[#0055D4] transition">
                {mahasiswaData?.nama || user.name}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-[#0055D4]/40 hover:text-[#0055D4] text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>

            {/* Mobile Hamburger (Matching Beranda 1:1) */}
            <button
              className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg gap-[5px] group focus-visible:outline-none cursor-pointer"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
            >
              <span className={[
                'block w-5 h-0.5 bg-gray-700 transition-all duration-200',
                mobileMenuOpen ? 'translate-y-[6.5px] rotate-45' : '',
              ].join(' ')} />
              <span className={[
                'block w-5 h-0.5 bg-gray-700 transition-all duration-200',
                mobileMenuOpen ? 'opacity-0' : '',
              ].join(' ')} />
              <span className={[
                'block w-5 h-0.5 bg-gray-700 transition-all duration-200',
                mobileMenuOpen ? '-translate-y-[6.5px] -rotate-45' : '',
              ].join(' ')} />
            </button>
          </div>
        </div>

        {/* ── MOBILE DROPDOWN DRAWER (Matching Beranda Structure & No Icons) ── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0 top-full z-[90] max-h-[80vh] overflow-y-auto"
              id="mobile-nav-drawer"
            >
            <div className="border-b border-gray-100">
              <button
                onClick={() => {
                  setSelectedJobForDetail(null);
                  setActiveTab('search');
                  setMobileMenuOpen(false);
                }}
                className={[
                  'w-full flex items-center justify-between px-5 py-4 text-sm font-semibold transition-colors duration-100 text-left cursor-pointer',
                  activeTab === 'search' && !selectedJobForDetail ? 'text-[#0055D4] bg-blue-50/40' : 'text-gray-800 hover:bg-blue-50/60 hover:text-[#0055D4]',
                ].join(' ')}
              >
                <span className={[
                  'border-l-2 pl-3 transition-colors',
                  activeTab === 'search' && !selectedJobForDetail ? 'border-[#0055D4]' : 'border-transparent',
                ].join(' ')}>
                  Lowongan
                </span>
              </button>
            </div>

            <div className="border-b border-gray-100">
              <button
                onClick={() => {
                  setSelectedJobForDetail(null);
                  setActiveTab('applications');
                  setMobileMenuOpen(false);
                }}
                className={[
                  'w-full flex items-center justify-between px-5 py-4 text-sm font-semibold transition-colors duration-100 text-left cursor-pointer',
                  activeTab === 'applications' && !selectedJobForDetail ? 'text-[#0055D4] bg-blue-50/40' : 'text-gray-800 hover:bg-blue-50/60 hover:text-[#0055D4]',
                ].join(' ')}
              >
                <span className={[
                  'border-l-2 pl-3 transition-colors',
                  activeTab === 'applications' && !selectedJobForDetail ? 'border-[#0055D4]' : 'border-transparent',
                ].join(' ')}>
                  Lamaran Saya
                </span>
                {interviewAlertCount > 0 && (
                  <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full mr-2">
                    {interviewAlertCount}
                  </span>
                )}
              </button>
            </div>

            <div className="border-b border-gray-100">
              <button
                onClick={() => {
                  setSelectedJobForDetail(null);
                  setActiveTab('profile');
                  setMobileMenuOpen(false);
                }}
                className={[
                  'w-full flex items-center justify-between px-5 py-4 text-sm font-semibold transition-colors duration-100 text-left cursor-pointer',
                  activeTab === 'profile' && !selectedJobForDetail ? 'text-[#0055D4] bg-blue-50/40' : 'text-gray-800 hover:bg-blue-50/60 hover:text-[#0055D4]',
                ].join(' ')}
              >
                <span className={[
                  'border-l-2 pl-3 transition-colors',
                  activeTab === 'profile' && !selectedJobForDetail ? 'border-[#0055D4]' : 'border-transparent',
                ].join(' ')}>
                  Profil Saya
                </span>
              </button>
            </div>

            <div className="border-b border-gray-100 bg-slate-50/50">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-rose-600 hover:bg-rose-50/60 transition-colors duration-100 text-left cursor-pointer"
              >
                <span className="border-l-2 border-transparent pl-3">
                  Keluar
                </span>
              </button>
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="w-full flex-grow py-8">
        <AnimatePresence mode="wait">
          {selectedJobForDetail ? (
            <motion.div
              key={`detail-${selectedJobForDetail.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <JobDetail
                job={selectedJobForDetail}
                onBack={() => setSelectedJobForDetail(null)}
                onApply={() => setApplyingJob(selectedJobForDetail)}
                isLoggedIn={true}
                hideHeader={true}
                hideFooter={true}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* VIEW A: SEARCH JOBS */}
              {activeTab === 'search' && (
                <JobSearchMasterDetail
                  jobs={allLowongan}
                  onApply={(job) => setApplyingJob(job)}
                  isLoggedIn={true}
                />
              )}

              {/* VIEW B: MY APPLICATIONS (STATUS LAMARAN, JADWAL INTERVIEW & HISTORY) */}
              {activeTab === 'applications' && (
                <StudentApplicationsView
                  user={user}
                  mahasiswaData={mahasiswaData}
                  allLowongan={allLowongan}
                  onSelectJob={(job) => setSelectedJobForDetail(job)}
                  onNavigateToSearch={() => setActiveTab('search')}
                />
              )}

              {/* VIEW C: MY PROFILE */}
              {activeTab === 'profile' && (
                <StudentProfileView
                  user={user}
                  mahasiswaData={mahasiswaData}
                  onProfileUpdated={loadStudentData}
                  onSelectJob={(job) => setSelectedJobForDetail(job)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Apply Modal */}
      {applyingJob && (
        <JobApplicationModal
          isOpen={!!applyingJob}
          job={applyingJob}
          onClose={() => setApplyingJob(null)}
          onViewApplications={() => {
            setApplyingJob(null);
            setActiveTab('applications');
          }}
          onSubmit={handleApplySubmit}
        />
      )}
    </div>
  );
}
