<?php

namespace Database\Seeders;

use App\Models\Division;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DivisonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisions = [
            "IT",
            "Payment",
            "Procurement",
            "finance",
        ];

        foreach($divisions as $name) {
            Division::create([
                "name" => $name
            ]);
        }
    }
}
