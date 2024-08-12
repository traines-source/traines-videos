const SVGNS = "http://www.w3.org/2000/svg";

d3.timeFormatDefaultLocale({
  "decimal": ",",
  "thousands": ".",
  "grouping": [3],
  "currency": ["€", ""],
  "dateTime": "%a %b %e %X %Y",
  "date": "%d.%m.%Y",
  "time": "%H:%M:%S",
  "periods": ["AM", "PM"],
  "days": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
  "shortDays": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  "months": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  "shortMonths": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
});

function bounds(d) {
  const bounds = d.replace(/[^0-9,-]/g, "").split(','); 
  if (bounds.length == 1 || bounds[0].length == 0 && bounds[1].length == 0) return [0,1];
  if (bounds[0].length == 0) return [parseInt(bounds[1])*7/6, parseInt(bounds[1])];
  if (bounds[1].length == 0) return [parseInt(bounds[0]), parseInt(bounds[0])*7/6];
  return [parseInt(bounds[0]), parseInt(bounds[1])];
}

function barwidth(b) {
  return b[1]-b[0];
}

function piedata(data, attr) {
  var pie = d3.pie()
  .sortValues(null)
  .value(d => barwidth(attr(d)));
  return pie(data);
}

function deduppiedata(data, lbounds, llabel) {
  const uniq = data.sort((a,b) => {
    if (llabel(a) == 'cancelled' || llabel(a) == '') return 1;
    if (llabel(b) == 'cancelled' || llabel(b) == '') return -1;
    return lbounds(a)[0]-lbounds(b)[0];
  }).filter(function(item, pos, arr) {
    return llabel(item) != "" && (!pos || llabel(item) != llabel(arr[pos - 1]));
  });
  var adjustedData = piedata(uniq, lbounds);

  var labels_lookup = adjustedData.reduce(function(map, obj) {
      map[llabel(obj.data)] = obj;
      return map;
  }, {});
  return [uniq, adjustedData, labels_lookup]
}

function tickOffset(labels_lookup) {
  smallest = labels_lookup["[0,1)"] || labels_lookup["[0,5)"]
  return (smallest.endAngle-smallest.startAngle)/2
}

function barchart(id, source, update, height) {
  var ctr = d3.select("#"+id);
  return d3.csv("data/"+source+".csv", function(d) {
    const w = bounds(d.label);

    return {
      label: d.label,
      bounds: w,
      height: (parseFloat(d.percent)||0.0)/barwidth(w)
    }
  }).then(function(data) {

      var adjustedData = piedata(data, d => d.bounds);
      const width = 1000;

      var xScale = d3.scaleLinear()
        .domain([0, Math.PI * 2])
        .range([0, width]);

      const tick_offset = (adjustedData[adjustedData.length-1].endAngle-adjustedData[adjustedData.length-1].startAngle)/2;

      var xScaleMinutes = d3.scaleOrdinal(data.map(d => {
        if (d.label == "cancelled")
          return "cancelled";
        return d.bounds[0];
      }), adjustedData.map((d,i) => xScale(d.startAngle+tick_offset)));

      var yScale = d3.scaleLinear()
        .domain([0, id.includes("relative") ? 0.15 : 0.5])
        .range([height, 0]);
      
      if (!update) {
        ctr.append("g")
        .attr("transform", "translate(0," + yScale(0) + ")")
        .call(d3.axisBottom(xScaleMinutes).tickFormat(function(d){
          if (d == "cancelled")
            return "entfallen";
          if (Math.abs(d) > 12 && Math.abs(d) < 100 || Math.abs(d%2) == 0)
            return d;
          return "";
        }))
        .append("text")
        .attr("y", -10)
        .attr("x", width-30)
        .attr("text-anchor", "end")
        .attr("font-size", "14px")
        .attr("fill", "black")
        .text(id.includes("relative") ? "Endgültige relative Verspätung Minuten": "Verspätung Minuten");

        ctr.append("g")
        .call(d3.axisLeft(yScale).tickFormat(function(d){
            return Math.round(d*100)+"%";
        }).ticks(10));
      }
      
      var rects = ctr.selectAll('rect')
        .data(data);

      
      rects.enter()
        .append('rect')
        .merge(rects)
        .transition().duration(1000)
        .attr('x', function(d, i) { return xScale(adjustedData[i].startAngle); })
        .attr('width', function(d, i) { return xScale(adjustedData[i].endAngle) - xScale(adjustedData[i].startAngle); })
        .attr('y', function(d) { return yScale(d.height); })
        .attr('height', function(d) { return yScale(0) - yScale(d.height); });
  });
}

function barchart_create(id) {
  return barchart(id, id, false, 500);
}

