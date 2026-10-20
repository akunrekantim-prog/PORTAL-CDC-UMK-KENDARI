import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, ZoomIn, ZoomOut, RotateCcw, Move, Crop } from 'lucide-react';

export interface ImageCropperModalProps {
  imageSrc: string;
  title?: string;
  aspectRatio?: number; // Default 1 (1:1 square)
  outputWidth?: number; // Default 600 px
  outputHeight?: number; // Default 600 px
  onCropComplete: (croppedFile: File, croppedDataUrl: string) => void;
  onClose: () => void;
}

export default function ImageCropperModal({
  imageSrc,
  title = 'Sesuaikan & Crop Foto Profil',
  aspectRatio = 1,
  outputWidth = 600,
  outputHeight = 600,
  onCropComplete,
  onClose
}: ImageCropperModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCircularMask, setShowCircularMask] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Hitung viewport width & height sesuai aspectRatio (maksimal lebar 380px, tinggi 280px)
  const { viewportWidth, viewportHeight } = React.useMemo(() => {
    if (!aspectRatio || Math.abs(aspectRatio - 1) < 0.01) {
      return { viewportWidth: 300, viewportHeight: 300 };
    }
    if (aspectRatio > 1) {
      const w = 380;
      const h = Math.round(w / aspectRatio);
      return { viewportWidth: w, viewportHeight: Math.min(h, 280) };
    } else {
      const h = 300;
      const w = Math.round(h * aspectRatio);
      return { viewportWidth: w, viewportHeight: h };
    }
  }, [aspectRatio]);

  // Hitung base scale agar gambar minimal memenuhi viewport
  const minScale = React.useMemo(() => {
    if (!naturalSize.w || !naturalSize.h) return 1;
    return Math.max(viewportWidth / naturalSize.w, viewportHeight / naturalSize.h);
  }, [naturalSize, viewportWidth, viewportHeight]);

  const currentScale = minScale * zoom;
  const dispW = naturalSize.w * currentScale;
  const dispH = naturalSize.h * currentScale;

  // Batas maksimum pergeseran agar tidak ada celah kosong dalam kotak crop
  const maxOffsetX = Math.max(0, (dispW - viewportWidth) / 2);
  const maxOffsetY = Math.max(0, (dispH - viewportHeight) / 2);

  // Clamp offset dalam batas aman
  const clampOffset = useCallback((x: number, y: number, currentZoom: number) => {
    const scale = minScale * currentZoom;
    const w = naturalSize.w * scale;
    const h = naturalSize.h * scale;
    const maxX = Math.max(0, (w - viewportWidth) / 2);
    const maxY = Math.max(0, (h - viewportHeight) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  }, [minScale, naturalSize, viewportWidth, viewportHeight]);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setImageLoaded(true);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
    imgRef.current = img;
  }, [imageSrc]);

  // Handle Dragging / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setOffset(clampOffset(newX, newY, zoom));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Support (HP / Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const newX = e.touches[0].clientX - dragStart.x;
    const newY = e.touches[0].clientY - dragStart.y;
    setOffset(clampOffset(newX, newY, zoom));
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    const newZoom = Math.max(1, Math.min(3, zoom + delta));
    setZoom(newZoom);
    setOffset((prev) => clampOffset(prev.x, prev.y, newZoom));
  };

  // Reset Zoom & Offset
  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Eksekusi Pemotongan Canvas
  const handleApplyCrop = async () => {
    if (!imgRef.current || !imageLoaded) return;
    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context tidak didukung.');
      }

      // Hitung koordinat sumber di gambar asli
      const cropCenterX = naturalSize.w / 2 - offset.x / currentScale;
      const cropCenterY = naturalSize.h / 2 - offset.y / currentScale;
      const cropNaturalW = viewportWidth / currentScale;
      const cropNaturalH = viewportHeight / currentScale;

      const sx = Math.max(0, cropCenterX - cropNaturalW / 2);
      const sy = Math.max(0, cropCenterY - cropNaturalH / 2);
      const sw = Math.min(naturalSize.w - sx, cropNaturalW);
      const sh = Math.min(naturalSize.h - sy, cropNaturalH);

      // Render ke canvas dengan background putih
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outputWidth, outputHeight);
      ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);

      // Konversi ke Blob & File
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }
          const file = new File([blob], `cropped_${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
          setIsProcessing(false);
          onCropComplete(file, dataUrl);
        },
        'image/jpeg',
        0.90
      );
    } catch (err) {
      console.error('Crop image error:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-[#1E3A8A] rounded-lg">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-none">{title}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Geser foto &amp; atur zoom agar posisi crop pas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Cropper Container */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-900 select-none">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            onWheel={handleWheel}
            style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px` }}
            className={`relative overflow-hidden cursor-grab active:cursor-grabbing border-2 border-white/60 shadow-inner ${
              showCircularMask && aspectRatio === 1 ? 'rounded-full' : 'rounded-2xl'
            }`}
          >
            {imageLoaded ? (
              <img
                src={imageSrc}
                alt="Crop View"
                draggable={false}
                style={{
                  width: `${dispW}px`,
                  height: `${dispH}px`,
                  transform: `translate(${offset.x + (viewportWidth - dispW) / 2}px, ${
                    offset.y + (viewportHeight - dispH) / 2
                  }px)`,
                  transition: isDragging ? 'none' : 'transform 0.05s ease-out'
                }}
                className="absolute top-0 left-0 max-w-none pointer-events-none"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="text-xs font-medium">Memuat gambar...</span>
              </div>
            )}

            {/* Grid Overlay Pembantu */}
            {imageLoaded && (
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-white/20" />
                <div className="border-r border-white/20" />
                <div />
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 text-slate-400 text-[11px]">
            <Move className="w-3.5 h-3.5" />
            <span>Klik &amp; geser untuk memposisikan foto</span>
          </div>
        </div>

        {/* Kontrol Zoom & Tools */}
        <div className="px-5 py-4 space-y-3.5 bg-white border-t border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const newZoom = Math.max(1, zoom - 0.2);
                setZoom(newZoom);
                setOffset((prev) => clampOffset(prev.x, prev.y, newZoom));
              }}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="1"
              max="3"
              step="0.02"
              value={zoom}
              onChange={(e) => {
                const newZoom = parseFloat(e.target.value);
                setZoom(newZoom);
                setOffset((prev) => clampOffset(prev.x, prev.y, newZoom));
              }}
              className="flex-1 accent-[#1E3A8A] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />

            <button
              onClick={() => {
                const newZoom = Math.min(3, zoom + 0.2);
                setZoom(newZoom);
                setOffset((prev) => clampOffset(prev.x, prev.y, newZoom));
              }}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
              title="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition ml-1"
              title="Kembalikan posisi & zoom awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 flex-wrap gap-2">
            {aspectRatio === 1 ? (
              <button
                type="button"
                onClick={() => setShowCircularMask(!showCircularMask)}
                className="text-[11px] font-semibold text-slate-600 hover:text-[#1E3A8A] flex items-center gap-1.5 transition"
              >
                <span className="w-3 h-3 rounded-full border border-slate-400 inline-block" />
                <span>{showCircularMask ? 'Tampilan: Lingkaran' : 'Tampilan: Persegi (1:1)'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium">Fokus Cepat:</span>
                <button
                  type="button"
                  onClick={() => setOffset((prev) => clampOffset(prev.x, -maxOffsetY, zoom))}
                  className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                >
                  Atas
                </button>
                <button
                  type="button"
                  onClick={() => setOffset((prev) => clampOffset(prev.x, 0, zoom))}
                  className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                >
                  Tengah
                </button>
                <button
                  type="button"
                  onClick={() => setOffset((prev) => clampOffset(prev.x, maxOffsetY, zoom))}
                  className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                >
                  Bawah
                </button>
              </div>
            )}

            <span className="text-[11px] text-slate-400">
              Output: {outputWidth}×{outputHeight}px
            </span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing || !imageLoaded}
            className="px-5 py-2 text-xs font-bold bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Terapkan Crop</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
