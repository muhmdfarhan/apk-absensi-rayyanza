<?php

// Ensure writable directories exist in /tmp for serverless execution
$dirs = [
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/cache',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/logs',
    '/tmp/bootstrap/cache',
];

foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// Copy pre-seeded SQLite database to writable /tmp if it doesn't exist
$targetDb = '/tmp/database.sqlite';
$sourceDb = __DIR__ . '/../database/database.sqlite';
if (!file_exists($targetDb) && file_exists($sourceDb)) {
    @copy($sourceDb, $targetDb);
    @chmod($targetDb, 0666);
}

// Forward Vercel serverless requests to Laravel's public entrypoint
require __DIR__ . '/../public/index.php';
