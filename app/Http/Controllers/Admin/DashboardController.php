<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected ReportService $reportService,
        protected AttendanceService $attendanceService
    ) {}

    public function index(Request $request): Response
    {
        $date = $request->input('date', Carbon::today('Asia/Jakarta')->toDateString());
        
        // Sync absent employees if past scheduled shift end
        $this->attendanceService->syncAbsentEmployees($date);

        $stats = $this->reportService->getAdminDashboardStats($date);

        return Inertia::render('Admin/Dashboard', [
            'dashboardData' => $stats,
            'selectedDate' => $date,
        ]);
    }
}
