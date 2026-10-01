import React from 'react';
import { ViewRoute, User } from '../types';
import { InfoTooltip } from './InfoTooltip';
import {
  UserCheck,
  CalendarCheck2,
  Server,
  LogOut,
  Shield,
  LayoutDashboard,
} from 'lucide-react';

interface AdminLayoutProps {
  currentRoute: ViewRoute;
  onRouteChange: (route: ViewRoute) => void;
  currentUser: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentRoute,
  onRouteChange,
  currentUser,
  onLogout,
  children,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
      {/* Outer Card with border and split panels */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-4 border-[rgb(233,251,102)] overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#3f48cc] text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[rgb(233,251,102)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-[rgb(233,251,102)] border border-[rgb(233,251,102)]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Dashboard Administrator UCO
                </h1>
                <InfoTooltip content="Panel Administrator terpisah: Menu kiri untuk Approval Inisialisasi (/appsinit) dan Data Presensi (/databsen), serta Konsol Flask Python." />
              </div>
              <p className="text-xs text-white/80">
                Mode Kontrol Multi View Controller (MVC) Real-life Absence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/90 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 hidden md:inline">
              Admin: <strong className="text-[rgb(233,251,102)]">{currentUser?.realName || 'Administrator'}</strong>
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Dashboard Split Panels: Left Menu + Right Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          {/* Left Panel: Navigation Menus */}
          <aside className="lg:col-span-3 bg-slate-50 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r-2 border-slate-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 px-2 flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5 text-[#3f48cc]" />
                <span>Menu Administrator</span>
              </div>

              <nav className="space-y-1.5">
                {/* Menu 1: Approval Initializations (/appsinit) */}
                <button
                  type="button"
                  onClick={() => onRouteChange('appsinit')}
                  className={`w-full text-left p-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-3 transition-all ${
                    currentRoute === 'appsinit'
                      ? 'bg-[#3f48cc] text-white shadow-md border-2 border-[rgb(233,251,102)]'
                      : 'text-slate-700 hover:bg-slate-200/70 border border-transparent'
                  }`}
                >
                  <UserCheck className={`w-4 h-4 shrink-0 ${currentRoute === 'appsinit' ? 'text-[rgb(233,251,102)]' : 'text-[#3f48cc]'}`} />
                  <div className="flex-1 truncate">
                    <div>Approval Inisialisasi</div>
                    <div className="text-[10px] font-normal opacity-80">/appsinit (init-absence)</div>
                  </div>
                </button>

                {/* Menu 2: Data Absence Process (/databsen) */}
                <button
                  type="button"
                  onClick={() => onRouteChange('databsen')}
                  className={`w-full text-left p-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-3 transition-all ${
                    currentRoute === 'databsen'
                      ? 'bg-[#3f48cc] text-white shadow-md border-2 border-[rgb(233,251,102)]'
                      : 'text-slate-700 hover:bg-slate-200/70 border border-transparent'
                  }`}
                >
                  <CalendarCheck2 className={`w-4 h-4 shrink-0 ${currentRoute === 'databsen' ? 'text-[rgb(233,251,102)]' : 'text-[#3f48cc]'}`} />
                  <div className="flex-1 truncate">
                    <div>Data Proses Presensi</div>
                    <div className="text-[10px] font-normal opacity-80">/databsen (main-absence)</div>
                  </div>
                </button>

                {/* Menu 3: Flask Python API & Docker Hub Console */}
                <button
                  type="button"
                  onClick={() => onRouteChange('flask-demo')}
                  className={`w-full text-left p-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-3 transition-all ${
                    currentRoute === 'flask-demo'
                      ? 'bg-[#3f48cc] text-white shadow-md border-2 border-[rgb(233,251,102)]'
                      : 'text-slate-700 hover:bg-slate-200/70 border border-transparent'
                  }`}
                >
                  <Server className={`w-4 h-4 shrink-0 ${currentRoute === 'flask-demo' ? 'text-[rgb(233,251,102)]' : 'text-[#3f48cc]'}`} />
                  <div className="flex-1 truncate">
                    <div>Flask Core & Docker</div>
                    <div className="text-[10px] font-normal opacity-80">Port 35553 & SQLite</div>
                  </div>
                </button>
              </nav>
            </div>

            {/* Quick System Info in sidebar footer */}
            <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="font-mono font-bold text-slate-700">dataabsen.sqlite</span>
              </div>
              <div className="flex justify-between">
                <span>Flask Core API:</span>
                <span className="font-mono font-bold text-[#3f48cc]">Port 35553</span>
              </div>
              <div className="flex justify-between">
                <span>Architecture:</span>
                <span className="font-bold text-emerald-600">MVC Standard</span>
              </div>
            </div>
          </aside>

          {/* Right Panel: Content Area */}
          <main className="lg:col-span-9 p-4 sm:p-6 bg-white overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
