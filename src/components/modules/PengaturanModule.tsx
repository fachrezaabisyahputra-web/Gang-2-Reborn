/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  UserCheck,
  Database,
  RefreshCw,
  AlertCircle,
  Activity,
  CheckCircle2,
  Lock,
  Server,
  FileCode,
} from 'lucide-react';
import { useApp, ROLE_PROFILES } from '../../context/AppContext';
import { UserRole } from '../../types';

export const PengaturanModule: React.FC = () => {
  const {
    currentUser,
    setCurrentRole,
    state,
    resetToDemo,
    clearToEmpty,
    addToast,
    isSyncing,
    syncSuccess,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'peran' | 'basis_data' | 'audit'>('peran');

  const roleDescriptions: {
    role: UserRole;
    name: string;
    label: string;
    badge: string;
    access: string[];
    restrictions: string[];
  }[] = [
    {
      role: 'admin',
      name: 'Rian Pratama, S.Kom.',
      label: 'Administrator Sistem',
      badge: 'bg-red-500 text-white',
      access: [
        'Akses penuh semua modul dan data desa',
        'Kelola pengguna dan hak akses peran',
        'Audit log aktivitas & konfigurasi sistem',
        'Tambah, edit, dan hapus transaksi kas',
        'Buka masking nomor KK untuk verifikasi',
      ],
      restrictions: ['Wajib menjaga kerahasiaan data warga sesuai UU PDP'],
    },
    {
      role: 'bendahara',
      name: 'Siti Rahma, S.Ak.',
      label: 'Bendahara Umum',
      badge: 'bg-amber-500 text-slate-900 font-semibold',
      access: [
        'Kelola buku kas umum (tambah, edit, hapus)',
        'Pencatatan & toggle iuran rutin pemuda',
        'Ekspor laporan keuangan (CSV, Excel, Cetak)',
        'Pantau realisasi anggaran program kerja',
      ],
      restrictions: ['Tidak dapat mengubah struktur hak akses pengguna lain'],
    },
    {
      role: 'pengurus',
      name: 'Dewi Lestari, S.Pd.',
      label: 'Pengurus Organisasi',
      badge: 'bg-emerald-600 text-white',
      access: [
        'Kelola data anggota pemuda dan arsip status',
        'Kelola data kartu keluarga (KK) warga',
        'Jadwalkan agenda & checklist presensi',
        'Terbitkan pengumuman & kelola proker',
        'Kelola inventaris dan peminjaman barang',
      ],
      restrictions: ['Akses buku kas hanya lihat (read-only)'],
    },
    {
      role: 'anggota',
      name: 'Bagus Wicaksono',
      label: 'Anggota Pemuda Aktif',
      badge: 'bg-blue-600 text-white',
      access: [
        'Melihat direktori anggota pemuda & keahlian',
        'Konfirmasi kehadiran (RSVP) agenda kegiatan',
        'Mengakses dokumen arsip publik & internal',
        'Mendaftarkan usaha UMKM pemuda',
      ],
      restrictions: [
        'Tidak dapat mengubah kas dan data KK keluarga lain',
        'Tidak dapat mengubah status peminjaman inventaris',
      ],
    },
    {
      role: 'pengunjung',
      name: 'Warga / Tamu Publik',
      label: 'Pengunjung Tamu',
      badge: 'bg-stone-500 text-white',
      access: [
        'Membaca pengumuman publik desa',
        'Melihat direktori UMKM binaan pemuda',
        'Melihat jadwal kegiatan umum',
      ],
      restrictions: [
        'Akses dibatasi hanya informasi publik',
        'Nomor KK disamarkan dan dokumen internal dikunci',
      ],
    },
  ];

  const [dbStats, setDbStats] = useState<{
    engine: string;
    dbFile: string;
    status: string;
    tables: Record<string, number>;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchDbStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/db/stats');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.stats) {
          setDbStats(json.stats);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch db stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'basis_data') {
      fetchDbStats();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-700" />
            <span>Pengaturan Akun, Keamanan &amp; Basis Data</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Manajemen kontrol akses berbasis peran (RBAC), konfigurasi penyimpanan, dan log audit
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab('peran')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'peran'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Peran &amp; Hak Akses (RBAC)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('basis_data')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'basis_data'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Status Basis Data &amp; Penyimpanan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'audit'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Riwayat Audit Log ({state.auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Peran & Hak Akses */}
      {activeTab === 'peran' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-emerald-950 text-sm">
                Peran Pengguna Aktif Saat Ini: <span className="uppercase text-emerald-800">{currentUser.role}</span>
              </div>
              <p className="text-emerald-800/80 mt-0.5">
                Login sebagai: <strong>{currentUser.name}</strong> ({currentUser.title}). Anda dapat beralih peran dengan memilih tombol di bawah untuk menguji pembatasan fitur.
              </p>
            </div>
            <div className="px-3 py-1 bg-white border border-emerald-300 rounded-xl font-bold text-emerald-900 shadow-2xs">
              Simulasi RBAC Aktif
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roleDescriptions.map((item) => {
              const isCurrent = currentUser.role === item.role;
              return (
                <div
                  key={item.role}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-emerald-900 text-white border-emerald-950 shadow-md ring-2 ring-emerald-500/30'
                      : 'bg-white text-stone-800 border-stone-200/80 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${item.badge}`}>
                        {item.role}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Sedang Aktif
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base mb-0.5">{item.label}</h3>
                    <div className={`text-xs mb-3 ${isCurrent ? 'text-emerald-200' : 'text-stone-500'}`}>
                      Akun simulasi: {item.name}
                    </div>

                    <div className="space-y-2 text-xs mb-4">
                      <div className={`font-semibold text-[11px] uppercase tracking-wider ${isCurrent ? 'text-emerald-300' : 'text-stone-500'}`}>
                        Kewenangan:
                      </div>
                      {item.access.map((acc, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 leading-tight">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isCurrent ? 'text-amber-300' : 'text-emerald-600'}`} />
                          <span className={isCurrent ? 'text-emerald-100' : 'text-stone-700'}>{acc}</span>
                        </div>
                      ))}

                      <div className={`font-semibold text-[11px] uppercase tracking-wider pt-2 ${isCurrent ? 'text-emerald-300' : 'text-stone-500'}`}>
                        Batasan Akses:
                      </div>
                      {item.restrictions.map((res, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 leading-tight">
                          <Lock className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isCurrent ? 'text-amber-400' : 'text-red-500'}`} />
                          <span className={isCurrent ? 'text-emerald-200' : 'text-stone-500'}>{res}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-current/15">
                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => setCurrentRole(item.role)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-emerald-800 text-emerald-300 cursor-default'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs'
                      }`}
                    >
                      {isCurrent ? 'Peran Sedang Digunakan' : `Beralih ke ${item.role}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Status Basis Data & Penyimpanan */}
      {activeTab === 'basis_data' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <span>Basis Data File JSON: TERHUBUNG &amp; AKTIF</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Sistem Penyimpanan Berkas JSON Terpadu (Atomic Read, Write &amp; CRUD)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/api/json/raw"
                  target="_blank"
                  rel="noreferrer"
                  download="ruangmuda-backup.json"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>Unduh JSON</span>
                </a>
                <button
                  type="button"
                  onClick={fetchDbStats}
                  disabled={loadingStats}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
                  <span>Segarkan</span>
                </button>
              </div>
            </div>

            {/* Architecture Overview */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-xl space-y-2 text-xs text-emerald-950">
              <div className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-700" />
                <span>Arsitektur Basis Data Berkas JSON (Read, Write &amp; CRUD)</span>
              </div>
              <p className="leading-relaxed text-emerald-800">
                Sistem database aplikasi <strong>RUANG MUDA DESA</strong> dikonfigurasi menggunakan berkas <strong>JSON terstruktur</strong> (<code>data/ruangmuda.json</code>).
                Seluruh aktivitas <strong>Read (baca data)</strong>, <strong>Write (simpan data)</strong>, <strong>Create (tambah rekor baru)</strong>,
                <strong>Update (edit transaksi/anggota)</strong>, dan <strong>Delete (hapus)</strong> dieksekusi secara instan dan atomik ke file JSON di server backend port 3000.
                Data dijamin tidak hilang saat halaman di-refresh dan dapat diunduh kapan saja sebagai arsip cadangan.
              </p>
            </div>

            {/* Live Database Metrics */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-xs text-stone-700">
              <div className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-stone-600" />
                <span>Spesifikasi &amp; Metrik Berkas JSON Real-Time:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-stone-200">
                  <span className="font-medium text-stone-600">Engine Database:</span>
                  <span className="font-mono text-emerald-800 font-bold">{dbStats?.engine || 'JSON File-Based Store'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-stone-200">
                  <span className="font-medium text-stone-600">Lokasi Berkas JSON:</span>
                  <span className="font-mono text-stone-800 font-semibold">{dbStats?.dbFile || 'data/ruangmuda.json'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-stone-200">
                  <span className="font-medium text-stone-600">Status Operasional:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> CRUD &amp; Sync Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-stone-200">
                  <span className="font-medium text-stone-600">Pembaruan Terakhir:</span>
                  <span className="font-mono text-stone-500">{state.lastUpdated ? new Date(state.lastUpdated).toLocaleTimeString('id-ID') : '-'}</span>
                </div>
              </div>

              {/* Real-time Collection Counts */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Koleksi JSON &amp; Jumlah Item Tersimpan di Berkas:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {dbStats?.tables ? (
                    Object.entries(dbStats.tables).map(([table, count]) => (
                      <div key={table} className="p-2 bg-white rounded-lg border border-stone-200/90 flex items-center justify-between">
                        <span className="font-mono text-[11px] text-stone-600">{table}</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-md">{count} item</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="p-2 bg-white rounded-lg border border-stone-200 flex items-center justify-between">
                        <span className="font-mono text-[11px] text-stone-600">transactions</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-md">{state.transactions.length} item</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-stone-200 flex items-center justify-between">
                        <span className="font-mono text-[11px] text-stone-600">members</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-md">{state.members.length} item</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-stone-200 flex items-center justify-between">
                        <span className="font-mono text-[11px] text-stone-600">families</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-md">{state.families.length} item</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-stone-200 flex items-center justify-between">
                        <span className="font-mono text-[11px] text-stone-600">events</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-md">{state.events.length} item</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Reset / Clear Buttons */}
            <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-stone-900">Manajemen Berkas Basis Data JSON</div>
                <div className="text-[11px] text-stone-500">Pulihkan data contoh Karang Taruna atau bersihkan berkas JSON untuk input data riil desa</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetToDemo}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Pulihkan Data Demo JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Kosongkan semua data simulasi pada file JSON untuk input data asli desa Anda?')) {
                      clearToEmpty();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Kosongkan Berkas JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Riwayat Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800 uppercase tracking-wider">
              Log Audit Aktivitas Organisasi ({state.auditLogs.length} Catatan)
            </span>
            <span className="text-stone-500">Mencatat riwayat perubahan data sensitif & administrasi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Pengguna & Peran</th>
                  <th className="py-3 px-4">Aksi / Tindakan</th>
                  <th className="py-3 px-4">Rincian Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {state.auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 text-stone-500 font-mono whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-stone-900">{log.user}</div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-stone-100 text-stone-600">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-800 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-stone-600 leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
