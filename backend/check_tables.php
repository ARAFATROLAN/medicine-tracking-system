<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$db = app('db');
echo 'Roles: ' . $db->table('roles')->count() . PHP_EOL;
echo 'User roles: ' . $db->table('user_roles')->count() . PHP_EOL;
