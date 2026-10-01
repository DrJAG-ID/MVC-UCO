-- ==============================================================
-- SQLite3 Database Schema & Seeds for: dataabsen.sqlite
-- Multi View Controller (MVC) UCO Demonstration
-- ==============================================================

-- 1. Table: "main-absence"
-- Header columns: no, usernumber/ID, real name, thumbnail photo, date stamp
CREATE TABLE IF NOT EXISTS "main-absence" (
  no INTEGER PRIMARY KEY AUTOINCREMENT,
  "usernumber/ID" TEXT NOT NULL,
  "real name" TEXT NOT NULL,
  "thumbnail photo" TEXT NOT NULL,
  "date stamp" TEXT NOT NULL
);

-- 2. Table: "init-absence"
-- Header columns: no, usernumber/ID, real name, thumbnail photo, date stamp, status
CREATE TABLE IF NOT EXISTS "init-absence" (
  no INTEGER PRIMARY KEY AUTOINCREMENT,
  "usernumber/ID" TEXT NOT NULL,
  "real name" TEXT NOT NULL,
  "thumbnail photo" TEXT NOT NULL,
  "date stamp" TEXT NOT NULL,
  status TEXT DEFAULT 'pending'
);

-- Initial seed data for "main-absence"
INSERT INTO "main-absence" ("usernumber/ID", "real name", "thumbnail photo", "date stamp") VALUES 
('20260928-A4F', 'Budi Santoso', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%233f48cc"/><text x="30" y="35" fill="white" font-size="14" text-anchor="middle">BS</text></svg>', '2026-10-01 07:15:32'),
('20260929-B12', 'Siti Rahmawati', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%231d4ed8"/><text x="30" y="35" fill="white" font-size="14" text-anchor="middle">SR</text></svg>', '2026-10-01 07:22:18'),
('20260930-7CE', 'Dewi Lestari', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%234338ca"/><text x="30" y="35" fill="white" font-size="14" text-anchor="middle">DL</text></svg>', '2026-10-01 07:48:50');

-- Initial seed data for "init-absence"
INSERT INTO "init-absence" ("usernumber/ID", "real name", "thumbnail photo", "date stamp", status) VALUES 
('20261001-C3D', 'Rian Pratama', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%233f48cc"/><text x="30" y="35" fill="white" font-size="14" text-anchor="middle">RP</text></svg>', '2026-10-01 07:45:12', 'pending'),
('20261001-F9A', 'Nurul Hidayah', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%232563eb"/><text x="30" y="35" fill="white" font-size="14" text-anchor="middle">NH</text></svg>', '2026-10-01 08:12:45', 'pending');
