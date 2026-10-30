<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Bulanan Absensi Karyawan</title>
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
        .summary-box {
            margin-bottom: 15px;
            width: 100%;
        }
        .summary-box td {
            background-color: #f1f5f9;
            padding: 8px 12px;
            border: 1px solid #cbd5e1;
            font-size: 10px;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        table.data-table th {
            background-color: #1e40af;
            color: #ffffff;
            font-weight: bold;
            padding: 6px 4px;
            text-align: center;
            border: 1px solid #cbd5e1;
            font-size: 10px;
        }
        table.data-table td {
            padding: 5px 4px;
            border: 1px solid #cbd5e1;
            font-size: 10px;
        }
        table.data-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
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
        <h2>LAPORAN EVALUASI & REKAPITULASI KEHADIRAN BULANAN</h2>
        <p>Bulan: <strong>{{ $report['month_name'] }}</strong> | Dicetak: {{ $generated_at }}</p>
    </div>

    @php $s = $report['summary']; @endphp
    <table class="summary-box">
        <tr>
            <td><strong>Total Karyawan:</strong> {{ $s['total_employees'] }} orang</td>
            <td><strong>Total Terjadwal:</strong> {{ $s['total_scheduled'] }} shift</td>
            <td><strong>Total Hadir:</strong> {{ $s['total_attended'] }} kali</td>
            <td><strong>Tingkat Kehadiran:</strong> <strong>{{ $s['overall_attendance_rate'] }}%</strong></td>
        </tr>
        <tr>
            <td><strong>Tepat Waktu:</strong> {{ $s['total_on_time'] }}</td>
            <td><strong>Terlambat:</strong> {{ $s['total_late'] }} ({{ $s['total_late_minutes'] }} mnt)</td>
            <td><strong>Izin / Sakit:</strong> {{ $s['total_leave'] + $s['total_sick'] }}</td>
            <td><strong>Tanpa Keterangan:</strong> {{ $s['total_absent'] }}</td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 25px;">No</th>
                <th style="width: 55px;">Kode</th>
                <th>Nama Karyawan</th>
                <th>Jabatan</th>
                <th style="width: 55px;">Jadwal</th>
                <th style="width: 50px;">Hadir</th>
                <th style="width: 50px;">Tepat</th>
                <th style="width: 50px;">Telat</th>
                <th style="width: 55px;">Telat (m)</th>
                <th style="width: 55px;">Izin/Skt</th>
                <th style="width: 50px;">Absen</th>
                <th style="width: 60px;">Total Jam</th>
                <th style="width: 60px;">Persen</th>
            </tr>
        </thead>
        <tbody>
            @forelse($report['employee_recaps'] as $idx => $emp)
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td class="text-center">{{ $emp['employee_code'] }}</td>
                    <td>{{ $emp['full_name'] }}</td>
                    <td>{{ $emp['position'] }}</td>
                    <td class="text-right">{{ $emp['scheduled_days'] }}</td>
                    <td class="text-right">{{ $emp['attended_days'] }}</td>
                    <td class="text-right">{{ $emp['on_time_days'] }}</td>
                    <td class="text-right">{{ $emp['late_days'] }}</td>
                    <td class="text-right">{{ $emp['late_minutes'] }}</td>
                    <td class="text-right">{{ $emp['leave_days'] + $emp['sick_days'] }}</td>
                    <td class="text-right">{{ $emp['absent_days'] }}</td>
                    <td class="text-right">{{ round($emp['duration_minutes'] / 60, 1) }} j</td>
                    <td class="text-right"><strong>{{ $emp['attendance_rate'] }}%</strong></td>
                </tr>
            @empty
                <tr>
                    <td colspan="13" class="text-center" style="padding: 15px;">Tidak ada data karyawan.</td>
                </tr>
            @endforelse
            @if(count($report['employee_recaps']) > 0)
                <tr class="total-row">
                    <td colspan="4" class="text-right">TOTAL KESELURUHAN</td>
                    <td class="text-right">{{ $s['total_scheduled'] }}</td>
                    <td class="text-right">{{ $s['total_attended'] }}</td>
                    <td class="text-right">{{ $s['total_on_time'] }}</td>
                    <td class="text-right">{{ $s['total_late'] }}</td>
                    <td class="text-right">{{ $s['total_late_minutes'] }}</td>
                    <td class="text-right">{{ $s['total_leave'] + $s['total_sick'] }}</td>
                    <td class="text-right">{{ $s['total_absent'] }}</td>
                    <td class="text-right">{{ $s['total_duration_hours'] }} j</td>
                    <td class="text-right"><strong>{{ $s['overall_attendance_rate'] }}%</strong></td>
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
