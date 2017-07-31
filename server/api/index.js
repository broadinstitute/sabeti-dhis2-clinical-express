const router = require('express').Router()

// API route
router.get('/', (req, res, next) => {
  console.log('request received: sending a response')
  res.send('hello from the server side')
})

router.use('/dhis', require('./dhis'))

module.exports = router;
