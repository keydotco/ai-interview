const { expect } = require('chai');
const NightlyKhipPricingCalculator = require('../../../src/domain/calculator/NightlyKhipPricingCalculator');
const samplePricing3015 = require('./aie-3015_pricing.json');

describe('NightlyKhipPricingCalculator', () => {
  describe('getBaseRates', () => {
    it('should return an array of base rates', () => {
      const calculator = new NightlyKhipPricingCalculator({
        nightlyPricing: samplePricing3015.nightlyPricing,
      });
      const result = calculator.getBaseRates();

      expect(result).to.be.an('array');
      expect(result.length).to.equal(17);
    });
  });
});
