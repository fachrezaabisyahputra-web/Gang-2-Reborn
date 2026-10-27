/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'pengunjung' | 'anggota' | 'pengurus' | 'bendahara' | 'admin';

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  email: string;
  rt: string;
  rw: string;
  avatarUrl?: string;
}

export type TransactionType = 'pemasukan' | 'pengeluaran';

export type IncomeCategory = 'iuran' | 'donasi' | 'sponsor' | 'bantuan' | 'pendapatan_kegiatan' | 'lainnya';
export type ExpenseCategory = 'konsumsi' | 'perlengkapan' | 'kebersihan' | 'sosial' | 'administrasi' | 'kegiatan' | 'lainnya';

export interface Transaction {
  id: string;
  code: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  sourceOrRecipient: string;
  proofInfo: string;
  createdBy: string;
  updatedAt?: string;
  notes?: string;
}

export interface MemberContribution {
  id: string;
  memberId: string;
  memberName: string;
  month: string; // e.g. "2026-10"
  amount: number;
  status: 'lunas' | 'belum';
  paidAt?: string;
  receiptRef?: string;
}

export interface FamilyData {
  id: string;
  familyCode: string; // Kode pendaftaran KK
  rawKK?: string; // sensitive
  maskedKK: string;
  headOfFamily: string;
  address: string;
  rt: string;
  rw: string;
  memberCount: number;
  status: 'Lengkap' | 'Perlu Verifikasi' | 'Belum Lengkap';
  updatedAt: string;
  notes?: string;
  phone?: string;
}

export interface YouthMember {
  id: string;
  memberCode: string;
  name: string;
  ageGroup: '13-17' | '18-24' | '25-30';
  age: number;
  address: string;
  rt: string;
  rw: string;
  phone?: string;
  roleInOrg: string;
  skills: string[];
  interests: string[];
  joinDate: string;
  status: 'Aktif' | 'Alumni' | 'Non-Aktif';
}

export type AnnouncementCategory = 'kegiatan' | 'sosial' | 'administrasi' | 'informasi_desa' | 'pemberitahuan_penting';
export type AnnouncementStatus = 'draf' | 'dipublikasikan' | 'diarsipkan';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  publishedDate: string;
  author: string;
  status: AnnouncementStatus;
  attachmentName?: string;
  isPinned?: boolean;
}

export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'tanpa_keterangan';

export interface AttendeeRecord {
  memberId: string;
  memberName: string;
  status: AttendanceStatus;
  checkedAt?: string;
  notes?: string;
}

export interface EventAgenda {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  personInCharge: string;
  description: string;
  budget: number;
  status: 'rencana' | 'berlangsung' | 'selesai' | 'dibatalkan';
  attendees: AttendeeRecord[];
}

export interface WorkProgram {
  id: string;
  name: string;
  division: string;
  goal: string;
  personInCharge: string;
  schedule: string;
  plannedBudget: number;
  realizedBudget: number;
  target: string;
  progress: number; // 0 - 100
  status: 'belum_mulai' | 'berjalan' | 'selesai' | 'tertunda';
}

export interface LoanRecord {
  id: string;
  borrowerName: string;
  borrowerContact: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  quantity: number;
  status: 'dipinjam' | 'kembali';
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  quantity: number;
  condition: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  location: string;
  procurementDate: string;
  personInCharge: string;
  loans: LoanRecord[];
}

export interface UMKMItem {
  id: string;
  name: string;
  category: 'Kuliner' | 'Kerajinan' | 'Pertanian & Peternakan' | 'Jasa Digital' | 'Fashion & Konveksi' | 'Lainnya';
  description: string;
  location: string;
  ownerName: string;
  publicContact?: string;
  allowsPublicContact: boolean;
  instagram?: string;
  whatsapp?: string;
  productHighlights: string[];
}

export interface DocumentItem {
  id: string;
  title: string;
  docNumber: string;
  category: 'Proposal' | 'LPJ' | 'Notulen Rapat' | 'Surat Masuk/Keluar' | 'SK & Regulasi' | 'Dokumentasi Kegiatan';
  date: string;
  uploader: string;
  description: string;
  isPublic: boolean;
  fileSize: string;
  fileType: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
}

export interface AppStateData {
  initialBalance: number;
  isDemoMode: boolean;
  lastUpdated: string;
  transactions: Transaction[];
  contributions: MemberContribution[];
  families: FamilyData[];
  members: YouthMember[];
  announcements: Announcement[];
  events: EventAgenda[];
  workPrograms: WorkProgram[];
  inventory: InventoryItem[];
  umkm: UMKMItem[];
  documents: DocumentItem[];
  auditLogs: AuditLog[];
}
