export const AIRCRAFT={
 a320:{name:"Airbus A320",family:"A320",category:"airliner",label:"A320 · PFD/ND (didático)",speed:650,alt:3000,heading:110,climb:0,engine:"N1 76% (sim.)",external:"Modelo geométrico"},
 b738:{name:"Boeing 737-800",family:"B737",category:"airliner",label:"B737 · EFIS (didático)",speed:680,alt:3500,heading:110,climb:0,engine:"N1 74% (sim.)",external:"Modelo geométrico"},
 c172:{name:"Cessna 172",family:"C172",category:"single",label:"C172 · Seis instrumentos (didático)",speed:170,alt:1200,heading:110,climb:0,engine:"RPM 2350 (sim.)",external:"Modelo geométrico"},
 h125:{name:"Airbus H125",family:"H125",category:"heli",label:"H125 · Painel helicóptero (didático)",speed:165,alt:700,heading:110,climb:0,engine:"NR 100% (sim.)",external:"Modelo geométrico"}
};
export const LOCATIONS={
 friburgo:{lat:-22.281,lon:-42.532,name:"Nova Friburgo",heading:110},
 rio:{lat:-22.95,lon:-43.20,name:"Rio de Janeiro",heading:70},
 alpes:{lat:46.68,lon:8.25,name:"Alpes",heading:135},
 nyc:{lat:40.72,lon:-74.0,name:"Nova York",heading:45}
};
export function moveGeodesic(lat,lon,headingDeg,distanceMeters){
 const radius=6378137,delta=distanceMeters/radius,heading=headingDeg*Math.PI/180;
 const phi1=lat*Math.PI/180,lambda1=lon*Math.PI/180;
 const phi2=Math.asin(Math.sin(phi1)*Math.cos(delta)+Math.cos(phi1)*Math.sin(delta)*Math.cos(heading));
 const lambda2=lambda1+Math.atan2(Math.sin(heading)*Math.sin(delta)*Math.cos(phi1),Math.cos(delta)-Math.sin(phi1)*Math.sin(phi2));
 return {lat:phi2*180/Math.PI,lon:((lambda2*180/Math.PI+540)%360)-180};
}
export function normalizeHeading(heading){return ((heading%360)+360)%360}
export function headingLabel(h){return ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"][Math.round(normalizeHeading(h)/22.5)%16]}
export function toTelemetry({lat,lon,alt,speed,heading,travelKm}){return {lat,lon,altitudeM:alt,groundSpeedKmh:speed,headingDeg:heading,travelKm,source:"simulated",observed:false}}
