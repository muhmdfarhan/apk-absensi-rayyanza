<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

class RegistrationTest extends TestCase
{
    public function test_public_registration_is_disabled(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(404);
    }

    public function test_public_registration_post_is_disabled(): void
    {
        $response = $this->post('/register', [
            'name' => 'Stranger',
            'email' => 'stranger@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);
        $response->assertStatus(404);
    }
}
