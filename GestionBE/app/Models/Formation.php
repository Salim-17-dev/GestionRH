<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    use HasFactory;

    protected $table = 'formations';
    
    protected $fillable = [
        'titre',
        'description',
        'domaine',
        'duree',
        'type',
        'votes',
        'status',
    ];

    protected $casts = [
        'votes' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
