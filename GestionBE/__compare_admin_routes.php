<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
foreach (['api/demandes-administration','api/reclamations'] as $target) {
  foreach (app('router')->getRoutes() as $route) {
    if ($route->uri() === $target && in_array('GET', $route->methods(), true)) {
      echo $target.' => '.json_encode($route->gatherMiddleware()).PHP_EOL;
      break;
    }
  }
}
