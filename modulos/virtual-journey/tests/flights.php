<?php
declare(strict_types=1);
require dirname(__DIR__).'/api/flights_lib.php';
function check(bool $ok,string $message):void {if(!$ok){fwrite(STDERR,"FALHA: ".$message."\n");exit(1);}}
$p=['now'=>1794710000,'ac'=>[
 ['hex'=>'a1b2c3','lat'=>-22.3,'lon'=>-42.5,'alt_baro'=>10000,'gs'=>100,'track'=>90,'seen'=>5,'flight'=>'TST123','t'=>'B738'],
 ['hex'=>'xyz','lat'=>-22,'lon'=>-42,'seen'=>2],
 ['hex'=>'a1b2c4','lat'=>-22,'lon'=>-42,'seen'=>999],
 ]];
$list=wmk_normalize_flights($p);
check(count($list)===1,'Apenas observações recentes e identificadas');
check(abs($list[0]['groundSpeedKmh']-185.2)<.01,'Conversão de nós para km/h');
check(abs($list[0]['altitudeM']-3048)<.01,'Conversão pés para metros');
check($list[0]['lastSeenEpoch']===1794709995,'Timestamp');
check(wmk_validate_center(['lat'=>'-22.28','lon'=>'-42.53'])!==null,'Coordenadas');
check(wmk_validate_center(['lat'=>'-91','lon'=>'0'])===null,'Bloquear coordenadas inválidas');
echo "OK: normalização, conversões, filtros e coordenadas\n";
