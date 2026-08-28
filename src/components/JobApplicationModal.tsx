import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, Info, Clock } from 'lucide-react';
import { Lowongan } from '../types';
import { isJobDeadlinePassed } from '../data';

interface JobApplicationModalProps {
  job: Lowongan;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onViewApplications?: () => void;
  defaultName?: string;
  defaultEmail?: string;
  defaultProdi?: string;
  defaultNim?: string;
}

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  job,
  isOpen,
  onClose,
  onSubmit,
  onViewApplications
}) => {
  // Seluruh input form dimulai dalam kondisi kosong (manual input tanpa auto-fill)
  const [applicantName, setApplicantName] = useState<string>('');
  const [applicantEmail, setApplicantEmail] = useState<string>('');
  const [applicantProdi, setApplicantProdi] = useState<string>('');
  const [applicantNim, setApplicantNim] = useState<string>('');
  const [applicantNotes, setApplicantNotes] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const isDeadlinePassed = isJobDeadlinePassed(job.deadline);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isDeadlinePassed) {
      setFileError('Pendaftaran untuk lowongan ini telah ditutup karena melewati batas waktu.');
      return;
    }

    if (!uploadedFileName && !uploadedFileUrl) {
      setFileError('Berkas CV / Portofolio (PDF) wajib diunggah sebelum mengirim lamaran.');
      return;
    }

    setFileError(null);
    setIsSubmitting(true);

    // Process submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      onSubmit({ 
        applicantName, 
        applicantEmail, 
        applicantProdi, 
        applicantNim, 
        applicantNotes, 
        uploadedFileName, 
        uploadedFileUrl 
      });
    }, 600);
  };

  const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage = file.type.startsWith('image/') || /\.(png|jpe?g)$/i.test(file.name);

      if (!isPdf && !isImage) {
        setFileError('Format berkas tidak didukung. Harap unggah berkas CV berformat PDF atau Gambar (PNG/JPG).');
        setUploadedFileName(null);
        setUploadedFileUrl(null);
        e.target.value = '';
        return;
      }
      
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        setFileError(`Ukuran berkas (${sizeMb} MB) melebihi batas maksimal 1 MB. Silakan unggah berkas CV yang lebih kecil.`);
        setUploadedFileName(null);
        setUploadedFileUrl(null);
        e.target.value = '';
        return;
      }

      setUploadedFileName(file.name);
      setFileError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const res = event.target.result as string;
          setUploadedFileUrl(res);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setSubmitSuccess(false);
    setApplicantName('');
    setApplicantEmail('');
    setApplicantProdi('');
    setApplicantNim('');
    setApplicantNotes('');
    setUploadedFileName(null);
    setUploadedFileUrl(null);
    setFileError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white max-w-lg w-full rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn my-4 sm:my-8">
        
        {/* Modal Header */}
        <div className="bg-[#1B365D] text-white p-4 sm:p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <span className="text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider block mb-1">
            {submitSuccess ? '✓ Bukti Pengajuan Lamaran' : 'Portal Karir CDC UM Kendari'}
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
            {submitSuccess ? 'Lamaran Berhasil Terkirim' : 'Form Pengajuan Lamaran'}
          </h3>
          <p className="text-slate-300 text-xs mt-1 font-medium truncate">{job.judul} • {job.namaInstansi}</p>
        </div>

        {/* Modal Content / Form */}
        {isDeadlinePassed ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">Pendaftaran Telah Ditutup</h4>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
              Maaf, pengajuan lamaran untuk lowongan <strong>{job.judul}</strong> di <strong>{job.namaInstansi}</strong> tidak dapat diproses karena telah melewati batas waktu pendaftaran (deadline).
            </p>
            <button
              onClick={handleClose}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Tutup Form
            </button>
          </div>
        ) : submitSuccess ? (
          <div className="p-5 sm:p-7 space-y-4 sm:space-y-5 animate-fadeIn" id="submit-success-notice">
            <div className="text-center space-y-2.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 border border-emerald-200/80 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-base sm:text-xl">Berkas Lamaran Resmi Diterima!</h4>
                <p className="text-slate-600 text-xs leading-relaxed max-w-sm mx-auto font-medium">
                  Data kualifikasi &amp; berkas lamaran Anda telah berhasil didaftarkan di sistem CDC UM Kendari dan diteruskan ke tim HRD <strong>{job.namaInstansi}</strong>.
                </p>
              </div>
            </div>

            {/* Clean Digital Receipt Card */}
            <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-xs space-y-2.5 max-w-md mx-auto shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500 font-medium">Posisi:</span>
                <span className="font-extrabold text-slate-900 truncate max-w-[180px] sm:max-w-[220px] text-right">{job.judul}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500 font-medium">Mitra:</span>
                <span className="font-bold text-[#0077C6] truncate max-w-[180px] sm:max-w-[220px] text-right">{job.namaInstansi}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500 font-medium">Nama Pelamar:</span>
                <span className="font-bold text-slate-900 truncate max-w-[180px] sm:max-w-[220px] text-right">{applicantName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500 font-medium">Waktu:</span>
                <span className="font-semibold text-slate-700">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-extrabold px-2.5 py-0.5 rounded-full text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Menunggu Review HRD
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
              {onViewApplications ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onViewApplications();
                    }}
                    className="w-full sm:w-auto bg-[#0077C6] hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    Cek Status Lamaran Saya →
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-xs transition cursor-pointer"
                  >
                    Tutup
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto bg-[#0077C6] hover:bg-blue-700 text-white font-extrabold px-6 py-2.5 sm:py-3 rounded-xl text-xs transition shadow-sm cursor-pointer active:scale-95"
                >
                  Selesai &amp; Tutup
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex items-start gap-2.5 text-xs text-blue-900 font-medium">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px] sm:text-xs">
                <strong>Informasi Pengiriman Data:</strong> Data <em>Pendidikan, Pengalaman, Skill, dan Sertifikat</em> Anda di menu <strong>Profil Saya</strong> akan dilampirkan secara otomatis ke Mitra Industri.
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nama Lengkap Pelamar *</label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda..."
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Aktif *</label>
                <input
                  type="email"
                  required
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Pendidikan / Program Studi *</label>
                <input
                  type="text"
                  required
                  value={applicantProdi}
                  onChange={(e) => setApplicantProdi(e.target.value)}
                  placeholder="Contoh: S1 Teknik Informatika"
                  className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Upload Berkas CV / Portofolio (PDF/Gambar) <span className="text-rose-500 font-extrabold">* Wajib</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-center cursor-pointer bg-slate-50 transition relative ${
                fileError ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200 hover:border-[#0077C6]'
              }`}>
                <input
                  type="file"
                  accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className={`w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-1 ${fileError ? 'text-rose-400' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold block truncate px-2 ${fileError ? 'text-rose-600' : 'text-[#0077C6]'}`}>
                  {uploadedFileName ? uploadedFileName : 'Klik untuk unggah berkas CV (PDF / Gambar)'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Format PDF / PNG / JPG • Maksimal 1 MB</span>
              </div>
              {fileError && (
                <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                  ⚠️ {fileError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Surat Pengantar / Application Letter <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <textarea
                rows={3}
                value={applicantNotes}
                onChange={(e) => setApplicantNotes(e.target.value)}
                placeholder="Tuliskan pesan atau surat pengantar singkat Anda untuk mitra..."
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0077C6]/20 bg-white"
              />
            </div>

            <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#0077C6] hover:bg-blue-700 text-white font-bold px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl text-xs transition tracking-wider shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Lamaran'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
