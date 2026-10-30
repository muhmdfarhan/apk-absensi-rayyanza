import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatusBadge from '@/Components/StatusBadge';
import StatCard from '@/Components/StatCard';
import {
    Search,
    UserCheck,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Briefcase,
    Edit3,
    X,
    Save,
    RotateCcw,
} from 'lucide-react';

export default function Today({ attendances, stats, shifts, filters, todayDate }) {
    const [search, setSearch] = useState(filters.search || '');
    const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);

    const correctionForm = useForm({
        check_in_time: '',
        check_out_time: '',
        status: 'present',
        late_minutes: 0,
        reason: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.attendances.today'), { ...filters, search }, { preserveState: true });
    };

    const handleFilterChange = (key, value) => {
        router.get(route('admin.attendances.today'), { ...filters, [key]: value, page: 1 }, { preserveState: true });
    };

    const openCorrectionModal = (att) => {
        setSelectedAttendance(att);
        correctionForm.setData({
            check_in_time: att.check_in_time ? att.check_in_time.substring(0, 16) : '',
            check_out_time: att.check_out_time ? att.check_out_time.substring(0, 16) : '',
            status: att.status,
            late_minutes: att.late_minutes || 0,
            reason: '',
        });
        setCorrectionModalOpen(true);
    };

    const submitCorrection = (e) => {
        e.preventDefault();
        correctionForm.post(route('admin.attendances.correct', selectedAttendance.id), {
            onSuccess: () => setCorrectionModalOpen(false),
        });
    };

    return (
        <AppLayout
            headerTitle="Monitor Absensi Hari Ini"
            headerSubtitle={`Pemantauan langsung absensi karyawan toko ritel per ${todayDate}`}
        >
            <Head title="Absensi Hari Ini" />

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Sudah Masuk"
                    value={stats.checked_in_today}
                    subtitle={`Dari ${stats.total_scheduled_today} jadwal`}
                    icon={UserCheck}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-50"
                />
                <StatCard
                    title="Tepat Waktu"
                    value={stats.on_time_today}
                    subtitle="Disiplin shift"
                    icon={CheckCircle2}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-50"
                />
                <StatCard
                    title="Terlambat"
                    value={stats.late_today}
                    subtitle="Lewat batas toleransi"
                    icon={AlertTriangle}
                    iconColor="text-amber-600"
                    iconBg="bg-amber-50"
                />
                <StatCard
                    title="Sedang Bekerja"
                    value={stats.working_now}
                    subtitle="Belum checkout"
                    icon={Briefcase}
                    iconColor="text-indigo-600"
                    iconBg="bg-indigo-50"
                />
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearch} className="w-full md:w-80 relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama atau kode karyawan..."
                        className="w-full pl-9 pr-3.5 py-2 text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </form>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <select
                        value={filters.shift_id || ''}
                        onChange={(e) => handleFilterChange('shift_id', e.target.value || null)}
                        className="text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Semua Shift</option>
                        {shifts.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>

                    <select
                        value={filters.status || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value || null)}
                        className="text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Semua Status</option>
                        <option value="present">Tepat Waktu</option>
                        <option value="late">Terlambat</option>
                        <option value="on_leave">Izin</option>
                        <option value="sick">Sakit</option>
                        <option value="absent">Tidak Hadir</option>
                        <option value="unscheduled">Tanpa Jadwal</option>
                    </select>

                    <button
                        type="button"
                        onClick={() => router.get(route('admin.attendances.today'))}
                        className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-500"
                        title="Reset Filter"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                <th className="py-3 px-4">Karyawan</th>
                                <th className="py-3 px-4">Shift & Jadwal</th>
                                <th className="py-3 px-4">Jam Masuk</th>
                                <th className="py-3 px-4">Jam Pulang</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Keterlambatan</th>
                                <th className="py-3 px-4">Durasi Kerja</th>
                                <th className="py-3 px-4">Keterangan</th>
                                <th className="py-3 px-4 text-right">Koreksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {attendances.data.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-12 text-center text-slate-400">
                                        Tidak ada catatan kehadiran yang sesuai dengan filter.
                                    </td>
                                </tr>
                            ) : (
                                attendances.data.map((att) => (
                                    <tr key={att.id} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-slate-900">{att.employee?.full_name}</div>
                                            <div className="text-[11px] text-slate-500">{att.employee?.employee_code} • {att.employee?.position}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-slate-800">{att.shift_name || 'Tanpa Shift'}</div>
                                            {att.scheduled_start_time && (
                                                <div className="text-[10px] text-slate-400 font-mono">
                                                    {att.scheduled_start_time.substring(0, 5)} - {att.scheduled_end_time?.substring(0, 5)} WIB
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                                            {att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                                            {att.check_out_time ? new Date(att.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : (
                                                att.check_in_time ? (
                                                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                                                        Sedang Bekerja
                                                    </span>
                                                ) : '-'
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <StatusBadge status={att.status} />
                                            {att.is_corrected && (
                                                <span className="block text-[9px] text-amber-600 font-bold mt-0.5">
                                                    (Terkoreksi Admin)
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 font-medium">
                                            {att.late_minutes > 0 ? (
                                                <span className="text-amber-700 font-bold">+{att.late_minutes} Menit</span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 font-medium text-slate-700">
                                            {att.work_duration_minutes > 0 
                                                ? `${Math.floor(att.work_duration_minutes / 60)}j ${att.work_duration_minutes % 60}m` 
                                                : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                                            {att.check_in_notes || att.check_out_notes || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openCorrectionModal(att)}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
                                                title="Koreksi Absensi Ini"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {attendances.links && attendances.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Menampilkan {attendances.from || 0} - {attendances.to || 0} dari {attendances.total} data</span>
                        <div className="flex items-center gap-1">
                            {attendances.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded-md ${
                                        link.active
                                            ? 'bg-blue-600 text-white font-semibold'
                                            : link.url
                                            ? 'hover:bg-slate-100 text-slate-700'
                                            : 'text-slate-300 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Attendance Correction Modal */}
            {correctionModalOpen && selectedAttendance && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setCorrectionModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">Koreksi Absensi Karyawan</h2>
                                <p className="text-xs text-slate-500">
                                    {selectedAttendance.employee?.full_name} • {selectedAttendance.date}
                                </p>
                            </div>
                            <button onClick={() => setCorrectionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitCorrection} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Waktu Masuk
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={correctionForm.data.check_in_time}
                                        onChange={(e) => correctionForm.setData('check_in_time', e.target.value)}
                                        className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Waktu Pulang
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={correctionForm.data.check_out_time}
                                        onChange={(e) => correctionForm.setData('check_out_time', e.target.value)}
                                        className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Status Kehadiran <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={correctionForm.data.status}
                                        onChange={(e) => correctionForm.setData('status', e.target.value)}
                                        className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="present">Tepat Waktu</option>
                                        <option value="late">Terlambat</option>
                                        <option value="on_leave">Izin</option>
                                        <option value="sick">Sakit</option>
                                        <option value="absent">Tidak Hadir</option>
                                        <option value="unscheduled">Tanpa Jadwal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Menit Terlambat
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={correctionForm.data.late_minutes}
                                        onChange={(e) => correctionForm.setData('late_minutes', parseInt(e.target.value) || 0)}
                                        className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Alasan Koreksi (Wajib Diisi) <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={correctionForm.data.reason}
                                    onChange={(e) => correctionForm.setData('reason', e.target.value)}
                                    rows={3}
                                    placeholder="Jelaskan alasan mengapa data absensi ini diubah oleh admin..."
                                    className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                    required
                                ></textarea>
                                {correctionForm.errors.reason && (
                                    <p className="mt-1 text-xs text-rose-600">{correctionForm.errors.reason}</p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCorrectionModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={correctionForm.processing}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition disabled:opacity-60"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Simpan Koreksi</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
