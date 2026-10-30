<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\AttendanceCorrection;
use App\Models\AuditLog;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\Shift;
use App\Models\User;
use App\Services\AttendanceService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_check_in_within_tolerance_is_marked_as_present(): void
    {
        $employee = Employee::where('is_active', true)->first();
        $shift = Shift::where('code', 'PAGI')->first(); // 08:00 - 16:00, 15 min tolerance

        $today = Carbon::now('Asia/Jakarta')->toDateString();
        EmployeeSchedule::updateOrCreate(
            ['employee_id' => $employee->id, 'schedule_date' => $today],
            ['shift_id' => $shift->id, 'is_day_off' => false]
        );

        Attendance::where('employee_id', $employee->id)->whereDate('date', $today)->delete();

        // Simulate check in at 08:05 (within 15 min tolerance)
        Carbon::setTestNow(Carbon::parse("{$today} 08:05:00", 'Asia/Jakarta'));

        $service = app(AttendanceService::class);
        $attendance = $service->checkIn($employee, '127.0.0.1', 'Datang pagi');

        $this->assertEquals('present', $attendance->status);
        $this->assertEquals(0, $attendance->late_minutes);
        $this->assertNotNull($attendance->check_in_time);

        Carbon::setTestNow();
    }

    public function test_check_in_after_tolerance_is_marked_as_late_with_exact_minutes(): void
    {
        $employee = Employee::where('is_active', true)->first();
        $shift = Shift::where('code', 'PAGI')->first(); // 08:00 start, 15 min tolerance

        $today = Carbon::now('Asia/Jakarta')->toDateString();
        EmployeeSchedule::updateOrCreate(
            ['employee_id' => $employee->id, 'schedule_date' => $today],
            ['shift_id' => $shift->id, 'is_day_off' => false]
        );

        Attendance::where('employee_id', $employee->id)->whereDate('date', $today)->delete();

        // Simulate check in at 08:35 (35 minutes after start => late by 35 minutes)
        Carbon::setTestNow(Carbon::parse("{$today} 08:35:00", 'Asia/Jakarta'));

        $service = app(AttendanceService::class);
        $attendance = $service->checkIn($employee, '127.0.0.1', 'Macet total');

        $this->assertEquals('late', $attendance->status);
        $this->assertEquals(35, $attendance->late_minutes);

        Carbon::setTestNow();
    }

    public function test_cannot_check_in_twice_on_same_day(): void
    {
        $this->expectException(ValidationException::class);

        $employee = Employee::where('is_active', true)->first();
        $shift = Shift::where('code', 'PAGI')->first();

        $today = Carbon::now('Asia/Jakarta')->toDateString();
        EmployeeSchedule::updateOrCreate(
            ['employee_id' => $employee->id, 'schedule_date' => $today],
            ['shift_id' => $shift->id, 'is_day_off' => false]
        );

        Attendance::where('employee_id', $employee->id)->whereDate('date', $today)->delete();

        $service = app(AttendanceService::class);

        // First check in
        Carbon::setTestNow(Carbon::parse("{$today} 08:00:00", 'Asia/Jakarta'));
        $service->checkIn($employee, '127.0.0.1');

        // Second check in should throw ValidationException
        $service->checkIn($employee, '127.0.0.1');

        Carbon::setTestNow();
    }

    public function test_check_out_calculates_work_duration_correctly(): void
    {
        $employee = Employee::where('is_active', true)->first();
        $shift = Shift::where('code', 'PAGI')->first(); // break 60 min

        $today = Carbon::now('Asia/Jakarta')->toDateString();
        EmployeeSchedule::updateOrCreate(
            ['employee_id' => $employee->id, 'schedule_date' => $today],
            ['shift_id' => $shift->id, 'is_day_off' => false]
        );

        Attendance::where('employee_id', $employee->id)->whereDate('date', $today)->delete();

        $service = app(AttendanceService::class);

        // Check in at 08:00
        Carbon::setTestNow(Carbon::parse("{$today} 08:00:00", 'Asia/Jakarta'));
        $service->checkIn($employee, '127.0.0.1');

        // Check out at 16:00 (8 hours = 480 minutes total, minus 60 min break = 420 minutes)
        Carbon::setTestNow(Carbon::parse("{$today} 16:00:00", 'Asia/Jakarta'));
        $attendance = $service->checkOut($employee, '127.0.0.1', 'Pulang kerja');

        $this->assertNotNull($attendance->check_out_time);
        $this->assertEquals(420, $attendance->work_duration_minutes);

        Carbon::setTestNow();
    }

    public function test_cannot_check_out_without_check_in(): void
    {
        $this->expectException(ValidationException::class);

        $employee = Employee::where('is_active', true)->first();
        $today = Carbon::now('Asia/Jakarta')->toDateString();

        Attendance::where('employee_id', $employee->id)->whereDate('date', $today)->delete();

        $service = app(AttendanceService::class);
        $service->checkOut($employee, '127.0.0.1');
    }

    public function test_admin_can_correct_attendance_with_mandatory_reason(): void
    {
        $admin = User::where('role', 'admin')->first();
        $attendance = Attendance::first();

        $dateStr = Carbon::parse($attendance->date)->toDateString();

        $response = $this->actingAs($admin)->put("/admin/attendances/{$attendance->id}/correct", [
            'status' => 'present',
            'check_in_time' => "{$dateStr} 08:00:00",
            'check_out_time' => "{$dateStr} 16:00:00",
            'late_minutes' => 0,
            'reason' => 'Koreksi karena sensor fingerprint offline saat pagi hari.',
        ]);

        $response->assertSessionHas('success');

        $attendance->refresh();
        $this->assertTrue((bool) $attendance->is_corrected);
        $this->assertEquals('present', $attendance->status);

        // Verify history was recorded
        $this->assertDatabaseHas('attendance_corrections', [
            'attendance_id' => $attendance->id,
            'corrected_by' => $admin->id,
            'reason' => 'Koreksi karena sensor fingerprint offline saat pagi hari.',
        ]);
    }

    public function test_admin_cannot_correct_attendance_without_reason(): void
    {
        $admin = User::where('role', 'admin')->first();
        $attendance = Attendance::first();

        $dateStr = Carbon::parse($attendance->date)->toDateString();

        $response = $this->actingAs($admin)->put("/admin/attendances/{$attendance->id}/correct", [
            'status' => 'present',
            'check_in_time' => "{$dateStr} 08:00:00",
            'check_out_time' => "{$dateStr} 16:00:00",
            'late_minutes' => 0,
            'reason' => '', // Empty reason
        ]);

        $response->assertSessionHasErrors('reason');
    }
}
