/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  Users,
  UserCheck,
  Megaphone,
  CalendarCheck,
  Briefcase,
  Package,
  Store,
  FileText,
  Settings,
  ShieldAlert,
  TreePine,
  X,
} from 'lucide-react';
import { useApp, ActiveModule } from '../../context/AppContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeModule, setActiveModule, currentUser, state } = useApp();

  const navItems: { id: ActiveModule; label: string; icon: React.ElementType; badge?: number | string; badgeColor?: string }[] = [
    { id: 'beranda', label: 'Beranda & Dasbor', icon: LayoutDashboard },
    { id: 'keuangan', label: 'Buku Kas & Keuangan', icon: Wallet, badge: state.transactions.length },
    { id: 'keluarga', label: 'Data KK & Keluarga', icon: Users, badge: state.families.length },
    { id: 'pemuda', label: 'Data Pemuda Desa', icon: UserCheck, badge: state.members.filter(m => m.status === 'Aktif').length },
    { id: 'pengumuman', label: 'Pengumuman Desa', icon: Megaphone, badge: state.announcements.filter(a => a.status === 'dipublikasikan').length },
    { id: 'agenda', label: 'Agenda & Absensi', icon: CalendarCheck, badge: state.events.filter(e => e.status === 'rencana').length },
    { id: 'proker', label: 'Program Kerja', icon: Briefcase, badge: `${state.workPrograms.length}` },
    { id: 'inventaris', label: 'Inventaris Barang', icon: Package, badge: state.inventory.reduce((acc, i) => acc + i.loans.filter(l => l.status === 'dipinjam').length, 0) || undefined, badgeColor: 'bg-amber-500' },
    { id: 'umkm', label: 'UMKM & Potensi', icon: Store, badge: state.umkm.length },
    { id: 'dokumen', label: 'Dokumen Organisasi', icon: FileText, badge: state.documents.length },
    { id: 'pengaturan', label: 'Akun & Keamanan', icon: Settings },
  ];

  const handleSelect = (id: ActiveModule) => {
    setActiveModule(id);
    setMobileOpen(false);
  };

  const roleBadgeColors: Record<string, string> = {
    admin: 'bg-red-500 text-white',
    bendahara: 'bg-amber-500 text-slate-900 font-semibold',
    pengurus: 'bg-emerald-600 text-white',
    anggota: 'bg-blue-600 text-white',
    pengunjung: 'bg-stone-500 text-white',
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-[#143d2b] text-emerald-50 border-r border-[#1e543b] shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f583f] bg-[#0f2e20]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-[#f77f00] text-white shadow-md shadow-emerald-950/40">
              <TreePine className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
                RUANG MUDA
                <span className="text-amber-400 font-extrabold text-sm tracking-wider">DESA</span>
              </div>
              <p className="text-[11px] text-emerald-200/80 font-medium">Satu Data, Satu Informasi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup Menu Navigasi"
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800/60 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Badge */}
        {state.isDemoMode && (
          <div className="mx-4 mt-3 px-3 py-2 bg-amber-500/15 border border-amber-500/30 rounded-lg flex items-center gap-2 text-amber-300 text-xs">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-900 tracking-wider">
              DEMO
            </span>
            <span className="text-[11px] leading-tight text-amber-200">
              Simulasi Karang Taruna Desa Sukamaju
            </span>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-emerald-700/50" aria-label="Menu Utama">
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400/80">
            Menu Utama
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950/30'
                    : 'text-emerald-100 hover:bg-emerald-800/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-amber-300' : 'text-emerald-300/80 group-hover:text-emerald-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                      item.badgeColor || (isActive ? 'bg-emerald-900/80 text-emerald-200' : 'bg-emerald-800/80 text-emerald-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Active User Card / Footer */}
        <div className="p-3 border-t border-[#1e543b] bg-[#0f2e20]/90">
          <div className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs text-white uppercase ring-2 ring-emerald-500/30 shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-300/90 truncate">{currentUser.title}</div>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase shrink-0 ${roleBadgeColors[currentUser.role] || 'bg-emerald-600 text-white'}`}>
              {currentUser.role}
            </span>
          </div>

          <div className="mt-2 text-center">
            <p className="text-[10px] text-emerald-400/60 font-medium tracking-tight">
              Versi 1.0 &bull; Bersama Membangun Desa
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
