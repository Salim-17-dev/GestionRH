<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BienEtreIdee extends Model
{
    use HasFactory;

    protected $table = 'bien_etre_idees';
    
    protected $fillable = [
        'titre',
        'description',
        'type',
        'budget',
        'urgence',
        'pdfName',
        'pdfDataUrl',
        'votes',
        'status',
    ];

    protected $casts = [
        'votes' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
