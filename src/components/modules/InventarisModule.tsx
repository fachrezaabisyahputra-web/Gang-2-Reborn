/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryItem } from '../../types';
import { checkPermission } from '../../utils/finance';

export const InventarisModule: React.FC = () => {
  const {
    state,
    currentUser,
    addInventoryItem,
    updateInventoryItem,
    borrowInventory,
    returnInventory,
    addToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [borrowModalItem, setBorrowModalItem] = useState<InventoryItem | null>(null);

  // Form State Barang Baru
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formQty, setFormQty] = useState(1);
  const [formCondition, setFormCondition] = useState<'Baik' | 'Rusak Ringan' | 'Rusak Berat'>('Baik');
  const [formLocation, setFormLocation] = useState('Gudang Balai RW 02');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formPJ, setFormPJ] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form Peminjaman
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerContact, setBorrowerContact] = useState('');
  const [borrowQty, setBorrowQty] = useState(1);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [loanNotes, setLoanNotes] = useState('');

  const canManage = checkPermission(currentUser.role, 'manage_members');

  const filteredItems = state.inventory.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCond = filterCondition === 'all' || item.condition === filterCondition;
    return matchSearch && matchCond;
  });

  const openAdd = () => {
    if (!canManage) {
      addToast('Hak akses ditolak. Hanya Pengurus dan Administrator yang dapat mengelola inventaris.', 'error');
      return;
    }
    setEditingItem(null);
    setFormName('');
    const count = (state.inventory.length + 1).toString().padStart(2, '0');
    setFormCode(`INV-BRG-${count}`);
    setFormQty(1);
    setFormCondition('Baik');
    setFormLocation('Gudang Balai RT 01');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormPJ(currentUser.name);
    setFormErrors({});
    setShowAddModal(true);
  };

  const openEdit = (item: InventoryItem) => {
    if (!canManage) return;
    setEditingItem(item);
    setFormName(item.name);
    setFormCode(item.code);
    setFormQty(item.quantity);
    setFormCondition(item.condition);
    setFormLocation(item.location);
    setFormDate(item.procurementDate);
    setFormPJ(item.personInCharge);
    setFormErrors({});
    setShowAddModal(true);
  };

  const openBorrowModal = (item: InventoryItem) => {
    if (!canManage) {
      addToast('Hanya pengurus yang berwenang mencatat peminjaman barang inventaris.', 'error');
      return;
    }
    setBorrowModalItem(item);
    setBorrowerName('');
    setBorrowerContact('');
    setBorrowQty(1);
    setDueDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setLoanNotes('');
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = 'Nama barang wajib diisi';
    if (!formCode.trim()) errors.code = 'Kode inventaris wajib diisi';
    if (formQty <= 0) errors.qty = 'Jumlah barang minimal 1 unit';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingItem) {
      updateInventoryItem({
        ...editingItem,
        name: formName.trim(),
        code: formCode.trim(),
        quantity: Number(formQty),
        condition: formCondition,
        location: formLocation.trim(),
        procurementDate: formDate,
        personInCharge: formPJ.trim() || currentUser.name,
      });
    } else {
      addInventoryItem({
        name: formName.trim(),
        code: formCode.trim(),
        quantity: Number(formQty),
        condition: formCondition,
        location: formLocation.trim(),
        procurementDate: formDate,
        personInCharge: formPJ.trim() || currentUser.name,
      });
    }
    setShowAddModal(false);
  };

  const handleConfirmBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowModalItem) return;
    if (!borrowerName.trim()) {
      addToast('Nama peminjam wajib diisi', 'error');
      return;
    }
    borrowInventory(
      borrowModalItem.id,
      borrowerName.trim(),
      borrowerContact.trim() || '-',
      Number(borrowQty),
      dueDate,
      loanNotes.trim()
    );
    setBorrowModalItem(null);
  };

  // Counts
  const totalBarang = state.inventory.reduce((acc, i) => acc + i.quantity, 0);
  const totalDipinjam = state.inventory.reduce(
    (acc, i) => acc + i.loans.filter((l) => l.status === 'dipinjam').reduce((sum, l) => sum + l.quantity, 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-700" />
            <span>Manajemen Inventaris & Peminjaman Barang</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Pencatatan aset organisasi, monitoring kondisi alat, dan sirkulasi peminjaman warga
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Daftarkan Barang Baru</span>
          </button>
        )}
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Total Jenis Aset</span>
          <div className="text-2xl font-bold text-stone-900 mt-1">{state.inventory.length} Jenis</div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">{totalBarang} Total Unit Tersimpan</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Sedang Dipinjam Warga</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{totalDipinjam} Unit</div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Sirkulasi aktif</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Kondisi Prima (Baik)</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {state.inventory.filter((i) => i.condition === 'Baik').length} Jenis
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Siap digunakan</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Perlu Perawatan / Servis</span>
          <div className="text-2xl font-bold text-stone-700 mt-1">
            {state.inventory.filter((i) => i.condition !== 'Baik').length} Jenis
          </div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Rusak ringan / berat</span>
        </div>
      </div>

      {/* Inventory Items Grid */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {/* Filters */}
        <div className="p-4 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama barang, kode, lokasi gudang..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>

            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              aria-label="Filter Kondisi Barang"
              className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-700"
            >
              <option value="all">Semua Kondisi</option>
              <option value="Baik">Kondisi Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>

          <span className="text-xs text-stone-500">
            {filteredItems.length} Barang Terdaftar
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Kode & Nama Barang</th>
                <th className="py-3 px-4">Jumlah & Kondisi</th>
                <th className="py-3 px-4">Lokasi Penyimpanan</th>
                <th className="py-3 px-4">Penanggung Jawab</th>
                <th className="py-3 px-4">Status Peminjaman Aktif</th>
                <th className="py-3 px-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map((item) => {
                const activeLoans = item.loans.filter((l) => l.status === 'dipinjam');
                const borrowedQty = activeLoans.reduce((sum, l) => sum + l.quantity, 0);
                const availableQty = item.quantity - borrowedQty;

                return (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{item.name}</div>
                      <div className="text-[10px] font-mono text-stone-400">{item.code}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-stone-800">
                        {availableQty} / {item.quantity} Unit Tersedia
                      </div>
                      <span
                        className={`inline-block px-2 py-0.2 rounded text-[10px] font-bold mt-0.5 ${
                          item.condition === 'Baik'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.condition === 'Rusak Ringan'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.condition}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{item.location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      <div className="font-medium">{item.personInCharge}</div>
                      <div className="text-[10px] text-stone-400">Pengadaan: {item.procurementDate}</div>
                    </td>
                    <td className="py-3 px-4">
                      {activeLoans.length > 0 ? (
                        <div className="space-y-1">
                          {activeLoans.map((loan) => (
                            <div
                              key={loan.id}
                              className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-950 flex items-center justify-between gap-2"
                            >
                              <div>
                                <span className="font-bold">{loan.borrowerName}</span> ({loan.quantity} unit)
                                <div className="text-[10px] text-amber-800">Batas: {loan.dueDate}</div>
                              </div>
                              {canManage && (
                                <button
                                  type="button"
                                  onClick={() => returnInventory(item.id, loan.id)}
                                  className="px-2 py-0.5 text-[10px] font-bold bg-white text-stone-800 border border-amber-300 rounded shadow-2xs hover:bg-amber-100"
                                >
                                  Kembalikan
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Tersimpan di Gudang
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => openBorrowModal(item)}
                              disabled={availableQty <= 0}
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                                availableQty > 0
                                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-2xs'
                                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                              }`}
                            >
                              Pinjamkan
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              aria-label={`Edit ${item.name}`}
                              className="p-1.5 text-stone-500 hover:text-blue-700 rounded-lg hover:bg-stone-100"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Edit Barang */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-base">
                {editingItem ? 'Edit Data Inventaris' : 'Tambah Aset Inventaris Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Barang / Peralatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Sound System Wireless + 2 Mic"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
                {formErrors.name && <p className="text-[10px] text-red-600 mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Kode Barang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="INV-SND-01"
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-stone-200 rounded-xl"
                  />
                  {formErrors.code && <p className="text-[10px] text-red-600 mt-1">{formErrors.code}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Jumlah Unit</label>
                  <input
                    type="number"
                    min="1"
                    value={formQty}
                    onChange={(e) => setFormQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Kondisi Barang</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  >
                    <option value="Baik">Baik (Siap Pakai)</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tanggal Pengadaan</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Lokasi Penyimpanan</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Gudang Balai RW 02"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Penanggung Jawab</label>
                  <input
                    type="text"
                    value={formPJ}
                    onChange={(e) => setFormPJ(e.target.value)}
                    placeholder="Nama Pengurus Gudang"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>
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
                  {editingItem ? 'Simpan Perubahan' : 'Daftarkan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Peminjaman Barang */}
      {borrowModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <span className="text-[10px] font-mono text-stone-400 block">{borrowModalItem.code}</span>
                <h3 className="font-bold text-stone-900 text-sm">Form Peminjaman Barang</h3>
              </div>
              <button
                type="button"
                onClick={() => setBorrowModalItem(null)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmBorrow} className="space-y-3.5">
              <div className="p-3 bg-stone-50 rounded-xl text-xs">
                <div className="font-bold text-stone-800">{borrowModalItem.name}</div>
                <div className="text-stone-500 text-[11px]">Tersedia saat ini: {borrowModalItem.quantity} unit</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Peminjam / Warga / Organisasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  placeholder="Contoh: Pak RT 02 (Pak Suryanto) / Panitia Maulid"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Jumlah Unit Dipinjam</label>
                  <input
                    type="number"
                    min="1"
                    max={borrowModalItem.quantity}
                    value={borrowQty}
                    onChange={(e) => setBorrowQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tenggat Pengembalian</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nomor Kontak Peminjam</label>
                <input
                  type="text"
                  value={borrowerContact}
                  onChange={(e) => setBorrowerContact(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Keperluan Penggunaan</label>
                <textarea
                  rows={2}
                  value={loanNotes}
                  onChange={(e) => setLoanNotes(e.target.value)}
                  placeholder="Digunakan untuk acara kerja bakti, posyandu, dsb..."
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setBorrowModalItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs"
                >
                  Konfirmasi Pinjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
