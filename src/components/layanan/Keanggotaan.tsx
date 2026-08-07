import React from 'react';
import { User, FileText, Clock, CheckCircle } from 'lucide-react';
import { PageHeader, Card, MetaList, Divider } from './ui';

export default function Keanggotaan() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10" id="layanan-keanggotaan">
      <PageHeader
        badge="Program Member"
        title="Keanggotaan CDC UM Kendari"
        description="Bergabung menjadi anggota CDC untuk mendapatkan akses eksklusif pelatihan karir, prioritas undangan bursa kerja, serta bimbingan karir personal."
        accent="blue"
        icon={User}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <MetaList
              items={[
                { label: 'Tujuan', text: 'Memberikan akses eksklusif anggota terhadap layanan pengembangan karir, pelatihan bersertifikat, prioritas undangan bursa kerja, dan jaringan profesional alumni.' },
                { label: 'Pihak Yang Terlibat', text: 'Mahasiswa aktif, alumni, mitra perusahaan, dan koordinator program keanggotaan CDC.' },
                { label: 'Waktu dan Tempat', text: 'Pendaftaran dapat dilakukan kapan saja secara daring. Pengambilan kartu anggota dapat dilakukan di kantor CDC UM Kendari pada jam kerja.' },
                { label: 'Alat', text: 'Formulir pendaftaran digital, sistem verifikasi akun portal CDC, dan database keanggotaan CDC.' },
              ]}
            />

            <Divider />

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mekanisme</h3>
              <div className="space-y-3">
                {['Mahasiswa/alumni membuat akun di portal CDC.', 'Memilih menu Register untuk mendaftarkan akun baru.', 'Verifikasi akun diterima sebagai anggota CDC resmi.'].map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-extrabold">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-50/60">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-900 text-sm">Manfaat Anggota CDC</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Komunitas profesional, sertifikat pelatihan, resource karir, dan verifikasi profil di portal CDC.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
