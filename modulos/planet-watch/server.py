"""WMK Planet Watch: serviços públicos geográficos, servidor apenas local."""
import json, os, time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode, urlsplit
from threading import Lock

ROOT=Path(__file__).resolve().parent
SOURCES={
 "earthquakes":("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",120),
 "events":("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100",600),
 "weather":("https://api.open-meteo.com/v1/forecast",600)}
CACHE={}
INTEGRATIONS={
 "planet-watch":"http://127.0.0.1:8788/health",
 "geo-bridge":"http://127.0.0.1:8766/health",
 "gps-tracker":"http://127.0.0.1:8082/api/server",
 "geo-intelligence":"http://127.0.0.1:4173/"
}

def integration_status():
    """Diagnóstico de rede de URLs fixas, sem consultar dados privados nem tokens."""
    result=[]
    for service,endpoint in INTEGRATIONS.items():
        try:
            with urlopen(Request(endpoint, method="GET"), timeout=1.0) as reply:
                status=reply.status
            result.append({"id":service,"reachable":200<=status<400,"httpStatus":status})
        except (OSError,ValueError):
            result.append({"id":service,"reachable":False,"httpStatus":None})
    return {"services":result,"note":"reachable significa HTTP acessível, não autenticação, dados nem integração validada"}
LOCK=Lock()

def external_json(url):
    with urlopen(url,timeout=8) as response:
        raw=response.read(2_000_001)
        if len(raw)>2_000_000: raise ValueError("response_too_large")
        return json.loads(raw)

def weather_url(q):
    try: lat=float(q.get("lat",[""])[0]); lon=float(q.get("lon",[""])[0])
    except (ValueError,IndexError,TypeError): raise ValueError("invalid_coordinates")
    if not (-90<=lat<=90 and -180<=lon<=180): raise ValueError("invalid_coordinates")
    return SOURCES["weather"][0]+"?"+urlencode({"latitude":lat,"longitude":lon,
       "current":"temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code","timezone":"auto"})

def cached(source,url):
    now=time.monotonic(); key=(source,url)
    with LOCK:
        found=CACHE.get(key)
        if found and now-found[0]<SOURCES[source][1]: return found[1]
    data=external_json(url)
    with LOCK:
        if len(CACHE)>150: CACHE.clear()
        CACHE[key]=(time.monotonic(),data)
    return data

def to_geojson(data,source):
    features=[]
    if source=="earthquakes":
        for item in data.get("features",[])[:500]:
            geom=item.get("geometry") or {}; coord=geom.get("coordinates") or []
            if geom.get("type")!="Point" or len(coord)<2: continue
            p=item.get("properties") or {}
            features.append({"type":"Feature","geometry":{"type":"Point","coordinates":coord[:2]},
                "properties":{"name":p.get("place"),"magnitude":p.get("mag"),"timestamp":p.get("time"),"url":p.get("url"),"source":"USGS"}})
    if source=="events":
        for item in data.get("events",[])[:100]:
            geoms=item.get("geometry") or []
            if not geoms: continue
            last=geoms[-1]; coord=last.get("coordinates") or []
            if last.get("type")!="Point" or len(coord)<2: continue
            features.append({"type":"Feature","geometry":{"type":"Point","coordinates":coord[:2]},
                "properties":{"name":item.get("title"),"timestamp":last.get("date"),"url":item.get("link"),"source":"NASA EONET"}})
    return {"type":"FeatureCollection","features":features,"fetchedAt":datetime.now(timezone.utc).isoformat()}

class Handler(BaseHTTPRequestHandler):
    def send_json(self,status,obj):
        raw=json.dumps(obj,ensure_ascii=False,allow_nan=False).encode()
        self.send_response(status);self.send_header("Content-Type","application/json; charset=utf-8")
        self.send_header("Cache-Control","no-store")
        self.send_header("X-Content-Type-Options","nosniff")
        self.send_header("Content-Length",str(len(raw)));self.end_headers();self.wfile.write(raw)
    def send_file(self,filename,mime):
        raw=(ROOT/filename).read_bytes();self.send_response(200)
        self.send_header("Content-Type",mime);self.send_header("Content-Length",str(len(raw)))
        self.send_header("X-Content-Type-Options","nosniff")
        self.end_headers();self.wfile.write(raw)
    def do_GET(self):
        request=urlsplit(self.path);path=request.path
        if path in ("/","/index.html"):return self.send_file("index.html","text/html; charset=utf-8")
        if path=="/app.js":return self.send_file("app.js","application/javascript; charset=utf-8")
        if path=="/health":return self.send_json(200,{"status":"ok","name":"WMK Planet Watch","version":"0.1.0"})
        if path=="/api/sources":return self.send_json(200,{"sources":["earthquakes","events","weather"],"gps":"disabled_until_authenticated"})
        if path=="/api/integrations":return self.send_json(200,integration_status())
        if path=="/api/gps":return self.send_json(403,{"error":"gps_read_requires_authentication"})
        if path.startswith("/api/"):
            source=path[5:]
            if source not in SOURCES:return self.send_json(404,{"error":"unknown_source"})
            try:
                url=weather_url(parse_qs(request.query)) if source=="weather" else SOURCES[source][0]
                data=cached(source,url)
                return self.send_json(200,data if source=="weather" else to_geojson(data,source))
            except (URLError,HTTPError,TimeoutError,ValueError,KeyError,json.JSONDecodeError):
                return self.send_json(502,{"error":"provider_unavailable","source":source})
        return self.send_json(404,{"error":"not_found"})

if __name__=="__main__":
    port=int(os.environ.get("WMK_PLANET_PORT","8788"))
    print(f"WMK Planet Watch: http://127.0.0.1:{port}",flush=True)
    ThreadingHTTPServer(("127.0.0.1",port),Handler).serve_forever()
