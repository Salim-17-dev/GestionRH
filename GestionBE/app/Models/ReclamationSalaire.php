<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReclamationSalaire extends Model
{
    use HasFactory;

    protected $table = 'reclamation_salaires';

    protected $fillable = [
        'employe_id',
        'mois_concerne',
        'type_probleme',
        'description',
        'piece_jointe',
        'piece_jointe_nom',
        'statut',
    ];

    public function employe()
    {
        return $this->belongsTo(Employe::class);
    }
}
