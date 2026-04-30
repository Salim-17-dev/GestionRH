<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeAttestation extends Model
{
    protected $table = 'demandes_attestations';

    protected $fillable = [
        'employe',
        'type',
        'langue',
        'destinataire',
        'date_souhaitee',
        'commentaire',
        'statut',
    ];

    use HasFactory;
}
