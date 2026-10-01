import React from 'react';
import { ViewRoute, User } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface NavbarProps {
  currentRoute: ViewRoute;
  onRouteChange: (route: ViewRoute) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onRouteChange,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#3f48cc]/95 backdrop-blur-md border-b-2 border-[rgb(233,251,102)] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onRouteChange('logindepan')}
            className="text-lg sm:text-xl font-extrabold tracking-tight text-white hover:text-[rgb(233,251,102)] transition-colors text-left"
          >
            UCO Presence MVC
          </button>
          <InfoTooltip content="Sistem Presensi Real-life MVC berbasis Web & Flask Python API (Port 35553) dengan liveness check suara Indonesia." />
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onRouteChange('logindepan')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              currentRoute === 'logindepan'
                ? 'bg-[rgb(233,251,102)] text-[#3f48cc]'
                : 'text-white hover:text-[rgb(233,251,102)]'
            }`}
          >
            Login
          </button>

          <button
            onClick={() => onRouteChange('absence')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              currentRoute === 'absence'
                ? 'bg-[rgb(233,251,102)] text-[#3f48cc]'
                : 'text-white hover:text-[rgb(233,251,102)]'
            }`}
          >
            Absensi
          </button>

          <button
            onClick={() => onRouteChange('init-absence')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              currentRoute === 'init-absence'
                ? 'bg-[rgb(233,251,102)] text-[#3f48cc]'
                : 'text-white hover:text-[rgb(233,251,102)]'
            }`}
          >
            Inisialisasi
          </button>

          <button
            onClick={() => onRouteChange('appsinit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              currentRoute === 'appsinit' || currentRoute === 'databsen'
                ? 'bg-[rgb(233,251,102)] text-[#3f48cc]'
                : 'text-white hover:text-[rgb(233,251,102)]'
            }`}
          >
            Admin Panel
          </button>

          <button
            onClick={() => onRouteChange('flask-demo')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              currentRoute === 'flask-demo'
                ? 'bg-[rgb(233,251,102)] text-[#3f48cc]'
                : 'text-white hover:text-[rgb(233,251,102)]'
            }`}
          >
            API & Docker
          </button>
        </nav>

        {/* Zone 3: Primary Action / User badge */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/90 font-medium hidden sm:inline truncate max-w-[120px]">
                {currentUser.realName}
              </span>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 text-xs font-bold rounded bg-rose-600 hover:bg-rose-700 text-white transition-colors whitespace-nowrap"
              >
                Keluar
              </button>
            </div>
          ) : (
            <button
              onClick={() => onRouteChange('logindepan')}
              className="px-3.5 py-1.5 text-xs font-bold rounded bg-[rgb(233,251,102)] text-[#3f48cc] hover:bg-white transition-colors whitespace-nowrap shadow-sm border border-[rgb(233,251,102)]"
            >
              Masuk
            </button>
          )}

          {/* Mobile menu dropdown trigger */}
          <div className="md:hidden flex items-center">
            <select
              value={currentRoute}
              onChange={(e) => onRouteChange(e.target.value as ViewRoute)}
              aria-label="Pilih Halaman Menu"
              className="bg-[#3f48cc] border border-[rgb(233,251,102)] text-white text-xs rounded px-2 py-1 focus:outline-none"
            >
              <option value="logindepan">Login</option>
              <option value="absence">Absensi</option>
              <option value="init-absence">Inisialisasi</option>
              <option value="appsinit">Admin Appsinit</option>
              <option value="databsen">Admin Databsen</option>
              <option value="flask-demo">API & Docker</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
