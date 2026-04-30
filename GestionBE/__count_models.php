<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$models = [
  'employes' => App\Models\Employe::class,
  'attestations' => App\Models\DemandeAttestation::class,
  'reclamation_salaires' => App\Models\ReclamationSalaire::class,
  'reclamations_rh' => App\Models\ReclamationRh::class,
  'demandes_administration' => App\Models\DemandeAdministration::class,
  'equipements' => App\Models\Equipement::class,
  'affectations' => App\Models\Affectation::class,
  'restitutions' => App\Models\Restitution::class,
  'demandes_materiels' => App\Models\DemandeMateriel::class,
];
$out = [];
foreach ($models as $key => $class) {
  $out[$key] = $class::count();
}
echo json_encode($out, JSON_PRETTY_PRINT);
