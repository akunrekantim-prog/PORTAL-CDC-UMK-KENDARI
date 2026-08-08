import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2 } from 'lucide-react';
import { Lowongan } from '../types';

interface JobApplicationModalProps {
  job: Lowongan;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  defaultName?: string;
  defaultEmail?: string;
  defaultProdi?: string;
}

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  job,
  isOpen,
  onClose,
  onSubmit,
  defaultName = '',
  defaultEmail = '',
  defaultProdi = ''
}) => {
  const [applicantName, setApplicantName] = useState<string>(defaultName);
  const [applicantEmail, setApplicantEmail] = useState<string>(defaultEmail);
  const [applicantProdi, setApplicantProdi] = useState<string>(defaultProdi);
  const [applicantNotes, setApplicantNotes] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedFileName && !uploadedFileUrl) {
      setFileError('Berkas CV / Portofolio wajib diunggah sebelum mengirim lamaran.');
      return;
    }

    setFileError(null);
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      onSubmit({ applicantName, applicantEmail, applicantProdi, applicantNotes, uploadedFileName, uploadedFileUrl });
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setFileError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          let res = event.target.result as string;
          if (file.name.toLowerCase().endsWith('.pdf') && !res.startsWith('data:application/pdf')) {
            res = res.replace(/^data:[^;]*;/, 'data:application/pdf;');
          }
          setUploadedFileUrl(res);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setSubmitSuccess(false);
    setApplicantNotes('');
    setUploadedFileName(null);
    setUploadedFileUrl(null);
    setFileError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn my-8">
        
        {/* Modal Header */}
        <div className="bg-[#1B365D] text-white p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <span className="text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider block mb-1">
            Portal Karir CDC UM Kendari
          </span>
          <h3 className="text-xl font-extrabold text-white leading-tight">Form Pengajuan Lamaran</h3>
          <p className="text-slate-300 text-xs mt-1 truncate">{job.judul} • {job.namaInstansi}</p>
        </div>

        {/* Modal Content / Form */}
        {submitSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-lg">Lamaran Berhasil Terkirim!</h4>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
              Berkas lamaran Anda telah berhasil disimpan dan diteruskan ke tim HRD <strong>{job.namaInstansi}</strong>. Status lamaran dapat dipantau berkala melalui dashboard akun Anda.
            </p>
            <button
              onClick={handleClose}
              className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
            >
              Tutup Form
            </button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nama Lengkap Pelamar</label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Kampus / Kontak</label>
                <input
                  type="email"
                  required
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Program Studi</label>
                <input
                  type="text"
                  required
                  value={applicantProdi}
                  onChange={(e) => setApplicantProdi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Upload Berkas CV / Portofolio (PDF) <span className="text-rose-500 font-extrabold">(Wajib)</span>
              </label>
              <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer bg-slate-50 transition relative ${
                fileError ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 hover:border-[#0077C6]'
              }`}>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className={`w-8 h-8 mx-auto mb-1.5 ${fileError ? 'text-rose-400' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold block ${fileError ? 'text-rose-600' : 'text-[#0077C6]'}`}>
                  {uploadedFileName ? uploadedFileName : 'Klik atau seret berkas CV ke sini'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Format PDF / DOC (Maks. 5MB)</span>
              </div>
              {fileError && (
                <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                  ⚠️ {fileError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Catatan / Surat Pengantar / Application Letter (Wajib)</label>
              <textarea
                rows={3}
                required
                value={applicantNotes}
                onChange={(e) => setApplicantNotes(e.target.value)}
                placeholder="Tuliskan Application Letter atau Surat Pengantar Anda di sini..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition uppercase tracking-wider shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Mengirim Data...' : 'Kirim Lamaran'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
