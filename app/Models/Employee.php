<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Carbon\Carbon;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'employee_code',
        'full_name',
        'email',
        'phone',
        'position',
        'join_date',
        'is_active',
        'avatar',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'join_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(EmployeeSchedule::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function corrections(): HasMany
    {
        return $this->hasMany(AttendanceCorrection::class);
    }

    /**
     * Get schedule for a specific date (defaults to today)
     */
    public function getScheduleForDate($date = null): ?EmployeeSchedule
    {
        $targetDate = $date ? Carbon::parse($date)->toDateString() : Carbon::today('Asia/Jakarta')->toDateString();
        return $this->schedules()->where('schedule_date', $targetDate)->with('shift')->first();
    }

    /**
     * Get attendance record for a specific date (defaults to today)
     */
    public function getAttendanceForDate($date = null): ?Attendance
    {
        $targetDate = $date ? Carbon::parse($date)->toDateString() : Carbon::today('Asia/Jakarta')->toDateString();
        return $this->attendances()->where('date', $targetDate)->first();
    }
}
