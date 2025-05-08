const NightlyKhipPricingCalulator = require('../domain/calculator/NightlyKhipPricingCalculator');

const transformPricing = (req, res) => {
    const calculator = new NightlyKhipPricingCalulator(req.body);
    const transformedPricing = {
        baseRates: calculator.getBaseRates(),
        fees: calculator.getFees(),
        taxes: calculator.getTaxes(),
        securityDeposit: calculator.getSecurityDeposit(),
    }

    res.json(transformedPricing);
}

module.exports = {
    transformPricing,
}