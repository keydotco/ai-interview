const LosKhipPricingCalulator = require('../domain/calculator/LosKhipPricingCalculator');

const transformPricing = (req, res) => {
    const calculator = new LosKhipPricingCalulator(req.body);
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