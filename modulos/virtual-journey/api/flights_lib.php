<?php
/** WMK Flight Radar - normalização e limites. Não inclui lógica de acesso à rede. */
declare(strict_types=1);
function wmk_finite($v): ?float {
    if (!is_int($v) && !is_float($v) && !(is_string($v) && is_numeric($v))) return null;
    $f=(float)$v; return is_finite($f)?$f:null;
}
function wmk_normalize_flights(array $payload): array {
    $now=(int)($payload['now']??time());
    $items=[]; $source=$payload['ac']??[];
    if (!is_array($source)) return [];
    foreach ($source as $row) {
        if (!is_array($row)) continue;
        $lat=wmk_finite($row['lat']??null);$lon=wmk_finite($row['lon']??null);
        if ($lat===null||$lon===null||abs($lat)>90||abs($lon)>180) continue;
        $seen=wmk_finite($row['seen_pos']??$row['seen']??null);
        if ($seen===null||$seen>120) continue;
        $hex=strtolower(trim((string)($row['hex']??'')));
        if (!preg_match('/^[0-9a-f]{6}$/',$hex)) continue;
        $altFeet=wmk_finite($row['alt_geom']??null);
        if ($altFeet===null) $altFeet=wmk_finite($row['alt_baro']??null);
        $ground=($row['alt_baro']??null)==='ground';
        $gs=wmk_finite($row['gs']??null);
        $track=wmk_finite($row['track']??null);
        $model=strtoupper(trim((string)($row['t']??'')));
        $items[]=[
            'icao24'=>$hex,'callsign'=>substr(trim((string)($row['flight']??'')),0,18),
            'registration'=>substr(trim((string)($row['r']??'')),0,24),
            'typeCode'=>substr($model,0,12),
            'latitude'=>$lat,'longitude'=>$lon,
            'altitudeM'=>$ground?0:($altFeet===null?null:round($altFeet*0.3048,1)),
            'groundSpeedKmh'=>$gs===null?null:round($gs*1.852,1),
            'headingDeg'=>$track===null?null:fmod($track+360,360),
            'verticalRateMps'=>($v=wmk_finite($row['baro_rate']??null))===null?null:round($v*0.00508,2),
            'lastSeenEpoch'=>$now-max(0,(int)$seen),'onGround'=>$ground
        ];
        if(count($items)>=150)break;
    }
    return $items;
}
function wmk_validate_center(array $q): ?array {
    $lat=wmk_finite($q['lat']??null);$lon=wmk_finite($q['lon']??null);
    if($lat===null||$lon===null||abs($lat)>90||abs($lon)>180)return null;
    return ['lat'=>round($lat,2),'lon'=>round($lon,2),'radiusNm'=>100];
}
