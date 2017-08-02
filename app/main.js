require('isomorphic-fetch');
import * as axios from 'axios';
import api from './ClientApi';


axios.get(`http://localhost:3000/api/dhis`)
	.then(response => {
		const data = response.data;
		let listOfDEs = [];
		let cases = [];

		//extract the dataValues arrays
		data.events.forEach((event) => {
			cases.push(event.dataValues);
		});

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
		return axios.get(`http://localhost:3000/api/dataElements/${listOfUniqueDEs}`)
	})
	.then(response => {
		const data = response.data;
		let namesMap = {};
		
		data.dataElements.forEach(el => {
		namesMap[el.id] = el.displayName;
		})
		return namesMap;
	})
	.then(response => {
		let namesMap = response;
		axios.get(`http://localhost:3000/api/dhis`)
			.then(response => {
				const data = response.data;
				let cases = [];
				let values = [];

				data.events.forEach((event) => {
					cases.push(event.dataValues);
				});
				
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
				console.log(values);
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
				console.log(geoJSON);
			})
	})

	function getCoords(str){
		if (str === undefined){
			return [undefined, undefined]
		} else {
			let coords = str.replace(/\[/,'').replace(/\]/,'').split(',')
			return [+coords[0], +coords[1]]
		}
	}