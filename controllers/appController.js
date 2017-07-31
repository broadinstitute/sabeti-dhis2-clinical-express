const http = require('http');
const request = require('request');

let content = ''

let qd = {
	program: 'Kenema 2014 Outbreak',
	programid: 'iMQ9InaUU5m',
	orgunit: 'kJq2mPyFEHo', //kenema
}

exports.getMain = async (req, res) => {
  res.send('This is the internal API root');
}


exports.getDhis = async (req, res) => {
	let headers = {
    'Accept': 'application/json'
};

	let options = {
	    url: `http://localhost:8085/api/events?program=${qd.programid}`,
	    headers: headers,
	    auth: {
	        'user': 'admin',
	        'pass': 'district'
	  }
	};

	await request(options, callback);
	res.send(content)
}


exports.getDataElements = async (req, res) => {
	let elementIds = req.params.ids;
	let headers = {
    'Accept': 'application/json'
};

	let options = {
	    url: `http://localhost:8085/api/26/dataElements.json?filter=id:in:[${elementIds}]`,
	    headers: headers,
	    auth: {
	        'user': 'admin',
	        'pass': 'district'
	  }
	};

	await request(options, callback);
	res.send(content)
}




function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        content = body;
        return content
    }
}

