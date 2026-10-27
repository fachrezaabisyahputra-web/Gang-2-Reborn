/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { INITIAL_DEMO_DATA } from '../data/initialData.ts';
import { AppStateData } from '../types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'ruangmuda.sqlite');

export function initDatabase(): Database.Database {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create relational SQL tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('pemasukan', 'pengeluaran')),
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      source_or_recipient TEXT NOT NULL,
      proof_info TEXT,
      created_by TEXT NOT NULL,
      updated_at TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      member_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      age_group TEXT NOT NULL,
      age INTEGER NOT NULL,
      address TEXT NOT NULL,
      rt TEXT NOT NULL,
      rw TEXT NOT NULL,
      phone TEXT,
      role_in_org TEXT NOT NULL,
      skills TEXT NOT NULL, -- JSON array
      interests TEXT NOT NULL, -- JSON array
      join_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Aktif', 'Alumni', 'Non-Aktif'))
    );

    CREATE TABLE IF NOT EXISTS contributions (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      month TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('lunas', 'belum')),
      paid_at TEXT,
      receipt_ref TEXT,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS families (
      id TEXT PRIMARY KEY,
      family_code TEXT NOT NULL UNIQUE,
      raw_kk TEXT,
      masked_kk TEXT NOT NULL,
      head_of_family TEXT NOT NULL,
      address TEXT NOT NULL,
      rt TEXT NOT NULL,
      rw TEXT NOT NULL,
      member_count INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Lengkap', 'Perlu Verifikasi', 'Belum Lengkap')),
      updated_at TEXT NOT NULL,
      notes TEXT,
      phone TEXT
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      published_date TEXT NOT NULL,
      author TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('draf', 'dipublikasikan', 'diarsipkan')),
      attachment_name TEXT,
      is_pinned INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      person_in_charge TEXT NOT NULL,
      description TEXT NOT NULL,
      budget REAL NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('rencana', 'berlangsung', 'selesai', 'dibatalkan'))
    );

    CREATE TABLE IF NOT EXISTS event_attendees (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('hadir', 'izin', 'sakit', 'tanpa_keterangan')),
      checked_at TEXT,
      notes TEXT,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS work_programs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      division TEXT NOT NULL,
      goal TEXT NOT NULL,
      person_in_charge TEXT NOT NULL,
      schedule TEXT NOT NULL,
      planned_budget REAL NOT NULL,
      realized_budget REAL NOT NULL,
      target TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('belum_mulai', 'berjalan', 'selesai', 'tertunda'))
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      quantity INTEGER NOT NULL,
      condition TEXT NOT NULL CHECK(condition IN ('Baik', 'Rusak Ringan', 'Rusak Berat')),
      location TEXT NOT NULL,
      procurement_date TEXT NOT NULL,
      person_in_charge TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventory_loans (
      id TEXT PRIMARY KEY,
      inventory_id TEXT NOT NULL,
      borrower_name TEXT NOT NULL,
      borrower_contact TEXT NOT NULL,
      borrow_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      return_date TEXT,
      quantity INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('dipinjam', 'kembali')),
      notes TEXT,
      FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS umkm (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      public_contact TEXT,
      allows_public_contact INTEGER NOT NULL DEFAULT 1,
      instagram TEXT,
      whatsapp TEXT,
      product_highlights TEXT NOT NULL -- JSON array
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      doc_number TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      uploader TEXT NOT NULL,
      description TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0,
      file_size TEXT NOT NULL,
      file_type TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL
    );
  `);

  // Check if database already has initial data; if empty, seed with demo data
  const countRow = db.prepare('SELECT count(*) as count FROM transactions').get() as { count: number };
  if (countRow.count === 0) {
    seedDatabase(db, INITIAL_DEMO_DATA);
  }

  return db;
}

export function seedDatabase(db: Database.Database, data: AppStateData): void {
  const insertTx = db.transaction(() => {
    // Clear existing
    db.exec(`
      DELETE FROM audit_logs;
      DELETE FROM documents;
      DELETE FROM umkm;
      DELETE FROM inventory_loans;
      DELETE FROM inventory;
      DELETE FROM work_programs;
      DELETE FROM event_attendees;
      DELETE FROM events;
      DELETE FROM announcements;
      DELETE FROM families;
      DELETE FROM contributions;
      DELETE FROM members;
      DELETE FROM transactions;
      DELETE FROM system_config;
    `);

    db.prepare('INSERT INTO system_config (key, value) VALUES (?, ?)').run('initialBalance', String(data.initialBalance));
    db.prepare('INSERT INTO system_config (key, value) VALUES (?, ?)').run('isDemoMode', data.isDemoMode ? '1' : '0');
    db.prepare('INSERT INTO system_config (key, value) VALUES (?, ?)').run('lastUpdated', new Date().toISOString());

    // Transactions
    const insertTransaction = db.prepare(`
      INSERT INTO transactions (id, code, date, type, category, amount, description, source_or_recipient, proof_info, created_by, updated_at, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const t of data.transactions) {
      insertTransaction.run(t.id, t.code, t.date, t.type, t.category, t.amount, t.description, t.sourceOrRecipient, t.proofInfo, t.createdBy, t.updatedAt || null, t.notes || null);
    }

    // Members
    const insertMember = db.prepare(`
      INSERT INTO members (id, member_code, name, age_group, age, address, rt, rw, phone, role_in_org, skills, interests, join_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const m of data.members) {
      insertMember.run(m.id, m.memberCode, m.name, m.ageGroup, m.age, m.address, m.rt, m.rw, m.phone || null, m.roleInOrg, JSON.stringify(m.skills), JSON.stringify(m.interests), m.joinDate, m.status);
    }

    // Contributions
    const insertContribution = db.prepare(`
      INSERT INTO contributions (id, member_id, member_name, month, amount, status, paid_at, receipt_ref)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of data.contributions) {
      insertContribution.run(c.id, c.memberId, c.memberName, c.month, c.amount, c.status, c.paidAt || null, c.receiptRef || null);
    }

    // Families
    const insertFamily = db.prepare(`
      INSERT INTO families (id, family_code, raw_kk, masked_kk, head_of_family, address, rt, rw, member_count, status, updated_at, notes, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const f of data.families) {
      insertFamily.run(f.id, f.familyCode, f.rawKK || null, f.maskedKK, f.headOfFamily, f.address, f.rt, f.rw, f.memberCount, f.status, f.updatedAt, f.notes || null, f.phone || null);
    }

    // Announcements
    const insertAnnouncement = db.prepare(`
      INSERT INTO announcements (id, title, content, category, published_date, author, status, attachment_name, is_pinned)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of data.announcements) {
      insertAnnouncement.run(a.id, a.title, a.content, a.category, a.publishedDate, a.author, a.status, a.attachmentName || null, a.isPinned ? 1 : 0);
    }

    // Events & attendees
    const insertEvent = db.prepare(`
      INSERT INTO events (id, title, date, time, location, person_in_charge, description, budget, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertAttendee = db.prepare(`
      INSERT INTO event_attendees (id, event_id, member_id, member_name, status, checked_at, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const e of data.events) {
      insertEvent.run(e.id, e.title, e.date, e.time, e.location, e.personInCharge, e.description, e.budget, e.status);
      for (const att of e.attendees) {
        insertAttendee.run(`${e.id}-${att.memberId}`, e.id, att.memberId, att.memberName, att.status, att.checkedAt || null, att.notes || null);
      }
    }

    // Work programs
    const insertProker = db.prepare(`
      INSERT INTO work_programs (id, name, division, goal, person_in_charge, schedule, planned_budget, realized_budget, target, progress, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of data.workPrograms) {
      insertProker.run(p.id, p.name, p.division, p.goal, p.personInCharge, p.schedule, p.plannedBudget, p.realizedBudget, p.target, p.progress, p.status);
    }

    // Inventory & loans
    const insertInv = db.prepare(`
      INSERT INTO inventory (id, name, code, quantity, condition, location, procurement_date, person_in_charge)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertLoan = db.prepare(`
      INSERT INTO inventory_loans (id, inventory_id, borrower_name, borrower_contact, borrow_date, due_date, return_date, quantity, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const inv of data.inventory) {
      insertInv.run(inv.id, inv.name, inv.code, inv.quantity, inv.condition, inv.location, inv.procurementDate, inv.personInCharge);
      for (const l of inv.loans) {
        insertLoan.run(l.id, inv.id, l.borrowerName, l.borrowerContact, l.borrowDate, l.dueDate, l.returnDate || null, l.quantity, l.status, l.notes || null);
      }
    }

    // UMKM
    const insertUmkm = db.prepare(`
      INSERT INTO umkm (id, name, category, description, location, owner_name, public_contact, allows_public_contact, instagram, whatsapp, product_highlights)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const u of data.umkm) {
      insertUmkm.run(u.id, u.name, u.category, u.description, u.location, u.ownerName, u.publicContact || null, u.allowsPublicContact ? 1 : 0, u.instagram || null, u.whatsapp || null, JSON.stringify(u.productHighlights));
    }

    // Documents
    const insertDoc = db.prepare(`
      INSERT INTO documents (id, title, doc_number, category, date, uploader, description, is_public, file_size, file_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const d of data.documents) {
      insertDoc.run(d.id, d.title, d.docNumber, d.category, d.date, d.uploader, d.description, d.isPublic ? 1 : 0, d.fileSize, d.fileType);
    }

    // Audit logs
    const insertLog = db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user, role, action, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const log of data.auditLogs) {
      insertLog.run(log.id, log.timestamp, log.user, log.role, log.action, log.details);
    }
  });

  insertTx();
}

export function getFullAppStateFromDB(db: Database.Database): AppStateData {
  const initBalRow = db.prepare("SELECT value FROM system_config WHERE key = 'initialBalance'").get() as { value: string } | undefined;
  const demoRow = db.prepare("SELECT value FROM system_config WHERE key = 'isDemoMode'").get() as { value: string } | undefined;
  const updatedRow = db.prepare("SELECT value FROM system_config WHERE key = 'lastUpdated'").get() as { value: string } | undefined;

  const initialBalance = initBalRow ? Number(initBalRow.value) : 7500000;
  const isDemoMode = demoRow ? demoRow.value === '1' : true;
  const lastUpdated = updatedRow ? updatedRow.value : new Date().toISOString();

  // Transactions
  const rawTx = db.prepare('SELECT * FROM transactions ORDER BY date DESC').all() as any[];
  const transactions = rawTx.map((t) => ({
    id: t.id,
    code: t.code,
    date: t.date,
    type: t.type,
    category: t.category,
    amount: Number(t.amount),
    description: t.description,
    sourceOrRecipient: t.source_or_recipient,
    proofInfo: t.proof_info,
    createdBy: t.created_by,
    updatedAt: t.updated_at,
    notes: t.notes,
  }));

  // Members
  const rawMembers = db.prepare('SELECT * FROM members ORDER BY member_code ASC').all() as any[];
  const members = rawMembers.map((m) => ({
    id: m.id,
    memberCode: m.member_code,
    name: m.name,
    ageGroup: m.age_group,
    age: Number(m.age),
    address: m.address,
    rt: m.rt,
    rw: m.rw,
    phone: m.phone,
    roleInOrg: m.role_in_org,
    skills: JSON.parse(m.skills || '[]'),
    interests: JSON.parse(m.interests || '[]'),
    joinDate: m.join_date,
    status: m.status,
  }));

  // Contributions
  const rawContributions = db.prepare('SELECT * FROM contributions').all() as any[];
  const contributions = rawContributions.map((c) => ({
    id: c.id,
    memberId: c.member_id,
    memberName: c.member_name,
    month: c.month,
    amount: Number(c.amount),
    status: c.status,
    paidAt: c.paid_at,
    receiptRef: c.receipt_ref,
  }));

  // Families
  const rawFamilies = db.prepare('SELECT * FROM families ORDER BY family_code ASC').all() as any[];
  const families = rawFamilies.map((f) => ({
    id: f.id,
    familyCode: f.family_code,
    rawKK: f.raw_kk,
    maskedKK: f.masked_kk,
    headOfFamily: f.head_of_family,
    address: f.address,
    rt: f.rt,
    rw: f.rw,
    memberCount: Number(f.member_count),
    status: f.status,
    updatedAt: f.updated_at,
    notes: f.notes,
    phone: f.phone,
  }));

  // Announcements
  const rawAnn = db.prepare('SELECT * FROM announcements ORDER BY is_pinned DESC, published_date DESC').all() as any[];
  const announcements = rawAnn.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    category: a.category,
    publishedDate: a.published_date,
    author: a.author,
    status: a.status,
    attachmentName: a.attachment_name,
    isPinned: a.is_pinned === 1,
  }));

  // Events & Attendees
  const rawEvents = db.prepare('SELECT * FROM events ORDER BY date ASC').all() as any[];
  const rawAttendees = db.prepare('SELECT * FROM event_attendees').all() as any[];
  const events = rawEvents.map((e) => {
    const attendees = rawAttendees
      .filter((att) => att.event_id === e.id)
      .map((att) => ({
        memberId: att.member_id,
        memberName: att.member_name,
        status: att.status,
        checkedAt: att.checked_at,
        notes: att.notes,
      }));
    return {
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time,
      location: e.location,
      personInCharge: e.person_in_charge,
      description: e.description,
      budget: Number(e.budget),
      status: e.status,
      attendees,
    };
  });

  // Work programs
  const rawProker = db.prepare('SELECT * FROM work_programs').all() as any[];
  const workPrograms = rawProker.map((p) => ({
    id: p.id,
    name: p.name,
    division: p.division,
    goal: p.goal,
    personInCharge: p.person_in_charge,
    schedule: p.schedule,
    plannedBudget: Number(p.planned_budget),
    realizedBudget: Number(p.realized_budget),
    target: p.target,
    progress: Number(p.progress),
    status: p.status,
  }));

  // Inventory & Loans
  const rawInv = db.prepare('SELECT * FROM inventory').all() as any[];
  const rawLoans = db.prepare('SELECT * FROM inventory_loans').all() as any[];
  const inventory = rawInv.map((inv) => {
    const loans = rawLoans
      .filter((l) => l.inventory_id === inv.id)
      .map((l) => ({
        id: l.id,
        borrowerName: l.borrower_name,
        borrowerContact: l.borrower_contact,
        borrowDate: l.borrow_date,
        dueDate: l.due_date,
        returnDate: l.return_date,
        quantity: Number(l.quantity),
        status: l.status,
        notes: l.notes,
      }));
    return {
      id: inv.id,
      name: inv.name,
      code: inv.code,
      quantity: Number(inv.quantity),
      condition: inv.condition,
      location: inv.location,
      procurementDate: inv.procurement_date,
      personInCharge: inv.person_in_charge,
      loans,
    };
  });

  // UMKM
  const rawUmkm = db.prepare('SELECT * FROM umkm').all() as any[];
  const umkm = rawUmkm.map((u) => ({
    id: u.id,
    name: u.name,
    category: u.category,
    description: u.description,
    location: u.location,
    ownerName: u.owner_name,
    publicContact: u.public_contact,
    allowsPublicContact: u.allows_public_contact === 1,
    instagram: u.instagram,
    whatsapp: u.whatsapp,
    productHighlights: JSON.parse(u.product_highlights || '[]'),
  }));

  // Documents
  const rawDocs = db.prepare('SELECT * FROM documents ORDER BY date DESC').all() as any[];
  const documents = rawDocs.map((d) => ({
    id: d.id,
    title: d.title,
    docNumber: d.doc_number,
    category: d.category,
    date: d.date,
    uploader: d.uploader,
    description: d.description,
    isPublic: d.is_public === 1,
    fileSize: d.file_size,
    fileType: d.file_type,
  }));

  // Audit Logs
  const rawLogs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100').all() as any[];
  const auditLogs = rawLogs.map((l) => ({
    id: l.id,
    timestamp: l.timestamp,
    user: l.user,
    role: l.role,
    action: l.action,
    details: l.details,
  }));

  return {
    initialBalance,
    isDemoMode,
    lastUpdated,
    transactions,
    contributions,
    families,
    members,
    announcements,
    events,
    workPrograms,
    inventory,
    umkm,
    documents,
    auditLogs,
  };
}

export function getDatabaseStats(db: Database.Database) {
  const tables = [
    'transactions',
    'members',
    'contributions',
    'families',
    'announcements',
    'events',
    'work_programs',
    'inventory',
    'umkm',
    'documents',
    'audit_logs',
  ];

  const stats: Record<string, number> = {};
  for (const t of tables) {
    const row = db.prepare(`SELECT count(*) as count FROM ${t}`).get() as { count: number };
    stats[t] = row.count;
  }
  return {
    engine: 'SQLite 3 (better-sqlite3 ACID-compliant relational DB)',
    dbFile: 'data/ruangmuda.sqlite',
    status: 'CONNECTED',
    tables: stats,
  };
}
