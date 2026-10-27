/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  User,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  RefreshCw,
  Plus,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useApp, ROLE_PROFILES } from '../../context/AppContext';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenQuickAction: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenQuickAction }) => {
  const {
    currentUser,
    setCurrentRole,
    setIsSearchOpen,
    state,
    resetToDemo,
    clearToEmpty,
    setActiveModule,
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const notifPopoverRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
      if (notifPopoverRef.current && !notifPopoverRef.current.contains(event.target as Node)) {
        setShowNotifPopover(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rolesList: { role: UserRole; label: string; desc: string; badge: string }[] = [
    { role: 'admin', label: 'Administrator', desc: 'Akses penuh kontrol, seluruh modul & log', badge: 'bg-red-500 text-white' },
    { role: 'bendahara', label: 'Bendahara', desc: 'Buku kas, transaksi, rekap & ekspor keuangan', badge: 'bg-amber-500 text-slate-900 font-semibold' },
    { role: 'pengurus', label: 'Pengurus Organisasi', desc: 'Kelola anggota, KK, agenda, proker & dokumen', badge: 'bg-emerald-600 text-white' },
    { role: 'anggota', label: 'Anggota Pemuda', desc: 'Lihat info anggota, konfirmasi kehadiran & RSVP', badge: 'bg-blue-600 text-white' },
    { role: 'pengunjung', label: 'Pengunjung / Tamu', desc: 'Membaca pengumuman publik & direktori UMKM', badge: 'bg-stone-500 text-white' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-[#faf9f5] border-b border-stone-200 shadow-xs">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Buka Menu Navigasi"
          className="p-2 text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-stone-500 bg-white border border-stone-200 rounded-xl hover:border-emerald-500 hover:text-stone-800 shadow-2xs transition-all w-44 md:w-64 text-left"
          aria-label="Pencarian Global"
        >
          <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="truncate">Cari data desa, kas, anggota...</span>
          <kbd className="hidden sm:inline-block ml-auto px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-100 rounded border border-stone-200">
            Ctrl K
          </kbd>
        </button>

        {/* Demo Indicator */}
        {state.isDemoMode ? (
          <button
            type="button"
            onClick={() => setShowDemoModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Mode Demo Aktif</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Data Riil Aktif</span>
          </div>
        )}
      </div>

      {/* Right: Quick Actions, Notifications, Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action button */}
        {(currentUser.role === 'admin' || currentUser.role === 'bendahara' || currentUser.role === 'pengurus') && (
          <button
            type="button"
            onClick={onOpenQuickAction}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tindakan Cepat</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative" ref={notifPopoverRef}>
          <button
            type="button"
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            aria-label="Pemberitahuan dan Agenda"
            className="relative p-2 text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <Bell className="w-4 h-4" />
            {state.announcements.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifPopover && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Pemberitahuan Desa
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {state.announcements.length} Pengumuman
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                {state.announcements.slice(0, 3).map((ann) => (
                  <div
                    key={ann.id}
                    onClick={() => {
                      setActiveModule('pengumuman');
                      setShowNotifPopover(false);
                    }}
                    className="p-3 hover:bg-stone-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 uppercase">
                        {ann.category}
                      </span>
                      <span>{ann.publishedDate}</span>
                    </div>
                    <div className="text-xs font-semibold text-stone-800 line-clamp-1">{ann.title}</div>
                    <div className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{ann.content}</div>
                  </div>
                ))}
                {state.events.slice(0, 2).map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => {
                      setActiveModule('agenda');
                      setShowNotifPopover(false);
                    }}
                    className="p-3 hover:bg-stone-50 cursor-pointer transition-colors bg-amber-50/40"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-semibold mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>Agenda: {ev.date}</span>
                    </div>
                    <div className="text-xs font-medium text-stone-800 line-clamp-1">{ev.title}</div>
                    <div className="text-[11px] text-stone-500">{ev.location}</div>
                  </div>
                ))}
              </div>
              <div className="p-2 bg-stone-50 border-t border-stone-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModule('pengumuman');
                    setShowNotifPopover(false);
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  Lihat Semua Pengumuman &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Menu */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            type="button"
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 p-1.5 pr-3 text-left bg-white border border-stone-200 hover:border-emerald-500 rounded-xl shadow-2xs transition-all"
            aria-label="Pilih Peran Pengguna"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs uppercase">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-stone-800 leading-tight flex items-center gap-1">
                {currentUser.name.split(' ')[0]}
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-stone-100 text-stone-600">
                  {currentUser.role}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 bg-stone-50 border-b border-stone-100">
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Ganti Hak Akses (Simulasi RBAC)
                </div>
                <div className="text-xs text-stone-600 mt-0.5">
                  Uji coba antarmuka dengan peran berbeda:
                </div>
              </div>
              <div className="p-2 space-y-1">
                {rolesList.map((r) => {
                  const isCurrent = currentUser.role === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => {
                        setCurrentRole(r.role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                        isCurrent
                          ? 'bg-emerald-50 text-emerald-950 font-medium border border-emerald-200'
                          : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="mt-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${r.badge}`}>
                          {r.role}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold">{r.label}</div>
                        <div className="text-[11px] text-stone-500 leading-tight">{r.desc}</div>
                      </div>
                      {isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 bg-stone-50 border-t border-stone-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModule('pengaturan');
                    setShowRoleDropdown(false);
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                >
                  Buka Pengaturan Keamanan & Akun &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Demo Modal Information */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Informasi Data Simulasi (DEMO)</h3>
                <p className="text-xs text-stone-500">Kesesuaian Standar Data Ruang Muda Desa</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Aplikasi saat ini memuat data contoh simulasi Karang Taruna Desa Sukamaju (buku kas, pendataan KK fiktif, anggota pemuda, kegiatan, dan inventaris).
              Sesuai instruksi, data simulasi ini ditandai secara jelas dengan label <strong>DEMO</strong> dan tidak disajikan sebagai data nyata warga.
            </p>

            <div className="space-y-2 mb-6">
              <button
                type="button"
                onClick={() => {
                  resetToDemo();
                  setShowDemoModal(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Pulihkan Ulang Data Simulasi Contoh (DEMO)
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Kosongkan semua data simulasi dan mulai menginput data riil desa Anda?')) {
                    clearToEmpty();
                    setShowDemoModal(false);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Kosongkan Data & Mulai Input Data Riil Desa
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowDemoModal(false)}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
