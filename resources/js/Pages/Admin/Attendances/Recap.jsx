import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    FileSpreadsheet,
    FileText,
    Printer,
    Filter,
    RotateCcw,
    Search,
    Edit3,
    X,
    Save,
    Calendar,
    ChevronDown,
} from 'lucide-react';

export default function Recap({ attendances, shifts, employees, filters }) {
    const [filterState, setFilterState] = useState({
        period: filters.period || '',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        month: filters.month || new Date().getMonth() + 1,
        year: filters.year || new Date().getFullYear(),
        employee_id: filters.employee_id || '',
        search: filters.search || '',
        shift_id: filters.shift_id || '',
        status: filters.status || '',
        punctuality: filters.punctuality || '',
        sort_by: filters.sort_by || 'date',
        sort_order: filters.sort_order || 'desc',
    });

    const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);

    const correctionForm = useForm({
        check_in_time: '',
        check_out_time: '',
        status: 'present',
        late_minutes: 0,
        reason: '',
    });

    const handleApplyFilter = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.attendances.recap'), filterState, { preserveState: true });
    };

    const handleResetFilter = () => {
        const defaultState = {
            period: 'this_month',
            start_date: '',
            end_date: '',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            employee_id: '',
            search: '',
            shift_id: '',
            status: '',
            punctuality: '',
            sort_by: 'date',
            sort_order: 'desc',
        };
        setFilterState(defaultState);
        router.get(route('admin.attendances.recap'), defaultState);
    };

    const handlePeriodChange = (period) => {
        setFilterState({
            ...filterState,
            period,
            start_date: '',
            end_date: '',
        });
    };

    const handleExportExcel = () => {
        const params = new URLSearchParams(filterState).toString();
        window.location.href = `${route('admin.attendances.export.excel')}?${params}`;
    };

    const handleExportPdf = () => {
        const params = new URLSearchParams(filterState).toString();
        window.location.href = `${route('admin.attendances.export.pdf')}?${params}`;
    };

    const handlePrint = () => {
        window.print();
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
            headerTitle="Halaman Rekapitulasi Absensi"
            headerSubtitle="Laporan lengkap kehadiran dengan 11 filter dinamis, ekspor Excel, PDF, dan cetak browser"
            actions={
                <div className="flex items-center gap-2 print:hidden">
                    <button
                        type="button"
                        onClick={handleExportExcel}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-sm transition"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>Ekspor Excel</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleExportPdf}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-sm transition"
                    >
                        <FileText className="w-4 h-4 text-rose-600" />
                        <span>Unduh PDF</span>
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition"
                    >
                        <Printer className="w-4 h-4 text-slate-600" />
                        <span>Cetak Laporan</span>
                    </button>
                </div>
            }
        >
            <Head title="Rekap Absensi Karyawan" />

            {/* Filter Panel (Print Hidden) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 mb-6 print:hidden">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-blue-600" />
                        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Filter Data Kehadiran
                        </h2>
                    </div>
                    <span className="text-xs text-slate-400">Semua filter memengaruhi tampilan tabel dan file ekspor</span>
                </div>

                {/* Period Preset Pills */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 mr-1">Periode Cepat:</span>
                    {[
                        { key: 'today', label: 'Hari Ini' },
                        { key: 'this_week', label: 'Minggu Ini' },
                        { key: 'last_7_days', label: '7 Hari Terakhir' },
                        { key: 'this_month', label: 'Bulan Ini' },
                        { key: 'custom_month', label: 'Bulan Pilihan' },
                        { key: 'year', label: 'Tahun Tertentu' },
                    ].map((p) => (
                        <button
                            key={p.key}
                            type="button"
                            onClick={() => handlePeriodChange(p.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                filterState.period === p.key
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Form Filter Grid */}
                <form onSubmit={handleApplyFilter} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Custom Month & Year if period === 'custom_month' or 'year' */}
                        {(filterState.period === 'custom_month' || filterState.period === 'year') ? (
                            <>
                                {filterState.period === 'custom_month' && (
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                            Bulan
                                        </label>
                                        <select
                                            value={filterState.month}
                                            onChange={(e) => setFilterState({ ...filterState, month: e.target.value })}
                                            className="w-full text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {[
                                                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                                                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                                            ].map((mName, i) => (
                                                <option key={i + 1} value={i + 1}>{mName}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                        Tahun
                                    </label>
                                    <select
                                        value={filterState.year}
                                        onChange={(e) => setFilterState({ ...filterState, year: e.target.value })}
                                        className="w-full text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {[2024, 2025, 2026, 2027].map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        value={filterState.start_date}
                                        onChange={(e) => setFilterState({ ...filterState, start_date: e.target.value, period: '' })}
                                        className="w-full text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                        Tanggal Selesai
                                    </label>
                                    <input
                                        type="date"
                                        value={filterState.end_date}
                                        onChange={(e) => setFilterState({ ...filterState, end_date: e.target.value, period: '' })}
                                        className="w-full text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </>
                        )}

                        {/* Employee Dropdown */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                Karyawan
                            </label>
                            <select
                                value={filterState.employee_id}
                                onChange={(e) => setFilterState({ ...filterState, employee_id: e.target.value })}
                                className="w-full text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Semua Karyawan</option>
                                {employees.map((e) => (
                                    <option key={e.id} value={e.id}>{e.full_name} ({e.employee_code})</option>
                                ))}
                            </select>
                        </div>

                        {/* Search Name/Code */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                Cari Nama / Kode
                            </label>
                            <input
                                type="text"
                                value={filterState.search}
                                onChange={(e) => setFilterState({ ...filterState, search: e.target.value })}
                                placeholder="Ketik kata kunci..."
                                className="w-full text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Shift Filter */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                Shift Kerja
                            </label>
                            <select
                                value={filterState.shift_id}
                                onChange={(e) => setFilterState({ ...filterState, shift_id: e.target.value })}
                                className="w-full text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Semua Shift</option>
                                {shifts.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                Status Kehadiran
                            </label>
                            <select
                                value={filterState.status}
                                onChange={(e) => setFilterState({ ...filterState, status: e.target.value })}
                                className="w-full text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Semua Status</option>
                                <option value="present">Tepat Waktu</option>
                                <option value="late">Terlambat</option>
                                <option value="on_leave">Izin</option>
                                <option value="sick">Sakit</option>
                                <option value="absent">Tidak Hadir</option>
                                <option value="unscheduled">Tanpa Jadwal</option>
                            </select>
                        </div>

                        {/* Punctuality Filter */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                Disiplin Waktu
                            </label>
                            <select
                                value={filterState.punctuality}
                                onChange={(e) => setFilterState({ ...filterState, punctuality: e.target.value })}
                                className="w-full text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Semua Disiplin</option>
                                <option value="on_time">Hanya Tepat Waktu</option>
                                <option value="late">Hanya Terlambat</option>
                            </select>
                        </div>

                        {/* Sorting Column */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                Urutkan Berdasarkan
                            </label>
                            <select
                                value={`${filterState.sort_by}_${filterState.sort_order}`}
                                onChange={(e) => {
                                    const [by, ord] = e.target.value.split('_');
                                    setFilterState({ ...filterState, sort_by: by, sort_order: ord });
                                }}
                                className="w-full text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="date_desc">Tanggal Terbaru</option>
                                <option value="date_asc">Tanggal Terlama</option>
                                <option value="late_minutes_desc">Keterlambatan Terbanyak</option>
                                <option value="work_duration_minutes_desc">Durasi Kerja Terlama</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Filter</span>
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Terapkan Filter</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                <th className="py-3 px-3 text-center">No.</th>
                                <th className="py-3 px-3">Tanggal</th>
                                <th className="py-3 px-3">Kode</th>
                                <th className="py-3 px-3">Nama Karyawan</th>
                                <th className="py-3 px-3">Shift</th>
                                <th className="py-3 px-3 text-center">Masuk</th>
                                <th className="py-3 px-3 text-center">Pulang</th>
                                <th className="py-3 px-3 text-center">Status</th>
                                <th className="py-3 px-3 text-right">Menit Telat</th>
                                <th className="py-3 px-3 text-right">Durasi Kerja</th>
                                <th className="py-3 px-3">Keterangan</th>
                                <th className="py-3 px-3 text-right print:hidden">Koreksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {attendances.data.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="py-12 text-center text-slate-400">
                                        Tidak ditemukan catatan kehadiran yang sesuai dengan kriteria filter aktif.
                                    </td>
                                </tr>
                            ) : (
                                attendances.data.map((att, idx) => (
                                    <tr key={att.id} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3 px-3 text-center text-slate-400">
                                            {(attendances.current_page - 1) * attendances.per_page + idx + 1}
                                        </td>
                                        <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                                            {new Date(att.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </td>
                                        <td className="py-3 px-3 font-mono text-slate-600">
                                            {att.employee?.employee_code || '-'}
                                        </td>
                                        <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                                            {att.employee?.full_name || '-'}
                                        </td>
                                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                                            {att.shift_name || '-'}
                                        </td>
                                        <td className="py-3 px-3 text-center font-mono font-medium text-slate-800">
                                            {att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="py-3 px-3 text-center font-mono font-medium text-slate-800">
                                            {att.check_out_time ? new Date(att.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="py-3 px-3 text-center whitespace-nowrap">
                                            <StatusBadge status={att.status} />
                                            {att.is_corrected && (
                                                <span className="block text-[9px] text-amber-600 font-bold mt-0.5">
                                                    (Koreksi)
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-right font-medium">
                                            {att.late_minutes > 0 ? (
                                                <span className="text-amber-700 font-bold">+{att.late_minutes} m</span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-right font-medium text-slate-700 whitespace-nowrap">
                                            {att.work_duration_minutes > 0 
                                                ? `${Math.floor(att.work_duration_minutes / 60)}j ${att.work_duration_minutes % 60}m` 
                                                : '-'}
                                        </td>
                                        <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                                            {att.check_in_notes || att.check_out_notes || '-'}
                                        </td>
                                        <td className="py-3 px-3 text-right print:hidden">
                                            <button
                                                type="button"
                                                onClick={() => openCorrectionModal(att)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 transition"
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
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 print:hidden">
                        <span>Menampilkan {attendances.from || 0} - {attendances.to || 0} dari {attendances.total} data rekap</span>
                        <div className="flex items-center gap-1">
                            {attendances.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
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
                                    placeholder="Jelaskan alasan koreksi data absensi ini secara transparan..."
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
