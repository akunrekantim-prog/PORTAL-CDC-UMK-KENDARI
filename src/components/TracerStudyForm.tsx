import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface TracerFormData {
  statusPekerjaan: 'bekerja' | 'wirausaha' | 'lanjut_studi' | 'belum_bekerja';
  namaInstansi?: string;
  rangePenghasilan?: 'kurang_2jt' | '2_5jt' | '5_10jt' | 'lebih_10jt';
  kesesuaianBidang?: 'sangat_erat' | 'erat' | 'cukup_erat' | 'kurang_erat' | 'tidak_sama_sekali';
  saranUntukKampus?: string;
}

interface TracerStudyFormProps {
  onSubmit: (data: TracerFormData) => void;
}

export default function TracerStudyForm({ onSubmit }: TracerStudyFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [statusPekerjaan, setStatusPekerjaan] = useState<'bekerja' | 'wirausaha' | 'lanjut_studi' | 'belum_bekerja'>('bekerja');
  const [namaInstansi, setNamaInstansi] = useState('');
  const [rangePenghasilan, setRangePenghasilan] = useState<'kurang_2jt' | '2_5jt' | '5_10jt' | 'lebih_10jt'>('2_5jt');
  const [kesesuaianBidang, setKesesuaianBidang] = useState<'sangat_erat' | 'erat' | 'cukup_erat' | 'kurang_erat' | 'tidak_sama_sekali'>('sangat_erat');
  const [saranUntukKampus, setSaranUntukKampus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: TracerFormData = {
      statusPekerjaan,
      namaInstansi: statusPekerjaan !== 'belum_bekerja' ? namaInstansi : undefined,
      rangePenghasilan: statusPekerjaan !== 'belum_bekerja' ? rangePenghasilan : undefined,
      kesesuaianBidang: statusPekerjaan !== 'belum_bekerja' ? kesesuaianBidang : undefined,
      saranUntukKampus
    };
    onSubmit(data);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
        <div className="bg-[#10B981]/10 p-4 rounded-full">
          <CheckCircle2 className="w-16 h-16 text-[#10B981]" />
        </div>
        <h3 className="text-2xl font-extrabold text-[#1E3A8A]">Thank You!</h3>
        <p className="text-slate-600 max-w-md">Your responses have been successfully recorded. Thank you for contributing to the improvement of our university.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
      {/* Current Status Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-[#1E3A8A] mb-4">1. Current Status</h3>
        <div className="space-y-3">
          {[
            { value: 'bekerja', label: 'Bekerja' },
            { value: 'wirausaha', label: 'Wirausaha' },
            { value: 'lanjut_studi', label: 'Lanjut Studi' },
            { value: 'belum_bekerja', label: 'Belum Bekerja' }
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="statusPekerjaan"
                value={option.value}
                checked={statusPekerjaan === option.value}
                onChange={() => setStatusPekerjaan(option.value as any)}
                className="w-5 h-5 text-[#10B981] border-slate-300 focus:ring-[#10B981]"
              />
              <span className="text-slate-700 group-hover:text-[#1E3A8A] font-medium transition">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {statusPekerjaan !== 'belum_bekerja' && (
        <>
          {/* Company & Income Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-[#1E3A8A] mb-4">2. Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Company Name / Business Name *</label>
                <input 
                  type="text" 
                  required
                  value={namaInstansi}
                  onChange={e => setNamaInstansi(e.target.value)}
                  placeholder="e.g. PT Maju Bersama"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Average Monthly Income *</label>
                <select 
                  value={rangePenghasilan}
                  onChange={e => setRangePenghasilan(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] bg-white appearance-none"
                >
                  <option value="kurang_2jt">Kurang dari Rp 2.000.000</option>
                  <option value="2_5jt">Rp 2.000.000 - Rp 5.000.000</option>
                  <option value="5_10jt">Rp 5.000.000 - Rp 10.000.000</option>
                  <option value="lebih_10jt">Lebih dari Rp 10.000.000</option>
                </select>
              </div>
            </div>
          </div>

          {/* Relevance Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-[#1E3A8A] mb-4">3. Relevance of Study Program</h3>
            <p className="text-sm text-slate-500 mb-4">How relevant is your current job to your study program?</p>
            <div className="space-y-3">
              {[
                { value: 'sangat_erat', label: 'Sangat Erat' },
                { value: 'erat', label: 'Erat' },
                { value: 'cukup_erat', label: 'Cukup Erat' },
                { value: 'kurang_erat', label: 'Kurang Erat' },
                { value: 'tidak_sama_sekali', label: 'Tidak Sama Sekali' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="kesesuaianBidang"
                    value={option.value}
                    checked={kesesuaianBidang === option.value}
                    onChange={() => setKesesuaianBidang(option.value as any)}
                    className="w-5 h-5 text-[#10B981] border-slate-300 focus:ring-[#10B981]"
                  />
                  <span className="text-slate-700 group-hover:text-[#1E3A8A] font-medium transition">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Suggestions Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-[#1E3A8A] mb-4">Suggestions for the University</h3>
        <textarea 
          value={saranUntukKampus}
          onChange={e => setSaranUntukKampus(e.target.value)}
          rows={4}
          placeholder="Share your thoughts on how we can improve our curriculum or services..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
        ></textarea>
      </div>

      <div className="flex justify-end pt-2 pb-8">
        <button 
          type="submit"
          className="bg-[#10B981] hover:bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition active:scale-95 text-sm"
        >
          Kirim Kuesioner
        </button>
      </div>
    </form>
  );
}
