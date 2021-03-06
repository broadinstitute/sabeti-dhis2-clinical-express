// ** ------- DEPENDENCIES ------- **
import './styles/index.scss';
import * as d3 from 'd3';
import {hexbin} from 'd3-hexbin';
import * as L from 'leaflet';
let _ = require('lodash');
let pixelCoords = [];
let map;


// ** ------- JS MODULES ------- **
import DataLoader from './Data';
import Timeline from './Timeline';
import Details from './Details';
import Fasta from './Fasta';
import Secret from '../Secret';

import clusterSvg from './img/hexagon.svg'
import casesSvg from './img/cases.svg'

let dis = d3.dispatch('timeUpdate', 'casesTrig', 'hexesTrig');
let details = Details();

let dateMap = d3.map()
  .set("startDate", '')
  .set('endDate', '');

// ** ------- MODULES INIT ------- **
let timeline = Timeline().on('disBrush', data => {
  let startDate = data.startDate,
      endDate = data.endDate;

  dis.call('timeUpdate', null, {start: startDate, end: endDate});
  d3.select('#details').datum({start: startDate, end: endDate}).call(details);
});


//Setting initial parameters to draw points on page load
dis.on('timeUpdate.onloaded', d => {
  dateMap.set("startDate", d.start).set("endDate", d.end);
});


