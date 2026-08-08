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
  ExternalLink
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
  // Secondary sub-tab: 'profile' | 'bookmarks' | 'virtual' | 'account'
  const [subTab, setSubTab] = useState<'profile' | 'bookmarks' | 'virtual' | 'account'>('profile');
  const [savedRefreshKey, setSavedRefreshKey] = useState<number>(0);
  
  // Bookmarks sub-category: 'jobs' | 'employers' | 'advice' | 'events'
  const [bookmarkCategory, setBookmarkCategory] = useState<'jobs' | 'employers' | 'advice' | 'events'>('jobs');

  // Modal Editing States
  const [editingSection, setEditingSection] = useState<string | null>(null);

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
  const [mobile, setMobile] = useState(mahasiswaData?.phone || '');
  const [nationality, setNationality] = useState(mahasiswaData?.nationality || 'Indonesian');
  const [countryOfResidence, setCountryOfResidence] = useState('Indonesia');
  const [opportunityType, setOpportunityType] = useState(mahasiswaData?.opportunityType || 'Internship, Clerkship or Placement');
  const [opportunityStartDate, setOpportunityStartDate] = useState(mahasiswaData?.preferredStartDate || 'As soon as possible');
  const [industries, setIndustries] = useState('IT & Computer Science, Business & Management');
  const [locations, setLocations] = useState('Kendari, Jakarta, Remote');
  
  // High school states
  const [hsGradYear, setHsGradYear] = useState('2022');
  const [hsCountry, setHsCountry] = useState('Indonesia');
  const [hsName, setHsName] = useState('SMA Negeri 1 Kendari');
  const [hsSubjects, setHsSubjects] = useState('IPA (Natural Sciences)');

  // Extra info states
  const [workRights, setWorkRights] = useState('Indonesia / Indonesian Citizen');
  const [gender, setGender] = useState('Male');
  const [sendOpportunities, setSendOpportunities] = useState('Yes');
  const [spokenLanguages, setSpokenLanguages] = useState('Indonesian, English');
  const [cvName, setCvName] = useState('CV_Mohammad_Ikhsan.pdf');
  const [ethnicity, setEthnicity] = useState('Bugis / Tolaki');
  const [religion, setReligion] = useState('Muslim');

  // Qualification State
  const [qualifications, setQualifications] = useState([
    {
      id: '1',
      institution: 'UNIVERSITAS MUHAMMADIYAH KENDARI',
      level: 'Bachelor Degree (S1) - Computer Science',
      year: '2026'
    }
  ]);
  const [showAddQualModal, setShowAddQualModal] = useState(false);
  const [newInst, setNewInst] = useState('');
  const [newLevel, setNewLevel] = useState('');

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

  const handleAddQualification = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInst && newLevel) {
      setQualifications([
        ...qualifications,
        {
          id: Date.now().toString(),
          institution: newInst,
          level: newLevel,
          year: new Date().getFullYear().toString()
        }
      ]);
      setNewInst('');
      setNewLevel('');
      setShowAddQualModal(false);
      triggerToast('Kualifikasi pendidikan berhasil ditambahkan!');
    }
  };

  // Profile completion calculation
  const calculateCompletion = () => {
    const fields = [firstName, lastName, email, mobile, nationality, opportunityType, hsName, cvName];
    const filled = fields.filter(f => f && f.trim() !== '' && f !== 'Not Provided').length;
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

      {/* 1. TOP NAVY WELCOME BANNER (CDAC UMSU STYLE) */}
      <div className="bg-[#0B1340] text-white py-12 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-2 relative z-10">
          <div className="text-slate-300 font-medium text-base sm:text-lg">Welcome back,</div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight lowercase">
            {firstName || user.name.split(' ')[0]}
          </h1>
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
            My Profile
          </button>

          <button
            onClick={() => setSubTab('bookmarks')}
            className={`py-4 transition-all relative ${
              subTab === 'bookmarks'
                ? 'text-[#DD4B25] border-b-2 border-[#DD4B25]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Bookmarks
          </button>

          <button
            onClick={() => setSubTab('virtual')}
            className={`py-4 transition-all relative ${
              subTab === 'virtual'
                ? 'text-[#DD4B25] border-b-2 border-[#DD4B25]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Virtual Experiences
          </button>

          <button
            onClick={() => setSubTab('account')}
            className={`py-4 transition-all relative ${
              subTab === 'account'
                ? 'text-[#DD4B25] border-b-2 border-[#DD4B25]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Account
          </button>
        </div>
      </div>

      {/* 3. MAIN BODY RESOLVER BASED ON SUB-TAB */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* SUB-TAB A: MY PROFILE (2-COLUMN GRID) */}
        {subTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-fadeIn">
            
            {/* LEFT COLUMN (md:col-span-6) */}
            <div className="md:col-span-6 space-y-6">
              
              {/* CARD 1: PROGRESS */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">PROGRESS</span>
                  <span className="text-xs font-extrabold text-slate-600">{completionPercent}% Complete</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#10B981] h-2.5 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${completionPercent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  We tailor job suggestions based on your profile. The more up to date your details, the better our suggestions.
                </p>
              </div>

              {/* CARD 2: PERSONAL DETAILS */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900">Personal Details</h3>
                  <button 
                    onClick={() => setEditingSection('personal')}
                    className="text-[#DD4B25] hover:underline text-xs font-bold flex items-center gap-1"
                  >
                    Edit <Pencil className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">FIRST NAME</div>
                    <div className="font-bold text-slate-800 text-sm">{firstName || 'Not Provided'}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">LAST NAME</div>
                    <div className="font-bold text-slate-800 text-sm">{lastName || 'Not Provided'}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">EMAIL</div>
                    <div className="font-bold text-slate-800 text-sm">{email || user.email}</div>
                  </div>
                </div>
              </div>

              {/* CARD 3: QUALIFICATIONS */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900">Qualifications</h3>
                </div>

                <div className="space-y-3">
                  {qualifications.map(q => (
                    <div key={q.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 relative space-y-1">
                      <div className="flex items-center justify-end gap-3 text-xs font-bold text-[#DD4B25]">
                        <button onClick={() => setEditingSection('qual')} className="hover:underline">Edit</button>
                        <button 
                          onClick={() => setQualifications(qualifications.filter(item => item.id !== q.id))} 
                          className="hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{q.institution}</div>
                      <div className="font-extrabold text-slate-900 text-sm">{q.level}</div>
                    </div>
                  ))}

                  <button
                    onClick={() => setShowAddQualModal(true)}
                    className="w-full border border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Plus className="w-4 h-4" /> Add a qualification
                  </button>
                </div>
              </div>

              {/* CARD 4: MORE INFORMATION ABOUT YOU */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900">More Information About You</h3>
                  <button 
                    onClick={() => setEditingSection('moreInfo')}
                    className="text-[#DD4B25] hover:underline text-xs font-bold flex items-center gap-1"
                  >
                    Edit <Pencil className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">MOBILE</div>
                    <div className="font-bold text-slate-800 text-sm">{mobile || 'Not Provided'}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">NATIONALITY</div>
                    <div className="font-bold text-slate-800 text-sm">{nationality || 'Not Provided'}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">COUNTRY OF RESIDENCE</div>
                    <div className="font-bold text-slate-800 text-sm">{countryOfResidence}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">WORK RIGHTS</div>
                    <ul className="list-disc pl-4 text-xs font-bold text-slate-800 space-y-0.5">
                      <li>Indonesia</li>
                      <li>Indonesian Citizen</li>
                    </ul>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">GENDER</div>
                    <div className="font-bold text-slate-800 text-sm">{gender}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">SEND ME INFORMATION ON RELEVANT CAREER &amp; EDUCATION OPPORTUNITIES</div>
                    <div className="font-bold text-slate-800 text-sm">{sendOpportunities}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">SPOKEN LANGUAGES</div>
                    <div className="font-bold text-slate-800 text-sm">{spokenLanguages}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">CV / RESUME</div>
                    <div className="font-bold text-slate-800 text-sm">{cvName}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">ETHNICITY</div>
                    <div className="font-bold text-slate-800 text-sm">{ethnicity}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">RELIGION</div>
                    <div className="font-bold text-slate-800 text-sm">{religion}</div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (md:col-span-6) */}
            <div className="md:col-span-6 space-y-6">
              
              {/* CARD 1: CAREER PREFERENCES */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900">Career Preferences</h3>
                  <button 
                    onClick={() => setEditingSection('career')}
                    className="text-[#DD4B25] hover:underline text-xs font-bold flex items-center gap-1"
                  >
                    Edit <Pencil className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">OPPORTUNITY TYPE</div>
                    <ul className="list-disc pl-4 text-xs font-bold text-slate-800">
                      <li>{opportunityType}</li>
                    </ul>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">OPPORTUNITY START DATE</div>
                    <div className="font-bold text-slate-800 text-sm">{opportunityStartDate}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">INDUSTRIES I WANT TO WORK IN</div>
                    <div className="font-bold text-slate-800 text-sm">{industries}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">LOCATIONS I WANT TO WORK IN</div>
                    <div className="font-bold text-slate-800 text-sm">{locations}</div>
                  </div>
                </div>
              </div>

              {/* CARD 2: ABOUT YOUR HIGH SCHOOL */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900">About Your High School</h3>
                  <button 
                    onClick={() => setEditingSection('hs')}
                    className="text-[#DD4B25] hover:underline text-xs font-bold flex items-center gap-1"
                  >
                    Edit <Pencil className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">EXPECTED/ACTUAL HIGH SCHOOL GRADUATION YEAR?</div>
                    <div className="font-bold text-slate-800 text-sm">{hsGradYear}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">WHERE DO/DID YOU GO TO HIGH SCHOOL?</div>
                    <div className="font-bold text-slate-800 text-sm">{hsCountry}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">WHAT IS/WAS THE NAME OF YOUR HIGH SCHOOL?</div>
                    <div className="font-bold text-slate-800 text-sm">{hsName}</div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">WHAT FINAL YEAR HIGH SCHOOL SUBJECTS DO/DID YOU TAKE?</div>
                    <div className="font-bold text-slate-800 text-sm">{hsSubjects}</div>
                  </div>
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
                <span className="text-xs text-slate-500 font-medium">Klik pada lowongan untuk melihat detail & melamar</span>
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
                          Saved 🔖
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

        {/* SUB-TAB C: MY VIRTUAL EXPERIENCES */}
        {subTab === 'virtual' && (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-4 max-w-3xl mx-auto animate-fadeIn">
            <div className="w-16 h-16 bg-blue-50 text-[#1E3A8A] rounded-full flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Virtual Work Experience Programs</h3>
            <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto">
              Gain real work experience from leading companies worldwide directly through your dashboard.
            </p>
          </div>
        )}

        {/* SUB-TAB D: MY ACCOUNT */}
        {subTab === 'account' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">Account Settings</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input type="email" value={user.email} disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Role</label>
                <input type="text" value="Student / Alumni" disabled className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-bold" />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL EDIT SECTION */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Edit Profile Details</h3>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileSection} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">First Name</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20" />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Last Name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20" />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile</label>
                <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20" />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nationality</label>
                <input type="text" value={nationality} onChange={e => setNationality(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20" />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingSection(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">Cancel</button>
                <button type="submit" className="bg-[#10B981] text-white font-bold px-6 py-2 rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD QUALIFICATION */}
      {showAddQualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Add Qualification</h3>
              <button onClick={() => setShowAddQualModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQualification} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Institution Name</label>
                <input type="text" required placeholder="e.g. Universitas Muhammadiyah Kendari" value={newInst} onChange={e => setNewInst(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20" />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Qualification / Major</label>
                <input type="text" required placeholder="e.g. Bachelor Degree (S1) - Computer Science" value={newLevel} onChange={e => setNewLevel(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20" />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddQualModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold">Cancel</button>
                <button type="submit" className="bg-[#10B981] text-white font-bold px-6 py-2 rounded-xl">Add</button>
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
