/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ViewRoute, User } from './types';
import { ucoStore } from './models/store';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { AbsencePage } from './components/AbsencePage';
import { InitializationPage } from './components/InitializationPage';
import { AdminLayout } from './components/AdminLayout';
import { AdminApprovalPage } from './components/AdminApprovalPage';
import { AdminAbsencePage } from './components/AdminAbsencePage';
import { FlaskDockerConsole } from './components/FlaskDockerConsole';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<ViewRoute>('logindepan');
  const [currentUser, setCurrentUser] = useState<User | null>(() => ucoStore.getCurrentUser());

  // Handle URL hash or direct parameter if present
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').replace('/', '');
      if (['logindepan', 'absence', 'init-absence', 'appsinit', 'databsen', 'flask-demo'].includes(hash)) {
        setCurrentRoute(hash as ViewRoute);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (route: ViewRoute) => {
    setCurrentRoute(route);
    window.location.hash = `#/${route}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: User, targetRoute: ViewRoute) => {
    ucoStore.setCurrentUser(user);
    setCurrentUser(user);
    navigateTo(targetRoute);
  };

  const handleLogout = () => {
    ucoStore.setCurrentUser(null);
    setCurrentUser(null);
    navigateTo('logindepan');
  };

  return (
    <div className="min-h-screen uco-gradient-bg flex flex-col text-slate-800 antialiased selection:bg-[#e9fb66] selection:text-[#3f48cc]">
      {/* Top Bar Navigation */}
      <Navbar
        currentRoute={currentRoute}
        onRouteChange={navigateTo}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main View Router under MVC pattern */}
      <main className="flex-1 flex flex-col justify-start">
        {currentRoute === 'logindepan' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === 'absence' && (
          <AbsencePage
            currentUser={currentUser}
            onNavigateToLogin={() => navigateTo('logindepan')}
            onNavigateToInit={() => navigateTo('init-absence')}
          />
        )}

        {currentRoute === 'init-absence' && (
          <InitializationPage
            currentUser={currentUser}
            onNavigateToLogin={() => navigateTo('logindepan')}
            onNavigateToAbsence={() => navigateTo('absence')}
          />
        )}

        {(currentRoute === 'appsinit' || currentRoute === 'databsen') && (
          <AdminLayout
            currentRoute={currentRoute}
            onRouteChange={navigateTo}
            currentUser={currentUser}
            onLogout={handleLogout}
          >
            {currentRoute === 'appsinit' ? (
              <AdminApprovalPage />
            ) : (
              <AdminAbsencePage />
            )}
          </AdminLayout>
        )}

        {currentRoute === 'flask-demo' && (
          <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
            <FlaskDockerConsole />
          </div>
        )}
      </main>

      {/* Footer bar */}
      <footer className="w-full py-4 px-4 bg-[#3f48cc]/90 text-white text-xs border-t-2 border-[rgb(233,251,102)] text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>UCO Presence MVC System</strong> · Port 35553 Flask Python API · SQLite <code>dataabsen.sqlite</code>
          </div>
          <div className="text-[11px] text-white/80">
            Gradasi Biru (63, 72, 204) & Garis Solid Jingga Terang (233, 251, 102)
          </div>
        </div>
      </footer>
    </div>
  );
}
