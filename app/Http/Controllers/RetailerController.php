<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class RetailerController extends Controller
{
    public function dashboard(): Response
    {
        return Inertia::render('Retailer/Dashboard', [
            'user' => auth()->user(),
        ]);
    }
}

