<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReclamationRh extends Model
{
    use HasFactory;

    protected $table = 'reclamations_rh';

    protected $fillable = [
        'employe',
        'type_reclamation',
        'montant',
        'date',
        'statut',
    ];
}
