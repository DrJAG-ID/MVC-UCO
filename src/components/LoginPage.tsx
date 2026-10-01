import React, { useState } from 'react';
import { ucoStore } from '../models/store';
import { User, ViewRoute } from '../types';
import { InfoTooltip } from './InfoTooltip';
import { AlertCircle, UserCheck, ShieldCheck, LogIn, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User, targetRoute: ViewRoute) => void;
  onNavigate: (route: ViewRoute) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [tab, setTab] = useState<'user' | 'admin'>('user');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Error warning
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Peringatan: Username dan password wajib diisi!');
      return;
    }

    const user = ucoStore.findUser(username);

    if (!user || user.password !== password || user.role !== 'user') {
      setErrorMessage('Peringatan: Username dan password pengguna tidak cocok atau tidak terdaftar!');
      return;
    }

    // Check initialization data for user
    if (user.isInitialized && user.userNumber) {
      // Go to absence-page
      onLoginSuccess(user, 'absence');
    } else {
      // Don't have initialization -> go to initialization-page
      onLoginSuccess(user, 'init-absence');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!adminUsername.trim() || !adminPassword.trim()) {
      setErrorMessage('Peringatan: Username admin dan password wajib diisi!');
      return;
    }

    const admin = ucoStore.findUser(adminUsername);

    if (!admin || admin.password !== adminPassword || admin.role !== 'admin') {
      setErrorMessage('Peringatan: Kredensial Administrator tidak cocok!');
      return;
    }

    // Passed -> go to admin-pages (/appsinit)
    onLoginSuccess(admin, 'appsinit');
  };

  // Helper to prefill demo accounts
  const prefill = (u: string, p: string, role: 'user' | 'admin') => {
    setErrorMessage(null);
    if (role === 'user') {
      setTab('user');
      setUsername(u);
      setPassword(p);
    } else {
      setTab('admin');
      setAdminUsername(u);
      setAdminPassword(p);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8">
      {/* Card container with gradation and solid lining border */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-4 border-[rgb(233,251,102)] p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#3f48cc] text-[rgb(233,251,102)] border-2 border-[rgb(233,251,102)] shadow-md mb-3">
            <LogIn className="w-8 h-8" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3f48cc] tracking-tight">
              Portal Masuk UCO
            </h1>
            <InfoTooltip content="Gerbang autentikasi MVC. Pengguna terdaftar dialihkan ke Absensi; pengguna baru diarahkan ke Inisialisasi ID." />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Sistem Presensi Multi View Controller & Flask Python Core
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setTab('user');
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              tab === 'user'
                ? 'bg-[#3f48cc] text-white shadow-md border-2 border-[rgb(233,251,102)]'
                : 'text-slate-600 hover:text-[#3f48cc]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Login Pengguna</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('admin');
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              tab === 'admin'
                ? 'bg-[#3f48cc] text-white shadow-md border-2 border-[rgb(233,251,102)]'
                : 'text-slate-600 hover:text-[#3f48cc]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Login Admin</span>
          </button>
        </div>

        {/* Error warning notification */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* User Login Form */}
        {tab === 'user' && (
          <form onSubmit={handleUserLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Username Pengguna
                </label>
                <InfoTooltip content="Gunakan username akun Anda (contoh: budi.santoso atau akun baru ahmad.fauzi)." />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="misal: budi.santoso"
                className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 focus:border-[#3f48cc] focus:ring-2 focus:ring-[rgb(233,251,102)] text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Kata Sandi
                </label>
                <InfoTooltip content="Ketikkan kata sandi Anda. Default demo: password123" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 focus:border-[#3f48cc] focus:ring-2 focus:ring-[rgb(233,251,102)] text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-all"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-lg bg-[#3f48cc] hover:bg-[#3239a0] text-white font-bold text-sm shadow-md border-2 border-[rgb(233,251,102)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsername('');
                  setPassword('');
                  setErrorMessage(null);
                }}
                className="py-3 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm border border-slate-300 transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {/* Admin Login Form */}
        {tab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Username Administrator
                </label>
                <InfoTooltip content="Gunakan kredensial admin: 'admin' dan password 'admin123'." />
              </div>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 focus:border-[#3f48cc] focus:ring-2 focus:ring-[rgb(233,251,102)] text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Kata Sandi Admin
                </label>
                <InfoTooltip content="Kata sandi akun admin. Default: admin123" />
              </div>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border-2 border-slate-300 focus:border-[#3f48cc] focus:ring-2 focus:ring-[rgb(233,251,102)] text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-all"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-lg bg-[#3f48cc] hover:bg-[#3239a0] text-white font-bold text-sm shadow-md border-2 border-[rgb(233,251,102)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Masuk Admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdminUsername('');
                  setAdminPassword('');
                  setErrorMessage(null);
                }}
                className="py-3 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm border border-slate-300 transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {/* Demo Quick-Fill Assistants */}
        <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#3f48cc]" />
            <span>Pilih Akun Demo UCO</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => prefill('budi.santoso', 'password123', 'user')}
              className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-[#3f48cc] bg-slate-50 hover:bg-blue-50/50 transition-all text-xs"
            >
              <div className="font-bold text-slate-800">Budi Santoso</div>
              <div className="text-[11px] text-emerald-600 font-medium">Terinisialisasi → Absen</div>
            </button>

            <button
              type="button"
              onClick={() => prefill('ahmad.fauzi', 'password123', 'user')}
              className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-[#3f48cc] bg-slate-50 hover:bg-amber-50/50 transition-all text-xs"
            >
              <div className="font-bold text-slate-800">Ahmad Fauzi</div>
              <div className="text-[11px] text-amber-600 font-medium">Belum Inisialisasi → Daftar</div>
            </button>

            <button
              type="button"
              onClick={() => prefill('admin', 'admin123', 'admin')}
              className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-[#3f48cc] bg-slate-50 hover:bg-purple-50/50 transition-all text-xs"
            >
              <div className="font-bold text-slate-800">Administrator</div>
              <div className="text-[11px] text-[#3f48cc] font-medium">Admin → Panel Approval</div>
            </button>
          </div>
        </div>

        {/* Direct link to Registration */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Belum memiliki nomor ID terdaftar?{' '}
            <button
              type="button"
              onClick={() => onNavigate('init-absence')}
              className="font-bold text-[#3f48cc] hover:underline"
            >
              Buka Form Inisialisasi ID
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
