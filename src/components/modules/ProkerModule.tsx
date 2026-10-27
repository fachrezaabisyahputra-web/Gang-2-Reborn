/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
  Calendar,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkProgram } from '../../types';
import { formatRupiah, checkPermission } from '../../utils/finance';

export const ProkerModule: React.FC = () => {
  const { state, currentUser, addWorkProgram, updateWorkProgram, addToast } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProker, setEditingProker] = useState<WorkProgram | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDivision, setFormDivision] = useState('Divisi Teknologi Informasi');
  const [formGoal, setFormGoal] = useState('');
  const [formPJ, setFormPJ] = useState('');
  const [formSchedule, setFormSchedule] = useState('Oktober - Desember 2026');
  const [formPlanned, setFormPlanned] = useState('2000000');
  const [formRealized, setFormRealized] = useState('1000000');
  const [formTarget, setFormTarget] = useState('');
  const [formProgress, setFormProgress] = useState(50);
  const [formStatus, setFormStatus] = useState<'belum_mulai' | 'berjalan' | 'selesai' | 'tertunda'>('berjalan');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const canEdit = checkPermission(currentUser.role, 'manage_members');

  const openAdd = () => {
    if (!canEdit) {
      addToast('Hak akses ditolak. Hanya Pengurus dan Administrator yang dapat menambah program kerja.', 'error');
      return;
    }
    setEditingProker(null);
    setFormName('');
    setFormDivision('Divisi Ekonomi Kreatif');
    setFormGoal('');
    setFormPJ(currentUser.name);
    setFormSchedule('November - Desember 2026');
    setFormPlanned('1500000');
    setFormRealized('0');
    setFormTarget('');
    setFormProgress(0);
    setFormStatus('belum_mulai');
    setFormErrors({});
    setShowAddModal(true);
  };

  const openEdit = (p: WorkProgram) => {
    if (!canEdit) {
      addToast('Hak akses ditolak.', 'error');
      return;
    }
    setEditingProker(p);
    setFormName(p.name);
    setFormDivision(p.division);
    setFormGoal(p.goal);
    setFormPJ(p.personInCharge);
    setFormSchedule(p.schedule);
    setFormPlanned(p.plannedBudget.toString());
    setFormRealized(p.realizedBudget.toString());
    setFormTarget(p.target);
    setFormProgress(p.progress);
    setFormStatus(p.status);
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = 'Nama program kerja wajib diisi';
    if (!formGoal.trim()) errors.goal = 'Tujuan program kerja wajib diisi';
    if (!formPJ.trim()) errors.pj = 'Penanggung jawab wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingProker) {
      updateWorkProgram({
        ...editingProker,
        name: formName.trim(),
        division: formDivision.trim(),
        goal: formGoal.trim(),
        personInCharge: formPJ.trim(),
        schedule: formSchedule.trim(),
        plannedBudget: Number(formPlanned) || 0,
        realizedBudget: Number(formRealized) || 0,
        target: formTarget.trim() || 'Tercapainya sasaran program desa',
        progress: Number(formProgress),
        status: formStatus,
      });
    } else {
      addWorkProgram({
        name: formName.trim(),
        division: formDivision.trim(),
        goal: formGoal.trim(),
        personInCharge: formPJ.trim(),
        schedule: formSchedule.trim(),
        plannedBudget: Number(formPlanned) || 0,
        realizedBudget: Number(formRealized) || 0,
        target: formTarget.trim() || 'Tercapainya sasaran program desa',
        progress: Number(formProgress),
        status: formStatus,
      });
    }
    setShowAddModal(false);
  };

  // Quick slider update for progress
  const handleQuickProgressUpdate = (pro: WorkProgram, newProgress: number) => {
    if (!canEdit) return;
    const nextStatus = newProgress === 100 ? 'selesai' : newProgress > 0 ? 'berjalan' : 'belum_mulai';
    updateWorkProgram({
      ...pro,
      progress: newProgress,
      status: nextStatus,
    });
  };

  const totalPlanned = state.workPrograms.reduce((acc, p) => acc + p.plannedBudget, 0);
  const totalRealized = state.workPrograms.reduce((acc, p) => acc + p.realizedBudget, 0);
  const avgProgress = state.workPrograms.length
    ? Math.round(state.workPrograms.reduce((acc, p) => acc + p.progress, 0) / state.workPrograms.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-emerald-700" />
            <span>Program Kerja (Proker) & Capaian Organisasi</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Perencanaan strategis, jadwal pelaksanaan, alokasi anggaran, dan indikator keberhasilan
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Program Kerja</span>
          </button>
        )}
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Total Program Terdaftar</span>
          <div className="text-2xl font-bold text-stone-900 mt-1">{state.workPrograms.length} Proker</div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Periode 2026/2027</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Rata-rata Capaian Progres</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{avgProgress}%</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Kinerja On-Track</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Rencana Anggaran Biaya</span>
          <div className="text-xl font-bold text-stone-800 mt-1">{formatRupiah(totalPlanned)}</div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Total pagu usulan</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Realisasi Anggaran</span>
          <div className="text-xl font-bold text-amber-700 mt-1">{formatRupiah(totalRealized)}</div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            {totalPlanned > 0 ? Math.round((totalRealized / totalPlanned) * 100) : 0}% Terserap
          </span>
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {state.workPrograms.map((pro) => (
          <div
            key={pro.id}
            className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {pro.division}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    pro.status === 'selesai'
                      ? 'bg-emerald-100 text-emerald-800'
                      : pro.status === 'berjalan'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {pro.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="font-bold text-base text-stone-900 mb-1">{pro.name}</h3>
              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">{pro.goal}</p>

              {/* Progress Slider / Visual Bar */}
              <div className="space-y-1.5 mb-4 p-3 bg-stone-50/70 rounded-xl border border-stone-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Capaian Progres:</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-800 text-sm">{pro.progress}%</span>
                </div>

                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pro.progress}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      pro.progress >= 75
                        ? 'bg-emerald-600'
                        : pro.progress >= 40
                        ? 'bg-amber-500'
                        : 'bg-stone-400'
                    }`}
                  />
                </div>

                {canEdit && (
                  <div className="pt-1 flex items-center justify-between text-[11px] text-stone-400">
                    <span>Geser progres:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={pro.progress}
                      onChange={(e) => handleQuickProgressUpdate(pro, Number(e.target.value))}
                      className="w-32 accent-emerald-700 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 mb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{pro.schedule}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">PJ: {pro.personInCharge}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-stone-400 block">Realisasi / Pagu Anggaran</span>
                <span className="font-bold text-stone-800 font-mono">
                  {formatRupiah(pro.realizedBudget)} / {formatRupiah(pro.plannedBudget)}
                </span>
              </div>

              {canEdit && (
                <button
                  type="button"
                  onClick={() => openEdit(pro)}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ubah Proker</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form Tambah / Edit Proker */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-base">
                {editingProker ? 'Perbarui Program Kerja' : 'Tambah Program Kerja Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Program Kerja <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Digitalisasi Arsip & Ruang Muda Desa"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
                {formErrors.name && <p className="text-[10px] text-red-600 mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Divisi / Bidang</label>
                  <input
                    type="text"
                    value={formDivision}
                    onChange={(e) => setFormDivision(e.target.value)}
                    placeholder="Divisi Olahraga / IT / UMKM"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Penanggung Jawab (PJ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formPJ}
                    onChange={(e) => setFormPJ(e.target.value)}
                    placeholder="Nama Koordinator"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                  {formErrors.pj && <p className="text-[10px] text-red-600 mt-1">{formErrors.pj}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tujuan & Sasaran Strategis <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formGoal}
                  onChange={(e) => setFormGoal(e.target.value)}
                  placeholder="Deskripsikan dampak positif kegiatan untuk pemuda dan warga..."
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl leading-relaxed"
                />
                {formErrors.goal && <p className="text-[10px] text-red-600 mt-1">{formErrors.goal}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Jadwal Pelaksanaan</label>
                  <input
                    type="text"
                    value={formSchedule}
                    onChange={(e) => setFormSchedule(e.target.value)}
                    placeholder="Contoh: Oktober - November 2026"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Status Proker</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  >
                    <option value="belum_mulai">Belum Mulai</option>
                    <option value="berjalan">Sedang Berjalan</option>
                    <option value="selesai">Selesai</option>
                    <option value="tertunda">Tertunda</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Rencana Anggaran (Rp)</label>
                  <input
                    type="number"
                    value={formPlanned}
                    onChange={(e) => setFormPlanned(e.target.value)}
                    placeholder="2000000"
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Realisasi Anggaran (Rp)</label>
                  <input
                    type="number"
                    value={formRealized}
                    onChange={(e) => setFormRealized(e.target.value)}
                    placeholder="1000000"
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Progres Capaian: {formProgress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formProgress}
                  onChange={(e) => setFormProgress(Number(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  {editingProker ? 'Simpan Perubahan' : 'Tambah Proker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
