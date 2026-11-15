import {AIRCRAFT,LOCATIONS,moveGeodesic,normalizeHeading,headingLabel,toTelemetry} from "./models.js";
const el=id=>document.getElementById(id);
let viewer=null,entity=null,trail=null,lastTime=0,playing=false,started=false,mode="cockpit";
let flight=null,locations=[],flightModel="a320";
let live=false, selectedFlight=null, foundFlights=[], lastLivePositionAt=0;
const Cesium=window.Cesium;
function status(s){el("state").textContent=s}
function configuration(){
 const config=AIRCRAFT[el("model").value],loc=LOCATIONS[el("location").value];
 return {lat:loc.lat,lon:loc.lon,alt:config.alt,speed:config.speed,heading:loc.heading,travelKm:0};
}
function applyModel(){
 live=false;selectedFlight=null;
 flightModel=el("model").value;
 const cfg=AIRCRAFT[flightModel];
 el("speed").max=cfg.category==="heli"?"320":cfg.category==="single"?"330":"950";
 el("speed").value=cfg.speed;el("alt").value=cfg.alt;el("heading").value=LOCATIONS[el("location").value].heading;
 el("cockpit").className="cockpit "+flightModel;
 el("flightTag").textContent="WMK DEMO · "+cfg.name;
 el("panelName").textContent=cfg.label;
 el("extraValue").textContent=cfg.engine;
 el("extraLabel").textContent=cfg.category==="heli"?"ROTOR / MOTOR (SIM.)":"MOTOR (SIM.)";
 reset();
}
function syncRanges(){
 if(!flight)return;
 flight.speed=Number(el("speed").value);
 flight.alt=Number(el("alt").value);
 flight.heading=normalizeHeading(Number(el("heading").value));
 el("speedValue").textContent=flight.speed+" km/h";
 el("altValue").textContent=flight.alt+" m";
 el("headingValue").textContent=flight.heading+"°";
}
function instruments(){
 if(!flight)return;
 const data=toTelemetry(flight);
 el("ias").textContent=Math.round(data.groundSpeedKmh);
 el("height").textContent=Math.round(data.altitudeM).toLocaleString("pt-BR");
 el("direction").textContent=Math.round(data.headingDeg)+"°";
 el("rose").textContent=headingLabel(data.headingDeg);
 el("coords").textContent=data.lat.toFixed(3)+", "+data.lon.toFixed(3);
 el("distance").textContent="Percorrido: "+data.travelKm.toFixed(2)+" km";
 el("pitchVal").textContent="0° (estimado)";
 el("source").textContent=live&&selectedFlight
 ? "DADOS ADS-B.lol · posição e movimento observados quando disponíveis. Movimento projetado por no máximo 20 s. Cockpit e sistemas internos ilustrativos. Último sinal: "+new Date(selectedFlight.lastSeenEpoch*1000).toLocaleString("pt-BR")
 : "SIMULADO · "+AIRCRAFT[flightModel].name+". Posição, velocidade e altitude são valores controlados nesta demonstração. Sistemas internos não são telemetria real.";
 el("panelName").textContent=live?("ADS-B · "+(selectedFlight.callsign||selectedFlight.icao24)+" · instrumentos ilustrativos"):AIRCRAFT[flightModel].label;
 el("flightTag").textContent=live?("OBSERVADO · "+(selectedFlight.callsign||selectedFlight.icao24)):"WMK DEMO · "+AIRCRAFT[flightModel].name;
}
function position(){return Cesium.Cartesian3.fromDegrees(flight.lon,flight.lat,flight.alt)}
function updateEntity(){
 if(!entity)return;
 const p=position();
 entity.position=p;
 entity.orientation=Cesium.Transforms.headingPitchRollQuaternion(p,new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(flight.heading),0,0));
 if(trail)trail.polyline.positions=locations.slice();
}
function updateCamera(){
 if(!viewer||mode==="free"||!flight)return;
 const p=position(), heading=Cesium.Math.toRadians(flight.heading);
 let cameraPosition;
 if(mode==="cockpit"){
  const transform=Cesium.Transforms.eastNorthUpToFixedFrame(p);
  const offset=new Cesium.Cartesian3(-Math.sin(heading)*8, -Math.cos(heading)*8,0.8);
  cameraPosition=Cesium.Matrix4.multiplyByPoint(transform,offset,new Cesium.Cartesian3());
  viewer.camera.setView({destination:cameraPosition,orientation:{heading,pitch:Cesium.Math.toRadians(-4),roll:0}});
 } else {
  let range=mode==="top"?900:mode==="wing"?230:340;
  let pitch=mode==="top"?-Cesium.Math.PI_OVER_TWO:mode==="wing"?-0.12:-0.17;
  let bearing=mode==="wing"?heading+Math.PI/2:heading;
  viewer.camera.lookAt(p,new Cesium.HeadingPitchRange(bearing,pitch,range));
  viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
 }
}
function createEntity(){
 if(!viewer)return;
 if(entity)viewer.entities.remove(entity);
 if(trail)viewer.entities.remove(trail);
 // Geometria simples própria; não tenta reproduzir um modelo 3D licenciado.
 const heli=AIRCRAFT[flightModel].category==="heli";
 entity=viewer.entities.add({name:AIRCRAFT[flightModel].name,
  position:position(),
  box:{dimensions:new Cesium.Cartesian3(heli?3:12,heli?10:18,heli?3:3),material:Cesium.Color.fromCssColorString(heli?"#8fe5b1":"#d5e4ec")},
  label:{text:"DEMO · "+AIRCRAFT[flightModel].name,font:"13px system-ui",fillColor:Cesium.Color.WHITE,pixelOffset:new Cesium.Cartesian2(0,-30),disableDepthTestDistance:100000}});
 trail=viewer.entities.add({polyline:{positions:locations.slice(),width:3,material:Cesium.Color.CYAN}});
}
function reset(){
 live=false;selectedFlight=null;
 flight=configuration();started=false;playing=false;
 locations=[positionOrNull()].filter(Boolean);
 createEntity();syncRanges();instruments();updateEntity();updateCamera();
 el("start").textContent="▶ Iniciar passeio";status("Pronto · simulação pausada");
}
function positionOrNull(){return viewer&&flight?position():null}
function animate(now){
 requestAnimationFrame(animate);
 const dt=lastTime?Math.min((now-lastTime)/1000,0.15):0;lastTime=now;
 if(!playing||!flight||!viewer)return;
 if(live&&Date.now()-lastLivePositionAt>20000){playing=false;status("Extrapolação encerrada após 20 segundos. Consulte novamente.");return;}
 const dist=flight.speed*1000/3600*dt;
 const moved=moveGeodesic(flight.lat,flight.lon,flight.heading,dist);
 flight.lat=moved.lat;flight.lon=moved.lon;flight.travelKm+=dist/1000;
 if(locations.length<1200)locations.push(position());
 else if(Math.floor(now/1000)%3===0){locations.shift();locations.push(position())}
 updateEntity();updateCamera();instruments();
}
function setCamera(next){
 mode=next;document.body.dataset.camera=mode;
 document.querySelectorAll("[data-camera]").forEach(b=>b.classList.toggle("active",b.dataset.camera===mode));
 if(viewer){viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);updateCamera()}
}
async function init(){
 if(!Cesium){el("loading").textContent="Não foi possível carregar CesiumJS. Verifique conexão com internet e bloqueio do CDN.";status("Motor 3D indisponível");return}
 Cesium.Ion.defaultAccessToken=undefined;
 try{
  viewer=new Cesium.Viewer("world",{terrainProvider:new Cesium.EllipsoidTerrainProvider(),
   imageryProvider:new Cesium.OpenStreetMapImageryProvider({url:"https://tile.openstreetmap.org/"}),
   animation:false,timeline:false,baseLayerPicker:false,geocoder:false,homeButton:false,sceneModePicker:false,navigationHelpButton:false,
   fullscreenButton:false,infoBox:false,selectionIndicator:false,requestRenderMode:false});
  viewer.scene.globe.enableLighting=false;
  viewer.scene.screenSpaceCameraController.minimumZoomDistance=5;
  el("loading").remove();applyModel();status("3D pronto · passeio simulado");
  requestAnimationFrame(animate);
 }catch(error){el("loading").textContent="Motor Cesium indisponível: "+error.message;status("Falha no globo 3D")}
}
el("start").addEventListener("click",()=>{if(!viewer)return;playing=true;started=true;el("start").textContent="▶ Continuar passeio";status("Passeio simulado em andamento")});
el("pause").addEventListener("click",()=>{playing=false;status("Pausado")});
el("reset").addEventListener("click",reset);
el("model").addEventListener("change",applyModel);
el("location").addEventListener("change",()=>{reset();foundFlights=[];renderFlights();el("flightMessage").textContent="Região modificada. Faça nova consulta."});
for(const key of ["speed","alt","heading"])el(key).addEventListener("input",()=>{if(live){el("flightMessage").textContent="Controles são demonstrativos. Use Voltar à demonstração.";return}syncRanges();updateEntity();instruments();updateCamera()});
document.querySelectorAll("[data-camera]").forEach(button=>button.addEventListener("click",()=>setCamera(button.dataset.camera)));
window.addEventListener("keydown",event=>{
 if(["INPUT","SELECT","TEXTAREA"].includes(document.activeElement?.tagName))return;
 if("12345".includes(event.key)&&event.key.length===1){const modes=["cockpit","chase","wing","top","free"];setCamera(modes[Number(event.key)-1])}
 if(event.code==="Space"){event.preventDefault();playing=!playing;status(playing?"Passeio simulado em andamento":"Pausado")}
});
document.body.dataset.camera="cockpit";
init();


