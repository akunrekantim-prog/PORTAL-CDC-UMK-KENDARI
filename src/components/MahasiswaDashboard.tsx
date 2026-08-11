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
      applyForJob(user.id, applyingJob, data);
      window.dispatchEvent(new Event('storage'));
      triggerToast(`Lamaran untuk ${applyingJob.judul} di ${applyingJob.namaInstansi} berhasil terkirim ke Mitra!`);
      setTimeout(() => {
        setApplyingJob(null);
        setActiveTab('applications');
      }, 1500);
    }
  };

  // Calculate my applications count & active interview alerts
  const myApplications = getFromDB<PengajuanMagang>('pengajuan_magang').filter(a => 
    a.userId === user.id || 
    a.namaMahasiswa === user.name || 
    (mahasiswaData && a.nim === mahasiswaData.nim) ||
    a.mahasiswaId === `mhs_${user.id}`
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

      {/* Header / Top Navigation */}
      <header className="bg-[#1E3A8A] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-[#10B981] text-white p-2 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="font-bold text-lg tracking-tight">Career Portal UMK</div>
            </div>
            
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  activeTab === 'search' ? 'bg-white/10 text-white' : 'text-blue-100 hover:bg-white/5 hover:text-white'
                }`}
              >
                Cari Lowongan
              </button>

              <button
                onClick={() => setActiveTab('applications')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                  activeTab === 'applications' ? 'bg-white/10 text-white' : 'text-blue-100 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>Lamaran Saya</span>
                {myApplications.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                    interviewAlertCount > 0 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {myApplications.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-blue-100 hover:bg-white/5 hover:text-white'
                }`}
              >
                Profil Saya
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-sm text-white leading-tight">{user.name}</div>
              <div className="text-blue-200 text-xs font-medium">Mahasiswa</div>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden bg-[#1E3A8A] border-t border-blue-800 px-2 py-2 flex gap-2">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs transition ${
            activeTab === 'search' ? 'bg-[#10B981] text-white' : 'text-blue-200 hover:bg-white/5'
          }`}
        >
          Cari Lowongan
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs transition flex items-center justify-center gap-1 ${
            activeTab === 'applications' ? 'bg-[#10B981] text-white' : 'text-blue-200 hover:bg-white/5'
          }`}
        >
          <span>Lamaran Saya</span>
          {myApplications.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white/20 text-white">
              {myApplications.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs transition ${
            activeTab === 'profile' ? 'bg-[#10B981] text-white' : 'text-blue-200 hover:bg-white/5'
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
            onApply={(job) => setApplyingJob(job)}
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
          onSubmit={handleApplySubmit}
          defaultName={`${firstName} ${lastName}`.trim()}
          defaultEmail={email}
          defaultProdi={major}
        />
      )}
    </div>
  );
}
