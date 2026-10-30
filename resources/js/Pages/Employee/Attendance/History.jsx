import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    Calendar,
    Filter,
    Clock,
    History,
    CheckCircle2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    FileText
} from 'lucide-react';

export default function AttendanceHistory({
    attendances,
    stats,
    filters,
    months,
    years,
}) {
    const [month, setMonth] = useState(filters.month || new Date().getMonth() + 1);
    const [year, setYear] = useState(filters.year || new Date().getFullYear());

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('employee.attendance.history'), {
            month,
            year,
        }, { preserveState: true });
    };

    return (
        <AppLayout
            title="Riwayat Absensi"
            headerTitle="Riwayat & Histori Absensi Pribadi"
            headerSubtitle="Catatan lengkap waktu kehadiran, ketepatan waktu, dan total jam kerja Anda"
        >
            <Head title="Riwayat Absensi" />

            {/* Filter Section */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm mb-6">
                <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
                    <div className="min-w-[180px]">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Bulan
                        </label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="w-full text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                        >
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-[140px]">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Tahun
                        </label>
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="w-full text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition shadow-sm"
                        >
                            <Filter className="w-4 h-4" />
                            Tampilkan
                        </button>
                    </div>
                </form>
            </div>

            {/* Monthly Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
                    <p className="text-xs font-medium text-emerald-700">Tepat Waktu</p>
                    <p className="text-2xl font-bold text-emerald-800 mt-1">{stats.present ?? 0}</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">Hari</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-sm">
                    <p className="text-xs font-medium text-amber-700">Terlambat</p>
                    <p className="text-2xl font-bold text-amber-800 mt-1">{stats.late ?? 0}</p>
                    <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Total {stats.late_minutes ?? 0} menit</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-sm">
                    <p className="text-xs font-medium text-blue-700">Izin / Sakit</p>
                    <p className="text-2xl font-bold text-blue-800 mt-1">{stats.leave ?? 0}</p>
                    <p className="text-[11px] text-blue-600 mt-0.5">Hari</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/20 shadow-sm">
                    <p className="text-xs font-medium text-rose-700">Alpa</p>
                    <p className="text-2xl font-bold text-rose-800 mt-1">{stats.absent ?? 0}</p>
                    <p className="text-[11px] text-rose-600 mt-0.5">Hari</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-medium text-slate-500">Total Jam Kerja</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total_hours ?? 0}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Jam akumulasi</p>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/70">
                            <tr>
                                <th className="px-5 py-3.5 font-bold">Tanggal</th>
                                <th className="px-5 py-3.5 font-bold">Shift Kerja</th>
                                <th className="px-5 py-3.5 font-bold">Jam Masuk</th>
                                <th className="px-5 py-3.5 font-bold">Jam Pulang</th>
                                <th className="px-5 py-3.5 font-bold text-center">Status</th>
                                <th className="px-5 py-3.5 font-bold text-center">Keterlambatan</th>
                                <th className="px-5 py-3.5 font-bold text-right">Durasi Kerja</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {attendances.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-5 py-12 text-center text-slate-400">
                                        Tidak ada catatan absensi pada bulan/tahun ini.
                                    </td>
                                </tr>
                            ) : (
                                attendances.data.map((att) => {
                                    const hours = Math.floor(att.work_duration_minutes / 60);
                                    const mins = att.work_duration_minutes % 60;
                                    const durationStr = att.work_duration_minutes > 0 ? `${hours}j ${mins}m` : '-';

                                    return (
                                        <tr key={att.id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-5 py-3.5 font-semibold text-slate-900">
                                                <div>
                                                    {new Date(att.date).toLocaleDateString('id-ID', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-700 text-xs">
                                                <div className="font-medium text-slate-900">
                                                    {att.shift_name_snapshot || att.schedule?.shift?.name || 'Reguler'}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono">
                                                    {att.scheduled_start_time_snapshot?.substring(0, 5)} - {att.scheduled_end_time_snapshot?.substring(0, 5)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-slate-800">
                                                {att.check_in_time ? att.check_in_time.substring(11, 16) : '-'}
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-slate-800">
                                                {att.check_out_time ? att.check_out_time.substring(11, 16) : '-'}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <StatusBadge status={att.status} />
                                                {att.is_corrected && (
                                                    <div className="text-[10px] text-indigo-600 font-medium mt-0.5">
                                                        (Dikoreksi Admin)
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                {att.late_minutes > 0 ? (
                                                    <span className="text-xs font-bold text-amber-600">
                                                        +{att.late_minutes} Menit
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-semibold text-slate-800">
                                                {durationStr}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {attendances.links && attendances.links.length > 3 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div>
                            Menampilkan {attendances.from || 0} - {attendances.to || 0} dari {attendances.total} data
                        </div>
                        <div className="flex items-center gap-1">
                            {attendances.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                                        link.active
                                            ? 'bg-navy-900 text-white'
                                            : link.url
                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            : 'text-slate-300 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
