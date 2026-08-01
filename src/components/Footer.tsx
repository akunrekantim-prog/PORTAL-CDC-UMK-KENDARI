import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  Users, 
  Facebook, 
  Instagram, 
  Youtube, 
  Globe 
} from 'lucide-react';
import { getFromDB } from '../data';
import { Lowongan } from '../types';

const POPULAR_LINKS = [
  'Loker BPJS Kesehatan 2026',
  'Loker Bank Mandiri 2026',
  'JOB PREPARATION 2026',
  'UM Kendari Career Fair',
  'Selamat & Sukses Pimpinan UM Kendari 2026',
  'Loker Pertamina 2026',
  'Magang BUMN Terbuka 2026',
];

interface FooterProps {
  onSelectLowongan?: (id: string) => void;
  setTab?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectLowongan, setTab }) => {
  const publishedLowongan = getFromDB<Lowongan>('lowongan').filter(l => l.status === 'published');

  const handleLinkClick = (id?: string) => {
    if (id && onSelectLowongan) {
      onSelectLowongan(id);
    } else if (setTab) {
      setTab('lowongan');
    }
  };

  return (
    <footer className="bg-[#0F1F4B] text-slate-400 pt-16 pb-8" id="pub-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Brand col */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center">
              <img
                src="/logo-cdc-branding-light.png"
                alt="CDC Career Development Center Universitas Muhammadiyah Kendari"
                className="h-20 md:h-24 lg:h-28 w-auto object-contain"
              />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Pusat Pengembangan Karir dan Alumni, Universitas Muhammadiyah Kendari.
              Berkomitmen menjembatani lulusan dengan dunia kerja profesional.
            </p>

            {/* CDC Club mini-badge */}
            <div className="flex items-center gap-3 bg-rose-900/30 border border-rose-800/40 rounded-xl px-4 py-3">
              <div className="bg-rose-600 p-2 rounded-lg">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-extrabold text-xs">CDC UM KENDARI CLUB</div>
                <div className="text-rose-400 text-[10px]">Komunitas alumni aktif & berkembang</div>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, color: 'hover:bg-blue-600' },
                { icon: Instagram, color: 'hover:bg-pink-600' },
                { icon: Youtube, color: 'hover:bg-red-600' },
                { icon: Globe, color: 'hover:bg-[#10B981]' },
              ].map(({ icon: Icon, color }, i) => (
                <a key={i} href="#" className={`bg-slate-800 p-2.5 rounded-full ${color} hover:text-white transition-colors`}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Popular Info col */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-extrabold text-white text-sm border-b border-slate-700 pb-2 uppercase tracking-wider">
              Popular Info
            </h4>
            <ul className="space-y-2.5 text-sm">
              {POPULAR_LINKS.slice(0, 5).map(link => (
                <li key={link}>
                  <button
                    onClick={() => handleLinkClick()}
                    className="hover:text-[#10B981] transition-colors flex items-start gap-2 text-left"
                  >
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#10B981]" />
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact col */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-extrabold text-white text-sm border-b border-slate-700 pb-2 uppercase tracking-wider">
              Hubungi Kami
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                <span>Jl. K.H. Ahmad Dahlan No. 10, Kendari, Sulawesi Tenggara</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#10B981] shrink-0" />
                <span>0852-4100-9988</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#10B981] shrink-0" />
                <span>cdc@umkendari.ac.id</span>
              </li>
            </ul>

            {/* Info Terkini mini */}
            <div className="mt-4 space-y-2">
              <div className="text-xs font-extrabold text-white uppercase tracking-wider">Info Terkini</div>
              {publishedLowongan.slice(0, 3).map(l => (
                <button 
                  key={l.id} 
                  onClick={() => handleLinkClick(l.id)}
                  className="w-full text-left text-xs hover:text-[#10B981] transition-colors flex items-start gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-[#10B981]" />
                  <span className="line-clamp-1">{l.judul}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} Portal CDC Universitas Muhammadiyah Kendari. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
