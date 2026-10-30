<?php

use App\Http\Controllers\Admin\AttendanceController as AdminAttendanceController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\EmployeeController as AdminEmployeeController;
use App\Http\Controllers\Admin\LeaveRequestController as AdminLeaveRequestController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\ScheduleController as AdminScheduleController;
use App\Http\Controllers\Admin\ShiftController as AdminShiftController;
use App\Http\Controllers\Admin\StoreSettingController as AdminStoreSettingController;
use App\Http\Controllers\Employee\AttendanceController as EmployeeAttendanceController;
use App\Http\Controllers\Employee\DashboardController as EmployeeDashboardController;
use App\Http\Controllers\Employee\LeaveRequestController as EmployeeLeaveRequestController;
use App\Http\Controllers\Employee\ScheduleController as EmployeeScheduleController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('employee.dashboard');
    }
    return redirect()->route('login');
});

// Common Dashboard redirector
Route::get('/dashboard', function () {
    if (!Auth::check()) {
        return redirect()->route('login');
    }
    return Auth::user()->isAdmin()
        ? redirect()->route('admin.dashboard')
        : redirect()->route('employee.dashboard');
})->middleware('auth')->name('dashboard');

/*
|--------------------------------------------------------------------------
| Admin Routes (Role: admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Employees Management
    Route::resource('employees', AdminEmployeeController::class);
    Route::post('employees/{employee}/toggle-active', [AdminEmployeeController::class, 'toggleActive'])->name('employees.toggle-active');

    // Shifts Management
    Route::resource('shifts', AdminShiftController::class)->except(['create', 'show', 'edit']);
    Route::post('shifts/{shift}/toggle-active', [AdminShiftController::class, 'toggleActive'])->name('shifts.toggle-active');

    // Shift Schedules
    Route::get('schedules', [AdminScheduleController::class, 'index'])->name('schedules.index');
    Route::post('schedules', [AdminScheduleController::class, 'store'])->name('schedules.store');
    Route::post('schedules/bulk', [AdminScheduleController::class, 'bulkStore'])->name('schedules.bulk');
    Route::delete('schedules/{schedule}', [AdminScheduleController::class, 'destroy'])->name('schedules.destroy');

    // Attendances
    Route::get('attendances/today', [AdminAttendanceController::class, 'today'])->name('attendances.today');
    Route::get('attendances/recap', [AdminAttendanceController::class, 'recap'])->name('attendances.recap');
    Route::post('attendances/{attendance}/correct', [AdminAttendanceController::class, 'correct'])->name('attendances.correct');
    Route::get('attendances/export/excel', [AdminAttendanceController::class, 'exportExcel'])->name('attendances.export.excel');
    Route::get('attendances/export/pdf', [AdminAttendanceController::class, 'exportPdf'])->name('attendances.export.pdf');

    // Leave Requests
    Route::get('leaves', [AdminLeaveRequestController::class, 'index'])->name('leaves.index');
    Route::patch('leaves/{leaveRequest}/status', [AdminLeaveRequestController::class, 'updateStatus'])->name('leaves.update-status');

    // Evaluation Reports
    Route::get('reports/weekly', [AdminReportController::class, 'weekly'])->name('reports.weekly');
    Route::get('reports/monthly', [AdminReportController::class, 'monthly'])->name('reports.monthly');
    Route::get('reports/monthly/export/excel', [AdminReportController::class, 'exportMonthlyExcel'])->name('reports.monthly.export.excel');
    Route::get('reports/monthly/export/pdf', [AdminReportController::class, 'exportMonthlyPdf'])->name('reports.monthly.export.pdf');
    Route::get('reports/monthly/excel', [AdminReportController::class, 'exportMonthlyExcel'])->name('reports.monthly.excel');
    Route::get('reports/monthly/pdf', [AdminReportController::class, 'exportMonthlyPdf'])->name('reports.monthly.pdf');

    // Store Settings
    Route::get('settings', [AdminStoreSettingController::class, 'edit'])->name('settings.edit');
    Route::put('settings', [AdminStoreSettingController::class, 'update'])->name('settings.update');
});

/*
|--------------------------------------------------------------------------
| Employee Routes (Role: employee)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:employee'])->prefix('employee')->name('employee.')->group(function () {
    Route::get('/dashboard', [EmployeeDashboardController::class, 'index'])->name('dashboard');

    // Attendance Kiosk & History
    Route::get('attendance', [EmployeeAttendanceController::class, 'index'])->name('attendance.index');
    Route::post('attendance/check-in', [EmployeeAttendanceController::class, 'checkIn'])->name('attendance.check-in');
    Route::post('attendance/check-out', [EmployeeAttendanceController::class, 'checkOut'])->name('attendance.check-out');
    Route::get('attendance/history', [EmployeeAttendanceController::class, 'history'])->name('attendance.history');

    // Personal Shift Schedules
    Route::get('schedules', [EmployeeScheduleController::class, 'index'])->name('schedules.index');

    // Personal Leave Requests
    Route::get('leaves', [EmployeeLeaveRequestController::class, 'index'])->name('leaves.index');
    Route::get('leaves/create', [EmployeeLeaveRequestController::class, 'create'])->name('leaves.create');
    Route::post('leaves', [EmployeeLeaveRequestController::class, 'store'])->name('leaves.store');
});

/*
|--------------------------------------------------------------------------
| Shared Profile Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
});

require __DIR__.'/auth.php';
