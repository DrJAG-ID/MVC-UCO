import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User, InitRecord } from '../types';
import { ucoStore } from '../models/store';
import { generateUserNumber, getCurrentDateStamp } from '../controllers/idGenerator';
import { InfoTooltip } from './InfoTooltip';
import {
  UserPlus,
  Camera,
  RefreshCw,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface InitializationPageProps {
  currentUser: User | null;
  onNavigateToLogin: () => void;
  onNavigateToAbsence: () => void;
}

export const InitializationPage: React.FC<InitializationPageProps> = ({
  currentUser,
  onNavigateToLogin,
  onNavigateToAbsence,
}) => {
  // Generated usernumber format: YYYYMMDD-XYZ
  const [userNumber, setUserNumber] = useState<string>(() => generateUserNumber());
  const [realName, setRealName] = useState<string>(currentUser ? currentUser.realName : '');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<InitRecord | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start front camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'user' }, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera inaccessible on init page', err);
      setCameraError('Kamera tidak dapat diakses langsung. Mode simulasi canvas aktif.');
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Capture canvas photo
  const handleCapturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 400;
        canvas.height = 300;

        if (video && cameraActive && video.videoWidth > 0) {
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();
        } else {
          // Generate realistic avatar canvas with name
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = '#3f48cc';
          ctx.beginPath();
          ctx.arc(200, 110, 55, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#e9fb66';
          ctx.beginPath();
          ctx.arc(200, 240, 85, 0, Math.PI, true);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(realName || 'Inisialisasi Pengguna', 200, 275);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoDataUrl(dataUrl);
      }
    }
  };

  const handleRerollId = () => {
    setUserNumber(generateUserNumber());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!realName.trim()) {
      setErrorMessage('Peringatan: Nama lengkap pengguna wajib diisi!');
      return;
    }

    if (!photoDataUrl) {
      setErrorMessage('Peringatan: Harap ambil foto profil terlebih dahulu melalui canvas/kamera!');
      return;
    }

    const dateStamp = getCurrentDateStamp();
    const newRecord = ucoStore.addInitAbsence({
      userNumber,
      realName: realName.trim(),
      thumbnailPhoto: photoDataUrl,
      dateStamp,
    });

    setSubmittedRecord(newRecord);
    setIsSubmitted(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-4 border-[rgb(233,251,102)] overflow-hidden">
        {/* Header */}
        <div className="bg-[#3f48cc] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[rgb(233,251,102)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 text-[rgb(233,251,102)] border border-[rgb(233,251,102)]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  Inisialisasi Pengguna Baru
                </h1>
                <InfoTooltip content="Pendaftaran ID format YYYYMMDD-XYZ. Data disimpan ke database sqlite3 init-absence untuk verifikasi administrator." />
              </div>
              <p className="text-xs text-white/80">
                Pendaftaran & Registrasi Foto untuk Akses Presensi UCO
              </p>
            </div>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-800 text-xs sm:text-sm font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Form Fields: UserNumber & RealName */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* UserNumber Format: YYYYMMDD-XYZ */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Nomor ID (YYYYMMDD-XYZ)
                </label>
                <InfoTooltip content="Nomor ID standar UCO: 4 digit tahun + 2 digit bulan + 2 digit hari + 3 digit hexadecimal acak." />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={userNumber}
                  className="flex-1 px-3.5 py-2.5 rounded-lg border-2 border-slate-300 bg-slate-100 font-mono font-bold text-sm text-[#3f48cc] outline-none"
                />
                <button
                  type="button"
                  onClick={handleRerollId}
                  title="Acak ulang 3 digit hex XYZ"
                  className="px-3 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 border border-slate-300"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Acak</span>
                </button>
              </div>
            </div>

            {/* Real Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Nama Lengkap
                </label>
                <InfoTooltip content="Tuliskan nama lengkap pengguna sesuai kartu identitas atau administrasi." />
              </div>
              <input
                type="text"
                required
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="misal: Ahmad Fauzi"
                className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 focus:border-[#3f48cc] focus:ring-2 focus:ring-[rgb(233,251,102)] text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Canvas Picture Taking Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Pengambilan Foto Canvas Registrasi
              </label>
              <InfoTooltip content="Ambil foto wajah menggunakan kamera depan atau simulasi canvas untuk database init-absence." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Camera Stream */}
              <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-4/3 flex items-center justify-center border-2 border-[rgb(233,251,102)] shadow-sm">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />

                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-36 h-48 rounded-[45%] border-2 border-dashed border-[rgb(233,251,102)] bg-black/10" />
                  <span className="mt-1 text-[10px] text-white/80 bg-black/50 px-2 py-0.5 rounded">
                    Kamera Depan
                  </span>
                </div>

                {cameraError && (
                  <div className="absolute bottom-1 left-1 right-1 p-1.5 bg-slate-900/90 text-amber-300 text-[10px] text-center rounded">
                    {cameraError}
                  </div>
                )}
              </div>

              {/* Snapshot Preview */}
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-100 border-2 border-slate-300 aspect-4/3 relative">
                {photoDataUrl ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <img
                      src={photoDataUrl}
                      alt="Foto Inisialisasi"
                      className="max-h-[82%] rounded-lg shadow border-2 border-[#3f48cc] object-contain"
                    />
                    <div className="mt-1.5 text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Foto Terambil</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Camera className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <div className="text-xs font-bold text-slate-600">
                      Klik "Ambil Foto Canvas"
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Foto akan dijadikan thumbnail profil ID
                    </div>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>

            {/* Photo Action Buttons */}
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="px-4 py-2 rounded-lg bg-[#3f48cc] hover:bg-[#3239a0] text-[rgb(233,251,102)] font-bold text-xs shadow border border-[rgb(233,251,102)] flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Ambil Foto Canvas</span>
              </button>

              {photoDataUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoDataUrl(null)}
                  className="px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs"
                >
                  Ulang
                </button>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              * Registrasi memerlukan persetujuan Administrator di halaman <code>/appsinit</code>.
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300"
              >
                Batal
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-[#3f48cc] hover:bg-[#3239a0] text-white font-extrabold text-xs shadow-md border-2 border-[rgb(233,251,102)] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4 text-[rgb(233,251,102)]" />
                <span>Kirim Registrasi</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {isSubmitted && submittedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-4 border-[rgb(233,251,102)] text-center animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 border-2 border-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-extrabold text-[#3f48cc]">
              Pendaftaran Inisialisasi Terkirim!
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Data pendaftaran telah masuk ke tabel <code>init-absence</code> (SQLite: <code>dataabsen.sqlite</code>).
            </p>

            <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Nomor ID Terbit:</span>
                <span className="font-mono font-bold text-[#3f48cc]">{submittedRecord.userNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Pengguna:</span>
                <span className="font-bold text-slate-800">{submittedRecord.realName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Awal:</span>
                <span className="font-bold text-amber-600 uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Menunggu Approval Admin
                </span>
              </div>
              <div className="pt-2 flex justify-center">
                <img
                  src={submittedRecord.thumbnailPhoto}
                  alt="Thumbnail Foto"
                  className="w-20 h-20 rounded-lg object-cover border border-slate-300 shadow-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  onNavigateToLogin();
                }}
                className="flex-1 py-2.5 rounded-lg bg-[#3f48cc] text-white font-bold text-xs border border-[rgb(233,251,102)]"
              >
                Ke Halaman Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  // Quick reroll for testing another init
                  handleRerollId();
                  setPhotoDataUrl(null);
                }}
                className="py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Daftar Lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
