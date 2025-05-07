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

      expect(result[1]).to.deep.equal({
        start: '2025-05-10',
        end: '2025-05-11',
        nightlyRate: 460,
      });
      
      expect(result[2]).to.deep.equal({
        start: '2025-05-12',
        end: '2025-05-16',
        nightlyRate: 450,
      });
      
      expect(result[14]).to.deep.equal({
        start: '2025-07-27',
        end: '2025-07-31',
        nightlyRate: 365,
      });
      
      expect(result[16]).to.deep.equal({
        start: '2025-08-26',
        end: '2027-05-07',
        nightlyRate: 300,
      });
    });
  });
});
