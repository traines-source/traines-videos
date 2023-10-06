const SVGNS = "http://www.w3.org/2000/svg";

function fuzzy(frequency) {
    if (frequency < 0.3) return 'some';
    if (frequency < 0.6) return 'e2h';
    if (frequency < 1.3) return 'e1h';
    if (frequency < 2.8) return 'e30m';
    return 'e15m';
}

fetch('research/analysis-dtakt-railml.json').then(resp => resp.json()).then(json => {
    stations = json['stations'];
    console.log(json['stations']['AELB']);
    const container = document.getElementById('regionalverkehr');
    console.log(Object.keys(stations));
    for(let key of Object.keys(stations)) {
        const el = document.createElementNS(SVGNS, 'rect');
        el.dataset.lonLat = stations[key]['lon'] + ' ' + stations[key]['lat'];
        el.dataset.station = 'rv_'+key;
        el.dataset.from = "2050 1";
        const m = Math.max(stations[key]['dtakt'], stations[key]['gtfs']);
        const diff = stations[key]['gtfs'] == 0 ? 0 : m-stations[key]['gtfs'];
        el.className.baseVal = 'station dtakt-'+fuzzy(m)+' diff-'+fuzzy(diff) + ' ' + stations[key]['dtakt'] + ' ' + stations[key]['gtfs'];
        container.appendChild(el);
    }


    TNA.Config.default.gravitatorUseInclinationInertness = false;
    TNA.Config.default.gravitatorInertness = 0.1;
    TNA.Config.default.mapProjectionScale = 100;
    TNA.Config.default.trainWagonLength = 10;
    TNA.Config.default.trainTimetableSpeed = 180;
    var event = new Event('startTransportNetworkAnimator');
    document.dispatchEvent(event);
})