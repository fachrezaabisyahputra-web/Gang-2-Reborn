/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  Trash2,
  Edit3,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Receipt,
  FileText,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Transaction, TransactionType } from '../../types';
import {
  calculateCashSummary,
  formatRupiah,
  exportTransactionsToCSV,
  checkPermission,
} from '../../utils/finance';

interface KeuanganModuleProps {
  initialOpenAddModal?: boolean;
}

export const KeuanganModule: React.FC<KeuanganModuleProps> = ({ initialOpenAddModal = false }) => {
  const {
    state,
    currentUser,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toggleContribution,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'buku_kas' | 'iuran' | 'rekap'>('buku_kas');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(initialOpenAddModal);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formType, setFormType] = useState<TransactionType>('pemasukan');
  const [formCategory, setFormCategory] = useState('iuran');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formParty, setFormParty] = useState('');
  const [formProof, setFormProof] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const canManage = checkPermission(currentUser.role, 'manage_finance');

  const cash = calculateCashSummary(state.initialBalance, state.transactions);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return state.transactions.filter((tx) => {
      const matchSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.sourceOrRecipient.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'all' || tx.type === filterType;
      const matchCategory = filterCategory === 'all' || tx.category === filterCategory;
      const matchStart = !startDate || tx.date >= startDate;
      const matchEnd = !endDate || tx.date <= endDate;
      return matchSearch && matchType && matchCategory && matchStart && matchEnd;
    });
  }, [state.transactions, searchTerm, filterType, filterCategory, startDate, endDate]);

  const openAdd = () => {
    if (!canManage) {
      addToast('Hak akses ditolak. Hanya Bendahara dan Administrator yang berwenang.', 'error');
      return;
    }
    setEditingTransaction(null);
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormType('pemasukan');
    setFormCategory('iuran');
    setFormAmount('');
    setFormDescription('');
    setFormParty('');
    setFormProof('');
    setFormErrors({});
    setShowAddModal(true);
  };

  const openEdit = (tx: Transaction) => {
    if (!canManage) {
      addToast('Hak akses ditolak. Hanya Bendahara dan Administrator yang berwenang.', 'error');
      return;
    }
    setEditingTransaction(tx);
    setFormDate(tx.date);
    setFormType(tx.type);
    setFormCategory(tx.category);
    setFormAmount(tx.amount.toString());
    setFormDescription(tx.description);
    setFormParty(tx.sourceOrRecipient);
    setFormProof(tx.proofInfo || '');
    setFormErrors({});
    setShowAddModal(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const amt = Number(formAmount);
    if (!formDate) errors.date = 'Tanggal wajib diisi';
    if (!formAmount || isNaN(amt) || amt <= 0) errors.amount = 'Nominal harus lebih dari Rp 0';
    if (!formDescription.trim()) errors.description = 'Deskripsi transaksi wajib diisi';
    if (!formParty.trim()) errors.party = 'Sumber dana atau pihak penerima wajib diisi';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const amountNum = Number(formAmount);

    if (editingTransaction) {
      updateTransaction({
        ...editingTransaction,
        date: formDate,
        type: formType,
        category: formCategory,
        amount: amountNum,
        description: formDescription.trim(),
        sourceOrRecipient: formParty.trim(),
        proofInfo: formProof.trim() || 'Kwitansi / Nota internal tersimpan',
      });
    } else {
      addTransaction({
        date: formDate,
        type: formType,
        category: formCategory,
        amount: amountNum,
        description: formDescription.trim(),
        sourceOrRecipient: formParty.trim(),
        proofInfo: formProof.trim() || 'Kwitansi / Nota internal tersimpan',
      });
    }
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (!canManage) {
      addToast('Hak akses ditolak.', 'error');
      return;
    }
    deleteTransaction(id);
    setDeleteConfirmId(null);
  };

  // CSV & Excel Export
  const handleExportCSV = () => {
    const csvContent = exportTransactionsToCSV(filteredTransactions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Kas_RuangMudaDesa_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Laporan CSV berhasil diunduh');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-emerald-700" />
            <span>Sistem Buku Kas & Keuangan Organisasi</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Pencatatan kas transparan, rekap arus kas desa, dan iuran pemuda
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Ekspor CSV / Excel</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Cetak / PDF</span>
          </button>
          {canManage && (
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Transaksi</span>
            </button>
          )}
        </div>
      </div>

      {/* Permission Notification if Visitor or Regular Member */}
      {!canManage && (
        <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl flex items-center gap-2.5 text-xs text-stone-600">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Anda saat ini masuk sebagai <strong>{currentUser.title}</strong> (Akses Baca Saja). Pengubahan dan penambahan kas hanya dapat dilakukan oleh Bendahara atau Administrator.
          </span>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Saldo Kas Saat Ini</span>
          <div className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
            {formatRupiah(cash.currentBalance)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            Saldo Awal: {formatRupiah(cash.initialBalance)}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Pemasukan Bulan Ini
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-1">
            +{formatRupiah(cash.thisMonthIncome)}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Total Masuk: {formatRupiah(cash.totalIncome)}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> Pengeluaran Bulan Ini
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-red-700 mt-1">
            -{formatRupiah(cash.thisMonthExpense)}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            Total Keluar: {formatRupiah(cash.totalExpense)}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Surplus Arus Kas</span>
          <div className="text-xl sm:text-2xl font-extrabold text-stone-800 mt-1">
            {formatRupiah(cash.totalIncome - cash.totalExpense)}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            {filteredTransactions.length} Transaksi Tercatat
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab('buku_kas')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'buku_kas'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Buku Kas Umum ({filteredTransactions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('iuran')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'iuran'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Daftar Iuran Pemuda ({state.contributions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rekap')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'rekap'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Rekapitulasi Kategori & Laporan
        </button>
      </div>

      {/* Tab 1: Buku Kas Umum */}
      {activeTab === 'buku_kas' && (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari kode, deskripsi, sumber..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-emerald-600 focus:border-emerald-600"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                aria-label="Filter Jenis Transaksi"
                className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-700"
              >
                <option value="all">Semua Jenis</option>
                <option value="pemasukan">Pemasukan (+)</option>
                <option value="pengeluaran">Pengeluaran (-)</option>
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                aria-label="Filter Kategori Kas"
                className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-700"
              >
                <option value="all">Semua Kategori</option>
                <option value="iuran">Iuran Pemuda</option>
                <option value="donasi">Donasi</option>
                <option value="sponsor">Sponsor</option>
                <option value="bantuan">Bantuan APBDes</option>
                <option value="konsumsi">Konsumsi</option>
                <option value="perlengkapan">Perlengkapan</option>
                <option value="kebersihan">Kebersihan</option>
                <option value="sosial">Sosial & Santunan</option>
                <option value="kegiatan">Kegiatan</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                aria-label="Filter Tanggal Mulai"
                className="px-2 py-1 text-xs bg-white border border-stone-200 rounded-lg text-stone-700"
              />
              <span>Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-label="Filter Tanggal Selesai"
                className="px-2 py-1 text-xs bg-white border border-stone-200 rounded-lg text-stone-700"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Tanggal & Kode</th>
                  <th className="py-3 px-4">Jenis & Kategori</th>
                  <th className="py-3 px-4">Uraian / Deskripsi</th>
                  <th className="py-3 px-4">Pihak Terkait</th>
                  <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                  <th className="py-3 px-4">Bukti</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      Tidak ada transaksi yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-stone-900">{tx.date}</div>
                        <div className="text-[10px] font-mono text-stone-400">{tx.code}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            tx.type === 'pemasukan'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {tx.type}
                        </span>
                        <div className="text-[11px] text-stone-500 capitalize mt-0.5">{tx.category}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-stone-800 line-clamp-2">{tx.description}</div>
                        <div className="text-[10px] text-stone-400">Dicatat oleh: {tx.createdBy}</div>
                      </td>
                      <td className="py-3 px-4 text-stone-600 whitespace-nowrap">{tx.sourceOrRecipient}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-mono font-bold text-xs ${
                            tx.type === 'pemasukan' ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {tx.type === 'pemasukan' ? '+' : '-'} {formatRupiah(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-[140px] truncate text-[11px] text-stone-500">
                        {tx.proofInfo ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <Receipt className="w-3 h-3" />
                            <span className="truncate">{tx.proofInfo}</span>
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedTxDetail(tx)}
                            title="Lihat Detail Transaksi"
                            aria-label={`Lihat detail ${tx.code}`}
                            className="p-1.5 text-stone-500 hover:text-emerald-700 rounded-lg hover:bg-stone-100"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEdit(tx)}
                                title="Edit Transaksi"
                                aria-label={`Edit ${tx.code}`}
                                className="p-1.5 text-stone-500 hover:text-blue-700 rounded-lg hover:bg-stone-100"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(tx.id)}
                                title="Hapus Transaksi"
                                aria-label={`Hapus ${tx.code}`}
                                className="p-1.5 text-stone-500 hover:text-red-700 rounded-lg hover:bg-stone-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <span>Menampilkan {filteredTransactions.length} dari {state.transactions.length} transaksi</span>
            <span className="font-semibold text-stone-800">
              Total Mutasi Terfilter: {formatRupiah(filteredTransactions.reduce((acc, t) => acc + (t.type === 'pemasukan' ? t.amount : -t.amount), 0))}
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Iuran Anggota Pemuda */}
      {activeTab === 'iuran' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-emerald-950 text-sm">
                Rekap Iuran Bulanan Pemuda Karang Taruna (Oktober 2026)
              </div>
              <p className="text-emerald-800/80 mt-0.5">
                Nominal Iuran Rutin Wajib: <strong>Rp 50.000 / bulan</strong>. Bendahara dapat mengubah status pelunasan dengan satu klik.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="px-3 py-1 bg-white border border-emerald-300 rounded-xl font-bold text-emerald-900 shadow-2xs">
                {state.contributions.filter((c) => c.status === 'lunas').length} / {state.members.length} Lunas
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Nama Anggota</th>
                    <th className="py-3 px-4">Bulan</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4">Status Pembayaran</th>
                    <th className="py-3 px-4">Tanggal Setor & Ref</th>
                    {canManage && <th className="py-3 px-4 text-center">Tindakan</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {state.members.map((member) => {
                    const contr = state.contributions.find((c) => c.memberId === member.id && c.month === '2026-10');
                    const isLunas = contr?.status === 'lunas';
                    return (
                      <tr key={member.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-stone-900">
                          {member.name}
                          <div className="text-[10px] text-stone-400 font-normal">{member.roleInOrg} &bull; RT {member.rt}</div>
                        </td>
                        <td className="py-3 px-4 text-stone-600">Oktober 2026</td>
                        <td className="py-3 px-4 font-mono font-medium text-stone-800">Rp 50.000</td>
                        <td className="py-3 px-4">
                          {isLunas ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> LUNAS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800">
                              <AlertCircle className="w-3 h-3" /> BELUM BAYAR
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone-500 text-[11px]">
                          {isLunas ? `${contr.paidAt} (${contr.receiptRef || '-'})` : '-'}
                        </td>
                        {canManage && (
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleContribution(member.id, '2026-10')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                isLunas
                                  ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                  : 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-2xs'
                              }`}
                            >
                              {isLunas ? 'Batalkan Lunas' : 'Tandai Lunas'}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Rekap Kategori & Laporan */}
      {activeTab === 'rekap' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rekap Pemasukan */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Rincian Pemasukan Berdasarkan Kategori</span>
            </h3>
            <div className="space-y-3">
              {['iuran', 'donasi', 'sponsor', 'bantuan', 'pendapatan_kegiatan'].map((cat) => {
                const total = state.transactions
                  .filter((t) => t.type === 'pemasukan' && t.category === cat)
                  .reduce((acc, t) => acc + t.amount, 0);
                const pct = cash.totalIncome > 0 ? Math.round((total / cash.totalIncome) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize font-medium text-stone-700">{cat.replace('_', ' ')}</span>
                      <span className="font-bold text-stone-900">{formatRupiah(total)} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="h-full bg-emerald-600 rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rekap Pengeluaran */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span>Rincian Pengeluaran Berdasarkan Kategori</span>
            </h3>
            <div className="space-y-3">
              {['konsumsi', 'perlengkapan', 'kebersihan', 'sosial', 'administrasi', 'kegiatan'].map((cat) => {
                const total = state.transactions
                  .filter((t) => t.type === 'pengeluaran' && t.category === cat)
                  .reduce((acc, t) => acc + t.amount, 0);
                const pct = cash.totalExpense > 0 ? Math.round((total / cash.totalExpense) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize font-medium text-stone-700">{cat}</span>
                      <span className="font-bold text-stone-900">{formatRupiah(total)} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="h-full bg-red-500 rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit Transaksi */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-base">
                {editingTransaction ? 'Edit Catatan Transaksi Kas' : 'Tambah Transaksi Buku Kas Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Jenis Transaksi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('pemasukan');
                      setFormCategory('iuran');
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      formType === 'pemasukan'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    + Pemasukan Kas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('pengeluaran');
                      setFormCategory('konsumsi');
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      formType === 'pengeluaran'
                        ? 'bg-red-50 border-red-500 text-red-800 shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    - Pengeluaran Kas
                  </button>
                </div>
              </div>

              {/* Date & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tanggal Transaksi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                  {formErrors.date && <p className="text-[10px] text-red-600 mt-1">{formErrors.date}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl capitalize"
                  >
                    {formType === 'pemasukan' ? (
                      <>
                        <option value="iuran">Iuran Pemuda</option>
                        <option value="donasi">Donasi Warga / Tokoh</option>
                        <option value="sponsor">Sponsorship</option>
                        <option value="bantuan">Bantuan APBDes</option>
                        <option value="pendapatan_kegiatan">Pendapatan Kegiatan</option>
                        <option value="lainnya">Lainnya</option>
                      </>
                    ) : (
                      <>
                        <option value="konsumsi">Konsumsi</option>
                        <option value="perlengkapan">Perlengkapan / Alat</option>
                        <option value="kebersihan">Kebersihan</option>
                        <option value="sosial">Sosial / Santunan</option>
                        <option value="administrasi">Administrasi & ATK</option>
                        <option value="kegiatan">Operasional Kegiatan</option>
                        <option value="lainnya">Lainnya</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nominal Transaksi (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="Contoh: 150000"
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-stone-200 rounded-xl"
                />
                {formErrors.amount && <p className="text-[10px] text-red-600 mt-1">{formErrors.amount}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Deskripsi / Keterangan Transaksi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Uraian lengkap tujuan pencatatan kas..."
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
                {formErrors.description && (
                  <p className="text-[10px] text-red-600 mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Source/Recipient & Proof Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {formType === 'pemasukan' ? 'Sumber Dana / Penyetor' : 'Penerima / Toko Rekanan'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formParty}
                    onChange={(e) => setFormParty(e.target.value)}
                    placeholder="Nama orang, instansi, atau toko..."
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                  {formErrors.party && <p className="text-[10px] text-red-600 mt-1">{formErrors.party}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Keterangan Bukti / Nota
                  </label>
                  <input
                    type="text"
                    value={formProof}
                    onChange={(e) => setFormProof(e.target.value)}
                    placeholder="No. Nota, Kwitansi, atau Bukti Transfer"
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
                  {editingTransaction ? 'Simpan Perubahan' : 'Catat Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Transaksi */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <span className="text-[10px] font-mono text-stone-400 block">{selectedTxDetail.code}</span>
                <h3 className="font-bold text-stone-900 text-sm">Detail Catatan Transaksi</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxDetail(null)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                <span className="text-stone-500 font-medium">Nominal Transaksi</span>
                <span
                  className={`font-mono font-bold text-base ${
                    selectedTxDetail.type === 'pemasukan' ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {selectedTxDetail.type === 'pemasukan' ? '+' : '-'} {formatRupiah(selectedTxDetail.amount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-stone-600">
                <div>
                  <span className="text-stone-400 block text-[10px]">Tanggal</span>
                  <span className="font-semibold text-stone-800">{selectedTxDetail.date}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Kategori</span>
                  <span className="font-semibold text-stone-800 capitalize">{selectedTxDetail.category}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Pihak Terkait</span>
                  <span className="font-semibold text-stone-800">{selectedTxDetail.sourceOrRecipient}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Dicatat Oleh</span>
                  <span className="font-semibold text-stone-800">{selectedTxDetail.createdBy}</span>
                </div>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px]">Deskripsi Lengkap</span>
                <p className="p-2.5 bg-stone-50 rounded-xl text-stone-800 leading-relaxed mt-0.5">
                  {selectedTxDetail.description}
                </p>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px]">Bukti Transaksi & Arsip</span>
                <p className="font-medium text-emerald-800 mt-0.5">{selectedTxDetail.proofInfo || 'Tidak ada keterangan bukti'}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTxDetail(null)}
              className="mt-6 w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm mb-2">Konfirmasi Hapus Transaksi</h4>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus catatan transaksi ini? Saldo kas akan dihitung ulang secara otomatis. Tindakan ini akan dicatat di log audit.
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
