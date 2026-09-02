const express = require('express');
const router = express.Router();
const whatsappController = require('./whatsapp.controller');

router.post('/connect', whatsappController.connect);
router.get('/status', whatsappController.getStatus);
router.post('/disconnect', whatsappController.disconnect);

module.exports = router;