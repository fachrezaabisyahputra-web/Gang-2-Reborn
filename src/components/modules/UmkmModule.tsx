/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Store,
  Plus,
  Search,
  Filter,
  Phone,
  MessageCircle,
  Instagram,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  Tag,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UMKMItem } from '../../types';
import { checkPermission } from '../../utils/finance';

export const UmkmModule: React.FC = () => {
  const { state, currentUser, addUMKM, updateUMKM, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<UMKMItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<UMKMItem['category']>('Kuliner');
  const [formDesc, setFormDesc] = useState('');
  const [formLocation, setFormLocation] = useState('Dusun Krajan RT 01 RW 01');
  const [formOwner, setFormOwner] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formAllowsContact, setFormAllowsContact] = useState(true);
  const [formInstagram, setFormInstagram] = useState('');
  const [formHighlights, setFormHighlights] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const canEdit = checkPermission(currentUser.role, 'manage_members');

  const filteredUMKM = state.umkm.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCategory === 'all' || item.category === filterCategory;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Kuliner');
    setFormDesc('');
    setFormLocation('Dusun Krajan RT 01 RW 01');
    setFormOwner(currentUser.name);
    setFormContact('');
    setFormAllowsContact(true);
    setFormInstagram('');
    setFormHighlights('');
    setFormErrors({});
    setShowAddModal(true);
  };

  const openEdit = (item: UMKMItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormDesc(item.description);
    setFormLocation(item.location);
    setFormOwner(item.ownerName);
    setFormContact(item.publicContact || '');
    setFormAllowsContact(item.allowsPublicContact);
    setFormInstagram(item.instagram || '');
    setFormHighlights(item.productHighlights.join(', '));
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = 'Nama usaha wajib diisi';
    if (!formDesc.trim()) errors.desc = 'Deskripsi produk / jasa wajib diisi';
    if (!formOwner.trim()) errors.owner = 'Nama pemilik / pelaku usaha wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const highlightsArr = formHighlights
      ? formHighlights.split(',').map((h) => h.trim()).filter(Boolean)
      : ['Produk Lokal Desa', 'Binaan Pemuda'];

    const cleanPhone = formContact.replace(/\D/g, '');
    const waUrl = cleanPhone ? `https://wa.me/62${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}` : undefined;

    if (editingItem) {
      updateUMKM({
        ...editingItem,
        name: formName.trim(),
        category: formCategory,
        description: formDesc.trim(),
        location: formLocation.trim(),
        ownerName: formOwner.trim(),
        publicContact: formAllowsContact ? formContact.trim() : undefined,
        allowsPublicContact: formAllowsContact,
        whatsapp: formAllowsContact && cleanPhone ? waUrl : undefined,
        instagram: formInstagram.trim() || undefined,
        productHighlights: highlightsArr,
      });
    } else {
      addUMKM({
        name: formName.trim(),
        category: formCategory,
        description: formDesc.trim(),
        location: formLocation.trim(),
        ownerName: formOwner.trim(),
        publicContact: formAllowsContact ? formContact.trim() : undefined,
        allowsPublicContact: formAllowsContact,
        whatsapp: formAllowsContact && cleanPhone ? waUrl : undefined,
        instagram: formInstagram.trim() || undefined,
        productHighlights: highlightsArr,
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Store className="w-6 h-6 text-emerald-700" />
            <span>Direktori UMKM & Potensi Wirausaha Pemuda Desa</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Katalog usaha mandiri, produk lokal, dan promosi ekonomi kreatif pemuda
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Daftarkan Usaha Pemuda</span>
        </button>
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
              placeholder="Cari nama usaha, produk, pemilik..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-emerald-600 focus:border-emerald-600"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            aria-label="Filter Bidang Usaha"
            className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-700"
          >
            <option value="all">Semua Bidang Usaha</option>
            <option value="Kuliner">Kuliner</option>
            <option value="Kerajinan">Kerajinan</option>
            <option value="Pertanian & Peternakan">Pertanian & Peternakan</option>
            <option value="Jasa Digital">Jasa Digital</option>
            <option value="Fashion & Konveksi">Fashion & Konveksi</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <span className="text-xs text-stone-500">
          {filteredUMKM.length} Unit Usaha Binaan
        </span>
      </div>

      {/* UMKM Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredUMKM.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {item.category}
                </span>
                {item.allowsPublicContact ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Kontak Publik Terverifikasi</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400 italic">Kontak Dirahasiakan</span>
                )}
              </div>

              <h3 className="font-bold text-base text-stone-900 mb-1">{item.name}</h3>

              <div className="text-xs text-stone-500 flex items-center gap-1 mb-2">
                <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Pengelola: <strong>{item.ownerName}</strong></span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                {item.description}
              </p>

              {/* Product Highlights */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.productHighlights.map((hl, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-stone-100 text-stone-700"
                  >
                    &bull; {hl}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-4">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{item.location}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.allowsPublicContact && item.publicContact && (
                  <a
                    href={item.whatsapp || `tel:${item.publicContact}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-2xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Hubungi ({item.publicContact})</span>
                  </a>
                )}
                {item.instagram && (
                  <span className="text-xs text-stone-500 flex items-center gap-1 font-mono">
                    <Instagram className="w-3.5 h-3.5 text-stone-400" />
                    <span>{item.instagram}</span>
                  </span>
                )}
              </div>

              {canEdit && (
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  aria-label={`Edit ${item.name}`}
                  className="p-1.5 text-stone-400 hover:text-emerald-700 rounded-lg hover:bg-stone-50"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form Tambah / Edit UMKM */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-base">
                {editingItem ? 'Edit Data Usaha' : 'Daftarkan UMKM / Usaha Pemuda'}
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
                  Nama Usaha / Produk / Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Kopi Robusta Lereng Sukamaju"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
                {formErrors.name && <p className="text-[10px] text-red-600 mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Bidang Usaha</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  >
                    <option value="Kuliner">Kuliner</option>
                    <option value="Kerajinan">Kerajinan</option>
                    <option value="Pertanian & Peternakan">Pertanian & Peternakan</option>
                    <option value="Jasa Digital">Jasa Digital</option>
                    <option value="Fashion & Konveksi">Fashion & Konveksi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nama Pemilik / Pelaku Usaha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formOwner}
                    onChange={(e) => setFormOwner(e.target.value)}
                    placeholder="Nama Anggota / Warga"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                  {formErrors.owner && <p className="text-[10px] text-red-600 mt-1">{formErrors.owner}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Deskripsi Produk & Keunggulan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Ceritakan bahan baku lokal, proses pengolahan, dan keunggulan produk..."
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl leading-relaxed"
                />
                {formErrors.desc && <p className="text-[10px] text-red-600 mt-1">{formErrors.desc}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Lokasi / Dusun</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Dusun Krajan RT 01 RW 01"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Instagram (Opsional)</label>
                  <input
                    type="text"
                    value={formInstagram}
                    onChange={(e) => setFormInstagram(e.target.value)}
                    placeholder="@brand.lokal"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Keunggulan Produk (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formHighlights}
                  onChange={(e) => setFormHighlights(e.target.value)}
                  placeholder="Contoh: 100% Organik, P-IRT Resmi, Kemasan Ramah Lingkungan"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
              </div>

              {/* Privacy Consent for Contact */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="consentCheck"
                    checked={formAllowsContact}
                    onChange={(e) => setFormAllowsContact(e.target.checked)}
                    className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
                  />
                  <label htmlFor="consentCheck" className="text-xs font-semibold text-stone-800 cursor-pointer">
                    Pemilik menyetujui nomor kontak bisnis ditampilkan di katalog publik
                  </label>
                </div>

                {formAllowsContact && (
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Nomor WhatsApp / Telepon Publik
                    </label>
                    <input
                      type="text"
                      value={formContact}
                      onChange={(e) => setFormContact(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg"
                    />
                  </div>
                )}
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
                  {editingItem ? 'Simpan Perubahan' : 'Daftarkan Usaha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
