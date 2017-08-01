require('isomorphic-fetch');
let unique = [];
let listOfDEs = [];

fetch(`http://localhost:3000/api/dhis`)
	.then(function(response){
		if (response.status >= 400) { throw new Error("Bad response from server"); }
      return response.json();
	})
	.then(function(payload) {
		const data = payload;
		let cases = [];
		let values = [];

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
		return listOfUniqueDEs;

		



		//create nested array with dataElement:value objects
		// for (var i = 0; i < cases.length; i++) {
		// 	var dataValues = cases[i];
		// 	var object = {};
		// 	for (var j = 0; j < dataValues.length; j++) {
		// 		var d = dataValues[j];
		// 		object[d.dataElement] = d.value;
		// 	}
		// 	values.push(object);
		// }

		// unique = uniqueKeys(values);

  })
  .then(function(data){ //data => listOfUniqueDEs
  	console.log(data);
  	let listOfUniqueDEs = data;

  	//get object with displayNames for every DataElement ID
  	return fetch(`http://localhost:3000/api/dataElements/${listOfUniqueDEs}`)
  })
  .then(function(responses){
  	console.log(responses);
  	return responses.json();
  })
  .then(function(datum){ //data => object of DataElements and DisplayValues
  	console.log(datum);
  })

//generic function that retuns an array of unique values
function uniqueKeys(array){
	let arr = Object.keys(array.reduce(function(result, obj) {
  return Object.assign(result, obj);
	}, {}))
	return arr;
}