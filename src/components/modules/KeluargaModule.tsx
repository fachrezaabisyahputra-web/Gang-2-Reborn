/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Home,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FamilyData } from '../../types';
import { checkPermission, maskSensitiveId } from '../../utils/finance';

export const KeluargaModule: React.FC = () => {
  const { state, currentUser, addFamily, updateFamily, deleteFamily, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRT, setFilterRT] = useState('all');
  const [filterRW, setFilterRW] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState<FamilyData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formHead, setFormHead] = useState('');
  const [formRawKK, setFormRawKK] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formRT, setFormRT] = useState('01');
  const [formRW, setFormRW] = useState('01');
  const [formMemberCount, setFormMemberCount] = useState(4);
  const [formStatus, setFormStatus] = useState<'Lengkap' | 'Perlu Verifikasi' | 'Belum Lengkap'>('Lengkap');
  const [formPhone, setFormPhone] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Privacy reveal toggle
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const canEdit = checkPermission(currentUser.role, 'manage_members');
  const canViewSensitive = checkPermission(currentUser.role, 'view_sensitive_family');

  const filteredFamilies = useMemo(() => {
    return state.families.filter((fam) => {
      const matchSearch =
        fam.headOfFamily.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fam.familyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fam.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRT = filterRT === 'all' || fam.rt === filterRT;
      const matchRW = filterRW === 'all' || fam.rw === filterRW;
      const matchStatus = filterStatus === 'all' || fam.status === filterStatus;
      return matchSearch && matchRT && matchRW && matchStatus;
    });
  }, [state.families, searchTerm, filterRT, filterRW, filterStatus]);

  const toggleReveal = (id: string) => {
    if (!canViewSensitive) {
      addToast('Akses dibatasi. Nomor KK lengkap dirahasiakan untuk privasi warga.', 'error');
      return;
    }
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
    addToast(revealedIds[id] ? 'Nomor KK disembunyikan' : 'Nomor KK ditampilkan untuk verifikasi petugas', 'info');
  };

  const openAdd = () => {
    if (!canEdit) {
      addToast('Hak akses ditolak. Hanya Pengurus dan Administrator yang dapat menambah data KK.', 'error');
      return;
    }
    setEditingFamily(null);
    setFormHead('');
    setFormRawKK('');
    setFormAddress('');
    setFormRT('01');
    setFormRW('01');
    setFormMemberCount(4);
    setFormStatus('Lengkap');
    setFormPhone('');
    setFormNotes('');
    setFormErrors({});
    setShowAddModal(true);
  };

  const openEdit = (fam: FamilyData) => {
    if (!canEdit) {
      addToast('Hak akses ditolak.', 'error');
      return;
    }
    setEditingFamily(fam);
    setFormHead(fam.headOfFamily);
    setFormRawKK(fam.rawKK || '3201011234560001');
    setFormAddress(fam.address);
    setFormRT(fam.rt);
    setFormRW(fam.rw);
    setFormMemberCount(fam.memberCount);
    setFormStatus(fam.status);
    setFormPhone(fam.phone || '');
    setFormNotes(fam.notes || '');
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formHead.trim()) errors.head = 'Nama Kepala Keluarga wajib diisi';
    if (!formRawKK.trim() || formRawKK.replace(/\s+/g, '').length < 16) {
      errors.rawKK = 'Nomor KK harus 16 digit angka';
    }
    if (!formAddress.trim()) errors.address = 'Alamat wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingFamily) {
      const cleanKK = formRawKK.replace(/\s+/g, '');
      updateFamily({
        ...editingFamily,
        headOfFamily: formHead.trim(),
        rawKK: cleanKK,
        maskedKK: maskSensitiveId(cleanKK),
        address: formAddress.trim(),
        rt: formRT,
        rw: formRW,
        memberCount: Number(formMemberCount),
        status: formStatus,
        phone: formPhone.trim() || undefined,
        notes: formNotes.trim() || undefined,
      });
    } else {
      addFamily({
        headOfFamily: formHead.trim(),
        rawKK: formRawKK.trim(),
        address: formAddress.trim(),
        rt: formRT,
        rw: formRW,
        memberCount: Number(formMemberCount),
        status: formStatus,
        phone: formPhone.trim() || undefined,
        notes: formNotes.trim() || undefined,
      });
    }
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (!canEdit) return;
    deleteFamily(id);
    setDeleteConfirmId(null);
  };

  // Aggregation
  const totalJiwa = state.families.reduce((acc, f) => acc + f.memberCount, 0);
  const statusLengkapCount = state.families.filter((f) => f.status === 'Lengkap').length;
  const statusPerluVerifCount = state.families.filter((f) => f.status === 'Perlu Verifikasi').length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-700" />
            <span>Pendataan Keluarga & Kartu Keluarga (KK)</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Satu Data Keluarga Desa dengan perlindungan privasi identitas warga
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Daftarkan KK Baru</span>
          </button>
        )}
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 bg-emerald-900/5 border border-emerald-700/20 rounded-2xl flex items-start gap-3 text-xs text-stone-700">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-stone-900">Perlindungan Kerahasiaan Data Sensitif: </span>
          Nomor Kartu Keluarga (KK) dan NIK dilindungi dan disamarkan secara otomatis. Hanya petugas kepengurusan yang berwenang yang dapat melihat detail lengkap untuk keperluan administrasi resmi desa.
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Total Keluarga Terdata</span>
          <div className="text-2xl font-bold text-stone-900 mt-1">{state.families.length} KK</div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Desa Sukamaju</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Estimasi Total Jiwa</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{totalJiwa} Jiwa</div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Rata-rata 4 jiwa/KK</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Status Lengkap Terverifikasi</span>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{statusLengkapCount} KK</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            {Math.round((statusLengkapCount / (state.families.length || 1)) * 100)}% Kelengkapan
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Menunggu Verifikasi</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{statusPerluVerifCount} KK</div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Berkas pindah / baru</span>
        </div>
      </div>

      {/* Filters & Table Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari kepala keluarga, kode KK, alamat..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>

            {/* Filter RT */}
            <select
              value={filterRT}
              onChange={(e) => setFilterRT(e.target.value)}
              aria-label="Filter Wilayah RT"
              className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-700"
            >
              <option value="all">Semua RT</option>
              <option value="01">RT 01</option>
              <option value="02">RT 02</option>
              <option value="03">RT 03</option>
            </select>

            {/* Filter RW */}
            <select
              value={filterRW}
              onChange={(e) => setFilterRW(e.target.value)}
              aria-label="Filter Wilayah RW"
              className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-700"
            >
              <option value="all">Semua RW</option>
              <option value="01">RW 01</option>
              <option value="02">RW 02</option>
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter Status Kelengkapan"
              className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-700"
            >
              <option value="all">Semua Status</option>
              <option value="Lengkap">Lengkap</option>
              <option value="Perlu Verifikasi">Perlu Verifikasi</option>
              <option value="Belum Lengkap">Belum Lengkap</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Kode & Kepala Keluarga</th>
                <th className="py-3 px-4">Nomor KK (Terselubung)</th>
                <th className="py-3 px-4">Alamat & Wilayah</th>
                <th className="py-3 px-4 text-center">Anggota</th>
                <th className="py-3 px-4">Status Pendataan</th>
                <th className="py-3 px-4">Tanggal Update</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredFamilies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    Tidak ditemukan data keluarga yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredFamilies.map((fam) => {
                  const isRevealed = !!revealedIds[fam.id];
                  const displayKK = isRevealed && fam.rawKK ? fam.rawKK : fam.maskedKK;
                  return (
                    <tr key={fam.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{fam.headOfFamily}</div>
                        <div className="text-[10px] font-mono text-stone-400">{fam.familyCode}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className={isRevealed ? 'text-amber-800 font-bold' : 'text-stone-600'}>
                            {displayKK}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleReveal(fam.id)}
                            title={isRevealed ? 'Sembunyikan' : 'Buka Masking Nomor (Petugas)'}
                            aria-label={`Toggle nomor KK ${fam.headOfFamily}`}
                            className="p-1 text-stone-400 hover:text-emerald-700 rounded"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-stone-800">{fam.address}</div>
                        <div className="text-[10px] text-stone-400 font-medium">RT {fam.rt} / RW {fam.rw}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-stone-800">
                        {fam.memberCount} Jiwa
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            fam.status === 'Lengkap'
                              ? 'bg-emerald-100 text-emerald-800'
                              : fam.status === 'Perlu Verifikasi'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {fam.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-500 text-[11px] whitespace-nowrap">
                        {fam.updatedAt}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {canEdit && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEdit(fam)}
                                title="Edit Data KK"
                                aria-label={`Edit ${fam.headOfFamily}`}
                                className="p-1.5 text-stone-500 hover:text-blue-700 rounded-lg hover:bg-stone-100"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(fam.id)}
                                title="Hapus Data KK"
                                aria-label={`Hapus ${fam.headOfFamily}`}
                                className="p-1.5 text-stone-500 hover:text-red-700 rounded-lg hover:bg-stone-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
          <span>Menampilkan {filteredFamilies.length} dari {state.families.length} data keluarga</span>
          <span>Desa Sukamaju &bull; Ruang Muda Desa</span>
        </div>
      </div>

      {/* Modal Tambah / Edit KK */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-base">
                {editingFamily ? 'Perbarui Data Kartu Keluarga' : 'Daftarkan Kartu Keluarga Baru'}
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
                  Nama Kepala Keluarga <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formHead}
                  onChange={(e) => setFormHead(e.target.value)}
                  placeholder="Contoh: Suryadi Suwignyo"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
                {formErrors.head && <p className="text-[10px] text-red-600 mt-1">{formErrors.head}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nomor Kartu Keluarga (16 Digit) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={formRawKK}
                  onChange={(e) => setFormRawKK(e.target.value.replace(/\D/g, ''))}
                  placeholder="320101xxxxxxxxxx"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-stone-200 rounded-xl"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Nomor KK akan disimpan terenkripsi dan disamarkan secara otomatis di tabel publik.
                </p>
                {formErrors.rawKK && <p className="text-[10px] text-red-600 mt-1">{formErrors.rawKK}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Alamat Rumah / Dusun <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Contoh: Jl. Merak No. 14, Dusun Krajan"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
                {formErrors.address && <p className="text-[10px] text-red-600 mt-1">{formErrors.address}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">RT</label>
                  <select
                    value={formRT}
                    onChange={(e) => setFormRT(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  >
                    <option value="01">RT 01</option>
                    <option value="02">RT 02</option>
                    <option value="03">RT 03</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">RW</label>
                  <select
                    value={formRW}
                    onChange={(e) => setFormRW(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  >
                    <option value="01">RW 01</option>
                    <option value="02">RW 02</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Jumlah Jiwa</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formMemberCount}
                    onChange={(e) => setFormMemberCount(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Status Verifikasi</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  >
                    <option value="Lengkap">Lengkap</option>
                    <option value="Perlu Verifikasi">Perlu Verifikasi</option>
                    <option value="Belum Lengkap">Belum Lengkap</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">No. Kontak (Opsional)</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Catatan Verifikasi</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Keterangan kelengkapan akta, domisili, atau anggota pemuda..."
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
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
                  {editingFamily ? 'Simpan Perubahan' : 'Daftarkan KK'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm mb-2">Konfirmasi Hapus Data KK</h4>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus data kartu keluarga ini dari basis data desa?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
