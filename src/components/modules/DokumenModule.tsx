/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Plus, Search, Download, Lock, Globe, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentItem } from '../../types';
import { checkPermission } from '../../utils/finance';

export const DokumenModule: React.FC = () => {
  const { state, currentUser, addDocument, deleteDocument, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDocNumber, setFormDocNumber] = useState('');
  const [formCategory, setFormCategory] = useState<DocumentItem['category']>('Proposal');
  const [formDesc, setFormDesc] = useState('');
  const [formIsPublic, setFormIsPublic] = useState(false);
  const [formFileType, setFormFileType] = useState('PDF');
  const [formFileSize, setFormFileSize] = useState('1.5 MB');

  const canEdit = checkPermission(currentUser.role, 'manage_members');
  const isVisitor = currentUser.role === 'pengunjung';

  const accessibleDocuments = state.documents.filter((doc) => {
    if (isVisitor) return doc.isPublic;
    return true;
  });

  const filteredDocuments = accessibleDocuments.filter((doc) => {
    const matchSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCategory === 'all' || doc.category === filterCategory;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    if (!canEdit) {
      addToast('Hak akses ditolak. Hanya Pengurus & Admin yang dapat mengunggah dokumen.', 'error');
      return;
    }
    setFormTitle('');
    const count = (state.documents.length + 1).toString().padStart(3, '0');
    setFormDocNumber(`${count}/SKM/X/2026`);
    setFormCategory('Proposal');
    setFormDesc('');
    setFormIsPublic(false);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      addToast('Nama dokumen wajib diisi', 'error');
      return;
    }
    addDocument({
      title: formTitle.trim(),
      docNumber: formDocNumber.trim(),
      category: formCategory,
      description: formDesc.trim() || 'Arsip resmi Karang Taruna',
      isPublic: formIsPublic,
      fileSize: formFileSize,
      fileType: formFileType,
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-700" />
            <span>Dokumen & Arsip Digital Organisasi</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Penyimpanan proposal, LPJ, notulen rapat, SK, dan regulasi desa
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Unggah Dokumen</span>
          </button>
        )}
      </div>

      {isVisitor && (
        <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl flex items-center gap-2.5 text-xs text-stone-600">
          <Lock className="w-4 h-4 text-stone-500 shrink-0" />
          <span>Akses Pengunjung: Hanya menampilkan dokumen yang berstatus publik.</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama dokumen, nomor surat..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-emerald-600"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-700"
          >
            <option value="all">Semua Kategori</option>
            <option value="Proposal">Proposal</option>
            <option value="LPJ">LPJ</option>
            <option value="Notulen Rapat">Notulen Rapat</option>
            <option value="Surat Masuk/Keluar">Surat Masuk/Keluar</option>
            <option value="SK & Regulasi">SK & Regulasi</option>
            <option value="Dokumentasi Kegiatan">Dokumentasi</option>
          </select>
        </div>
        <span className="text-xs text-stone-500">{filteredDocuments.length} Dokumen</span>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nama Dokumen & Nomor</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Pengunggah</th>
                <th className="py-3 px-4">Hak Akses</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-bold text-stone-900">{doc.title}</div>
                    <div className="text-[10px] font-mono text-stone-400">{doc.docNumber}</div>
                    <div className="text-[11px] text-stone-500 line-clamp-1">{doc.description}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-800">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-600 whitespace-nowrap">{doc.date}</td>
                  <td className="py-3 px-4 text-stone-600 whitespace-nowrap">{doc.uploader}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {doc.isPublic ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Globe className="w-3 h-3" /> Publik
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Lock className="w-3 h-3" /> Internal
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => addToast(`Mengunduh berkas: ${doc.title} (${doc.fileType})`)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{doc.fileType}</span>
                      </button>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(doc.id)}
                          aria-label={`Hapus ${doc.title}`}
                          className="p-1.5 text-stone-400 hover:text-red-700 rounded-lg hover:bg-stone-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-base">Unggah Berkas Dokumen</h3>
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
                  Nama Dokumen / Judul <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Proposal Pengadaan Sarana Olahraga RW 01"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nomor Surat / Dokumen</label>
                  <input
                    type="text"
                    value={formDocNumber}
                    onChange={(e) => setFormDocNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  >
                    <option value="Proposal">Proposal</option>
                    <option value="LPJ">LPJ</option>
                    <option value="Notulen Rapat">Notulen Rapat</option>
                    <option value="Surat Masuk/Keluar">Surat Masuk/Keluar</option>
                    <option value="SK & Regulasi">SK & Regulasi</option>
                    <option value="Dokumentasi Kegiatan">Dokumentasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Uraian perihal dokumen..."
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="docPublicCheck"
                  checked={formIsPublic}
                  onChange={(e) => setFormIsPublic(e.target.checked)}
                  className="rounded border-stone-300 text-emerald-700"
                />
                <label htmlFor="docPublicCheck" className="text-xs font-semibold text-stone-800 cursor-pointer">
                  Akses publik (Dapat dilihat oleh warga / tamu umum)
                </label>
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
                  Simpan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm mb-2">Hapus Dokumen</h4>
            <p className="text-xs text-stone-600 mb-4">Apakah Anda yakin ingin menghapus arsip dokumen ini?</p>
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
                onClick={() => {
                  deleteDocument(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
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
