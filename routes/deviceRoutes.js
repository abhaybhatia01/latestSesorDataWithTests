const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares');
const deviceController = require('../controllers/deviceController');

router.get('/', deviceController.getDevice);
// router.post('/', deviceController.addUserDevicse);
router.get('/getLatestSensorsData',authenticate, deviceController.getLatestSensorsData);
router.get('/DownloadLatestSensorDataInExcel',authenticate, deviceController.DownloadLatestSensorDataInExcel);

module.exports = router;
