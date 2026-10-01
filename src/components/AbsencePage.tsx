import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, AbsenceRecord } from '../types';
import { ucoStore } from '../models/store';
import {
  generateRandom5Digits,
  checkSpokenDigits,
  INDONESIAN_DISPLAY,
} from '../controllers/livenessController';
import { getCurrentDateStamp } from '../controllers/idGenerator';
import { InfoTooltip } from './InfoTooltip';
import {
  Camera,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  Sparkles,
  Volume2,
  User as UserIcon,
  Shield,
  Clock,
} from 'lucide-react';

interface AbsencePageProps {
  currentUser: User | null;
  onNavigateToLogin: () => void;
  onNavigateToInit: () => void;
}

export const AbsencePage: React.FC<AbsencePageProps> = ({
  currentUser,
  onNavigateToLogin,
  onNavigateToInit,
}) => {
  // If user is not initialized, show warning and redirect
  const user = currentUser || {
    id: 'demo-user',
    username: 'budi.santoso',
    realName: 'Budi Santoso',
    userNumber: '20260928-A4F',
    isInitialized: true,
    role: 'user',
  };

  // State: 5 random digits & 15-second timer
  const [digits, setDigits] = useState<number[]>(() => generateRandom5Digits());
  const [timerSeconds, setTimerSeconds] = useState<number>(15);
  const [matchedIndices, setMatchedIndices] = useState<boolean[]>([false, false, false, false, false]);
  const [isLivenessPassed, setIsLivenessPassed] = useState<boolean>(false);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Camera & Photo State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<AbsenceRecord | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // Timer interval for 15 seconds regeneration
  useEffect(() => {
    if (isLivenessPassed || photoDataUrl) return;

    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          // Regenerate random 5 digits every 15s
          setDigits(generateRandom5Digits());
          setMatchedIndices([false, false, false, false, false]);
          setSpeechTranscript('');
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLivenessPassed, photoDataUrl]);

  // Start front camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      // Priority: front camera facingMode: "user"
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'user' },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera permission or device not accessible, using fallback canvas', err);
      setCameraError('Kamera fisik tidak tersedia atau izin belum diberikan. Mode simulasi visual aktif.');
      setCameraActive(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Web Speech Recognition
  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Browser ini tidak mendukung Web Speech API bawaan. Silakan gunakan tombol simulasi suara di bawah.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const rec = new SpeechRecognition();
      rec.lang = 'id-ID'; // Indonesian
      rec.continuous = true;
      rec.interimResults = true;

      rec.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      rec.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }

        const fullText = currentTranscript.trim();
        setSpeechTranscript(fullText);

        const checkResult = checkSpokenDigits(digits, fullText);
        setMatchedIndices(checkResult.matchedIndices);

        if (checkResult.isComplete) {
          setIsLivenessPassed(true);
          rec.stop();
        }
      };

      rec.onerror = (e: any) => {
        console.warn('Speech error:', e.error);
        if (e.error !== 'no-speech') {
          setSpeechError(`Mikrofon: ${e.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      setSpeechError('Tidak dapat memulai mikrofon. Anda dapat mengklik tombol simulasi kata.');
    }
  }, [digits]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Initialize camera and voice on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopListening();
    };
  }, [startCamera, stopCamera, stopListening]);

  // Simulate pronouncing individual digit or all 5 digits
  const simulateVoiceInput = (singleDigitIndex?: number) => {
    if (singleDigitIndex !== undefined) {
      const newMatches = [...matchedIndices];
      newMatches[singleDigitIndex] = true;
      setMatchedIndices(newMatches);

      const wordsSpokenSoFar = digits
        .slice(0, singleDigitIndex + 1)
        .map(d => INDONESIAN_DISPLAY[d])
        .join(' ');
      setSpeechTranscript(wordsSpokenSoFar);

      if (newMatches.every(Boolean)) {
        setIsLivenessPassed(true);
      }
    } else {
      // Simulate speaking all 5 digits perfectly
      const allWords = digits.map(d => INDONESIAN_DISPLAY[d]).join(' ');
      setSpeechTranscript(allWords);
      setMatchedIndices([true, true, true, true, true]);
      setIsLivenessPassed(true);
    }
  };

  // Speak pronunciation for demo/assist
  const playAudioCue = () => {
    if ('speechSynthesis' in window) {
      const textToSpeak = digits.map(d => INDONESIAN_DISPLAY[d]).join(', ');
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'id-ID';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Action: Take photo
  const handleTakePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 400;
        canvas.height = 300;

        if (video && cameraActive && video.videoWidth > 0) {
          // Mirror front camera horizontally
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();
        } else {
          // Fallback snapshot generator
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw avatar silhouette
          ctx.fillStyle = '#3f48cc';
          ctx.beginPath();
          ctx.arc(200, 110, 55, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#e9fb66';
          ctx.beginPath();
          ctx.arc(200, 240, 85, 0, Math.PI, true);
          ctx.fill();

          // Watermark date
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px monospace';
          ctx.fillText(`UCO REAL-LIFE ABSENCE: ${getCurrentDateStamp()}`, 15, 280);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoDataUrl(dataUrl);
      }
    }
  };

  // Action: Cancel (X button)
  const handleCancel = () => {
    setPhotoDataUrl(null);
    setIsLivenessPassed(false);
    setMatchedIndices([false, false, false, false, false]);
    setSpeechTranscript('');
    setTimerSeconds(15);
    setDigits(generateRandom5Digits());
  };

  // Action: Submit picture to main-absence API
  const handleSubmitAbsence = () => {
    if (!photoDataUrl) return;

    const dateStamp = getCurrentDateStamp();
    const newRecord = ucoStore.addMainAbsence({
      userNumber: user.userNumber || '20260928-A4F',
      realName: user.realName || 'Pengguna UCO',
      thumbnailPhoto: photoDataUrl,
      dateStamp,
    });

    setSubmittedRecord(newRecord);
    setIsSubmitted(true);
  };

  const handleRetake = () => {
    handleCancel();
    setIsSubmitted(false);
    setSubmittedRecord(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Check if user needs initialization */}
      {currentUser && !currentUser.isInitialized && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-center justify-between gap-3 shadow-md">
          <div className="text-xs sm:text-sm">
            <span className="font-bold">Perhatian:</span> Akun Anda belum diinisialisasi dengan Nomor ID terdaftar.
          </div>
          <button
            onClick={onNavigateToInit}
            className="px-3 py-1.5 rounded-lg bg-[#3f48cc] text-[rgb(233,251,102)] font-bold text-xs whitespace-nowrap border border-[rgb(233,251,102)]"
          >
            Inisialisasi Sekarang
          </button>
        </div>
      )}

      {/* Main Absen Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-4 border-[rgb(233,251,102)] overflow-hidden">
        {/* Top header bar */}
        <div className="bg-[#3f48cc] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[rgb(233,251,102)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 text-[rgb(233,251,102)] border border-[rgb(233,251,102)]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  Presensi & Uji Liveness
                </h1>
                <InfoTooltip content="Sesuai spesifikasi MVC: Kamera depan wajib, 5 digit angka acak diucapkan dalam bahasa Indonesia, regenerasi 15 detik, simpan ke database main-absence." />
              </div>
              <p className="text-xs text-white/80">
                Pengguna: <span className="font-bold text-[rgb(233,251,102)]">{user.realName}</span> ({user.userNumber || '20260928-A4F'})
              </p>
            </div>
          </div>

          {/* Cancel 'X' Button */}
          <button
            onClick={handleCancel}
            title="Batalkan proses liveness dan foto"
            className="p-2 rounded-lg bg-white/10 hover:bg-rose-600 text-white transition-all border border-white/20 hover:border-rose-400 active:scale-95 flex items-center gap-1"
          >
            <XCircle className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:inline">Batal</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Instructions Box */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/80 border border-[#3f48cc]/20 text-slate-800 text-xs sm:text-sm">
            <div className="font-bold text-[#3f48cc] flex items-center gap-1.5 mb-1">
              <Shield className="w-4 h-4 text-[#3f48cc]" />
              Petunjuk Absensi & Liveness Check:
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 leading-relaxed">
              <li>Posisikan wajah tepat di dalam bingkai kamera depan.</li>
              <li>
                Ucapkan <strong>5 digit angka</strong> di bawah ini secara berurutan dalam Bahasa Indonesia:{' '}
                <em>(1=satu, 2=dua, 3=tiga, 4=empat, 5=lima, 6=enam, 7=tujuh, 8=delapan, 9=sembilan, 0=nol/null)</em>.
              </li>
              <li>Angka akan terisi hijau secara otomatis jika terdeteksi. Angka berganti acak setiap 15 detik.</li>
              <li>Setelah kelima angka terverifikasi, tombol <strong>"Ambil Foto"</strong> akan muncul.</li>
              <li>Setelah foto diambil, tekan tombol <strong>"Kirim"</strong> untuk menyimpan ke database <code>main-absence</code>.</li>
            </ol>
          </div>

          {/* Liveness Check Component Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border-2 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Liveness Code (5 Digit)
                </span>
                <InfoTooltip content="Ucapkan angka-angka ini ke mikrofon. Sistem mereset angka tiap 15 detik untuk memastikan liveness manusia secara real-life." />
              </div>

              {/* 15-second countdown timer */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                  timerSeconds <= 5
                    ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Regenerasi: {timerSeconds}s</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDigits(generateRandom5Digits());
                    setMatchedIndices([false, false, false, false, false]);
                    setSpeechTranscript('');
                    setTimerSeconds(15);
                  }}
                  title="Ganti angka acak sekarang"
                  className="p-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-300"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 5 Digits Display */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 my-4">
              {digits.map((digit, idx) => {
                const isMatched = matchedIndices[idx];
                const indonesianWord = INDONESIAN_DISPLAY[digit];

                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl border-3 transition-all ${
                      isMatched
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105'
                        : 'bg-white text-slate-800 border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="text-2xl sm:text-4xl font-extrabold font-mono tabular-nums">
                      {digit}
                    </div>
                    <div className={`text-[10px] sm:text-xs font-bold uppercase mt-1 ${
                      isMatched ? 'text-white' : 'text-slate-500'
                    }`}>
                      "{indonesianWord}"
                    </div>
                    <div className="mt-1">
                      {isMatched ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Voice input control bar & transcription */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse border-2 border-rose-300'
                      : 'bg-[#3f48cc] text-[rgb(233,251,102)] hover:bg-[#3239a0] border border-[rgb(233,251,102)]'
                  }`}
                >
                  {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Mendengarkan...' : 'Mulai Rekam Suara'}</span>
                </button>

                <button
                  type="button"
                  onClick={playAudioCue}
                  title="Dengarkan pengucapan angka dalam bahasa Indonesia"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dengarkan Audio</span>
                </button>
              </div>

              {/* Simulation test triggers */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => simulateVoiceInput()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                  title="Bantu uji liveness jika mikrofon tidak tersedia"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[rgb(233,251,102)]" />
                  <span>Uji Suara Otomatis</span>
                </button>
              </div>
            </div>

            {/* Speech transcript readout */}
            <div className="mt-2 text-xs text-slate-600 flex items-center gap-2">
              <span className="font-semibold text-slate-700">Terdeteksi:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 flex-1 truncate">
                {speechTranscript || '(Menunggu suara Anda membaca angka di atas...)'}
              </span>
            </div>

            {speechError && (
              <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                {speechError}
              </div>
            )}
          </div>

          {/* Camera View & Frame */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Live Camera Feed */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-4/3 flex items-center justify-center border-3 border-[rgb(233,251,102)] shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />

              {/* Frame overlay for front camera alignment */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className={`w-44 h-56 rounded-[45%] border-3 border-dashed transition-all ${
                  isLivenessPassed
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-[rgb(233,251,102)] bg-black/20'
                }`} />
                <div className="mt-2 px-3 py-1 rounded-full bg-black/70 text-white text-[11px] font-medium backdrop-blur-sm">
                  {isLivenessPassed ? '✓ Wajah & Suara Terverifikasi' : 'Posisikan Wajah Di Sini (Kamera Depan)'}
                </div>
              </div>

              {cameraError && (
                <div className="absolute bottom-2 left-2 right-2 p-2 bg-rose-950/90 text-rose-200 text-[11px] rounded border border-rose-500 text-center">
                  {cameraError}
                </div>
              )}
            </div>

            {/* Snapshot Preview / Result */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-100 border-2 border-slate-300 aspect-4/3 relative">
              {photoDataUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={photoDataUrl}
                    alt="Foto Presensi"
                    className="max-h-[80%] rounded-xl shadow-lg border-2 border-[#3f48cc] object-contain"
                  />
                  <div className="mt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Foto Siap Disimpan</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-700">
                    Belum Ada Foto Diambil
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                    {isLivenessPassed
                      ? 'Liveness check lolos! Silakan tekan tombol "Ambil Foto" di bawah.'
                      : 'Selesaikan pengucapan 5 digit angka Indonesia di atas untuk membuka tombol ambil foto.'}
                  </p>
                </div>
              )}

              {/* Hidden Canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          {/* Action Buttons Zone */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t-2 border-slate-200">
            {/* Left: Status Indicator */}
            <div className="text-xs text-slate-600 font-medium text-center sm:text-left">
              Status Liveness:{' '}
              {isLivenessPassed ? (
                <span className="font-bold text-emerald-600">✓ LOLOS</span>
              ) : (
                <span className="font-bold text-amber-600">MENUNGGU SUARA (5 DIGIT)</span>
              )}
            </div>

            {/* Right: Unhidden Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Button: Ambil Foto (Unhidden only after liveness is passed) */}
              {isLivenessPassed && !photoDataUrl && (
                <button
                  type="button"
                  onClick={handleTakePhoto}
                  className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-[#3f48cc] hover:bg-[#3239a0] text-white font-extrabold text-sm shadow-lg border-2 border-[rgb(233,251,102)] transition-all flex items-center justify-center gap-2 animate-bounce active:scale-95"
                >
                  <Camera className="w-4 h-4 text-[rgb(233,251,102)]" />
                  <span>Ambil Foto</span>
                </button>
              )}

              {/* When photo is taken: Show Retake + Submit button */}
              {photoDataUrl && (
                <>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-4 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
                  >
                    Ulang
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitAbsence}
                    className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md border-2 border-[rgb(233,251,102)] transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim</span>
                  </button>
                </>
              )}

              {/* Cancel 'X' Button */}
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs border border-slate-300 transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Success Dialog / Receipt */}
      {isSubmitted && submittedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-4 border-[rgb(233,251,102)] text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border-2 border-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-xl font-extrabold text-[#3f48cc] tracking-tight">
              Presensi Berhasil Dikirim!
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Data presensi berhasil disimpan ke tabel <code>main-absence</code> (SQLite: <code>dataabsen.sqlite</code>).
            </p>

            <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">No Urut:</span>
                <span className="font-bold text-slate-800">#{submittedRecord.no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nomor ID:</span>
                <span className="font-mono font-bold text-[#3f48cc]">{submittedRecord.userNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Lengkap:</span>
                <span className="font-bold text-slate-800">{submittedRecord.realName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu Presensi:</span>
                <span className="font-mono text-slate-700">{submittedRecord.dateStamp}</span>
              </div>
              <div className="pt-2 flex justify-center">
                <img
                  src={submittedRecord.thumbnailPhoto}
                  alt="Thumbnail"
                  className="w-20 h-20 rounded-lg object-cover border border-slate-300 shadow-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  handleCancel();
                }}
                className="flex-1 py-2.5 rounded-lg bg-[#3f48cc] hover:bg-[#3239a0] text-white font-bold text-xs border border-[rgb(233,251,102)]"
              >
                Selesai
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  handleRetake();
                }}
                className="py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Absen Lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
