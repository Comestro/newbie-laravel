<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\UserRole;
use App\Models\RetailerProfile;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'role' => ['nullable', 'string', 'in:USER,RETAILER'],
        ])->validate();

        $role = ($input['role'] ?? 'USER') === 'RETAILER' ? UserRole::RETAILER : UserRole::USER;

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role' => $role,
        ]);

        if ($role === UserRole::RETAILER) {
            RetailerProfile::create([
                'user_id' => $user->id,
                'status' => 'PENDING',
            ]);
        }

        return $user;
    }
}
