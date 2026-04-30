<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeMateriel extends Model
{
    use HasFactory;

    protected $table = 'demandes_materiels';

    protected $fillable = [
        'type_demandeur',
        'demandeur',
        'categorie',
        'quantite',
        'equipement_souhaite',
        'urgence',
        'date_souhaitee',
        'justificatif',
        'piece_jointe',
        'statut',
    ];

    protected $appends = ['piece_jointe_url'];

    public function getPieceJointeUrlAttribute(): ?string
    {
        if (!$this->piece_jointe) {
            return null;
        }

        return asset('storage/' . $this->piece_jointe);
    }
}
