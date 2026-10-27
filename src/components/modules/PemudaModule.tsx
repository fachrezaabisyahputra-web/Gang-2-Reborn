/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Phone,
  Calendar,
  Award,
  Archive,
  Edit3,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { YouthMember } from '../../types';
import { checkPermission } from '../../utils/finance';

export const PemudaModule: React.FC = () => {
  const { state, currentUser, addMember, updateMember, archiveMember, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgeGroup, setFilterAgeGroup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRT, setFilterRT] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<YouthMember | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<YouthMember | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formAgeGroup, setFormAgeGroup] = useState<'13-17' | '18-24' | '25-30'>('18-24');
  const [formAge, setFormAge] = useState(20);
  const [formAddress, setFormAddress] = useState('');
  const [formRT, setFormRT] = useState('01');
  const [formRW, setFormRW] = useState('01');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('Anggota Aktif');
  const [formSkills, setFormSkills] = useState('');
  const [formInterests, setFormInterests] = useState('');
  const [formJoinDate, setFormJoinDate] = useState(new Date().toISOString().slice(0, 10));
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Alumni' | 'Non-Aktif'>('Aktif');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const canEdit = checkPermission(currentUser.role, 'manage_members');

  const filteredMembers = useMemo(() => {
    return state.members.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.roleInOrg.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchAge = filterAgeGroup === 'all' || m.ageGroup === filterAgeGroup;
      const matchStatus = filterStatus === 'all' || m.status === filterStatus;
      const matchRT = filterRT === 'all' || m.rt === filterRT;
      return matchSearch && matchAge && matchStatus && matchRT;
    });
  }, [state.members, searchTerm, filterAgeGroup, filterStatus, filterRT]);

  const openAdd = () => {
    if (!canEdit) {
      addToast('Hak akses ditolak. Hanya Pengurus dan Administrator yang dapat mendaftarkan anggota.', 'error');
      return;
    }
    setEditingMember(null);
    setFormName('');
    setFormAgeGroup('18-24');
    setFormAge(21);
    setFormAddress('');
    setFormRT('01');
    setFormRW('01');
    setFormPhone('');
    setFormRole('Anggota Aktif');
    setFormSkills('');
    setFormInterests('');
    setFormJoinDate(new Date().toISOString().slice(0, 10));
    setFormStatus('Aktif');
    setFormErrors({});
    setShowAddModal(true);
  };

  const openEdit = (m: YouthMember) => {
    if (!canEdit) {
      addToast('Hak akses ditolak.', 'error');
      return;
    }
    setEditingMember(m);
    setFormName(m.name);
    setFormAgeGroup(m.ageGroup);
    setFormAge(m.age);
    setFormAddress(m.address);
    setFormRT(m.rt);
    setFormRW(m.rw);
    setFormPhone(m.phone || '');
    setFormRole(m.roleInOrg);
    setFormSkills(m.skills.join(', '));
    setFormInterests(m.interests.join(', '));
    setFormJoinDate(m.joinDate);
    setFormStatus(m.status);
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = 'Nama lengkap pemuda wajib diisi';
    if (!formAddress.trim()) errors.address = 'Alamat wajib diisi';
    if (formAge < 12 || formAge > 35) errors.age = 'Usia pemuda berkisar antara 13 - 35 tahun';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const skillsArray = formSkills
      ? formSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Kewirausahaan', 'Gotong Royong'];
    const interestsArray = formInterests
      ? formInterests.split(',').map((i) => i.trim()).filter(Boolean)
      : ['Kegiatan Kepemudaan'];

    if (editingMember) {
      updateMember({
        ...editingMember,
        name: formName.trim(),
        ageGroup: formAgeGroup,
        age: Number(formAge),
        address: formAddress.trim(),
        rt: formRT,
        rw: formRW,
        phone: formPhone.trim() || undefined,
        roleInOrg: formRole.trim(),
        skills: skillsArray,
        interests: interestsArray,
        joinDate: formJoinDate,
        status: formStatus,
      });
    } else {
      addMember({
        name: formName.trim(),
        ageGroup: formAgeGroup,
        age: Number(formAge),
        address: formAddress.trim(),
        rt: formRT,
        rw: formRW,
        phone: formPhone.trim() || undefined,
        roleInOrg: formRole.trim(),
        skills: skillsArray,
        interests: interestsArray,
        joinDate: formJoinDate,
        status: formStatus,
      });
    }
    setShowAddModal(false);
  };

  const activeCount = state.members.filter((m) => m.status === 'Aktif').length;
  const alumniCount = state.members.filter((m) => m.status === 'Alumni').length;
  const teenCount = state.members.filter((m) => m.ageGroup === '13-17').length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-emerald-700" />
            <span>Data Pemuda & Keanggotaan Karang Taruna</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Pendataan terpadu generasi muda desa, pemetaan minat bakat, dan kaderisasi
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Anggota Pemuda</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Anggota Aktif</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{activeCount} Pemuda</div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Partisipasi reguler</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Kader Remaja (13-17 Th)</span>
          <div className="text-2xl font-bold text-blue-700 mt-1">{teenCount} Remaja</div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Kaderisasi sekolah/SMP/SMA</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Alumni & Penasehat</span>
          <div className="text-2xl font-bold text-stone-700 mt-1">{alumniCount} Orang</div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Dukungan bimbingan karir</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Total Database Pemuda</span>
          <div className="text-2xl font-bold text-stone-900 mt-1">{state.members.length} Orang</div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Terdaftar resmi di desa</span>
        </div>
      </div>

      {/* Table & Filter Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {/* Filters */}
        <div className="p-4 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, keahlian, jabatan pemuda..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-emerald-600 focus:border-emerald-600"
              />
            </div>

            {/* Filter Age */}
            <select
              value={filterAgeGroup}
              onChange={(e) => setFilterAgeGroup(e.target.value)}
              aria-label="Filter Kelompok Usia"
              className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-700"
            >
              <option value="all">Semua Kelompok Usia</option>
              <option value="13-17">Remaja (13-17 Th)</option>
              <option value="18-24">Pemuda Muda (18-24 Th)</option>
              <option value="25-30">Pemuda Dewasa (25-30 Th)</option>
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter Status Anggota"
              className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-700"
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Alumni">Alumni</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>

            {/* Filter RT */}
            <select
              value={filterRT}
              onChange={(e) => setFilterRT(e.target.value)}
              aria-label="Filter Wilayah RT Pemuda"
              className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-700"
            >
              <option value="all">Semua RT</option>
              <option value="01">RT 01</option>
              <option value="02">RT 02</option>
              <option value="03">RT 03</option>
            </select>
          </div>
        </div>

        {/* Member Grid / Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Kode & Nama Anggota</th>
                <th className="py-3 px-4">Usia & Wilayah</th>
                <th className="py-3 px-4">Jabatan / Peran</th>
                <th className="py-3 px-4">Keahlian & Minat</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    Tidak ditemukan data pemuda dengan kriteria ini.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{member.name}</div>
                      <div className="text-[10px] font-mono text-stone-400">{member.memberCode}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-stone-800 font-medium">
                        {member.age} Tahun ({member.ageGroup})
                      </div>
                      <div className="text-[10px] text-stone-400">RT {member.rt} / RW {member.rw}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">
                      {member.roleInOrg}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {member.skills.slice(0, 2).map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-stone-100 text-stone-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 2 && (
                          <span className="text-[10px] text-stone-400">+{member.skills.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          member.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : member.status === 'Alumni'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedDetail(member)}
                          title="Lihat Detail Profil"
                          aria-label={`Lihat detail ${member.name}`}
                          className="p-1.5 text-stone-500 hover:text-emerald-700 rounded-lg hover:bg-stone-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(member)}
                              title="Edit Data Anggota"
                              aria-label={`Edit ${member.name}`}
                              className="p-1.5 text-stone-500 hover:text-blue-700 rounded-lg hover:bg-stone-100"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {member.status === 'Aktif' && (
                              <button
                                type="button"
                                onClick={() => archiveMember(member.id)}
                                title="Arsipkan Menjadi Alumni"
                                aria-label={`Arsipkan ${member.name}`}
                                className="p-1.5 text-stone-500 hover:text-amber-700 rounded-lg hover:bg-stone-100"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}
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

        <div className="p-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
          <span>Menampilkan {filteredMembers.length} dari {state.members.length} anggota</span>
          <span>Karang Taruna Desa Sukamaju</span>
        </div>
      </div>

      {/* Modal Detail Profil Pemuda */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <span className="text-[10px] font-mono text-stone-400 block">{selectedDetail.memberCode}</span>
                <h3 className="font-bold text-stone-900 text-base">{selectedDetail.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-emerald-900 font-bold block">{selectedDetail.roleInOrg}</span>
                  <span className="text-[11px] text-emerald-700">Status: {selectedDetail.status} &bull; Sejak {selectedDetail.joinDate}</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                  {selectedDetail.name.charAt(0)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-stone-700">
                <div>
                  <span className="text-stone-400 block text-[10px]">Usia & Kelompok</span>
                  <span className="font-semibold">{selectedDetail.age} Th ({selectedDetail.ageGroup})</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Wilayah Domisili</span>
                  <span className="font-semibold">RT {selectedDetail.rt} / RW {selectedDetail.rw}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-400 block text-[10px]">Alamat Lengkap</span>
                  <span className="font-medium text-stone-800">{selectedDetail.address}</span>
                </div>
                {selectedDetail.phone && (
                  <div className="col-span-2">
                    <span className="text-stone-400 block text-[10px]">Kontak WhatsApp / HP</span>
                    <span className="font-mono font-medium text-emerald-800">{selectedDetail.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-stone-400 block text-[10px] mb-1">Keahlian & Kompetensi</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDetail.skills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-medium text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px] mb-1">Minat & Ketertarikan</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDetail.interests.map((it, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-800 text-[11px]">
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDetail(null)}
              className="mt-6 w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
            >
              Tutup Profil
            </button>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit Anggota */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-base">
                {editingMember ? 'Perbarui Data Anggota Pemuda' : 'Daftarkan Anggota Pemuda Baru'}
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
                  Nama Lengkap Pemuda <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Rian Pratama, S.Kom."
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
                {formErrors.name && <p className="text-[10px] text-red-600 mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Usia (Tahun) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="13"
                    max="35"
                    value={formAge}
                    onChange={(e) => {
                      const ageVal = Number(e.target.value);
                      setFormAge(ageVal);
                      if (ageVal <= 17) setFormAgeGroup('13-17');
                      else if (ageVal <= 24) setFormAgeGroup('18-24');
                      else setFormAgeGroup('25-30');
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                  {formErrors.age && <p className="text-[10px] text-red-600 mt-1">{formErrors.age}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Kelompok Usia</label>
                  <select
                    value={formAgeGroup}
                    onChange={(e) => setFormAgeGroup(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  >
                    <option value="13-17">Remaja (13-17 Th)</option>
                    <option value="18-24">Pemuda Muda (18-24 Th)</option>
                    <option value="25-30">Pemuda Dewasa (25-30 Th)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Alamat / Dusun <span className="text-red-500">*</span>
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
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Status Keanggotaan</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Jabatan dalam Organisasi</label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="Contoh: Koordinator Bidang Olahraga"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">No. WhatsApp / Kontak</label>
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
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Keahlian / Keterampilan (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  placeholder="Contoh: Desain Grafis, Mekanik Motor, Pertanian Organik"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Minat / Hobi (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formInterests}
                  onChange={(e) => setFormInterests(e.target.value)}
                  placeholder="Contoh: Sepak Bola, Kewirausahaan, Fotografi"
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
                  {editingMember ? 'Simpan Perubahan' : 'Daftarkan Anggota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
