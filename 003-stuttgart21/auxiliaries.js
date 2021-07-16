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
    // should be hardcoded, to avoid race conditions
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

function insideRectangle(coords, tl, br) {
    return coords[0] > tl[0] && coords[0] < br[0] && coords[1] < tl[1] && coords[1] > br[1];
}

function getLineProperties(feature) {
    if (feature.geometry.type == "Point" || feature.properties["route"] != undefined) {
        return ['undefined', '', '', 0];
    }
    if (feature.properties['railway'] != 'construction') {
        if (
            insideRectangle(feature.geometry.coordinates[0], [9.19397, 48.8035846], [9.21182, 48.78414]) || 
            insideRectangle(feature.geometry.coordinates[0], [9.1813, 48.7960], [9.21182, 48.78414])
        ) {
            return ['s21old', 's', '1 45 keepzoom', 100];
        }
        return ['existing', '', '', 0];
    }
    if (insideRectangle(feature.geometry.coordinates[0], [9.36824, 48.66841], [10.0614, 48.3606])) {
        return ['nbs', 'nw', '1 25', 1000];
    }
    if (insideRectangle(feature.geometry.coordinates[0], [9.18156, 48.80132], [9.19767, 48.78500])) {
        return ['zsbahn', 's', '1 40', 100];
    }
    if (insideRectangle(feature.geometry.coordinates[0], [9.1533, 48.8211], [9.2865, 48.7614])) {
        return ['s21new', 'nw', '1 1', 200];
    }
    if (insideRectangle(feature.geometry.coordinates[0], [9.1533, 48.8211], [9.2017, 48.6917])) {
        return ['s21new', 'nw', '1 1', 200];
    }
    if (insideRectangle(feature.geometry.coordinates[0], [9.1533, 48.8211], [9.3789, 48.6488])) {
        return ['flwl', 'w', '1 20', 500]
    }
    return ['undefined', '', '', 0];
}

function render(geojson, setD) {
    geojson.features.sort((a, b) => (getLineProperties(a)[0] > getLineProperties(b)[0]) ? 1 : -1);
    for (let i=0; i<geojson.features.length; i++) {
        const feature = geojson.features[i];
        drawFeature(feature, setD);
    }
    if (setD) {
        //setViewBox();
        console.log('tl_x', x(tl[0]), 'tl_y', y(tl[1]), 'br_x', x(br[0]), 'br_y', y(br[1]), 'c_x', x((tl[0]+br[0])/2), 'c_y', y((tl[1]+br[1])/2));
    }
    const event = new Event('startTransportNetworkAnimator');
    document.dispatchEvent(event);
}

function drawFeature(feature, setD) {
    const props = getLineProperties(feature);
    if (props[0] == 'undefined') {
        return;
    }
    const clazz = 'route-' + feature.properties['route'] + ' railway-' + feature.properties['railway'] + ' tunnel-' + feature.properties['tunnel'] + ' relations-' + (feature.properties['@relations'] != undefined ? 'child' : '');
    const path = getOrCreatePath(feature.id);
    if (!path.className.baseVal.includes(clazz)) {
        path.className.baseVal += ' ' + clazz;
    }
    if (props[0] != 'existing') {
        path.dataset.line = props[0];
        path.dataset.animOrder = props[1];
        if (props[0] == 's21old') {
            path.dataset.from = '0 0 noanim';
            path.dataset.to = props[2];
        } else {
            path.dataset.from = props[2];
        }        
        path.dataset.speed = props[3];
    }
    if (setD) {
        path.setAttribute('d', makeD(feature.geometry));
    }
}

function getOrCreatePath(id) {
    let element = document.getElementById(id);
    if (element == undefined) {
        element = document.createElementNS(SVGNS, 'path');
        element.id = id;
        document.getElementById('geo_intro')?.appendChild(element);
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
/*
[out:json][timeout:25];
(
  way["railway"="rail"]({{bbox}});
  way["railway"="construction"]["construction"="rail"]({{bbox}});
  way["railway"="proposed"]["proposed"="rail"]({{bbox}});
  relation["route"="railway"]({{bbox}});
  relation["route"="tracks"]({{bbox}});
 
);
out geom;
*/
fetch("railways.geojson")
  .then(response => response.json())
  .then(json => render(json, true));



let intvl;
document.addEventListener('epoch', function(e) {
  if (e.detail == '70') {
    if (intvl == undefined) {
      let i = -1;
      intvl = window.setInterval(function () {
        i++;      
        document.getElementById('custom-epoch-label').textContent = ((6+Math.floor(i/60))+'').padStart(2, '0')+':'+((i%60)+'').padStart(2, '0');
      }, 1000);
    }
  } else {
    if (intvl != undefined) {
      clearInterval(intvl);
      intvl = undefined;
    }
  } 
});