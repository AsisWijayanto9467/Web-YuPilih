<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make("Password123");

        $it = Division::where("name", "IT")->first();
        $finance = Division::where("name", "finance")->first();

        User::create([
            "username" => "AnggaPrida",
            "password" => $defaultPassword,
            "role" => "admin",
            "created_at" => now(),
            "updated_at" => now(),
            "division_id" => $it->id,
        ]);


        User::create([
            "username" => "Dewantara",
            "password" => $defaultPassword,
            "role" => "user",
            "created_at" => now(),
            "updated_at" => now(),
            "division_id" => $finance->id,
        ]);

        User::create([
            "username" => "Agus Sarwono",
            "password" => $defaultPassword,
            "role" => "user",
            "created_at" => now(),
            "updated_at" => now(),
            "division_id" => $it->id,
        ]);
    }
}
