const SVGNS = "http://www.w3.org/2000/svg";


TNA.Config.default.mapProjectionScale = 0.001;
TNA.Config.default.beckStyle = false;
TNA.Config.default.labelHeight = 10;
TNA.Config.default.gravitatorInertness = 1;
TNA.Config.default.gravitatorUseInclinationInertness = true;

const proj4_3035 = '+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
TNA.Projection.projections['epsg3035'] = lonlat => {
    const p = proj4(proj4_3035, [lonlat.x, lonlat.y])
    return new TNA.Vector(p[0], -p[1]);
}
TNA.Config.default.mapProjection = 'epsg3035';
document.dispatchEvent(new Event('startTransportNetworkAnimator'));


function fetchLocal(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest
        xhr.onload = function() {
            resolve(new Response(xhr.responseText, {status: 200}))
        }
        xhr.onerror = function() {
            reject(new TypeError('rrequest failed'))
        }
        xhr.open('GET', url)
        xhr.send(null)
    })
}


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

function padding(element, padding) {
    const box = element.getBBox();
    return '<rect x="'+(box.x-padding)+'" y="'+(box.y-padding)+'" width="'+(box.width+padding*2)+'" height="'+(box.height+padding*2)+'" class="dummy helper" data-from="0 0 noanim" />';
}

//pinpointMouse(resolveTlBr($0))