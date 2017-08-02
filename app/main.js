require('isomorphic-fetch');
import * as axios from 'axios';
import api from './ClientApi';
import {dispatch} from 'd3';

const dis = dispatch('loaded', 'error');

function DataLoader(){
axios.get(`http://localhost:3000/api/dhis`)
	.then(response => {
		const data = response.data;
		let listOfDEs = [];
		let cases = [];

		//extract the dataValues arrays
		data.events.forEach(event => { cases.push(event.dataValues); });

		//create array with all dataElements:
		for (var i = 0; i < cases.length; i++) {
			var dataValues = cases[i];
			for (var j = 0; j < dataValues.length; j++) {
				var d = dataValues[j];
				listOfDEs.push(d.dataElement);
			}
		}

		//get list of unique dataElements: [id1,id2,...]
		let listOfUniqueDEs = [... new Set(listOfDEs)].join(',');

		//get "dictionary" of dataElementID : displayValue
		return axios.get(`http://localhost:3000/api/dataElements/${listOfUniqueDEs}`)
	})
	.then(response => { //dictionary
		const data = response.data;
		let namesMap = {};
		
		data.dataElements.forEach(el => { namesMap[el.id] = el.displayName; })
		return namesMap;
	})
	.then(response => { //names mapping
		let namesMap = response;
		axios.get(`http://localhost:3000/api/dhis`)
			.then(response => {
				const data = response.data;
				let cases = [];
				let dates = [];
				let values = [];

				//extract the dataValues arrays
				data.events.forEach(event => { cases.push(event.dataValues); });

				// extract the eventDate value
				data.events.forEach(event => { dates.push(event.eventDate); });
				
				// create nested array with dataElement:value objects
				for (var i = 0; i < cases.length; i++) {
					var dataValues = cases[i];
					var object = {};
					for (var j = 0; j < dataValues.length; j++) {
						var d = dataValues[j];
						object[namesMap[d.dataElement]] = d.value;
					}
					values.push(object);
				}

				//add the eventDate property to values
				for (const [index, object] of values.entries()){
					values[index].eventDate = parseTime(dates[index]);
				}

				//create a geoJSON-like object
				let geoJSON = [];
				for (const [index, object] of values.entries()){
					geoJSON[index] = {
			      type: "FeatureCollection",
			      "features": [
				      { "type": "Feature",
								"geometry": {type: "Point", "coordinates": getCoords(object['Household location'])},
					      "properties": {
									object
					      }
				      }
			      ]
			    } //END geoJSON
				}

				//dispatch geoJSON to main site
				function exports(){
				dis.call('loaded', null, {dummyCases: geoJSON});
				}

				exports.on = function(event, callback){
					dis.on(event, callback);
					return this;
				}

				return exports;
				console.log(geoJSON);
			})
	})
}

function getCoords(str){
	if (str === undefined){
		return [undefined, undefined]
	} else {
		let coords = str.replace(/\[/,'').replace(/\]/,'').split(',')
		return [+coords[0], +coords[1]]
	}
}

function parseTime(str){
	var date = str.split('T')[0].split('-');
	var year = +date[0];
	var month = +date[1]-1;
	var day = +date[2];

	return new Date (year, month, day);
}


export default DataLoader;
