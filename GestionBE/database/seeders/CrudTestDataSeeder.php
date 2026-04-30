<?php

namespace Database\Seeders;

use App\Models\Affectation;
use App\Models\DemandeAdministration;
use App\Models\DemandeAttestation;
use App\Models\DemandeMateriel;
use App\Models\Departement;
use App\Models\Employe;
use App\Models\Equipement;
use App\Models\ReclamationRh;
use App\Models\ReclamationSalaire;
use App\Models\Restitution;
use Illuminate\Database\Seeder;

class CrudTestDataSeeder extends Seeder
{
    public function run(): void
    {
        $departement = Departement::query()->firstOrCreate(
            ['nom' => 'INFO'],
            ['parent_id' => null]
        );

        $employees = collect([
            [
                'matricule' => 'EMP-001',
                'num_badge' => 'BDG-001',
                'nom' => 'Nadia',
                'prenom' => 'Ouahbi',
                'email' => 'nadia.ouahbi@example.test',
                'tel' => '0600000001',
                'fonction' => 'Assistante RH',
                'date_embauche' => '2024-01-15',
                'date_entree' => '2024-01-15',
                'salaire_base' => 5500,
                'departement_id' => $departement->id,
                'active' => 1,
            ],
            [
                'matricule' => 'EMP-002',
                'num_badge' => 'BDG-002',
                'nom' => 'Omar',
                'prenom' => 'Chafik',
                'email' => 'omar.chafik@example.test',
                'tel' => '0600000002',
                'fonction' => 'Technicien IT',
                'date_embauche' => '2024-02-01',
                'date_entree' => '2024-02-01',
                'salaire_base' => 6200,
                'departement_id' => $departement->id,
                'active' => 1,
            ],
            [
                'matricule' => 'EMP-003',
                'num_badge' => 'BDG-003',
                'nom' => 'Salma',
                'prenom' => 'Alaoui',
                'email' => 'salma.alaoui@example.test',
                'tel' => '0600000003',
                'fonction' => 'Comptable',
                'date_embauche' => '2024-03-10',
                'date_entree' => '2024-03-10',
                'salaire_base' => 7000,
                'departement_id' => $departement->id,
                'active' => 1,
            ],
            [
                'matricule' => 'EMP-004',
                'num_badge' => 'BDG-004',
                'nom' => 'Youssef',
                'prenom' => 'Bennani',
                'email' => 'youssef.bennani@example.test',
                'tel' => '0600000004',
                'fonction' => 'Acheteur',
                'date_embauche' => '2024-04-05',
                'date_entree' => '2024-04-05',
                'salaire_base' => 6400,
                'departement_id' => $departement->id,
                'active' => 1,
            ],
            [
                'matricule' => 'EMP-005',
                'num_badge' => 'BDG-005',
                'nom' => 'Imane',
                'prenom' => 'Rami',
                'email' => 'imane.rami@example.test',
                'tel' => '0600000005',
                'fonction' => 'Gestionnaire Admin',
                'date_embauche' => '2024-05-20',
                'date_entree' => '2024-05-20',
                'salaire_base' => 5800,
                'departement_id' => $departement->id,
                'active' => 1,
            ],
        ])->map(fn ($employee) => Employe::query()->updateOrCreate(
            ['matricule' => $employee['matricule']],
            $employee
        ));

        $employeeNames = $employees
            ->map(fn (Employe $employe) => trim(($employe->nom ?? '') . ' ' . ($employe->prenom ?? '')))
            ->filter()
            ->values();

        foreach ([
            [
                'designation' => 'Laptop Dell Latitude 5440',
                'categorie' => 'Informatique',
                'numero_serie' => 'EQ-INFO-001',
                'valeur' => 12999.00,
                'etat' => 'Bon',
                'statut' => 'Affecte',
            ],
            [
                'designation' => 'Ecran HP 24 pouces',
                'categorie' => 'Informatique',
                'numero_serie' => 'EQ-INFO-002',
                'valeur' => 2499.00,
                'etat' => 'Bon',
                'statut' => 'Disponible',
            ],
            [
                'designation' => 'Chaise ergonomique',
                'categorie' => 'Mobilier',
                'numero_serie' => 'EQ-MOB-001',
                'valeur' => 1890.00,
                'etat' => 'Neuf',
                'statut' => 'Disponible',
            ],
            [
                'designation' => 'Telephone IP Cisco',
                'categorie' => 'Telephonie',
                'numero_serie' => 'EQ-TEL-001',
                'valeur' => 950.00,
                'etat' => 'Bon',
                'statut' => 'Affecte',
            ],
            [
                'designation' => 'Imprimante Brother HL',
                'categorie' => 'Bureautique',
                'numero_serie' => 'EQ-BUR-001',
                'valeur' => 2100.00,
                'etat' => 'Usage',
                'statut' => 'Disponible',
            ],
        ] as $equipementData) {
            Equipement::query()->updateOrCreate(
                ['numero_serie' => $equipementData['numero_serie']],
                $equipementData
            );
        }

        $equipements = Equipement::query()->orderBy('id')->get()->keyBy('numero_serie');

        $affectation1 = Affectation::query()->updateOrCreate(
            ['equipement_id' => $equipements['EQ-INFO-001']->id],
            [
                'employe_id' => $employees[0]->id,
                'equipement_id' => $equipements['EQ-INFO-001']->id,
                'date_attribution' => '2026-03-03',
                'etat' => 'Bon',
                'commentaire' => 'Affectation test CRUD',
            ]
        );

        $affectation2 = Affectation::query()->updateOrCreate(
            ['equipement_id' => $equipements['EQ-TEL-001']->id],
            [
                'employe_id' => $employees[1]->id,
                'equipement_id' => $equipements['EQ-TEL-001']->id,
                'date_attribution' => '2026-03-10',
                'etat' => 'Bon',
                'commentaire' => 'Deuxieme affectation test',
            ]
        );

        Restitution::query()->updateOrCreate(
            ['equipement_id' => $equipements['EQ-TEL-001']->id, 'statut' => 'restitue'],
            [
                'equipement_id' => $equipements['EQ-TEL-001']->id,
                'affectation_id' => $affectation2->id,
                'employe_actuel_id' => $employees[1]->id,
                'date_attribution' => $affectation2->date_attribution,
                'etat' => 'Bon',
                'statut' => 'restitue',
                'date_retour' => '2026-03-28',
                'etat_retour' => 'Bon',
                'nouvel_employe_id' => null,
                'date_transfert' => null,
                'commentaire' => 'Restitution de test',
            ]
        );

        foreach ([
            [
                'employe' => $employeeNames[0] ?? 'Nadia Ouahbi',
                'type' => 'Attestation de travail',
                'langue' => 'Francais',
                'destinataire' => 'Banque Populaire',
                'date_souhaitee' => '2026-04-07',
                'statut' => 'En attente',
            ],
            [
                'employe' => $employeeNames[2] ?? 'Salma Alaoui',
                'type' => 'Attestation de salaire',
                'langue' => 'Arabe',
                'destinataire' => 'CNSS',
                'date_souhaitee' => '2026-04-09',
                'statut' => 'Traitee',
            ],
        ] as $data) {
            DemandeAttestation::query()->updateOrCreate(
                ['employe' => $data['employe'], 'type' => $data['type'], 'date_souhaitee' => $data['date_souhaitee']],
                $data
            );
        }

        foreach ([
            [
                'employe_id' => $employees[0]->id,
                'mois_concerne' => '2026-03',
                'type_probleme' => 'Salaire incorrect',
                'description' => 'Montant verse inferieur au salaire habituel.',
                'piece_jointe' => null,
                'statut' => 'En attente',
            ],
            [
                'employe_id' => $employees[1]->id,
                'mois_concerne' => '2026-02',
                'type_probleme' => 'Heures supplementaires non payees',
                'description' => '12 heures supplementaires non visibles sur le bulletin.',
                'piece_jointe' => null,
                'statut' => 'Resolue',
            ],
        ] as $data) {
            ReclamationSalaire::query()->updateOrCreate(
                ['employe_id' => $data['employe_id'], 'mois_concerne' => $data['mois_concerne'], 'type_probleme' => $data['type_probleme']],
                $data
            );
        }

        foreach ([
            [
                'employe' => $employeeNames[0] ?? 'Nadia Ouahbi',
                'type_reclamation' => 'Prime non versee',
                'montant' => 1200.00,
                'date' => '2026-04-01',
                'statut' => 'En attente',
            ],
            [
                'employe' => $employeeNames[3] ?? 'Youssef Bennani',
                'type_reclamation' => 'Retard paiement',
                'montant' => 0,
                'date' => '2026-04-02',
                'statut' => 'En cours',
            ],
        ] as $data) {
            ReclamationRh::query()->updateOrCreate(
                ['employe' => $data['employe'], 'type_reclamation' => $data['type_reclamation'], 'date' => $data['date']],
                $data
            );
        }

        foreach ([
            [
                'employe' => $employeeNames[1] ?? 'Omar Chafik',
                'type_demande' => 'Demande de badge',
                'date_demande' => '2026-04-03',
                'statut' => 'En attente',
                'commentaire' => 'Remplacement de badge endommage.',
            ],
            [
                'employe' => $employeeNames[4] ?? 'Imane Rami',
                'type_demande' => 'Demande de parking',
                'date_demande' => '2026-04-04',
                'statut' => 'Validee',
                'commentaire' => 'Besoin d acces parking permanent.',
            ],
        ] as $data) {
            DemandeAdministration::query()->updateOrCreate(
                ['employe' => $data['employe'], 'type_demande' => $data['type_demande'], 'date_demande' => $data['date_demande']],
                $data
            );
        }

        foreach ([
            [
                'demandeur' => $employeeNames[2] ?? 'Salma Alaoui',
                'categorie' => 'Informatique',
                'equipement_souhaite' => 'Clavier ergonomique',
                'urgence' => 'Normal',
                'date_souhaitee' => '2026-04-12',
                'justificatif' => 'Besoin de materiel pour ameliorer le confort de travail.',
                'piece_jointe' => null,
                'statut' => 'En attente',
            ],
            [
                'demandeur' => $employeeNames[0] ?? 'Nadia Ouahbi',
                'categorie' => 'Mobilier',
                'equipement_souhaite' => 'Caisson de rangement',
                'urgence' => 'Faible',
                'date_souhaitee' => '2026-04-18',
                'justificatif' => 'Organisation des dossiers papier du service RH.',
                'piece_jointe' => null,
                'statut' => 'Validee',
            ],
        ] as $data) {
            DemandeMateriel::query()->updateOrCreate(
                ['demandeur' => $data['demandeur'], 'equipement_souhaite' => $data['equipement_souhaite'], 'date_souhaitee' => $data['date_souhaitee']],
                $data
            );
        }

        $this->command?->info('CRUD test data seeded successfully.');
    }
}
