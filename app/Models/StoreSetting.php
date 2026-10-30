<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_name',
        'store_code',
        'phone',
        'email',
        'address',
        'default_tolerance_minutes',
        'timezone',
        'logo_url',
    ];

    protected function casts(): array
    {
        return [
            'default_tolerance_minutes' => 'integer',
        ];
    }

    public static function current(): self
    {
        try {
            return self::firstOrCreate(
                ['id' => 1],
                [
                    'store_name' => 'Toko Rayyanza',
                    'store_code' => 'TRY-01',
                    'phone' => '021-5558900',
                    'email' => 'toko@rayyanza.com',
                    'address' => 'Jl. Boulevard Ritel No. 88, Jakarta',
                    'default_tolerance_minutes' => 15,
                    'timezone' => 'Asia/Jakarta',
                ]
            );
        } catch (\Throwable $e) {
            $fallback = new self();
            $fallback->id = 1;
            $fallback->store_name = 'Toko Rayyanza';
            $fallback->store_code = 'TRY-01';
            $fallback->phone = '021-5558900';
            $fallback->email = 'toko@rayyanza.com';
            $fallback->address = 'Jl. Boulevard Ritel No. 88, Jakarta';
            $fallback->default_tolerance_minutes = 15;
            $fallback->timezone = 'Asia/Jakarta';
            return $fallback;
        }
    }
}
