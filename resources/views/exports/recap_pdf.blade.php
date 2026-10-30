<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Absensi Karyawan</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            color: #1e293b;
            margin: 15px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            color: #1e3a8a;
            text-transform: uppercase;
        }
        .header h2 {
            margin: 3px 0;
            font-size: 13px;
            color: #334155;
        }
        .header p {
            margin: 2px 0;
            font-size: 10px;
            color: #64748b;
        }
        .meta-info {
            margin-bottom: 12px;
            font-size: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        th {
            background-color: #1e40af;
            color: #ffffff;
            font-weight: bold;
            padding: 6px 4px;
            text-align: center;
            border: 1px solid #cbd5e1;
            font-size: 10px;
        }
        td {
            padding: 5px 4px;
            border: 1px solid #cbd5e1;
            font-size: 10px;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .badge {
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 9px;
            display: inline-block;
        }
        .badge-present { background-color: #d1fae5; color: #065f46; }
        .badge-late { background-color: #fef3c7; color: #92400e; }
        .badge-absent { background-color: #fee2e2; color: #991b1b; }
        .badge-leave { background-color: #e0e7ff; color: #3730a3; }
        .badge-sick { background-color: #fce7f3; color: #9d174d; }
        .badge-unscheduled { background-color: #f1f5f9; color: #475569; }
        .total-row {
            background-color: #e2e8f0 !important;
            font-weight: bold;
        }
        .footer-sig {
            margin-top: 30px;
            width: 100%;
        }
        .footer-sig td {
            border: none;
            padding: 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $store->store_name }}</h1>
        <h2>LAPORAN REKAPITULASI KEHADIRAN KARYAWAN</h2>
        <p>{{ $store->address }} | Telp: {{ $store->phone ?? '-' }}</p>
    </div>

    <div class="meta-info">
        <strong>Periode:</strong> {{ $filters['start_date'] ?? 'Semua' }} s/d {{ $filters['end_date'] ?? 'Semua' }} |
        <strong>Status Filter:</strong> {{ !empty($filters['status']) && $filters['status'] !== 'all' ? ucfirst($filters['status']) : 'Semua Status' }} |
        <strong>Dicetak:</strong> {{ $generated_at }}
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 25px;">No</th>
                <th style="width: 65px;">Tanggal</th>
                <th style="width: 55px;">Kode</th>
                <th>Nama Karyawan</th>
                <th>Jabatan</th>
                <th>Shift</th>
                <th style="width: 50px;">Masuk</th>
                <th style="width: 50px;">Pulang</th>
                <th style="width: 75px;">Status</th>
                <th style="width: 55px;">Telat (m)</th>
                <th style="width: 60px;">Durasi</th>
                <th>Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totLate = 0;
                $totWorkMin = 0;
            @endphp
            @forelse($attendances as $idx => $att)
                @php
                    $totLate += (int) $att->late_minutes;
                    $totWorkMin += (int) $att->work_duration_minutes;
                    $inTime = $att->check_in_time ? \Carbon\Carbon::parse($att->check_in_time)->format('H:i') : '-';
                    $outTime = $att->check_out_time ? \Carbon\Carbon::parse($att->check_out_time)->format('H:i') : '-';
                    $dur = $att->work_duration_minutes > 0 ? floor($att->work_duration_minutes / 60) . 'j ' . ($att->work_duration_minutes % 60) . 'm' : '-';
                @endphp
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td class="text-center">{{ \Carbon\Carbon::parse($att->date)->format('d/m/Y') }}</td>
                    <td class="text-center">{{ $att->employee?->employee_code ?? '-' }}</td>
                    <td>{{ $att->employee?->full_name ?? '-' }}</td>
                    <td>{{ $att->employee?->position ?? '-' }}</td>
                    <td>{{ $att->shift_name ?? '-' }}</td>
                    <td class="text-center">{{ $inTime }}</td>
                    <td class="text-center">{{ $outTime }}</td>
                    <td class="text-center">
                        <span class="badge badge-{{ $att->status }}">{{ $att->status_label }}</span>
                    </td>
                    <td class="text-right">{{ $att->late_minutes ?: 0 }}</td>
                    <td class="text-right">{{ $dur }}</td>
                    <td>{{ $att->check_in_notes ?: ($att->check_out_notes ?: '-') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="12" class="text-center" style="padding: 15px;">Tidak ada data absensi untuk filter yang dipilih.</td>
                </tr>
            @endforelse
            @if(count($attendances) > 0)
                <tr class="total-row">
                    <td colspan="9" class="text-right">TOTAL ({{ count($attendances) }} Data)</td>
                    <td class="text-right">{{ $totLate }} mnt</td>
                    <td class="text-right">{{ round($totWorkMin / 60, 1) }} jam</td>
                    <td></td>
                </tr>
            @endif
        </tbody>
    </table>

    <table class="footer-sig">
        <tr>
            <td style="width: 30%; text-align: center;">
                <p>Dibuat Oleh,</p>
                <br><br><br>
                <p><strong>( Admin Toko )</strong></p>
            </td>
            <td style="width: 40%;"></td>
            <td style="width: 30%; text-align: center;">
                <p>Mengetahui,</p>
                <br><br><br>
                <p><strong>( Pemilik Toko )</strong></p>
            </td>
        </tr>
    </table>
</body>
</html>
