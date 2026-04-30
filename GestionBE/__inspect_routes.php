<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$targets = ['/api/reclamations-salaire','/api/equipements','/api/affectations','/api/restitutions','/api/demandes'];
foreach (app('router')->getRoutes() as $route) {
    if (in_array('/'.ltrim($route->uri(), '/'), $targets, true)) {
        echo $route->methods()[0].' '.$route->uri().' | '.json_encode($route->gatherMiddleware()).PHP_EOL;
    }
}
