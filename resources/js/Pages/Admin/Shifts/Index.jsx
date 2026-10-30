import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Plus,
    Clock,
    Edit,
    Power,
    CheckCircle2,
    X,
    Save,
    AlertCircle,
    Moon,
} from 'lucide-react';

export default function Index({ shifts }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        code: '',
        start_time: '08:00',
        end_time: '16:00',
        break_minutes: 60,
        late_tolerance_minutes: 15,
        color: '#2563EB',
        is_active: true,
    });

    const openCreateModal = () => {
        setEditingShift(null);
        reset();
        setModalOpen(true);
    };

    const openEditModal = (shift) => {
        setEditingShift(shift);
        setData({
            name: shift.name,
            code: shift.code,
            start_time: shift.start_time.substring(0, 5),
            end_time: shift.end_time.substring(0, 5),
            break_minutes: shift.break_minutes,
            late_tolerance_minutes: shift.late_tolerance_minutes,
            color: shift.color,
            is_active: shift.is_active,
        });
        setModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingShift) {
            put(route('admin.shifts.update', editingShift.id), {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            post(route('admin.shifts.store'), {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleToggleActive = (shift) => {
        const action = shift.is_active ? 'menonaktifkan' : 'mengaktifkan';
        if (confirm(`Apakah Anda yakin ingin ${action} shift ${shift.name}?`)) {
            router.post(route('admin.shifts.toggle-active', shift.id));
        }
    };

    return (
        <AppLayout
            headerTitle="Pengaturan Shift Kerja Toko"
            headerSubtitle="Atur jam mulai, jam selesai, durasi istirahat, toleransi keterlambatan, dan pergantian shift"
            actions={
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Shift</span>
                </button>
            }
        >
            <Head title="Manajemen Shift Kerja" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shifts.map((shift) => (
                    <div
                        key={shift.id}
                        className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition relative flex flex-col justify-between ${
                            shift.is_active ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50/50 opacity-80'
                        }`}
                    >
                        <div>
                            {/* Color Strip & Status */}
                            <div className="flex items-center justify-between mb-4">
                                <span
                                    className="px-2.5 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider font-mono"
                                    style={{ backgroundColor: shift.color }}
                                >
                                    {shift.code}
                                </span>
                                <div className="flex items-center gap-2">
                                    {shift.is_overnight && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                            <Moon className="w-3 h-3" />
                                            Lintas Malam
                                        </span>
                                    )}
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                            shift.is_active
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}
                                    >
                                        {shift.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-lg font-bold text-slate-900">{shift.name}</h2>
                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-2xl font-mono font-bold text-slate-800">
                                    {shift.start_time.substring(0, 5)} - {shift.end_time.substring(0, 5)}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">WIB</span>
                            </div>

                            {/* Shift Details */}
                            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Toleransi Keterlambatan:</span>
                                    <span className="font-semibold text-amber-700">{shift.late_tolerance_minutes} Menit</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Waktu Istirahat:</span>
                                    <span className="font-semibold text-slate-700">{shift.break_minutes} Menit</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Jadwal Terkait:</span>
                                    <span className="font-semibold text-blue-700">{shift.schedules_count} Jadwal Terbit</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => handleToggleActive(shift)}
                                className={`text-xs font-semibold flex items-center gap-1.5 transition ${
                                    shift.is_active ? 'text-slate-500 hover:text-rose-600' : 'text-slate-500 hover:text-emerald-600'
                                }`}
                            >
                                <Power className="w-3.5 h-3.5" />
                                <span>{shift.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => openEditModal(shift)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 transition flex items-center gap-1"
                            >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit Shift</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Create / Edit Shift */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h2 className="text-base font-bold text-slate-900">
                                {editingShift ? 'Edit Shift Kerja' : 'Tambah Shift Kerja Baru'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Nama Shift <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Shift Pagi, Shift Siang..."
                                    className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Kode Shift <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        placeholder="PAGI / S1"
                                        className="w-full text-xs font-mono border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 uppercase"
                                        required
                                    />
                                    {errors.code && <p className="mt-1 text-xs text-rose-600">{errors.code}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Warna Badge
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                            className="w-10 h-9 p-1 border-slate-300 rounded-xl cursor-pointer"
                                        />
                                        <span className="text-xs font-mono text-slate-600">{data.color}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Jam Mulai (WIB) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className="w-full text-xs border-slate-300 rounded-xl font-mono focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.start_time && <p className="mt-1 text-xs text-rose-600">{errors.start_time}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Jam Selesai (WIB) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        className="w-full text-xs border-slate-300 rounded-xl font-mono focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.end_time && <p className="mt-1 text-xs text-rose-600">{errors.end_time}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Toleransi Telat (Menit) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="120"
                                        value={data.late_tolerance_minutes}
                                        onChange={(e) => setData('late_tolerance_minutes', e.target.value)}
                                        className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.late_tolerance_minutes && <p className="mt-1 text-xs text-rose-600">{errors.late_tolerance_minutes}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Waktu Istirahat (Menit) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="240"
                                        value={data.break_minutes}
                                        onChange={(e) => setData('break_minutes', e.target.value)}
                                        className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.break_minutes && <p className="mt-1 text-xs text-rose-600">{errors.break_minutes}</p>}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition disabled:opacity-60"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{processing ? 'Menyimpan...' : 'Simpan Shift'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