function multi_barchart(id) {

  var ctr = d3.select("#"+id);
  return d3.csv("data/"+id+".csv", function(d) {
    return {
      primary: parseFloat(d.primary),
      secondary: parseFloat(d.secondary),
      label: d.label,
    }
  }).then(function(data) {
      const height = 500;
      const width = 1000;

      var xScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, width]);
      
      var yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);
      
      var barWidth = (width / data.length) /2; 
      var padding = 5;
      var rects = ctr.selectAll('rect.primary')
        .data(data);
      rects.enter()
        .append('rect')
        .merge(rects)
        .attr("class", "primary")
        .attr('x', function(d, i) { return xScale(d.label)+3*padding; })
        .attr('width', function(d, i) { return barWidth-4*padding; })
        .attr('y', function(d) { return yScale(d.primary); })
        .attr('height', function(d) { return yScale(0) - yScale(d.primary); });

      var rects = ctr.selectAll('rect.secondary')
        .data(data);
      rects.enter()
        .append('rect')
        .merge(rects)
        .attr("class", "secondary")
        .attr('x', function(d, i) { return xScale(d.label)+barWidth+1*padding; })
        .attr('width', function(d, i) { return barWidth-4*padding; })
        .attr('y', function(d) { return yScale(d.secondary); })
        .attr('height', function(d) { return yScale(0) - yScale(d.secondary); });

      ctr.append("g")
        .attr("transform", "translate(0," + yScale(0) + ")")
        .call(d3.axisBottom(xScale).tickFormat(function(d){
          return d;
        }));
  
      ctr.append("g")
        .call(d3.axisLeft(yScale).tickFormat(function(d){
            return d+"%";
        }).ticks(10));
  });
}


function hour_barchart(id, source, update) {

  var ctr = d3.select("#"+id);
  return d3.csv("data/"+source+".csv", function(d) {
    return {
      primary: parseFloat(d.primary),
      label: d.label,
    }
  }).then(function(data) {
      const height = 500;
      const width = 1000;

      var xScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, width]);
      
      var yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

      

      var barWidth = (width / data.length); 
      var padding = 5;
      var rects = ctr.selectAll('rect.primary')
        .data(data);
      rects.enter()
        .append('rect')
        .merge(rects)
        .transition().duration(1000)
        .attr("class", "primary")
        .attr('x', function(d, i) { return xScale(d.label)+2*padding; })
        .attr('width', function(d, i) { return barWidth-4*padding; })
        .attr('y', function(d) { return yScale(d.primary); })
        .attr('height', function(d) { return yScale(0) - yScale(d.primary); });

      if (!update) {
        ctr.append("g")
          .attr("transform", "translate(0," + yScale(0) + ")")
          .call(d3.axisBottom(xScale).tickFormat(function(d){
            return d;
          }))
        .append("text")
        .attr("y", 30)
        .attr("x", width-30)
        .attr("text-anchor", "end")
        .attr("font-size", "14px")
        .attr("fill", "black")
        .text("Tageszeit (UTC)");
    
        ctr.append("g")
          .call(d3.axisLeft(yScale).tickFormat(function(d){
              return d+"%";
          }).ticks(10));
      }
  });
}

function piechart(id) {
  var ctr = d3.select("#"+id);
  const height = 200;
  const width = 200;
  var radius = Math.min(width, height) / 2

  var data = [{key: 'primary', value: 72}, {key: 'secondary', value: 28}];

  var pie = d3.pie()
    .value(function(d) {return d.value; })
  var data_ready = pie(data);

  var arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);
  ctr
    .selectAll('slices')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('class', function(d){ return d.data.key });
  ctr
    .selectAll('slices')
    .data(data_ready)
    .enter()
    .append('text')
    .text(function(d){ return d.data.key == 'primary' ? 'tatsächlich entfallen' : 'Ersatzzug'})
    .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
    .style("text-anchor", "middle");
}


function linechart(id) {
  var ctr = d3.select("#"+id);
  return d3.csv("data/"+id+".csv", function(d) {
    return d;


  }).then(function(data) {
      const width = 1000;
      const height = 500;

      var xScale = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.Time*1000; }))
        .range([ 0, width ]);
      ctr.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

      
      
      if (id.includes('fernverkehr'))  {
        var yScale = d3.scaleLinear()
          .domain([0, 1])
          .range([ height, 0 ]);
        ctr.append("g")
          .call(d3.axisLeft(yScale).tickFormat(function(d){
            return d*100+"%";
          }).ticks(10));
        ctr.append("text")
          .attr("y", yScale(0.03))
          .attr("x", width)
          .attr("text-anchor", "start")
          .attr("fill", "#B71C1C")
          .text("entfallen");
        ctr.append("text")
          .attr("y", yScale(0.60))
          .attr("x", width)
          .attr("text-anchor", "start")
          .attr("fill", "#546E7A")
          .text("pünktlich (< 6 min)");
      } else {
        var yScale = d3.scaleLinear()
          .domain([0, 70e6])
          .range([ height, 0 ]);
        ctr.append("g")
          .call(d3.axisLeft(yScale).tickFormat(function(d){
            return d;
          }).ticks(10));
      }

      ctr.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#546E7A")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return xScale(d.Time*1000) })
          .y(function(d) { return yScale(d.primary) })
          );
          
      ctr.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#B71C1C")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return xScale(d.Time*1000) })
          .y(function(d) { return yScale(d.secondary) })
          );
  });
}