/* WMK Flight Radar. ADS-B não entrega sistemas reais do cockpit. */
function modelFor(type){
 const t=String(type||"").toUpperCase();
 if(["A320","A20N","A319","A321","A21N"].includes(t))return "a320";
 if(["B738","B737","B38M","B39M"].includes(t))return "b738";
 if(["C172","C170","C182"].includes(t))return "c172";
 if(["H125","AS50","AS35"].includes(t))return "h125";
 return null;
}
function renderFlights(){
 const q=el("filterFlights").value.trim().toUpperCase();
 const rows=foundFlights.filter(a=>[a.callsign,a.icao24,a.registration,a.typeCode].some(v=>String(v||"").toUpperCase().includes(q)));
 const list=el("flightsList");list.replaceChildren();
 for(const aircraft of rows.slice(0,60)){
   const button=document.createElement("button");button.type="button";
   button.className=selectedFlight?.icao24===aircraft.icao24?"selected":"";
   const title=document.createElement("strong");
   title.textContent=(aircraft.callsign||aircraft.icao24)+" · "+(aircraft.typeCode||"modelo não informado");
   const detail=document.createElement("span");
   detail.textContent=(aircraft.registration||aircraft.icao24)+" · "+(aircraft.altitudeM===null?"altitude N/D":Math.round(aircraft.altitudeM)+"m")+
    " · "+(aircraft.groundSpeedKmh===null?"velocidade N/D":Math.round(aircraft.groundSpeedKmh)+" km/h");
   button.append(title,detail);button.addEventListener("click",()=>follow(aircraft));list.append(button);
 }
}
async function searchFlights(){
 const loc=LOCATIONS[el("location").value],msg=el("flightMessage");
 el("searchFlights").disabled=true;msg.textContent="Buscando aeronaves próximas…";
 try{
   const url="./api/flights.php?lat="+encodeURIComponent(loc.lat)+"&lon="+encodeURIComponent(loc.lon);
   const response=await fetch(url,{cache:"no-store"});const data=await response.json();
   if(!response.ok){
     const message=data.message||data.error||("HTTP "+response.status);
     const seconds=Number(data.retryAfterSeconds);
     throw new Error(message+(Number.isFinite(seconds)&&seconds>0?" · Tente novamente em "+Math.ceil(seconds)+" s.":""));
   }
   if(data.cooldown){
     foundFlights=[];
     renderFlights();
     msg.textContent=data.message+"\nUse o botão de demonstração enquanto aguarda.";
     return;
   }
   foundFlights=Array.isArray(data.aircraft)?data.aircraft:[];
   msg.textContent=foundFlights.length+" aeronaves com posição recente · "+data.source+
    (data.stale?" · CACHE ANTIGO":data.cached?" · CACHE":" · BUSCA NOVA")+
    "\nConsulta: "+new Date(data.fetchedAtEpoch*1000).toLocaleTimeString("pt-BR");
   renderFlights();
 }catch(error){msg.textContent="Busca indisponível: "+error.message+"\nVerifique PHP/XAMPP, internet e cota gratuita."}
 finally{el("searchFlights").disabled=false}
}
function follow(a){
 if(!viewer)return;
 playing=false;
 const model=modelFor(a.typeCode);
 if(model){el("model").value=model;applyModel()}else reset();
 live=!a.demo;selectedFlight=a.demo?null:a;lastLivePositionAt=Date.now();
 flight={lat:a.latitude,lon:a.longitude,alt:Math.max(0,a.altitudeM??1000),
 speed:Math.max(0,a.groundSpeedKmh??0),heading:normalizeHeading(a.headingDeg??0),travelKm:0};
 locations=[position()];createEntity();updateEntity();updateCamera();
 el("speedValue").textContent=Math.round(flight.speed)+" km/h";
 el("altValue").textContent=Math.round(flight.alt)+" m";
 el("headingValue").textContent=Math.round(flight.heading)+"°";
 el("extraValue").textContent="N/D";
 el("flightMessage").textContent=(a.demo?"SIMULAÇÃO LOCAL · ":"ÚLTIMA POSIÇÃO ADS-B · ")+(a.callsign||a.icao24)+
 (model?" · painel didático "+AIRCRAFT[model].name:" · modelo não confirmado: painel genérico")+
 (a.demo?"\nEstes aviões são fictícios, criados somente para testar o módulo.":"\nÚltima observação: "+new Date(a.lastSeenEpoch*1000).toLocaleString("pt-BR")+"\nContinuar passeio: projeção visual por até 20 s.");
 instruments();renderFlights();status(a.demo?"Aeronave fictícia · modo de demonstração":"Aeronave ADS-B · última posição observada");
}
el("searchFlights").addEventListener("click",searchFlights);
el("filterFlights").addEventListener("input",renderFlights);
el("returnDemo").addEventListener("click",()=>{applyModel();el("flightMessage").textContent="Passeio demonstrativo restaurado.";renderFlights()});
el("togglePanel").addEventListener("click",()=>{document.body.classList.toggle("compact-cockpit");el("togglePanel").setAttribute("aria-pressed",String(document.body.classList.contains("compact-cockpit")))});

async function sampleFlights(){
 const msg=el("flightMessage");
 try{
   const r=await fetch("./api/demo.php?region="+encodeURIComponent(el("location").value),{cache:"no-store"});
   if(!r.ok)throw new Error("HTTP "+r.status);
   const data=await r.json();
   foundFlights=(data.aircraft||[]).map(a=>({...a,demo:true}));
   msg.textContent="DEMONSTRAÇÃO · 4 aeronaves FICTÍCIAS. Sem consultar ADS-B.lol. Selecione uma para entrar no cockpit.";
   renderFlights();
 }catch(e){msg.textContent="Falha ao carregar exemplos: "+e.message}
}
el("sampleFlights").addEventListener("click",sampleFlights);
