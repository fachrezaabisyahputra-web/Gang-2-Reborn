/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Pin,
  Calendar,
  User,
  Paperclip,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Archive,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Announcement, AnnouncementCategory, AnnouncementStatus } from '../../types';
import { checkPermission } from '../../utils/finance';

export const PengumumanModule: React.FC = () => {
  const {
    state,
    currentUser,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [readingAnnouncement, setReadingAnnouncement] = useState<Announcement | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<AnnouncementCategory>('kegiatan');
  const [formStatus, setFormStatus] = useState<AnnouncementStatus>('dipublikasikan');
  const [formAttachment, setFormAttachment] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const canManage = checkPermission(currentUser.role, 'manage_members');

  // Filter announcements based on role (Visitors can only see published)
  const accessibleAnnouncements = useMemo(() => {
    return state.announcements.filter((ann) => {
      if (currentUser.role === 'pengunjung') {
        return ann.status === 'dipublikasikan';
      }
      return true;
    });
  }, [state.announcements, currentUser.role]);

  const filteredAnnouncements = useMemo(() => {
    return accessibleAnnouncements.filter((ann) => {
      const matchSearch =
        ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = filterCategory === 'all' || ann.category === filterCategory;
      const matchStatus = filterStatus === 'all' || ann.status === filterStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [accessibleAnnouncements, searchTerm, filterCategory, filterStatus]);

  const openAdd = () => {
    if (!canManage) {
      addToast('Hak akses ditolak. Hanya Pengurus dan Administrator yang dapat membuat pengumuman.', 'error');
      return;
    }
    setEditingAnnouncement(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('kegiatan');
    setFormStatus('dipublikasikan');
    setFormAttachment('');
    setFormIsPinned(false);
    setFormErrors({});
    setShowAddModal(true);
  };

  const openEdit = (ann: Announcement) => {
    if (!canManage) {
      addToast('Hak akses ditolak.', 'error');
      return;
    }
    setEditingAnnouncement(ann);
    setFormTitle(ann.title);
    setFormContent(ann.content);
    setFormCategory(ann.category);
    setFormStatus(ann.status);
    setFormAttachment(ann.attachmentName || '');
    setFormIsPinned(!!ann.isPinned);
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formTitle.trim()) errors.title = 'Judul pengumuman wajib diisi';
    if (!formContent.trim()) errors.content = 'Isi pengumuman wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingAnnouncement) {
      updateAnnouncement({
        ...editingAnnouncement,
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        status: formStatus,
        attachmentName: formAttachment.trim() || undefined,
        isPinned: formIsPinned,
      });
    } else {
      addAnnouncement({
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        status: formStatus,
        attachmentName: formAttachment.trim() || undefined,
        isPinned: formIsPinned,
      });
    }
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (!canManage) return;
    deleteAnnouncement(id);
    setDeleteConfirmId(null);
  };

  const categoryBadgeColors: Record<AnnouncementCategory, string> = {
    kegiatan: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    sosial: 'bg-blue-100 text-blue-800 border-blue-200',
    administrasi: 'bg-amber-100 text-amber-800 border-amber-200',
    informasi_desa: 'bg-stone-100 text-stone-800 border-stone-200',
    pemberitahuan_penting: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-emerald-700" />
            <span>Pusat Informasi & Pengumuman Desa</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Penyampaian warta resmi kegiatan, sosial kemasyarakatan, dan administrasi kepemudaan
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Pengumuman Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari judul, topik, isi pengumuman..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filter Kategori Pengumuman"
            className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-700"
          >
            <option value="all">Semua Kategori</option>
            <option value="kegiatan">Kegiatan</option>
            <option value="sosial">Sosial</option>
            <option value="administrasi">Administrasi</option>
            <option value="informasi_desa">Informasi Desa</option>
            <option value="pemberitahuan_penting">Pemberitahuan Penting</option>
          </select>

          {canManage && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter Status Publikasi"
              className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-700"
            >
              <option value="all">Semua Status</option>
              <option value="dipublikasikan">Dipublikasikan</option>
              <option value="draf">Draf</option>
              <option value="diarsipkan">Diarsipkan</option>
            </select>
          )}
        </div>

        <span className="text-xs text-stone-500">
          {filteredAnnouncements.length} Pengumuman Terbit
        </span>
      </div>

      {/* Grid of Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
            <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-30 text-stone-400" />
            <p className="text-sm font-semibold text-stone-700">Tidak ada pengumuman yang sesuai</p>
            <p className="text-xs text-stone-400 mt-1">Coba gunakan kata kunci lain atau bersihkan filter.</p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between ${
                ann.isPinned
                  ? 'border-amber-300 ring-1 ring-amber-300/50 shadow-sm'
                  : 'border-stone-200/80 hover:border-emerald-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        categoryBadgeColors[ann.category]
                      }`}
                    >
                      {ann.category.replace('_', ' ')}
                    </span>
                    {ann.isPinned && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        <Pin className="w-2.5 h-2.5" /> Tersemat
                      </span>
                    )}
                    {ann.status !== 'dipublikasikan' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600 uppercase">
                        {ann.status}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {ann.publishedDate}
                  </span>
                </div>

                <h3
                  onClick={() => setReadingAnnouncement(ann)}
                  className="font-bold text-sm sm:text-base text-stone-900 hover:text-emerald-800 cursor-pointer line-clamp-2 transition-colors mb-2"
                >
                  {ann.title}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4">
                  {ann.content}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span>{ann.author}</span>
                </div>

                <div className="flex items-center gap-1">
                  {ann.attachmentName && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mr-2">
                      <Paperclip className="w-3 h-3" />
                      <span className="hidden sm:inline">Ada Berkas</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setReadingAnnouncement(ann)}
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    Baca Lengkap
                  </button>
                  {canManage && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(ann)}
                        aria-label={`Edit ${ann.title}`}
                        className="p-1.5 text-stone-400 hover:text-blue-700 rounded-lg hover:bg-stone-100"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(ann.id)}
                        aria-label={`Hapus ${ann.title}`}
                        className="p-1.5 text-stone-400 hover:text-red-700 rounded-lg hover:bg-stone-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Baca Pengumuman Lengkap */}
      {readingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${categoryBadgeColors[readingAnnouncement.category]}`}>
                {readingAnnouncement.category.replace('_', ' ')}
              </span>
              <button
                type="button"
                onClick={() => setReadingAnnouncement(null)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg text-lg"
              >
                &times;
              </button>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-stone-900 mb-2 leading-snug">
              {readingAnnouncement.title}
            </h2>

            <div className="flex items-center gap-4 text-xs text-stone-400 pb-4 mb-4 border-b border-stone-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {readingAnnouncement.publishedDate}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {readingAnnouncement.author}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3 whitespace-pre-line mb-6">
              {readingAnnouncement.content}
            </div>

            {readingAnnouncement.attachmentName && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-semibold text-stone-800">{readingAnnouncement.attachmentName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => addToast(`Mengunduh berkas lampiran: ${readingAnnouncement.attachmentName}`)}
                  className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs"
                >
                  Unduh Berkas
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setReadingAnnouncement(null)}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
            >
              Tutup Pengumuman
            </button>
          </div>
        </div>
      )}

      {/* Modal Buat / Edit Pengumuman */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-base">
                {editingAnnouncement ? 'Edit Pengumuman' : 'Buat Warta / Pengumuman Baru'}
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
                  Judul Pengumuman <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Turnamen Voli Sumpah Pemuda 2026"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
                {formErrors.title && <p className="text-[10px] text-red-600 mt-1">{formErrors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  >
                    <option value="kegiatan">Kegiatan</option>
                    <option value="sosial">Sosial</option>
                    <option value="administrasi">Administrasi</option>
                    <option value="informasi_desa">Informasi Desa</option>
                    <option value="pemberitahuan_penting">Pemberitahuan Penting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Status Publikasi</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  >
                    <option value="dipublikasikan">Dipublikasikan (Publik)</option>
                    <option value="draf">Draf (Hanya Pengurus)</option>
                    <option value="diarsipkan">Diarsipkan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Isi Lengkap Pengumuman <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Tuliskan isi pengumuman secara rinci, tanggal, tempat, dan narahubung..."
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl leading-relaxed"
                />
                {formErrors.content && <p className="text-[10px] text-red-600 mt-1">{formErrors.content}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Lampiran (Opsional)</label>
                <input
                  type="text"
                  value={formAttachment}
                  onChange={(e) => setFormAttachment(e.target.value)}
                  placeholder="Contoh: Brosur_Turnamen_2026.pdf"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
                />
                <label htmlFor="pinCheck" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  Sematkan pengumuman ini di posisi teratas (Pin)
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
                  {editingAnnouncement ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}
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
            <h4 className="font-bold text-stone-900 text-sm mb-2">Hapus Pengumuman</h4>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan.
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
