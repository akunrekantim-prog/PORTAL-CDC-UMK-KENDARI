import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Building2, Briefcase } from 'lucide-react';
import { INDONESIAN_PROVINCES } from '../JobSearchMasterDetail';

interface LocationPickerProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
  accentColor?: 'blue' | 'emerald';
}

const WORK_MODES = [
  'On-site (WFO)',
  'Hybrid',
  'Remote / WFH',
  'Luar Negeri'
];

export default function LocationPicker({
  value,
  onChange,
  label = 'Lokasi Penempatan Kerja / Wilayah *',
  required = true,
  accentColor = 'blue'
}: LocationPickerProps) {
  const [selectedProvince, setSelectedProvince] = useState<string>('SULAWESI TENGGARA');
  const [selectedCity, setSelectedCity] = useState<string>('KENDARI');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('On-site (WFO)');

  // Available cities based on selected province
  const provinceObj = INDONESIAN_PROVINCES.find(p => p.province === selectedProvince);
  const cities = provinceObj ? provinceObj.cities : [];

  const isEmerald = accentColor === 'emerald';
  const activeRing = isEmerald ? 'focus:ring-emerald-500/20 focus:border-emerald-500' : 'focus:ring-blue-500/20 focus:border-blue-500';
  const iconColor = isEmerald ? 'text-emerald-600' : 'text-[#0077C6]';

  const formatLocationString = (provName: string, cityName: string, modeName: string) => {
    if (provName === 'LAINNYA (LUAR NEGERI)') {
      return modeName ? `Luar Negeri (${modeName})` : 'LAINNYA (LUAR NEGERI)';
    }
    const cityText = cityName ? `${cityName}, ` : '';
    const modeText = modeName ? ` (${modeName.replace(' (WFO)', '')})` : '';
    return `${cityText}${provName}${modeText}`;
  };

  // Synchronize on mount or when external value changes
  useEffect(() => {
    if (!value || !value.trim()) {
      const initial = formatLocationString(selectedProvince, selectedCity, selectedWorkMode);
      onChange(initial);
      return;
    }

    // Try to match existing value to dropdowns
    const upperVal = value.toUpperCase();
    let foundProv = '';
    let foundCity = '';
    let foundMode = 'On-site (WFO)';

    if (upperVal.includes('HYBRID')) foundMode = 'Hybrid';
    else if (upperVal.includes('REMOTE') || upperVal.includes('WFH')) foundMode = 'Remote / WFH';
    else if (upperVal.includes('LUAR NEGERI')) foundMode = 'Luar Negeri';

    if (upperVal.includes('LUAR NEGERI')) {
      foundProv = 'LAINNYA (LUAR NEGERI)';
    } else {
      for (const p of INDONESIAN_PROVINCES) {
        if (upperVal.includes(p.province)) {
          foundProv = p.province;
          for (const c of p.cities) {
            if (upperVal.includes(c)) {
              foundCity = c;
              break;
            }
          }
          break;
        }
      }
    }

    if (foundProv && foundProv !== selectedProvince) {
      setSelectedProvince(foundProv);
    }
    if (foundCity && foundCity !== selectedCity) {
      setSelectedCity(foundCity);
    }
    if (foundMode && foundMode !== selectedWorkMode) {
      setSelectedWorkMode(foundMode);
    }
  }, []);

  const handleProvinceChange = (prov: string) => {
    setSelectedProvince(prov);
    const newProvObj = INDONESIAN_PROVINCES.find(p => p.province === prov);
    const defaultCity = newProvObj && newProvObj.cities.length > 0 ? newProvObj.cities[0] : '';
    setSelectedCity(defaultCity);
    onChange(formatLocationString(prov, defaultCity, selectedWorkMode));
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    onChange(formatLocationString(selectedProvince, city, selectedWorkMode));
  };

  const handleModeChange = (mode: string) => {
    setSelectedWorkMode(mode);
    onChange(formatLocationString(selectedProvince, selectedCity, mode));
  };

  return (
    <div className="space-y-3.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
      {/* HEADER SECTION */}
      <div className="pb-2 border-b border-slate-200/70">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <MapPin className={`w-4 h-4 ${iconColor}`} />
          {label}
        </label>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Pilih lokasi penempatan kerja melalui dropdown Provinsi, Kota/Kabupaten, dan Skema Penempatan di bawah.
        </p>
      </div>

      {/* DROPDOWN SELECTORS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* PROVINSI */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Globe className="w-3 h-3 text-slate-400" /> Provinsi / Wilayah
          </label>
          <select
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className={`w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 transition cursor-pointer shadow-2xs ${activeRing}`}
          >
            <option value="SULAWESI TENGGARA">SULAWESI TENGGARA</option>
            <option value="LAINNYA (LUAR NEGERI)">LAINNYA (LUAR NEGERI)</option>
            <option disabled>──────────</option>
            {INDONESIAN_PROVINCES.filter(p => p.province !== 'SULAWESI TENGGARA').map((p) => (
              <option key={p.province} value={p.province}>
                {p.province}
              </option>
            ))}
          </select>
        </div>

        {/* KOTA / KABUPATEN */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-400" /> Kota / Kabupaten
          </label>
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={selectedProvince === 'LAINNYA (LUAR NEGERI)' || cities.length === 0}
            className={`w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 transition cursor-pointer shadow-2xs disabled:bg-slate-100 disabled:text-slate-400 ${activeRing}`}
          >
            {cities.length === 0 ? (
              <option value="">(Pilih Provinsi)</option>
            ) : (
              cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))
            )}
          </select>
        </div>

        {/* SKEMA KERJA */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-slate-400" /> Skema Penempatan
          </label>
          <select
            value={selectedWorkMode}
            onChange={(e) => handleModeChange(e.target.value)}
            className={`w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 transition cursor-pointer shadow-2xs ${activeRing}`}
          >
            {WORK_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FINAL FORMATTED READ-ONLY PREVIEW */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
          Hasil Format Lokasi
        </label>
        <div className="relative">
          <input
            type="text"
            required={required}
            readOnly
            value={value || formatLocationString(selectedProvince, selectedCity, selectedWorkMode)}
            placeholder="Pilih wilayah melalui dropdown di atas"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100/90 text-sm font-bold text-slate-800 cursor-not-allowed select-none shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
}
