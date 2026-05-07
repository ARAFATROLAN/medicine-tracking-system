<?php
require 'vendor/autoload.php';
 = require 'bootstrap/app.php';
->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
 = app('db');
echo 'Roles: ' . ->table('roles')->count() . PHP_EOL;
echo 'User roles: ' . ->table('user_roles')->count() . PHP_EOL;
