import React, { useState } from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { INDONESIAN_PROVINCES } from '../JobSearchMasterDetail';

interface LocationPickerProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
  accentColor?: 'blue' | 'emerald';
}

const QUICK_PRESETS = [
  'Kendari (On-site)',
  'Kendari (Hybrid)',
  'Konawe (On-site)',
  'Baubau (On-site)',
  'Kolaka (On-site)',
  'Makassar (Hybrid)',
  'DKI Jakarta (Remote / WFH)',
  'LAINNYA (LUAR NEGERI)'
];

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
  const [showAdvancedPicker, setShowAdvancedPicker] = useState<boolean>(false);

  // Available cities based on selected province
  const provinceObj = INDONESIAN_PROVINCES.find(p => p.province === selectedProvince);
  const cities = provinceObj ? provinceObj.cities : [];

  const isEmerald = accentColor === 'emerald';
  const activeRing = isEmerald ? 'focus:ring-emerald-500/20 focus:border-emerald-500' : 'focus:ring-blue-500/20 focus:border-blue-500';
  const badgeBg = isEmerald ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-[#0077C6] border-blue-200';
  const activeBtn = isEmerald ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-[#0077C6] text-white border-[#0077C6]';

  const handleApplyDropdownLocation = (provName: string, cityName: string, modeName: string) => {
    let formatted = '';
    if (provName === 'LAINNYA (LUAR NEGERI)') {
      formatted = modeName ? `Luar Negeri (${modeName})` : 'LAINNYA (LUAR NEGERI)';
    } else {
      const cityText = cityName ? `${cityName}, ` : '';
      const modeText = modeName ? ` (${modeName.replace(' (WFO)', '')})` : '';
      formatted = `${cityText}${provName}${modeText}`;
    }
    onChange(formatted);
  };

  const handleProvinceChange = (prov: string) => {
    setSelectedProvince(prov);
    const newProvObj = INDONESIAN_PROVINCES.find(p => p.province === prov);
    const defaultCity = newProvObj && newProvObj.cities.length > 0 ? newProvObj.cities[0] : '';
    setSelectedCity(defaultCity);
    handleApplyDropdownLocation(prov, defaultCity, selectedWorkMode);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    handleApplyDropdownLocation(selectedProvince, city, selectedWorkMode);
  };

  const handleModeChange = (mode: string) => {
    setSelectedWorkMode(mode);
    handleApplyDropdownLocation(selectedProvince, selectedCity, mode);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <MapPin className={`w-3.5 h-3.5 ${isEmerald ? 'text-emerald-600' : 'text-blue-600'}`} />
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowAdvancedPicker(!showAdvancedPicker)}
          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition flex items-center gap-1 cursor-pointer ${badgeBg}`}
        >
          <Sparkles className="w-3 h-3" />
          {showAdvancedPicker ? 'Sembunyikan Pilihan Wilayah' : 'Pilih Wilayah & Provinsi'}
        </button>
      </div>

      {/* QUICK PRESETS STRIP */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Cepat:</span>
        {QUICK_PRESETS.map((preset) => {
          const isSelected = value.toLowerCase().trim() === preset.toLowerCase().trim();
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap border cursor-pointer ${
                isSelected
                  ? activeBtn + ' shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>

      {/* ADVANCED PROVINCE & CITY PICKER PANEL */}
      {showAdvancedPicker && (
        <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3 animate-fadeIn text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* PROVINSI */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Provinsi / Regio</label>
              <div className="relative">
                <select
                  value={selectedProvince}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                >
                  <option value="LAINNYA (LUAR NEGERI)">🌐 LAINNYA (LUAR NEGERI)</option>
                  {INDONESIAN_PROVINCES.map((p) => (
                    <option key={p.province} value={p.province}>
                      {p.province}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* KOTA / KABUPATEN */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kota / Kabupaten</label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                disabled={selectedProvince === 'LAINNYA (LUAR NEGERI)' || cities.length === 0}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition disabled:bg-slate-100 disabled:text-slate-400"
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
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Skema Kerja</label>
              <select
                value={selectedWorkMode}
                onChange={(e) => handleModeChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              >
                {WORK_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* FINAL INPUT TEXT BOX (EDITABLE FOR CUSTOM DETAILS) */}
      <div className="relative">
        <input
          type="text"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Contoh: Kendari (On-site) / Jakarta Selatan (Hybrid)"
          className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 transition ${activeRing}`}
        />
      </div>
    </div>
  );
}
