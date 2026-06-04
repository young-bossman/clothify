<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $name     = env('ADMIN_NAME');
        $email    = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        // Validate all three are present
        if (!$name || !$email || !$password) {
            $this->command->error('ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must all be set in .env');
            return;
        }

        // Validate email format
        $validator = Validator::make(
            ['email' => $email, 'password' => $password],
            [
                'email'    => 'required|email',
                'password' => 'required|min:12',
            ]
        );

        if ($validator->fails()) {
            $this->command->error('Invalid admin credentials in .env:');
            foreach ($validator->errors()->all() as $error) {
                $this->command->error("  - {$error}");
            }
            return;
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name'     => $name,
                'password' => Hash::make($password),
                'role'     => 'admin',
            ]
        );

        $this->command->info("Admin account ready: {$user->email}");
        $this->command->warn("Remove ADMIN_PASSWORD from .env after first login.");
    }
}