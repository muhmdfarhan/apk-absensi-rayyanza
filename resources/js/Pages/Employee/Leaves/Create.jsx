import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    FileText,
    Send,
    ArrowLeft,
    Calendar,
    Paperclip,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

export default function LeavesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        type: 'sick',
        start_date: '',
        end_date: '',
        reason: '',
        attachment: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('employee.leaves.store'));
    };

    return (
        <AppLayout
            title="Ajukan Izin / Sakit"
            headerTitle="Formulir Pengajuan Izin / Sakit"
            headerSubtitle="Kirim permohonan ketidakhadiran beserta dokumen pendukung untuk diverifikasi oleh admin"
            actions={
                <Link
                    href={route('employee.leaves.index')}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Daftar
                </Link>
            }
        >
            <Head title="Ajukan Izin / Sakit" />

            <div className="max-w-2xl mx-auto">
                <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
                    {/* Information alert */}
                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold">Ketentuan Pengajuan Izin / Sakit Toko:</span>
                            <ul className="list-disc list-inside mt-1 space-y-0.5 text-blue-800">
                                <li>Untuk pengajuan <strong>Sakit</strong> lebih dari 1 hari, wajib melampirkan Surat Keterangan Dokter.</li>
                                <li>Pengajuan Cuti / Izin disarankan diajukan minimal H-3 sebelum tanggal cuti.</li>
                                <li>Status kehadiran jadwal terkait akan otomatis diperbarui setelah disetujui Admin.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Type Selection */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                            Jenis Permohonan <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <label
                                className={`cursor-pointer p-4 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                                    data.type === 'sick'
                                        ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="type"
                                    value="sick"
                                    checked={data.type === 'sick'}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="sr-only"
                                />
                                <span className="text-sm font-bold">Sakit</span>
                                <span className="text-[10px] opacity-70">Dengan / tanpa surat dokter</span>
                            </label>

                            <label
                                className={`cursor-pointer p-4 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                                    data.type === 'leave'
                                        ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="type"
                                    value="leave"
                                    checked={data.type === 'leave'}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="sr-only"
                                />
                                <span className="text-sm font-bold">Cuti / Izin</span>
                                <span className="text-[10px] opacity-70">Keperluan pribadi / keluarga</span>
                            </label>

                            <label
                                className={`cursor-pointer p-4 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                                    data.type === 'other'
                                        ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="type"
                                    value="other"
                                    checked={data.type === 'other'}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className="sr-only"
                                />
                                <span className="text-sm font-bold">Lainnya</span>
                                <span className="text-[10px] opacity-70">Alasan mendesak khusus</span>
                            </label>
                        </div>
                        {errors.type && <p className="text-xs text-rose-500 mt-1">{errors.type}</p>}
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                Mulai Tanggal <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                                required
                            />
                            {errors.start_date && (
                                <p className="text-xs text-rose-500 mt-1">{errors.start_date}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                Sampai Tanggal <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.end_date}
                                min={data.start_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                                required
                            />
                            {errors.end_date && (
                                <p className="text-xs text-rose-500 mt-1">{errors.end_date}</p>
                            )}
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                            Alasan Lengkap <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            placeholder="Jelaskan alasan permohonan izin/sakit dengan detail..."
                            className="w-full text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                            required
                        />
                        {errors.reason && <p className="text-xs text-rose-500 mt-1">{errors.reason}</p>}
                    </div>

                    {/* Attachment */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                            Dokumen Pendukung / Surat Dokter (Opsional)
                        </label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-navy-500 transition">
                            <input
                                type="file"
                                id="fileInput"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => setData('attachment', e.target.files[0])}
                                className="hidden"
                            />
                            <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
                                <Paperclip className="w-8 h-8 text-slate-400 mb-1" />
                                <span className="text-xs font-semibold text-navy-800">
                                    {data.attachment ? data.attachment.name : 'Klik untuk mengunggah file'}
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5">
                                    Format: JPG, PNG, atau PDF (Maks. 3MB)
                                </span>
                            </label>
                        </div>
                        {errors.attachment && (
                            <p className="text-xs text-rose-500 mt-1">{errors.attachment}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <Link
                            href={route('employee.leaves.index')}
                            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition shadow-sm disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            {processing ? 'Mengirim...' : 'Kirim Pengajuan'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
