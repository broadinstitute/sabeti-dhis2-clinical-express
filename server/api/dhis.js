const router = require('express').Router()
const request = require('request');


let content = ''

let qd = {
	program: 'Kenema 2014 Outbreak',
	programid: 'iMQ9InaUU5m',
	orgunit: 'kJq2mPyFEHo', //kenema
}

//http://localhost:8085/api/programs.json?query=Kenema%202014%20Outbreak
//http://localhost:8085/api/events.json?orgUnit=kJq2mPyFEHo

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

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        content = body;
        return content
    }
}

request(options, callback);


// API route
router.get('/', (req, res, next) => {
	res.send(content);
});

module.exports = router;
