// ** ------- DEPENDENCIES ------- **
import './styles/index.scss';
import * as d3 from 'd3';
import {hexbin} from 'd3-hexbin';
import * as L from 'leaflet';
let _ = require('lodash');
let pixelCoords = [];
let map;


// ** ------- JS MODULES ------- **
// import DataLoader from './data';
import DataLoader from './Data';
// import Timeline from './Timeline';
// import Details from './Details';
// import Fasta from './Fasta';
// import {projectPoint, updateHexCoords} from './Utils';
import Secret from '../Secret';

// ** ------- DataLoader() ------- **
let getData = DataLoader()
 .on('loaded', data => {
 		// console.log(data.data)
 		let dummyCases = data.data;
 		console.log(data.data);

    const mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    map = L.map('map').setView([8.4506145, -11.3474766], 9);
    L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=${Secret.mapbox}`, {
      maxZoom: 18,
      }).addTo(map);
    L.svg().addTo(map)

    const casesByDate = d3.nest()
      .key(function(d) { return d.features[0].properties.eventDate; })
      .rollup(function(cases) {return cases.length})
      .entries(dummyCases);

    console.log(casesByDate);
    // d3.select('#timeline').datum(casesByDate).call(timeline);

    // redraw(dummyCases); //where all the magic happens
 
  }); //-->END .on('loaded')


  // ** ------- DATA QUERY ------- **
// getData();




