/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Wallet,
  Users,
  UserCheck,
  Megaphone,
  CalendarCheck,
  Briefcase,
  Package,
  Store,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useApp, ActiveModule } from '../../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, state, setActiveModule } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  // Search through all entities
  const results = {
    transactions: q
      ? state.transactions.filter(
          (t) =>
            t.description.toLowerCase().includes(q) ||
            t.code.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            t.sourceOrRecipient.toLowerCase().includes(q)
        ).slice(0, 3)
      : [],
    members: q
      ? state.members.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.roleInOrg.toLowerCase().includes(q) ||
            m.skills.some((s) => s.toLowerCase().includes(q)) ||
            m.address.toLowerCase().includes(q)
        ).slice(0, 3)
      : [],
    families: q
      ? state.families.filter(
          (f) =>
            f.headOfFamily.toLowerCase().includes(q) ||
            f.familyCode.toLowerCase().includes(q) ||
            f.address.toLowerCase().includes(q)
        ).slice(0, 3)
      : [],
    announcements: q
      ? state.announcements.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.content.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q)
        ).slice(0, 3)
      : [],
    events: q
      ? state.events.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.location.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q)
        ).slice(0, 3)
      : [],
    inventory: q
      ? state.inventory.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.code.toLowerCase().includes(q) ||
            i.location.toLowerCase().includes(q)
        ).slice(0, 3)
      : [],
    umkm: q
      ? state.umkm.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.ownerName.toLowerCase().includes(q) ||
            u.category.toLowerCase().includes(q) ||
            u.description.toLowerCase().includes(q)
        ).slice(0, 3)
      : [],
    documents: q
      ? state.documents.filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            d.docNumber.toLowerCase().includes(q) ||
            d.category.toLowerCase().includes(q)
        ).slice(0, 3)
      : [],
  };

  const totalResults =
    results.transactions.length +
    results.members.length +
    results.families.length +
    results.announcements.length +
    results.events.length +
    results.inventory.length +
    results.umkm.length +
    results.documents.length;

  const navigateTo = (mod: ActiveModule) => {
    setActiveModule(mod);
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-stone-200 bg-stone-50">
          <Search className="w-5 h-5 text-stone-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari transaksi, anggota pemuda, KK keluarga, pengumuman, agenda, UMKM..."
            className="flex-1 text-sm bg-transparent border-none outline-none text-stone-900 placeholder:text-stone-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="ml-2 px-2 py-1 text-xs text-stone-500 hover:text-stone-700 bg-stone-200/70 rounded-md font-mono"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="text-center py-10 text-stone-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-800" />
              <p className="text-sm font-medium text-stone-600">Pencarian Terpadu Satu Data Desa</p>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                Ketik kata kunci nama warga, judul pengumuman, kode transaksi, barang inventaris, atau produk UMKM.
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-10 text-stone-400">
              <p className="text-sm font-semibold text-stone-700">Tidak ada hasil untuk &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-stone-400 mt-1">Coba gunakan kata kunci lain atau periksa ejaan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Transactions */}
              {results.transactions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1.5 px-2">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Buku Kas & Transaksi</span>
                  </div>
                  <div className="space-y-1">
                    {results.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => navigateTo('keuangan')}
                        className="p-2.5 rounded-xl hover:bg-stone-50 border border-stone-100 flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-stone-800 group-hover:text-emerald-700">
                            {tx.description}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {tx.code} &bull; {tx.date} &bull; {tx.sourceOrRecipient}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs font-bold ${
                              tx.type === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            {tx.type === 'pemasukan' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Members */}
              {results.members.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1.5 px-2">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Data Pemuda</span>
                  </div>
                  <div className="space-y-1">
                    {results.members.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => navigateTo('pemuda')}
                        className="p-2.5 rounded-xl hover:bg-stone-50 border border-stone-100 flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-stone-800 group-hover:text-emerald-700">
                            {m.name} ({m.memberCode})
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {m.roleInOrg} &bull; RT {m.rt}/RW {m.rw} &bull; {m.skills.join(', ')}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Families */}
              {results.families.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1.5 px-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>Data Keluarga (KK)</span>
                  </div>
                  <div className="space-y-1">
                    {results.families.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => navigateTo('keluarga')}
                        className="p-2.5 rounded-xl hover:bg-stone-50 border border-stone-100 flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-stone-800 group-hover:text-emerald-700">
                            Kepala Keluarga: {f.headOfFamily}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {f.familyCode} &bull; {f.address} (RT {f.rt}/RW {f.rw}) &bull; {f.memberCount} Jiwa
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700">
                          {f.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Announcements */}
              {results.announcements.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1.5 px-2">
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>Pengumuman</span>
                  </div>
                  <div className="space-y-1">
                    {results.announcements.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => navigateTo('pengumuman')}
                        className="p-2.5 rounded-xl hover:bg-stone-50 border border-stone-100 flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-stone-800 group-hover:text-emerald-700 line-clamp-1">
                            {a.title}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            Kategori: {a.category} &bull; {a.publishedDate}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events & UMKM */}
              {results.events.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1.5 px-2">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Agenda & Kegiatan</span>
                  </div>
                  <div className="space-y-1">
                    {results.events.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => navigateTo('agenda')}
                        className="p-2.5 rounded-xl hover:bg-stone-50 border border-stone-100 flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-stone-800 group-hover:text-emerald-700">
                            {e.title}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {e.date} &bull; {e.location} &bull; PJ: {e.personInCharge}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.umkm.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1.5 px-2">
                    <Store className="w-3.5 h-3.5" />
                    <span>UMKM & Potensi Desa</span>
                  </div>
                  <div className="space-y-1">
                    {results.umkm.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => navigateTo('umkm')}
                        className="p-2.5 rounded-xl hover:bg-stone-50 border border-stone-100 flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-stone-800 group-hover:text-emerald-700">
                            {u.name}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {u.category} &bull; Pemilik: {u.ownerName} &bull; {u.location}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
          <span>Tekan ESC untuk menutup</span>
          <span>Satu Data Ruang Muda Desa</span>
        </div>
      </div>
    </div>
  );
};
