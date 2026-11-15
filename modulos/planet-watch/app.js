"use strict";
const map=L.map("map").setView([-15,-45],3);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
const layers={earthquakes:L.layerGroup().addTo(map),events:L.layerGroup().addTo(map)};
const status=document.getElementById("status");
function nice(value){return value===undefined||value===null?"Não informado":String(value)}
function details(data){document.getElementById("details").textContent=Object.entries(data).map(([k,v])=>k+": "+nice(v)).join("\n")}
async function refresh(){
 status.textContent="Consultando fontes públicas…";const results=[];
 for(const key of ["earthquakes","events"]){
  layers[key].clearLayers();
  if(!document.getElementById(key).checked){results.push(key+": desativado");continue}
  try{
   const res=await fetch("/api/"+key,{cache:"no-store"});
   if(!res.ok)throw new Error("HTTP "+res.status);
   const data=await res.json();let n=0;
   for(const feature of data.features||[]){
    const coordinates=feature.geometry?.coordinates;
    if(!coordinates||!Number.isFinite(coordinates[0])||!Number.isFinite(coordinates[1]))continue;
    const p=feature.properties||{};
    const marker=L.circleMarker([coordinates[1],coordinates[0]],{radius:6,weight:1,color:key==="earthquakes"?"#ffc46e":"#74ecc2",fillOpacity:.75});
    marker.bindTooltip(nice(p.name));marker.on("click",()=>details(p));marker.addTo(layers[key]);n++;
   }
   results.push(key+": "+n+" pontos");
  }catch(e){results.push(key+": indisponível ("+e.message+")")}
 }
 status.textContent=results.join("\n")+"\nConsultado às "+new Date().toLocaleTimeString("pt-BR");
}
map.on("click",async e=>{
 const lat=e.latlng.lat.toFixed(4),lon=e.latlng.lng.toFixed(4),out=document.getElementById("weather");
 out.textContent="Consultando…";
 try{
  const res=await fetch("/api/weather?lat="+lat+"&lon="+lon);
  if(!res.ok)throw new Error("HTTP "+res.status);
  const w=(await res.json()).current||{};
  out.textContent="Coordenadas: "+lat+", "+lon+"\nTemperatura: "+nice(w.temperature_2m)+" °C\nVento: "+nice(w.wind_speed_10m)+" km/h\nPrecipitação: "+nice(w.precipitation)+" mm\nAtualização: "+nice(w.time);
 }catch(e){out.textContent="Dados indisponíveis: "+e.message}
});
document.getElementById("refresh").addEventListener("click",refresh);
for(const key of ["earthquakes","events"])document.getElementById(key).addEventListener("change",refresh);
refresh();