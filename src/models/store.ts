import { AbsenceRecord, InitRecord, User } from '../types';

const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    username: 'budi.santoso',
    password: 'password123',
    realName: 'Budi Santoso',
    userNumber: '20260928-A4F',
    isInitialized: true,
    role: 'user',
    approvedDate: '2026-09-28 08:30:00',
  },
  {
    id: 'u2',
    username: 'siti.rahma',
    password: 'password123',
    realName: 'Siti Rahmawati',
    userNumber: '20260929-B12',
    isInitialized: true,
    role: 'user',
    approvedDate: '2026-09-29 09:15:00',
  },
  {
    id: 'u3',
    username: 'ahmad.fauzi',
    password: 'password123',
    realName: 'Ahmad Fauzi',
    userNumber: '',
    isInitialized: false, // Will redirect to initialization-page!
    role: 'user',
  },
  {
    id: 'u4',
    username: 'dewi.lestari',
    password: 'password123',
    realName: 'Dewi Lestari',
    userNumber: '20260930-7CE',
    isInitialized: true,
    role: 'user',
    approvedDate: '2026-09-30 08:00:00',
  },
  {
    id: 'admin1',
    username: 'admin',
    password: 'admin123',
    realName: 'Administrator Sistem UCO',
    userNumber: 'ADM-001',
    isInitialized: true,
    role: 'admin',
  }
];

