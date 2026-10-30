import React from 'react';

export default function StatusBadge({ status, className = '' }) {
    const config = {
        // Attendance statuses
        present: {
            label: 'Tepat Waktu',
            bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            dot: 'bg-emerald-500',
        },
        late: {
            label: 'Terlambat',
            bg: 'bg-amber-50 text-amber-700 border-amber-200',
            dot: 'bg-amber-500',
        },
        absent: {
            label: 'Tidak Hadir',
            bg: 'bg-rose-50 text-rose-700 border-rose-200',
            dot: 'bg-rose-500',
        },
        on_leave: {
            label: 'Izin',
            bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            dot: 'bg-indigo-500',
        },
        sick: {
            label: 'Sakit',
            bg: 'bg-purple-50 text-purple-700 border-purple-200',
            dot: 'bg-purple-500',
        },
        unscheduled: {
            label: 'Tanpa Jadwal',
            bg: 'bg-slate-100 text-slate-700 border-slate-200',
            dot: 'bg-slate-500',
        },

        // Leave request statuses
        pending: {
            label: 'Menunggu',
            bg: 'bg-amber-50 text-amber-700 border-amber-200',
            dot: 'bg-amber-500',
        },
        approved: {
            label: 'Disetujui',
            bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            dot: 'bg-emerald-500',
        },
        rejected: {
            label: 'Ditolak',
            bg: 'bg-rose-50 text-rose-700 border-rose-200',
            dot: 'bg-rose-500',
        },

        // Employee status
        active: {
            label: 'Aktif',
            bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            dot: 'bg-emerald-500',
        },
        inactive: {
            label: 'Nonaktif',
            bg: 'bg-slate-100 text-slate-600 border-slate-200',
            dot: 'bg-slate-400',
        },
    };

    const item = config[status] || {
        label: status || 'Unknown',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${item.bg} ${className}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`}></span>
            {item.label}
        </span>
    );
}
