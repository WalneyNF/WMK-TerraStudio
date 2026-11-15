import json, tempfile, unittest
from pathlib import Path
from unittest.mock import patch
from exportar_geojson import export_geojson
class Response:
    status=200
    def __enter__(self):return self
    def __exit__(self,*x):return False
    def read(self,n):return json.dumps({"type":"FeatureCollection","features":[]}).encode()
class TestExport(unittest.TestCase):
    def test_export(self):
        with tempfile.TemporaryDirectory() as d,patch("exportar_geojson.urlopen",return_value=Response()):
            p=Path(d)/"out.geojson"
            self.assertEqual(export_geojson("earthquakes",p),0)
            self.assertEqual(json.loads(p.read_text())["type"],"FeatureCollection")
    def test_refuse_gps(self):
        with self.assertRaises(ValueError):export_geojson("gps","gps.geojson")
