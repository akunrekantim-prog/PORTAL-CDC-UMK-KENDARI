import React, { useState } from 'react';
import { Building2, MapPin, Calendar, CheckCircle, ArrowRight, X, Briefcase, Award } from 'lucide-react';
import { PageHeader, Section, Card, CtaBlock } from './ui';

interface CompanyBooth {
  id: string;
  name: string;
  industry: string;
  logoInitial: string;
  color: string;
  jobs: string[];
  desc: string;
}

const BOOTHS: CompanyBooth[] = [
  { id: 'b1', name: 'Bank Syariah Indonesia (BSI)', industry: 'Perbankan Syariah', logoInitial: 'BSI', color: 'bg-teal-600', jobs: ['Teller Syariah', 'Customer Service Officer', 'Account Officer'], desc: 'Lembaga perbankan syariah terdepan di Indonesia berkomitmen melayani nasabah dengan amanah.' },
  { id: 'b2', name: 'Pertamina Patra Niaga Sultra', industry: 'Energi / Migas', logoInitial: 'P', color: 'bg-red-600', jobs: ['Health & Safety Officer', 'Supply Chain Analyst', 'Operation Supervisor'], desc: 'Subholding Commercial & Trading PT Pertamina (Persero) yang menyalurkan energi nasional.' },
  { id: 'b3', name: 'Kalla Group (Toyota Kendari)', industry: 'Otomotif & Konstruksi', logoInitial: 'KG', color: 'bg-emerald-600', jobs: ['Sales Executive', 'Admin Penjualan', 'Service Advisor'], desc: 'Grup korporasi terbesar di Indonesia Timur yang bergerak di bidang otomotif, logistik, dan infrastruktur.' },
  { id: 'b4', name: 'Telkomsel Branch Kendari', industry: 'Telekomunikasi', logoInitial: 'T', color: 'bg-rose-600', jobs: ['Digital Specialist', 'Network Engineer', 'Customer Care Advisor'], desc: 'Penyedia jaringan telekomunikasi seluler terbesar di Indonesia dengan jangkauan terluas.' },
];

export default function CareerFair() {
  const [selectedBooth, setSelectedBooth] = useState<CompanyBooth | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});

  const handleApplyJob = (jobKey: string) => {
    setAppliedJobs(prev => ({ ...prev, [jobKey]: true }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-career-fair">
      <PageHeader
        badge="Annual Event"
        title="UM Kendari Job & Career Fair"
        description="Temukan masa depan karir Anda secara langsung dengan berkunjung ke stan-stan perusahaan nasional dan multi-nasional di acara Job Fair Kampus."
        accent="amber"
      />

      <Card className="bg-gradient-to-r from-[#1E3A8A] to-blue-900 text-white p-8 shadow-md relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
          <div className="md:col-span-2 space-y-4">
            <span className="inline-flex px-3 py-0.5 bg-emerald-500 text-white text-[10px] font-extrabold rounded uppercase tracking-wider">
              Coming Soon 2026
            </span>
            <h3 className="font-extrabold text-xl sm:text-2xl leading-tight">
              UM Kendari Virtual Career Fair 2026
            </h3>
            <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">
              Acara tahunan bursa kerja akbar mempertemukan langsung mahasiswa tingkat akhir dan alumni UM Kendari dengan lebih dari 30+ mitra perusahaan berskala nasional.
            </p>
          </div>

          <div className="p-4 bg-white/10 rounded-2xl border border-white/15 text-xs space-y-3 font-semibold text-blue-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>22 - 24 November 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Auditorium Utama Kampus Utama</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Acara Resmi Terbuka Umum</span>
            </div>
          </div>
        </div>
      </Card>

      <Section title="Virtual Stand Booth Mitra Sponsor">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BOOTHS.map(booth => (
            <Card key={booth.id} hover className="text-center space-y-4 cursor-pointer" onClick={() => setSelectedBooth(booth)}>
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-2xl ${booth.color} text-white font-extrabold text-xs flex items-center justify-center shadow-sm mx-auto`}>
                  {booth.logoInitial}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{booth.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{booth.industry}</p>
                </div>
              </div>

              <button className="text-[10px] font-bold text-slate-900 flex items-center gap-1 mx-auto">
                Kunjungi Booth <ArrowRight className="w-3 h-3" />
              </button>
            </Card>
          ))}
        </div>
      </Section>

      {selectedBooth && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-end z-[999]" id="booth-details-panel">
          <div className="bg-white max-w-md w-full h-full shadow-2xl border-l border-slate-100 p-8 overflow-y-auto flex flex-col justify-between relative">
            <button
              onClick={() => setSelectedBooth(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6 pt-4">
              <div className="flex gap-4 items-center">
                <div className={`w-12 h-12 rounded-2xl ${selectedBooth.color} text-white font-extrabold text-xs flex items-center justify-center shrink-0`}>
                  {selectedBooth.logoInitial}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{selectedBooth.name}</h3>
                  <span className="text-[10px] font-bold text-slate-400">{selectedBooth.industry}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase text-slate-400">Profil Singkat:</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{selectedBooth.desc}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase text-slate-400">Lowongan Eksklusif (Job Fair):</h4>
                <div className="space-y-2">
                  {selectedBooth.jobs.map(job => {
                    const jobKey = `${selectedBooth.id}-${job}`;
                    const applied = appliedJobs[jobKey];

                    return (
                      <div key={job} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 truncate">{job}</span>
                        </div>

                        {applied ? (
                          <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-0.5 shrink-0">
                            <CheckCircle className="w-3.5 h-3.5" /> Dilamar
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApplyJob(jobKey)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1 rounded-lg text-[9px] uppercase tracking-wide transition shrink-0"
                          >
                            Lamar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBooth(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition uppercase tracking-wider"
              >
                Tutup Booth
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
