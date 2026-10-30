<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\Shift;
use App\Models\StoreSetting;
use App\Services\AttendanceService;
use App\Services\ExportService;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService,
        protected ReportService $reportService,
        protected ExportService $exportService
    ) {}

    /**
     * Today's live attendance monitor
     */
    public function today(Request $request): Response
    {
        $today = Carbon::today('Asia/Jakarta')->toDateString();
        $this->attendanceService->syncAbsentEmployees($today);

        $search = $request->input('search');
        $shiftId = $request->input('shift_id');
        $status = $request->input('status');

        $query = Attendance::where('date', $today)
            ->with(['employee', 'schedule.shift', 'corrections.corrector']);

        if ($search) {
            $query->whereHas('employee', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%");
            });
        }

        if ($shiftId) {
            $query->whereHas('schedule', fn ($q) => $q->where('shift_id', $shiftId));
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $attendances = $query->orderByDesc('check_in_time')->paginate(20)->withQueryString();

        $stats = $this->reportService->getAdminDashboardStats($today)['stats'];
        $shifts = Shift::where('is_active', true)->get();

        return Inertia::render('Admin/Attendances/Today', [
            'attendances' => $attendances,
            'stats' => $stats,
            'shifts' => $shifts,
            'filters' => [
                'search' => $search,
                'shift_id' => $shiftId,
                'status' => $status,
            ],
            'todayDate' => Carbon::now('Asia/Jakarta')->translatedFormat('l, d F Y'),
        ]);
    }

    /**
     * Comprehensive attendance recap page with all 11 mandatory filters
     */
    public function recap(Request $request): Response
    {
        $filters = $request->only([
            'start_date', 'end_date', 'period', 'month', 'year',
            'employee_id', 'search', 'shift_id', 'status',
            'punctuality', 'sort_by', 'sort_order'
        ]);

        // Default period to 'this_month' if no filter provided
        if (empty($filters['period']) && empty($filters['start_date']) && empty($filters['end_date'])) {
            $filters['period'] = 'this_month';
        }

        $query = $this->reportService->getRecapQuery($filters);
        $attendances = $query->paginate(15)->withQueryString();

        $shifts = Shift::where('is_active', true)->get(['id', 'name', 'code']);
        $employees = Employee::where('is_active', true)->orderBy('full_name')->get(['id', 'employee_code', 'full_name']);

        return Inertia::render('Admin/Attendances/Recap', [
            'attendances' => $attendances,
            'shifts' => $shifts,
            'employees' => $employees,
            'filters' => $filters,
        ]);
    }

    /**
     * Admin attendance correction with mandatory reason
     */
    public function correct(Request $request, Attendance $attendance): RedirectResponse
    {
        $input = $request->all();
        $dateStr = Carbon::parse($attendance->date)->toDateString();

        if (!empty($input['check_in_time']) && strlen($input['check_in_time']) <= 8) {
            $input['check_in_time'] = "{$dateStr} {$input['check_in_time']}";
        }
        if (!empty($input['check_out_time']) && strlen($input['check_out_time']) <= 8) {
            $input['check_out_time'] = "{$dateStr} {$input['check_out_time']}";
        }

        $validated = validator($input, [
            'check_in_time' => ['nullable', 'date'],
            'check_out_time' => ['nullable', 'date'],
            'status' => ['required', 'in:present,late,absent,on_leave,sick,unscheduled'],
            'late_minutes' => ['nullable', 'integer', 'min:0'],
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ], [
            'reason.required' => 'Alasan koreksi wajib diisi secara jelas.',
            'reason.min' => 'Alasan koreksi minimal 5 karakter.',
        ])->validate();

        $this->attendanceService->correctAttendance($attendance, $validated, Auth::user());

        return back()->with('success', 'Catatan absensi berhasil dikoreksi.');
    }

    /**
     * Export attendance recap to Excel (.xlsx)
     */
    public function exportExcel(Request $request)
    {
        $filters = $request->all();
        $attendances = $this->reportService->getRecapQuery($filters)->get();
        $store = StoreSetting::current();

        return $this->exportService->exportRecapExcel($attendances, $filters, $store);
    }

    /**
     * Export attendance recap to PDF
     */
    public function exportPdf(Request $request)
    {
        $filters = $request->all();
        $attendances = $this->reportService->getRecapQuery($filters)->get();
        $store = StoreSetting::current();

        return $this->exportService->exportRecapPdf($attendances, $filters, $store);
    }
}
