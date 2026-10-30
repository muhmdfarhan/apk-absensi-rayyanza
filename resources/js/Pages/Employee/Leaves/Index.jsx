import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    FileText,
    Plus,
    Calendar,
    Paperclip,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function LeavesIndex({ leaveRequests }) {
    const getTypeBadge = (type) => {
        switch (type) {
            case 'sick':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Sakit
                    </span>
                );
            case 'leave':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        Cuti / Izin
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        Lainnya
                    </span>
                );
        }
    };

    return (
        <AppLayout
            title="Pengajuan Izin"
            headerTitle="Pengajuan Izin & Sakit Saya"
            headerSubtitle="Daftar status pengajuan izin dan cuti kerja Anda"
            actions={
                <Link
                    href={route('employee.leaves.create')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Buat Pengajuan Baru
                </Link>
            }
        >
            <Head title="Pengajuan Izin" />

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/70">
                            <tr>
                                <th className="px-5 py-3.5 font-bold">Jenis</th>
                                <th className="px-5 py-3.5 font-bold">Periode Tanggal</th>
                                <th className="px-5 py-3.5 font-bold">Alasan</th>
                                <th className="px-5 py-3.5 font-bold text-center">Lampiran</th>
                                <th className="px-5 py-3.5 font-bold text-center">Status</th>
                                <th className="px-5 py-3.5 font-bold">Reviewer & Catatan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leaveRequests.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-5 py-12 text-center text-slate-400">
                                        Belum ada riwayat pengajuan izin atau sakit.
                                    </td>
                                </tr>
                            ) : (
                                leaveRequests.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                                        <td className="px-5 py-3.5">
                                            {getTypeBadge(item.type)}
                                        </td>
                                        <td className="px-5 py-3.5 font-semibold text-slate-900 text-xs">
                                            <div>
                                                {new Date(item.start_date).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}{' '}
                                                s/d{' '}
                                                {new Date(item.end_date).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                            <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                                                Diajukan: {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-700 text-xs max-w-xs">
                                            <p className="line-clamp-2">{item.reason}</p>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            {item.attachment ? (
                                                <a
                                                    href={`/storage/${item.attachment}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-navy-800 bg-navy-50 hover:bg-navy-100 transition"
                                                >
                                                    <Paperclip className="w-3.5 h-3.5" />
                                                    Lihat
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-slate-600">
                                            {item.approver ? (
                                                <div>
                                                    <div className="font-semibold text-slate-900">
                                                        {item.approver.name}
                                                    </div>
                                                    {item.review_notes && (
                                                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                                                            "{item.review_notes}"
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">Menunggu verifikasi admin</span>
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
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div>
                            Menampilkan {leaveRequests.from || 0} - {leaveRequests.to || 0} dari {leaveRequests.total} data
                        </div>
                        <div className="flex items-center gap-1">
                            {leaveRequests.links.map((link, idx) => (
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
