#!/bin/bash
set -e


g.region n=60 s=-60 w=-180 e=180 nsres=0.005 ewres=0.005

echo "Importing countries..."
countries=${INPUT_DIR}/population/gpw/gpw_v4_national_identifier_grid_rev11_2pt5_min.tif
r.in.gdal input=$countries output=ccc_countries --overwrite
