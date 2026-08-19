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
  LogOut
} from 'lucide-react';
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
}

export default function MahasiswaDashboard({ user, onLogout, allLowongan }: MahasiswaDashboardProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'applications' | 'profile'>('search');

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

  const handleApplySubmit = (data: any) => {
    if (applyingJob) {
      try {
        applyForJob(user.id, applyingJob, data);
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
    (user.role === 'mahasiswa' && (a.userId === 'usr_mhs_demo' || a.userId === '2'))
  );
  const interviewAlertCount = myApplications.filter(a => (a.status || '').toLowerCase() === 'interview').length;

  const handleSaveProfile = (e: React.FormEvent) => {
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

    const updated = updateUserProfile(user.id, updatedProfile);
    setMahasiswaData(updated);
    triggerToast('Profile updated successfully!');
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

      {/* Header / Top Navigation (Matching Screenshot 1:1) */}
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
                  : 'border-transparent text-slate-600 hover:text-slate-900'
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
                  : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span>Lamaran Saya</span>
                {interviewAlertCount > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
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
                  : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
              >
                Profil Saya
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div
              onClick={() => {
                setSelectedJobForDetail(null);
                setActiveTab('profile');
              }}
              className="text-right hidden sm:flex items-center cursor-pointer group"
            >
              <span className="font-extrabold text-sm text-slate-800 group-hover:text-blue-600 transition">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden bg-white border-t border-slate-200 px-2 py-2 flex gap-2">
        <button
          onClick={() => {
            setSelectedJobForDetail(null);
            setActiveTab('search');
          }}
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition ${activeTab === 'search' && !selectedJobForDetail ? 'bg-[#0055D4] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
        >
          Lowongan
        </button>
        <button
          onClick={() => {
            setSelectedJobForDetail(null);
            setActiveTab('applications');
          }}
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1 ${activeTab === 'applications' && !selectedJobForDetail ? 'bg-[#0055D4] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
        >
          <span>Lamaran Saya</span>
        </button>
        <button
          onClick={() => {
            setSelectedJobForDetail(null);
            setActiveTab('profile');
          }}
          className={`flex-1 py-2 rounded-lg font-bold text-xs transition ${activeTab === 'profile' && !selectedJobForDetail ? 'bg-[#0055D4] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
        >
          Profil Saya
        </button>
      </div>

      <main className="w-full flex-grow py-8">
        {selectedJobForDetail ? (
          <JobDetail
            job={selectedJobForDetail}
            onBack={() => setSelectedJobForDetail(null)}
            onApply={() => setApplyingJob(selectedJobForDetail)}
            isLoggedIn={true}
            hideHeader={true}
            hideFooter={true}
          />
        ) : (
          <>
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
          </>
        )}
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
          defaultName={`${firstName} ${lastName}`.trim()}
          defaultEmail={email}
          defaultProdi={major}
          defaultNim={mahasiswaData?.nim || '202101001'}
        />
      )}
    </div>
  );
}
