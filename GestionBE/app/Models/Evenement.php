<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evenement extends Model
{
    use HasFactory;

    protected $table = 'evenements';
    
    protected $fillable = [
        'titre',
        'description',
        'type',
        'date',
        'lieu',
        'budget',
        'status',
    ];

    protected $casts = [
        'budget' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
