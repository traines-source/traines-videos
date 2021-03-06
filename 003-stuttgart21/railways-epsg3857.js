const SVGNS = "http://www.w3.org/2000/svg";
const scale = 10000;

function x(lon) {
    return Math.round(256/Math.PI*(lon/180*Math.PI+Math.PI)*scale*10)/10;
}
function y(lat) {
    return Math.round(256/Math.PI*(Math.PI-Math.log(Math.tan(Math.PI/4+lat/180*Math.PI/2)))*scale*10)/10;
}

let tl = undefined;
let br = undefined;

function updateBbox(coord) {
    if (tl == undefined) {
        tl = coord.slice();
        br = coord.slice();
        return;
    }
    if (coord[0] < tl[0]) tl[0] = coord[0];
    if (coord[1] < tl[1]) tl[1] = coord[1];
    if (coord[0] > br[0]) br[0] = coord[0];
    if (coord[1] > br[1]) br[1] = coord[1];
}

function setViewBox() {
    const svg = document.getElementsByTagName('svg')[0];
    const width = x(br[0])-x(tl[0]);
    const height = y(tl[1])-y(br[1]);
    svg.setAttribute('viewBox', x(tl[0]) + ' ' + y(br[1]) + ' ' + width + ' ' + height);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
}

function makeGroup(coordinates) {
    coordinates.map(updateBbox);
    return coordinates.map(coord => x(coord[0]) + ' ' + y(coord[1])).join(' L ');
}

function makeD(geometry) {
    if (geometry.type == "LineString") {
        return 'M ' + makeGroup(geometry.coordinates);
    }
    if (geometry.type == "MultiLineString") {
        return 'M ' + geometry.coordinates.map(group => makeGroup(group)).join(' M ');
    }
}

function render(geojson, setD) {
    console.log(geojson);
    for (let i=0; i<geojson.features.length; i++) {
        const feature = geojson.features[i];
        if (feature.geometry.type == "Point" || feature.properties["route"] != undefined ) {
            continue;
        }
        const clazz = 'route-' + feature.properties['route'] + ' railway-' + feature.properties['railway'] + ' tunnel-' + feature.properties['tunnel'] + ' relations-' + (feature.properties['@relations'] != undefined ? 'child' : '');
        const path = getOrCreatePath(feature.id);
        if (!path.className.baseVal.includes(clazz)) {
            path.className.baseVal += ' ' + clazz;
        }
        if (setD) {
            path.setAttribute('d', makeD(feature.geometry));
        }
    }
    if (setD) {
        setViewBox();
        console.log('tl_x', x(tl[0]), 'tl_y', y(tl[1]), 'br_x', x(br[0]), 'br_y', y(br[1]), 'c_x', x((tl[0]+br[0])/2), 'c_y', y((tl[1]+br[1])/2));
    }
}

function getOrCreatePath(id) {
    let element = document.getElementById(id);
    if (element == undefined) {
        element = document.createElementNS(SVGNS, 'path');
        element.id = id;
        document.getElementById('elements')?.appendChild(element);
    }
    return element;
}

/*
[out:json][timeout:25];
(
  way["railway"="rail"]["service"!="yard"]["service"!="spur"]["service"!="crossover"]({{bbox}});
  way["railway"="construction"]["construction"="rail"]({{bbox}});
  relation["route"="railway"]({{bbox}});
  relation["route"="tracks"]({{bbox}});
 
);
out geom;
*/
/*
[out:json][timeout:25];
relation(id:12308943,7692475)({{bbox}});
way(r);
out geom;
*/
fetch("railways.geojson")
  .then(response => response.json())
  .then(json => render(json, true));