// ** ------- DataLoader() ------- **
let getData = DataLoader()
 .on('loaded', data => {
 		let dummyCases = data.data;

    var customControl = L.control.Element = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: function(map){
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.id = 'toggle-container';
        container.style.backgroundColor = 'white';
        container.style.backgroundSize = "30px 60px";
        container.innerHTML =
        `
        <div id="cluster-btn" class="leaflet-control-zoom-in" href="#" value="1" role="button" aria-label="Cluster">
          <img src="./${clusterSvg}"></img>
        </div>
        <div id="cases-btn" class="leaflet-control-zoom-in" href="#" value="1" aria-label="Cases">
          <img src="./${casesSvg}"></img>
        </div>
        `
        return container;
      }
    });


    const mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    map = L.map('map').setView([8.4506145, -11.3474766], 9);
    L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=${Secret.mapbox}`, {
      maxZoom: 18,
      }).addTo(map);
    L.svg().addTo(map)
    map.addControl(new customControl());


    const casesByDate = d3.nest()
      .key(function(d) { return d.features[0].properties.eventDate; })
      .rollup(function(cases) {return cases.length})
      .entries(dummyCases);

    // main(dummyCases);
    d3.select('#timeline').datum(casesByDate).call(timeline);


    document.getElementById('cluster-btn').onclick = showCluster;
    document.getElementById('cases-btn').onclick = showCases;

    d3.select('#cluster-btn').style('background-color', '#26c18a');
    d3.select('#cases-btn').style('background-color', '#26c18a');

    redraw(dummyCases, false, true); //draw on
    redraw(dummyCases, true, false); //draw on 

    function showCluster(){
      let button = this;
      let activeState = button.getAttribute('value');

      if (activeState == 0) {
        button.setAttribute('value', 1); //if button is active
        d3.select(button).transition().style('background-color', '#26c18a');
        dis.call('hexesTrig', null, {});

        redraw(dummyCases, false, true);
      
      } else {
        button.setAttribute('value', 0);
        d3.selectAll('path.hexagon').remove();
        d3.select(button).transition().style('background-color', 'white');       
      }
    }

    function showCases(){
      let filtered = [];
      let button = this;
      let activeState = button.getAttribute('value');
      
      if (activeState == 0) {
        button.setAttribute('value', 1); //if button is active
        d3.select(button).transition().style('background-color', '#26c18a');
        dis.call('casesTrig', null, {})

        redraw(dummyCases, true, false);

      } else { // if button is disabled
        button.setAttribute('value', 0);
        d3.selectAll('path.point-case').remove();
        d3.select(button).transition().style('background-color', 'white');
      }
    }
  }); //-->END .on('loaded')



// ** ------- REDRAW FUNCTION ------- **
function redraw(array, _points, _hexes) {
  let coords = [];
  let filtered = [];
  filtered = _.filter(array, function(el) { return el.features[0].properties.eventDate >= dateMap.get("startDate") && el.features[0].properties.eventDate <= dateMap.get("endDate") })
  filtered.forEach(el => {coords.push([el.features[0].geometry.coordinates[0], el.features[0].geometry.coordinates[1], el.features[0].properties['GenBank IDs']]) });


  //Logic to draw based on which buttons are active (1) or inactive (0)
  if (_points) {
    dis.on('timeUpdate.points casesTrig', d => {
      if (document.getElementById('cases-btn').getAttribute('value') == 1){ //check if cases button is on!
        let filtered = [];
        let coords = [];

        filtered = _.filter(array, function(el) { return el.features[0].properties.eventDate >= dateMap.get("startDate") && el.features[0].properties.eventDate <= dateMap.get("endDate") })
        drawPoints(filtered)
      }
    })
  } else if (_hexes) {
    dis.on('timeUpdate.hexes hexesTrig', d => {
      if (document.getElementById('cluster-btn').getAttribute('value') == 1){ //check if hexes button is on!
        let filtered = [];
        let coords = [];

        filtered = _.filter(array, function(el) { return el.features[0].properties.eventDate >= dateMap.get("startDate") && el.features[0].properties.eventDate <= dateMap.get("endDate") })
        filtered.forEach(el => {coords.push([el.features[0].geometry.coordinates[0], el.features[0].geometry.coordinates[1], el.features[0].properties['GenBank IDs']]) });
        drawHexes(coords)
      }
    })
  };


  function drawPoints(data){   
    const svg = d3.select('#map').select('svg');
    let transform = d3.geoTransform({point: projectPoint});
    let path = d3.geoPath().projection(transform);
    path.pointRadius(7);

    map.on('zoom movend viewreset', update);
    update();

    function update(){
      if (document.getElementById('cases-btn').getAttribute('value') == 1){
        let featureElement = svg.selectAll('.point-case').data(data)
        
        featureElement.exit().remove(); 
        featureElement
          .enter().append('path')
          .attr('d', path)
          .attr('fill', function(d) {
            var outcome = d.features[0].properties['Kenema | Outcome'];
            if (outcome === 'Died'){
              return 'blue'
            } else return 'green'
          })
          .attr('class', 'point-case')
          .merge(featureElement)
          .attr('d', path)
          .attr("fill-opacity", 0.4)
          .attr('style', 'pointer-events:visiblePainted;')
          .on('mouseover', function(d) {
            let id = d.features[0].properties['GenBank IDs'];
            Fasta(id);
          })
          .on('mouseout', function(d) {
            let detailsNode = document.getElementById('hexDetails');
            detailsNode.innerHTML = '';
          });
      }
    }//end of Update
  }


  function drawHexes(data){
    const svg = d3.select('#map').select('svg');
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    let hex = hexbin()
      .radius(40)
      .extent([[0, 0], [width, height]])

    let color = d3.scaleQuantize()
      .domain([1, 5])
      .range(['#fef0d9','#fdcc8a','#fc8d59','#d7301f'])

    let colorAxis = d3.axisRight(color);

    map.on('zoom movend viewreset', update);
    update();

    function update(){
      if (document.getElementById('cluster-btn').getAttribute('value') == 1){
        // let gradientSvg = d3.select('#gradient').append('svg').attr('width', 100).attr('height', 500)
        // let defs = gradientSvg.append('defs');

        // let linearGradient = defs.append('linearGradient').attr('id', 'linear-gradient');

        // linearGradient
        //   .attr("x1", "0%")
        //   .attr("y1", "0%")
        //   .attr("x2", "0%")
        //   .attr("y2", "100%");

        // linearGradient.append('stop')
        //   .attr('offset', '0%')
        //   .attr('stop-color', '#fef0d9');

        // linearGradient.append('stop')
        //   .attr('offset', '100%')
        //   .attr('stop-color', '#d7301f');

        // gradientSvg.append('rect')
        //   .attr('width', 20)
        //   .attr('height', 200)
        //   .style('fill', 'url(#linear-gradient)')
        //   .attr('transform', 'translate(' + 12 + ',' + 150 + ')');

        // gradientSvg.append("g")
        //   .attr('transform', 'translate(' + 12 + ',' + 150 + ')')
        //   .call(colorAxis);


        let hexagons = svg
          .selectAll('.hexagon')
          .data(hex(updateHexCoords(data)).sort(function(a,b) { return b-length - a.length; }));

        hexagons.exit().remove();
        hexagons
          .enter().append('path')
          .attr('d', hex.hexagon())
          .attr('class', 'hexagon')
          .attr('fill-opacity', .5)
          .merge(hexagons)
            .attr('d', hex.hexagon())
            .attr("fill", function(d) { return color(d.length); })
            .attr('stroke', 'gray')
            .attr('style', 'pointer-events:visiblePainted;')
            .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; })
            .on('mouseover', function(d) {
              let listOfIds = [];
              let detailsNode = document.getElementById('hexDetails');
              let coords = map.layerPointToLatLng([d.x, d.y]);

              d3.select(this).classed('hexHover', true);

              d.forEach(d => {
                listOfIds.push(d[2])
                return listOfIds;
              })
              
              const markup = `
              <h5>
                ${d.length} cases near</span>
              </h5>
              <h5>
                ${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}
              </h5>
              <ul></ul>
              `;
              detailsNode.innerHTML = markup;
            })

            .on("mouseout", function(d) {
              d3.select(this).classed('hexHover', !d3.select(this).classed('hexHover'));

              let detailsNode = document.getElementById('hexDetails');
              detailsNode.innerHTML = '';
            });
        }
      }//end of Update
  }
}//-->END redraw()



// ** ------- MISC FUNCTION ------- **
function projectPoint(x, y) {
  let point = map.latLngToLayerPoint(new L.LatLng(y, x));
  this.stream.point(point.x, point.y);
}

function updateHexCoords(array) {
  let newArr = []
  array.forEach(el => {
    let point = map.latLngToLayerPoint([el[1], el[0]]);
    newArr.push([point.x, point.y, el[2]]);
  });
  return newArr;
}

