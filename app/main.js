require('isomorphic-fetch');
let uniqueKeys = [];

fetch(`http://localhost:3000/api/dhis`)
	.then(function(response){
		if (response.status >= 400) {
            throw new Error("Bad response from server");
        }
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

		//create nested array with dataElement:value objects
		for (var i = 0; i < cases.length; i++) {
			var dataValues = cases[i];
			var object = {};
			for (var j = 0; j < dataValues.length; j++) {
				var d = dataValues[j];
				object[d.dataElement] = d.value;
			}
			values.push(object);
		}

		//get a list of unique properties
		let uniqueKeys = Object.keys(values.reduce(function(result, obj) {
  		return Object.assign(result, obj);
		}, {}))

		

  });