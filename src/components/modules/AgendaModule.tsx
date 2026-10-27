/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Wallet,
  Check,
  Edit3,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EventAgenda, AttendanceStatus } from '../../types';
import { formatRupiah, calculateAttendanceRate, checkPermission } from '../../utils/finance';

export const AgendaModule: React.FC = () => {
  const {
    state,
    currentUser,
    addEvent,
    updateEvent,
    updateEventAttendance,
    rsvpEvent,
    addToast,
  } = useApp();

  const [selectedEventId, setSelectedEventId] = useState<string>(
    state.events[0]?.id || ''
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventAgenda | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formTime, setFormTime] = useState('19:00 - 21:00 WIB');
  const [formLocation, setFormLocation] = useState('Balai Pertemuan Desa Sukamaju');
  const [formPJ, setFormPJ] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBudget, setFormBudget] = useState('350000');
  const [formStatus, setFormStatus] = useState<'rencana' | 'berlangsung' | 'selesai' | 'dibatalkan'>('rencana');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const canManage = checkPermission(currentUser.role, 'manage_events');

  const selectedEvent = state.events.find((e) => e.id === selectedEventId) || state.events[0];

  const openAdd = () => {
    if (!canManage) {
      addToast('Hak akses ditolak. Hanya Pengurus dan Administrator yang dapat membuat agenda kegiatan.', 'error');
      return;
    }
    setEditingEvent(null);
    setFormTitle('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormTime('19:30 - 21:30 WIB');
    setFormLocation('Balai Pertemuan Desa Sukamaju');
    setFormPJ(currentUser.name);
    setFormDescription('');
    setFormBudget('250000');
    setFormStatus('rencana');
    setFormErrors({});
    setShowAddModal(true);
  };

  const openEdit = (ev: EventAgenda) => {
    if (!canManage) {
      addToast('Hak akses ditolak.', 'error');
      return;
    }
    setEditingEvent(ev);
    setFormTitle(ev.title);
    setFormDate(ev.date);
    setFormTime(ev.time);
    setFormLocation(ev.location);
    setFormPJ(ev.personInCharge);
    setFormDescription(ev.description);
    setFormBudget(ev.budget.toString());
    setFormStatus(ev.status);
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formTitle.trim()) errors.title = 'Judul agenda wajib diisi';
    if (!formLocation.trim()) errors.location = 'Lokasi wajib diisi';
    if (!formPJ.trim()) errors.pj = 'Penanggung jawab wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingEvent) {
      updateEvent({
        ...editingEvent,
        title: formTitle.trim(),
        date: formDate,
        time: formTime.trim(),
        location: formLocation.trim(),
        personInCharge: formPJ.trim(),
        description: formDescription.trim(),
        budget: Number(formBudget) || 0,
        status: formStatus,
      });
    } else {
      addEvent({
        title: formTitle.trim(),
        date: formDate,
        time: formTime.trim(),
        location: formLocation.trim(),
        personInCharge: formPJ.trim(),
        description: formDescription.trim(),
        budget: Number(formBudget) || 0,
        status: formStatus,
      });
    }
    setShowAddModal(false);
  };

  // Attendance rate for selected event
  const totalAttendees = selectedEvent?.attendees.length || state.members.length;
  const hadirCount = selectedEvent?.attendees.filter((a) => a.status === 'hadir').length || 0;
  const izinCount = selectedEvent?.attendees.filter((a) => a.status === 'izin').length || 0;
  const sakitCount = selectedEvent?.attendees.filter((a) => a.status === 'sakit').length || 0;
  const attendancePercentage = calculateAttendanceRate(totalAttendees, hadirCount);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-emerald-700" />
            <span>Agenda Kegiatan & Sistem Absensi Digital</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Penjadwalan rapat kerja, aksi gotong royong, dan pencatatan presensi kehadiran kader
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Jadwalkan Agenda Baru</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Event List */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-stone-700 uppercase tracking-wider px-1">
            Daftar Kegiatan ({state.events.length})
          </div>

          {state.events.map((ev) => {
            const isSelected = ev.id === selectedEvent?.id;
            const evHadir = ev.attendees.filter((a) => a.status === 'hadir').length;
            const rate = calculateAttendanceRate(ev.attendees.length || state.members.length, evHadir);

            return (
              <div
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200/80 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isSelected
                        ? 'bg-emerald-900 text-emerald-200'
                        : ev.status === 'rencana'
                        ? 'bg-amber-100 text-amber-800'
                        : ev.status === 'selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {ev.status}
                  </span>
                  <span className={`text-[11px] font-medium ${isSelected ? 'text-emerald-200' : 'text-stone-400'}`}>
                    {ev.date}
                  </span>
                </div>

                <div className="font-bold text-sm line-clamp-1 mb-1">{ev.title}</div>

                <div className={`text-xs flex items-center gap-1.5 truncate ${isSelected ? 'text-emerald-100' : 'text-stone-500'}`}>
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{ev.location}</span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-current/15 flex items-center justify-between text-[11px]">
                  <span className={isSelected ? 'text-emerald-200' : 'text-stone-400'}>
                    Presensi: <strong>{evHadir} Hadir</strong>
                  </span>
                  <span className={`font-bold ${isSelected ? 'text-amber-300' : 'text-emerald-700'}`}>
                    {rate}% Kehadiran
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Cols: Selected Event Detail & Attendance Checklist */}
        {selectedEvent && (
          <div className="lg:col-span-2 space-y-6">
            {/* Event Detail Card */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-stone-100 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-100 text-amber-800">
                      {selectedEvent.status}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">
                      Anggaran: {formatRupiah(selectedEvent.budget)}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-stone-900">{selectedEvent.title}</h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Member Quick RSVP */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                    <span className="text-[10px] font-bold text-stone-500 px-2">RSVP:</span>
                    <button
                      type="button"
                      onClick={() => rsvpEvent(selectedEvent.id, 'hadir')}
                      className="px-2.5 py-1 text-xs font-bold bg-emerald-700 text-white rounded-lg shadow-2xs hover:bg-emerald-800"
                    >
                      Hadir
                    </button>
                    <button
                      type="button"
                      onClick={() => rsvpEvent(selectedEvent.id, 'izin')}
                      className="px-2.5 py-1 text-xs font-semibold bg-white text-stone-700 rounded-lg hover:bg-stone-50"
                    >
                      Izin
                    </button>
                  </div>

                  {canManage && (
                    <button
                      type="button"
                      onClick={() => openEdit(selectedEvent)}
                      className="p-2 text-stone-500 hover:text-blue-700 rounded-xl hover:bg-stone-100"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Event Metadata Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="flex items-center gap-1.5 text-stone-400 font-medium mb-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Waktu & Tanggal</span>
                  </div>
                  <div className="font-bold text-stone-800">{selectedEvent.date}</div>
                  <div className="text-[11px] text-stone-500">{selectedEvent.time}</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="flex items-center gap-1.5 text-stone-400 font-medium mb-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Lokasi Kegiatan</span>
                  </div>
                  <div className="font-bold text-stone-800 line-clamp-2">{selectedEvent.location}</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="flex items-center gap-1.5 text-stone-400 font-medium mb-1">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Penanggung Jawab</span>
                  </div>
                  <div className="font-bold text-stone-800">{selectedEvent.personInCharge}</div>
                  <div className="text-[11px] text-stone-500">Sekretariat Karang Taruna</div>
                </div>
              </div>

              <div className="text-xs text-stone-600 leading-relaxed bg-stone-50/50 p-3 rounded-xl border border-stone-100">
                <span className="font-semibold text-stone-800 block mb-1">Deskripsi Kegiatan:</span>
                {selectedEvent.description}
              </div>
            </div>

            {/* Attendance Checklist Section */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>Presensi Kehadiran Anggota ({selectedEvent.attendees.length})</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tandai kehadiran langsung dengan satu klik oleh pengurus atau konfirmasi mandiri
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
                    Tingkat Kehadiran: {attendancePercentage}%
                  </div>
                </div>
              </div>

              {/* Attendance Quick Stats */}
              <div className="flex items-center gap-4 text-xs font-semibold mb-4 pb-3 border-b border-stone-100">
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {hadirCount} Hadir
                </span>
                <span className="text-amber-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {izinCount} Izin
                </span>
                <span className="text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {sakitCount} Sakit
                </span>
                <span className="text-stone-400">
                  {totalAttendees - hadirCount - izinCount - sakitCount} Belum Presensi
                </span>
              </div>

              {/* Attendance List */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {state.members.map((member) => {
                  const record = selectedEvent.attendees.find((a) => a.memberId === member.id);
                  const currentStatus = record?.status || 'tanpa_keterangan';

                  return (
                    <div
                      key={member.id}
                      className="p-3 rounded-xl border border-stone-100 hover:border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-stone-50/40"
                    >
                      <div>
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                          <span>{member.name}</span>
                          <span className="text-[10px] text-stone-400 font-normal">
                            ({member.roleInOrg} &bull; RT {member.rt})
                          </span>
                        </div>
                        {record?.notes && (
                          <div className="text-[11px] text-stone-500 italic mt-0.5">
                            &ldquo;{record.notes}&rdquo;
                          </div>
                        )}
                      </div>

                      {/* Status Badges or Change Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {canManage ? (
                          <>
                            <button
                              type="button"
                              onClick={() => updateEventAttendance(selectedEvent.id, member.id, 'hadir')}
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                                currentStatus === 'hadir'
                                  ? 'bg-emerald-700 text-white shadow-xs'
                                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                              }`}
                            >
                              Hadir
                            </button>
                            <button
                              type="button"
                              onClick={() => updateEventAttendance(selectedEvent.id, member.id, 'izin')}
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                                currentStatus === 'izin'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                              }`}
                            >
                              Izin
                            </button>
                            <button
                              type="button"
                              onClick={() => updateEventAttendance(selectedEvent.id, member.id, 'sakit')}
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                                currentStatus === 'sakit'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                              }`}
                            >
                              Sakit
                            </button>
                          </>
                        ) : (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              currentStatus === 'hadir'
                                ? 'bg-emerald-100 text-emerald-800'
                                : currentStatus === 'izin'
                                ? 'bg-amber-100 text-amber-800'
                                : currentStatus === 'sakit'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {currentStatus.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Agenda */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-base">
                {editingEvent ? 'Edit Agenda Kegiatan' : 'Jadwalkan Agenda Kegiatan Baru'}
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
                  Nama / Judul Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Rapat Kerja Pemuda Semester II"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                />
                {formErrors.title && <p className="text-[10px] text-red-600 mt-1">{formErrors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tanggal Kegiatan</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Waktu Pelaksanaan</label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="Contoh: 19:30 - 22:00 WIB"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Lokasi / Tempat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Contoh: Balai RW 02"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  />
                  {formErrors.location && <p className="text-[10px] text-red-600 mt-1">{formErrors.location}</p>}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Anggaran Kegiatan (Rp)</label>
                  <input
                    type="number"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    placeholder="Contoh: 500000"
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Status Kegiatan</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl"
                  >
                    <option value="rencana">Rencana</option>
                    <option value="berlangsung">Sedang Berlangsung</option>
                    <option value="selesai">Selesai</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Deskripsi / Susunan Acara</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Rincian agenda, perlengkapan yang perlu dibawa..."
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl leading-relaxed"
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
                  {editingEvent ? 'Simpan Perubahan' : 'Jadwalkan Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
