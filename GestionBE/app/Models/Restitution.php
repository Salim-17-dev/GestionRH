<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Restitution extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipement_id',
        'affectation_id',
        'employe_actuel_id',
        'date_attribution',
        'etat',
        'statut',
        'date_retour',
        'etat_retour',
        'nouvel_employe_id',
        'date_transfert',
        'commentaire',
    ];

    public function equipement(): BelongsTo
    {
        return $this->belongsTo(Equipement::class);
    }

    public function affectation(): BelongsTo
    {
        return $this->belongsTo(Affectation::class);
    }

    public function employeActuel(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'employe_actuel_id');
    }

    public function nouvelEmploye(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'nouvel_employe_id');
    }
}
