<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\LoyaltyService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LoyaltyTestSeeder extends Seeder
{
    public function run(): void
    {
        $loyaltyService = app(LoyaltyService::class);

        // Create test users with different tiers
        $users = [
            [
                'name' => 'Bronze User',
                'email' => 'bronze@test.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'points' => 250,
            ],
            [
                'name' => 'Silver User',
                'email' => 'silver@test.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'points' => 800,
            ],
            [
                'name' => 'Gold User',
                'email' => 'gold@test.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'points' => 2000,
            ],
            [
                'name' => 'Platinum User',
                'email' => 'platinum@test.com',
                'password' => bcrypt('password'),
                'role' => 'user',
                'points' => 3500,
            ],
        ];

        foreach ($users as $userData) {
            $points = $userData['points'];
            unset($userData['points']);

            $user = User::where('email', $userData['email'])->first();
            
            if (!$user) {
                $user = User::create($userData);
            }

            // Ensure loyalty tier exists
            $tier = $loyaltyService->ensureLoyaltyTier($user);
            
            // Only award points if not already awarded
            if ($tier->lifetime_points == 0) {
                $loyaltyService->awardPoints(
                    $user,
                    $points,
                    'earned',
                    'order',
                    null,
                    'Test order points'
                );
            }

            // Generate referral code
            $loyaltyService->generateReferralCode($user);

            echo "Created/Updated {$user->name} with {$user->fresh()->loyaltyTier->lifetime_points} points (Tier: {$user->fresh()->loyaltyTier->tier})\n";
        }

        echo "\nLoyalty test data seeded successfully!\n";
        echo "Login credentials:\n";
        echo "- bronze@test.com / password (Bronze tier)\n";
        echo "- silver@test.com / password (Silver tier)\n";
        echo "- gold@test.com / password (Gold tier)\n";
        echo "- platinum@test.com / password (Platinum tier)\n";
    }
}
