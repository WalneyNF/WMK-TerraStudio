<?php
/** Consulta regional pública ADSB.lol: cache, limites e dados normalizados. */
declare(strict_types=1);
require_once __DIR__.'/flights_lib.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function result(int $status,array $data): void {http_response_code($status);echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);exit;}
if(($_SERVER['REQUEST_METHOD']??'GET')!=='GET')result(405,['error'=>'method_not_allowed']);
$center=wmk_validate_center($_GET);
if($center===null)result(400,['error'=>'invalid_coordinates']);
$dir=sys_get_temp_dir().DIRECTORY_SEPARATOR.'wmk_flight_cache_'.substr(hash('sha256',__DIR__),0,12);
if(!is_dir($dir)&&!@mkdir($dir,0700,true)&&!is_dir($dir))result(503,['error'=>'cache_unavailable']);
$key=sprintf('%.2f_%.2f',$center['lat'],$center['lon']);
$path=$dir.DIRECTORY_SEPARATOR.hash('sha256',$key).'.json';
$lock=@fopen($dir.DIRECTORY_SEPARATOR.'provider.lock','c+');
if(!$lock||!flock($lock,LOCK_EX))result(503,['error'=>'lock_unavailable']);
$existing=is_file($path)?json_decode((string)@file_get_contents($path),true):null;
$now=time();
if(is_array($existing)&&($now-(int)($existing['fetchedAtEpoch']??0))<180){
 $existing['cached']=true;flock($lock,LOCK_UN);fclose($lock);result(200,$existing);
}
$stampFile=$dir.DIRECTORY_SEPARATOR.'rate.json';
$rate=is_file($stampFile)?json_decode((string)@file_get_contents($stampFile),true):[];
$today=gmdate('Y-m-d');
if(!is_array($rate)||($rate['date']??'')!==$today)$rate=['date'=>$today,'count'=>0,'last'=>0];
$dailyLimitReached = $rate['count']>=430;
$cooldownSeconds = max(0,180-($now-(int)$rate['last']));
if($dailyLimitReached||$cooldownSeconds>0){
 flock($lock,LOCK_UN);fclose($lock);
 if(is_array($existing)){
   $existing['cached']=true;$existing['stale']=true;
   $existing['retryAfterSeconds']=$dailyLimitReached?null:$cooldownSeconds;
   result(200,$existing);
 }
 $retry=$dailyLimitReached?null:$cooldownSeconds;
 // Uma consulta negada por nossa política não deve parecer falha inesperada do PHP.
 result(200,['source'=>'WMK Flight Radar','dataKind'=>'no_current_positions',
   'aircraft'=>[],'stale'=>false,'cached'=>false,'cooldown'=>true,
   'error'=>$dailyLimitReached?'daily_limit':'local_cooldown',
   'retryAfterSeconds'=>$retry,
   'message'=>$dailyLimitReached
       ?'Limite de proteção diário atingido. Tente amanhã.'
       :'Proteção da API: aguarde '.(string)$retry.' segundos antes de buscar outra região.',
   'fetchedAtEpoch'=>$now]);
}
$rate['count']++;$rate['last']=$now;
file_put_contents($stampFile,json_encode($rate),LOCK_EX);
$latitude=$center['lat'];$longitude=$center['lon'];
$endpoint=sprintf('https://api.adsb.lol/v2/lat/%s/lon/%s/dist/100',rawurlencode((string)$latitude),rawurlencode((string)$longitude));
$ctx=stream_context_create(['http'=>['method'=>'GET','timeout'=>9,'ignore_errors'=>true,'header'=>"User-Agent: WMK-TerraStudio-FlightViewer/0.2\r\nAccept: application/json\r\n"]]);
$raw=@file_get_contents($endpoint,false,$ctx,0,2000001);
$headers=$http_response_header??[];
$status=0;foreach($headers as $line){if(preg_match('~^HTTP/\S+\s+(\d{3})~',$line,$m))$status=(int)$m[1];}
if($raw===false||strlen($raw)>2000000||$status!==200){
 flock($lock,LOCK_UN);fclose($lock);
 if(is_array($existing)){
   $existing['stale']=true;$existing['cached']=true;
   $existing['providerError']=$status===429?'provider_rate_limited':'upstream_unavailable';
   result(200,$existing);
 }
 result($status===429?429:502,['error'=>$status===429?'provider_rate_limited':'upstream_unavailable',
   'upstreamStatus'=>$status,'retryAfterSeconds'=>$status===429?180:null,
   'message'=>$status===429
       ?'O provedor ADS-B.lol limitou as consultas. Aguarde antes de tentar novamente.'
       :'Não foi possível consultar o provedor. Verifique a conexão ou teste aeronaves de demonstração.']);
}
$upstream=json_decode($raw,true);
if(!is_array($upstream)||!isset($upstream['ac'])||!is_array($upstream['ac'])){
 flock($lock,LOCK_UN);fclose($lock);result(502,['error'=>'invalid_upstream']);
}
$out=['source'=>'ADSB.lol','dataKind'=>'observed_positions','fetchedAtEpoch'=>$now,
 'center'=>$center,'cached'=>false,'stale'=>false,
 'aircraft'=>wmk_normalize_flights($upstream)];
file_put_contents($path,json_encode($out,JSON_UNESCAPED_UNICODE),LOCK_EX);
flock($lock,LOCK_UN);fclose($lock);result(200,$out);
