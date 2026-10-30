<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\LeaveRequest;
use App\Models\Shift;
use App\Models\StoreSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with realistic retail store data.
     */
    public function run(): void
    {
        // 1. Store Settings
        $store = StoreSetting::updateOrCreate(
            ['id' => 1],
            [
                'store_name' => 'Toko Rayyanza',
                'store_code' => 'TRY-01',
                'phone' => '021-88997700',
                'email' => 'admin@tokorayyanza.com',
                'address' => 'Jl. Pemuda No. 45, Kebayoran Baru, Jakarta Selatan',
                'default_tolerance_minutes' => 15,
                'timezone' => 'Asia/Jakarta',
            ]
        );

        // 2. Admin User
        $admin = User::updateOrCreate(
            ['email' => 'admin@retail.com'],
            [
                'name' => 'Budi Hartono (Owner)',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        // 3. Retail Shifts
        $shiftPagi = Shift::updateOrCreate(
            ['code' => 'PAGI'],
            [
                'name' => 'Shift Pagi',
                'start_time' => '08:00:00',
                'end_time' => '16:00:00',
                'break_minutes' => 60,
                'late_tolerance_minutes' => 15,
                'is_overnight' => false,
                'color' => '#2563EB', // Blue
                'is_active' => true,
            ]
        );

        $shiftSiang = Shift::updateOrCreate(
            ['code' => 'SIANG'],
            [
                'name' => 'Shift Siang',
                'start_time' => '12:00:00',
                'end_time' => '20:00:00',
                'break_minutes' => 60,
                'late_tolerance_minutes' => 15,
                'is_overnight' => false,
                'color' => '#0D9488', // Teal
                'is_active' => true,
            ]
        );

        $shiftMalam = Shift::updateOrCreate(
            ['code' => 'MALAM'],
            [
                'name' => 'Shift Malam',
                'start_time' => '16:00:00',
                'end_time' => '00:00:00',
                'break_minutes' => 60,
                'late_tolerance_minutes' => 15,
                'is_overnight' => false, // 16:00 - 00:00 ends at midnight
                'color' => '#4F46E5', // Indigo
                'is_active' => true,
            ]
        );

        $shifts = [$shiftPagi, $shiftSiang, $shiftMalam];

        // 4. Employees & Their Login Accounts
        $employeesData = [
            [
                'code' => 'EMP-001',
                'name' => 'Siti Aminah',
                'email' => 'siti@retail.com',
                'phone' => '081234567801',
                'position' => 'Kasir Utama',
                'join_date' => '2023-01-10',
            ],
            [
                'code' => 'EMP-002',
                'name' => 'Ahmad Pratama',
                'email' => 'ahmad@retail.com',
                'phone' => '081234567802',
                'position' => 'Kasir Shift 2',
                'join_date' => '2023-03-15',
            ],
            [
                'code' => 'EMP-003',
                'name' => 'Rini Wijaya',
                'email' => 'rini@retail.com',
                'phone' => '081234567803',
                'position' => 'Pramuniaga Toko',
                'join_date' => '2023-06-01',
            ],
            [
                'code' => 'EMP-004',
                'name' => 'Dewi Lestari',
                'email' => 'dewi@retail.com',
                'phone' => '081234567804',
                'position' => 'Staff Gudang & Inventory',
                'join_date' => '2023-08-20',
            ],
            [
                'code' => 'EMP-005',
                'name' => 'Fajar Nugroho',
                'email' => 'fajar@retail.com',
                'phone' => '081234567805',
                'position' => 'Supervisor Toko',
                'join_date' => '2022-11-01',
            ],
        ];

        $employees = [];
        foreach ($employeesData as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'role' => 'employee',
                    'is_active' => true,
                ]
            );

            $emp = Employee::updateOrCreate(
                ['employee_code' => $data['code']],
                [
                    'user_id' => $user->id,
                    'full_name' => $data['name'],
                    'email' => $data['email'],
                    'phone' => $data['phone'],
                    'position' => $data['position'],
                    'join_date' => $data['join_date'],
                    'is_active' => true,
                    'notes' => 'Karyawan tetap toko ritel.',
                ]
            );

            $employees[] = $emp;
        }

        // 5. Schedules & Attendances for past 14 days up to today
        $now = Carbon::now('Asia/Jakarta');
        $today = $now->toDateString();

        for ($dayOffset = 14; $dayOffset >= 0; $dayOffset--) {
            $targetCarbon = (clone $now)->subDays($dayOffset);
            $targetDate = $targetCarbon->toDateString();
            $isSunday = ($targetCarbon->dayOfWeek === 0);

            foreach ($employees as $idx => $emp) {
                // Determine shift rotation:
                // EMP-001 (Siti): Mostly Pagi, day off on Monday
                // EMP-002 (Ahmad): Mostly Siang, day off on Tuesday
                // EMP-003 (Rini): Rotating Siang & Malam, day off on Wednesday
                // EMP-004 (Dewi): Mostly Pagi, day off on Sunday
                // EMP-005 (Fajar): Supervisor, day off on Sunday
                $isDayOff = false;
                if ($emp->employee_code === 'EMP-001' && $targetCarbon->dayOfWeek === 1) $isDayOff = true;
                if ($emp->employee_code === 'EMP-002' && $targetCarbon->dayOfWeek === 2) $isDayOff = true;
                if ($emp->employee_code === 'EMP-003' && $targetCarbon->dayOfWeek === 3) $isDayOff = true;
                if ($emp->employee_code === 'EMP-004' && $targetCarbon->dayOfWeek === 0) $isDayOff = true;
                if ($emp->employee_code === 'EMP-005' && $targetCarbon->dayOfWeek === 0) $isDayOff = true;

                $assignedShift = $shifts[($idx + $dayOffset) % 3];

                $schedule = EmployeeSchedule::updateOrCreate(
                    [
                        'employee_id' => $emp->id,
                        'schedule_date' => $targetDate,
                    ],
                    [
                        'shift_id' => $isDayOff ? null : $assignedShift->id,
                        'is_day_off' => $isDayOff,
                        'notes' => $isDayOff ? 'Libur Mingguan' : 'Jadwal Rutin Toko',
                        'created_by' => $admin->id,
                    ]
                );

                if ($isDayOff) {
                    continue;
                }

                // If date is in the past, seed historical attendance
                if ($dayOffset > 0) {
                    // Randomize scenario: mostly on-time, occasional late, occasional leave
                    $scenario = ($idx * 7 + $dayOffset) % 10;

                    if ($scenario === 7 && $dayOffset === 5) {
                        // On leave
                        Attendance::updateOrCreate(
                            ['employee_id' => $emp->id, 'date' => $targetDate],
                            [
                                'schedule_id' => $schedule->id,
                                'shift_name' => $assignedShift->name,
                                'scheduled_start_time' => $assignedShift->start_time,
                                'scheduled_end_time' => $assignedShift->end_time,
                                'late_tolerance_minutes' => $assignedShift->late_tolerance_minutes,
                                'status' => 'on_leave',
                                'check_in_notes' => 'Izin keperluan keluarga (disetujui)',
                                'late_minutes' => 0,
                                'work_duration_minutes' => 0,
                            ]
                        );
                    } elseif ($scenario === 8 && $dayOffset === 9) {
                        // Sick
                        Attendance::updateOrCreate(
                            ['employee_id' => $emp->id, 'date' => $targetDate],
                            [
                                'schedule_id' => $schedule->id,
                                'shift_name' => $assignedShift->name,
                                'scheduled_start_time' => $assignedShift->start_time,
                                'scheduled_end_time' => $assignedShift->end_time,
                                'late_tolerance_minutes' => $assignedShift->late_tolerance_minutes,
                                'status' => 'sick',
                                'check_in_notes' => 'Sakit demam surat dokter terlampir',
                                'late_minutes' => 0,
                                'work_duration_minutes' => 0,
                            ]
                        );
                    } elseif ($scenario === 9 && $dayOffset === 3) {
                        // Late (e.g. 25 minutes late)
                        $startParts = explode(':', $assignedShift->start_time);
                        $inTime = Carbon::createFromTime((int)$startParts[0], (int)$startParts[1], 0, 'Asia/Jakarta')
                            ->setDate($targetCarbon->year, $targetCarbon->month, $targetCarbon->day)
                            ->addMinutes(25);
                        $outTime = (clone $inTime)->addHours(8);

                        Attendance::updateOrCreate(
                            ['employee_id' => $emp->id, 'date' => $targetDate],
                            [
                                'schedule_id' => $schedule->id,
                                'shift_name' => $assignedShift->name,
                                'scheduled_start_time' => $assignedShift->start_time,
                                'scheduled_end_time' => $assignedShift->end_time,
                                'late_tolerance_minutes' => $assignedShift->late_tolerance_minutes,
                                'check_in_time' => $inTime,
                                'check_out_time' => $outTime,
                                'status' => 'late',
                                'late_minutes' => 25,
                                'work_duration_minutes' => 420, // 7 hours net
                                'check_in_notes' => 'Macet perjalanan',
                            ]
                        );
                    } else {
                        // Punctual (checked in 5-10 minutes before shift or within tolerance)
                        $startParts = explode(':', $assignedShift->start_time);
                        $inTime = Carbon::createFromTime((int)$startParts[0], (int)$startParts[1], 0, 'Asia/Jakarta')
                            ->setDate($targetCarbon->year, $targetCarbon->month, $targetCarbon->day)
                            ->subMinutes(rand(2, 10));
                        $outTime = (clone $inTime)->addHours(8)->addMinutes(rand(5, 20));

                        Attendance::updateOrCreate(
                            ['employee_id' => $emp->id, 'date' => $targetDate],
                            [
                                'schedule_id' => $schedule->id,
                                'shift_name' => $assignedShift->name,
                                'scheduled_start_time' => $assignedShift->start_time,
                                'scheduled_end_time' => $assignedShift->end_time,
                                'late_tolerance_minutes' => $assignedShift->late_tolerance_minutes,
                                'check_in_time' => $inTime,
                                'check_out_time' => $outTime,
                                'status' => 'present',
                                'late_minutes' => 0,
                                'work_duration_minutes' => 420, // 7 hours net after 1 hour break
                            ]
                        );
                    }
                } else {
                    // Day 0: Today's Attendance!
                    // EMP-001 (Siti): Checked in on-time, currently working
                    if ($emp->employee_code === 'EMP-001' && !$isDayOff) {
                        $startParts = explode(':', $assignedShift->start_time);
                        $inTime = Carbon::createFromTime((int)$startParts[0], (int)$startParts[1], 0, 'Asia/Jakarta')
                            ->setDate($targetCarbon->year, $targetCarbon->month, $targetCarbon->day)
                            ->subMinutes(8);

                        Attendance::updateOrCreate(
                            ['employee_id' => $emp->id, 'date' => $today],
                            [
                                'schedule_id' => $schedule->id,
                                'shift_name' => $assignedShift->name,
                                'scheduled_start_time' => $assignedShift->start_time,
                                'scheduled_end_time' => $assignedShift->end_time,
                                'late_tolerance_minutes' => $assignedShift->late_tolerance_minutes,
                                'check_in_time' => $inTime,
                                'check_out_time' => null, // Working now!
                                'status' => 'present',
                                'late_minutes' => 0,
                                'work_duration_minutes' => 0,
                            ]
                        );
                    }

                    // EMP-002 (Ahmad): Checked in late today (e.g. 20 minutes late), currently working
                    if ($emp->employee_code === 'EMP-002' && !$isDayOff) {
                        $startParts = explode(':', $assignedShift->start_time);
                        $inTime = Carbon::createFromTime((int)$startParts[0], (int)$startParts[1], 0, 'Asia/Jakarta')
                            ->setDate($targetCarbon->year, $targetCarbon->month, $targetCarbon->day)
                            ->addMinutes(20);

                        Attendance::updateOrCreate(
                            ['employee_id' => $emp->id, 'date' => $today],
                            [
                                'schedule_id' => $schedule->id,
                                'shift_name' => $assignedShift->name,
                                'scheduled_start_time' => $assignedShift->start_time,
                                'scheduled_end_time' => $assignedShift->end_time,
                                'late_tolerance_minutes' => $assignedShift->late_tolerance_minutes,
                                'check_in_time' => $inTime,
                                'check_out_time' => null, // Working now!
                                'status' => 'late',
                                'late_minutes' => 20,
                                'work_duration_minutes' => 0,
                                'check_in_notes' => 'Ada kendala ban bocor',
                            ]
                        );
                    }

                    // EMP-005 (Fajar): Finished working today (Checked in & Checked out)
                    if ($emp->employee_code === 'EMP-005' && !$isDayOff) {
                        $startParts = explode(':', $assignedShift->start_time);
                        $inTime = Carbon::createFromTime((int)$startParts[0], (int)$startParts[1], 0, 'Asia/Jakarta')
                            ->setDate($targetCarbon->year, $targetCarbon->month, $targetCarbon->day)
                            ->subMinutes(5);
                        $outTime = (clone $inTime)->addHours(8);

                        Attendance::updateOrCreate(
                            ['employee_id' => $emp->id, 'date' => $today],
                            [
                                'schedule_id' => $schedule->id,
                                'shift_name' => $assignedShift->name,
                                'scheduled_start_time' => $assignedShift->start_time,
                                'scheduled_end_time' => $assignedShift->end_time,
                                'late_tolerance_minutes' => $assignedShift->late_tolerance_minutes,
                                'check_in_time' => $inTime,
                                'check_out_time' => $outTime,
                                'status' => 'present',
                                'late_minutes' => 0,
                                'work_duration_minutes' => 420,
                            ]
                        );
                    }
                    // EMP-003 & EMP-004: Not yet checked in!
                }
            }
        }

        // 6. Leave Requests (Approved and Pending)
        LeaveRequest::updateOrCreate(
            [
                'employee_id' => $employees[2]->id, // Rini
                'start_date' => (clone $now)->addDays(2)->toDateString(),
            ],
            [
                'type' => 'leave',
                'end_date' => (clone $now)->addDays(3)->toDateString(),
                'reason' => 'Menghadiri acara pernikahan saudara kandung di luar kota.',
                'status' => 'pending',
            ]
        );

        LeaveRequest::updateOrCreate(
            [
                'employee_id' => $employees[3]->id, // Dewi
                'start_date' => (clone $now)->addDays(1)->toDateString(),
            ],
            [
                'type' => 'sick',
                'end_date' => (clone $now)->addDays(1)->toDateString(),
                'reason' => 'Pemeriksaan rutin gigi ke dokter spesialis.',
                'status' => 'pending',
            ]
        );

        LeaveRequest::updateOrCreate(
            [
                'employee_id' => $employees[0]->id, // Siti
                'start_date' => (clone $now)->subDays(5)->toDateString(),
            ],
            [
                'type' => 'leave',
                'end_date' => (clone $now)->subDays(5)->toDateString(),
                'reason' => 'Izin keperluan keluarga mendesak.',
                'status' => 'approved',
                'approved_by' => $admin->id,
                'review_notes' => 'Disetujui. Harap shift digantikan oleh kasir pengganti.',
                'reviewed_at' => (clone $now)->subDays(6),
            ]
        );

        // 7. Initial Audit Log
        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'system_initialized',
            'entity_type' => 'System',
            'entity_id' => null,
            'details' => ['message' => 'Sistem absensi dan seeder toko ritel diinisialisasi.'],
            'ip_address' => '127.0.0.1',
        ]);
    }
}
