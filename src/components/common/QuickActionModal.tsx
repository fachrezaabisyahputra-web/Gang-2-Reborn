/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Wallet,
  Users,
  UserCheck,
  Megaphone,
  CalendarCheck,
  Package,
  Store,
  FileText,
  X,
  Plus,
} from 'lucide-react';
import { useApp, ActiveModule } from '../../context/AppContext';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionKey: 'add_transaction' | 'add_member' | 'add_family' | 'add_event' | 'add_announcement' | 'navigate', targetModule: ActiveModule) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const { currentUser } = useApp();

  if (!isOpen) return null;

  const actions = [
    {
      id: 'add_transaction',
      title: 'Catat Transaksi Kas',
      desc: 'Pemasukan atau pengeluaran buku kas organisasi',
      icon: Wallet,
      color: 'bg-emerald-100 text-emerald-800',
      module: 'keuangan' as ActiveModule,
      allowed: currentUser.role === 'bendahara' || currentUser.role === 'admin',
    },
    {
      id: 'add_member',
      title: 'Daftarkan Anggota Pemuda',
      desc: 'Tambah data kader karang taruna & keahlian',
      icon: UserCheck,
      color: 'bg-blue-100 text-blue-800',
      module: 'pemuda' as ActiveModule,
      allowed: currentUser.role === 'pengurus' || currentUser.role === 'admin',
    },
    {
      id: 'add_family',
      title: 'Daftarkan Data KK Warga',
      desc: 'Pendataan keluarga dengan perlindungan nomor KK',
      icon: Users,
      color: 'bg-amber-100 text-amber-800',
      module: 'keluarga' as ActiveModule,
      allowed: currentUser.role === 'pengurus' || currentUser.role === 'admin',
    },
    {
      id: 'add_event',
      title: 'Jadwalkan Agenda Kegiatan',
      desc: 'Buat agenda rapat, gotong royong, dan absensi',
      icon: CalendarCheck,
      color: 'bg-emerald-100 text-emerald-800',
      module: 'agenda' as ActiveModule,
      allowed: currentUser.role === 'pengurus' || currentUser.role === 'admin',
    },
    {
      id: 'add_announcement',
      title: 'Terbitkan Pengumuman',
      desc: 'Informasi resmi desa & karang taruna',
      icon: Megaphone,
      color: 'bg-purple-100 text-purple-800',
      module: 'pengumuman' as ActiveModule,
      allowed: currentUser.role === 'pengurus' || currentUser.role === 'admin',
    },
    {
      id: 'navigate',
      title: 'Kelola Inventaris Barang',
      desc: 'Pencatatan alat & formulir peminjaman',
      icon: Package,
      color: 'bg-stone-100 text-stone-800',
      module: 'inventaris' as ActiveModule,
      allowed: currentUser.role === 'pengurus' || currentUser.role === 'admin',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Pilih Tindakan Cepat Administrasi</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 rounded-lg text-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {actions.map((act) => {
            const Icon = act.icon;
            if (!act.allowed) return null;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => {
                  onSelectAction(act.id as any, act.module);
                  onClose();
                }}
                className="w-full p-3 rounded-xl border border-stone-100 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all flex items-start gap-3 group"
              >
                <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-800">
                    {act.title}
                  </div>
                  <div className="text-[11px] text-stone-500 leading-tight mt-0.5">
                    {act.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
