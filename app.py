#!/usr/bin/env python3
"""
MVC (Multi View Controller) UCO Demonstration
Core Flask Python API running via Gunicorn on Port 35553
Handling real-life absences and user initializations with SQLite3 'dataabsen.sqlite'
"""

import os
import sys
import sqlite3
import logging
from datetime import datetime
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS

# -----------------------------------------------------------------------------
# Flask Application Setup & Logging Configuration
# -----------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] [PID:%(process)d] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("UCO_API_35553")

DATABASE_PATH = os.environ.get("SQLITE_DB", "dataabsen.sqlite")

def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables 'main-absence' and 'init-absence' in dataabsen.sqlite."""
    try:
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
        logger.info(f"Database '{DATABASE_PATH}' initialized successfully.")
    except Exception as e:
        logger.exception("Failed to initialize database:")

init_db()

# -----------------------------------------------------------------------------
# Route 1: Hello World UCO DEMO
# -----------------------------------------------------------------------------
@app.route('/')
def index():
    logger.debug("Received request for root endpoint '/'")
    return '<h1>Hello, World! UCO DEMO </h1>'

# -----------------------------------------------------------------------------
# Route 2: Login-page / first page landing
# -----------------------------------------------------------------------------
@app.route('/logindepan', methods=['GET', 'POST'])
def logindepan():
    logger.debug("Route '/logindepan' called")
    if request.method == 'POST':
        data = request.get_json(silent=True) or request.form
        username = data.get('username', '').strip()
        role = data.get('role', 'user')
        
        # MVC Controller: check user status
        if username.lower() == 'admin':
            return jsonify({
                "status": "success",
                "role": "admin",
                "redirect": "/appsinit"
            })
        elif username:
            # Check initialization
            return jsonify({
                "status": "success",
                "role": "user",
                "is_initialized": True,
                "redirect": "/absence"
            })
        else:
            logger.warning("Empty username provided in /logindepan")
            return jsonify({
                "status": "error",
                "message": "Username dan password wajib diisi."
            }), 400

    return jsonify({
        "status": "success",
        "route": "/logindepan",
        "description": "Loads CSS, HTML, and JS assets for user & admin login views under MVC architecture.",
        "port": 35553
    })

# -----------------------------------------------------------------------------
# Route 3: Admin-pages for Approval initialization (@app.route('/appsinit'))
# -----------------------------------------------------------------------------
@app.route('/appsinit', methods=['GET', 'POST', 'PUT', 'DELETE'])
def appsinit():
    try:
        conn = get_db()
        cursor = conn.cursor()

        if request.method == 'GET':
            cursor.execute('SELECT no, "usernumber/ID", "real name", "thumbnail photo", "date stamp", status FROM "init-absence" ORDER BY no DESC')
            rows = [dict(r) for r in cursor.fetchall()]
            return jsonify({"status": "success", "count": len(rows), "data": rows})

        elif request.method == 'POST':
            data = request.get_json(force=True)
            user_number = data.get("usernumber/ID") or data.get("userNumber")
            real_name = data.get("real name") or data.get("realName")
            thumb = data.get("thumbnail photo") or data.get("thumbnailPhoto", "")
            date_stamp = data.get("date stamp") or data.get("dateStamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

            if not user_number or not real_name:
                logger.warning("Missing usernumber/ID or real name in /appsinit POST")
                return jsonify({"error": "Bad Request: usernumber/ID and real name are required."}), 400

            cursor.execute(
                'INSERT INTO "init-absence" ("usernumber/ID", "real name", "thumbnail photo", "date stamp", status) VALUES (?, ?, ?, ?, ?)',
                (user_number, real_name, thumb, date_stamp, 'pending')
            )
            conn.commit()
            new_id = cursor.lastrowid
            logger.info(f"New initialization registered: #{new_id} ({user_number})")
            return jsonify({"status": "created", "no": new_id, "userNumber": user_number}), 201

        elif request.method == 'PUT':
            data = request.get_json(force=True)
            no = data.get("no")
            user_number = data.get("usernumber/ID") or data.get("userNumber")
            real_name = data.get("real name") or data.get("realName")

            if not no or not user_number or not real_name:
                return jsonify({"error": "Bad Request: no, usernumber/ID, and real name required for edit."}), 400

            cursor.execute(
                'UPDATE "init-absence" SET "usernumber/ID" = ?, "real name" = ? WHERE no = ?',
                (user_number, real_name, no)
            )
            conn.commit()
            logger.info(f"Updated init-absence #{no} to ID:{user_number}, Name:{real_name}")
            return jsonify({"status": "updated", "no": no})

        elif request.method == 'DELETE':
            no = request.args.get("no", type=int) or (request.get_json(silent=True) or {}).get("no")
            if not no:
                return jsonify({"error": "Bad Request: parameter 'no' is required to delete."}), 400
            cursor.execute('DELETE FROM "init-absence" WHERE no = ?', (no,))
            conn.commit()
            logger.info(f"Deleted init-absence #{no}")
            return jsonify({"status": "deleted", "no": no})

    except Exception as e:
        logger.exception("Exception in /appsinit:")
        return jsonify({"error": str(e), "warning": "Terjadi kesalahan saat memproses data inisialisasi."}), 500

# -----------------------------------------------------------------------------
# Route 4: Admin-pages for Data absence process (@app.route('/databsen'))
# -----------------------------------------------------------------------------
@app.route('/databsen', methods=['GET'])
def databsen():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT no, "usernumber/ID", "real name", "thumbnail photo", "date stamp" FROM "main-absence" ORDER BY no DESC')
        rows = [dict(r) for r in cursor.fetchall()]
        return jsonify({"status": "success", "count": len(rows), "data": rows})
    except Exception as e:
        logger.exception("Exception in /databsen:")
        return jsonify({"error": str(e)}), 500

# -----------------------------------------------------------------------------
# Route 5: Absence-page input saving (@app.route('/main-absence'))
# Table: 'main-absence' [no, usernumber/ID, real name, thumbnail photo, date stamp]
# -----------------------------------------------------------------------------
@app.route('/main-absence', methods=['POST', 'GET', 'PUT', 'DELETE'])
def main_absence():
    try:
        conn = get_db()
        cursor = conn.cursor()

        if request.method == 'POST':
            data = request.get_json(force=True)
            user_number = data.get("usernumber/ID") or data.get("userNumber")
            real_name = data.get("real name") or data.get("realName")
            thumb = data.get("thumbnail photo") or data.get("thumbnailPhoto", "")
            date_stamp = data.get("date stamp") or data.get("dateStamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

            if not user_number or not real_name:
                logger.warning("Rejecting /main-absence: Missing userNumber or realName")
                return jsonify({"error": "Bad Request: userNumber and realName are mandatory."}), 400

            cursor.execute(
                'INSERT INTO "main-absence" ("usernumber/ID", "real name", "thumbnail photo", "date stamp") VALUES (?, ?, ?, ?)',
                (user_number, real_name, thumb, date_stamp)
            )
            conn.commit()
            new_no = cursor.lastrowid
            logger.info(f"Absence saved successfully: no={new_no} [{user_number}] {real_name}")
            return jsonify({
                "status": "success",
                "message": "Presensi berhasil disimpan ke database dataabsen.sqlite (tabel main-absence)",
                "data": {
                    "no": new_no,
                    "usernumber/ID": user_number,
                    "real name": real_name,
                    "thumbnail photo": thumb[:50] + ("..." if len(thumb) > 50 else ""),
                    "date stamp": date_stamp
                }
            }), 201

        elif request.method == 'GET':
            cursor.execute('SELECT * FROM "main-absence" ORDER BY no DESC')
            return jsonify([dict(r) for r in cursor.fetchall()])

        elif request.method == 'PUT':
            data = request.get_json(force=True)
            no = data.get("no")
            user_number = data.get("usernumber/ID") or data.get("userNumber")
            real_name = data.get("real name") or data.get("realName")

            if not no:
                return jsonify({"error": "Parameter 'no' is required."}), 400

            cursor.execute(
                'UPDATE "main-absence" SET "usernumber/ID" = ?, "real name" = ? WHERE no = ?',
                (user_number, real_name, no)
            )
            conn.commit()
            return jsonify({"status": "updated", "no": no})

        elif request.method == 'DELETE':
            no = request.args.get("no", type=int) or (request.get_json(silent=True) or {}).get("no")
            if not no:
                return jsonify({"error": "Parameter 'no' is required."}), 400
            cursor.execute('DELETE FROM "main-absence" WHERE no = ?', (no,))
            conn.commit()
            return jsonify({"status": "deleted", "no": no})

    except Exception as e:
        logger.exception("Exception in /main-absence:")
        return jsonify({"error": str(e), "warning": "Gagal memproses data absensi."}), 500

# -----------------------------------------------------------------------------
# Route 6: Initialization-page API (@app.route('/init-absence'))
# Table: 'init-absence' [no, usernumber/ID, real name, thumbnail photo, date stamp]
# -----------------------------------------------------------------------------
@app.route('/init-absence', methods=['POST', 'GET'])
def init_absence():
    return appsinit()

# -----------------------------------------------------------------------------
# Exceptions, Warnings, and Error Handlers
# -----------------------------------------------------------------------------
@app.errorhandler(400)
def bad_request(e):
    logger.warning(f"400 Bad Request: {request.url} - {e}")
    return jsonify({"error": "Bad Request", "details": str(e)}), 400

@app.errorhandler(404)
def not_found(e):
    logger.warning(f"404 Not Found: {request.url}")
    return jsonify({"error": "Endpoint not found", "route": request.path}), 404

@app.errorhandler(500)
def internal_error(e):
    logger.error(f"500 Internal Server Error: {e}")
    return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask UCO Demo Server directly on port 35553...")
    app.run(host='0.0.0.0', port=35553, debug=True)
