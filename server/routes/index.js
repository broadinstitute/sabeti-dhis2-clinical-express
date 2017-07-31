const express = require('express');
const router = express.Router();
const appController = require('../../controllers/appController');

console.log(appController)
// const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/api', appController.getMain);
router.get('/api/dhis', appController.getDhis);
router.get('/api/dataElements/:ids', appController.getDataElements);

module.exports = router;