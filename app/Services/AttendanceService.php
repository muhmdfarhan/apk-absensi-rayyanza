<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceCorrection;
use App\Models\AuditLog;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\LeaveRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AttendanceService
{
    /**
     * Process employee check-in based on server time (Asia/Jakarta)
     */
    public function checkIn(Employee $employee, ?string $ipAddress = null, ?string $notes = null): Attendance
    {
        $now = Carbon::now('Asia/Jakarta');
        $today = $now->toDateString();

        // Check if employee is active
        if (!$employee->is_active) {
            throw ValidationException::withMessages([
                'attendance' => 'Akun karyawan Anda berstatus nonaktif. Silakan hubungi admin.',
            ]);
        }

        // Check if already checked in today
        $existing = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->first();

        if ($existing && $existing->check_in_time) {
            throw ValidationException::withMessages([
                'attendance' => 'Anda sudah melakukan absen masuk hari ini pada pukul ' . Carbon::parse($existing->check_in_time)->format('H:i:s') . ' WIB.',
            ]);
        }

        // Check today's schedule
        $schedule = EmployeeSchedule::where('employee_id', $employee->id)
            ->where('schedule_date', $today)
            ->with('shift')
            ->first();

        // If scheduled as day off, verify if attendance should be allowed or flagged
        if ($schedule && $schedule->is_day_off) {
            // Allow check-in as overtime/unscheduled day off
            $status = 'unscheduled';
            $shiftName = 'Hari Libur / Lembur';
            $scheduledStart = null;
            $scheduledEnd = null;
            $tolerance = 0;
            $lateMinutes = 0;
        } elseif ($schedule && $schedule->shift) {
            $shift = $schedule->shift;
            $shiftName = $shift->name;
            $scheduledStart = $shift->start_time;
            $scheduledEnd = $shift->end_time;
            $tolerance = $shift->late_tolerance_minutes;

            // Calculate lateness
            // Create full Carbon datetime for scheduled start today
            $scheduledStartDateTime = Carbon::createFromFormat('Y-m-d H:i:s', $today . ' ' . $shift->start_time, 'Asia/Jakarta');
            $toleranceDateTime = (clone $scheduledStartDateTime)->addMinutes($tolerance);

            if ($now->greaterThan($toleranceDateTime)) {
                $status = 'late';
                // Calculated from scheduled start time in minutes
                $lateMinutes = (int) $scheduledStartDateTime->diffInMinutes($now, false);
                if ($lateMinutes < 0) {
                    $lateMinutes = 0;
                }
            } else {
                $status = 'present';
                $lateMinutes = 0;
            }
        } else {
            // Unscheduled check-in
            $status = 'unscheduled';
            $shiftName = 'Hadir Tanpa Jadwal';
            $scheduledStart = null;
            $scheduledEnd = null;
            $tolerance = 0;
            $lateMinutes = 0;
        }

        return DB::transaction(function () use (
            $employee,
            $schedule,
            $today,
            $now,
            $shiftName,
            $scheduledStart,
            $scheduledEnd,
            $tolerance,
            $status,
            $lateMinutes,
            $notes,
            $ipAddress,
            $existing
        ) {
            $data = [
                'employee_id' => $employee->id,
                'date' => $today,
                'schedule_id' => $schedule?->id,
                'shift_name' => $shiftName,
                'scheduled_start_time' => $scheduledStart,
                'scheduled_end_time' => $scheduledEnd,
                'late_tolerance_minutes' => $tolerance,
                'check_in_time' => $now,
                'status' => $status,
                'late_minutes' => $lateMinutes,
                'check_in_notes' => $notes,
                'check_in_ip' => $ipAddress,
            ];

            if ($existing) {
                $existing->update($data);
                $attendance = $existing;
            } else {
                $attendance = Attendance::create($data);
            }

            AuditLog::record('attendance_check_in', 'Attendance', $attendance->id, [
                'employee_name' => $employee->full_name,
                'employee_code' => $employee->employee_code,
                'time' => $now->toDateTimeString(),
                'status' => $status,
                'late_minutes' => $lateMinutes,
            ]);

            return $attendance;
        });
    }

    /**
     * Process employee check-out based on server time (Asia/Jakarta)
     */
    public function checkOut(Employee $employee, ?string $ipAddress = null, ?string $notes = null): Attendance
    {
        $now = Carbon::now('Asia/Jakarta');
        $today = $now->toDateString();

        // Check if there is an open attendance today or from previous day overnight shift
        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->first();

        // If today's attendance has no check-in, check yesterday's overnight shift
        if (!$attendance || !$attendance->check_in_time) {
            $yesterday = (clone $now)->subDay()->toDateString();
            $yesterdayAttendance = Attendance::where('employee_id', $employee->id)
                ->whereDate('date', $yesterday)
                ->whereNotNull('check_in_time')
                ->whereNull('check_out_time')
                ->first();

            if ($yesterdayAttendance) {
                $attendance = $yesterdayAttendance;
            }
        }

        if (!$attendance || !$attendance->check_in_time) {
            throw ValidationException::withMessages([
                'attendance' => 'Anda belum melakukan absen masuk hari ini.',
            ]);
        }

        if ($attendance->check_out_time) {
            throw ValidationException::withMessages([
                'attendance' => 'Anda sudah melakukan absen pulang pada pukul ' . Carbon::parse($attendance->check_out_time)->format('H:i:s') . ' WIB.',
            ]);
        }

        return DB::transaction(function () use ($attendance, $now, $notes, $ipAddress, $employee) {
            $checkIn = Carbon::parse($attendance->check_in_time, 'Asia/Jakarta');
            $rawDuration = (int) $checkIn->diffInMinutes($now, false);
            if ($rawDuration < 0) {
                $rawDuration = 0;
            }

            // Deduct break duration if applicable
            $breakMinutes = 0;
            if ($attendance->schedule && $attendance->schedule->shift) {
                $breakMinutes = $attendance->schedule->shift->break_minutes;
            }

            // Deduct break time only if worked more than 4 hours (240 minutes)
            $netDuration = $rawDuration;
            if ($rawDuration >= 240 && $breakMinutes > 0) {
                $netDuration = max(0, $rawDuration - $breakMinutes);
            }

            $attendance->update([
                'check_out_time' => $now,
                'work_duration_minutes' => $netDuration,
                'check_out_notes' => $notes,
                'check_out_ip' => $ipAddress,
            ]);

            AuditLog::record('attendance_check_out', 'Attendance', $attendance->id, [
                'employee_name' => $employee->full_name,
                'employee_code' => $employee->employee_code,
                'time' => $now->toDateTimeString(),
                'work_duration_minutes' => $netDuration,
            ]);

            return $attendance;
        });
    }

    /**
     * Admin attendance correction with mandatory reason
     */
    public function correctAttendance(Attendance $attendance, array $data, User $admin): Attendance
    {
        if (empty(trim($data['reason'] ?? ''))) {
            throw ValidationException::withMessages([
                'reason' => 'Alasan koreksi wajib diisi.',
            ]);
        }

        return DB::transaction(function () use ($attendance, $data, $admin) {
            $prevCheckIn = $attendance->check_in_time;
            $prevCheckOut = $attendance->check_out_time;
            $prevStatus = $attendance->status;

            $newCheckIn = !empty($data['check_in_time']) ? Carbon::parse($data['check_in_time'], 'Asia/Jakarta') : null;
            $newCheckOut = !empty($data['check_out_time']) ? Carbon::parse($data['check_out_time'], 'Asia/Jakarta') : null;
            $newStatus = $data['status'] ?? $prevStatus;
            $lateMinutes = (int) ($data['late_minutes'] ?? $attendance->late_minutes);

            // Calculate work duration if both check in and check out exist
            $durationMinutes = 0;
            if ($newCheckIn && $newCheckOut) {
                $rawDuration = (int) $newCheckIn->diffInMinutes($newCheckOut, false);
                $durationMinutes = max(0, $rawDuration);
            }

            // Record correction history
            AttendanceCorrection::create([
                'attendance_id' => $attendance->id,
                'employee_id' => $attendance->employee_id,
                'corrected_by' => $admin->id,
                'previous_check_in' => $prevCheckIn,
                'previous_check_out' => $prevCheckOut,
                'previous_status' => $prevStatus,
                'new_check_in' => $newCheckIn,
                'new_check_out' => $newCheckOut,
                'new_status' => $newStatus,
                'reason' => $data['reason'],
            ]);

            // Update attendance
            $attendance->update([
                'check_in_time' => $newCheckIn,
                'check_out_time' => $newCheckOut,
                'status' => $newStatus,
                'late_minutes' => $lateMinutes,
                'work_duration_minutes' => $durationMinutes,
                'is_corrected' => true,
            ]);

            AuditLog::record('attendance_corrected', 'Attendance', $attendance->id, [
                'corrected_by' => $admin->name,
                'reason' => $data['reason'],
                'new_status' => $newStatus,
            ]);

            return $attendance->fresh(['employee', 'schedule.shift', 'corrections.corrector']);
        });
    }

    /**
     * Mark absent employees whose scheduled shifts have passed and no attendance recorded
     */
    public function syncAbsentEmployees(?string $date = null): int
    {
        $targetDate = $date ?? Carbon::today('Asia/Jakarta')->toDateString();
        $now = Carbon::now('Asia/Jakarta');

        // Find schedules for this date where employee is active and not day off
        $schedules = EmployeeSchedule::where('schedule_date', $targetDate)
            ->where('is_day_off', false)
            ->whereHas('employee', function ($q) {
                $q->where('is_active', true);
            })
            ->with(['employee', 'shift'])
            ->get();

        $markedCount = 0;

        foreach ($schedules as $schedule) {
            $shift = $schedule->shift;
            if (!$shift) {
                continue;
            }

            // Only mark absent if current time is past shift end time (or end of day for today)
            $shiftEndDateTime = Carbon::createFromFormat('Y-m-d H:i:s', $targetDate . ' ' . $shift->end_time, 'Asia/Jakarta');
            if ($shift->is_overnight) {
                $shiftEndDateTime->addDay();
            }

            // If target date is in the past, or shift end has passed
            if ($targetDate < $now->toDateString() || $now->greaterThan($shiftEndDateTime)) {
                // Check if attendance exists
                $attendance = Attendance::where('employee_id', $schedule->employee_id)
                    ->where('date', $targetDate)
                    ->first();

                if (!$attendance) {
                    // Check if employee has approved leave request
                    $leave = LeaveRequest::where('employee_id', $schedule->employee_id)
                        ->where('status', 'approved')
                        ->where('start_date', '<=', $targetDate)
                        ->where('end_date', '>=', $targetDate)
                        ->first();

                    $status = 'absent';
                    if ($leave) {
                        $status = ($leave->type === 'sick') ? 'sick' : 'on_leave';
                    }

                    Attendance::create([
                        'employee_id' => $schedule->employee_id,
                        'schedule_id' => $schedule->id,
                        'date' => $targetDate,
                        'shift_name' => $shift->name,
                        'scheduled_start_time' => $shift->start_time,
                        'scheduled_end_time' => $shift->end_time,
                        'late_tolerance_minutes' => $shift->late_tolerance_minutes,
                        'status' => $status,
                        'late_minutes' => 0,
                        'work_duration_minutes' => 0,
                    ]);

                    $markedCount++;
                }
            }
        }

        return $markedCount;
    }
}
