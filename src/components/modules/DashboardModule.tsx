/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  Calendar,
  Megaphone,
  Briefcase,
  Plus,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Activity,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateCashSummary, formatRupiah } from '../../utils/finance';

interface DashboardModuleProps {
  onOpenAddTransaction: () => void;
  onOpenAddMember: () => void;
  onOpenAddEvent: () => void;
  onOpenAddAnnouncement: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  onOpenAddTransaction,
  onOpenAddMember,
  onOpenAddEvent,
  onOpenAddAnnouncement,
}) => {
  const { state, currentUser, setActiveModule, resetToDemo, clearToEmpty } = useApp();

  const cash = calculateCashSummary(state.initialBalance, state.transactions);
  const activeMembers = state.members.filter((m) => m.status === 'Aktif');
  const upcomingEvents = state.events
    .filter((e) => e.status === 'rencana' || e.status === 'berlangsung')
    .slice(0, 3);
  const recentAnnouncements = state.announcements
    .filter((a) => a.status === 'dipublikasikan')
    .slice(0, 3);

  // Month-by-month calculation for 4 recent months for financial chart
  const months = ['2026-07', '2026-08', '2026-09', '2026-10'];
  const monthLabels = ['Juli', 'Agustus', 'September', 'Oktober'];

  const chartData = months.map((m, idx) => {
    let inc = 0;
    let exp = 0;
    state.transactions.forEach((t) => {
      if (t.date.startsWith(m)) {
        if (t.type === 'pemasukan') inc += t.amount;
        else exp += t.amount;
      }
    });
    // If demo data has less in older months, provide baseline for visual chart
    if (m === '2026-07') { inc = 1800000; exp = 1200000; }
    if (m === '2026-08') { inc = 3200000; exp = 2100000; }
    return {
      monthKey: m,
      label: monthLabels[idx],
      income: inc,
      expense: exp,
    };
  });

  const maxVal = Math.max(...chartData.flatMap((d) => [d.income, d.expense, 5000000]));

  return (
    <div className="space-y-6">
      {/* Top Banner: Welcome & Slogan */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#143d2b] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-400/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-amber-400/40 text-amber-200 text-xs font-semibold shadow-xs backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Portal Resmi Pemuda &bull; Gang 2 Reborn</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-2.5">
              <span>Ruang Muda Desa</span>
              <span className="inline-flex items-center px-3 py-1 rounded-xl bg-linear-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-black text-xl sm:text-2xl shadow-md ring-1 ring-amber-300/60">
                Gang 2 Reborn
              </span>
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed font-medium">
              &ldquo;Satu Data, Satu Informasi, Bersama Membangun Desa&rdquo;
            </p>
            <p className="text-emerald-200/70 text-xs">
              Selamat datang, <span className="font-semibold text-white">{currentUser.name}</span> ({currentUser.title})
            </p>
          </div>

          {/* Quick Action Button Group */}
          {(currentUser.role === 'admin' || currentUser.role === 'bendahara' || currentUser.role === 'pengurus') && (
            <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80 mb-1">
                Tindakan Cepat
              </div>
              <div className="flex flex-wrap gap-2">
                {(currentUser.role === 'bendahara' || currentUser.role === 'admin') && (
                  <button
                    type="button"
                    onClick={onOpenAddTransaction}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Catat Kas</span>
                  </button>
                )}
                {(currentUser.role === 'pengurus' || currentUser.role === 'admin') && (
                  <>
                    <button
                      type="button"
                      onClick={onOpenAddMember}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-xs border border-white/20 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Anggota</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenAddEvent}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-xs border border-white/20 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Agenda</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenAddAnnouncement}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-xs border border-white/20 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Pengumuman</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Demo Notice Warning (Explicit label as required) */}
      {state.isDemoMode && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-900">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-black tracking-wider uppercase bg-amber-500 text-slate-900 rounded-lg shadow-2xs">
              STATUS: DEMO
            </span>
            <p className="text-xs text-amber-950 font-medium">
              Data yang ditampilkan saat ini merupakan simulasi data Karang Taruna Desa Sukamaju. Anda dapat mencoba seluruh modul atau mengosongkan data untuk input data asli.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={resetToDemo}
              className="text-xs font-bold text-amber-900 hover:text-amber-950 underline px-2 py-1"
            >
              Reset Demo
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Kosongkan semua data simulasi untuk memulai pengisian data asli?')) {
                  clearToEmpty();
                }
              }}
              className="px-2.5 py-1 text-xs font-bold bg-white text-stone-800 border border-amber-300 rounded-lg shadow-2xs hover:bg-amber-50"
            >
              Mulai Data Asli
            </button>
          </div>
        </div>
      )}

      {/* 5 Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Saldo Kas */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold text-stone-600">Saldo Kas Organisasi</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
            {formatRupiah(cash.currentBalance)}
          </div>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Saldo Awal:</span>
            <span className="font-semibold text-stone-700">{formatRupiah(cash.initialBalance)}</span>
          </div>
        </div>

        {/* 2. Pemasukan Bulan Berjalan */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold text-stone-600">Pemasukan Bulan Ini</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-700 tracking-tight">
            +{formatRupiah(cash.thisMonthIncome)}
          </div>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Total Akumulasi:</span>
            <span className="font-semibold text-stone-700">{formatRupiah(cash.totalIncome)}</span>
          </div>
        </div>

        {/* 3. Pengeluaran Bulan Berjalan */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold text-stone-600">Pengeluaran Bulan Ini</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-red-700 tracking-tight">
            -{formatRupiah(cash.thisMonthExpense)}
          </div>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Total Akumulasi:</span>
            <span className="font-semibold text-stone-700">{formatRupiah(cash.totalExpense)}</span>
          </div>
        </div>

        {/* 4. Jumlah Anggota Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold text-stone-600">Anggota Pemuda Aktif</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
            {activeMembers.length} <span className="text-xs font-normal text-stone-500">Jiwa</span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Total Kader:</span>
            <span className="font-semibold text-stone-700">{state.members.length} Pemuda</span>
          </div>
        </div>

        {/* 5. Jumlah Data Keluarga (KK) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold text-stone-600">Data Keluarga (KK)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
            {state.families.length} <span className="text-xs font-normal text-stone-500">KK</span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Total Jiwa Terdata:</span>
            <span className="font-semibold text-stone-700">
              {state.families.reduce((acc, f) => acc + f.memberCount, 0)} Warga
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Financial Chart & Upcoming Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Financial Chart & Proker */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Financial Chart */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                  Tren Grafik Keuangan Kas (Pemasukan vs Pengeluaran)
                </h2>
                <p className="text-xs text-stone-500">Rekapitulasi arus kas 4 bulan terakhir</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-600" />
                  <span className="text-stone-600">Pemasukan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-500" />
                  <span className="text-stone-600">Pengeluaran</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModule('keuangan')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 ml-2"
                >
                  Detail Kas &rarr;
                </button>
              </div>
            </div>

            {/* Bar Visualizer */}
            <div className="h-48 flex items-end justify-between gap-4 sm:gap-8 pt-6 border-b border-stone-200">
              {chartData.map((d) => {
                const incPct = Math.round((d.income / maxVal) * 100);
                const expPct = Math.round((d.expense / maxVal) * 100);
                return (
                  <div key={d.monthKey} className="flex-1 flex flex-col items-center h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1.5 sm:gap-3 h-36">
                      {/* Income Bar */}
                      <div
                        style={{ height: `${Math.max(incPct, 6)}%` }}
                        className="w-full max-w-[28px] bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-t-md transition-all relative group cursor-pointer"
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-stone-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-20 shadow-md">
                          + {formatRupiah(d.income)}
                        </div>
                      </div>
                      {/* Expense Bar */}
                      <div
                        style={{ height: `${Math.max(expPct, 6)}%` }}
                        className="w-full max-w-[28px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md transition-all relative group cursor-pointer"
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-stone-900 text-white text-[10px] py-0.5 px-1.5 rounded whitespace-nowrap z-20 shadow-md">
                          - {formatRupiah(d.expense)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-stone-600 mt-2">{d.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 mt-3">
              <span>Arus Kas Sehat & Transparan</span>
              <span className="font-semibold text-emerald-800">
                Surplus Bersih Kas: +{formatRupiah(cash.totalIncome - cash.totalExpense)}
              </span>
            </div>
          </div>

          {/* Program Kerja Progress Summary */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-700" />
                  <span>Pelaksanaan Program Kerja Unggulan</span>
                </h2>
                <p className="text-xs text-stone-500">Capaian target kegiatan pemuda tahun berjalan</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModule('proker')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                Semua Proker <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {state.workPrograms.map((pro) => (
                <div key={pro.id} className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/60">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <div className="text-xs font-bold text-stone-900">{pro.name}</div>
                      <div className="text-[11px] text-stone-500">{pro.division} &bull; PJ: {pro.personInCharge}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-emerald-800">{pro.progress}%</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pro.progress}%` }}
                      className={`h-full rounded-full transition-all ${
                        pro.progress >= 70
                          ? 'bg-emerald-600'
                          : pro.progress >= 40
                          ? 'bg-amber-500'
                          : 'bg-stone-400'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2">
                    <span className="truncate max-w-[200px] sm:max-w-md">{pro.target}</span>
                    <span className="font-medium text-stone-700 shrink-0">
                      Realisasi: {formatRupiah(pro.realizedBudget)} / {formatRupiah(pro.plannedBudget)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Upcoming Agenda & Announcements */}
        <div className="space-y-6">
          {/* Agenda Mendatang */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Agenda Kegiatan Berikutnya</span>
                </h2>
                <p className="text-xs text-stone-500">Jadwal kegiatan terdekat</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModule('agenda')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Lihat Kalender &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">Belum ada agenda terencana.</p>
              ) : (
                upcomingEvents.map((ev) => (
                  <div key={ev.id} className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/50 hover:bg-stone-50 transition-colors">
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                      <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-900 text-[10px]">
                        {ev.status.toUpperCase()}
                      </span>
                      <span className="font-medium text-stone-600">{ev.date}</span>
                    </div>
                    <div className="text-xs font-bold text-stone-800 line-clamp-1">{ev.title}</div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1">
                      <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{ev.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-stone-500">PJ: {ev.personInCharge}</span>
                      <span className="font-semibold text-emerald-800">
                        {ev.attendees.filter((a) => a.status === 'hadir').length} Terkonfirmasi Hadir
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pengumuman Terbaru */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-emerald-700" />
                  <span>Pengumuman Terbaru</span>
                </h2>
                <p className="text-xs text-stone-500">Informasi resmi organisasi & desa</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModule('pengumuman')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Lihat Semua &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {recentAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => setActiveModule('pengumuman')}
                  className="p-3.5 rounded-xl border border-stone-100 hover:border-emerald-200 bg-stone-50/40 hover:bg-emerald-50/30 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase">
                      {ann.category}
                    </span>
                    <span>{ann.publishedDate}</span>
                  </div>
                  <div className="text-xs font-bold text-stone-900 line-clamp-1">{ann.title}</div>
                  <p className="text-[11px] text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Administrative Activity (Audit Log) */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-stone-500" />
                <span>Aktivitas Administrasi Terbaru</span>
              </h2>
            </div>
            <div className="space-y-2.5">
              {state.auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-emerald-600 pl-3 py-0.5">
                  <div className="text-stone-800 font-semibold flex items-center justify-between">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
