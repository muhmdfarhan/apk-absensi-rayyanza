import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Coffee,
    Sparkles,
    Shield
} from 'lucide-react';

export default function ScheduleIndex({ days, periodLabel, filters }) {
    const changeWeek = (offsetDays) => {
        const currentStart = new Date(filters.start_date);
        currentStart.setDate(currentStart.getDate() + offsetDays);
        const yyyy = currentStart.getFullYear();
        const mm = String(currentStart.getMonth() + 1).padStart(2, '0');
        const dd = String(currentStart.getDate()).padStart(2, '0');
        const newDate = `${yyyy}-${mm}-${dd}`;

        router.get(route('employee.schedules.index'), {
            start_date: newDate,
        }, { preserveState: true });
    };

    const goToCurrentWeek = () => {
        router.get(route('employee.schedules.index'), {});
    };

    return (
        <AppLayout
            title="Jadwal Shift Kerja"
            headerTitle="Jadwal Shift Kerja Saya"
            headerSubtitle={`Periode: ${periodLabel}`}
            actions={
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => changeWeek(-7)}
                        className="p-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition shadow-sm"
                        title="Minggu Sebelumnya"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={goToCurrentWeek}
                        className="px-3 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition shadow-sm"
                    >
                        Minggu Ini
                    </button>
                    <button
                        onClick={() => changeWeek(7)}
                        className="p-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition shadow-sm"
                        title="Minggu Berikutnya"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            }
        >
            <Head title="Jadwal Shift Kerja" />

            {/* Weekly Days Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
                {days.map((day, idx) => {
                    const sch = day.schedule;
                    const shift = sch?.shift;
                    const isDayOff = sch?.is_day_off;

                    return (
                        <div
                            key={idx}
                            className={`rounded-2xl border transition p-4 flex flex-col justify-between ${
                                day.is_today
                                    ? 'bg-navy-950 text-white border-navy-800 shadow-md ring-2 ring-navy-700'
                                    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm'
                            }`}
                        >
                            {/* Day Header */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`text-xs font-bold uppercase tracking-wider ${
                                            day.is_today ? 'text-emerald-400' : 'text-slate-500'
                                        }`}
                                    >
                                        {day.day_name}
                                    </span>
                                    {day.is_today && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                            HARI INI
                                        </span>
                                    )}
                                </div>
                                <div className="text-2xl font-black mt-1">
                                    {day.day_number} <span className="text-xs font-normal opacity-70">{day.month_name}</span>
                                </div>
                            </div>

                            {/* Shift Content */}
                            <div className="mt-6 pt-4 border-t border-slate-100/20">
                                {isDayOff ? (
                                    <div className="text-center py-3">
                                        <div
                                            className={`inline-flex p-2 rounded-xl mb-1.5 ${
                                                day.is_today ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            <Coffee className="w-5 h-5" />
                                        </div>
                                        <div className={`text-xs font-bold ${day.is_today ? 'text-slate-300' : 'text-slate-600'}`}>
                                            Libur (Day Off)
                                        </div>
                                        <div className="text-[10px] opacity-60">Tidak ada jam kerja</div>
                                    </div>
                                ) : shift ? (
                                    <div className="space-y-2">
                                        <div
                                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-center border"
                                            style={{
                                                backgroundColor: day.is_today ? `${shift.color || '#3b82f6'}30` : `${shift.color || '#3b82f6'}15`,
                                                borderColor: `${shift.color || '#3b82f6'}50`,
                                                color: day.is_today ? '#ffffff' : (shift.color || '#1e3a8a'),
                                            }}
                                        >
                                            {shift.name}
                                        </div>

                                        <div className="text-center">
                                            <div className="text-sm font-black font-mono">
                                                {shift.start_time?.substring(0, 5)} - {shift.end_time?.substring(0, 5)}
                                            </div>
                                            <div className="text-[10px] opacity-70 mt-0.5">
                                                Toleransi: {shift.late_tolerance_minutes}m • Istirahat: {shift.break_minutes}m
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <div className="text-xs font-medium text-slate-400">
                                            Belum Ada Jadwal
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Shift Rules & Policies Info Banner */}
            <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-5 text-slate-700 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-navy-800" />
                    Aturan & Kebijakan Shift Toko
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                    <li>Karyawan wajib melakukan absen masuk dan pulang sesuai jadwal shift yang tertera di atas.</li>
                    <li>Toleransi keterlambatan dihitung otomatis dari jam mulai shift resmi.</li>
                    <li>Jika memerlukan pergantian shift dengan rekan kerja, wajib berkoordinasi dengan pengelola toko/admin terlebih dahulu.</li>
                </ul>
            </div>
        </AppLayout>
    );
}
