<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'schedule_id',
        'date',
        'shift_name',
        'scheduled_start_time',
        'scheduled_end_time',
        'late_tolerance_minutes',
        'check_in_time',
        'check_out_time',
        'status',
        'late_minutes',
        'work_duration_minutes',
        'check_in_notes',
        'check_out_notes',
        'check_in_ip',
        'check_out_ip',
        'is_corrected',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'check_in_time' => 'datetime',
            'check_out_time' => 'datetime',
            'late_tolerance_minutes' => 'integer',
            'late_minutes' => 'integer',
            'work_duration_minutes' => 'integer',
            'is_corrected' => 'boolean',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(EmployeeSchedule::class, 'schedule_id');
    }

    public function corrections(): HasMany
    {
        return $this->hasMany(AttendanceCorrection::class);
    }

    /**
     * Human-readable label for status
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'present' => 'Tepat Waktu',
            'late' => 'Terlambat',
            'absent' => 'Tidak Hadir',
            'on_leave' => 'Izin',
            'sick' => 'Sakit',
            'unscheduled' => 'Hadir (Tanpa Jadwal)',
            default => ucfirst($this->status),
        };
    }
}
