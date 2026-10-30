import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    ExternalLink,
    X,
    Save,
    RotateCcw,
} from 'lucide-react';

export default function Index({ leaveRequests, filters, stats }) {
    const [search, setSearch] = useState(filters.search || '');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);

    const reviewForm = useForm({
        status: 'approved',
        review_notes: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.leaves.index'), { ...filters, search }, { preserveState: true });
    };

    const handleStatusFilter = (status) => {
        router.get(route('admin.leaves.index'), { ...filters, status, page: 1 }, { preserveState: true });
    };

    const openReviewModal = (leave, actionStatus) => {
        setSelectedLeave(leave);
        reviewForm.setData({
            status: actionStatus,
            review_notes: '',
        });
        setReviewModalOpen(true);
    };

    const submitReview = (e) => {
        e.preventDefault();
        reviewForm.patch(route('admin.leaves.update-status', selectedLeave.id), {
            onSuccess: () => setReviewModalOpen(false),
        });
    };

    return (
        <AppLayout
            headerTitle="Pengajuan Izin & Sakit Karyawan"
            headerSubtitle="Verifikasi permohonan izin pribadi, sakit, atau keperluan mendesak karyawan"
        >
            <Head title="Pengajuan Izin & Sakit" />

            {/* Quick Stat Bar */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div
                    onClick={() => handleStatusFilter('pending')}
                    className={`cursor-pointer bg-white p-4 rounded-xl border transition ${
                        filters.status === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-700 uppercase">Menunggu Review</span>
                        <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800 mt-2">{stats.pending}</div>
                </div>

                <div
                    onClick={() => handleStatusFilter('approved')}
                    className={`cursor-pointer bg-white p-4 rounded-xl border transition ${
                        filters.status === 'approved' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-700 uppercase">Disetujui</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800 mt-2">{stats.approved}</div>
                </div>

                <div
                    onClick={() => handleStatusFilter('rejected')}
                    className={`cursor-pointer bg-white p-4 rounded-xl border transition ${
                        filters.status === 'rejected' ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-rose-700 uppercase">Ditolak</span>
                        <XCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800 mt-2">{stats.rejected}</div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearch} className="w-full sm:w-80 relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama atau kode karyawan..."
                        className="w-full pl-9 pr-3.5 py-2 text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </form>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Status:</span>
                    {['all', 'pending', 'approved', 'rejected'].map((st) => (
                        <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                                filters.status === st ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {st === 'all' ? 'Semua' : st === 'pending' ? 'Menunggu' : st === 'approved' ? 'Disetujui' : 'Ditolak'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leave Requests Table */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                <th className="py-3 px-4">Karyawan</th>
                                <th className="py-3 px-4">Jenis</th>
                                <th className="py-3 px-4">Periode Tanggal</th>
                                <th className="py-3 px-4">Alasan</th>
                                <th className="py-3 px-4">Lampiran</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Catatan Review</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leaveRequests.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-12 text-center text-slate-400">
                                        Tidak ada permohonan izin atau sakit.
                                    </td>
                                </tr>
                            ) : (
                                leaveRequests.data.map((leave) => (
                                    <tr key={leave.id} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-slate-900">{leave.employee?.full_name}</div>
                                            <div className="text-[11px] text-slate-500">{leave.employee?.employee_code} • {leave.employee?.position}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                                                {leave.type === 'sick' ? 'Sakit' : leave.type === 'leave' ? 'Izin' : 'Lainnya'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-800 whitespace-nowrap">
                                            {new Date(leave.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} s/d {new Date(leave.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 max-w-xs">
                                            {leave.reason}
                                        </td>
                                        <td className="py-3 px-4">
                                            {leave.attachment ? (
                                                <a
                                                    href={`/storage/${leave.attachment}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                                                >
                                                    <span>Lihat Dokumen</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <StatusBadge status={leave.status} />
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                                            {leave.review_notes || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {leave.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openReviewModal(leave, 'approved')}
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                                                    >
                                                        Setujui
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openReviewModal(leave, 'rejected')}
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-[11px] italic">Selesai</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {leaveRequests.links && leaveRequests.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Menampilkan {leaveRequests.from || 0} - {leaveRequests.to || 0} dari {leaveRequests.total} data</span>
                        <div className="flex items-center gap-1">
                            {leaveRequests.links.map((link, idx) => (
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

            {/* Review Decision Modal */}
            {reviewModalOpen && selectedLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReviewModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">
                                    {reviewForm.data.status === 'approved' ? 'Persetujuan Izin / Sakit' : 'Penolakan Pengajuan Izin'}
                                </h2>
                                <p className="text-xs text-slate-500">
                                    {selectedLeave.employee?.full_name} • {selectedLeave.reason}
                                </p>
                            </div>
                            <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitReview} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Keputusan Admin <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={reviewForm.data.status}
                                    onChange={(e) => reviewForm.setData('status', e.target.value)}
                                    className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="approved">Setujui Permohonan (Ubah Kehadiran jadi Izin Sah)</option>
                                    <option value="rejected">Tolak Permohonan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Catatan / Alasan Keputusan (Opsional)
                                </label>
                                <textarea
                                    value={reviewForm.data.review_notes}
                                    onChange={(e) => reviewForm.setData('review_notes', e.target.value)}
                                    rows={3}
                                    placeholder="Contoh: Disetujui, shift pengganti telah disiapkan..."
                                    className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                ></textarea>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setReviewModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={reviewForm.processing}
                                    className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition disabled:opacity-60 ${
                                        reviewForm.data.status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                                    }`}
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{reviewForm.processing ? 'Menyimpan...' : 'Konfirmasi Keputusan'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
