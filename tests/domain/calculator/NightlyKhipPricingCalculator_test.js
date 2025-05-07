const { expect } = require('chai');
const NightlyKhipPricingCalculator = require('../../../src/domain/calculator/NightlyKhipPricingCalculator');
const samplePricing3015 = require('./aie-3015_pricing.json');

describe.only('NightlyKhipPricingCalculator', () => {
  describe('getBaseRates', () => {
    it('should return an array of base rates', () => {
      const calculator = new NightlyKhipPricingCalculator({
        nightlyPricing: samplePricing3015.nightlyPricing,
      });
      const result = calculator.getBaseRates();

      expect(result).to.be.an('array');
      expect(result.length).to.equal(17);

      expect(result[0]).to.deep.equal({
        start: '2025-05-07',
        end: '2025-05-09',
        nightlyRate: 450,
      });
      
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
      
      expect(result[3]).to.deep.equal({
        start: '2025-05-17',
        end: '2025-05-18',
        nightlyRate: 460,
      });
      
      expect(result[4]).to.deep.equal({
        start: '2025-05-19',
        end: '2025-05-23',
        nightlyRate: 450,
      });
      
      expect(result[5]).to.deep.equal({
        start: '2025-05-24',
        end: '2025-05-25',
        nightlyRate: 500,
      });
      
      expect(result[6]).to.deep.equal({
        start: '2025-05-26',
        end: '2025-05-31',
        nightlyRate: 450,
      });
      
      expect(result[7]).to.deep.equal({
        start: '2025-06-01',
        end: '2025-06-30',
        nightlyRate: 300,
      });
      
      expect(result[8]).to.deep.equal({
        start: '2025-07-01',
        end: '2025-07-10',
        nightlyRate: 365,
      });
      
      expect(result[9]).to.deep.equal({
        start: '2025-07-11',
        end: '2025-07-12',
        nightlyRate: 500,
      });
      
      expect(result[10]).to.deep.equal({
        start: '2025-07-13',
        end: '2025-07-17',
        nightlyRate: 365,
      });
      
      expect(result[11]).to.deep.equal({
        start: '2025-07-18',
        end: '2025-07-19',
        nightlyRate: 500,
      });
      
      expect(result[12]).to.deep.equal({
        start: '2025-07-20',
        end: '2025-07-24',
        nightlyRate: 365,
      });
      
      expect(result[13]).to.deep.equal({
        start: '2025-07-25',
        end: '2025-07-26',
        nightlyRate: 500,
      });
      
      expect(result[14]).to.deep.equal({
        start: '2025-07-27',
        end: '2025-07-31',
        nightlyRate: 365,
      });
      
      expect(result[15]).to.deep.equal({
        start: '2025-08-01',
        end: '2025-08-25',
        nightlyRate: 450,
      });
      
      expect(result[16]).to.deep.equal({
        start: '2025-08-26',
        end: '2027-05-07',
        nightlyRate: 300,
      });
    });
  });
});
