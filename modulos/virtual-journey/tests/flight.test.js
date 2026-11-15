import test from "node:test";import assert from "node:assert/strict";
import {AIRCRAFT,LOCATIONS,moveGeodesic,normalizeHeading,headingLabel,toTelemetry} from "../models.js";
test("biblioteca tem cockpits distintos de quatro aeronaves",()=>{
 assert.equal(Object.keys(AIRCRAFT).length,4);
 assert.notEqual(AIRCRAFT.a320.label,AIRCRAFT.b738.label);
 assert.equal(AIRCRAFT.h125.category,"heli");
});
test("movimento ao norte avança na latitude",()=>{
 const p=moveGeodesic(-22,-42,0,1000);assert.ok(p.lat>-22);assert.ok(Math.abs(p.lon+42)<.01)
});
test("movimento circular mantém longitude no intervalo",()=>{
 const p=moveGeodesic(0,179.999,90,100000);assert.ok(p.lon>=-180&&p.lon<180)
});
test("normalização e pontos cardeais",()=>{
 assert.equal(normalizeHeading(-90),270);assert.equal(headingLabel(90),"E")
});
test("telemetria marca explicitamente valores simulados",()=>{
 const s=toTelemetry({lat:0,lon:0,alt:100,speed:80,heading:90,travelKm:2});
 assert.equal(s.source,"simulated");assert.equal(s.observed,false)
});
test("regiões iniciais carregadas",()=>assert.equal(Object.keys(LOCATIONS).length,4));
