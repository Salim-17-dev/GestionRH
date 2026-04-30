<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Affectation extends Model
{
    use HasFactory;

    protected $fillable = [
        'employe_id',
        'equipement_id',
        'date_attribution',
        'etat',
        'commentaire',
    ];

    public function employe(): BelongsTo
    {
        return $this->belongsTo(Employe::class);
    }

    public function equipement(): BelongsTo
    {
        return $this->belongsTo(Equipement::class);
    }

    public function restitutions(): HasMany
    {
        return $this->hasMany(Restitution::class);
    }
}
