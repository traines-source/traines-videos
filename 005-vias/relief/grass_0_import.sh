INPUT_DIR=$1
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

g.region n=85 s=30 w=-30 e=70 nsres=0.008333 ewres=0.008333

echo "Importing europe mask..."
v.in.ogr -o --overwrite input=${SCRIPT_DIR}/europe_continent.geojson output=europe_continent
r.mask vect=europe_continent --overwrite

echo "Importing DEM..."
# Unzipped data from http://www.webgis.com/terr_world.html
MAPS=""
for tile in ${INPUT_DIR}*.DEM ; do
  outname=elev_$(basename $tile .DEM)
  MAPS=${outname},${MAPS}
  r.external input=$tile output=$outname -o --overwrite
done
echo "Mosaicing..."
r.patch --overwrite input=$MAPS output=elev_mosaic --overwrite
echo "Done."