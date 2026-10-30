<?php

namespace App\Services;

use App\Models\StoreSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportService
{
    /**
     * Export attendance recap to Excel (.xlsx)
     */
    public function exportRecapExcel($attendances, array $filters, StoreSetting $store): StreamedResponse
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Rekap Absensi');

        // Store Header
        $sheet->mergeCells('A1:L1');
        $sheet->setCellValue('A1', strtoupper($store->store_name));
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FF1E3A8A'));
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->mergeCells('A2:L2');
        $sheet->setCellValue('A2', 'LAPORAN REKAPITULASI ABSENSI KARYAWAN');
        $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(13);
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $periodText = 'Periode: ' . ($filters['start_date'] ?? 'Semua') . ' s/d ' . ($filters['end_date'] ?? 'Semua');
        $sheet->mergeCells('A3:L3');
        $sheet->setCellValue('A3', $periodText . ' | Dicetak pada: ' . Carbon::now('Asia/Jakarta')->translatedFormat('d F Y H:i') . ' WIB');
        $sheet->getStyle('A3')->getFont()->setSize(10)->setItalic(true);
        $sheet->getStyle('A3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Table Header
        $headers = [
            'No.', 'Tanggal', 'Kode', 'Nama Karyawan', 'Jabatan', 
            'Shift', 'Jam Masuk', 'Jam Pulang', 'Status', 
            'Terlambat (mnt)', 'Durasi Kerja', 'Keterangan'
        ];

        $headerRow = 5;
        foreach ($headers as $colIdx => $header) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx + 1);
            $sheet->setCellValue($colLetter . $headerRow, $header);
        }

        // Header style
        $headerRange = 'A5:L5';
        $sheet->getStyle($headerRange)->getFont()->setBold(true)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FFFFFFFF'));
        $sheet->getStyle($headerRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FF1E40AF'); // Navy blue
        $sheet->getStyle($headerRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getRowDimension($headerRow)->setRowHeight(26);

        // Fill data
        $row = 6;
        $no = 1;
        $totalLateMinutes = 0;
        $totalWorkMinutes = 0;

        foreach ($attendances as $att) {
            $inTime = $att->check_in_time ? Carbon::parse($att->check_in_time)->format('H:i') : '-';
            $outTime = $att->check_out_time ? Carbon::parse($att->check_out_time)->format('H:i') : '-';
            $durationFormatted = $att->work_duration_minutes > 0 
                ? floor($att->work_duration_minutes / 60) . 'j ' . ($att->work_duration_minutes % 60) . 'm' 
                : '-';

            $totalLateMinutes += (int) $att->late_minutes;
            $totalWorkMinutes += (int) $att->work_duration_minutes;

            $sheet->setCellValue('A' . $row, $no++);
            $sheet->setCellValue('B' . $row, Carbon::parse($att->date)->format('d/m/Y'));
            $sheet->setCellValue('C' . $row, $att->employee?->employee_code ?? '-');
            $sheet->setCellValue('D' . $row, $att->employee?->full_name ?? '-');
            $sheet->setCellValue('E' . $row, $att->employee?->position ?? '-');
            $sheet->setCellValue('F' . $row, $att->shift_name ?? '-');
            $sheet->setCellValue('G' . $row, $inTime);
            $sheet->setCellValue('H' . $row, $outTime);
            $sheet->setCellValue('I' . $row, $att->status_label);
            $sheet->setCellValue('J' . $row, $att->late_minutes ?: 0);
            $sheet->setCellValue('K' . $row, $durationFormatted);
            $sheet->setCellValue('L' . $row, $att->check_in_notes ?: ($att->check_out_notes ?: '-'));

            // Alternating row background
            if ($row % 2 == 0) {
                $sheet->getStyle("A{$row}:L{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFF8FAFC');
            }

            // Alignments
            $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("C{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("G{$row}:H{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("I{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("J{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("K{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

            $row++;
        }

        // Summary Row
        $summaryRow = $row;
        $sheet->mergeCells("A{$summaryRow}:I{$summaryRow}");
        $sheet->setCellValue("A{$summaryRow}", "TOTAL (" . count($attendances) . " Baris)");
        $sheet->setCellValue("J{$summaryRow}", $totalLateMinutes);
        $totalWorkHours = round($totalWorkMinutes / 60, 1);
        $sheet->setCellValue("K{$summaryRow}", "{$totalWorkHours} jam");
        $sheet->setCellValue("L{$summaryRow}", "");

        $sheet->getStyle("A{$summaryRow}:L{$summaryRow}")->getFont()->setBold(true);
        $sheet->getStyle("A{$summaryRow}:L{$summaryRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFE2E8F0');
        $sheet->getStyle("A{$summaryRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("J{$summaryRow}:K{$summaryRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        // Borders
        $allBorders = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'FFCBD5E1'],
                ],
            ],
        ];
        $sheet->getStyle("A5:L{$summaryRow}")->applyFromArray($allBorders);

        // Signatures
        $sigRow = $summaryRow + 3;
        $sheet->setCellValue("B{$sigRow}", "Dibuat Oleh,");
        $sheet->setCellValue("K{$sigRow}", "Mengetahui,");
        $sigNameRow = $sigRow + 4;
        $sheet->setCellValue("B{$sigNameRow}", "( Admin Toko )");
        $sheet->setCellValue("K{$sigNameRow}", "( Pemilik Toko )");
        $sheet->getStyle("B{$sigRow}:K{$sigNameRow}")->getFont()->setBold(true);

        // Auto width
        foreach (range(1, 12) as $colIdx) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $filename = 'Rekap_Absensi_' . Carbon::now('Asia/Jakarta')->format('Ymd_His') . '.xlsx';

        return new StreamedResponse(
            function () use ($writer) {
                $writer->save('php://output');
            },
            200,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Cache-Control' => 'max-age=0',
            ]
        );
    }

    /**
     * Export monthly report to Excel (.xlsx)
     */
    public function exportMonthlyExcel(array $reportData, StoreSetting $store): StreamedResponse
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Laporan Bulanan');

        // Header
        $sheet->mergeCells('A1:K1');
        $sheet->setCellValue('A1', strtoupper($store->store_name));
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FF1E3A8A'));
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->mergeCells('A2:K2');
        $sheet->setCellValue('A2', 'LAPORAN EVALUASI & REKAPITULASI BULANAN: ' . strtoupper($reportData['month_name']));
        $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(13);
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->mergeCells('A3:K3');
        $sheet->setCellValue('A3', 'Dicetak pada: ' . Carbon::now('Asia/Jakarta')->translatedFormat('d F Y H:i') . ' WIB');
        $sheet->getStyle('A3')->getFont()->setSize(10)->setItalic(true);
        $sheet->getStyle('A3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Table Header
        $headers = [
            'No.', 'Kode', 'Nama Karyawan', 'Jabatan', 
            'Jadwal (Hari)', 'Hadir', 'Tepat Waktu', 'Terlambat', 
            'Menit Telat', 'Izin / Sakit', 'Kehadiran (%)'
        ];

        $headerRow = 5;
        foreach ($headers as $colIdx => $header) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx + 1);
            $sheet->setCellValue($colLetter . $headerRow, $header);
        }

        $headerRange = 'A5:K5';
        $sheet->getStyle($headerRange)->getFont()->setBold(true)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FFFFFFFF'));
        $sheet->getStyle($headerRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FF1E40AF');
        $sheet->getStyle($headerRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getRowDimension($headerRow)->setRowHeight(26);

        $row = 6;
        $no = 1;
        foreach ($reportData['employee_recaps'] as $emp) {
            $leaveSick = ($emp['leave_days'] + $emp['sick_days']);

            $sheet->setCellValue('A' . $row, $no++);
            $sheet->setCellValue('B' . $row, $emp['employee_code']);
            $sheet->setCellValue('D' . $row, $emp['position']);
            $sheet->setCellValue('C' . $row, $emp['full_name']);
            $sheet->setCellValue('E' . $row, $emp['scheduled_days']);
            $sheet->setCellValue('F' . $row, $emp['attended_days']);
            $sheet->setCellValue('G' . $row, $emp['on_time_days']);
            $sheet->setCellValue('H' . $row, $emp['late_days']);
            $sheet->setCellValue('I' . $row, $emp['late_minutes']);
            $sheet->setCellValue('J' . $row, $leaveSick);
            $sheet->setCellValue('K' . $row, $emp['attendance_rate'] . '%');

            if ($row % 2 == 0) {
                $sheet->getStyle("A{$row}:K{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFF8FAFC');
            }

            $sheet->getStyle("A{$row}:B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("E{$row}:K{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

            $row++;
        }

        // Summary Row
        $summaryRow = $row;
        $s = $reportData['summary'];
        $sheet->mergeCells("A{$summaryRow}:D{$summaryRow}");
        $sheet->setCellValue("A{$summaryRow}", "TOTAL KESELURUHAN");
        $sheet->setCellValue("E{$summaryRow}", $s['total_scheduled']);
        $sheet->setCellValue("F{$summaryRow}", $s['total_attended']);
        $sheet->setCellValue("G{$summaryRow}", $s['total_on_time']);
        $sheet->setCellValue("H{$summaryRow}", $s['total_late']);
        $sheet->setCellValue("I{$summaryRow}", $s['total_late_minutes']);
        $sheet->setCellValue("J{$summaryRow}", $s['total_leave'] + $s['total_sick']);
        $sheet->setCellValue("K{$summaryRow}", $s['overall_attendance_rate'] . '%');

        $sheet->getStyle("A{$summaryRow}:K{$summaryRow}")->getFont()->setBold(true);
        $sheet->getStyle("A{$summaryRow}:K{$summaryRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFE2E8F0');
        $sheet->getStyle("A{$summaryRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("E{$summaryRow}:K{$summaryRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        $allBorders = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => 'FFCBD5E1'],
                ],
            ],
        ];
        $sheet->getStyle("A5:K{$summaryRow}")->applyFromArray($allBorders);

        // Signatures
        $sigRow = $summaryRow + 3;
        $sheet->setCellValue("B{$sigRow}", "Dibuat Oleh,");
        $sheet->setCellValue("J{$sigRow}", "Mengetahui,");
        $sigNameRow = $sigRow + 4;
        $sheet->setCellValue("B{$sigNameRow}", "( Admin Toko )");
        $sheet->setCellValue("J{$sigNameRow}", "( Pemilik Toko )");
        $sheet->getStyle("B{$sigRow}:J{$sigNameRow}")->getFont()->setBold(true);

        foreach (range(1, 11) as $colIdx) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $filename = 'Laporan_Bulanan_' . $reportData['year'] . '_' . sprintf('%02d', $reportData['month']) . '.xlsx';

        return new StreamedResponse(
            function () use ($writer) {
                $writer->save('php://output');
            },
            200,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Cache-Control' => 'max-age=0',
            ]
        );
    }

    /**
     * Export attendance recap to PDF
     */
    public function exportRecapPdf($attendances, array $filters, StoreSetting $store)
    {
        $data = [
            'store' => $store,
            'attendances' => $attendances,
            'filters' => $filters,
            'generated_at' => Carbon::now('Asia/Jakarta')->translatedFormat('d F Y H:i') . ' WIB',
        ];

        $pdf = Pdf::loadView('exports.recap_pdf', $data);
        $pdf->setPaper('a4', 'landscape');
        
        $filename = 'Rekap_Absensi_' . Carbon::now('Asia/Jakarta')->format('Ymd_His') . '.pdf';
        return $pdf->download($filename);
    }

    /**
     * Export monthly report to PDF
     */
    public function exportMonthlyPdf(array $reportData, StoreSetting $store)
    {
        $data = [
            'store' => $store,
            'report' => $reportData,
            'generated_at' => Carbon::now('Asia/Jakarta')->translatedFormat('d F Y H:i') . ' WIB',
        ];

        $pdf = Pdf::loadView('exports.monthly_pdf', $data);
        $pdf->setPaper('a4', 'landscape');

        $filename = 'Laporan_Bulanan_' . $reportData['year'] . '_' . sprintf('%02d', $reportData['month']) . '.pdf';
        return $pdf->download($filename);
    }
}
