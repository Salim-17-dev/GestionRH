<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
foreach (['api/demandes-attestation','api/demandes-administration','api/reclamations-salaire','api/reclamations','api/equipements','api/affectations','api/restitutions','api/demandes','api/employes-options'] as $target) {
  foreach (app('router')->getRoutes() as $route) {
    if ($route->uri() === $target && in_array('GET', $route->methods(), true)) {
      echo $target.' => '.json_encode($route->gatherMiddleware()).PHP_EOL;
      break;
    }
  }
}
