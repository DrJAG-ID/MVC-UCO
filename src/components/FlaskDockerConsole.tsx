import React, { useState } from 'react';
import { ucoStore } from '../models/store';
import { InfoTooltip } from './InfoTooltip';
import {
  Server,
  Play,
  Terminal,
  FileCode,
  Box,
  Database,
  GitBranch,
  Copy,
  Check,
  Download,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { getCurrentDateStamp } from '../controllers/idGenerator';

export const FlaskDockerConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tester' | 'apppy' | 'docker' | 'sqlite' | 'git'>('tester');
  const [copied, setCopied] = useState<string | null>(null);

  // Test Runner States
  const [testMethod, setTestMethod] = useState<'GET' | 'POST'>('GET');
  const [testEndpoint, setTestEndpoint] = useState<string>('/');
  const [testRequestBody, setTestRequestBody] = useState<string>('{}');
  const [logs, setLogs] = useState<string[]>([
    `[${getCurrentDateStamp()}] [INFO] Gunicorn worker spawned on 0.0.0.0:35553`,
    `[${getCurrentDateStamp()}] [INFO] Connected to SQLite database 'dataabsen.sqlite'`,
    `[${getCurrentDateStamp()}] [INFO] Table 'main-absence' verified: [no, usernumber/ID, real name, thumbnail photo, date stamp]`,
    `[${getCurrentDateStamp()}] [INFO] Table 'init-absence' verified: [no, usernumber/ID, real name, thumbnail photo, date stamp]`,
    `[${getCurrentDateStamp()}] [INFO] Flask REST API ready on port 35553`,
  ]);
  const [apiResponse, setApiResponse] = useState<any>({
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: '<h1>Hello, World! UCO DEMO </h1>',
    latencyMs: 14,
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRunTest = (route: string, method: 'GET' | 'POST' = 'GET', customBody?: any) => {
    const timestamp = getCurrentDateStamp();
    const start = performance.now();

    let resStatus = 200;
    let resBody: any = null;
    let logMsg = '';

    if (route === '/') {
      resBody = '<h1>Hello, World! UCO DEMO </h1>';
      logMsg = `[${timestamp}] [DEBUG] GET / - 200 OK (Hello world print UCO DEMO)`;
    } else if (route === '/logindepan') {
      resBody = {
        message: 'Halaman Login & Landing Page UCO',
        route: '/logindepan',
        assets: ['css', 'html', 'javascript'],
        status: 'ready',
      };
      logMsg = `[${timestamp}] [DEBUG] GET /logindepan - 200 OK (Loaded login & admin view)`;
    } else if (route === '/appsinit') {
      const data = ucoStore.getInitAbsences();
      resBody = {
        route: '/appsinit',
        count: data.length,
        data: data.slice(0, 5),
      };
      logMsg = `[${timestamp}] [DEBUG] GET /appsinit - 200 OK (Retrieved ${data.length} init records)`;
    } else if (route === '/databsen') {
      const data = ucoStore.getMainAbsences();
      resBody = {
        route: '/databsen',
        count: data.length,
        data: data.slice(0, 5),
      };
      logMsg = `[${timestamp}] [DEBUG] GET /databsen - 200 OK (Retrieved ${data.length} absence records)`;
    } else if (route === '/main-absence' && method === 'POST') {
      const payload = customBody || {
        userNumber: '20261001-A4F',
        realName: 'Budi Santoso',
        thumbnailPhoto: 'data:image/jpeg;base64,...',
        dateStamp: timestamp,
      };
      const added = ucoStore.addMainAbsence({
        userNumber: payload.userNumber,
        realName: payload.realName,
        thumbnailPhoto: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%233f48cc"/></svg>',
        dateStamp: timestamp,
      });
      resBody = {
        message: 'Catatan presensi berhasil disimpan di dataabsen.sqlite (tabel: main-absence)',
        record: added,
      };
      logMsg = `[${timestamp}] [INFO] POST /main-absence - 201 Created - ID: ${added.userNumber} Name: ${added.realName}`;
    } else if (route === '/init-absence' && method === 'POST') {
      const payload = customBody || {
        userNumber: '20261001-99F',
        realName: 'Calon Pengguna Baru',
        thumbnailPhoto: 'data:image/jpeg;base64,...',
        dateStamp: timestamp,
      };
      const added = ucoStore.addInitAbsence({
        userNumber: payload.userNumber,
        realName: payload.realName,
        thumbnailPhoto: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23e9fb66"/></svg>',
        dateStamp: timestamp,
      });
      resBody = {
        message: 'Data inisialisasi berhasil disimpan di dataabsen.sqlite (tabel: init-absence)',
        record: added,
      };
      logMsg = `[${timestamp}] [INFO] POST /init-absence - 201 Created - Pendaftaran ID: ${added.userNumber}`;
    } else if (route === '/error-test') {
      resStatus = 500;
      resBody = {
        error: 'InternalServerError',
        message: 'Contoh penanganan eksepsi Flask: Database locked or invalid parameter.',
        timestamp,
      };
      logMsg = `[${timestamp}] [ERROR] Exception caught in Flask worker: Simulated exception on route /error-test`;
    }

    const latency = Math.round(performance.now() - start + 8);
    setApiResponse({
      status: resStatus,
      route,
      method,
      body: resBody,
      latencyMs: latency,
    });
    setLogs(prev => [logMsg, ...prev.slice(0, 40)]);
  };

  const handleDownloadSql = () => {
    const dump = ucoStore.generateSqlDump();
    const blob = new Blob([dump], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dataabsen.sqlite.sql';
    link.click();
    URL.revokeObjectURL(url);
  };

  const appPyCode = `# ==============================================================================
# MVC UCO Demonstration - Core Flask Python API
# Runs via Gunicorn on Port 35553
# Database: dataabsen.sqlite (tables: 'main-absence', 'init-absence')
# ==============================================================================
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import sqlite3
import logging
import os
import sys
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("uco_api.log")
    ]
)
logger = logging.getLogger("UCO_FLASK_API")

DB_FILE = os.getenv("SQLITE_DB", "dataabsen.sqlite")

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        # Table 'main-absence'
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS "main-absence" (
                no INTEGER PRIMARY KEY AUTOINCREMENT,
                "usernumber/ID" TEXT NOT NULL,
                "real name" TEXT NOT NULL,
                "thumbnail photo" TEXT NOT NULL,
                "date stamp" TEXT NOT NULL
            );
        ''')
        # Table 'init-absence'
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS "init-absence" (
                no INTEGER PRIMARY KEY AUTOINCREMENT,
                "usernumber/ID" TEXT NOT NULL,
                "real name" TEXT NOT NULL,
                "thumbnail photo" TEXT NOT NULL,
                "date stamp" TEXT NOT NULL,
                status TEXT DEFAULT 'pending'
            );
        ''')
        conn.commit()
    logger.info("Database 'dataabsen.sqlite' tables initialized successfully.")

# Route 1: Hello World UCO DEMO
@app.route('/')
def index():
    logger.debug("Handling request for '/' index route")
    return '<h1>Hello, World! UCO DEMO </h1>'

# Route 2: Login Page landing
@app.route('/logindepan', methods=['GET'])
def logindepan():
    logger.debug("Loading login page resources (CSS, HTML, JS)")
    return jsonify({
        "status": "success",
        "route": "/logindepan",
        "message": "Login page and admin page views loaded successfully under MVC",
        "version": "1.0.0"
    })

# Route 3: Admin Approval Initializations
@app.route('/appsinit', methods=['GET', 'POST', 'PUT', 'DELETE'])
def appsinit():
    try:
        conn = get_db()
        cursor = conn.cursor()

        if request.method == 'GET':
            cursor.execute('SELECT no, "usernumber/ID", "real name", "thumbnail photo", "date stamp", status FROM "init-absence" ORDER BY no DESC')
            rows = [dict(row) for row in cursor.fetchall()]
            return jsonify({"status": "success", "count": len(rows), "data": rows})

        elif request.method == 'POST':
            data = request.get_json(force=True)
            user_id = data.get("usernumber/ID") or data.get("userNumber")
            real_name = data.get("real name") or data.get("realName")
            thumb = data.get("thumbnail photo") or data.get("thumbnailPhoto", "")
            date_stamp = data.get("date stamp") or data.get("dateStamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

            cursor.execute(
                'INSERT INTO "init-absence" ("usernumber/ID", "real name", "thumbnail photo", "date stamp", status) VALUES (?, ?, ?, ?, ?)',
                (user_id, real_name, thumb, date_stamp, 'pending')
            )
            conn.commit()
            new_id = cursor.lastrowid
            logger.info(f"Registered new init-absence ID: {user_id} with row no: {new_id}")
            return jsonify({"status": "created", "no": new_id, "userNumber": user_id}), 201

        elif request.method == 'PUT':
            data = request.get_json(force=True)
            no = data.get("no")
            user_id = data.get("usernumber/ID") or data.get("userNumber")
            real_name = data.get("real name") or data.get("realName")
            cursor.execute('UPDATE "init-absence" SET "usernumber/ID" = ?, "real name" = ? WHERE no = ?', (user_id, real_name, no))
            conn.commit()
            return jsonify({"status": "updated", "no": no})

        elif request.method == 'DELETE':
            no = request.args.get("no", type=int)
            cursor.execute('DELETE FROM "init-absence" WHERE no = ?', (no,))
            conn.commit()
            return jsonify({"status": "deleted", "no": no})

    except Exception as e:
        logger.exception("Exception in /appsinit:")
        return jsonify({"error": str(e), "warning": "Failed processing /appsinit request"}), 500

# Route 4: Admin Data Absence Process
@app.route('/databsen', methods=['GET'])
def databsen():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT no, "usernumber/ID", "real name", "thumbnail photo", "date stamp" FROM "main-absence" ORDER BY no DESC')
        rows = [dict(row) for row in cursor.fetchall()]
        return jsonify({"status": "success", "count": len(rows), "data": rows})
    except Exception as e:
        logger.exception("Exception in /databsen:")
        return jsonify({"error": str(e)}), 500

# Route 5: Absence submission (/main-absence)
@app.route('/main-absence', methods=['POST', 'GET', 'PUT', 'DELETE'])
def main_absence():
    try:
        conn = get_db()
        cursor = conn.cursor()

        if request.method == 'POST':
            data = request.get_json(force=True)
            user_id = data.get("usernumber/ID") or data.get("userNumber")
            real_name = data.get("real name") or data.get("realName")
            thumb = data.get("thumbnail photo") or data.get("thumbnailPhoto")
            date_stamp = data.get("date stamp") or data.get("dateStamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

            if not user_id or not real_name:
                return jsonify({"error": "Bad Request: userNumber and realName are required."}), 400

            cursor.execute(
                'INSERT INTO "main-absence" ("usernumber/ID", "real name", "thumbnail photo", "date stamp") VALUES (?, ?, ?, ?)',
                (user_id, real_name, thumb, date_stamp)
            )
            conn.commit()
            new_no = cursor.lastrowid
            logger.info(f"Absence recorded: no={new_no}, user={user_id}, name={real_name}, date={date_stamp}")
            return jsonify({
                "status": "success",
                "message": "Absence recorded successfully in main-absence",
                "record": {
                    "no": new_no,
                    "usernumber/ID": user_id,
                    "real name": real_name,
                    "thumbnail photo": thumb[:50] + "...",
                    "date stamp": date_stamp
                }
            }), 201

        elif request.method == 'GET':
            cursor.execute('SELECT * FROM "main-absence" ORDER BY no DESC')
            return jsonify([dict(row) for row in cursor.fetchall()])

        elif request.method == 'PUT':
            data = request.get_json(force=True)
            no = data.get("no")
            user_id = data.get("usernumber/ID") or data.get("userNumber")
            real_name = data.get("real name") or data.get("realName")
            cursor.execute('UPDATE "main-absence" SET "usernumber/ID" = ?, "real name" = ? WHERE no = ?', (user_id, real_name, no))
            conn.commit()
            return jsonify({"status": "updated", "no": no})

        elif request.method == 'DELETE':
            no = request.args.get("no", type=int)
            cursor.execute('DELETE FROM "main-absence" WHERE no = ?', (no,))
            conn.commit()
            return jsonify({"status": "deleted", "no": no})

    except Exception as e:
        logger.exception("Exception in /main-absence:")
        return jsonify({"error": str(e)}), 500

# Route 6: Initialization submission (/init-absence)
@app.route('/init-absence', methods=['POST', 'GET'])
def init_absence():
    return appsinit()

# Error Handlers & Warnings
@app.errorhandler(404)
def not_found(e):
    logger.warning(f"404 Not Found: {request.url}")
    return jsonify({"error": "Endpoint not found", "route": request.path}), 404

@app.errorhandler(500)
def server_error(e):
    logger.error(f"500 Internal Error: {e}")
    return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

if __name__ == '__main__':
    init_db()
    # Runs standalone on port 35553
    logger.info("Starting Flask application on port 35553...")
    app.run(host='0.0.0.0', port=35553, debug=True)
`;

  const dockerComposeCode = `version: '3.8'

services:
  uco-flask-api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: uco_presence_api
    restart: always
    ports:
      - "35553:35553"
    environment:
      - FLASK_ENV=production
      - PYTHONUNBUFFERED=1
      - SQLITE_DB=/app/dataabsen.sqlite
      - PORT=35553
    volumes:
      - ./dataabsen.sqlite:/app/dataabsen.sqlite
      - ./logs:/app/logs
    command: ["gunicorn", "-c", "gunicorn_config.py", "app:app"]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:35553/"]
      interval: 30s
      timeout: 5s
      retries: 3
`;

  const dockerfileCode = `FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including SQLite3 & curl
RUN apt-get update && apt-get install -y --no-install-recommends \\
    sqlite3 \\
    curl \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose Gunicorn port 35553
EXPOSE 35553

# Run gunicorn on port 35553
CMD ["gunicorn", "-c", "gunicorn_config.py", "app:app"]
`;

  const gunicornConfigCode = `# Gunicorn configuration for UCO Presence API
bind = "0.0.0.0:35553"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 60
keepalive = 2
errorlog = "-"
accesslog = "-"
loglevel = "info"
proc_name = "uco_presence_port_35553"
`;

  const gitWorkflowCode = `# ==============================================================
# MVC UCO Demonstration - GitHub Push and Pull Model Guide
# ==============================================================

# 1. Clone repository from GitHub
git clone https://github.com/your-organization/uco-presence-mvc.git
cd uco-presence-mvc

# 2. Pull latest updates from remote repository
git checkout main
git pull origin main

# 3. Create a feature branch for MVC changes (e.g. Model / View / Controller)
git checkout -b feature/liveness-indonesia-controller

# 4. Verify SQLite database schema and seed data
sqlite3 dataabsen.sqlite < schema.sql

# 5. Build and run with Docker & YAML configuration on port 35553
docker compose up -d --build

# 6. Check logs from Gunicorn worker
docker compose logs -f uco-flask-api

# 7. Commit changes and push to GitHub
git add .
git commit -m "feat(mvc): implement 5-digit Indonesian voice liveness and port 35553 Flask API"
git push origin feature/liveness-indonesia-controller

# 8. Create Pull Request (PR) on GitHub for Administrator Review
`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/95 border-2 border-[rgb(233,251,102)] shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#3f48cc] tracking-tight">
              Flask Python Core & Docker Console (Port 35553)
            </h2>
            <InfoTooltip content="Arsitektur MVC: Flask API dengan Gunicorn di port 35553, Dockerfile, docker-compose.yml, SQLite dataabsen.sqlite, dan panduan GitHub push/pull." />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengujian endpoint, simulasi eksepsi, inspeksi database SQLite3, dan konfigurasi YAML
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadSql}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh SQL Dump</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('tester')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
            activeTab === 'tester'
              ? 'bg-[#3f48cc] text-white shadow-sm border border-[rgb(233,251,102)]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Live API Tester</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('apppy')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
            activeTab === 'apppy'
              ? 'bg-[#3f48cc] text-white shadow-sm border border-[rgb(233,251,102)]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>app.py (Flask 35553)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('docker')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
            activeTab === 'docker'
              ? 'bg-[#3f48cc] text-white shadow-sm border border-[rgb(233,251,102)]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Docker & YAML Config</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sqlite')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
            activeTab === 'sqlite'
              ? 'bg-[#3f48cc] text-white shadow-sm border border-[rgb(233,251,102)]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>SQLite Database</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('git')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
            activeTab === 'git'
              ? 'bg-[#3f48cc] text-white shadow-sm border border-[rgb(233,251,102)]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>GitHub Push/Pull Model</span>
        </button>
      </div>

      {/* Tab 1: Live API Tester */}
      {activeTab === 'tester' && (
        <div className="space-y-4">
          {/* Quick Endpoint Runner Buttons */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase mb-2 flex items-center justify-between">
              <span>Uji Coba Cepat Endpoint Flask (Port 35553):</span>
              <span className="text-[11px] text-emerald-600 font-mono font-bold">http://localhost:35553</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => handleRunTest('/', 'GET')}
                className="p-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#3f48cc] text-left text-xs transition-all shadow-sm"
              >
                <div className="font-mono font-bold text-emerald-600">GET /</div>
                <div className="text-[10px] text-slate-500 truncate">Hello World UCO</div>
              </button>

              <button
                type="button"
                onClick={() => handleRunTest('/logindepan', 'GET')}
                className="p-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#3f48cc] text-left text-xs transition-all shadow-sm"
              >
                <div className="font-mono font-bold text-emerald-600">GET /logindepan</div>
                <div className="text-[10px] text-slate-500 truncate">Login View Loader</div>
              </button>

              <button
                type="button"
                onClick={() => handleRunTest('/appsinit', 'GET')}
                className="p-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#3f48cc] text-left text-xs transition-all shadow-sm"
              >
                <div className="font-mono font-bold text-emerald-600">GET /appsinit</div>
                <div className="text-[10px] text-slate-500 truncate">Init SQLite Data</div>
              </button>

              <button
                type="button"
                onClick={() => handleRunTest('/databsen', 'GET')}
                className="p-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#3f48cc] text-left text-xs transition-all shadow-sm"
              >
                <div className="font-mono font-bold text-emerald-600">GET /databsen</div>
                <div className="text-[10px] text-slate-500 truncate">Main Absence Data</div>
              </button>

              <button
                type="button"
                onClick={() => handleRunTest('/main-absence', 'POST')}
                className="p-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#3f48cc] text-left text-xs transition-all shadow-sm"
              >
                <div className="font-mono font-bold text-blue-600">POST /main-absence</div>
                <div className="text-[10px] text-slate-500 truncate">Simpan Presensi</div>
              </button>

              <button
                type="button"
                onClick={() => handleRunTest('/error-test', 'GET')}
                className="p-2 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-400 text-left text-xs transition-all shadow-sm"
              >
                <div className="font-mono font-bold text-rose-600">500 Exception</div>
                <div className="text-[10px] text-slate-500 truncate">Uji Handler Error</div>
              </button>
            </div>
          </div>

          {/* Response Box & Debug Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Response Output */}
            <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs border border-slate-800 shadow-md">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[rgb(233,251,102)]" />
                  <span className="font-bold text-slate-200">HTTP Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    apiResponse.status >= 200 && apiResponse.status < 300
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    HTTP {apiResponse.status}
                  </span>
                  <span className="text-[10px] text-slate-400">{apiResponse.latencyMs}ms</span>
                </div>
              </div>

              <div className="bg-black/50 p-3 rounded-lg overflow-x-auto max-h-72">
                <pre className="text-[11px] leading-relaxed text-emerald-400 whitespace-pre-wrap">
                  {typeof apiResponse.body === 'string'
                    ? apiResponse.body
                    : JSON.stringify(apiResponse.body, null, 2)}
                </pre>
              </div>
            </div>

            {/* Right: Debugging Log */}
            <div className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs border border-slate-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-slate-200">Gunicorn & Flask Live Debug Logs</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogs([`[${getCurrentDateStamp()}] [INFO] Logs cleared`])}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-1 overflow-y-auto max-h-64 text-[10px] text-slate-400">
                  {logs.map((log, i) => (
                    <div
                      key={i}
                      className={
                        log.includes('[ERROR]')
                          ? 'text-rose-400'
                          : log.includes('[INFO]')
                          ? 'text-cyan-300'
                          : 'text-slate-400'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>Core Worker: Gunicorn 21.2.0</span>
                <span>Port: 35553</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: app.py Code */}
      {activeTab === 'apppy' && (
        <div className="relative rounded-xl bg-slate-900 text-slate-200 p-4 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="font-mono text-xs font-bold text-[rgb(233,251,102)]">
              app.py (Flask Core API on Port 35553)
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(appPyCode, 'apppy')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1 transition-all"
            >
              {copied === 'apppy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'apppy' ? 'Disalin' : 'Salin'}</span>
            </button>
          </div>
          <pre className="font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed">
            {appPyCode}
          </pre>
        </div>
      )}

      {/* Tab 3: Docker & YAML Config */}
      {activeTab === 'docker' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* docker-compose.yml */}
          <div className="rounded-xl bg-slate-900 text-slate-200 p-4 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="font-mono text-xs font-bold text-[rgb(233,251,102)]">
                docker-compose.yml (YAML Config)
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(dockerComposeCode, 'dcomp')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1 transition-all"
              >
                {copied === 'dcomp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-emerald-400 overflow-x-auto max-h-[400px] leading-relaxed">
              {dockerComposeCode}
            </pre>
          </div>

          {/* Dockerfile & gunicorn */}
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-900 text-slate-200 p-4 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="font-mono text-xs font-bold text-[rgb(233,251,102)]">
                  Dockerfile (Python 3.11 Slim)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(dockerfileCode, 'df')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1"
                >
                  {copied === 'df' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Salin</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-slate-300 overflow-x-auto max-h-[180px] leading-relaxed">
                {dockerfileCode}
              </pre>
            </div>

            <div className="rounded-xl bg-slate-900 text-slate-200 p-4 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="font-mono text-xs font-bold text-[rgb(233,251,102)]">
                  gunicorn_config.py (Port 35553)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(gunicornConfigCode, 'gc')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1"
                >
                  {copied === 'gc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Salin</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-cyan-300 overflow-x-auto max-h-[140px] leading-relaxed">
                {gunicornConfigCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: SQLite Database Inspector */}
      {activeTab === 'sqlite' && (
        <div className="p-4 rounded-xl bg-white border-2 border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-[#3f48cc] text-sm sm:text-base">
                Struktur Database: dataabsen.sqlite
              </h3>
              <p className="text-xs text-slate-500">
                Tabel SQLite3 sesuai format: <code>main-absence</code> dan <code>init-absence</code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSql}
                className="px-3 py-1.5 rounded-lg bg-[#3f48cc] hover:bg-[#3239a0] text-white font-bold text-xs flex items-center gap-1 border border-[rgb(233,251,102)]"
              >
                <Download className="w-3.5 h-3.5 text-[rgb(233,251,102)]" />
                <span>Unduh File SQL</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset data demo ke pengaturan awal?')) {
                    ucoStore.resetToDefault();
                    window.location.reload();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1 border border-slate-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Table main-absence */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs">
              <div className="font-bold text-slate-800 pb-1 mb-2 border-b border-slate-200 flex justify-between">
                <span>Tabel: "main-absence"</span>
                <span className="text-slate-500">{ucoStore.getMainAbsences().length} baris</span>
              </div>
              <ul className="space-y-1 font-mono text-[11px] text-slate-700">
                <li>• <strong>no</strong>: INTEGER PRIMARY KEY AUTOINCREMENT</li>
                <li>• <strong>usernumber/ID</strong>: TEXT NOT NULL</li>
                <li>• <strong>real name</strong>: TEXT NOT NULL</li>
                <li>• <strong>thumbnail photo</strong>: TEXT NOT NULL</li>
                <li>• <strong>date stamp</strong>: TEXT NOT NULL</li>
              </ul>
            </div>

            {/* Table init-absence */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs">
              <div className="font-bold text-slate-800 pb-1 mb-2 border-b border-slate-200 flex justify-between">
                <span>Tabel: "init-absence"</span>
                <span className="text-slate-500">{ucoStore.getInitAbsences().length} baris</span>
              </div>
              <ul className="space-y-1 font-mono text-[11px] text-slate-700">
                <li>• <strong>no</strong>: INTEGER PRIMARY KEY AUTOINCREMENT</li>
                <li>• <strong>usernumber/ID</strong>: TEXT NOT NULL</li>
                <li>• <strong>real name</strong>: TEXT NOT NULL</li>
                <li>• <strong>thumbnail photo</strong>: TEXT NOT NULL</li>
                <li>• <strong>date stamp</strong>: TEXT NOT NULL</li>
                <li>• <strong>status</strong>: TEXT DEFAULT 'pending'</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: GitHub Push/Pull Model */}
      {activeTab === 'git' && (
        <div className="rounded-xl bg-slate-900 text-slate-200 p-4 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="font-mono text-xs font-bold text-[rgb(233,251,102)]">
              GitHub Model Workflow (Push & Pull)
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(gitWorkflowCode, 'git')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1 transition-all"
            >
              {copied === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Salin Perintah Git</span>
            </button>
          </div>
          <pre className="font-mono text-xs text-slate-300 overflow-x-auto max-h-[400px] leading-relaxed">
            {gitWorkflowCode}
          </pre>
        </div>
      )}
    </div>
  );
};
