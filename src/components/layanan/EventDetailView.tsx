import React from 'react';
import { ChevronLeft, Calendar, MapPin, User, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { Footer } from '../Footer';

// Komponen ini akan dipanggil sebagai halaman terpisah
// Saat ini navigasi di EventCardLayout diarahkan ke view ini.
export default function EventDetailView({ event, onBack }: { event: any, onBack: () => void }) {
  if (!event) return null;

  return (
    <div className="bg-slate-50 min-h-screen">
      <main className="max-w-5xl mx-auto px-4 py-12">
        <button 
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali ke Layanan
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <img src={event.image} alt={event.title} className="w-full h-96 object-cover" />
              <div className="p-8 space-y-6">
                <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">{event.title}</h1>
                <p className="text-slate-600 leading-relaxed text-lg">{event.description}</p>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6 sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Informasi Kegiatan</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Tanggal</p>
                    <p className="font-semibold text-slate-900">{new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Lokasi</p>
                    <p className="font-semibold text-slate-900">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Narasumber</p>
                    <p className="font-semibold text-slate-900">{event.speaker}</p>
                  </div>
                </div>
              </div>

              {event.registrationLink && (
                <a 
                  href={event.registrationLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block w-full text-center bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
                >
                  Daftar Sekarang
                </a>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
