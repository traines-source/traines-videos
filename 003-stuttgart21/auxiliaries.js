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
    if (feature.properties['railway'] != 'construction' && feature.properties['railway'] != 'proposed') {
        if (
            insideRectangle(feature.geometry.coordinates[0], [9.19397, 48.8035846], [9.21182, 48.78414]) || 
            insideRectangle(feature.geometry.coordinates[0], [9.1813, 48.7960], [9.21182, 48.78414])
        ) {
            return ['s21old', 's', '1 45 keepzoom', 100];
        }
        return ['existing', '', '', 0];
    }
    if (feature.properties['name'] != undefined && feature.properties['name'].includes('erg-')) {
        return ['erg custom-proposed', 'n', '80 45', 100];
    }
    if (feature.properties['name'] != undefined && feature.properties['name'].includes('nordzulauf-')) {
        return ['nordzulauf custom-proposed', 'n', '80 8', 200];
    }
    if (feature.properties['name'] != undefined && feature.properties['name'].includes('gautunnel-')) {
        return ['gautunnel custom-proposed', 'w', '80 28', 200];
    }
    if (feature.properties['name'] != undefined && feature.properties['name'].includes('poption-')) {
        return ['poption custom-proposed', 'n', '80 1', 100];
    }
    if (insideRectangle(feature.geometry.coordinates[0], [9.101692, 48.714558], [9.129658,  48.705414])) {
        return ['rohrerkurve custom-proposed', 'w', '80 25', 100];
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

function render(railways, railwaysExtensions, setD) {
    renderRailways(railways, setD);
    renderRailways(railwaysExtensions, setD);
    const event = new Event('startTransportNetworkAnimator');
    document.dispatchEvent(event);
}

function renderRailways(geojson, setD) {
    geojson.features.sort((a, b) => (getLineProperties(a)[0] > getLineProperties(b)[0]) ? 1 : -1);
    for (let i=0; i<geojson.features.length; i++) {
        const feature = geojson.features[i];
        drawFeature(feature, setD);
    }
    if (setD) {
        //setViewBox();
        console.log('tl_x', x(tl[0]), 'tl_y', y(tl[1]), 'br_x', x(br[0]), 'br_y', y(br[1]), 'c_x', x((tl[0]+br[0])/2), 'c_y', y((tl[1]+br[1])/2));
    }
}

function drawFeature(feature, setD) {
    const props = getLineProperties(feature);
    if (props[0] == 'undefined') {
        return;
    }
    const clazz = props[0] + ' route-' + feature.properties['route'] + ' railway-' + feature.properties['railway'] + ' tunnel-' + feature.properties['tunnel'] + ' relations-' + (feature.properties['@relations'] != undefined ? 'child' : '');
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
    .then(railways => 
        fetch("railways-extensions.geojson")
        .then(response => response.json())
        .then(railwaysExtensions => render(railways, railwaysExtensions, true))
    );



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


function resolveTl(element, relativeToElementId='zoomable') {
    if (document.getElementById(relativeToElementId) != undefined) {
        const zoomable = document.getElementById(relativeToElementId);
        const zRect = zoomable.getBoundingClientRect();
        const zBox = zoomable.getBBox();
        const lRect = element.getBoundingClientRect();
        const zScale = zBox.width/zRect.width;
        const x = (lRect.x-zRect.x)*zScale+zBox.x;
        const y = (lRect.y-zRect.y)*zScale+zBox.y;
        return [x, y];
    }
    return 'please set relativeToElementId';    
}

function pinpointMouse(relativeTo=[0, 0]) {
    const svg = document.querySelector('svg');
    const pt = svg.createSVGPoint();
    svg.addEventListener('mousedown',function(evt){
        pt.x = evt.clientX; pt.y = evt.clientY;
        const pos = pt.matrixTransform(svg.getScreenCTM().inverse())
        console.log(pos.x-relativeTo[0], pos.y-relativeTo[1]);
    }, false);
}

//pinpointMouse(resolveTlBr($0))