function heatmap(id) {
  var ctr = d3.select("#"+id);
  return d3.csv("data/"+id+".csv", function(d) {
    const w = bounds(d.label);

    return {
      label: d.label,
      secondary_label: d.secondary_label,
      bounds: w,
      secondary_bounds: bounds(d.secondary_label),
      height: (parseFloat(d.percent)||0.0)/barwidth(w)
    }
  }).then(function(data) {
      const [labels, adjustedData, labels_lookup] = deduppiedata(data, d => d.bounds, d => d.label);
      const [secondary_labels, secondaryAdjustedData, secondary_labels_lookup] = deduppiedata(data, d => d.secondary_bounds, d => d.secondary_label);

      console.log(secondary_labels, secondary_labels_lookup);
      const width = 1000;
      const height = 500;

      var xScale = d3.scaleLinear()
        .domain([0, Math.PI * 2])
        .range([0, width]);

      var yScale = d3.scaleLinear()
        .domain([0, Math.PI * 2])
        .range([height, 0]);

      const tick_offset_x = tickOffset(labels_lookup);
      const tick_offset_y = tickOffset(secondary_labels_lookup);

      var xScaleMinutes = d3.scaleOrdinal(labels.map(d => {
        if (d.label == "cancelled")
          return "cancelled";
        return d.bounds[0];
      }), adjustedData.map((d,i) => xScale(d.startAngle+tick_offset_x)));

      var yScaleMinutes = d3.scaleOrdinal(secondary_labels.map(d => {
          return d.secondary_bounds[0];
      }), secondaryAdjustedData.map((d,i) => yScale(d.startAngle+tick_offset_y)));
      
      var colorScale = d3.scaleLinear()
        .domain([0,0.2])
        .range(["#f2f2f2", "#B71C1C"])
      
      ctr.selectAll()
        .data(data.filter(d => d.label != "" && d.secondary_label != ""))
        .enter()
        .append("rect")
        .attr("x", function(d, i) { return xScale(labels_lookup[d.label].startAngle); })
        .attr("y", function(d, i) { return yScale(secondary_labels_lookup[d.secondary_label].endAngle); })
        .attr("width", function(d, i) { return xScale(labels_lookup[d.label].endAngle) - xScale(labels_lookup[d.label].startAngle); } )
        .attr("height", function(d, i) { return yScale(secondary_labels_lookup[d.secondary_label].startAngle) - yScale(secondary_labels_lookup[d.secondary_label].endAngle); } )
        .style("fill", function(d) { return colorScale(d.height)} );

      ctr.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScaleMinutes).tickFormat(function(d){
          if (d == "cancelled")
            return "entfallen";
          if (Math.abs(d) > 12 && Math.abs(d) < 100 || Math.abs(d%2) == 0)
            return d;
          return "";
        }))
        .append("text")
        .attr("y", -10)
        .attr("x", width-30)
        .attr("text-anchor", "end")
        .attr("font-size", "14px")
        .attr("fill", "black")
        .text("Endgültige relative Verspätung Minuten");

      ctr.append("g")
        .call(d3.axisLeft(yScaleMinutes).tickFormat(function(d){
          if (d == "cancelled")
            return "entfallen";
          if (d != 25 && (Math.abs(d) > 20 && Math.abs(d) < 1000 || Math.abs(d%2) == 0))
            return d;
          return "";
        }))
        .append("text")
        .attr("y", 30)
        .attr("x", 5)
        .attr("text-anchor", "start")
        .attr("font-size", "14px")
        .attr("fill", "black")
        .text(id.includes('ttl') ? "Minuten bis zur Abfahrt" : "Bekannte Verspätung Minuten");
  });
}

function start() {
  barchart_create('fernverkehr').then(() => startTna());
  piechart('cancelled-pie');
  barchart_create('fernverkehr-relative');
  barchart('bus', 'bus', false, 100);
  barchart('tram', 'tram', false, 100);
  barchart('subway', 'subway', false, 100);
  
  heatmap('fernverkehr-heatmap');
  heatmap('fernverkehr-heatmap-ttl');
  linechart('fernverkehr-timeseries');
  linechart('samples-retained');
  multi_barchart('official');
  hour_barchart('bus-hours', 'bus-hours', false);
}


function startTna() {
  window.setTimeout(function() {    
    var event = new Event('startTransportNetworkAnimator');
    document.dispatchEvent(event);
  }, 1000);
}