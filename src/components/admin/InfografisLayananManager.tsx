import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  ZoomIn
} from 'lucide-react';
import { InfografisLayananItem, KategoriInfografis } from '../../types';
import {
  getInfografisLayanan,
  saveInfografisLayanan,
  addInfografisLayanan,
  updateInfografisLayanan,
  deleteInfografisLayanan,
  toggleHideInfografisLayanan,
  reorderInfografisLayanan
} from '../../data';

interface InfografisLayananManagerProps {
  onNotify?: (type: 'success' | 'error' | 'info', message: string) => void;
  title?: string;
  subtitle?: string;
  embedded?: boolean;
}

export const KATEGORI_OPTIONS: { id: KategoriInfografis; label: string; color: string; badgeBg: string }[] = [
  { id: 'event', label: 'Event Pengembangan Karir', color: 'text-blue-700 border-blue-200 bg-blue-50', badgeBg: 'bg-[#0077C6]' }
];

export default function InfografisLayananManager({ onNotify, title, subtitle, embedded }: InfografisLayananManagerProps) {
  const [items, setItems] = useState<InfografisLayananItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'semua' | 'aktif' | 'tersembunyi'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InfografisLayananItem | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formKategori, setFormKategori] = useState<KategoriInfografis>('event');
  const [formJudul, setFormJudul] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formGambarUrl, setFormGambarUrl] = useState('');
  const [formNamaFile, setFormNamaFile] = useState('');
  const [formUrutan, setFormUrutan] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data
  const loadData = () => {
    const list = getInfografisLayanan();
    setItems(list);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('cdc_infografis_updated', handleUpdate);
    return () => window.removeEventListener('cdc_infografis_updated', handleUpdate);
  }, []);

  const triggerToast = (type: 'success' | 'error' | 'info', msg: string) => {
    if (onNotify) {
      onNotify(type, msg);
    }
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchStatus =
        statusFilter === 'semua' ||
        (statusFilter === 'aktif' && item.isActive) ||
        (statusFilter === 'tersembunyi' && !item.isActive);
      const matchSearch =
        !searchQuery ||
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.deskripsi || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [items, statusFilter, searchQuery]);

  // Buka Modal Tambah
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormKategori('event');
    setFormJudul('');
    setFormDeskripsi('');
    setFormGambarUrl('');
    setFormNamaFile('');
    setFormIsActive(true);
    setUploadMode('file');

    const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.urutan ?? 0)) + 1 : 1;
    setFormUrutan(nextOrder);

    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEdit = (item: InfografisLayananItem) => {
    setEditingItem(item);
    setFormKategori('event');
    setFormJudul(item.judul);
    setFormDeskripsi(item.deskripsi || '');
    setFormGambarUrl(item.gambarUrl);
    setFormNamaFile(item.namaFile || '');
    setFormUrutan(item.urutan ?? 1);
    setFormIsActive(item.isActive);
    setUploadMode(item.gambarUrl.startsWith('data:') ? 'file' : 'url');
    setIsModalOpen(true);
  };

  // Handle Upload File Gambar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerToast('error', 'File yang dipilih harus berupa gambar (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      triggerToast('error', 'Ukuran gambar maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormGambarUrl(result);
      setFormNamaFile(file.name);
      triggerToast('success', `Gambar "${file.name}" siap diunggah.`);
    };
    reader.readAsDataURL(file);
  };

  // Submit Simpan (Tambah / Update)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formJudul.trim()) {
      triggerToast('error', 'Judul infografis wajib diisi.');
      return;
    }

    if (!formGambarUrl.trim()) {
      triggerToast('error', 'Gambar infografis wajib diunggah atau diisi URL-nya.');
      return;
    }

    if (editingItem) {
      // Update
      const updated: InfografisLayananItem = {
        ...editingItem,
        kategori: 'event',
        judul: formJudul.trim(),
        deskripsi: formDeskripsi.trim() || undefined,
        gambarUrl: formGambarUrl.trim(),
        namaFile: formNamaFile.trim() || undefined,
        urutan: Number(formUrutan) || 1,
        isActive: formIsActive
      };
      updateInfografisLayanan(updated);
      triggerToast('success', `Infografis "${formJudul}" berhasil diperbarui.`);
    } else {
      // Tambah baru
      addInfografisLayanan({
        kategori: 'event',
        judul: formJudul.trim(),
        deskripsi: formDeskripsi.trim() || undefined,
        gambarUrl: formGambarUrl.trim(),
        namaFile: formNamaFile.trim() || undefined,
        urutan: Number(formUrutan) || 1,
        isActive: formIsActive
      });
      triggerToast('success', `Infografis "${formJudul}" berhasil ditambahkan.`);
    }

    setIsModalOpen(false);
    loadData();
  };

  // Toggle Hide / Sembunyikan
  const handleToggleHide = (e: React.MouseEvent, id: string, currentStatus: boolean, title: string) => {
    e.stopPropagation();
    toggleHideInfografisLayanan(id);
    loadData();
    triggerToast('info', `Infografis "${title}" ${currentStatus ? 'disembunyikan dari publik' : 'kembali ditampilkan'}.`);
  };

  // Reorder Up / Down
  const handleReorder = (e: React.MouseEvent, id: string, direction: 'up' | 'down') => {
    e.stopPropagation();
    reorderInfografisLayanan(id, direction);
    loadData();
    triggerToast('success', `Urutan infografis berhasil ${direction === 'up' ? 'dinaikkan' : 'diturunkan'}.`);
  };

  // Delete
  const handleDelete = (id: string) => {
    deleteInfografisLayanan(id);
    setDeleteConfirmId(null);
    loadData();
    triggerToast('success', 'Infografis berhasil dihapus.');
  };

  const getCategoryMeta = (cat: string) => {
    return (
      KATEGORI_OPTIONS.find((k) => k.id === cat) || {
        id: 'lainnya',
        label: cat,
        color: 'text-slate-700 border-slate-200 bg-slate-50',
        badgeBg: 'bg-slate-600'
      }
    );
  };

  const activeCount = items.filter((i) => i.isActive).length;
  const hiddenCount = items.filter((i) => !i.isActive).length;

  return (
    <div className="space-y-6" id="adm-infografis-layanan">
      {/* ── HEADER HALAMAN ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-[#0077C6] border border-blue-100 shadow-2xs">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            {title || 'Infografis Event Pengembangan Karir'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {subtitle || 'Kelola poster infografis carousel yang tampil di slider halaman publik Layanan > Event (bisa tambah, edit, sembunyikan, hapus, dan atur urutan slide).'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#0077C6] hover:bg-[#1E3A8A] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" /> Tambah Infografis
        </button>
      </div>

      {/* ── STATISTIK KILAT ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Infografis</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{items.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> Ditampilkan (Aktif)
          </p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <EyeOff className="w-3.5 h-3.5" /> Disembunyikan
          </p>
          <p className="text-2xl font-extrabold text-slate-600 mt-1">{hiddenCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-[#0077C6] uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Target Layanan
          </p>
          <p className="text-xs font-black text-slate-800 mt-2 truncate">Event Pengembangan Karir</p>
        </div>
      </div>

      {/* ── PENCARIAN & FILTER STATUS ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul infografis atau deskripsi..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:border-[#0077C6] focus:ring-1 focus:ring-blue-500/20 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter('semua')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === 'semua'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Semua ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('aktif')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'aktif'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Ditampilkan ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('tersembunyi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'tersembunyi'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" /> Disembunyikan ({hiddenCount})
            </button>
          </div>
        </div>
      </div>

      {/* ── DAFTAR INFOGRAFIS (GRID VIEW DENGAN KONTROL LENGKAP) ── */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Belum Ada Infografis</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter !== 'semua'
              ? `Belum ada poster infografis dengan status "${statusFilter === 'aktif' ? 'Ditampilkan' : 'Disembunyikan'}".`
              : 'Silakan klik tombol "Tambah Infografis" untuk mengunggah poster baru untuk Event Pengembangan Karir.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0077C6] hover:bg-[#1E3A8A] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Infografis Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item, idx) => {
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col ${
                  item.isActive ? 'border-slate-200' : 'border-slate-200/60 opacity-75 bg-slate-50/50'
                }`}
              >
                {/* Poster Preview Container */}
                <div
                  className="relative aspect-[3/4] bg-slate-950 overflow-hidden cursor-pointer group"
                  onClick={() => setPreviewImage(item.gambarUrl)}
                  title="Klik untuk pratinjau penuh"
                >
                  <img
                    src={item.gambarUrl}
                    alt={item.judul}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Badges Floating Top */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs text-blue-700 border-blue-200 bg-blue-50/95 backdrop-blur-xs">
                      Event Pengembangan Karir
                    </span>
                    <span className="bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                      Urutan #{item.urutan ?? idx + 1}
                    </span>
                  </div>

                  {/* Status Overlay Badge */}
                  {!item.isActive && (
                    <div className="absolute bottom-2.5 left-2.5 bg-amber-500/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/20 flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Disembunyikan
                    </div>
                  )}

                  {/* Hover Prompt */}
                  <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                      <ZoomIn className="w-3.5 h-3.5 text-blue-400" /> Perbesar
                    </span>
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug" title={item.judul}>
                      {item.judul}
                    </h4>
                    {item.deskripsi && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.deskripsi}</p>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Urutan Control Buttons */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
                      <button
                        onClick={(e) => handleReorder(e, item.id, 'up')}
                        title="Naikkan urutan tampil"
                        className="p-1 hover:bg-white rounded text-slate-600 hover:text-blue-600 transition cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleReorder(e, item.id, 'down')}
                        title="Turunkan urutan tampil"
                        className="p-1 hover:bg-white rounded text-slate-600 hover:text-blue-600 transition cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Action Controls: Hide, Edit, Delete */}
                    <div className="flex items-center gap-1">
                      {/* Sembunyikan / Tampilkan */}
                      <button
                        onClick={(e) => handleToggleHide(e, item.id, item.isActive, item.judul)}
                        title={item.isActive ? 'Sembunyikan dari publik' : 'Tampilkan ke publik'}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          item.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {item.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(item);
                        }}
                        title="Edit data infografis"
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Hapus */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(item.id);
                        }}
                        title="Hapus infografis ini"
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL FORM TAMBAH / EDIT INFOGRAFIS ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn">
          <div
            className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-50 text-[#0077C6] border border-blue-100">
                  <Layers className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingItem ? 'Edit Infografis Layanan' : 'Tambah Infografis Layanan Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Poster infografis akan otomatis muncul di slide carousel layanan yang dipilih.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 flex-1">
              {/* Target Kategori Terkunci */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Kategori Target</span>
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Layers className="w-3.5 h-3.5 text-[#0077C6]" />
                    Event Pengembangan Karir
                  </span>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-md border border-blue-300">
                  Slider Halaman Event
                </span>
              </div>

              {/* Judul Infografis */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Infografis <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  placeholder="Contoh: Campus Hiring - Meet Your Future"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0077C6] focus:bg-white outline-none"
                />
              </div>

              {/* Deskripsi Singkat */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi / Keterangan Singkat (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  placeholder="Keterangan alur atau materi yang ada di infografis..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0077C6] focus:bg-white outline-none resize-none"
                />
              </div>

              {/* Upload Gambar Infografis */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    File Poster Infografis <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                        uploadMode === 'file' ? 'bg-[#0077C6] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Unggah File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                        uploadMode === 'url' ? 'bg-[#0077C6] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Ketik URL
                    </button>
                  </div>
                </div>

                {uploadMode === 'file' ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-[#0077C6] hover:bg-blue-50/30 rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 bg-slate-50"
                    >
                      <Upload className="w-6 h-6 text-slate-400" />
                      <p className="text-xs font-bold text-slate-700">
                        Klik untuk memilih gambar poster dari komputer
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Mendukung PNG, JPG, WEBP rasio vertikal (Ukuran maks 5MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={formGambarUrl}
                      onChange={(e) => setFormGambarUrl(e.target.value)}
                      placeholder="Masukkan URL gambar (misal: /campus-hiring-infografis.png atau link https://...)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0077C6] focus:bg-white outline-none"
                    />
                  </div>
                )}

                {/* Preview Thumbnail di dalam Form */}
                {formGambarUrl && (
                  <div className="relative rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center gap-3">
                    <div className="w-16 h-20 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                      <img src={formGambarUrl} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {formNamaFile || 'Gambar Terpilih'}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Siap ditampilkan
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormGambarUrl('');
                        setFormNamaFile('');
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Hapus gambar terpilih"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Urutan & Status */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Urutan Tampil (Slide #)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formUrutan}
                    onChange={(e) => setFormUrutan(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0077C6] focus:bg-white outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Angka lebih kecil tampil lebih dulu.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Publikasi
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0077C6] focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {formIsActive ? 'Tampilkan di Website' : 'Sembunyikan'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0077C6] hover:bg-[#1E3A8A] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan Infografis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI HAPUS ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 flex items-center justify-center animate-fadeIn">
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Hapus Infografis Ini?</h3>
              <p className="text-xs text-slate-500">
                Poster infografis ini akan dihapus dari carousel layanan dan tidak dapat dikembalikan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PRATINJAU GAMBAR (FULLSCREEN LIGHTBOX) ── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex items-center justify-center animate-fadeIn cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="max-w-xl max-h-[90vh] overflow-hidden rounded-2xl bg-white p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewImage} alt="Pratinjau" className="w-full h-auto max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
