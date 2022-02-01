set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
GRASS_DIR=$1

echo "=== Starting... ==="

test -d ${GRASS_DIR}/wgs84 || grass -e -c epsg:4326 ${GRASS_DIR}/wgs84
test -d ${GRASS_DIR}/wgs84/PERMANENT || grass -e -c ${GRASS_DIR}/wgs84/PERMANENT
test -d ${GRASS_DIR}/europe || grass -e -c epsg:3035 ${GRASS_DIR}/europe
test -d ${GRASS_DIR}/europe/PERMANENT || grass -e -c ${GRASS_DIR}/europe/PERMANENT

echo "wgs84..."
export GRASS_BATCH_JOB=${SCRIPT_DIR}/grass_0_wgs84.sh
grass ${GRASS_DIR}/wgs84/PERMANENT

echo "europe..."
export GRASS_BATCH_JOB=${SCRIPT_DIR}/grass_1_europe.sh
grass ${GRASS_DIR}/europe/PERMANENT