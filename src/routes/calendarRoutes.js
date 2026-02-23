const express = require('express');
const router = express.Router();
const { queryCalendar } = require('../controllers/calendarController');

router.get('/query', queryCalendar);

module.exports = router;