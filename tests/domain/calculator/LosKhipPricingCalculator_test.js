const chai = require('chai');
const expect = chai.expect;
const LosKhipPricingCalculator = require('../../../src/domain/calculator/LosKhipPricingCalculator');
const moment = require('moment');
const samplePricing271670 = require('./1492-271670_pricing.json');

describe('LosKhipPricingCalculator', () => {
    describe('_parseRecordPairsIntoMap', () => {
        let calculator;

        beforeEach(() => {
            calculator = new LosKhipPricingCalculator({});
        });

        it('should parse basic LOS record pairs correctly', () => {
            // Example LOS record with distinct nightly rates
            const recordPairs = [
                '1', '150.00', // $150/night
                '4', '520.00', // $130/night
                '7', '840.00' // $120/night
            ];
            const result = calculator._parseRecordPairsIntoMap(recordPairs);

            // Should have entries for days 1-7
            expect(Object.keys(result)).to.have.length(7);

            // Check specific rates
            expect(result[1]).to.equal(150.00); // 1 night stay
            expect(result[4]).to.equal(520.00); // 4 night stay
            expect(result[7]).to.equal(840.00); // 7 night stay

            // Check interpolated rates using lower LOS rate
            expect(result[2]).to.equal(300.00); // 2 * $150
            expect(result[3]).to.equal(450.00); // 3 * $150
            expect(result[5]).to.equal(650.00); // 5 * $130
            expect(result[6]).to.equal(780.00); // 6 * $130
        });

        it('should not include rates beyond MAX_RELEVANT_LOS (7 days)', () => {
            // Example LOS record with distinct nightly rates
            const recordPairs = [
                '1', '150.00', // $150/night
                '4', '520.00', // $130/night
                '7', '840.00', // $120/night
                '14', '1540.00', // $110/night
                '30', '2700.00' // $90/night
            ];
            const result = calculator._parseRecordPairsIntoMap(recordPairs);

            // Should only have entries for days 1-7
            expect(Object.keys(result)).to.have.length(7);

            // Should not have entries beyond 7 days
            expect(result[8]).to.be.undefined;
            expect(result[14]).to.be.undefined;
            expect(result[30]).to.be.undefined;
        });

        it('should handle gaps in LOS records correctly', () => {
            // Example LOS record with only 1 and 7 night rates
            const recordPairs = [
                '1', '150.00', // $150/night
                '7', '840.00' // $120/night
            ];
            const result = calculator._parseRecordPairsIntoMap(recordPairs);

            // Should have entries for days 1-7
            expect(Object.keys(result)).to.have.length(7);

            // Check specific rates
            expect(result[1]).to.equal(150.00); // 1 night stay
            expect(result[7]).to.equal(840.00); // 7 night stay

            // Check interpolated rates using 1-night rate
            expect(result[2]).to.equal(300.00); // 2 * $150
            expect(result[3]).to.equal(450.00); // 3 * $150
            expect(result[4]).to.equal(600.00); // 4 * $150
            expect(result[5]).to.equal(750.00); // 5 * $150
            expect(result[6]).to.equal(900.00); // 6 * $150
        });

        it('should handle empty record pairs', () => {
            const recordPairs = [];
            const result = calculator._parseRecordPairsIntoMap(recordPairs);
            expect(result).to.be.an('object');
            expect(Object.keys(result)).to.have.length(0);
        });

        it('should handle record pairs with missing rates', () => {
            // Example LOS record with missing 4-night rate
            const recordPairs = [
                '1', '150.00', // $150/night
                '4', null, // missing rate
                '7', '840.00' // $120/night
            ];
            const result = calculator._parseRecordPairsIntoMap(recordPairs);

            // Should have entries for days 1-7
            expect(Object.keys(result)).to.have.length(7);

            // Check specific rates
            expect(result[1]).to.equal(150.00); // 1 night stay
            expect(result[7]).to.equal(840.00); // 7 night stay

            // Days 4-6 should use 1-night rate for interpolation
            expect(result[4]).to.equal(600.00); // 4 * $150
            expect(result[5]).to.equal(750.00); // 5 * $150
            expect(result[6]).to.equal(900.00); // 6 * $150
        });

        it('should handle record pairs with non-numeric values', () => {
            // Example LOS record with invalid 4-night rate
            const recordPairs = [
                '1', '150.00', // $150/night
                '4', 'invalid', // invalid rate
                '7', '840.00' // $120/night
            ];
            const result = calculator._parseRecordPairsIntoMap(recordPairs);

            // Should have entries for days 1-7
            expect(Object.keys(result)).to.have.length(7);

            // Check specific rates
            expect(result[1]).to.equal(150.00); // 1 night stay
            expect(result[7]).to.equal(840.00); // 7 night stay

            // Days 4-6 should use 1-night rate for interpolation
            expect(result[4]).to.equal(600.00); // 4 * $150
            expect(result[5]).to.equal(750.00); // 5 * $150
            expect(result[6]).to.equal(900.00); // 6 * $150
        });

        it('should handle real-world LOS record data', () => {
            // Example LOS record with typical vacation rental rates
            const recordPairs = [
                '1', '150.00', // $150/night
                '3', '420.00', // $140/night
                '5', '650.00', // $130/night
                '7', '840.00', // $120/night
                '14', '1540.00', // $110/night
                '28', '2520.00' // $90/night
            ];
            const result = calculator._parseRecordPairsIntoMap(recordPairs);

            // Should only have entries for days 1-7
            expect(Object.keys(result)).to.have.length(7);

            // Check specific rates
            expect(result[1]).to.equal(150.00); // 1 night stay
            expect(result[3]).to.equal(420.00); // 3 night stay
            expect(result[5]).to.equal(650.00); // 5 night stay
            expect(result[7]).to.equal(840.00); // 7 night stay

            // Check interpolated rates using lower LOS rate
            expect(result[2]).to.equal(300.00); // 2 * $150
            expect(result[4]).to.equal(560.00); // 4 * $140
            expect(result[6]).to.equal(780.00); // 6 * $130
        });
    });

    describe('getBaseRates', () => {
        it('should handle empty losRecords', () => {
            const calculator = new LosKhipPricingCalculator({ losRecords: [] });
            const result = calculator.getBaseRates();
            expect(result).to.be.an('array');
            expect(result).to.have.length(0);
        });

        it('should process multiple losRecords correctly', () => {
            const calculator = new LosKhipPricingCalculator({
                losRecords: [
                    '2025-04-28,8,1,150.00,4,520.00,7,840.00', // First record (4/28-5/5)
                    '2025-05-06,8,1,160.00,4,530.00,7,850.00' // Second record starts after first record ends
                ]
            });
            const result = calculator.getBaseRates();

            // Basic array checks
            expect(result).to.be.an('array');
            expect(result).to.have.length(2); // Should have two rate entries since dates don't overlap

            // Check first rate entry
            const firstEntry = result[0];
            expect(firstEntry).to.have.all.keys('start', 'end', 'nightlyRate');
            expect(firstEntry.start).to.equal('2025-04-28');
            expect(firstEntry.end).to.equal('2025-05-05'); // startDate + 7 days
            // Rate calculation including interpolated rates:
            // LOS 1: 150.00
            // LOS 2: 300.00 (interpolated: 2 * 150)
            // LOS 3: 450.00 (interpolated: 3 * 150)
            // LOS 4: 520.00
            // LOS 5: 650.00 (interpolated: 5 * 130)
            // LOS 6: 780.00 (interpolated: 6 * 130)
            // LOS 7: 840.00
            // Total LOS = 28 (sum of 1-7)
            // Total Rate = 3690.00
            // Average Rate = 3690/28 ≈ 131.79
            expect(firstEntry.nightlyRate).to.equal(131.79);

            // Check second rate entry
            const secondEntry = result[1];
            expect(secondEntry).to.have.all.keys('start', 'end', 'nightlyRate');
            expect(secondEntry.start).to.equal('2025-05-06');
            expect(secondEntry.end).to.equal('2025-05-13'); // startDate + 7 days
            // Rate calculation including interpolated rates:
            // LOS 1: 160.00
            // LOS 2: 320.00 (interpolated: 2 * 160)
            // LOS 3: 480.00 (interpolated: 3 * 160)
            // LOS 4: 530.00
            // LOS 5: 662.50 (interpolated: 5 * 132.5)
            // LOS 6: 795.00 (interpolated: 6 * 132.5)
            // LOS 7: 850.00
            // Total LOS = 28 (sum of 1-7)
            // Total Rate = 3797.50
            // Average Rate = 3797.50/28 ≈ 135.63
            expect(secondEntry.nightlyRate).to.equal(135.63);

            // Verify chronological order and no gaps
            expect(moment(result[0].end).add(1, 'day').format('YYYY-MM-DD')).to.equal(result[1].start);
        });

        it('should handle no records with available days before 7', () => {
            // pre-conditions
            const MIN_NUMBER_DAY_AVAILABLE_IDX = 2;
            expect(
                samplePricing271670
                    .losRecords
                    .every(losRecord => Number(losRecord.split(',')[MIN_NUMBER_DAY_AVAILABLE_IDX]) > 7)
            ).to.equal(true);

            // exercise
            const calculator = new LosKhipPricingCalculator({
                losRecords: samplePricing271670.losRecords
            });
            const result = calculator.getBaseRates();

            // post-conditions
            expect(result).to.be.an('array');
            expect(result.length).to.equal(0);
        });

        it('should handle empty mappedRates when processing non-first record', () => {
            const calculator = new LosKhipPricingCalculator({
                losRecords: [
                    '2025-04-28,8,null,null,null,null,null,null', // First record has no valid rates
                    '2025-05-01,8,1,160.00,4,530.00,7,850.00' // Second record should process with empty mappedRates
                ]
            });
            const result = calculator.getBaseRates();

            // Basic array checks
            expect(result).to.be.an('array');
            expect(result).to.have.length(1); // Should only have rates from second record

            // Check the rate entry structure and values
            const rateEntry = result[0];
            expect(rateEntry).to.have.all.keys('start', 'end', 'nightlyRate');

            // Verify dates
            expect(rateEntry.start).to.equal('2025-05-01'); // Should start on second record's date
            expect(rateEntry.end).to.equal('2025-05-08'); // Should end after adding 7 days (LOS value)

            // Verify rate calculation
            // Total LOS = 1 + 4 + 7 = 12
            // Total Rate = 160.00 + 530.00 + 850.00 = 1540.00
            // Average Rate = 1540.00 / 12 ≈ 135.63
            expect(rateEntry.nightlyRate).to.equal(135.63);
        });
    });

    describe('bug1', () => {
        it('should respect limited LOS options for single-day records', () => {
            const calculator = new LosKhipPricingCalculator({
                losRecords: [
                    '2026-01-31,4,1,295.00'
                ]
            });
            const result = calculator.getBaseRates();

            expect(result).to.be.an('array');
            expect(result).to.have.length(1);
            expect(result[0].start).to.equal('2026-01-31');
            expect(result[0].end).to.equal('2026-02-01'); // Final day
            expect(result[0].nightlyRate).to.equal(295.00);
        });

        it('should handle decreasing LOS availability at end of month', () => {
            const calculator = new LosKhipPricingCalculator({
                losRecords: [
                    '2026-01-29,4,1,219.00,2,282.00,3,352.00',
                    '2026-01-30,4,1,258.00,2,328.00',
                    '2026-01-31,4,1,295.00'
                ]
            });
            const result = calculator.getBaseRates();

            expect(result).to.be.an('array');
            expect(result).to.have.length(1);
            
            expect(result[0].start).to.equal('2026-01-29');
            expect(result[0].end).to.equal('2026-02-01');
            expect(result[0].nightlyRate).to.equal(142.17);
        });
    });
});
