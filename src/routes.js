const express = require('express');
const { authMiddleware } = require('./middleware/auth');

const losPricingController = require('./controllers/losPricingController');
const nightlyPricingController = require('./controllers/nightlyPricingController');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// IMPLEMENT NEW ROUTES HERE
router.get('/losPricing', authMiddleware, losPricingController.transformPricing);
router.get('/nightlyPricing', authMiddleware, nightlyPricingController.transformPricing);

module.exports = router;
