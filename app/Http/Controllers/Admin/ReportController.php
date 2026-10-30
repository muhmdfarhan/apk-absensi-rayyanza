<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\StoreSetting;
use App\Services\ExportService;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService,
        protected ExportService $exportService
    ) {}

    /**
     * Weekly evaluation report
     */
    public function weekly(Request $request): Response
    {
        $startDateStr = $request->input('start_date', Carbon::now('Asia/Jakarta')->startOfWeek()->toDateString());
        $startDate = Carbon::parse($startDateStr, 'Asia/Jakarta')->startOfWeek();
        $endDate = (clone $startDate)->endOfWeek();

        $employeeId = $request->input('employee_id');

        $reportData = $this->reportService->getWeeklyReport(
            $startDate->toDateString(),
            $endDate->toDateString(),
            ['employee_id' => $employeeId]
        );

        $employees = Employee::where('is_active', true)->orderBy('full_name')->get(['id', 'employee_code', 'full_name']);

        return Inertia::render('Admin/Reports/Weekly', [
            'report' => $reportData,
            'employees' => $employees,
            'filters' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'employee_id' => $employeeId,
            ],
            'periodLabel' => $startDate->translatedFormat('d M Y') . ' - ' . $endDate->translatedFormat('d M Y'),
        ]);
    }

    /**
     * Monthly evaluation report
     */
    public function monthly(Request $request): Response
    {
        $year = (int) $request->input('year', Carbon::now('Asia/Jakarta')->year);
        $month = (int) $request->input('month', Carbon::now('Asia/Jakarta')->month);
        $employeeId = $request->input('employee_id');
        $search = $request->input('search');

        $reportData = $this->reportService->getMonthlyReport($year, $month, [
            'employee_id' => $employeeId,
            'search' => $search,
        ]);

        $employees = Employee::where('is_active', true)->orderBy('full_name')->get(['id', 'employee_code', 'full_name']);

        // Month and Year selection options
        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $months[] = [
                'value' => $m,
                'label' => Carbon::createFromDate($year, $m, 1)->translatedFormat('F'),
            ];
        }

        $years = range(Carbon::now('Asia/Jakarta')->year - 2, Carbon::now('Asia/Jakarta')->year + 1);

        return Inertia::render('Admin/Reports/Monthly', [
            'report' => $reportData,
            'employees' => $employees,
            'months' => $months,
            'years' => $years,
            'filters' => [
                'year' => $year,
                'month' => $month,
                'employee_id' => $employeeId,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Export monthly report to Excel
     */
    public function exportMonthlyExcel(Request $request)
    {
        $year = (int) $request->input('year', Carbon::now('Asia/Jakarta')->year);
        $month = (int) $request->input('month', Carbon::now('Asia/Jakarta')->month);
        $employeeId = $request->input('employee_id');

        $reportData = $this->reportService->getMonthlyReport($year, $month, [
            'employee_id' => $employeeId,
        ]);
        $store = StoreSetting::current();

        return $this->exportService->exportMonthlyExcel($reportData, $store);
    }

    /**
     * Export monthly report to PDF
     */
    public function exportMonthlyPdf(Request $request)
    {
        $year = (int) $request->input('year', Carbon::now('Asia/Jakarta')->year);
        $month = (int) $request->input('month', Carbon::now('Asia/Jakarta')->month);
        $employeeId = $request->input('employee_id');

        $reportData = $this->reportService->getMonthlyReport($year, $month, [
            'employee_id' => $employeeId,
        ]);
        $store = StoreSetting::current();

        return $this->exportService->exportMonthlyPdf($reportData, $store);
    }
}
