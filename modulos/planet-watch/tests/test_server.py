import unittest
from unittest.mock import patch
from server import to_geojson, weather_url, cached, CACHE

class TestSources(unittest.TestCase):
    def test_quakes(self):
        d={"features":[{"geometry":{"type":"Point","coordinates":[-42,-22,2]},"properties":{"place":"RJ","mag":2}}]}
        f=to_geojson(d,"earthquakes")["features"]
        self.assertEqual(len(f),1)
        self.assertEqual(f[0]["geometry"]["coordinates"],[-42,-22])
    def test_events(self):
        d={"events":[{"title":"Evento","geometry":[{"type":"Point","coordinates":[-41,-21]}]}]}
        self.assertEqual(len(to_geojson(d,"events")["features"]),1)
    def test_weather_url(self):
        with self.assertRaises(ValueError): weather_url({"lat":["99"],"lon":["0"]})
        self.assertIn("longitude=-42.5",weather_url({"lat":["-22.3"],"lon":["-42.5"]}))
    def test_cache(self):
        CACHE.clear()
        with patch("server.external_json",return_value={"ok":True}) as get:
            cached("earthquakes","https://example.invalid")
            cached("earthquakes","https://example.invalid")
            self.assertEqual(get.call_count,1)
if __name__=="__main__": unittest.main()