// Sample default thumbnail SVG avatars for preloaded records (valid Data URLs)
const createSampleAvatar = (name: string, bg: string, fg: string = '#ffffff') => {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <rect width="120" height="120" fill="${bg}" rx="16"/>
    <circle cx="60" cy="46" r="24" fill="${fg}" opacity="0.9"/>
    <path d="M24 102c0-20 16-36 36-36s36 16 36 36" fill="${fg}" opacity="0.9"/>
    <text x="60" y="52" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${bg}" text-anchor="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const INITIAL_INIT_ABSENCE: InitRecord[] = [
  {
    no: 1,
    userNumber: '20261001-C3D',
    realName: 'Rian Pratama',
    thumbnailPhoto: createSampleAvatar('Rian Pratama', '#3f48cc'),
    dateStamp: '2026-10-01 07:45:12',
    status: 'pending'
  },
  {
    no: 2,
    userNumber: '20261001-F9A',
    realName: 'Nurul Hidayah',
    thumbnailPhoto: createSampleAvatar('Nurul Hidayah', '#2563eb'),
    dateStamp: '2026-10-01 08:12:45',
    status: 'pending'
  },
  {
    no: 3,
    userNumber: '20260930-8E1',
    realName: 'Fajar Nugroho',
    thumbnailPhoto: createSampleAvatar('Fajar Nugroho', '#4f46e5'),
    dateStamp: '2026-09-30 16:30:21',
    status: 'approved'
  }
];

const INITIAL_MAIN_ABSENCE: AbsenceRecord[] = [
  {
    no: 1,
    userNumber: '20260928-A4F',
    realName: 'Budi Santoso',
    thumbnailPhoto: createSampleAvatar('Budi Santoso', '#3f48cc'),
    dateStamp: '2026-10-01 07:15:32'
  },
  {
    no: 2,
    userNumber: '20260929-B12',
    realName: 'Siti Rahmawati',
    thumbnailPhoto: createSampleAvatar('Siti Rahmawati', '#1d4ed8'),
    dateStamp: '2026-10-01 07:22:18'
  },
  {
    no: 3,
    userNumber: '20260930-7CE',
    realName: 'Dewi Lestari',
    thumbnailPhoto: createSampleAvatar('Dewi Lestari', '#4338ca'),
    dateStamp: '2026-10-01 07:48:50'
  }
];

class UCODataStore {
  private usersKey = 'uco_users_v1';
  private mainAbsenceKey = 'uco_main_absence_v1';
  private initAbsenceKey = 'uco_init_absence_v1';
  private currentUserKey = 'uco_current_user_v1';

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(this.usersKey)) {
      localStorage.setItem(this.usersKey, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(this.mainAbsenceKey)) {
      localStorage.setItem(this.mainAbsenceKey, JSON.stringify(INITIAL_MAIN_ABSENCE));
    }
    if (!localStorage.getItem(this.initAbsenceKey)) {
      localStorage.setItem(this.initAbsenceKey, JSON.stringify(INITIAL_INIT_ABSENCE));
    }
  }

  // Current session
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(this.currentUserKey);
    return raw ? JSON.parse(raw) : null;
  }

  setCurrentUser(user: User | null): void {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.currentUserKey);
    }
  }

  // Users
  getUsers(): User[] {
    if (typeof window === 'undefined') return INITIAL_USERS;
    const raw = localStorage.getItem(this.usersKey);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  }

  findUser(username: string): User | undefined {
    return this.getUsers().find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  }

  updateUser(user: User): void {
    const list = this.getUsers().map(u => u.id === user.id ? user : u);
    localStorage.setItem(this.usersKey, JSON.stringify(list));
    const curr = this.getCurrentUser();
    if (curr && curr.id === user.id) {
      this.setCurrentUser(user);
    }
  }

  // Main Absence (/main-absence table in dataabsen.sqlite)
  getMainAbsences(): AbsenceRecord[] {
    if (typeof window === 'undefined') return INITIAL_MAIN_ABSENCE;
    const raw = localStorage.getItem(this.mainAbsenceKey);
    return raw ? JSON.parse(raw) : INITIAL_MAIN_ABSENCE;
  }

  addMainAbsence(record: Omit<AbsenceRecord, 'no'>): AbsenceRecord {
    const list = this.getMainAbsences();
    const nextNo = list.length > 0 ? Math.max(...list.map(r => r.no)) + 1 : 1;
    const newRecord: AbsenceRecord = {
      ...record,
      no: nextNo,
    };
    const updated = [newRecord, ...list];
    localStorage.setItem(this.mainAbsenceKey, JSON.stringify(updated));
    return newRecord;
  }

  updateMainAbsence(no: number, userNumber: string, realName: string): boolean {
    const list = this.getMainAbsences();
    const index = list.findIndex(r => r.no === no);
    if (index === -1) return false;
    list[index] = {
      ...list[index],
      userNumber: userNumber.trim(),
      realName: realName.trim(),
    };
    localStorage.setItem(this.mainAbsenceKey, JSON.stringify(list));
    return true;
  }

  deleteMainAbsence(no: number): boolean {
    const list = this.getMainAbsences();
    const filtered = list.filter(r => r.no !== no);
    localStorage.setItem(this.mainAbsenceKey, JSON.stringify(filtered));
    return true;
  }

  // Init Absence (/init-absence table in dataabsen.sqlite)
  getInitAbsences(): InitRecord[] {
    if (typeof window === 'undefined') return INITIAL_INIT_ABSENCE;
    const raw = localStorage.getItem(this.initAbsenceKey);
    return raw ? JSON.parse(raw) : INITIAL_INIT_ABSENCE;
  }

  addInitAbsence(record: Omit<InitRecord, 'no' | 'status'>): InitRecord {
    const list = this.getInitAbsences();
    const nextNo = list.length > 0 ? Math.max(...list.map(r => r.no)) + 1 : 1;
    const newRecord: InitRecord = {
      ...record,
      no: nextNo,
      status: 'pending',
    };
    const updated = [newRecord, ...list];
    localStorage.setItem(this.initAbsenceKey, JSON.stringify(updated));
    return newRecord;
  }

  updateInitAbsence(no: number, userNumber: string, realName: string): boolean {
    const list = this.getInitAbsences();
    const index = list.findIndex(r => r.no === no);
    if (index === -1) return false;
    list[index] = {
      ...list[index],
      userNumber: userNumber.trim(),
      realName: realName.trim(),
    };
    localStorage.setItem(this.initAbsenceKey, JSON.stringify(list));
    return true;
  }

  deleteInitAbsence(no: number): boolean {
    const list = this.getInitAbsences();
    const filtered = list.filter(r => r.no !== no);
    localStorage.setItem(this.initAbsenceKey, JSON.stringify(filtered));
    return true;
  }

  approveInitAbsence(no: number): boolean {
    const inits = this.getInitAbsences();
    const target = inits.find(r => r.no === no);
    if (!target) return false;

    // Mark as approved
    target.status = 'approved';
    localStorage.setItem(this.initAbsenceKey, JSON.stringify(inits));

    // Also update or add user in users table
    const users = this.getUsers();
    const existing = users.find(u => u.realName.toLowerCase() === target.realName.toLowerCase() || u.userNumber === target.userNumber);
    if (existing) {
      existing.isInitialized = true;
      existing.userNumber = target.userNumber;
      existing.approvedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
    } else {
      const generatedUsername = target.realName.toLowerCase().replace(/\s+/g, '.');
      users.push({
        id: `u_${Date.now()}`,
        username: generatedUsername,
        password: 'password123',
        realName: target.realName,
        userNumber: target.userNumber,
        isInitialized: true,
        role: 'user',
        approvedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      });
    }
    localStorage.setItem(this.usersKey, JSON.stringify(users));

    // If currently logged in user matches, update session
    const current = this.getCurrentUser();
    if (current && (current.realName.toLowerCase() === target.realName.toLowerCase() || current.userNumber === target.userNumber)) {
      current.isInitialized = true;
      current.userNumber = target.userNumber;
      this.setCurrentUser(current);
    }

    return true;
  }

  // Export SQLite SQL statements matching "dataabsen.sqlite"
  generateSqlDump(): string {
    const mainList = this.getMainAbsences();
    const initList = this.getInitAbsences();

    let sql = `-- ================================================\n`;
    sql += `-- SQLite3 Database: dataabsen.sqlite\n`;
    sql += `-- UCO Demonstration MVC Model Schema & Seed Data\n`;
    sql += `-- ================================================\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS "main-absence" (\n`;
    sql += `  no INTEGER PRIMARY KEY AUTOINCREMENT,\n`;
    sql += `  "usernumber/ID" TEXT NOT NULL,\n`;
    sql += `  "real name" TEXT NOT NULL,\n`;
    sql += `  "thumbnail photo" TEXT NOT NULL,\n`;
    sql += `  "date stamp" TEXT NOT NULL\n`;
    sql += `);\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS "init-absence" (\n`;
    sql += `  no INTEGER PRIMARY KEY AUTOINCREMENT,\n`;
    sql += `  "usernumber/ID" TEXT NOT NULL,\n`;
    sql += `  "real name" TEXT NOT NULL,\n`;
    sql += `  "thumbnail photo" TEXT NOT NULL,\n`;
    sql += `  "date stamp" TEXT NOT NULL,\n`;
    sql += `  "status" TEXT DEFAULT 'pending'\n`;
    sql += `);\n\n`;

    sql += `-- Seed / Export for "main-absence":\n`;
    mainList.forEach(m => {
      const photoEscaped = m.thumbnailPhoto.substring(0, 40) + '...[base64]';
      sql += `INSERT INTO "main-absence" (no, "usernumber/ID", "real name", "thumbnail photo", "date stamp") VALUES (${m.no}, '${m.userNumber}', '${m.realName.replace(/'/g, "''")}', '${photoEscaped}', '${m.dateStamp}');\n`;
    });

    sql += `\n-- Seed / Export for "init-absence":\n`;
    initList.forEach(i => {
      const photoEscaped = i.thumbnailPhoto.substring(0, 40) + '...[base64]';
      sql += `INSERT INTO "init-absence" (no, "usernumber/ID", "real name", "thumbnail photo", "date stamp", status) VALUES (${i.no}, '${i.userNumber}', '${i.realName.replace(/'/g, "''")}', '${photoEscaped}', '${i.dateStamp}', '${i.status}');\n`;
    });

    return sql;
  }

  resetToDefault(): void {
    localStorage.setItem(this.usersKey, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(this.mainAbsenceKey, JSON.stringify(INITIAL_MAIN_ABSENCE));
    localStorage.setItem(this.initAbsenceKey, JSON.stringify(INITIAL_INIT_ABSENCE));
  }
}

export const ucoStore = new UCODataStore();
