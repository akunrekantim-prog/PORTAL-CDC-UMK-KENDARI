import React, { useState } from 'react';
import { ShieldCheck, Search, Users, Award, BookOpen, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { PageHeader, Card, TwoColumn } from './ui';

interface MemberData {
  nim: string;
  name: string;
  prodi: string;
  status: 'Aktif' | 'Tidak Aktif';
  since: string;
}

const MOCK_MEMBERS: Record<string, MemberData> = {
  '202201001': { nim: '202201001', name: 'Ahmad Faisal', prodi: 'Teknik Informatika', status: 'Aktif', since: 'September 2022' },
  '202201002': { nim: '202201002', name: 'Siti Rahmawati', prodi: 'Manajemen', status: 'Aktif', since: 'Oktober 2022' },
  '202103015': { nim: '202103015', name: 'Rian Hidayat', prodi: 'Pendidikan Bahasa Inggris', status: 'Aktif', since: 'Maret 2021' },
};

export default function Keanggotaan() {
  const [searchNim, setSearchNim] = useState('');
  const [searchResult, setSearchResult] = useState<MemberData | null | 'not_found'>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setHasSearched(false);

    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
      const cleanedNim = searchNim.trim();
      if (MOCK_MEMBERS[cleanedNim]) {
        setSearchResult(MOCK_MEMBERS[cleanedNim]);
      } else {
        setSearchResult('not_found');
      }
    }, 600);
  };

  const handleClear = () => {
    setSearchNim('');
    setSearchResult(null);
    setHasSearched(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-keanggotaan">
      <PageHeader
        badge="Program Member"
        title="Keanggotaan CDC UM Kendari"
        description="Bergabunglah menjadi anggota CDC untuk mendapatkan akses eksklusif pelatihan karir, prioritas undangan bursa kerja, serta bimbingan karir personal."
        accent="blue"
      />

      <TwoColumn
        left={
          <Card>
            <h3 className="font-extrabold text-slate-900 text-lg border-l-4 border-emerald-500 pl-3">
              Manfaat Anggota CDC
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Users, title: 'Komunitas Profesional', desc: 'Jaringan luas dengan alumni dan profesional industri.' },
                { icon: Award, title: 'Sertifikat Pelatihan', desc: 'Prioritas mengikuti pelatihan bersertifikat resmi dari CDC.' },
                { icon: BookOpen, title: 'Resource Karir', desc: 'Akses gratis ke materi e-book, tips CV, dan video panduan interview.' },
                { icon: ShieldCheck, title: 'Verifikasi Profil', desc: 'Tanda lencana verifikasi di profil lamaran kerja mitra.' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="bg-white p-2 rounded-xl w-fit shadow-xs">
                    <item.icon className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm mb-2">Cara Mendaftar Keanggotaan:</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Pendaftaran keanggotaan dilakukan secara otomatis ketika Anda membuat akun mahasiswa atau alumni di portal ini. Silakan pilih menu <strong>Register</strong> di bagian atas header untuk mendaftarkan akun baru Anda.
              </p>
            </div>
          </Card>
        }
        right={
          <Card>
            <h3 className="font-extrabold text-slate-900 text-lg">Cek Status Keanggotaan</h3>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nomor Induk Mahasiswa (NIM)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={searchNim}
                    onChange={e => setSearchNim(e.target.value)}
                    placeholder="Contoh: 202201001"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Gunakan NIM terdaftar untuk pengujian (contoh: 202201001)</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="flex-grow bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memeriksa...
                    </>
                  ) : (
                    'Periksa Status'
                  )}
                </button>
                {hasSearched && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase transition"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>

            {hasSearched && (
              <div className="pt-4 border-t border-slate-100" id="membership-result">
                {searchResult === 'not_found' ? (
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-3 text-rose-800 text-xs">
                    <XCircle className="w-5 h-5 shrink-0 text-rose-500" />
                    <div>
                      <span className="font-bold">Keanggotaan Tidak Ditemukan:</span> NIM "{searchNim}" belum terdaftar sebagai anggota CDC resmi. Pastikan NIM diinput dengan benar atau daftar akun baru.
                    </div>
                  </div>
                ) : searchResult && (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3 text-emerald-800 text-xs">
                      <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
                      <div>
                        <span className="font-bold">Keanggotaan Aktif:</span> NIM "{searchResult.nim}" terdaftar sebagai anggota aktif sejak {searchResult.since}.
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 relative overflow-hidden font-mono text-xs">
                      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-y-6 translate-x-6">
                        <Award className="w-32 h-32" />
                      </div>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="text-[10px] text-blue-200 uppercase font-bold">MEMBER CARD</div>
                          <div className="text-sm font-extrabold font-sans">CDC UM KENDARI</div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500 text-white font-extrabold rounded text-[9px] uppercase">
                          {searchResult.status}
                        </span>
                      </div>

                      <div className="space-y-3 font-sans">
                        <div>
                          <div className="text-[9px] text-blue-200">NAMA LENGKAP</div>
                          <div className="font-bold text-sm tracking-wide">{searchResult.name}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-[9px] text-blue-200">NIM</div>
                            <div className="font-bold">{searchResult.nim}</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-blue-200">PROGRAM STUDI</div>
                            <div className="font-bold truncate">{searchResult.prodi}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        }
      />
    </div>
  );
}
