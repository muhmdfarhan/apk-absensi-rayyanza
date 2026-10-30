import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    Users,
    Trash2,
    X,
    Save,
    Moon,
    Filter,
} from 'lucide-react';

export default function Index({ matrix, days, shifts, allEmployees, filters, currentWeekLabel }) {
    const [singleModalOpen, setSingleModalOpen] = useState(false);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Single schedule form
    const singleForm = useForm({
        employee_id: '',
        schedule_date: '',
        shift_id: shifts[0]?.id || '',
        is_day_off: false,
        notes: '',
    });

    // Bulk schedule form
    const bulkForm = useForm({
        employee_ids: [],
        start_date: filters.start_date,
        end_date: filters.end_date,
        shift_id: shifts[0]?.id || '',
        days_of_week: [1, 2, 3, 4, 5, 6], // Mon - Sat
        is_day_off: false,
        notes: 'Penugasan massal mingguan',
    });

    const openSingleModal = (employee, day, existingSchedule) => {
        setSelectedSlot({ employee, day, existingSchedule });
        singleForm.setData({
            employee_id: employee.id,
            schedule_date: day.date,
            shift_id: existingSchedule?.shift_id || shifts[0]?.id || '',
            is_day_off: existingSchedule?.is_day_off || false,
            notes: existingSchedule?.notes || '',
        });
        setSingleModalOpen(true);
    };

    const submitSingle = (e) => {
        e.preventDefault();
        singleForm.post(route('admin.schedules.store'), {
            onSuccess: () => setSingleModalOpen(false),
        });
    };

    const submitBulk = (e) => {
        e.preventDefault();
        bulkForm.post(route('admin.schedules.bulk'), {
            onSuccess: () => setBulkModalOpen(false),
        });
    };

    const handleDeleteSchedule = (scheduleId) => {
        if (confirm('Hapus jadwal ini? Catatan kehadiran historis yang sudah ada tidak akan terhapus.')) {
            router.delete(route('admin.schedules.destroy', scheduleId));
        }
    };

    const navigateWeek = (direction) => {
        const currentStart = new Date(filters.start_date);
        const daysToAdd = direction === 'next' ? 7 : -7;
        currentStart.setDate(currentStart.getDate() + daysToAdd);
        const newStartStr = currentStart.toISOString().split('T')[0];

        router.get(route('admin.schedules.index'), {
            ...filters,
            start_date: newStartStr,
        }, { preserveState: true });
    };

    const toggleSelectAllEmployees = () => {
        if (bulkForm.data.employee_ids.length === allEmployees.length) {
            bulkForm.setData('employee_ids', []);
        } else {
            bulkForm.setData('employee_ids', allEmployees.map((e) => e.id));
        }
    };

    const toggleDayOfWeek = (dayNumber) => {
        const current = [...bulkForm.data.days_of_week];
        const idx = current.indexOf(dayNumber);
        if (idx > -1) {
            current.splice(idx, 1);
        } else {
            current.push(dayNumber);
        }
        bulkForm.setData('days_of_week', current);
    };

    return (
        <AppLayout
            headerTitle="Pengaturan Jadwal Shift Karyawan"
            headerSubtitle="Susun penugasan shift mingguan karyawan, atur hari libur, dan cegah tabrakan shift"
            actions={
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setBulkModalOpen(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition"
                    >
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Penugasan Massal</span>
                    </button>
                </div>
            }
        >
            <Head title="Jadwal Shift Karyawan" />

            {/* Navigation & Controls Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigateWeek('prev')}
                        className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition"
                        title="Minggu Sebelumnya"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="px-4 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs sm:text-sm font-bold border border-blue-200">
                        {currentWeekLabel}
                    </div>
                    <button
                        type="button"
                        onClick={() => navigateWeek('next')}
                        className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition"
                        title="Minggu Berikutnya"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Filter employee */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label htmlFor="schedule-employee-filter" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                        Filter Karyawan:
                    </label>
                    <select
                        id="schedule-employee-filter"
                        value={filters.employee_id || ''}
                        onChange={(e) => router.get(route('admin.schedules.index'), { ...filters, employee_id: e.target.value || null })}
                        className="w-full sm:w-56 text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Semua Karyawan ({allEmployees.length})</option>
                        {allEmployees.map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.position})</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Shifts Legend Bar */}
            <div className="bg-white px-4 py-3 rounded-xl border border-slate-200/90 shadow-sm mb-6 flex flex-wrap items-center gap-4 text-xs">
                <span className="font-semibold text-slate-500">Keterangan Shift:</span>
                {shifts.map((s) => (
                    <div key={s.id} className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                        <span className="font-medium text-slate-700">{s.name} ({s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)})</span>
                    </div>
                ))}
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                    <span className="font-medium text-slate-500">Libur Rutin</span>
                </div>
            </div>

            {/* Schedule Matrix Table */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white border-b border-slate-800">
                                <th className="py-3 px-4 font-bold min-w-[180px] sticky left-0 bg-slate-900 z-10">
                                    Karyawan Toko
                                </th>
                                {days.map((day) => (
                                    <th
                                        key={day.date}
                                        className={`py-3 px-3 text-center min-w-[130px] border-l border-slate-800 ${
                                            day.is_today ? 'bg-blue-900/80 text-blue-200' : ''
                                        }`}
                                    >
                                        <div className="text-[11px] font-semibold text-slate-400 uppercase">{day.day_name}</div>
                                        <div className="text-sm font-bold mt-0.5">{day.day_number} {day.month_name}</div>
                                        {day.is_today && (
                                            <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-blue-500 text-white rounded text-[9px] font-extrabold uppercase">
                                                Hari Ini
                                            </span>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {matrix.map((row) => (
                                <tr key={row.employee.id} className="hover:bg-slate-50/50 transition">
                                    {/* Employee Info Header Column */}
                                    <td className="py-3 px-4 sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.03)] z-10 border-r border-slate-200">
                                        <div className="font-bold text-slate-900">{row.employee.full_name}</div>
                                        <div className="text-[11px] text-slate-500 font-mono">{row.employee.employee_code} • {row.employee.position}</div>
                                    </td>

                                    {/* 7 Day Shift Slots */}
                                    {days.map((day) => {
                                        const schedule = row.days[day.date];
                                        return (
                                            <td
                                                key={day.date}
                                                className={`py-2 px-2 text-center border-l border-slate-100 transition relative group ${
                                                    day.is_today ? 'bg-blue-50/20' : ''
                                                }`}
                                            >
                                                {schedule ? (
                                                    <div
                                                        onClick={() => openSingleModal(row.employee, day, schedule)}
                                                        className="cursor-pointer p-2 rounded-lg border transition hover:scale-[1.02] text-left"
                                                        style={{
                                                            backgroundColor: schedule.is_day_off ? '#F1F5F9' : `${schedule.shift?.color}15`,
                                                            borderColor: schedule.is_day_off ? '#CBD5E1' : `${schedule.shift?.color}40`,
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span
                                                                className="font-bold text-[11px]"
                                                                style={{ color: schedule.is_day_off ? '#64748B' : schedule.shift?.color }}
                                                            >
                                                                {schedule.is_day_off ? 'Libur' : schedule.shift?.name}
                                                            </span>
                                                            {schedule.shift?.is_overnight && (
                                                                <Moon className="w-3 h-3 text-indigo-600" />
                                                            )}
                                                        </div>
                                                        {!schedule.is_day_off && schedule.shift && (
                                                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                                {schedule.shift.start_time.substring(0, 5)} - {schedule.shift.end_time.substring(0, 5)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => openSingleModal(row.employee, day, null)}
                                                        className="w-full py-3.5 rounded-lg border border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-300 hover:text-blue-600 transition flex items-center justify-center"
                                                        title="Tetapkan Shift"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Single Schedule Modal */}
            {singleModalOpen && selectedSlot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSingleModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">Atur Jadwal Shift</h2>
                                <p className="text-xs text-slate-500">
                                    {selectedSlot.employee.full_name} • {new Date(selectedSlot.day.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <button onClick={() => setSingleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitSingle} className="p-6 space-y-4">
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer mb-3">
                                    <input
                                        type="checkbox"
                                        checked={singleForm.data.is_day_off}
                                        onChange={(e) => singleForm.setData('is_day_off', e.target.checked)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs font-bold text-slate-700">Tandai sebagai Hari Libur</span>
                                </label>
                            </div>

                            {!singleForm.data.is_day_off && (
                                <div>
                                    <label htmlFor="shift-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Pilih Shift Kerja <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        id="shift-select"
                                        value={singleForm.data.shift_id}
                                        onChange={(e) => singleForm.setData('shift_id', e.target.value)}
                                        className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                        required={!singleForm.data.is_day_off}
                                    >
                                        {shifts.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} ({s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)} WIB)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label htmlFor="notes-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Catatan Jadwal (Opsional)
                                </label>
                                <input
                                    id="notes-input"
                                    type="text"
                                    value={singleForm.data.notes}
                                    onChange={(e) => singleForm.setData('notes', e.target.value)}
                                    placeholder="Contoh: Rolling kasir, lembur promo..."
                                    className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                {selectedSlot.existingSchedule ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSingleModalOpen(false);
                                            handleDeleteSchedule(selectedSlot.existingSchedule.id);
                                        }}
                                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Hapus</span>
                                    </button>
                                ) : <div></div>}

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSingleModalOpen(false)}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={singleForm.processing}
                                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Simpan</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Assignment Modal */}
            {bulkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setBulkModalOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Penugasan Shift Massal</h2>
                                <p className="text-xs text-slate-500">Terapkan jadwal shift secara serentak ke banyak karyawan</p>
                            </div>
                            <button onClick={() => setBulkModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitBulk} className="p-6 space-y-4 overflow-y-auto flex-1">
                            {/* Employee Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Pilih Karyawan ({bulkForm.data.employee_ids.length} dipilih) <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={toggleSelectAllEmployees}
                                        className="text-xs text-blue-600 font-semibold hover:underline"
                                    >
                                        {bulkForm.data.employee_ids.length === allEmployees.length ? 'Batalkan Semua' : 'Pilih Semua'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
                                    {allEmployees.map((emp) => {
                                        const isChecked = bulkForm.data.employee_ids.includes(emp.id);
                                        return (
                                            <label
                                                key={emp.id}
                                                className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition ${
                                                    isChecked ? 'bg-blue-50 border-blue-200 text-blue-900 font-medium' : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        const current = [...bulkForm.data.employee_ids];
                                                        const i = current.indexOf(emp.id);
                                                        if (i > -1) current.splice(i, 1);
                                                        else current.push(emp.id);
                                                        bulkForm.setData('employee_ids', current);
                                                    }}
                                                    className="rounded border-slate-300 text-blue-600"
                                                />
                                                <span className="truncate">{emp.full_name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                {bulkForm.errors.employee_ids && (
                                    <p className="mt-1 text-xs text-rose-600">{bulkForm.errors.employee_ids}</p>
                                )}
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="bulk-start-date" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Mulai Tanggal <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        id="bulk-start-date"
                                        type="date"
                                        value={bulkForm.data.start_date}
                                        onChange={(e) => bulkForm.setData('start_date', e.target.value)}
                                        className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="bulk-end-date" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Sampai Tanggal <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        id="bulk-end-date"
                                        type="date"
                                        value={bulkForm.data.end_date}
                                        onChange={(e) => bulkForm.setData('end_date', e.target.value)}
                                        className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Days of week selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Berlaku Pada Hari <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                                    {[
                                        { num: 1, label: 'Sen' },
                                        { num: 2, label: 'Sel' },
                                        { num: 3, label: 'Rab' },
                                        { num: 4, label: 'Kam' },
                                        { num: 5, label: 'Jum' },
                                        { num: 6, label: 'Sab' },
                                        { num: 0, label: 'Min' },
                                    ].map((d) => {
                                        const isSel = bulkForm.data.days_of_week.includes(d.num);
                                        return (
                                            <button
                                                key={d.num}
                                                type="button"
                                                onClick={() => toggleDayOfWeek(d.num)}
                                                className={`py-2 rounded-lg font-bold border transition ${
                                                    isSel
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                                }`}
                                            >
                                                {d.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Shift to assign */}
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer mb-2">
                                    <input
                                        type="checkbox"
                                        checked={bulkForm.data.is_day_off}
                                        onChange={(e) => bulkForm.setData('is_day_off', e.target.checked)}
                                        className="rounded border-slate-300 text-blue-600"
                                    />
                                    <span className="text-xs font-bold text-slate-700">Tandai sebagai Hari Libur Massal</span>
                                </label>

                                {!bulkForm.data.is_day_off && (
                                    <div className="mt-2">
                                        <label htmlFor="bulk-shift-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Shift Kerja yang Diterapkan <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            id="bulk-shift-select"
                                            value={bulkForm.data.shift_id}
                                            onChange={(e) => bulkForm.setData('shift_id', e.target.value)}
                                            className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {shifts.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name} ({s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)} WIB)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setBulkModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={bulkForm.processing || bulkForm.data.employee_ids.length === 0}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition disabled:opacity-60"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{bulkForm.processing ? 'Menerapkan...' : 'Terapkan Jadwal Massal'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
