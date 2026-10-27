/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppStateData,
  CurrentUser,
  UserRole,
  Transaction,
  FamilyData,
  YouthMember,
  Announcement,
  EventAgenda,
  WorkProgram,
  InventoryItem,
  UMKMItem,
  DocumentItem,
  MemberContribution,
  AuditLog,
  AttendanceStatus,
} from '../types';
import { INITIAL_DEMO_DATA } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'ruang_muda_desa_data_v1';
const CURRENT_USER_KEY = 'ruang_muda_desa_user_v1';

export const ROLE_PROFILES: Record<UserRole, CurrentUser> = {
  admin: {
    id: 'u-admin',
    name: 'Rian Pratama, S.Kom.',
    role: 'admin',
    title: 'Administrator & Ketua Karang Taruna',
    email: 'rian.pratama@desa-sukamaju.id',
    rt: '01',
    rw: '01',
  },
  bendahara: {
    id: 'u-bendahara',
    name: 'Siti Rahma, S.Ak.',
    role: 'bendahara',
    title: 'Bendahara Umum Karang Taruna',
    email: 'siti.rahma@desa-sukamaju.id',
    rt: '02',
    rw: '01',
  },
  pengurus: {
    id: 'u-pengurus',
    name: 'Dewi Lestari, S.Pd.',
    role: 'pengurus',
    title: 'Sekretaris & Pengurus Desa',
    email: 'dewi.lestari@desa-sukamaju.id',
    rt: '02',
    rw: '01',
  },
  anggota: {
    id: 'u-anggota',
    name: 'Bagus Wicaksono',
    role: 'anggota',
    title: 'Anggota Pemuda Aktif Dusun',
    email: 'bagus.w@desa-sukamaju.id',
    rt: '02',
    rw: '02',
  },
  pengunjung: {
    id: 'u-tamu',
    name: 'Warga / Pengunjung Tamu',
    role: 'pengunjung',
    title: 'Akses Publik & Warga Desa',
    email: 'warga@desa-sukamaju.id',
    rt: '01',
    rw: '01',
  },
};

export type ActiveModule =
  | 'beranda'
  | 'keuangan'
  | 'keluarga'
  | 'pemuda'
  | 'pengumuman'
  | 'agenda'
  | 'proker'
  | 'inventaris'
  | 'umkm'
  | 'dokumen'
  | 'pengaturan';

interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  state: AppStateData;
  currentUser: CurrentUser;
  setCurrentRole: (role: UserRole) => void;
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  isSyncing: boolean;
  syncSuccess: boolean;
  toasts: NotificationToast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Global Search modal
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'code' | 'createdBy' | 'updatedAt'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  toggleContribution: (memberId: string, month: string) => void;

  addFamily: (fam: Omit<FamilyData, 'id' | 'familyCode' | 'updatedAt' | 'maskedKK'> & { rawKK: string }) => void;
  updateFamily: (fam: FamilyData) => void;
  deleteFamily: (id: string) => void;

  addMember: (m: Omit<YouthMember, 'id' | 'memberCode'>) => void;
  updateMember: (m: YouthMember) => void;
  archiveMember: (id: string) => void;

  addAnnouncement: (ann: Omit<Announcement, 'id' | 'publishedDate' | 'author'>) => void;
  updateAnnouncement: (ann: Announcement) => void;
  deleteAnnouncement: (id: string) => void;

  addEvent: (ev: Omit<EventAgenda, 'id' | 'attendees'>) => void;
  updateEvent: (ev: EventAgenda) => void;
  updateEventAttendance: (eventId: string, memberId: string, status: AttendanceStatus, notes?: string) => void;
  rsvpEvent: (eventId: string, status: AttendanceStatus) => void;

  addWorkProgram: (pro: Omit<WorkProgram, 'id'>) => void;
  updateWorkProgram: (pro: WorkProgram) => void;

  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'loans'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  borrowInventory: (itemId: string, borrowerName: string, borrowerContact: string, qty: number, dueDate: string, notes?: string) => void;
  returnInventory: (itemId: string, loanId: string) => void;

  addUMKM: (item: Omit<UMKMItem, 'id'>) => void;
  updateUMKM: (item: UMKMItem) => void;

  addDocument: (doc: Omit<DocumentItem, 'id' | 'uploader' | 'date'>) => void;
  deleteDocument: (id: string) => void;

  resetToDemo: () => Promise<void>;
  clearToEmpty: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (ROLE_PROFILES[parsed.role as UserRole]) {
          return ROLE_PROFILES[parsed.role as UserRole];
        }
      }
    } catch {
      // ignore
    }
    return ROLE_PROFILES.admin;
  });

  const [activeModule, setActiveModule] = useState<ActiveModule>('beranda');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(true);

  const [state, setState] = useState<AppStateData>(() => {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (local) {
        return JSON.parse(local);
      }
    } catch {
      // ignore
    }
    return INITIAL_DEMO_DATA;
  });

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save changes to backend server API and local storage
  const syncToServer = useCallback(async (newState: AppStateData) => {
    setIsSyncing(true);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
      const res = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState),
      });
      if (res.ok) {
        setSyncSuccess(true);
      }
    } catch {
      // Server may be in offline or restarting; localStorage holds data safely
      setSyncSuccess(true);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Load from server on mount
  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setState(json.data);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
          }
        }
      } catch {
        // use fallback state
      }
    }
    loadInitial();
    return () => {
      isMounted = false;
    };
  }, []);

  const setCurrentRole = useCallback((role: UserRole) => {
    const profile = ROLE_PROFILES[role];
    setCurrentUser(profile);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    addToast(`Beralih ke peran: ${profile.title}`, 'info');
  }, [addToast]);

  const updateStateWithAudit = useCallback((
    updater: (prev: AppStateData) => AppStateData,
    auditAction: string,
    auditDetails: string
  ) => {
    setState((prev) => {
      const updated = updater(prev);
      const newAudit: AuditLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        user: currentUser.name,
        role: currentUser.role,
        action: auditAction,
        details: auditDetails,
      };
      const finalState = {
        ...updated,
        lastUpdated: new Date().toISOString(),
        auditLogs: [newAudit, ...updated.auditLogs.slice(0, 49)],
      };
      syncToServer(finalState);
      return finalState;
    });
  }, [currentUser, syncToServer]);

  // Transaction handlers
  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'code' | 'createdBy' | 'updatedAt'>) => {
    const dateStr = tx.date.replace(/-/g, '').slice(0, 6);
    const id = 'trx-' + Date.now();
    const count = (state.transactions.length + 1).toString().padStart(3, '0');
    const code = `TRX-${dateStr}-${count}`;

    const newTx: Transaction = {
      ...tx,
      id,
      code,
      createdBy: currentUser.name,
      updatedAt: new Date().toISOString(),
    };

    updateStateWithAudit(
      (prev) => ({
        ...prev,
        transactions: [newTx, ...prev.transactions],
      }),
      'Tambah Transaksi',
      `Mencatat ${tx.type}: ${tx.description} (Rp ${tx.amount.toLocaleString('id-ID')})`
    );
    addToast('Transaksi berhasil ditambahkan ke buku kas');
  }, [currentUser, state.transactions.length, updateStateWithAudit, addToast]);

  const updateTransaction = useCallback((tx: Transaction) => {
    updateStateWithAudit(
      (prev) => ({
        ...prev,
        transactions: prev.transactions.map((t) => (t.id === tx.id ? { ...tx, updatedAt: new Date().toISOString() } : t)),
      }),
      'Ubah Transaksi',
      `Memperbarui transaksi ${tx.code}: ${tx.description}`
    );
    addToast('Perubahan transaksi tersimpan');
  }, [updateStateWithAudit, addToast]);

  const deleteTransaction = useCallback((id: string) => {
    const target = state.transactions.find((t) => t.id === id);
    updateStateWithAudit(
      (prev) => ({
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== id),
      }),
      'Hapus Transaksi',
      `Menghapus transaksi ${target ? target.code : id}`
    );
    addToast('Transaksi berhasil dihapus');
  }, [state.transactions, updateStateWithAudit, addToast]);

  // Contribution toggle
  const toggleContribution = useCallback((memberId: string, month: string) => {
    const member = state.members.find((m) => m.id === memberId);
    setState((prev) => {
      const existing = prev.contributions.find((c) => c.memberId === memberId && c.month === month);
      let updatedContributions: MemberContribution[];
      if (existing) {
        const nextStatus = existing.status === 'lunas' ? 'belum' : 'lunas';
        updatedContributions = prev.contributions.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                status: nextStatus,
                paidAt: nextStatus === 'lunas' ? new Date().toISOString().slice(0, 10) : undefined,
                receiptRef: nextStatus === 'lunas' ? `KW-${Date.now().toString().slice(-4)}` : undefined,
              }
            : c
        );
      } else {
        const newContr: MemberContribution = {
          id: 'c-' + Date.now(),
          memberId,
          memberName: member ? member.name : 'Anggota',
          month,
          amount: 50000,
          status: 'lunas',
          paidAt: new Date().toISOString().slice(0, 10),
          receiptRef: `KW-${Date.now().toString().slice(-4)}`,
        };
        updatedContributions = [newContr, ...prev.contributions];
      }

      const finalState = { ...prev, contributions: updatedContributions };
      syncToServer(finalState);
      return finalState;
    });
    addToast(`Status iuran ${member ? member.name : ''} diperbarui`);
  }, [state.members, syncToServer, addToast]);

  // Family handlers
  const addFamily = useCallback((fam: Omit<FamilyData, 'id' | 'familyCode' | 'updatedAt' | 'maskedKK'> & { rawKK: string }) => {
    const id = 'kk-' + Date.now();
    const count = (state.families.length + 1).toString().padStart(4, '0');
    const familyCode = `KK-SKM-${count}`;
    const cleanKK = fam.rawKK.replace(/\s+/g, '');
    const maskedKK = cleanKK.length >= 6 ? `${cleanKK.slice(0, 6)}******${cleanKK.slice(-4)}` : '******';

    const newFam: FamilyData = {
      ...fam,
      id,
      familyCode,
      maskedKK,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    updateStateWithAudit(
      (prev) => ({ ...prev, families: [newFam, ...prev.families] }),
      'Tambah Data KK',
      `Mendaftarkan keluarga baru: ${fam.headOfFamily} (RT ${fam.rt} / RW ${fam.rw})`
    );
    addToast('Data KK keluarga berhasil didaftarkan');
  }, [state.families.length, updateStateWithAudit, addToast]);

  const updateFamily = useCallback((fam: FamilyData) => {
    updateStateWithAudit(
      (prev) => ({
        ...prev,
        families: prev.families.map((f) => (f.id === fam.id ? { ...fam, updatedAt: new Date().toISOString().slice(0, 10) } : f)),
      }),
      'Perbarui Data KK',
      `Memperbarui data keluarga ${fam.headOfFamily} (${fam.familyCode})`
    );
    addToast('Data KK berhasil diperbarui');
  }, [updateStateWithAudit, addToast]);

  const deleteFamily = useCallback((id: string) => {
    const target = state.families.find((f) => f.id === id);
    updateStateWithAudit(
      (prev) => ({
        ...prev,
        families: prev.families.filter((f) => f.id !== id),
      }),
      'Hapus Data KK',
      `Menghapus data KK ${target ? target.headOfFamily : id}`
    );
    addToast('Data keluarga dihapus');
  }, [state.families, updateStateWithAudit, addToast]);

  // Youth Member handlers
  const addMember = useCallback((m: Omit<YouthMember, 'id' | 'memberCode'>) => {
    const id = 'pmd-' + Date.now();
    const count = (state.members.length + 1).toString().padStart(3, '0');
    const memberCode = `PMD-${count}`;

    const newMember: YouthMember = {
      ...m,
      id,
      memberCode,
    };

    updateStateWithAudit(
      (prev) => ({ ...prev, members: [newMember, ...prev.members] }),
      'Tambah Anggota Pemuda',
      `Mendaftarkan anggota baru: ${m.name} (${memberCode})`
    );
    addToast('Anggota pemuda berhasil didaftarkan');
  }, [state.members.length, updateStateWithAudit, addToast]);

  const updateMember = useCallback((m: YouthMember) => {
    updateStateWithAudit(
      (prev) => ({
        ...prev,
        members: prev.members.map((item) => (item.id === m.id ? m : item)),
      }),
      'Perbarui Data Anggota',
      `Memperbarui data anggota ${m.name}`
    );
    addToast('Data anggota berhasil diperbarui');
  }, [updateStateWithAudit, addToast]);

  const archiveMember = useCallback((id: string) => {
    const target = state.members.find((m) => m.id === id);
    updateStateWithAudit(
      (prev) => ({
        ...prev,
        members: prev.members.map((m) => (m.id === id ? { ...m, status: 'Alumni' as const } : m)),
      }),
      'Arsipkan Anggota',
      `Mengubah status ${target ? target.name : id} menjadi Alumni`
    );
    addToast('Anggota berhasil diarsipkan ke status Alumni');
  }, [state.members, updateStateWithAudit, addToast]);

  // Announcement handlers
  const addAnnouncement = useCallback((ann: Omit<Announcement, 'id' | 'publishedDate' | 'author'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: 'ann-' + Date.now(),
      publishedDate: new Date().toISOString().slice(0, 10),
      author: currentUser.name,
    };

    updateStateWithAudit(
      (prev) => ({ ...prev, announcements: [newAnn, ...prev.announcements] }),
      'Buat Pengumuman',
      `Membuat pengumuman: ${ann.title}`
    );
    addToast('Pengumuman berhasil diterbitkan');
  }, [currentUser.name, updateStateWithAudit, addToast]);

  const updateAnnouncement = useCallback((ann: Announcement) => {
    updateStateWithAudit(
      (prev) => ({
        ...prev,
        announcements: prev.announcements.map((a) => (a.id === ann.id ? ann : a)),
      }),
      'Ubah Pengumuman',
      `Memperbarui pengumuman: ${ann.title}`
    );
    addToast('Pengumuman berhasil diperbarui');
  }, [updateStateWithAudit, addToast]);

  const deleteAnnouncement = useCallback((id: string) => {
    updateStateWithAudit(
      (prev) => ({
        ...prev,
        announcements: prev.announcements.filter((a) => a.id !== id),
      }),
      'Hapus Pengumuman',
      `Menghapus pengumuman ID: ${id}`
    );
    addToast('Pengumuman dihapus');
  }, [updateStateWithAudit, addToast]);

  // Event & Attendance handlers
  const addEvent = useCallback((ev: Omit<EventAgenda, 'id' | 'attendees'>) => {
    const newEvent: EventAgenda = {
      ...ev,
      id: 'ev-' + Date.now(),
      attendees: state.members.map((m) => ({
        memberId: m.id,
        memberName: m.name,
        status: 'tanpa_keterangan',
      })),
    };

    updateStateWithAudit(
      (prev) => ({ ...prev, events: [newEvent, ...prev.events] }),
      'Tambah Agenda',
      `Menambahkan agenda baru: ${ev.title}`
    );
    addToast('Agenda kegiatan berhasil dijadwalkan');
  }, [state.members, updateStateWithAudit, addToast]);

  const updateEvent = useCallback((ev: EventAgenda) => {
    updateStateWithAudit(
      (prev) => ({
        ...prev,
        events: prev.events.map((e) => (e.id === ev.id ? ev : e)),
      }),
      'Perbarui Agenda',
      `Memperbarui agenda: ${ev.title}`
    );
    addToast('Agenda berhasil diperbarui');
  }, [updateStateWithAudit, addToast]);

  const updateEventAttendance = useCallback((eventId: string, memberId: string, status: AttendanceStatus, notes?: string) => {
    setState((prev) => {
      const updatedEvents = prev.events.map((ev) => {
        if (ev.id !== eventId) return ev;
        const attendees = [...ev.attendees];
        const idx = attendees.findIndex((a) => a.memberId === memberId);
        const member = prev.members.find((m) => m.id === memberId);
        const memberName = member ? member.name : 'Peserta';

        if (idx >= 0) {
          attendees[idx] = {
            ...attendees[idx],
            status,
            checkedAt: new Date().toISOString(),
            notes: notes !== undefined ? notes : attendees[idx].notes,
          };
        } else {
          attendees.push({
            memberId,
            memberName,
            status,
            checkedAt: new Date().toISOString(),
            notes,
          });
        }
        return { ...ev, attendees };
      });

      const finalState = { ...prev, events: updatedEvents };
      syncToServer(finalState);
      return finalState;
    });
    addToast('Kehadiran berhasil dicatat');
  }, [syncToServer, addToast]);

  const rsvpEvent = useCallback((eventId: string, status: AttendanceStatus) => {
    // Current user RSVP
    const member = state.members.find((m) => m.name.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0])) || state.members[0];
    const memberId = member ? member.id : 'current-user';

    updateEventAttendance(eventId, memberId, status, `Konfirmasi mandiri oleh ${currentUser.name}`);
    addToast(`Konfirmasi kehadiran Anda: ${status.toUpperCase()}`);
  }, [currentUser.name, state.members, updateEventAttendance, addToast]);

  // Work Programs
  const addWorkProgram = useCallback((pro: Omit<WorkProgram, 'id'>) => {
    const newPro: WorkProgram = { ...pro, id: 'pro-' + Date.now() };
    updateStateWithAudit(
      (prev) => ({ ...prev, workPrograms: [newPro, ...prev.workPrograms] }),
      'Tambah Program Kerja',
      `Menambah program: ${pro.name}`
    );
    addToast('Program kerja berhasil ditambahkan');
  }, [updateStateWithAudit, addToast]);

  const updateWorkProgram = useCallback((pro: WorkProgram) => {
    updateStateWithAudit(
      (prev) => ({
        ...prev,
        workPrograms: prev.workPrograms.map((p) => (p.id === pro.id ? pro : p)),
      }),
      'Perbarui Program Kerja',
      `Memperbarui program ${pro.name} (Progres: ${pro.progress}%)`
    );
    addToast('Program kerja berhasil diperbarui');
  }, [updateStateWithAudit, addToast]);

  // Inventory & Loans
  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id' | 'loans'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: 'inv-' + Date.now(),
      loans: [],
    };
    updateStateWithAudit(
      (prev) => ({ ...prev, inventory: [newItem, ...prev.inventory] }),
      'Tambah Inventaris',
      `Menambah inventaris: ${item.name} (${item.code})`
    );
    addToast('Barang inventaris berhasil didaftarkan');
  }, [updateStateWithAudit, addToast]);

  const updateInventoryItem = useCallback((item: InventoryItem) => {
    updateStateWithAudit(
      (prev) => ({
        ...prev,
        inventory: prev.inventory.map((inv) => (inv.id === item.id ? item : inv)),
      }),
      'Perbarui Inventaris',
      `Memperbarui inventaris: ${item.name}`
    );
    addToast('Data inventaris berhasil diperbarui');
  }, [updateStateWithAudit, addToast]);

  const borrowInventory = useCallback((itemId: string, borrowerName: string, borrowerContact: string, qty: number, dueDate: string, notes?: string) => {
    const loanRecord = {
      id: 'loan-' + Date.now(),
      borrowerName,
      borrowerContact,
      borrowDate: new Date().toISOString().slice(0, 10),
      dueDate,
      quantity: qty,
      status: 'dipinjam' as const,
      notes,
    };

    updateStateWithAudit(
      (prev) => ({
        ...prev,
        inventory: prev.inventory.map((item) =>
          item.id === itemId
            ? { ...item, loans: [loanRecord, ...item.loans] }
            : item
        ),
      }),
      'Peminjaman Barang',
      `Peminjaman ${qty} unit oleh ${borrowerName}`
    );
    addToast(`Peminjaman barang atas nama ${borrowerName} berhasil dicatat`);
  }, [updateStateWithAudit, addToast]);

  const returnInventory = useCallback((itemId: string, loanId: string) => {
    updateStateWithAudit(
      (prev) => ({
        ...prev,
        inventory: prev.inventory.map((item) => {
          if (item.id !== itemId) return item;
          return {
            ...item,
            loans: item.loans.map((loan) =>
              loan.id === loanId
                ? { ...loan, status: 'kembali' as const, returnDate: new Date().toISOString().slice(0, 10) }
                : loan
            ),
          };
        }),
      }),
      'Pengembalian Barang',
      `Barang pinjaman ID: ${loanId} telah dikembalikan`
    );
    addToast('Pengembalian barang berhasil dikonfirmasi');
  }, [updateStateWithAudit, addToast]);

  // UMKM
  const addUMKM = useCallback((item: Omit<UMKMItem, 'id'>) => {
    const newUmkm: UMKMItem = { ...item, id: 'umkm-' + Date.now() };
    updateStateWithAudit(
      (prev) => ({ ...prev, umkm: [newUmkm, ...prev.umkm] }),
      'Tambah UMKM',
      `Mendaftarkan usaha: ${item.name}`
    );
    addToast('Data UMKM / potensi pemuda berhasil ditambahkan');
  }, [updateStateWithAudit, addToast]);

  const updateUMKM = useCallback((item: UMKMItem) => {
    updateStateWithAudit(
      (prev) => ({
        ...prev,
        umkm: prev.umkm.map((u) => (u.id === item.id ? item : u)),
      }),
      'Perbarui UMKM',
      `Memperbarui usaha: ${item.name}`
    );
    addToast('Data UMKM berhasil diperbarui');
  }, [updateStateWithAudit, addToast]);

  // Documents
  const addDocument = useCallback((doc: Omit<DocumentItem, 'id' | 'uploader' | 'date'>) => {
    const newDoc: DocumentItem = {
      ...doc,
      id: 'doc-' + Date.now(),
      uploader: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
    };
    updateStateWithAudit(
      (prev) => ({ ...prev, documents: [newDoc, ...prev.documents] }),
      'Unggah Dokumen',
      `Menyimpan dokumen: ${doc.title} (${doc.category})`
    );
    addToast('Dokumen berhasil diarsipkan');
  }, [currentUser.name, updateStateWithAudit, addToast]);

  const deleteDocument = useCallback((id: string) => {
    updateStateWithAudit(
      (prev) => ({
        ...prev,
        documents: prev.documents.filter((d) => d.id !== id),
      }),
      'Hapus Dokumen',
      `Menghapus dokumen ID: ${id}`
    );
    addToast('Dokumen berhasil dihapus');
  }, [updateStateWithAudit, addToast]);

  // Demo Resets
  const resetToDemo = useCallback(async () => {
    try {
      await fetch('/api/reset-demo', { method: 'POST' });
    } catch {
      // ignore
    }
    setState(INITIAL_DEMO_DATA);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DATA));
    addToast('Data simulasi Karang Taruna Desa Sukamaju berhasil dipulihkan', 'info');
  }, [addToast]);

  const clearToEmpty = useCallback(async () => {
    const emptyState: AppStateData = {
      initialBalance: 0,
      isDemoMode: false,
      lastUpdated: new Date().toISOString(),
      transactions: [],
      contributions: [],
      families: [],
      members: [],
      announcements: [],
      events: [],
      workPrograms: [],
      inventory: [],
      umkm: [],
      documents: [],
      auditLogs: [
        {
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          role: currentUser.role,
          action: 'Pembersihan Data',
          details: 'Data simulasi DEMO dibersihkan. Memulai pencatatan data riil desa.',
        },
      ],
    };
    try {
      await fetch('/api/clear-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser.name, role: currentUser.role }),
      });
    } catch {
      // ignore
    }
    setState(emptyState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(emptyState));
    addToast('Data berhasil dikosongkan untuk input data baru desa Anda', 'info');
  }, [currentUser, addToast]);

  return (
    <AppContext.Provider
      value={{
        state,
        currentUser,
        setCurrentRole,
        activeModule,
        setActiveModule,
        isSyncing,
        syncSuccess,
        toasts,
        addToast,
        removeToast,
        isSearchOpen,
        setIsSearchOpen,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        toggleContribution,
        addFamily,
        updateFamily,
        deleteFamily,
        addMember,
        updateMember,
        archiveMember,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addEvent,
        updateEvent,
        updateEventAttendance,
        rsvpEvent,
        addWorkProgram,
        updateWorkProgram,
        addInventoryItem,
        updateInventoryItem,
        borrowInventory,
        returnInventory,
        addUMKM,
        updateUMKM,
        addDocument,
        deleteDocument,
        resetToDemo,
        clearToEmpty,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
