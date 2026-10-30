<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shift extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'start_time',
        'end_time',
        'break_minutes',
        'late_tolerance_minutes',
        'is_overnight',
        'color',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'break_minutes' => 'integer',
            'late_tolerance_minutes' => 'integer',
            'is_overnight' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(EmployeeSchedule::class);
    }

    /**
     * Automatically detect overnight shift when end_time <= start_time
     */
    public static function checkIsOvernight(string $startTime, string $endTime): bool
    {
        return strtotime($endTime) <= strtotime($startTime);
    }
}
