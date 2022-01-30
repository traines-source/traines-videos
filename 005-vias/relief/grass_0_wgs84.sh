set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
# Unzipped data from http://www.webgis.com/terr_world.html
INPUT_DIR=${SCRIPT_DIR}/GTOPO30/

g.region n=82 s=34 w=-29 e=69 nsres=0.008333 ewres=0.008333

echo "Importing europe mask..."
v.in.ogr --overwrite input=${SCRIPT_DIR}/europe_continent.geojson output=europe_continent
r.mask vect=europe_continent --overwrite

echo "Importing DEM..."
MAPS=""
for tile in ${INPUT_DIR}*.DEM ; do
  outname=elev_$(basename $tile .DEM)
  MAPS=${outname},${MAPS}
  r.external input=$tile output=$outname --overwrite
done
echo "Mosaicing..."
r.patch --overwrite input=$MAPS output=elev_mosaic --overwrite
echo "Done."