<?php
/** Amostra estática para testar a cabine SEM consultar APIs externas. */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$regions=[
 'friburgo'=>[-22.281,-42.532],
 'rio'=>[-22.95,-43.20],
 'alpes'=>[46.68,8.25],
 'nyc'=>[40.72,-74.0]
];
$region=(string)($_GET['region']??'rio');
if(!isset($regions[$region])){$region='rio';}
[$lat,$lon]=$regions[$region];
$types=[['typeCode'=>'A320','callsign'=>'WMKDEMO1','registration'=>'DEMO-A320','groundSpeedKmh'=>730,'altitudeM'=>8500,'headingDeg'=>110],
['typeCode'=>'B738','callsign'=>'WMKDEMO2','registration'=>'DEMO-B738','groundSpeedKmh'=>680,'altitudeM'=>9200,'headingDeg'=>230],
['typeCode'=>'C172','callsign'=>'WMKDEMO3','registration'=>'DEMO-C172','groundSpeedKmh'=>175,'altitudeM'=>1550,'headingDeg'=>75],
['typeCode'=>'H125','callsign'=>'WMKHELI','registration'=>'DEMO-H125','groundSpeedKmh'=>155,'altitudeM'=>700,'headingDeg'=>40]];
$rows=[];
foreach($types as $i=>$type){
 $rows[]=array_merge($type,['icao24'=>sprintf('f000%02x',$i),
   'latitude'=>$lat+($i-1.5)*0.035,'longitude'=>$lon+($i-1.5)*0.035,
   'lastSeenEpoch'=>time(),'onGround'=>false,'demo'=>true]);
}
echo json_encode(['source'=>'WMK - demonstração offline','dataKind'=>'simulated_sample','fetchedAtEpoch'=>time(),
 'aircraft'=>$rows,'cached'=>false,'stale'=>false,'sample'=>true],JSON_UNESCAPED_UNICODE);
