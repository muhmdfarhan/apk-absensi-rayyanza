<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceCorrection extends Model
{
    use HasFactory;

    protected $fillable = [
        'attendance_id',
        'employee_id',
        'corrected_by',
        'previous_check_in',
        'previous_check_out',
        'previous_status',
        'new_check_in',
        'new_check_out',
        'new_status',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'previous_check_in' => 'datetime',
            'previous_check_out' => 'datetime',
            'new_check_in' => 'datetime',
            'new_check_out' => 'datetime',
        ];
    }

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function corrector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'corrected_by');
    }
}
